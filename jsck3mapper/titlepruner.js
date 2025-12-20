/* ===== Title Pruner (parent-safe merges) — drop-in replacement ===== */
(function addTitlePrunerParentSafe(){
  if (window.__titlePrunerParentSafeInstalled) return;
  window.__titlePrunerParentSafeInstalled = true;

  const header = document.querySelector('header');
  if(!header) return;

  // UI
  const card = document.createElement('div');
  card.className = 'row card'; card.style.flexWrap='wrap';
  card.innerHTML = `
    <strong style="margin-right:8px">Prune Small Titles</strong>
    <label class="small mono">tier</label>
    <select id="tp2-tier" style="min-width:140px">
      <option value="county" selected>County</option>
      <option value="duchy">Duchy</option>
      <option value="kingdom">Kingdom</option>
      <option value="empire">Empire</option>
    </select>
    <span style="width:10px"></span>
    <label class="small mono">min children</label>
    <input id="tp2-min" type="number" min="1" value="3" style="width:64px">
    <span style="width:10px"></span>
    <label class="small mono"><input id="tp2-parent" type="checkbox" checked> Respect parent boundaries (recommended)</label>
    <span style="width:10px"></span>
    <label class="small mono"><input id="tp2-repeat" type="checkbox" checked> repeat until stable</label>
    <button class="btn primary" id="tp2-apply" style="margin-left:10px">Prune</button>
  `;
  header.appendChild(card);

  const tierSel   = card.querySelector('#tp2-tier');
  const minInput  = card.querySelector('#tp2-min');
  const repeatBox = card.querySelector('#tp2-repeat');
  const parentBox = card.querySelector('#tp2-parent');
  const btn       = card.querySelector('#tp2-apply');

  function needHierarchy(){
    if(!seeds || !seeds.length || !provIsLand){
      alert('Run Barrier-Voronoi first.'); return true;
    }
    return false;
  }

  // Province adjacency (land-only)
  let _provAdjCache=null;
  function provAdj(){
    if(_provAdjCache) return _provAdjCache;
    _provAdjCache = buildAdjacencyFromLabels(seeds.length, i=>provIsLand[i]===1);
    return _provAdjCache;
  }

  // Generic helpers
  function liftTierAdj(map,count){ return liftAdjacency(provAdj(), map, count).adj; }
  function compactPerProvinceMap(map){
    const seen=new Set(); for(let i=0;i<map.length;i++){ const v=map[i]; if(v>=0) seen.add(v); }
    const ids=[...seen].sort((a,b)=>a-b), re=new Map();
    ids.forEach((old,i)=>re.set(old,i));
    const out=new Int32Array(map.length);
    for(let i=0;i<map.length;i++){ const v=map[i]; out[i]=(v>=0?re.get(v):-1); }
    return { map: out, count: ids.length };
  }
  function centroidsFor(map,count){
    const sx=new Float64Array(count), sy=new Float64Array(count), sc=new Int32Array(count);
    for(let p=0;p<seeds.length;p++){
      if(provIsLand[p]!==1) continue;
      const g=map[p]; if(g<0) continue;
      sx[g]+=seeds[p].x; sy[g]+=seeds[p].y; sc[g]++;
    }
    return Array.from({length:count}, (_,i)=> sc[i]>0 ? {x:sx[i]/sc[i], y:sy[i]/sc[i], ok:true} : {x:0,y:0,ok:false});
  }
  // Build parent-of-unit table from a per-province child map and a per-province parent map
  function parentOfUnits(childMap, childCount, parentMap){
    if(!parentMap) return null;
    const out = new Int32Array(childCount).fill(-1);
    for(let p=0;p<childMap.length;p++){
      const c = childMap[p]; if(c<0) continue;
      const par = parentMap[p]; if(par<0) continue;
      if(out[c]===-1) out[c]=par; // first occurrence is fine
    }
    return out;
  }

  function childCounts(tier){
    if(tier==='county'){
      const cnt=new Int32Array(countyCount);
      for(let p=0;p<seeds.length;p++){ if(provIsLand[p]!==1) continue; const c=provToCounty[p]; if(c>=0) cnt[c]++; }
      return cnt;
    }
    if(tier==='duchy'){
      const seen=Array.from({length:duchyCount},()=>new Set());
      for(let p=0;p<seeds.length;p++){ if(provIsLand[p]!==1) continue; const d=provToDuchy[p], c=provToCounty[p]; if(d>=0&&c>=0) seen[d].add(c); }
      return Int32Array.from(seen.map(s=>s.size));
    }
    if(tier==='kingdom'){
      const seen=Array.from({length:kingdomCount},()=>new Set());
      for(let p=0;p<seeds.length;p++){ if(provIsLand[p]!==1) continue; const k=provToKingdom[p], d=provToDuchy[p]; if(k>=0&&d>=0) seen[k].add(d); }
      return Int32Array.from(seen.map(s=>s.size));
    }
    const seen=Array.from({length:empireCount},()=>new Set());
    for(let p=0;p<seeds.length;p++){ if(provIsLand[p]!==1) continue; const e=provToEmpire[p], k=provToKingdom[p]; if(e>=0&&k>=0) seen[e].add(k); }
    return Int32Array.from(seen.map(s=>s.size));
  }

  // Pick merge target strictly within same parent id
  function pickMergeTargetSameParent(srcId, neighbors, cents, parentOf){
    const par = parentOf ? parentOf[srcId] : -1;
    let best=-1, bestD2=Infinity;

    // 1) try adjacent units that share the same parent
    for(const n of neighbors[srcId]||[]){
      if(parentOf && parentOf[n]!==par) continue;
      if(!cents[n]?.ok) continue;
      const dx=cents[srcId].x-cents[n].x, dy=cents[srcId].y-cents[n].y, d2=dx*dx+dy*dy;
      if(d2<bestD2){ best=n; bestD2=d2; }
    }
    if(best!==-1) return best;

    // 2) fall back to global nearest of same parent (by centroid)
    if(parentOf){
      for(let j=0;j<cents.length;j++){
        if(j===srcId || !cents[j]?.ok) continue;
        if(parentOf[j]!==par) continue;
        const dx=cents[srcId].x-cents[j].x, dy=cents[srcId].y-cents[j].y, d2=dx*dx+dy*dy;
        if(d2<bestD2){ best=j; bestD2=d2; }
      }
    }
    return best; // -1 => skip
  }

  function pruneOnce(tier, minChildren, respectParent){
    // Select maps/palettes/setters for chosen tier
    let map, count, setMapCount, resetPalette, parentMap=null, parentCount=0;
    if(tier==='county'){
      map=provToCounty; count=countyCount;
      setMapCount=(m,c)=>{ provToCounty=m; countyCount=c; };
      resetPalette=()=>{ countyPalette=makeUniquePalette(countyCount); };
      if(respectParent){ parentMap=provToDuchy; parentCount=duchyCount; }
    }else if(tier==='duchy'){
      map=provToDuchy; count=duchyCount;
      setMapCount=(m,c)=>{ provToDuchy=m; duchyCount=c; };
      resetPalette=()=>{ duchyPalette=makeUniquePalette(duchyCount); };
      if(respectParent){ parentMap=provToKingdom; parentCount=kingdomCount; }
    }else if(tier==='kingdom'){
      map=provToKingdom; count=kingdomCount;
      setMapCount=(m,c)=>{ provToKingdom=m; kingdomCount=c; };
      resetPalette=()=>{ kingdomPalette=makeUniquePalette(kingdomCount); };
      if(respectParent){ parentMap=provToEmpire; parentCount=empireCount; }
    }else{
      map=provToEmpire; count=empireCount;
      setMapCount=(m,c)=>{ provToEmpire=m; empireCount=c; };
      resetPalette=()=>{ empirePalette=makeUniquePalette(empireCount); };
      // empire has no parent
    }
    if(!map || count<=0) return 0;

    const kids = childCounts(tier);
    const cents = centroidsFor(map, count);
    const adj   = liftTierAdj(map, count);
    const parentOf = parentMap ? parentOfUnits(map, count, parentMap) : null;

    // candidates: has centroid & under threshold
    const todo=[];
    for(let i=0;i<count;i++){
      if(!cents[i].ok) continue;
      if(kids[i] < minChildren) todo.push(i);
    }
    if(!todo.length) return 0;

    // Decide redirects
    const redirect = new Int32Array(count); for(let i=0;i<count;i++) redirect[i]=i;
    for(const a of todo){
      const b = respectParent ? pickMergeTargetSameParent(a, adj, cents, parentOf)
                              : (function pickAnyNeighbor(){
                                  let best=-1,bd2=Infinity;
                                  for(const n of adj[a]||[]){
                                    if(!cents[n]?.ok) continue;
                                    const dx=cents[a].x-cents[n].x, dy=cents[a].y-cents[n].y, d2=dx*dx+dy*dy;
                                    if(d2<bd2){best=n;bd2=d2;}
                                  }
                                  if(best===-1){
                                    for(let j=0;j<count;j++){
                                      if(j===a || !cents[j]?.ok) continue;
                                      const dx=cents[a].x-cents[j].x, dy=cents[a].y-cents[j].y, d2=dx*dx+dy*dy;
                                      if(d2<bd2){best=j;bd2=d2;}
                                    }
                                  }
                                  return best;
                                })();

      if(b>=0) redirect[a]=b; // if none found, skip
    }

    // Apply redirects to provinces
    const newMap = new Int32Array(map.length);
    for(let p=0;p<map.length;p++){ const g=map[p]; newMap[p]=(g>=0? redirect[g] : -1); }

    // Compact & commit
    const {map: compacted, count: newCount} = compactPerProvinceMap(newMap);
    setMapCount(compacted, newCount);
    resetPalette();
    return todo.length;
  }

  function runPrune(){
    if(needHierarchy()) return;
    const tier = tierSel.value;
    const minC = Math.max(1, (minInput.value|0));
    const repeat = !!repeatBox.checked;
    const respectParent = !!parentBox.checked;

    const t0=performance.now();
    let merges=0, pass=0;
    do{
      pass++;
      const m = pruneOnce(tier, minC, respectParent);
      merges += m;
      if(!repeat || m===0 || pass>100) break;
    }while(true);

    if(typeof renderLevel==='function') renderLevel(currentLevel);
    if(typeof setStatus==='function'){
      setStatus(`Pruned ${merges} ${tier}${merges===1?'':'s'} in ${(performance.now()-t0|0)} ms • parent-guard ${respectParent?'ON':'OFF'}`);
    }
  }

  btn.addEventListener('click', runPrune);
})();

 