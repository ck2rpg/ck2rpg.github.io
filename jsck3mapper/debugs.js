// <!-- === Export title_hierarchy_debug.txt (hierarchical title & province names) ===== -->
(function addTitleHierarchyDebugExporter(){
  const host = document.querySelector('header .row.card');
  if (!host) { console.warn('title hierarchy debug: header host not found'); return; }

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'downloadTitleHierarchyDebug';
  btn.textContent = 'Export title hierarchy debug';
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

  function exportTitleHierarchyDebug(){
    try {
      if (!Array.isArray(seeds) || !seeds.length){
        alert('No provinces/seeds available. Generate the world first.');
        return;
      }

      // Ensure worldTitles exists
      if (!window.worldTitles) {
        if (typeof buildWorldTitles === 'function') {
          buildWorldTitles();
        }
      }

      // Ensure everything has place names (titles + provinces)
      if (typeof assignPlaceNamesToTitles === 'function') {
        assignPlaceNamesToTitles();
      }

      const wt = window.worldTitles;
      if (!wt || !Array.isArray(wt.empires)) {
        alert('worldTitles not built. Run the hierarchy builder first.');
        return;
      }

      const lines = [];

      function nodeName(node, fallbackPrefix){
        if (!node) return `${fallbackPrefix || 'title'}_null`;
        return (
          node.placeName ||
          node.displayName ||
          node.id ||
          `${fallbackPrefix || 'title'}_${node.index}`
        );
      }

      function provinceName(seed, idx){
        if (!seed) return `province_${idx}`;
        return (
          seed.placeName ||
          seed.displayName ||
          seed.name ||
          (typeof seed.id === 'number' ? `province_${seed.id}` : `province_${idx}`)
        );
      }

      // Walk hierarchy: Empire -> Kingdom -> Duchy -> County -> Province
      const empires = wt.empires || [];

      for (const e of empires) {
        if (!e) continue;

        const eName = nodeName(e, 'empire');
        lines.push(eName);

        const kingdoms = Array.isArray(e.children) ? e.children : [];

        for (const k of kingdoms) {
          if (!k) continue;
          const kName = nodeName(k, 'kingdom');
          lines.push(`+${kName}`);

          const duchies = Array.isArray(k.children) ? k.children : [];

          for (const d of duchies) {
            if (!d) continue;
            const dName = nodeName(d, 'duchy');
            lines.push(`++${dName}`);

            const counties = Array.isArray(d.children) ? d.children : [];

            for (const c of counties) {
              if (!c) continue;
              const cName = nodeName(c, 'county');
              lines.push(`+++${cName}`);

              // County children are seed objects (provinces) per buildWorldTitles
              const provSeeds = Array.isArray(c.children) ? c.children : [];
              for (let i = 0; i < provSeeds.length; i++) {
                const s = provSeeds[i];
                const idx = (s && typeof s.id === 'number') ? s.id : i;
                const pName = provinceName(s, idx);
                lines.push(`++++${pName}`);
              }
            }
          }
        }
      }

      saveText(lines.join('\n'), 'title_hierarchy_debug.txt');
      setStatusSafe('Exported title_hierarchy_debug.txt (hierarchical title & province names).');
    } catch (err) {
      console.error(err);
      alert('Failed to export title hierarchy debug (see console).');
    }
  }

  btn.addEventListener('click', exportTitleHierarchyDebug);
})();
