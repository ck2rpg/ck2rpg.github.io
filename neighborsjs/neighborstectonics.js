function computeProvinceTectonicStatsFromMeta(opts = {}) {
  const {
    provinces = (window.provinces || []),

    // Dimensions
    W = (window.cv ? window.cv.width : 0),
    H = (window.cv ? window.cv.height : 0),
    wrapX = true, // unused here (kept for compatibility)

    // Province raster sources (Voronoi/province ID map)
    provinceCtx = null,
    provinceCanvas = null,
    provinceImageData = null,

    // Map from province RGB int -> province index (pid)
    provinceByRgbInt = (window.provinceByRgbInt || null),

    // Tectonics meta image:
    // Expected: { W, H, data: Uint8ClampedArray } (RGBA bytes)
    tectMeta = null,

    // Your exported tectonics_meta PNG semantics:
    //   R = plateId+1 on land, 0 on water/no-plate
    //   G = edge mask (0 or 255)
    //   B = convergent mask (0 or 255)
    //   A = 255 (constant)
    //
    // These names control output property names.
    channelKeys = { r: "plateId1", g: "edge", b: "convergent", a: "alpha" },

    // How to treat tectMeta pixels where R==0 (water/no-plate)
    // - "skip": don't include them in tectonic aggregation (recommended)
    // - "count": include them (means reflect water mixing)
    waterPolicy = "skip",

    // If true, compute per-channel mode + modePct (very useful for plateId1)
    computeMode = true,

    // If true, store per-province histograms (Uint32Array[256] per channel) (memory heavy)
    storeHists = false,

    // Where to write results
    writeBack = true,
    writeKey = "tect",

    storeDebug = false,
  } = opts;

  if (!provinces || !provinces.length) return { ok: false, reason: "no provinces" };
  if (!(W > 0) || !(H > 0)) return { ok: false, reason: "missing W/H" };
  if (!tectMeta) return { ok: false, reason: "missing tectMeta" };

  const isObj = (v) => v && typeof v === "object";

  function parseMeta(x) {
    if (!x) return null;
    if (typeof x === "string") {
      const s = x.trim();
      if (!s) return null;
      try { return JSON.parse(s); } catch { return null; }
    }
    if (isObj(x)) return x;
    return null;
  }

  function getProvinceImageData() {
    if (provinceImageData && provinceImageData.data) return provinceImageData;
    if (provinceCtx && provinceCtx.getImageData) return provinceCtx.getImageData(0, 0, W, H);
    if (provinceCanvas && provinceCanvas.getContext) {
      const c = provinceCanvas.getContext("2d");
      if (c) return c.getImageData(0, 0, W, H);
    }
    return null;
  }

  function ensureProvinceByRgbInt() {
    if (provinceByRgbInt && typeof provinceByRgbInt.get === "function") return provinceByRgbInt;

    const m = new Map();
    for (let i = 0; i < provinces.length; i++) {
      const p = provinces[i];
      if (!p) continue;
      let key = null;
      if (typeof p.rgbInt === "number") key = p.rgbInt | 0;
      else if (typeof p.colorInt === "number") key = p.colorInt | 0;
      else if (Array.isArray(p.rgb) && p.rgb.length >= 3) key = ((p.rgb[0] & 255) << 16) | ((p.rgb[1] & 255) << 8) | (p.rgb[2] & 255);
      else if (Array.isArray(p.color) && p.color.length >= 3) key = ((p.color[0] & 255) << 16) | ((p.color[1] & 255) << 8) | (p.color[2] & 255);
      if (key != null) m.set(key, i);
    }
    return m.size ? m : null;
  }

  // --- Validate meta image ---
  const metaObj = parseMeta(tectMeta);
  if (!metaObj) return { ok: false, reason: "tectMeta parse failed" };

  const isImageMeta =
    typeof metaObj.W === "number" &&
    typeof metaObj.H === "number" &&
    metaObj.data &&
    (metaObj.data instanceof Uint8ClampedArray || ArrayBuffer.isView(metaObj.data));

  if (!isImageMeta) {
    return { ok: false, reason: "tectMeta is not an image meta object {W,H,data}" };
  }

  const mW = metaObj.W | 0, mH = metaObj.H | 0;
  if (mW !== (W | 0) || mH !== (H | 0)) {
    return { ok: false, reason: `tectMeta image dims ${mW}x${mH} do not match province dims ${W}x${H}` };
  }

  const provImg = getProvinceImageData();
  const rgb2pid = ensureProvinceByRgbInt();

  if (!provImg || !provImg.data) return { ok: false, reason: "missing provinceImageData/ctx/canvas for pixel scan" };
  if (!rgb2pid) return { ok: false, reason: "missing provinceByRgbInt (cannot map pixels to provinces)" };

  const pData = provImg.data;
  const tData = metaObj.data;
  const n = provinces.length;

  // =====================
  // Accumulators
  // =====================

  // All pixels in each province (from province map), regardless of meta waterPolicy
  const provincePx = new Uint32Array(n);

  // Pixels contributing to tectonic stats (may exclude water/no-plate depending on waterPolicy)
  const tectPx = new Uint32Array(n);

  // Sums per channel over tectPx
  const sumR = new Uint32Array(n);
  const sumG = new Uint32Array(n);
  const sumB = new Uint32Array(n);
  const sumA = new Uint32Array(n);

  // Boundary counts derived from masks (these are more directly useful than means)
  const edgePx = new Uint32Array(n);       // G==255
  const convPx = new Uint32Array(n);       // B==255
  const anyBoundaryPx = new Uint32Array(n); // (G||B) true (mostly same as edgePx unless you change encoding)

  // Plate histogram for "dominant plate" in a province (ignoring 0)
  // NOTE: plateId1 is 1..N for land, 0 for water
  const plateHist = new Uint32Array(n * 256); // pid*256 + plateId1

  // Optional: full histograms for every channel (heavy)
  let histR, histG, histB, histA;
  if (computeMode || storeHists) {
    histR = new Uint32Array(n * 256);
    histG = new Uint32Array(n * 256);
    histB = new Uint32Array(n * 256);
    histA = new Uint32Array(n * 256);
  }

  const idx = (x, y) => ((y * W + x) << 2);

  // =====================
  // Pixel scan
  // =====================
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = idx(x, y);

      // Province RGB from province map
      const pr = pData[i], pg = pData[i + 1], pb = pData[i + 2];
      const rgb = (pr << 16) | (pg << 8) | pb;

      const pid = rgb2pid.get(rgb);
      if (pid == null) continue;

      provincePx[pid]++;

      // Tect meta channels
      const tr = tData[i];     // plateId1 (0 water / 1..)
      const tg = tData[i + 1]; // edge mask (0/255)
      const tb = tData[i + 2]; // convergent mask (0/255)
      const ta = tData[i + 3]; // alpha (255 constant in your exporter)

      // Optionally ignore water/no-plate pixels for tectonic aggregation
      if (waterPolicy === "skip" && tr === 0) continue;

      tectPx[pid]++;

      sumR[pid] += tr;
      sumG[pid] += tg;
      sumB[pid] += tb;
      sumA[pid] += ta;

      if (tg === 255) edgePx[pid] += 1;
      if (tb === 255) convPx[pid] += 1;
      if (tg !== 0 || tb !== 0) anyBoundaryPx[pid] += 1;

      // Plate histogram (ignore 0)
      if (tr !== 0) {
        plateHist[(pid << 8) + tr] += 1;
      }

      if (histR) {
        const base = (pid << 8);
        histR[base + tr]++; histG[base + tg]++; histB[base + tb]++; histA[base + ta]++;
      }
    }
  }

  function findMode(histArr, pid, { minV = 0 } = {}) {
    const base = (pid << 8);
    let bestV = 0, bestC = 0;
    for (let v = minV; v < 256; v++) {
      const c = histArr[base + v];
      if (c > bestC) { bestC = c; bestV = v; }
    }
    return { v: bestV, c: bestC };
  }

  // =====================
  // Build per-province records
  // =====================
  const perProvince = new Array(n);
  let hit = 0;

  for (let pid = 0; pid < n; pid++) {
    const p = provinces[pid];
    if (!p) { perProvince[pid] = null; continue; }

    const ppx = provincePx[pid] | 0;
    const tpx = tectPx[pid] | 0;

    // If tectPx==0, we still might want to record provincePx, but tectonics are absent
    if (!tpx) {
      const rec = {
        provincePx: ppx,
        tectPx: 0,
        // Keep outputs predictable
        plateId: 0,
        plateIdModePct: 0,
        edgePx: 0,
        convPx: 0,
        boundaryPx: 0,
        edgeFrac: 0,
        convFrac: 0,
        boundaryFrac: 0
      };
      perProvince[pid] = rec;
      if (writeBack) {
        if (!p[writeKey] || typeof p[writeKey] !== "object") p[writeKey] = {};
        Object.assign(p[writeKey], rec);
      }
      continue;
    }

    const rMean = sumR[pid] / tpx;
    const gMean = sumG[pid] / tpx;
    const bMean = sumB[pid] / tpx;
    const aMean = sumA[pid] / tpx;

    // Dominant plate: use plateHist (ignores 0) rather than histR (which includes 0)
    const mp = findMode(plateHist, pid, { minV: 1 });

    // Modes for the masks are still useful if you want them
    let mg = null, mb = null, ma = null;
    if (computeMode && histG) {
      mg = findMode(histG, pid); // will be 0 or 255
      mb = findMode(histB, pid); // will be 0 or 255
      ma = findMode(histA, pid); // probably 255
    }

    const ePx = edgePx[pid] | 0;
    const cPx = convPx[pid] | 0;
    const bPx = anyBoundaryPx[pid] | 0;

    // Fractions over tectPx (not provincePx) by default; this matches your meta semantics when water is skipped
    const edgeFrac = ePx / tpx;
    const convFrac = cPx / tpx;
    const boundaryFrac = bPx / tpx;

    // Your exporter encodes plateId as (id+1). Convert to 0..N-1 "plateIndex" too:
    const plateId1 = mp.v | 0;              // 1..N (or 0 if none)
    const plateIndex = plateId1 ? (plateId1 - 1) : -1;

    const rec = {
      // coverage
      provincePx: ppx,
      tectPx: tpx,

      // Means (bytes averaged) — kept for completeness/debug
      [channelKeys.r + "Mean"]: rMean, // plateId1Mean (rarely meaningful except mixing)
      [channelKeys.g + "Mean"]: gMean, // edgeMean == 255*edgeFrac if masks are 0/255
      [channelKeys.b + "Mean"]: bMean, // convMean == 255*convFrac
      [channelKeys.a + "Mean"]: aMean, // alphaMean (likely 255)

      // Properly interpreted, useful tectonic summaries:
      plateId1,          // 1..N (land), 0 means none
      plateIndex,        // 0..N-1 (land), -1 means none
      plateIdModePct: (mp.c / tpx),

      // Boundary metrics in *pixels* and *fractions*
      edgePx: ePx,
      convPx: cPx,
      boundaryPx: bPx,

      edgeFrac,          // 0..1 (fraction of sampled pixels that are boundary)
      convFrac,          // 0..1 (fraction that are convergent boundary)
      boundaryFrac,      // 0..1 (fraction that are any boundary)

      // A more directly usable "intensity" in 0..255 space (optional convenience)
      edgeIntensity: Math.round(edgeFrac * 255),
      convIntensity: Math.round(convFrac * 255),
      boundaryIntensity: Math.round(boundaryFrac * 255),
    };

    if (computeMode && mg && mb && ma) {
      rec[channelKeys.g] = mg.v;
      rec[channelKeys.b] = mb.v;
      rec[channelKeys.a] = ma.v;

      rec[channelKeys.g + "ModePct"] = mg.c / tpx;
      rec[channelKeys.b + "ModePct"] = mb.c / tpx;
      rec[channelKeys.a + "ModePct"] = ma.c / tpx;
    }

    if (storeHists && histR) {
      rec._hist = {
        r: histR.slice(pid * 256, pid * 256 + 256),
        g: histG.slice(pid * 256, pid * 256 + 256),
        b: histB.slice(pid * 256, pid * 256 + 256),
        a: histA.slice(pid * 256, pid * 256 + 256),
        plate: plateHist.slice(pid * 256, pid * 256 + 256),
      };
    }

    perProvince[pid] = rec;
    hit++;

    if (writeBack) {
      if (!p[writeKey] || typeof p[writeKey] !== "object") p[writeKey] = {};
      Object.assign(p[writeKey], rec);
    }
  }

  const res = {
    ok: true,
    mode: "image",
    W, H, wrapX,
    writeBack,
    writeKey,
    provincesTotal: n,
    metaHits: hit,
    metaMisses: n - hit,
    perProvince,
    settings: {
      waterPolicy,
      channelKeys: { ...channelKeys },
      computeMode: !!computeMode,
      storeHists: !!storeHists,
    }
  };

  if (storeDebug) {
    res._tectMetaKeys = Object.keys(metaObj || {});
  }

  if (writeBack) window.tectMetaApplied = res;
  return res;
}

function computeProvinceTectonicFieldsFromProvinces(opts = {}) {
  const {
    provinces = (window.provinces || []),

    tectKey = "tect",          // where first pass wrote data
    writeBack = true,
    writeKey = "tectField",

    // distance behavior
    preferGeometric = true,    // use centroid distance if available
    wrapX = true,
    W = (window.cv ? window.cv.width : 0),

    // thresholds (very permissive – meta boundaries are often thin)
    boundaryFracThreshold = 0.002,
    convergentFracThreshold = 0.001,

    // field tuning
    boundaryFalloff = 6.0,     // provinces
    convergentBoost = 1.75,

    storeDebug = false,
  } = opts;

  if (!provinces.length) return { ok:false, reason:"no provinces" };

  const n = provinces.length;

  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const clamp255 = v => v < 0 ? 0 : v > 255 ? 255 : v|0;

  // -----------------------------
  // Helpers
  // -----------------------------
  function tect(p){ return p && p[tectKey] ? p[tectKey] : null; }

  function plateIndex(p){
    const t = tect(p);
    if (!t) return -1;
    if (typeof t.plateIndex === "number") return t.plateIndex|0;
    if (typeof t.plateId1 === "number" && t.plateId1>0) return (t.plateId1|0)-1;
    return -1;
  }

  function boundaryFrac(p){
    const t = tect(p);
    if (!t) return 0;
    if (typeof t.boundaryFrac === "number") return t.boundaryFrac;
    return clamp01((t.edgeFrac||0)+(t.convFrac||0));
  }

  function convergentFrac(p){
    const t = tect(p);
    if (!t) return 0;
    if (typeof t.convFrac === "number") return t.convFrac;
    if (typeof t.convIntensity === "number") return t.convIntensity/255;
    return 0;
  }

  function hasCoords(p){
    return typeof p.cx==="number" && typeof p.cy==="number";
  }

  function dist(a,b){
    if (!preferGeometric || !hasCoords(a) || !hasCoords(b)) return 1;
    let dx = Math.abs(a.cx - b.cx);
    if (wrapX && W>0) dx = Math.min(dx, W-dx);
    const dy = a.cy - b.cy;
    return Math.hypot(dx,dy);
  }

  // -----------------------------
  // Classify plate boundaries
  // -----------------------------
  const isPlateBoundary = new Array(n).fill(false);
  const boundaryKind = new Array(n).fill("intraplate");

  for (let i=0;i<n;i++){
    const p = provinces[i];
    const pi = plateIndex(p);
    if (pi < 0 || !Array.isArray(p.neighbors)) continue;

    let touchesOtherPlate = false;
    let convEvidence = convergentFrac(p) > convergentFracThreshold;

    for (const j of p.neighbors){
      const q = provinces[j];
      if (!q) continue;
      const qi = plateIndex(q);
      if (qi>=0 && qi!==pi){
        touchesOtherPlate = true;
        if (convergentFrac(q) > convergentFracThreshold) convEvidence = true;
      }
    }

    if (touchesOtherPlate){
      isPlateBoundary[i] = true;
      if (convEvidence) boundaryKind[i] = "convergent";
      else if (boundaryFrac(p) > boundaryFracThreshold) boundaryKind[i] = "transform";
      else boundaryKind[i] = "divergent";
    }
  }

  // -----------------------------
  // Multi-source Dijkstra
  // -----------------------------
  function multiSourceDistance(seeds){
    const D = new Float32Array(n);
    D.fill(Infinity);

    const heap = [];
    function push(i,d){
      heap.push([i,d]);
      heap.sort((a,b)=>a[1]-b[1]);
    }

    for (const i of seeds){
      D[i]=0;
      push(i,0);
    }

    while (heap.length){
      const [i,di] = heap.shift();
      if (di!==D[i]) continue;
      const p = provinces[i];
      if (!Array.isArray(p.neighbors)) continue;

      for (const j of p.neighbors){
        const q = provinces[j];
        if (!q) continue;
        const nd = di + dist(p,q);
        if (nd < D[j]){
          D[j]=nd;
          push(j,nd);
        }
      }
    }
    return D;
  }

  const boundarySeeds = [];
  const convSeeds = [];

  for (let i=0;i<n;i++){
    if (isPlateBoundary[i]) boundarySeeds.push(i);
    if (boundaryKind[i]==="convergent") convSeeds.push(i);
  }

  const distToBoundary = boundarySeeds.length ? multiSourceDistance(boundarySeeds) : new Float32Array(n).fill(Infinity);
  const distToConvergent = convSeeds.length ? multiSourceDistance(convSeeds) : new Float32Array(n).fill(Infinity);

  // -----------------------------
  // Build fields
  // -----------------------------
  for (let i=0;i<n;i++){
    const p = provinces[i];
    const dB = distToBoundary[i];
    const dC = distToConvergent[i];

    const boundaryField = Math.exp(-dB / boundaryFalloff);
    const convergentField = Math.exp(-dC / boundaryFalloff);

    const stress =
      boundaryField * (1 + convergentField * convergentBoost);

    const orogeny =
      convergentField * (1 + boundaryField);

    const volcanism =
      convergentField * convergentField;

    const rec = {
      plateIndex: plateIndex(p),
      isPlateBoundary: isPlateBoundary[i],
      boundaryKind: boundaryKind[i],

      distToPlateBoundary: isFinite(dB)?dB:null,
      distToConvergentBoundary: isFinite(dC)?dC:null,

      stress255: clamp255(stress * 255),
      orogeny255: clamp255(orogeny * 255),
      volcanism255: clamp255(volcanism * 255),
    };

    if (writeBack){
      if (!p[writeKey] || typeof p[writeKey]!=="object") p[writeKey]={};
      Object.assign(p[writeKey],rec);
    }
  }

  return {
    ok:true,
    provinces:n,
    boundaryCount:boundarySeeds.length,
    convergentCount:convSeeds.length,
    writeKey,
  };
}

function annotateProvinceSeismicAndVolcanicHazards(opts = {}) {
  const {
    provinces = (window.provinces || []),

    // Inputs written by your earlier passes
    tectKey = "tect",
    fieldKey = "tectField",

    // Output location
    writeBack = true,
    writeKey = "hazard",

    // If you have any of these already, we’ll use them; otherwise we still work.
    // These help separate ocean vs land and adjust tsunami relevance.
    landFracKey = "landFrac",         // 0..1 optional
    isWaterKey = "isWater",           // boolean optional
    isOceanKey = "isOcean",           // boolean optional
    isCoastalKey = "isCoastal",       // boolean optional

    // Calibration:
    // These are NOT “real Earth probabilities”; they’re stable knobs for believable distribution.
    // Start with these, then tune based on how many provinces you want to be “notable risk”.
    calib = {
      // Earthquake base rates by boundary kind (annual probability scale before stress/dist weighting)
      // intraplate should be very low but not zero.
      eqBaseByKind: {
        convergent: 0.030,  // 3.0%/yr proxy (lots of seismicity)
        transform:  0.020,  // 2.0%/yr proxy
        divergent:  0.012,  // 1.2%/yr proxy
        unknown:    0.010,
        intraplate: 0.0015, // 0.15%/yr proxy
      },

      // Eruption base rates by kind (annual probability proxy)
      // Most eruptions cluster at convergent + divergent (arcs + rifts).
      eruptBaseByKind: {
        convergent: 0.012,  // 1.2%/yr proxy
        divergent:  0.006,  // 0.6%/yr proxy
        transform:  0.002,  // 0.2%/yr proxy
        unknown:    0.003,
        intraplate: 0.0008, // hotspots / rare
      },

      // How fast hazards decay away from their controlling boundaries (in "distance units"
      // produced by your Dijkstra: either hops or centroid-distance depending on earlier config).
      eqFalloff: 6.0,
      eruptFalloff: 7.5,

      // Nonlinearities: >1 makes hazard concentrate at the hottest spots
      stressPower: 1.5,
      orogenyPower: 1.2,
      volcanismPower: 1.8,

      // Boosters:
      convergentEqBoost: 1.35,   // convergent quakes tend to be nastier
      transformEqBoost:  1.15,
      oceanEqPenalty:    0.75,   // dampen felt quake hazard in deep ocean provinces (still can be tsunami source)
      oceanEruptPenalty: 0.55,   // most ocean provinces shouldn’t look highly eruptive unless volcanism is strong

      // Output clamps (keeps values sane)
      maxEqAnnualP: 0.25,        // cap at 25%/yr proxy
      maxEruptAnnualP: 0.10,     // cap at 10%/yr proxy
    },

    // If true, compute a tsunami-source hint for ocean/coastal provinces
    computeTsunamiHint = true,

    storeDebug = false,
  } = opts;

  if (!provinces || !provinces.length) return { ok: false, reason: "no provinces" };

  const n = provinces.length;

  const clamp01 = (x) => x < 0 ? 0 : (x > 1 ? 1 : x);
  const clamp = (x, a, b) => x < a ? a : (x > b ? b : x);
  const clamp255 = (x) => x < 0 ? 0 : (x > 255 ? 255 : (x | 0));
  const isNum = (v) => typeof v === "number" && isFinite(v);

  function getT(p) {
    const t = p && p[tectKey];
    return (t && typeof t === "object") ? t : null;
  }
  function getF(p) {
    const f = p && p[fieldKey];
    return (f && typeof f === "object") ? f : null;
  }

  function getBoundaryKind(p) {
    const f = getF(p);
    const t = getT(p);

    // Prefer field pass classification
    if (f && typeof f.boundaryKind === "string") return f.boundaryKind;

    // Fallback: if province has convergent fraction, treat as convergent-ish
    const convFrac = t && isNum(t.convFrac) ? t.convFrac : 0;
    const bFrac = t && isNum(t.boundaryFrac) ? t.boundaryFrac : 0;

    if (convFrac > 0.001) return "convergent";
    if (bFrac > 0.002) return "unknown";
    return "intraplate";
  }

  function getStress01(p) {
    const f = getF(p);
    const t = getT(p);
    if (f && isNum(f.stress255)) return clamp01(f.stress255 / 255);
    // fallback from boundaryFrac if field missing
    const bf = t && isNum(t.boundaryFrac) ? t.boundaryFrac : 0;
    return clamp01(bf * 8); // heuristic
  }

  function getOrogeny01(p) {
    const f = getF(p);
    const t = getT(p);
    if (f && isNum(f.orogeny255)) return clamp01(f.orogeny255 / 255);
    const cf = t && isNum(t.convFrac) ? t.convFrac : 0;
    return clamp01(cf * 12);
  }

  function getVolcanism01(p) {
    const f = getF(p);
    const t = getT(p);
    if (f && isNum(f.volcanism255)) return clamp01(f.volcanism255 / 255);
    const cf = t && isNum(t.convFrac) ? t.convFrac : 0;
    return clamp01(cf * 10);
  }

  function getDistToBoundary(p) {
    const f = getF(p);
    if (f && isNum(f.distToPlateBoundary)) return f.distToPlateBoundary;
    // if missing, treat as far-ish interior so decay reduces hazard
    return null;
  }

  function getDistToConvergent(p) {
    const f = getF(p);
    if (f && isNum(f.distToConvergentBoundary)) return f.distToConvergentBoundary;
    return null;
  }

  function isLikelyOcean(p) {
    // Prefer explicit flags if you have them
    if (typeof p[isOceanKey] === "boolean") return p[isOceanKey];
    if (typeof p[isWaterKey] === "boolean") return p[isWaterKey];

    // landFrac heuristic if present
    if (isNum(p[landFracKey])) return p[landFracKey] < 0.5;

    // fallback: plateIndex -1 usually means no plate (often water)
    const t = getT(p);
    if (t && isNum(t.plateIndex)) return t.plateIndex < 0;
    if (t && isNum(t.plateId1)) return t.plateId1 === 0;

    // unknown -> treat as land-ish to avoid over-penalizing
    return false;
  }

  function isCoastal(p) {
    if (typeof p[isCoastalKey] === "boolean") return p[isCoastalKey];
    return null;
  }

  function decayExp(d, falloff) {
    if (d == null) return 0.35; // unknown distance -> moderate decay
    if (!isFinite(d)) return 0.0;
    return Math.exp(-d / falloff);
  }

  const eqBase = calib.eqBaseByKind || {};
  const erBase = calib.eruptBaseByKind || {};

  let countEqNotable = 0;
  let countEruptNotable = 0;

  for (let i = 0; i < n; i++) {
    const p = provinces[i];
    if (!p) continue;

    const kind = getBoundaryKind(p);
    const stress01 = getStress01(p);
    const orogeny01 = getOrogeny01(p);
    const volc01 = getVolcanism01(p);

    const dB = getDistToBoundary(p);
    const dC = getDistToConvergent(p);

    const ocean = isLikelyOcean(p);
    const coastal = isCoastal(p);

    // ---------------------------
    // Earthquake hazard
    // ---------------------------
    const baseEq = eqBase[kind] != null ? eqBase[kind] : (eqBase.unknown || 0.01);

    // boundary proximity matters for all quake types
    const proxEq = decayExp(dB, calib.eqFalloff);

    // stress concentrates hazard near hot zones
    const stressTerm = Math.pow(clamp01(stress01), calib.stressPower);

    // kind-specific boosts (affect both frequency and severity a bit)
    const kindBoost =
      (kind === "convergent") ? calib.convergentEqBoost :
      (kind === "transform")  ? calib.transformEqBoost :
      1.0;

    // Frequency proxy (annual probability)
    let eqAnnualP =
      baseEq *
      (0.25 + 0.75 * proxEq) *
      (0.15 + 0.85 * stressTerm) *
      kindBoost;

    // Ocean penalty: still allow high values near boundaries (tsunami sources), just damp overall
    if (ocean) eqAnnualP *= calib.oceanEqPenalty;

    eqAnnualP = clamp(eqAnnualP, 0, calib.maxEqAnnualP);

    // Severity proxy: convergent tends to be more destructive; stress & orogeny drive “badness”
    const eqSeverity01 = clamp01(
      (0.20 + 0.55 * stressTerm + 0.25 * Math.pow(orogeny01, calib.orogenyPower)) *
      (kind === "convergent" ? 1.15 : 1.0) *
      (ocean ? 0.85 : 1.0)
    );

    const eqScore01 = clamp01(eqAnnualP / calib.maxEqAnnualP); // normalize into 0..1
    const eq255 = clamp255(Math.round(255 * clamp01(0.55 * eqScore01 + 0.45 * eqSeverity01)));

    // ---------------------------
    // Volcanic eruption hazard
    // ---------------------------
    const baseEr = erBase[kind] != null ? erBase[kind] : (erBase.unknown || 0.003);

    // Volcanism is more tied to convergent distance than generic boundary distance,
    // but rifts/hotspots still correlate with boundary proximity a bit.
    const proxEr = Math.max(
      decayExp(dC, calib.eruptFalloff),        // nearest convergent
      0.55 * decayExp(dB, calib.eruptFalloff)  // generic boundary
    );

    const volcTerm = Math.pow(clamp01(volc01), calib.volcanismPower);

    let eruptionAnnualP =
      baseEr *
      (0.20 + 0.80 * proxEr) *
      (0.10 + 0.90 * volcTerm);

    if (ocean) eruptionAnnualP *= calib.oceanEruptPenalty;

    eruptionAnnualP = clamp(eruptionAnnualP, 0, calib.maxEruptAnnualP);

    // Eruption severity: volcanism drives it; convergent arcs tend to be nastier than rifts
    const eruptionSeverity01 = clamp01(
      (0.15 + 0.70 * volcTerm + 0.15 * Math.pow(stress01, 1.1)) *
      (kind === "convergent" ? 1.15 : (kind === "divergent" ? 0.95 : 1.0)) *
      (ocean ? 0.90 : 1.0)
    );

    const erScore01 = clamp01(eruptionAnnualP / calib.maxEruptAnnualP);
    const eruption255 = clamp255(Math.round(255 * clamp01(0.55 * erScore01 + 0.45 * eruptionSeverity01)));

    // ---------------------------
    // Tsunami source hint (optional)
    // ---------------------------
    // This is NOT “tsunami risk to this province”; it’s “can this province be a tsunami source?”
    // (useful for event seeding or coastal neighbor impacts).
    let tsunamiSource01 = null;
    if (computeTsunamiHint) {
      // strongest for ocean provinces on convergent/transform boundaries with high quake activity
      tsunamiSource01 = clamp01(
        (ocean ? 1.0 : 0.35) *
        (kind === "convergent" ? 1.0 : (kind === "transform" ? 0.8 : 0.35)) *
        clamp01(eqAnnualP / calib.maxEqAnnualP) *
        eqSeverity01
      );
      // If explicitly coastal land, lower but still possible (nearshore faults)
      if (coastal === true && !ocean) tsunamiSource01 *= 0.6;
    }

    const rec = {
      // Earthquakes
      eqAnnualP,                 // 0..~0.25 (proxy)
      eqSeverity01,              // 0..1
      eq255,                     // 0..255 (combined)

      // Eruptions
      eruptionAnnualP,           // 0..~0.10 (proxy)
      eruptionSeverity01,        // 0..1
      eruption255,               // 0..255 (combined)

      // helpful context
      boundaryKind: kind,
      ocean: !!ocean,
      coastal: (coastal == null ? undefined : !!coastal),
      // “drivers” for tuning
      _stress01: stress01,
      _orogeny01: orogeny01,
      _volcanism01: volc01,
      _dBoundary: dB,
      _dConvergent: dC,
      _tsunamiSource01: tsunamiSource01,
    };

    if (!storeDebug) {
      // keep it clean unless debugging
      delete rec._stress01;
      delete rec._orogeny01;
      delete rec._volcanism01;
      delete rec._dBoundary;
      delete rec._dConvergent;
    }

    if (!computeTsunamiHint) delete rec._tsunamiSource01;

    if (writeBack) {
      if (!p[writeKey] || typeof p[writeKey] !== "object") p[writeKey] = {};
      Object.assign(p[writeKey], rec);
    }

    if (eq255 >= 160) countEqNotable++;
    if (eruption255 >= 160) countEruptNotable++;
  }

  return {
    ok: true,
    provinces: n,
    writeKey,
    notable: {
      earthquakes_ge_160: countEqNotable,
      eruptions_ge_160: countEruptNotable,
    },
    note: "Annual probabilities are proxies for relative hazard ranking; tune calib.* to match desired rarity.",
  };
}

