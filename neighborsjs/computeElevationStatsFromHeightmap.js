
// ---- Elevation stats (requires heightmap loaded into hcv/hctx) ----
// Stores per province: elevMin/elevMax/elevMean/elevStd/relief (all in 0..255 units)
function computeElevationStatsFromHeightmap() {
  const provinces = window.provinces || [];
  if (!heightReady || !hcv.width || !hcv.height) {
    // clear fields if no heightmap
    for (let pid = 0; pid < provinces.length; pid++) {
      const p = provinces[pid];
      if (!p) continue;
      delete p.elevMin;
      delete p.elevMax;
      delete p.elevMean;
      delete p.elevStd;
      delete p.relief;
    }
    return { enabled: false };
  }

  const W = hcv.width, H = hcv.height;
  const img = hctx.getImageData(0, 0, W, H);
  const data = img.data;

  const n = provinces.length;
  const count = new Uint32Array(n);
  const sum = new Float64Array(n);
  const sumSq = new Float64Array(n);

  const minV = new Float64Array(n);
  const maxV = new Float64Array(n);
  for (let i = 0; i < n; i++) { minV[i] = 1e18; maxV[i] = -1e18; }

  // height interpretation: grayscale; use red channel (assumes R=G=B)
  // Iterate pixels once, assign to province via the province-map neighbor tables already built.
  // We need province IDs per pixel: easiest is to re-read the province map pixels from main canvas.
  const provImg = ctx.getImageData(0, 0, cv.width, cv.height).data;

  for (let y = 0; y < H; y++) {
    const rowBase = y * W;
    for (let x = 0; x < W; x++) {
      const i = ((rowBase + x) << 2);

      // province id from province map pixel
      const pid = window.provinceByRgbInt.get((provImg[i] << 16) | (provImg[i+1] << 8) | provImg[i+2]);
      if (pid == null || pid < 0 || pid >= n) continue;

      const v = data[i]; // 0..255
      count[pid] += 1;
      sum[pid] += v;
      sumSq[pid] += v * v;
      if (v < minV[pid]) minV[pid] = v;
      if (v > maxV[pid]) maxV[pid] = v;
    }
  }

  let provincesWithElev = 0;
  let maxRelief = -1, maxReliefId = -1;

  for (let pid = 0; pid < n; pid++) {
    const p = provinces[pid];
    if (!p) continue;

    const c = count[pid] >>> 0;
    if (!c) {
      // no pixels hit (missing color / skipped), keep fields absent
      delete p.elevMin; delete p.elevMax; delete p.elevMean; delete p.elevStd; delete p.relief;
      continue;
    }

    const mean = sum[pid] / c;
    const variance = Math.max(0, (sumSq[pid] / c) - (mean * mean));
    const std = Math.sqrt(variance);

    const mn = minV[pid];
    const mx = maxV[pid];
    const relief = mx - mn;

    p.elevMin = mn;
    p.elevMax = mx;
    p.elevMean = mean;
    p.elevStd = std;
    p.relief = relief;

    provincesWithElev++;
    if (relief > maxRelief) { maxRelief = relief; maxReliefId = pid; }
  }

  return { enabled: true, provincesWithElev, maxRelief, maxReliefId };
}
