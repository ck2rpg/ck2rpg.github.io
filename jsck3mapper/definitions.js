// ===== Export definition.csv =====
/*
  function exportDefinitionCSV(){
    if(!seeds.length){
      alert('No provinces to export. Add seeds and run, or auto-seed first.');
      return;
    }
    if(!palette.length || palette.length!==seeds.length) colorizeSeeds();

    const landIdx = [], seaIdx  = [];
    for(let i=0;i<seeds.length;i++) (seeds[i].isLand ? landIdx : seaIdx).push(i);
    const order = landIdx.concat(seaIdx);

    const rgb = (c)=>[(c>>16)&255, (c>>8)&255, c&255];
    const lines = [];
    lines.push('0;0;0;0;x;x;');

    let id = 1;
    for(const pIdx of order){
      const c = seeds[pIdx].color ?? 0x444444;
      const [R,G,B] = rgb(c);
      const fifth = seeds[pIdx].isLand ? `R${R}G${G}B${B}` : 'OCEAN';
      lines.push(`${id};${R};${G};${B};${fifth};x;`);
      id++;
    }

    const csv = lines.join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'definition.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(`Exported definition.csv (${lines.length} lines).`);
  }
  dlDefBtn.addEventListener('click', exportDefinitionCSV);
  */
 // ===== Export definition.csv (waterType-aware tags) =====
function exportDefinitionCSV(){
  if(!seeds.length){
    alert('No provinces to export. Add seeds and run, or auto-seed first.');
    return;
  }
  if(!palette.length || palette.length!==seeds.length) colorizeSeeds();

  // Same ordering: land first, then water
  const landIdx = [], waterIdx  = [];
  for(let i=0;i<seeds.length;i++) (seeds[i].isLand ? landIdx : waterIdx).push(i);
  const order = landIdx.concat(waterIdx);

  const rgb = (c)=>[(c>>16)&255, (c>>8)&255, c&255];

  // Detect whether waterType is available at all
  let anyTyped = false;
  for (let i=0;i<seeds.length;i++){
    if(!seeds[i].isLand && seeds[i].waterType){ anyTyped = true; break; }
  }
  if(!anyTyped){
    console.warn('definition.csv export: No waterType found. All water will be tagged OCEAN.');
  }

  const lines = [];
  lines.push('0;0;0;0;x;x;');

  let id = 1;
  for(const pIdx of order){
    const c = seeds[pIdx].color ?? 0x444444;
    const [R,G,B] = rgb(c);

    let tag = `R${R}G${G}B${B}`; // default for land (your current scheme)

    if(!seeds[pIdx].isLand){
      if(!anyTyped){
        tag = 'OCEAN';
      } else {
        const t = seeds[pIdx].waterType;
        if(t === 'river') tag = 'RIVER';
        else if(t === 'lake') tag = 'LAKE';
        else if(t === 'sea' || t === 'coastal_sea') tag = 'OCEAN';
        else tag = 'OCEAN'; // unknown waterType => safest fallback
      }
    }

    lines.push(`${id};${R};${G};${B};${tag};x;`);
    id++;
  }

  const csv = lines.join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'definition.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  const typedNote = anyTyped ? 'typed water (OCEAN/RIVER/LAKE)' : 'untyped water (all OCEAN)';
  setStatus(`Exported definition.csv (${lines.length} lines) — ${typedNote}.`);
}

dlDefBtn.addEventListener('click', exportDefinitionCSV);
