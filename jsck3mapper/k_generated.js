
//<!-- === Export k_generated.txt (per-kingdom culture & per-empire religion) ===== -->
//<!-- === Export k_generated.txt (per-kingdom culture & per-county faith) ===== -->
(function addKGeneratedExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) { console.warn('k_generated: header host not found'); return; }

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'downloadKGenerated';
  btn.textContent = 'Export k_generated.txt';
  host.appendChild(btn);

  function setStatusSafe(msg){
    try { typeof setStatus === 'function' && setStatus(msg); } catch(_) {}
  }
  function saveText(text, filename){
    const blob = new Blob([text], {type:'text/plain;charset=utf-8;'});
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // Helpers to turn culture/faith indices into keys
  function cultureKeyFromIndex(cIdx){
    if (cIdx == null || cIdx < 0) return 'generic_culture';
    if (Array.isArray(worldCultures) && worldCultures[cIdx]) {
      const cObj = worldCultures[cIdx];
      if (cObj.id)  return cObj.id;
      if (cObj.key) return cObj.key;
    }
    return `culture_${cIdx}`;
  }

  // IMPORTANT: history province `religion =` expects a FAITH key
  function faithKeyFromIndex(fIdx){
    if (fIdx == null || fIdx < 0) return 'generic_faith';

    // If you have a worldFaiths array (common in your generator)
    if (Array.isArray(worldFaiths) && worldFaiths[fIdx]) {
      const fObj = worldFaiths[fIdx];
      if (fObj.id)  return fObj.id;   // e.g. "faith_abcd"
      if (fObj.key) return fObj.key;  // if you stored a custom key
    }

    // Fallback naming
    return `faith_${fIdx}`;
  }

  function exportKGenerated(){
    try{
      if (!seeds || !seeds.length) {
        alert('No provinces found. Seed the map (Auto-seed) and click "Run Barrier-Voronoi" first.');
        return;
      }
      if (!provToCounty) {
        alert('Hierarchy not built yet. Click "Run Barrier-Voronoi" first.');
        return;
      }

      // Land-first numbering (matches definition.csv)
      const landIdx = [];
      for (let i=0;i<seeds.length;i++) if (seeds[i].isLand) landIdx.push(i);
      if (landIdx.length === 0) { alert('No land provinces.'); return; }

      const provIdBySeed = new Int32Array(seeds.length).fill(-1);
      const seedByProvId = new Int32Array(landIdx.length+1).fill(-1); // inverse
      for (let i=0;i<landIdx.length;i++){
        const seedIndex = landIdx[i];
        const pid = i+1;
        provIdBySeed[seedIndex] = pid;
        seedByProvId[pid] = seedIndex;
      }

      // county -> [provinceIDs]
      const countyToProvIds = new Map();
      for (let p=0; p<seeds.length; p++){
        if (!seeds[p].isLand) continue;
        const pid = provIdBySeed[p];
        if (pid < 1) continue;
        const c = provToCounty[p];
        if (c < 0) continue;
        if (!countyToProvIds.has(c)) countyToProvIds.set(c, []);
        countyToProvIds.get(c).push(pid);
      }

      // capital = smallest province ID per county
      const capitals = new Set();
      // map capital PID -> culture/faith indices
      const capitalInfo = new Map(); // pid -> { cIdx, fIdx }
      for (const [cId, list] of countyToProvIds.entries()){
        list.sort((a,b)=>a-b);
        const pid = list[0];
        capitals.add(pid);

        const pSeed = seedByProvId[pid];

        // --- derive culture index for this county from the capital province ---
        let cIdx = -1;
        if (typeof provToCulture !== 'undefined' && provToCulture) {
          cIdx = provToCulture[pSeed] ?? -1;
        } else if (seeds[pSeed] && typeof seeds[pSeed].cultureIndex === 'number') {
          cIdx = seeds[pSeed].cultureIndex;
        }

        // --- derive faith index for this county from the capital province ---
        let fIdx = -1;
        if (typeof provToFaith !== 'undefined' && provToFaith) {
          fIdx = provToFaith[pSeed] ?? -1;
        } else if (seeds[pSeed] && typeof seeds[pSeed].faithIndex === 'number') {
          fIdx = seeds[pSeed].faithIndex;
        }

        // Extra fallback: if you store the key directly on seeds
        // (uncomment if you actually use these fields)
        // let fKeyDirect = (seeds[pSeed] && (seeds[pSeed].faithKey || seeds[pSeed].faithId)) || null;

        capitalInfo.set(pid, { cIdx, fIdx /*, fKeyDirect*/ });
      }

      // Emit all land provinces in ascending ID with culture/faith on capitals
      const lines = [];
      for (let pid=1; pid<=landIdx.length; pid++){
        if (capitals.has(pid)){
          const info = capitalInfo.get(pid) || { cIdx:-1, fIdx:-1 };
          const cultureKey = cultureKeyFromIndex(info.cIdx);

          // religion = faith key
          const faithKey = faithKeyFromIndex(info.fIdx);

          lines.push(
`${pid} = {
\tculture = ${cultureKey}
\treligion = ${faithKey}_faith
\tholding = tribal_holding
}`
          );
        } else {
          lines.push(
`${pid} = {
\tholding = none
}`
          );
        }
      }

      saveText(lines.join('\n'), 'k_generated.txt');
      setStatusSafe(
        `Exported k_generated.txt (land=${landIdx.length}, capitals=${capitals.size}; ` +
        `culture from county, religion set to county faith key).`
      );
    }catch(err){
      console.error(err);
      alert('Failed to export k_generated.txt (see console).');
    }
  }

  btn.addEventListener('click', exportKGenerated);
})();
