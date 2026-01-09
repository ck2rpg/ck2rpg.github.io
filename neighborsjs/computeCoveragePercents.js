
// ---- Coverage stats: % of total LAND or WATER for provinces/regions/landmasses/waterbodies ----
// Uses ONLY existing per-item areaPx and isLand flags (no pixel rereads).
//
// Writes:
//   province.landPct / province.waterPct  (only one is non-null depending on isLand)
//   region.landPct / region.waterPct      (based on region.isLand)
//   landmass.landPct                      (land only; landmasses are land by definition)
//   waterbody.waterPct                    (water only)
//
// Also writes window.world.landPx/waterPx if missing, by summing province areas (land/water).
// Returns summary totals.
function computeCoveragePercents(opts = {}) {
  const {
    provinces = window.provinces || [],
    regions = window.connectedTerrainRegions || [],
    landmasses = window.landmasses || [],
    waterbodies = window.waterbodies || [],
    // choose denominator source:
    // - "world" uses window.world.landPx/waterPx if present; otherwise falls back to sum(province areaPx).
    // - "sumProvinces" always uses sum(province areaPx by isLand)
    denomMode = "world", // "world" | "sumProvinces"
    // what to do when denom is 0
    zeroToNull = true
  } = opts;

  // --- 1) Compute denominators (total landPx / waterPx) ---
  let landTotal = 0;
  let waterTotal = 0;

  const sumFromProvinces = () => {
    let l = 0, w = 0;
    for (let pid = 0; pid < provinces.length; pid++) {
      const p = provinces[pid];
      if (!p) continue;
      const a = (p.areaPx | 0);
      if (!(a > 0)) continue;
      if (p.isLand === false) w += a;
      else l += a; // treat null/undefined as land-ish like your other code
    }
    return { l, w };
  };

  if (denomMode === "world" && window.world && window.world.enabled && (window.world.landPx + window.world.waterPx) > 0) {
    landTotal = window.world.landPx | 0;
    waterTotal = window.world.waterPx | 0;
  } else {
    const s = sumFromProvinces();
    landTotal = s.l;
    waterTotal = s.w;
    // keep world in sync / create it if missing
    window.world = window.world || {};
    window.world.landPx = landTotal;
    window.world.waterPx = waterTotal;
    window.world.totalPx = landTotal + waterTotal;
    window.world.landFrac = window.world.totalPx ? landTotal / window.world.totalPx : 0;
    window.world.waterFrac = window.world.totalPx ? waterTotal / window.world.totalPx : 0;
    window.world.enabled = true;
  }

  const landDen = landTotal > 0 ? landTotal : 0;
  const waterDen = waterTotal > 0 ? waterTotal : 0;

  const pct = (num, den) => {
    if (!(den > 0)) return zeroToNull ? null : 0;
    return (num / den) * 100;
  };

  // --- 2) Provinces: percent of land OR water ---
  let provLandCount = 0, provWaterCount = 0;
  for (let pid = 0; pid < provinces.length; pid++) {
    const p = provinces[pid];
    if (!p) continue;
    const a = (p.areaPx | 0);

    if (p.isLand === false) {
      provWaterCount++;
    } else {
      provLandCount++;
    }
  }

  // --- 3) Regions: based on region.isLand, using region.areaPx ---
  let regionLandCount = 0, regionWaterCount = 0;
  for (let i = 0; i < regions.length; i++) {
    const r = regions[i];
    if (!r) continue;
    const a = (r.areaPx | 0);

    if (r.isLand === false) {
      r.waterPct = pct(a, waterDen);
      r.landPct = null;
      regionWaterCount++;
    } else {
      r.landPct = pct(a, landDen);
      r.waterPct = null;
      regionLandCount++;
    }
  }

  // --- 4) Landmasses: land only (areaPx) ---
  let islandCount = 0, continentCount = 0;
  for (let i = 0; i < landmasses.length; i++) {
    const lm = landmasses[i];
    if (!lm) continue;
    const a = (lm.areaPx | 0);
    lm.landPct = pct(a, landDen);
    lm.waterPct = null;

    if (lm.type === "continent") continentCount++;
    else if (lm.type === "island") islandCount++;
  }

  // --- 5) Waterbodies: water only (areaPx) ---
  for (let i = 0; i < waterbodies.length; i++) {
    const wb = waterbodies[i];
    if (!wb) continue;
    const a = (wb.areaPx | 0);
    wb.waterPct = pct(a, waterDen);
    wb.landPct = null;
  }

  return {
    ok: true,
    landTotalPx: landTotal,
    waterTotalPx: waterTotal,
    provinces: { land: provLandCount, water: provWaterCount },
    regions: { land: regionLandCount, water: regionWaterCount },
    landmasses: { total: landmasses.length, continents: continentCount, islands: islandCount },
    waterbodies: { total: waterbodies.length }
  };
}
