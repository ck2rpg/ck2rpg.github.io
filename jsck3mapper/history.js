//<!-- ===== Generated History (keyed to actual titles) ===== -->



function addGeneratedHistoryByTitles() {
  const headerCards = document.querySelectorAll('header .row.card');
  if (!headerCards.length) return;
  const host = headerCards[0];

  function addBtn(id, label, onClick) {
    const b = document.createElement('button');
    b.className = 'btn';
    b.id = id;
    b.textContent = label;
    b.addEventListener('click', onClick);
    host.appendChild(b);
    return b;
  }

  // Stable helpers to match landed-titles exporter’s naming
  const countyTitle  = (cid) => colorTitle('c', countyPalette,  cid);
  const duchyTitle   = (did) => colorTitle('d', duchyPalette,   did);
  const kingdomTitle = (kid) => colorTitle('k', kingdomPalette, kid);
  const empireTitle  = (eid) => colorTitle('e', empirePalette,  eid);



  // --- shared mapping: province ID -> seed index (land-only, 1..landCount) ---
  let _seedByProvId = null;

  function ensureSeedByProvId() {
    if (_seedByProvId) return;

    const landIdx = [];
    for (let i = 0; i < seeds.length; i++) {
      if (seeds[i].isLand) landIdx.push(i);
    }

    const seedByProvId = new Int32Array(landIdx.length + 1).fill(-1);
    for (let i = 0; i < landIdx.length; i++) {
      const seedIndex = landIdx[i];
      const pid = i + 1; // province IDs are 1-based
      seedByProvId[pid] = seedIndex;
    }
    _seedByProvId = seedByProvId;
  }

   // === numeric culture index derived from county’s seeds ===
  function cultureIndexForCounty(cid, counties) {
    ensureSeedByProvId();
    const county = counties[cid];
    if (!county || !county.provs || !county.provs.length) {
      return -1;
    }

    for (const pid of county.provs) { // pid = province ID
      const pSeed = _seedByProvId[pid]; // convert to seed index
      if (pSeed < 0) continue;

      let cIdx = -1;
      if (typeof provToCulture !== 'undefined' && provToCulture) {
        cIdx = provToCulture[pSeed] ?? -1;
      } else if (seeds[pSeed] && typeof seeds[pSeed].cultureIndex === 'number') {
        cIdx = seeds[pSeed].cultureIndex;
      }

      if (cIdx >= 0) return cIdx;
    }

    return -1;
  }

  function cultureKeyFromIndex(cIdx) {
    if (cIdx == null || cIdx < 0) return 'generic_culture';
    if (Array.isArray(worldCultures) && worldCultures[cIdx]) {
      const cObj = worldCultures[cIdx];
      if (cObj.id)  return cObj.id;
      if (cObj.key) return cObj.key;
    }
    return `culture_${cIdx}`;
  }

  function religionKeyFromIndex(rIdx) {
    if (rIdx == null || rIdx < 0) return 'generic_religion';
    if (Array.isArray(worldReligions) && worldReligions[rIdx]) {
      const rObj = worldReligions[rIdx];
      if (rObj.id)  return rObj.id;
      if (rObj.key) return rObj.key;
    }
    return `religion_${rIdx}`;
  }

  // === culture/religion keys derived from county’s seeds ===
  function cultureKeyForCounty(cid, counties) {
    ensureSeedByProvId();
    const county = counties[cid];
    if (!county || !county.provs || !county.provs.length) {
      return 'generic_culture';
    }

    for (const pid of county.provs) { // pid = province ID
      const pSeed = _seedByProvId[pid]; // convert to seed index
      if (pSeed < 0) continue;

      let cIdx = -1;
      if (typeof provToCulture !== 'undefined' && provToCulture) {
        cIdx = provToCulture[pSeed] ?? -1;
      } else if (seeds[pSeed] && typeof seeds[pSeed].cultureIndex === 'number') {
        cIdx = seeds[pSeed].cultureIndex;
      }

      if (cIdx >= 0) return cultureKeyFromIndex(cIdx);
    }

    return 'generic_culture';
  }

  function religionKeyForCounty(cid, counties) {
    ensureSeedByProvId();
    const county = counties[cid];
    if (!county || !county.provs || !county.provs.length) {
      return 'generic_religion';
    }

    for (const pid of county.provs) { // pid = province ID
      const pSeed = _seedByProvId[pid]; // convert to seed index
      if (pSeed < 0) continue;

      let fIdx = -1;
      if (typeof provToFaith !== 'undefined' && provToFaith) {
        fIdx = provToFaith[pSeed] ?? -1;
      } else if (seeds[pSeed] && typeof seeds[pSeed].faithIndex === 'number') {
        fIdx = seeds[pSeed].faithIndex;
      }

      if (fIdx < 0) continue;

      let rIdx = -1;
      if (Array.isArray(faithToReligion) && fIdx < faithToReligion.length) {
        rIdx = faithToReligion[fIdx];
      } else if (seeds[pSeed] && typeof seeds[pSeed].religionIndex === 'number') {
        rIdx = seeds[pSeed].religionIndex;
      }

      if (rIdx >= 0) return religionKeyFromIndex(rIdx);
    }

    return 'generic_religion';
  }

  // Character + dynasty generation keyed to counties
  const maleNames = [
    'Joel', 'Martin', 'Geoffrey', 'Roland', 'Bernard', 'Alan',
    'Robert', 'William', 'Hugh', 'Guy', 'Eudes', 'Henry', 'Louis'
  ];

  const femaleNames = [
    'Coreyanara', 'Adela', 'Matilda', 'Emma', 'Adele', 'Heloise',
    'Alice', 'Isabel', 'Agnes', 'Beatrice', 'Constance', 'Blanche', 'Margaret'
  ];

  function randInt(a, b) {
    return (Math.random() * (b - a + 1) | 0) + a;
  }

  function dateStr(y, m, d) {
    return `${y}.${m}.${d}`;
  }

  function randomBirth() {
    const y = randInt(760, 866);
    const m = randInt(1, 12);
    const d = randInt(1, 28);
    if (y === 867) return '866.12.28';
    return dateStr(y, m, d);
  }

  function randomDeath(minY) {
    const y = randInt(Math.max(870, minY), 930);
    const m = randInt(1, 12);
    const d = randInt(1, 28);
    return dateStr(y, m, d);
  }

  function pickName(i) {
    const female = Math.random() < 0.5;
    const pool   = female ? femaleNames : maleNames;
    return { name: pool[i % pool.length], female };
  }

  // Map countyId -> gen index (1-based) & inverse
  function indexCounties(nonEmptyCountyIds) {
    const countyToChar = new Map();
    const charToCounty = [];
    let n = 0;

    for (const cid of sorted(nonEmptyCountyIds)) {
      n++;
      countyToChar.set(cid, n);
      charToCounty[n] = cid;
    }

    return { countyToChar, charToCounty, N: n };
  }

  // ---------- File builders ----------
 


function buildGenCharacters(cont) {
  const { nonEmptyCountyIds, counties } = cont;
  const { countyToChar } = indexCounties(nonEmptyCountyIds);
  const out = [];

  // --- stable order ---------------------------------------------------------
  const iSorted = sorted(nonEmptyCountyIds).map(cid => countyToChar.get(cid)); // 1..N in order

  // Faster reverse lookup than scanning entries every time
  const charToCounty = new Int32Array(Math.max(1, iSorted.length) + 1).fill(-1);
  for (const cid of nonEmptyCountyIds) {
    const i = countyToChar.get(cid);
    if (i != null && i > 0 && i < charToCounty.length) charToCounty[i] = cid;
  }

  // --- build land-first province IDs (definition.csv order) ------------------
  // This matches what you do in k_generated exporter.
  const landSeeds = [];
  for (let p = 0; p < seeds.length; p++) if (seeds[p]?.isLand) landSeeds.push(p);

  const provIdBySeed = new Int32Array(seeds.length).fill(-1);
  const seedByProvId = new Int32Array(landSeeds.length + 1).fill(-1);
  for (let i = 0; i < landSeeds.length; i++) {
    const pSeed = landSeeds[i];
    const pid = i + 1;
    provIdBySeed[pSeed] = pid;
    seedByProvId[pid] = pSeed;
  }

  // county -> smallest provinceId (capital pid) + capital seed index
  const countyCapitalPid = new Map();   // cid -> min pid
  const countyCapitalSeed = new Map();  // cid -> seed index (province) of that pid

  for (let p = 0; p < seeds.length; p++) {
    if (!seeds[p]?.isLand) continue;
    const cid = provToCounty?.[p];
    if (cid == null || cid < 0) continue;

    const pid = provIdBySeed[p];
    if (pid < 1) continue;

    const curMin = countyCapitalPid.get(cid);
    if (curMin == null || pid < curMin) {
      countyCapitalPid.set(cid, pid);
      countyCapitalSeed.set(cid, p);
    }
  }

  function faithKeyFromFaithIndex(fIdx) {
    if (fIdx == null || fIdx < 0) return null;

    if (Array.isArray(worldFaiths) && worldFaiths[fIdx]) {
      const f = worldFaiths[fIdx];
      return f.id || f.key || `faith_${fIdx}`;
    }
    return `faith_${fIdx}`;
  }

  function normalizeFaithKeyForOutput(faithKey) {
    // Your k_generated exporter writes `${faithKey}_faith`
    // so do the same here, but avoid double suffixing.
    if (!faithKey) return null;
    return faithKey.endsWith('_faith') ? faithKey : `${faithKey}_faith`;
  }

  function faithKeyForCounty(cid) {
    // 1) If already stored on county, use it
    const stored = counties?.[cid]?.faithKey;
    if (stored) return normalizeFaithKeyForOutput(stored);

    // 2) Derive from county capital province (same as k_generated)
    const capSeed = countyCapitalSeed.get(cid);
    if (capSeed == null || capSeed < 0) return null;

    let fIdx = -1;
    if (typeof provToFaith !== 'undefined' && provToFaith) {
      fIdx = provToFaith[capSeed] ?? -1;
    } else if (seeds[capSeed] && typeof seeds[capSeed].faithIndex === 'number') {
      fIdx = seeds[capSeed].faithIndex;
    }

    const baseKey = faithKeyFromFaithIndex(fIdx);
    return normalizeFaithKeyForOutput(baseKey);
  }

  for (const i of iSorted) {
    const cid = charToCounty[i];
    if (cid == null || cid < 0) continue;

    const birth  = randomBirth();
    const birthY = +String(birth).split('.')[0];
    const death  = randomDeath(birthY + 16);

    // --- culture ------------------------------------------------------------
    const cultureKey = cultureKeyForCounty(cid, counties);   // e.g. "culture_7"
    const cIdx       = cultureIndexForCounty(cid, counties); // numeric index, or -1

    // --- faith (character history expects FAITH key) -------------------------
    const faithKeyOut = faithKeyForCounty(cid);

    // If this still fails, something upstream didn’t roll faiths / provToFaith.
    // We keep a loud error, but still output something rather than crashing.
    const finalFaith = faithKeyOut || 'generic_faith_faith';

    // --- generate name from the culture's language --------------------------
    let name = null;
    let female = Math.random() < 0.5;

    if (cIdx >= 0 && Array.isArray(worldCultures) && worldCultures[cIdx]) {
      const c = worldCultures[cIdx];

      let pool = null;
      if (female && Array.isArray(c.femaleNames) && c.femaleNames.length) {
        pool = c.femaleNames;
      } else if (!female && Array.isArray(c.maleNames) && c.maleNames.length) {
        pool = c.maleNames;
      }

      if (pool && pool.length) {
        const idx = (i - 1) % pool.length;
        name = pool[idx];
      } else if (typeof makeCharacterName === 'function' && c.genLanguage) {
        try { name = makeCharacterName(c.genLanguage); }
        catch (e) { console.warn('buildGenCharacters: makeCharacterName failed:', e); }
      }
    }

    if (!name) {
      const picked = pickName(i - 1);
      name = picked.name;
      female = picked.female;
    }

    // --- dynasty name --------------------------------------------------------
    let dynastyName = null;
    if (cIdx >= 0 && Array.isArray(worldCultures) && worldCultures[cIdx]) {
      const c = worldCultures[cIdx];

      if (Array.isArray(c.dynastyNames) && c.dynastyNames.length) {
        const idx = (i - 1) % c.dynastyNames.length;
        dynastyName = c.dynastyNames[idx];
      } else if (typeof makePlaceName === "function" && c.genLanguage) {
        dynastyName = makePlaceName(c.genLanguage);
      }
    }
    if (!dynastyName) dynastyName = `GenericDynasty_${i}`;

    // Optional: loud logging if we had to fall back (helps you catch missing rolls)
    if (!faithKeyOut) {
      console.warn('buildGenCharacters: missing county faith; using generic fallback', {
        cid,
        capSeed: countyCapitalSeed.get(cid),
        capPid: countyCapitalPid.get(cid),
        countyObj: counties?.[cid]
      });
    }

    out.push(
`gen_${i} = {
\tname = "${name}"
\t${female ? 'female = yes\n\t' : ''}dynasty = ${dynastyName}
\treligion = ${finalFaith}
\tculture = "${cultureKey}"
\t${birth} = {
\t\tbirth = yes
\t}
\t${death} = {
\t\tdeath = yes
\t}
}`
    );
  }

  return out.join('\n');
}




  function buildGenDynasties(cont) {
    const { nonEmptyCountyIds, counties } = cont;
    const { countyToChar } = indexCounties(nonEmptyCountyIds);
    const out = [];

    for (const cid of sorted(nonEmptyCountyIds)) {
      const i = countyToChar.get(cid);
      const cultureKey = cultureKeyForCounty(cid, counties); // bare (no quotes) like original
      out.push(
`dynn_gen_${i} = {
\tname = dynn_gen_${i}
\tculture = ${cultureKey}
}`
      );
    }

    return out.join('\n');
  }

  function buildHistTitles(cont) {
    const D = '851.7.7';
    const {
      counties, duchies, kingdoms, empires,
      nonEmptyCountyIds,
      firstCountyInDuchy, firstCountyInKingdom, firstCountyInEmpire
    } = cont;

    const { countyToChar } = indexCounties(nonEmptyCountyIds);
    const lines = [];
    const push = (s = '') => lines.push(s);

    // Empires
    for (let e = 0; e < empires.length; e++) {
      const c0 = firstCountyInEmpire(e);
      if (c0 == null) continue;
      const holder = `gen_${countyToChar.get(c0)}`;
      push(
`${empireTitle(e)} = {
\t${D} = {
\t\tholder = ${holder}
\t}
}`
      );
    }

    // Kingdoms
    for (let k = 0; k < kingdoms.length; k++) {
      const c0 = firstCountyInKingdom(k);
      if (c0 == null) continue;
      const holder = `gen_${countyToChar.get(c0)}`;

      // find liege empire if any
      let eLiege = null;
      for (let e = 0; e < empires.length; e++) {
        if (empires[e].kingdoms.has(k)) {
          eLiege = empireTitle(e);
          break;
        }
      }

      if (eLiege) {
        push(
`${kingdomTitle(k)} = {
\t${D} = {
\t\tholder = ${holder}
\t\tliege = ${eLiege}\t}
}`
        );
      } else {
        push(
`${kingdomTitle(k)} = {
\t${D} = {
\t\tholder = ${holder}
\t}
}`
        );
      }
    }

    // Duchies
    for (let d = 0; d < duchies.length; d++) {
      const c0 = firstCountyInDuchy(d);
      if (c0 == null) continue;
      const holder = `gen_${countyToChar.get(c0)}`;
      let kLiege = null;

      for (let k = 0; k < kingdoms.length; k++) {
        if (kingdoms[k].duchies.has(d)) {
          kLiege = kingdomTitle(k);
          break;
        }
      }

      if (kLiege) {
        push(
`${duchyTitle(d)} = {
\t${D} = {
\t\tholder = ${holder}
\t\tliege = ${kLiege}\t}
}`
        );
      } else {
        push(
`${duchyTitle(d)} = {
\t${D} = {
\t\tholder = ${holder}
\t}
}`
        );
      }
    }

    // Counties (only non-empty)
    for (const c of sorted(nonEmptyCountyIds)) {
      const holder = `gen_${countyToChar.get(c)}`;
      let dLiege = null;

      for (let d = 0; d < duchies.length; d++) {
        if (duchies[d].counties.has(c)) {
          dLiege = duchyTitle(d);
          break;
        }
      }

      if (dLiege) {
        push(
`${countyTitle(c)} = {
\t${D} = {
\t\tholder = ${holder}
\t\tliege = ${dLiege}\t}
}`
        );
      } else {
        push(
`${countyTitle(c)} = {
\t${D} = {
\t\tholder = ${holder}
\t}
}`
        );
      }
    }

    return lines.join('\n');
  }

  // ---- Buttons ----
  addBtn('downloadGenCharactersKeyed', 'Export gen_characters.txt (keyed)', () => {
    if (needHierarchy()) return;
    const cont = buildContainers();
    const txt  = buildGenCharacters(cont);
    blobSave(txt, 'gen_characters.txt');

    if (typeof setStatus === 'function') {
      setStatus(
        `Exported gen_characters.txt (${cont.nonEmptyCountyIds.length} characters; ` +
        'culture=kingdomname_culture, religion=empirename_religion).'
      );
    }
  });

  addBtn('downloadGenDynastiesKeyed', 'Export gen_dynasties.txt (keyed)', () => {
    if (needHierarchy()) return;
    const cont = buildContainers();
    const txt  = buildGenDynasties(cont);
    blobSave(txt, 'gen_dynasties.txt');

    if (typeof setStatus === 'function') {
      setStatus('Exported gen_dynasties.txt (dynasty culture per kingdom).');
    }
  });

  addBtn('downloadHistTitlesKeyed', 'Export hist_titles.txt (keyed)', () => {
    if (needHierarchy()) return;
    const cont = buildContainers();
    const txt  = buildHistTitles(cont);
    blobSave(txt, 'hist_titles.txt');

    if (typeof setStatus === 'function') {
      setStatus('Exported hist_titles.txt (all e/k/d/c @ 851.7.7).');
    }
  });

  addBtn('downloadGeneratedCultures', 'Export generated_cultures.txt', () => {
    if (needHierarchy()) return;

    const txt = writeCultures();
    blobSave(txt, 'generated_cultures.txt');

    if (typeof setStatus === 'function') {
      setStatus('Exported generated_cultures.txt (all generated cultures + heritages).');
    }
  });
}

// still auto-run like the original IIFE, but now via an explicit call
addGeneratedHistoryByTitles();
