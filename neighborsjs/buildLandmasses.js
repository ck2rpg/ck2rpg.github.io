
  // ---- Landmasses: continents & islands (connected components of LAND graph) ----
function buildLandmasses(opts = {}) {
  const { islandCutoff = 30 } = opts;

  const provinces = window.provinces || [];
  const visited = new Uint8Array(provinces.length);
  const landmasses = [];
  let landmassId = 0;

  // clear existing landmass assignment
  for (let i = 0; i < provinces.length; i++) {
    const p = provinces[i];
    if (p) { p.landmassId = null; p.landmassType = null; }
  }

  for (let startId = 0; startId < provinces.length; startId++) {
    const start = provinces[startId];
    if (!start) continue;
    if (visited[startId]) continue;

    if (start.isLand === false) { visited[startId] = 1; continue; }

    const stack = [startId];
    visited[startId] = 1;

    const comp = [];
    let areaPx = 0;

    let sumA = 0, sumAx = 0, sumAy = 0;

    // NEW: bounds accumulators (aggregated from province bounds)
    let minX =  1e9, minY =  1e9;
    let maxX = -1e9, maxY = -1e9;

    while (stack.length) {
      const id = stack.pop();
      const p = provinces[id];
      if (!p) continue;
      if (p.isLand === false) continue;

      comp.push(id);

      const a = (p.areaPx | 0);
      areaPx += a;

      if (a > 0) {
        sumA += a;
        sumAx += p.centroidX * a;
        sumAy += p.centroidY * a;

        // NEW: aggregate bounds from province bounds
        if (p.minX < minX) minX = p.minX;
        if (p.minY < minY) minY = p.minY;
        if (p.maxX > maxX) maxX = p.maxX;
        if (p.maxY > maxY) maxY = p.maxY;
      }

      const neigh = p.neighbors || [];
      for (let i = 0; i < neigh.length; i++) {
        const nb = neigh[i] | 0;
        if (nb < 0 || nb >= provinces.length) continue;
        if (visited[nb]) continue;

        const q = provinces[nb];
        if (!q) { visited[nb] = 1; continue; }
        if (q.isLand === false) { visited[nb] = 1; continue; }

        visited[nb] = 1;
        stack.push(nb);
      }
    }

    if (!comp.length) continue;
    comp.sort((a, b) => a - b);

    const type = (comp.length <= islandCutoff) ? "island" : "continent";

    for (const pid of comp) {
      const p = provinces[pid];
      if (p) { p.landmassId = landmassId; p.landmassType = type; }
    }

    const cx = sumA > 0 ? (sumAx / sumA) : 0;
    const cy = sumA > 0 ? (sumAy / sumA) : 0;

    // If somehow sumA == 0, bounds will still be sentinels; normalize them
    if (areaPx <= 0) {
      minX =  1e9; minY =  1e9;
      maxX = -1e9; maxY = -1e9;
    }

    landmasses.push({
      landmassId,
      type,
      provinces: comp,
      provinceCount: comp.length,
      areaPx,

      centroidX: cx,
      centroidY: cy,
      centroidXNorm: 0,
      centroidYNorm: 0,

      // NEW: bounding box
      minX, minY, maxX, maxY,

      neighborLandmasses: [] // [{landmassId,borderPx}]
    });

    landmassId++;
  }

  window.landmasses = landmasses;
  return landmasses;
}

