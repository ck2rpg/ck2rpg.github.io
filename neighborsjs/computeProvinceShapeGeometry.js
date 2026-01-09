// ---- Province shape + geometry + topology + boundary composition (full drop-in) ----
// Calculates EVERYTHING discussed:
//  - Cheap bbox + compactness metrics (no pixel reads)
//  - Pixel-accurate boundary composition (true perimeter + coast/land/edge split)
//  - Optional true neighbor border lengths (pixel-derived, wrap-aware)
//  - Second-moment orientation/elongation/eccentricity (pixel scan)
//  - Connectivity (connected components) using run-length CCL (fast, low-mem)
//  - Holes (lakes/enclaves inside the province mask) via flood-fill in bbox
//  - Neighbor-border distribution stats (dominant neighbor, entropy, effective neighbor count)
//
// Requirements:
//  - provinces[pid] exists
//  - provinces have: areaPx, minX/minY/maxX/maxY
//  - province raster provided via imgData or ctx/W/H (province map: unique RGB per province)
//  - provinceByRgbInt: Map(rgbInt -> pid)
// Optional (recommended):
//  - provinces[pid].isLand (boolean-ish; false means water province)
//  - provinces[pid].centroidX / centroidY (if missing and computeMoments=true, we compute centroids)
//
// Notes on wrap:
//  - wrapX=true treats x=0 adjacent to x=W-1 for boundary + components
//  - edges: if wrapX=true, left/right edges are NOT "map edge" (they wrap)
//
// Performance knobs:
//  - If you already have neighborBorderPx from your adjacency pass, you can skip pixelBorder pass.
//  - Holes can be expensive if you have huge provinces; it is still bbox-local.
//  - Components computed globally via run-length union, usually fast even at 8M px.
//
function computeProvinceShapeGeometry(opts = {}) {
  const {
    provinces = (window.provinces || []),

    // Pixel input (needed for the "all the things" passes)
    imgData = null,
    ctx = null,
    W = (window.cv ? window.cv.width : 0),
    H = (window.cv ? window.cv.height : 0),

    // Map pixel RGB -> province id
    provinceByRgbInt = (window.provinceByRgbInt || null),

    // World wrap
    wrapX = true,

    // Filter
    landOnly = false,

    // Pass toggles (defaults are "do it all")
    computeBboxAndCheap = true,
    computePixelPerimeters = true,   // truePerimeterPx + coast/land/edge split
    computePixelBorders = true,       // per-neighbor border pixels (pixel-derived)
    computeMoments = true,            // momentAngleDeg + elongation + eccentricity
    computeComponents = true,         // componentsCount + largestComponentFraction, etc.
    computeHoles = true,              // holesCount + holeAreaPx (+ fraction)

    // Classification thresholds (feel free to tune)
    smallAreaDegenerate = 3,          // areaPx <= this is degenerate
    epsA = 1e-9
  } = opts;

  const PI = Math.PI;

  // -----------------------------
  // Acquire pixel data
  // -----------------------------
  function getPixelData() {
    if (imgData && imgData.data && imgData.width && imgData.height) {
      return { data: imgData.data, w: imgData.width | 0, h: imgData.height | 0 };
    }
    if (ctx && W > 0 && H > 0) {
      const id = ctx.getImageData(0, 0, W, H);
      return { data: id.data, w: W | 0, h: H | 0 };
    }
    if (window.ctx && window.cv && window.cv.width && window.cv.height) {
      const id = window.ctx.getImageData(0, 0, window.cv.width, window.cv.height);
      return { data: id.data, w: window.cv.width | 0, h: window.cv.height | 0 };
    }
    return null;
  }

  const pix = getPixelData();
  const hasPix = !!(pix && pix.data && pix.w > 0 && pix.h > 0);
  const WW = hasPix ? pix.w : (W | 0);
  const HH = hasPix ? pix.h : (H | 0);
  const data = hasPix ? pix.data : null;

  const hasMap = !!(hasPix && provinceByRgbInt && typeof provinceByRgbInt.get === "function");

  // -----------------------------
  // Helpers
  // -----------------------------
  function isLandProvince(pid) {
    const p = provinces[pid];
    return p && p.isLand !== false;
  }

  function rgbIntAtIndex(i) {
    // i is pixel base index (rgba)
    return (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
  }

  function pidAtXY(x, y) {
    const i = ((y * WW + x) << 2);
    const rgb = rgbIntAtIndex(i);
    const pid = provinceByRgbInt.get(rgb);
    return pid == null ? -1 : pid | 0;
  }

  function clampInt(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  // -----------------------------
  // Output / stats accumulators
  // -----------------------------
  let processed = 0, skipped = 0, degenerate = 0;

  let maxTruePerim = -1, maxTruePerimId = -1;
  let maxComplex = -1, maxComplexId = -1;

  // -----------------------------
  // Pass 1: cheap bbox + perimeter-based metrics (no pixel reads)
  // -----------------------------
  if (computeBboxAndCheap) {
    for (let pid = 0; pid < provinces.length; pid++) {
      const p = provinces[pid];
      if (!p) { skipped++; continue; }
      if (landOnly && p.isLand === false) { skipped++; continue; }

      const A = (p.areaPx | 0);
      const minX = p.minX, minY = p.minY, maxX = p.maxX, maxY = p.maxY;

      const bboxW = (typeof minX === "number" && typeof maxX === "number") ? (maxX - minX + 1) : 0;
      const bboxH = (typeof minY === "number" && typeof maxY === "number") ? (maxY - minY + 1) : 0;
      const bboxAreaPx = (bboxW > 0 && bboxH > 0) ? (bboxW * bboxH) : 0;

      // Perimeter proxy: sum borderPx to neighbors (internal only)
      let Pproxy = 0;
      const nb = p.neighborBorderPx || {};
      for (const k in nb) Pproxy += (nb[k] | 0);

      p.bboxW = bboxW;
      p.bboxH = bboxH;
      p.extentX = bboxW;
      p.extentY = bboxH;
      p.bboxAreaPx = bboxAreaPx;
      p.bboxAspect = (bboxH > 0) ? (bboxW / bboxH) : 0;
      p.bboxFill = (bboxAreaPx > 0) ? (A / bboxAreaPx) : 0;

      // Keep your old perimeter field as the proxy (neighbor-only),
      // but we'll also compute truePerimeterPx later if enabled.
      p.perimeterPx = Pproxy;

      const deg = (A <= smallAreaDegenerate || bboxAreaPx <= 0 || bboxW <= 0 || bboxH <= 0 || Pproxy <= 0);
      if (deg) {
        p.isDegenerate = 1;
        p.compactness = 0;
        p.thinness = 0;
        p.shapeComplexity = 0;
        p.equivRadiusPx = 0;
        p.equivDiameterPx = 0;
        degenerate++;
        processed++;
        continue;
      }

      p.isDegenerate = 0;

      // Compactness/thinness from proxy perimeter (still useful)
      const compactness = (4 * PI * A) / (Pproxy * Pproxy + epsA);
      p.compactness = compactness;
      p.thinness = 1 / (compactness + epsA);

      p.shapeComplexity = Pproxy / (Math.sqrt(A) + epsA);

      const r = Math.sqrt(A / PI);
      p.equivRadiusPx = r;
      p.equivDiameterPx = 2 * r;

      if (p.shapeComplexity > maxComplex) { maxComplex = p.shapeComplexity; maxComplexId = pid; }

      processed++;
    }
  }

  // -----------------------------
  // Pass 2: pixel-accurate perimeters + boundary composition + (optional) true neighbor borders
  // -----------------------------
  // Writes:
  //   p.truePerimeterPx
  //   p.coastPerimeterPx
  //   p.landBorderPerimeterPx
  //   p.edgePerimeterPx
  //   p.coastFraction / p.landBorderFraction / p.edgeFraction
  //   (optional) p.neighborBorderPx_true : { [neighborPid]: px }
  //
  const didPixelBoundary = !!(computePixelPerimeters && hasMap);

  if (computePixelPerimeters && !hasMap) {
    console.warn("computeProvinceShapeGeometry: pixel perimeters requested but missing imgData/ctx/W/H or provinceByRgbInt.");
  }

  if (computePixelPerimeters && hasMap) {
    const n = provinces.length;

    const truePerim = new Uint32Array(n);
    const coastPerim = new Uint32Array(n);
    const landPerim = new Uint32Array(n);
    const edgePerim = new Uint32Array(n);

    // Optional pixel-derived neighbor borders
    const needTrueBorders = !!computePixelBorders;
    let trueBorderMaps = null;
    if (needTrueBorders) {
      // Use Map per province only when it actually has borders (lazy init).
      trueBorderMaps = new Array(n); // each entry: Map(neiPid -> px)
    }

    // Single pass: count boundary "edges" for each pixel against right + down neighbors,
    // and (to get full perimeter) also compare left/up? We'll instead count *directed edges*
    // against 4-neighbors for exact perimeter. That’s 4 checks per pixel.
    //
    // This is accurate and easy to reason about.
    const Ww = WW, Hh = HH;

    for (let y = 0; y < Hh; y++) {
      const rowBase = y * Ww;
      for (let x = 0; x < Ww; x++) {
        const i = ((rowBase + x) << 2);
        const rgb = rgbIntAtIndex(i);
        const pid = provinceByRgbInt.get(rgb);
        if (pid == null) continue;
        const p = provinces[pid];
        if (!p) continue;
        if (landOnly && p.isLand === false) continue;
        if (p.isDegenerate) continue;

        // 4-neighbor checks
        // Left
        if (x === 0) {
          if (wrapX) {
            const pid2 = pidAtXY(Ww - 1, y);
            if (pid2 !== pid) {
              truePerim[pid] += 1;
              if (pid2 < 0 || !isLandProvince(pid2)) coastPerim[pid] += 1;
              else landPerim[pid] += 1;
              if (needTrueBorders && pid2 >= 0 && pid2 !== pid) {
                let m = trueBorderMaps[pid];
                if (!m) trueBorderMaps[pid] = m = new Map();
                m.set(pid2, (m.get(pid2) || 0) + 1);
              }
            }
          } else {
            // map edge
            truePerim[pid] += 1;
            edgePerim[pid] += 1;
          }
        } else {
          const pid2 = pidAtXY(x - 1, y);
          if (pid2 !== pid) {
            truePerim[pid] += 1;
            if (pid2 < 0 || !isLandProvince(pid2)) coastPerim[pid] += 1;
            else landPerim[pid] += 1;
            if (needTrueBorders && pid2 >= 0 && pid2 !== pid) {
              let m = trueBorderMaps[pid];
              if (!m) trueBorderMaps[pid] = m = new Map();
              m.set(pid2, (m.get(pid2) || 0) + 1);
            }
          }
        }

        // Right
        if (x === Ww - 1) {
          if (wrapX) {
            const pid2 = pidAtXY(0, y);
            if (pid2 !== pid) {
              truePerim[pid] += 1;
              if (pid2 < 0 || !isLandProvince(pid2)) coastPerim[pid] += 1;
              else landPerim[pid] += 1;
              if (needTrueBorders && pid2 >= 0 && pid2 !== pid) {
                let m = trueBorderMaps[pid];
                if (!m) trueBorderMaps[pid] = m = new Map();
                m.set(pid2, (m.get(pid2) || 0) + 1);
              }
            }
          } else {
            truePerim[pid] += 1;
            edgePerim[pid] += 1;
          }
        } else {
          const pid2 = pidAtXY(x + 1, y);
          if (pid2 !== pid) {
            truePerim[pid] += 1;
            if (pid2 < 0 || !isLandProvince(pid2)) coastPerim[pid] += 1;
            else landPerim[pid] += 1;
            if (needTrueBorders && pid2 >= 0 && pid2 !== pid) {
              let m = trueBorderMaps[pid];
              if (!m) trueBorderMaps[pid] = m = new Map();
              m.set(pid2, (m.get(pid2) || 0) + 1);
            }
          }
        }

        // Up
        if (y === 0) {
          truePerim[pid] += 1;
          edgePerim[pid] += 1;
        } else {
          const pid2 = pidAtXY(x, y - 1);
          if (pid2 !== pid) {
            truePerim[pid] += 1;
            if (pid2 < 0 || !isLandProvince(pid2)) coastPerim[pid] += 1;
            else landPerim[pid] += 1;
            if (needTrueBorders && pid2 >= 0 && pid2 !== pid) {
              let m = trueBorderMaps[pid];
              if (!m) trueBorderMaps[pid] = m = new Map();
              m.set(pid2, (m.get(pid2) || 0) + 1);
            }
          }
        }

        // Down
        if (y === Hh - 1) {
          truePerim[pid] += 1;
          edgePerim[pid] += 1;
        } else {
          const pid2 = pidAtXY(x, y + 1);
          if (pid2 !== pid) {
            truePerim[pid] += 1;
            if (pid2 < 0 || !isLandProvince(pid2)) coastPerim[pid] += 1;
            else landPerim[pid] += 1;
            if (needTrueBorders && pid2 >= 0 && pid2 !== pid) {
              let m = trueBorderMaps[pid];
              if (!m) trueBorderMaps[pid] = m = new Map();
              m.set(pid2, (m.get(pid2) || 0) + 1);
            }
          }
        }
      }
    }

    // Write per province
    for (let pid = 0; pid < provinces.length; pid++) {
      const p = provinces[pid];
      if (!p) continue;
      if (landOnly && p.isLand === false) continue;

      const P = truePerim[pid] >>> 0;
      p.truePerimeterPx = P;
      p.coastPerimeterPx = coastPerim[pid] >>> 0;
      p.landBorderPerimeterPx = landPerim[pid] >>> 0;
      p.edgePerimeterPx = edgePerim[pid] >>> 0;

      const denom = (P + epsA);
      p.coastFraction = p.coastPerimeterPx / denom;
      p.landBorderFraction = p.landBorderPerimeterPx / denom;
      p.edgeFraction = p.edgePerimeterPx / denom;

      // Also compute "true" compactness/complexity using true perimeter
      const A = (p.areaPx | 0);
      if (!p.isDegenerate && A > 0 && P > 0) {
        p.trueCompactness = (4 * PI * A) / (P * P + epsA);
        p.trueThinness = 1 / (p.trueCompactness + epsA);
        p.trueShapeComplexity = P / (Math.sqrt(A) + epsA);
        if (p.trueShapeComplexity > maxComplex) { maxComplex = p.trueShapeComplexity; maxComplexId = pid; }
      } else {
        p.trueCompactness = 0;
        p.trueThinness = 0;
        p.trueShapeComplexity = 0;
      }

      if (P > maxTruePerim) { maxTruePerim = P; maxTruePerimId = pid; }

      if (computePixelBorders) {
        const m = trueBorderMaps[pid];
        if (m && m.size) {
          // Convert Map -> plain object for serialization parity with your existing neighborBorderPx
          const obj = {};
          for (const [k, v] of m.entries()) obj[k] = v | 0;
          p.neighborBorderPx_true = obj;
        } else {
          p.neighborBorderPx_true = {};
        }
      }
    }
  }

  // -----------------------------
  // Neighbor-border distribution stats (dominant neighbor, entropy, effective neighbor count)
  // Uses: pixel-derived border map if available, else p.neighborBorderPx, else perimeter proxy.
  // Writes:
  //   p.dominantNeighborId
  //   p.dominantNeighborShare
  //   p.borderEntropy
  //   p.effectiveNeighborCount
  //   p.borderHHI  (Herfindahl; concentration)
  // -----------------------------
  for (let pid = 0; pid < provinces.length; pid++) {
    const p = provinces[pid];
    if (!p) continue;
    if (landOnly && p.isLand === false) continue;

    const nbObj =
      (p.neighborBorderPx_true && Object.keys(p.neighborBorderPx_true).length ? p.neighborBorderPx_true :
      (p.neighborBorderPx || {}));

    let total = 0;
    let domId = null, domV = 0;
    let hhi = 0;
    let entropy = 0;

    for (const k in nbObj) {
      const v = (nbObj[k] | 0);
      if (v <= 0) continue;
      total += v;
      if (v > domV) { domV = v; domId = (k | 0); }
    }

    if (total > 0) {
      for (const k in nbObj) {
        const v = (nbObj[k] | 0);
        if (v <= 0) continue;
        const prob = v / total;
        hhi += prob * prob;
        entropy += -prob * Math.log(prob + epsA);
      }
      p.dominantNeighborId = domId;
      p.dominantNeighborShare = domV / total;
      p.borderHHI = hhi;
      p.borderEntropy = entropy;
      p.effectiveNeighborCount = 1 / (hhi + epsA); // ~ "effective" number of neighbors
    } else {
      p.dominantNeighborId = null;
      p.dominantNeighborShare = 0;
      p.borderHHI = 0;
      p.borderEntropy = 0;
      p.effectiveNeighborCount = 0;
    }
  }

  // -----------------------------
  // Pass 3: moments (orientation/elongation/eccentricity)
  // If centroid missing, compute centroid in the same scan.
  // Writes:
  //   p.centroidX/p.centroidY (if missing)
  //   p.momentAngleDeg, p.elongation, p.eccentricity
  // -----------------------------
  let momentsDone = false;
  let momentsProvinces = 0;

  if (computeMoments && hasMap) {
    const n = provinces.length;

    const sumX = new Float64Array(n);
    const sumY = new Float64Array(n);
    const cnt  = new Uint32Array(n);

    // First scan: centroid sums (only for provinces needing it OR all if you want perfect consistency)
    let needCentroids = false;
    for (let pid = 0; pid < n; pid++) {
      const p = provinces[pid];
      if (!p) continue;
      if (landOnly && p.isLand === false) continue;
      if (p.isDegenerate) continue;
      if (!(typeof p.centroidX === "number" && typeof p.centroidY === "number")) { needCentroids = true; break; }
    }

    if (needCentroids) {
      for (let y = 0; y < HH; y++) {
        for (let x = 0; x < WW; x++) {
          const pid = pidAtXY(x, y);
          if (pid < 0 || pid >= n) continue;
          const p = provinces[pid];
          if (!p) continue;
          if (landOnly && p.isLand === false) continue;
          if (p.isDegenerate) continue;

          sumX[pid] += x;
          sumY[pid] += y;
          cnt[pid] += 1;
        }
      }
      for (let pid = 0; pid < n; pid++) {
        const p = provinces[pid];
        if (!p) continue;
        if (landOnly && p.isLand === false) continue;
        if (p.isDegenerate) continue;
        const c = cnt[pid] >>> 0;
        if (c > 0) {
          if (!(typeof p.centroidX === "number")) p.centroidX = sumX[pid] / c;
          if (!(typeof p.centroidY === "number")) p.centroidY = sumY[pid] / c;
        }
      }
    }

    // Second scan: central second moments about centroid
    const sxx = new Float64Array(n);
    const syy = new Float64Array(n);
    const sxy = new Float64Array(n);
    const c2  = new Uint32Array(n);

    for (let y = 0; y < HH; y++) {
      for (let x = 0; x < WW; x++) {
        const pid = pidAtXY(x, y);
        if (pid < 0 || pid >= n) continue;
        const p = provinces[pid];
        if (!p) continue;
        if (landOnly && p.isLand === false) continue;
        if (p.isDegenerate) continue;

        const cx = (p.centroidX || 0);
        const cy = (p.centroidY || 0);
        const dx = x - cx;
        const dy = y - cy;

        sxx[pid] += dx * dx;
        syy[pid] += dy * dy;
        sxy[pid] += dx * dy;
        c2[pid] += 1;
      }
    }

    for (let pid = 0; pid < n; pid++) {
      const p = provinces[pid];
      if (!p) continue;
      if (landOnly && p.isLand === false) continue;

      if (p.isDegenerate) {
        p.momentAngleDeg = null;
        p.elongation = null;
        p.eccentricity = null;
        continue;
      }

      const npx = c2[pid] >>> 0;
      if (!npx) {
        p.momentAngleDeg = null;
        p.elongation = null;
        p.eccentricity = null;
        continue;
      }

      const Cxx = sxx[pid] / npx;
      const Cyy = syy[pid] / npx;
      const Cxy = sxy[pid] / npx;

      const theta = 0.5 * Math.atan2(2 * Cxy, (Cxx - Cyy));
      let deg = theta * (180 / PI);
      if (deg < 0) deg += 180;

      const tr = Cxx + Cyy;
      const detTerm = Math.max(0, (Cxx - Cyy) * (Cxx - Cyy) + 4 * Cxy * Cxy);
      const s = Math.sqrt(detTerm);
      const lam1 = Math.max(0, 0.5 * (tr + s)); // major variance
      const lam2 = Math.max(0, 0.5 * (tr - s)); // minor variance

      const major = Math.sqrt(lam1 + epsA);
      const minor = Math.sqrt(lam2 + epsA);
      const elong = major / (minor + epsA);
      const ecc = lam1 > 0 ? Math.sqrt(Math.max(0, 1 - (lam2 / (lam1 + epsA)))) : 0;

      p.momentAngleDeg = deg;
      p.elongation = elong;
      p.eccentricity = ecc;

      // Stability hint: if almost round, angle is not meaningful
      p.momentAngleStable = (elong >= 1.15) ? 1 : 0;

      momentsProvinces++;
    }

    momentsDone = true;
  }

  // -----------------------------
  // Pass 4: Connected components per province (run-length CCL)
  // Writes:
  //   p.componentsCount
  //   p.largestComponentAreaPx
  //   p.largestComponentFraction
  //   p.isFragmented (1 if componentsCount>1)
  //
  // Implementation:
  //   For each row, create runs of constant province id (within landOnly filter).
  //   Union overlapping runs in adjacent rows with same pid.
  //   Optionally union wrap seam (x=0 with x=W-1) for same pid if wrapX.
  // -----------------------------
  let componentsDone = false;
  let componentsLabeled = 0;

  if (computeComponents && hasMap) {
    // Union-find for runs (not pixels)
    const parent = [];
    const rank = [];
    const runPid = [];
    const runX0 = [];
    const runX1 = [];
    const runY  = [];

    function ufMake(pid, x0, x1, y) {
      const id = parent.length;
      parent.push(id);
      rank.push(0);
      runPid.push(pid);
      runX0.push(x0);
      runX1.push(x1);
      runY.push(y);
      return id;
    }
    function ufFind(a) {
      while (parent[a] !== a) {
        parent[a] = parent[parent[a]];
        a = parent[a];
      }
      return a;
    }
    function ufUnion(a, b) {
      a = ufFind(a); b = ufFind(b);
      if (a === b) return a;
      const ra = rank[a], rb = rank[b];
      if (ra < rb) { parent[a] = b; return b; }
      if (ra > rb) { parent[b] = a; return a; }
      parent[b] = a; rank[a] = ra + 1; return a;
    }

    // Per-row run lists: arrays of run ids (in increasing x)
    let prevRuns = [];
    let prevX0 = [];
    let prevX1 = [];
    let prevPid = [];

    for (let y = 0; y < HH; y++) {
      const curRuns = [];
      const curX0 = [];
      const curX1 = [];
      const curPid = [];

      // Build runs for this row
      let x = 0;
      while (x < WW) {
        const pid = pidAtXY(x, y);
        const p = (pid >= 0 ? provinces[pid] : null);

        // If filtered out, treat as "no run"
        const valid =
          (pid >= 0 && pid < provinces.length && p && !(landOnly && p.isLand === false) && !p.isDegenerate);

        if (!valid) { x++; continue; }

        let x0 = x;
        let x1 = x;
        while (x1 + 1 < WW) {
          const pid2 = pidAtXY(x1 + 1, y);
          if (pid2 !== pid) break;
          const p2 = provinces[pid2];
          if (!p2) break;
          if (landOnly && p2.isLand === false) break;
          if (p2.isDegenerate) break;
          x1++;
        }

        const rid = ufMake(pid, x0, x1, y);
        curRuns.push(rid);
        curX0.push(x0);
        curX1.push(x1);
        curPid.push(pid);

        x = x1 + 1;
      }

      // Union with prev row where runs overlap and same pid
      let i = 0, j = 0;
      while (i < curRuns.length && j < prevRuns.length) {
        const pidA = curPid[i];
        const pidB = prevPid[j];

        // Only can overlap if same province id
        if (pidA !== pidB) {
          // Advance the one whose run ends earlier (by x1)
          if (curX1[i] < prevX1[j]) i++;
          else j++;
          continue;
        }

        // Same pid; check overlap in x
        const a0 = curX0[i], a1 = curX1[i];
        const b0 = prevX0[j], b1 = prevX1[j];
        const overlaps = !(a1 < b0 || b1 < a0);

        if (overlaps) {
          ufUnion(curRuns[i], prevRuns[j]);
        }

        // Advance whichever ends earlier
        if (a1 < b1) i++;
        else j++;
      }

      // Wrap seam union within the same row: if wrapX and first run touches x=0 and last run touches x=W-1 and same pid
      if (wrapX && curRuns.length >= 2) {
        const firstId = curRuns[0];
        const lastId  = curRuns[curRuns.length - 1];
        if (curX0[0] === 0 && curX1[curRuns.length - 1] === WW - 1 && curPid[0] === curPid[curRuns.length - 1]) {
          ufUnion(firstId, lastId);
        }
      }

      prevRuns = curRuns;
      prevX0 = curX0;
      prevX1 = curX1;
      prevPid = curPid;
    }

    // Compute area per component root by counting run lengths
    // We want per province: componentsCount and largest component area.
    const compArea = new Map(); // key: rootRunId -> areaPx
    for (let rid = 0; rid < parent.length; rid++) {
      const root = ufFind(rid);
      const len = (runX1[rid] - runX0[rid] + 1) | 0;
      compArea.set(root, (compArea.get(root) || 0) + len);
    }

    // Map component roots -> (provinceId, compArea)
    const provCompAreas = new Array(provinces.length);
    for (let pid = 0; pid < provinces.length; pid++) provCompAreas[pid] = [];

    for (const [root, area] of compArea.entries()) {
      const pid = runPid[root];
      if (pid == null || pid < 0 || pid >= provinces.length) continue;
      provCompAreas[pid].push(area | 0);
    }

    for (let pid = 0; pid < provinces.length; pid++) {
      const p = provinces[pid];
      if (!p) continue;
      if (landOnly && p.isLand === false) continue;
      if (p.isDegenerate) {
        p.componentsCount = 0;
        p.largestComponentAreaPx = 0;
        p.largestComponentFraction = 0;
        p.isFragmented = 0;
        continue;
      }

      const arr = provCompAreas[pid];
      if (!arr || !arr.length) {
        p.componentsCount = 0;
        p.largestComponentAreaPx = 0;
        p.largestComponentFraction = 0;
        p.isFragmented = 0;
        continue;
      }

      let maxA = 0;
      for (let k = 0; k < arr.length; k++) if (arr[k] > maxA) maxA = arr[k];

      p.componentsCount = arr.length | 0;
      p.largestComponentAreaPx = maxA | 0;
      const A = (p.areaPx | 0) || 0;
      p.largestComponentFraction = (A > 0) ? (maxA / A) : 0;
      p.isFragmented = (arr.length > 1) ? 1 : 0;

      componentsLabeled++;
    }

    componentsDone = true;
  }

  // -----------------------------
  // Pass 5: Holes inside each province (bbox flood-fill on inverse mask)
  // Writes:
  //   p.holesCount
  //   p.holeAreaPx
  //   p.holeFraction (holeArea / bboxArea OR / area; we store both)
  //
  // Definition:
  //   In the province's bbox, mark province pixels as 1, others as 0.
  //   Flood fill from bbox boundary over 0s => "outside".
  //   Remaining 0s are "holes"; count connected hole components and total hole area.
  // -----------------------------
  let holesDone = false;
  let holesProvinces = 0;

  if (computeHoles && hasMap) {
    // We’ll do it per province bbox (can be expensive if you have giant provinces),
    // but it’s accurate and local.
    const stack = []; // reuse

    for (let pid = 0; pid < provinces.length; pid++) {
      const p = provinces[pid];
      if (!p) continue;
      if (landOnly && p.isLand === false) continue;
      if (p.isDegenerate) {
        p.holesCount = 0;
        p.holeAreaPx = 0;
        p.holeFractionOfBBox = 0;
        p.holeFractionOfArea = 0;
        continue;
      }

      const minX0 = (p.minX | 0), minY0 = (p.minY | 0), maxX0 = (p.maxX | 0), maxY0 = (p.maxY | 0);
      if (!(maxX0 >= minX0 && maxY0 >= minY0)) {
        p.holesCount = 0;
        p.holeAreaPx = 0;
        p.holeFractionOfBBox = 0;
        p.holeFractionOfArea = 0;
        continue;
      }

      // Clamp bbox to image
      const minX = clampInt(minX0, 0, WW - 1);
      const maxX = clampInt(maxX0, 0, WW - 1);
      const minY = clampInt(minY0, 0, HH - 1);
      const maxY = clampInt(maxY0, 0, HH - 1);

      const bw = (maxX - minX + 1) | 0;
      const bh = (maxY - minY + 1) | 0;
      const bArea = bw * bh;

      if (bw <= 1 || bh <= 1 || bArea <= 0) {
        p.holesCount = 0;
        p.holeAreaPx = 0;
        p.holeFractionOfBBox = 0;
        p.holeFractionOfArea = 0;
        continue;
      }

      // Build mask: 1 = province pixel, 0 = not province
      const mask = new Uint8Array(bArea);
      let idx = 0;
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const pid2 = pidAtXY(x, y);
          mask[idx++] = (pid2 === pid) ? 1 : 0;
        }
      }

      // visited for non-province pixels: 1 = visited outside or hole
      const vis = new Uint8Array(bArea);

      function pushIfOutside0(x, y) {
        const ii = y * bw + x;
        if (mask[ii] === 0 && vis[ii] === 0) {
          vis[ii] = 1;
          stack.push(ii);
        }
      }

      // Flood fill from bbox boundary over zeros => outside
      stack.length = 0;

      // top/bottom rows
      for (let x = 0; x < bw; x++) {
        pushIfOutside0(x, 0);
        pushIfOutside0(x, bh - 1);
      }
      // left/right cols
      for (let y = 0; y < bh; y++) {
        pushIfOutside0(0, y);
        pushIfOutside0(bw - 1, y);
      }

      while (stack.length) {
        const ii = stack.pop();
        const x = ii % bw;
        const y = (ii / bw) | 0;

        // 4-neighbors within bbox
        if (x > 0) {
          const jj = ii - 1;
          if (mask[jj] === 0 && vis[jj] === 0) { vis[jj] = 1; stack.push(jj); }
        }
        if (x + 1 < bw) {
          const jj = ii + 1;
          if (mask[jj] === 0 && vis[jj] === 0) { vis[jj] = 1; stack.push(jj); }
        }
        if (y > 0) {
          const jj = ii - bw;
          if (mask[jj] === 0 && vis[jj] === 0) { vis[jj] = 1; stack.push(jj); }
        }
        if (y + 1 < bh) {
          const jj = ii + bw;
          if (mask[jj] === 0 && vis[jj] === 0) { vis[jj] = 1; stack.push(jj); }
        }
      }

      // Remaining 0s with vis==0 are holes. Count components + area.
      let holesCount = 0;
      let holeArea = 0;

      for (let ii = 0; ii < bArea; ii++) {
        if (mask[ii] !== 0 || vis[ii] !== 0) continue;

        // New hole component
        holesCount++;
        // Flood fill this hole
        vis[ii] = 1;
        stack.length = 0;
        stack.push(ii);

        while (stack.length) {
          const kk = stack.pop();
          holeArea++;

          const x = kk % bw;
          const y = (kk / bw) | 0;

          if (x > 0) {
            const jj = kk - 1;
            if (mask[jj] === 0 && vis[jj] === 0) { vis[jj] = 1; stack.push(jj); }
          }
          if (x + 1 < bw) {
            const jj = kk + 1;
            if (mask[jj] === 0 && vis[jj] === 0) { vis[jj] = 1; stack.push(jj); }
          }
          if (y > 0) {
            const jj = kk - bw;
            if (mask[jj] === 0 && vis[jj] === 0) { vis[jj] = 1; stack.push(jj); }
          }
          if (y + 1 < bh) {
            const jj = kk + bw;
            if (mask[jj] === 0 && vis[jj] === 0) { vis[jj] = 1; stack.push(jj); }
          }
        }
      }

      p.holesCount = holesCount | 0;
      p.holeAreaPx = holeArea | 0;
      p.holeFractionOfBBox = (bArea > 0) ? (holeArea / bArea) : 0;

      const A = (p.areaPx | 0) || 0;
      p.holeFractionOfArea = (A > 0) ? (holeArea / A) : 0;

      holesProvinces++;
    }

    holesDone = true;
  }

  // -----------------------------
  // Final derived “best perimeter” convenience fields
  // -----------------------------
  for (let pid = 0; pid < provinces.length; pid++) {
    const p = provinces[pid];
    if (!p) continue;
    if (landOnly && p.isLand === false) continue;

    // Pick best perimeter for downstream calculations
    p.perimeterBestPx = (typeof p.truePerimeterPx === "number" && p.truePerimeterPx > 0)
      ? p.truePerimeterPx
      : (p.perimeterPx | 0);

    // Best compactness/complexity
    p.compactnessBest = (typeof p.trueCompactness === "number" && p.trueCompactness > 0)
      ? p.trueCompactness
      : (p.compactness || 0);

    p.shapeComplexityBest = (typeof p.trueShapeComplexity === "number" && p.trueShapeComplexity > 0)
      ? p.trueShapeComplexity
      : (p.shapeComplexity || 0);
  }

  return {
    ok: true,

    map: {
      hasPixels: !!hasPix,
      hasProvinceMap: !!hasMap,
      W: WW,
      H: HH,
      wrapX: !!wrapX
    },

    passes: {
      bboxAndCheap: !!computeBboxAndCheap,
      pixelPerimeters: !!(computePixelPerimeters && hasMap),
      pixelBorders: !!(computePixelBorders && computePixelPerimeters && hasMap),
      moments: { enabled: !!computeMoments, done: momentsDone, provincesWithMoments: momentsProvinces },
      components: { enabled: !!computeComponents, done: componentsDone, provincesLabeled: componentsLabeled },
      holes: { enabled: !!computeHoles, done: holesDone, provincesWithHoles: holesProvinces }
    },

    provincesProcessed: processed,
    skipped,
    degenerate,

    maxima: {
      maxTruePerimeterPx: maxTruePerim,
      maxTruePerimeterId: maxTruePerimId,
      maxShapeComplexity: maxComplex,
      maxShapeComplexityId: maxComplexId
    }
  };
}




// ---- Province shape + geometry (drop-in) ----
// Computes useful shape descriptors for every province using ONLY existing fields:
//   p.areaPx
//   p.minX/minY/maxX/maxY
//   p.neighborBorderPx (for perimeter via province borders)
// Optional (improves results):
//   p.isLand (so you can skip water if desired)
//   If you want *true* perimeter including map-edge/outside, you need a pixel pass; this computes
//   perimeter against OTHER provinces only (sum of borderPx to neighbors).
//
// Writes per province:
//   p.bboxW, p.bboxH, p.bboxAreaPx
//   p.bboxAspect
//   p.bboxFill                 = areaPx / bboxAreaPx
//   p.perimeterPx              = sum(borderPx to neighbors) (internal perimeter)
//   p.compactness              = 4πA / P^2   (0..1-ish)
//   p.thinness                 = P^2 / (4πA) (>=1; inverse of compactness)
//   p.shapeComplexity          = P / sqrt(A) (scale-ish complexity proxy)
//   p.equivRadiusPx            = sqrt(A/π)
//   p.equivDiameterPx          = 2*equivRadiusPx
//   p.extentX, p.extentY       = bboxW, bboxH (aliases)
//   p.isDegenerate             (1 if area too small or bbox invalid)
//
// If opts.computeMoments is true AND you provide ctx/cv (or imgData) for a pixel scan,
// it will additionally compute:
//   p.momentAngleDeg           principal axis angle (0..180)
//   p.elongation               major/minor axis ratio (>=1)
//   p.eccentricity             0..1-ish (derived)
// This extra pass is optional; the cheap metrics are often enough.
/*function computeProvinceShapeGeometry(opts = {}) {
  const {
    provinces = (window.provinces || []),

    // whether to compute pixel-accurate second moments (extra pass over province map)
    computeMoments = false,

    // If computeMoments=true, you need one of:
    //   - imgData: ImageData of the province map (ctx.getImageData(...))
    //   - ctx + W + H (will call getImageData internally)
    imgData = null,
    ctx = null,
    W = (window.cv ? window.cv.width : 0),
    H = (window.cv ? window.cv.height : 0),

    // To map pixels -> province id we need provinceByRgbInt:
    //   window.provinceByRgbInt : Map(rgbInt->id)
    provinceByRgbInt = (window.provinceByRgbInt || null),

    // If true, compute only for land provinces (p.isLand !== false); else for all provinces
    landOnly = false
  } = opts;

  const PI = Math.PI;
  const epsA = 1e-9;

  // ---- Pass 1: cheap bbox + perimeter-based metrics (no pixel reads) ----
  let count = 0, skipped = 0, degenerate = 0;
  let maxPerim = -1, maxPerimId = -1;
  let maxComplex = -1, maxComplexId = -1;

  for (let pid = 0; pid < provinces.length; pid++) {
    const p = provinces[pid];
    if (!p) { skipped++; continue; }
    if (landOnly && p.isLand === false) { skipped++; continue; }

    const A = (p.areaPx | 0);
    const minX = p.minX, minY = p.minY, maxX = p.maxX, maxY = p.maxY;

    // bbox sanity
    const bboxW = (typeof minX === "number" && typeof maxX === "number") ? (maxX - minX + 1) : 0;
    const bboxH = (typeof minY === "number" && typeof maxY === "number") ? (maxY - minY + 1) : 0;
    const bboxAreaPx = (bboxW > 0 && bboxH > 0) ? (bboxW * bboxH) : 0;

    // perimeter: sum of borders to neighbors
    let P = 0;
    const nb = p.neighborBorderPx || {};
    for (const k in nb) P += (nb[k] | 0);

    // base fields
    p.bboxW = bboxW;
    p.bboxH = bboxH;
    p.extentX = bboxW;
    p.extentY = bboxH;
    p.bboxAreaPx = bboxAreaPx;
    p.bboxAspect = (bboxH > 0) ? (bboxW / bboxH) : 0;
    p.bboxFill = (bboxAreaPx > 0) ? (A / bboxAreaPx) : 0;

    p.perimeterPx = P;

    if (A <= 0 || P <= 0 || bboxAreaPx <= 0) {
      p.isDegenerate = 1;
      p.compactness = 0;
      p.thinness = 0;
      p.shapeComplexity = 0;
      p.equivRadiusPx = 0;
      p.equivDiameterPx = 0;
      degenerate++;
      count++;
      continue;
    }

    p.isDegenerate = 0;

    // Compactness / thinness
    const compactness = (4 * PI * A) / (P * P + epsA); // 0..1-ish
    p.compactness = compactness;
    p.thinness = 1 / (compactness + epsA); // >=1

    // Complexity proxy: perimeter relative to sqrt(area)
    p.shapeComplexity = P / (Math.sqrt(A) + epsA);

    // Equivalent circle radius / diameter
    const r = Math.sqrt(A / PI);
    p.equivRadiusPx = r;
    p.equivDiameterPx = 2 * r;

    if (P > maxPerim) { maxPerim = P; maxPerimId = pid; }
    if (p.shapeComplexity > maxComplex) { maxComplex = p.shapeComplexity; maxComplexId = pid; }

    count++;
  }

  // ---- Pass 2 (optional): second-moment orientation/elongation (pixel scan) ----
  // This computes principal axis of the province pixel distribution.
  // Requires province map pixels -> province id mapping (provinceByRgbInt).
  let momentsDone = false;
  let momentsProvinces = 0;

  if (computeMoments) {
    let data = null;

    if (imgData && imgData.data && imgData.width && imgData.height) {
      data = imgData.data;
    } else if (ctx && W > 0 && H > 0) {
      data = ctx.getImageData(0, 0, W, H).data;
    } else if (window.ctx && window.cv && window.cv.width && window.cv.height) {
      data = window.ctx.getImageData(0, 0, window.cv.width, window.cv.height).data;
    }

    if (data && provinceByRgbInt && typeof provinceByRgbInt.get === "function") {
      const n = provinces.length;

      // accumulate central moments about centroid:
      // We need sums of x, y, x^2, y^2, xy to derive covariance
      // But you already have centroidX/Y; we can accumulate dx^2 etc. directly.
      const sxx = new Float64Array(n);
      const syy = new Float64Array(n);
      const sxy = new Float64Array(n);
      const c = new Uint32Array(n);

      const w = W | 0, h = H | 0;
      // If W/H not passed, infer from known canvas
      const WW = w || (window.cv ? window.cv.width : 0);
      const HH = h || (window.cv ? window.cv.height : 0);

      if (WW > 0 && HH > 0) {
        for (let y = 0; y < HH; y++) {
          const rowBase = y * WW;
          for (let x = 0; x < WW; x++) {
            const i = ((rowBase + x) << 2);
            const rgbInt = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
            const pid = provinceByRgbInt.get(rgbInt);
            if (pid == null || pid < 0 || pid >= n) continue;

            const p = provinces[pid];
            if (!p) continue;
            if (landOnly && p.isLand === false) continue;
            if (p.isDegenerate) continue;

            const dx = x - (p.centroidX || 0);
            const dy = y - (p.centroidY || 0);

            sxx[pid] += dx * dx;
            syy[pid] += dy * dy;
            sxy[pid] += dx * dy;
            c[pid] += 1;
          }
        }

        // finalize per province
        for (let pid = 0; pid < provinces.length; pid++) {
          const p = provinces[pid];
          if (!p) continue;
          if (landOnly && p.isLand === false) continue;
          if (p.isDegenerate) {
            p.momentAngleDeg = null;
            p.elongation = null;
            p.eccentricity = null;
            continue;
          }

          const npx = c[pid] >>> 0;
          if (!npx) {
            p.momentAngleDeg = null;
            p.elongation = null;
            p.eccentricity = null;
            continue;
          }

          // covariance matrix elements (normalized)
          const Cxx = sxx[pid] / npx;
          const Cyy = syy[pid] / npx;
          const Cxy = sxy[pid] / npx;

          // principal axis angle: 0.5 * atan2(2Cxy, Cxx - Cyy)
          const theta = 0.5 * Math.atan2(2 * Cxy, (Cxx - Cyy));
          let deg = theta * (180 / PI);
          // map to 0..180
          if (deg < 0) deg += 180;

          // eigenvalues of covariance (variances along major/minor axes)
          const tr = Cxx + Cyy;
          const detTerm = Math.max(0, (Cxx - Cyy) * (Cxx - Cyy) + 4 * Cxy * Cxy);
          const s = Math.sqrt(detTerm);
          const lam1 = Math.max(0, 0.5 * (tr + s)); // major
          const lam2 = Math.max(0, 0.5 * (tr - s)); // minor

          // elongation: sqrt(lam1)/sqrt(lam2)
          const major = Math.sqrt(lam1 + epsA);
          const minor = Math.sqrt(lam2 + epsA);
          const elong = major / (minor + epsA);

          // eccentricity proxy: sqrt(1 - lam2/lam1) in [0..1)
          const ecc = lam1 > 0 ? Math.sqrt(Math.max(0, 1 - (lam2 / (lam1 + epsA)))) : 0;

          p.momentAngleDeg = deg;
          p.elongation = elong;
          p.eccentricity = ecc;

          momentsProvinces++;
        }

        momentsDone = true;
      }
    }
  }

  return {
    ok: true,
    provincesProcessed: count,
    skipped,
    degenerate,
    maxPerimeterPx: maxPerim,
    maxPerimeterId: maxPerimId,
    maxShapeComplexity: maxComplex,
    maxShapeComplexityId: maxComplexId,
    moments: {
      enabled: !!computeMoments,
      done: momentsDone,
      provincesWithMoments: momentsProvinces
    }
  };
}

*/