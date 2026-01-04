
function writeCultures() {
  if (!Array.isArray(worldCultures) || worldCultures.length === 0) {
    return '# generated_cultures.txt — no cultures generated.\n';
  }

  const lines = [];
  lines.push('');
  lines.push('');
  lines.push('');

  // If you want stable order:
  const cultures = [...worldCultures];

  for (const c of cultures) {
    if (!c) continue;

    // --- key + comment -----------------------------------------------
    const key = c.key || c.id || `culture_${c.heritageIndex ?? 0}`;
    const commentParts = [];
    if (c.group)        commentParts.push(c.group);
    if (c._name_region) commentParts.push(c._name_region);
    const comment = commentParts.length ? ` # ${commentParts.join(' / ')}` : '';

    lines.push(`${key} = {${comment}`);

    // --- color --------------------------------------------------------
    if (c.culture_color) {
      // Named color key (e.g. "hindustani")
      lines.push(`\tcolor = ${c.culture_color}`);
    } else if (c.color && typeof c.color.R === 'number') {
      // Convert 0–255 RGB to 0–1 floats
      const r = (c.color.R / 255).toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
      const g = (c.color.G / 255).toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
      const b = (c.color.B / 255).toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
      lines.push(`\tcolor = { ${r} ${g} ${b} }`);
    }

    lines.push('');

    // --- ethos / heritage / language / martial / head ----------------
    if (c.ethos) {
      // e.g. "ethos_bellicose"
      lines.push(`\tethos = ${c.ethos}`);
    }

    const heritageKey =
      c.heritageId ||
      (typeof c.heritageIndex === 'number' && c.heritageIndex >= 0
        ? `heritage_${c.heritageIndex}`
        : null);
    if (heritageKey) {
      lines.push(`\theritage = ${heritageKey}`);
    }

    if (c.language) {
      // already like "language_culture_..."
      lines.push(`\tlanguage = ${c.language}`);
    }

    if (c.martialCustom) {
      // e.g. "martial_custom_male_only"
      lines.push(`\tmartial_custom = ${c.martialCustom}`);
    }

    if (c.head) {
      // store just "domain" etc, map to "head_determination_domain"
      const headKey = c.head.startsWith('head_determination_')
        ? c.head
        : `head_determination_${c.head}`;
      lines.push(`\thead_determination = ${headKey}`);
    }

    // --- traditions block --------------------------------------------
    if (Array.isArray(c.topTraditions) && c.topTraditions.length > 0) {
      lines.push('\ttraditions = {');
      for (const t of c.topTraditions) {
        if (!t) continue;
        lines.push(`\t\t${t}`);
      }
      lines.push('\t}');
    }

    lines.push('');

    // --- name list ----------------------------------------------------
    if (c.name_list) {
      lines.push(`\tname_list = ${c.name_list}`);
      lines.push('');
    }

    // --- GFX blocks ---------------------------------------------------
    if (c.coa_gfx) {
      lines.push(`\tcoa_gfx = { ${c.coa_gfx} }`);
    }
    if (c.building_gfx) {
      lines.push(`\tbuilding_gfx = { ${c.building_gfx} }`);
    }
    if (c.clothing_gfx) {
      lines.push(`\tclothing_gfx = { ${c.clothing_gfx} }`);
    }
    if (c.unit_gfx) {
      lines.push(`\tunit_gfx = { ${c.unit_gfx} }`);
    }

    if (c.house_frame && c.house_frame.frame) {
      // e.g. { frame: 'house_frame_30', offset:[...], scale:[...] }
      lines.push(`\thouse_coa_frame = ${c.house_frame.frame}`);
    }

    lines.push('');

    // --- ethnicities block -------------------------------------------
    if (Array.isArray(c.ethnicities) && c.ethnicities.length > 0) {
      lines.push('\tethnicities = {');
      // Simple equal weighting (10, 10, 10, ...) like your example
      for (const e of c.ethnicities) {
        if (!e) continue;
        lines.push(`\t\t10 = ${e}`);
      }
      lines.push('\t}');
    }

    lines.push('}');
    lines.push(''); // blank line between cultures
  }

  return lines.join('\n');
}


/* ================= Cultures (selectable constraint + mode + recolor) =================== */
(function addCulturesAllInOne(){
  // Prevent duplicate install
  if (window.__culturesAllInOneInstalled) return;
  window.__culturesAllInOneInstalled = true;

  // --- state ---
  let provToCulture   = null;        // Int32Array per-province culture id (land only; -1 for sea)
  let cultureCount    = 0;
  let culturePalette  = [];

  // these are assumed to exist globally elsewhere already, but we assign them here:
  //   let cultureToHeritage, heritageCount, heritagePalette, worldCultures;

  // --- UI: header card ---
  const header = document.querySelector('header');
  if(!header) return;

  // only add once
  if(!document.getElementById('cult-roll')){
    const card = document.createElement('div');
    card.className = 'row card';
    card.innerHTML = `
      <strong style="margin-right:8px">Culture Controls</strong>
      <label class="small mono">counties / culture</label>
      <input id="cult-min" type="number" min="1" value="10" style="width:64px">
      <span class="small">to</span>
      <input id="cult-max" type="number" min="1" value="20" style="width:64px">
      <span style="width:12px"></span>
      <label class="small mono">constraint</label>
      <select id="cult-constraint" style="min-width:180px">
        <option value="global">Global (no constraint)</option>
        <option value="county">Within Counties</option>
        <option value="duchy">Within Duchies</option>
        <option value="kingdom">Within Kingdoms</option>
        <option value="empire" selected>Within Empires</option>
      </select>
      <button class="btn primary" id="cult-roll" style="margin-left:10px">Roll Cultures</button>
    `;
    header.appendChild(card);
  }

// --- add "Cultures" and "Heritages" to map-mode list (once) ---
const levelSeg = document.getElementById('levelSeg');
if (levelSeg) {
  if (!levelSeg.querySelector('button[data-level="culture"]')) {
    const btnC = document.createElement('button');
    btnC.className = 'btn';
    btnC.dataset.level = 'culture';
    btnC.textContent = 'Cultures';
    levelSeg.appendChild(btnC);
  }
  if (!levelSeg.querySelector('button[data-level="heritage"]')) {
    const btnH = document.createElement('button');
    btnH.className = 'btn';
    btnH.dataset.level = 'heritage';
    btnH.textContent = 'Heritages';
    levelSeg.appendChild(btnH);
  }
}

  // --- guards/helpers ---
  function needHierarchyForCultures(){
    if(!seeds || !seeds.length){ alert('Seed and run Barrier-Voronoi first.'); return true; }
    if(!provIsLand){ alert('Run "Barrier-Voronoi" first to build hierarchy.'); return true; }
    return false;
  }
  
  // resolve constraint selection -> { parentMap, parentCount, name }
  // NOTE: this now conceptually constrains HERITAGES; cultures live inside heritages.
  function getConstraint(){
    const mode = (document.getElementById('cult-constraint')?.value || 'global');
    switch(mode){
      case 'county':
        if(!provToCounty){ alert('Counties not built yet. Run Voronoi.'); return null; }
        return { parentMap: provToCounty, parentCount: countyCount|0, name:'county' };
      case 'duchy':
        if(!provToDuchy){ alert('Duchies not built yet. Run Voronoi.'); return null; }
        return { parentMap: provToDuchy, parentCount: duchyCount|0, name:'duchy' };
      case 'kingdom':
        if(!provToKingdom){ alert('Kingdoms not built yet. Run Voronoi.'); return null; }
        return { parentMap: provToKingdom, parentCount: kingdomCount|0, name:'kingdom' };
      case 'empire':
        if(!provToEmpire){ alert('Empires not built yet. Run Voronoi.'); return null; }
        return { parentMap: provToEmpire, parentCount: empireCount|0, name:'empire' };
      case 'global':
      default:
        return { parentMap: null, parentCount: 1, name:'global' };
    }
  }



const traditions = [
  "tradition_adaptive_skirmishing",
  "tradition_african_tolerance",
  "tradition_agrarian",
  "tradition_amharic_highlanders",
  "tradition_ancient_miners",
  "tradition_artisans",
  "tradition_astute_diplomats",
  "tradition_battlefield_looters",
  "tradition_burman_royal_army",
  "tradition_bush_hunting",
  "tradition_by_the_sword",
  "tradition_caravaneers",
  "tradition_castle_keepers",
  "tradition_caucasian_wolves",
  "tradition_ce1_ritual_washing",
  "tradition_chanson_de_geste",
  "tradition_charitable",
  "tradition_chivalry",
  "tradition_city_keepers",
  "tradition_collective_lands",
  "tradition_concubines",
  "tradition_court_eunuchs",
  "tradition_culinary_art",
  "tradition_cultural_primacy",
  "tradition_culture_blending",
  "tradition_desert_nomads",
  "tradition_desert_ribat",
  "tradition_diasporic",
  "tradition_druzhina",
  "tradition_dryland_dwellers",
  "tradition_ep2_avid_falconers",
  "tradition_equal_inheritance",
  "tradition_equitable",
  "tradition_esteemed_hospitality",
  "tradition_eye_for_an_eye",
  "tradition_faith_bound",
  "tradition_family_entrepreneurship",
  "tradition_female_only_inheritance",
  "tradition_fervent_temple_builders",
  "tradition_festivities",
  "tradition_fishermen",
  "tradition_forbearing",
  "tradition_forest_fighters",
  "tradition_forest_folk",
  "tradition_forest_wardens",
  "tradition_formation_fighting",
  "tradition_frugal_armorsmiths",
  "tradition_futuwaa",
  "tradition_gardening",
  "tradition_garuda_warriors",
  "tradition_hard_working",
  "tradition_hereditary_hierarchy",
  "tradition_hidden_cities",
  "tradition_highland_warriors",
  "tradition_hill_dwellers",
  "tradition_himalayan_settlers",
  "tradition_hird",
  "tradition_hit_and_run",
  "tradition_horn_mountain_skirmishing",
  "tradition_horse_breeder",
  "tradition_hunters",
  "tradition_hussar",
  "tradition_isolationist",
  "tradition_jungle_dwellers",
  "tradition_jungle_warriors",
  "tradition_khadga_puja",
  "tradition_land_of_the_bow",
  "tradition_language_scholars",
  "tradition_legalistic",
  "tradition_life_is_just_a_joke",
  "tradition_longbow_competitions",
  "tradition_lords_of_the_elephant",
  "tradition_loyal_soldiers",
  "tradition_maritime_mercantilism",
  "tradition_martial_admiration",
  "tradition_medicinal_plants",
  "tradition_mendicant_mystics",
  "tradition_merciful_blindings",
  "tradition_metal_craftsmanship",
  "tradition_mobile_guards",
  "tradition_modest",
  "tradition_monastic_communities",
  "tradition_monogamous",
  "tradition_mountain_herding",
  "tradition_mountain_homes",
  "tradition_mountaineer_ruralism",
  "tradition_mountaineers",
  "tradition_mubarizuns",
  "tradition_music_theory",
  "tradition_mystical_ancestors",
  "tradition_noble_adoption",
  "tradition_nubian_warrior_queens",
  "tradition_nudists",
  "tradition_only_the_strong",
  "tradition_pacifism",
  "tradition_parochialism",
  "tradition_pastoralists",
  "tradition_philosopher_culture",
  "tradition_poetry",
  "tradition_polders",
  "tradition_polygamous",
  "tradition_practiced_pirates",
  "tradition_quarrelsome",
  "tradition_religion_blending",
  "tradition_religious_patronage",
  "tradition_republican_legacy",
  "tradition_roman_legacy",
  "tradition_ruling_caste",
  "tradition_runestones",
  "tradition_sacred_groves",
  "tradition_sacred_hunts",
  "tradition_sacred_mountains",
  "tradition_saharan_nomads",
  "tradition_seafaring",
  "tradition_sorcerous_metallurgy",
  "tradition_stalwart_defenders",
  "tradition_stand_and_fight",
  "tradition_storytellers",
  "tradition_strong_kinship",
  "tradition_swords_for_hire",
  "tradition_talent_acquisition",
  "tradition_the_witenagemot",
  "tradition_things",
  "tradition_tribe_unity",
  "tradition_upland_skirmishing",
  "tradition_vegetarianism",
  "tradition_visigothic_codes",
  "tradition_warrior_culture",
  "tradition_warrior_monks",
  "tradition_warriors_by_merit",
  "tradition_warriors_of_the_dry",
  "tradition_wedding_ceremonies",
  "tradition_welcoming",
  "tradition_wetlanders",
  "tradition_winter_warriors",
  "tradition_xenophilic",
  "tradition_zealous_people",
];

// =======================
// Culture → Traditions (3)
// =======================

function pickTraditionsForCulture(culture) {
  if (!culture || !Array.isArray(culture.provinces) || !culture.provinces.length) {
    return [];
  }
  if (typeof W !== "number" || typeof H !== "number" || !Array.isArray(seeds)) {
    console.warn("pickTraditionsForCulture: world not initialized yet.");
    return [];
  }
  if (!Array.isArray(traditions) || !traditions.length) {
    console.warn("pickTraditionsForCulture: traditions[] not defined.");
    return [];
  }

  const feats = analyzeCultureTerrain(culture);
  const scored = traditions.map(id => ({
    id,
    score: scoreTraditionForFeatures(id, feats)
  }));

  scored.sort((a, b) => b.score - a.score);

  const picked = [];
  for (let i = 0; i < scored.length && picked.length < 3; i++) {
    picked.push(scored[i].id);
  }

  while (picked.length < 3 && traditions.length > 0) {
    const r = traditions[(Math.random() * traditions.length) | 0];
    if (!picked.includes(r)) picked.push(r);
  }

  return picked;
}

// -------------------------------
// Feature extraction from culture
// -------------------------------
function analyzeCultureTerrain(culture) {
  const provIds = culture.provinces || [];
  const total = provIds.length || 1;

  const terrainCounts = Object.create(null);
  let sumY = 0;
  let sumX = 0;
  let coastalCount = 0;

  for (const p of provIds) {
    const seed = seeds[p];
    if (!seed) continue;

    sumX += seed.x;
    sumY += seed.y;

    let t = seed.terrain;
    if (!t && typeof getTerrainAt === "function") {
      t = getTerrainAt(seed.x, seed.y);
    }
    if (!t) t = "default";
    terrainCounts[t] = (terrainCounts[t] || 0) + 1;

    if (isCoastalSeed(seed.x, seed.y)) coastalCount++;
  }

  const avgX = sumX / total;
  const avgY = sumY / total;

  const latNorm = H > 1 ? 1 - (avgY / (H - 1)) : 0.5;
  const latFromEquator = Math.min(1, Math.max(0, Math.abs(latNorm - 0.5) * 2));
  const coastShare = coastalCount / total;

  const share = (k) => (terrainCounts[k] || 0) / total;

  const plains    = share("plains");
  const farmlands = share("farmlands");
  const hills     = share("hills");
  const mountains = share("mountains");
  const desert    = share("desert");
  const desertMt  = share("desert_mountains");
  const oasis     = share("oasis");
  const jungle    = share("jungle");
  const forest    = share("forest");
  const taiga     = share("taiga");
  const wetlands  = share("wetlands");
  const floodpl   = share("floodplains");
  const steppe    = share("steppe");
  const drylands  = share("drylands");

  const arid      = desert + desertMt + drylands + steppe;
  const wet       = wetlands + floodpl + oasis;
  const wooded    = forest + taiga + jungle;
  const rugged    = mountains + hills + desertMt;
  const fertile   = farmlands + floodpl + plains + oasis;
  const tropicish = 1 - latFromEquator;
  const coldish   = latFromEquator;

  return {
    total,
    avgX,
    avgY,
    latNorm,
    latFromEquator,
    coastShare,
    plains,
    farmlands,
    hills,
    mountains,
    desert,
    desertMt,
    oasis,
    jungle,
    forest,
    taiga,
    wetlands,
    floodpl,
    steppe,
    drylands,
    arid,
    wet,
    wooded,
    rugged,
    fertile,
    tropicish,
    coldish
  };
}

// Quick coastal check around the seed
function isCoastalSeed(x, y) {
  if (!effMask || !W || !H) return false;
  const r = 3;
  for (let dy = -r; dy <= r; dy++) {
    const yy = y + dy;
    if (yy < 0 || yy >= H) continue;
    for (let dx = -r; dx <= r; dx++) {
      const xx = x + dx;
      if (xx < 0 || xx >= W) continue;
      const k = yy * W + xx;
      if (effMask[k] === 0) return true;
    }
  }
  return false;
}

// -------------------------------------------
// Heuristic scorer: id × features → score
// -------------------------------------------
function scoreTraditionForFeatures(id, f) {
  let s = 0.05;

  const {
    coastShare,
    arid,
    wet,
    wooded,
    rugged,
    fertile,
    tropicish,
    coldish,
    plains,
    farmlands,
    hills,
    mountains,
    desert,
    desertMt,
    jungle,
    forest,
    taiga,
    steppe,
    drylands,
    wetlands,
    floodpl
  } = f;

  const coastal = coastShare;
  const highMtn = mountains + desertMt;
  const jungleHeavy = jungle;
  const forestHeavy = forest + taiga;
  const steppeLike = steppe + drylands + plains;

  switch (id) {
    // ... (unchanged scoring switch as in your original)
    // I’m omitting for brevity – keep your existing cases here verbatim
    default:
      s += f.total * 0.0002;
      break;
  }

  return s;
}

// ------------------------------------------------------
// Build worldHeritages[]: heritage → cultures + provinces
// ------------------------------------------------------
function buildWorldHeritages(worldCultures, heritageCount, heritagePalette, cultureToHeritage) {
  if (!heritageCount || heritageCount <= 0 || !cultureToHeritage) {
    console.warn("buildWorldHeritages: no heritages/cultureToHeritage yet.");
    return [];
  }

  const rgbFromInt = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];

  // --- 1) Create empty heritage shells ---
  const heritages = new Array(heritageCount);
  for (let hid = 0; hid < heritageCount; hid++) {
    const rgb = heritagePalette && heritagePalette[hid] != null
      ? rgbFromInt(heritagePalette[hid])
      : [128, 128, 128];

    heritages[hid] = {
      id: `heritage_${hid}`,
      index: hid,
      color: { R: rgb[0], G: rgb[1], B: rgb[2] },
      provinces: [],     // filled from cultures
      cultures: [],      // list of culture objects
      cultureIds: [],    // list of culture.id strings
    };
  }

  // --- 2) Wire cultures into their heritages, and aggregate provinces ---
  if (Array.isArray(worldCultures)) {
    worldCultures.forEach((c, cid) => {
      const hid = (cultureToHeritage && cultureToHeritage[cid] != null)
        ? cultureToHeritage[cid]
        : -1;
      if (hid < 0 || !heritages[hid]) return;

      const h = heritages[hid];
      h.cultures.push(c);
      h.cultureIds.push(c.id);

      const provs = c.provinces || [];
      for (let i = 0; i < provs.length; i++) {
        h.provinces.push(provs[i]);
      }
    });
  }

  return heritages;
}


// --------------------------------------------------
// Build culture objects from provToCulture + palette
// --------------------------------------------------
function buildCultureArray() {
  if (!provToCulture || !culturePalette || cultureCount <= 0) {
    console.warn("No cultures rolled yet.");
    return [];
  }

  const rgbFromInt = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  const nameFromRGB = ([R, G, B]) => `R${R}G${G}B${B}`;

  const arr = new Array(cultureCount);
  for (let cid = 0; cid < cultureCount; cid++) {
    const rgb = rgbFromInt(culturePalette[cid]);
    arr[cid] = {
      id: `culture_${nameFromRGB(rgb)}`,
      color: { R: rgb[0], G: rgb[1], B: rgb[2] },
      provinces: [],
      group: `culture_group_${cid}`,
    };
  }

  for (let prov = 0; prov < provToCulture.length; prov++) {
    const cid = provToCulture[prov];
    if (cid != null && cid >= 0 && arr[cid]) {
      arr[cid].provinces.push(prov);
    }
  }

  return arr;
}

// =====================================================
// NEW PIPELINE: HERITAGES FIRST, THEN CULTURES INSIDE
// =====================================================
function rollCultures(){
  if (needHierarchyForCultures()) return;

  /*
  const [cMinProvs, cMaxProvs] = normalizeRange(
    document.getElementById('cult-min').value,
    document.getElementById('cult-max').value,
    [12, 28]
  );
  const constraint = getConstraint();
  if (!constraint) return;

  const t0  = performance.now();
  const numProv = seeds.length;
  const pAdj = provAdj();

  // We now require counties, because heritages + cultures are county-based
  if (!provToCounty || !countyCount) {
    alert('Counties not built yet. Run "Barrier-Voronoi" first.');
    return;
  }

  const numCounties = countyCount | 0;

  // --- 1) Provinces ➜ Counties stats (sizes, membership) ---
  const countySizes     = new Int32Array(numCounties);
  const countyIsLand    = new Uint8Array(numCounties);
  const countyProvLists = Array.from({ length: numCounties }, () => []);

  for (let p = 0; p < numProv; p++) {
    const s = seeds[p];
    if (!s || !s.isLand) continue;

    const c = provToCounty[p];
    if (c < 0 || c >= numCounties) continue;

    countySizes[c]++;
    countyIsLand[c] = 1;
    countyProvLists[c].push(p);
  }

  let landCountyCount = 0;
  let sumProvs        = 0;
  for (let c = 0; c < numCounties; c++) {
    if (!countyIsLand[c]) continue;
    landCountyCount++;
    sumProvs += countySizes[c];
  }
  if (landCountyCount === 0) {
    alert('No land counties found for cultures.');
    return;
  }

  let avgProvsPerCounty = sumProvs / landCountyCount;
  if (!Number.isFinite(avgProvsPerCounty) || avgProvsPerCounty <= 0) {
    avgProvsPerCounty = 1;
  }

  // Interpret sliders as *provinces per culture*, then convert to counties
  const minCountiesPerCulture = Math.max(1, Math.round(cMinProvs / avgProvsPerCounty));
  const maxCountiesPerCulture = Math.max(
    minCountiesPerCulture,
    Math.round(cMaxProvs / avgProvsPerCounty)
  );
  */
 // 1) Read sliders as *counties per culture* directly

 const constraint = getConstraint();
if (!constraint) return;

const t0  = performance.now();
const numProv = seeds.length;
const pAdj = provAdj();

// We now require counties, because heritages + cultures are county-based
if (!provToCounty || !countyCount) {
  alert('Counties not built yet. Run "Barrier-Voronoi" first.');
  return;
}

const numCounties = countyCount | 0;
const [rawMinCounties, rawMaxCounties] = normalizeRange(
  document.getElementById('cult-min').value,
  document.getElementById('cult-max').value,
  [3, 20]   // sensible default range in counties
);

// Clamp & integer-ize
const minCountiesPerCulture = Math.max(1, Math.floor(rawMinCounties));
const maxCountiesPerCulture = Math.max(
  minCountiesPerCulture,
  Math.floor(rawMaxCounties)
);

// 2) Provinces ➜ Counties stats (sizes, membership)
const countySizes     = new Int32Array(numCounties);
const countyIsLand    = new Uint8Array(numCounties);
const countyProvLists = Array.from({ length: numCounties }, () => []);

for (let p = 0; p < numProv; p++) {
  const s = seeds[p];
  if (!s || !s.isLand) continue;

  const c = provToCounty[p];
  if (c < 0 || c >= numCounties) continue;

  countySizes[c]++;
  countyIsLand[c] = 1;
  countyProvLists[c].push(p);
}

// make sure we actually have land counties
let landCountyCount = 0;
for (let c = 0; c < numCounties; c++) {
  if (countyIsLand[c]) landCountyCount++;
}
if (landCountyCount === 0) {
  alert('No land counties found for cultures.');
  return;
}

  // For heritages we want coarser groupings.
  // You can tune these multipliers if you want larger/smaller heritages.
  const HERITAGE_FACTOR_MIN = 3;
  const HERITAGE_FACTOR_MAX = 6;
  const minCountiesPerHeritage = Math.max(1, minCountiesPerCulture * HERITAGE_FACTOR_MIN);
  const maxCountiesPerHeritage = Math.max(
    minCountiesPerHeritage,
    maxCountiesPerCulture * HERITAGE_FACTOR_MAX
  );

  // County adjacency
  const countyLift = liftAdjacency(pAdj, provToCounty, numCounties);
  const cAdj = countyLift.adj;

  // --- 2) Counties ➜ Heritages (big regions, constrained by titles) ---
  const countyToHeritage = new Int32Array(numCounties).fill(-1);
  let heritageCountTmp   = 0;

  {
    const { parentMap, parentCount } = constraint;
    if (constraint.name === 'global') {
      const eligFn = (c) => countyIsLand[c] === 1;
      const { map: hMap, count: hCount } =
        groupGraph(numCounties, cAdj, eligFn, [minCountiesPerHeritage, maxCountiesPerHeritage]);

      for (let c = 0; c < numCounties; c++) {
        if (!countyIsLand[c]) continue;
        const h = hMap[c];
        if (h >= 0) countyToHeritage[c] = h;
      }
      heritageCountTmp = hCount;
    } else {
      const bins = Array.from({ length: parentCount }, () => []);

      for (let c = 0; c < numCounties; c++) {
        if (!countyIsLand[c]) continue;
        const provList = countyProvLists[c];
        if (!provList || provList.length === 0) continue;

        const p0 = provList[0];
        const parentId = parentMap ? parentMap[p0] : 0;
        if (parentId >= 0) bins[parentId].push(c);
      }

      for (const countyList of bins) {
        if (!countyList || countyList.length === 0) continue;

        const eligible = new Uint8Array(numCounties);
        for (const c of countyList) eligible[c] = 1;
        const eligFn = (c) => eligible[c] === 1;

        const { map: hMap } =
          groupGraph(numCounties, cAdj, eligFn, [minCountiesPerHeritage, maxCountiesPerHeritage]);

        const localToGlobal = new Map();
        for (const c of countyList) {
          const lh = hMap[c];
          if (lh < 0) continue;
          if (!localToGlobal.has(lh)) localToGlobal.set(lh, heritageCountTmp++);
          countyToHeritage[c] = localToGlobal.get(lh);
        }
      }
    }
  }

  // If something went wrong, bail
  if (heritageCountTmp <= 0) {
    alert('No heritages could be formed from counties.');
    return;
  }

  // --- 3) Heritages ➜ Cultures (finer splits inside each heritage) ---
  const countyToCulture = new Int32Array(numCounties).fill(-1);
  let nextCulture = 0;

  for (let h = 0; h < heritageCountTmp; h++) {
    // collect counties belonging to heritage h
    const countyList = [];
    for (let c = 0; c < numCounties; c++) {
      if (countyToHeritage[c] === h && countyIsLand[c]) {
        countyList.push(c);
      }
    }
    if (!countyList.length) continue;

    const eligible = new Uint8Array(numCounties);
    for (const c of countyList) eligible[c] = 1;
    const eligFn = (c) => eligible[c] === 1;

    const { map: cMap } =
      groupGraph(numCounties, cAdj, eligFn, [minCountiesPerCulture, maxCountiesPerCulture]);

    const localToGlobal = new Map();
    for (const c of countyList) {
      const lc = cMap[c];
      if (lc < 0) continue;
      if (!localToGlobal.has(lc)) localToGlobal.set(lc, nextCulture++);
      const gid = localToGlobal.get(lc);
      countyToCulture[c] = gid;
    }
  }

  const cultureCountTmp = nextCulture;
  if (cultureCountTmp <= 0) {
    alert('No cultures could be formed inside heritages.');
    return;
  }

  // --- 4) Push county cultures down to provinces ---
  const newProvToCulture = new Int32Array(numProv).fill(-1);
  for (let p = 0; p < numProv; p++) {
    const s = seeds[p];
    if (!s || !s.isLand) continue;

    const c = provToCounty[p];
    if (c < 0) continue;

    const cid = countyToCulture[c];
    newProvToCulture[p] = (cid != null && cid >= 0) ? cid : -1;
  }

  provToCulture  = newProvToCulture;
  cultureCount   = cultureCountTmp;
  culturePalette = makeUniquePalette(cultureCount);

  // --- 5) Build culture -> heritage map from county assignments ---
  const cultureToHeritageMap = new Int32Array(cultureCountTmp).fill(-1);
  for (let c = 0; c < numCounties; c++) {
    const cid = countyToCulture[c];
    const hid = countyToHeritage[c];
    if (cid >= 0 && hid >= 0 && cultureToHeritageMap[cid] === -1) {
      cultureToHeritageMap[cid] = hid;
    }
  }

  // In case some cultures had no county mapped (shouldn't happen), leave them at -1
  cultureToHeritage = cultureToHeritageMap;
  heritageCount     = heritageCountTmp;
  heritagePalette   = makeUniquePalette(heritageCount);

  // --- 6) Attach culture + heritage info to each seed (province) ---
  for (let p = 0; p < seeds.length; p++) {
    const s = seeds[p];
    if (!s) continue;

    if (!s.isLand) {
      s.cultureIndex   = -1;
      s.cultureId      = null;
      s.heritageIndex  = -1;
      s.heritageId     = null;
      continue;
    }

    const cid = newProvToCulture[p];
    if (cid >= 0) {
      s.cultureIndex = cid;
      s.cultureId    = `culture_${cid}`;

      const hid = (cultureToHeritageMap && cultureToHeritageMap[cid] >= 0)
        ? cultureToHeritageMap[cid]
        : -1;

      if (hid >= 0) {
        s.heritageIndex = hid;
        s.heritageId    = `heritage_${hid}`;
      } else {
        s.heritageIndex = -1;
        s.heritageId    = null;
      }
    } else {
      s.cultureIndex   = -1;
      s.cultureId      = null;
      s.heritageIndex  = -1;
      s.heritageId     = null;
    }
  }

  // --- 7) Render + status ---
  if (typeof renderLevel === 'function') {
    renderLevel(currentLevel);
  }
  if (typeof setStatus === 'function') {
    const labelStr = (constraint.name === 'global') ? 'global' : `within ${constraint.name}s`;
    setStatus(
      `Heritages → Cultures rolled (${labelStr}) in ${(performance.now() - t0 | 0)} ms • ` +
      `Heritages=${heritageCount} Cultures=${cultureCount}`
    );
  }

  // --- 8) Build culture groups + annotate them with heritage too ---
  worldCultures = buildCultureArray();
  worldCultures.forEach((c, idx) => {
    let hid = -1;
    if (cultureToHeritage && cultureToHeritage[idx] != null) {
      hid = cultureToHeritage[idx];
    }
    c.heritageIndex = (hid >= 0) ? hid : -1;
    c.heritageId    = (hid >= 0) ? `heritage_${hid}` : null;

    annotateGroupingWithGeoStats(c);
    deriveExtendedGeoInferences(c);
    setCulturalTraditions(c);
    assignVisualsFromGeo(c);
    assignEthosAndHead(c);
    //assignNameListFromGeo(c);
    c.name_list = `name_list_language_${c.id}`
    // c.traditions = pickTraditionsForCulture(c);
  });

  // --- 9) Build worldHeritages[] as explicit heritage objects ---

  worldHeritages = buildWorldHeritages(
    worldCultures,
    heritageCount,
    heritagePalette,
    cultureToHeritage
  );

  // Optionally annotate heritages with the same geo stats/inferences:
  if (Array.isArray(worldHeritages)) {
    worldHeritages.forEach(h => {
      annotateGroupingWithGeoStats(h);
      deriveExtendedGeoInferences(h);
      // you could also give heritages visuals, ethos, etc., if that makes sense:
      // assignVisualsFromGeo(h);
      // assignEthosAndHead(h);
      // assignNameListFromGeo(h);
    });
  }
}


  document.getElementById('cult-roll')?.addEventListener('click', rollCultures);

  // --- rendering hook for "culture" mode (patch once) ---

// --- rendering hook for "culture" and "heritage" modes (patch once) ---
if (!window.__culturePatchApplied) {
  window.__culturePatchApplied = true;
  const _renderLevelOrig = renderLevel;

  renderLevel = function(level) {
    // Only intercept culture / heritage; everything else goes to the original
    if (level !== 'culture' && level !== 'heritage') {
      return _renderLevelOrig(level);
    }

    // If Voronoi hasn't run yet, fall back to a sensible default
    if (typeof label === 'undefined' || !label) {
      const fallback =
        (currentLevel === 'culture' || currentLevel === 'heritage')
          ? 'landProvinces'
          : currentLevel;
      return _renderLevelOrig(fallback);
    }

    const img = vctx.createImageData(W, H);
    const d   = img.data;

    const ocean = oceanRGB();
    const oceanR = (ocean >> 16) & 255;
    const oceanG = (ocean >> 8)  & 255;
    const oceanB =  ocean        & 255;

    const isCultureMode  = (level === 'culture');
    const isHeritageMode = (level === 'heritage');

    // Helper to get group id for a province (by its province index p)
    function groupIdForProvince(p) {
      if (p < 0) return -1;

      if (isCultureMode) {
        return (provToCulture && provToCulture[p] != null)
          ? provToCulture[p]
          : -1;
      }

      // heritage mode: read from seed.heritageIndex
      if (isHeritageMode) {
        const s = seeds && seeds[p];
        if (!s || typeof s.heritageIndex !== 'number') return -1;
        return s.heritageIndex;
      }

      return -1;
    }

    // Helper to get color for a group id
    function colorForGroupId(gid) {
      if (gid < 0) {
        // fallback: seed color or grey
        return 0x666666;
      }

      if (isCultureMode) {
        return (culturePalette && culturePalette[gid] != null)
          ? culturePalette[gid]
          : (seeds[gid]?.color ?? 0x666666);
      }

      if (isHeritageMode) {
        return (heritagePalette && heritagePalette[gid] != null)
          ? heritagePalette[gid]
          : 0x666666;
      }

      return 0x666666;
    }

    // --- main raster loop ---
    for (let k = 0; k < label.length; k++) {
      const p = label[k];
      const i = k * 4;

      // background outside provinces
      if (p < 0) {
        d[i]     = 17;
        d[i + 1] = 17;
        d[i + 2] = 17;
        d[i + 3] = 255;
        continue;
      }

      // ocean
      if (effMask[k] === 0) {
        d[i]     = oceanR;
        d[i + 1] = oceanG;
        d[i + 2] = oceanB;
        d[i + 3] = 255;
        continue;
      }

      const gid = groupIdForProvince(p);
      const c   = colorForGroupId(gid);

      d[i]     = (c >> 16) & 255;
      d[i + 1] = (c >> 8)  & 255;
      d[i + 2] =  c        & 255;
      d[i + 3] = 255;
    }

    // --- edges ---
    if (showEdges.checked) {
      function gidAt(ix) {
        const p = label[ix];
        if (p < 0) return -2;          // background
        if (effMask[ix] === 0) return -3; // sea
        return groupIdForProvince(p);
      }

      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const k = y * W + x;
          const a = gidAt(k);
          const i = k * 4;

          if (a !== gidAt(k - 1) ||
              a !== gidAt(k + 1) ||
              a !== gidAt(k - W) ||
              a !== gidAt(k + W)) {
            d[i]     = 0;
            d[i + 1] = 0;
            d[i + 2] = 0;
            // alpha stays 255
          }
        }
      }
    }

    vctx.putImageData(img, 0, 0);

    // Legend text
    if (level === 'culture') {
      legend.textContent = `Cultures: ${cultureCount || 0}`;
    } else if (level === 'heritage') {
      legend.textContent = `Heritages: ${heritageCount || 0}`;
    }
  };
}




  // --- recolor hook: reuse your existing Recolor button ---
  try{
    document.getElementById('recolor')?.addEventListener('click', ()=>{
      if(cultureCount>0){
        culturePalette = makeUniquePalette(cultureCount);
        if(currentLevel === 'culture') renderLevel('culture');
      }
    });
  }catch(_){}

})();


function scoreTraditionsForCulture(culture) {
  const gs = culture.geoStats;
  const ex = gs.extended;

  const result = {};
  
  for (const trad of traditions) {
    result[trad] = scoreSingleTradition(trad, gs, ex);
  }

  // Sort by score
  return Object.entries(result)
    .sort((a, b) => b[1] - a[1])
    .map(([trad, score]) => ({ tradition: trad, score }));
}

function scoreSingleTradition(trad, gs, ex) {
  let s = 0;

  // Helper shortcuts
  const T = gs.terrainShares;
  const K = gs.koppenGroupShares || {};

  const cold = gs.flags.isCold;
  const trop = gs.flags.isTropical;
  const temper = gs.flags.isTemperate;
  const coastal = gs.flags.isCoastal;
  const islandy = gs.flags.isIslandHeavy;
  const mtn = gs.flags.isMountainous;
  const desert = gs.flags.isDesert;
  const jungle = gs.flags.isJungle;
  const forest = gs.flags.isForest;
  const wet = gs.flags.isWetland;

  const agri = ex.agriScore;
  const pastoral = ex.pastoralScore;
  const maritime = ex.maritimeScore;
  const mining = ex.miningScore;

  const rugged = ex.winterHardshipScore > 1.0 || ex.miningScore > 2.5;

  // Switch that uses tradition-specific modules
  if (trad in TRADITION_SCORES) {
    s += TRADITION_SCORES[trad](gs, ex);
  }

  // Add tiny random noise for variety
  s += (Math.random() - 0.5) * 0.05;

  return s;
}

function getTopTraditionsForCulture(culture, n = 3) {
  const gs = culture.geoStats;
  const ex = gs.extended;

  const scored = [];

  for (const trad of Object.keys(TRADITION_SCORES)) {
    const scoreFn = TRADITION_SCORES[trad];
    const score = scoreFn(gs, ex);
    scored.push({ tradition: trad, score });
  }

  // Sort highest → lowest score
  scored.sort((a, b) => b.score - a.score);

  // Build candidate pool (top 7 if possible)
  const poolSize = Math.min(7, scored.length);
  const pool = scored.slice(0, poolSize);

  // Fisher–Yates shuffle (safe, unbiased)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Return up to n traditions
  return pool.slice(0, Math.min(n, pool.length));
}


function setCulturalTraditions(c) {
    c.topTraditions = getTop3Names(c)
}

function getTop3Names(culture) {
  return getTopTraditionsForCulture(culture, 3).map(t => t.tradition);
}

const TRADITION_SCORES = {

  // 1
  tradition_adaptive_skirmishing: (gs, ex) => {
    // Good for rugged, mixed-terrain cultures
    return (
      ex.terrainDiversity * 2 +
      (gs.flags.isMountainous ? 1.5 : 0) +
      (gs.flags.isForest ? 1 : 0)
    );
  },

  // 2
  tradition_african_tolerance: (gs, ex) => {
    return (
      (gs.koppenGroupShares.B || 0) * 3 +
      ex.terrainDiversity
    );
  },

  // 3
  tradition_agrarian: (gs, ex) => {
    return (
      ex.agriScore * 2 +
      (gs.terrainShares.plains || 0) * 2 +
      (gs.terrainShares.farmlands || 0) * 3
    );
  },

  // 4
  tradition_amharic_highlanders: (gs) => {
    return (
      (gs.terrainShares.mountains || 0) * 4 +
      (gs.flags.isMountainous ? 2 : 0)
    );
  },

  // 5
  tradition_ancient_miners: (gs, ex) => {
    return (
      ex.miningScore * 2 +
      (gs.flags.isMountainous ? 1 : 0)
    );
  },

  // 6
  tradition_artisans: (gs, ex) => {
    return (
      ex.agriScore * 0.5 +
      ex.miningScore * 0.5 +
      ex.terrainDiversity
    );
  },

  // 7
  tradition_astute_diplomats: (gs, ex) => {
    return (
      ex.climateDiversity * 2 +
      ex.terrainDiversity
    );
  },

  // 8
  tradition_battlefield_looters: (gs, ex) => {
    return (
      ex.ruggedTravel ? 2 : 0 +
      ex.miningScore * 0.5
    );
  },

  // 9
  tradition_burman_royal_army: (gs, ex) => {
    return (
      (gs.flags.isTropical ? 1.5 : 0) +
      (gs.flags.isMountainous ? 1.5 : 0)
    );
  },

  // 10
  tradition_bush_hunting: (gs) => {
    return (
      (gs.flags.isForest ? 2 : 0) +
      (gs.flags.isJungle ? 2 : 0)
    );
  },

  // 11
  tradition_by_the_sword: (gs, ex) => {
    return (
      ex.ruggedTravel ? 2 : 0 +
      ex.droughtRiskScore
    );
  },

  // 12
  tradition_caravaneers: (gs, ex) => {
    return (
      (gs.flags.isDesert ? 3 : 0) +
      (gs.terrainShares.steppe || 0) * 2 +
      (ex.maritimeScore < 0.5 ? 1 : 0) // inland preferred
    );
  },

  // 13
  tradition_castle_keepers: (gs, ex) => {
    return (
      ex.agriScore * 1.5 +
      ex.miningScore +
      (gs.flags.isMountainous ? 1.5 : 0)
    );
  },

  // 14
  tradition_caucasian_wolves: (gs) => {
    return (
      (gs.flags.isMountainous ? 3 : 0) +
      (gs.terrainShares.steppe || 0)
    );
  },

  // 15
  tradition_ce1_ritual_washing: (gs) => {
    return (
      (gs.flags.isWetland ? 2 : 0) +
      (gs.flags.isCoastal ? 1 : 0)
    );
  },

  // 16
  tradition_chanson_de_geste: (gs, ex) => {
    return (
      ex.agriScore +
      (gs.flags.isTemperate ? 2 : 0)
    );
  },

  // 17
  tradition_charitable: (gs, ex) => {
    return (
      ex.cohesionTags.includes("highly-contiguous") ? 2 : 0 +
      (gs.flags.isTemperate ? 1 : 0)
    );
  },

  // 18
  tradition_chivalry: (gs, ex) => {
    return (
      ex.agriScore +
      (gs.flags.isTemperate ? 2 : 0) +
      (gs.terrainShares.plains || 0)
    );
  },

  // 19
  tradition_city_keepers: (gs, ex) => {
    return (
      ex.agriScore * 1.5 +
      ex.miningScore +
      (gs.flags.isCoastal ? 1 : 0)
    );
  },

  // 20
  tradition_collective_lands: (gs, ex) => {
    return (
      ex.cohesionTags.includes("highly-contiguous") ? 3 : 0 +
      (gs.extended.landComponentCount === 1 ? 2 : 0)
    );
  }
};

Object.assign(TRADITION_SCORES, {

  // 21
  tradition_concubines: (gs, ex) => {
    // Tends to appear in hot climates with high agri/pastoral base
    return (
      (gs.flags.isTropical ? 1.5 : 0) +
      (gs.flags.isDesert ? 1.5 : 0) +
      ex.pastoralScore * 0.5 +
      ex.agriScore * 0.5
    );
  },

  // 22
  tradition_court_eunuchs: (gs, ex) => {
    // Urban/bureaucratic → high agriculture & coastal preference
    return (
      ex.agriScore * 1.2 +
      ex.miningScore * 0.4 +
      (gs.flags.isCoastal ? 1 : 0)
    );
  },

  // 23
  tradition_culinary_art: (gs, ex) => {
    // Mixed terrain + high farming + wetlands
    return (
      ex.agriScore +
      ex.terrainDiversity +
      (gs.flags.isWetland ? 1 : 0) +
      (gs.flags.isTropical ? 1 : 0)
    );
  },

  // 24
  tradition_cultural_primacy: (gs, ex) => {
    // Large, cohesive, unified lands
    return (
      (gs.totalProvinces > 40 ? 2 : 0) +
      (ex.mainComponentShare > 0.8 ? 2 : 0)
    );
  },

  // 25
  tradition_culture_blending: (gs, ex) => {
    // High climate & terrain diversity → more syncretic culture
    return (
      ex.climateDiversity * 2 +
      ex.terrainDiversity * 2 +
      (gs.extent.widthPx > gs.extent.heightPx ? 0.5 : 0)
    );
  },

  // 26
  tradition_desert_nomads: (gs, ex) => {
    return (
      (gs.flags.isDesert ? 3 : 0) +
      (gs.terrainShares.steppe || 0) * 2 +
      ex.pastoralScore
    );
  },

  // 27
  tradition_desert_ribat: (gs, ex) => {
    return (
      (gs.flags.isDesert ? 3 : 0) +
      ex.droughtRiskScore +
      (gs.flags.isCoastal ? 1 : 0)
    );
  },

  // 28
  tradition_diasporic: (gs, ex) => {
    // Fragmented landmasses or high migrant terrain
    return (
      (ex.landComponentCount > 1 ? 3 : 0) +
      ex.climateDiversity * 1.5 +
      ex.terrainDiversity
    );
  },

  // 29
  tradition_druzhina: (gs, ex) => {
    // Russian-style → cold, forest, rugged, continental
    return (
      (gs.flags.isCold ? 2 : 0) +
      (gs.flags.isForest ? 1.5 : 0) +
      (gs.koppenGroupShares.D || 0) * 2 +
      ex.miningScore * 0.5
    );
  },

  // 30
  tradition_dryland_dwellers: (gs) => {
    return (
      (gs.flags.isDesert ? 2.5 : 0) +
      ((gs.terrainShares.drylands || 0) * 3)
    );
  },

  // 31
  tradition_ep2_avid_falconers: (gs) => {
    return (
      (gs.flags.isDesert ? 1.5 : 0) +
      (gs.flags.isSteppe ? 1.5 : 0) +
      (gs.flags.isTemperate ? 0.5 : 0)
    );
  },

  // 32
  tradition_equal_inheritance: (gs, ex) => {
    // Stable, small → more equality
    return (
      (gs.totalProvinces < 20 ? 1.5 : 0) +
      (ex.mainComponentShare > 0.9 ? 1.5 : 0)
    );
  },

  // 33
  tradition_equitable: (gs, ex) => {
    return (
      ex.cohesionTags.includes("highly-contiguous") ? 2 : 0 +
      (gs.flags.isTemperate ? 1.5 : 0)
    );
  },

  // 34
  tradition_esteemed_hospitality: (gs, ex) => {
    return (
      (gs.flags.isTemperate ? 1.5 : 0) +
      ex.agriScore +
      (gs.flags.isCoastal ? 1 : 0)
    );
  },

  // 35
  tradition_eye_for_an_eye: (gs, ex) => {
    return (
      ex.winterHardshipScore * 0.5 +
      ex.droughtRiskScore * 0.5 +
      (gs.flags.isMountainous ? 1 : 0)
    );
  },

  // 36
  tradition_faith_bound: (gs, ex) => {
    // Appears in isolated, cohesive, harsh areas
    return (
      (ex.landComponentCount === 1 && ex.mainComponentShare > 0.85 ? 2 : 0) +
      (gs.flags.isCold || gs.flags.isDesert ? 1 : 0)
    );
  },

  // 37
  tradition_family_entrepreneurship: (gs, ex) => {
    return (
      ex.agriScore +
      ex.miningScore +
      (gs.flags.isCoastal ? 0.5 : 0)
    );
  },

  // 38
  tradition_female_only_inheritance: (gs, ex) => {
    // Stable, cohesive, often wet/forest/jungle
    return (
      (ex.mainComponentShare > 0.9 ? 1.5 : 0) +
      (gs.flags.isWetland ? 1.5 : 0) +
      (gs.flags.isForest ? 1 : 0)
    );
  },

  // 39
  tradition_fervent_temple_builders: (gs, ex) => {
    // Mountains + agriculture → monumental stone religion
    return (
      (gs.flags.isMountainous ? 2 : 0) +
      ex.miningScore +
      ex.agriScore * 0.5
    );
  },

  // 40
  tradition_festivities: (gs, ex) => {
    return (
      ex.agriScore +
      (gs.flags.isTemperate ? 1.5 : 0) +
      ex.climateDiversity * 0.5 +
      ex.terrainDiversity * 0.5
    );
  }

});


Object.assign(TRADITION_SCORES, {

  // 41
  tradition_fishermen: (gs, ex) => {
    return (
      (gs.flags.isCoastal ? 2.5 : 0) +
      (gs.seaShare * 3) +
      ex.maritimeScore
    );
  },

  // 42
  tradition_forbearing: (gs, ex) => {
    // Appears in harsh climates or drought/cold heavy environments
    return (
      ex.winterHardshipScore * 0.7 +
      ex.droughtRiskScore * 0.7 +
      (gs.flags.isCold ? 1 : 0) +
      (gs.flags.isDesert ? 1 : 0)
    );
  },

  // 43
  tradition_forest_fighters: (gs, ex) => {
    return (
      (gs.flags.isForest ? 3 : 0) +
      ((gs.terrainShares.forest || 0) * 2) +
      ex.terrainDiversity * 0.5
    );
  },

  // 44
  tradition_forest_folk: (gs, ex) => {
    return (
      (gs.flags.isForest ? 3 : 0) +
      ((gs.terrainShares.forest || 0) * 3)
    );
  },

  // 45
  tradition_forest_wardens: (gs) => {
    return (
      (gs.flags.isForest ? 2.5 : 0) +
      (gs.flags.isJungle ? 1 : 0)
    );
  },

  // 46
  tradition_formation_fighting: (gs, ex) => {
    // Easier in flat or open terrains
    return (
      ((gs.terrainShares.plains || 0) * 3) +
      ((gs.terrainShares.farmlands || 0) * 2) +
      (!gs.flags.isMountainous ? 1 : 0)
    );
  },

  // 47
  tradition_frugal_armorsmiths: (gs, ex) => {
    return (
      ex.miningScore * 1.5 +
      (gs.flags.isMountainous ? 1 : 0)
    );
  },

  // 48
  tradition_futuwaa: (gs, ex) => {
    // Typically warm, urbanizing, mountainous Muslim cultures
    return (
      (gs.flags.isTemperate ? 1 : 0) +
      (gs.flags.isMountainous ? 1 : 0) +
      ex.agriScore +
      ex.miningScore * 0.5
    );
  },

  // 49
  tradition_gardening: (gs, ex) => {
    return (
      ex.agriScore * 2 +
      (gs.flags.isTemperate ? 1.5 : 0) +
      (gs.flags.isWetland ? 1.5 : 0)
    );
  },

  // 50
  tradition_garuda_warriors: (gs, ex) => {
    return (
      (gs.flags.isTropical ? 2 : 0) +
      (gs.flags.isJungle ? 2 : 0) +
      ex.terrainDiversity
    );
  },

  // 51
  tradition_hard_working: (gs, ex) => {
    return (
      ex.miningScore +
      ex.terrainDiversity +
      (gs.flags.isCold ? 1 : 0) +
      (gs.flags.isMountainous ? 0.5 : 0)
    );
  },

  // 52
  tradition_hereditary_hierarchy: (gs, ex) => {
    return (
      (ex.mainComponentShare > 0.85 ? 2 : 0) +
      (gs.totalProvinces > 20 ? 2 : 0)
    );
  },

  // 53
  tradition_hidden_cities: (gs, ex) => {
    return (
      (gs.flags.isMountainous ? 2 : 0) +
      (gs.flags.isJungle ? 2 : 0) +
      ex.climateDiversity +
      ex.terrainDiversity
    );
  },

  // 54
  tradition_highland_warriors: (gs, ex) => {
    return (
      (gs.flags.isMountainous ? 3 : 0) +
      ((gs.terrainShares.mountains || 0) * 3)
    );
  },

  // 55
  tradition_hill_dwellers: (gs, ex) => {
    return (
      ((gs.terrainShares.hills || 0) * 4) +
      (gs.flags.isMountainous ? 1 : 0)
    );
  },

  // 56
  tradition_himalayan_settlers: (gs, ex) => {
    return (
      (gs.flags.isMountainous ? 3 : 0) +
      (gs.elevation.mean > 2000 ? 3 : 0)
    );
  },

  // 57
  tradition_hird: (gs, ex) => {
    return (
      (gs.flags.isCold ? 2 : 0) +
      (gs.flags.isCoastal ? 1.5 : 0) +
      ex.maritimeScore
    );
  },

  // 58
  tradition_hit_and_run: (gs, ex) => {
    // Works in steppe, hills, mountains, jungle (skirmish terrain)
    return (
      ((gs.terrainShares.steppe || 0) * 2) +
      ((gs.terrainShares.hills || 0) * 1.5) +
      (gs.flags.isJungle ? 1.5 : 0) +
      (gs.flags.isMountainous ? 1.5 : 0)
    );
  },

  // 59
  tradition_horn_mountain_skirmishing: (gs, ex) => {
    return (
      (gs.flags.isMountainous ? 3 : 0) +
      ex.miningScore * 0.5 +
      (gs.flags.isDesert ? 1 : 0)
    );
  },

  // 60
  tradition_horse_breeder: (gs, ex) => {
    return (
      ((gs.terrainShares.steppe || 0) * 3) +
      ex.pastoralScore * 2 +
      (gs.flags.isTemperate ? 0.5 : 0)
    );
  }

});

Object.assign(TRADITION_SCORES, {

  // 61
  tradition_hunters: (gs, ex) => {
    return (
      (gs.flags.isForest ? 1.5 : 0) +
      (gs.flags.isJungle ? 1 : 0) +
      (gs.flags.isWetland ? 1 : 0) +
      ex.terrainDiversity * 0.5
    );
  },

  // 62
  tradition_hussar: (gs, ex) => {
    // Steppe or open plains warfare
    return (
      ((gs.terrainShares.steppe || 0) * 3) +
      ((gs.terrainShares.plains || 0) * 2) +
      ex.pastoralScore +
      (!gs.flags.isMountainous ? 1 : 0)
    );
  },

  // 63
  tradition_isolationist: (gs, ex) => {
    return (
      (ex.landComponentCount === 1 && ex.mainComponentShare > 0.9 ? 3 : 0) +
      (gs.flags.isLandlocked ? 2 : 0) +
      (gs.totalProvinces < 15 ? 1 : 0)
    );
  },

  // 64
  tradition_jungle_dwellers: (gs, ex) => {
    return (
      (gs.flags.isJungle ? 3 : 0) +
      ((gs.terrainShares.jungle || 0) * 4) +
      (gs.flags.isTropical ? 1 : 0)
    );
  },

  // 65
  tradition_jungle_warriors: (gs, ex) => {
    return (
      (gs.flags.isJungle ? 3 : 0) +
      ((gs.terrainShares.jungle || 0) * 3) +
      ex.terrainDiversity
    );
  },

  // 66
  tradition_khadga_puja: (gs, ex) => {
    // Himalayan + Indic warm-wet tendency
    return (
      (gs.flags.isMountainous ? 2 : 0) +
      (gs.elevation.mean > 1500 ? 1.5 : 0) +
      (gs.flags.isTropical ? 1 : 0)
    );
  },

  // 67
  tradition_land_of_the_bow: (gs, ex) => {
    // Nile-like: wetlands + agriculture + heat
    return (
      (gs.flags.isWetland ? 3 : 0) +
      ex.agriScore * 0.8 +
      (gs.flags.isTropical || gs.flags.isDesert ? 1 : 0)
    );
  },

  // 68
  tradition_language_scholars: (gs, ex) => {
    return (
      ex.climateDiversity * 2 +
      ex.terrainDiversity * 2 +
      (gs.totalProvinces > 20 ? 1 : 0)
    );
  },

  // 69
  tradition_legalistic: (gs, ex) => {
    // Stable, agricultural, cohesive regions → early bureaucracy
    return (
      ex.agriScore * 1.5 +
      (ex.mainComponentShare > 0.85 ? 2 : 0) +
      (gs.flags.isTemperate ? 1 : 0)
    );
  },

  // 70
  tradition_life_is_just_a_joke: (gs, ex) => {
    // Lighthearted, complex social webs form in fertile stable regions
    return (
      ex.agriScore +
      ex.climateDiversity +
      ex.terrainDiversity * 0.5
    );
  },

  // 71
  tradition_longbow_competitions: (gs, ex) => {
    return (
      (gs.flags.isForest ? 1.5 : 0) +
      (gs.flags.isWetland ? 1 : 0) +
      ((gs.terrainShares.hills || 0) * 2)
    );
  },

  // 72
  tradition_lords_of_the_elephant: (gs, ex) => {
    return (
      (gs.flags.isTropical ? 3 : 0) +
      (gs.flags.isJungle ? 2.5 : 0) +
      ex.agriScore * 0.5
    );
  },

  // 73
  tradition_loyal_soldiers: (gs, ex) => {
    // Cohesion & unity is key
    return (
      (ex.mainComponentShare > 0.9 ? 2.5 : 0) +
      (ex.landComponentCount === 1 ? 1.5 : 0)
    );
  },

  // 74
  tradition_maritime_mercantilism: (gs, ex) => {
    return (
      ex.maritimeScore * 2 +
      (gs.flags.isCoastal ? 2 : 0) +
      ex.miningScore * 0.3
    );
  },

  // 75
  tradition_martial_admiration: (gs, ex) => {
    // Often arises in harsh or rivalry-heavy areas
    return (
      ex.ruggedTravel ? 2 : 0 +
      ex.winterHardshipScore * 0.7 +
      ex.droughtRiskScore * 0.7
    );
  },

  // 76
  tradition_medicinal_plants: (gs, ex) => {
    // Jungle, forest, wet zones rich in flora
    return (
      (gs.flags.isJungle ? 2.5 : 0) +
      (gs.flags.isForest ? 1.5 : 0) +
      (gs.flags.isWetland ? 1.5 : 0)
    );
  },

  // 77
  tradition_mendicant_mystics: (gs, ex) => {
    return (
      (gs.flags.isMountainous ? 2 : 0) +
      (gs.flags.isForest ? 1 : 0) +
      ex.terrainDiversity +
      ex.climateDiversity
    );
  },

  // 78
  tradition_merciful_blindings: (gs, ex) => {
    // More common in hot, centralized civilizations
    return (
      (gs.flags.isDesert ? 1.5 : 0) +
      (gs.flags.isTropical ? 1.2 : 0) +
      (ex.mainComponentShare > 0.85 ? 1 : 0)
    );
  },

  // 79
  tradition_metal_craftsmanship: (gs, ex) => {
    return (
      ex.miningScore * 2 +
      (gs.flags.isMountainous ? 2 : 0)
    );
  },

  // 80
  tradition_mobile_guards: (gs, ex) => {
    return (
      ((gs.terrainShares.steppe || 0) * 3) +
      ((gs.terrainShares.plains || 0) * 2) +
      (gs.flags.isMountainous ? 1 : 0) +
      ex.pastoralScore
    );
  }

});

Object.assign(TRADITION_SCORES, {

  // 81
  tradition_modest: (gs, ex) => {
    // Modest cultures often arise in harsh or spiritually weighted terrains
    return (
      (gs.flags.isCold ? 1 : 0) +
      (gs.flags.isDesert ? 1 : 0) +
      ex.terrainDiversity * 0.3
    );
  },

  // 82
  tradition_monastic_communities: (gs, ex) => {
    return (
      (gs.flags.isMountainous ? 2.5 : 0) +
      (gs.flags.isForest ? 1 : 0) +
      ex.climateDiversity * 0.5
    );
  },

  // 83
  tradition_monogamous: (gs, ex) => {
    return (
      ex.mainComponentShare * 1.5 +
      (gs.totalProvinces < 25 ? 1 : 0)
    );
  },

  // 84
  tradition_mountain_herding: (gs, ex) => {
    return (
      (gs.flags.isMountainous ? 3 : 0) +
      ((gs.terrainShares.hills || 0) * 2) +
      (ex.pastoralScore * 1.5)
    );
  },

  // 85
  tradition_mountain_homes: (gs, ex) => {
    return (
      (gs.flags.isMountainous ? 3 : 0) +
      (gs.elevation.mean > 1500 ? 1.5 : 0)
    );
  },

  // 86
  tradition_mountaineer_ruralism: (gs, ex) => {
    return (
      (gs.flags.isMountainous ? 3 : 0) +
      ((gs.terrainShares.hills || 0) * 2) +
      (ex.agriScore * 0.5)
    );
  },

  // 87
  tradition_mountaineers: (gs, ex) => {
    return (
      (gs.flags.isMountainous ? 4 : 0) +
      ((gs.terrainShares.mountains || 0) * 3)
    );
  },

  // 88
  tradition_mubarizuns: (gs, ex) => {
    // Middle Eastern desert elite duelists
    return (
      (gs.flags.isDesert ? 3 : 0) +
      (gs.flags.isDry ? 1 : 0) +
      ex.agriScore * 0.3
    );
  },

  // 89
  tradition_music_theory: (gs, ex) => {
    return (
      ex.climateDiversity +
      ex.terrainDiversity +
      (gs.flags.isTemperate ? 1 : 0)
    );
  },

  // 90
  tradition_mystical_ancestors: (gs, ex) => {
    return (
      (gs.flags.isForest ? 1.5 : 0) +
      (gs.flags.isMountainous ? 1 : 0) +
      (gs.flags.isWetland ? 1.2 : 0)
    );
  },

  // 91
  tradition_noble_adoption: (gs, ex) => {
    return (
      (gs.flags.isTemperate ? 1 : 0) +
      (ex.mainComponentShare > 0.8 ? 1 : 0) +
      ex.climateDiversity * 0.5
    );
  },

  // 92
  tradition_nubian_warrior_queens: (gs, ex) => {
    return (
      (gs.flags.isDesert ? 1.5 : 0) +
      (gs.flags.isTropical ? 1 : 0) +
      (gs.flags.isRiverine ? 1 : 0) +
      ex.droughtRiskScore * 0.7
    );
  },

  // 93
  tradition_nudists: (gs, ex) => {
    return (
      (gs.flags.isTropical ? 3 : 0) +
      (gs.flags.isDesert ? 1 : 0) +
      (gs.flags.isTemperate ? 0.5 : 0)
    );
  },

  // 94
  tradition_only_the_strong: (gs, ex) => {
    return (
      ex.winterHardshipScore +
      ex.droughtRiskScore +
      (gs.flags.isMountainous ? 1 : 0)
    );
  },

  // 95
  tradition_pacifism: (gs, ex) => {
    return (
      (ex.mainComponentShare > 0.85 ? 2 : 0) +
      (gs.flags.isWetland ? 1 : 0) +
      (gs.flags.isTemperate ? 1 : 0)
    );
  },

  // 96
  tradition_parochialism: (gs, ex) => {
    return (
      (ex.landComponentCount === 1 ? 2 : 0) +
      (ex.mainComponentShare > 0.8 ? 1.5 : 0) +
      (gs.totalProvinces < 20 ? 1 : 0)
    );
  },

  // 97
  tradition_pastoralists: (gs, ex) => {
    return (
      (ex.pastoralScore * 2) +
      ((gs.terrainShares.steppe || 0) * 2) +
      (gs.flags.isMountainous ? 1 : 0)
    );
  },

  // 98
  tradition_philosopher_culture: (gs, ex) => {
    return (
      ex.climateDiversity * 2 +
      ex.terrainDiversity +
      (gs.flags.isTemperate ? 1 : 0)
    );
  },

  // 99
  tradition_poetry: (gs, ex) => {
    return (
      ex.terrainDiversity +
      ex.climateDiversity +
      (gs.flags.isTemperate ? 1.5 : 0)
    );
  },

  // 100
  tradition_polders: (gs, ex) => {
    return (
      (gs.flags.isCoastal ? 2 : 0) +
      (gs.flags.isWetland ? 3 : 0) +
      ((gs.terrainShares.floodplains || 0) * 2)
    );
  }

});

Object.assign(TRADITION_SCORES, {

  // 121
  tradition_visigothic_codes: (gs, ex) => {
    // Structured, mountainous, semi-isolated societies
    return (
      (gs.flags.isMountainous ? 2 : 0) +
      (ex.mainComponentShare > 0.85 ? 1.5 : 0) +
      (gs.flags.isTemperate ? 1 : 0)
    );
  },

  // 122
  tradition_warrior_culture: (gs, ex) => {
    // Harsh terrain, ruggedness, strong hardship signals
    return (
      (ex.ruggedTravel ? 2 : 0) +
      ex.winterHardshipScore +
      ex.droughtRiskScore +
      (gs.flags.isMountainous ? 1 : 0) +
      (gs.flags.isJungle ? 0.5 : 0)
    );
  },

  // 123
  tradition_warrior_monks: (gs, ex) => {
    // Mountain monasteries + harsh climates = religious warriors
    return (
      (gs.flags.isMountainous ? 2.5 : 0) +
      (gs.flags.isCold ? 1 : 0) +
      (gs.flags.isForest ? 0.5 : 0) +
      ex.miningScore * 0.3
    );
  },

  // 124
  tradition_warriors_by_merit: (gs, ex) => {
    // Meritocratic militarism thrives in mixed & challenging environments
    return (
      ex.climateDiversity * 1.5 +
      ex.terrainDiversity +
      (ex.ruggedTravel ? 1 : 0)
    );
  },

  // 125
  tradition_warriors_of_the_dry: (gs, ex) => {
    // Desert steppe + drought risk
    return (
      (gs.flags.isDesert ? 3 : 0) +
      ((gs.terrainShares.drylands || 0) * 3) +
      ex.droughtRiskScore
    );
  },

  // 126
  tradition_wedding_ceremonies: (gs, ex) => {
    // Flourishes in cohesive, agricultural, temperate regions
    return (
      ex.agriScore +
      (gs.flags.isTemperate ? 1.5 : 0) +
      (ex.mainComponentShare > 0.85 ? 1 : 0)
    );
  },

  // 127
  tradition_welcoming: (gs, ex) => {
    // Open terrain + high diversity = welcoming
    return (
      ex.climateDiversity * 1.5 +
      ex.terrainDiversity +
      (gs.flags.isCoastal ? 1 : 0) +
      (gs.flags.isTemperate ? 1 : 0)
    );
  }

});

// --- Core: infer a macro visual "family" from geoStats + extended ---
function inferVisualFamily(gs) {
  const ex = gs.extended || {};
  const flags = gs.flags || {};
  const kShares = gs.koppenGroupShares || {};
  const env  = ex.envTags || [];
  const econ = ex.economyTags || [];
  const hazards = ex.hazardTags || [];
  const primary = ex.primaryArchetype || "";

  const latFromEq = gs.extent?.latFromEquatorMean ?? 0.5;
  const coastalShare = gs.coastalShare ?? (gs.coastalProvinces || 0) / (gs.totalProvinces || 1);

  const tropical = !!flags.isTropical || (kShares.A || 0) > 0.5;
  const cold     = !!flags.isCold     || (kShares.D || 0) + (kShares.E || 0) > 0.5;
  const desert   = !!flags.isDesert   || (kShares.B || 0) > 0.5;
  const highland = (kShares.H || 0) > 0.2 || (gs.elevation?.mean || 0) > 2500;
  const maritime = coastalShare > 0.35 || econ.includes("maritime-oriented");
  const pastoral = econ.includes("pastoral-nomadic") || primary.includes("steppe");
  const droughty = hazards.includes("drought-prone");

  const veryPolar = latFromEq > 0.8;
  const polarish  = latFromEq > 0.65;

  // circumpolar / arctic-like
  if (veryPolar || (polarish && cold)) {
    return "circumpolar";
  }

  // extreme highland
  if (highland && !tropical && (gs.flags.isMountainous || (gs.elevation?.mean || 0) > 2200)) {
    return "highland_inner_asia";
  }

  // desert belts
  if (desert || droughty) {
    if (maritime) return "desert_coast_mena";
    return pastoral ? "desert_steppe" : "desert_inland";
  }

  // tropical
  if (tropical) {
    const archipelagic = env.includes("archipelagic");
    if (archipelagic || maritime) return "tropical_maritime";
    return "tropical_inland";
  }

  // classic steppe / grassland nomadic
  const steppeShare = (gs.terrainShares?.steppe || 0) +
                      (gs.terrainShares?.drylands || 0);
  if (pastoral || steppeShare > 0.25) {
    return "temperate_steppe";
  }

  // wet, warm coasts → mediterranean / monsoon coasts
  const wetShare = (gs.terrainShares?.wetlands || 0) +
                   (gs.terrainShares?.floodplains || 0) +
                   (gs.terrainShares?.jungle || 0);
  if (!cold && maritime && (wetShare > 0.2 || (kShares.C || 0) > 0.4)) {
    return "mediterranean_temperate_coast";
  }

  // cold but not fully polar
  if (cold && !veryPolar) {
    if (maritime) return "north_sea_coast";
    return "continental_inland";
  }

  // fallback temperate: coastal vs inland flavor
  if (maritime) return "temperate_oceanic_west";
  return "temperate_inland_west";
}

// --- Map a visual family to candidate gfx sets ---
function getVisualCandidatesFromFamily(family, gs) {
  const kShares = gs.koppenGroupShares || {};
  const ex = gs.extended || {};
  const latFromEq = gs.extent?.latFromEquatorMean ?? 0.5;
  const polarish  = latFromEq > 0.65;

  const candidates = {
    coa: [],
    ethnicity: [],
    building: [],
    clothing: [],
    unit: []
  };

  switch (family) {
    // High latitudes / Sami / Norse / circumpolar mix
    case "circumpolar":
      candidates.coa = [
        "sami_coa_gfx",
        "norse_coa_gfx",
        "norwegian_coa_gfx",
        "swedish_coa_gfx",
        "danish_coa_gfx",
        "scottish_coa_gfx",
        "irish_coa_gfx",
        "welsh_coa_gfx",
        "west_slavic_group_coa_gfx",
        "baltic_group_coa_gfx",
        "balto_finnic_group_coa_gfx",
        "ugro_permian_group_coa_gfx",
        "volga_finnic_group_coa_gfx",
        "east_slavic_group_coa_gfx"
      ];
      candidates.ethnicity = (
        polarish
          ? [
              "circumpolar_blonde_hair",
              "circumpolar_brown_hair",
              "circumpolar_dark_hair",
              "slavic_northern_blond",
              "slavic_northern_brown_hair",
              "slavic_northern_dark_hair",
              "slavic_northern_ginger",
              "caucasian_northern_blond",
              "caucasian_northern_brown_hair",
              "caucasian_northern_dark_hair",
              "caucasian_northern_ginger"
            ]
          : [
              "slavic_blond",
              "slavic_brown_hair",
              "slavic_dark_hair",
              "caucasian_blond",
              "caucasian_brown_hair",
              "caucasian_dark_hair"
            ]
      );
      candidates.building = [
        "norse_building_gfx",
        "western_building_gfx"
      ];
      candidates.clothing = [
        "northern_clothing_gfx",
        "fp1_norse_clothing_gfx",
        "western_clothing_gfx"
      ];
      candidates.unit = [
        "norse_unit_gfx",
        "northern_unit_gfx",
        "eastern_unit_gfx",
        "western_unit_gfx"
      ];
      break;

    // Tibetan / Inner Asian plateau-ish
    case "highland_inner_asia":
      candidates.coa = [
        "tibetan_group_coa_gfx",
        "mongol_coa_gfx",
        "turkic_group_coa_gfx",
        "oghuz_coa_gfx",
        "steppe_coa_gfx"
      ];
      candidates.ethnicity = [
        "asian_tibetan",
        "asian_mongol",
        "turkic",
        "turkic_west",
        "asian"
      ];
      candidates.building = [
        "chinese_building_gfx",
        "steppe_building_gfx",
        "indian_building_gfx"
      ];
      candidates.clothing = [
        "mongol_clothing_gfx",
        "tai_clothing_gfx",
        "southeast_asian_clothing_gfx",
        "indian_clothing_gfx"
      ];
      candidates.unit = [
        "mongol_unit_gfx",
        "eastern_unit_gfx",
        "southeast_asian_unit_gfx"
      ];
      break;

    // True desert coasts: Maghreb / Arabian littoral analogue
    case "desert_coast_mena":
      candidates.coa = [
        "arabic_group_coa_gfx",
        "berber_group_coa_gfx",
        "west_african_group_coa_gfx",
        "central_african_group_coa_gfx",
        "iranian_group_coa_gfx",
        "oghuz_coa_gfx"
      ];
      candidates.ethnicity = [
        "arab",
        "african",
        "east_african",
        "mediterranean",
        "mediterranean_byzantine",
        "turkic_west"
      ];
      candidates.building = [
        "mena_building_gfx",
        "arabic_group_building_gfx",
        "berber_group_building_gfx",
        "african_building_gfx",
        "iranian_building_gfx"
      ];
      candidates.clothing = [
        "mena_clothing_gfx",
        "afr_berber_clothing_gfx",
        "iranian_clothing_gfx",
        "iberian_muslim_clothing_gfx",
        "dde_abbasid_clothing_gfx",
        "african_clothing_gfx"
      ];
      candidates.unit = [
        "mena_unit_gfx",
        "iranian_unit_gfx",
        "iberian_muslim_unit_gfx",
        "sub_sahran_unit_gfx"
      ];
      break;

    // Inland desert, caravan routes, dry interiors
    case "desert_inland":
    case "desert_steppe":
      candidates.coa = [
        "arabic_group_coa_gfx",
        "berber_group_coa_gfx",
        "iranian_group_coa_gfx",
        "steppe_coa_gfx",
        "turkic_group_coa_gfx",
        "oghuz_coa_gfx",
        "mongol_coa_gfx"
      ];
      candidates.ethnicity = [
        "arab",
        "turkic",
        "turkic_west",
        "asian_mongol",
        "african",
        "east_african",
        "mediterranean"
      ];
      candidates.building = [
        "mena_building_gfx",
        "steppe_building_gfx",
        "iranian_building_gfx",
        "african_building_gfx"
      ];
      candidates.clothing = [
        "mena_clothing_gfx",
        "turkic_clothing_gfx",
        "mongol_clothing_gfx",
        "afr_berber_clothing_gfx"
      ];
      candidates.unit = [
        "mena_unit_gfx",
        "mongol_unit_gfx",
        "eastern_unit_gfx",
        "sub_sahran_unit_gfx"
      ];
      break;

    // Tropical, archipelagic / maritime → SE Asia / Malay / island worlds
    case "tropical_maritime":
      candidates.coa = [
        "east_african_group_coa_gfx",
        "east_african_coa_gfx",
        "central_african_group_coa_gfx",
        "west_african_group_coa_gfx",
        "chinese_group_coa_gfx",
        "japanese_coa_gfx",
        "mongol_coa_gfx",
        "indian_coa_gfx",
        "dravidian_group_coa_gfx"
      ];
      candidates.ethnicity = [
        "asian_austronesian",
        "asian_malay",
        "asian",
        "papuan",
        "african",
        "east_african",
        "indian",
        "south_indian",
        "mediterranean"
      ];
      candidates.building = [
        "southeast_asian_building_gfx",
        "chinese_building_gfx",
        "indian_building_gfx",
        "african_building_gfx"
      ];
      candidates.clothing = [
        "southeast_asian_clothing_gfx",
        "malay_clothing_gfx",
        "viet_clothing_gfx",
        "papuan_clothing_gfx",
        "indian_clothing_gfx",
      ];
      candidates.unit = [
        "southeast_asian_unit_gfx",
        "chinese_unit_gfx",
        "indian_unit_gfx",
        "sub_sahran_unit_gfx"
      ];
      break;

    // Tropical, but interior / basin / monsoon plains
    case "tropical_inland":
      candidates.coa = [
        "indian_coa_gfx",
        "indo_aryan_group_coa_gfx",
        "dravidian_group_coa_gfx",
        "east_african_group_coa_gfx",
        "central_african_group_coa_gfx",
        "west_african_group_coa_gfx",
        "berber_group_coa_gfx"
      ];
      candidates.ethnicity = [
        "indian",
        "south_indian",
        "african",
        "east_african",
        "mediterranean_byzantine",
        "asian"
      ];
      candidates.building = [
        "indian_building_gfx",
        "african_building_gfx",
        "mena_building_gfx"
      ];
      candidates.clothing = [
        "indian_clothing_gfx",
        "african_clothing_gfx",
        "afr_berber_clothing_gfx",
        "mena_clothing_gfx"
      ];
      candidates.unit = [
        "indian_unit_gfx",
        "sub_sahran_unit_gfx",
        "mena_unit_gfx"
      ];
      break;

    // Classic Eurasian temperate steppe / grassland belt
    case "temperate_steppe":
      candidates.coa = [
        "steppe_coa_gfx",
        "turkic_group_coa_gfx",
        "oghuz_coa_gfx",
        "mongol_coa_gfx",
        "magyar_group_coa_gfx",
        "volga_finnic_group_coa_gfx",
        "east_slavic_group_coa_gfx",
        "south_slavic_group_coa_gfx"
      ];
      candidates.ethnicity = [
        "asian_mongol",
        "turkic",
        "turkic_west",
        "slavic_brown_hair",
        "slavic_dark_hair",
        "caucasian_dark_hair"
      ];
      candidates.building = [
        "steppe_building_gfx",
        "byzantine_building_gfx",
        "iranian_building_gfx"
      ];
      candidates.clothing = [
        "mongol_clothing_gfx",
        "turkic_clothing_gfx",
        "ugro_permian_clothing_gfx",
        "northern_clothing_gfx"
      ];
      candidates.unit = [
        "mongol_unit_gfx",
        "eastern_unit_gfx",
        "northern_unit_gfx"
      ];
      break;

    // Warm wet coasts, mid-latitudes → sort of Mediterranean / Iberian / Byzantine
    case "mediterranean_temperate_coast":
      candidates.coa = [
        "iberian_group_coa_gfx",
        "castilian_coa_gfx",
        "leonese_coa_gfx",
        "occitan_coa_gfx",
        "latin_group_coa_gfx",
        "byzantine_group_coa_gfx",
        "frankish_group_coa_gfx",
        "french_coa_gfx",
        "english_coa_gfx"
      ];
      candidates.ethnicity = [
        "mediterranean",
        "mediterranean_byzantine",
        "caucasian_dark_hair",
        "caucasian_brown_hair"
      ];
      candidates.building = [
        "mediterranean_building_gfx",
        "iberian_building_gfx",
        "byzantine_building_gfx",
        "western_building_gfx"
      ];
      candidates.clothing = [
        "iberian_christian_clothing_gfx",
        "iberian_muslim_clothing_gfx",
        "byzantine_clothing_gfx",
        "western_clothing_gfx"
      ];
      candidates.unit = [
        "iberian_christian_unit_gfx",
        "iberian_muslim_unit_gfx",
        "western_unit_gfx"
      ];
      break;

    // Cold seas, fjord / north sea analogues
    case "north_sea_coast":
      candidates.coa = [
        "norse_coa_gfx",
        "norwegian_coa_gfx",
        "swedish_coa_gfx",
        "danish_coa_gfx",
        "anglo_saxon_coa_gfx",
        "english_coa_gfx",
        "frisian_coa_gfx",
        "german_group_coa_gfx"
      ];
      candidates.ethnicity = [
        "caucasian_northern_blond",
        "caucasian_northern_brown_hair",
        "caucasian_northern_dark_hair",
        "slavic_northern_blond",
        "slavic_northern_brown_hair"
      ];
      candidates.building = [
        "norse_building_gfx",
        "western_building_gfx",
        "mediterranean_building_gfx"
      ];
      candidates.clothing = [
        "fp1_norse_clothing_gfx",
        "northern_clothing_gfx",
        "western_clothing_gfx"
      ];
      candidates.unit = [
        "norse_unit_gfx",
        "northern_unit_gfx",
        "western_unit_gfx"
      ];
      break;

    // Cold inland, continental forests and plains
    case "continental_inland":
      candidates.coa = [
        "west_slavic_group_coa_gfx",
        "south_slavic_group_coa_gfx",
        "east_slavic_group_coa_gfx",
        "polish_coa_gfx",
        "german_group_coa_gfx",
        "baltic_group_coa_gfx",
        "volga_finnic_group_coa_gfx",
        "ugro_permian_group_coa_gfx"
      ];
      candidates.ethnicity = [
        "slavic_blond",
        "slavic_brown_hair",
        "slavic_dark_hair",
        "slavic_northern_blond",
        "slavic_northern_brown_hair",
        "caucasian_dark_hair",
        "caucasian_brown_hair"
      ];
      candidates.building = [
        "western_building_gfx",
        "norse_building_gfx"
      ];
      candidates.clothing = [
        "west_slavic_clothing_gfx",
        "northern_clothing_gfx",
        "western_clothing_gfx"
      ];
      candidates.unit = [
        "eastern_unit_gfx",
        "northern_unit_gfx",
        "western_unit_gfx"
      ];
      break;

    // Mild oceanic West, rain-soaked coasts
    case "temperate_oceanic_west":
      candidates.coa = [
        "western_coa_gfx",
        "frankish_group_coa_gfx",
        "french_coa_gfx",
        "english_coa_gfx",
        "anglo_saxon_coa_gfx",
        "norman_coa_gfx",
        "scottish_coa_gfx",
        "irish_coa_gfx",
        "welsh_coa_gfx",
        "breton_coa_gfx"
      ];
      candidates.ethnicity = [
        "caucasian_brown_hair",
        "caucasian_dark_hair",
        "caucasian_blond",
        "caucasian_ginger"
      ];
      candidates.building = [
        "western_building_gfx",
        "mediterranean_building_gfx"
      ];
      candidates.clothing = [
        "western_clothing_gfx",
        "dde_hre_clothing_gfx"
      ];
      candidates.unit = [
        "western_unit_gfx"
      ];
      break;

    // Temperate inland west – big plains / heartlands
    case "temperate_inland_west":
    default:
      candidates.coa = [
        "western_coa_gfx",
        "german_group_coa_gfx",
        "frankish_group_coa_gfx",
        "french_coa_gfx",
        "english_coa_gfx",
        "anglo_saxon_coa_gfx",
        "castilian_coa_gfx",
        "occitan_coa_gfx",
        "iberian_group_coa_gfx",
        "latin_group_coa_gfx",
        "polish_coa_gfx",
        "west_slavic_group_coa_gfx"
      ];
      candidates.ethnicity = [
        "caucasian_brown_hair",
        "caucasian_dark_hair",
        "caucasian_blond",
        "slavic_brown_hair",
        "slavic_dark_hair"
      ];
      candidates.building = [
        "western_building_gfx",
        "mediterranean_building_gfx"
      ];
      candidates.clothing = [
        "western_clothing_gfx",
        "dde_hre_clothing_gfx"
      ];
      candidates.unit = [
        "western_unit_gfx",
        "eastern_unit_gfx"
      ];
      break;
  }

  // Fallbacks: if any bucket ended up empty, fall back to GLOBAL arrays
  if (!candidates.coa.length)      candidates.coa      = coaGfx.slice();
  if (!candidates.ethnicity.length) candidates.ethnicity = ethnicities.slice();
  if (!candidates.building.length) candidates.building = buildingGfx.slice();
  if (!candidates.clothing.length) candidates.clothing = clothingGfx.slice();
  if (!candidates.unit.length)     candidates.unit     = unitGfx.slice();

  return candidates;
}

const houseCoas = [
  {
    frame: "house_frame_02",
    offset: [0.0, -0.04],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_02",
    offset: [0.0, 0.025],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_02",
    offset: [0.0, 0.0],
    scale: [0.85, 0.85]
  },
  {
    frame: "house_frame_03",
    offset: [0.0, -0.04],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_03",
    offset: [0.0, 0.03],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_04",
    offset: [0.0, -0.03],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_05",
    offset: [0.0, -0.04],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_05",
    offset: [0.0, -0.03],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_05",
    offset: [0.0, 0.0],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_05",
    offset: [0.0, 0.0],
    scale: [0.85, 0.85]
  },
  {
    frame: "house_frame_06",
    offset: [0.0, 0.055],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_07",
    offset: [0.0, 0.0],
    scale: [0.85, 0.85]
  },
  {
    frame: "house_frame_08",
    offset: [0.0, 0.055],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_08",
    offset: [0.0, 0.0],
    scale: [0.85, 0.85]
  },
  {
    frame: "house_frame_09",
    offset: [0.0, 0.025],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_10",
    offset: [0.0, -0.06],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_10",
    offset: [0.0, -0.03],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_12",
    offset: [0.0, 0.0],
    scale: [0.85, 0.85]
  },
  {
    frame: "house_frame_12",
    offset: [0.0, 0.055],
    scale: [1.0, 1.0]
  },
  {
    frame: "house_frame_12",
    offset: [0.0, 0.0],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_13",
    offset: [0.0, 0.055],
    scale: [1.0, 1.0]
  },
  {
    frame: "house_frame_13",
    offset: [0.0, -0.06],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_13",
    offset: [0.0, -0.03],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_14",
    offset: [0.0, 0.055],
    scale: [1.0, 1.0]
  },
  {
    frame: "house_frame_14",
    offset: [0.0, 0.0],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_16",
    offset: [0.0, 0.055],
    scale: [1.0, 1.0]
  },
  {
    frame: "house_frame_16",
    offset: [0.0, 0.055],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_16",
    offset: [0.0, 0.025],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_16",
    offset: [0.0, 0.0],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_17",
    offset: [0.0, 0.0],
    scale: [0.85, 0.85]
  },
  {
    frame: "house_frame_17",
    offset: [0.0, 0.055],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_17",
    offset: [0.0, 0.0],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_17",
    offset: [0.0, 0.11],
    scale: [0.85, 0.85]
  },
  {
    frame: "house_frame_18",
    offset: [0.0, 0.025],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_19",
    offset: [0.0, -0.04],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_19",
    offset: [0.0, 0.0],
    scale: [0.85, 0.85]
  },
  {
    frame: "house_frame_20",
    offset: [0.0, 0.025],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_21",
    offset: [0.0, 0.055],
    scale: [1.0, 1.0]
  },
  {
    frame: "house_frame_21",
    offset: [0.0, 0.0],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_22",
    offset: [0.0, 0.0],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_22",
    offset: [0.0, 0.055],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_23",
    offset: [0.0, 0.0],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_23",
    offset: [0.0, 0.025],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_23",
    offset: [0.0, 0.055],
    scale: [1.0, 1.0]
  },
  {
    frame: "house_frame_24",
    offset: [0.0, 0.055],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_24",
    offset: [0.0, 0.025],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_24",
    offset: [0.0, 0.03],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_25",
    offset: [0.0, 0.0],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_25",
    offset: [0.0, 0.025],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_25",
    offset: [0.0, 0.0],
    scale: [0.85, 0.85]
  },
  {
    frame: "house_frame_26",
    offset: [0.0, 0.055],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_26",
    offset: [0.0, 0.025],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_26",
    offset: [0.0, 0.03],
    scale: [0.9, 0.9]
  },
  {
    frame: "house_frame_26",
    offset: [0.0, 0.055],
    scale: [1.0, 1.0]
  },
  {
    frame: "house_frame_29",
    offset: [0.0, 0.0],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_30",
    offset: [0.0, 0.025],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_30",
    offset: [0.0, 0.0],
    scale: [0.95, 0.95]
  },
  {
    frame: "house_frame_30",
    offset: [0.0, 0.0],
    scale: [0.85, 0.85]
  },
  {
    frame: "house_frame_30",
    offset: [0.0, 0.055],
    scale: [0.9, 0.9]
  },
];

const cultureColors = [
  "ainu",
  "akan",
  "ancient_egyptian",
  "armenian",
  "ashkenazi",
  "assyrian",
  "baekje",
  "baranis",
  "basque",
  "bedouin",
  "bosnian",
  "burmese",
  "castilian",
  "czech",
  "dutch",
  "emishi",
  "english",
  "ethiopian",
  "finnish",
  "frankish",
  "french",
  "gaelic",
  "georgian",
  "goguryeo",
  "goryeo",
  "gothic",
  "greek",
  "gur",
  "hausa",
  "hebrew",
  "hindustani",
  "hsv { 0.43 0.86 0.61 }",
  "hsv { 0.58 1.00 0.72 }",
  "hsv { 0.64 0.6 0.72 }",
  "hsv { 0.72 0.6 0.72 }",
  "hsv { 0.72 0.6 0.76 }",
  "hsv{ 0.025 0.55 0.7 }",
  "hsv{ 0.035 0.8 0.8 }",
  "hsv{ 0.07 1.0 0.9 }",
  "hsv{ 0.12 1.0 0.5}",
  "hsv{ 0.14 0.4 0.7 }",
  "hsv{ 0.16 0.7 1 }",
  "hsv{ 0.17 0.8 0.7 }",
  "hsv{ 0.3 0.9 0.8 }",
  "hsv{ 0.32 0.9 0.7 }",
  "hsv{ 0.35 0.5 0.7 }",
  "hsv{ 0.37 0.8 0.7 }",
  "hsv{ 0.55 0.7 0.7 }",
  "hsv{ 0.58 0.94 0.7 }",
  "hsv{ 0.59 0.55 0.8 }",
  "hsv{ 0.6 0.5 0.7 }",
  "hsv{ 0.6 0.9 0.7 }",
  "hsv{ 0.95 0.35 0.7 }",
  "hsv{ 0.95 0.6 0.3 }",
  "hsv{ 0.95 0.8 0.7 }",
  "hungarian",
  "hunnic",
  "italian",
  "japanese",
  "javan",
  "kashmiri",
  "khazar",
  "komi",
  "kru",
  "langobard",
  "lithuanian",
  "malinke",
  "marathi",
  "mongol",
  "mordvin",
  "nakkavaram",
  "norse",
  "nubian",
  "occitan",
  "papuan",
  "polish",
  "punjabi",
  "qiang",
  "rajput",
  "russian",
  "ryukyuan",
  "sami",
  "sardinian",
  "saxon",
  "senoi",
  "silla",
  "sinhala",
  "somali",
  "songhai",
  "soninke",
  "swabian",
  "tamil",
  "telugu",
  "tocharian",
  "trojan",
  "turkish",
  "vlach",
  "welayta",
  "welsh",
  "wolof",
  "yoruba",
  "zaghawa",
  "{ 0 0.35 0.6 }",
  "{ 0 0.9 0.7 }",
  "{ 0 105 146 }",
  "{ 0 120 40 }",
  "{ 0.1 0.1 0.8 }",
  "{ 0.1 0.15 0.5 }",
  "{ 0.1 0.2 0.4 }",
  "{ 0.1 0.3 0.7 }",
  "{ 0.1 0.3 0.9 }",
  "{ 0.1 0.4 0.2 }",
  "{ 0.1 0.6 0.1 }",
  "{ 0.1 0.6 0.8 }",
  "{ 0.15 0.3 0.5 }",
  "{ 0.15 0.4 0.55 }",
  "{ 0.15 0.85 0.85 }",
  "{ 0.2 0.2 1.0 }",
  "{ 0.2 0.3 0.6 }",
  "{ 0.2 0.4 0.9 }",
  "{ 0.2 0.6 0.2 }",
  "{ 0.2 0.6 0.4 }",
  "{ 0.23 0.15 0.8 }",
  "{ 0.25 0.5 0.75 }",
  "{ 0.25 0.5 0.8 }",
  "{ 0.3 0.0 0.3 }",
  "{ 0.3 0.3 0.7 }",
  "{ 0.3 0.30 0.35 }",
  "{ 0.3 0.4 0.1 }",
  "{ 0.3 0.5 0.3 }",
  "{ 0.3 0.6 0.4 }",
  "{ 0.3 0.6 0.5 }",
  "{ 0.3 0.7 0.7 }",
  "{ 0.3 0.75 0.6 }",
  "{ 0.3 0.8 0.7 }",
  "{ 0.3 0.87 0.21 }",
  "{ 0.3 0.95 0.3 }",
  "{ 0.35 0.4 0.8 }",
  "{ 0.35 0.6 0.1 }",
  "{ 0.36 0.1 0.04 }",
  "{ 0.4 0.2 0.2 }",
  "{ 0.4 0.3 0.7 }",
  "{ 0.4 0.3 1 }",
  "{ 0.4 0.6 0.1 }",
  "{ 0.4 0.6 0.9 }",
  "{ 0.4 0.65 0.20 }",
  "{ 0.4 0.65 0.4 }",
  "{ 0.4 0.7 0.8 }",
  "{ 0.40 0.45 0.35 }",
  "{ 0.45 0.0 0.0 }",
  "{ 0.45 0.45 0.3 }",
  "{ 0.45 0.55 0.85 }",
  "{ 0.45 0.55 0.9 }",
  "{ 0.45 0.6 0.2 }",
  "{ 0.5 0.1 0.1 }",
  "{ 0.5 0.2 0.7 }",
  "{ 0.5 0.2 0.8 }",
  "{ 0.5 0.3 1 }",
  "{ 0.5 0.45 0.2 }",
  "{ 0.5 0.5 0.1 }",
  "{ 0.5 0.5 0.5 }",
  "{ 0.5 0.8 0.3 }",
  "{ 0.55 0.45 0.10 }",
  "{ 0.55 0.50 0.15 }",
  "{ 0.55 0.55 0.15 }",
  "{ 0.56 0.55 0.4 }",
  "{ 0.6 0.05 0.05 }",
  "{ 0.6 0.3 0.0 }",
  "{ 0.6 0.3 0.7 }",
  "{ 0.6 0.4 0.3 }",
  "{ 0.65 0.25 0.1 }",
  "{ 0.65 0.4 0.15 }",
  "{ 0.65 0.65 0.2 }",
  "{ 0.65 0.8 0.3 }",
  "{ 0.65 0.95 0.55 }",
  "{ 0.7 0.2 0.7 }",
  "{ 0.7 0.3 0.0 }",
  "{ 0.7 0.3 0.2 }",
  "{ 0.7 0.3 0.5 }",
  "{ 0.7 0.5 0.5 }",
  "{ 0.7 0.5 0.6 }",
  "{ 0.7 0.6 0.95 }",
  "{ 0.7 0.6 1 }",
  "{ 0.7 0.7 0.3 }",
  "{ 0.75 0.60 0.20 }",
  "{ 0.75 0.65 0.15 }",
  "{ 0.75 0.67 0.07 }",
  "{ 0.75 0.8 0.50 }",
  "{ 0.76 0.42 0.08 }",
  "{ 0.8 0.1 0.1 }",
  "{ 0.8 0.3 0.0 }",
  "{ 0.8 0.3 0.3 }",
  "{ 0.8 0.4 0.0 }",
  "{ 0.8 0.4 0.1 }",
  "{ 0.8 0.6 0.0 }",
  "{ 0.8 0.7 0.4 }",
  "{ 0.8 0.75 0.83 }",
  "{ 0.8 0.8 0.5 }",
  "{ 0.8 0.9 0.1 }",
  "{ 0.80 0.67 0.24  }",
  "{ 0.85 0.72 0.30 }",
  "{ 0.85 0.75 0.50 }",
  "{ 0.85 0.79 0.25 }",
  "{ 0.9 0.1 0.3 }",
  "{ 0.9 0.4 0.1 }",
  "{ 0.9 0.9 0.9 }",
  "{ 0.90 0.75 0.10 }",
  "{ 0.92 0.93 0.63 }",
  "{ 0.95 0.95 0.55 }",
  "{ 0.98 0.85 0.36  }",
  "{ 1.0 0.2 0.0 }",
  "{ 1.0 0.4 0.4 }",
  "{ 100 140 120 }",
  "{ 100 90 70 }",
  "{ 112 36 228 }",
  "{ 118 89 51 }",
  "{ 140 110 35 }",
  "{ 141 186 119 }",
  "{ 147 124 93 }",
  "{ 161 90 40 }",
  "{ 162 238 242 }",
  "{ 181 87 67 }",
  "{ 191 182 182 }",
  "{ 210 150 255 }",
  "{ 220 170 120 }",
  "{ 248 138 71 }",
  "{ 25 25 255 }",
  "{ 250 185 5 }",
  "{ 255 125 125 }",
  "{ 40 140 100 }",
  "{ 45 49 107 }",
  "{ 50 50 50 }",
  "{ 61 109 56 }",
  "{ 75 100 100 }",
  "{ 90 90 125 }",
];

// --- Main entry: assign visuals to a culture based on its geo stats ---
function assignVisualsFromGeo(culture) {
  if (!culture || !culture.geoStats) {
    console.warn("assignVisualsFromGeo: culture has no geoStats", culture);
    return culture;
  }
  const gs = culture.geoStats;
  const ex = gs.extended || {};

  // 1) Decide macro visual family from geo / climate / tags
  const family = inferVisualFamily(gs);
  const cands  = getVisualCandidatesFromFamily(family, gs);

  // 2) Use a culture-specific key so assignments are stable
  const key = culture.id || culture.key || culture.name || "";

  const chosenCoa      = chooseFrom(cands.coa,      key, "coa");
  const chosenEth      = chooseFrom(cands.ethnicity, key, "ethnicity"); //culture.id (This is where we will fix eths)
  const chosenBuilding = chooseFrom(cands.building, key, "building");
  const chosenClothing = chooseFrom(cands.clothing, key, "clothing");
  const chosenUnit     = chooseFrom(cands.unit,     key, "unit");
  const chosenFrame = chooseFrom(houseCoas, key, "house_frame");
  const chosenColor = chooseFrom(cultureColors, key, "culture_color");

  // 3) Attach onto the culture object (respect existing explicit overrides)
  if (chosenCoa && !culture.coa_gfx) {
    culture.coa_gfx = chosenCoa;
  }
  if (chosenBuilding && !culture.building_gfx) {
    culture.building_gfx = chosenBuilding;
  }
  if (chosenClothing && !culture.clothing_gfx) {
    culture.clothing_gfx = chosenClothing;
  }
  if (chosenUnit && !culture.unit_gfx) {
    culture.unit_gfx = chosenUnit;
  }

  if (chosenFrame) {
    culture.house_frame = chosenFrame;
  }

  if (chosenColor) {
    culture.culture_color = chosenColor
  }

  culture.language = `language_${culture.id}`;
  culture.genLanguage = genLanguage()
  culture.name = makeRandomWord(culture.genLanguage, 4, 10)
  culture.maleNames = []
  culture.femaleNames = []
  culture.dynastyNames = []
  for (let i = 0; i < 500; i++) {
    culture.maleNames.push(makeCharacterName(culture.genLanguage))
    culture.femaleNames.push(makeCharacterName(culture.genLanguage))
    culture.dynastyNames.push(makePlaceName(culture.genLanguage))
  }
  culture.martialCustom = `martial_custom_male_only`

  // Ethnicities: use an array like CK3 does, but only if not already set
  if (chosenEth) {
    if (!Array.isArray(culture.ethnicities) || !culture.ethnicities.length) {
      culture.ethnicities = [chosenEth];
    }
  }

  // Debugging hook so you can see what the classifier thought this was
  culture._visual_family = family;

  return culture;
}

// Tiny stable hash for tiebreaks (same culture -> same choice)
function hashStringEthos(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function assignEthosAndHead(culture) {
  if (!culture || !culture.geoStats) {
    console.warn("assignEthosAndHead: culture has no geoStats", culture);
    return culture;
  }
  culture.head = "domain" //DEFAULTING TO HIS FOR NOW UNTIL FIX FOR HERD

  const ETHOS = [
    "ethos_bellicose",
    "ethos_bureaucratic",
    "ethos_communal",
    "ethos_courtly",
    "ethos_egalitarian",
    "ethos_spiritual",
    "ethos_stoic"
    ];
  const gs = culture.geoStats;
  const ex = gs.extended || {};
  const flags = gs.flags || {};
  const envTags = ex.envTags || [];
  const economyTags = ex.economyTags || [];
  const hazardTags = ex.hazardTags || [];
  const cohesionTags = ex.cohesionTags || [];
  const archetype = ex.primaryArchetype || "";
  const kShares = gs.koppenGroupShares || {};
  const terrainShares = gs.terrainShares || {};

  const agri = ex.agriScore || 0;
  const pastoral = ex.pastoralScore || 0;
  const maritime = ex.maritimeScore || 0;
  const mining = ex.miningScore || 0;
  const floodRisk = ex.floodRiskScore || 0;
  const droughtRisk = ex.droughtRiskScore || 0;
  const winterHard = ex.winterHardshipScore || 0;
  const terrainDiv = ex.terrainDiversity || 0;
  const climateDiv = ex.climateDiversity || 0;

  const totalProv = gs.totalProvinces || 1;
  const latSpan = ex.latSpanNorm || 0;
  const lonSpan = ex.lonSpanNorm || 0;
  const latFromEq = gs.extent?.latFromEquatorMean ?? 0.5;

  const isLarge =
    totalProv >= 80 ||
    (latSpan > 0.3 && lonSpan > 0.25);
  const isVeryLarge = totalProv >= 200;
  const isSmall = totalProv < 10;

  const isTropical = !!flags.isTropical || (kShares.A || 0) > 0.5;
  const isCold = !!flags.isCold || ((kShares.D || 0) + (kShares.E || 0)) > 0.5;
  const isHighland = (kShares.H || 0) > 0.2 || (gs.elevation?.mean || 0) > 2500;

  const isSteppe =
    (terrainShares.steppe || 0) +
      (terrainShares.drylands || 0) >
    0.25;

  const isForestHeavy =
    (terrainShares.forest || 0) +
      (terrainShares.jungle || 0) +
      (terrainShares.taiga || 0) >
    0.45;

  const isArchipelagic = envTags.includes("archipelagic");
  const isFragmented = cohesionTags.includes("fragmented-territory");
  const isHighlyContiguous = cohesionTags.includes("highly-contiguous");

  // If we have a visual family classifier from earlier, use it as another hint
  const visualFamily =
    culture._visual_family ||
    (typeof inferVisualFamily === "function"
      ? inferVisualFamily(gs)
      : "unknown");

  // ---------- ETHOS SCORING ----------
  const ethosScores = {
    ethos_bellicose: 0,
    ethos_bureaucratic: 0,
    ethos_communal: 0,
    ethos_courtly: 0,
    ethos_egalitarian: 0,
    ethos_spiritual: 0,
    ethos_stoic: 0
  };

  // Bellicose – harsh environments, fragmentation, steppe/desert, mining
  ethosScores.ethos_bellicose +=
    (flags.isMountainous ? 1.5 : 0) +
    (droughtRisk > 1.2 ? 1.0 : 0) +
    (winterHard > 1.5 ? 1.0 : 0) +
    (isFragmented ? 1.0 : 0) +
    (mining / 4) +
    (isSteppe ? 1.0 : 0) +
    (visualFamily.includes("desert") ? 0.7 : 0) +
    (visualFamily.includes("steppe") ? 0.7 : 0);

  // Bureaucratic – large, contiguous, multi-climate, agri-heavy, coastal cores
  ethosScores.ethos_bureaucratic +=
    (isVeryLarge ? 2.0 : isLarge ? 1.0 : 0) +
    (isHighlyContiguous ? 1.0 : 0) +
    (climateDiv > 0.3 ? 0.7 : 0) +
    (agri > 1.5 ? 1.0 : 0) +
    (maritime > 1.5 ? 0.5 : 0) +
    (archetype === "temperate-plains-core" ? 1.0 : 0) +
    (archetype === "maritime-breadbasket" ? 0.7 : 0);

  // Communal – wet, floodplains, small/medium, mixed terrain
  ethosScores.ethos_communal +=
    (floodRisk > 1.0 ? 1.2 : 0) +
    (terrainDiv > 0.3 ? 0.6 : 0) +
    (climateDiv > 0.3 ? 0.6 : 0) +
    (isSmall ? 0.8 : 0) +
    (economyTags.includes("agricultural-heartland") ? 0.6 : 0) +
    (isForestHeavy ? 0.5 : 0) +
    (envTags.includes("wetland") ? 0.6 : 0);

  // Courtly – rich coasts, high agri + maritime, milder climates
  const mildClimate = flags.isTemperate && !flags.isHighland && !flags.isDesert;
  const isDesert = flags.isDesert || (kShares.B || 0) > 0.5;
  ethosScores.ethos_courtly +=
    (maritime > 1.5 ? 1.2 : 0) +
    (agri > 1.5 ? 1.0 : 0) +
    (isLarge && mildClimate ? 0.8 : 0) +
    (visualFamily === "mediterranean_temperate_coast" ? 1.0 : 0) +
    (visualFamily === "temperate_oceanic_west" ? 0.8 : 0);

  // Egalitarian – pastoral, archipelagic, small/medium, rugged travel
  ethosScores.ethos_egalitarian +=
    (pastoral > 1.0 ? 1.1 : 0) +
    (isArchipelagic ? 0.9 : 0) +
    (isSmall ? 0.6 : 0) +
    (hazardTags.includes("rugged-travel") ? 0.6 : 0) +
    (cohesionTags.includes("strong-diaspora-pattern") ? 0.5 : 0);

  // Spiritual – highlands, deserts, extreme climates, isolation
  ethosScores.ethos_spiritual +=
    (isHighland ? 1.2 : 0) +
    (isDesert ? 1.0 : 0) +
    (isTropical && isHighland ? 0.7 : 0) +
    (visualFamily === "highland_inner_asia" ? 0.8 : 0) +
    (visualFamily === "desert_inland" ? 0.6 : 0) +
    (winterHard > 1.5 || droughtRisk > 1.2 ? 0.5 : 0);

  // Stoic – cold, rugged, polar/continental, harsh but not necessarily warlike
  const polarish = latFromEq > 0.65;
  ethosScores.ethos_stoic +=
    (isCold ? 1.2 : 0) +
    (polarish ? 1.0 : 0) +
    (winterHard > 1.0 ? 0.8 : 0) +
    (hazardTags.includes("rugged-travel") ? 0.6 : 0) +
    (visualFamily === "circumpolar" ? 0.8 : 0) +
    (visualFamily === "continental_inland" ? 0.5 : 0);

  // ---------- Pick best ethos (with deterministic tiebreak) ----------
  let bestEthos = ETHOS[0];
  let bestScore = -1e9;
  const seedKey = culture.id || culture.key || culture.name || "";
  const seedHash = hashStringEthos(String(seedKey));

  for (const e of ETHOS) {
    const score = ethosScores[e] ?? 0;
    // Add tiny deterministic jitter so ties are stable but not all the same
    const jitter = ((hashStringEthos(e + ":" + seedHash) % 1000) / 100000); // 0..0.0099
    const s = score + jitter;
    if (s > bestScore) {
      bestScore = s;
      bestEthos = e;
    }
  }
  culture.ethos = bestEthos
}

// Reuse helpers if already defined; otherwise define them
if (typeof hashString === "undefined") {
  var hashString = function(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
}
if (typeof chooseFrom === "undefined") {
  var chooseFrom = function(list, seedKey, salt) {
    if (!Array.isArray(list) || !list.length) return null;
    const h = hashString(String(seedKey || "") + ":" + salt);
    const idx = h % list.length;
    return list[idx];
  };
}

// Infer a rough geo-cultural "name region"
function inferNameRegion(culture, gs) {
  const ex = gs.extended || {};
  const flags = gs.flags || {};
  const envTags = ex.envTags || [];
  const economyTags = ex.economyTags || [];
  const kShares = gs.koppenGroupShares || {};
  const terrainShares = gs.terrainShares || {};
  const latFromEq = gs.extent?.latFromEquatorMean ?? 0.5;
  const coastalShare = gs.coastalShare ?? (gs.coastalProvinces || 0) / (gs.totalProvinces || 1);

  const visualFamily =
    culture._visual_family ||
    (typeof inferVisualFamily === "function" ? inferVisualFamily(gs) : "unknown");

  const primaryEth = Array.isArray(culture.ethnicities) && culture.ethnicities.length
    ? culture.ethnicities[0]
    : null;

  const tropical = !!flags.isTropical || (kShares.A || 0) > 0.5;
  const arid     = !!flags.isDesert   || (kShares.B || 0) > 0.5;
  const cold     = !!flags.isCold     || ((kShares.D || 0) + (kShares.E || 0)) > 0.5;
  const highland = (kShares.H || 0) > 0.2 || (gs.elevation?.mean || 0) > 2500;
  const polarish = latFromEq > 0.7;
  const archipelagic = envTags.includes("archipelagic");
  const maritime = coastalShare > 0.35 || economyTags.includes("maritime-oriented");
  const steppe =
    (terrainShares.steppe || 0) +
    (terrainShares.drylands || 0) > 0.25;

  // Strong ethnicity overrides where obvious
  if (primaryEth === "african" || primaryEth === "east_african") {
    if (coastalShare > 0.4 || archipelagic) return "africa_coastal";
    return "africa_interior";
  }
  if (primaryEth === "indian" || primaryEth === "south_indian") {
    return tropical ? "india_tropical" : "india_inland";
  }
  if (primaryEth && primaryEth.indexOf("asian") === 0) {
    if (archipelagic || maritime) return "se_asia_islands";
    if (highland) return "tibet_himalaya";
    return "east_asia_inland";
  }
  if (primaryEth && primaryEth.indexOf("turkic") === 0) {
    return steppe ? "steppe_turkic" : "mena_turkic";
  }
  if (primaryEth && primaryEth.indexOf("slavic") === 0) {
    return cold ? "slavic_north" : "slavic_south";
  }
  if (primaryEth && primaryEth.indexOf("circumpolar_") === 0) {
    return "circumpolar";
  }
  if (primaryEth && primaryEth.indexOf("caucasian_northern_") === 0) {
    return cold ? "north_sea_baltic" : "west_central_europe";
  }
  if (primaryEth === "mediterranean" || primaryEth === "mediterranean_byzantine") {
    return "mediterranean";
  }

  // Otherwise lean on visualFamily + climate
  switch (visualFamily) {
    case "circumpolar":
      return "circumpolar";
    case "highland_inner_asia":
      return "tibet_himalaya";
    case "desert_coast_mena":
      return "mena_coastal";
    case "desert_inland":
    case "desert_steppe":
      return "mena_inland";
    case "tropical_maritime":
      return archipelagic ? "se_asia_islands" : "indian_ocean_rim";
    case "tropical_inland":
      return "tropical_inland";
    case "temperate_steppe":
      return "steppe_core";
    case "mediterranean_temperate_coast":
      return "mediterranean";
    case "north_sea_coast":
      return "north_sea_baltic";
    case "continental_inland":
      return "slavic_inland";
    case "temperate_oceanic_west":
      return "atlantic_west";
    case "temperate_inland_west":
    default:
      break;
  }

  // Fallback by lat/climate
  if (polarish || (cold && latFromEq > 0.6)) return "circumpolar";
  if (tropical && archipelagic) return "se_asia_islands";
  if (tropical && !archipelagic) return "tropical_inland";
  if (arid) return maritime ? "mena_coastal" : "mena_inland";
  if (steppe) return "steppe_core";
  if (maritime) return "atlantic_west";
  return "west_central_europe";
}

// Get plausible name_list_* candidates for a region
function getNameListCandidatesForRegion(region) {
  switch (region) {
    // Polar / arctic / boreal
    case "circumpolar":
      return [
        "name_list_sami",
        "name_list_finnish",
        "name_list_karelian",
        "name_list_vepsian",
        "name_list_komi",
        "name_list_mari",
        "name_list_mordvin",
        "name_list_muroma",
        "name_list_merya",
        "name_list_meshchera",
        "name_list_samoyed",
        "name_list_khanty",
        "name_list_norse",
        "name_list_norwegian",
        "name_list_swedish",
        "name_list_danish",
        "name_list_irish",
        "name_list_scottish",
        "name_list_welsh",
        "name_list_cornish",
        "name_list_breton",
        "name_list_estonian",
        "name_list_lithuanian",
        "name_list_latgalian",
        "name_list_russian",
        "name_list_ilmenian",
        "name_list_severian",
        "name_list_volhynian",
        "name_list_nivkh",
        "name_list_ainu",
        "name_list_emishi"
      ];

    // Himalayan / Tibetan / Inner Asian plateau
    case "tibet_himalaya":
      return [
        "name_list_bodpa",
        "name_list_tsangpa",
        "name_list_lhomon",
        "name_list_sumpa",
        "name_list_zhangzhung",
        "name_list_qiang",
        "name_list_tangut",
        "name_list_tuyuhun",
        "name_list_tsangpa",
        "name_list_nepali",
        "name_list_kirati",
        "name_list_saka",
        "name_list_tocharian",
        "name_list_uyghur",
        "name_list_yughur",
        "name_list_uriankhai",
        "name_list_oirat",
        "name_list_naiman",
        "name_list_karluk",
        "name_list_kimek",
        "name_list_kirghiz",
        "name_list_mongol",
        "name_list_buryat"
      ];

    // Coastal MENA, Nile, Levant, Maghreb
    case "mena_coastal":
      return [
        "name_list_egyptian",
        "name_list_ancient_egyptian",
        "name_list_maghrebi",
        "name_list_baranis",
        "name_list_bedouin",
        "name_list_yemeni",
        "name_list_levantine",
        "name_list_nubian",
        "name_list_somali",
        "name_list_swahili",
        "name_list_sao",
        "name_list_beja",
        "name_list_afar",
        "name_list_zaghawa",
        "name_list_ethiopian",
        "name_list_welayta",
        "name_list_hausa",
        "name_list_kanuri",
        "name_list_sardinian",
        "name_list_sicilian",
        "name_list_andalusian",
        "name_list_guanches"
      ];

    // Inland MENA / Iranian plateau / deserts
    case "mena_inland":
      return [
        "name_list_bedouin",
        "name_list_yemeni",
        "name_list_persian",
        "name_list_kurdish",
        "name_list_daylamite",
        "name_list_khwarezmian",
        "name_list_tajik",
        "name_list_baloch",
        "name_list_afghan",
        "name_list_saka",
        "name_list_sogdian",
        "name_list_karluk",
        "name_list_kimek",
        "name_list_khazar",
        "name_list_kimek",
        "name_list_kipchak",
        "name_list_pecheneg",
        "name_list_cuman",
        "name_list_bolghar",
        "name_list_turkish",
        "name_list_karluk",
        "name_list_maghrebi"
      ];

    // Indian-subcontinent tropical (Ganges delta, Deccan etc.)
    case "india_tropical":
    case "india_inland":
      return [
        "name_list_bengali",
        "name_list_assamese",
        "name_list_hindustani",
        "name_list_punjabi",
        "name_list_rajput",
        "name_list_gujarati",
        "name_list_marathi",
        "name_list_malvi",
        "name_list_gond",
        "name_list_kashmiri",
        "name_list_kannada",
        "name_list_tamil",
        "name_list_telugu",
        "name_list_oriya",
        "name_list_sinhala",
        "name_list_nepali",
        "name_list_sindhi",
        "name_list_maly",
        "name_list_nakkavaram"
      ].filter(Boolean); // in case of typo in list

    // SE Asia / island worlds
    case "se_asia_islands":
      return [
        "name_list_malay",
        "name_list_vietnamese",
        "name_list_tai",
        "name_list_khmer",
        "name_list_cham",
        "name_list_mon",
        "name_list_dayak",
        "name_list_bisayan",
        "name_list_iloko",
        "name_list_tagalog",
        "name_list_ryukyuan",
        "name_list_yamato",
        "name_list_korean",
        "name_list_balhae",
        "name_list_mohe",
        "name_list_han"
      ];

    // Indian Ocean tropical rim (coasts of Africa + India + SE Asia)
    case "indian_ocean_rim":
    case "tropical_inland":
      return [
        "name_list_swahili",
        "name_list_somali",
        "name_list_ethiopian",
        "name_list_welayta",
        "name_list_hausa",
        "name_list_kanuri",
        "name_list_malinke",
        "name_list_marka",
        "name_list_mossi",
        "name_list_soninke",
        "name_list_songhai",
        "name_list_sorko",
        "name_list_akan",
        "name_list_ewe",
        "name_list_igbo",
        "name_list_yoruba",
        "name_list_nupe",
        "name_list_guan",
        "name_list_bobo",
        "name_list_gur",
        "name_list_pulaar",
        "name_list_edo",
        "name_list_mel",
        "name_list_afghan",
        "name_list_bengali",
        "name_list_tamil",
        "name_list_telugu",
        "name_list_kannada",
        "name_list_sinhala",
        "name_list_malay",
        "name_list_vietnamese",
        "name_list_tai"
      ];

    // Explicit African splits (if ethnicity hinted)
    case "africa_coastal":
      return [
        "name_list_swahili",
        "name_list_somali",
        "name_list_hausa",
        "name_list_kanuri",
        "name_list_nubian",
        "name_list_ethiopian",
        "name_list_welayta",
        "name_list_malinke",
        "name_list_marka",
        "name_list_mossi",
        "name_list_soninke",
        "name_list_sorko",
        "name_list_sao",
        "name_list_akan",
        "name_list_ewe",
        "name_list_igbo",
        "name_list_yoruba",
        "name_list_nupe",
        "name_list_guan",
        "name_list_wolof",
        "name_list_pulaar",
        "name_list_east_bantu"
      ];
    case "africa_interior":
      return [
        "name_list_malinke",
        "name_list_marka",
        "name_list_mossi",
        "name_list_soninke",
        "name_list_sorko",
        "name_list_sao",
        "name_list_akan",
        "name_list_ewe",
        "name_list_igbo",
        "name_list_yoruba",
        "name_list_nupe",
        "name_list_guan",
        "name_list_bobo",
        "name_list_gur",
        "name_list_edo",
        "name_list_mel",
        "name_list_east_bantu",
        "name_list_welayta"
      ];

    // Classic Eurasian steppe
    case "steppe_core":
    case "steppe_turkic":
      return [
        "name_list_turkish",
        "name_list_karluk",
        "name_list_kimek",
        "name_list_kipchak",
        "name_list_pecheneg",
        "name_list_cuman",
        "name_list_bolghar",
        "name_list_avar",
        "name_list_hunnic",
        "name_list_saka",
        "name_list_sogdian",
        "name_list_kirghiz",
        "name_list_uyghur",
        "name_list_yughur",
        "name_list_kerait",
        "name_list_ongud",
        "name_list_naiman",
        "name_list_uriankhai",
        "name_list_oirat",
        "name_list_jurchen",
        "name_list_khitan",
        "name_list_balhae",
        "name_list_mongol",
        "name_list_buryat"
      ];

    // North Sea and Baltic coasts
    case "north_sea_baltic":
      return [
        "name_list_english",
        "name_list_anglo_saxon",
        "name_list_norman",
        "name_list_scottish",
        "name_list_irish",
        "name_list_welsh",
        "name_list_cornish",
        "name_list_cumbrian",
        "name_list_breton",
        "name_list_danish",
        "name_list_swedish",
        "name_list_norwegian",
        "name_list_norse",
        "name_list_dutch",
        "name_list_frisian",
        "name_list_german",
        "name_list_saxon",
        "name_list_old_saxon",
        "name_list_bavarian",
        "name_list_swabian",
        "name_list_franconian",
        "name_list_suebi",
        "name_list_prussian",
        "name_list_pommeranian",
        "name_list_polabian",
        "name_list_estonian",
        "name_list_lithuanian",
        "name_list_latgalian",
        "name_list_russian",
        "name_list_ilmenian",
        "name_list_severian",
        "name_list_volhynian"
      ];

    // Inland Slavic, steppe-adjacent forests & plains
    case "slavic_inland":
    case "slavic_north":
    case "slavic_south":
      return [
        "name_list_czech",
        "name_list_polish",
        "name_list_slovien",
        "name_list_serbian",
        "name_list_bosnian",
        "name_list_croatian",
        "name_list_russian",
        "name_list_ilmenian",
        "name_list_severian",
        "name_list_volhynian",
        "name_list_polabian",
        "name_list_merya",
        "name_list_muroma",
        "name_list_meshchera",
        "name_list_mari",
        "name_list_komi",
        "name_list_khanty",
        "name_list_sami",
        "name_list_karelian",
        "name_list_vepsian",
        "name_list_lithuanian",
        "name_list_latgalian",
        "name_list_hungarian",
        "name_list_mogyer"
      ];

    // Mediterranean coasts: Iberia, Italy, Balkans, Greece, Levant
    case "mediterranean":
      return [
        "name_list_andalusian",
        "name_list_castilian",
        "name_list_asturleonese",
        "name_list_galician",
        "name_list_portuguese",
        "name_list_catalan",
        "name_list_aragonese",
        "name_list_occitan",
        "name_list_visigothic",
        "name_list_roman",
        "name_list_italian",
        "name_list_cisalpine",
        "name_list_sardinian",
        "name_list_sicilian",
        "name_list_greek",
        "name_list_albanian",
        "name_list_vlach",
        "name_list_bulgarian",
        "name_list_bosnian",
        "name_list_serbian",
        "name_list_croatian",
        "name_list_georgian",
        "name_list_armenian",
        "name_list_maghrebi",
        "name_list_levantine",
        "name_list_yemeni",
        "name_list_bedouin",
        "name_list_egyptian"
      ];

    // Atlantic-facing Western Europe
    case "atlantic_west":
      return [
        "name_list_english",
        "name_list_anglo_saxon",
        "name_list_norman",
        "name_list_scottish",
        "name_list_irish",
        "name_list_gaelic",
        "name_list_welsh",
        "name_list_cornish",
        "name_list_cumbrian",
        "name_list_breton",
        "name_list_french",
        "name_list_frankish",
        "name_list_franconian",
        "name_list_frisian",
        "name_list_dutch",
        "name_list_galician",
        "name_list_portuguese",
        "name_list_castilian"
      ];

    // West & Central European inland mix
    case "west_central_europe":
    default:
      return [
        "name_list_french",
        "name_list_frankish",
        "name_list_franconian",
        "name_list_german",
        "name_list_bavarian",
        "name_list_swabian",
        "name_list_saxon",
        "name_list_old_saxon",
        "name_list_suebi",
        "name_list_dutch",
        "name_list_frisian",
        "name_list_english",
        "name_list_norman",
        "name_list_breton",
        "name_list_gaelic",
        "name_list_scottish",
        "name_list_irish",
        "name_list_welsh",
        "name_list_cornish",
        "name_list_cumbrian",
        "name_list_italian",
        "name_list_lombard",
        "name_list_cisalpine",
        "name_list_sardinian",
        "name_list_sicilian",
        "name_list_albanian",
        "name_list_vlach"
      ];
  }
}

// --- Main entry: assign a name_list_* to a culture ---
function assignNameListFromGeo(culture) {
  if (!culture || !culture.geoStats) {
    console.warn("assignNameListFromGeo: culture has no geoStats", culture);
    return culture;
  }

  const gs = culture.geoStats;
  const region = inferNameRegion(culture, gs);
  const candidates = getNameListCandidatesForRegion(region);

  const key = culture.id || culture.key || culture.name || "";
  let chosen = chooseFrom(candidates, key, "name_list");

  // Fallback to global list if something went wrong
  if (!chosen) {
    chosen = chooseFrom(nameLists, key, "name_list_global");
  }

  if (!culture.name_list) {
    culture.name_list = chosen;
  }
  culture._name_region = region; // debug hook

  return culture;
}
