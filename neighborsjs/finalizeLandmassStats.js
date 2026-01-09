
function finalizeLandmassStats(W, H) {
    const provinces = window.provinces || [];
    const landmasses = window.landmasses || [];
    if (!landmasses.length) return { landmassEdges: 0 };

    for (const lm of landmasses){
        lm.centroidXNorm = W ? (lm.centroidX / W) : 0;
        lm.centroidYNorm = H ? (lm.centroidY / H) : 0;
        lm.neighborLandmasses = [];
    }

    const lmBorder = new Map(); // "lo|hi" -> px

    for (let aId=0; aId<provinces.length; aId++){
        const pa = provinces[aId];
        if (!pa) continue;
        const la = pa.landmassId;
        if (la == null) continue;

        const nb = pa.neighborBorderPx || {};
        for (const k in nb){
        const bId = k|0;
        if (bId <= aId) continue;
        const pb = provinces[bId];
        if (!pb) continue;

        const lb = pb.landmassId;
        if (lb == null) continue;
        if (lb === la) continue;

        const px = nb[k] | 0;
        const lo = la < lb ? la : lb;
        const hi = la < lb ? lb : la;
        const key = lo + "|" + hi;
        lmBorder.set(key, (lmBorder.get(key) || 0) + px);
        }
    }

    let landmassEdges = 0;
    for (const [key, px] of lmBorder.entries()){
        const sep = key.indexOf("|");
        const a = (key.slice(0,sep))|0;
        const b = (key.slice(sep+1))|0;
        if (!landmasses[a] || !landmasses[b]) continue;

        landmasses[a].neighborLandmasses.push({ landmassId: b, borderPx: px|0 });
        landmasses[b].neighborLandmasses.push({ landmassId: a, borderPx: px|0 });
        landmassEdges++;
    }

    for (const lm of landmasses){
        lm.neighborLandmasses.sort((u,v)=> (v.borderPx-u.borderPx) || (u.landmassId-v.landmassId));
    }

    return { landmassEdges };
}
