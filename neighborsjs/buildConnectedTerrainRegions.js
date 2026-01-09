
  // ---- Connected terrain regions (by province adjacency, constrained by terrainKey) ----
function buildConnectedTerrainRegions(opts = {}) {
  const {
    terrainKey = "terrainResolved",
    includeWater = false,
    missingTerrainMode = "skip" // skip | unknown
  } = opts;

  const provinces = window.provinces || [];
  const visited = new Uint8Array(provinces.length);
  const regions = [];
  let regionId = 0;

  const getTerrain = (p) => {
    const t = p ? p[terrainKey] : null;
    if (typeof t === "string" && t.length) return t;
    return (missingTerrainMode === "unknown") ? "unknown" : null;
  };

  // clear region assignment
  for (let i = 0; i < provinces.length; i++) {
    const p = provinces[i];
    if (p) p.connectedTerrainRegion = null;
  }

  for (let startId = 0; startId < provinces.length; startId++) {
    const start = provinces[startId];
    if (!start) continue;
    if (visited[startId]) continue;

    if (!includeWater && start.isLand === false) { visited[startId] = 1; continue; }

    const terrain = getTerrain(start);
    if (terrain == null) { visited[startId] = 1; continue; }

    const stack = [startId];
    visited[startId] = 1;

    const comp = [];
    let areaPx = 0;

    // NEW: bounds accumulators (aggregated from province bounds)
    let minX =  1e9, minY =  1e9;
    let maxX = -1e9, maxY = -1e9;

    while (stack.length) {
      const id = stack.pop();
      const p = provinces[id];
      if (!p) continue;

      if (!includeWater && p.isLand === false) continue;
      if (getTerrain(p) !== terrain) continue;

      comp.push(id);

      const a = (p.areaPx | 0);
      areaPx += a;

      // NEW: aggregate bounds from province bounds (only if province has area)
      if (a > 0) {
        // if your provinces always have minX..maxY, this is safe
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
        if (!includeWater && q.isLand === false) { visited[nb] = 1; continue; }
        if (getTerrain(q) !== terrain) continue;

        visited[nb] = 1;
        stack.push(nb);
      }
    }

    if (comp.length) {
      comp.sort((a, b) => a - b);

      for (const pid of comp) {
        const p = provinces[pid];
        if (p) p.connectedTerrainRegion = regionId;
      }

      // If this region ended up with 0 area (rare), keep sentinels
      if (areaPx <= 0) {
        minX =  1e9; minY =  1e9;
        maxX = -1e9; maxY = -1e9;
      }

      regions.push({
        regionId,
        terrain,
        isLand: start.isLand !== false,
        provinces: comp,
        areaPx,

        centroidX: 0, centroidY: 0, centroidXNorm: 0, centroidYNorm: 0,

        // NEW: bounding box
        minX, minY, maxX, maxY,

        neighborRegions: []
      });

      regionId++;
    }
  }

  window.connectedTerrainRegions = regions;
  return regions;
}
