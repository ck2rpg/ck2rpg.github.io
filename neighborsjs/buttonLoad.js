btnLoad.addEventListener("click", async () => {
    try {
        if (!imgFile.files[0]) throw new Error("Please choose a province map image.");
        if (!jsonFile.files[0]) throw new Error("Please choose a provinces JSON file.");

        setStatus("Loading image...");
        loadedImage = await loadImageFile(imgFile.files[0]);
        cv.width = loadedImage.naturalWidth || loadedImage.width;
        cv.height = loadedImage.naturalHeight || loadedImage.height;
        ctx.clearRect(0,0,cv.width,cv.height);
        ctx.drawImage(loadedImage, 0, 0);
        dimLbl.textContent = `${cv.width}×${cv.height}`;
        // Optional heightmap: load + draw into offscreen canvas, scaled to match province map
        heightReady = false;
        loadedHeightImage = null;
        // Optional river map: load + draw into offscreen canvas, scaled to match province map
        riverReady = false;
        loadedRiverImage = null;

        if (riverFile.files && riverFile.files[0]) {
            setStatus("Loading river map...");
            loadedRiverImage = await loadImageFile(riverFile.files[0]);

            rcv.width = cv.width;
            rcv.height = cv.height;
            rctx.clearRect(0, 0, rcv.width, rcv.height);

            // draw scaled to match province map dimensions (so pixels line up)
            rctx.drawImage(loadedRiverImage, 0, 0, rcv.width, rcv.height);

            riverReady = true;
        }

        // Optional tectonics meta: load + draw into offscreen canvas, scaled to match province map
        tectReady = false;
        loadedTectMetaImage = null;
        tectMetaImageData = null;
        window.tectMeta = null;

        if (tectMetaFile && tectMetaFile.files && tectMetaFile.files[0]) {
            setStatus("Loading tectonics meta...");
            loadedTectMetaImage = await loadImageFile(tectMetaFile.files[0]);

            tcv.width = cv.width;
            tcv.height = cv.height;
            tctx.clearRect(0, 0, tcv.width, tcv.height);

            // draw scaled to match province map dimensions (so pixels line up)
            tctx.drawImage(loadedTectMetaImage, 0, 0, tcv.width, tcv.height);

            tectMetaImageData = tctx.getImageData(0, 0, tcv.width, tcv.height);

            // Store in a predictable place for downstream analyzers
            window.tectMeta = {
            W: tcv.width,
            H: tcv.height,
            data: tectMetaImageData.data,   // Uint8ClampedArray RGBA
            imageData: tectMetaImageData
            };

            tectReady = true;
        }


        if (heightFile.files && heightFile.files[0]) {
            setStatus("Loading heightmap...");
            loadedHeightImage = await loadImageFile(heightFile.files[0]);

            hcv.width = cv.width;
            hcv.height = cv.height;
            hctx.clearRect(0, 0, hcv.width, hcv.height);

            // draw scaled to match province map dimensions (so pixels line up)
            hctx.drawImage(loadedHeightImage, 0, 0, hcv.width, hcv.height);

            heightReady = true;
        }

        setStatus("Reading JSON...");
        const txt = await readFileAsText(jsonFile.files[0]);
        loadedProvincesList = parseProvincesText(txt);
        let stats;
        setStatus("Building global province tables...");
        if (!jsonFile.files) {
            stats = buildProvinceGlobals(loadedProvincesList);
        } else {
            stats = buildProvinceGlobalsFromImages()
        }
        

        setStatus(
            `Loaded.
            - Image: ${cv.width}×${cv.height} (${fmt(cv.width*cv.height)} px)
            - Heightmap: ${heightReady ? `${hcv.width}×${hcv.height}` : "(none)"}
            - River map: ${riverReady ? `${rcv.width}×${rcv.height}` : "(none)"}
            - Tect meta: ${tectReady ? `${tcv.width}×${tcv.height}` : "(none)"}
            - JSON objects parsed: ${fmt(loadedProvincesList.length)}
            - Color-mapped provinces: ${fmt(stats.count)}
            - Missing/invalid color entries: ${fmt(stats.missingColor)}

            Globals:
            - window.provinces[id]
            - window.connectedTerrainRegions
            - window.landmasses
            - window.waterbodies`
        );

        btnCompute.disabled = false;
        btnExport.disabled = true;
    } catch (err) {
        console.error(err);
        setStatus("ERROR: " + (err && err.message ? err.message : String(err)));
        btnCompute.disabled = true;
        btnExport.disabled = true;
    }
});