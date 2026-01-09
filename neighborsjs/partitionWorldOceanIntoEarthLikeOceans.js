
// ---- Earth-like Oceans: partition the (connected) world ocean into multiple "oceans" ----
// Requires:
//   provinces[pid].isLand === false for water provinces
//   provinces[pid].neighbors : number[]
//   provinces[pid].neighborBorderPx : { [neighborId]: borderPx }
//   provinces[pid].centroidX / centroidY (recommended)
// Optional (but recommended):
//   provinces[pid].areaPx (used for better seed selection + stats)
//   provinces[pid].elevMean (bathymetry-ish; with seaLevel=19, water<19; lower = deeper)
//
// Supports horizontal wrap (longitude wrap): x wraps modulo W.
//
// Writes:
//   Water provinces:
//     p.oceanId (0..K-1)
//     p.oceanDistCost (debug; lowest-cost distance to its ocean seed)
//   Land provinces (coastal only):
//     p.primaryOceanId
//     p.coastalOceanIds
//     p.coastalOceanBorderPxByOcean
//
// Also writes:
//   window.oceans = [{oceanId, provinces[], areaPx, centroidX, centroidY, centroidXNorm, centroidYNorm}]
//
// How it works (high level):
//   1) Build water graph (water provinces, edges weighted by "strait-ness"/narrowness + shallowness).
//   2) Pick K seeds in open/deep water using farthest-point sampling with wrap-aware distances.
//   3) Multi-source Dijkstra over the water graph where crossing narrow/shallow straits is expensive.
//      -> Regions meet (and boundaries form) preferentially at chokepoints, producing Earth-like partitions.
//
// NOTE: This does NOT create disconnected components. It partitions a connected ocean.
function partitionWorldOceanIntoEarthLikeOceans(opts = {}) {
  const {
    provinces = (window.provinces || []),

    // Map dimensions (needed for wrap-aware distance). Use your canvas W/H.
    W = (window.cv ? window.cv.width : 0),
    H = (window.cv ? window.cv.height : 0),

    // Horizontal wrap (longitude wrap)
    wrapX = true,

    // IMPORTANT: to correctly add seam neighbors we need the province-id map image.
    // Provide one of:
    //  - provinceCtx: a 2D ctx that contains the province color/id map (same one you used to build provinces)
    //  - provinceCanvas: a canvas containing that map
    //  - provinceImageData: ImageData of that map
    provinceCtx = null,
    provinceCanvas = null,
    provinceImageData = null,

    // A Map from RGB int -> provinceId (you likely already have this in your build step)
    // If missing, we can derive it from provinces[] if they have a stable rgbInt field.
    provinceByRgbInt = (window.provinceByRgbInt || null),

    // Number of oceans to partition into
    oceanCount = 5, // try 4–7 for "Earth-like"

    // Sea level threshold used for bathymetry-ish depth from elevMean (your convention)
    seaLevel = 19,

    // Dijkstra edge cost tuning:
    borderPower = 1.0,
    coastPenalty = 0.25,
    shallowPenalty = 1.0,
    shallowDepthRef = 6.0,

    // Seed selection:
    minOpenScoreQuantile = 0.35,
    minSeedAreaPx = 50,

    // Debug: store extra fields
    storeDebug = false,

    // If true, patch the province graph with wrap seam adjacency before partitioning.
    // (Recommended ON for wrap maps.)
    patchWrapNeighbors = true
  } = opts;

          function getProvinceImageData() {
        //if (provinceImageData && provinceImageData.data) return provinceImageData;

        let ctx = provinceCtx;
        if (!ctx && provinceCanvas && provinceCanvas.getContext) ctx = provinceCanvas.getContext("2d");
        if (!ctx) {
        // fallback to window.cv? only if that canvas actually holds province-id colors (often it doesn't)
        if (window.provinceCv && window.provinceCv.getContext) ctx = window.provinceCv.getContext("2d");
        }
        if (!ctx) return null;

        try {
        return ctx.getImageData(0, 0, W, H);
        } catch (e) {
        console.warn("partitionWorldOceanIntoEarthLikeOceans: cannot read province imageData:", e);
        return null;
        }
    }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : b);

  if (!provinces.length) return { ok: false, reason: "no provinces" };
  if (!(W > 0) || !(H > 0)) return { ok: false, reason: "missing W/H (pass canvas width/height)" };

  // -------------------------
  // Helpers: wrap-aware distance (X only)
  // -------------------------
  function dxWrap(a, b) {
    const dx = Math.abs(a - b);
    if (!wrapX) return dx;
    return Math.min(dx, W - dx);
  }
  function dist2Wrap(ax, ay, bx, by) {
    const dx = dxWrap(ax, bx);
    const dy = Math.abs(ay - by); // NEVER wrap Y
    return dx * dx + dy * dy;
  }

  // -------------------------
  // Patch province neighbor graph to include seam adjacency (wrapX only, row-aligned)
  // This prevents "y mixing" and ensures oceans don't leak incorrectly.
  // -------------------------
  function ensureProvinceByRgbInt() {
    if (provinceByRgbInt && typeof provinceByRgbInt.get === "function") return provinceByRgbInt;

    // Try to build from provinces if they have a field we can use (common patterns)
    // Accept: p.rgbInt, p.colorInt, p.rgb, p.color (as [r,g,b])
    const m = new Map();
    for (let i = 0; i < provinces.length; i++) {
      const p = provinces[i];
      if (!p) continue;
      let key = null;

      if (typeof p.rgbInt === "number") key = p.rgbInt | 0;
      else if (typeof p.colorInt === "number") key = p.colorInt | 0;
      else if (Array.isArray(p.rgb) && p.rgb.length >= 3) key = ((p.rgb[0]&255)<<16)|((p.rgb[1]&255)<<8)|(p.rgb[2]&255);
      else if (Array.isArray(p.color) && p.color.length >= 3) key = ((p.color[0]&255)<<16)|((p.color[1]&255)<<8)|(p.color[2]&255);

      if (key != null) m.set(key, i);
    }
    return m.size ? m : null;
  }



  function patchHorizontalWrapSeam() {
    if (!wrapX) return { ok: true, patched: false, reason: "wrapX=false" };

    const imgd = getProvinceImageData();
    if (!imgd) {
      return { ok: false, patched: false, reason: "missing provinceImageData/provinceCtx (needed to patch seam neighbors safely)" };
    }

    const map = ensureProvinceByRgbInt();
    if (!map) {
      return { ok: false, patched: false, reason: "missing provinceByRgbInt mapping (RGB->provinceId)" };
    }

    const data = imgd.data;
    const idx = (x, y) => ((y * W + x) << 2);
    const rgbAt = (x, y) => {
      const i = idx(x, y);
      return (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    };

    // bump border px across seam per y (NO y mixing possible)
    const bump = (a, b, inc) => {
      if (a == null || b == null) return;
      a |= 0; b |= 0;
      if (a === b) return;
      const pa = provinces[a], pb = provinces[b];
      if (!pa || !pb) return;

      if (!pa.neighborBorderPx) pa.neighborBorderPx = Object.create(null);
      if (!pb.neighborBorderPx) pb.neighborBorderPx = Object.create(null);

      pa.neighborBorderPx[b] = (pa.neighborBorderPx[b] || 0) + inc;
      pb.neighborBorderPx[a] = (pb.neighborBorderPx[a] || 0) + inc;
    };

    let seamPairs = 0;

    for (let y = 0; y < H; y++) {
      const idL = map.get(rgbAt(0, y));
      const idR = map.get(rgbAt(W - 1, y));
      if (idL == null || idR == null) continue;

      if (idL !== idR) {
        bump(idL, idR, 1);
        seamPairs++;
      }
    }

    // rebuild neighbors arrays from neighborBorderPx (keeps everything consistent)
    for (let pid = 0; pid < provinces.length; pid++) {
      const p = provinces[pid];
      if (!p) continue;
      const nb = p.neighborBorderPx;
      if (!nb) { p.neighbors = []; continue; }
      p.neighbors = Object.keys(nb).map(k => k | 0).sort((a, b) => a - b);
    }

    return { ok: true, patched: true, seamPairs };
  }

  if (patchWrapNeighbors) {
    const seamRes = patchHorizontalWrapSeam();
    if (!seamRes.ok) {
      // We *can* continue without seam patch, but it will usually be wrong on wrap maps.
      console.warn("partitionWorldOceanIntoEarthLikeOceans seam patch failed:", seamRes.reason);
    } else if (storeDebug) {
      window.__oceanSeamPatchDebug = seamRes;
    }
  }

  // -------------------------
  // Identify water provinces
  // -------------------------
  const waterIds = [];
  const isWater = new Uint8Array(provinces.length);
  for (let pid = 0; pid < provinces.length; pid++) {
    const p = provinces[pid];
    if (!p) continue;
    if (p.isLand === false) { isWater[pid] = 1; waterIds.push(pid); }
    else isWater[pid] = 0;
  }
  if (!waterIds.length) return { ok: false, reason: "no water provinces (isLand===false)" };

  // -------------------------
  // Precompute openness + coastal-ness
  // -------------------------
  const openScore = new Float64Array(provinces.length);
  const coastalShare = new Float64Array(provinces.length);
  const depth = new Float64Array(provinces.length);
  let haveDepth = false;

  for (let i = 0; i < waterIds.length; i++) {
    const pid = waterIds[i];
    const p = provinces[pid];
    const nb = p.neighborBorderPx || {};
    const neigh = p.neighbors || Object.keys(nb).map(k => k | 0);

    let totalB = 0, landB = 0, waterB = 0, waterDeg = 0;

    for (let j = 0; j < neigh.length; j++) {
      const nid = neigh[j] | 0;
      const bpx = (nb[nid] | 0) || 0;
      if (!(bpx > 0)) continue;

      totalB += bpx;

      const q = provinces[nid];
      if (!q) continue;
      if (q.isLand === false) { waterB += bpx; waterDeg++; }
      else landB += bpx;
    }

    const coastFrac = totalB > 0 ? (landB / totalB) : 1;
    coastalShare[pid] = coastFrac;

    const a = (p.areaPx | 0) || 1;
    const degFactor = Math.max(0, Math.min(1, waterDeg / 6));
    const coastFactor = 1 - Math.max(0, Math.min(1, coastFrac));
    const areaFactor = Math.log1p(a) / 10;

    openScore[pid] = (0.45 * areaFactor + 0.30 * coastFactor + 0.25 * degFactor);

    if (typeof p.elevMean === "number") {
      haveDepth = true;
      depth[pid] = Math.max(0, seaLevel - p.elevMean);
    } else depth[pid] = 0;
  }

  // -------------------------
  // Seed selection (farthest-point sampling with wrapX-only distance)
  // -------------------------
  function quantile(arr, q) {
    const a = arr.slice().sort((x, y) => x - y);
    const n = a.length;
    if (!n) return 0;
    const qq = Math.max(0, Math.min(1, q));
    const pos = (n - 1) * qq;
    const lo = Math.floor(pos), hi = Math.ceil(pos);
    if (lo === hi) return a[lo];
    const t = pos - lo;
    return a[lo] * (1 - t) + a[hi] * t;
  }

  const scores = [];
  for (let i = 0; i < waterIds.length; i++) scores.push(openScore[waterIds[i]]);

  let thr = quantile(scores, 1 - Math.max(0, Math.min(1, minOpenScoreQuantile)));

  function buildCandidates(threshold) {
    const cand = [];
    for (let i = 0; i < waterIds.length; i++) {
      const pid = waterIds[i];
      const p = provinces[pid];
      const a = (p.areaPx | 0) || 0;
      if (a < minSeedAreaPx) continue;
      if (openScore[pid] >= threshold) {
        const x = p.centroidX, y = p.centroidY;
        if (typeof x === "number" && typeof y === "number") cand.push(pid);
      }
    }
    return cand;
  }

  let candidates = buildCandidates(thr);
  if (candidates.length < oceanCount * 2) {
    thr = quantile(scores, 0.50);
    candidates = buildCandidates(thr);
  }
  if (candidates.length < oceanCount) {
    candidates = [];
    for (let i = 0; i < waterIds.length; i++) {
      const pid = waterIds[i];
      const p = provinces[pid];
      const a = (p.areaPx | 0) || 0;
      if (a < 1) continue;
      const x = p.centroidX, y = p.centroidY;
      if (typeof x === "number" && typeof y === "number") candidates.push(pid);
    }
  }
  if (candidates.length < 1) return { ok: false, reason: "no candidate water provinces with centroids" };

  let firstSeed = candidates[0];
  for (let i = 1; i < candidates.length; i++) {
    const pid = candidates[i];
    const sA = openScore[pid];
    const sB = openScore[firstSeed];
    if (sA > sB) firstSeed = pid;
    else if (haveDepth && sA === sB && depth[pid] > depth[firstSeed]) firstSeed = pid;
  }

  const seeds = [firstSeed];

  for (let k = 1; k < oceanCount; k++) {
    let bestPid = -1;
    let bestVal = -1;

    for (let i = 0; i < candidates.length; i++) {
      const pid = candidates[i];
      let already = false;
      for (let s = 0; s < seeds.length; s++) if (seeds[s] === pid) { already = true; break; }
      if (already) continue;

      const p = provinces[pid];
      let mind2 = 1e30;
      for (let s = 0; s < seeds.length; s++) {
        const sp = provinces[seeds[s]];
        const d2 = dist2Wrap(p.centroidX, p.centroidY, sp.centroidX, sp.centroidY);
        if (d2 < mind2) mind2 = d2;
      }

      const bonus = openScore[pid] * 0.12 + (haveDepth ? (depth[pid] / (seaLevel + 1)) * 0.08 : 0);
      const val = mind2 * (1 + bonus);

      if (val > bestVal) { bestVal = val; bestPid = pid; }
    }

    if (bestPid < 0) break;
    seeds.push(bestPid);
  }

  const K = seeds.length;

  // -------------------------
  // Edge costs for Dijkstra
  // -------------------------
  function edgeCost(aId, bId, borderPx) {
    const eps = 1e-6;
    const w = Math.max(1, borderPx | 0);
    const base = 1 / (Math.pow(w, borderPower) + eps);

    const coastA = coastalShare[aId] || 0;
    const coastB = coastalShare[bId] || 0;
    const coast = Math.max(coastA, coastB);
    const coastMul = 1 + coastPenalty * coast;

    let shallowMul = 1;
    if (haveDepth && shallowPenalty > 0) {
      const dA = depth[aId] || 0;
      const dB = depth[bId] || 0;
      const d = Math.min(dA, dB);
      const t = (shallowDepthRef - d) / Math.max(1e-6, shallowDepthRef);
      const shelf = Math.max(0, Math.min(1, t));
      shallowMul = 1 + shallowPenalty * shelf;
    }

    return base * coastMul * shallowMul;
  }

  // -------------------------
  // Min-heap
  // -------------------------
  class MinHeap {
    constructor() { this.a = []; }
    push(node) {
      const a = this.a;
      a.push(node);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (a[p].d <= a[i].d) break;
        const t = a[p]; a[p] = a[i]; a[i] = t;
        i = p;
      }
    }
    pop() {
      const a = this.a;
      if (!a.length) return null;
      const root = a[0];
      const last = a.pop();
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (;;) {
          const l = i * 2 + 1;
          const r = l + 1;
          let m = i;
          if (l < a.length && a[l].d < a[m].d) m = l;
          if (r < a.length && a[r].d < a[m].d) m = r;
          if (m === i) break;
          const t = a[i]; a[i] = a[m]; a[m] = t;
          i = m;
        }
      }
      return root;
    }
    get size() { return this.a.length; }
  }

  // -------------------------
  // Multi-source Dijkstra on water graph
  // -------------------------
  const INF = 1e30;
  const dist = new Float64Array(provinces.length);
  const label = new Int32Array(provinces.length);
  for (let i = 0; i < dist.length; i++) { dist[i] = INF; label[i] = -1; }

  const heap = new MinHeap();

  for (let k = 0; k < K; k++) {
    const pid = seeds[k];
    dist[pid] = 0;
    label[pid] = k;
    heap.push({ d: 0, pid });
  }

  while (heap.size) {
    const cur = heap.pop();
    if (!cur) break;
    const pid = cur.pid | 0;
    const d0 = cur.d;

    if (d0 !== dist[pid]) continue;
    if (!isWater[pid]) continue;

    const p = provinces[pid];
    const nb = p.neighborBorderPx || {};
    const neigh = p.neighbors || Object.keys(nb).map(k => k | 0);

    for (let i = 0; i < neigh.length; i++) {
      const nid = neigh[i] | 0;
      if (!isWater[nid]) continue;

      const bpx = (nb[nid] | 0) || 0;
      if (!(bpx > 0)) continue;

      const nd = d0 + edgeCost(pid, nid, bpx);
      if (nd < dist[nid]) {
        dist[nid] = nd;
        label[nid] = label[pid];
        heap.push({ d: nd, pid: nid });
      }
    }
  }

  // -------------------------
  // Write oceanId to water provinces
  // -------------------------
  for (let i = 0; i < waterIds.length; i++) {
    const pid = waterIds[i];
    const p = provinces[pid];
    const oid = label[pid];
    p.oceanId = (oid >= 0 ? oid : null);
    if (storeDebug) p.oceanDistCost = (dist[pid] < INF ? dist[pid] : null);
    else delete p.oceanDistCost;
  }

  // -------------------------
  // Build ocean summaries
  // -------------------------
  const oceans = new Array(K);
  for (let k = 0; k < K; k++) {
    oceans[k] = {
      oceanId: k,
      seedProvinceId: seeds[k] | 0,
      provinces: [],
      provinceCount: 0,
      areaPx: 0,
      centroidX: 0,
      centroidY: 0,
      centroidXNorm: 0,
      centroidYNorm: 0
    };
  }

  const sumA = new Float64Array(K);
  const sumAx = new Float64Array(K);
  const sumAy = new Float64Array(K);

  for (let i = 0; i < waterIds.length; i++) {
    const pid = waterIds[i];
    const p = provinces[pid];
    const oid = p.oceanId;
    if (oid == null || oid < 0 || oid >= K) continue;

    oceans[oid].provinces.push(pid);
    oceans[oid].provinceCount++;

    const a = (p.areaPx | 0) || 1;
    oceans[oid].areaPx += a;

    if (typeof p.centroidX === "number" && typeof p.centroidY === "number") {
      sumA[oid] += a;
      sumAx[oid] += p.centroidX * a;
      sumAy[oid] += p.centroidY * a;
    }
  }

  for (let k = 0; k < K; k++) {
    const o = oceans[k];
    o.provinces.sort((a, b) => a - b);
    if (sumA[k] > 0) {
      o.centroidX = sumAx[k] / sumA[k];
      o.centroidY = sumAy[k] / sumA[k];
      o.centroidXNorm = W ? o.centroidX / W : 0;
      o.centroidYNorm = H ? o.centroidY / H : 0;
    }
  }

  // -------------------------
  // Assign coastal land provinces -> oceans
  // -------------------------
  let coastalLand = 0;
  for (let pid = 0; pid < provinces.length; pid++) {
    const p = provinces[pid];
    if (!p) continue;

    if (p.isLand === false) {
      delete p.primaryOceanId;
      delete p.coastalOceanIds;
      delete p.coastalOceanBorderPxByOcean;
      continue;
    }

    const nb = p.neighborBorderPx || {};
    const neigh = p.neighbors || Object.keys(nb).map(k => k | 0);

    const byOcean = Object.create(null);
    let coastPx = 0;

    for (let i = 0; i < neigh.length; i++) {
      const nid = neigh[i] | 0;
      const bpx = (nb[nid] | 0) || 0;
      if (!(bpx > 0)) continue;

      const q = provinces[nid];
      if (!q || q.isLand !== false) continue;

      coastPx += bpx;
      const oid = q.oceanId;
      if (oid == null) continue;
      byOcean[oid] = (byOcean[oid] || 0) + bpx;
    }

    if (!(coastPx > 0) || !Object.keys(byOcean).length) {
      delete p.primaryOceanId;
      p.coastalOceanIds = [];
      p.coastalOceanBorderPxByOcean = Object.create(null);
      continue;
    }

    coastalLand++;

    let bestO = null, bestPx = -1;
    const ids = Object.keys(byOcean).map(k => k | 0).sort((a, b) => a - b);
    for (let i = 0; i < ids.length; i++) {
      const oid = ids[i];
      const px = byOcean[oid] || 0;
      if (px > bestPx) { bestPx = px; bestO = oid; }
    }

    p.primaryOceanId = bestO;
    p.coastalOceanIds = ids;
    p.coastalOceanBorderPxByOcean = byOcean;
  }

  window.oceans = oceans;

  let assignedWater = 0;
  for (let i = 0; i < waterIds.length; i++) {
    const pid = waterIds[i];
    const oid = provinces[pid].oceanId;
    if (oid != null) assignedWater++;
  }

  return {
    ok: true,
    wrapX,
    W, H,
    requestedOceanCount: oceanCount,
    oceanCount: K,
    seeds: seeds.slice(),
    waterProvinces: waterIds.length,
    assignedWaterProvinces: assignedWater,
    coastalLandProvincesAssigned: coastalLand,
    oceans
  };
}
