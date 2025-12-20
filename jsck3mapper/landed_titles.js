  // ===== Export 00_landed_titles.txt (unchanged logic) =====
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

      const provIdBySeed = new Int32Array(seeds.length).fill(-1);
      for(let i=0;i<landIdx.length;i++) provIdBySeed[landIdx[i]] = i+1;

      const countyCnt = countyPalette.length, duchyCnt = duchyPalette.length,
            kingdomCnt = kingdomPalette.length, empireCnt = empirePalette.length;

      const counties = Array.from({length: countyCnt}, ()=>({ provs:[] }));
      const duchies  = Array.from({length: duchyCnt }, ()=>({ counties:new Set() }));
      const kingdoms = Array.from({length: kingdomCnt}, ()=>({ duchies:new Set() }));
      const empires  = Array.from({length: empireCnt}, ()=>({ kingdoms:new Set() }));

      for(let p=0;p<seeds.length;p++){
        if(!seeds[p].isLand) continue;
        const c = provToCounty[p], d = provToDuchy[p], k = provToKingdom[p], e = provToEmpire[p];
        if(c>=0) counties[c].provs.push(p);
        if(d>=0 && c>=0) duchies[d].counties.add(c);
        if(k>=0 && d>=0) kingdoms[k].duchies.add(d);
        if(e>=0 && k>=0) empires[e].kingdoms.add(k);
      }

      const rgbFromInt = (c)=>[(c>>16)&255, (c>>8)&255, c&255];
      const nameFromRGB = ([R,G,B])=>`R${R}G${G}B${B}`;
      const colorBlock = ([R,G,B])=>`{ ${R} ${G} ${B} }`;
      const sorted = (iter)=> Array.from(iter).sort((a,b)=>a-b);

      const countyName  = (cid)=> nameFromRGB(rgbFromInt(countyPalette[cid]));
      const duchyName   = (did)=> nameFromRGB(rgbFromInt(duchyPalette[did]));
      const kingdomName = (kid)=> nameFromRGB(rgbFromInt(kingdomPalette[kid]));
      const empireName  = (eid)=> nameFromRGB(rgbFromInt(empirePalette[eid]));

      const countyRGB   = (cid)=> rgbFromInt(countyPalette[cid]);
      const duchyRGB    = (did)=> rgbFromInt(duchyPalette[did]);
      const kingdomRGB  = (kid)=> rgbFromInt(kingdomPalette[kid]);
      const empireRGB   = (eid)=> rgbFromInt(empirePalette[eid]);

      const provRGBFromSeed = (pIdx)=> rgbFromInt(seeds[pIdx]?.color ?? 0x444444);
      const baronyNameFromProv = (pIdx)=> nameFromRGB(provRGBFromSeed(pIdx));

      function firstCountyInDuchy(d){
        // pick first non-empty county in duchy
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

      for(let e=0; e<empireCnt; e++){
        const kList = sorted(empires[e].kingdoms);
        if(kList.length===0) continue;

        const eRGB = empireRGB(e);
        const eName = empireName(e);
        const eColor = colorBlock(eRGB);

        const firstK = kList[0];
        const eCapCountyId = firstCountyInKingdom(firstK);
        const eCapital = (eCapCountyId!=null) ? `c_${countyName(eCapCountyId)}` : `c_${kingdomName(firstK)}`;

        push(`e_${eName} = {`);
        push(`  color = ${eColor}`);
        push(`  capital = ${eCapital}`);

        for(const k of kList){
          const dList = sorted(kingdoms[k].duchies);
          if(dList.length===0) continue;

          const kRGB = kingdomRGB(k);
          const kName = kingdomName(k);
          const kColor = colorBlock(kRGB);

          const kCapCountyId = firstCountyInKingdom(k);
          const kCapital = (kCapCountyId!=null) ? `c_${countyName(kCapCountyId)}` : `c_${kName}`;

          push(`  k_${kName} = {`);
          push(`    color = ${kColor}`);
          push(`    capital = ${kCapital}`);

          for(const d of dList){
            const cListAll = sorted(duchies[d].counties);
            const cList = cListAll.filter(cid => counties[cid].provs.length>0);
            if(cList.length===0) continue;

            const dRGB = duchyRGB(d);
            const dName = duchyName(d);
            const dColor = colorBlock(dRGB);
            const duchyCap = `c_${countyName(cList[0])}`;

            push(`    d_${dName} = {`);
            push(`      color = ${dColor}`);
            push(`      capital = ${duchyCap}`);

            for(const c of cList){
              const cRGB = countyRGB(c);
              const cName = countyName(c);
              const cColor = colorBlock(cRGB);
              const provs = counties[c].provs.slice();

              if(!firstCountyGlobal) firstCountyGlobal = `c_${cName}`;

              push(`      c_${cName} = {`);
              push(`        color = ${cColor}`);

              for(const pIdx of provs){
                const pId = provIdBySeed[pIdx];
                if(pId < 1) continue;
                const bName = baronyNameFromProv(pIdx);
                push(`        b_${bName} = {`);
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

      const ck2Cap = firstCountyGlobal || 'c_R91G158B71';
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