runBtn.addEventListener('click',()=>{
  if(!heightData || !effMask){alert('Load a heightmap first.');return}
  if(!seeds.length){alert('Place some seeds (auto-seed works well).');return}

  ensureSeedsCoverComponents();
  colorizeSeeds();

  const t0=performance.now(); setStatus('Voronoi: initializing…');
  const N=W*H;

  label = new Int32Array(N); label.fill(-1);
  const dist = new Float32Array(N); dist.fill(1e30);

  // If we have a genMask, pre-mark skipped pixels as "dead space"
  if (hasGenMask()) {
    for (let k=0;k<N;k++){
      if (genMask[k] === 0) {
        label[k] = -1;      // no province
        dist[k]  = 1e30;    // unreachable
      }
    }
  }

  const seedIsLand = new Uint8Array(seeds.length);
  for(let i=0;i<seeds.length;i++) seedIsLand[i]=seeds[i].isLand?1:0;

  const heap = makeMinHeap(N);

  // Push only seeds that are NOT in skipped region
  for(let i=0;i<seeds.length;i++){
    const s=seeds[i];
    const k=idx(s.x,s.y);
    if (k<0 || k>=N) continue;

    if (hasGenMask() && genMask[k]===0) continue; // ✅ ignore seeds in skipped area

    label[k]=i;
    dist[k]=0;
    heap.push(k,0);
  }

  const dirs=[
    [-1,0,1,0],[1,0,1,0],[0,-1,1,0],[0,1,1,0],
    [-1,-1,Math.SQRT2,1],[1,-1,Math.SQRT2,1],[-1,1,Math.SQRT2,1],[1,1,Math.SQRT2,1]
  ];

  let popped=0;
  while(!heap.empty()){
    const k = heap.pop(); popped++;
    const d0 = dist[k];
    const li = label[k];

    // If this pixel is skipped, never expand from it (paranoia guard)
    if (hasGenMask() && genMask[k]===0) continue;

    // If unlabeled somehow, don't expand
    if (li < 0) continue;

    const isLand = seedIsLand[li];
    const y = (k/W)|0; const x = k - y*W;

    for(let n=0;n<8;n++){
      const dx=dirs[n][0], dy=dirs[n][1], cost=dirs[n][2], diag=dirs[n][3];
      const nx=x+dx, ny=y+dy;
      if(nx<0||ny<0||nx>=W||ny>=H) continue;
      const nk = ny*W+nx;

      // ✅ NEVER enter skipped region
      if (hasGenMask() && genMask[nk]===0) continue;

      // honor effective barrier (land-vs-sea)
      if(effMask[nk]!==isLand) continue;

      // diagonal corner-cut prevention ALSO must respect skip
      if(diag){
        const kSide1 = y*W + nx;
        const kSide2 = ny*W + x;
        if (hasGenMask() && (genMask[kSide1]===0 || genMask[kSide2]===0)) continue;
        if(effMask[kSide1]!==isLand || effMask[kSide2]!==isLand) continue;
      }

      const nd = d0 + cost;
      if(nd < dist[nk]){
        dist[nk]=nd;
        label[nk]=li;
        heap.push(nk,nd);
      }
    }

    if((popped&0x3fff)===0) setStatus(`Relaxing… ${((popped/N)*100).toFixed(1)}%`);
  }

  // Keep these, but they MUST NOT touch skipped region.
  // repairUnlabeled/collapseDiagonalIslands currently don't know genMask, so add a cheap guard:
  // (If you want, I can rewrite them properly, but this works well enough.)
  if (hasGenMask()) {
    // Temporarily mark skipped pixels as "already labeled" so repair doesn't fill them
    for (let k=0;k<N;k++){
      if (genMask[k]===0) label[k] = -2; // sentinel: "do not touch"
    }
    repairUnlabeled(label);
    collapseDiagonalIslands(label);
    // restore to -1 for "no province"
    for (let k=0;k<N;k++){
      if (genMask[k]===0) label[k] = -1;
    }
  } else {
    repairUnlabeled(label);
    collapseDiagonalIslands(label);
  }

  const beforeFillMissing = performance.now();
  // IMPORTANT: use the patched version that skips genMask==0 (the one I sent you)
  const filled = assignUnlabeledEffLandByGlobalNearestSeed(label);
  const afterFillMissing  = performance.now();

  const t1=performance.now();
  const mergeMsg = filled>0 ? ` Merged ${filled} tiny-island pixels to nearest provinces.` : ` No tiny-island merges needed.`;
  setStatus(`Voronoi ${(t1-t0).toFixed(0)} ms. Post-merge ${(afterFillMissing-beforeFillMissing).toFixed(0)} ms.${mergeMsg} Building titles…`);

  buildHierarchy();
  renderLevel(currentLevel);
  setStatus(`Done. Provinces: ${seeds.length}. Counties: ${countyCount}. Duchies: ${duchyCount}. Kingdoms: ${kingdomCount}. Empires: ${empireCount}.`);

  // (rest of your post-run code unchanged)
  // ...
});
