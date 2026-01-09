
// ---- Island -> closest continent + closest continent province (no map needed) ----
// Requires:
//   window.landmasses[] entries have: {landmassId, type, provinces[], minX,minY,maxX,maxY, centroidX,centroidY}
//   window.provinces[pid] have: centroidX, centroidY, landmassId, landmassType
//
// Writes onto each island landmass:
//   closestContinentId
//   closestContinentDistancePx
//   closestContinentProvinceId   (province on continent)
//   closestIslandProvinceId      (province on island that achieved that min distance)
//
// Returns summary stats.
function computeIslandClosestContinent(opts = {}) {
  const {
    landmasses = window.landmasses || [],
    provinces = window.provinces || [],
    // speed/quality knob: how many "best" continents (by bbox/centroid lower bound) to fully scan
    candidatesPerIsland = 3,
    // if true, uses Euclidean distance; if false, returns squared distance for speed
    sqrtDistance = true
  } = opts;

  const dist2 = (ax, ay, bx, by) => {
    const dx = ax - bx, dy = ay - by;
    return dx*dx + dy*dy;
  };

  // distance^2 from point to AABB (0 if inside)
  const pointAabbDist2 = (x, y, minX, minY, maxX, maxY) => {
    let dx = 0, dy = 0;
    if (x < minX) dx = (minX - x);
    else if (x > maxX) dx = (x - maxX);
    if (y < minY) dy = (minY - y);
    else if (y > maxY) dy = (y - maxY);
    return dx*dx + dy*dy;
  };

  // collect continents + islands
  const continents = [];
  const islands = [];
  for (const lm of landmasses) {
    if (!lm) continue;
    if (lm.type === "continent") continents.push(lm);
    else if (lm.type === "island") islands.push(lm);
  }

  // clear/write defaults
  for (const isl of islands) {
    isl.closestContinentId = null;
    isl.closestContinentDistancePx = null;
    isl.closestContinentProvinceId = null;
    isl.closestIslandProvinceId = null;
  }

  if (!continents.length || !islands.length) {
    return {
      ok: false,
      islands: islands.length,
      continents: continents.length,
      reason: !continents.length ? "no continents" : "no islands"
    };
  }

  // helper to ensure province ids exist and have centroids
  const getProvXY = (pid) => {
    const p = provinces[pid];
    if (!p) return null;
    const x = p.centroidX, y = p.centroidY;
    if (typeof x !== "number" || typeof y !== "number") return null;
    return { x, y };
  };

  let islandsSolved = 0;

  for (const isl of islands) {
    const islProv = isl.provinces || [];
    if (!islProv.length) continue;

    // --- Step 1: choose candidate continents using cheap lower bounds ---
    // Use island centroid to rank continents by point-to-AABB distance (tight-ish).
    const ix = isl.centroidX, iy = isl.centroidY;

    const ranked = [];
    for (let ci = 0; ci < continents.length; ci++) {
      const c = continents[ci];
      const lb2 = pointAabbDist2(ix, iy, c.minX, c.minY, c.maxX, c.maxY);
      ranked.push({ c, lb2 });
    }
    ranked.sort((a,b)=>a.lb2-b.lb2);

    const K = Math.max(1, Math.min(candidatesPerIsland|0, ranked.length));
    const cand = ranked.slice(0, K).map(o=>o.c);

    // --- Step 2: exact scan between island provinces and candidate continent provinces ---
    // Find minimum province-to-province distance
    let bestD2 = 1e30;
    let bestCont = null;
    let bestContProv = null;
    let bestIslProv = null;

    // Pre-pull island province coords for speed
    const islXY = [];
    for (let i=0;i<islProv.length;i++){
      const pid = islProv[i]|0;
      const xy = getProvXY(pid);
      if (xy) islXY.push({ pid, x: xy.x, y: xy.y });
    }
    if (!islXY.length) continue;

    for (const cont of cand) {
      const contProv = cont.provinces || [];
      if (!contProv.length) continue;

      // optional extra pruning: if AABB lower bound already worse than current best, skip
      if (bestCont && pointAabbDist2(ix, iy, cont.minX, cont.minY, cont.maxX, cont.maxY) > bestD2) continue;

      // pull continent coords
      const contXY = [];
      for (let j=0;j<contProv.length;j++){
        const pid = contProv[j]|0;
        const xy = getProvXY(pid);
        if (xy) contXY.push({ pid, x: xy.x, y: xy.y });
      }
      if (!contXY.length) continue;

      // brute force (usually fine: islands small, K small)
      for (let a=0;a<islXY.length;a++){
        const A = islXY[a];
        // quick skip using continent bbox against this island province (cheap)
        const lb2 = pointAabbDist2(A.x, A.y, cont.minX, cont.minY, cont.maxX, cont.maxY);
        if (lb2 > bestD2) continue;

        for (let b=0;b<contXY.length;b++){
          const B = contXY[b];
          const d2 = dist2(A.x, A.y, B.x, B.y);
          if (d2 < bestD2) {
            bestD2 = d2;
            bestCont = cont;
            bestContProv = B.pid;
            bestIslProv = A.pid;
          }
        }
      }
    }

    if (bestCont) {
      isl.closestContinentId = bestCont.landmassId|0;
      isl.closestContinentProvinceId = bestContProv|0;
      isl.closestIslandProvinceId = bestIslProv|0;
      isl.closestContinentDistancePx = sqrtDistance ? Math.sqrt(bestD2) : bestD2;
      islandsSolved++;
    }
  }

  return {
    ok: true,
    islands: islands.length,
    continents: continents.length,
    islandsSolved
  };
}
