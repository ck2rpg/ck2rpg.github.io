  // ---- Region elevation stats (aggregated from province elevation stats; NO map needed) ----
// Writes onto each region:
//   elevMin/elevMax/elevMean/elevStd/relief
// plus optional weighted variants if areaPx is available.
//
// Assumes per-province fields exist (from computeElevationStatsFromHeightmap):
//   elevMin, elevMax, elevMean, elevStd, relief
//
// Weighting:
//   - Uses province.areaPx as weights by default (pixel-accurate).
//   - Falls back to equal weights if areaPx is missing/0.
//
function computeRegionElevationStatsFromProvinces(opts = {}) {
  const {
    regions = window.connectedTerrainRegions,
    provinces = window.provinces,
    // if true, delete region elev fields when missing inputs; else set to null
    deleteWhenMissing = false,
    // if true, compute both unweighted and area-weighted summary fields
    storeWeightedAlso = false,
    // field names
    outPrefix = "" // e.g. "elev_" -> writes elev_elevMin etc. (usually keep "")
  } = opts;

  if (!regions || !regions.length || !provinces || !provinces.length) {
    return { ok: false, reason: "missing regions/provinces" };
  }

  const setMissing = (r) => {
    const keys = [
      "elevMin","elevMax","elevMean","elevStd","relief",
      ...(storeWeightedAlso ? ["elevMeanW","elevStdW","elevMinW","elevMaxW","reliefW"] : [])
    ].map(k => outPrefix + k);

    if (deleteWhenMissing) {
      for (const k of keys) delete r[k];
    } else {
      for (const k of keys) r[k] = null;
    }
  };

  let regionsWithElev = 0;
  let provincesUsed = 0;
  let skippedNoProvElev = 0;

  for (let rid = 0; rid < regions.length; rid++) {
    const r = regions[rid];
    if (!r || !Array.isArray(r.provinces) || !r.provinces.length) {
      setMissing(r);
      continue;
    }

    // Unweighted aggregation across provinces in the region
    let minR =  1e18;
    let maxR = -1e18;
    let sumM = 0;
    let sumM2 = 0;      // for variance of province means
    let sumVarWithin = 0; // average of within-province variances
    let n = 0;

    // Weighted (by areaPx) aggregation of province distributions (recommended)
    let wSum = 0;
    let wMin =  1e18;
    let wMax = -1e18;
    let wSumM = 0;
    let wSumM2 = 0;       // for between-province variance (weighted)
    let wSumVarWithin = 0;

    for (let i = 0; i < r.provinces.length; i++) {
      const pid = r.provinces[i] | 0;
      const p = provinces[pid];
      if (!p) continue;

      // Need at least mean, min, max to do anything useful
      const have = (typeof p.elevMean === "number") && (typeof p.elevMin === "number") && (typeof p.elevMax === "number");
      if (!have) { skippedNoProvElev++; continue; }

      const m = p.elevMean;
      const mn = p.elevMin;
      const mx = p.elevMax;
      const sd = (typeof p.elevStd === "number") ? p.elevStd : 0;
      const varWithin = sd * sd;

      // unweighted
      if (mn < minR) minR = mn;
      if (mx > maxR) maxR = mx;
      sumM += m;
      sumM2 += m * m;
      sumVarWithin += varWithin;
      n++;
      provincesUsed++;

      // weighted
      let w = (p.areaPx | 0);
      if (!(w > 0)) w = 1; // fallback
      wSum += w;
      if (mn < wMin) wMin = mn;
      if (mx > wMax) wMax = mx;
      wSumM += m * w;
      wSumM2 += (m * m) * w;
      wSumVarWithin += varWithin * w;
    }

    if (n <= 0) {
      setMissing(r);
      continue;
    }

    // Unweighted mean/std across pixel distribution approximation:
    // Var(total) = E[varWithin] + Var(means)
    const mean = sumM / n;
    const varMeans = Math.max(0, (sumM2 / n) - (mean * mean));
    const meanVarWithin = sumVarWithin / n;
    const variance = Math.max(0, meanVarWithin + varMeans);
    const std = Math.sqrt(variance);

    r[outPrefix + "elevMin"] = minR;
    r[outPrefix + "elevMax"] = maxR;
    r[outPrefix + "elevMean"] = mean;
    r[outPrefix + "elevStd"] = std;
    r[outPrefix + "relief"] = maxR - minR;

    if (storeWeightedAlso) {
      const meanW = wSum > 0 ? (wSumM / wSum) : mean;
      const varMeansW = wSum > 0 ? Math.max(0, (wSumM2 / wSum) - (meanW * meanW)) : varMeans;
      const meanVarWithinW = wSum > 0 ? (wSumVarWithin / wSum) : meanVarWithin;
      const varianceW = Math.max(0, meanVarWithinW + varMeansW);
      const stdW = Math.sqrt(varianceW);

      r[outPrefix + "elevMinW"] = wMin;
      r[outPrefix + "elevMaxW"] = wMax;
      r[outPrefix + "elevMeanW"] = meanW;
      r[outPrefix + "elevStdW"] = stdW;
      r[outPrefix + "reliefW"] = wMax - wMin;
    }

    regionsWithElev++;
  }

  return {
    ok: true,
    regions: regions.length,
    regionsWithElev,
    provincesUsed,
    skippedNoProvElev
  };
}

