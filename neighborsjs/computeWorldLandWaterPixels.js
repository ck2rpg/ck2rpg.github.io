

// ---- World stats: land/water pixel counts from heightmap (NO province map needed) ----
// Rule: elevation >= 19 => land, else water.
// Writes/returns: window.world = { landPx, waterPx, totalPx, landFrac, waterFrac, seaLevel: 19, w, h }
function computeWorldLandWaterPixels(opts = {}) {
  const {
    threshold = 19,                 // 19 and above is land
    // if you want to count from heightmap canvas (recommended since you already have it aligned):
    canvas = (typeof hcv !== "undefined" ? hcv : null),
    ctx2d  = (typeof hctx !== "undefined" ? hctx : null),
    // fallback: count from visible map canvas if you prefer (not recommended for this rule)
    fallbackCanvas = (typeof cv !== "undefined" ? cv : null),
    fallbackCtx2d  = (typeof ctx !== "undefined" ? ctx : null),
    // store on window.world (default true)
    storeGlobal = true
  } = opts;

  const useCanvas = (canvas && ctx2d && canvas.width > 0 && canvas.height > 0) ? { c: canvas, g: ctx2d }
                  : (fallbackCanvas && fallbackCtx2d && fallbackCanvas.width > 0 && fallbackCanvas.height > 0) ? { c: fallbackCanvas, g: fallbackCtx2d }
                  : null;

  if (!useCanvas) {
    const w = {
      landPx: 0,
      waterPx: 0,
      totalPx: 0,
      landFrac: 0,
      waterFrac: 0,
      seaLevel: threshold,
      w: 0,
      h: 0,
      enabled: false,
      reason: "No available canvas/context to read pixels."
    };
    if (storeGlobal) window.world = w;
    return w;
  }

  const C = useCanvas.c, G = useCanvas.g;
  const W = C.width | 0, H = C.height | 0;
  const img = G.getImageData(0, 0, W, H).data;

  // Your heightmap stats use red channel as grayscale; do the same here.
  let landPx = 0;
  const totalPx = W * H;

  // Iterate pixels; read red channel at i
  for (let i = 0; i < img.length; i += 4) {
    if (img[i] >= threshold) landPx++;
  }

  const waterPx = totalPx - landPx;

  const world = {
    landPx,
    waterPx,
    totalPx,
    landFrac: totalPx ? landPx / totalPx : 0,
    waterFrac: totalPx ? waterPx / totalPx : 0,
    seaLevel: threshold,
    w: W,
    h: H,
    enabled: true
  };

  if (storeGlobal) window.world = world;
  return world;
}
