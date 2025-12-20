// <!-- === Export gtitles_l_english.yml (localization for titles + provinces) ===== -->

// <!-- === Export gtitles_l_english.yml (color-keyed like 00_landed_titles) ===== -->
(function addGtitlesLocalizationExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) { console.warn('gtitles loc: header host not found'); return; }

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'downloadGtitlesLoc';
  btn.textContent = 'Export gtitles_l_english.yml';
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

  function exportGtitlesLoc(){
    try {
      if (!Array.isArray(seeds) || !seeds.length){
        alert('No provinces/seeds available. Generate the world first.');
        return;
      }

      // Make sure worldTitles exists
      if (!window.worldTitles) {
        if (typeof buildWorldTitles === 'function') {
          buildWorldTitles();
        }
      }

      // Make sure titles + provinces have placeName assigned
      if (typeof assignPlaceNamesToTitles === 'function') {
        assignPlaceNamesToTitles();
      }

      const wt = window.worldTitles;
      if (!wt) {
        alert('worldTitles not built. Run the hierarchy builder first.');
        return;
      }

      // ---- color helpers (mirror 00_landed_titles) -------------------------
      const rgbFromInt = (c)=>[(c>>16)&255, (c>>8)&255, c&255];
      const nameFromRGB = ([R,G,B])=>`R${R}G${G}B${B}`;

      const empireCnt  = Array.isArray(empirePalette)  ? empirePalette.length  : 0;
      const kingdomCnt = Array.isArray(kingdomPalette) ? kingdomPalette.length : 0;
      const duchyCnt   = Array.isArray(duchyPalette)   ? duchyPalette.length   : 0;
      const countyCnt  = Array.isArray(countyPalette)  ? countyPalette.length  : 0;

      const empireRGB  = (eid)=> rgbFromInt(empirePalette[eid]);
      const kingdomRGB = (kid)=> rgbFromInt(kingdomPalette[kid]);
      const duchyRGB   = (did)=> rgbFromInt(duchyPalette[did]);
      const countyRGB  = (cid)=> rgbFromInt(countyPalette[cid]);

      const entries = [];
      const seenKeys = new Set();

      function escapeValue(v){
        return String(v).replace(/"/g, '\\"');
      }

      function addLocEntry(key, value){
        if (!key) return;
        key = String(key).trim();
        if (!key) return;
        if (seenKeys.has(key)) return;
        seenKeys.add(key);

        const valStr = String(value || key).trim();
        if (!valStr) return;

        entries.push([key, escapeValue(valStr)]);
      }

      // --- Titles: color-based keys matching 00_landed_titles ---------------

      // Empires: e_RxGyBz
      for (let e = 0; e < empireCnt; e++){
        const rgb = empireRGB(e);
        const colorName = nameFromRGB(rgb);
        const key = `e_${colorName}`;

        const node = wt.empires && wt.empires[e] ? wt.empires[e] : null;
        const value =
          node?.placeName ||
          node?.displayName ||
          key;

        addLocEntry(key, value);
      }

      // Kingdoms: k_RxGyBz
      for (let k = 0; k < kingdomCnt; k++){
        const rgb = kingdomRGB(k);
        const colorName = nameFromRGB(rgb);
        const key = `k_${colorName}`;

        const node = wt.kingdoms && wt.kingdoms[k] ? wt.kingdoms[k] : null;
        const value =
          node?.placeName ||
          node?.displayName ||
          key;

        addLocEntry(key, value);
      }

      // Duchies: d_RxGyBz
      for (let d = 0; d < duchyCnt; d++){
        const rgb = duchyRGB(d);
        const colorName = nameFromRGB(rgb);
        const key = `d_${colorName}`;

        const node = wt.duchies && wt.duchies[d] ? wt.duchies[d] : null;
        const value =
          node?.placeName ||
          node?.displayName ||
          key;

        addLocEntry(key, value);
      }

      // Counties: c_RxGyBz
      for (let c = 0; c < countyCnt; c++){
        const rgb = countyRGB(c);
        const colorName = nameFromRGB(rgb);
        const key = `c_${colorName}`;

        const node = wt.counties && wt.counties[c] ? wt.counties[c] : null;
        const value =
          node?.placeName ||
          node?.displayName ||
          key;

        addLocEntry(key, value);
      }

      // --- Provinces / Baronies: b_RxGyBz from seeds[p].color ---------------
      const N = seeds.length;
      for (let p = 0; p < N; p++){
        const s = seeds[p];
        if (!s || !s.isLand) continue;

        const col = s.color;
        if (typeof col !== 'number' || !Number.isFinite(col)) continue;

        const rgb = rgbFromInt(col);
        const colorName = nameFromRGB(rgb);
        const key = `b_${colorName}`;

        const value =
          s.placeName ||
          s.displayName ||
          s.name ||
          key;

        addLocEntry(key, value);
      }

      // --- Emit file ---------------------------------------------------------
      entries.sort((a,b) => a[0].localeCompare(b[0]));

      const lines = [];
      lines.push(`${daBom}l_english:`);
      for (const [key, value] of entries) {
        lines.push(`\t${key}: "${value}"`);
      }

      const text = lines.join('\n');
      saveText(text, 'gtitles_l_english.yml');

      setStatusSafe(
        `Exported gtitles_l_english.yml with ${entries.length} color-keyed title + province localizations.`
      );
    } catch (err) {
      console.error(err);
      alert('Failed to export gtitles_l_english.yml (see console).');
    }
  }

  btn.addEventListener('click', exportGtitlesLoc);
})();

