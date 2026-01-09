// ---- River stats from indexed river map (single pass, pixel-accurate) ----
// Requirements:
//   - Province map is already on cv/ctx at W×H (the same pixels you used to build provinces).
//   - River map is drawn to rcv/rctx at the same W×H (scaled in btnLoad).
//
// Interprets river map pixels as:
//   - Source: (0,255,0) #00FF00
//   - Tributary join: (255,0,0) #FF0000
//   - Width classes: any color in RIVER_INDEXED_PALETTE (index 0..11 narrow->wide)
// Ignores (by default):
//   - Ocean magenta: #FF0080
//   - Land white:   #FFFFFF
//
// Writes per province (creates/overwrites these fields):
//   p.riverPx
//   p.riverDensity              (riverPx / areaPx)
//   p.riverPresent              (0/1)
//   p.riverSourcePx
//   p.riverJoinPx
//   p.riverClassPx              (Uint32Array-like plain array length 12)
//   p.riverClassMax             (1..12 or 0)
//   p.riverClassMin             (1..12 or 0)
//   p.riverClassMean            (weighted mean class 1..12 or 0)
//   p.riverClassP90             (approx p90 class 1..12 or 0)
// Optional if kmPerPx>0:
//   p.riverPxPerKm2
// Returns summary totals.
function computeProvinceRiverStatsFromIndexedMap(opts = {}) {
  const {
    provinces = (window.provinces || []),

    // Province map source (for pixel->province mapping)
    provinceCtx = (window.ctx || null),
    W = (window.cv ? window.cv.width : 0),
    H = (window.cv ? window.cv.height : 0),
    provinceByRgbInt = (window.provinceByRgbInt || null),

    // River map source
    riverCanvas = (typeof rcv !== "undefined" ? rcv : null),
    riverCtx = (typeof rctx !== "undefined" ? rctx : null),

    // Your palette (narrow -> wide)
    palette = (typeof RIVER_INDEXED_PALETTE !== "undefined" ? RIVER_INDEXED_PALETTE : [
      [0,255,255],[0,200,255],[0,150,255],[0,100,255],
      [0,0,255],[0,0,200],[0,0,150],[0,0,100],
      [0,85,0],[0,125,0],[0,158,0],[24,206,0],
    ]),

    // Special pixels
    sourceRGB = [0, 255, 0],
    joinRGB   = [255, 0, 0],

    // Pixels to ignore (ocean/land)
    ignoreRGBs = [
      [255, 0, 128],  // ocean magenta
      [255, 255, 255] // land white
    ],

    // If true, treat source/join pixels as also contributing to riverPx
    // (recommended true, because they are “river features”)
    countSourceJoinAsRiver = true,

    // If kmPerPx>0, write derived density per km^2
    kmPerPx = 0
  } = opts;

  if (!provinces.length) return { ok: false, reason: "no provinces" };
  if (!provinceCtx || !(W > 0) || !(H > 0)) return { ok: false, reason: "missing provinceCtx/W/H" };
  if (!provinceByRgbInt || typeof provinceByRgbInt.get !== "function") return { ok: false, reason: "missing provinceByRgbInt Map" };
  if (!riverCanvas || !riverCtx || riverCanvas.width !== W || riverCanvas.height !== H) {
    return { ok: false, reason: "missing/misaligned river canvas (rcv/rctx must be W×H)" };
  }

  // Build fast lookup: rgbInt -> classIndex (1..12). 0 means “not a width class”.
  const classByRgb = new Map();
  for (let i = 0; i < palette.length; i++) {
    const c = palette[i];
    const rgbInt = ((c[0] & 255) << 16) | ((c[1] & 255) << 8) | (c[2] & 255);
    classByRgb.set(rgbInt, i + 1); // 1..12
  }

  const srcInt  = ((sourceRGB[0]&255)<<16)|((sourceRGB[1]&255)<<8)|(sourceRGB[2]&255);
  const joinInt = ((joinRGB[0]&255)<<16)|((joinRGB[1]&255)<<8)|(joinRGB[2]&255);

  const ignoreSet = new Set();
  for (const c of ignoreRGBs) {
    const rgbInt = ((c[0] & 255) << 16) | ((c[1] & 255) << 8) | (c[2] & 255);
    ignoreSet.add(rgbInt);
  }

  // Read both images once
  const provImg = provinceCtx.getImageData(0, 0, W, H).data;
  const rivImg  = riverCtx.getImageData(0, 0, W, H).data;

  // Reset / init per-province fields
  for (let pid = 0; pid < provinces.length; pid++) {
    const p = provinces[pid];
    if (!p) continue;
    p.riverPx = 0;
    p.riverDensity = 0;
    p.riverPresent = 0;
    p.riverSourcePx = 0;
    p.riverJoinPx = 0;
    p.riverClassPx = new Array(palette.length).fill(0);
    p.riverClassMax = 0;
    p.riverClassMin = 0;
    p.riverClassMean = 0;
    p.riverClassP90 = 0;

    delete p.riverPxPerKm2;
  }

  // Totals
  let totalRiverPx = 0;
  let totalSourcePx = 0;
  let totalJoinPx = 0;
  const totalClassPx = new Array(palette.length).fill(0);

  // Main scan
  for (let i = 0; i < rivImg.length; i += 4) {
    // river pixel
    const rr = rivImg[i], rg = rivImg[i + 1], rb = rivImg[i + 2];
    const rInt = (rr << 16) | (rg << 8) | rb;

    // ignore ocean/land background
    if (ignoreSet.has(rInt)) continue;

    let isSource = false;
    let isJoin = false;
    let cls = 0;

    if (rInt === srcInt) { isSource = true; }
    else if (rInt === joinInt) { isJoin = true; }
    else {
      cls = classByRgb.get(rInt) || 0; // 1..12 or 0
      if (!cls) continue; // unknown color -> ignore
    }

    // province id from province map pixel
    const pr = provImg[i], pg = provImg[i + 1], pb = provImg[i + 2];
    const pInt = (pr << 16) | (pg << 8) | pb;
    const pid = provinceByRgbInt.get(pInt);

    if (pid == null || pid < 0 || pid >= provinces.length) continue;
    const p = provinces[pid];
    if (!p) continue;

    if (isSource) {
      p.riverSourcePx += 1;
      totalSourcePx += 1;
      if (countSourceJoinAsRiver) { p.riverPx += 1; totalRiverPx += 1; }
      continue;
    }

    if (isJoin) {
      p.riverJoinPx += 1;
      totalJoinPx += 1;
      if (countSourceJoinAsRiver) { p.riverPx += 1; totalRiverPx += 1; }
      continue;
    }

    // width class
    const idx = cls - 1; // 0..11
    p.riverPx += 1;
    p.riverClassPx[idx] += 1;

    totalRiverPx += 1;
    totalClassPx[idx] += 1;
  }

  // Finalize per province stats
  let provincesWithRivers = 0;
  let maxRiverPx = -1;
  let maxRiverProvinceId = -1;

  const km2PerPx = (kmPerPx > 0) ? (kmPerPx * kmPerPx) : 0;

  for (let pid = 0; pid < provinces.length; pid++) {
    const p = provinces[pid];
    if (!p) continue;

    const A = (p.areaPx | 0);
    const rp = (p.riverPx | 0);

    if (rp > 0 || (p.riverSourcePx|0) > 0 || (p.riverJoinPx|0) > 0) {
      p.riverPresent = 1;
    }

    p.riverDensity = (A > 0) ? (rp / A) : 0;

    if (km2PerPx > 0 && A > 0) {
      const areaKm2 = A * km2PerPx;
      p.riverPxPerKm2 = areaKm2 > 0 ? (rp / areaKm2) : 0;
    }

    if (rp > 0) {
      provincesWithRivers++;

      // min/max class + weighted mean + approx P90 class
      let minC = 0, maxC = 0;
      let wSum = 0, wN = 0;

      // P90 from histogram
      const target = Math.ceil(rp * 0.90);
      let run = 0;
      let p90 = 0;

      for (let c = 1; c <= palette.length; c++) {
        const n = p.riverClassPx[c - 1] | 0;
        if (n <= 0) continue;

        if (!minC) minC = c;
        maxC = c;

        wSum += c * n;
        wN += n;

        // P90 update
        run += n;
        if (!p90 && run >= target) p90 = c;
      }

      p.riverClassMin = minC;
      p.riverClassMax = maxC;
      p.riverClassMean = wN > 0 ? (wSum / wN) : 0;
      p.riverClassP90 = p90 || maxC || 0;
    } else {
      p.riverClassMin = 0;
      p.riverClassMax = 0;
      p.riverClassMean = 0;
      p.riverClassP90 = 0;
    }

    if (rp > maxRiverPx) { maxRiverPx = rp; maxRiverProvinceId = pid; }
  }

  return {
    ok: true,
    W, H,
    paletteClasses: palette.length,
    provinces: provinces.length,
    provincesWithRivers,
    totalRiverPx,
    totalSourcePx,
    totalJoinPx,
    totalClassPx,
    maxRiverPx,
    maxRiverProvinceId
  };
}

// ---- River network extraction for 1px centerlines (STEMS + RECURSIVE TRIBUTARIES) ----
// Rules enforced:
//   - 4-neighborhood ONLY (no diagonals).
//   - Stem: start at GREEN, walk through PALETTE pixels only. Never step onto RED joins.
//   - Tributary: start from a RED join, step onto adjacent PALETTE pixel not used by stem/trib,
//                walk away through PALETTE pixels only until terminal. Reverse order for storage.
//   - Tributaries can attach to tributaries (via red joins). We discover joins adjacent to any branch
//     and recurse outward until exhausted.
//   - Red join pixels are NEVER included in any branch pixel list; they are anchors only.
//
// Output:
//   window.riverList = [
//     { id:"1_1", kind:"stem", headwaterSeq:1, globalSeq:1, headwaterXY:[x,y], pixels?, provincesOrdered, provincesUnique, lengthPx },
//     { id:"2_1", kind:"tributary", headwaterSeq:1, globalSeq:2, joinXY:[jx,jy], mouthXY:[mx,my], pixels?, provincesOrdered, provincesUnique, lengthPx },
//     { id:"3_1", kind:"tributary", headwaterSeq:1, globalSeq:3, joinXY:[jx,jy], parentId:"2_1", ... },
//     ...
//   ]

function xyFromIdx(pi){ return [xFromIdx(pi), yFromIdx(pi)]; }

function findEndpointInfo(lastPalettePix /* index */, prevPix /* index or -1 */) {
  // classify what the endpoint is adjacent to
  const nbs = neighbors4(lastPalettePix);
  let adjPalette = 0, adjJoin = 0, adjSource = 0;
  let firstJoin = -1;

  for (let k=0;k<nbs.length;k++){
    const ni = nbs[k];
    if (ni === prevPix) continue; // ignore the pixel we came from for "forward options"
    if (rType[ni] === 1) adjPalette++;
    else if (rType[ni] === 2) { adjJoin++; if (firstJoin < 0) firstJoin = ni; }
    else if (rType[ni] === 3) adjSource++;
  }

  return {
    adjPalette, adjJoin, adjSource,
    adjacentJoinXY: (firstJoin >= 0) ? xyFromIdx(firstJoin) : null
  };
}

// ---- River network extraction for 1px centerlines (STEMS + RECURSIVE TRIBUTARIES) ----
// Integrated endpoint metadata:
//  - Stem never steps onto red joins.
//  - 4-neighborhood only (no diagonals).
//  - Each river gets explicit endpoint fields to make "receivingWaterbodyId" trivial later.
//
// Output: window.riverList = [...]
// Stem object adds:
//   endXY, endPixelIndex, endProvinceId, endReason,
//   endAdjacentPaletteOptions, endAdjacentJoinCount, endAdjacentJoinXY
// Tributary object adds:
//   mouthXY/mouthProvinceId (upstream terminal),
//   downstreamXY/downstreamProvinceId (last palette pixel before join),
//   confluenceXY/confluenceProvinceId (red join marker),
//   endReason ("terminal" | "maxSteps")
function buildRiverList_CenterlineTwoPass(opts = {}) {
  const {
    provinces = (window.provinces || []),

    // Province map (for pixel -> province mapping)
    provinceCtx = (window.ctx || null),
    W = (window.cv ? window.cv.width : 0),
    H = (window.cv ? window.cv.height : 0),
    provinceByRgbInt = (window.provinceByRgbInt || null),

    // River map
    riverCanvas = (typeof rcv !== "undefined" ? rcv : null),
    riverCtx = (typeof rctx !== "undefined" ? rctx : null),

    // Palette (width classes): these pixels are "river pixels" for paths
    palette = (typeof RIVER_INDEXED_PALETTE !== "undefined" ? RIVER_INDEXED_PALETTE : [
      [0,255,255],[0,200,255],[0,150,255],[0,100,255],
      [0,0,255],[0,0,200],[0,0,150],[0,0,100],
      [0,85,0],[0,125,0],[0,158,0],[24,206,0],
    ]),

    // Special pixels
    sourceRGB = [0, 255, 0],   // headwaters (stems only)
    joinRGB   = [255, 0, 0],   // confluences (anchors only)

    // Background pixels to ignore
    ignoreRGBs = [
      [255, 0, 128],  // ocean magenta
      [255, 255, 255] // land white
    ],

    // 4-neighborhood only (no diagonals)
    maxStepsPerPath = 2_000_000,

    // memory/perf toggles
    storePixelPath = true,

    // If true, add riversThrough[] on each province (ids)
    writeProvinceRiverMembership = true
  } = opts;

  if (!provinces.length) return { ok:false, reason:"no provinces" };
  if (!provinceCtx || !(W > 0) || !(H > 0)) return { ok:false, reason:"missing provinceCtx/W/H" };
  if (!provinceByRgbInt || typeof provinceByRgbInt.get !== "function") return { ok:false, reason:"missing provinceByRgbInt Map" };
  if (!riverCanvas || !riverCtx || riverCanvas.width !== W || riverCanvas.height !== H) {
    return { ok:false, reason:"missing/misaligned river canvas (rcv/rctx must be W×H)" };
  }

  // ---- helpers ----
  const rgbInt = (r,g,b) => ((r&255)<<16)|((g&255)<<8)|(b&255);
  const idxFromXY = (x,y) => y*W + x;
  const xFromIdx  = (i) => i % W;
  const yFromIdx  = (i) => (i / W) | 0;

  // 4-neighborhood, deterministic order: N, E, S, W
  const neighborOffsets = [[0,-1],[1,0],[0,1],[-1,0]];

  // Palette membership set
  const paletteSet = new Set();
  for (let i = 0; i < palette.length; i++) {
    const c = palette[i];
    paletteSet.add(rgbInt(c[0],c[1],c[2]));
  }

  const srcInt  = rgbInt(sourceRGB[0], sourceRGB[1], sourceRGB[2]);
  const joinInt = rgbInt(joinRGB[0], joinRGB[1], joinRGB[2]);
  const ignoreSet = new Set(ignoreRGBs.map(c => rgbInt(c[0],c[1],c[2])));

  // Read images once
  const provImg = provinceCtx.getImageData(0,0,W,H).data;
  const rivImg  = riverCtx.getImageData(0,0,W,H).data;

  const Npx = W * H;

  // rType:
  // 0 = none/background/unknown
  // 1 = palette river pixel
  // 2 = join (red)
  // 3 = source (green)
  const rType = new Uint8Array(Npx);
  const sources = [];
  const joins = [];

  for (let i = 0, p = 0; i < rivImg.length; i += 4, p++) {
    const r = rivImg[i], g = rivImg[i+1], b = rivImg[i+2];
    const ri = rgbInt(r,g,b);
    if (ignoreSet.has(ri)) continue;

    if (ri === srcInt) {
      rType[p] = 3;
      sources.push(p);
      continue;
    }
    if (ri === joinInt) {
      rType[p] = 2;
      joins.push(p);
      continue;
    }
    if (paletteSet.has(ri)) {
      rType[p] = 1;
    }
  }

  // deterministic headwater ordering
  sources.sort((a,b) => a-b);

  const stemUsed  = new Uint8Array(Npx);  // palette pixels used by stems
  const tribUsed  = new Uint8Array(Npx);  // palette pixels used by tributaries
  const stemOwner = new Uint16Array(Npx); // for palette pixels on stems: headwaterSeq (1..)

  if (writeProvinceRiverMembership) {
    for (let pid = 0; pid < provinces.length; pid++) {
      const p = provinces[pid];
      if (!p) continue;
      p.riversThrough = [];
    }
  }

  const riverList = [];
  let globalSeq = 0;

  function xyFromIdx(pi){ return [xFromIdx(pi), yFromIdx(pi)]; }

  function provinceIdAtPixelIndex(pi) {
    if (pi < 0) return -1;
    const bi = pi * 4;
    const pr = provImg[bi], pg = provImg[bi+1], pb = provImg[bi+2];
    const pInt = rgbInt(pr,pg,pb);
    const pid = provinceByRgbInt.get(pInt);
    return (pid == null) ? -1 : pid;
  }

  function provincesFromPixelPath(pathIdxs) {
    const ordered = [];
    const seen = new Set();
    let last = -999999;

    for (let k = 0; k < pathIdxs.length; k++) {
      const pid = provinceIdAtPixelIndex(pathIdxs[k]);
      if (pid < 0) continue;

      if (pid !== last) ordered.push(pid);
      last = pid;

      if (!seen.has(pid)) seen.add(pid);
    }
    return { ordered, unique: Array.from(seen) };
  }

  function neighbors4(pi) {
    const x = xFromIdx(pi), y = yFromIdx(pi);
    const out = [];
    for (let n = 0; n < neighborOffsets.length; n++) {
      const dx = neighborOffsets[n][0], dy = neighborOffsets[n][1];
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      out.push(idxFromXY(nx, ny));
    }
    return out;
  }

  // For endpoint diagnostics: count forward options (excluding prev)
  function endpointInfo(lastPalettePix, prevPix) {
    const nbs = neighbors4(lastPalettePix);
    let adjPalette = 0, adjJoin = 0, adjSource = 0;
    let firstJoin = -1;

    for (let k=0;k<nbs.length;k++){
      const ni = nbs[k];
      if (ni === prevPix) continue;
      const t = rType[ni];
      if (t === 1) adjPalette++;
      else if (t === 2) { adjJoin++; if (firstJoin < 0) firstJoin = ni; }
      else if (t === 3) adjSource++;
    }
    return {
      adjPalette,
      adjJoin,
      adjSource,
      adjacentJoinXY: (firstJoin >= 0) ? xyFromIdx(firstJoin) : null
    };
  }

  // Pick the next palette pixel along a 1px line:
  // - do not backtrack to prev
  // - choose the first candidate deterministically
  function nextPaletteStep(curr, prev, usedMask /* Uint8Array */, forbidStem /* bool */) {
    const nbs = neighbors4(curr);
    for (let k = 0; k < nbs.length; k++) {
      const ni = nbs[k];
      if (ni === prev) continue;
      if (rType[ni] !== 1) continue;                 // palette only
      if (usedMask[ni]) continue;                    // already used by this category
      if (forbidStem && stemUsed[ni]) continue;      // tributaries can't enter stem pixels
      return ni;
    }
    return -1;
  }

  // ---------- PASS 1: STEMS ----------
  // Stem path pixels = [green source] + palette pixels only.
  // IMPORTANT: stem never steps onto red joins.
  for (let s = 0; s < sources.length; s++) {
    const srcPix = sources[s];
    const headwaterSeq = s + 1;

    const path = [];
    path.push(srcPix);

    // step from green into adjacent palette
    let prev = srcPix;
    let curr = -1;

    const srcNbs = neighbors4(srcPix);
    for (let k = 0; k < srcNbs.length; k++) {
      const ni = srcNbs[k];
      if (rType[ni] === 1 && !stemUsed[ni]) { curr = ni; break; }
    }

    if (curr < 0) {
      // isolated green with no palette neighbor
      globalSeq++;
      const id = `${globalSeq}_${headwaterSeq}`;
      const hwx = xFromIdx(srcPix), hwy = yFromIdx(srcPix);
      const { ordered, unique } = provincesFromPixelPath(path);

      const obj = {
        id,
        kind:"stem",
        globalSeq,
        headwaterSeq,
        headwaterXY:[hwx,hwy],
        lengthPx: path.length,
        provincesOrdered: ordered,
        provincesUnique: unique,

        // endpoint metadata
        endXY: null,
        endPixelIndex: -1,
        endProvinceId: provinceIdAtPixelIndex(srcPix),
        endReason: "noPaletteNeighbor",
        endAdjacentPaletteOptions: 0,
        endAdjacentJoinCount: 0,
        endAdjacentJoinXY: null
      };

      if (storePixelPath) obj.pixels = path.map(pi => xyFromIdx(pi));
      riverList.push(obj);

      if (writeProvinceRiverMembership) {
        for (const pid of unique) { const p = provinces[pid]; if (p) p.riversThrough.push(id); }
      }
      continue;
    }

    let lastPalette = curr;
    let stopReason = "terminal";

    let steps = 0;
    while (steps++ < maxStepsPerPath) {
      path.push(curr);

      stemUsed[curr] = 1;
      stemOwner[curr] = headwaterSeq;

      lastPalette = curr;

      const next = nextPaletteStep(curr, prev, stemUsed, /*forbidStem*/ false);
      if (next < 0) { stopReason = "terminal"; break; }

      prev = curr;
      curr = next;
    }
    if (steps >= maxStepsPerPath) stopReason = "maxSteps";

    globalSeq++;
    const id = `${globalSeq}_${headwaterSeq}`;

    const hwx = xFromIdx(srcPix), hwy = yFromIdx(srcPix);
    const { ordered: provincesOrdered, unique: provincesUnique } = provincesFromPixelPath(path);

    const endAdj = endpointInfo(lastPalette, prev);
    const endXY = xyFromIdx(lastPalette);

    const obj = {
      id,
      kind: "stem",
      globalSeq,
      headwaterSeq,
      headwaterXY: [hwx, hwy],

      lengthPx: path.length,
      provincesOrdered,
      provincesUnique,

      // endpoint metadata (palette endpoint)
      endXY,
      endPixelIndex: lastPalette,
      endProvinceId: provinceIdAtPixelIndex(lastPalette),
      endReason: stopReason,
      // forward options excluding prev
      endAdjacentPaletteOptions: endAdj.adjPalette,
      endAdjacentJoinCount: endAdj.adjJoin,
      endAdjacentJoinXY: endAdj.adjacentJoinXY
    };

    if (storePixelPath) obj.pixels = path.map(pi => xyFromIdx(pi));
    riverList.push(obj);

    if (writeProvinceRiverMembership) {
      for (const pid of provincesUnique) {
        const p = provinces[pid];
        if (p) p.riversThrough.push(id);
      }
    }
  }

  // ---------- Joins adjacency ----------
  const joinSeen = new Uint8Array(Npx); // join pixels expanded from

  function joinIsAdjacentToMask(joinPix, mask /* Uint8Array */) {
    const nbs = neighbors4(joinPix);
    for (let k = 0; k < nbs.length; k++) {
      const ni = nbs[k];
      if (mask[ni]) return true;
    }
    return false;
  }

  function headwaterSeqFromAdjacentStem(joinPix) {
    const nbs = neighbors4(joinPix);
    for (let k = 0; k < nbs.length; k++) {
      const ni = nbs[k];
      if (stemUsed[ni]) {
        const hs = stemOwner[ni] | 0;
        if (hs) return hs;
      }
    }
    return 0;
  }

  // ---------- TRIBUTARY RECURSION ----------
  function expandJoin(joinPix, inheritedHeadwaterSeq, parentRiverId /* optional */) {
    if (joinSeen[joinPix]) return;
    joinSeen[joinPix] = 1;

    let headwaterSeq = inheritedHeadwaterSeq | 0;
    if (!headwaterSeq) headwaterSeq = headwaterSeqFromAdjacentStem(joinPix);
    if (!headwaterSeq) headwaterSeq = inheritedHeadwaterSeq | 0;

    const jx = xFromIdx(joinPix), jy = yFromIdx(joinPix);

    // Candidate downstream-most tributary palette pixels (adjacent to join)
    const nbs = neighbors4(joinPix);
    for (let k = 0; k < nbs.length; k++) {
      const joinAdjPix = nbs[k];
      if (rType[joinAdjPix] !== 1) continue;  // palette only
      if (stemUsed[joinAdjPix]) continue;     // tributaries cannot use stem pixels
      if (tribUsed[joinAdjPix]) continue;     // already used by another tributary

      // Walk away from join: joinAdjPix -> ... -> terminal (palette-only)
      const walk = [];
      let prev = joinPix;
      let curr = joinAdjPix;
      let steps = 0;

      let stopReason = "terminal";

      while (steps++ < maxStepsPerPath) {
        walk.push(curr);
        tribUsed[curr] = 1;

        const next = nextPaletteStep(curr, prev, tribUsed, /*forbidStem*/ true);
        if (next < 0) { stopReason = "terminal"; break; }

        prev = curr;
        curr = next;
      }
      if (steps >= maxStepsPerPath) stopReason = "maxSteps";

      // walk is [downstreamNearJoin ... upstreamTerminal]
      // store upstream->downstream (terminal -> ... -> join-adjacent)
      walk.reverse();

      if (!walk.length) continue;

      globalSeq++;
      const id = `${globalSeq}_${headwaterSeq || 0}`;

      const { ordered: provincesOrdered, unique: provincesUnique } = provincesFromPixelPath(walk);

      const mouthPix = walk[0];
      const downstreamPix = walk[walk.length - 1];

      const obj = {
        id,
        kind: "tributary",
        globalSeq,
        headwaterSeq,

        // upstream end (true tributary mouth / terminal)
        mouthXY: xyFromIdx(mouthPix),
        mouthProvinceId: provinceIdAtPixelIndex(mouthPix),

        // red join marker (anchor only; not in pixels)
        confluenceXY: [jx, jy],
        confluenceProvinceId: provinceIdAtPixelIndex(joinPix),

        // last palette pixel before the join (downstream-most tributary pixel)
        downstreamXY: xyFromIdx(downstreamPix),
        downstreamProvinceId: provinceIdAtPixelIndex(downstreamPix),

        parentId: parentRiverId || null,

        lengthPx: walk.length,
        provincesOrdered,
        provincesUnique,

        endReason: stopReason
      };

      if (storePixelPath) obj.pixels = walk.map(pi => xyFromIdx(pi));
      riverList.push(obj);

      if (writeProvinceRiverMembership) {
        for (const pid of provincesUnique) {
          const p = provinces[pid];
          if (p) p.riversThrough.push(id);
        }
      }

      // Recurse from any joins adjacent to any pixel in this tributary path
      for (let pi = 0; pi < walk.length; pi++) {
        const pix = walk[pi];
        const pnbs = neighbors4(pix);
        for (let t = 0; t < pnbs.length; t++) {
          const aj = pnbs[t];
          if (rType[aj] === 2 && !joinSeen[aj]) {
            expandJoin(aj, headwaterSeq, id);
          }
        }
      }
    }
  }

  // Seed recursion: joins adjacent to stems
  for (let j = 0; j < joins.length; j++) {
    const joinPix = joins[j];
    if (!joinIsAdjacentToMask(joinPix, stemUsed)) continue;
    const hs = headwaterSeqFromAdjacentStem(joinPix);
    expandJoin(joinPix, hs, null);
  }

  window.riverList = riverList;

  return {
    ok: true,
    W, H,
    headwaters: sources.length,
    stems: riverList.filter(r => r.kind === "stem").length,
    tributaries: riverList.filter(r => r.kind === "tributary").length,
    riversTotal: riverList.length
  };
}

function annotateProvincesWithRiverTopology(opts = {}) {
  const {
    provinces = (window.provinces || []),
    W = (window.cv ? window.cv.width : 0),
    H = (window.cv ? window.cv.height : 0),

    // mapping pixel -> province
    provinceCtx = (window.ctx || null),
    provinceByRgbInt = (window.provinceByRgbInt || null),

    // river list
    riverList = (window.riverList || []),

    // if true, clear & overwrite fields each run
    overwrite = true,

    // if true, store lists of ids (can be large)
    storeIdLists = true,

    // NEW: store river system info per province
    storeRiverSystems = true,

    // NEW: if true, also store per-system river id lists per province (can be large)
    storeRiverSystemRiverIds = false,

    // NEW: system key format
    systemKeyPrefix = "sys_"   // e.g. sys_7 (keyed by headwaterSeq)
  } = opts;

  if (!provinces.length) return { ok:false, reason:"no provinces" };
  if (!riverList || !riverList.length) return { ok:false, reason:"no riverList" };
  if (!provinceCtx || !(W>0) || !(H>0)) return { ok:false, reason:"missing ctx/W/H" };
  if (!provinceByRgbInt || typeof provinceByRgbInt.get !== "function") return { ok:false, reason:"missing provinceByRgbInt" };

  const rgbInt = (r,g,b) => ((r&255)<<16)|((g&255)<<8)|(b&255);
  const provImg = provinceCtx.getImageData(0,0,W,H).data;

  function pidAtXY(x,y){
    if (x<0||y<0||x>=W||y>=H) return -1;
    const i = ((y*W + x) * 4)|0;
    const pInt = rgbInt(provImg[i], provImg[i+1], provImg[i+2]);
    const pid = provinceByRgbInt.get(pInt);
    return (pid == null) ? -1 : pid;
  }

  // --- Build system lookups from riverList (NO graph needed) ---
  // headwaterSeq -> stemId (there should be exactly one stem per headwaterSeq)
  const stemIdByHeadwaterSeq = new Map();
  for (let i = 0; i < riverList.length; i++) {
    const r = riverList[i];
    if (!r || r.kind !== "stem") continue;
    const hs = (r.headwaterSeq|0);
    if (hs > 0 && !stemIdByHeadwaterSeq.has(hs)) stemIdByHeadwaterSeq.set(hs, r.id);
  }
  // helper: get system key for a river
  function systemKeyForRiver(rv) {
    const hs = (rv && (rv.headwaterSeq|0)) || 0;
    return hs > 0 ? (systemKeyPrefix + hs) : (systemKeyPrefix + "0");
  }
  function stemIdForRiverSystemKey(sysKey) {
    // sysKey = `${prefix}${hs}`
    const hsStr = String(sysKey).slice(systemKeyPrefix.length);
    const hs = (hsStr|0);
    return stemIdByHeadwaterSeq.get(hs) || null;
  }

  // Init fields
  for (let pid=0; pid<provinces.length; pid++){
    const p = provinces[pid];
    if (!p) continue;

    if (overwrite) {
      p.riverCountTotal = 0;
      p.stemCount = 0;
      p.tributaryCount = 0;

      p.isStemMouthProvince = 0;
      p.stemMouthCount = 0;

      p.stemSourceCount = 0;

      p.tributaryMouthCount = 0;
      p.isTributaryMouthProvince = 0;

      p.confluenceCount = 0;
      p.isConfluenceProvince = 0;

      p.riverHubScore = 0;

      if (storeIdLists) {
        p.stemsThrough = [];
        p.tributariesThrough = [];
        p.stemsEndingHere = [];
        p.tributariesMouthHere = [];
        p.confluencesHere = [];
      }

      if (storeRiverSystems) {
        p.riverSystems = [];
        p.riverSystemStemIds = [];
        p.riverSystemCount = 0;
        if (storeRiverSystemRiverIds) p.riverSystemRiverIds = {}; // sysKey -> [riverId...]
      }
    } else {
      p.riverCountTotal ??= 0;
      p.stemCount ??= 0;
      p.tributaryCount ??= 0;
      p.isStemMouthProvince ??= 0;
      p.stemMouthCount ??= 0;
      p.stemSourceCount ??= 0;
      p.tributaryMouthCount ??= 0;
      p.isTributaryMouthProvince ??= 0;
      p.confluenceCount ??= 0;
      p.isConfluenceProvince ??= 0;
      p.riverHubScore ??= 0;

      if (storeIdLists) {
        p.stemsThrough ??= [];
        p.tributariesThrough ??= [];
        p.stemsEndingHere ??= [];
        p.tributariesMouthHere ??= [];
        p.confluencesHere ??= [];
      }

      if (storeRiverSystems) {
        p.riverSystems ??= [];
        p.riverSystemStemIds ??= [];
        p.riverSystemCount ??= 0;
        if (storeRiverSystemRiverIds) p.riverSystemRiverIds ??= {};
      }
    }
  }

  // Helper: bump unique river id membership
  const touchedByRiver = Array.from({length: provinces.length}, () => new Set());

  // NEW: per-province system sets (unique)
  const touchedSystems = storeRiverSystems
    ? Array.from({length: provinces.length}, () => new Set())
    : null;

  function noteRiverTouch(pid, riverId){
    if (pid < 0 || pid >= provinces.length) return;
    touchedByRiver[pid].add(riverId);
  }

  function noteSystemTouch(pid, sysKey, riverId){
    if (!storeRiverSystems) return;
    if (pid < 0 || pid >= provinces.length) return;
    touchedSystems[pid].add(sysKey);

    if (storeRiverSystemRiverIds) {
      const p = provinces[pid];
      const m = p.riverSystemRiverIds;
      (m[sysKey] ||= []).push(riverId);
    }
  }

  // Walk rivers
  for (let r=0; r<riverList.length; r++){
    const rv = riverList[r];
    if (!rv || !rv.id) continue;

    const isStem = (rv.kind === "stem");
    const isTrib = (rv.kind === "tributary");
    const sysKey = systemKeyForRiver(rv);

    // 1) Province membership by pixels (best)
    if (rv.pixels && rv.pixels.length) {
      for (let k=0; k<rv.pixels.length; k++){
        const x = rv.pixels[k][0], y = rv.pixels[k][1];
        const pid = pidAtXY(x,y);
        if (pid < 0) continue;

        noteRiverTouch(pid, rv.id);
        noteSystemTouch(pid, sysKey, rv.id);

        if (storeIdLists) {
          if (isStem) provinces[pid].stemsThrough.push(rv.id);
          else if (isTrib) provinces[pid].tributariesThrough.push(rv.id);
        }
      }
    } else {
      // fallback: use provincesUnique if present
      const uniq = rv.provincesUnique || [];
      for (let k=0; k<uniq.length; k++){
        const pid = uniq[k]|0;
        if (pid < 0 || pid >= provinces.length) continue;

        noteRiverTouch(pid, rv.id);
        noteSystemTouch(pid, sysKey, rv.id);

        if (storeIdLists) {
          if (isStem) provinces[pid].stemsThrough.push(rv.id);
          else if (isTrib) provinces[pid].tributariesThrough.push(rv.id);
        }
      }
    }

    // 2) Endpoints / joins (uses pixels + join/headwater metadata)
    if (rv.pixels && rv.pixels.length) {
      const first = rv.pixels[0];
      const last  = rv.pixels[rv.pixels.length - 1];

      if (isStem) {
        // stem source (green)
        if (rv.headwaterXY) {
          const pidSrc = pidAtXY(rv.headwaterXY[0], rv.headwaterXY[1]);
          if (pidSrc >= 0) provinces[pidSrc].stemSourceCount++;
        }

        // stem mouth = last palette pixel in stem path
        const pidMouth = pidAtXY(last[0], last[1]);
        if (pidMouth >= 0) {
          provinces[pidMouth].stemMouthCount++;
          provinces[pidMouth].isStemMouthProvince = 1;
          if (storeIdLists) provinces[pidMouth].stemsEndingHere.push(rv.id);
        }
      }

      if (isTrib) {
        // tributary "mouth" (upstream terminal) = first pixel (since stored upstream->downstream)
        const pidUp = pidAtXY(first[0], first[1]);
        if (pidUp >= 0) {
          provinces[pidUp].tributaryMouthCount++;
          provinces[pidUp].isTributaryMouthProvince = 1;
          if (storeIdLists) provinces[pidUp].tributariesMouthHere.push(rv.id);
        }

        // confluence province from joinXY (red marker)
        if (rv.joinXY) {
          const pidJoin = pidAtXY(rv.joinXY[0], rv.joinXY[1]);
          if (pidJoin >= 0) {
            provinces[pidJoin].confluenceCount++;
            provinces[pidJoin].isConfluenceProvince = 1;
            if (storeIdLists) provinces[pidJoin].confluencesHere.push(rv.id);
          }
        }
      }
    } else {
      // minimal fallback
      if (isStem && rv.headwaterXY) {
        const pidSrc = pidAtXY(rv.headwaterXY[0], rv.headwaterXY[1]);
        if (pidSrc >= 0) provinces[pidSrc].stemSourceCount++;
      }
      if (isTrib && rv.joinXY) {
        const pidJoin = pidAtXY(rv.joinXY[0], rv.joinXY[1]);
        if (pidJoin >= 0) {
          provinces[pidJoin].confluenceCount++;
          provinces[pidJoin].isConfluenceProvince = 1;
        }
      }
    }
  }

  // Finalize counts + de-dupe lists + systems
  for (let pid=0; pid<provinces.length; pid++){
    const p = provinces[pid];
    if (!p) continue;

    p.riverCountTotal = touchedByRiver[pid].size;

    if (storeIdLists) {
      const uniqStem = new Set(p.stemsThrough);
      const uniqTrib = new Set(p.tributariesThrough);
      p.stemCount = uniqStem.size;
      p.tributaryCount = uniqTrib.size;

      p.stemsThrough = Array.from(uniqStem);
      p.tributariesThrough = Array.from(uniqTrib);

      // Optional: de-dupe endpoint lists too
      p.stemsEndingHere = Array.from(new Set(p.stemsEndingHere));
      p.tributariesMouthHere = Array.from(new Set(p.tributariesMouthHere));
      p.confluencesHere = Array.from(new Set(p.confluencesHere));
    }

    if (storeRiverSystems) {
      const sysArr = Array.from(touchedSystems[pid]);
      p.riverSystems = sysArr;
      p.riverSystemCount = sysArr.length;

      // Provide the stemId for each system (keyed to the stem)
      const stemIds = [];
      for (let i = 0; i < sysArr.length; i++) {
        stemIds.push(stemIdForRiverSystemKey(sysArr[i]));
      }
      p.riverSystemStemIds = stemIds;

      if (storeRiverSystemRiverIds) {
        // de-dupe each list
        const m = p.riverSystemRiverIds;
        for (const k in m) m[k] = Array.from(new Set(m[k]));
      }
    }

    // simple hub score (tweak as you like)
    p.riverHubScore =
      (p.stemCount|0) +
      (p.tributaryCount|0) +
      (p.confluenceCount|0) +
      (p.isStemMouthProvince ? 1 : 0);
  }

  return {
    ok:true,
    provinces: provinces.length,
    rivers: riverList.length,
    systems: stemIdByHeadwaterSeq.size
  };
}

// ---- Annotate rivers with receivingWaterbodyId (uses new endpoint metadata) ----
// Assumes each ocean/lake province has p.waterbodyId (number or string).
// Uses, in priority order:
//   - stem: r.endXY (preferred), else last pixel in r.pixels
//   - tributary (if stemsOnly=false): r.confluenceXY (preferred), else r.downstreamXY, else last pixel
//
// Writes on each river:
//   r.receivingWaterbodyId         (or null)
//   r.receivingWaterbodyAt         ([x,y] where detected, or null)
//   r.receivingWaterbodyProvinceId (pid where detected, or -1)
//   r.receivingSearchDist          (0..searchRadiusPx, or -1)
//
// Optionally writes on provinces (keyed by waterbodyId):
//   p.receivingRivers = [riverId...]
function annotateRiversWithReceivingWaterbodyId(opts = {}) {
  const {
    provinces = (window.provinces || []),

    // province pixel->pid
    provinceCtx = (window.ctx || null),
    W = (window.cv ? window.cv.width : 0),
    H = (window.cv ? window.cv.height : 0),
    provinceByRgbInt = (window.provinceByRgbInt || null),

    // rivers
    riverList = (window.riverList || []),

    // If true, compute for stems only (recommended). If false, also for tributaries.
    stemsOnly = true,

    // 0 = only immediate 4-neighbor check at anchor
    // >0 = BFS search within manhattan radius
    searchRadiusPx = 16,

    // If true, prefer the anchor pixel's own province first (dist=0) before checking neighbors.
    // Useful if river endpoints lie *inside* a waterbody province (rare but possible).
    checkAnchorProvinceFirst = false,

    // If true, store p.receivingRivers on provinces keyed by waterbodyId
    writeToProvinces = false,

    // If true, overwrite p.receivingRivers each run (recommended)
    overwriteProvinceReceiving = true
  } = opts;

  if (!provinces.length) return { ok:false, reason:"no provinces" };
  if (!riverList || !riverList.length) return { ok:false, reason:"no riverList" };
  if (!provinceCtx || !(W > 0) || !(H > 0)) return { ok:false, reason:"missing provinceCtx/W/H" };
  if (!provinceByRgbInt || typeof provinceByRgbInt.get !== "function") return { ok:false, reason:"missing provinceByRgbInt Map" };

  const rgbInt = (r,g,b) => ((r&255)<<16)|((g&255)<<8)|(b&255);
  const idxFromXY = (x,y) => y*W + x;
  const xFromIdx  = (i) => i % W;
  const yFromIdx  = (i) => (i / W) | 0;

  // 4-neighbor only
  const n4 = [[0,-1],[1,0],[0,1],[-1,0]];

  const provImg = provinceCtx.getImageData(0,0,W,H).data;

  function pidAtXY(x,y){
    if (x<0||y<0||x>=W||y>=H) return -1;
    const bi = ((y*W + x) * 4)|0;
    const pInt = rgbInt(provImg[bi], provImg[bi+1], provImg[bi+2]);
    const pid = provinceByRgbInt.get(pInt);
    return (pid == null) ? -1 : pid;
  }

  function waterbodyInfoAtXY(x,y){
    const pid = pidAtXY(x,y);
    if (pid < 0 || pid >= provinces.length) return null;
    const p = provinces[pid];
    if (!p) return null;
    const wb = p.waterbodyId;
    if (wb === undefined || wb === null) return null;
    return { wb, pid };
  }

  // Optional: map waterbodyId -> list of river ids
  const receivingIndex = writeToProvinces ? new Map() : null;

  function immediateNeighborHit(x,y){
    // returns best hit among immediate 4-neighbors (deterministic tie break by wb numeric/string compare)
    let best = null;
    for (let k=0;k<4;k++){
      const nx = x + n4[k][0], ny = y + n4[k][1];
      const info = waterbodyInfoAtXY(nx, ny);
      if (!info) continue;

      if (!best) {
        best = { wb: info.wb, pid: info.pid, x:nx, y:ny, dist: 1 };
      } else {
        // tie-break: smallest wb (stable)
        if (String(info.wb) < String(best.wb)) {
          best = { wb: info.wb, pid: info.pid, x:nx, y:ny, dist: 1 };
        }
      }
    }
    return best;
  }

  function bfsFindWaterbody(x0,y0,radius){
    const maxD = Math.max(0, radius|0);
    const startIdx = idxFromXY(x0,y0);

    const visited = new Uint8Array(W*H);
    // worst-case queue size for manhattan diamond is ~ (2r+1)^2; ok for small r
    const q = new Int32Array((2*maxD+1)*(2*maxD+1));
    let qh = 0, qt = 0;

    q[qt++] = startIdx;
    visited[startIdx] = 1;

    let best = null;

    while (qh < qt) {
      const idx = q[qh++];
      const x = xFromIdx(idx), y = yFromIdx(idx);

      const man = Math.abs(x - x0) + Math.abs(y - y0);
      if (man > maxD) continue;

      const info = waterbodyInfoAtXY(x,y);
      if (info) {
        if (
          !best ||
          man < best.dist ||
          (man === best.dist && String(info.wb) < String(best.wb))
        ) {
          best = { wb: info.wb, pid: info.pid, x, y, dist: man };
          if (man === 0) break;
          if (man === 1) {
            // can't beat 1 other than 0; continue only if you want wb tie-breaking at same dist,
            // but we already tie-break by wb string.
          }
        }
      }

      // expand neighbors
      for (let k=0;k<4;k++){
        const nx = x + n4[k][0], ny = y + n4[k][1];
        if (nx<0||ny<0||nx>=W||ny>=H) continue;
        const nd = Math.abs(nx - x0) + Math.abs(ny - y0);
        if (nd > maxD) continue;

        const ni = idxFromXY(nx,ny);
        if (visited[ni]) continue;
        visited[ni] = 1;
        q[qt++] = ni;
      }
    }

    return best; // {wb, pid, dist, x, y} or null
  }

  // Choose the best anchor point per river using your new metadata.
  function anchorForRiver(r){
    if (!r) return null;

    if (r.kind === "stem") {
      if (Array.isArray(r.endXY) && r.endXY.length === 2) return [r.endXY[0]|0, r.endXY[1]|0];
      if (r.pixels && r.pixels.length) {
        const last = r.pixels[r.pixels.length - 1];
        return [last[0]|0, last[1]|0];
      }
      return null;
    }

    // tributary: the most robust anchor to find the receiving waterbody is the confluence marker,
    // because it's literally on the receiving (downstream) network side.
    if (r.kind === "tributary") {
      if (Array.isArray(r.confluenceXY) && r.confluenceXY.length === 2) return [r.confluenceXY[0]|0, r.confluenceXY[1]|0];
      if (Array.isArray(r.downstreamXY) && r.downstreamXY.length === 2) return [r.downstreamXY[0]|0, r.downstreamXY[1]|0];
      if (r.pixels && r.pixels.length) {
        const last = r.pixels[r.pixels.length - 1];
        return [last[0]|0, last[1]|0];
      }
      return null;
    }

    // unknown kind fallback
    if (r.pixels && r.pixels.length) {
      const last = r.pixels[r.pixels.length - 1];
      return [last[0]|0, last[1]|0];
    }
    return null;
  }

  let annotated = 0;
  let found = 0;

  // Optional province receiving lists
  if (writeToProvinces && overwriteProvinceReceiving) {
    for (let pid=0; pid<provinces.length; pid++){
      const p = provinces[pid];
      if (!p) continue;
      // only meaningful on waterbody provinces, but we can init everywhere
      p.receivingRivers = [];
    }
  }

  for (let i=0;i<riverList.length;i++){
    const r = riverList[i];
    if (!r || !r.id) continue;
    if (stemsOnly && r.kind !== "stem") continue;

    const a = anchorForRiver(r);

    // default outputs
    r.receivingWaterbodyId = null;
    r.receivingWaterbodyAt = null;
    r.receivingWaterbodyProvinceId = -1;
    r.receivingSearchDist = -1;

    if (!a) { annotated++; continue; }

    const ax = a[0], ay = a[1];

    let hit = null;

    // optionally consider anchor province itself (dist=0)
    if (checkAnchorProvinceFirst) {
      const info0 = waterbodyInfoAtXY(ax, ay);
      if (info0) hit = { wb: info0.wb, pid: info0.pid, x: ax, y: ay, dist: 0 };
    }

    // immediate neighbor check (dist=1)
    if (!hit) hit = immediateNeighborHit(ax, ay);

    // BFS fallback
    if (!hit && (searchRadiusPx|0) > 0) {
      hit = bfsFindWaterbody(ax, ay, searchRadiusPx|0);
      // If BFS finds dist=0 and you don't want that, you can disable checkAnchorProvinceFirst
    }

    if (hit) {
      r.receivingWaterbodyId = hit.wb;
      r.receivingWaterbodyAt = [hit.x, hit.y];
      r.receivingWaterbodyProvinceId = hit.pid;
      r.receivingSearchDist = hit.dist;
      found++;

      if (writeToProvinces) {
        const arr = receivingIndex.get(hit.wb) || [];
        arr.push(r.id);
        receivingIndex.set(hit.wb, arr);
      }
    }

    annotated++;
  }

  if (writeToProvinces) {
    // attach lists to provinces by waterbodyId (optional)
    for (let pid=0; pid<provinces.length; pid++){
      const p = provinces[pid];
      if (!p) continue;
      if (p.waterbodyId === undefined || p.waterbodyId === null) continue;

      const list = receivingIndex.get(p.waterbodyId);
      if (list && list.length) {
        // de-dupe
        p.receivingRivers = Array.from(new Set(list));
      } else if (overwriteProvinceReceiving) {
        p.receivingRivers = [];
      }
    }
  }

  return { ok:true, annotated, found, stemsOnly, searchRadiusPx };
}

function annotateRiverGeneralDirectionFromProvinces(opts = {}) {
  const {
    provinces = (window.provinces || []),
    riverList = (window.riverList || []),

    // where the province coordinate lives
    // (change these if yours are named differently)
    provXKey = "x",
    provYKey = "y",

    // if true, use the first+last DISTINCT province ids in provincesOrdered
    // (recommended because rivers can linger inside a province for many pixels)
    distinctEndpoints = true,

    // if true, store a lot of fields on river objects
    verbose = true
  } = opts;

  if (!riverList.length) return { ok:false, reason:"no riverList" };
  if (!provinces.length) return { ok:false, reason:"no provinces" };

  // Screen coordinates assumption:
  // +x = east (right), +y = south (down)
  // We'll map to compass with N = -y, E = +x.
  function angleToCompass8(dx, dy) {
    // convert to compass angle where 0 = E, 90 = N
    // For screen coords dy positive down, so "north" is -dy.
    const a = Math.atan2(-dy, dx); // [-pi, pi], 0 at east, +pi/2 at north
    const deg = (a * 180 / Math.PI + 360) % 360;

    // 8 bins centered on E(0), NE(45), N(90), NW(135), W(180), SW(225), S(270), SE(315)
    const dirs = ["E","NE","N","NW","W","SW","S","SE"];
    const idx = Math.round(deg / 45) % 8;
    return { compass8: dirs[idx], compassDeg: deg };
  }

  function axisText(dx, dy) {
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx === 0 && ady === 0) return "none";
    if (adx > ady * 1.5) return "east-west";
    if (ady > adx * 1.5) return "north-south";
    return "diagonal";
  }

  function pickFirstLastDistinct(arr) {
    if (!arr || !arr.length) return [-1, -1];
    let a = arr[0] | 0;
    let b = arr[arr.length - 1] | 0;
    if (!distinctEndpoints) return [a, b];

    // find first valid pid
    let i = 0;
    while (i < arr.length) {
      const p = arr[i] | 0;
      if (p >= 0 && p < provinces.length) { a = p; break; }
      i++;
    }
    // find last valid pid
    let j = arr.length - 1;
    while (j >= 0) {
      const p = arr[j] | 0;
      if (p >= 0 && p < provinces.length) { b = p; break; }
      j--;
    }
    // if same, try to find a different last
    if (a === b) {
      j = arr.length - 1;
      while (j >= 0) {
        const p = arr[j] | 0;
        if (p !== a && p >= 0 && p < provinces.length) { b = p; break; }
        j--;
      }
    }
    return [a, b];
  }

  let annotated = 0;
  let skipped = 0;

  for (let r = 0; r < riverList.length; r++) {
    const rv = riverList[r];
    if (!rv || !rv.provincesOrdered || !rv.provincesOrdered.length) {
      skipped++;
      continue;
    }

    const [aPid, bPid] = pickFirstLastDistinct(rv.provincesOrdered);
    if (aPid < 0 || bPid < 0 || aPid >= provinces.length || bPid >= provinces.length) {
      skipped++;
      continue;
    }

    const A = provinces[aPid];
    const B = provinces[bPid];
    if (!A || !B) { skipped++; continue; }

    const ax = +A[provXKey], ay = +A[provYKey];
    const bx = +B[provXKey], by = +B[provYKey];
    if (!isFinite(ax) || !isFinite(ay) || !isFinite(bx) || !isFinite(by)) {
      skipped++;
      continue;
    }

    const dx = bx - ax;
    const dy = by - ay;
    const dist = Math.hypot(dx, dy);

    const { compass8, compassDeg } = angleToCompass8(dx, dy);

    // confidence: how strong the net vector is relative to typical province step noise
    // Simple heuristic: longer = more confident, cap at 1
    const confidence = Math.max(0, Math.min(1, dist / 200)); // tune 200 to your province spacing

    // store minimal always
    rv.flowFromProvinceId = aPid;
    rv.flowToProvinceId = bPid;
    rv.flowDx = dx;
    rv.flowDy = dy;
    rv.flowDistance = dist;
    rv.flowCompass8 = compass8;

    if (verbose) {
      rv.flowAngleDeg = compassDeg;
      rv.flowAxis = axisText(dx, dy);
      rv.flowConfidence = confidence;
      rv.flowFromXY = [ax, ay];
      rv.flowToXY = [bx, by];
      rv.flowDirText = `generally ${compass8}`;
    }

    annotated++;
  }

  return { ok:true, annotated, skipped };
}

