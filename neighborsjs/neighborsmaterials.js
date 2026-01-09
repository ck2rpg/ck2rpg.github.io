function assignMaterials() {
    for (let i = 0; i < window.provinces.length; i++) {
      const prov = window.provinces[i];
      if (!prov || !prov.isLand) continue;
      prov.materials = {}
      prov.innovations = {}
      elmPossibleInProvince(prov);
      walnutPossibleInProvince(prov);
      maplePossibleInProvince(prov);
      pineFirPossibleInProvince(prov);
      subsaharanWoodsPossibleInProvince(prov);
      padaukPossibleInProvince(prov);
      indiaWoodsPossibleInProvince(prov)
      indiaBurmaWoodsPossibleInProvince(prov);
      ebonyPossibleInProvince(prov);
      yewPossibleInProvince(prov);
      cherryPossibleInProvince(prov);
      dogwoodPossibleInProvince(prov);
      hazelPossibleInProvince(prov);
      hickoryPossibleInProvince(prov);
      palmPossibleInProvince(prov)
      mulberryPossibleInProvince(prov);
      mediterraneanWoodsPossibleInProvince(prov);
      sriLankaWoodsPossibleInProvince(prov);
      eastAsiaWoodsPossibleInProvince(prov);
      southeastAsiaWoodsPossibleInProvince(prov);
      northeastAsiaWoodsPossibleInProvince(prov);
      elephantsPossibleInProvince(prov);
      camelsPossibleInProvince(prov);
      horseBuildingsHillsMountainsPossibleInProvince(prov);
      assignHuntAnimals(prov);
    }
}



/**
 * Elm plausibility check for a province.
 * Assumptions:
 * - Elm (Ulmus) is most plausible in temperate climates with some moisture.
 * - Excludes polar (E), true deserts (BW), extreme alpine/high-elevation, and very wet tropical rainforest (Af).
 * - Allows many C climates, some D climates (esp. Dfa/Dfb/Dwa/Dwb), and some B steppe (BS*) if not too dry/hot.
 *
 * Returns:
 *   { ok:boolean, score:number(0..1), reasons:string[], flags:object }
 */
function elmPossibleInProvince(prov, opts = {}) {
  const o = {
    // Elevation: above this becomes increasingly implausible for elm as a dominant/native tree
    maxElevM: 2200,        // hard-ish cutoff (tune)
    softElevM: 1600,       // above this we start penalizing
    // Slope/ruggedness: elm prefers valley bottoms / low-to-moderate slopes; still can exist, but less likely as "province tree"
    maxSlopeMeanDeg: 18,   // above this we penalize
    // If you want coastal moderation to help a bit:
    coastalBonus: 0.05,
    // If arability proxy is available and 0, we penalize a bit (elm less likely in bare rock/alpine)
    arabilityPenaltyIfZero: 0.10,
    // Treat these terrains as generally implausible for elm to be “present”
    badTerrains: new Set(["glacier", "ice", "desert", "dunes", "badlands", "volcanic", "lava"]),
    // Treat these terrains as “possible but needs climate to agree”
    highRiskTerrains: new Set(["mountains", "highlands"]),
    ...opts
  };

  const reasons = [];
  const flags = {
    koppen: prov?.koppenCode || prov?.koppenGroup || null,
    elevM: prov?.elevM ?? null,
    terrain: prov?.terrainResolved || null
  };

  // Basic land gate
  if (!prov || !prov.isLand || prov.effIsLand === 0) {
    return { ok: false, score: 0, reasons: ["Not land."], flags };
  }

  const koppenCode = (prov.koppenCode || "").toUpperCase();   // e.g. "CFA"
  const koppenGroup = (prov.koppenGroup || "").toUpperCase(); // e.g. "C"
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions (fast fail) ---
  // Polar climates: EF/ET or any group E
  if (koppenGroup === "E" || koppenCode.startsWith("E")) {
    return { ok: false, score: 0, reasons: ["Polar Köppen (E): elm implausible."], flags };
  }

  // True deserts: BW (hot or cold desert)
  if (koppenCode.startsWith("BW")) {
    return { ok: false, score: 0, reasons: ["Desert Köppen (BW): elm implausible."], flags };
  }

  // Very wet tropical rainforest tends to be wrong biome for elm
  if (koppenCode === "AF") {
    return { ok: false, score: 0, reasons: ["Tropical rainforest (Af): elm unlikely."], flags };
  }

  // Terrain-based hard exclusions
  if (o.badTerrains.has(terrain)) {
    return { ok: false, score: 0, reasons: [`Terrain '${terrain}' is incompatible.`], flags };
  }

  // Elevation hard gate (extreme alpine)
  if (elevM != null && elevM > o.maxElevM) {
    return { ok: false, score: 0, reasons: [`Elevation ${Math.round(elevM)}m too high for elm.`], flags };
  }

  // --- Scoring (0..1) ---
  let score = 0.6; // start at "maybe" and push it around

  // Köppen suitability
  // Best: C (temperate) + humid variants, decent: some D (continental), weak: steppe BS, poor: tropical Aw/Am
  if (koppenCode.startsWith("C")) {
    score += 0.25;
    // Mediterranean (Cs*) can still have elm in riparian zones; small penalty
    if (koppenCode.startsWith("CS")) score -= 0.05;
  } else if (koppenCode.startsWith("D")) {
    score += 0.15;
    // Very harsh subarctic (Dfc/Dfd/Dsc/Dsd) less likely
    if (/^D[FS]D|^D[FS]C/.test(koppenCode)) score -= 0.20; // catches Dfc/Dfd etc
  } else if (koppenCode.startsWith("BS")) {
    // Steppe: elm possible near rivers / wetter pockets; keep it low but not zero
    score -= 0.10;
    // Cold steppe (BSk) more plausible than hot steppe (BSh) for temperate elm
    if (koppenCode === "BSK") score += 0.05;
    if (koppenCode === "BSH") score -= 0.05;
  } else if (koppenCode.startsWith("A")) {
    // Tropical: elm generally unlikely (except planted or niche highlands)
    score -= 0.25;
    if (koppenCode === "AM" || koppenCode === "AW") score -= 0.05;
  } else {
    // Unknown / missing Köppen: stay conservative
    score -= 0.10;
    reasons.push("Köppen missing/unknown: conservative penalty.");
  }

  // Terrain adjustments
  if (o.highRiskTerrains.has(terrain)) {
    score -= 0.10;
    reasons.push(`Terrain '${terrain}' reduces elm likelihood (more alpine/rocky).`);
  }

  // Elevation soft penalty (valley tree vs alpine)
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM); // 0..1
    score -= 0.25 * Math.max(0, Math.min(1, t));
    reasons.push(`High elevation (${Math.round(elevM)}m) penalizes elm.`);
  }

  // Slope penalty
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 12); // scale after threshold
    score -= 0.15 * t;
    reasons.push(`Steep mean slope (${slopeMean.toFixed(1)}°) penalizes elm.`);
  }

  // Ruggedness/arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null && ar <= 0) {
    score -= o.arabilityPenaltyIfZero;
    reasons.push("Arability proxy is 0 (very rugged/bare): penalizes elm.");
  }

  // Coastal moderation bonus (optional small bump)
  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp
  score = Math.max(0, Math.min(1, score));

  // Decide: require both a decent score and not obviously contradictory signals
  const ok = score >= 0.55;

  // If it failed, add a summary reason
  if (!ok && reasons.length === 0) reasons.push("Overall suitability below threshold.");
  prov.materials.elm = score;
  //return { ok, score, reasons, flags };
}

/**
 * Walnut (Juglans) plausibility check for a province.
 * Writes prov.materials.walnut = score (0..1).
 *
 * Heuristic:
 * - Best: warm/temperate C climates (Cfa/Cfb/Cwa/Cwb) and Mediterranean (Csa/Csb) in lower elevations.
 * - Decent: some continental D climates (Dfa/Dfb/Dwa/Dwb), but penalize subarctic.
 * - Weak: steppe (BSk/BSh) only in riparian pockets -> low score.
 * - Poor: tropical (A*) generally unlikely (except highland-ish Cwb occurs as C not A).
 * - Exclude: polar (E*), deserts (BW*), tropical rainforest (Af), extreme elevation/alpine.
 */
function walnutPossibleInProvince(prov, opts = {}) {
  const o = {
    // Walnut is more lowland-biased than elm
    maxElevM: 1800,        // hard-ish cutoff
    softElevM: 900,        // start penalizing above this
    // Walnut likes gentler terrain / soils
    maxSlopeMeanDeg: 14,   // above this penalize
    // Arability proxy matters more for walnut
    arabilityPenaltyIfZero: 0.18,
    arabilityBonusIfHigh: 0.08,   // if you have arability01_fromRuggedness near 1
    // Terrain filters
    badTerrains: new Set(["glacier", "ice", "desert", "dunes", "badlands", "volcanic", "lava"]),
    highRiskTerrains: new Set(["mountains", "highlands"]),
    // Optional climate fine-tuning
    mediterraneanPenalty: 0.06, // summer-dry: still plausible, but a touch less than humid temperate
    steppePenalty: 0.18,
    tropicalPenalty: 0.30,
    coastalBonus: 0.03,
    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;

  const koppenCode = (prov.koppenCode || "").toUpperCase();   // e.g. "CFA"
  const koppenGroup = (prov.koppenGroup || "").toUpperCase(); // e.g. "C"
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.walnut = 0; return; } // polar
  if (koppenCode.startsWith("BW")) { prov.materials.walnut = 0; return; } // desert
  if (koppenCode === "AF") { prov.materials.walnut = 0; return; } // tropical rainforest
  if (o.badTerrains.has(terrain)) { prov.materials.walnut = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.walnut = 0; return; }

  // --- Score ---
  let score = 0.55; // slightly conservative baseline

  // Köppen suitability
  if (koppenCode.startsWith("C")) {
    score += 0.28;

    // Mediterranean (Csa/Csb): walnut can do well, but summer drought can limit without rivers/irrigation
    if (koppenCode.startsWith("CS")) score -= o.mediterraneanPenalty;

    // Cooler oceanic (Cfc) or rare edge cases: slightly less ideal
    if (koppenCode === "CFC") score -= 0.10;
  } else if (koppenCode.startsWith("D")) {
    score += 0.10;

    // Favor warmer continental types more than harsh ones
    // Dfa/Dfb/Dwa/Dwb are okay; Dfc/Dfd etc are bad for walnut
    if (/^DF[AB]$|^DW[AB]$/.test(koppenCode)) score += 0.05; // mild bump for the "good" D types
    if (/^D[FS][CD]$/.test(koppenCode) || /^D[FS]C/.test(koppenCode)) score -= 0.28; // subarctic-ish
  } else if (koppenCode.startsWith("BS")) {
    // Steppe: walnut possible only as riparian / pockets -> keep low
    score -= o.steppePenalty;
    if (koppenCode === "BSK") score += 0.03; // cold steppe slightly more plausible than hot
    if (koppenCode === "BSH") score -= 0.05;
  } else if (koppenCode.startsWith("A")) {
    // Tropical climates generally not walnut territory
    score -= o.tropicalPenalty;
  } else {
    // Unknown/missing: conservative
    score -= 0.10;
  }

  // Terrain adjustments
  if (o.highRiskTerrains.has(terrain)) score -= 0.14;

  // Elevation penalty (walnut more sensitive)
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM); // 0..1
    score -= 0.35 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (soil depth / farming proxy)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 10);
    score -= 0.18 * t;
  }

  // Ruggedness/arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  // Coastal moderation (small)
  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.walnut = score;
}

/**
 * Maple (Acer) plausibility check for a province.
 * Writes prov.materials.maple = score (0..1).
 *
 * Heuristic:
 * - Best: temperate C climates (Cfa/Cfb/Cwa/Cwb) and many continental D climates (Dfa/Dfb/Dwa/Dwb).
 * - Decent: cooler/colder edges (ET is excluded; Dfc etc allowed but penalized).
 * - Weak: steppe (BS*) only in wetter pockets -> low score.
 * - Poor: tropical (A*) generally unlikely; rainforest (Af) excluded.
 * - Exclude: polar (E*), deserts (BW*), extreme elevation/alpine, very incompatible terrains.
 */
function maplePossibleInProvince(prov, opts = {}) {
  const o = {
    // Maples tolerate higher elevation than walnut, but not extreme alpine
    maxElevM: 2400,
    softElevM: 1400,

    // Maples can handle moderate slopes; still penalize very steep terrain
    maxSlopeMeanDeg: 18,

    // Arability proxy matters, but less than walnut (maples can be in rocky forests)
    arabilityPenaltyIfZero: 0.10,
    arabilityBonusIfHigh: 0.05,

    badTerrains: new Set(["glacier", "ice", "desert", "dunes", "badlands", "volcanic", "lava"]),
    highRiskTerrains: new Set(["mountains", "highlands"]),

    // Climate tuning
    mediterraneanPenalty: 0.08, // summer-dry can work (esp. montane), but less ideal
    steppePenalty: 0.12,        // some maple in riparian zones; still low
    tropicalPenalty: 0.22,      // mostly wrong biome (except highlands which usually map to Cwb)
    coastalBonus: 0.03,

    // Extra: reward "cool/cold" climates slightly (maple likes cool temperate / continental)
    coolClimateBonus: 0.06,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.maple = 0; return; } // EF/ET etc
  if (koppenCode.startsWith("BW")) { prov.materials.maple = 0; return; } // desert
  if (koppenCode === "AF") { prov.materials.maple = 0; return; } // rainforest
  if (o.badTerrains.has(terrain)) { prov.materials.maple = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.maple = 0; return; }

  // --- Score ---
  let score = 0.58; // maple is fairly common across temperate regions

  // Köppen suitability
  if (koppenCode.startsWith("C")) {
    score += 0.22;

    // Mediterranean (Cs*): maples exist (often montane/riparian) but less ideal than humid temperate
    if (koppenCode.startsWith("CS")) score -= o.mediterraneanPenalty;

    // Cool oceanic / mild summer climates can be great
    if (koppenCode === "CFB" || koppenCode === "CFC") score += o.coolClimateBonus * 0.7;
  } else if (koppenCode.startsWith("D")) {
    // Continental is prime maple territory
    score += 0.30;

    // Best: Dfa/Dfb/Dwa/Dwb (temperate continental)
    if (/^DF[AB]$|^DW[AB]$/.test(koppenCode)) score += 0.05;

    // Subarctic edge: Dfc/Dfd/Dwc/Dwd still possible but less (short growing season)
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score -= 0.12;
  } else if (koppenCode.startsWith("BS")) {
    // Steppe: only pockets
    score -= o.steppePenalty;
    if (koppenCode === "BSK") score += 0.03; // cooler steppe slightly better
    if (koppenCode === "BSH") score -= 0.05;
  } else if (koppenCode.startsWith("A")) {
    score -= o.tropicalPenalty;
    if (koppenCode === "AM" || koppenCode === "AW") score -= 0.04;
  } else {
    score -= 0.10; // unknown
  }

  // Terrain adjustments
  if (o.highRiskTerrains.has(terrain)) score -= 0.08;

  // Elevation penalty (maple tolerates mid-montane)
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM); // 0..1
    score -= 0.22 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 12);
    score -= 0.12 * t;
  }

  // Ruggedness/arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  // Coastal moderation (small)
  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.maple = score;
}

/**
 * Pines + Firs plausibility check (broad Eurasian-style conifers).
 * Writes prov.materials.pine_fir = score (0..1).
 *
 * Intended vibe (from CK3 note):
 * - Very common across temperate/continental/boreal zones and mountainous regions
 * - Extends from Scotland across Scandinavia/Russia into China/Tibet (montane conifers)
 *
 * Heuristic:
 * - Best: D* (continental/boreal), cool C* (Cfb/Cfc), many mountain/highland provinces
 * - Decent: Mediterranean (Cs*) in mountains/interior, cold steppe BSk in montane pockets
 * - Weak: ET (tundra) only near treeline pockets (low score)
 * - Exclude: BW* deserts, EF icecap, tropical rainforest Af, incompatible terrains
 */
function pineFirPossibleInProvince(prov, opts = {}) {
  const o = {
    // Conifers tolerate elevation well (Tibet/montane), but not pure ice.
    maxElevM: 4200,
    softElevM: 2600,

    // Conifers can handle steep terrain better than broadleaf.
    maxSlopeMeanDeg: 26,

    // Arability proxy matters less (conifers can be on poor soils)
    arabilityPenaltyIfZero: 0.05,
    arabilityBonusIfHigh: 0.03,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes", "desert"]),
    // Unlike your broadleaf funcs, mountains/highlands are a POSITIVE for conifers.
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate tuning
    mediterraneanPenalty: 0.05,  // still plausible (esp. uplands), just slightly less than cool-humid
    steppePenalty: 0.08,         // BSk can have pines; keep modest penalty
    tropicalPenalty: 0.35,       // generally wrong biome
    tundraBase: 0.18,            // ET pockets near treeline (kept low!)
    coastalBonus: 0.02,

    // Extra: reward "cold/cool" climates
    coolBonus: 0.06,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenCode === "EF" || koppenGroup === "E" && koppenCode.startsWith("EF")) { prov.materials.pine_fir = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.pine_fir = 0; return; } // true deserts
  if (koppenCode === "AF") { prov.materials.pine_fir = 0; return; } // rainforest
  if (o.badTerrains.has(terrain)) { prov.materials.pine_fir = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.pine_fir = 0; return; }

  // --- Score ---
  let score = 0.62; // conifers are broadly plausible across temperate/continental

  // Köppen suitability
  if (koppenCode.startsWith("D")) {
    // Prime conifer belt (Scandinavia/Russia/continental interiors)
    score += 0.30;

    // Subarctic-ish (Dfc/Dfd/Dwc/Dwd): still very conifer-friendly
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score += 0.06;

    // Warmer continental (Dfa/Dfb/Dwa/Dwb): still great
    if (/^DF[AB]$|^DW[AB]$/.test(koppenCode)) score += 0.03;
  } else if (koppenCode.startsWith("C")) {
    score += 0.18;

    // Cool oceanic (Cfb/Cfc) -> extra good for conifers
    if (koppenCode === "CFB" || koppenCode === "CFC") score += o.coolBonus;

    // Mediterranean (Cs*): pines common, firs in montane zones; mild penalty unless montane
    if (koppenCode.startsWith("CS")) score -= o.mediterraneanPenalty;
  } else if (koppenCode.startsWith("BS")) {
    // Cold steppe pockets (Anatolia/Central Asia montane edges)
    score -= o.steppePenalty;
    if (koppenCode === "BSK") score += 0.05; // cold steppe more plausible than hot steppe
    if (koppenCode === "BSH") score -= 0.06;
  } else if (koppenCode === "ET") {
    // Tundra: only sparse/edge pockets near treeline; keep low
    score = Math.min(score, o.tundraBase);
    // But if it's mountainous (treeline), give it a small bump
    if (o.montaneTerrains.has(terrain) && (elevM != null && elevM > 800)) score += 0.06;
  } else if (koppenCode.startsWith("A")) {
    // Tropical climates generally not pine/fir (unless you model montane tropics as Cwb)
    score -= o.tropicalPenalty;
  } else if (koppenCode.startsWith("E")) {
    // Other E besides EF (mainly ET) should already be handled; keep conservative
    score = Math.min(score, 0.12);
  } else {
    score -= 0.10; // unknown
  }

  // Terrain adjustments (montane conifers!)
  if (o.montaneTerrains.has(terrain)) score += 0.10;

  // Elevation: conifers tolerate elevation; only start mild penalty at high alt
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM); // 0..1
    score -= 0.12 * Math.max(0, Math.min(1, t));
  }

  // Slope: tolerant; penalize only if *very* steep on average
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 14);
    score -= 0.08 * t;
  }

  // Ruggedness/arability proxy (light touch)
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.pine_fir = score;
}

/**
 * "Widespread Regional - Subsaharan Africa" woods plausibility.
 * Writes prov.materials.woods_subsaharan = score (0..1).
 *
 * Interpretation:
 * - Not a single species; more like "tropical/subtropical hardwood availability".
 * - Best: Af/Am/Aw (rainforest/monsoon/savanna woodland)
 * - Good: As/other A* if you ever use them
 * - Moderate/patchy: BSh (Sahel / dry savanna), some BSk at warm margins (very low)
 * - Some support: tropical uplands often map to Cwa/Cwb (seasonal tropical highland)
 * - Exclude: BW deserts, polar E*, glacier/ice, extreme alpine
 *
 * NOTE: If you later have region tags (world_africa_west/east/sahara),
 * you can multiply score by a regionMask (1 inside, 0 outside) for strict CK3 behavior.
 */
function subsaharanWoodsPossibleInProvince(prov, opts = {}) {
  const o = {
    // Tropical woods can occur from lowlands up into montane zones, but not extreme alpine
    maxElevM: 3800,
    softElevM: 2400,

    // Woods can exist on slopes; keep slope effect light
    maxSlopeMeanDeg: 28,

    // Arability proxy: if it's all bare rock (0), reduce a bit
    arabilityPenaltyIfZero: 0.08,
    arabilityBonusIfHigh: 0.04,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    // Deserts handled by Köppen BW* primarily, but keep terrain hook too
    desertTerrains: new Set(["desert"]),

    // Climate tuning
    rainforestBonus: 0.22,   // Af
    monsoonBonus: 0.18,      // Am
    savannaBonus: 0.14,      // Aw/As
    hotSteppeBase: 0.28,     // BSh = patchy wood; not zero
    coldSteppeBase: 0.12,    // BSk = very marginal for "subsaharan woods"
    mediterraneanPenalty: 0.22,
    temperatePenalty: 0.12,  // generic C temperate outside tropical highland cases
    coastalBonus: 0.03,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();   // e.g. "AW"
  const koppenGroup = (prov.koppenGroup || "").toUpperCase(); // e.g. "A"
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_subsaharan = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_subsaharan = 0; return; } // deserts
  if (o.badTerrains.has(terrain)) { prov.materials.woods_subsaharan = 0; return; }
  if (o.desertTerrains.has(terrain)) { prov.materials.woods_subsaharan = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_subsaharan = 0; return; }

  // --- Score ---
  // Start at a modest baseline: these woods are "regional", not universal.
  let score = 0.25;

  // Köppen suitability (primary driver)
  if (koppenGroup === "A" || koppenCode.startsWith("A")) {
    // Tropical: main home of subsaharan woods
    score = 0.62;

    if (koppenCode === "AF") score += o.rainforestBonus; // dense rainforest hardwoods
    else if (koppenCode === "AM") score += o.monsoonBonus;
    else if (koppenCode === "AW" || koppenCode === "AS") score += o.savannaBonus;
    else score += 0.08; // other A* variants if any
  } else if (koppenCode.startsWith("BS")) {
    // Steppe: can have wood/trees in pockets (especially Sahel)
    if (koppenCode === "BSH") score = o.hotSteppeBase;
    else if (koppenCode === "BSK") score = o.coldSteppeBase;
    else score = 0.16;
  } else if (koppenCode.startsWith("C")) {
    // Temperate: usually not "subsaharan woods" unless it's tropical highland-ish
    // Many African highlands are sometimes represented as Cwb/Cwa.
    score = 0.20;

    // Cwa/Cwb (seasonal subtropical/tropical highland analog) -> allow moderate woods
    if (koppenCode === "CWA" || koppenCode === "CWB") score += 0.18;

    // Mediterranean (Cs*) generally not right for this material set
    if (koppenCode.startsWith("CS")) score -= o.mediterraneanPenalty;
    else score -= o.temperatePenalty * 0.5;
  } else if (koppenCode.startsWith("D")) {
    // Continental climates: generally wrong for subsaharan woods
    score = 0.06;
  } else {
    // Unknown: conservative
    score = 0.10;
  }

  // Terrain adjustments:
  // Forest-y signals aren’t directly present, so we keep this light.
  // Mountains/highlands in the tropics can still be wooded; don’t punish heavily.
  if (terrain === "mountains" || terrain === "highlands") {
    // In A climates, montane forests are common; in BSh, they can concentrate trees too.
    if (koppenCode.startsWith("A") || koppenCode === "BSH") score += 0.06;
    else score -= 0.04;
  }

  // Elevation soft penalty only at high altitudes
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM); // 0..1
    score -= 0.14 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 16);
    score -= 0.06 * t;
  }

  // Ruggedness/arability proxy (light)
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.woods_subsaharan = score;
}

/**
 * Padauk wood plausibility check.
 * Writes prov.materials.woods_padauk = score (0..1).
 *
 * CK3 meaning:
 * - Tropical hardwood from:
 *   - Subsaharan Africa
 *   - India
 *   - Burma / SE Asia
 *
 * Biome proxy:
 * - Best: Af / Am / Aw (tropical rainforest, monsoon, savanna woodland)
 * - Good: Cwa / Cwb (tropical highlands / monsoon uplands)
 * - Weak: BSh (dry savanna / Sahel-like edge)
 * - Exclude: BW deserts, all D/E climates, glaciers/ice, extreme alpine
 */
function padaukPossibleInProvince(prov, opts = {}) {
  const o = {
    // Padauk is lowland–to–mid-elevation tropical hardwood
    maxElevM: 2600,
    softElevM: 1600,

    // Can exist on slopes, but not extreme terrain
    maxSlopeMeanDeg: 24,

    // Arability proxy: tropical hardwood prefers soils
    arabilityPenaltyIfZero: 0.10,
    arabilityBonusIfHigh: 0.06,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),

    // Climate tuning
    rainforestBonus: 0.22,   // Af
    monsoonBonus: 0.18,      // Am
    savannaBonus: 0.14,      // Aw / As
    tropicalHighlandBonus: 0.18, // Cwa / Cwb
    hotSteppeBase: 0.22,     // BSh = patchy wood only
    steppePenalty: 0.10,
    temperatePenalty: 0.25,
    coldPenalty: 0.45,

    coastalBonus: 0.03,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_padauk = 0; return; }
  if (koppenGroup === "D" || koppenCode.startsWith("D")) { prov.materials.woods_padauk = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_padauk = 0; return; }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) {
    prov.materials.woods_padauk = 0; return;
  }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_padauk = 0; return; }

  // --- Score ---
  let score = 0.18; // narrow material; not everywhere in tropics

  // Köppen-driven logic (primary)
  if (koppenGroup === "A" || koppenCode.startsWith("A")) {
    score = 0.62;

    if (koppenCode === "AF") score += o.rainforestBonus;
    else if (koppenCode === "AM") score += o.monsoonBonus;
    else if (koppenCode === "AW" || koppenCode === "AS") score += o.savannaBonus;
    else score += 0.08;
  } else if (koppenCode === "CWA" || koppenCode === "CWB") {
    // Tropical monsoon highlands (India/Burma uplands)
    score = 0.55 + o.tropicalHighlandBonus;
  } else if (koppenCode.startsWith("BS")) {
    // Dry savanna edge
    if (koppenCode === "BSH") score = o.hotSteppeBase;
    else score = 0.10;
  } else if (koppenCode.startsWith("C")) {
    // Other temperate climates generally wrong
    score = 0.12;
    if (koppenCode.startsWith("CS")) score -= 0.08;
    score -= o.temperatePenalty * 0.5;
  } else {
    // Anything else = very unlikely
    score = 0.05;
  }

  // Terrain adjustments
  if (terrain === "mountains" || terrain === "highlands") {
    // Padauk can occur in tropical hills, but not alpine
    if (koppenCode.startsWith("A") || koppenCode === "CWA" || koppenCode === "CWB") {
      score += 0.04;
    } else {
      score -= 0.06;
    }
  }

  // Elevation soft penalty
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.20 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 14);
    score -= 0.08 * t;
  }

  // Ruggedness/arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness)
    ? prov.arability01_fromRuggedness
    : null;

  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.woods_padauk = score;
}

/**
 * "Widespread Regional - India" woods plausibility.
 * Writes prov.materials.woods_india = score (0..1).
 *
 * CK3 scope:
 * - world_india_deccan / bengal / rajastan + d_arakan
 * Interpretation:
 * - Broad "Indian woods" set: monsoon forests, dry deciduous forests, tropical moist forests,
 *   plus NE/Arakan rainforest pockets.
 *
 * Proxy using Köppen/terrain/elevation:
 * - Best: Am, Aw, Cwa, Cwb
 * - Good: Af (NE India / Arakan), Cfa/Cfb (foothills / humid subtropical)
 * - Patchy: BSh (dry margins), BSk very low
 * - Exclude: BW deserts, D/E climates, glacier/ice, extreme alpine
 */
function indiaWoodsPossibleInProvince(prov, opts = {}) {
  const o = {
    // Indian woods can occur from lowlands up into mid-montane, but not extreme alpine
    maxElevM: 3200,
    softElevM: 2000,

    // Woods can exist on slopes; keep slope penalty light
    maxSlopeMeanDeg: 26,

    // Arability proxy: matter some, but don't overdo (forests exist on rougher ground too)
    arabilityPenaltyIfZero: 0.08,
    arabilityBonusIfHigh: 0.05,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),

    // Climate tuning
    rainforestBonus: 0.16,     // Af (Arakan/NE pockets)
    monsoonBonus: 0.22,        // Am (Bengal/West coast monsoon belts)
    savannaBonus: 0.18,        // Aw/As (dry deciduous / savanna woodland)
    tropicalHighlandBonus: 0.20, // Cwa/Cwb (Deccan uplands / Himalayan foothills analog)
    humidSubtropicalBonus: 0.10, // Cfa (Ganges plain / foothills style)
    oceanicBonus: 0.06,        // Cfb (cooler uplands)
    hotSteppeBase: 0.24,       // BSh (Rajasthan margins / Deccan rainshadow): patchy woods
    coldSteppeBase: 0.10,      // BSk very marginal
    mediterraneanPenalty: 0.18,
    temperatePenalty: 0.20,
    coastalBonus: 0.03,

    // Terrain adjustments
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),
    montaneBonusInMonsoon: 0.06,
    montanePenaltyOtherwise: 0.05,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_india = 0; return; }
  if (koppenGroup === "D" || koppenCode.startsWith("D")) { prov.materials.woods_india = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_india = 0; return; } // Thar core should be excluded
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_india = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_india = 0; return; }

  // --- Score ---
  let score = 0.22; // broad regional material but not "everywhere"

  // Köppen suitability
  if (koppenGroup === "A" || koppenCode.startsWith("A")) {
    score = 0.60;
    if (koppenCode === "AF") score += o.rainforestBonus;
    else if (koppenCode === "AM") score += o.monsoonBonus;
    else if (koppenCode === "AW" || koppenCode === "AS") score += o.savannaBonus;
    else score += 0.10;
  } else if (koppenCode === "CWA" || koppenCode === "CWB") {
    score = 0.58 + o.tropicalHighlandBonus;
  } else if (koppenCode === "CFA") {
    score = 0.50 + o.humidSubtropicalBonus;
  } else if (koppenCode === "CFB") {
    score = 0.42 + o.oceanicBonus;
  } else if (koppenCode.startsWith("BS")) {
    if (koppenCode === "BSH") score = o.hotSteppeBase;
    else if (koppenCode === "BSK") score = o.coldSteppeBase;
    else score = 0.14;
  } else if (koppenCode.startsWith("C")) {
    // Other temperate climates: possible but not very "India woods"
    score = 0.18;
    if (koppenCode.startsWith("CS")) score -= o.mediterraneanPenalty;
    else score -= o.temperatePenalty * 0.5;
  } else {
    score = 0.08; // unknown / edge cases
  }

  // Terrain: hills/highlands help in monsoon settings (Western Ghats / NE hills / foothills)
  if (o.montaneTerrains.has(terrain)) {
    if (
      koppenCode.startsWith("A") ||
      koppenCode === "CWA" || koppenCode === "CWB" ||
      koppenCode === "CFA"
    ) {
      score += o.montaneBonusInMonsoon;
    } else {
      score -= o.montanePenaltyOtherwise;
    }
  }

  // Elevation soft penalty
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.16 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 16);
    score -= 0.06 * t;
  }

  // Arability proxy (light/moderate)
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.woods_india = score;
}

/**
 * Widespread Regional - India + Burma woods plausibility.
 * Writes prov.materials.woods_india_burma = score (0..1).
 *
 * Interpretation:
 * - Broad tropical hardwood availability across South + SE Asia:
 *   monsoon forests (Am), seasonal deciduous/savanna woodlands (Aw),
 *   rainforest pockets (Af), and monsoon uplands (Cwa/Cwb).
 *
 * Proxy:
 * - Best: Am, Aw, Af
 * - Good: Cwa/Cwb, Cfa (humid subtropical plains/foothills)
 * - Patchy: BSh (dry margins), BSk very low
 * - Exclude: BW deserts, D/E climates, glacier/ice, extreme alpine
 */
function indiaBurmaWoodsPossibleInProvince(prov, opts = {}) {
  const o = {
    // Wider than India-only; still not alpine
    maxElevM: 3400,
    softElevM: 2100,

    maxSlopeMeanDeg: 26,

    arabilityPenaltyIfZero: 0.07,
    arabilityBonusIfHigh: 0.05,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),

    // Climate weights (slightly more rainforest-friendly than India-only)
    rainforestBonus: 0.20,     // Af
    monsoonBonus: 0.22,        // Am
    savannaBonus: 0.18,        // Aw/As
    tropicalHighlandBonus: 0.22, // Cwa/Cwb
    humidSubtropicalBonus: 0.12, // Cfa
    oceanicBonus: 0.06,        // Cfb (uplands)
    hotSteppeBase: 0.22,       // BSh patchy
    coldSteppeBase: 0.10,      // BSk marginal
    temperatePenalty: 0.18,
    mediterraneanPenalty: 0.20,
    coastalBonus: 0.03,

    montaneTerrains: new Set(["mountains", "highlands", "hills"]),
    montaneBonusInTropics: 0.07,
    montanePenaltyOtherwise: 0.05,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_india_burma = 0; return; }
  if (koppenGroup === "D" || koppenCode.startsWith("D")) { prov.materials.woods_india_burma = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_india_burma = 0; return; }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_india_burma = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_india_burma = 0; return; }

  // --- Score ---
  let score = 0.24;

  // Köppen suitability
  if (koppenGroup === "A" || koppenCode.startsWith("A")) {
    score = 0.62;
    if (koppenCode === "AF") score += o.rainforestBonus;
    else if (koppenCode === "AM") score += o.monsoonBonus;
    else if (koppenCode === "AW" || koppenCode === "AS") score += o.savannaBonus;
    else score += 0.10;
  } else if (koppenCode === "CWA" || koppenCode === "CWB") {
    score = 0.60 + o.tropicalHighlandBonus;
  } else if (koppenCode === "CFA") {
    score = 0.52 + o.humidSubtropicalBonus;
  } else if (koppenCode === "CFB") {
    score = 0.42 + o.oceanicBonus;
  } else if (koppenCode.startsWith("BS")) {
    if (koppenCode === "BSH") score = o.hotSteppeBase;
    else if (koppenCode === "BSK") score = o.coldSteppeBase;
    else score = 0.14;
  } else if (koppenCode.startsWith("C")) {
    score = 0.18;
    if (koppenCode.startsWith("CS")) score -= o.mediterraneanPenalty;
    else score -= o.temperatePenalty * 0.5;
  } else {
    score = 0.08;
  }

  // Terrain: uplands often wooded in monsoon tropics (Shan/Arakan hills, Ghats, etc.)
  if (o.montaneTerrains.has(terrain)) {
    if (
      koppenCode.startsWith("A") ||
      koppenCode === "CWA" || koppenCode === "CWB" ||
      koppenCode === "CFA"
    ) {
      score += o.montaneBonusInTropics;
    } else {
      score -= o.montanePenaltyOtherwise;
    }
  }

  // Elevation soft penalty
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.16 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 16);
    score -= 0.06 * t;
  }

  // Arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.woods_india_burma = score;
}

/**
 * Ebony wood plausibility check (rare tropical hardwood).
 * Writes prov.materials.woods_ebony = score (0..1).
 *
 * CK3 scope:
 * - regions: material_woods_sri_lanka (humid tropical)
 * - duchies: several West African duchies (humid tropical/monsoon pockets)
 *
 * Biome proxy (no region tags available):
 * - Best: Af (tropical rainforest), Am (tropical monsoon)
 * - Good: Aw/As ONLY if not too dry (kept modest)
 * - Some: Cwa/Cwb (tropical monsoon highlands), Cfa (humid subtropical edge)
 * - Exclude: BW deserts, most BS steppe, all D/E climates, glacier/ice, extreme alpine
 *
 * Note: Ebony should be rarer than "woods_subsaharan" or "woods_india_burma",
 * so baseline + caps are conservative.
 */
function ebonyPossibleInProvince(prov, opts = {}) {
  const o = {
    // Ebony is tropical lowland-to-mid elevation; not alpine
    maxElevM: 2200,
    softElevM: 1200,

    // Terrain/slope: forests can be on slopes; keep slope penalty light
    maxSlopeMeanDeg: 26,

    // Ebony likes humid forest conditions; use arability lightly
    arabilityPenaltyIfZero: 0.08,
    arabilityBonusIfHigh: 0.05,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),

    // Climate weights (tight + humid-biased)
    baseAf: 0.78,          // rainforest core
    baseAm: 0.72,          // monsoon forests
    awBase: 0.28,          // savanna woodland: low, but not zero
    awDryPenalty: 0.12,    // if BSh-ish dryness shows up, penalize more
    cwaBase: 0.40,         // tropical monsoon highland: modest
    cfaBase: 0.28,         // humid subtropical fringe: low
    steppeBase: 0.08,      // generally too dry for ebony; keep near zero

    coastalBonus: 0.02,

    // Make ebony rare: cap non-Af/Am outputs
    capNonCore: 0.45,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_ebony = 0; return; }
  if (koppenGroup === "D" || koppenCode.startsWith("D")) { prov.materials.woods_ebony = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_ebony = 0; return; }
  if (koppenCode === "AF" ? false : false) { /* no-op, kept for readability */ }

  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) {
    prov.materials.woods_ebony = 0; return;
  }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_ebony = 0; return; }

  // --- Score ---
  let score = 0.0;

  // Climate core
  if (koppenCode === "AF") {
    score = o.baseAf;
  } else if (koppenCode === "AM") {
    score = o.baseAm;
  } else if (koppenCode === "AW" || koppenCode === "AS") {
    // Savanna: ebony much rarer; keep low
    score = o.awBase;
  } else if (koppenCode === "CWA" || koppenCode === "CWB") {
    score = o.cwaBase;
  } else if (koppenCode === "CFA") {
    score = o.cfaBase;
  } else if (koppenCode.startsWith("BS")) {
    // Steppe: basically no ebony
    score = o.steppeBase;
    if (koppenCode === "BSH") score -= o.awDryPenalty;
  } else if (koppenCode.startsWith("A")) {
    // Other tropical variants: treat like low savanna baseline
    score = o.awBase * 0.7;
  } else {
    // Everything else: almost none
    score = 0.03;
  }

  // Terrain tweaks: ebony is forest hardwood, so mountains/highlands aren't a big plus
  // (ebony tends to be lowland humid forest). Penalize very rugged alpine-ish terrain.
  if (terrain === "mountains") score -= 0.10;
  if (terrain === "highlands") score -= 0.04;

  // Elevation soft penalty (ebony prefers lower, warmer, humid)
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.22 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 18);
    score -= 0.06 * t;
  }

  // Arability proxy (light)
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Cap non-core climates so ebony stays rare outside Af/Am
  const isCore = (koppenCode === "AF" || koppenCode === "AM");
  if (!isCore) score = Math.min(score, o.capNonCore);

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.woods_ebony = score;
}

/**
 * Yew wood plausibility check (temperate Europe + montane Caucasus vibe).
 * Writes prov.materials.woods_yew = score (0..1).
 *
 * CK3 scope includes: Britain, S. Scandinavia, Poland, Alps, Caucasia, SE Europe.
 * Biome proxy:
 * - Best: Cfb/Cfc, Cfa (cooler/humid), Dfb/Dfa/Dwa/Dwb, plus montane temperate zones.
 * - Decent: Csb/Csa (montane Mediterranean), Dfc (edge, but penalized).
 * - Weak: BSk (very low), BSh (near zero), Aw/Am/Af (near zero), ET (near zero).
 * - Exclude: BW deserts, EF icecap, glacier/ice terrains.
 */
function yewPossibleInProvince(prov, opts = {}) {
  const o = {
    // Yew tolerates uplands, but not extreme alpine/ice
    maxElevM: 2600,
    softElevM: 1400,

    // Yew can occur on slopes/wooded hillsides
    maxSlopeMeanDeg: 24,

    // Soil/arability: not super strict (yew can grow in rocky woods)
    arabilityPenaltyIfZero: 0.07,
    arabilityBonusIfHigh: 0.04,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes", "desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate tuning
    bestCfbBonus: 0.22,
    bestDfbBonus: 0.18,
    mildCfaBonus: 0.08,
    mediterraneanBase: 0.34,   // only really good if montane
    mediterraneanPenaltyLowland: 0.12,
    subarcticPenalty: 0.18,    // Dfc/Dfd etc: yew less likely
    steppePenalty: 0.20,       // generally too dry
    tropicalPenalty: 0.45,     // basically wrong biome
    tundraPenalty: 0.55,       // near zero

    montaneBonus: 0.10,        // yew likes upland woods
    coastalBonus: 0.02,

    // Keep it “regional” (avoid lighting up all temperate forests)
    capOutsideIdeal: 0.72,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenCode === "EF") { prov.materials.woods_yew = 0; return; }
  if (koppenGroup === "E" && koppenCode !== "ET") { prov.materials.woods_yew = 0; return; } // other E besides ET
  if (koppenCode.startsWith("BW")) { prov.materials.woods_yew = 0; return; }
  if (o.badTerrains.has(terrain)) { prov.materials.woods_yew = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_yew = 0; return; }

  // --- Score ---
  let score = 0.18; // start low; yew is not "everywhere"

  // Köppen suitability
  if (koppenCode.startsWith("C")) {
    // Temperate: core home for yew if cool/humid
    score = 0.46;

    if (koppenCode === "CFB" || koppenCode === "CFC") score += o.bestCfbBonus;
    if (koppenCode === "CFA") score += o.mildCfaBonus;

    // Mediterranean: yew is much more “montane Mediterranean”
    if (koppenCode.startsWith("CS")) {
      score = o.mediterraneanBase; // override to a moderate base
      // lowland Mediterranean should be penalized unless montane
      if (!o.montaneTerrains.has(terrain) && (elevM == null || elevM < 700)) {
        score -= o.mediterraneanPenaltyLowland;
      }
    }
  } else if (koppenCode.startsWith("D")) {
    // Continental: good, but not extreme subarctic
    score = 0.44;

    // Best continental for yew: Dfb/Dfa/Dwa/Dwb
    if (/^DF[AB]$|^DW[AB]$/.test(koppenCode)) score += o.bestDfbBonus;

    // Subarctic-ish: less yew
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score -= o.subarcticPenalty;
  } else if (koppenCode.startsWith("BS")) {
    // Steppe: generally too dry
    score = 0.10 - o.steppePenalty;
    if (koppenCode === "BSK") score += 0.06; // cold steppe tiny chance in wooded pockets
  } else if (koppenCode.startsWith("A")) {
    // Tropical: basically no
    score = 0.05 - o.tropicalPenalty;
  } else if (koppenCode === "ET") {
    // Tundra: near zero; only tiny sheltered pockets (keep extremely low)
    score = 0.04 - o.tundraPenalty;
  } else {
    // Unknown
    score = 0.12;
  }

  // Terrain: yew likes upland wooded slopes/valleys
  if (o.montaneTerrains.has(terrain)) score += o.montaneBonus;

  // Elevation: soft penalty above softElev; yew doesn't like extreme alpine
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.18 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 14);
    score -= 0.07 * t;
  }

  // Arability proxy (light)
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + cap so it stays "regional-ish"
  score = Math.max(0, Math.min(1, score));
  score = Math.min(score, o.capOutsideIdeal);

  prov.materials.woods_yew = score;
}

/**
 * Bamboo wood plausibility check (Asia monsoon + montane + NE pockets).
 * Writes prov.materials.woods_bamboo = score (0..1).
 *
 * CK3 scope:
 * - regions: world_burma, world_india, world_tibet
 * - duchies: a handful of Manchuria-area duchies
 *
 * Proxy from available province data:
 * - Best: Am, Aw/As, Cwa/Cwb, Cfa (monsoon + humid subtropical)
 * - Good: Af (SE rainforest can have bamboo), Cfb (upland humid)
 * - Some: Dwa/Dwb/Dfa/Dfb (NE Asia if not too dry), but penalize harsher Dfc+
 * - Weak: BSh/BSk only if montane/river pockets (kept low)
 * - Exclude: BW deserts, E (EF/ET), glacier/ice, extreme alpine
 */
function bambooPossibleInProvince(prov, opts = {}) {
  const o = {
    // Bamboo spans lowland tropics to montane (Tibet/Himalaya), but not extreme alpine/ice
    maxElevM: 4200,
    softElevM: 2600,

    // Bamboo can occur on slopes; keep slope penalty light
    maxSlopeMeanDeg: 28,

    // Arability proxy: moderate importance
    arabilityPenaltyIfZero: 0.08,
    arabilityBonusIfHigh: 0.05,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate tuning
    baseAm: 0.72,      // monsoon core
    baseAw: 0.62,      // seasonal monsoon woodlands
    baseCwaCwb: 0.70,  // monsoon uplands (very bamboo-friendly)
    baseCfa: 0.62,     // humid subtropical
    baseAf: 0.60,      // rainforest bamboo exists, but not the defining signal
    baseCfb: 0.44,     // humid uplands (some bamboo)
    baseDwarm: 0.34,   // Dwa/Dwb/Dfa/Dfb NE pockets
    dHarshPenalty: 0.18, // Dfc/Dfd etc reduced

    steppeBase: 0.16,   // BSh/BSk pockets only
    steppeDryPenalty: 0.10,

    mediterraneanPenalty: 0.22,
    temperatePenalty: 0.14,
    tropicalPenalty: 0.05, // (tropical is mostly good; keep tiny penalty for weird A types)

    montaneBonus: 0.10,        // Tibet/Himalaya effect
    montanePenaltyHotLowland: 0.04, // tiny counterbalance (bamboo isn't only montane though)

    coastalBonus: 0.02,

    // Keep it somewhat regional: cap outside the best climates
    capOutsideCore: 0.85,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_bamboo = 0; return; } // EF/ET
  if (koppenCode.startsWith("BW")) { prov.materials.woods_bamboo = 0; return; } // deserts
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_bamboo = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_bamboo = 0; return; }

  // --- Score ---
  let score = 0.20;

  // Köppen suitability (primary)
  if (koppenCode === "AM") {
    score = o.baseAm;
  } else if (koppenCode === "AW" || koppenCode === "AS") {
    score = o.baseAw;
  } else if (koppenCode === "CWA" || koppenCode === "CWB") {
    score = o.baseCwaCwb;
  } else if (koppenCode === "CFA") {
    score = o.baseCfa;
  } else if (koppenCode === "AF") {
    score = o.baseAf;
  } else if (koppenCode === "CFB") {
    score = o.baseCfb;
  } else if (koppenCode.startsWith("D")) {
    // Allow NE Asia pockets (esp Dwa/Dwb/Dfa/Dfb); penalize harsh subarctic
    score = o.baseDwarm;
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score -= o.dHarshPenalty;
    if (/^DF[AB]$|^DW[AB]$/.test(koppenCode)) score += 0.04;
  } else if (koppenCode.startsWith("BS")) {
    // Steppe: only pockets; if montane, slightly better
    score = o.steppeBase;
    if (koppenCode === "BSH") score -= o.steppeDryPenalty;
    if (koppenCode === "BSK") score += 0.02;
  } else if (koppenCode.startsWith("C")) {
    // Other C climates: modest
    score = 0.30;
    if (koppenCode.startsWith("CS")) score -= o.mediterraneanPenalty;
    else score -= o.temperatePenalty * 0.5;
  } else if (koppenCode.startsWith("A")) {
    // Other A types: still generally plausible, but keep moderate
    score = 0.48 - o.tropicalPenalty;
  } else {
    score = 0.12;
  }

  // Terrain + elevation logic: Tibet/Himalaya bamboo should pop
  const isMontane = o.montaneTerrains.has(terrain);
  if (isMontane) score += o.montaneBonus;
  else if ((koppenCode === "AM" || koppenCode === "AW") && (elevM != null && elevM < 400)) {
    // Slightly reduce the idea that *all* hot lowland monsoon is "bamboo everywhere"
    score -= o.montanePenaltyHotLowland;
  }

  // Elevation soft penalty only at very high altitudes (above bamboo belt)
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.18 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 18);
    score -= 0.06 * t;
  }

  // Arability proxy (moderate)
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Cap outside core monsoon/highland/humid-subtropical signals
  const isCore =
    koppenCode === "AM" || koppenCode === "AW" || koppenCode === "AS" ||
    koppenCode === "CWA" || koppenCode === "CWB" || koppenCode === "CFA" ||
    (isMontane && (koppenCode.startsWith("C") || koppenCode.startsWith("D")));

  score = Math.max(0, Math.min(1, score));
  if (!isCore) score = Math.min(score, o.capOutsideCore);

  prov.materials.woods_bamboo = score;
}

/**
 * Cherry wood plausibility (Asia: India + Burma + Tibet scope).
 * Writes prov.materials.woods_cherry = score (0..1).
 *
 * Interpretation:
 * - "Cherry" here is treated as Prunus spp. wood availability:
 *   most plausible in temperate to montane climates (uplands/foothills),
 *   not as a dominant lowland rainforest hardwood.
 *
 * Proxy:
 * - Best: Cwa/Cwb (monsoon highlands), Cfa/Cfb (humid subtropical / upland temperate)
 * - Good: Dwa/Dwb/Dfa/Dfb (cooler continental pockets)
 * - Moderate: Am/Aw ONLY if montane / higher elevation
 * - Weak: BS* (tiny chance in montane/riparian pockets)
 * - Exclude: BW deserts, E climates, glacier/ice, extreme alpine
 */
function cherryPossibleInProvince(prov, opts = {}) {
  const o = {
    // Cherry can occur into high uplands (esp. Tibet/Himalaya), but not extreme alpine/ice
    maxElevM: 4200,
    softElevM: 2800,

    // Can occur on slopes; keep penalty light
    maxSlopeMeanDeg: 26,

    // Arability proxy: moderate (orchard/woodland vibe), but not strict
    arabilityPenaltyIfZero: 0.08,
    arabilityBonusIfHigh: 0.06,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate bases (more temperate/upland than bamboo)
    baseCwaCwb: 0.72,   // monsoon uplands: very plausible
    baseCfa: 0.58,      // humid subtropical: plausible
    baseCfb: 0.54,      // temperate oceanic/upland: plausible
    baseDwarm: 0.48,    // Dwa/Dwb/Dfa/Dfb: plausible
    dHarshPenalty: 0.18,// Dfc/Dfd etc reduced

    baseAm: 0.38,       // monsoon lowlands: only modest unless upland
    baseAw: 0.28,       // savanna/seasonal: low unless upland
    afPenalty: 0.22,    // rainforest is not a "cherry" signal

    steppeBase: 0.10,   // very marginal
    steppePenalty: 0.08,

    montaneBonus: 0.12, // key: cherry pops in hills/foothills
    uplandElevBonusFrom: 700,  // start rewarding elevation above this
    uplandElevBonusTo: 2200,
    uplandElevBonusMax: 0.10,

    coastalBonus: 0.01,

    // Keep "regional-ish": cap lowland tropical results
    capLowlandTropics: 0.55,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_cherry = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_cherry = 0; return; }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_cherry = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_cherry = 0; return; }

  // --- Score ---
  let score = 0.16;

  // Köppen suitability (primary)
  if (koppenCode === "CWA" || koppenCode === "CWB") {
    score = o.baseCwaCwb;
  } else if (koppenCode === "CFA") {
    score = o.baseCfa;
  } else if (koppenCode === "CFB") {
    score = o.baseCfb;
  } else if (koppenCode.startsWith("D")) {
    score = o.baseDwarm;
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score -= o.dHarshPenalty; // harsher subarctic -> less cherry
    if (/^DF[AB]$|^DW[AB]$/.test(koppenCode)) score += 0.04;
  } else if (koppenCode === "AM") {
    score = o.baseAm;
  } else if (koppenCode === "AW" || koppenCode === "AS") {
    score = o.baseAw;
  } else if (koppenCode === "AF") {
    // Rainforest: cherry not a strong signal
    score = Math.max(0, o.baseAm - o.afPenalty);
  } else if (koppenCode.startsWith("BS")) {
    score = o.steppeBase;
    if (koppenCode === "BSH") score -= o.steppePenalty;
    if (koppenCode === "BSK") score += 0.02;
  } else if (koppenCode.startsWith("C")) {
    score = 0.32; // other temperate C: modest
    if (koppenCode.startsWith("CS")) score -= 0.10;
  } else if (koppenCode.startsWith("A")) {
    // other A types: low
    score = 0.22;
  } else {
    score = 0.10;
  }

  // Terrain: cherry likes uplands/foothills
  const isMontane = o.montaneTerrains.has(terrain);
  if (isMontane) score += o.montaneBonus;

  // Elevation: reward moderate upland band (foothills), then penalize very high alpine
  if (elevM != null) {
    // bonus for foothills (great for Tibet/Himalaya edges)
    if (elevM >= o.uplandElevBonusFrom && elevM <= o.uplandElevBonusTo) {
      const t = (elevM - o.uplandElevBonusFrom) / (o.uplandElevBonusTo - o.uplandElevBonusFrom);
      score += o.uplandElevBonusMax * Math.max(0, Math.min(1, t));
    } else if (elevM > o.uplandElevBonusTo) {
      // keep a portion of bonus if higher than band, but don't increase more
      score += o.uplandElevBonusMax * 0.6;
    }

    // soft penalty above softElevM
    if (elevM > o.softElevM) {
      const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
      score -= 0.18 * Math.max(0, Math.min(1, t));
    }
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 16);
    score -= 0.06 * t;
  }

  // Arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Keep lowland tropics from going too high
  const lowland = (elevM != null ? elevM < 500 : false);
  const isTropical = koppenCode.startsWith("A") || koppenCode === "AM" || koppenCode === "AW" || koppenCode === "AS";
  if (lowland && isTropical && !isMontane) score = Math.min(score, o.capLowlandTropics);

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.woods_cherry = score;
}

/**
 * Dogwood wood plausibility (broad Eurasian temperate/continental woodland vibe).
 * Writes prov.materials.woods_dogwood = score (0..1).
 *
 * CK3 scope:
 * - world_europe, world_asia_minor, world_steppe_west, world_steppe_central, world_siberia
 *
 * Proxy:
 * - Best: C* (esp Cfb/Cfa), D* (esp Dfb/Dfa/Dwa/Dwb)
 * - Good: cooler edges (Cfc, some Dfc) but penalize harsh subarctic
 * - Moderate: BSk (forest-steppe / riparian corridors)
 * - Low: BSh
 * - Exclude: BW deserts, E (polar), glacier/ice
 */
function dogwoodPossibleInProvince(prov, opts = {}) {
  const o = {
    // Dogwood is not alpine/ice; allow some uplands
    maxElevM: 2600,
    softElevM: 1600,

    // Can exist on slopes (understory tree/shrub), keep penalty light
    maxSlopeMeanDeg: 24,

    // Arability proxy: light/moderate
    arabilityPenaltyIfZero: 0.07,
    arabilityBonusIfHigh: 0.04,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate weighting
    baseC: 0.56,
    baseD: 0.58,
    bonusCfbCfa: 0.12,     // nice temperate forests
    bonusDfbDfa: 0.10,     // mixed continental forests
    coolEdgeBonus: 0.04,   // Cfc, etc

    subarcticPenalty: 0.16, // Dfc/Dfd/Dwc/Dwd
    tundraPenalty: 0.55,    // ET near zero
    tropicalPenalty: 0.40,  // A* mostly wrong here

    // Steppe handling
    bskBase: 0.34,          // forest-steppe/riparian
    bshBase: 0.18,          // drier steppe: low
    steppeDryPenalty: 0.06,

    mediterraneanPenaltyLowland: 0.08, // Anatolia can be Cs; allow if montane
    montaneBonus: 0.06,                // Caucasus/Anatolia uplands help
    coastalBonus: 0.02,

    // Keep it “regional-ish”
    cap: 0.85,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_dogwood = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_dogwood = 0; return; }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_dogwood = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_dogwood = 0; return; }

  const isMontane = o.montaneTerrains.has(terrain);

  // --- Score ---
  let score = 0.18;

  if (koppenCode.startsWith("C")) {
    score = o.baseC;

    // Temperate forest sweet spots
    if (koppenCode === "CFB" || koppenCode === "CFA") score += o.bonusCfbCfa;
    if (koppenCode === "CFC") score += o.coolEdgeBonus;

    // Mediterranean (Cs*): ok in Anatolia uplands, less in lowlands
    if (koppenCode.startsWith("CS") && !isMontane && (elevM == null || elevM < 700)) {
      score -= o.mediterraneanPenaltyLowland;
    }
  } else if (koppenCode.startsWith("D")) {
    score = o.baseD;

    // Mixed forest continental sweet spots
    if (/^DF[AB]$|^DW[AB]$/.test(koppenCode)) score += o.bonusDfbDfa;

    // Harsher subarctic still possible but less "dogwoody"
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score -= o.subarcticPenalty;
  } else if (koppenCode.startsWith("BS")) {
    // Forest-steppe / riparian corridors
    if (koppenCode === "BSK") score = o.bskBase;
    else if (koppenCode === "BSH") score = o.bshBase - o.steppeDryPenalty;
    else score = 0.22;
  } else if (koppenCode === "ET") {
    score = 0.05 - o.tundraPenalty;
  } else if (koppenCode.startsWith("A")) {
    score = 0.08 - o.tropicalPenalty;
  } else {
    score = 0.14; // unknown
  }

  // Montane bonus (Caucasus/Anatolia uplands)
  if (isMontane) score += o.montaneBonus;

  // Elevation soft penalty
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.14 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 16);
    score -= 0.06 * t;
  }

  // Arability proxy (light)
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + cap
  score = Math.max(0, Math.min(1, score));
  score = Math.min(score, o.cap);

  prov.materials.woods_dogwood = score;
}

/**
 * Hazel wood plausibility (broad Eurasian temperate + forest-steppe).
 * Writes prov.materials.woods_hazel = score (0..1).
 *
 * CK3 scope:
 * - world_europe, world_asia_minor, world_steppe_west, world_steppe_central, world_siberia
 *
 * Proxy:
 * - Best: Cfb/Cfa (temperate humid), also Cfc (cool oceanic) decent
 * - Good: Dfb/Dfa/Dwa/Dwb (continental mixed forest)
 * - Moderate: BSk (forest-steppe / riparian)
 * - Low: BSh
 * - Weak/near-zero: Dfc/Dfd (harsh subarctic), ET (tundra)
 * - Exclude: BW deserts, E polar (incl ET by default), glacier/ice
 */
function hazelPossibleInProvince(prov, opts = {}) {
  const o = {
    // Hazel is not alpine; allow uplands but cap high mountains
    maxElevM: 2400,
    softElevM: 1500,

    // Can occur on slopes but prefers lower/mid slopes and valleys
    maxSlopeMeanDeg: 22,

    // Arability proxy: moderate (hazel likes productive woodland margins)
    arabilityPenaltyIfZero: 0.09,
    arabilityBonusIfHigh: 0.06,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate weighting (hazel is very C-friendly)
    baseC: 0.62,
    baseD: 0.54,
    bonusCfbCfa: 0.14,
    bonusCfc: 0.06,
    bonusDfbDfa: 0.10,

    // Penalties for cold/dry extremes
    subarcticPenalty: 0.22, // Dfc/Dfd/Dwc/Dwd
    tundraPenalty: 0.60,    // ET basically no
    steppePenalty: 0.10,    // applied to steppe baselines
    bskBase: 0.36,          // forest-steppe (hazel can persist in pockets)
    bshBase: 0.18,          // dry steppe low

    mediterraneanPenaltyLowland: 0.08, // hazel can exist in Anatolia, better in uplands/wetter zones
    montaneBonus: 0.05,                // mild: uplands can be good if not too high
    coastalBonus: 0.02,

    // Keep it regional-ish but fairly common in temperate zones
    cap: 0.92,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_hazel = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_hazel = 0; return; }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_hazel = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_hazel = 0; return; }

  const isMontane = o.montaneTerrains.has(terrain);

  // --- Score ---
  let score = 0.16;

  if (koppenCode.startsWith("C")) {
    score = o.baseC;

    if (koppenCode === "CFB" || koppenCode === "CFA") score += o.bonusCfbCfa;
    if (koppenCode === "CFC") score += o.bonusCfc;

    // Mediterranean: hazel not dominant in dry lowlands, more in wetter/montane zones
    if (koppenCode.startsWith("CS") && !isMontane && (elevM == null || elevM < 700)) {
      score -= o.mediterraneanPenaltyLowland;
    }
  } else if (koppenCode.startsWith("D")) {
    score = o.baseD;

    if (/^DF[AB]$|^DW[AB]$/.test(koppenCode)) score += o.bonusDfbDfa;

    // Harsh subarctic: much less hazel
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score -= o.subarcticPenalty;
  } else if (koppenCode.startsWith("BS")) {
    // Forest-steppe / riparian pockets
    if (koppenCode === "BSK") score = o.bskBase - o.steppePenalty * 0.3;
    else if (koppenCode === "BSH") score = o.bshBase - o.steppePenalty;
    else score = 0.22;
  } else if (koppenCode === "ET") {
    score = 0.05 - o.tundraPenalty;
  } else if (koppenCode.startsWith("A")) {
    // tropical: generally not this material set
    score = 0.08;
  } else {
    score = 0.14;
  }

  // Mild montane bonus (Anatolia/Caucasus uplands)
  if (isMontane) score += o.montaneBonus;

  // Elevation soft penalty
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.16 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (hazel prefers less extreme slopes)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 14);
    score -= 0.07 * t;
  }

  // Arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + cap
  score = Math.max(0, Math.min(1, score));
  score = Math.min(score, o.cap);

  prov.materials.woods_hazel = score;
}

/**
 * Hickory wood plausibility (CK3-style: East/Inner Asia hardwood bucket).
 * Writes prov.materials.woods_hickory = score (0..1).
 *
 * CK3 regions:
 * - world_burma, world_steppe_east, world_tibet
 *
 * Biome proxy:
 * - Best: Cwa/Cwb/Cfa (monsoon uplands / humid subtropical), Dwa/Dwb/Dfa/Dfb (temperate continental)
 * - Good: Cfb (cool uplands), some Am (monsoon lowlands) if not too lowland-hot
 * - Moderate: BSk (forest-steppe/riparian), low: BSh
 * - Exclude: BW deserts, E climates, glacier/ice, extreme alpine
 */
function hickoryPossibleInProvince(prov, opts = {}) {
  const o = {
    // Allow Tibet margins and uplands, but not extreme alpine/ice
    maxElevM: 4200,
    softElevM: 2600,

    // Hardwood forests can exist on slopes; keep penalty light
    maxSlopeMeanDeg: 26,

    // Hickory-like hardwood availability correlates somewhat with productive soils
    arabilityPenaltyIfZero: 0.10,
    arabilityBonusIfHigh: 0.06,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate bases (temperate/continental emphasis, with monsoon upland support)
    baseCwaCwb: 0.74,   // monsoon uplands (great)
    baseCfa: 0.62,      // humid subtropical (good)
    baseCfb: 0.52,      // cool uplands (good)
    baseDwarm: 0.62,    // Dwa/Dwb/Dfa/Dfb (good)
    harshDpenalty: 0.20,// Dfc/Dfd etc reduced

    baseAm: 0.42,       // monsoon lowlands (moderate)
    baseAw: 0.24,       // savanna low
    afPenalty: 0.18,    // rainforest not a "hickory" signal

    // Steppe: forest-steppe pockets
    baseBSk: 0.38,
    baseBSh: 0.18,
    steppeDryPenalty: 0.08,

    mediterraneanPenalty: 0.22,
    tropicalPenalty: 0.18,

    // Tibet/Himalaya capture
    montaneBonus: 0.10,
    foothillElevFrom: 700,
    foothillElevTo: 2400,
    foothillBonusMax: 0.10,

    coastalBonus: 0.02,

    // Keep it from becoming “everywhere in the tropics”
    capLowlandTropics: 0.55,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_hickory = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_hickory = 0; return; }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_hickory = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_hickory = 0; return; }

  const isMontane = o.montaneTerrains.has(terrain);

  // --- Score ---
  let score = 0.18;

  // Köppen suitability
  if (koppenCode === "CWA" || koppenCode === "CWB") {
    score = o.baseCwaCwb;
  } else if (koppenCode === "CFA") {
    score = o.baseCfa;
  } else if (koppenCode === "CFB") {
    score = o.baseCfb;
  } else if (koppenCode.startsWith("D")) {
    score = o.baseDwarm;
    // penalize harsher D (subarctic-ish)
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score -= o.harshDpenalty;
    // small bump for the “good” warm D types
    if (/^DF[AB]$|^DW[AB]$/.test(koppenCode)) score += 0.04;
  } else if (koppenCode === "AM") {
    score = o.baseAm;
  } else if (koppenCode === "AW" || koppenCode === "AS") {
    score = o.baseAw;
  } else if (koppenCode === "AF") {
    score = Math.max(0, o.baseAm - o.afPenalty);
  } else if (koppenCode.startsWith("BS")) {
    if (koppenCode === "BSK") score = o.baseBSk;
    else if (koppenCode === "BSH") score = o.baseBSh - o.steppeDryPenalty;
    else score = 0.22;
  } else if (koppenCode.startsWith("C")) {
    score = 0.34;
    if (koppenCode.startsWith("CS")) score -= o.mediterraneanPenalty;
  } else if (koppenCode.startsWith("A")) {
    score = 0.22 - o.tropicalPenalty * 0.5;
  } else {
    score = 0.12;
  }

  // Terrain + elevation: boost foothills/montane hardwood zones
  if (isMontane) score += o.montaneBonus;

  if (elevM != null) {
    // foothill band bonus (helps Tibet margins / upland Burma)
    if (elevM >= o.foothillElevFrom && elevM <= o.foothillElevTo) {
      const t = (elevM - o.foothillElevFrom) / (o.foothillElevTo - o.foothillElevFrom);
      score += o.foothillBonusMax * Math.max(0, Math.min(1, t));
    } else if (elevM > o.foothillElevTo) {
      score += o.foothillBonusMax * 0.6;
    }

    // soft penalty at very high altitude
    if (elevM > o.softElevM) {
      const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
      score -= 0.18 * Math.max(0, Math.min(1, t));
    }
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 16);
    score -= 0.06 * t;
  }

  // Arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Cap lowland tropical so it doesn't paint all of Burma as "hickory"
  const lowland = (elevM != null ? elevM < 500 : false);
  const isTropical = koppenCode.startsWith("A") || koppenCode === "AM" || koppenCode === "AW" || koppenCode === "AS";
  if (lowland && isTropical && !isMontane) score = Math.min(score, o.capLowlandTropics);

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.woods_hickory = score;
}

/**
 * Palm wood plausibility (CK3-style: North Africa / Middle East / Asia Minor).
 * Writes prov.materials.woods_palm = score (0..1).
 *
 * Interpretation:
 * - Mostly "date palm / oasis palm" availability in hot arid/subtropical regions.
 * - Best: BWh, BSh (hot desert / hot steppe), and some Csa/Csb (warm Mediterranean),
 *   plus some Aw/As in hot margins if present.
 * - Exclude: polar E*, cold continental D*, glaciers/ice, extreme alpine.
 *
 * Notes:
 * - If your generator makes deserts as BW and steppe as BS, this will concentrate palms there.
 * - If you later add a river/oasis signal, you can boost palms strongly along rivers in BW/BSh.
 */
function palmPossibleInProvince(prov, opts = {}) {
  const o = {
    // Palms are lowland-biased; allow some uplands but penalize hard
    maxElevM: 1800,
    softElevM: 700,

    // Slopes: palms prefer flats/valleys; penalize steep
    maxSlopeMeanDeg: 16,

    // Arability proxy: can help (oases/irrigated valleys)
    arabilityPenaltyIfZero: 0.10,
    arabilityBonusIfHigh: 0.10,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic"]),
    // deserts are not excluded (they're the *core*), so don't include "desert" here

    // Climate bases
    baseBWh: 0.62,  // hot desert: palms in oases/valleys -> medium-high but not max everywhere
    baseBWk: 0.28,  // cold desert: much less
    baseBSh: 0.58,  // hot steppe: quite plausible
    baseBSk: 0.22,  // cold steppe: low

    baseCsa: 0.42,  // warm Mediterranean: palms plausible in warm lowlands/coasts
    baseCsb: 0.30,
    baseCfa: 0.20,  // humid subtropical (edge cases)
    baseCfb: 0.10,

    tropicalPenalty: 0.25, // A* generally not this regional bucket
    continentalPenalty: 0.40, // D* mostly no
    polarPenalty: 0.65, // E* no

    coastalBonus: 0.06,

    // Keep deserts from becoming "all palm everywhere" without oasis signal
    desertCap: 0.75,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (o.badTerrains.has(terrain)) { prov.materials.woods_palm = 0; return; }
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_palm = 0; return; }
  if (koppenGroup === "D" || koppenCode.startsWith("D")) { prov.materials.woods_palm = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_palm = 0; return; }

  // --- Score ---
  let score = 0.10;

  // Köppen-driven
  if (koppenCode === "BWH") {
    score = o.baseBWh;
  } else if (koppenCode === "BWK") {
    score = o.baseBWk;
  } else if (koppenCode === "BSH") {
    score = o.baseBSh;
  } else if (koppenCode === "BSK") {
    score = o.baseBSk;
  } else if (koppenCode === "CSA") {
    score = o.baseCsa;
  } else if (koppenCode === "CSB") {
    score = o.baseCsb;
  } else if (koppenCode === "CFA") {
    score = o.baseCfa;
  } else if (koppenCode === "CFB") {
    score = o.baseCfb;
  } else if (koppenCode.startsWith("A")) {
    // Tropical climates are not the intended regional bucket; keep low
    score = 0.18 - o.tropicalPenalty;
  } else if (koppenCode.startsWith("C")) {
    // Other temperate C climates: small
    score = 0.16;
  } else {
    score = 0.10;
  }

  // Terrain adjustments:
  // Palms often indicate irrigated valleys/coasts; mountains are less suitable.
  if (terrain === "mountains" || terrain === "highlands") score -= 0.12;
  if (terrain === "hills") score -= 0.05;

  // Elevation penalties (strong)
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.30 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (palms prefer flatter)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 12);
    score -= 0.18 * t;
  }

  // Arability proxy: oases/irrigation hint
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  // Coastal warmth bonus
  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + cap for deserts (until you have oasis/river detection)
  score = Math.max(0, Math.min(1, score));
  if (koppenCode === "BWH" || koppenCode === "BWK") score = Math.min(score, o.desertCap);

  prov.materials.woods_palm = score;
}

/**
 * Mulberry wood plausibility (warm-temperate / subtropical cultivated-wood vibe).
 * Writes prov.materials.woods_mulberry = score (0..1).
 *
 * CK3 scope:
 * - world_africa_north, world_asia_minor, world_europe_south, world_india, world_middle_east
 *
 * Proxy:
 * - Best: Cs* (Mediterranean), Cfa (humid subtropical), Cwa/Cwb (monsoon subtropical uplands)
 * - Good: Cfb (mild temperate), Am/Aw moderate (India edges) but not rainforest-centric
 * - Modest: BSh/BSk (semi-arid) only as irrigated pockets
 * - Exclude: E* polar, BW* desert (nearly none), glacier/ice; strongly penalize D*
 */
function mulberryPossibleInProvince(prov, opts = {}) {
  const o = {
    // Mulberry is lowland–mid elevation; not alpine
    maxElevM: 2400,
    softElevM: 1400,

    // Prefers gentler terrain (cultivation/valleys)
    maxSlopeMeanDeg: 18,

    // Arability proxy matters more (cultivated/orchard signal)
    arabilityPenaltyIfZero: 0.14,
    arabilityBonusIfHigh: 0.12,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate bases / bonuses
    baseC: 0.46,
    baseCs: 0.64,        // Mediterranean core
    baseCfa: 0.62,       // humid subtropical core
    baseCwaCwb: 0.58,    // India subtropical monsoon uplands
    baseCfb: 0.44,       // mild temperate (southern Europe uplands)
    baseAm: 0.36,        // monsoon tropics (mulberry cultivated, but not everywhere)
    baseAw: 0.26,        // savanna/seasonal tropics (limited)
    baseBSH: 0.24,       // semi-arid irrigated pockets
    baseBSK: 0.16,       // cold semi-arid pockets

    // Penalties
    desertPenalty: 0.20,     // applied if BW slips through as non-terrain desert
    continentalPenalty: 0.32,// D climates reduced
    tropicalRainPenalty: 0.22,// Af is not a mulberry signal
    montanePenaltyHigh: 0.10,// very rugged mountains less cultivated

    coastalBonus: 0.05,

    // Keep it from blanketing all semi-arid zones
    capSemiArid: 0.55,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_mulberry = 0; return; }
  if (koppenCode.startsWith("BW")) { 
    // Without oasis/river signals, keep deserts near-zero
    prov.materials.woods_mulberry = 0; 
    return; 
  }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_mulberry = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_mulberry = 0; return; }

  const isMontane = o.montaneTerrains.has(terrain);

  // --- Score ---
  let score = 0.16;

  // Köppen suitability
  if (koppenCode.startsWith("C")) {
    score = o.baseC;

    if (koppenCode.startsWith("CS")) score = o.baseCs;
    else if (koppenCode === "CFA") score = o.baseCfa;
    else if (koppenCode === "CWA" || koppenCode === "CWB") score = o.baseCwaCwb;
    else if (koppenCode === "CFB") score = o.baseCfb;
  } else if (koppenCode.startsWith("D")) {
    // Not impossible (cultivation), but much less aligned with the CK3 regional set
    score = 0.22 - o.continentalPenalty;
  } else if (koppenCode.startsWith("BS")) {
    // Semi-arid: irrigated pockets only
    if (koppenCode === "BSH") score = o.baseBSH;
    else if (koppenCode === "BSK") score = o.baseBSK;
    else score = 0.18;
  } else if (koppenCode.startsWith("A")) {
    // Tropics: mulberry exists as cultivation, but not rainforest-centric
    if (koppenCode === "AF") score = Math.max(0, o.baseAm - o.tropicalRainPenalty);
    else if (koppenCode === "AM") score = o.baseAm;
    else if (koppenCode === "AW" || koppenCode === "AS") score = o.baseAw;
    else score = 0.22;
  } else {
    score = 0.12;
  }

  // Terrain adjustments: cultivation bias away from harsh mountains
  if (terrain === "mountains") score -= o.montanePenaltyHigh;
  else if (terrain === "highlands") score -= o.montanePenaltyHigh * 0.5;

  // Elevation soft penalty
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.20 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 12);
    score -= 0.14 * t;
  }

  // Arability proxy (stronger signal for this one)
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  // Coastal boost (Mediterranean belts)
  if (prov.isCoastal) score += o.coastalBonus;

  // Cap semi-arid results so it doesn't paint all steppe as mulberry
  if (koppenCode === "BSH" || koppenCode === "BSK") score = Math.min(score, o.capSemiArid);

  // Clamp + write
  score = Math.max(0, Math.min(1, score));
  prov.materials.woods_mulberry = score;
}

/**
 * Mediterranean woods plausibility (regional Mediterranean basin bucket).
 * Writes prov.materials.woods_mediterranean = score (0..1).
 *
 * CK3 scope:
 * - world_africa_north, world_europe_west_iberia, world_europe_south,
 *   world_asia_minor, world_middle_east_jerusalem (+ a few duchies)
 *
 * Proxy:
 * - Best: Cs* (Csa/Csb/Csc)
 * - Good: Cfa (humid subtropical near Med), Cfb (milder uplands near Med)
 * - Patchy: BSh/BSk (semi-arid margins; woods in pockets)
 * - Exclude: BW deserts (near zero), D/E climates, glacier/ice
 */
function mediterraneanWoodsPossibleInProvince(prov, opts = {}) {
  const o = {
    // Med woods are generally low-to-mid elevation (uplands ok, but not alpine)
    maxElevM: 2600,
    softElevM: 1500,

    // Prefer gentler terrain overall; allow hills
    maxSlopeMeanDeg: 20,

    // Arability proxy: helps (woodlands/maquis on usable land)
    arabilityPenaltyIfZero: 0.10,
    arabilityBonusIfHigh: 0.06,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate tuning
    baseCs: 0.78,         // Mediterranean core
    baseCfa: 0.52,        // humid subtropical (Med-adjacent)
    baseCfb: 0.44,        // mild uplands (some Med woods)
    baseC: 0.34,          // other C climates modest
    baseBSh: 0.30,        // semi-arid margins, patchy
    baseBSk: 0.22,
    steppeCap: 0.55,      // keep steppe from being too woody
    desertNearZero: 0.03, // if you choose to allow BW as oasis later

    tropicalPenalty: 0.35,     // A climates mostly not “Mediterranean woods”
    continentalPenalty: 0.40,  // D climates mostly not
    polarPenalty: 0.70,        // E climates no

    // Terrain nuance:
    // Mediterranean woods often occur in hills; but harsh mountains reduce cultivation/cover.
    hillBonus: 0.05,
    mountainPenalty: 0.08,

    coastalBonus: 0.05,

    // Keep it "regional-ish"
    cap: 0.92,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_mediterranean = 0; return; }
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_mediterranean = 0; return; }
  if (koppenGroup === "D" || koppenCode.startsWith("D")) { prov.materials.woods_mediterranean = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_mediterranean = 0; return; }

  // BW deserts: keep essentially zero (no oasis/river signal yet)
  if (koppenCode.startsWith("BW")) { prov.materials.woods_mediterranean = 0; return; }

  // --- Score ---
  let score = 0.16;

  if (koppenCode.startsWith("CS")) {
    score = o.baseCs;
    // Very cool-summer Mediterranean (Csc) can be more montane; keep but slightly lower
    if (koppenCode === "CSC") score -= 0.06;
  } else if (koppenCode === "CFA") {
    score = o.baseCfa;
  } else if (koppenCode === "CFB") {
    score = o.baseCfb;
  } else if (koppenCode.startsWith("C")) {
    score = o.baseC;
  } else if (koppenCode.startsWith("BS")) {
    // semi-arid margins (Spain interior edges, Levant, etc.) -> patchy woods
    score = (koppenCode === "BSH") ? o.baseBSh : o.baseBSk;
  } else if (koppenCode.startsWith("A")) {
    score = Math.max(0, 0.18 - o.tropicalPenalty);
  } else {
    score = 0.12;
  }

  // Terrain adjustments
  if (terrain === "hills") score += o.hillBonus;
  if (terrain === "highlands") score += o.hillBonus * 0.6;
  if (terrain === "mountains") score -= o.mountainPenalty;

  // Elevation soft penalty
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.18 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 12);
    score -= 0.12 * t;
  }

  // Arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  // Coastal bonus (Mediterranean littoral effect)
  if (prov.isCoastal) score += o.coastalBonus;

  // Cap steppe results so interior semi-arid doesn't become “Mediterranean woods everywhere”
  if (koppenCode === "BSH" || koppenCode === "BSK") score = Math.min(score, o.steppeCap);

  // Clamp + cap
  score = Math.max(0, Math.min(1, score));
  score = Math.min(score, o.cap);

  prov.materials.woods_mediterranean = score;
}


/**
 * "Regional - Sri Lanka" woods plausibility.
 * Writes prov.materials.woods_sri_lanka = score (0..1).
 *
 * Interpretation:
 * - Tropical island / south-India + Sri Lanka style woods:
 *   humid tropical + monsoon forests, some seasonal dry forests, and upland montane forests.
 *
 * Proxy:
 * - Best: Af, Am
 * - Good: Aw/As (seasonal tropics) but lower than Af/Am
 * - Some: Cwa/Cwb (monsoon uplands), Cfa (humid subtropical edge)
 * - Exclude: BW deserts, most BS steppe, D/E climates, glacier/ice, extreme alpine
 */
function sriLankaWoodsPossibleInProvince(prov, opts = {}) {
  const o = {
    // Sri Lanka woods are mostly lowland–mid elevation; allow uplands but not alpine
    maxElevM: 2600,
    softElevM: 1600,

    // Forests can be on slopes; keep penalty light
    maxSlopeMeanDeg: 26,

    // Arability proxy: moderate (wetter soils support woods)
    arabilityPenaltyIfZero: 0.08,
    arabilityBonusIfHigh: 0.06,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate weights
    baseAf: 0.82,          // rainforest core
    baseAm: 0.76,          // monsoon core
    baseAw: 0.58,          // seasonal tropics (dry-zone forests)
    awDryPenalty: 0.08,    // keep Aw from being too high if it's very dry in your model

    baseCwaCwb: 0.62,      // monsoon uplands (central highlands)
    baseCfa: 0.42,         // humid subtropical edge case
    baseC: 0.28,           // other C modest
    steppeBase: 0.12,      // generally too dry; keep low
    steppeDryPenalty: 0.08,

    coastalBonus: 0.04,    // island/coastal humidity moderation
    montaneBonus: 0.06,    // upland forests

    // Keep it "regional": cap outside A/monsoon upland
    capOutsideCore: 0.70,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_sri_lanka = 0; return; }
  if (koppenGroup === "D" || koppenCode.startsWith("D")) { prov.materials.woods_sri_lanka = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_sri_lanka = 0; return; }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_sri_lanka = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_sri_lanka = 0; return; }

  const isMontane = o.montaneTerrains.has(terrain);

  // --- Score ---
  let score = 0.18;

  if (koppenCode === "AF") {
    score = o.baseAf;
  } else if (koppenCode === "AM") {
    score = o.baseAm;
  } else if (koppenCode === "AW" || koppenCode === "AS") {
    score = o.baseAw - o.awDryPenalty;
  } else if (koppenCode === "CWA" || koppenCode === "CWB") {
    score = o.baseCwaCwb;
  } else if (koppenCode === "CFA") {
    score = o.baseCfa;
  } else if (koppenCode.startsWith("BS")) {
    // Dry margins: tiny chance only
    score = o.steppeBase;
    if (koppenCode === "BSH") score -= o.steppeDryPenalty;
    if (koppenCode === "BSK") score += 0.02;
  } else if (koppenCode.startsWith("C")) {
    score = o.baseC;
    if (koppenCode.startsWith("CS")) score -= 0.06;
  } else if (koppenCode.startsWith("A")) {
    // Other tropical variants: moderate
    score = 0.48;
  } else {
    score = 0.10;
  }

  // Terrain: central highlands / wet slopes
  if (isMontane) score += o.montaneBonus;

  // Elevation soft penalty
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.16 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 18);
    score -= 0.06 * t;
  }

  // Arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Cap outside core climates
  const isCore = (koppenCode === "AF" || koppenCode === "AM" || koppenCode === "AW" || koppenCode === "AS" ||
                  koppenCode === "CWA" || koppenCode === "CWB");
  score = Math.max(0, Math.min(1, score));
  if (!isCore) score = Math.min(score, o.capOutsideCore);

  prov.materials.woods_sri_lanka = score;
}

/**
 * Regional - East Asia woods plausibility.
 * Writes prov.materials.woods_asia_east = score (0..1).
 *
 * Interpretation:
 * - Broad East Asian woodland/hardwood availability across:
 *   monsoon subtropics (south China/Japan/Korea lowlands), temperate mixed forests (NE China),
 *   and montane belts (China interior uplands).
 *
 * Proxy:
 * - Best: Cfa, Cwa, Cwb, Dwa/Dwb/Dfa/Dfb
 * - Good: Cfb (uplands/coastal cool temperate)
 * - Moderate: BSk (forest-steppe pockets), low: BSh
 * - Exclude: BW deserts, E polar, glacier/ice, extreme alpine
 */
function eastAsiaWoodsPossibleInProvince(prov, opts = {}) {
  const o = {
    // East Asia woods span lowland -> upland, but not ice/alpine extremes
    maxElevM: 3600,
    softElevM: 2200,

    // Woods can be on slopes; keep penalty light
    maxSlopeMeanDeg: 26,

    // Arability proxy: moderate
    arabilityPenaltyIfZero: 0.08,
    arabilityBonusIfHigh: 0.05,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate bases
    baseCfa: 0.68,
    baseCwaCwb: 0.70,
    baseCfb: 0.52,
    baseDwarm: 0.64,       // Dwa/Dwb/Dfa/Dfb
    harshDpenalty: 0.22,   // Dfc/Dfd/Dwc/Dwd

    // Steppe edges
    baseBSk: 0.34,
    baseBSh: 0.16,
    steppeDryPenalty: 0.08,

    // Tropics / deserts / polar handling
    baseAm: 0.42,          // monsoon tropics (southern edge)
    baseAw: 0.26,
    rainforestPenalty: 0.18, // Af less “East Asia woods” signal
    tropicalCapLowland: 0.60,

    montaneBonus: 0.08,    // interior uplands / mountain forests
    coastalBonus: 0.02,

    // Keep it “regional” (broad but not universal)
    cap: 0.92,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_asia_east = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_asia_east = 0; return; }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_asia_east = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_asia_east = 0; return; }

  const isMontane = o.montaneTerrains.has(terrain);

  // --- Score ---
  let score = 0.18;

  if (koppenCode === "CFA") {
    score = o.baseCfa;
  } else if (koppenCode === "CWA" || koppenCode === "CWB") {
    score = o.baseCwaCwb;
  } else if (koppenCode === "CFB") {
    score = o.baseCfb;
  } else if (koppenCode.startsWith("D")) {
    score = o.baseDwarm;
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score -= o.harshDpenalty;
    if (/^DF[AB]$|^DW[AB]$/.test(koppenCode)) score += 0.04;
  } else if (koppenCode.startsWith("BS")) {
    if (koppenCode === "BSK") score = o.baseBSk;
    else if (koppenCode === "BSH") score = o.baseBSh - o.steppeDryPenalty;
    else score = 0.22;
  } else if (koppenCode === "AM") {
    score = o.baseAm;
  } else if (koppenCode === "AW" || koppenCode === "AS") {
    score = o.baseAw;
  } else if (koppenCode === "AF") {
    score = Math.max(0, o.baseAm - o.rainforestPenalty);
  } else if (koppenCode.startsWith("C")) {
    score = 0.34;
    if (koppenCode.startsWith("CS")) score -= 0.10;
  } else if (koppenCode.startsWith("A")) {
    score = 0.24;
  } else {
    score = 0.12;
  }

  // Montane bonus (China interior uplands / forested mountains)
  if (isMontane) score += o.montaneBonus;

  // Elevation soft penalty (very high alpine reduces woods)
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.16 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 16);
    score -= 0.06 * t;
  }

  // Arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Cap lowland tropical so it doesn't become “tropical everywhere”
  const lowland = (elevM != null ? elevM < 500 : false);
  const isTropical = koppenCode.startsWith("A") || koppenCode === "AM" || koppenCode === "AW" || koppenCode === "AS";
  if (lowland && isTropical && !isMontane) score = Math.min(score, o.tropicalCapLowland);

  // Clamp + cap
  score = Math.max(0, Math.min(1, score));
  score = Math.min(score, o.cap);

  prov.materials.woods_asia_east = score;
}

/**
 * Regional - Southeast Asia woods plausibility (tropical hardwood bucket).
 * Writes prov.materials.woods_asia_southeast = score (0..1).
 *
 * Interpretation:
 * - SE Asia tropical hardwood availability:
 *   rainforest (Af), monsoon forests (Am), seasonal tropical forests (Aw/As),
 *   plus monsoon uplands (Cwa/Cwb) and some humid subtropical fringes (Cfa).
 *
 * Proxy:
 * - Best: Af, Am
 * - Good: Aw/As
 * - Some: Cwa/Cwb, Cfa, Cfb (upland humid)
 * - Low: BS* (dry pockets)
 * - Exclude: BW* deserts, D* continental cold, E* polar, glacier/ice
 */
function southeastAsiaWoodsPossibleInProvince(prov, opts = {}) {
  const o = {
    // Tropical forests to mid-montane; not alpine/ice
    maxElevM: 3200,
    softElevM: 2000,

    // Forests can occur on slopes
    maxSlopeMeanDeg: 28,

    // Arability proxy: moderate
    arabilityPenaltyIfZero: 0.07,
    arabilityBonusIfHigh: 0.05,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate bases
    baseAf: 0.86,
    baseAm: 0.80,
    baseAw: 0.66,
    baseCwaCwb: 0.70,
    baseCfa: 0.56,
    baseCfb: 0.44,

    // Dry/cold penalties
    steppeBase: 0.16,      // very limited
    steppeDryPenalty: 0.08,

    montaneBonus: 0.08,    // mid-montane tropical forests
    coastalBonus: 0.03,

    // Keep it “regional”: cap non-core climates
    capOutsideCore: 0.75,
    cap: 0.96,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_asia_southeast = 0; return; }
  if (koppenGroup === "D" || koppenCode.startsWith("D")) { prov.materials.woods_asia_southeast = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_asia_southeast = 0; return; }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_asia_southeast = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_asia_southeast = 0; return; }

  const isMontane = o.montaneTerrains.has(terrain);

  // --- Score ---
  let score = 0.18;

  if (koppenCode === "AF") {
    score = o.baseAf;
  } else if (koppenCode === "AM") {
    score = o.baseAm;
  } else if (koppenCode === "AW" || koppenCode === "AS") {
    score = o.baseAw;
  } else if (koppenCode === "CWA" || koppenCode === "CWB") {
    score = o.baseCwaCwb;
  } else if (koppenCode === "CFA") {
    score = o.baseCfa;
  } else if (koppenCode === "CFB") {
    score = o.baseCfb;
  } else if (koppenCode.startsWith("BS")) {
    // Dry pockets (rare)
    score = o.steppeBase;
    if (koppenCode === "BSH") score -= o.steppeDryPenalty;
    if (koppenCode === "BSK") score += 0.02;
  } else if (koppenCode.startsWith("A")) {
    score = 0.52; // other tropical: moderate
  } else if (koppenCode.startsWith("C")) {
    score = 0.34; // other temperate: low
    if (koppenCode.startsWith("CS")) score -= 0.10;
  } else {
    score = 0.12;
  }

  // Montane bonus (SE Asia highlands)
  if (isMontane) score += o.montaneBonus;

  // Elevation soft penalty (very high altitudes reduce tropical woods)
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.16 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 18);
    score -= 0.06 * t;
  }

  // Arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Cap outside the tropical/monsoon core
  const isCore = (
    koppenCode === "AF" || koppenCode === "AM" ||
    koppenCode === "AW" || koppenCode === "AS" ||
    koppenCode === "CWA" || koppenCode === "CWB"
  );
  score = Math.max(0, Math.min(1, score));
  if (!isCore) score = Math.min(score, o.capOutsideCore);
  score = Math.min(score, o.cap);

  prov.materials.woods_asia_southeast = score;
}

/**
 * Regional - Northeast Asia woods plausibility.
 * Writes prov.materials.woods_asia_northeast = score (0..1).
 *
 * Interpretation:
 * - NE Asia woodland material: mixed forests + taiga-edge, continental monsoon.
 *
 * Proxy:
 * - Best: Dwa/Dwb/Dfa/Dfb
 * - Good: Cfa/Cfb, some Dfc (taiga) but penalized
 * - Moderate: BSk (forest-steppe / riparian)
 * - Low: BSh, very low: Aw/Am/Af
 * - Exclude: BW deserts, E polar, glacier/ice, extreme alpine
 */
function northeastAsiaWoodsPossibleInProvince(prov, opts = {}) {
  const o = {
    // NE Asia woods can extend into cooler uplands but not alpine/ice
    maxElevM: 3000,
    softElevM: 1900,

    // Woods can be on slopes; keep penalty light
    maxSlopeMeanDeg: 26,

    // Arability proxy: moderate (mixed forests / productive valleys)
    arabilityPenaltyIfZero: 0.08,
    arabilityBonusIfHigh: 0.05,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    desertTerrains: new Set(["desert"]),
    montaneTerrains: new Set(["mountains", "highlands", "hills"]),

    // Climate bases
    baseDwarm: 0.74,     // Dwa/Dwb/Dfa/Dfb core
    bonusBestD: 0.06,    // bump for the best warm D
    baseCfa: 0.50,       // southern fringe / coastal Korea/Japan-ish edges
    baseCfb: 0.46,
    baseCwaCwb: 0.40,    // some NE China monsoon-influenced areas (but more "East" than "NE")

    // Taiga / harsh continental
    baseDfc: 0.34,       // taiga-edge: some wood, but lower
    harshDpenalty: 0.10, // additional for Dfd etc

    // Steppe edges
    baseBSk: 0.40,       // forest-steppe belt can still have woods
    baseBSh: 0.14,
    steppeDryPenalty: 0.10,

    // Tropics are wrong for this material
    tropicalPenalty: 0.40,

    montaneBonus: 0.07,
    coastalBonus: 0.02,

    // Keep it regional-ish
    cap: 0.92,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.materials = prov.materials || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.materials.woods_asia_northeast = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.materials.woods_asia_northeast = 0; return; }
  if (o.badTerrains.has(terrain) || o.desertTerrains.has(terrain)) { prov.materials.woods_asia_northeast = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.materials.woods_asia_northeast = 0; return; }

  const isMontane = o.montaneTerrains.has(terrain);

  // --- Score ---
  let score = 0.16;

  if (/^DW[AB]$|^DF[AB]$/.test(koppenCode)) {
    // Dwa/Dwb/Dfa/Dfb core
    score = o.baseDwarm + o.bonusBestD;
  } else if (koppenCode.startsWith("D")) {
    // Other D: allow but lower (taiga-edge)
    score = o.baseDfc;
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score -= 0.06; // colder D
    if (/^DFD$|^DWD$/.test(koppenCode)) score -= o.harshDpenalty;
  } else if (koppenCode === "CFA") {
    score = o.baseCfa;
  } else if (koppenCode === "CFB") {
    score = o.baseCfb;
  } else if (koppenCode === "CWA" || koppenCode === "CWB") {
    score = o.baseCwaCwb;
  } else if (koppenCode.startsWith("BS")) {
    if (koppenCode === "BSK") score = o.baseBSk;
    else if (koppenCode === "BSH") score = o.baseBSh - o.steppeDryPenalty;
    else score = 0.22;
  } else if (koppenCode.startsWith("A")) {
    score = Math.max(0, 0.12 - o.tropicalPenalty);
  } else if (koppenCode.startsWith("C")) {
    score = 0.28;
    if (koppenCode.startsWith("CS")) score -= 0.10;
  } else {
    score = 0.12;
  }

  // Montane bonus (range forests)
  if (isMontane) score += o.montaneBonus;

  // Elevation soft penalty (very high uplands reduce forests)
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.14 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty (light)
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 16);
    score -= 0.06 * t;
  }

  // Arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  if (prov.isCoastal) score += o.coastalBonus;

  // Clamp + cap
  score = Math.max(0, Math.min(1, score));
  score = Math.min(score, o.cap);

  prov.materials.woods_asia_northeast = score;
}

/**
 * world_innovation_elephants plausibility check (India + mainland SE Asia proxy).
 * Writes prov.innovations.elephants = score (0..1).
 *
 * Intended CK3 regions:
 * - world_india
 * - dlc_tgp_mainland_southeast_asia_region
 *
 * Proxy using province fields:
 * - Best: Af/Am/Aw + Cwa/Cwb (tropical/monsoon + monsoon uplands)
 * - OK: Cfa (humid subtropical edge), some BSh only if lowland & not too arid (kept low)
 * - Exclude: E (polar), D (cold continental), BW (desert), glacier/ice/lava
 * - Strongly penalize high elevation and very steep/rugged alpine terrain
 */
function elephantsPossibleInProvince(prov, opts = {}) {
  const o = {
    // Elevation: Asian elephants are mostly lowland; some foothills ok; high alpine no
    maxElevM: 2600,
    softElevM: 1400,

    // Slopes: elephants can traverse hills but extreme slopes reduce plausibility
    maxSlopeMeanDeg: 22,

    // Your arability proxy can loosely correlate with productive lowlands (better habitat + humans)
    arabilityPenaltyIfZero: 0.10,
    arabilityBonusIfHigh: 0.08,

    badTerrains: new Set(["glacier", "ice", "lava", "volcanic", "dunes"]),
    // Treat these as “less ideal” but not auto-fail
    highRiskTerrains: new Set(["mountains"]),

    // Climate bases
    baseAf: 0.88,     // tropical rainforest (strong)
    baseAm: 0.90,     // tropical monsoon (strongest)
    baseAw: 0.80,     // tropical savanna/seasonal forest (strong)
    baseCwaCwb: 0.74, // monsoon subtropical uplands (good)
    baseCfa: 0.56,    // humid subtropical edge (some)
    baseCfb: 0.34,    // cool/mild uplands: low
    baseBSh: 0.22,    // semi-arid: small chance in irrigated pockets (kept low)
    baseBSk: 0.10,    // cold steppe: basically no

    coastalBonus: 0.02,
    lowlandBonus: 0.06,      // elephants really like lowlands
    montanePenalty: 0.10,    // penalize mountainous terrain
    ruggedPenalty: 0.08,     // penalize extreme ruggedness if you have ruggedness01

    // Keep it regional-ish (since this is an innovation region, not global)
    capOutsideCore: 0.70,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.innovations = prov.innovations || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.innovations.elephants = 0; return; }
  if (koppenGroup === "D" || koppenCode.startsWith("D")) { prov.innovations.elephants = 0; return; }
  if (koppenCode.startsWith("BW")) { prov.innovations.elephants = 0; return; }
  if (o.badTerrains.has(terrain)) { prov.innovations.elephants = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.innovations.elephants = 0; return; }

  // --- Score baseline from climate ---
  let score = 0.12;

  if (koppenCode === "AF") score = o.baseAf;
  else if (koppenCode === "AM") score = o.baseAm;
  else if (koppenCode === "AW" || koppenCode === "AS") score = o.baseAw;
  else if (koppenCode === "CWA" || koppenCode === "CWB") score = o.baseCwaCwb;
  else if (koppenCode === "CFA") score = o.baseCfa;
  else if (koppenCode === "CFB") score = o.baseCfb;
  else if (koppenCode === "BSH") score = o.baseBSh;
  else if (koppenCode === "BSK") score = o.baseBSk;
  else if (koppenCode.startsWith("A")) score = 0.70;      // other tropical: decent
  else if (koppenCode.startsWith("C")) score = 0.30;      // other temperate: low
  else if (koppenCode.startsWith("BS")) score = 0.16;     // other steppe: very low
  else score = 0.10;

  // Terrain penalties/bonuses
  if (o.highRiskTerrains.has(terrain)) score -= o.montanePenalty;

  // Lowland bonus
  if (elevM != null && elevM < 500) score += o.lowlandBonus;

  // Elevation soft penalty
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.28 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 14);
    score -= 0.14 * t;
  }

  // Ruggedness (if present; you sometimes set ruggedness01 to 0/1)
  if (prov.ruggedness01 === 1) score -= o.ruggedPenalty;

  // Arability proxy
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  // Coastal bonus (small)
  if (prov.isCoastal) score += o.coastalBonus;

  // Cap outside the “core” climates that really match India+mainland SE Asia elephant use
  const isCore =
    koppenCode === "AF" || koppenCode === "AM" || koppenCode === "AW" || koppenCode === "AS" ||
    koppenCode === "CWA" || koppenCode === "CWB";
  score = Math.max(0, Math.min(1, score));
  if (!isCore) score = Math.min(score, o.capOutsideCore);

  prov.innovations.elephants = score;
}

/**
 * world_innovation_camels plausibility check.
 * Writes prov.innovations.camels = score (0..1).
 *
 * Intended CK3 regions:
 * - world_middle_east, world_africa_east, world_africa_sahara, world_africa_north
 *
 * Proxy:
 * - Best: BWh, BSh (hot desert/steppe)
 * - Good: BWk, BSk (cold desert/steppe)
 * - Some: Csa/Csb (dry Mediterranean edges) at low elevations
 * - Low: humid climates (Af/Am/Cfa), very low: D*, none: E*
 */
function camelsPossibleInProvince(prov, opts = {}) {
  const o = {
    // Camels can operate on plateaus; hard cap only at very high alpine
    maxElevM: 3800,
    softElevM: 2400,

    // Very steep terrain is less suitable for caravan pastoralism
    maxSlopeMeanDeg: 22,

    // Arability: low arability is NOT a problem for camels (it can even imply pastoralism),
    // but total bare-rock alpine is still rough. So: tiny penalty if arability==0.
    arabilityPenaltyIfZero: 0.04,
    arabilityBonusIfHigh: 0.00, // no farming bonus

    // Exclusions: ice/glacier/lava only
    badTerrains: new Set(["glacier", "ice", "lava", "volcanic"]),

    // Climate bases
    baseBWh: 0.92,
    baseBSh: 0.84,
    baseBWk: 0.76,
    baseBSk: 0.68,

    // Dry Mediterranean / semi-arid fringe
    baseCsa: 0.44,
    baseCsb: 0.32,
    baseC: 0.22,

    // Humid penalties
    humidPenalty: 0.28,     // applied to wetter Cs/Cf etc
    monsoonPenalty: 0.38,   // Am/Aw
    rainforestPenalty: 0.55,// Af

    // Terrain/elevation modifiers
    lowlandBonus: 0.05,     // deserts lowlands
    ruggedPenalty: 0.06,    // if ruggedness01===1
    mountainPenalty: 0.08,  // mountains reduce camel “innovation” plausibility

    coastalPenaltyWet: 0.03, // many coasts in your regions are humid; slight dampening
    capOutsideAridCore: 0.70,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.innovations = prov.innovations || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();
  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) { prov.innovations.camels = 0; return; }
  if (koppenGroup === "D" || koppenCode.startsWith("D")) { prov.innovations.camels = 0; return; }
  if (o.badTerrains.has(terrain)) { prov.innovations.camels = 0; return; }
  if (elevM != null && elevM > o.maxElevM) { prov.innovations.camels = 0; return; }

  // --- Score baseline from climate ---
  let score = 0.10;

  if (koppenCode === "BWH") score = o.baseBWh;
  else if (koppenCode === "BSH") score = o.baseBSh;
  else if (koppenCode === "BWK") score = o.baseBWk;
  else if (koppenCode === "BSK") score = o.baseBSk;
  else if (koppenCode === "CSA") score = o.baseCsa;
  else if (koppenCode === "CSB") score = o.baseCsb;
  else if (koppenCode.startsWith("CS")) score = o.baseCsb - 0.06;
  else if (koppenCode.startsWith("C")) score = o.baseC;
  else if (koppenCode === "AM") score = Math.max(0, 0.32 - o.monsoonPenalty);
  else if (koppenCode === "AW" || koppenCode === "AS") score = Math.max(0, 0.28 - o.monsoonPenalty);
  else if (koppenCode === "AF") score = Math.max(0, 0.22 - o.rainforestPenalty);
  else if (koppenCode.startsWith("A")) score = Math.max(0, 0.26 - o.monsoonPenalty);
  else score = 0.12;

  // Terrain adjustments
  if (terrain === "mountains" || terrain === "highlands") score -= o.mountainPenalty;

  // Lowland bonus (helps Sahara/Arabia deserts)
  if (elevM != null && elevM < 700) score += o.lowlandBonus;

  // Elevation soft penalty
  if (elevM != null && elevM > o.softElevM) {
    const t = (elevM - o.softElevM) / (o.maxElevM - o.softElevM);
    score -= 0.18 * Math.max(0, Math.min(1, t));
  }

  // Slope penalty
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;
  if (slopeMean != null && slopeMean > o.maxSlopeMeanDeg) {
    const t = Math.min(1, (slopeMean - o.maxSlopeMeanDeg) / 14);
    score -= 0.10 * t;
  }

  // Ruggedness (binary in your data sometimes)
  if (prov.ruggedness01 === 1) score -= o.ruggedPenalty;

  // Arability proxy (tiny penalty only if totally zero)
  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null && ar <= 0) score -= o.arabilityPenaltyIfZero;

  // Slight dampening for coastal humid belts unless arid core already dominates
  if (prov.isCoastal && !(koppenCode.startsWith("BW") || koppenCode.startsWith("BS"))) {
    score -= o.coastalPenaltyWet;
  }

  // Cap outside arid core so it stays “camel region”
  const isAridCore = koppenCode.startsWith("BW") || koppenCode.startsWith("BS");
  score = Math.max(0, Math.min(1, score));
  if (!isAridCore) score = Math.min(score, o.capOutsideAridCore);

  prov.innovations.camels = score;
}

/**
 * Province-by-province plausibility for "horse buildings in hills and mountains".
 * No CK3 region/duchy gating. Uses only province physical/climate proxies.
 *
 * Writes: prov.modifiers.horse_buildings_hills_mountains = score (0..1)
 *
 * Intuition:
 * - Wants uplands (hills/highlands/mountains) OR strong topo signals (elev/slope).
 * - Best climates for horse pastoralism + upland horse culture: BS* steppe, some Cs* dry Med,
 *   and some D* continental (esp Dfa/Dfb/Dwa/Dwb). Avoid polar and tropical rainforest.
 * - Penalize extreme alpine/ice and very rugged barren rock (arability proxy).
 */
function horseBuildingsHillsMountainsPossibleInProvince(prov, opts = {}) {
  const o = {
    // Upland signal thresholds
    uplandTerrains: new Set(["hills", "highlands", "mountains"]),
    softElevM: 600,      // foothills+
    hardElevM: 3400,     // extreme alpine cutoff
    softSlopeDeg: 7,     // rolling+ hills
    hardSlopeDeg: 28,    // too steep/rocky for building focus

    // Climate baselines
    baseBS: 0.78,        // steppe: very horse-friendly
    baseBW: 0.46,        // deserts: camel > horse, but horses still exist (cap later)
    baseCs: 0.64,        // Mediterranean dry uplands: good
    baseC: 0.50,         // other temperate: moderate
    baseD: 0.58,         // continental: good (esp forest-steppe, cold steppe margins)
    baseA: 0.22,         // tropics: generally not “horse hills/mountains”
    baseOther: 0.34,

    // Penalties / bonuses
    rainforestPenalty: 0.35,    // Af worst for this
    monsoonPenalty: 0.12,       // Am/Aw somewhat worse than temperate/steppe
    polarPenalty: 0.90,         // E almost none

    // Terrain shaping
    terrainBonusHills: 0.08,
    terrainBonusHighlands: 0.06,
    terrainBonusMountains: 0.10, // mountains are the *target* here, but watch slope/elev caps
    desertTerrainPenalty: 0.06,  // if you have "desert" terrainResolved
    glacierTerrainZero: true,

    // Arability/ruggedness proxies
    arabilityBonusIfHigh: 0.10,   // supports building economy
    arabilityPenaltyIfZero: 0.12, // bare rock/alpine
    ruggedPenalty: 0.08,          // if ruggedness01===1

    // Caps
    desertCap: 0.62,              // stop BW from painting huge deserts as horse-building land
    flatCap: 0.40,                // if no upland signals, cap hard
    maxScore: 0.95,

    ...opts
  };

  if (!prov || !prov.isLand || prov.effIsLand === 0) return;
  prov.modifiers = prov.modifiers || {};

  const koppenCode = (prov.koppenCode || "").toUpperCase();
  const koppenGroup = (prov.koppenGroup || "").toUpperCase();
  const terrain = (prov.terrainResolved || "").toLowerCase();

  const elevM = Number.isFinite(prov.elevM) ? prov.elevM : null;
  const slopeMean = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : null;

  // --- Hard exclusions ---
  if (koppenGroup === "E" || koppenCode.startsWith("E")) {
    prov.modifiers.horse_buildings_hills_mountains = 0;
    return;
  }
  if (o.glacierTerrainZero && (terrain === "glacier" || terrain === "ice")) {
    prov.modifiers.horse_buildings_hills_mountains = 0;
    return;
  }
  if (elevM != null && elevM > o.hardElevM) {
    prov.modifiers.horse_buildings_hills_mountains = 0;
    return;
  }

  // --- Upland signal detection ---
  const terrainUpland = o.uplandTerrains.has(terrain);
  const elevUpland = elevM != null && elevM >= o.softElevM;
  const slopeUpland = slopeMean != null && slopeMean >= o.softSlopeDeg;
  const hasUplandSignal = terrainUpland || elevUpland || slopeUpland;

  // --- Base from climate ---
  let score = o.baseOther;

  if (koppenCode.startsWith("BS")) {
    score = o.baseBS;
    if (koppenCode === "BSK") score += 0.06; // cold steppe -> very horse-friendly
    if (koppenCode === "BSH") score -= 0.08; // hot steppe -> slightly worse
  } else if (koppenCode.startsWith("BW")) {
    score = o.baseBW;
    if (koppenCode === "BWH") score -= 0.04;
    if (koppenCode === "BWK") score += 0.02;
  } else if (koppenCode.startsWith("CS")) {
    score = o.baseCs;
    if (koppenCode === "CSA") score += 0.03;
    if (koppenCode === "CSB") score -= 0.02;
  } else if (koppenCode.startsWith("C")) {
    score = o.baseC;
    // humid subtropical edges: okay but not peak
    if (koppenCode === "CFA") score -= 0.04;
    if (koppenCode === "CFB") score -= 0.02;
  } else if (koppenCode.startsWith("D")) {
    score = o.baseD;
    // harsh subarctic: less horse-building vibe
    if (/^DF[CD]$|^DW[CD]$/.test(koppenCode)) score -= 0.18;
  } else if (koppenCode.startsWith("A")) {
    score = o.baseA;
    if (koppenCode === "AF") score -= o.rainforestPenalty;
    if (koppenCode === "AM" || koppenCode === "AW" || koppenCode === "AS") score -= o.monsoonPenalty;
  }

  // --- Terrain adjustments ---
  if (terrain === "hills") score += o.terrainBonusHills;
  else if (terrain === "highlands") score += o.terrainBonusHighlands;
  else if (terrain === "mountains") score += o.terrainBonusMountains;
  else if (terrain === "desert") score -= o.desertTerrainPenalty;

  // If no upland signal at all, this modifier should be limited
  if (!hasUplandSignal) score = Math.min(score, o.flatCap);

  // Elevation shaping: foothills help; extreme altitude hurts
  if (elevM != null) {
    // gentle bonus from 400m up to ~1400m
    if (elevM >= 400 && elevM <= 1400) {
      const t = (elevM - 400) / (1400 - 400);
      score += 0.08 * Math.max(0, Math.min(1, t));
    } else if (elevM > 1400) {
      score += 0.05;
    }

    // penalty above ~2000m (harder to support horse-building infrastructure)
    if (elevM > 2000) {
      const t = Math.min(1, (elevM - 2000) / (o.hardElevM - 2000));
      score -= 0.20 * t;
    }
  }

  // Slope shaping: moderate slopes ok; very steep slopes hurt
  if (slopeMean != null) {
    if (slopeMean > o.hardSlopeDeg) {
      const t = Math.min(1, (slopeMean - o.hardSlopeDeg) / 16);
      score -= 0.18 * t;
    } else if (slopeMean >= o.softSlopeDeg && slopeMean <= 16) {
      // slight bump for rolling hills
      const t = (slopeMean - o.softSlopeDeg) / (16 - o.softSlopeDeg);
      score += 0.04 * Math.max(0, Math.min(1, t));
    }
  }

  // Ruggedness / arability proxies
  if (prov.ruggedness01 === 1) score -= o.ruggedPenalty;

  const ar = Number.isFinite(prov.arability01_fromRuggedness) ? prov.arability01_fromRuggedness : null;
  if (ar != null) {
    if (ar <= 0) score -= o.arabilityPenaltyIfZero;
    else if (ar >= 0.65) score += o.arabilityBonusIfHigh;
  }

  // Small coastal dampening (horse upland buildings tend to be more inland), but tiny
  if (prov.isCoastal) score -= 0.02;

  // Desert cap (even if hills exist, don’t make Sahara “horse buildings everywhere”)
  if (koppenCode.startsWith("BW")) score = Math.min(score, o.desertCap);

  // Clamp
  score = Math.max(0, Math.min(1, score));
  score = Math.min(score, o.maxScore);

  prov.modifiers.horse_buildings_hills_mountains = score;
}

function assignHuntAnimals(prov) {
  if (!prov || !prov.isLand || prov.effIsLand === 0) return;

  prov.hunting = {};

  const kop = (prov.koppenCode || "").toUpperCase();
  const grp = (prov.koppenGroup || "").toUpperCase();
  const terr = (prov.terrainResolved || "").toLowerCase();
  const elev = Number.isFinite(prov.elevM) ? prov.elevM : 0;
  const slope = Number.isFinite(prov.slopeMeanDeg) ? prov.slopeMeanDeg : 0;
  const rugged = prov.ruggedness01 === 1;
  const forestish = ["forest","hills","highlands","mountains"].includes(terr);
  const open = ["steppe","plains","grassland","savanna","desert"].includes(terr);

  const clamp = v => Math.max(0, Math.min(1, v));

  /* ---------------- DEER ---------------- */
  let deer = 0.3;
  if (grp === "C") deer += 0.4;
  if (grp === "D") deer += 0.5;
  if (grp === "E") deer -= 0.6;
  if (kop.startsWith("BS")) deer += 0.1;
  if (forestish) deer += 0.15;
  if (elev > 2800) deer -= 0.3;
  prov.hunting.deer = clamp(deer);

  /* ---------------- ANTELOPE ---------------- */
  let antelope = 0.2;
  if (kop === "AW" || kop === "AS") antelope += 0.45;
  if (kop.startsWith("BS")) antelope += 0.45;
  if (kop.startsWith("BW")) antelope += 0.2;
  if (grp === "D" || grp === "E") antelope -= 0.5;
  if (forestish) antelope -= 0.2;
  prov.hunting.antelope = clamp(antelope);

  /* ---------------- GAZELLE ---------------- */
  let gazelle = 0.15;
  if (kop.startsWith("BS")) gazelle += 0.5;
  if (kop.startsWith("BW")) gazelle += 0.45;
  if (grp === "A" && !kop.startsWith("AF")) gazelle += 0.2;
  if (grp === "C") gazelle += 0.1;
  if (forestish) gazelle -= 0.35;
  if (grp === "D" || grp === "E") gazelle -= 0.6;
  prov.hunting.gazelle = clamp(gazelle);

  /* ---------------- BOAR ---------------- */
  let boar = 0.3;
  if (grp === "C") boar += 0.4;
  if (grp === "A" && kop !== "AF") boar += 0.2;
  if (grp === "D") boar += 0.15;
  if (forestish) boar += 0.25;
  if (kop.startsWith("BS") || kop.startsWith("BW")) boar -= 0.4;
  if (elev > 2500) boar -= 0.3;
  prov.hunting.boar = clamp(boar);

  /* ---------------- BEAR ---------------- */
  let bear = 0.25;
  if (grp === "D") bear += 0.5;
  if (grp === "C") bear += 0.3;
  if (grp === "E") bear += 0.2;
  if (grp === "A") bear -= 0.4;
  if (forestish) bear += 0.25;
  if (kop.startsWith("BW")) bear -= 0.6;
  prov.hunting.bear = clamp(bear);

  /* ---------------- BIG CATS ---------------- */
  let bigCat = 0.25;
  if (grp === "A") bigCat += 0.5;
  if (kop === "AW" || kop === "AS") bigCat += 0.3;
  if (grp === "C") bigCat += 0.15;
  if (grp === "D") bigCat += 0.05;
  if (elev > 2500) bigCat += 0.2; // snow leopard proxy
  if (kop.startsWith("BW")) bigCat -= 0.4;
  if (grp === "E") bigCat -= 0.7;
  prov.hunting.big_cat = clamp(bigCat);

  /* ---------------- BISON ---------------- */
  let bison = 0.2;
  if (kop === "BSK") bison += 0.5;
  if (grp === "D") bison += 0.35;
  if (grp === "C") bison += 0.2;
  if (forestish) bison += 0.15;
  if (kop.startsWith("BW") || grp === "A") bison -= 0.5;
  prov.hunting.bison = clamp(bison);

  /* ---------------- AUROCHS ---------------- */
  let aurochs = 0.25;
  if (grp === "C") aurochs += 0.35;
  if (grp === "D") aurochs += 0.3;
  if (grp === "A" && kop !== "AF") aurochs += 0.2;
  if (kop.startsWith("BS")) aurochs += 0.15;
  if (kop.startsWith("BW")) aurochs -= 0.5;
  if (elev > 3000) aurochs -= 0.4;
  prov.hunting.aurochs = clamp(aurochs);

  /* ---------------- REINDEER ---------------- */
  let reindeer = 0.0;
  if (grp === "E") reindeer += 0.9;
  if (kop === "DFC" || kop === "DWC") reindeer += 0.7;
  if (grp === "D") reindeer += 0.4;
  if (grp === "C") reindeer -= 0.4;
  if (grp === "A") reindeer -= 0.7;
  if (kop.startsWith("BW")) reindeer -= 0.6;
  prov.hunting.reindeer = clamp(reindeer);

  /* ---------------- ELK ---------------- */
  let elk = 0.25;
  if (grp === "D") elk += 0.55;
  if (grp === "C") elk += 0.3;
  if (grp === "E") elk += 0.15;
  if (forestish) elk += 0.25;
  if (grp === "A") elk -= 0.5;
  if (kop.startsWith("BW")) elk -= 0.6;
  prov.hunting.elk = clamp(elk);
}
