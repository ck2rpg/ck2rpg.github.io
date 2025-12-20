//NEW VERSION
function annotateGroupingWithGeoStats(group, opts = {}) {
  const {
    // if true: always overwrite per-province derived fields
    overwriteProvince = false,

    // if true: store extra per-province fields (lat/lon, island flags, etc.)
    storeProvinceExtras = true,

    // if true: store a compact "derived" object instead of lots of top-level keys
    storeUnderDerivedObject = false
  } = opts;

  if (!group || !Array.isArray(group.provinces) || !group.provinces.length) {
    console.warn("annotateGroupingWithGeoStats: invalid or empty group", group);
    return group;
  }
  if (!seeds || !seeds.length || !W || !H || !heightData) {
    console.warn("annotateGroupingWithGeoStats: world not initialized yet.");
    return group;
  }

  const provIds = group.provinces;

  // --- Accumulators ---
  let landProv = 0, seaProv = 0;
  let coastalProv = 0;
  let islandProv = 0;

  let sumX = 0, sumY = 0;
  let minX =  1e9, maxX = -1e9;
  let minY =  1e9, maxY = -1e9;

  let elevSum = 0, elevSqSum = 0;
  let elevMin =  1e9, elevMax = -1e9;

  const terrainCounts = Object.create(null);

  const koppenIndexCounts = {};
  const koppenGroupCounts = { A:0, B:0, C:0, D:0, E:0, H:0, '?':0 };

  let latSum = 0;
  let lonSum = 0;

  let highMountainProv = 0;
  let desertProv = 0;
  let jungleProv = 0;
  let forestProv = 0;
  let wetlandProv = 0;
  let coldishProv = 0;
  let tropicishProv = 0;

  // --- helper: set a key only if missing unless overwriteProvince ---
  function setIf(seed, key, value) {
    if (!seed) return;
    if (overwriteProvince || seed[key] === undefined || seed[key] === null) {
      seed[key] = value;
    }
  }

  // --- helper: set under seed.derived.* if storeUnderDerivedObject ---
  function setDerived(seed, key, value) {
    if (!seed) return;
    if (storeUnderDerivedObject) {
      if (!seed.derived || typeof seed.derived !== "object") seed.derived = {};
      if (overwriteProvince || seed.derived[key] === undefined || seed.derived[key] === null) {
        seed.derived[key] = value;
      }
    } else {
      setIf(seed, key, value);
    }
  }

  for (const p of provIds) {
    const seed = seeds[p];
    if (!seed) continue;

    const x = seed.x | 0, y = seed.y | 0;
    const k = y * W + x;
    if (k < 0 || k >= heightData.length) continue;

    const h = heightData[k];
    const hm = heightToMeters(h);

    // normalized coords
    const latNorm = H > 1 ? 1 - (y / (H - 1)) : 0.5;
    const lonNorm = W > 1 ? (x / (W - 1)) : 0.5;

    // land/sea, coastal, island heuristics
    const effIsLand = effMask ? (effMask[k] === 1) : !!seed.isLand;
    const isCoast = isCoastalPixel(x, y);

    let isTinyIsland = false;
    if (landMask && landCompId && landCompSize) {
      const cid = landCompId[k];
      if (cid >= 0) {
        const size = landCompSize[cid] || 0;
        const thr = Math.max(0, (+minIslandPxIn?.value | 0) || 0);
        if (size > 0 && size < thr) isTinyIsland = true;
      }
    }

    // Terrain at seed (resolved)
    const terr = (typeof seed.terrain === "string" && seed.terrain !== "default")
      ? seed.terrain
      : getTerrainAt(x, y);

    // Köppen at seed (if available)
    let koppenIndex = null;
    let koppenGroup = '?';
    let koppenCode  = null;

    if (typeof getKoppenIndexAt === "function") {
      const idxK = getKoppenIndexAt(x, y);
      if (idxK != null && idxK >= 0 && typeof KOPPEN_CLASSES !== "undefined" && KOPPEN_CLASSES[idxK]) {
        koppenIndex = idxK;
        const kc = KOPPEN_CLASSES[idxK];
        koppenGroup = kc?.group || '?';
        koppenCode  = kc?.code  || null;
      }
    }

    // --------- WRITE BACK TO THE PROVINCE (seed) ----------
    // (This is the “assign properties to provinces” part.)
    setDerived(seed, "effIsLand", effIsLand ? 1 : 0);
    setDerived(seed, "isCoastal", isCoast ? 1 : 0);
    if (storeProvinceExtras) {
      setDerived(seed, "latNorm", latNorm);
      setDerived(seed, "lonNorm", lonNorm);
      setDerived(seed, "px", x);
      setDerived(seed, "py", y);
    }

    // elevation + terrain
    setDerived(seed, "elevM", (hm != null ? hm : null));
    setDerived(seed, "terrainResolved", terr);

    // koppen
    // You’ll now have seeds[p].koppenIndex / koppenGroup / koppenCode (or under seed.derived.*)
    setDerived(seed, "koppenIndex", koppenIndex);
    setDerived(seed, "koppenGroup", koppenGroup);
    if (koppenCode != null) setDerived(seed, "koppenCode", koppenCode);

    // island heuristic
    if (storeProvinceExtras) {
      setDerived(seed, "isTinyIsland", isTinyIsland ? 1 : 0);
      if (isTinyIsland) setDerived(seed, "landComponentId", (landCompId ? landCompId[k] : null));
    }
    // ------------------------------------------------------

    // ---- group accumulators (unchanged logic, but now uses locals) ----

    sumX += x; sumY += y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;

    latSum += latNorm;
    lonSum += lonNorm;

    if (effIsLand) landProv++; else seaProv++;
    if (isCoast) coastalProv++;
    if (isTinyIsland) islandProv++;

    if (effIsLand && hm != null) {
      elevSum += hm;
      elevSqSum += hm * hm;
      if (hm < elevMin) elevMin = hm;
      if (hm > elevMax) elevMax = hm;
    }

    terrainCounts[terr] = (terrainCounts[terr] || 0) + 1;

    if (terr === "mountains" || terr === "desert_mountains") highMountainProv++;
    if (terr === "desert" || terr === "drylands") desertProv++;
    if (terr === "jungle") jungleProv++;
    if (terr === "forest" || terr === "taiga") forestProv++;
    if (terr === "wetlands" || terr === "floodplains") wetlandProv++;

    if (koppenIndex != null) {
      koppenIndexCounts[koppenIndex] = (koppenIndexCounts[koppenIndex] || 0) + 1;
      if (!koppenGroupCounts[koppenGroup]) koppenGroupCounts[koppenGroup] = 0;
      koppenGroupCounts[koppenGroup] += 1;

      if (koppenGroup === "A") tropicishProv++;
      if (koppenGroup === "D" || koppenGroup === "E") coldishProv++;
    } else {
      koppenGroupCounts["?"] += 1;
      // fallback latitude tagging only if koppen not available
      const latFromEquator = Math.abs(latNorm - 0.5) * 2;
      if (latFromEquator < 0.3) tropicishProv++;
      if (latFromEquator > 0.6) coldishProv++;
    }
  }

  // --- Normalize and derive secondary metrics ---
  const totalProv = landProv + seaProv || 1;
  const landShare    = landProv / totalProv;
  const seaShare     = seaProv  / totalProv;
  const coastalShare = coastalProv / totalProv;
  const islandShare  = islandProv  / totalProv;

  const cx = sumX / totalProv;
  const cy = sumY / totalProv;

  const latMean = latSum / totalProv;
  const lonMean = lonSum / totalProv;
  const latFromEquatorMean = Math.abs(latMean - 0.5) * 2;

  const elevCount = landProv || 1;
  const elevMean  = elevSum / elevCount;
  const elevVar   = elevSqSum / elevCount - elevMean * elevMean;
  const elevStd   = elevVar > 0 ? Math.sqrt(elevVar) : 0;

  const terrainShares = {};
  for (const key in terrainCounts) terrainShares[key] = terrainCounts[key] / totalProv;

  const koppenIndexShares = {};
  let koppenTotal = 0;
  for (const k in koppenIndexCounts) koppenTotal += koppenIndexCounts[k];
  if (koppenTotal > 0) {
    for (const k in koppenIndexCounts) koppenIndexShares[k] = koppenIndexCounts[k] / koppenTotal;
  }

  const koppenGroupShares = {};
  let koppenGroupTotal = 0;
  for (const g in koppenGroupCounts) koppenGroupTotal += koppenGroupCounts[g];
  if (koppenGroupTotal > 0) {
    for (const g in koppenGroupCounts) koppenGroupShares[g] = koppenGroupCounts[g] / koppenGroupTotal;
  }

  const isMountainous = (highMountainProv / totalProv) > 0.25 || elevMean > 2000;
  const isDesert      = desertProv / totalProv > 0.35;
  const isJungle      = jungleProv / totalProv > 0.25;
  const isForest      = forestProv / totalProv > 0.4;
  const isWetland     = wetlandProv / totalProv > 0.3;
  const isCoastal     = coastalShare > 0.3;
  const isIslandHeavy = islandShare > 0.3;

  const isTropical    = (tropicishProv / totalProv) > 0.4;
  const isCold        = (coldishProv / totalProv)   > 0.4;
  const isTemperate   = !isTropical && !isCold;

  let dominantKoppenGroup = null;
  let bestKVal = -1;
  for (const g in koppenGroupShares) {
    if (koppenGroupShares[g] > bestKVal) {
      bestKVal = koppenGroupShares[g];
      dominantKoppenGroup = g;
    }
  }

  group.geoStats = {
    totalProvinces: totalProv,
    landProvinces: landProv,
    seaProvinces: seaProv,
    landShare,
    seaShare,
    coastalProvinces: coastalProv,
    coastalShare,
    islandProvinces: islandProv,
    islandShare,

    extent: {
      minX, maxX, minY, maxY,
      widthPx:  maxX >= minX ? (maxX - minX + 1) : 0,
      heightPx: maxY >= minY ? (maxY - minY + 1) : 0,
      centroidX: cx,
      centroidY: cy,
      centroidLonNorm: lonMean,
      centroidLatNorm: latMean,
      latFromEquatorMean
    },

    elevation: {
      mean: elevMean,
      stdDev: elevStd,
      min: elevMin === 1e9 ? null : elevMin,
      max: elevMax === -1e9 ? null : elevMax
    },

    terrainCounts,
    terrainShares,

    koppenIndexCounts,
    koppenIndexShares,
    koppenGroupCounts,
    koppenGroupShares,
    dominantKoppenGroup,

    categoryTallies: {
      highMountainProv,
      desertProv,
      jungleProv,
      forestProv,
      wetlandProv,
      tropicishProv,
      coldishProv
    },

    flags: {
      isMountainous,
      isDesert,
      isJungle,
      isForest,
      isWetland,
      isCoastal,
      isIslandHeavy,
      isTropical,
      isCold,
      isTemperate
    }
  };

  return group;
}


//OLD VERSION
/*function annotateGroupingWithGeoStats(group) {
    if (!group || !Array.isArray(group.provinces) || !group.provinces.length) {
      console.warn("annotateGroupingWithGeoStats: invalid or empty group", group);
      return group;
    }
    if (!seeds || !seeds.length || !W || !H || !heightData) {
      console.warn("annotateGroupingWithGeoStats: world not initialized yet.");
      return group;
    }

    const provIds = group.provinces;
    const nProv = provIds.length;

    // --- Accumulators ---
    let landProv = 0, seaProv = 0;
    let coastalProv = 0;
    let islandProv = 0; // tiny island based on original land components

    let sumX = 0, sumY = 0;
    let minX =  1e9, maxX = -1e9;
    let minY =  1e9, maxY = -1e9;

    let elevSum = 0, elevSqSum = 0;
    let elevMin =  1e9, elevMax = -1e9;

    // terrain counts
    const terrainCounts = Object.create(null);

    // Köppen counts (by index and by group letter)
    const koppenIndexCounts = {};
    const koppenGroupCounts = { A:0, B:0, C:0, D:0, E:0, H:0, '?':0 };

    // latitude / longitude aggregates (normalized 0..1)
    let latSum = 0;
    let lonSum = 0;

    // some category-ish tallies
    let highMountainProv = 0;
    let desertProv = 0;
    let jungleProv = 0;
    let forestProv = 0;
    let wetlandProv = 0;
    let coldishProv = 0;
    let tropicishProv = 0;

    for (const p of provIds) {
      const seed = seeds[p];
      if (!seed) continue;

      const x = seed.x|0, y = seed.y|0;
      const k = y * W + x;
      if (k < 0 || k >= heightData.length) continue;

      const h = heightData[k];
      const hm = heightToMeters(h);

      // track extent & centroid
      sumX += x;
      sumY += y;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      const latNorm = H > 1 ? 1 - (y / (H - 1)) : 0.5;
      const lonNorm = W > 1 ? (x / (W - 1)) : 0.5;
      latSum += latNorm;
      lonSum += lonNorm;

      // land / sea / coastal / island heuristics
      const effIsLand = effMask ? (effMask[k] === 1) : !!seed.isLand;
      if (effIsLand) landProv++; else seaProv++;

      if (isCoastalPixel(x, y)) coastalProv++;

      if (landMask && landCompId && landCompSize) {
        const cid = landCompId[k];
        if (cid >= 0) {
          const size = landCompSize[cid] || 0;
          const thr = Math.max(0, (+minIslandPxIn?.value | 0) || 0);
          if (size > 0 && size < thr) islandProv++;
        }
      }

      // Elevation stats (only count land)
      if (effIsLand && hm != null) {
        elevSum += hm;
        elevSqSum += hm * hm;
        if (hm < elevMin) elevMin = hm;
        if (hm > elevMax) elevMax = hm;
      }

      // Terrain at seed
      const terr = (typeof seed.terrain === "string" && seed.terrain !== "default")
        ? seed.terrain
        : getTerrainAt(x, y);

      terrainCounts[terr] = (terrainCounts[terr] || 0) + 1;

      // quick category tags from terrain
      if (terr === "mountains" || terr === "desert_mountains") highMountainProv++;
      if (terr === "desert" || terr === "drylands") desertProv++;
      if (terr === "jungle") jungleProv++;
      if (terr === "forest" || terr === "taiga") forestProv++;
      if (terr === "wetlands" || terr === "floodplains") wetlandProv++;

      // Köppen at seed (if available)
      if (typeof getKoppenIndexAt === "function") {
        const idxK = getKoppenIndexAt(x, y);
        if (idxK != null && idxK >= 0 && typeof KOPPEN_CLASSES !== "undefined") {
          koppenIndexCounts[idxK] = (koppenIndexCounts[idxK] || 0) + 1;
          const kc = KOPPEN_CLASSES[idxK];
          const gLetter = kc?.group || '?';
          if (!koppenGroupCounts[gLetter]) koppenGroupCounts[gLetter] = 0;
          koppenGroupCounts[gLetter] += 1;

          // use Köppen to bias tropic/cold tags a little
          if (kc.group === 'A') tropicishProv++;
          if (kc.group === 'D' || kc.group === 'E') coldishProv++;
        } else {
          koppenGroupCounts['?'] += 1;
        }
      } else {
        // Fall back to latitude only
        const latFromEquator = Math.abs(latNorm - 0.5) * 2; // 0 at equator, 1 at pole
        if (latFromEquator < 0.3) tropicishProv++;
        if (latFromEquator > 0.6) coldishProv++;
      }
    }

    // --- Normalize and derive secondary metrics ---

    const totalProv = landProv + seaProv || 1;
    const landShare   = landProv   / totalProv;
    const seaShare    = seaProv    / totalProv;
    const coastalShare= coastalProv/ totalProv;
    const islandShare = islandProv / totalProv;

    const cx = sumX / totalProv;
    const cy = sumY / totalProv;

    const latMean = latSum / totalProv;
    const lonMean = lonSum / totalProv;
    const latFromEquatorMean = Math.abs(latMean - 0.5) * 2; // 0 equator, 1 poles

    const elevCount = landProv || 1;
    const elevMean  = elevSum / elevCount;
    const elevVar   = elevSqSum / elevCount - elevMean * elevMean;
    const elevStd   = elevVar > 0 ? Math.sqrt(elevVar) : 0;

    // Terrain shares
    const terrainShares = {};
    for (const key in terrainCounts) {
      terrainShares[key] = terrainCounts[key] / totalProv;
    }

    // Köppen shares
    const koppenIndexShares = {};
    let koppenTotal = 0;
    for (const k in koppenIndexCounts) koppenTotal += koppenIndexCounts[k];
    if (koppenTotal > 0) {
      for (const k in koppenIndexCounts) {
        koppenIndexShares[k] = koppenIndexCounts[k] / koppenTotal;
      }
    }

    const koppenGroupShares = {};
    let koppenGroupTotal = 0;
    for (const g in koppenGroupCounts) koppenGroupTotal += koppenGroupCounts[g];
    if (koppenGroupTotal > 0) {
      for (const g in koppenGroupCounts) {
        koppenGroupShares[g] = koppenGroupCounts[g] / koppenGroupTotal;
      }
    }

    // Simple classification flags
    const isMountainous = (highMountainProv / totalProv) > 0.25 || elevMean > 2000;
    const isDesert      = desertProv / totalProv > 0.35;
    const isJungle      = jungleProv / totalProv > 0.25;
    const isForest      = forestProv / totalProv > 0.4;
    const isWetland     = wetlandProv / totalProv > 0.3;
    const isCoastal     = coastalShare > 0.3;
    const isIslandHeavy = islandShare > 0.3;

    const isTropical    = (tropicishProv / totalProv) > 0.4;
    const isCold        = (coldishProv / totalProv)   > 0.4;
    const isTemperate   = !isTropical && !isCold;

    // Rough climate archetype from Köppen groups
    let dominantKoppenGroup = null;
    let bestKVal = -1;
    for (const g in koppenGroupShares) {
      if (koppenGroupShares[g] > bestKVal) {
        bestKVal = koppenGroupShares[g];
        dominantKoppenGroup = g;
      }
    }

    // --- Attach to group object ---
    group.geoStats = {
      // composition
      totalProvinces: totalProv,
      landProvinces: landProv,
      seaProvinces: seaProv,
      landShare,
      seaShare,
      coastalProvinces: coastalProv,
      coastalShare,
      islandProvinces: islandProv,
      islandShare,

      // spatial extent (in pixels, and normalized 0..1 coords)
      extent: {
        minX, maxX, minY, maxY,
        widthPx:  maxX >= minX ? (maxX - minX + 1) : 0,
        heightPx: maxY >= minY ? (maxY - minY + 1) : 0,
        centroidX: cx,
        centroidY: cy,
        centroidLonNorm: lonMean,
        centroidLatNorm: latMean,
        latFromEquatorMean
      },

      // elevation (meters, approximate)
      elevation: {
        mean: elevMean,
        stdDev: elevStd,
        min: elevMin === 1e9 ? null : elevMin,
        max: elevMax === -1e9 ? null : elevMax
      },

      // terrain distributions
      terrainCounts,
      terrainShares,

      // climate / Köppen distributions
      koppenIndexCounts,
      koppenIndexShares,
      koppenGroupCounts,
      koppenGroupShares,
      dominantKoppenGroup,

      // quick category tallies
      categoryTallies: {
        highMountainProv,
        desertProv,
        jungleProv,
        forestProv,
        wetlandProv,
        tropicishProv,
        coldishProv
      },

      // qualitative flags for higher-level logic
      flags: {
        isMountainous,
        isDesert,
        isJungle,
        isForest,
        isWetland,
        isCoastal,
        isIslandHeavy,
        isTropical,
        isCold,
        isTemperate
      }
    };

    return group;
}
*/

    // ---- EXTENDED INFERENCES & STORY-LIKE TAGS ----
function deriveExtendedGeoInferences(group) {
      const gs = group.geoStats;
      const share = (k) => gs.terrainShares[k] || 0;

      const plainsShare        = share("plains");
      const farmlandsShare     = share("farmlands");
      const hillsShare         = share("hills");
      const mountainsShare     = share("mountains");
      const desertShare        = share("desert");
      const desertMtnShare     = share("desert_mountains");
      const oasisShare         = share("oasis");
      const jungleShare        = share("jungle");
      const forestShare        = share("forest");
      const taigaShare         = share("taiga");
      const wetlandsShare      = share("wetlands");
      const floodplainsShare   = share("floodplains");
      const steppeShare        = share("steppe");
      const drylandsShare      = share("drylands");

      const aridShare    = desertShare + drylandsShare + steppeShare;
      const woodedShare  = forestShare + jungleShare + taigaShare;
      const openShare    = plainsShare + steppeShare + drylandsShare;
      const ruggedShare2 = mountainsShare + hillsShare + desertMtnShare;
      const wetShare     = wetlandsShare + floodplainsShare + oasisShare;

      // Diversity indices (0 = single type, approaching 1 = very mixed)
      let terrainDiversity = 0;
      {
        let sumSq = 0;
        for (const k in gs.terrainShares) {
          const v = gs.terrainShares[k];
          if (v > 0) sumSq += v * v;
        }
        terrainDiversity = 1 - sumSq;
      }

      let climateDiversity = 0;
      {
        const kg = gs.koppenGroupShares || {};
        let sumSq = 0;
        for (const g in kg) {
          const v = kg[g];
          if (v > 0) sumSq += v * v;
        }
        climateDiversity = 1 - sumSq;
      }

      const latSpanNorm = (gs.extent.heightPx && H > 1) ? (gs.extent.heightPx / (H - 1)) : 0;
      const lonSpanNorm = (gs.extent.widthPx  && W > 1) ? (gs.extent.widthPx  / (W - 1)) : 0;

      // Economic potential scores (arbitrary but consistent scales)
      const agriScore = (
        farmlandsShare   * 3 +
        plainsShare      * 2 +
        floodplainsShare * 3 +
        oasisShare       * 1.5
      ) * (1 - Math.min(1, ruggedShare2 * 0.7)) * gs.landShare;

      const pastoralScore = (
        steppeShare   * 3 +
        drylandsShare * 2 +
        hillsShare    * 1.5
      ) * (1 - Math.min(1, woodedShare * 0.5));

      const maritimeScore =
        gs.coastalShare * 3 +
        gs.seaShare     * 1.5;

      const miningScore = (
        mountainsShare * 3 +
        desertMtnShare * 3 +
        hillsShare     * 1.5
      ) + (gs.elevation.stdDev || 0) / 2000;

      // Hazard-ish scores
      const floodRiskScore   = wetShare * 3 + floodplainsShare * 4;
      const droughtRiskScore = Math.max(0, aridShare * 3 - wetShare * 2);
      const winterHardshipScore =
        (gs.flags.isCold ? 1.5 : 0) +
        ((gs.koppenGroupShares?.D || 0) + (gs.koppenGroupShares?.E || 0)) * 2;

      // Internal fragmentation from land components
      let landComponentCount = 0;
      let mainComponentShare = 1;

      if (landCompId && landCompSize && landMask) {
        const compSet = new Set();
        let totalLandPx = 0;
        let maxComp = 0;

        for (const p of group.provinces) {
          const seed = seeds[p];
          if (!seed) continue;
          const x = seed.x | 0, y = seed.y | 0;
          const idx = y * W + x;
          if (!landMask[idx]) continue;
          const cid = landCompId[idx];
          if (cid < 0) continue;
          compSet.add(cid);
        }

        landComponentCount = compSet.size;

        if (landComponentCount > 0) {
          for (const cid of compSet) {
            const s = landCompSize[cid] || 0;
            totalLandPx += s;
            if (s > maxComp) maxComp = s;
          }
          if (totalLandPx > 0) {
            mainComponentShare = maxComp / totalLandPx;
          }
        }
      }

      // Environment / economy / hazard / cohesion tags
      const envTags = [];
      if (gs.flags.isCoastal)      envTags.push("coastal");
      if (gs.flags.isIslandHeavy)  envTags.push("archipelagic");
      if (gs.flags.isMountainous)  envTags.push("mountainous");
      if (gs.flags.isDesert)       envTags.push("arid");
      if (gs.flags.isJungle)       envTags.push("jungle");
      if (gs.flags.isForest)       envTags.push("forested");
      if (gs.flags.isWetland)      envTags.push("wetland");
      if (gs.flags.isTropical)     envTags.push("tropical");
      if (gs.flags.isCold)         envTags.push("cold");
      if (gs.flags.isTemperate)    envTags.push("temperate");
      if (latSpanNorm > 0.4)       envTags.push("latitudinally-spanning");
      if (climateDiversity > 0.35) envTags.push("multi-climate");

      const economyTags = [];
      if (agriScore > 1.5)     economyTags.push("agricultural-heartland");
      if (pastoralScore > 1.0) economyTags.push("pastoral-nomadic");
      if (maritimeScore > 1.0) economyTags.push("maritime-oriented");
      if (miningScore > 3.0)   economyTags.push("mineral-rich");

      const hazardTags = [];
      if (floodRiskScore   > 1.0) hazardTags.push("flood-prone");
      if (droughtRiskScore > 1.0) hazardTags.push("drought-prone");
      if (winterHardshipScore > 1.5) hazardTags.push("harsh-winters");
      if (gs.elevation.stdDev > 1200) hazardTags.push("rugged-travel");

      const cohesionTags = [];
      if (landComponentCount > 1) cohesionTags.push("fragmented-territory");
      if (landComponentCount === 1 && mainComponentShare > 0.9)
        cohesionTags.push("highly-contiguous");
      if (landComponentCount > 3 || mainComponentShare < 0.5)
        cohesionTags.push("strong-diaspora-pattern");

      // A coarse primary archetype
      let primaryArchetype = "mixed-terrain";
      if (gs.flags.isMountainous && !gs.flags.isCoastal && !gs.flags.isDesert) {
        primaryArchetype = "mountain-heartland";
      } else if (gs.flags.isCoastal && agriScore > 1.5 && !gs.flags.isDesert) {
        primaryArchetype = "maritime-breadbasket";
      } else if (gs.flags.isDesert && !gs.flags.isCoastal) {
        primaryArchetype = "inland-desert-hinterland";
      } else if (gs.flags.isDesert && gs.flags.isCoastal) {
        primaryArchetype = "desert-caravan-coast";
      } else if (gs.flags.isJungle || (woodedShare > 0.5 && wetShare > 0.4)) {
        primaryArchetype = "forest-jungle-frontier";
      } else if (gs.flags.isTemperate && agriScore > 1.5 && ruggedShare2 < 0.4) {
        primaryArchetype = "temperate-plains-core";
      }

      // Helper for percentages
      function pct(x) { return Math.round(x * 100); }

      // Natural-language descriptors
      const climateWords = (() => {
        if (gs.flags.isTropical)  return "tropical";
        if (gs.flags.isCold)      return "cold";
        if (gs.flags.isTemperate) return "temperate";
        return "mixed-climate";
      })();

      const reliefWords = (() => {
        if (gs.elevation.stdDev > 1500 || ruggedShare2 > 0.6) return "very rugged";
        if (gs.elevation.stdDev > 800  || ruggedShare2 > 0.4) return "moderately rugged";
        if (gs.elevation.stdDev > 300  || ruggedShare2 > 0.2) return "gently rolling";
        return "mostly flat";
      })();

      const sizeWords = (() => {
        const p = gs.totalProvinces;
        if (p >= 200) return "very large";
        if (p >= 80)  return "large";
        if (p >= 30)  return "medium-sized";
        if (p >= 10)  return "small";
        return "very small";
      })();

      const coastalWords = (() => {
        if (gs.coastalShare > 0.7) return "heavily coastal";
        if (gs.coastalShare > 0.4) return "coastally focused";
        if (gs.coastalShare > 0.1) return "with limited coasts";
        return "landlocked";
      })();

      const summaryParts = [];
      summaryParts.push(
        `A ${sizeWords}, ${climateWords} region that is ${reliefWords} and ${coastalWords}.`
      );

      const topTerrains = Object.entries(gs.terrainShares)
        .filter(([_, v]) => v > 0.08)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k, v]) => `${k.replace(/_/g, " ")} (${pct(v)}%)`);

      if (topTerrains.length) {
        summaryParts.push(`Dominant terrains: ${topTerrains.join(", ")}.`);
      }

      if (typeof gs.dominantKoppenGroup === "string") {
        const gLetter = gs.dominantKoppenGroup;
        const groupName =
          gLetter === "A" ? "equatorial"        :
          gLetter === "B" ? "arid"              :
          gLetter === "C" ? "warm temperate"    :
          gLetter === "D" ? "snow/continental"  :
          gLetter === "E" ? "polar"             :
          gLetter === "H" ? "highland"          :
          "unknown";
        summaryParts.push(
          `Climate is mainly ${groupName} (${gLetter}) with diversity index ${climateDiversity.toFixed(2)}.`
        );
      }

      if (agriScore > 1.0) {
        summaryParts.push("Has good potential for settled agriculture.");
      } else if (pastoralScore > 1.0) {
        summaryParts.push("Better suited to pastoral or semi-nomadic livelihoods than dense agriculture.");
      }

      if (maritimeScore > 1.0) {
        summaryParts.push("Geography strongly favors seafaring, fishing, and maritime trade.");
      }

      if (floodRiskScore > 1.2) {
        summaryParts.push("Low-lying wetlands and floodplains suggest significant flood risk in wetter years.");
      }
      if (droughtRiskScore > 1.2) {
        summaryParts.push("Arid interiors are vulnerable to drought and water scarcity.");
      }
      if (landComponentCount > 1) {
        summaryParts.push(
          `Territory spans ${landComponentCount} separate landmasses (largest ≈ ${pct(mainComponentShare)}% of land area).`
        );
      }

      // Attach extended inferences
      gs.extended = {
        terrainDiversity,
        climateDiversity,
        latSpanNorm,
        lonSpanNorm,
        agriScore,
        pastoralScore,
        maritimeScore,
        miningScore,
        floodRiskScore,
        droughtRiskScore,
        winterHardshipScore,
        landComponentCount,
        mainComponentShare,
        envTags,
        economyTags,
        hazardTags,
        cohesionTags,
        primaryArchetype,
        summary: summaryParts.join(" ")
      };
    }


    
function collectContainerDistributionsForGroup(group, containerSpecs) {
  // containers[keyName] = {
  //   total,
  //   counts: { id -> count },
  //   shares: { id -> fraction },
  //   dominantId,
  //   dominantShare
  // }
  const containers = {};

  for (const p of group.provinces) {
    const seed = seeds[p];
    if (!seed) continue;

    for (const spec of containerSpecs) {
      const { key, getter } = spec;
      const id = getIdFromSeed(seed, getter || key);
      if (id == null) continue;

      let bucket = containers[key];
      if (!bucket) {
        bucket = containers[key] = {
          total: 0,
          counts: Object.create(null)
        };
      }
      bucket.total++;
      bucket.counts[id] = (bucket.counts[id] || 0) + 1;
    }
  }

  for (const key in containers) {
    const bucket = containers[key];
    const { total, counts } = bucket;
    const shares = {};
    let domId = null;
    let domVal = -1;

    if (total > 0) {
      for (const cid in counts) {
        const v = counts[cid];
        const s = v / total;
        shares[cid] = s;
        if (s > domVal) {
          domVal = s;
          domId = cid;
        }
      }
    }
    bucket.shares = shares;
    bucket.dominantId = domId;
    bucket.dominantShare = domVal > 0 ? domVal : 0;
  }

  return containers;
}

/**
 * Add political/political-neighborhood awareness to a group.
 *
 * Requires:
 *   - group.provinces: array of province IDs
 *   - global seeds[p]: per-province data
 *   - global provAdj[p]: Set of neighboring province IDs
 *
 * opts:
 *   - sameScale: { key?: string, getter?: (seed)=>id }
 *       What "kind" this group is (e.g. cultureId, religionId, kingdomId).
 *   - containers: array of { key, getter? }    // higher-level buckets
 *   - affiliations: array of { key, getter? }  // lateral IDs (cultures in a kingdom, religions in a culture, etc.)
 */
function annotateGroupingWithPoliticalStats(group, opts = {}) {
  if (!group || !Array.isArray(group.provinces) || !group.provinces.length) {
    console.warn("annotateGroupingWithPoliticalStats: invalid group", group);
    return group;
  }
  if (!seeds || !seeds.length || !provAdj || !Array.isArray(provAdj)) {
    console.warn("annotateGroupingWithPoliticalStats: seeds/provAdj not ready");
    return group;
  }

  const {
    sameScale,
    containers: containerSpecs = [],
    affiliations: affiliationSpecs = []
  } = opts;

  if (!sameScale || (!sameScale.key && !sameScale.getter)) {
    console.warn("annotateGroupingWithPoliticalStats: missing sameScale spec");
    return group;
  }

  const provIds = group.provinces;
  const totalProv = provIds.length || 1;

  // 1) Realm containers (kingdom, empire, etc.)
  const containers = collectContainerDistributionsForGroup(group, containerSpecs);

  const kingdomStats = containers.kingdomId || null;
  const empireStats  = containers.empireId  || null;

  const primaryKingdomId    = kingdomStats?.dominantId ?? null;
  const primaryKingdomShare = kingdomStats?.dominantShare ?? 0;
  const primaryEmpireId     = empireStats?.dominantId ?? null;
  const primaryEmpireShare  = empireStats?.dominantShare ?? 0;

  // 2) Same-scale neighbors (e.g. cultures that border this culture)
  const sameScaleNeighborCounts = Object.create(null);
  let borderProvinceCount = 0;
  let borderExposureSum   = 0; // avg fraction of neighbors that are "other"

  // Lateral neighbors (religions bordering a culture, cultures inside a kingdom, etc.)
  const lateralNeighborCounts = {};
  for (const spec of affiliationSpecs) {
    lateralNeighborCounts[spec.key] = Object.create(null);
  }

  // Determine this group's own ID (e.g. cultureId)
  let selfId = null;
  for (const p of provIds) {
    const seed = seeds[p];
    if (!seed) continue;
    const id = getIdFromSeed(seed, sameScale.getter || sameScale.key);
    if (id != null) {
      selfId = id;
      break;
    }
  }

  // Walk borders via province adjacency
  for (const p of provIds) {
    const seed = seeds[p];
    if (!seed) continue;

    const neighbors = provAdj[p];
    if (!neighbors || neighbors.size === 0) continue;

    let sameCount = 0;
    let otherCount = 0;
    let isBorder = false;

    for (const q of neighbors) {
      const ns = seeds[q];
      if (!ns) continue;

      // Same-scale neighbor identity
      const theirId = getIdFromSeed(ns, sameScale.getter || sameScale.key);

      if (theirId == null || theirId === selfId) {
        sameCount++;
      } else {
        otherCount++;
        isBorder = true;
        sameScaleNeighborCounts[theirId] =
          (sameScaleNeighborCounts[theirId] || 0) + 1;
      }

      // Lateral neighbor IDs
      for (const spec of affiliationSpecs) {
        const lateralStore = lateralNeighborCounts[spec.key];
        const v = getIdFromSeed(ns, spec.getter || spec.key);
        if (v == null) continue;
        lateralStore[v] = (lateralStore[v] || 0) + 1;
      }
    }

    if (isBorder) {
      borderProvinceCount++;
      const denom = sameCount + otherCount || 1;
      borderExposureSum += otherCount / denom; // 0..1
    }
  }

  const meanBorderExposure = borderProvinceCount
    ? borderExposureSum / borderProvinceCount
    : 0;

  // Convert neighbor counts to shares
  const sameScaleNeighborInfo = normalizeCounts(sameScaleNeighborCounts);

  const lateralNeighborInfo = {};
  for (const spec of affiliationSpecs) {
    lateralNeighborInfo[spec.key] =
      normalizeCounts(lateralNeighborCounts[spec.key]);
  }

  // Diversity of neighbors (0 = single neighbor, →1 = many)
  let neighborDiversity = 0;
  {
    const s = sameScaleNeighborInfo.shares;
    let sumSq = 0;
    for (const k in s) {
      const v = s[k];
      if (v > 0) sumSq += v * v;
    }
    neighborDiversity = 1 - sumSq;
  }

  const neighborCount = Object.keys(sameScaleNeighborInfo.counts).length;

  // 3) Realm dispersion / frontier tags
  const realmDispersionScore = (() => {
    const kStats = kingdomStats;
    if (!kStats || kStats.total <= 0) return 0;
    const s = kStats.shares;
    let sumSq = 0;
    for (const k in s) {
      const v = s[k];
      if (v > 0) sumSq += v * v;
    }
    return 1 - sumSq; // 0 = mono-realm, →1 = evenly scattered
  })();

  const isMonoRealmCore  = primaryKingdomShare >= 0.8 && realmDispersionScore < 0.3;
  const isMultiRealm     = realmDispersionScore >= 0.5;
  const isHighlyFrontier = meanBorderExposure > 0.5 && neighborCount >= 3;
  const isBorderCulture  = meanBorderExposure > 0.3 && (borderProvinceCount / totalProv) > 0.3;

  const politicalTags = [];
  if (isMonoRealmCore)  politicalTags.push("mono-realm-core");
  if (isMultiRealm)     politicalTags.push("multi-realm-diaspora");
  if (isHighlyFrontier) politicalTags.push("high-frontier-group");
  if (isBorderCulture)  politicalTags.push("border-exposed");

  if (neighborCount === 0)      politicalTags.push("isolated");
  else if (neighborCount === 1) politicalTags.push("single-neighbor");
  else if (neighborCount >= 4)  politicalTags.push("multi-frontier");

  // 4) Natural language summary
  function pct(x) { return Math.round(x * 100); }

  const summaryParts = [];

  if (kingdomStats && kingdomStats.total > 0) {
    const kEntries = Object.entries(kingdomStats.shares)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, v]) => `${id} (${pct(v)}%)`);
    summaryParts.push(
      `Politically, this group lives mainly in kingdom(s): ${kEntries.join(", ")}.`
    );
  }

  if (empireStats && empireStats.total > 0) {
    const eEntries = Object.entries(empireStats.shares)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, v]) => `${id} (${pct(v)}%)`);
    summaryParts.push(
      `At the imperial level, distribution is: ${eEntries.join(", ")}.`
    );
  }

  if (neighborCount > 0) {
    const topNeighbors = Object.entries(sameScaleNeighborInfo.shares)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, v]) => `${id} (${pct(v)}% of border contacts)`);

    const label = sameScale.key || "group";
    summaryParts.push(
      `It borders ${neighborCount} other ${label}(s), with main neighbors: ${topNeighbors.join(", ")}.`
    );
  } else {
    const label = sameScale.key || "group";
    summaryParts.push(
      `It is effectively isolated from other ${label}s (no land borders).`
    );
  }

  summaryParts.push(
    `Mean border exposure is ${meanBorderExposure.toFixed(2)} on ${borderProvinceCount} border provinces (out of ${totalProv}).`
  );

  if (realmDispersionScore < 0.25) {
    summaryParts.push(
      "Most of its area lies under a single crown, giving it a strong single-realm identity."
    );
  } else if (realmDispersionScore > 0.6) {
    summaryParts.push(
      "Its territory is spread across multiple crowns, suggesting a diasporic or partitioned history."
    );
  }

  if (neighborDiversity > 0.5) {
    summaryParts.push(
      "The variety of neighboring groups is high, implying a complex, multi-frontier political environment."
    );
  }

  // Attach
  if (!group.geoStats) group.geoStats = {};
  group.geoStats.political = {
    sameScale,
    containers,
    primaryKingdomId,
    primaryKingdomShare,
    primaryEmpireId,
    primaryEmpireShare,
    sameScaleNeighbors: {
      neighborCounts: sameScaleNeighborInfo.counts,
      neighborShares: sameScaleNeighborInfo.shares,
      neighborCount,
      neighborDiversity
    },
    lateralNeighbors: lateralNeighborInfo,
    border: {
      borderProvinceCount,
      meanBorderExposure
    },
    realmDispersionScore,
    politicalTags,
    summary: summaryParts.join(" ")
  };

  return group;
}


//STARTED HERE ON NEW STUFF

function summarizeChildProvinceSizes(children) {
  if (!children || !children.length) {
    return {
      count: 0,
      min: 0,
      max: 0,
      mean: 0,
      stdDev: 0
    };
  }

  const sizes = [];
  for (const ch of children) {
    if (!ch) continue;
    if (Array.isArray(ch.provinces)) {
      sizes.push(ch.provinces.length);
    } else if (Array.isArray(ch.children)) {
      // for counties, children are seeds (provinces)
      sizes.push(ch.children.length);
    } else {
      sizes.push(0);
    }
  }

  if (!sizes.length) {
    return {
      count: 0,
      min: 0,
      max: 0,
      mean: 0,
      stdDev: 0
    };
  }

  let min = Infinity, max = -Infinity, sum = 0, sumSq = 0;
  for (const v of sizes) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    sumSq += v * v;
  }
  const n = sizes.length;
  const mean = sum / n;
  const var_ = sumSq / n - mean * mean;
  const stdDev = var_ > 0 ? Math.sqrt(var_) : 0;

  return { count: n, min, max, mean, stdDev };
}


function annotateAllTitles(worldTitles) {
  if (!worldTitles) {
    console.warn("annotateAllTitles: worldTitles is null/undefined.");
    return;
  }
  if (!Array.isArray(seeds) || !seeds.length) {
    console.warn("annotateAllTitles: seeds not ready.");
    return;
  }

  // Map title type -> array key in worldTitles
  const ARR_KEY = {
    empire:  "empires",
    kingdom: "kingdoms",
    duchy:   "duchies",
    county:  "counties"
  };

  // Build a quick lookup from (type, index) -> node
  const titleIndexLookup = {};
  for (const type of ["empire","kingdom","duchy","county"]) {
    const key = ARR_KEY[type];
    const arr = worldTitles[key] || [];
    for (let i = 0; i < arr.length; i++) {
      const node = arr[i];
      if (!node) continue;
      if (!titleIndexLookup[type]) titleIndexLookup[type] = [];
      titleIndexLookup[type][i] = node;
    }
  }

  function findParentNode(node) {
    if (!node || !node.parentType) return null;
    const list = titleIndexLookup[node.parentType] || [];
    return list[node.parentIndex] || null;
  }

  function hierarchyPath(node) {
    const path = [];
    let cur = node;
    while (cur) {
      path.unshift({
        type: cur.type,
        id: cur.id,
        index: cur.index
      });
      cur = findParentNode(cur);
    }
    return path;
  }

  // Container specs for distributions inside titles
  const BASE_CONTAINER_SPECS = [
    { key: "empireId"   },
    { key: "kingdomId"  },
    { key: "duchyId"    },
    { key: "countyId"   }
  ];

  // What kind of same-scale and affiliations each title type should use
  function politicalOptsForTitle(node) {
    switch (node.type) {
      case "empire":
        return {
          sameScale: { key: "empireId" },
          containers: [],  // empire is top-level
          affiliations: [
            { key: "cultureId"   },
            { key: "heritageId"  },
            { key: "religionId"  },
            { key: "faithId"     }
          ]
        };
      case "kingdom":
        return {
          sameScale: { key: "kingdomId" },
          containers: [
            { key: "empireId" }
          ],
          affiliations: [
            { key: "cultureId"   },
            { key: "heritageId"  },
            { key: "religionId"  },
            { key: "faithId"     }
          ]
        };
      case "duchy":
        return {
          sameScale: { key: "duchyId" },
          containers: [
            { key: "kingdomId" },
            { key: "empireId"  }
          ],
          affiliations: [
            { key: "cultureId"   },
            { key: "heritageId"  },
            { key: "religionId"  },
            { key: "faithId"     }
          ]
        };
      case "county":
        return {
          sameScale: { key: "countyId" },
          containers: [
            { key: "duchyId"   },
            { key: "kingdomId" },
            { key: "empireId"  }
          ],
          affiliations: [
            { key: "cultureId"   },
            { key: "heritageId"  },
            { key: "religionId"  },
            { key: "faithId"     }
          ]
        };
      default:
        return null;
    }
  }

  // Convenience wrapper around your collectContainerDistributionsForGroup
  function collectInternalCulturalStats(node) {
    if (!node || !Array.isArray(node.provinces) || !node.provinces.length) {
      return null;
    }
    // Focus on internal “identity” buckets
    const specs = [
      { key: "cultureId"   },
      { key: "heritageId"  },
      { key: "religionId"  },
      { key: "faithId"     }
    ];
    return collectContainerDistributionsForGroup(node, specs);
  }

  function pct(x) { return Math.round(x * 100); }

  // --- main loop over all title types ---------------------------------------
  for (const type of ["empire","kingdom","duchy","county"]) {
    const arrKey = ARR_KEY[type];
    const arr    = worldTitles[arrKey] || [];

    for (const node of arr) {
      if (!node || !Array.isArray(node.provinces) || !node.provinces.length) continue;

      // 1) Geo stats + extended inferences
      annotateGroupingWithGeoStats(node);
      deriveExtendedGeoInferences(node);

      // 2) Political stats at the title scale
      const polOpts = politicalOptsForTitle(node);
      if (polOpts) {
        annotateGroupingWithPoliticalStats(node, polOpts);
      }

      const gs = node.geoStats || {};

      // 3) Hierarchy info
      const parent = findParentNode(node);
      const path   = hierarchyPath(node);

      const parentProvCount = (parent && Array.isArray(parent.provinces))
        ? parent.provinces.length
        : null;

      const selfProvCount   = Array.isArray(node.provinces) ? node.provinces.length : 0;
      const shareOfParent   =
        parentProvCount && parentProvCount > 0
          ? selfProvCount / parentProvCount
          : null;

      const childStats = summarizeChildProvinceSizes(node.children || []);

      // 4) Internal cultural/religious composition
      const internalIdentities = collectInternalCulturalStats(node) || {};
      const cultureStats  = internalIdentities.cultureId  || null;
      const religionStats = internalIdentities.religionId || null;
      const faithStats    = internalIdentities.faithId    || null;
      const heritageStats = internalIdentities.heritageId || null;

      // 5) Build a title-focused summary sentence
      const levelName = node.type;
      const totalProv = gs.totalProvinces || selfProvCount || 0;
      const sizeLabel = (() => {
        if (totalProv >= 200) return "very large";
        if (totalProv >= 80)  return "large";
        if (totalProv >= 30)  return "medium-sized";
        if (totalProv >= 10)  return "small";
        return "very small";
      })();

      const primaryCulture =
        cultureStats && cultureStats.dominantId
          ? `${cultureStats.dominantId} (${pct(cultureStats.dominantShare || 0)}%)`
          : null;

      const primaryReligion =
        religionStats && religionStats.dominantId
          ? `${religionStats.dominantId} (${pct(religionStats.dominantShare || 0)}%)`
          : null;

      const archetype         = gs.extended?.primaryArchetype || "mixed-terrain";
      const climateGroup      = gs.dominantKoppenGroup || null;
      const politicalTags     = gs.political?.politicalTags || [];
      const envTags           = gs.extended?.envTags || [];
      const economyTags       = gs.extended?.economyTags || [];
      const hazardTags        = gs.extended?.hazardTags || [];

      const summaryParts = [];

      summaryParts.push(
        `This ${sizeLabel} ${levelName} covers ${totalProv} province(s) and is classified as a ` +
        `"${archetype}" region.`
      );

      if (climateGroup) {
        summaryParts.push(
          `Dominant climate group is ${climateGroup} (Köppen letter).`
        );
      }

      if (primaryCulture) {
        summaryParts.push(`Primary culture: ${primaryCulture}.`);
      }
      if (primaryReligion) {
        summaryParts.push(`Primary religion: ${primaryReligion}.`);
      }

      if (shareOfParent != null && parent) {
        summaryParts.push(
          `It represents about ${pct(shareOfParent)}% of its parent ${parent.type} (${parent.id}).`
        );
      }

      if (childStats.count > 0 && node.type !== "county") {
        const childLabel =
          node.type === "empire"  ? "kingdoms" :
          node.type === "kingdom" ? "duchies"  :
          node.type === "duchy"   ? "counties" :
          "subdivisions";

        summaryParts.push(
          `Internally it is divided into ${childStats.count} ${childLabel} ` +
          `(min ${childStats.min}, max ${childStats.max}, mean ${childStats.mean.toFixed(1)} provinces).`
        );
      } else if (node.type === "county") {
        summaryParts.push(
          `This county directly contains ${selfProvCount} province(s).`
        );
      }

      if (envTags && envTags.length) {
        summaryParts.push(`Environment tags: ${envTags.join(", ")}.`);
      }
      if (economyTags && economyTags.length) {
        summaryParts.push(`Economic potential tags: ${economyTags.join(", ")}.`);
      }
      if (hazardTags && hazardTags.length) {
        summaryParts.push(`Hazard tags: ${hazardTags.join(", ")}.`);
      }
      if (politicalTags && politicalTags.length) {
        summaryParts.push(`Political-structure tags: ${politicalTags.join(", ")}.`);
      }

      // 6) Attach title-specific stats
      node.titleStats = {
        level: node.type,
        id: node.id,
        index: node.index,

        parentType: parent ? parent.type  : null,
        parentId:   parent ? parent.id    : null,
        parentIndex: parent ? parent.index : -1,

        path: hierarchyPath(node),

        provinceCount: selfProvCount,
        shareOfParent,

        childStats,           // subdivision size distribution
        internalIdentities,   // culture/religion/faith/heritage distributions

        summary: summaryParts.join(" ")
      };
    }
  }

  return worldTitles;
}


/**
 * Annotate each county with a canonical faithKey (and faithIndex),
 * derived from the county's capital province.
 *
 * REQUIREMENTS:
 * - provToCounty[p] exists
 * - provToFaith[p] OR seeds[p].faithIndex exists
 * - worldFaiths[] exists (recommended)
 * - seeds[p].isLand used to filter land provinces
 */
function annotateCountiesWithFaith(counties){
  if (!counties || !Array.isArray(counties)) {
    console.warn('annotateCountiesWithFaith: invalid counties array');
    return;
  }
  if (!provToCounty) {
    console.warn('annotateCountiesWithFaith: provToCounty missing');
    return;
  }

  // --- build county -> [seed indices] ---
  const countyToSeeds = new Map();

  for (let p = 0; p < seeds.length; p++) {
    if (!seeds[p]?.isLand) continue;

    const cid = provToCounty[p];
    if (cid == null || cid < 0) continue;

    if (!countyToSeeds.has(cid)) countyToSeeds.set(cid, []);
    countyToSeeds.get(cid).push(p);
  }

  // --- determine capital + faith ---
  for (const [cid, provSeeds] of countyToSeeds.entries()) {
    if (!provSeeds.length || !counties[cid]) continue;

    // Capital province = lowest province ID (definition.csv ordering)
    provSeeds.sort((a, b) => a - b);
    const pSeed = provSeeds[0];

    // --- derive faith index ---
    let fIdx = -1;

    if (typeof provToFaith !== 'undefined' && provToFaith) {
      fIdx = provToFaith[pSeed] ?? -1;
    } else if (seeds[pSeed] && typeof seeds[pSeed].faithIndex === 'number') {
      fIdx = seeds[pSeed].faithIndex;
    }

    // --- resolve faith key ---
    let faithKey = 'generic_faith';

    if (fIdx >= 0 && Array.isArray(worldFaiths) && worldFaiths[fIdx]) {
      const f = worldFaiths[fIdx];
      faithKey = f.id || f.key || `faith_${fIdx}`;
    } else if (fIdx >= 0) {
      faithKey = `faith_${fIdx}`;
    }

    // --- store canonically on county ---
    const county = counties[cid];
    county.faithIndex = fIdx;
    county.faithKey   = faithKey;
  }

  console.log(`annotateCountiesWithFaith: annotated ${countyToSeeds.size} counties`);
}


function buildRawProvAdjFromLabel(label, W, H, nProvs) {
  const adjSets = Array.from({ length: nProvs }, () => new Set());
  const idx = (x, y) => y * W + x;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = label[idx(x, y)];
      if (a < 0) continue;

      if (x + 1 < W) {
        const b = label[idx(x + 1, y)];
        if (b >= 0 && b !== a) { adjSets[a].add(b); adjSets[b].add(a); }
      }
      if (y + 1 < H) {
        const b = label[idx(x, y + 1)];
        if (b >= 0 && b !== a) { adjSets[a].add(b); adjSets[b].add(a); }
      }
    }
  }
  return adjSets.map(s => Array.from(s));
}

function annotateWaterTypes_BFSWaterbodies({
  seeds,
  label,
  W,
  H,
  provIsLand = null,

  // ocean selection:
  oceanRel = 0.20,      // comps >= largest*oceanRel are ocean too
  oceanAbsMin = 50,     // comps >= this can be ocean
  oceanCoverFrac = 0.0, // optional: mark biggest comps until covering X of all water

  // river thinness:
  thinAspect = 7.0,
  thinFillMax = 0.22,
  minRiverArea = 20,
} = {}) {
  if (!seeds || !label || !W || !H) {
    console.warn("annotateWaterTypes: missing required inputs");
    return { sea:0, coastal_sea:0, river:0, lake:0 };
  }

  const Np = seeds.length;
  const isLand = provIsLand ? (i)=>!!provIsLand[i] : (i)=>!!seeds[i].isLand;
  const isWater = (i)=>!isLand(i);

  // --- raster stats: area + bbox (for thinness) ---
  const area = new Int32Array(Np);
  const minX = new Int32Array(Np).fill( 1e9);
  const minY = new Int32Array(Np).fill( 1e9);
  const maxX = new Int32Array(Np).fill(-1e9);
  const maxY = new Int32Array(Np).fill(-1e9);

  for (let y=0; y<H; y++){
    const row = y*W;
    for (let x=0; x<W; x++){
      const p = label[row+x];
      if (p < 0 || p >= Np) continue;
      area[p]++;
      if (x < minX[p]) minX[p] = x;
      if (x > maxX[p]) maxX[p] = x;
      if (y < minY[p]) minY[p] = y;
      if (y > maxY[p]) maxY[p] = y;
    }
  }

  const rawAdj = buildRawProvAdjFromLabel(label, W, H, Np);

  function hasLandNeighbor(p){
    for (const q of rawAdj[p]) if (q>=0 && q<Np && isLand(q)) return true;
    return false;
  }

  function isThinWater(p){
    if (!isWater(p)) return false;
    if (area[p] < minRiverArea) return false;

    const w = Math.max(1, maxX[p]-minX[p]+1);
    const h = Math.max(1, maxY[p]-minY[p]+1);
    const longSide = Math.max(w,h);
    const shortSide = Math.max(1, Math.min(w,h));
    const aspect = longSide / shortSide;

    const bboxArea = w*h;
    const fill = bboxArea>0 ? area[p]/bboxArea : 1;

    return (aspect >= thinAspect) && (fill <= thinFillMax);
  }

  // --- BFS waterbodies (components over rawAdj restricted to water) ---
  const waterComp = new Int32Array(Np).fill(-1);
  const compSize = [];
  let compCount = 0;
  let totalWater = 0;

  for (let p=0; p<Np; p++) if (isWater(p)) totalWater++;

  for (let p=0; p<Np; p++){
    if (!isWater(p) || waterComp[p] !== -1) continue;

    const stack = [p];
    waterComp[p] = compCount;
    let size = 0;

    while (stack.length){
      const a = stack.pop();
      size++;
      for (const b of rawAdj[a]){
        if (b<0 || b>=Np) continue;
        if (!isWater(b)) continue;
        if (waterComp[b] !== -1) continue;
        waterComp[b] = compCount;
        stack.push(b);
      }
    }

    compSize[compCount] = size;
    compCount++;
  }

  // --- choose which components are "ocean" robustly ---
  const isOceanComp = new Uint8Array(compCount);

  let largest = 0, largestId = -1;
  for (let c=0; c<compCount; c++){
    if (compSize[c] > largest){ largest = compSize[c]; largestId = c; }
  }

  if (largestId !== -1) isOceanComp[largestId] = 1;

  const relThresh = Math.max(oceanAbsMin, Math.floor(largest * oceanRel));
  for (let c=0; c<compCount; c++){
    if (compSize[c] >= relThresh) isOceanComp[c] = 1;
  }

  if (oceanCoverFrac > 0 && totalWater > 0){
    const order = [];
    for (let c=0; c<compCount; c++) order.push(c);
    order.sort((a,b)=>compSize[b]-compSize[a]);

    let covered = 0;
    const target = totalWater * oceanCoverFrac;
    for (const c of order){
      if (covered >= target) break;
      isOceanComp[c] = 1;
      covered += compSize[c];
    }
  }

  console.log("waterbody debug:", { totalWater, compCount, largest, largestId, relThresh });

  // --- classify provinces ---
  const counts = { sea:0, coastal_sea:0, river:0, lake:0 };

  for (let p=0; p<Np; p++){
    if (!isWater(p)) continue;

    const thin = isThinWater(p);
    const coastal = hasLandNeighbor(p);
    const comp = waterComp[p];
    const ocean = (comp>=0 && comp<compCount) ? !!isOceanComp[comp] : false;

    let t;
    if (thin) t = "river";
    else if (ocean) t = coastal ? "coastal_sea" : "sea";
    else t = "lake";

    seeds[p].waterType = t;
    counts[t]++;
  }
  console.log(counts)
  return counts;
}

// Build raw adjacency (geometric contact) from your label raster.
// Use this adjacency for water typing.
function buildRawProvAdjFromLabel(label, W, H, nProvs) {
  const adjSets = Array.from({ length: nProvs }, () => new Set());
  for (let y = 0; y < H; y++) {
    const row = y * W;
    for (let x = 0; x < W; x++) {
      const a = label[row + x];
      if (a < 0) continue;

      if (x + 1 < W) {
        const b = label[row + x + 1];
        if (b >= 0 && b !== a) { adjSets[a].add(b); adjSets[b].add(a); }
      }
      if (y + 1 < H) {
        const b = label[row + x + W];
        if (b >= 0 && b !== a) { adjSets[a].add(b); adjSets[b].add(a); }
      }
    }
  }
  return adjSets.map(s => Array.from(s));
}