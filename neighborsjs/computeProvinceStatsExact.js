// ---- Province stats: exact area + exact border lengths + exact centroid sums ----
function computeProvinceStatsExact(imgData, W, H, kmPerPx) {
    const data = imgData.data;
    const mode = missingMode.value; // skip | create

    const colorCache = new Map(); // rgbInt -> id
    const missingColorToId = new Map();
    let nextStubId = window.provinces.length;

    function ensureProvinceStub(id, rgbInt){
        if (window.provinces[id]) return;
        window.provinces[id] = {
        id,
        isLand: null,
        rgbInt,

        neighbors: [],
        neighborBorderPx: {},

        areaPx: 0,
        areaFrac: 0,

        centroidX: 0, centroidY: 0,
        centroidXNorm: 0, centroidYNorm: 0,
        minX:  1e9, minY:  1e9,
        maxX: -1e9, maxY: -1e9,

        connectedTerrainRegion: null,

        landmassId: null,
        landmassType: null,

        isCoastal: 0,
        distanceToCoast: null,

        waterbodyId: null
        };
    }

    function idFromColor(rgbInt) {
        const cached = colorCache.get(rgbInt);
        if (cached != null) return cached;

        const got = window.provinceByRgbInt.get(rgbInt);
        if (got != null) { colorCache.set(rgbInt, got); return got; }

        if (mode === "create") {
        let sid = missingColorToId.get(rgbInt);
        if (sid == null) {
            sid = nextStubId++;
            missingColorToId.set(rgbInt, sid);
            ensureProvinceStub(sid, rgbInt);
        }
        colorCache.set(rgbInt, sid);
        return sid;
        }

        colorCache.set(rgbInt, -1);
        return -1;
    }

    const area = new Map();
    const sumX = new Map();
    const sumY = new Map();
    const minX = new Map(), minY = new Map();
    const maxX = new Map(), maxY = new Map();

    // border accumulator (province-pair) lo|hi -> px
    const border = new Map();
    const bump = (m,k,v)=>m.set(k,(m.get(k)||0)+v);

    function bumpBorder(a,b,inc){
        if (a===b) return;
        if (a<0 || b<0) return;
        const lo = a<b ? a : b;
        const hi = a<b ? b : a;
        const key = lo + "|" + hi;
        border.set(key, (border.get(key) || 0) + inc);
    }

    // full scan
    for (let y=0; y<H; y++){
        const rowBase = y*W;
        for (let x=0; x<W; x++){
        const i = ((rowBase + x) << 2);
        const id = idFromColor(rgbToInt(data[i], data[i+1], data[i+2]));
        if (id >= 0) {
            bump(area, id, 1);
            bump(sumX, id, x);
            bump(sumY, id, y);
        }

        // right edge
        if (x+1 < W) {
            const ir = i + 4;
            const idR = idFromColor(rgbToInt(data[ir], data[ir+1], data[ir+2]));
            if (id >= 0 && idR >= 0 && idR !== id) bumpBorder(id, idR, 1);
        }
        // down edge
        if (y+1 < H) {
            const idn = (((rowBase + W) + x) << 2);
            const idD = idFromColor(rgbToInt(data[idn], data[idn+1], data[idn+2]));
            if (id >= 0 && idD >= 0 && idD !== id) bumpBorder(id, idD, 1);
        }
                    // bounds
        if (!minX.has(id)) { // first hit
        minX.set(id, x); maxX.set(id, x);
        minY.set(id, y); maxY.set(id, y);
        } else {
        if (x < minX.get(id)) minX.set(id, x);
        if (x > maxX.get(id)) maxX.set(id, x);
        if (y < minY.get(id)) minY.set(id, y);
        if (y > maxY.get(id)) maxY.set(id, y);
        }
        }
    }

    if (window.provinces.length < nextStubId) window.provinces.length = nextStubId;

    // reset per-province computed fields, then fill
    const totalPx = W*H;

    for (let pid=0; pid<window.provinces.length; pid++){
        const p = window.provinces[pid];
        if (!p) continue;
        

        p.neighborBorderPx = {};
        p.neighbors = [];

        const a = area.get(pid) || 0;
        if (a > 0) {
        p.minX = minX.get(pid);
        p.minY = minY.get(pid);
        p.maxX = maxX.get(pid);
        p.maxY = maxY.get(pid);
        } else {
        p.minX =  1e9; p.minY =  1e9;
        p.maxX = -1e9; p.maxY = -1e9;
        }
        p.areaPx = a;
        p.areaFrac = totalPx ? (a / totalPx) : 0;

        if (a > 0) {
        const cx = (sumX.get(pid) || 0) / a;
        const cy = (sumY.get(pid) || 0) / a;
        p.centroidX = cx;
        p.centroidY = cy;
        p.centroidXNorm = W ? (cx / W) : 0;
        p.centroidYNorm = H ? (cy / H) : 0;
        } else {
        p.centroidX = 0; p.centroidY = 0;
        p.centroidXNorm = 0; p.centroidYNorm = 0;
        }

        if (kmPerPx > 0) {
        const mPerPx = kmPerPx * 1000;
        p.areaM2 = a * (mPerPx*mPerPx);
        p.areaKm2 = a * (kmPerPx*kmPerPx);
        } else {
        delete p.areaM2;
        delete p.areaKm2;
        }

        // clear “group” fields; recomputed later
        p.connectedTerrainRegion = null;
        p.landmassId = null;
        p.landmassType = null;
        p.distanceToCoast = null;
        p.waterbodyId = null;
        // keep p.isCoastal as-is for now; we’ll recompute a reliable coastal flag below.
    }

    // apply borders symmetrically
    let borderPairs = 0;
    for (const [key, px] of border.entries()){
        const sep = key.indexOf("|");
        const a = (key.slice(0, sep))|0;
        const b = (key.slice(sep+1))|0;
        const pa = window.provinces[a], pb = window.provinces[b];
        if (!pa || !pb) continue;

        pa.neighborBorderPx[b] = (pa.neighborBorderPx[b] || 0) + px;
        pb.neighborBorderPx[a] = (pb.neighborBorderPx[a] || 0) + px;
        borderPairs++;
    }

    // neighbors list from border keys
    let provincesWithNeighbors = 0;
    for (let pid=0; pid<window.provinces.length; pid++){
        const p = window.provinces[pid];
        if (!p) continue;
        const keys = Object.keys(p.neighborBorderPx).map(k=>k|0).sort((a,b)=>a-b);
        p.neighbors = keys;
        if (keys.length) provincesWithNeighbors++;
    }

    // max area
    let maxAreaPx=0, maxAreaId=-1;
    for (const [pid, a] of area.entries()){
        if (a > maxAreaPx) { maxAreaPx = a; maxAreaId = pid; }
    }

    return {
        totalPx,
        stubCount: missingColorToId.size,
        provincesWithArea: area.size,
        provincesWithNeighbors,
        borderPairs,
        maxAreaPx,
        maxAreaId
    };
}
