// ---- Lithology inference from tectonics + geomorph + basin typing (drop-in) ----
// annotateLithologyFromTectonicsAndGeom(provinces, opts)
//
// Goal: PROBABILISTIC lithology facies at province scale (not a single “true rock”).
// Writes per province (by default under p.lith):
//   lith.mix01: {
//     sedimentary01, metamorphic01, igneousExtrusive01, igneousIntrusive01,
//     volcaniclastic01, carbonate01, evaporite01, aeolianSand01
//   }
//   lith.domType: string
//   lith.domSubtype: string (optional)
//   lith.conf01: float 0..1
//   lith.igneousSetting: { arc, rift, intraplate } (0..1)
//   lith.depoEnv: string (optional)  e.g. "delta", "foreland_basin", "marine_shelf"
//   lith.meta: { basis: object of intermediate features }
//
// Requires (recommended):
//   p.tectField.boundaryKind ∈ {intraplate, convergent, divergent, transform}
//   p.tectField.distToPlateBoundary (optional but good)
//   p.tectField.distToConvergentBoundary (optional but good)
//   p.tectField.distToDivergentBoundary (from your prior function)
//   p.tectField.orogeny255, p.tectField.volcanism255, p.tectField.stress255
//   p.basinIndex01, p.basinType (from your prior function)
//   p.slopeMeanDeg, p.relief, p.ruggedness01
//   p.distanceToCoast (hop distance) and/or p.isCoastal
//   p.riverDensity or p.riverPxPerKm2, p.confluenceCount
//   p.koppenGroup / koppenCode (optional but helps)
//   p.primaryOceanId / coastalOceanIds / coastalWaterbodyIds (optional)
//
// Notes:
// - Mix fields are designed to be “fuzzy” and reflect map-scale heterogeneity.
// - domType/domSubtype are chosen from the mix + context.
// - You can later map domType to CK3 terrain resources, building materials, etc.

function annotateLithologyFromTectonicsAndGeom(provinces, opts = {}) {
  const {
    // where to write (top-level key)
    writeKey = "lith",

    // if true, skip water provinces (writes water domType="water")
    skipWater = true,

    // thresholds & tuning
    t = {
      // --- normalization controls ---
      slopeSoftMaxDeg: 30,     // above this, “flatness” ~ 0
      reliefSoftMax: 90,       // above this, “low relief” ~ 0 (relief is 0..255)
      ruggedSoftMax: 1.0,      // ruggedness01 0..1

      // --- boundary distance scales (km if your dist fields are km; else px) ---
      convDistSoftMax: 250,    // distance scale where convergent influence fades
      divDistSoftMax: 250,     // distance scale where divergent influence fades
      plateDistSoftMax: 180,   // generic boundary influence fade scale

      // --- tectonic byte thresholds ---
      orogenyMin255: 80,
      stressMin255: 80,
      volcanismMin255: 60,

      // --- extrusive vs intrusive balance knobs ---
      extrusiveBias: 0.65,      // higher -> favors volcanic/extrusive in high volcanism
      intrusiveBias: 0.55,      // higher -> favors plutonic in orogens (batholiths)
      metamorphicBias: 0.70,    // higher -> favors metamorphic in orogens

      // --- depositional facies knobs ---
      carbonateWarmBias: 0.70,   // how strongly warm climates push carbonates on shelf
      evaporiteAridBias: 0.85,   // how strongly arid climates push evaporites
      aeolianAridBias: 0.75,     // arid + flat pushes aeolian sands

      // --- basin gating ---
      basinGateMin: 0.15,
      basinGateMax: 0.70,

      // --- coastal/delta cues ---
      coastalHopMax: 2,         // treat as coastal plain / shelf if distToCoast <= this
      deltaRiverMin01: 0.55,    // if river signal exceeds -> deltaic dominance

      // --- confidence tuning ---
      confFromDominance: 0.65,  // dominance separation contribution
      confFromSignal: 0.35      // signal strength contribution
    },

    // optional: if you already store basin under another key
    basinKey = null, // e.g., "derived" if you stored basinIndex01 under p.derived

    // optional: if you want to store intermediate features for debugging
    storeMeta = true
  } = opts;

  if (!Array.isArray(provinces) || !provinces.length) return provinces;

  // ---------- helpers ----------
  const clamp01 = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x;
  const safeNum = (v, d = 0) => (typeof v === "number" && isFinite(v)) ? v : d;

  function isLandProv(p) {
    if (typeof p.effIsLand === "number") return p.effIsLand === 1;
    if (typeof p.isLand === "boolean") return p.isLand;
    return true;
  }

  function getBasinObj(p) {
    return basinKey ? (p[basinKey] || {}) : p;
  }

  function flat01(p) {
    const s = safeNum(p.slopeMeanDeg, 0);
    return clamp01(1 - (s / Math.max(1e-6, t.slopeSoftMaxDeg)));
  }
  function lowRelief01(p) {
    const r = safeNum(p.relief, 0);
    return clamp01(1 - (r / Math.max(1e-6, t.reliefSoftMax)));
  }
  function lowRugged01(p) {
    const rg = safeNum(p.ruggedness01, 0);
    return clamp01(1 - (rg / Math.max(1e-6, t.ruggedSoftMax)));
  }

  function distProx01(dist, softMax) {
    // proximity to feature: 1 near, 0 far
    if (!(typeof dist === "number" && isFinite(dist))) return 0;
    return clamp01(1 - (dist / Math.max(1e-6, softMax)));
  }

  function basinGate01(basinIndex01) {
    // 0 until basinGateMin; saturates by basinGateMax
    const x = (basinIndex01 - t.basinGateMin) / Math.max(1e-6, (t.basinGateMax - t.basinGateMin));
    return clamp01(x);
  }

  function river01(p) {
    const d = (typeof p.riverPxPerKm2 === "number" && isFinite(p.riverPxPerKm2))
      ? p.riverPxPerKm2
      : safeNum(p.riverDensity, 0);

    // soft max expects "usually small"; tune if needed
    const rd = clamp01(d / 0.01);

    const c = safeNum(p.confluenceCount, (p.isConfluenceProvince ? 1 : 0));
    const cf = clamp01(c / 3);

    return clamp01(0.7 * rd + 0.3 * cf);
  }

  function climateWarm01(p) {
    // Coarse: A and C are “warm-ish”
    const g = (p.koppenGroup || "");
    if (g === "A") return 1;
    if (g === "C") return 0.7;
    if (g === "B") return 0.6; // warm deserts exist; keep partial
    return 0.2;
  }

  function climateArid01(p) {
    const g = (p.koppenGroup || "");
    if (g === "B") return 1;
    // Some continental interiors can be semi-arid; hint via low river + interiorness
    return 0;
  }

  function coastal01(p) {
    // Use hop distance if available, else isCoastal
    const dc = safeNum(p.distanceToCoast, null);
    if (dc != null) return clamp01(1 - (dc / Math.max(1, t.coastalHopMax + 4))); // fades after a few hops
    return (p.isCoastal ? 1 : 0);
  }

  function shelfLikely01(p) {
    // coastal + low slope/relief
    return clamp01(coastal01(p) * (0.6 * flat01(p) + 0.4 * lowRelief01(p)));
  }

  function inlandLakeAdj01(p) {
    // heuristic: has coastalWaterbodyIds but no ocean adjacency
    const oceanTouch = (p.primaryOceanId != null) || (Array.isArray(p.coastalOceanIds) && p.coastalOceanIds.length > 0);
    const wbTouch = Array.isArray(p.coastalWaterbodyIds) && p.coastalWaterbodyIds.length > 0;
    return (wbTouch && !oceanTouch) ? 1 : 0;
  }

  function normalizeMix(m) {
    // Keep negative out, then normalize to sum=1 if sum>0
    let sum = 0;
    for (const k in m) {
      m[k] = Math.max(0, +m[k] || 0);
      sum += m[k];
    }
    if (sum > 0) {
      for (const k in m) m[k] /= sum;
    }
    return m;
  }

  function topTwo(m) {
    let aK = null, aV = -1, bK = null, bV = -1;
    for (const k in m) {
      const v = m[k];
      if (v > aV) { bK = aK; bV = aV; aK = k; aV = v; }
      else if (v > bV) { bK = k; bV = v; }
    }
    return { aK, aV, bK, bV };
  }

  function chooseDom(p, mix, setting, depoEnv, meta) {
    // Primary by largest component, but refine with context.
    const { aK, aV, bK, bV } = topTwo(mix);

    // If sedimentary dominates, pick subtype by depositional environment / special components
    if (aK === "sedimentary01") {
      // special sedimentary flavors override if meaningful
      if (mix.evaporite01 > 0.18) return { domType: "sedimentary", domSubtype: "evaporite" };
      if (mix.carbonate01 > 0.22) return { domType: "sedimentary", domSubtype: "carbonate" };
      if (mix.aeolianSand01 > 0.18) return { domType: "sedimentary", domSubtype: "aeolian_sand" };
      if (mix.volcaniclastic01 > 0.20) return { domType: "sedimentary", domSubtype: "volcaniclastic" };

      // basin types are very informative for subtype
      const bType = meta.basinType;
      if (bType === "delta") return { domType: "sedimentary", domSubtype: "deltaic" };
      if (bType === "coastal_plain") return { domType: "sedimentary", domSubtype: "coastal_plain" };
      if (bType === "foreland") return { domType: "sedimentary", domSubtype: "foreland_basin" };
      if (bType === "rift") return { domType: "sedimentary", domSubtype: "rift_fill" };
      if (bType === "interior_endo_lake") return { domType: "sedimentary", domSubtype: "lacustrine" };
      if (bType === "interior_basin") return { domType: "sedimentary", domSubtype: "basin_fill" };

      // fallback
      if (depoEnv) return { domType: "sedimentary", domSubtype: depoEnv };
      return { domType: "sedimentary", domSubtype: "clastic" };
    }

    // Metamorphic: optionally say “orogenic” if strong orogeny/stress
    if (aK === "metamorphic01") {
      const grade = meta.metamorphicGrade01;
      const subtype = grade > 0.7 ? "high_grade_orogenic" : grade > 0.35 ? "medium_grade_orogenic" : "low_grade";
      return { domType: "metamorphic", domSubtype: subtype };
    }

    // Igneous extrusive:
    if (aK === "igneousExtrusive01") {
      const st = (setting.arc >= setting.rift && setting.arc >= setting.intraplate) ? "arc_volcanic"
               : (setting.rift >= setting.intraplate) ? "rift_basaltic"
               : "intraplate_volcanic";
      return { domType: "igneous", domSubtype: st };
    }

    // Igneous intrusive:
    if (aK === "igneousIntrusive01") {
      // intrusive tends to be batholiths in arcs/orogens, or rift-related plutons
      const st = (setting.arc >= setting.rift && setting.arc >= setting.intraplate) ? "arc_batholith"
               : (setting.rift >= setting.intraplate) ? "rift_intrusive"
               : "intraplate_intrusive";
      return { domType: "igneous", domSubtype: st };
    }

    // Fallback: choose dominant key name sans suffix
    return { domType: aK ? aK.replace(/01$/, "").replace(/([a-z])([A-Z])/g, "$1_$2") : "unknown", domSubtype: "" };
  }

  // ---------- main loop ----------
  for (let i = 0; i < provinces.length; i++) {
    const p = provinces[i];
    if (!p) continue;

    const out = (p[writeKey] ||= {});

    // Water handling
    const isLand = isLandProv(p);
    if (!isLand && skipWater) {
      out.mix01 = {
        sedimentary01: 0,
        metamorphic01: 0,
        igneousExtrusive01: 0,
        igneousIntrusive01: 0,
        volcaniclastic01: 0,
        carbonate01: 0,
        evaporite01: 0,
        aeolianSand01: 0
      };
      out.domType = "water";
      out.domSubtype = "";
      out.conf01 = 1;
      out.igneousSetting = { arc: 0, rift: 0, intraplate: 0 };
      out.depoEnv = "";
      if (storeMeta) out.meta = { basis: { isLand: false } };
      continue;
    }

    // Basin inputs
    const bObj = getBasinObj(p);
    const basinIndex01 = clamp01(safeNum(bObj.basinIndex01, 0));
    const basinType = (bObj.basinType || "none");

    // Core geom
    const fFlat = flat01(p);
    const fLowRel = lowRelief01(p);
    const fLowRug = lowRugged01(p);
    const fRiver = river01(p);

    // Tectonic
    const tf = p.tectField || {};
    const kind = tf.boundaryKind || "intraplate";
    const orog255 = safeNum(tf.orogeny255, 0);
    const volc255 = safeNum(tf.volcanism255, 0);
    const stress255 = safeNum(tf.stress255, 0);

    const proxConv = distProx01(safeNum(tf.distToConvergentBoundary, Infinity), t.convDistSoftMax);
    const proxDiv  = distProx01(safeNum(tf.distToDivergentBoundary, Infinity), t.divDistSoftMax);
    const proxPlate = distProx01(safeNum(tf.distToPlateBoundary, Infinity), t.plateDistSoftMax);

    const orog01 = clamp01((orog255 - t.orogenyMin255) / Math.max(1, (255 - t.orogenyMin255)));
    const volc01 = clamp01((volc255 - t.volcanismMin255) / Math.max(1, (255 - t.volcanismMin255)));
    const stress01 = clamp01((stress255 - t.stressMin255) / Math.max(1, (255 - t.stressMin255)));

    const basinGate = basinGate01(basinIndex01);
    const fCoast = coastal01(p);
    const fShelf = shelfLikely01(p);
    const fWarm = climateWarm01(p);
    const fAridBase = climateArid01(p);
    const fLakeAdj = inlandLakeAdj01(p);

    // If not explicitly Köppen B, still allow “semi-arid-ish” cues: low rivers + interior + warm
    const fInterior = clamp01(safeNum(p.distanceToCoast, 0) / 30);
    const fArid = clamp01(Math.max(fAridBase, (1 - fRiver) * fInterior * fWarm));

    // ---------- interpret tectonic setting ----------
    // arc: convergent + near + volcanism
    const arc = clamp01(proxConv * (0.55 + 0.45 * volc01) * (0.5 + 0.5 * orog01));
    // rift: divergent + near + volcanism
    const rift = clamp01(proxDiv * (0.65 + 0.35 * volc01));
    // intraplate volcanic: volcanism but not near boundaries
    const intraplate = clamp01(volc01 * (1 - Math.max(proxConv, proxDiv, proxPlate)));

    // boundary kind nudges
    const kindArcBoost = (kind === "convergent") ? 1.15 : 1.0;
    const kindRiftBoost = (kind === "divergent") ? 1.15 : 1.0;
    const kindXformBoost = (kind === "transform") ? 1.05 : 1.0;

    const setting = {
      arc: clamp01(arc * kindArcBoost),
      rift: clamp01(rift * kindRiftBoost),
      intraplate: clamp01(intraplate * (kind === "intraplate" ? 1.10 : 1.0))
    };

    // ---------- igneous components ----------
    // extrusive: volcanism + proximity to active settings, boosted at rifts/arcs, reduced if very “basin-y”
    const igExtr =
      t.extrusiveBias *
      clamp01(volc01 * (0.55 + 0.45 * Math.max(setting.arc, setting.rift, setting.intraplate)) * (0.70 + 0.30 * proxPlate)) *
      clamp01(1 - 0.45 * basinGate);

    // intrusive: arc/orogen proximity + orogeny/stress, somewhat independent of volcanism
    const igIntr =
      t.intrusiveBias *
      clamp01((0.55 * orog01 + 0.45 * stress01) * (0.55 + 0.45 * Math.max(setting.arc, setting.rift)) * (0.55 + 0.45 * proxPlate));

    // volcaniclastic: near volcanism + depositional (basin/coastal/river)
    const volcClastic =
      clamp01(volc01 * (0.40 + 0.60 * basinGate) * (0.35 + 0.65 * Math.max(fRiver, fShelf)));

    // ---------- metamorphic component ----------
    // orogenic metamorphism: orogeny + stress + proximity to convergent boundary, penalized if very flat/basin-y
    const metaGrade01 = clamp01((0.55 * orog01 + 0.45 * stress01) * (0.55 + 0.45 * proxConv));
    const metamorphic =
      t.metamorphicBias *
      clamp01(metaGrade01 * (0.40 + 0.60 * (1 - basinGate)) * (0.35 + 0.65 * (1 - fFlat)));

    // ---------- sedimentary component (base) ----------
    // sedimentary thrives in basins, on shelves, in low-relief/flat settings
    let sedimentary =
      clamp01(
        (0.55 * basinGate + 0.25 * fShelf + 0.20 * fRiver) *
        (0.45 + 0.55 * fFlat) *
        (0.55 + 0.45 * fLowRel)
      );

    // Foreland/rift basin fill reinforcement
    if (basinType === "foreland") sedimentary = clamp01(sedimentary * (1.05 + 0.55 * proxConv));
    if (basinType === "rift") sedimentary = clamp01(sedimentary * (1.05 + 0.55 * proxDiv));
    if (basinType === "delta") sedimentary = clamp01(sedimentary * (1.10 + 0.70 * fRiver));
    if (basinType === "coastal_plain") sedimentary = clamp01(sedimentary * (1.10 + 0.35 * fShelf));
    if (basinType === "interior_endo_lake") sedimentary = clamp01(sedimentary * (1.10 + 0.50 * fLakeAdj));

    // ---------- special sedimentary flavors ----------
    const carbonate =
      clamp01(
        t.carbonateWarmBias *
        fWarm *
        fShelf *
        (0.55 + 0.45 * fFlat) *
        (0.70 + 0.30 * (1 - volc01))
      );

    // evaporites: arid + basin + (often interior or restricted basins)
    const evaporite =
      clamp01(
        t.evaporiteAridBias *
        fArid *
        basinGate *
        (0.45 + 0.55 * (1 - fRiver)) *
        (0.55 + 0.45 * (fInterior + 0.5 * fLakeAdj))
      );

    // aeolian sands: arid + flat + low vegetation proxy (use low river as proxy)
    const aeolianSand =
      clamp01(
        t.aeolianAridBias *
        fArid *
        (0.65 + 0.35 * fFlat) *
        (0.55 + 0.45 * (1 - fRiver)) *
        (0.55 + 0.45 * (1 - fLowRug))
      );

    // If delta: prefer clastic over carbonate/evaporite/aeolian
    const deltaBoost = (basinType === "delta") ? 1 : 0;
    const deltaClasticBias = deltaBoost ? 1.25 : 1.0;

    // ---------- Build mix ----------
    // We intentionally keep “special” flavors separate; they also influence domSubtype.
    // sedimentary01 is the broader clastic-basin base (not including carbonate/evaporite/aeolian).
    const mix = normalizeMix({
      sedimentary01: sedimentary * deltaClasticBias,
      metamorphic01: metamorphic,
      igneousExtrusive01: igExtr,
      igneousIntrusive01: igIntr,
      volcaniclastic01: volcClastic,
      carbonate01: carbonate,
      evaporite01: evaporite,
      aeolianSand01: aeolianSand
    });

    // depositional environment label (optional, useful downstream)
    let depoEnv = "";
    if (basinIndex01 >= 0.25) {
      if (basinType === "delta") depoEnv = "delta";
      else if (basinType === "coastal_plain") depoEnv = "coastal_plain";
      else if (basinType === "foreland") depoEnv = "foreland_basin";
      else if (basinType === "rift") depoEnv = "rift_basin";
      else if (basinType === "interior_endo_lake") depoEnv = "lacustrine_basin";
      else if (basinType === "interior_basin") depoEnv = "interior_basin";
      else if (fShelf > 0.55) depoEnv = "marine_shelf";
      else if (fRiver > 0.60 && fFlat > 0.55) depoEnv = "alluvial_plain";
    }

    // Choose dominant type/subtype
    const meta = {
      basinIndex01, basinType,
      flat01: fFlat, lowRelief01: fLowRel, lowRugged01: fLowRug,
      river01: fRiver, coastal01: fCoast, shelf01: fShelf,
      warm01: fWarm, arid01: fArid,
      proxConv, proxDiv, proxPlate,
      orog01, volc01, stress01,
      metamorphicGrade01: metaGrade01
    };

    const dom = chooseDom(p, mix, setting, depoEnv, meta);

    // Confidence: (1) dominance separation + (2) signal strength
    const { aK, aV, bK, bV } = topTwo(mix);
    const dominanceSep = clamp01((aV - bV) / Math.max(1e-6, aV)); // 0..1
    const signalStrength =
      clamp01(
        0.35 * basinIndex01 +
        0.25 * Math.max(setting.arc, setting.rift, setting.intraplate) +
        0.25 * metaGrade01 +
        0.15 * fShelf
      );

    const conf01 = clamp01(
      t.confFromDominance * dominanceSep +
      t.confFromSignal * signalStrength
    );

    // Write outputs
    out.mix01 = mix;
    out.domType = dom.domType;
    out.domSubtype = dom.domSubtype || "";
    out.conf01 = conf01;
    out.igneousSetting = {
      arc: setting.arc,
      rift: setting.rift,
      intraplate: setting.intraplate
    };
    out.depoEnv = depoEnv;

    if (storeMeta) out.meta = { basis: meta };
  }

  return provinces;
}
