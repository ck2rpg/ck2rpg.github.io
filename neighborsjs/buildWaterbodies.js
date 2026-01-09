// ---- Waterbodies: connected components of WATER graph ----
function buildWaterbodies() {
    const provinces = window.provinces || [];
    const visited = new Uint8Array(provinces.length);
    const waterbodies = [];
    let waterbodyId = 0;

    for (let i=0;i<provinces.length;i++){
        const p = provinces[i];
        if (p) p.waterbodyId = null;
    }

    for (let startId=0; startId<provinces.length; startId++){
        const start = provinces[startId];
        if (!start) continue;
        if (visited[startId]) continue;

        if (start.isLand !== false) { visited[startId]=1; continue; } // only water

        const stack=[startId];
        visited[startId]=1;

        const comp=[];
        let areaPx=0;

        let sumA=0, sumAx=0, sumAy=0;

        const waterTypeCounts = Object.create(null);

        while(stack.length){
        const id = stack.pop();
        const p = provinces[id];
        if (!p) continue;
        if (p.isLand !== false) continue;

        comp.push(id);

        const a = (p.areaPx|0);
        areaPx += a;
        if (a>0){
            sumA += a;
            sumAx += p.centroidX * a;
            sumAy += p.centroidY * a;
        }

        if (typeof p.waterType === "string" && p.waterType.length){
            waterTypeCounts[p.waterType] = (waterTypeCounts[p.waterType] || 0) + a;
        } else {
            waterTypeCounts["unknown"] = (waterTypeCounts["unknown"] || 0) + a;
        }

        const neigh = p.neighbors || [];
        for (let i=0;i<neigh.length;i++){
            const nb = neigh[i]|0;
            if (nb<0 || nb>=provinces.length) continue;
            if (visited[nb]) continue;

            const q = provinces[nb];
            if (!q) { visited[nb]=1; continue; }
            if (q.isLand !== false) { visited[nb]=1; continue; } // do not traverse into land

            visited[nb]=1;
            stack.push(nb);
        }
        }

        if (!comp.length) continue;
        comp.sort((a,b)=>a-b);

        for (const pid of comp){
        const p = provinces[pid];
        if (p) p.waterbodyId = waterbodyId;
        }

        const cx = sumA>0 ? (sumAx/sumA) : 0;
        const cy = sumA>0 ? (sumAy/sumA) : 0;

        // dominant waterType by (area-weighted) count
        let dominantType = "unknown", dominantW = -1;
        for (const k in waterTypeCounts){
        const w = waterTypeCounts[k] || 0;
        if (w > dominantW) { dominantW = w; dominantType = k; }
        }

        waterbodies.push({
        waterbodyId,
        dominantType,
        waterTypeCounts, // area-weighted by province areaPx
        provinces: comp,
        provinceCount: comp.length,
        areaPx,
        centroidX: cx,
        centroidY: cy,
        centroidXNorm: 0,
        centroidYNorm: 0
        });

        waterbodyId++;
    }

    // norms
    for (const wb of waterbodies){
        wb.centroidXNorm = cv.width ? (wb.centroidX / cv.width) : 0;
        wb.centroidYNorm = cv.height ? (wb.centroidY / cv.height) : 0;
    }

    window.waterbodies = waterbodies;
    return waterbodies;
}
