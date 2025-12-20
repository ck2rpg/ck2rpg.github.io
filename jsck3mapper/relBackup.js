
/* ================= Religions & Faiths (selectable constraint + sizes + render) =================== */
(function addReligionsFaithsAllInOne(){
  if (window.__religionsFaithsInstalled) return;
  window.__religionsFaithsInstalled = true;

  // --- state ---

  let faithPalette   = [];

  
  
  let religionPalette = [];

  // --- UI: header card ---
  const header = document.querySelector('header');
  if(!header) return;

  // Build controls once
  if(!document.getElementById('relf-roll')){
    const card = document.createElement('div');
    card.className = 'row card';
    card.innerHTML = `
      <strong style="margin-right:8px">Religion & Faith Controls</strong>
      <label class="small mono">provinces / faith</label>
      <input id="relf-faith-min" type="number" min="1" value="20" style="width:64px">
      <span class="small">to</span>
      <input id="relf-faith-max" type="number" min="1" value="40" style="width:64px">

      <span style="width:12px"></span>

      <label class="small mono">faiths / religion</label>
      <input id="relf-reli-min" type="number" min="1" value="4" style="width:64px">
      <span class="small">to</span>
      <input id="relf-reli-max" type="number" min="1" value="10" style="width:64px">

      <span style="width:12px"></span>
      <label class="small mono">constraint</label>
      <select id="relf-constraint" style="min-width:180px">
        <option value="global" selected>Global (no constraint)</option>
        <option value="county">Within Counties</option>
        <option value="duchy">Within Duchies</option>
        <option value="kingdom">Within Kingdoms</option>
        <option value="empire">Within Empires</option>
      </select>

      <button class="btn primary" id="relf-roll" style="margin-left:10px">Roll Religions & Faiths</button>
    `;
    header.appendChild(card);
  }

  // Add map-mode buttons once
  const levelSeg = document.getElementById('levelSeg');
  if(levelSeg && !levelSeg.querySelector('button[data-level="faith"]')){
    const bf = document.createElement('button');
    bf.className = 'btn';
    bf.dataset.level = 'faith';
    bf.textContent = 'Faiths';
    levelSeg.appendChild(bf);
  }
  if(levelSeg && !levelSeg.querySelector('button[data-level="religion"]')){
    const br = document.createElement('button');
    br.className = 'btn';
    br.dataset.level = 'religion';
    br.textContent = 'Religions';
    levelSeg.appendChild(br);
  }

  // --- guards/helpers ---
  function needHierarchy(){
    if(!seeds || !seeds.length){ alert('Seed and run Barrier-Voronoi first.'); return true; }
    if(!provIsLand){ alert('Run "Barrier-Voronoi" first to build province land flags.'); return true; }
    return false;
  }
  function clampInt(v,min,max){ v = (v|0); if(v<min) v=min; if(v>max) v=max; return v; }
  function normalizeRange(a,b, fallback){
    let mn = clampInt(+a, 1, 1<<30);
    let mx = clampInt(+b, 1, 1<<30);
    if(mx < mn){ const t=mn; mn=mx; mx=t; }
    if(!Number.isFinite(mn) || !Number.isFinite(mx)) return fallback;
    return [mn,mx];
  }

  // province adjacency cache
  let _provAdjCache = null;
  function provAdj(){
    if(_provAdjCache) return _provAdjCache;
    _provAdjCache = buildAdjacencyFromLabels(seeds.length, i=>provIsLand && provIsLand[i]===1);
    return _provAdjCache;
  }
  try{ window._invalidateProvAdj && window._invalidateProvAdj(); }catch(_){}

  // resolve constraint selection -> { parentMap, parentCount, name }
  function getConstraint(){
    const mode = (document.getElementById('relf-constraint')?.value || 'global');
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

  
  // --- roll logic ---
  // --- roll logic (faiths + religions + world objects) ---

  function rollReligionsFaiths(){
    if (needHierarchy()) return;

    // Faith slider = *provinces per faith* (we'll convert to counties)
    const [fMinProvs, fMaxProvs] = normalizeRange(
      document.getElementById('relf-faith-min').value,
      document.getElementById('relf-faith-max').value,
      [10, 24]
    );
    // Religion slider = *faiths per religion* (already at faith-level)
    const [rMin, rMax] = normalizeRange(
      document.getElementById('relf-reli-min').value,
      document.getElementById('relf-reli-max').value,
      [2, 5]
    );

    const constraint = getConstraint();
    if (!constraint) return;

    const t0   = performance.now();
    const N    = seeds.length;
    const pAdj = provAdj();

    // We now require counties, because faiths/religions are county-based
    if (!provToCounty || !countyCount) {
      alert('Counties not built yet. Run "Barrier-Voronoi" first.');
      return;
    }

    const numCounties = countyCount | 0;

    // --- 1) Provinces ➜ Counties stats (sizes, membership) ---

    const countySizes     = new Int32Array(numCounties);
    const countyIsLand    = new Uint8Array(numCounties);     // 1 if county has any land
    const countyProvLists = Array.from({ length: numCounties }, () => []);

    for (let p = 0; p < N; p++) {
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
      alert('No land counties found for faiths/religions.');
      return;
    }

    // Interpret faith sliders as *provinces per faith*, then convert to counties
    let avgProvsPerCounty = sumProvs / landCountyCount;
    if (!Number.isFinite(avgProvsPerCounty) || avgProvsPerCounty <= 0) {
      avgProvsPerCounty = 1;
    }

    const minCountiesPerFaith = Math.max(1, Math.round(fMinProvs / avgProvsPerCounty));
    const maxCountiesPerFaith = Math.max(
      minCountiesPerFaith,
      Math.round(fMaxProvs / avgProvsPerCounty)
    );

    // County adjacency (from province adjacency + provToCounty)
    const countyLift = liftAdjacency(pAdj, provToCounty, numCounties);
    const cAdj       = countyLift.adj;

    // --- 2) Counties ➜ Faiths (county-based) ---

    const countyToFaith = new Int32Array(numCounties).fill(-1);
    let nextFaith       = 0;

    if (constraint.name === 'global') {
      // Group over all land counties
      const eligFn = (c) => countyIsLand[c] === 1;

      const { map: tmpMap, count: localCount } =
        groupGraph(numCounties, cAdj, eligFn, [minCountiesPerFaith, maxCountiesPerFaith]);

      for (let c = 0; c < numCounties; c++) {
        if (!countyIsLand[c]) continue;
        const lf = tmpMap[c];
        if (lf >= 0) countyToFaith[c] = lf;
      }
      nextFaith = localCount;
    } else {
      // Partition by selected parent (county/duchy/kingdom/empire),
      // but grouping at the *county* level.
      const { parentMap, parentCount } = constraint;
      const bins = Array.from({ length: parentCount }, () => []);

      // Assign each land county to one parent bucket
      for (let c = 0; c < numCounties; c++) {
        if (!countyIsLand[c]) continue;
        const provList = countyProvLists[c];
        if (!provList || provList.length === 0) continue;

        // Representative province for this county
        const p0 = provList[0];
        const parentId = parentMap ? parentMap[p0] : 0;
        if (parentId >= 0) bins[parentId].push(c);
      }

      for (const countyList of bins) {
        if (!countyList || countyList.length === 0) continue;

        const eligible = new Uint8Array(numCounties);
        for (const c of countyList) eligible[c] = 1;
        const eligFn = (c) => eligible[c] === 1;

        const { map: tmpMap } =
          groupGraph(numCounties, cAdj, eligFn, [minCountiesPerFaith, maxCountiesPerFaith]);

        // Compact local faith ids to global ids
        const localToGlobal = new Map();
        for (const c of countyList) {
          const lf = tmpMap[c];
          if (lf < 0) continue;
          if (!localToGlobal.has(lf)) localToGlobal.set(lf, nextFaith++);
          countyToFaith[c] = localToGlobal.get(lf);
        }
      }
    }

    const faithCountTmp = nextFaith;

    // --- 3) Push county faiths down to provinces ---

    const newProvToFaith = new Int32Array(N).fill(-1);
    for (let p = 0; p < N; p++) {
      const s = seeds[p];
      if (!s || !s.isLand) continue;

      const c = provToCounty[p];
      if (c < 0) continue;

      const fid = countyToFaith[c];
      newProvToFaith[p] = (fid != null && fid >= 0) ? fid : -1;
    }

    // --- 4) Faiths ➜ Religions (group faith graph into religion clusters) ---

    // Build faith-level adjacency by lifting province adjacency
    let faithLift = null;
    if (faithCountTmp > 0) {
      faithLift = liftAdjacency(pAdj, newProvToFaith, faithCountTmp); // {adj: Array<faithId -> neighbors>}
    } else {
      faithLift = { adj: [] };
    }

    const newFaithToReligion = new Int32Array(faithCountTmp).fill(-1);
    let nextReligion = 0;

    if (faithCountTmp > 0) {
      if (constraint.name === 'global') {
        const elig = (_)=> true;
        const { map, count } =
          groupGraph(faithCountTmp, faithLift.adj, elig, [rMin, rMax]);
        for (let f = 0; f < faithCountTmp; f++) newFaithToReligion[f] = map[f];
        nextReligion = count;
      } else {
        // Partition by parent using representative province's parent id,
        // but grouping at the *faith* level.
        const { parentMap, parentCount } = constraint;
        const faithBins = Array.from({ length: parentCount }, () => new Set());

        // Assign each faith to parent buckets based on where it actually appears
        for (let p = 0; p < N; p++) {
          const f = newProvToFaith[p];
          if (f < 0) continue;
          const g = parentMap[p];
          if (g >= 0) faithBins[g].add(f);
        }

        for (const set of faithBins) {
          if (!set || set.size === 0) continue;

          const eligibleFaith = new Uint8Array(faithCountTmp);
          for (const f of set) eligibleFaith[f] = 1;

          const elig = (i) => eligibleFaith[i] === 1;
          const { map } =
            groupGraph(faithCountTmp, faithLift.adj, elig, [rMin, rMax]);

          // Compact local religion ids to global ids
          const remap = new Map();
          for (const f of set) {
            const lr = map[f];
            if (lr < 0) continue;
            if (!remap.has(lr)) remap.set(lr, nextReligion++);
            newFaithToReligion[f] = remap.get(lr);
          }
        }
      }
    }

    // --- 5) Commit + palettes + per-seed indices ---

    provToFaith     = newProvToFaith;
    faithCount      = faithCountTmp;
    faithToReligion = newFaithToReligion;
    religionCount   = (faithCountTmp > 0)
      ? (Math.max(-1, ...newFaithToReligion) + 1)
      : 0;

    faithPalette    = makeUniquePalette(faithCount);
    religionPalette = makeUniquePalette(religionCount);

    // Optionally, also build a provToReligion map (useful for other tools)
    if (typeof provToReligion === 'undefined') {
      window.provToReligion = new Int32Array(N);
    }
    for (let p = 0; p < N; p++) {
      const fid = provToFaith[p];
      const rid = (fid >= 0 && faithToReligion[fid] >= 0) ? faithToReligion[fid] : -1;
      provToReligion[p] = rid;
    }

    // Attach faith + religion info to each seed (province)
    for (let p = 0; p < seeds.length; p++) {
      const s = seeds[p];
      if (!s) continue;

      if (!s.isLand) {
        // explicit clear for sea provinces
        s.faithIndex     = -1;
        s.faithId        = null;
        s.religionIndex  = -1;
        s.religionId     = null;
        continue;
      }

      const fid = provToFaith[p];
      if (fid >= 0) {
        s.faithIndex = fid;
        s.faithId    = `faith_${fid}`;

        const rid = (faithToReligion && faithToReligion[fid] >= 0)
          ? faithToReligion[fid]
          : -1;

        if (rid >= 0) {
          s.religionIndex = rid;
          s.religionId    = `religion_${rid}`;
        } else {
          s.religionIndex = -1;
          s.religionId    = null;
        }
      } else {
        s.faithIndex    = -1;
        s.faithId       = null;
        s.religionIndex = -1;
        s.religionId    = null;
      }
    }

    // --- 6) Build CK3-style worldReligions / worldFaiths hierarchy ---------

    buildWorldReligionsAndFaiths();

    // --- 7) Render + status ------------------------------------------------

    if (typeof renderLevel === 'function') {
      renderLevel(currentLevel);
    }
    if (typeof setStatus === 'function') {
      const label = (constraint.name === 'global') ? 'global' : `within ${constraint.name}s`;
      setStatus(
        `Faiths & Religions (county-based) rolled (${label}) in ${(performance.now() - t0 | 0)} ms • ` +
        `Faiths=${faithCount} Religions=${religionCount}`
      );
    }
  }

  // Single-click entry point now: no separate revampedReligion() call
  document.getElementById('relf-roll')?.addEventListener('click', () => {
    rollReligionsFaiths();
  });

  // -----------------------------
  // Build worldReligions/faiths
  // -----------------------------
  function buildWorldReligionsAndFaiths() {
    if (typeof provToFaith === 'undefined' || typeof faithToReligion === 'undefined') {
      console.warn('buildWorldReligionsAndFaiths: Faiths/Religions not rolled yet.');
      return;
    }
    if (typeof faithCount === 'undefined' || typeof religionCount === 'undefined') {
      console.warn('buildWorldReligionsAndFaiths: faithCount/religionCount missing.');
      return;
    }
    if (!seeds || !seeds.length) {
      console.warn('buildWorldReligionsAndFaiths: no seeds / provinces.');
      return;
    }

    const N = seeds.length;

    // 1) Province lists per faith
    const provsByFaith = Array.from({ length: faithCount }, () => []);
    for (let p = 0; p < N; p++) {
      const s = seeds[p];
      if (!s || !s.isLand) continue;
      const fIdx = provToFaith[p];
      if (fIdx == null || fIdx < 0 || fIdx >= faithCount) continue;
      provsByFaith[fIdx].push(p);
    }

    // 2) Faith lists per religion
    const religionToFaiths = Array.from({ length: religionCount }, () => []);
    for (let f = 0; f < faithCount; f++) {
      const rIdx = faithToReligion[f];
      if (rIdx == null || rIdx < 0 || rIdx >= religionCount) continue;
      religionToFaiths[rIdx].push(f);
    }

    // Reset globals
    worldReligions = new Array(religionCount).fill(null);
    worldFaiths    = new Array(faithCount).fill(null);

    // Reset icon index pools
    resetReligionIndexes();
    resetFaithIndexes();

    if (typeof world === 'undefined') {
      window.world = {};
    }
    if (!world.religions) world.religions = [];
    if (!world.faiths)    world.faiths    = [];

    // 3) Build each religion and its faiths
    for (let rIdx = 0; rIdx < religionCount; rIdx++) {
      const fList = religionToFaiths[rIdx];
      if (!fList || fList.length === 0) continue;

      // Collect all provinces for this religion (union of faiths)
      const allProvs = [];
      for (const f of fList) {
        const pf = provsByFaith[f];
        if (pf && pf.length) allProvs.push(...pf);
      }
      if (allProvs.length === 0) continue;

      // 3a) dominant / generated language
      let language = null;
      if (typeof worldCultures !== 'undefined' && Array.isArray(worldCultures)) {
        const langCounts = new Map();
        for (const p of allProvs) {
          const s = seeds[p];
          if (!s) continue;
          const cIdx = (typeof s.cultureIndex === 'number')
            ? s.cultureIndex
            : (typeof provToCulture !== 'undefined' ? provToCulture[p] : -1);
          if (cIdx == null || cIdx < 0 || cIdx >= worldCultures.length) continue;
          const cObj = worldCultures[cIdx];
          if (!cObj || !cObj.language) continue;
          const L = cObj.language;
          langCounts.set(L, (langCounts.get(L) || 0) + 1);
        }
        let bestL = null, bestCount = 0;
        for (const [L, cnt] of langCounts.entries()) {
          if (cnt > bestCount) { bestCount = cnt; bestL = L; }
        }
        if (bestL) language = bestL;
      }
      if (!language) {
        if (typeof makeLanguage === 'function') {
          language = makeLanguage(consSet, vowelSet);
        } else {
          language = 'language_generic';
        }
      }

      // 3b) Religion object
      const suff     = `religion_${rIdx}`;
      const relIndex = getNextReligionIndex();

      const doctrines = [
        chooseFrom(faithHeads),
        chooseFrom(faithGendered),
        chooseFrom(faithPluralism),
        chooseFrom(faithTheocracy),
        chooseFrom(faithConcubines),
        chooseFrom(faithDivorce),
        chooseFrom(faithConsan),
        chooseFrom(faithHomosexuality),
        chooseFrom(faithAdulteryMen),
        chooseFrom(faithAdulteryWomen),
        chooseFrom(faithKinslaying),
        chooseFrom(faithDeviancy),
        chooseFrom(faithWitchcraft),
        chooseFrom(faithClerical1),
        chooseFrom(faithClerical2),
        chooseFrom(faithClerical3),
        chooseFrom(faithClerical4),
        chooseFrom(faithPilgrimages),
        chooseFrom(funeralDoctrines)
      ];

      const religion = {
        name: `${suff}_religion`,
        nameLoc: (typeof makeFaithName === 'function') ? makeFaithName(language) : `${suff}`,
        language,
        isPagan: "yes",

        graphical_faith: chooseFrom(graphicalFaithList),
        piety_icon_group: chooseFrom(pietyIconGroupList),
        doctrine_background_icon: "core_tenet_banner_pagan.dds",
        hostility_doctrine: "pagan_hostility_doctrine",

        relIndex,
        doctrines,
        virtueSins: [],
        custom_faith_icons: getCustomIconsForReligion(relIndex),
        holy_order_names: [
          "PLACEHOLDER",
          "PLACEHOLDER"
        ],
        holy_order_maa: chooseFrom(faithMAAS),
        faiths: [],
        rollReligionIndex: rIdx
      };

      religion.oldName        = `${religion.name}_old`;
      religion.oldNameLoc     = `Old ${religion.nameLoc}`;
      religion.oldNameAdj     = `${religion.name}_old_adj`;
      religion.oldNameAdjLoc  = `Old ${religion.nameLoc}`;

      // virtues/sins x3
      pickUniqFromWithoutDelete(virtueSinPairs, religion.virtueSins);
      pickUniqFromWithoutDelete(virtueSinPairs, religion.virtueSins);
      pickUniqFromWithoutDelete(virtueSinPairs, religion.virtueSins);

      if (typeof setReligionLocalization === 'function') {
        setReligionLocalization(religion);
      }

      worldReligions[rIdx] = religion;
      world.religions.push(religion);

      // 3c) Faiths under this religion
      const faithsForReligion = [];

      for (const fIdx of fList) {
        const provs = provsByFaith[fIdx] || [];
        const isFirstFaith = (faithsForReligion.length === 0);
        const faithIndex   = getNextFaithIndex(isFirstFaith);

        const fPref    = `faith_${fIdx}`;
        const faithLang = language;

        let fNameLoc = (typeof makeFaithName === 'function')
          ? makeFaithName(faithLang)
          : `${fPref}`;

        const randWord = (typeof makeRandomWord === 'function')
          ? makeRandomWord(faithLang)
          : 'Old';

        const faith = {
          icon:           `rel_fam${religion.relIndex}_faith${faithIndex}`,
          reformed_icon:  `rel_fam${religion.relIndex}_faith${faithIndex}`,
          religion,
          language:       faithLang,
          color:          `0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)}`,
          name:           `${fPref}_faith`,
          nameLoc:        fNameLoc,
          oldName:        `${fPref}_faith_old`,
          oldNameLoc:     `${randWord} ${fNameLoc}`,
          oldNameAdj:     `${fPref}_faith_old_adj`,
          oldNameAdjLoc:  `${randWord} ${fNameLoc}`,
          doctrines:      ["unreformed_faith_doctrine"],
          holySites:      [],
          holy_order_names: religion.holy_order_names,
          virtueSins:     religion.virtueSins,
          localization:   religion.localization,
          provinces:      provs.slice(),
          rollFaithIndex: fIdx,
          religionIndex:  rIdx
        };

        // 3 random tenets
        pickUniqFromWithoutDelete(faithTenets, faith.doctrines);
        pickUniqFromWithoutDelete(faithTenets, faith.doctrines);
        pickUniqFromWithoutDelete(faithTenets, faith.doctrines);

        // Holy sites: up to 6 distinct provinces
        if (provs.length && typeof pickUniqOrDiscard === 'function') {
          const hs = [];
          for (let k = 0; k < 6; k++) {
            pickUniqOrDiscard(provs, hs);
          }
          faith.holySites = hs;
        }

        faithsForReligion.push(faith);
        worldFaiths[fIdx] = faith;
        world.faiths.push(faith);
      }

      religion.faiths = faithsForReligion;
    }

    console.log(
      'buildWorldReligionsAndFaiths: built',
      worldReligions.filter(Boolean).length, 'religions and',
      worldFaiths.filter(Boolean).length, 'faiths.'
    );
  }


document.getElementById('relf-roll')?.addEventListener('click', () => {
  rollReligionsFaiths();
});

  // --- rendering hook (stack on top of any existing renderLevel patches) ---
  if(!window.__religionFaithRenderPatch){
    window.__religionFaithRenderPatch = true;
    const _renderLevelPrev = renderLevel; // capture whatever is current (may already be culture-patched)
    renderLevel = function(level){
      if(level!=='faith' && level!=='religion'){
        return _renderLevelPrev(level);
      }
      if(typeof label === 'undefined' || !label){
        // No Voronoi yet → fall back to provinces
        return _renderLevelPrev(currentLevel === level ? 'landProvinces' : currentLevel);
      }

      const Wloc=W, Hloc=H;
      const img = vctx.createImageData(Wloc,Hloc); const d=img.data;
      const ocean = oceanRGB();
      const oceanR=(ocean>>16)&255, oceanG=(ocean>>8)&255, oceanB=ocean&255;

      function colorForFaith(fid){
        if(fid<0 || !faithPalette.length) return 0x666666;
        return faithPalette[fid] ?? 0x666666;
      }
      function colorForReligion(rid){
        if(rid<0 || !religionPalette.length) return 0x666666;
        return religionPalette[rid] ?? 0x666666;
      }
      const isFaithMode = (level==='faith');

      for(let k=0;k<label.length;k++){
        const p=label[k];
        const i=k*4;
        if(p<0){ d[i]=17; d[i+1]=17; d[i+2]=17; d[i+3]=255; continue; }

        if(effMask[k]===0){
          d[i]=oceanR; d[i+1]=oceanG; d[i+2]=oceanB; d[i+3]=255; continue;
        }

        let col = 0x666666;
        if(provIsLand && provIsLand[p]===1 && provToFaith){
          const fid = provToFaith[p] ?? -1;
          if(isFaithMode){
            col = colorForFaith(fid);
          }else{
            const rid = (fid>=0 && faithToReligion) ? faithToReligion[fid] : -1;
            col = colorForReligion(rid);
          }
        }
        d[i]=(col>>16)&255; d[i+1]=(col>>8)&255; d[i+2]=col&255; d[i+3]=255;
      }

      if(showEdges.checked){
        function gidAt(ix){
          const p=label[ix]; if(p<0) return -2;
          if(effMask[ix]===0) return -3;
          if(!provToFaith) return -1;
          const fid = provToFaith[p] ?? -1;
          if(isFaithMode) return fid;
          const rid = (fid>=0 && faithToReligion) ? faithToReligion[fid] : -1;
          return rid;
        }
        for(let y=1;y<Hloc-1;y++){
          for(let x=1;x<Wloc-1;x++){
            const k=y*Wloc+x;
            const a=gidAt(k);
            const i=k*4;
            if(a!==gidAt(k-1) || a!==gidAt(k+1) || a!==gidAt(k-Wloc) || a!==gidAt(k+Wloc)){
              d[i]=0; d[i+1]=0; d[i+2]=0;
            }
          }
        }
      }

      vctx.putImageData(img,0,0);
      legend.textContent = isFaithMode ? `Faiths: ${faithCount||0}` : `Religions: ${religionCount||0}`;
    };
  }

  // --- recolor hook: reuse your Recolor button (like cultures) ---
  try{
    document.getElementById('recolor')?.addEventListener('click', ()=>{
      if(faithCount>0){
        faithPalette = makeUniquePalette(faithCount);
        if(currentLevel === 'faith') renderLevel('faith');
      }
      if(religionCount>0){
        religionPalette = makeUniquePalette(religionCount);
        if(currentLevel === 'religion') renderLevel('religion');
      }
    });
  }catch(_){}

})();


/**
 * Build CK3-style religions + faiths from the *current* rollReligionsFaiths()
 * state (provToFaith, faithToReligion, seeds, worldCultures, etc.)
 *
 * Call this AFTER rollReligionsFaiths().
 */
function revampedReligion() {
  if (typeof provToFaith === 'undefined' || typeof faithToReligion === 'undefined') {
    alert('revampedReligion: Faiths/Religions have not been rolled yet.');
    return;
  }
  if (typeof faithCount === 'undefined' || typeof religionCount === 'undefined') {
    alert('revampedReligion: faithCount/religionCount missing.');
    return;
  }
  if (!seeds || !seeds.length) {
    alert('revampedReligion: no seeds / provinces.');
    return;
  }

  const N = seeds.length;

  // --- 1) Build province lists per faith -----------------------------------
  const provsByFaith = Array.from({ length: faithCount }, () => []);
  for (let p = 0; p < N; p++) {
    const s = seeds[p];
    if (!s || !s.isLand) continue;
    const fIdx = provToFaith[p];
    if (fIdx == null || fIdx < 0 || fIdx >= faithCount) continue;
    provsByFaith[fIdx].push(p); // store seed index; you can map to province ID later
  }

  // --- 2) Build faith lists per religion -----------------------------------
  const religionToFaiths = Array.from({ length: religionCount }, () => []);
  for (let f = 0; f < faithCount; f++) {
    const rIdx = faithToReligion[f];
    if (rIdx == null || rIdx < 0 || rIdx >= religionCount) continue;
    religionToFaiths[rIdx].push(f);
  }

  // Reset global containers
  worldReligions = new Array(religionCount).fill(null);
  worldFaiths    = new Array(faithCount).fill(null);

  // Reset icon index pools
  resetReligionIndexes();
  resetFaithIndexes();

  // Make sure old "world" container exists if you still use it
  if (typeof world === 'undefined') {
    window.world = {};
  }
  if (!world.religions) world.religions = [];
  if (!world.faiths)    world.faiths    = [];

  // --- 3) For each religion index, build religion + its faiths -------------
  for (let rIdx = 0; rIdx < religionCount; rIdx++) {
    const fList = religionToFaiths[rIdx];
    if (!fList || fList.length === 0) continue; // empty religion cluster

    // Collect all provinces under this religion (union of its faiths)
    const allProvs = [];
    for (const f of fList) {
      const pf = provsByFaith[f];
      if (pf && pf.length) allProvs.push(...pf);
    }
    if (allProvs.length === 0) continue;

    // --- pick a dominant language from cultures in this religion -----------
    let language = null;
    if (typeof worldCultures !== 'undefined' && Array.isArray(worldCultures)) {
      const langCounts = new Map();
      for (const p of allProvs) {
        const s = seeds[p];
        if (!s) continue;
        const cIdx = (typeof s.cultureIndex === 'number')
          ? s.cultureIndex
          : (typeof provToCulture !== 'undefined' ? provToCulture[p] : -1);
        if (cIdx == null || cIdx < 0 || cIdx >= worldCultures.length) continue;
        const cObj = worldCultures[cIdx];
        if (!cObj || !cObj.language) continue;
        const L = cObj.language;
        langCounts.set(L, (langCounts.get(L) || 0) + 1);
      }
      let bestL = null, bestCount = 0;
      for (const [L, cnt] of langCounts.entries()) {
        if (cnt > bestCount) { bestCount = cnt; bestL = L; }
      }
      if (bestL) language = bestL;
    }
    if (!language) {
      if (typeof makeLanguage === 'function') {
        language = makeLanguage(consSet, vowelSet);
        console.log(language)
      } else {
        language = 'language_generic';
      }
    }

    // --- 4) Create religion object (overarching) ---------------------------
    const suff     = `religion_${rIdx}`;
    const relIndex = getNextReligionIndex();

    const doctrines = [
      chooseFrom(faithHeads),
      chooseFrom(faithGendered),
      chooseFrom(faithPluralism),
      chooseFrom(faithTheocracy),
      chooseFrom(faithConcubines),
      chooseFrom(faithDivorce),
      chooseFrom(faithConsan),
      chooseFrom(faithHomosexuality),
      chooseFrom(faithAdulteryMen),
      chooseFrom(faithAdulteryWomen),
      chooseFrom(faithKinslaying),
      chooseFrom(faithDeviancy),
      chooseFrom(faithWitchcraft),
      chooseFrom(faithClerical1),
      chooseFrom(faithClerical2),
      chooseFrom(faithClerical3),
      chooseFrom(faithClerical4),
      chooseFrom(faithPilgrimages),
      chooseFrom(funeralDoctrines)
    ];

    const religion = {
      // basic identity
      name: `${suff}_religion`,
      nameLoc: (typeof makeFaithName === 'function') ? makeFaithName(language) : `${suff}`,
      language,
      isPagan: "yes",

      // CK3-ish gfx fields
      graphical_faith: chooseFrom(graphicalFaithList),
      piety_icon_group: chooseFrom(pietyIconGroupList),
      doctrine_background_icon: "core_tenet_banner_pagan.dds",
      hostility_doctrine: "pagan_hostility_doctrine",

      // index for icon picker set
      relIndex,

      doctrines,
      virtueSins: [],
      custom_faith_icons: getCustomIconsForReligion(relIndex),
      holy_order_names: [
        "PLACEHOLDER",
        "PLACEHOLDER"
      ],
      holy_order_maa: chooseFrom(faithMAAS),
      faiths: [],

      // mapping back to rolled index
      rollReligionIndex: rIdx
    };

    // Old/new name forms
    religion.oldName     = `${religion.name}_old`;
    religion.oldNameLoc  = `Old ${religion.nameLoc}`;
    religion.oldNameAdj  = `${religion.name}_old_adj`;
    religion.oldNameAdjLoc = `Old ${religion.nameLoc}`;

    // virtues/sins triple-dip like old code
    pickUniqFromWithoutDelete(virtueSinPairs, religion.virtueSins);
    pickUniqFromWithoutDelete(virtueSinPairs, religion.virtueSins);
    pickUniqFromWithoutDelete(virtueSinPairs, religion.virtueSins);

    // Build localization object like old code
    if (typeof setReligionLocalization === 'function') {
      setReligionLocalization(religion);
    }

    worldReligions[rIdx] = religion;
    world.religions.push(religion);

    // --- 5) Create faiths (subs) for each faith index under this religion --
    const faithsForReligion = [];

    for (const fIdx of fList) {
      const provs = provsByFaith[fIdx] || [];
      const isFirstFaith = (faithsForReligion.length === 0);
      const faithIndex   = getNextFaithIndex(isFirstFaith);

      const fPref = `faith_${fIdx}`;
      const faithLang = language; // you could per-faith vary this if you want

      let fNameLoc = (typeof makeFaithName === 'function')
        ? makeFaithName(faithLang)
        : `${fPref}`;

      const randWord = (typeof makeRandomWord === 'function')
        ? makeRandomWord(faithLang)
        : 'Old';

      const faith = {
        icon:           `rel_fam${religion.relIndex}_faith${faithIndex}`,
        reformed_icon:  `rel_fam${religion.relIndex}_faith${faithIndex}`,
        religion,
        language:       faithLang,
        color:          `0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)}`,
        name:           `${fPref}_faith`,
        nameLoc:        fNameLoc,
        oldName:        `${fPref}_faith_old`,
        oldNameLoc:     `${randWord} ${fNameLoc}`,
        oldNameAdj:     `${fPref}_faith_old_adj`,
        oldNameAdjLoc:  `${randWord} ${fNameLoc}`,
        doctrines:      ["unreformed_faith_doctrine"],
        holySites:      [],
        holy_order_names: religion.holy_order_names,
        virtueSins:     religion.virtueSins,
        localization:   religion.localization,
        provinces:      provs.slice(),   // store seed indices for now
        rollFaithIndex: fIdx,
        religionIndex:  rIdx
      };

      // 3 random tenets
      pickUniqFromWithoutDelete(faithTenets, faith.doctrines);
      pickUniqFromWithoutDelete(faithTenets, faith.doctrines);
      pickUniqFromWithoutDelete(faithTenets, faith.doctrines);

      // Simple holy site selection: up to 6 distinct provinces for this faith
      if (provs.length && typeof pickUniqOrDiscard === 'function') {
        const hs = [];
        for (let k = 0; k < 6; k++) {
          pickUniqOrDiscard(provs, hs);
        }
        faith.holySites = hs;
      }

      faithsForReligion.push(faith);
      worldFaiths[fIdx] = faith;
      world.faiths.push(faith);
    }

    religion.faiths = faithsForReligion;
  }

  console.log('revampedReligion: built', worldReligions.filter(Boolean).length,
              'religions and', worldFaiths.filter(Boolean).length, 'faiths.');
}

