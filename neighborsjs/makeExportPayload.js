function makeExportPayload(meta = {}) {
    const outProv = [];
    for (let id=0; id<window.provinces.length; id++){
        const p = window.provinces[id];
        if (p) outProv.push(p);
    }
    outProv.sort((a,b)=>(a.id|0)-(b.id|0));

    const outRegions = (window.connectedTerrainRegions || []).map(r => ({
        regionId: r.regionId|0,
        terrain: r.terrain,
        isLand: !!r.isLand,
        areaPx: (r.areaPx|0),
        centroidX: r.centroidX,
        centroidY: r.centroidY,
        centroidXNorm: r.centroidXNorm,
        centroidYNorm: r.centroidYNorm,
        provinces: r.provinces.slice(),
        neighborRegions: r.neighborRegions.map(n => ({ regionId: n.regionId|0, borderPx: n.borderPx|0 })),
        minX: r.minX, minY: r.minY, maxX: r.maxX, maxY: r.maxY,
        elevMin: r.elevMin, elevMax: r.elevMax, elevMean: r.elevMean, elevStd: r.elevStd, relief: r.relief,
    elevMinW: r.elevMinW, elevMaxW: r.elevMaxW, elevMeanW: r.elevMeanW, elevStdW: r.elevStdW, reliefW: r.reliefW,
    landPct: r.landPct,
    waterPct: r.waterPct,
    }));

    const outLandmasses = (window.landmasses || []).map(lm => ({
        landmassId: lm.landmassId|0,
        type: lm.type,
        provinceCount: lm.provinceCount|0,
        areaPx: (lm.areaPx|0),
        centroidX: lm.centroidX,
        centroidY: lm.centroidY,
        centroidXNorm: lm.centroidXNorm,
        centroidYNorm: lm.centroidYNorm,
        provinces: lm.provinces.slice(),
        neighborLandmasses: lm.neighborLandmasses.map(n => ({ landmassId: n.landmassId|0, borderPx: n.borderPx|0 })),
        minX: lm.minX, minY: lm.minY, maxX: lm.maxX, maxY: lm.maxY,
        closestContinentId: lm.closestContinentId,
    closestContinentDistancePx: lm.closestContinentDistancePx,
    closestContinentProvinceId: lm.closestContinentProvinceId,
    closestIslandProvinceId: lm.closestIslandProvinceId,
    landPct: lm.landPct,
    }));

    const outWaterbodies = (window.waterbodies || []).map(wb => ({
        waterbodyId: wb.waterbodyId|0,
        dominantType: wb.dominantType,
        waterTypeCounts: wb.waterTypeCounts,
        provinceCount: wb.provinceCount|0,
        areaPx: (wb.areaPx|0),
        centroidX: wb.centroidX,
        centroidY: wb.centroidY,
        centroidXNorm: wb.centroidXNorm,
        centroidYNorm: wb.centroidYNorm,
        provinces: wb.provinces.slice(),
        waterPct: wb.waterPct,
    }));

    return {
        meta,
        world: window.world || null,
        provinces: outProv,
        regions: outRegions,
        landmasses: outLandmasses,
        waterbodies: outWaterbodies
    };
}
