// ===== Export 00_landed_titles.txt (numeric keys instead of color-based) =====
function exportLandedTitles(){
  try{
    if(!seeds.length) return alert('No provinces found. Seed the map and run Voronoi first.');
    if(!provToCounty || !provToDuchy || !provToKingdom || !provToEmpire)
      return alert('Hierarchy not built yet. Click "Run Barrier-Voronoi" first.');
    if(!countyPalette.length || !duchyPalette.length || !kingdomPalette.length || !empirePalette.length)
      return alert('Palettes missing. Run Voronoi first.');

    const landIdx = [];
    for(let i=0;i<seeds.length;i++) if(seeds[i].isLand) landIdx.push(i);
    if(landIdx.length===0) return alert('No land provinces to export.');

    // Province IDs: land-first numbering, as before
    const provIdBySeed = new Int32Array(seeds.length).fill(-1);
    for(let i=0;i<landIdx.length;i++) provIdBySeed[landIdx[i]] = i+1;

    const countyCnt  = countyPalette.length,
          duchyCnt   = duchyPalette.length,
          kingdomCnt = kingdomPalette.length,
          empireCnt  = empirePalette.length;

    const counties = Array.from({length: countyCnt }, ()=>({ provs:[] }));
    const duchies  = Array.from({length: duchyCnt  }, ()=>({ counties:new Set() }));
    const kingdoms = Array.from({length: kingdomCnt}, ()=>({ duchies:new Set() }));
    const empires  = Array.from({length: empireCnt }, ()=>({ kingdoms:new Set() }));

    // Build hierarchy connections
    for(let p=0;p<seeds.length;p++){
      if(!seeds[p].isLand) continue;
      const c = provToCounty[p],
            d = provToDuchy[p],
            k = provToKingdom[p],
            e = provToEmpire[p];

      if(c>=0) counties[c].provs.push(p);
      if(d>=0 && c>=0) duchies[d].counties.add(c);
      if(k>=0 && d>=0) kingdoms[k].duchies.add(d);
      if(e>=0 && k>=0) empires[e].kingdoms.add(k);
    }

    // --- Colors (unchanged) --------------------------------------------------
    const rgbFromInt = (c)=>[(c>>16)&255, (c>>8)&255, c&255];
    const colorBlock = ([R,G,B])=>`{ ${R} ${G} ${B} }`;
    const sorted = (iter)=> Array.from(iter).sort((a,b)=>a-b);

    const countyRGB   = (cid)=> rgbFromInt(countyPalette[cid]);
    const duchyRGB    = (did)=> rgbFromInt(duchyPalette[did]);
    const kingdomRGB  = (kid)=> rgbFromInt(kingdomPalette[kid]);
    const empireRGB   = (eid)=> rgbFromInt(empirePalette[eid]);

    // --- Numeric title keys --------------------------------------------------
    const empireKey  = (eid)=> `e_${eid+1}`;
    const kingdomKey = (kid)=> `k_${kid+1}`;
    const duchyKey   = (did)=> `d_${did+1}`;
    const countyKey  = (cid)=> `c_${cid+1}`;
    const baronyKey  = (provId)=> `b_${provId}`;

    function firstCountyInDuchy(d){
      const cList = sorted(duchies[d].counties);
      return cList.find(cid => counties[cid].provs.length>0);
    }
    function firstCountyInKingdom(k){
      const dList = sorted(kingdoms[k].duchies);
      for(const d of dList){
        const c = firstCountyInDuchy(d);
        if(c!=null) return c;
      }
      return null;
    }

    const lines = [];
    const push = (s='')=>lines.push(s);

    let firstCountyGlobal = null;

    // --- Build landed_titles tree -------------------------------------------
    for(let e=0; e<empireCnt; e++){
      const kList = sorted(empires[e].kingdoms);
      if(kList.length===0) continue;

      const eRGB   = empireRGB(e);
      const eColor = colorBlock(eRGB);
      const eTag   = empireKey(e);

      const firstK = kList[0];
      const eCapCountyId = firstCountyInKingdom(firstK);
      const eCapital = (eCapCountyId!=null)
        ? countyKey(eCapCountyId)   // county tag
        : countyKey(firstK);        // fallback: use kingdom index treated as county (rare)

      push(`${eTag} = {`);
      push(`  color = ${eColor}`);
      push(`  capital = ${eCapital}`);

      for(const k of kList){
        const dList = sorted(kingdoms[k].duchies);
        if(dList.length===0) continue;

        const kRGB   = kingdomRGB(k);
        const kColor = colorBlock(kRGB);
        const kTag   = kingdomKey(k);

        const kCapCountyId = firstCountyInKingdom(k);
        const kCapital = (kCapCountyId!=null)
          ? countyKey(kCapCountyId)
          : countyKey(k); // fallback

        push(`  ${kTag} = {`);
        push(`    color = ${kColor}`);
        push(`    capital = ${kCapital}`);

        for(const d of dList){
          const cListAll = sorted(duchies[d].counties);
          const cList = cListAll.filter(cid => counties[cid].provs.length>0);
          if(cList.length===0) continue;

          const dRGB   = duchyRGB(d);
          const dColor = colorBlock(dRGB);
          const dTag   = duchyKey(d);
          const duchyCap = countyKey(cList[0]);

          push(`    ${dTag} = {`);
          push(`      color = ${dColor}`);
          push(`      capital = ${duchyCap}`);

          for(const c of cList){
            const cRGB   = countyRGB(c);
            const cColor = colorBlock(cRGB);
            const cTag   = countyKey(c);
            const provs  = counties[c].provs.slice();

            if(!firstCountyGlobal) firstCountyGlobal = cTag;

            push(`      ${cTag} = {`);
            push(`        color = ${cColor}`);

            for(const pIdx of provs){
              const pId = provIdBySeed[pIdx];
              if(pId < 1) continue;

              const bTag = baronyKey(pId);

              push(`        ${bTag} = {`);
              push(`          province = ${pId}`);
              push(`          color = ${cColor}`);
              push(`        }`);
            }

            push(`      }`);
          }

          push(`    }`);
        }

        push(`  }`);
      }

      push(`}`);
    }

    // CK2RPG special title block (unchanged except capital key)
    const ck2Cap = firstCountyGlobal || countyKey(0);
    push('');
    push(`d_ck2rpg = {`);
    push(`    color = { 100 100 100 }`);
    push(`\tcapital = ${ck2Cap}`);
    push(`\tdefinite_form = yes`);
    push(`\tlandless = yes`);
    push(`\trequire_landless = yes`);
    push(`\truler_uses_title_name = no`);
    push(`\tno_automatic_claims = yes`);
    push(`\tdestroy_if_invalid_heir = yes`);
    push(`\tai_primary_priority = { add = @never_primary_score }`);
    push(`}`);

    const txt = lines.join('\n');
    const blob = new Blob([txt], {type:'text/plain;charset=utf-8;'});
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '00_landed_titles.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setStatus(`Exported 00_landed_titles.txt (${lines.length} lines).`);
  }catch(err){
    console.error(err);
    alert('Failed to export 00_landed_titles.txt (see console).');
  }
}
dlLTBtn.addEventListener('click', exportLandedTitles);
