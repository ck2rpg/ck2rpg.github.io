function normalizeCultureKey(key) {
  return key
    .replace(/_r(\d+)/i, '_R$1')
    .replace(/g(\d+)/i, 'G$1')
    .replace(/b(\d+)/i, 'B$1');
}
(function addExportGeneratedEthnicitiesBtn(){
  // ---- UI host (same pattern you use elsewhere) ----
  const headerCards = document.querySelectorAll('header .row.card, .row.card, header');
  const host = headerCards?.[0] || document.body;

  // avoid double-add
  if (document.getElementById('btn-export-ethnicities')) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'btn-export-ethnicities';
  btn.textContent = 'Export generated_ethnicities.txt';
  host.appendChild(btn);

  // ---- helpers ----
  const q2 = (x)=> Math.round(x*100)/100;
  const clamp = (x, a=0, b=1)=> x<a?a:x>b?b:x;

  function downloadText(filename, text){
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=> URL.revokeObjectURL(a.href), 2500);
  }

  function getEthFromObj(obj){
    // try a bunch of likely property names
    return obj.ethnicity
  }

  function getKeyForObj(obj, fallback){
    return obj?.key || obj?.id || obj?.name || fallback;
  }

  // Make a “simple range” around a single value:
  // CK3 gene ranges must have min <= max.
  function simpleRange(v, w=0.05, lo=0.0, hi=1.0){
    v = clamp(+v || 0.5, lo, hi);
    const a = clamp(v - w, lo, hi);
    const b = clamp(v + w, lo, hi);
    return [q2(Math.min(a,b)), q2(Math.max(a,b))];
  }

  // Pick top N entries in a categorical block (to keep file size sane)
  function topNEntries(obj, n=3){
    const entries = Object.entries(obj||{})
      .filter(([,v])=> typeof v === 'number' && isFinite(v))
      .sort((a,b)=> (b[1]??0)-(a[1]??0));
    return entries.slice(0, Math.max(1,n));
  }

  // gene_age causes CK3 errors with your keys old_1..old_5 -> skip it
  const SKIP_GENES = new Set(['gene_age']);

  // If you want slightly wider ranges for face_detail_ (often subtle), tweak here
  function rangeWidthFor(geneName, attr){
    if (geneName.startsWith('face_detail_')) return 0.08;
    return 0.05;
  }

  // Convert a gene block (your numeric attrs) into CK3 gene entries
  function writeGeneBlock(lines, geneName, block){
    if (!block || typeof block !== 'object') return;
    if (SKIP_GENES.has(geneName)) return;

    lines.push(`\t${geneName} = {`);

    // Detect neg/pos pairs by base prefix
    const keys = Object.keys(block);
    const pairBases = new Set();
    for (const k of keys){
      const m = k.match(/^(.*)_(neg|pos)$/);
      if (m) pairBases.add(m[1]);
    }

    // 1) Write paired neg/pos as 6-bucket distribution (simple, stable)
    for (const base of pairBases){
      const negKey = `${base}_neg`;
      const posKey = `${base}_pos`;
      const negV = (typeof block[negKey] === 'number') ? block[negKey] : null;
      const posV = (typeof block[posKey] === 'number') ? block[posKey] : null;

      // If we don't really have both, skip to avoid junk
      if (negV == null || posV == null) continue;

      const w = rangeWidthFor(geneName, base);

      // Create 3 “neg” + 3 “pos” buckets around the current values
      // Weights are fixed, ranges are simple around your values.
      const [n1a,n1b] = simpleRange(negV, w*0.6, 0, 1);
      const [n2a,n2b] = simpleRange(negV, w*1.0, 0, 1);
      const [n3a,n3b] = simpleRange(negV, w*1.4, 0, 1);

      const [p1a,p1b] = simpleRange(posV, w*0.6, 0, 1);
      const [p2a,p2b] = simpleRange(posV, w*1.0, 0, 1);
      const [p3a,p3b] = simpleRange(posV, w*1.4, 0, 1);

      // You can tune these weights; they just need to sum “reasonably”.
      lines.push(`\t\t1  = { name = ${negKey} range = { ${n3a.toFixed(2)} ${n3b.toFixed(2)} } }`);
      lines.push(`\t\t10 = { name = ${negKey} range = { ${n2a.toFixed(2)} ${n2b.toFixed(2)} } }`);
      lines.push(`\t\t40 = { name = ${negKey} range = { ${n1a.toFixed(2)} ${n1b.toFixed(2)} } }`);
      lines.push(`\t\t40 = { name = ${posKey} range = { ${p1a.toFixed(2)} ${p1b.toFixed(2)} } }`);
      lines.push(`\t\t10 = { name = ${posKey} range = { ${p2a.toFixed(2)} ${p2b.toFixed(2)} } }`);
      lines.push(`\t\t1  = { name = ${posKey} range = { ${p3a.toFixed(2)} ${p3b.toFixed(2)} } }`);
      lines.push('');
    }

    // 2) Write “single” sliders / categorical-ish blocks
    //    We output top 2–3 strongest attributes with simple ranges.
    const singles = {};
    for (const [k,v] of Object.entries(block)){
      if (typeof v !== 'number' || !isFinite(v)) continue;
      if (k.match(/^(.*)_(neg|pos)$/)) continue; // already handled
      singles[k] = v;
    }

    const top = topNEntries(singles, 3);
    for (const [attr, v] of top){
      const w = rangeWidthFor(geneName, attr);
      const [a,b] = simpleRange(v, w, 0, 1);
      // Weight scaled from your value (so dominant attrs get higher chance)
      const wt = Math.max(1, Math.min(100, Math.round(clamp(v,0,1) * 100)));
      lines.push(`\t\t${wt} = { name = ${attr} range = { ${a.toFixed(2)} ${b.toFixed(2)} } }`);
    }

    lines.push(`\t}`);
    lines.push('');
  }

  function writeColorBlock(lines, label, rgbaOrRect){
    // Your palettes are 4 numbers. CK3 color blocks in ethnicities accept 4 numbers,
    // but your *error* earlier indicates some were treated as rect-bounds and invalid.
    // Here we just print the 4 numbers as-is but clamp + ensure min<=max on pairs.
    if (!Array.isArray(rgbaOrRect) || rgbaOrRect.length !== 4) return;

    let [a,b,c,d] = rgbaOrRect.map(x => clamp(+x || 0, 0, 1));
    // Ensure "min <= max" for (a,c) and (b,d) if it is interpreted as bounds
    if (a > c) [a,c] = [c,a];
    if (b > d) [b,d] = [d,b];

    lines.push(`\t${label} = {`);
    lines.push(`\t\t10 = { ${a.toFixed(2)} ${b.toFixed(2)} ${c.toFixed(2)} ${d.toFixed(2)} }`);
    lines.push(`\t}`);
  }

  btn.addEventListener('click', ()=>{
    const heritages = Array.isArray(worldHeritages) ? worldHeritages : [];
    const cultures  = Array.isArray(worldCultures)  ? worldCultures  : [];

    const all = [];

    for (let i=0;i<heritages.length;i++){
      const h = heritages[i];
      const eth = h.ethnicity
      if (eth) all.push({ kind:'heritage', obj:h, eth, fallbackKey:`heritage_${i}` });
    }
    for (let i=0;i<cultures.length;i++){
      const c = cultures[i];
      const eth = c.ethnicity
      if (eth) all.push({ kind:'culture', obj:c, eth, fallbackKey:`culture_${i}` });
    }

    if (!all.length){
      alert('No ethnicities found on worldHeritages/worldCultures yet.\n\nTip: ensure you assign e.g. heritage.ethnicity = generateEthnicityFromHeritage(heritage)\n(and culture.ethnicity too) BEFORE exporting.');
      return;
    }

    const lines = [];

    // ---- global @vars header (exactly once) ----

    // ---- ethnicity blocks ----
    for (const it of all){
      const eth = it.eth;

      const keyBase = getKeyForObj(it.obj, it.fallbackKey);
      // You can keep your existing naming convention; here’s a safe one:
      const key = String(keyBase).replace(/\s+/g,'_').replace(/[^\w\-]/g,'') || it.fallbackKey;

      lines.push(`${key} = {`);
      lines.push('');

      // ---- colors ----
      // Prefer explicit fields if you set them; otherwise fall back to a palette choice
      // If your exporter currently always picks one, that’s fine — this keeps it safe.
      if (eth.skinColor) writeColorBlock(lines, 'skin_color', eth.skinColor);
      if (eth.eyeColor)  writeColorBlock(lines, 'eye_color',  eth.eyeColor);
      if (eth.hairColor) writeColorBlock(lines, 'hair_color', eth.hairColor);

      // If you *don’t* have explicit colors stored, you can derive them from your palettes.
      // (comment out if you already store skinColor/eyeColor/hairColor)
      if (!eth.skinColor && eth.skinTone?.base != null) {
        // placeholder “rect-like” value based on base: this just prevents empty blocks
        const b = clamp(eth.skinTone.base, 0.05, 0.95);
        writeColorBlock(lines, 'skin_color', [b, 0.70, b, 0.85]);
      }
      if (!eth.eyeColor && eth.eyeTone?.lightness != null) {
        const l = clamp(eth.eyeTone.lightness, 0.05, 0.95);
        writeColorBlock(lines, 'eye_color', [0.05, l, 0.35, 1.00]);
      }
      if (!eth.hairColor && eth.hairTone?.darkness != null) {
        const d = clamp(eth.hairTone.darkness, 0.05, 0.95);
        writeColorBlock(lines, 'hair_color', [0.65, d, 0.90, 1.00]);
      }

      lines.push('');

      // ---- genes ----
      const geneObj = eth.genes; // THIS is your generator’s storage
      if (geneObj && typeof geneObj === 'object') {
        for (const [geneName, block] of Object.entries(geneObj)) {
          writeGeneBlock(lines, geneName, block);
        }
      }

      lines.push(`}`);
      lines.push('');
    }

    downloadText('generated_ethnicities.txt', lines.join('\n'));
  });
})();
