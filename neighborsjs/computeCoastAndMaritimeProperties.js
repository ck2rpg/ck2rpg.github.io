

// ---- Coast + maritime properties (land provinces) ----
// Standalone: uses ONLY the already-built province neighbor graph:
//   provinces[pid].neighbors : number[]
//   provinces[pid].neighborBorderPx : { [neighborId]: borderPx }
//   provinces[pid].isLand : boolean (water if false)
// Optional (nice-to-have):
//   provinces[pid].waterbodyId (for water provinces) OR provinces[pid].waterType
//   provinces[pid].centroidX/Y (for direction vectors)
//
// Writes onto each LAND province p:
//   p.isCoastal                  (0/1)
//   p.coastBorderPx              (# border px adjacent to water provinces)
//   p.totalBorderPx              (# border px adjacent to any neighbor provinces)
//   p.coastRatio                 (coastBorderPx/totalBorderPx)
//   p.coastalWaterProvinceIds    ([water province ids], unique, sorted)
//   p.coastalWaterbodyIds        ([waterbody ids], unique, sorted; if available)
//   p.coastalWaterTypeCountsPx   ({type: px}, if waterType present)
//   p.coastalWaterbodyBorderPx   ({waterbodyId: px}, if waterbodyId present)
//   p.isStraitCandidate          (0/1)  // touches 2+ distinct waterbodies/types meaningfully
//   p.straitScore                (0..1-ish)  // heuristic
//   p.maritimeExposureScore      (0..1-ish)  // heuristic: coastRatio * log1p(adjacentWaterArea)
//   p.nearestWaterbodyId         (best adjacent waterbody by border px) or null
//   p.nearestWaterProvinceId     (best adjacent water province by border px) or null
//   p.coastVectorX/Y             (avg vector toward adjacent water provinces, border-weighted; if centroids exist)
//   p.coastDirectionDeg          (0..360, 0=+X east, 90=+Y south in canvas coords) or null
//
// Also returns a summary.
//
// Notes:
// - "outside ocean" (map edge water) is NOT counted here because we don't have pixel-edge borders.
//   If you want that, you need a pixel pass to count province pixels that touch the image edge.
// - "waterbodyId" only works if you already computed waterbodies. If not, it will fall back to waterType.
function computeCoastAndMaritimeProperties(opts = {}) {
  const {
    provinces = (window.provinces || []),

    // Strait heuristics:
    minCoastBorderPxForStrait = 12,      // require at least this much coast to consider strait
    minDistinctWaterUnitsForStrait = 2,  // need >=2 distinct waterbodies OR waterTypes
    minSecondShare = 0.18,               // second-largest share of coast border must be >= this to be "two-sided"

    // Exposure heuristics:
    // If you have waterbodies with areaPx, we'll use it.
    // If not, exposure is mostly coastRatio-based.
    useWaterbodyAreaIfPresent = true,

    // Store fields even if not coastal:
    storeNonCoastalFields = true
  } = opts;

  const has = (v) => v !== undefined && v !== null;

  // --- Build optional lookup: waterbody areaPx (if waterbodies array exists and has areaPx) ---
  let waterbodyAreaPx = null;
  if (useWaterbodyAreaIfPresent && Array.isArray(window.waterbodies) && window.waterbodies.length) {
    waterbodyAreaPx = new Map();
    for (const wb of window.waterbodies) {
      if (!wb) continue;
      const id = wb.waterbodyId;
      const a = wb.areaPx;
      if (typeof id === "number" && typeof a === "number") waterbodyAreaPx.set(id | 0, a);
    }
    if (!waterbodyAreaPx.size) waterbodyAreaPx = null;
  }

  // Helper: normalize / push unique ids into an array via Set
  const pushUniq = (set, v) => { if (v !== undefined && v !== null) set.add(v | 0); };

  // Summary stats
  let landCount = 0;
  let coastalCount = 0;
  let totalCoastBorderPx = 0;
  let maxCoastBorderPx = -1;
  let maxCoastProvinceId = -1;
  let straitCandidates = 0;

  for (let pid = 0; pid < provinces.length; pid++) {
    const p = provinces[pid];
    if (!p) continue;

    // only land (treat undefined/null as land-ish to match your other code)
    if (p.isLand === false) continue;
    landCount++;

    const nb = p.neighborBorderPx || {};
    const neigh = p.neighbors || Object.keys(nb).map(k => k|0);

    let totalBorderPx = 0;
    let coastBorderPx = 0;

    let bestWaterProv = null;
    let bestWaterProvPx = -1;

    // Optional aggregations
    const waterProvSet = new Set();
    const waterbodySet = new Set();
    const waterTypeCountsPx = Object.create(null);
    const waterbodyBorderPx = Object.create(null);

    // Coast vector (toward adjacent water), border-weighted
    let vx = 0, vy = 0;
    let vW = 0;
    const haveCentroids = typeof p.centroidX === "number" && typeof p.centroidY === "number";

    // For "exposure": sum adjacent waterbody area (unique) or approximate
    let adjacentWaterAreaPx = 0;

    for (let i = 0; i < neigh.length; i++) {
      const nid = neigh[i] | 0;
      const borderPx = (nb[nid] | 0) || 0;
      if (!(borderPx > 0)) continue;

      totalBorderPx += borderPx;

      const q = provinces[nid];
      if (!q) continue;

      if (q.isLand === false) {
        coastBorderPx += borderPx;
        pushUniq(waterProvSet, nid);

        // Track strongest adjacent water province (for "nearest water")
        if (borderPx > bestWaterProvPx) {
          bestWaterProvPx = borderPx;
          bestWaterProv = nid;
        }

        // Waterbody aggregation
        if (has(q.waterbodyId)) {
          const wb = q.waterbodyId | 0;
          pushUniq(waterbodySet, wb);
          waterbodyBorderPx[wb] = (waterbodyBorderPx[wb] || 0) + borderPx;

          // Exposure add: unique waterbody area (we'll add later with set)
        } else if (typeof q.waterType === "string" && q.waterType.length) {
          const t = q.waterType;
          waterTypeCountsPx[t] = (waterTypeCountsPx[t] || 0) + borderPx;
          pushUniq(waterbodySet, t); // NOT numeric; but for strait fallback we’ll count types separately below
        } else {
          waterTypeCountsPx["unknown"] = (waterTypeCountsPx["unknown"] || 0) + borderPx;
          pushUniq(waterbodySet, "unknown");
        }

        // Coast vector: point toward water province centroid
        if (haveCentroids && typeof q.centroidX === "number" && typeof q.centroidY === "number") {
          const dx = q.centroidX - p.centroidX;
          const dy = q.centroidY - p.centroidY;
          vx += dx * borderPx;
          vy += dy * borderPx;
          vW += borderPx;
        }
      }
    }

    const isCoastal = coastBorderPx > 0 ? 1 : 0;

    // Default fields (so consumers can rely on them)
    if (storeNonCoastalFields || isCoastal) {
      p.totalBorderPx = totalBorderPx;
      p.coastBorderPx = coastBorderPx;
      p.coastRatio = totalBorderPx > 0 ? (coastBorderPx / totalBorderPx) : 0;
      p.isCoastal = isCoastal;
    } else {
      // minimally keep isCoastal consistent
      p.isCoastal = isCoastal;
    }

    if (!isCoastal) {
      // clear coastal-specific fields
      p.coastalWaterProvinceIds = [];
      p.coastalWaterbodyIds = [];
      p.coastalWaterTypeCountsPx = Object.create(null);
      p.coastalWaterbodyBorderPx = Object.create(null);
      p.isStraitCandidate = 0;
      p.straitScore = 0;
      p.maritimeExposureScore = 0;
      p.nearestWaterbodyId = null;
      p.nearestWaterProvinceId = null;
      p.coastVectorX = 0;
      p.coastVectorY = 0;
      p.coastDirectionDeg = null;
      continue;
    }

    coastalCount++;
    totalCoastBorderPx += coastBorderPx;
    if (coastBorderPx > maxCoastBorderPx) { maxCoastBorderPx = coastBorderPx; maxCoastProvinceId = pid; }

    // Finalize coastal lists
    const coastalWaterProvinceIds = Array.from(waterProvSet).map(v => v|0).sort((a,b)=>a-b);

    // Determine distinct "water units" for strait detection:
    // Prefer numeric waterbodyId; otherwise use waterType buckets.
    let coastalWaterbodyIds = [];
    let distinctWaterUnits = 0;

    if (Object.keys(waterbodyBorderPx).length) {
      coastalWaterbodyIds = Object.keys(waterbodyBorderPx).map(k => k|0).sort((a,b)=>a-b);
      distinctWaterUnits = coastalWaterbodyIds.length;
    } else {
      // fallback to water types (string keys)
      const keys = Object.keys(waterTypeCountsPx);
      distinctWaterUnits = keys.length;
      // can't store "waterbodyIds" meaningfully, but keep a "coastalWaterTypeIds" style in same field
      coastalWaterbodyIds = keys.slice().sort();
    }

    p.coastalWaterProvinceIds = coastalWaterProvinceIds;
    p.coastalWaterbodyIds = coastalWaterbodyIds;
    p.coastalWaterTypeCountsPx = waterTypeCountsPx;
    p.coastalWaterbodyBorderPx = waterbodyBorderPx;

    // Nearest waterbody id (by border px)
    let nearestWaterbodyId = null;
    if (Object.keys(waterbodyBorderPx).length) {
      let bestW = -1;
      for (const k in waterbodyBorderPx) {
        const w = waterbodyBorderPx[k] || 0;
        if (w > bestW) { bestW = w; nearestWaterbodyId = (k|0); }
      }
    } else {
      // fallback to dominant waterType by border px
      let bestW = -1;
      for (const k in waterTypeCountsPx) {
        const w = waterTypeCountsPx[k] || 0;
        if (w > bestW) { bestW = w; nearestWaterbodyId = k; } // string
      }
    }

    p.nearestWaterProvinceId = bestWaterProv;
    p.nearestWaterbodyId = nearestWaterbodyId;

    // Strait candidate / score
    // Use waterbodyBorderPx shares (preferred) else waterTypeCountsPx shares.
    const shares = [];
    if (Object.keys(waterbodyBorderPx).length) {
      for (const k in waterbodyBorderPx) shares.push(waterbodyBorderPx[k] / coastBorderPx);
    } else {
      for (const k in waterTypeCountsPx) shares.push(waterTypeCountsPx[k] / coastBorderPx);
    }
    shares.sort((a,b)=>b-a);
    const topShare = shares[0] || 0;
    const secondShare = shares[1] || 0;

    const isStraitCandidate =
      (coastBorderPx >= minCoastBorderPxForStrait) &&
      (distinctWaterUnits >= minDistinctWaterUnitsForStrait) &&
      (secondShare >= minSecondShare);

    p.isStraitCandidate = isStraitCandidate ? 1 : 0;

    // Strait score: favors (a) high coast ratio, (b) two-sided water adjacency
    // Range ~0..1
    const straitScore = Math.min(1,
      (p.coastRatio || 0) * 0.55 +
      (Math.min(1, distinctWaterUnits / 3) * 0.25) +
      (Math.min(1, secondShare / 0.33) * 0.20)
    );
    p.straitScore = straitScore;

    if (isStraitCandidate) straitCandidates++;

    // Maritime exposure score:
    // - Base: coast ratio
    // - Bonus: adjacent waterbody area (if available) damped with log1p
    let exposure = (p.coastRatio || 0);

    if (waterbodyAreaPx && Object.keys(waterbodyBorderPx).length) {
      // sum unique adjacent waterbody areas
      const seen = new Set();
      for (const k in waterbodyBorderPx) {
        const wbId = k|0;
        if (seen.has(wbId)) continue;
        seen.add(wbId);
        adjacentWaterAreaPx += (waterbodyAreaPx.get(wbId) || 0);
      }
      // normalize with log to keep sane
      const bonus = Math.log1p(adjacentWaterAreaPx) / 14; // tweak divisor to taste
      exposure = Math.min(1, exposure * 0.75 + bonus * 0.25);
    }

    p.maritimeExposureScore = exposure;

    // Coast vector + direction
    if (vW > 0) {
      const nx = vx / vW;
      const ny = vy / vW;
      p.coastVectorX = nx;
      p.coastVectorY = ny;

      // Canvas coords: +X right, +Y down. Convert to degrees 0..360.
      const ang = Math.atan2(ny, nx); // -pi..pi
      let deg = ang * (180 / Math.PI);
      if (deg < 0) deg += 360;
      p.coastDirectionDeg = deg;
    } else {
      p.coastVectorX = 0;
      p.coastVectorY = 0;
      p.coastDirectionDeg = null;
    }
  }

  return {
    ok: true,
    landCount,
    coastalCount,
    coastalFrac: landCount ? coastalCount / landCount : 0,
    totalCoastBorderPx,
    avgCoastBorderPx: coastalCount ? totalCoastBorderPx / coastalCount : 0,
    maxCoastBorderPx,
    maxCoastProvinceId,
    straitCandidates
  };
}

