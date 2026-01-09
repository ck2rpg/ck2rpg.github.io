
// ---- Debug draw: Ocean partition map (land = white, oceans = distinct colors) ----
// Assumes you already ran partitionWorldOceanIntoEarthLikeOceans() (or similar) and have:
//   provinces[pid].oceanId for water provinces (0..K-1)
// Uses province map pixels to paint province regions.
//
// Call example:
//   drawOceanMaps({ cv, ctx, provinces: window.provinces, provinceByRgbInt: window.provinceByRgbInt, filename: "ocean_ids.png" });
//
// Notes:
// - This draws at the province-map resolution (cv.width × cv.height).
// - Colors are deterministic per oceanId.
// - If a pixel color isn't mapped to a province id, it draws magenta to reveal missing-color issues.
function drawOceanMaps(opts = {}) {
  const {
    cv = (window.cv || null),
    ctx = (window.ctx || null),
    provinces = (window.provinces || []),
    provinceByRgbInt = (window.provinceByRgbInt || null),

    // output
    filename = "ocean_ids.png",

    // style
    landRGB = [255, 255, 255],       // land pixels
    unknownRGB = [255, 0, 255],      // unknown province pixels
    unlabeledWaterRGB = [120, 120, 120], // water province but oceanId null/undefined

    // if you want borders emphasized (cheap), set >0 (adds darkening where province changes)
    borderEmphasis = 0 // 0..1 (try 0.25)
  } = opts;

  if (!cv || !ctx || !cv.width || !cv.height) throw new Error("drawOceanMaps: missing cv/ctx.");
  if (!provinceByRgbInt || typeof provinceByRgbInt.get !== "function") throw new Error("drawOceanMaps: missing provinceByRgbInt Map.");

  const W = cv.width | 0;
  const H = cv.height | 0;

  // read the province map pixels (source)
  const src = ctx.getImageData(0, 0, W, H);
  const s = src.data;

  // output canvas
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const octx = out.getContext("2d", { willReadFrequently: true });
  const outImg = octx.createImageData(W, H);
  const d = outImg.data;

  // deterministic "nice-ish" color from oceanId (no hardcoded palette)
  function oceanColor(id) {
    // xorshift-ish hash -> RGB in a pleasant range
    let x = (id | 0) + 1;
    x ^= (x << 13); x |= 0;
    x ^= (x >>> 17);
    x ^= (x << 5); x |= 0;

    // spread bits
    const r = (x & 255);
    const g = ((x >>> 8) & 255);
    const b = ((x >>> 16) & 255);

    // lift away from too-dark/too-light
    const lift = (v) => {
      // map 0..255 -> 48..220
      return 48 + ((v * 172) / 255);
    };

    return [lift(r) | 0, lift(g) | 0, lift(b) | 0];
  }

  // optional border emphasis: we can darken pixels that are on a province boundary
  // by checking right/down neighbor province ids from the source map.
  const doBorder = borderEmphasis > 0;
  const be = Math.max(0, Math.min(1, borderEmphasis));

  // small cache for ocean colors
  const colorCache = new Map();

  const getOceanRGB = (oid) => {
    if (oid == null || oid < 0) return unlabeledWaterRGB;
    const k = oid | 0;
    let c = colorCache.get(k);
    if (!c) { c = oceanColor(k); colorCache.set(k, c); }
    return c;
  };

  // helper to fetch province id at pixel index i (rgba index)
  const provIdAt = (i) => {
    const rgbInt = (s[i] << 16) | (s[i + 1] << 8) | s[i + 2];
    const pid = provinceByRgbInt.get(rgbInt);
    return (pid == null) ? -1 : (pid | 0);
  };

  for (let y = 0; y < H; y++) {
    const rowBase = y * W;
    for (let x = 0; x < W; x++) {
      const pi = ((rowBase + x) << 2);

      const pid = provIdAt(pi);

      let r, g, b;
      if (pid < 0 || !provinces[pid]) {
        [r, g, b] = unknownRGB;
      } else {
        const p = provinces[pid];
        if (p.isLand === false) {
          const oid = p.oceanId;
          [r, g, b] = getOceanRGB(oid);
        } else {
          [r, g, b] = landRGB;
        }
      }

      if (doBorder) {
        // boundary if neighbor pixel belongs to different province
        let boundary = false;

        if (x + 1 < W) {
          const pidR = provIdAt(pi + 4);
          if (pidR !== pid) boundary = true;
        }
        if (!boundary && y + 1 < H) {
          const pidD = provIdAt(pi + (W << 2));
          if (pidD !== pid) boundary = true;
        }

        if (boundary) {
          const dark = 1 - 0.65 * be; // darken up to ~65%
          r = (r * dark) | 0;
          g = (g * dark) | 0;
          b = (b * dark) | 0;
        }
      }

      d[pi] = r;
      d[pi + 1] = g;
      d[pi + 2] = b;
      d[pi + 3] = 255;
    }
  }

  octx.putImageData(outImg, 0, 0);

  // download PNG
  out.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

