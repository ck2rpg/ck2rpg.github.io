// <!-- === Export cultural_names_list & cultural_names_l_english ===== -->
(function addCulturalNamesExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) { console.warn('cultural names: header host not found'); return; }

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'downloadCulturalNames';
  btn.textContent = 'Export cultural names';
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

  // Build a stable "name_list_xxx" key per culture
  function nameListKeyForCulture(culture, idx){
    let base =
      culture.language ||
      culture.id ||
      culture.key ||
      `culture_${idx}`;

    base = String(base).replace(/[^A-Za-z0-9_]+/g, '_');
    if (!base.startsWith('name_list_')){
      base = `name_list_${base}`;
    }
    return base;
  }

  function exportCulturalNames(){
    try{
      if (!Array.isArray(worldCultures) || worldCultures.length === 0){
        alert('No cultures found. Generate cultures first.');
        return;
      }

      const nameListLines = [];
      const locLines = [];
      locLines.push(`${daBom}`)
      const seenLocKeys = new Set();

      locLines.push(`${daBom}l_english:`);

      function addLoc(name){
        if (!name) return;
        const key = String(name).trim();
        if (!key) return;
        if (seenLocKeys.has(key)) return;
        seenLocKeys.add(key);
        // key:0 "Value"
        locLines.push(`\t${key}:0 "${key}"`);
      }

      worldCultures.forEach((culture, idx) => {
        if (!culture) return;

        const key = nameListKeyForCulture(culture, idx);

        const maleNames    = Array.isArray(culture.maleNames)    ? culture.maleNames    : [];
        const femaleNames  = Array.isArray(culture.femaleNames)  ? culture.femaleNames  : [];
        const dynastyNames = Array.isArray(culture.dynastyNames) ? culture.dynastyNames : [];

        // Split dynasty list: first 100 -> cadet, next 100 -> normal dynasties
        const cadetDyn = dynastyNames.slice(0, 100);
        const mainDyn  = dynastyNames.slice(100, 200);

        nameListLines.push(`${key} = {`);

        if (cadetDyn.length){
          nameListLines.push('\tcadet_dynasty_names = {');
          // "dg0"    "dg1"    ...
          nameListLines.push('\t\t"' + cadetDyn.join('"\t\t"') + '"');
          nameListLines.push('\t}');
        }

        if (mainDyn.length){
          nameListLines.push('\tdynasty_names = {');
          nameListLines.push('\t\t"' + mainDyn.join('"\t\t"') + '"');
          nameListLines.push('\t}');
        }

        if (maleNames.length){
          nameListLines.push('\tmale_names = {');
          // Names in one big line, quoted
          nameListLines.push('\t\t"' + maleNames.join('"\t\t"') + '"');
          nameListLines.push('\t}');
        }

        if (femaleNames.length){
          nameListLines.push('\tfemale_names = {');
          nameListLines.push('\t\t"' + femaleNames.join('"\t\t"') + '"');
          nameListLines.push('\t}');
        }

        nameListLines.push('\tfounder_named_dynasties = yes');
        nameListLines.push(''); // blank line between entries
        nameListLines.push('}');

        // Collect localization keys for ALL names we emitted
        maleNames.forEach(addLoc);
        femaleNames.forEach(addLoc);
        dynastyNames.forEach(addLoc);
      });

      const culturalNamesListText = nameListLines.join('\n');
      const locText = locLines.join('\n');

      saveText(culturalNamesListText, 'cultural_names_list.txt');
      saveText(locText, 'cultural_names_l_english.yml');

      setStatusSafe(
        `Exported cultural_names_list.txt and cultural_names_l_english.yml for ${worldCultures.length} cultures.`
      );
    } catch(err){
      console.error(err);
      alert('Failed to export cultural names (see console).');
    }
  }

  btn.addEventListener('click', exportCulturalNames);
})();