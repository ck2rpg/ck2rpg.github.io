function annotateDivergentDistanceAndBasinTypes(opts = {}) {
  const {
    provinces = (window.provinces || []),
    W = (window.cv ? window.cv.width : 0),
    H = (window.cv ? window.cv.height : 0),
    wrapX = true,

    // If provided, boundary distances become km; else px.
    kmPerPx = null,

    // Dijkstra cap (same units as output)
    maxDistance = Infinity,

    basin = {
      // --- flattening / lowland normalizers ---
      slopeSoftMaxDeg: 25,    // slopeMeanDeg where flatness ~ 0
      reliefSoftMax: 80,      // relief (0..255) where lowRelief ~ 0
      ruggedSoftMax: 1.0,     // ruggedness01 in [0..1]
      coastHopSoftMax: 30,    // distanceToCoast hop distance where interiorness saturates

      // --- rivers ---
      riverDensitySoftMax: 0.01, // riverDensity (or riverPxPerKm2) saturation point
      confluenceSoftMax: 3,

      // --- tectonic proximity (for types) ---
      enableForelandBoost: true,
      forelandDistSoftMax: 250,  // km if kmPerPx else px
      forelandOrogenyMin255: 90,

      enableRiftType: true,
      riftDistSoftMax: 200,      // km if kmPerPx else px
      riftVolcanismMin255: 60,

      // --- coastal typing ---
      coastalHopMax: 2,          // consider coastal plain / delta if within this hop distance
      deltaRiverMin01: 0.55,     // river-ness threshold (0..1) to strongly favor delta

      // --- endorheic-ish / interior-lake typing (heuristic) ---
      // You don't have true drainage-outlet yet, so we use "near non-ocean waterbody while interior".
      interiorLakeHopMax: 6,     // allow a bit inland
      requireNonOceanWaterbody: true,

      // weights for overall basinIndex01
      wFlat: 0.28,
      wLowRelief: 0.22,
      wLowRugged: 0.10,
      wInterior: 0.16,
      wRivers: 0.16,
      wTect: 0.08 // shared tectonic lowland encouragement (foreland+rift)
    },

    // optional: store under p[writeUnder] instead of top-level
    writeUnder = null
  } = opts;

  const N = provinces.length;
  if (!N) return provinces;

  // ---------- helpers ----------
  const clamp01 = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x;
  const safeNum = (v, d=0) => (typeof v === "number" && isFinite(v)) ? v : d;

  function dxWrap(x1, x2) {
    let dx = x2 - x1;
    if (!wrapX || !W) return dx;
    if (dx >  W * 0.5) dx -= W;
    if (dx < -W * 0.5) dx += W;
    return dx;
  }

  function edgeLen(i, j) {
    const a = provinces[i], b = provinces[j];
    if (!a || !b) return 1;
    const x1 = safeNum(a.centroidX, safeNum(a.x, 0));
    const y1 = safeNum(a.centroidY, safeNum(a.y, 0));
    const x2 = safeNum(b.centroidX, safeNum(b.x, 0));
    const y2 = safeNum(b.centroidY, safeNum(b.y, 0));
    const dx = dxWrap(x1, x2);
    const dy = (y2 - y1);
    const dpx = Math.hypot(dx, dy);
    const d = (kmPerPx != null) ? (dpx * kmPerPx) : dpx;
    return (d > 0 && isFinite(d)) ? d : 1;
  }

  class MinHeap {
    constructor() { this.a = []; }
    push(node) {
      const a = this.a; a.push(node);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (a[p].d <= a[i].d) break;
        [a[p], a[i]] = [a[i], a[p]];
        i = p;
      }
    }
    pop() {
      const a = this.a;
      if (!a.length) return null;
      const top = a[0];
      const last = a.pop();
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (;;) {
          let l = i * 2 + 1, r = l + 1, m = i;
          if (l < a.length && a[l].d < a[m].d) m = l;
          if (r < a.length && a[r].d < a[m].d) m = r;
          if (m === i) break;
          [a[i], a[m]] = [a[m], a[i]];
          i = m;
        }
      }
      return top;
    }
    get size() { return this.a.length; }
  }

  function multiSourceDijkstra(sourceIds, getNeighbors, getCost, maxD = Infinity) {
    const dist = new Float64Array(N);
    dist.fill(Infinity);

    const heap = new MinHeap();
    for (const s of sourceIds) {
      if (s == null || s < 0 || s >= N) continue;
      dist[s] = 0;
      heap.push({ id: s, d: 0 });
    }

    while (heap.size) {
      const cur = heap.pop();
      if (!cur) break;
      const i = cur.id;
      const d = cur.d;
      if (d !== dist[i]) continue;
      if (d > maxD) continue;

      const nb = getNeighbors(i);
      if (!nb) continue;

      for (let k = 0; k < nb.length; k++) {
        const j = nb[k] | 0;
        if (j < 0 || j >= N) continue;
        const nd = d + getCost(i, j);
        if (nd < dist[j]) {
          dist[j] = nd;
          heap.push({ id: j, d: nd });
        }
      }
    }
    return dist;
  }

  // ---------- 1) distToDivergentBoundary ----------
  const divergentSources = [];
  for (let i = 0; i < N; i++) {
    const p = provinces[i];
    const kind = p?.tectField?.boundaryKind;
    if (kind === "divergent") divergentSources.push(i);
  }

  const divergentDist = divergentSources.length
    ? multiSourceDijkstra(
        divergentSources,
        (i) => provinces[i]?.neighbors || [],
        (i, j) => edgeLen(i, j),
        maxDistance
      )
    : null;

  for (let i = 0; i < N; i++) {
    const p = provinces[i];
    if (!p) continue;
    if (!p.tectField) p.tectField = {};
    p.tectField.distToDivergentBoundary = divergentDist ? divergentDist[i] : null;
  }

  // ---------- 2) basinIndex01 + types ----------
  const b = basin;
  const wSum = (b.wFlat + b.wLowRelief + b.wLowRugged + b.wInterior + b.wRivers + b.wTect) || 1;

  // Normalized feature functions
  function flat01(p) {
    const s = safeNum(p.slopeMeanDeg, 0);
    return clamp01(1 - (s / Math.max(1e-6, b.slopeSoftMaxDeg)));
  }
  function lowRelief01(p) {
    const r = safeNum(p.relief, 0);
    return clamp01(1 - (r / Math.max(1e-6, b.reliefSoftMax)));
  }
  function lowRugged01(p) {
    const rg = safeNum(p.ruggedness01, 0);
    return clamp01(1 - (rg / Math.max(1e-6, b.ruggedSoftMax)));
  }
  function interior01(p) {
    const dc = safeNum(p.distanceToCoast, 0);
    return clamp01(dc / Math.max(1, b.coastHopSoftMax));
  }
  function river01(p) {
    const d = (typeof p.riverPxPerKm2 === "number" && isFinite(p.riverPxPerKm2))
      ? p.riverPxPerKm2
      : safeNum(p.riverDensity, 0);

    const rd = clamp01(d / Math.max(1e-9, b.riverDensitySoftMax));

    const c = safeNum(p.confluenceCount, (p.isConfluenceProvince ? 1 : 0));
    const cf = clamp01(c / Math.max(1, b.confluenceSoftMax));

    return clamp01(0.7 * rd + 0.3 * cf);
  }
  function foreland01(p) {
    if (!b.enableForelandBoost) return 0;
    const orog = safeNum(p?.tectField?.orogeny255, 0);
    if (orog < b.forelandOrogenyMin255) return 0;

    const dConv = safeNum(p?.tectField?.distToConvergentBoundary, Infinity);
    if (!isFinite(dConv)) return 0;

    const soft = Math.max(1e-6, b.forelandDistSoftMax);
    const x = dConv / soft; // 0..∞
    const bell = Math.exp(-Math.pow((x - 0.4) / 0.35, 2));
    const orog01 = clamp01((orog - b.forelandOrogenyMin255) / (255 - b.forelandOrogenyMin255));
    return clamp01(bell * orog01);
  }
  function rift01(p) {
    if (!b.enableRiftType) return 0;
    const dDiv = safeNum(p?.tectField?.distToDivergentBoundary, Infinity);
    if (!isFinite(dDiv)) return 0;

    const volc = safeNum(p?.tectField?.volcanism255, 0);
    const volc01 = clamp01((volc - b.riftVolcanismMin255) / Math.max(1, (255 - b.riftVolcanismMin255)));

    // close to divergent boundary matters most
    const soft = Math.max(1e-6, b.riftDistSoftMax);
    const prox01 = clamp01(1 - (dDiv / soft));

    // rifts like lowlands
    const lowland = clamp01(0.5 * flat01(p) + 0.5 * lowRelief01(p));

    return clamp01(prox01 * (0.6 + 0.4 * volc01) * lowland);
  }

  function isLandProv(p) {
    // prefer effIsLand if present, else isLand boolean
    if (typeof p.effIsLand === "number") return p.effIsLand === 1;
    if (typeof p.isLand === "boolean") return p.isLand;
    return true;
  }

  function getOut(p) {
    return writeUnder ? (p[writeUnder] ||= {}) : p;
  }

  function hasNonOceanWaterNeighbor(p) {
    // Heuristic: if it has adjacent waterbodies but NO ocean adjacency, treat as inland lake/sea.
    const oceanId = p.primaryOceanId;
    const oceanTouch = (oceanId != null) || (Array.isArray(p.coastalOceanIds) && p.coastalOceanIds.length > 0);

    const wb = (Array.isArray(p.coastalWaterbodyIds) ? p.coastalWaterbodyIds : null);
    const wbTouch = wb && wb.length > 0;

    if (b.requireNonOceanWaterbody) return wbTouch && !oceanTouch;
    return wbTouch;
  }

  for (let i = 0; i < N; i++) {
    const p = provinces[i];
    if (!p) continue;

    const out = getOut(p);

    if (!isLandProv(p)) {
      out.basinIndex01 = 0;
      out.basinType = "none";
      out.basinTypeScores01 = {
        none: 1, foreland: 0, rift: 0, coastal_plain: 0, delta: 0,
        interior_endo_lake: 0, interior_basin: 0
      };
      out.basinTypeConfidence01 = 1;
      continue;
    }

    const f = flat01(p);
    const lr = lowRelief01(p);
    const lrg = lowRugged01(p);
    const inn = interior01(p);
    const rv = river01(p);

    const fr = foreland01(p);
    const rf = rift01(p);

    // Overall basinIndex01: lowlands + depositional cues + gentle tectonic lowland cues
    let basinIndex =
      b.wFlat      * f +
      b.wLowRelief * lr +
      b.wLowRugged * lrg +
      b.wInterior  * inn +
      b.wRivers    * rv +
      b.wTect      * clamp01(Math.max(fr, rf));

    basinIndex /= wSum;

    // punish steep cores
    const steep = safeNum(p.slopeMeanDeg, 0);
    if (steep > b.slopeSoftMaxDeg * 1.25) basinIndex *= 0.5;

    basinIndex = clamp01(basinIndex);
    out.basinIndex01 = basinIndex;

    // --- Type scores ---
    // Start by requiring some “basin-ness”; types should fade out when basinIndex is tiny.
    const gate = clamp01((basinIndex - 0.15) / 0.55); // 0 until ~0.15, saturates by ~0.70

    const dc = safeNum(p.distanceToCoast, 0);
    const isCoastalHop = dc <= b.coastalHopMax;
    const isNearCoast = dc <= Math.max(1, b.coastalHopMax);

    const nonOceanLakeAdj = hasNonOceanWaterNeighbor(p);
    const nearInteriorLake = nonOceanLakeAdj && (dc >= 1) && (dc <= b.interiorLakeHopMax);

    // Coastal plain: flat + low relief + near coast, rivers not required
    const coastalPlain = gate * clamp01(0.55 * f + 0.35 * lr + 0.10 * (1 - inn)) * (isNearCoast ? 1 : 0);

    // Delta: coastal plain + strong river signal (esp. confluences / density)
    const delta = gate * clamp01(coastalPlain * clamp01((rv - b.deltaRiverMin01) / (1 - b.deltaRiverMin01)));

    // Foreland basin: foreland signal + lowlands; typically not right on coast
    const foreland = gate * clamp01(fr * (0.55 * f + 0.45 * lr) * clamp01(0.65 + 0.35 * inn));

    // Rift basin: rift signal + lowlands; can be interior or near coast (gulfs), so don’t force interior
    const rift = gate * clamp01(rf * (0.60 * f + 0.40 * lr));

    // Interior endorheic/lake-adjacent basin: interior + lowlands + adjacent non-ocean waterbody
    const interiorLake = gate * (nearInteriorLake ? 1 : 0) * clamp01(0.45 * f + 0.35 * lr + 0.20 * inn);

    // Generic interior basin: interior + lowlands (no special tectonic or delta/lake signals)
    const interiorGeneric = gate * clamp01(0.40 * f + 0.35 * lr + 0.25 * inn);

    // If a type score is extremely small, treat as 0
    function z(x) { return x < 1e-4 ? 0 : clamp01(x); }

    const scores = {
      none: 0,
      foreland: z(foreland),
      rift: z(rift),
      coastal_plain: z(coastalPlain),
      delta: z(delta),
      interior_endo_lake: z(interiorLake),
      interior_basin: z(interiorGeneric)
    };

    // Choose best type (with “delta overrides coastal plain” if it’s close)
    let bestType = "none";
    let best = 0;
    let second = 0;

    for (const k in scores) {
      const v = scores[k];
      if (k === "none") continue;
      if (v > best) { second = best; best = v; bestType = k; }
      else if (v > second) { second = v; }
    }

    // If basinIndex is low, call it none
    if (basinIndex < 0.20 || best < 0.10) {
      bestType = "none";
      scores.none = 1;
      second = best;
      best = 1;
    } else {
      // ensure none is small when we have a basin type
      scores.none = z(0.15 * (1 - basinIndex));
    }

    // Confidence = separation between best and second, modulated by basinIndex
    const sep = clamp01((best - second) / Math.max(1e-6, best));
    const conf = clamp01(0.25 + 0.55 * sep + 0.20 * basinIndex);

    out.basinType = bestType;
    out.basinTypeScores01 = scores;
    out.basinTypeConfidence01 = conf;
  }

  return provinces;
}
