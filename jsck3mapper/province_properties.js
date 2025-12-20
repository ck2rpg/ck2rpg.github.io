// --- utilities --------------------------------------------------------------

function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x); }
function round3(x){ return Math.round(x * 1000) / 1000; }

// Ensure the per-province derived fields exist (same sampling logic you used in geoStats)
function ensureProvinceDerived(p, opts = {}) {
  const {
    overwrite = false,
    storeUnderDerivedObject = false,
    storeExtras = true
  } = opts;

  const seed = seeds?.[p];
  if (!seed) return null;
  if (!W || !H || !heightData) return seed;

  function set(seedObj, key, value) {
    if (!seedObj) return;
    if (overwrite || seedObj[key] === undefined || seedObj[key] === null) seedObj[key] = value;
  }
  function setD(seedObj, key, value) {
    if (!seedObj) return;
    if (storeUnderDerivedObject) {
      if (!seedObj.derived || typeof seedObj.derived !== "object") seedObj.derived = {};
      if (overwrite || seedObj.derived[key] === undefined || seedObj.derived[key] === null) {
        seedObj.derived[key] = value;
      }
    } else {
      set(seedObj, key, value);
    }
  }
  function getD(seedObj, key) {
    return storeUnderDerivedObject ? seedObj?.derived?.[key] : seedObj?.[key];
  }

  // If we already have the key fields and we're not overwriting, bail early
  if (!overwrite) {
    const have =
      getD(seed, "latNorm") != null &&
      getD(seed, "elevM") !== undefined &&
      getD(seed, "terrainResolved") != null &&
      getD(seed, "koppenGroup") != null &&
      getD(seed, "effIsLand") != null &&
      getD(seed, "isCoastal") != null;
    if (have) return seed;
  }

  const x = seed.x | 0, y = seed.y | 0;
  const k = y * W + x;
  if (k < 0 || k >= heightData.length) return seed;

  const h  = heightData[k];
  const hm = heightToMeters(h);

  const latNorm = H > 1 ? 1 - (y / (H - 1)) : 0.5;
  const lonNorm = W > 1 ? (x / (W - 1)) : 0.5;

  const effIsLand = effMask ? (effMask[k] === 1) : !!seed.isLand;
  const isCoast   = (typeof isCoastalPixel === "function") ? !!isCoastalPixel(x, y) : false;

  const terr = (typeof seed.terrain === "string" && seed.terrain !== "default")
    ? seed.terrain
    : (typeof getTerrainAt === "function" ? getTerrainAt(x, y) : "plains");

  let koppenIndex = null;
  let koppenGroup = "?";
  let koppenCode  = null;

  if (typeof getKoppenIndexAt === "function") {
    const idxK = getKoppenIndexAt(x, y);
    if (idxK != null && idxK >= 0 && typeof KOPPEN_CLASSES !== "undefined" && KOPPEN_CLASSES[idxK]) {
      koppenIndex = idxK;
      const kc = KOPPEN_CLASSES[idxK];
      koppenGroup = kc?.group || "?";
      koppenCode  = kc?.code  || null;
    }
  }

  setD(seed, "effIsLand", effIsLand ? 1 : 0);
  setD(seed, "isCoastal", isCoast ? 1 : 0);
  setD(seed, "elevM", (hm != null ? hm : null));
  setD(seed, "terrainResolved", terr);
  setD(seed, "koppenIndex", koppenIndex);
  setD(seed, "koppenGroup", koppenGroup);
  if (koppenCode != null) setD(seed, "koppenCode", koppenCode);

  if (storeExtras) {
    setD(seed, "latNorm", latNorm);
    setD(seed, "lonNorm", lonNorm);
  }

  return seed;
}

// --- winter severity model --------------------------------------------------
// Goal: 0..1, sea=0, England-ish mid-lat ~0.45, cold/highlands/continental push up,
// coastal and warm climates push down.
function computeWinterSeverityForProvince(seed, opts = {}) {
  const { storeUnderDerivedObject = false } = opts;
  const D = storeUnderDerivedObject ? (seed.derived || {}) : seed;

  const effIsLand = (D.effIsLand != null) ? !!D.effIsLand : !!seed.isLand;
  if (!effIsLand) return 0.0;

  const latNorm = (D.latNorm != null) ? D.latNorm : 0.5;
  const latFromEquator = Math.abs(latNorm - 0.5) * 2; // 0 equator, 1 poles

  const elevM = (typeof D.elevM === "number" && isFinite(D.elevM)) ? D.elevM : 0;
  const terr  = (typeof D.terrainResolved === "string") ? D.terrainResolved : "plains";
  const kg    = (typeof D.koppenGroup === "string") ? D.koppenGroup : "?";
  const isCoastal = !!D.isCoastal;

  // Base: latitude does most of the work.
  // 0.15 keeps equator land from being 0.0; 0.7 gives poles ~0.85 baseline.
  let s = 0.15 + 0.70 * latFromEquator;

  // Elevation: ~ +0.15 at 1000m, +0.30 at 2000m, capped.
  s += Math.min(0.35, elevM * 0.00015);

  // Terrain nudges (mountains/hills amplify winter logistics)
  if (terr === "mountains" || terr === "desert_mountains") s += 0.14;
  else if (terr === "hills") s += 0.06;
  else if (terr === "taiga") s += 0.10;
  else if (terr === "forest") s += 0.03;
  else if (terr === "wetlands" || terr === "floodplains") s += 0.02;

  // Köppen group nudges (big levers)
  // A = tropical down, B = arid slightly down (cold deserts handled by latitude),
  // C = mild slightly down, D/E = up, H = up (highland).
  if (kg === "A") s -= 0.35;
  else if (kg === "B") s -= 0.10;
  else if (kg === "C") s -= 0.08;
  else if (kg === "D") s += 0.14;
  else if (kg === "E") s += 0.22;
  else if (kg === "H") s += 0.18;

  // Coastal moderation: oceans soften winter extremes
  if (isCoastal) s -= 0.06;

  // Extra dampening for very low latitudes (keeps tropics properly low)
  if (latFromEquator < 0.25) s -= (0.25 - latFromEquator) * 0.20;

  return clamp01(s);
}

// --- exporter ---------------------------------------------------------------

function exportWinterSeverityBias(opts = {}) {
  const {
    filename = "gen_winter_severity_bias.txt",
    idBase = 1,                    // use 1 if your CK3 province IDs are 1..N
    storeUnderDerivedObject = false,
    overwriteDerived = false,
    includeComments = true
  } = opts;

  if (!Array.isArray(seeds) || !seeds.length) {
    alert("No seeds/provinces found.");
    return;
  }

  const lines = [];
  lines.push("##################");
  lines.push("# gen_winter_severity_bias.txt");
  lines.push("# Auto-generated by map generator");
  lines.push("# sea provinces are forced to 0.0");
  lines.push("##################");
  lines.push("");

  for (let p = 0; p < seeds.length; p++) {
    const seed = seeds[p];
    if (!seed) continue;

    // Make sure we have the per-province data to base the bias on
    ensureProvinceDerived(p, {
      overwrite: overwriteDerived,
      storeUnderDerivedObject,
      storeExtras: true
    });

    const bias = computeWinterSeverityForProvince(seed, { storeUnderDerivedObject });
    const provId = p + idBase;

    // Optional: show a short comment so you can sanity-check
    if (includeComments) {
      const D = storeUnderDerivedObject ? (seed.derived || {}) : seed;
      const terr = (D.terrainResolved || "unknown");
      const kg   = (D.koppenGroup || "?");
      const elev = (typeof D.elevM === "number") ? Math.round(D.elevM) : "n/a";
      const lat  = (typeof D.latNorm === "number") ? D.latNorm.toFixed(3) : "n/a";
      const land = (D.effIsLand != null) ? (D.effIsLand ? "land" : "sea") : (seed.isLand ? "land" : "sea");
      lines.push(`# ${provId} ${seed.placeName || seed.displayName || ""} | ${land} | ${terr} | koppen ${kg} | elev ${elev}m | latN ${lat}`);
    }

    lines.push(`${provId} = {`);
    lines.push(`\twinter_severity_bias = ${clamp01(bias).toFixed(2)}`);
    lines.push(`}`);
    lines.push("");
  }

  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2500);

  console.log(`exportWinterSeverityBias: wrote ${seeds.length} provinces to ${filename}`);
}

// === Province Winter Severity Export Button (IIFE) ===
(function addExportWinterSeverityBtn(){
  // --- pick a reasonable host (your header card row, else body) ---
  const host =
    document.querySelector('header .row.card') ||
    document.querySelector('header') ||
    document.body;

  // Prevent duplicate injection
  const BTN_ID = 'btn-export-winter-severity';
  if (document.getElementById(BTN_ID)) return;

  // --- create button ---
  const b = document.createElement('button');
  b.id = BTN_ID;
  b.className = 'btn';
  b.textContent = 'Export Winter Severity (01_province_properties.txt)';
  b.title = 'Generates winter_severity_bias for every province (sea = 0.0) and downloads CK3-style properties file.';
  host.appendChild(b);

  // --- click handler ---
  b.addEventListener('click', () => {
    try {
      if (typeof exportWinterSeverityBias !== 'function') {
        alert('exportWinterSeverityBias() not found. Paste/define the exporter code first.');
        return;
      }
      // Most CK3 province IDs are 1..N
      exportWinterSeverityBias({
        filename: '01_province_properties.txt',
        idBase: 1,
        includeComments: true,
        storeUnderDerivedObject: false,
        overwriteDerived: false
      });
    } catch (err) {
      console.error(err);
      alert('Export failed. See console for details.');
    }
  });

  console.log('Added button:', BTN_ID);
})();
