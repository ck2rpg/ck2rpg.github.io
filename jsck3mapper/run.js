runBtn.addEventListener('click',()=>{
  if(!heightData || !effMask){alert('Load a heightmap first.');return}
  if(!seeds.length){alert('Place some seeds (auto-seed works well).');return}

  ensureSeedsCoverComponents();
  colorizeSeeds();

  const t0=performance.now(); setStatus('Voronoi: initializing…');
  const N=W*H;

  label = new Int32Array(N); label.fill(-1);
  const dist = new Float32Array(N); dist.fill(1e30);
  const seedIsLand = new Uint8Array(seeds.length);
  for(let i=0;i<seeds.length;i++) seedIsLand[i]=seeds[i].isLand?1:0;

  const heap = makeMinHeap(N);
  for(let i=0;i<seeds.length;i++){
    const s=seeds[i]; const k=idx(s.x,s.y);
    label[k]=i; dist[k]=0; heap.push(k,0);
  }

  const dirs=[[-1,0,1,0],[1,0,1,0],[0,-1,1,0],[0,1,1,0],[-1,-1,Math.SQRT2,1],[1,-1,Math.SQRT2,1],[-1,1,Math.SQRT2,1],[1,1,Math.SQRT2,1]];

  let popped=0;
  while(!heap.empty()){
    const k = heap.pop(); popped++;
    const d0 = dist[k];
    const li = label[k];
    const isLand = seedIsLand[li];
    const y = (k/W)|0; const x = k - y*W;
    for(let n=0;n<8;n++){
      const dx=dirs[n][0], dy=dirs[n][1], cost=dirs[n][2], diag=dirs[n][3];
      const nx=x+dx, ny=y+dy;
      if(nx<0||ny<0||nx>=W||ny>=H) continue;
      const nk = ny*W+nx;
      if(effMask[nk]!==isLand) continue; // honor effective barrier
      if(diag){
        const kSide1 = y*W + nx;
        const kSide2 = ny*W + x;
        if(effMask[kSide1]!==isLand || effMask[kSide2]!==isLand) continue;
      }
      const nd = d0 + cost;
      if(nd < dist[nk]){
        dist[nk]=nd; label[nk]=li; heap.push(nk,nd);
      }
    }
    if((popped&0x3fff)===0) setStatus(`Relaxing… ${((popped/N)*100).toFixed(1)}%`);
  }

  repairUnlabeled(label);
  collapseDiagonalIslands(label);

  const beforeFillMissing = performance.now();
  // Only merge unlabeled *effective* land; if tinyAsSea is on, no tiny land remains.
  const filled = assignUnlabeledEffLandByGlobalNearestSeed(label);
  const afterFillMissing  = performance.now();

  const t1=performance.now();
  const mergeMsg = filled>0 ? ` Merged ${filled} tiny-island pixels to nearest provinces.` : ` No tiny-island merges needed.`;
  setStatus(`Voronoi ${(t1-t0).toFixed(0)} ms. Post-merge ${(afterFillMissing-beforeFillMissing).toFixed(0)} ms.${mergeMsg} Building titles…`);
  buildHierarchy();
  renderLevel(currentLevel);
  setStatus(`Done. Provinces: ${seeds.length}. Counties: ${countyCount}. Duchies: ${duchyCount}. Kingdoms: ${kingdomCount}. Empires: ${empireCount}.`);

  // --- Auto-click culture + religion roll buttons ---
  const cultBtn = document.getElementById('cult-roll');
  const relfBtn = document.getElementById('relf-roll');
  const tscBtn  = document.getElementById('tsc-apply')

  // --- Auto-prune empires and kingdoms (min 3 children, parent-safe) ---
  const pruneTierSel   = document.getElementById('tp2-tier');
  const pruneMinInput  = document.getElementById('tp2-min');
  const pruneRepeatBox = document.getElementById('tp2-repeat');
  const pruneParentBox = document.getElementById('tp2-parent');
  const pruneBtn       = document.getElementById('tp2-apply');

  setTimeout(()=>{
    cultBtn?.click();
    relfBtn?.click();
    tscBtn?.click();

    // Step 2: single-pass prune at empire and kingdom level
    if (pruneTierSel && pruneMinInput && pruneRepeatBox && pruneParentBox && pruneBtn) {
      pruneMinInput.value = '3';
      pruneRepeatBox.checked = false;   // "once"
      pruneParentBox.checked = true;    // respect parent boundaries

      // First prune empires (ensure each has >= 3 kingdoms)
      pruneTierSel.value = 'empire';
      pruneBtn.click();

      // Then prune kingdoms (ensure each has >= 3 duchies)
      pruneTierSel.value = 'kingdom';
      pruneBtn.click();

      pruneMinInput.value = '2';
      pruneTierSel.value = 'duchy';
      pruneBtn.click();
    }

    const { counties, duchies, kingdoms, empires } = buildContainers();

    // --- NEW: assign hierarchical IDs to each *land* seed (province) ---
    // Clear any old ids first (optional but tidy)
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      if (!s) continue;
      s.countyIndex  = s.countyId  = null;
      s.duchyIndex   = s.duchyId   = null;
      s.kingdomIndex = s.kingdomId = null;
      s.empireIndex  = s.empireId  = null;
    }

    // Counties -> provinces
    for (let cid = 0; cid < counties.length; cid++) {
      const cObj = counties[cid];
      const provs = cObj.provs || [];
      for (const p of provs) {
        const s = seeds[p];
        if (!s || !s.isLand) continue;
        s.countyIndex = cid;
        s.countyId    = `county_${cid}`;
      }
    }

    // Duchies -> provinces (via their counties)
    for (let did = 0; did < duchies.length; did++) {
      const dObj = duchies[did];
      const cList = dObj.counties || [];
      for (const cid of cList) {
        const cObj = counties[cid];
        if (!cObj) continue;
        const provs = cObj.provs || [];
        for (const p of provs) {
          const s = seeds[p];
          if (!s || !s.isLand) continue;
          s.duchyIndex = did;
          s.duchyId    = `duchy_${did}`;
        }
      }
    }

    // Kingdoms -> provinces (via duchies -> counties)
    for (let kid = 0; kid < kingdoms.length; kid++) {
      const kObj = kingdoms[kid];
      const dList = kObj.duchies || [];
      for (const did of dList) {
        const dObj = duchies[did];
        if (!dObj) continue;
        const cList = dObj.counties || [];
        for (const cid of cList) {
          const cObj = counties[cid];
          if (!cObj) continue;
          const provs = cObj.provs || [];
          for (const p of provs) {
            const s = seeds[p];
            if (!s || !s.isLand) continue;
            s.kingdomIndex = kid;
            s.kingdomId    = `kingdom_${kid}`;
          }
        }
      }
    }

    // Empires -> provinces (via kingdoms -> duchies -> counties)
    for (let eid = 0; eid < empires.length; eid++) {
      const eObj = empires[eid];
      const kList = eObj.kingdoms || [];
      for (const kid of kList) {
        const kObj = kingdoms[kid];
        if (!kObj) continue;
        const dList = kObj.duchies || [];
        for (const did of dList) {
          const dObj = duchies[did];
          if (!dObj) continue;
          const cList = dObj.counties || [];
          for (const cid of cList) {
            const cObj = counties[cid];
            if (!cObj) continue;
            const provs = cObj.provs || [];
            for (const p of provs) {
              const s = seeds[p];
              if (!s || !s.isLand) continue;
              s.empireIndex = eid;
              s.empireId    = `empire_${eid}`;
            }
          }
        }
      }
    }
    // --- END NEW ASSIGNMENT BLOCK ---

    annotateWaterTypes_BFSWaterbodies({
    seeds,
    label,
    W,
    H,
    // provIsLand, // optional
    oceanRel: 0.20,
    oceanAbsMin: 50,
    });

    // Counties
    worldCounties = counties.map((cObj, cid) => {
      const group = {
        id: `county_${cid}`,
        type: 'county',
        provinces: cObj.provs.slice(), // province indices
      };
      annotateGroupingWithGeoStats(group);
      deriveExtendedGeoInferences(group);
      return group;
    });

    // Duchies
    worldDuchies = duchies.map((dObj, did) => {
      // Gather all provinces for the duchy from its counties
      const provs = [];
      dObj.counties.forEach(cid => {
        provs.push(...counties[cid].provs);
      });
      const group = {
        id: `duchy_${did}`,
        type: 'duchy',
        provinces: provs,
      };
      annotateGroupingWithGeoStats(group);
      deriveExtendedGeoInferences(group);
      return group;
    });

    // Kingdoms
    worldKingdoms = kingdoms.map((kObj, kid) => {
      const provs = [];
      kObj.duchies.forEach(did => {
        duchies[did].counties.forEach(cid => {
          provs.push(...counties[cid].provs);
        });
      });
      const group = {
        id: `kingdom_${kid}`,
        type: 'kingdom',
        provinces: provs,
      };
      annotateGroupingWithGeoStats(group);
      deriveExtendedGeoInferences(group);
      return group;
    });

    // Empires
    worldEmpires = empires.map((eObj, eid) => {
      const provs = [];
      eObj.kingdoms.forEach(kid => {
        kingdoms[kid].duchies.forEach(did => {
          duchies[did].counties.forEach(cid => {
            provs.push(...counties[cid].provs);
          });
        });
      });
      const group = {
        id: `empire_${eid}`,
        type: 'empire',
        provinces: provs,
      };
      annotateGroupingWithGeoStats(group);
      deriveExtendedGeoInferences(group);
      return group;
    });

    console.log(seeds);
    buildWorldTitles()
    assignPlaceNamesToTitles()
    annotateAllTitles(worldTitles)
    console.log(worldHeritages)
    ensureHeritageEthnicities()
    assignCultureEthnicitiesFromHeritages()
  }, 50);
});

