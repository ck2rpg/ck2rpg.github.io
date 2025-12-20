(function addGeneratedLanguagesExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Export generated_languages.txt';
  btn.id = 'exportGeneratedLanguages';
  host.appendChild(btn);

  function randColor() {
    return `${(Math.random()*0.8+0.1).toFixed(2)} ${(Math.random()*0.8+0.1).toFixed(2)} ${(Math.random()*0.8+0.1).toFixed(2)}`;
  }

  function exportLanguages() {
    if (!Array.isArray(worldCultures)) {
      alert("No cultures exist.");
      return;
    }

    // Collect unique languages
    const langs = new Map();  
    for (const c of worldCultures) {
      if (!c || !c.language) continue;
      if (!langs.has(c.language)) langs.set(c.language, randColor());
    }

    let out = "";

    for (const [lang, col] of langs.entries()) {
      out += `
${lang} = {
	type = language
	is_shown = {
		language_is_shown_trigger = {
			LANGUAGE = ${lang}
		}
	}
	ai_will_do = {
		value = 10
		if = {
			limit = { has_cultural_pillar = ${lang} }
			multiply = 10
		}
	}
	color = { ${col} }
}
`;
    }

    const blob = new Blob([out], {type:'text/plain'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'generated_languages.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  btn.addEventListener('click', exportLanguages);
})();

(function addGeneratedHeritagesExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Export generated_heritages.txt';
  btn.id = 'exportGeneratedHeritages';
  host.appendChild(btn);

  function exportHeritages() {
    const heritages = new Set();

    // Prefer worldCultures if they store heritageId
    if (Array.isArray(worldCultures)) {
      for (const c of worldCultures) {
        if (c?.heritageId) heritages.add(String(c.heritageId).trim());
      }
    }

    // Also scan seeds (backup)
    if (Array.isArray(seeds)) {
      for (const s of seeds) {
        if (s?.heritageId) heritages.add(String(s.heritageId).trim());
      }
    }

    // Clean: remove empties / weird values
    for (const h of [...heritages]) {
      if (!h || h === 'undefined' || h === 'null') heritages.delete(h);
    }

    if (heritages.size === 0) {
      alert("No heritage IDs found.");
      return;
    }

    // Stable order (optional but nice for diffs)
    const ordered = [...heritages].sort((a,b)=> a.localeCompare(b));

    let out = "";
    out += "";
    out += "";

    for (const h of ordered) {
      out +=
`${h} = {
\ttype = heritage
\tis_shown = {
\t\theritage_is_shown_trigger = {
\t\t\tHERITAGE = ${h}
\t\t}
\t}
\taudio_parameter = european
}

`;
    }

    const blob = new Blob([out], {type:'text/plain'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'generated_heritages.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  btn.addEventListener('click', exportHeritages);
})();

(function addGenCulturalLanguagesYmlExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Export gen_cultural_languages_l_english.yml';
  btn.id = 'exportGenCulturalLanguagesYml';
  host.appendChild(btn);

  // YML safety: CK3 localization dislikes unescaped quotes/backslashes.
  function ymlEscape(str) {
    return String(str ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
  }

  function exportGenCulturalLanguagesYml() {
    if (!Array.isArray(worldCultures) || worldCultures.length === 0) {
        alert("No cultures exist.");
        return;
    }

    // Map languageKey -> displayName
    const langToName = new Map();

    // 1) Pull names from cultures (preferred)
    for (const c of worldCultures) {
        const key = (c?.language ?? '').trim();
        if (!key) continue;

        // Prefer the thing you said you have:
        // culture.genLanguage.name
        let name =
        c?.genLanguage?.name ??
        c?.genLanguageName ??
        c?.languageName ??
        null;

        if (typeof name === 'string') name = name.trim();
        if (!name) continue;

        // First one wins (stable)
        if (!langToName.has(key)) langToName.set(key, name);
    }

    // 2) If any languages still missing a name, optionally generate them
    // (remove this block if you NEVER want fallback generation)
    for (const c of worldCultures) {
        const key = (c?.language ?? '').trim();
        if (!key || langToName.has(key)) continue;

        // use your generator to produce a display name
        const L = genLanguage();
        const display = makeRandomWord(L, { minLen: 3, maxLen: 9 });
        langToName.set(key, display);

        // also store back onto the culture for future exports
        if (!c.genLanguage) c.genLanguage = {};
        c.genLanguage.name = display;
    }

    if (langToName.size === 0) {
        alert("No language display names found. Expected culture.genLanguage.name (or similar).");
        return;
    }

    const ordered = [...langToName.entries()].sort((a,b)=>a[0].localeCompare(b[0]));

    // Build file
    let out = `${daBom}l_english:\n`;

    for (const [langKey, displayName] of ordered) {
        // IMPORTANT:
        // If your langKey already looks like "language_bulkyeconomics",
        // then the localization key should be "language_bulkyeconomics_name".
        // (NOT "language_language_bulkyeconomics_name")
        out += ` ${langKey}_name: "${ymlEscape(displayName)}"\n`;
    }

    const blob = new Blob([out], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'gen_cultural_languages_l_english.yml';
    a.click();
    URL.revokeObjectURL(url);
    }


  btn.addEventListener('click', exportGenCulturalLanguagesYml);
})();


(function addGenCulturalHeritagesYmlExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Export gen_cultural_heritages_l_english.yml';
  btn.id = 'exportGenCulturalHeritagesYml';
  host.appendChild(btn);

  function ymlEscape(str) {
    return String(str ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
  }

  function exportGenCulturalHeritagesYml() {
    if (!Array.isArray(worldHeritages) || worldHeritages.length === 0) {
      alert("No worldHeritages exist.");
      return;
    }

    const herToName = new Map();

    for (const h of worldHeritages) {
      const id = String(h?.id ?? '').trim();
      if (!id) continue;
      if (herToName.has(id)) continue;

      const firstCulture = Array.isArray(h.cultures) ? h.cultures[0] : null;
      const lang = firstCulture?.genLanguage;
      if (!lang) {
        console.warn('Missing cultures[0].genLanguage for heritage:', id, h);
        continue;
      }

      const display = makeRandomWord(lang, { minLen: 4, maxLen: 10 });
      herToName.set(id, display);
    }

    if (herToName.size === 0) {
      alert("No heritage names generated (need worldHeritages[].cultures[0].genLanguage).");
      return;
    }

    const ordered = [...herToName.entries()].sort((a,b)=>a[0].localeCompare(b[0]));

    let out = `${daBom}l_english:\n`;
    for (const [id, displayName] of ordered) {
      // Example desired: heritage_cccgiantsun_seed_name: "Ceant"
      out += `${id}_name: "${ymlEscape(displayName)}"\n`;
    }

    const blob = new Blob([out], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'gen_cultural_heritages_l_english.yml';
    a.click();
    URL.revokeObjectURL(url);
  }

  btn.addEventListener('click', exportGenCulturalHeritagesYml);
})();

(function addGenHybridCreationNamesExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Export gen_hybrid_creation_names.txt';
  btn.id = 'exportGenHybridCreationNames';
  host.appendChild(btn);

  // seed.color is a decimal 0xRRGGBB (e.g. 1811535). Convert to {r,g,b}.
  function colorIntToRgb(colorInt){
    const n = (Number(colorInt) >>> 0) & 0xFFFFFF;
    return {
      r: (n >> 16) & 255,
      g: (n >> 8) & 255,
      b: (n >> 0) & 255
    };
  }

  function exportGenHybridCreationNames(){
    if (!Array.isArray(seeds) || seeds.length === 0) {
      alert("No seeds exist.");
      return;
    }

    let out = "";
    let count = 0;

    for (const s of seeds) {
      if (!s?.isLand) continue;

      const { r, g, b } = colorIntToRgb(s.color);
      const rgbKey = `R${r}G${g}B${b}`;
      const hybridKey = `${rgbKey}_hybrid`;

      out +=
`${hybridKey} = {
  trigger = {
      capital_barony = title:b_${rgbKey}
  }
  hybrid = yes
}
`;
      count++;
    }

    if (count === 0) {
      alert("No land seeds found (seed.isLand !== true).");
      return;
    }

    const blob = new Blob([out], { type:'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'gen_hybrid_creation_names.txt'; // (keeping your requested filename spelling)
    a.click();
    URL.revokeObjectURL(url);
  }

  btn.addEventListener('click', exportGenHybridCreationNames);
})();

(function addGenHybridCreationLocalizationExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Export gen_hybrid_cultures_l_english.yml';
  btn.id = 'exportGenHybridCreationNamesYml';
  host.appendChild(btn);

  // seed.color is a decimal 0xRRGGBB (e.g. 1811535). Convert to {r,g,b}.
  function colorIntToRgb(colorInt){
    const n = (Number(colorInt) >>> 0) & 0xFFFFFF;
    return {
      r: (n >> 16) & 255,
      g: (n >> 8) & 255,
      b: (n >> 0) & 255
    };
  }

  // CK3 localization dislikes unescaped quotes/backslashes.
  function ymlEscape(str) {
    return String(str ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
  }

  function exportGenHybridCreationNamesYml(){
    if (!Array.isArray(seeds) || seeds.length === 0) {
      alert("No seeds exist.");
      return;
    }

    const rows = [];
    for (const s of seeds) {
      if (!s?.isLand) continue;

      const { r, g, b } = colorIntToRgb(s.color);
      const rgbKey = `R${r}G${g}B${b}`;
      const hybridKey = `${rgbKey}_hybrid`;

      const name = (s.displayName ?? '').trim() || rgbKey; // fallback just in case
      const esc = ymlEscape(name);

      // Your requested format: both keys map to the same display string
      rows.push(`${hybridKey}: "${esc}"`);
      rows.push(`${hybridKey}_name: "${esc}"`);
    }

    if (rows.length === 0) {
      alert("No land seeds found (seed.isLand !== true).");
      return;
    }

    // Stable order (optional, but nice for diffs)
    rows.sort((a,b)=> a.localeCompare(b));

    let out = `${daBom}l_english:\n` + rows.join("\n") + "\n";

    const blob = new Blob([out], { type:'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'gen_hybrid_cultures_l_english.yml'; // keeping your spelling
    a.click();
    URL.revokeObjectURL(url);
  }

  btn.addEventListener('click', exportGenHybridCreationNamesYml);
})();

(function addGenCulturesYmlExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Export gen_cultures_l_english.yml';
  btn.id = 'exportGenCulturesYml';
  host.appendChild(btn);

  function ymlEscape(str) {
    return String(str ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
  }

  function exportGenCulturesYml(){
    if (!Array.isArray(worldCultures) || worldCultures.length === 0) {
      alert("No cultures exist.");
      return;
    }

    // key -> culture.name
    const map = new Map();

    for (const c of worldCultures) {
      if (!c) continue;

      // Prefer the culture key you actually write out in generated_cultures.txt
      const key = String(c.key || c.id || c.cultureId || '').trim();
      if (!key) continue;

      // ONLY use c.name (fallback to key if missing so we don't emit blank)
      const name = String(c.name ?? '').trim() || key;

      if (!map.has(key)) map.set(key, name);
    }

    if (map.size === 0) {
      alert("No valid culture keys found (worldCultures[].key / id / cultureId).");
      return;
    }

    const ordered = [...map.entries()].sort((a,b)=> a[0].localeCompare(b[0]));

    let out = `${daBom}l_english:\n`;
    for (const [key, name] of ordered) {
      const esc = ymlEscape(name);

      // Fix typo: collective_noun
      out += `${key}_group: "${esc}"\n`;
      out += `${key}_group_collective_noun: "${esc}"\n`;
      out += `${key}_prefix: "${esc}"\n`;
      out += `${key}: "${esc}"\n`;
      out += `${key}_collective_noun: "${esc}"\n`;
    }

    const blob = new Blob([out], { type:'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'gen_cultures_l_english.yml';
    a.click();
    URL.revokeObjectURL(url);
  }

  btn.addEventListener('click', exportGenCulturesYml);
})();

(function addGenNameListsYmlExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Export gen_name_lists_l_english.yml';
  btn.id = 'exportGenNameListsYml';
  host.appendChild(btn);

  function ymlEscape(str) {
    return String(str ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
  }

  function exportGenNameListsYml(){
    if (!Array.isArray(worldCultures) || worldCultures.length === 0) {
      alert("No cultures exist.");
      return;
    }

    // cultureKey -> culture.name
    const map = new Map();

    for (const c of worldCultures) {
      if (!c) continue;

      const key = String(c.key || c.id || c.cultureId || '').trim();
      if (!key) continue;

      // ONLY use c.name (fallback to key if missing so we don't emit blank)
      const name = String(c.name ?? '').trim() || key;

      if (!map.has(key)) map.set(key, name);
    }

    if (map.size === 0) {
      alert("No valid culture keys found (worldCultures[].key / id / cultureId).");
      return;
    }

    const ordered = [...map.entries()].sort((a,b)=> a[0].localeCompare(b[0]));

    let out = `${daBom}l_english:\n`;
    for (const [key, name] of ordered) {
      out += `name_list_${key}: "${ymlEscape(name)}"\n`;
    }

    const blob = new Blob([out], { type:'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'gen_name_lists_l_english.yml';
    a.click();
    URL.revokeObjectURL(url);
  }

  btn.addEventListener('click', exportGenNameListsYml);
})();
