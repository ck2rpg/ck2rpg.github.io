  
  function setStatus(msg){ statusEl.textContent=msg }
  function clamp(v,a,b){ return v<a?a:v>b?b:v }
  function idx(x,y){ return y*W+x }
  function rng(){ return Math.random() }
  function oceanRGB(){ return 0x0a2236 }
  function updateSeaLabel(){
    seaVal.textContent = invertMask.checked
      ? `thr ${sea.value} (dark=land)` : `thr ${sea.value} (bright=land)`
  }
  function shuffle(a){ for(let i=a.length-1;i>0;--i){ const j=(rng()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } }
  function makeUniquePalette(n){
    const out=new Array(n); let x=((rng()*0xFFFFFF)|1)&0xFFFFFF;
    for(let i=0;i<n;i++){
      x^=(x<<5)&0xFFFFFF; x^=(x>>>7); x^=(x<<3)&0xFFFFFF;
      let y=x&0xFFFFFF; let r=(y>>>16)&255,g=(y>>>8)&255,b=y&255;
      r=(r*149+37)&255; g=(g*131+53)&255; b=(b*197+17)&255;
      out[i]=(g<<16)|(b<<8)|r;
    } return out;
  }
  function setPreviewSize(maxW = 1400, minW = 400){
    if(!W || !H) return;
    const cssW = Math.min(maxW, Math.max(minW, W));
    const cssH = Math.round(cssW * H / W);
    view.style.width  = cssW + 'px';
    view.style.height = cssH + 'px';
    drawScale = cssW / W;
  }



  function computeMask(){
    if(!heightData) return;
    const thr = +sea.value|0;
    landMask = new Uint8Array(W*H);
    const inv = invertMask.checked;
    for(let i=0;i<landMask.length;i++){
      const isLand = inv ? (heightData[i] <= thr) : (heightData[i] >= thr);
      landMask[i] = isLand ? 1 : 0;
    }
    // components on original land mask
    ({compId:landCompId, compSize:landCompSize, count:landCompCount} = labelComponents(landMask,1));
    rebuildEffectiveMask(); // builds effMask and updates preview
  }


  function rebuildEffectiveMask(){
  const thr = Math.max(0,(+minIslandPxIn.value|0));
  const treatAsSea = !!tinyAsSea.checked;

  effMask = new Uint8Array(W*H);

  if(treatAsSea){
    // tiny land components become sea in effective mask
    for(let k=0;k<effMask.length;k++){
      if(landMask[k]===1){
        const cid = landCompId[k];
        effMask[k] = (cid>=0 && landCompSize[cid] < thr) ? 0 : 1;
      }else{
        effMask[k] = 0;
      }
    }
  }else{
    effMask.set(landMask);
  }

  // --- Build genMask from optional province map (black=generate, other=skip) ---
  // NOTE: do NOT convert skipped into sea; keep it separate.
  if (window.optionalProvAllowMask && window.optionalProvAllowMask.length === W*H) {
    // optionalProvAllowMask: 1=allowed (black), 0=skipped
    genMask = window.optionalProvAllowMask;
  } else {
    genMask = null; // means "generate everywhere"
  }

  // components on effective LAND mask *within genMask only*
  // Build a masked land array for component labeling:
  const effLandOnly = new Uint8Array(W*H);
  if(hasGenMask()){
    for(let k=0;k<effLandOnly.length;k++){
      effLandOnly[k] = (genMask[k]===1 && effMask[k]===1) ? 1 : 0;
    }
  } else {
    // no genMask -> land is just effMask
    effLandOnly.set(effMask);
  }

  ({compId:effCompId, compSize:effCompSize, count:effCompCount} = labelComponents(effLandOnly, 1));

  // draw mask preview (effective land within generate area)
  const md = mctx.createImageData(W,H);
  const d = md.data;
  for(let i=0;i<effLandOnly.length;i++){
    const v = effLandOnly[i] ? 255 : 0;
    const k=i*4; d[k]=v; d[k+1]=v; d[k+2]=v; d[k+3]=255;
  }
  mctx.putImageData(md,0,0);

  // Rerender
  label=null;
  resetHierarchy();
  renderPreview();
}


  sea.addEventListener('input',()=>{updateSeaLabel(); computeMask();});
  invertMask.addEventListener('change',()=>{updateSeaLabel(); computeMask();});
  minIslandPxIn.addEventListener('input', rebuildEffectiveMask);
  tinyAsSea.addEventListener('change', rebuildEffectiveMask);
  updateSeaLabel();

  // ===== Components =====
  function labelComponents(maskArr, maskVal){
    const compId=new Int32Array(W*H).fill(-1);
    const compSize=[];
    let count=0;
    const qx=new Int32Array(W*H);
    const qy=new Int32Array(W*H);
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const k=y*W+x;
        if(maskArr[k]!==maskVal || compId[k]!==-1) continue;
        const id=count++; let size=0;
        let qh=0, qt=0;
        qx[qt]=x; qy[qt]=y; qt++;
        compId[k]=id; size++;
        while(qh<qt){
          const cx=qx[qh], cy=qy[qh]; qh++;
          const ck=cy*W+cx;
          if(cx>0){
            const nk=ck-1;
            if(maskArr[nk]===maskVal && compId[nk]===-1){ compId[nk]=id; qx[qt]=cx-1; qy[qt]=cy; qt++; size++; }
          }
          if(cx<W-1){
            const nk=ck+1;
            if(maskArr[nk]===maskVal && compId[nk]===-1){ compId[nk]=id; qx[qt]=cx+1; qy[qt]=cy; qt++; size++; }
          }
          if(cy>0){
            const nk=ck-W;
            if(maskArr[nk]===maskVal && compId[nk]===-1){ compId[nk]=id; qx[qt]=cx; qy[qt]=cy-1; qt++; size++; }
          }
          if(cy<H-1){
            const nk=ck+W;
            if(maskArr[nk]===maskVal && compId[nk]===-1){ compId[nk]=id; qx[qt]=cx; qy[qt]=cy+1; qt++; size++; }
          }
        }
        compSize[id]=size;
      }
    }
    return { compId, compSize, count };
  }

  function isTinyIslandPixelOriginal(k){
    if(!landMask || landMask[k]===0 || !landCompId) return false;
    const cid = landCompId[k];
    if(cid<0) return false;
    const thr = Math.max(0, (+minIslandPxIn.value|0));
    return landCompSize[cid] < thr;
  }

// ===== Optional province mask helpers (black = generate, non-black = skip) ===
function hasOptionalProvMask(){
  return window.optionalProvAllowMask && window.optionalProvAllowMask.length === W*H;
}
function isAllowedProvAt(k){
  // Allowed = black on uploaded optional map
  if(!hasOptionalProvMask()) return true;
  return window.optionalProvAllowMask[k] === 1;
}
function isSkippedProvAt(k){
  // Skipped = non-black on uploaded optional map
  return hasOptionalProvMask() && window.optionalProvAllowMask[k] === 0;
}

  // ===== Seeding =====
  // ===== Optional Province "Generate Area" mask =====
// genMask[k] = 1 -> generate provinces here
// genMask[k] = 0 -> skip entirely (no land/sea voronoi, no seeds, label=-1)
let genMask = null;

function hasGenMask(){ return genMask && genMask.length === W*H; }
function isGenAt(k){ return !hasGenMask() ? 1 : genMask[k]; } // default allow everywhere
function isEffLandAt(k){
  if(!effMask) return false;
  if(hasGenMask() && genMask[k]===0) return false; // skipped area counts as nothing
  return effMask[k]===1;
}

function isEffSeaAt(k){
  if(!effMask) return false;
  if(hasGenMask() && genMask[k]===0) return false; // skipped area counts as nothing
  return effMask[k]===0;
}


autoSeedsBtn.addEventListener('click',()=>{
  if(!effMask){alert('Load a heightmap first.');return}

  const landTarget = +landSeedsIn.value|0;
  const seaTarget  = +seaSeedsIn.value|0;
  const cs = clamp(+cellSizeIn.value|0,4,512);

  seeds = [];

  function sampleMask(target, wantLand){
    const cols = Math.max(1,Math.floor(W/cs));
    const rows = Math.max(1,Math.floor(H/cs));
    const cells=[];

    for(let gy=0; gy<rows; gy++){
      for(let gx=0; gx<cols; gx++){
        const x0=gx*cs, y0=gy*cs;
        let any=false;

        for(let y=y0; y<Math.min(y0+cs,H); y+=Math.max(1,cs>>2)){
          for(let x=x0; x<Math.min(x0+cs,W); x+=Math.max(1,cs>>2)){
            const k=idx(x,y);
            if(hasGenMask() && genMask[k]===0) continue; // SKIP REGION
            const ok = wantLand ? isEffLandAt(k) : isEffSeaAt(k);
            if(ok){ any=true; break; }
          }
          if(any) break;
        }
        if(any) cells.push([gx,gy]);
      }
    }

    shuffle(cells);
    const take = Math.min(target, cells.length);
    let idBase = seeds.length;

    for(let i=0;i<take;i++){
      const [gx,gy]=cells[i];
      let tries=0, sx=0, sy=0;

      do{
        sx = clamp((gx*cs + (rng()*cs)|0),0,W-1);
        sy = clamp((gy*cs + (rng()*cs)|0),0,H-1);
        tries++;
        const k = idx(sx,sy);
        if(hasGenMask() && genMask[k]===0) continue; // SKIP REGION
        const ok = wantLand ? isEffLandAt(k) : isEffSeaAt(k);
        if(ok) break;
      } while(tries<80);

      const k = idx(sx,sy);
      if(!(hasGenMask() && genMask[k]===0)){
        const ok = wantLand ? isEffLandAt(k) : isEffSeaAt(k);
        if(ok){
          seeds.push({x:sx,y:sy,isLand:wantLand,id:idBase,color:0});
          idBase++;
        }
      }
    }
  }

  sampleMask(landTarget,true);
  sampleMask(seaTarget,false);

  colorizeSeeds();
  label=null;
  resetHierarchy();
  renderPreview();

  setStatus(`Placed ${seeds.filter(s=>s.isLand).length} land + ${seeds.filter(s=>!s.isLand).length} sea seeds.` + (hasGenMask() ? ' Optional province mask ON.' : ''));
});




  clearSeedsBtn.addEventListener('click',()=>{
    seeds=[]; label=null; palette=[]; resetHierarchy(); renderPreview(); legend.textContent='';
    setStatus('Seeds cleared.');
  });

  // Click to add/remove seeds
  view.addEventListener('click',(e)=>{
    if(!effMask){return}
    const rect=view.getBoundingClientRect();
    const x = clamp(Math.floor((e.clientX-rect.left) * W / rect.width),0,W-1);
    const y = clamp(Math.floor((e.clientY-rect.top ) * H / rect.height),0,H-1);
    const k = idx(x,y);
    const effIsLand = isEffLandAt(k);

    if(e.shiftKey){
      let bd=9999,bi=-1;
      for(let i=0;i<seeds.length;i++){
        const s=seeds[i]; const dx=s.x-x, dy=s.y-y; const d=dx*dx+dy*dy;
        if(d<bd){bd=d;bi=i}
      }
      if(bi>=0 && bd<=100){ seeds.splice(bi,1); setStatus('Removed seed.'); resetHierarchy(); renderPreview(); return; }
    } else {
      // If tinyAsSea is OFF, block land seeding on tiny islands (based on original mask/components)
      if(!tinyAsSea.checked && landMask[k]===1 && isTinyIslandPixelOriginal(k)){
        setStatus('Tiny island under threshold: land seed blocked. Enable “Treat tiny islands as sea” or place on larger land.');
        return;
      }
      seeds.push({
        x, y,
        isLand: effIsLand,
        id: seeds.length,
        color: 0,
        terrain: getTerrainAt(x, y)
    });
      colorizeSeeds(); resetHierarchy(); renderPreview();
      setStatus(`Added ${effIsLand?'land':'sea'} seed @ ${x},${y}`);
    }
  });

    // ===== Fit & Download =====
  function setPreview(){ if(label) renderLevel(currentLevel); else renderPreview(); }
  document.getElementById('fit').addEventListener('click',()=>{ if(!W) return; setPreviewSize(); setPreview(); });

  dlBtn.addEventListener('click',()=>{
    const a=document.createElement('a'); a.download=`${currentLevel}.png`; a.href=view.toDataURL('image/png'); a.click();
  });


  // ===== Colors =====
  function colorizeSeeds(){
    const n = seeds.length;
    palette = makeUniquePalette(n);
    for(let i=0;i<n;i++) seeds[i].color = palette[i];
    legend.textContent = `${n} seeds`;
  }

  // ===== Coverage (use effective components) =====

function ensureSeedsCoverComponents(){
  // Land components (effective)
  const land = { compId: effCompId, compSize: effCompSize, count: effCompCount };

  // Sea components must EXCLUDE skipped areas, otherwise "coverage" will add sea seeds there.
  const seaMaskAllowed = new Uint8Array(W*H);
  for(let k=0;k<seaMaskAllowed.length;k++){
    seaMaskAllowed[k] = (effMask[k]===0 && isAllowedProvAt(k)) ? 1 : 0;
  }
  const seaC = labelComponents(seaMaskAllowed, 1);

  const hasLand = new Uint8Array(land.count);
  const hasSea  = new Uint8Array(seaC.count);

  for(const s of seeds){
    const k = s.y*W + s.x;
    if(s.isLand){
      const id = land.compId[k];
      if(id>=0) hasLand[id] = 1;
    }else{
      const id = seaC.compId[k];
      if(id>=0) hasSea[id] = 1;
    }
  }

  // Ensure one LAND seed per land component (land components already respect optional mask via effMask)
  for(let id=0; id<land.count; id++){
    if(!hasLand[id]){
      const k = findFirstIndexInComp(effMask, land.compId, id, 1);
      if(k>=0) seeds.push({ x:k%W, y:(k/W)|0, isLand:true, id:seeds.length, color:0 });
    }
  }

  // Ensure one SEA seed per allowed-sea component ONLY (skipped areas are excluded)
  for(let id=0; id<seaC.count; id++){
    if(!hasSea[id]){
      const k = findFirstIndexInComp(seaMaskAllowed, seaC.compId, id, 1);
      if(k>=0) seeds.push({ x:k%W, y:(k/W)|0, isLand:false, id:seeds.length, color:0 });
    }
  }

  function findFirstIndexInComp(maskArr, compArr, compWanted, wantVal){
    for(let k=0;k<compArr.length;k++){
      if(maskArr[k]===wantVal && compArr[k]===compWanted) return k;
    }
    return -1;
  }
}



  function repairUnlabeled(labels){
    for(let pass=0; pass<2; pass++){
      let changed=0;
      for(let y=1;y<H-1;y++){
        const row=y*W;
        for(let x=1;x<W-1;x++){
          const k=row+x;
          if(labels[k]!==-1) continue;
          const a=labels[k-1], b=labels[k+1], c=labels[k-W], d=labels[k+W];
          let pick=-1;
          if(a>=0) pick=a; else if(b>=0) pick=b; else if(c>=0) pick=c; else if(d>=0) pick=d;
          if(pick>=0){ labels[k]=pick; changed++; }
        }
      }
      if(!changed) break;
    }
  }

  function collapseDiagonalIslands(labels){
    for(let pass=0; pass<2; pass++){
      let changed=0;
      for(let y=1;y<H-1;y++){
        const row=y*W;
        for(let x=1;x<W-1;x++){
          const k=row+x, li=labels[k];
          if(li<0) continue;
          const L=labels[k-1], R=labels[k+1], U=labels[k-W], D=labels[k+W];
          if(li!==L && li!==R && li!==U && li!==D){
            let l1=L,c1=1, l2=null,c2=0, l3=null,c3=0;
            if(R===l1) c1++; else { l2=R; c2=1; }
            if(U===l1) c1++; else if(l2!==null && U===l2) c2++; else { l3=U; c3=1; }
            if(D===l1) c1++; else if(l2!==null && D===l2) c2++; else if(l3!==null && D===l3) c3++;
            let nl=l1,nc=c1;
            if(c2>nc){ nl=l2; nc=c2; }
            if(c3>nc){ nl=l3; nc=c3; }
            if(nl!=null){ labels[k]=nl; changed++; }
          }
        }
      }
      if(!changed) break;
    }
  }

  // ===== Voronoi =====
  function makeMinHeap(cap){
    const key=new Float32Array(cap+5); const heap=new Int32Array(cap+5); let n=0;
    return {
      push(id,k){ n++; let i=n; heap[i]=id; key[i]=k; while(i>1){ const p=i>>1; if(key[p]<=key[i]) break; const t=heap[i];heap[i]=heap[p];heap[p]=t; const tk=key[i]; key[i]=key[p]; key[p]=tk; i=p; } },
      pop(){ if(n===0) return -1; const top=heap[1]; heap[1]=heap[n]; key[1]=key[n]; n--; let i=1; while(true){ let l=i<<1,r=l+1,sm=i; if(l<=n&&key[l]<key[sm]) sm=l; if(r<=n&&key[r]<key[sm]) sm=r; if(sm===i) break; const t=heap[i];heap[i]=heap[sm];heap[sm]=t; const tk=key[i]; key[i]=key[sm]; key[sm]=tk; i=sm;} return top; },
      empty(){ return n===0 }
    };
  }





function assignUnlabeledEffLandByGlobalNearestSeed(labels){
  const N=W*H;

  let needs=false;
  for(let k=0;k<N;k++){
    if(hasGenMask() && genMask[k]===0) continue;            // ✅ skip region
    if(effMask[k]===1 && labels[k]===-1){ needs=true; break; }
  }
  if(!needs) return 0;

  const dist2 = new Float32Array(N); dist2.fill(1e30);
  const lab2  = new Int32Array(N);   lab2.fill(-1);
  const heap2 = makeMinHeap(N);

  // Seed heap only from seeds that are inside genMask (if present)
  for(let i=0;i<seeds.length;i++){
    const s=seeds[i];
    const k=idx(s.x,s.y);
    if(k<0 || k>=N) continue;
    if(hasGenMask() && genMask[k]===0) continue;            // ✅ skip region
    dist2[k]=0; lab2[k]=i; heap2.push(k,0);
  }

  const dirs=[
    [-1,0,1],[1,0,1],[0,-1,1],[0,1,1],
    [-1,-1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[1,1,Math.SQRT2]
  ];

  while(!heap2.empty()){
    const k = heap2.pop();
    const d0 = dist2[k];
    const y = (k/W)|0; const x = k - y*W;
    const li = lab2[k];

    for(const [dx,dy,cost] of dirs){
      const nx=x+dx, ny=y+dy;
      if(nx<0||ny<0||nx>=W||ny>=H) continue;
      const nk = ny*W+nx;

      if(hasGenMask() && genMask[nk]===0) continue;         // ✅ NEVER enter skip
      if(effMask[nk]!==1) continue;                          // ✅ land-only filler (as intended)

      const nd = d0 + cost;
      if(nd < dist2[nk]){
        dist2[nk]=nd; lab2[nk]=li; heap2.push(nk,nd);
      }
    }
  }

  let changed=0;
  for(let k=0;k<N;k++){
    if(hasGenMask() && genMask[k]===0) continue;            // ✅ skip region
    if(effMask[k]===1 && labels[k]===-1 && lab2[k]!==-1){
      labels[k]=lab2[k];
      changed++;
    }
  }
  return changed;
}


  // ===== Hierarchy =====
  function resetHierarchy(){
    provIsLand=null;
    provToCounty=provToDuchy=provToKingdom=provToEmpire=null;
    countyCount=duchyCount=kingdomCount=empireCount=0;
    countyPalette=[]; duchyPalette=[]; kingdomPalette=[]; empirePalette=[];
  }

  function buildAdjacencyFromLabels(numUnits, isEligibleFn){
    const adj = new Array(numUnits);
    for(let i=0;i<numUnits;i++) adj[i]=new Set();
    for(let y=0;y<H;y++){
      let row=y*W;
      for(let x=1;x<W;x++){
        const a=label[row+x-1], b=label[row+x];
        if(a!==b && a>=0 && b>=0 && isEligibleFn(a) && isEligibleFn(b)){
          adj[a].add(b); adj[b].add(a);
        }
      }
    }
    for(let y=1;y<H;y++){
      let row=y*W, prev=(y-1)*W;
      for(let x=0;x<W;x++){
        const a=label[prev+x], b=label[row+x];
        if(a!==b && a>=0 && b>=0 && isEligibleFn(a) && isEligibleFn(b)){
          adj[a].add(b); adj[b].add(a);
        }
      }
    }
    return adj.map(s=>Array.from(s));
  }

  function groupGraph(numNodes, adjacency, eligible, sizeRange){
    const [minT,maxT]=sizeRange;
    const assigned=new Int32Array(numNodes).fill(-1);
    let groupId=0;
    const order=[];
    for(let i=0;i<numNodes;i++) if(eligible(i)) order.push(i);
    shuffle(order);

    for(const start of order){
      if(assigned[start]!==-1) continue;
      const target = (minT + Math.floor(rng()*(maxT-minT+1)));
      const q=[]; let qi=0;
      q.push(start); assigned[start]=groupId;
      let cnt=1;
      while(qi<q.length && cnt<target){
        const u=q[qi++], nbrs=adjacency[u];
        shuffle(nbrs);
        for(const v of nbrs){
          if(!eligible(v) || assigned[v]!==-1) continue;
          assigned[v]=groupId; q.push(v); cnt++;
          if(cnt>=target) break;
        }
      }
      groupId++;
    }

    for(let i=0;i<numNodes;i++){
      if(!eligible(i) || assigned[i]!==-1) continue;
      const nbrs = adjacency[i];
      let g=-1;
      for(const v of nbrs){ if(eligible(v) && assigned[v]!==-1){ g=assigned[v]; break; } }
      if(g===-1){ g=groupId++; }
      assigned[i]=g;
    }

    return { map: assigned, count: groupId };
  }

  function buildHierarchy(){
    const numProv = seeds.length;
    provIsLand = new Uint8Array(numProv);
    for(let i=0;i<numProv;i++) provIsLand[i]=seeds[i].isLand?1:0;

    const provAdj = buildAdjacencyFromLabels(numProv, i=>provIsLand[i]===1);

    // Counties
    const county = groupGraph(numProv, provAdj, i=>provIsLand[i]===1, [3,7]);
    provToCounty = county.map; countyCount = county.count;
    countyPalette = makeUniquePalette(countyCount);

    // Duchies
    const duchyData = liftAdjacency(provAdj, provToCounty, countyCount);
    const duchy = groupGraph(countyCount, duchyData.adj, _=>true, [2,5]);
    provToDuchy = remapChild(provToCounty, duchy.map); duchyCount = duchy.count;
    duchyPalette = makeUniquePalette(duchyCount);

    // Kingdoms
    const kingdomData = liftAdjacencyFromGroups(duchyData, duchy.map, duchy.count);
    const kingdom = groupGraph(duchy.count, kingdomData.adj, _=>true, [2,4]);
    provToKingdom = remapChild(provToDuchy, kingdom.map); kingdomCount = kingdom.count;
    kingdomPalette = makeUniquePalette(kingdomCount);

    // Empires
    const empireData = liftAdjacencyFromGroups(kingdomData, kingdom.map, kingdom.count);
    const empire = groupGraph(kingdom.count, empireData.adj, _=>true, [2,4]);
    provToEmpire = remapChild(provToKingdom, empire.map); empireCount = empire.count;
    empirePalette = makeUniquePalette(empireCount);
  }

  function liftAdjacency(provAdj, provToGroup, groupCount){
    const gAdj = new Array(groupCount);
    for(let i=0;i<groupCount;i++) gAdj[i]=new Set();
    for(let p=0;p<provAdj.length;p++){
      const gp = provToGroup[p];
      if(gp<0) continue;
      for(const q of provAdj[p]){
        const gq = provToGroup[q];
        if(gq<0 || gp===gq) continue;
        gAdj[gp].add(gq); gAdj[gq].add(gp);
      }
    }
    return { adj: gAdj.map(s=>Array.from(s)) };
  }
  function liftAdjacencyFromGroups(prevLift, groupToSuper, superCount){
    const adj = new Array(superCount);
    for(let i=0;i<superCount;i++) adj[i]=new Set();
    for(let g=0; g<prevLift.adj.length; g++){
      const sg = groupToSuper[g];
      for(const h of prevLift.adj[g]){
        const sh = groupToSuper[h];
        if(sg===sh) continue;
        adj[sg].add(sh); adj[sh].add(sg);
      }
    }
    return { adj: adj.map(s=>Array.from(s)) };
  }
  function remapChild(provToChild, childToParent){
    const out = new Int32Array(provToChild.length);
    for(let i=0;i<provToChild.length;i++){
      const c=provToChild[i];
      out[i] = c>=0 ? childToParent[c] : -1;
    }
    return out;
  }

  // ===== Rendering =====
  function renderPreview(){
    if(!heightData){ vctx.clearRect(0,0,view.width,view.height); return }
    vctx.imageSmoothingEnabled = false;

    vctx.clearRect(0,0,view.width,view.height);
    vctx.drawImage(heightCanvas,0,0,W,H);
    //deal with blakened province overlay if provided
        // --- OPTIONAL MASK VISUAL: black-out areas where we do NOT generate ----
            if (window.optionalProvAllowMask && window.optionalProvAllowMask.length === W*H) {
      const allow = window.optionalProvAllowMask;

      // Build (or reuse) an overlay image
      if (!window._optionalProvOverlay || window._optionalProvOverlay.width !== W || window._optionalProvOverlay.height !== H) {
        window._optionalProvOverlay = document.createElement('canvas');
        window._optionalProvOverlay.width = W;
        window._optionalProvOverlay.height = H;
      }

      const oc = window._optionalProvOverlay;
      const octx = oc.getContext('2d', { willReadFrequently: true });

      // Paint black where allow==0, transparent where allow==1
      const img = octx.createImageData(W, H);
      const d = img.data;
      for (let k = 0; k < allow.length; k++) {
        const i = k * 4;
        if (allow[k] === 0) {
          d[i] = 0; d[i+1] = 0; d[i+2] = 0; d[i+3] = 255; // solid black
        } else {
          d[i] = 0; d[i+1] = 0; d[i+2] = 0; d[i+3] = 0;   // transparent
        }
      }
      octx.putImageData(img, 0, 0);

      // Draw it on top of the height preview
      vctx.globalAlpha = 1;
      vctx.drawImage(oc, 0, 0, W, H);
    }

    if(overlayMask.checked && effMask){
      vctx.globalAlpha=0.25;
      vctx.drawImage(maskCanvas,0,0,W,H);

      vctx.globalAlpha=1;
    }
    
    if(seeds.length){
      for(const s of seeds){
        vctx.fillStyle = s.isLand? '#6ee7b7' : '#60a5fa';
        vctx.beginPath(); vctx.arc(s.x,s.y,2,0,Math.PI*2); vctx.fill();
        vctx.strokeStyle = '#000'; vctx.lineWidth=0.75; vctx.stroke();
      }
    }
  }

  recolorBtn.addEventListener('click',()=>{
    if(!label) return;
    palette = makeUniquePalette(seeds.length);
    seeds.forEach((s,i)=>s.color=palette[i]);
    if(countyCount>0) countyPalette = makeUniquePalette(countyCount);
    if(duchyCount>0) duchyPalette = makeUniquePalette(duchyCount);
    if(kingdomCount>0) kingdomPalette = makeUniquePalette(kingdomCount);
    if(empireCount>0) empirePalette = makeUniquePalette(empireCount);
    renderLevel(currentLevel);
  });

  function renderLevel(level){
  if(!label){ renderPreview(); return }
  const img = vctx.createImageData(W,H);
  const d=img.data;

  const ocean = oceanRGB();
  const oceanR=(ocean>>16)&255, oceanG=(ocean>>8)&255, oceanB=ocean&255;

  let mapFn=null, pal=null, labelCount=0, legendName='';
  const includeSeaProvinces = (level==='provinces');

  if(level==='landProvinces'){
    mapFn=(p)=>p; pal=palette;
    labelCount = seeds.reduce((n, s) => n + (s.isLand ? 1 : 0), 0);
    legendName='Land Provinces';
  } else if(level==='provinces'){
    mapFn=(p)=>p; pal=palette; labelCount=seeds.length; legendName='All Provinces';
  } else if(level==='county'){
    mapFn=(p)=> provIsLand[p]? provToCounty[p] : -1; pal=countyPalette; labelCount=countyCount; legendName='Counties';
  } else if(level==='duchy'){
    mapFn=(p)=> provIsLand[p]? provToDuchy[p] : -1; pal=duchyPalette; labelCount=duchyCount; legendName='Duchies';
  } else if(level==='kingdom'){
    mapFn=(p)=> provIsLand[p]? provToKingdom[p] : -1; pal=kingdomPalette; labelCount=kingdomCount; legendName='Kingdoms';
  } else {
    mapFn=(p)=> provIsLand[p]? provToEmpire[p] : -1; pal=empirePalette; labelCount=empireCount; legendName='Empires';
  }

  for(let k=0;k<label.length;k++){
    const i=k*4;

    // SKIPPED REGION: always black, and treated as "no province"
    if(hasGenMask() && genMask[k]===0){
      d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=255;
      continue;
    }

    const p=label[k];
    if(p<0){ d[i]=17; d[i+1]=17; d[i+2]=17; d[i+3]=255; continue; }

    if(effMask[k]===0 && !includeSeaProvinces){
      d[i]=oceanR; d[i+1]=oceanG; d[i+2]=oceanB; d[i+3]=255; continue;
    }

    const gid = mapFn(p);
    const c = (gid>=0 && pal[gid]!=null) ? pal[gid] : (seeds[p]?.color ?? 0x444444);
    d[i]=(c>>16)&255; d[i+1]=(c>>8)&255; d[i+2]=c&255; d[i+3]=255;
  }

  // Optional: edges respect skip as solid black
  if(showEdges.checked){
    const ex=0,ey=0,ez=0;
    function gidAt(k){
      if(hasGenMask() && genMask[k]===0) return -999;
      const p=label[k]; if(p<0) return -2;
      if(effMask[k]===0 && !includeSeaProvinces) return -3;
      return mapFn(p);
    }
    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        const k=y*W+x;
        if(hasGenMask() && genMask[k]===0) continue;
        const a=gidAt(k);
        const i=k*4;
        if(a!==gidAt(k-1) || a!==gidAt(k+1) || a!==gidAt(k-W) || a!==gidAt(k+W)){
          d[i]=ex; d[i+1]=ey; d[i+2]=ez;
        }
      }
    }
  }

  vctx.putImageData(img,0,0);
  legend.textContent = `${legendName}: ${labelCount}`;
}



  // Level segment control
  levelSeg.addEventListener('click',(e)=>{
    const btn=e.target.closest('button'); if(!btn) return;
    [...levelSeg.querySelectorAll('button')].forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentLevel = btn.dataset.level;
    renderLevel(currentLevel);
  });

  showEdges.addEventListener('change',()=>{ renderLevel(currentLevel) });
  overlayMask.addEventListener('change',()=>{ renderPreview(); if(label) renderLevel(currentLevel) });

  function applySizing(){
  if(needHierarchy()) return;

  const doC = document.getElementById('tsc-apply-counties').checked;
  const doD = document.getElementById('tsc-apply-duchies').checked;
  const doK = document.getElementById('tsc-apply-kingdoms').checked;
  const doE = document.getElementById('tsc-apply-empires').checked;

  const cRange = normalizeRange(
    document.getElementById('tsc-c-min').value,
    document.getElementById('tsc-c-max').value,
    [3,7]
  );
  const dRange = normalizeRange(
    document.getElementById('tsc-d-min').value,
    document.getElementById('tsc-d-max').value,
    [2,5]
  );
  const kRange = normalizeRange(
    document.getElementById('tsc-k-min').value,
    document.getElementById('tsc-k-max').value,
    [2,4]
  );
  const eRange = normalizeRange(
    document.getElementById('tsc-e-min').value,
    document.getElementById('tsc-e-max').value,
    [2,4]
  );

  const t0 = performance.now();
  const pAdj = provAdj(); // province adjacency (land-only)

  // Start from current maps
  let newProvToCounty  = provToCounty?.slice()  ?? null;
  let newProvToDuchy   = provToDuchy?.slice()   ?? null;
  let newProvToKingdom = provToKingdom?.slice() ?? null;
  let newProvToEmpire  = provToEmpire?.slice()  ?? null;

  let newCountyCount  = countyCount|0;
  let newDuchyCount   = duchyCount|0;
  let newKingdomCount = kingdomCount|0;
  let newEmpireCount  = empireCount|0;

  // --- 1) Counties (province -> county)
  let countyGrouping = null; // {map: countyIdOfProvince, count}
  if(doC || !newProvToCounty){
    const elig = (i)=> provIsLand[i]===1;
    const county = groupGraph(seeds.length, pAdj, elig, cRange);
    newProvToCounty = county.map;
    newCountyCount  = county.count;
    countyGrouping = county;
  }else{
    // treat existing mapping as a "groupGraph-like" result
    countyGrouping = { map: newProvToCounty, count: newCountyCount };
  }

  // Build duchy adjacency base (between counties)
  const duchyBase = liftAdjacency(pAdj, newProvToCounty, newCountyCount); // adjacency at county level

  // --- 2) Duchies (county -> duchy)
  let duchyGrouping = null; // {map: duchyIdOfCounty, count}
  if(doD || !newProvToDuchy){
    const duchy = groupGraph(newCountyCount, duchyBase.adj, _=>true, dRange);
    newProvToDuchy = remapChild(newProvToCounty, duchy.map);
    newDuchyCount  = duchy.count;
    duchyGrouping  = duchy; // duchy.map is countyId -> duchyId
  }else{
    // derive county -> duchy mapping from current province -> duchy
    const c2d = deriveCountyToDuchy(newProvToCounty, newProvToDuchy, newCountyCount);
    duchyGrouping = { map: c2d, count: newDuchyCount };
  }

  // Build kingdom adjacency base (between duchies)
  const kingdomBase = liftAdjacencyFromGroups(duchyBase, duchyGrouping.map, duchyGrouping.count);

  // --- 3) Kingdoms (duchy -> kingdom)
  let kingdomGrouping = null; // {map: kingdomIdOfDuchy, count}
  if(doK || !newProvToKingdom){
    const king = groupGraph(duchyGrouping.count, kingdomBase.adj, _=>true, kRange);
    newProvToKingdom = remapChild(newProvToDuchy, king.map);
    newKingdomCount  = king.count;
    kingdomGrouping  = king; // king.map is duchyId -> kingdomId
  }else{
    // derive duchy -> kingdom from current province -> kingdom
    const d2k = deriveDuchyToKingdom(newProvToDuchy, newProvToKingdom, newDuchyCount);
    kingdomGrouping = { map: d2k, count: newKingdomCount };
  }

  // Build empire adjacency base (between kingdoms)
  const empireBase = liftAdjacencyFromGroups(kingdomBase, kingdomGrouping.map, kingdomGrouping.count);

  // --- 4) Empires (kingdom -> empire)
  if(doE || !newProvToEmpire){
    const emp = groupGraph(kingdomGrouping.count, empireBase.adj, _=>true, eRange);
    newProvToEmpire = remapChild(newProvToKingdom, emp.map);
    newEmpireCount  = emp.count;
  }

  // Commit & recolor
  provToCounty  = newProvToCounty;  countyCount  = newCountyCount;
  provToDuchy   = newProvToDuchy;   duchyCount   = newDuchyCount;
  provToKingdom = newProvToKingdom; kingdomCount = newKingdomCount;
  provToEmpire  = newProvToEmpire;  empireCount  = newEmpireCount;

  countyPalette  = makeUniquePalette(countyCount);
  duchyPalette   = makeUniquePalette(duchyCount);
  kingdomPalette = makeUniquePalette(kingdomCount);
  empirePalette  = makeUniquePalette(empireCount);

  renderLevel(currentLevel);
  setStatus(`Applied title sizes in ${(performance.now()-t0|0)} ms  •  C=${countyCount} D=${duchyCount} K=${kingdomCount} E=${empireCount}`);
}

// === REROLL BUTTONS (hierarchical) =========================================
(function addRerollButtons(){
  const host = document.querySelector('header .row.card');
  if(!host) return;

  // UI
  function addBtn(id, label, onClick){
    const b=document.createElement('button');
    b.className='btn'; b.id=id; b.textContent=label;
    b.addEventListener('click', onClick); host.appendChild(b);
  }
  addBtn('rerollCounties',   'Reroll Counties',   rerollCountiesOnly);
  addBtn('rerollDuchies',    'Reroll Duchies+',   rerollDuchiesPlus);
  addBtn('rerollKingdoms',   'Reroll Kingdoms+',  rerollKingdomsPlus);
  addBtn('rerollEmpires',    'Reroll Empires+',   rerollEmpiresPlus);

  // Guards
  function needHierarchy(){
    if(!label || !seeds?.length){ alert('Run Barrier-Voronoi first.'); return true; }
    if(!provToCounty || !provToDuchy || !provToKingdom || !provToEmpire){
      alert('Hierarchy not built yet. Click "Run Barrier-Voronoi" first.');
      return true;
    }
    return false;
  }

  // Cache province adjacency once per label set
  let _provAdjCache=null;
  function getProvAdj(){
    if(_provAdjCache) return _provAdjCache;
    _provAdjCache = buildAdjacencyFromLabels(seeds.length, i=>provIsLand[i]===1);
    return _provAdjCache;
  }

  // Utility: partition indices by parent id
  function partitionBy(idArr, count){
    const bins = Array.from({length: count}, ()=>[]);
    for(let i=0;i<idArr.length;i++){
      const g = idArr[i];
      if(g>=0) bins[g].push(i);
    }
    return bins;
  }

  // Utility: group provinces within each partition into counties
  function provincesToCountiesWithinPartitions(partitions, countySize=[3,7]){
    const provAdj = getProvAdj();
    const N = seeds.length;
    const newCountyOfProv = new Int32Array(N).fill(-1);
    let nextCountyId = 0;

    for(const list of partitions){
      if(!list || list.length===0) continue;
      // mark eligible set
      const eligible = new Uint8Array(N);
      for(const p of list) if(provIsLand[p]===1) eligible[p]=1;

      // Local BFS-ish grouping using existing groupGraph over full graph,
      // but with an eligible() that confines to this partition.
      const eligFn = (i)=> eligible[i]===1;
      const { map, count } = groupGraph(N, provAdj, eligFn, countySize);

      // Compact local county ids into global ids, but only for our eligible nodes
      const remapLocalToGlobal = new Map();
      for(const p of list){
        if(eligible[p]!==1) continue;
        const local = map[p];
        if(local<0) continue;
        if(!remapLocalToGlobal.has(local)){
          remapLocalToGlobal.set(local, nextCountyId++);
        }
        newCountyOfProv[p] = remapLocalToGlobal.get(local);
      }
    }
    return { provToCounty: newCountyOfProv, countyCount: nextCountyId };
  }

  // Utility: lift adjacency & regroup a LOWER level into a HIGHER level within parent partitions
  function regroupLowerIntoHigherWithinPartitions(lowerProvMap, lowerCount, parentProvMap, parentCount, sizeRange){
    // Build adjacency on lower units
    const provAdj = getProvAdj();
    const lifted = liftAdjacency(provAdj, lowerProvMap, lowerCount); // adjacency between lower units
    // Partition lower units by parent (using the parent's id of any member province)
    const lowerBins = Array.from({length: parentCount}, ()=>[]);
    for(let p=0;p<lowerProvMap.length;p++){
      const l = lowerProvMap[p];
      if(l<0) continue;
      const parent = parentProvMap[p];
      if(parent<0) continue;
      if(lowerBins[parent].indexOf(l)===-1) lowerBins[parent].push(l);
    }

    // Now group inside each parent bin using lower-level adjacency
    const newMapLowerToHigher = new Int32Array(lowerCount).fill(-1);
    let nextId = 0;
    for(let parent=0; parent<lowerBins.length; parent++){
      const nodes = lowerBins[parent];
      if(!nodes || nodes.length===0) continue;

      // mark eligible lower nodes
      const eligibleLower = new Uint8Array(lowerCount);
      for(const n of nodes) eligibleLower[n]=1;

      // groupGraph expects adjacency on "numNodes == lowerCount"
      const eligFn = (i)=> eligibleLower[i]===1;
      const { map, count } = groupGraph(lowerCount, lifted.adj, eligFn, sizeRange);

      // Compact local ids for this parent to global ids
      const remap = new Map();
      for(const n of nodes){
        const local = map[n];
        if(local<0) continue;
        if(!remap.has(local)) remap.set(local, nextId++);
        newMapLowerToHigher[n] = remap.get(local);
      }
    }

    // And turn it into a per-province map
    const provToHigher = remapChild(lowerProvMap, newMapLowerToHigher);
    const higherCount = Math.max(0, ...newMapLowerToHigher) + 1;
    return { provToHigher, higherCount };
  }

  function recolorAllPalettes(){
    countyPalette  = makeUniquePalette(countyCount);
    duchyPalette   = makeUniquePalette(duchyCount);
    kingdomPalette = makeUniquePalette(kingdomCount);
    empirePalette  = makeUniquePalette(empireCount);
  }

  // ---- REROLL MODES ----

  // Counties only (respect current duchy boundaries)
  function rerollCountiesOnly(){
    if(needHierarchy()) return;
    const t0=performance.now();
    const binsByDuchy = partitionBy(provToDuchy, duchyCount);
    const county = provincesToCountiesWithinPartitions(binsByDuchy, [3,7]);
    provToCounty = county.provToCounty; countyCount = county.countyCount;

    // Keep duchy/kingdom/empire maps as-is
    countyPalette = makeUniquePalette(countyCount);
    renderLevel(currentLevel);
    setStatus(`Rerolled Counties (within duchies) in ${(performance.now()-t0|0)} ms. Counties=${countyCount}`);
  }

  // Duchies+ (duchies and counties), respect current kingdom boundaries
  function rerollDuchiesPlus(){
    if(needHierarchy()) return;
    const t0=performance.now();

    // 1) Reroll duchies from CURRENT counties, per kingdom
    const duchyRes = regroupLowerIntoHigherWithinPartitions(
      provToCounty,           // lower map (counties)
      countyCount,
      provToKingdom,          // parent map (kingdoms fixed)
      kingdomCount,
      [2,5]                   // duchy size in counties
    );
    provToDuchy = duchyRes.provToHigher; duchyCount = duchyRes.higherCount;

    // 2) Reroll counties again inside NEW duchies
    const binsByDuchy = partitionBy(provToDuchy, duchyCount);
    const county = provincesToCountiesWithinPartitions(binsByDuchy, [3,7]);
    provToCounty = county.provToCounty; countyCount = county.countyCount;

    // Keep kingdoms/empires as-is
    duchyPalette  = makeUniquePalette(duchyCount);
    countyPalette = makeUniquePalette(countyCount);
    renderLevel(currentLevel);
    setStatus(`Rerolled Duchies+Counties (within kingdoms) in ${(performance.now()-t0|0)} ms. Duchies=${duchyCount} Counties=${countyCount}`);
  }

  // Kingdoms+ (kingdoms, duchies, counties), respect current empire boundaries
  function rerollKingdomsPlus(){
    if(needHierarchy()) return;
    const t0=performance.now();

    // 1) Reroll kingdoms from CURRENT duchies, per empire
    const kRes = regroupLowerIntoHigherWithinPartitions(
      provToDuchy, duchyCount,
      provToEmpire, empireCount,
      [2,4] // kingdom size in duchies
    );
    provToKingdom = kRes.provToHigher; kingdomCount = kRes.higherCount;

    // 2) Reroll duchies from CURRENT counties, per NEW kingdom
    const dRes = regroupLowerIntoHigherWithinPartitions(
      provToCounty, countyCount,
      provToKingdom, kingdomCount,
      [2,5] // duchy size in counties
    );
    provToDuchy = dRes.provToHigher; duchyCount = dRes.higherCount;

    // 3) Reroll counties inside NEW duchies
    const binsByDuchy = partitionBy(provToDuchy, duchyCount);
    const county = provincesToCountiesWithinPartitions(binsByDuchy, [3,7]);
    provToCounty = county.provToCounty; countyCount = county.countyCount;

    // Keep empires as-is
    kingdomPalette = makeUniquePalette(kingdomCount);
    duchyPalette   = makeUniquePalette(duchyCount);
    countyPalette  = makeUniquePalette(countyCount);
    renderLevel(currentLevel);
    setStatus(`Rerolled Kingdoms+Duchies+Counties (within empires) in ${(performance.now()-t0|0)} ms. K=${kingdomCount} D=${duchyCount} C=${countyCount}`);
  }

  // Empires+ (everything from empires down)
  function rerollEmpiresPlus(){
    if(needHierarchy()) return;
    const t0=performance.now();

    // Rebuild everything fresh but keep provinces fixed
    const provAdj = getProvAdj(); // ensure cached
    // Empires from kingdoms requires having duchy/kingdom layers; we can just reuse your global builder
    buildHierarchy(); // recompute all tiers unconstrained from provinces up

    recolorAllPalettes();
    renderLevel(currentLevel);
    setStatus(`Rerolled Empires+ (all tiers) in ${(performance.now()-t0|0)} ms. E=${empireCount} K=${kingdomCount} D=${duchyCount} C=${countyCount}`);
  }
})();


/* ================= Title Size Controls (UI + Rebuild) =================== */
(function addTitleSizeControls(){
  const header = document.querySelector('header');
  if(!header) return;

  // ---- UI card ----
  const card = document.createElement('div');
  card.className = 'row card';
  card.style.flexWrap = 'wrap';
  card.innerHTML = `
    <strong style="margin-right:8px">Title Size Controls</strong>
    <label style="margin-left:6px"><input id="tsc-apply-counties"  type="checkbox" checked> counties</label>
    <label><input id="tsc-apply-duchies"   type="checkbox" checked> duchies</label>
    <label><input id="tsc-apply-kingdoms"  type="checkbox" checked> kingdoms</label>
    <label><input id="tsc-apply-empires"   type="checkbox" checked> empires</label>
    <div style="width:100%;height:6px"></div>

    <label class="small mono">provinces / county</label>
    <input id="tsc-c-min" type="number" min="1" value="3" style="width:64px">
    <span class="small">to</span>
    <input id="tsc-c-max" type="number" min="1" value="7" style="width:64px">

    <span style="width:16px"></span>

    <label class="small mono">counties / duchy</label>
    <input id="tsc-d-min" type="number" min="1" value="2" style="width:64px">
    <span class="small">to</span>
    <input id="tsc-d-max" type="number" min="1" value="5" style="width:64px">

    <span style="width:16px"></span>

    <label class="small mono">duchies / kingdom</label>
    <input id="tsc-k-min" type="number" min="1" value="10" style="width:64px">
    <span class="small">to</span>
    <input id="tsc-k-max" type="number" min="1" value="50" style="width:64px">

    <span style="width:16px"></span>

    <label class="small mono">kingdoms / empire</label>
    <input id="tsc-e-min" type="number" min="1" value="5" style="width:64px">
    <span class="small">to</span>
    <input id="tsc-e-max" type="number" min="1" value="20" style="width:64px">

    <button class="btn primary" id="tsc-apply" style="margin-left:10px">Apply Title Sizes</button>
  `;
  header.appendChild(card);

  // ---- helpers / guards ----
  function needHierarchy(){
    if(!seeds || !seeds.length){ alert('Seed and run Barrier-Voronoi first.'); return true; }
    if(!provIsLand){ alert('Run "Barrier-Voronoi" first.'); return true; }
    return false;
  }
  function clampInt(v,min,max){
    v = (v|0); if(v<min) v=min; if(v>max) v=max; return v;
  }
  function okRange(min,max){
    return Number.isFinite(min)&&Number.isFinite(max)&&min>=1&&max>=min;
  }
  // cache for province adjacency; invalidate elsewhere by setting _provAdjCache=null
  let _provAdjCache = null;
  function provAdj(){
    if(_provAdjCache) return _provAdjCache;
    _provAdjCache = buildAdjacencyFromLabels(seeds.length, i=>provIsLand[i]===1);
    return _provAdjCache;
  }

  // turn [min,max] into integer size draw: uniformly sample a target size in that range per “seed expansion” in groupGraph
  function normalizeRange(a,b, fallback){
    let mn = clampInt(+a, 1, 1<<30);
    let mx = clampInt(+b, 1, 1<<30);
    if(mx < mn){ const t=mn; mn=mx; mx=t; }
    if(!okRange(mn,mx)) return fallback;
    return [mn,mx];
  }

  // ---- main rebuild with sizing ----
 


// === helpers used by applySizing() ===
// derive mapping: countyId -> duchyId from (prov->county) + (prov->duchy)
function deriveCountyToDuchy(provToCounty, provToDuchy, countyCount){
  const out = new Int32Array(countyCount).fill(-1);
  for(let p=0; p<provToCounty.length; p++){
    const c = provToCounty[p]; if(c<0) continue;
    const d = provToDuchy[p];  if(d<0) continue;
    if(out[c] === -1) out[c] = d;
  }
  return out;
}

// derive mapping: duchyId -> kingdomId from (prov->duchy) + (prov->kingdom)
function deriveDuchyToKingdom(provToDuchy, provToKingdom, duchyCount){
  const out = new Int32Array(duchyCount).fill(-1);
  for(let p=0; p<provToDuchy.length; p++){
    const d = provToDuchy[p];    if(d<0) continue;
    const k = provToKingdom[p];  if(k<0) continue;
    if(out[d] === -1) out[d] = k;
  }
  return out;
}

  // Map A->B->C compactor: given a per-province mapping to child, compact to 0..childCount-1
  function remapToChildIndex(provToChild, provToParent, parentCount){
    // For each parent id, collect child ids; then compact to a dense range across all parents
    const seen = new Set();
    for(let i=0;i<provToChild.length;i++){
      const c = provToChild[i]; if(c>=0) seen.add(c);
    }
    // Build a dense map
    const list = Array.from(seen).sort((a,b)=>a-b);
    const dense = new Map();
    for(let i=0;i<list.length;i++) dense.set(list[i], i);
    const out = new Int32Array((list.length>0? list[list.length-1]+1 : 0)).fill(-1);
    for(const [oldId,newId] of dense.entries()) out[oldId] = newId;
    return out;
  }

  // Hook the button
  document.getElementById('tsc-apply').addEventListener('click', applySizing);
})();





  function buildContainers(){
    // counties: { provs:[] }
    const counties = Array.from({length: countyPalette.length}, ()=>({provs:[]}));
    const duchies  = Array.from({length: duchyPalette.length }, ()=>({ counties:new Set() }));
    const kingdoms = Array.from({length: kingdomPalette.length}, ()=>({ duchies:new Set() }));
    const empires  = Array.from({length: empirePalette.length }, ()=>({ kingdoms:new Set() }));

    for(let p=0;p<seeds.length;p++){
      if(!seeds[p].isLand) continue;
      const c = provToCounty[p], d = provToDuchy[p], k = provToKingdom[p], e = provToEmpire[p];
      if(c>=0) counties[c].provs.push(p);
      if(d>=0 && c>=0) duchies[d].counties.add(c);
      if(k>=0 && d>=0) kingdoms[k].duchies.add(d);
      if(e>=0 && k>=0) empires[e].kingdoms.add(k);
    }

    const nonEmptyCountyIds = [];
    for(let c=0;c<counties.length;c++){
      if(counties[c].provs.length>0) nonEmptyCountyIds.push(c);
    }

    // First non-empty county finder (duchy/kingdom/empire)
    function firstCountyInDuchy(d){
      const list = sorted(duchies[d].counties);
      return list.find(cid => counties[cid].provs.length>0);
    }
    function firstCountyInKingdom(k){
      const dList = sorted(kingdoms[k].duchies);
      for(const d of dList){
        const c = firstCountyInDuchy(d);
        if(c!=null) return c;
      }
      return null;
    }
    function firstCountyInEmpire(e){
      const kList = sorted(empires[e].kingdoms);
      for(const k of kList){
        const c = firstCountyInKingdom(k);
        if(c!=null) return c;
      }
      return null;
    }

    return {counties, duchies, kingdoms, empires, nonEmptyCountyIds, firstCountyInDuchy, firstCountyInKingdom, firstCountyInEmpire};
  }


  // === OPTIONAL PROVINCE MAP UPLOAD (black = generate, other = skip) =========
(function addOptionalProvinceMapUpload(){
  const host = document.querySelector('header .row.card') || document.querySelector('header');
  if(!host) return;

  // Hidden file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/webp';
  input.style.display = 'none';
  document.body.appendChild(input);

  // Public mask: 1 = allowed to generate provinces here, 0 = do not generate
  // (we default to null meaning "allow everywhere")
  window.optionalProvAllowMask = null;

  // Button
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'optionalProvMapUpload';
  btn.textContent = 'Optional Province Map Upload';
  btn.title = 'Upload a mask where BLACK pixels mean: generate provinces here. Non-black: skip province generation there.';
  host.appendChild(btn);

  // Optional clear (handy)
  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn';
  clearBtn.id = 'optionalProvMapClear';
  clearBtn.textContent = 'Clear Optional Province Mask';
  clearBtn.title = 'Remove the optional province-generation mask (generate everywhere again).';
  host.appendChild(clearBtn);

  btn.addEventListener('click', ()=>{
    if(!W || !H){ alert('Load a heightmap first (W/H not set yet).'); return; }
    input.value = '';
    input.click();
  });

  clearBtn.addEventListener('click', ()=>{
    window.optionalProvAllowMask = null;
    if(typeof rebuildEffectiveMask === 'function' && landMask) rebuildEffectiveMask();
    setStatus('Optional province mask cleared. Province generation allowed everywhere (subject to land/sea mask).');
  });

  input.addEventListener('change', async (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    if(!W || !H){ alert('Load a heightmap first (W/H not set yet).'); return; }

    try{
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      URL.revokeObjectURL(url);

      // Draw scaled to W,H (so user can upload any size; it’ll be resampled)
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d', { willReadFrequently:true });
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0,0,W,H);
      ctx.drawImage(img, 0, 0, W, H);

      const data = ctx.getImageData(0,0,W,H).data;
      const allow = new Uint8Array(W*H);

      // "Black" threshold (tweak if you want)
      // Anything sufficiently near black counts as "generate here"
      const BLACK_THR = 16;

      let on = 0;
      for(let k=0, p=0; k<allow.length; k++, p+=4){
        const r = data[p], g = data[p+1], b = data[p+2], a = data[p+3];

        // Transparent = treated as "skip" (0)
        const isBlack = (a > 0) && (r < BLACK_THR) && (g < BLACK_THR) && (b < BLACK_THR);
        allow[k] = isBlack ? 1 : 0;
        on += allow[k];
      }

      window.optionalProvAllowMask = allow;

      // Recompute effective mask so seeding/components/etc respect it
      if(typeof rebuildEffectiveMask === 'function' && landMask) rebuildEffectiveMask();

      const pct = (100 * on / (W*H)).toFixed(2);
      setStatus(`Optional province mask loaded. Generation allowed on ${on.toLocaleString()} px (${pct}%). Black=generate, non-black=skip.`);
    }catch(err){
      console.error(err);
      alert('Failed to load optional province map.');
    }
  });
})();
