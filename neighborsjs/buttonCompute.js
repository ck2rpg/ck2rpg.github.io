btnCompute.addEventListener("click", () => {
    try {
        if (!loadedImage || !window.provinces.length > 0) throw new Error("Load inputs first.");

        const kmPerPx = Math.max(0, parseFloat(kmPerPxEl.value) || 0);
        const terrainKey = (terrainKeyEl.value || "terrainResolved").trim();
        const includeWater = includeWaterEl.value === "1";
        const missingTerrainMode = missingTerrainEl.value; // skip | unknown
        const islandCutoff = Math.max(1, parseInt(islandCutoffEl.value, 10) || 1);

        const t0 = performance.now();
        setStatus("Reading ImageData (large maps may take a moment)...");
        const imgData = ctx.getImageData(0,0,cv.width,cv.height);

        setStatus(
            `Computing exact province stats...
            - km/px: ${kmPerPx > 0 ? kmPerPx : "(not set)"}
            - missing colors: ${missingMode.value}

            Then:
            - connected terrain regions
            - landmasses (continents/islands)
            - waterbodies (connected water components)
            - distance-to-coast (land BFS)`
        );
        const worldStats = computeWorldLandWaterPixels({ threshold: 19 }); // uses hcv/hctx if available
        const provStats = computeProvinceStatsExact(imgData, cv.width, cv.height, kmPerPx);
        const shapeStats = computeProvinceShapeGeometry({
            provinces: window.provinces,
            landOnly: false,
            computeMoments: true,
            imgData,                      // re-use existing ImageData you already read
            provinceByRgbInt: window.provinceByRgbInt,
            W: cv.width,
            H: cv.height
        });



        // Apply tectonics meta (PNG) that was already loaded in btnLoad into window.tectMeta
        if (tectReady && window.tectMeta && window.tectMeta.data) {
        setStatus("Applying tectMeta (PNG imageData)...");

        const r = computeProvinceTectonicStatsFromMeta({
        provinces: window.provinces,
        W: cv.width,
        H: cv.height,
        wrapX: true,

        // needed if your analyzer ever scans province pixels:
        provinceCtx: ctx,
        provinceByRgbInt: window.provinceByRgbInt,

        // IMPORTANT: pass the image-based meta you already built
        tectMeta: window.tectMeta,

        // If your implementation supports pixel scan, this is the most reliable:
        scanProvincePixels: true,   // <— recommended for PNG-based meta
        writeBack: true,
        writeKey: "tect"
        });
        computeProvinceTectonicFieldsFromProvinces();
        annotateProvinceSeismicAndVolcanicHazards({ writeKey: "hazard", storeDebug: false });
        if (!r || !r.ok) console.warn("tectMeta apply failed:", r && r.reason ? r.reason : r);
        }





            
        let riverStats = { ok: false, reason: "no river map" };
        if (riverReady) {
        riverStats = computeProvinceRiverStatsFromIndexedMap({
            provinces: window.provinces,
            provinceCtx: ctx,
            W: cv.width,
            H: cv.height,
            provinceByRgbInt: window.provinceByRgbInt,
            riverCanvas: rcv,
            riverCtx: rctx,
            palette: RIVER_INDEXED_PALETTE,
            sourceRGB: [0,255,0],
            joinRGB: [255,0,0],
            ignoreRGBs: [[255,0,128],[255,255,255]],
            countSourceJoinAsRiver: true,
            kmPerPx: Math.max(0, parseFloat(kmPerPxEl.value) || 0),
        });
        const riverTopology = buildRiverList_CenterlineTwoPass({
            provinces: window.provinces,

            // province map (same as stats pass)
            provinceCtx: ctx,
            W: cv.width,
            H: cv.height,
            provinceByRgbInt: window.provinceByRgbInt,

            // river map (same as stats pass)
            riverCanvas: rcv,
            riverCtx: rctx,

            // same palette + semantics
            palette: RIVER_INDEXED_PALETTE,
            sourceRGB: [0,255,0],
            joinRGB:   [255,0,0],
            ignoreRGBs: [[255,0,128],[255,255,255]],

            // behavior toggles
            allowDiagonal: true,            // usually correct for hand-drawn centerlines
            storePixelPath: false,          // set true only if you want full polylines
            writeProvinceRiverMembership: true
        });

        annotateProvincesWithRiverTopology({
            provinces: window.provinces,
            provinceCtx: ctx,
            W: cv.width,
            H: cv.height,
            provinceByRgbInt: window.provinceByRgbInt,
            riverList: window.riverList,
            overwrite: true,
            storeIdLists: true
        });



        console.log("River topology:", riverTopology);
        console.log("riverList:", window.riverList);

        }
        const elevStats = computeElevationStatsFromHeightmap();
        const rugged = computeProvinceRuggednessFromHeightmap({
            provinces: window.provinces,
            provinceByRgbInt: window.provinceByRgbInt,

            // IMPORTANT: these are closure variables in your main script, so you MUST pass them in
            provCtx: ctx,
            heightCanvas: hcv,
            heightCtx: hctx,

            W: cv.width,
            H: cv.height,

            seaLevel: 19,
            landTopMeters: 8550,
            kmPerPx: Math.max(0, parseFloat(kmPerPxEl.value) || 0),

            slopeMethod: "sobel",
            steepDeg: 15
        });

            const regions = buildConnectedTerrainRegions({ terrainKey, includeWater, missingTerrainMode });
            const regStats = finalizeRegionStats(cv.width, cv.height);
            const regElev = computeRegionElevationStatsFromProvinces({ storeWeightedAlso: true });

            const landmasses = buildLandmasses({ islandCutoff });
            const lmStats = finalizeLandmassStats(cv.width, cv.height);
            const islandLinks = computeIslandClosestContinent({ candidatesPerIsland: 4, sqrtDistance: true });

            const waterbodies = buildWaterbodies();
            const oceanPartition = partitionWorldOceanIntoEarthLikeOceans({
                provinces,
                W: cv.width, 
                H: cv.height,
                wrapX: true,
                provinceCtx: ctx,          // <-- MUST be province color map ctx
                provinceByRgbInt,              // <-- your RGB->provinceId map
                oceanCount: 5,
                storeDebug: true,
                patchWrapNeighbors: true
            });
            drawOceanMaps({
                cv,
                ctx,
                provinces: window.provinces,
                provinceByRgbInt: window.provinceByRgbInt,
                filename: "debug_ocean_ids.png",
                borderEmphasis: 0.25
            });
            const maritime = computeCoastAndMaritimeProperties({
            provinces: window.provinces,
            // optional tuning:
            minCoastBorderPxForStrait: 12,
            minDistinctWaterUnitsForStrait: 2,
            minSecondShare: 0.18,
            useWaterbodyAreaIfPresent: true
        });

            const coastStats = computeDistanceToCoast();
            const coverage = computeCoveragePercents({ denomMode: "world" });

            annotateRiversWithReceivingWaterbodyId({
                provinces: window.provinces,
                provinceCtx: ctx,
                W: cv.width,
                H: cv.height,
                provinceByRgbInt: window.provinceByRgbInt,
                riverList: window.riverList,
                stemsOnly: true,
                searchRadiusPx: 16
            });

            annotateRiverGeneralDirectionFromProvinces({
                provinces: window.provinces,
                riverList: window.riverList,
                provXKey: "x",
                provYKey: "y",
                distinctEndpoints: true,
                verbose: true
            });

            annotateDivergentDistanceAndBasinTypes({
                provinces: window.provinces,
                W: cv.width,
                H: cv.height,
                wrapX: true,
                kmPerPx: window.meta?.kmPerPx ?? null
            });

            annotateLithologyFromTectonicsAndGeom(window.provinces, {
                writeKey: "lith",
                basinKey: null,      // set to "derived" if you stored basin fields under p.derived
                storeMeta: true
            });


            assignMaterials();
            computeNewTerrains()

            const ms = performance.now() - t0;

            // summaries
            let provCount=0, assignedRegion=0;
            let totalArea=0, landProv=0, waterProv=0;
            for (let id=0; id<window.provinces.length; id++){
            const p = window.provinces[id];
            if (!p) continue;
            provCount++;
            totalArea += (p.areaPx|0);
            if (p.isLand === false) waterProv++; else landProv++;
            if (p.connectedTerrainRegion != null) assignedRegion++;
            }

            let continents=0, islands=0;
            for (const lm of landmasses){
            if (lm.type === "continent") continents++;
            else islands++;
            }

            // store payload for export
            const meta = {
                imageW: cv.width,
                imageH: cv.height,
                totalPx: provStats.totalPx,
                kmPerPx,
                terrainKey,
                includeWater,
                missingTerrainMode,
                missingColorMode: missingMode.value,
                islandCutoff,
                heightmap: heightReady ? { w: hcv.width, h: hcv.height, units: "0-255" } : null,
                seaLevel: 19
            };
            window.lastExportPayload = makeExportPayload(meta);

            setStatus(
        `Done in ${ms.toFixed(1)} ms.

        Province (exact):
        - Provinces with area: ${fmt(provStats.provincesWithArea)}
        - Provinces with neighbors: ${fmt(provStats.provincesWithNeighbors)}
        - Border pairs recorded: ${fmt(provStats.borderPairs)}
        - Stub provinces created: ${fmt(provStats.stubCount)}
        - Sum of province areas: ${fmt(totalArea)} (should match total pixels if no skipped colors)
        - Largest province: id ${fmt(provStats.maxAreaId)} areaPx ${fmt(provStats.maxAreaPx)}

        Regions (terrain components):
        - Regions: ${fmt(regions.length)}
        - Provinces assigned to a region: ${fmt(assignedRegion)} / ${fmt(provCount)}
        - Region neighbor edges (borderPx): ${fmt(regStats.regionEdges)}

        Landmasses (land-only):
        - Land provinces: ${fmt(landProv)}  Water provinces: ${fmt(waterProv)}
        - Landmasses: ${fmt(landmasses.length)}  Continents: ${fmt(continents)}  Islands: ${fmt(islands)}
        - Landmass neighbor edges (borderPx): ${fmt(lmStats.landmassEdges)}

        Waterbodies (water-only):
        - Waterbodies: ${fmt(waterbodies.length)}

        Distance to coast (land-only hops):
        - Coastal land provinces: ${fmt(coastStats.coastalCount)} / ${fmt(coastStats.landCount)}
        - Unreachable land provinces: ${fmt(coastStats.unreachable)}
        - Max distance: ${fmt(coastStats.maxDistance)} (province id ${fmt(coastStats.maxDistanceId)})

        Elevation (heightmap):
        - Enabled: ${elevStats.enabled ? "yes" : "no"}
        ${elevStats.enabled ? `- Provinces with elevation stats: ${fmt(elevStats.provincesWithElev)}
        - Max relief: ${elevStats.maxRelief.toFixed(2)} (province id ${fmt(elevStats.maxReliefId)})` : ""}

        Maritime/coastal properties:
        - Coastal land provinces: ${fmt(maritime.coastalCount)} / ${fmt(maritime.landCount)}
        - Strait candidates: ${fmt(maritime.straitCandidates)}

        Shape/geometry:
        - Degenerate: ${fmt(shapeStats.degenerate)}
        - Max perimeter: ${fmt(shapeStats.maxPerimeterPx)} (province ${fmt(shapeStats.maxPerimeterId)})

        Rivers (indexed):
        - Enabled: ${riverReady ? "yes" : "no"}
        ${riverReady ? `- Provinces with rivers: ${fmt(riverStats.provincesWithRivers)}
        - Total river px: ${fmt(riverStats.totalRiverPx)}
        - Source px: ${fmt(riverStats.totalSourcePx)}   Join px: ${fmt(riverStats.totalJoinPx)}
        - Max river px in a province: ${fmt(riverStats.maxRiverPx)} (province ${fmt(riverStats.maxRiverProvinceId)})` : ""}


        Export writes:
        { meta, provinces:[...], regions:[...], landmasses:[...], waterbodies:[...] }`
            );

            btnExport.disabled = false;
    } catch (err) {
        console.error(err);
        setStatus("ERROR: " + (err && err.message ? err.message : String(err)));
        btnExport.disabled = true;
    }
});
