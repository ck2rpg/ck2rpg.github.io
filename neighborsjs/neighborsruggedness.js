// ---- Province ruggedness + slope from heightmap (pixel-local; arability-ready) ----
// Requires (already in your app):
//   - hcv/hctx contains heightmap aligned to province map size (cv.width x cv.height)
//   - ctx contains province-id color image (same one used to build province stats)
//   - window.provinceByRgbInt : Map(rgbInt -> provinceId)
//   - window.provinces[] exists
//
// Computes (per province; land-only by default):
//   p.triMeanM, p.triStdM
//   p.slopeMeanDeg, p.slopeStdDeg
//   p.steepFrac                // fraction of pixels with slope >= steepDeg
//   p.ruggedness01              // 0..1 normalized (quantile-based)
//   p.arability01_fromRuggedness // simple terrain-only arability proxy (1=best)
//
// Notes:
// - By default, only uses pixels with height >= seaLevel (land).
// - If kmPerPx is provided, slope becomes physically meaningful.
//   If not, slope still correlates well (relative), but degrees are approximate.
function computeProvinceRuggednessFromHeightmap(opts = {}) {
  const {
    provinces = (window.provinces || []),
    provinceByRgbInt = (window.provinceByRgbInt || null),

    // heightmap source (aligned to province map)
    heightCanvas = (typeof hcv !== "undefined" ? hcv : null),
    heightCtx = (typeof hctx !== "undefined" ? hctx : null),

    // province-id pixel source
    provCtx = (typeof ctx !== "undefined" ? ctx : null),
    W = (window.cv ? window.cv.width : (heightCanvas ? heightCanvas.width : 0)),
    H = (window.cv ? window.cv.height : (heightCanvas ? heightCanvas.height : 0)),

    // your convention
    seaLevel = 19,

    // meters mapping: 19..255 spans 0..8550m (your assumption)
    landTopMeters = 8550,

    // slope uses pixel spacing. If kmPerPx is known, pass it.
    // If 0/undefined, we assume 1px = 1 unit (relative slope; still useful).
    kmPerPx = 0,

    // TRI neighborhood and slope method
    use8NeighborsForTRI = true,   // TRI uses 8-neighbor diffs
    slopeMethod = "central",      // "central" (fast) | "sobel" (a bit smoother)

    // arability helper knobs
    steepDeg = 15,                // pixels steeper than this are “hard to farm”
    storeOnWaterProvinces = false, // if true, writes zeros on water provinces; else deletes fields

    // normalization / scaling
    normalizeQuantiles = [0.05, 0.95], // for ruggedness01 mapping (robust to outliers)

    // debug / stats
    returnDistributions = false
  } = opts;

  if (!provinces.length) return { ok: false, reason: "no provinces" };
  if (!provinceByRgbInt || typeof provinceByRgbInt.get !== "function") {
    return { ok: false, reason: "missing window.provinceByRgbInt Map" };
  }
  if (!heightCanvas || !heightCtx || !(heightCanvas.width > 0) || !(heightCanvas.height > 0)) {
    return { ok: false, reason: "heightmap not ready (hcv/hctx)" };
  }
  if (!provCtx || !(W > 0) || !(H > 0)) {
    return { ok: false, reason: "missing province ctx or W/H" };
  }
  if (heightCanvas.width !== W || heightCanvas.height !== H) {
    return { ok: false, reason: `heightmap not aligned to province map (${heightCanvas.width}x${heightCanvas.height} vs ${W}x${H})` };
  }

  // --- meters per height unit (based on your 19..255 => 0..8550m mapping) ---
  const landUnits = Math.max(1, (255 - seaLevel));
  const mPerUnit = landTopMeters / landUnits; // meters per grayscale unit above sea
  // For below sea, we still use same scale for diffs (you can change later if you define bathy).
  const valueToMeters = (v) => (v - seaLevel) * mPerUnit;

  // --- pixel spacing in meters for slope ---
  const pxMeters = (kmPerPx && kmPerPx > 0) ? (kmPerPx * 1000) : 1;

  // --- pull pixel arrays ---
  const hImg = heightCtx.getImageData(0, 0, W, H).data; // grayscale in R
  const pImg = provCtx.getImageData(0, 0, W, H).data;   // province RGB

  // --- accumulators per province ---
  const n = provinces.length;

  const count = new Uint32Array(n);

  // TRI moments (meters)
  const triSum = new Float64Array(n);
  const triSumSq = new Float64Array(n);

  // slope moments (degrees)
  const slopeSum = new Float64Array(n);
  const slopeSumSq = new Float64Array(n);

  const steepCount = new Uint32Array(n);

  // helper: height at (x,y) as meters
  const idx = (x, y) => ((y * W + x) << 2);
  const hAt = (x, y) => valueToMeters(hImg[idx(x, y)]); // uses R

  // neighbor offsets for TRI
  const N4 = [[-1,0],[1,0],[0,-1],[0,1]];
  const N8 = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
  const N = use8NeighborsForTRI ? N8 : N4;

  // slope function (meters->deg)
  // central difference:
  //   dzdx = (z(x+1)-z(x-1)) / (2*dx)
  // sobel:
  //   dzdx ~ ( (z1+2z2+z3) - (z7+2z8+z9) ) / (8*dx) etc.
  function slopeDegCentral(x, y) {
    // clamp edges by mirroring
    const xm1 = x > 0 ? x - 1 : x;
    const xp1 = x + 1 < W ? x + 1 : x;
    const ym1 = y > 0 ? y - 1 : y;
    const yp1 = y + 1 < H ? y + 1 : y;

    const zL = hAt(xm1, y);
    const zR = hAt(xp1, y);
    const zU = hAt(x, ym1);
    const zD = hAt(x, yp1);

    const dzdx = (zR - zL) / (2 * pxMeters);
    const dzdy = (zD - zU) / (2 * pxMeters);

    const g = Math.sqrt(dzdx*dzdx + dzdy*dzdy); // rise/run
    return Math.atan(g) * (180 / Math.PI);
  }

  function slopeDegSobel(x, y) {
    const xm1 = x > 0 ? x - 1 : x;
    const xp1 = x + 1 < W ? x + 1 : x;
    const ym1 = y > 0 ? y - 1 : y;
    const yp1 = y + 1 < H ? y + 1 : y;

    // 3x3 neighborhood
    const z11 = hAt(xm1, ym1), z21 = hAt(x, ym1), z31 = hAt(xp1, ym1);
    const z12 = hAt(xm1, y),   z22 = hAt(x, y),   z32 = hAt(xp1, y);
    const z13 = hAt(xm1, yp1), z23 = hAt(x, yp1), z33 = hAt(xp1, yp1);

    // Sobel kernels
    const gx = (z31 + 2*z32 + z33) - (z11 + 2*z12 + z13);
    const gy = (z13 + 2*z23 + z33) - (z11 + 2*z21 + z31);

    const dzdx = gx / (8 * pxMeters);
    const dzdy = gy / (8 * pxMeters);

    const g = Math.sqrt(dzdx*dzdx + dzdy*dzdy);
    return Math.atan(g) * (180 / Math.PI);
  }

  const slopeDeg = (slopeMethod === "sobel") ? slopeDegSobel : slopeDegCentral;

  // --- main scan ---
  // We compute TRI & slope for each *land pixel* (v >= seaLevel),
  // then aggregate those pixel values into the owning province.
  for (let y = 0; y < H; y++) {
    const rowBase = y * W;
    for (let x = 0; x < W; x++) {
      const i = ((rowBase + x) << 2);

      const hv = hImg[i]; // 0..255
      if (hv < seaLevel) continue; // only land pixels for ruggedness/arability

      const rgbInt = (pImg[i] << 16) | (pImg[i+1] << 8) | pImg[i+2];
      const pid = provinceByRgbInt.get(rgbInt);
      if (pid == null || pid < 0 || pid >= n) continue;

      const p = provinces[pid];
      if (!p) continue;
      if (p.isLand === false) continue; // if province tagged water, skip

      const z0 = valueToMeters(hv);

      // TRI: mean abs diff to neighbors (meters)
      let s = 0;
      let k = 0;
      for (let t = 0; t < N.length; t++) {
        const dx = N[t][0], dy = N[t][1];
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
        const zv = hImg[idx(xx, yy)];
        // TRI on land-only neighborhood tends to behave better for farming:
        if (zv < seaLevel) continue; // ignore water neighbors for ruggedness
        const z1 = valueToMeters(zv);
        s += Math.abs(z1 - z0);
        k++;
      }
      const tri = (k > 0) ? (s / k) : 0;

      // slope (deg)
      const sl = slopeDeg(x, y);

      count[pid] += 1;
      triSum[pid] += tri;
      triSumSq[pid] += tri * tri;

      slopeSum[pid] += sl;
      slopeSumSq[pid] += sl * sl;

      if (sl >= steepDeg) steepCount[pid] += 1;
    }
  }

  // --- finalize per province ---
  // Also build an array of a single ruggedness scalar so we can robust-normalize it.
  const ruggedScalar = new Float64Array(n); // we'll use triMean + 0.6*slopeMean (meters+deg mixed; normalized later)
  const scalars = [];

  let provincesWithSamples = 0;
  for (let pid = 0; pid < n; pid++) {
    const p = provinces[pid];
    if (!p) continue;

    const c = count[pid] >>> 0;

    // Water province handling
    if (p.isLand === false) {
      if (storeOnWaterProvinces) {
        p.triMeanM = 0; p.triStdM = 0;
        p.slopeMeanDeg = 0; p.slopeStdDeg = 0;
        p.steepFrac = 0;
        p.ruggedness01 = 0;
        p.arability01_fromRuggedness = 0;
      } else {
        delete p.triMeanM; delete p.triStdM;
        delete p.slopeMeanDeg; delete p.slopeStdDeg;
        delete p.steepFrac;
        delete p.ruggedness01;
        delete p.arability01_fromRuggedness;
      }
      ruggedScalar[pid] = NaN;
      continue;
    }

    if (!c) {
      // no land pixels hit inside this province (e.g., fully below sea, or missing color mapping)
      p.triMeanM = null; p.triStdM = null;
      p.slopeMeanDeg = null; p.slopeStdDeg = null;
      p.steepFrac = null;
      p.ruggedness01 = null;
      p.arability01_fromRuggedness = null;
      ruggedScalar[pid] = NaN;
      continue;
    }

    const triMean = triSum[pid] / c;
    const triVar = Math.max(0, (triSumSq[pid] / c) - triMean * triMean);
    const triStd = Math.sqrt(triVar);

    const slMean = slopeSum[pid] / c;
    const slVar = Math.max(0, (slopeSumSq[pid] / c) - slMean * slMean);
    const slStd = Math.sqrt(slVar);

    const steepFrac = (steepCount[pid] >>> 0) / c;

    p.triMeanM = triMean;
    p.triStdM = triStd;
    p.slopeMeanDeg = slMean;
    p.slopeStdDeg = slStd;
    p.steepFrac = steepFrac;

    // Build a scalar that correlates well with “mountainousness” before normalization:
    // TRI is in meters, slope is degrees; we blend lightly.
    const s0 = triMean + 0.6 * slMean;
    ruggedScalar[pid] = s0;
    scalars.push(s0);

    provincesWithSamples++;
  }

  // --- robust normalization to 0..1 (quantile-based) ---
  function quantile(sorted, q) {
    const n = sorted.length;
    if (!n) return 0;
    const qq = Math.max(0, Math.min(1, q));
    const pos = (n - 1) * qq;
    const lo = Math.floor(pos), hi = Math.ceil(pos);
    if (lo === hi) return sorted[lo];
    const t = pos - lo;
    return sorted[lo] * (1 - t) + sorted[hi] * t;
  }

  const sorted = scalars.slice().sort((a,b)=>a-b);
  const q0 = normalizeQuantiles[0] ?? 0.05;
  const q1 = normalizeQuantiles[1] ?? 0.95;
  const lo = quantile(sorted, q0);
  const hi = Math.max(lo + 1e-9, quantile(sorted, q1));

  // Arability terrain-only mapping:
  //   - penalize ruggedness strongly
  //   - penalize steepFrac additionally
  // You can later multiply by climateSuitability/moisture/etc.
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  let arabilityAssigned = 0;

  for (let pid = 0; pid < n; pid++) {
    const p = provinces[pid];
    if (!p || p.isLand === false) continue;

    const s0 = ruggedScalar[pid];
    if (!Number.isFinite(s0)) {
      p.ruggedness01 = null;
      p.arability01_fromRuggedness = null;
      continue;
    }

    const r01 = clamp01((s0 - lo) / (hi - lo));
    p.ruggedness01 = r01;

    // Terrain-only arability:
    // - base: (1 - ruggedness)^1.35 (steeper penalty in mountains)
    // - additional penalty for steep pixel share
    const base = Math.pow(1 - r01, 1.35);
    const steepPenalty = 1 - clamp01(p.steepFrac || 0); // 0..1
    const ar = clamp01(base * (0.65 + 0.35 * steepPenalty));

    p.arability01_fromRuggedness = ar;
    arabilityAssigned++;
  }

  const out = {
    ok: true,
    W, H,
    seaLevel,
    landTopMeters,
    mPerUnit,
    pxMeters,
    slopeMethod,
    use8NeighborsForTRI,
    steepDeg,
    provinces: n,
    provincesWithSamples,
    arabilityAssigned,
    ruggednessNormalize: { q0, q1, lo, hi }
  };

  if (returnDistributions) {
    out.__scalarSorted = sorted; // can be large; use only for debugging
  }

  return out;
}
