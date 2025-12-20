(function addTerrainViewToggle(){
  const host = document.querySelector('header .row.card');
  if (!host) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'toggleTerrainView';
  btn.textContent = 'Terrain View';
  host.appendChild(btn);

  // ---- terrain -> RGB ----
  const TERRAIN_COLORS = {
    sea:              { r: 10,  g: 30,  b: 80  },
    coastal_sea:      { r: 25,  g: 80,  b: 140 },
    plains:           { r: 204, g: 163, b: 102 },
    farmlands:        { r: 255, g: 0,   b: 0   },
    hills:            { r: 90,  g: 50,  b: 12  },
    mountains:        { r: 100, g: 100, b: 100 },
    desert:           { r: 255, g: 230, b: 0   },
    desert_mountains: { r: 23,  g: 19,  b: 38  },
    oasis:            { r: 155, g: 143, b: 204 },
    jungle:           { r: 10,  g: 60,  b: 35  },
    forest:           { r: 71,  g: 179, b: 45  },
    taiga:            { r: 46,  g: 153, b: 89  },
    wetlands:         { r: 77,  g: 153, b: 153 },
    floodplains:      { r: 55,  g: 31,  b: 153 },
    steppe:           { r: 200, g: 100, b: 25  },
    drylands:         { r: 220, g: 45,  b: 120 },
    default:          { r: 120, g: 120, b: 120 }
  };

  const canvas = document.getElementById('view');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  let isTerrainView = false;
  let cachedBaseImage = null; // snapshot of current Voronoi view to restore

  function ensureTerrainAssigned(){
    if (!Array.isArray(seeds) || !seeds.length) {
      alert("No provinces exist. Seed the map and run Voronoi first.");
      return false;
    }
    // Ensure terrain exists on every seed (uses your existing helper)
    for (const s of seeds) {
      if (!s) continue;
      if (!s.terrain) s.terrain = getTerrainAt(s.x, s.y);
    }
    return true;
  }

  // Seeds store color as integer like 1811535; convert to r/g/b
  // Assuming format 0xRRGGBB (matches your prior use)
  function intToRgb(n){
    n = (n >>> 0);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function buildSeedColorToTerrainRgb(){
    // Map "R,G,B" => [r,g,b] terrain color
    const m = new Map();
    for (const s of seeds) {
      if (!s) continue;
      const c = intToRgb(s.color ?? 0);
      const key = `${c.r},${c.g},${c.b}`;
      const tKey = (s.terrain || 'default');
      const tc = TERRAIN_COLORS[tKey] || TERRAIN_COLORS.default;
      m.set(key, [tc.r|0, tc.g|0, tc.b|0]);
    }
    return m;
  }

  function renderTerrainView(){
    if (!ensureTerrainAssigned()) return;

    // Cache current view to restore later (first time we switch)
    if (!cachedBaseImage) {
      try { cachedBaseImage = ctx.getImageData(0, 0, canvas.width, canvas.height); }
      catch (e) { cachedBaseImage = null; }
    }

    const w = canvas.width, h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;

    const map = buildSeedColorToTerrainRgb();
    const def = TERRAIN_COLORS.default;
    const defRGB = [def.r|0, def.g|0, def.b|0];

    // Recolor every pixel by matching its current province color (Voronoi color) to a seed
    for (let i = 0; i < d.length; i += 4) {
      const key = `${d[i]},${d[i+1]},${d[i+2]}`;
      const rgb = map.get(key) || defRGB;
      d[i]   = rgb[0];
      d[i+1] = rgb[1];
      d[i+2] = rgb[2];
      d[i+3] = 255;
    }

    ctx.putImageData(img, 0, 0);
  }

  function restoreBaseView(){
    if (cachedBaseImage) {
      ctx.putImageData(cachedBaseImage, 0, 0);
      return;
    }
    // Fallback: if you have a standard render function, call it
    // (won't error if missing)
    try { if (typeof renderPreview === 'function') renderPreview(); } catch(_) {}
    try { if (typeof renderLevel === 'function') renderLevel('provinces'); } catch(_) {}
  }

  function toggle(){
    isTerrainView = !isTerrainView;
    btn.textContent = isTerrainView ? 'Voronoi View' : 'Terrain View';

    if (isTerrainView) renderTerrainView();
    else restoreBaseView();
  }

  btn.addEventListener('click', toggle);
})();
