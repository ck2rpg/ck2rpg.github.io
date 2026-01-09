
// ---- Region centroid + neighbor regions with border length ----
function finalizeRegionStats(W,H){
    const provinces = window.provinces || [];
    const regions = window.connectedTerrainRegions || [];
    if (!regions.length) return { regionEdges: 0 };

    const sumA = new Array(regions.length).fill(0);
    const sumAx = new Array(regions.length).fill(0);
    const sumAy = new Array(regions.length).fill(0);

    for (let pid=0; pid<provinces.length; pid++){
        const p = provinces[pid];
        if (!p) continue;
        const rid = p.connectedTerrainRegion;
        if (rid == null || rid<0 || rid>=regions.length) continue;

        const a = (p.areaPx|0);
        if (a<=0) continue;
        sumA[rid] += a;
        sumAx[rid] += p.centroidX * a;
        sumAy[rid] += p.centroidY * a;
    }

    for (let rid=0; rid<regions.length; rid++){
        const r = regions[rid];
        const a = sumA[rid];
        if (a>0){
        const cx = sumAx[rid]/a, cy = sumAy[rid]/a;
        r.centroidX = cx; r.centroidY = cy;
        r.centroidXNorm = W ? cx/W : 0;
        r.centroidYNorm = H ? cy/H : 0;
        } else {
        r.centroidX=0; r.centroidY=0; r.centroidXNorm=0; r.centroidYNorm=0;
        }
        r.neighborRegions = [];
    }

    const regBorder = new Map(); // "lo|hi" -> px

    for (let aId=0; aId<provinces.length; aId++){
        const pa = provinces[aId];
        if (!pa) continue;
        const ra = pa.connectedTerrainRegion;
        if (ra == null) continue;

        const nb = pa.neighborBorderPx || {};
        for (const k in nb){
        const bId = k|0;
        if (bId <= aId) continue; // avoid double counting province pairs
        const pb = provinces[bId];
        if (!pb) continue;
        const rb = pb.connectedTerrainRegion;
        if (rb == null || rb === ra) continue;

        const px = nb[k] | 0;
        const lo = ra < rb ? ra : rb;
        const hi = ra < rb ? rb : ra;
        const key = lo + "|" + hi;
        regBorder.set(key, (regBorder.get(key) || 0) + px);
        }
    }

    let regionEdges=0;
    for (const [key, px] of regBorder.entries()){
        const sep = key.indexOf("|");
        const a = (key.slice(0,sep))|0;
        const b = (key.slice(sep+1))|0;
        if (!regions[a] || !regions[b]) continue;
        regions[a].neighborRegions.push({ regionId: b, borderPx: px|0 });
        regions[b].neighborRegions.push({ regionId: a, borderPx: px|0 });
        regionEdges++;
    }

    for (const r of regions){
        r.neighborRegions.sort((u,v)=> (v.borderPx-u.borderPx) || (u.regionId-v.regionId));
    }

    return { regionEdges };
}

