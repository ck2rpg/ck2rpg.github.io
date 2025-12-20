
// ===== Export default.map =====
/*
(function addDefaultMapButton(){
  const headerCards = document.querySelectorAll('header .row.card');
  if (!headerCards.length) return;
  const host = headerCards[0];

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'downloadDefaultMap';
  btn.textContent = 'Export default.map';
  host.appendChild(btn);

  btn.addEventListener('click', () => {
    try {
      if (!seeds || !seeds.length) {
        alert('No provinces found. Seed the map (land + sea) and run the Voronoi first.');
        return;
      }

      // Mirror definition.csv ordering: land first, then sea
      const landIdx = [], seaIdx = [];
      for (let i = 0; i < seeds.length; i++) {
        (seeds[i].isLand ? landIdx : seaIdx).push(i);
      }
      const total = landIdx.length + seaIdx.length;
      const landCount = landIdx.length;
      const seaCount = seaIdx.length;

      // If sea exists, it is a single contiguous ID range after land:
      // IDs: 1..landCount (land), (landCount+1)..total (sea)
      const lines = [];
      lines.push(`#max_provinces = ${total}`);
      lines.push(`definitions = "definition.csv"`);
      lines.push(`provinces = "provinces.png"`);
      lines.push(`#positions = "positions.txt"`);
      lines.push(`rivers = "rivers.png"`);
      lines.push(`#terrain_definition = "terrain.txt"`);
      lines.push(`topology = "heightmap.heightmap"`);
      lines.push(`#tree_definition = "trees.bmp"`);
      lines.push(`continent = "continent.txt"`);
      lines.push(`adjacencies = "adjacencies.csv"`);
      lines.push(`#climate = "climate.txt"`);
      lines.push(`island_region = "island_region.txt"`);
      lines.push(`seasons = "seasons.txt"`);
      lines.push('');
      lines.push('#############');
      lines.push('# SEA ZONES');
      lines.push('#############');

      if (seaCount > 0) {
        const start = landCount + 1;
        const end   = total;
        lines.push(`sea_zones = RANGE { ${start} ${end} }`);
      } else {
        lines.push(`# (No sea provinces in this map)`);
      }

      lines.push('');
      lines.push('###############');
      lines.push('# MAJOR RIVERS');
      lines.push('###############');
      lines.push(`# (Add your river_provinces here if/when you generate river IDs)`);
      lines.push('');
      lines.push('########');
      lines.push('# LAKES');
      lines.push('########');
      lines.push(`# (Add your lakes here if/when you tag lake provinces)`);
      lines.push('');
      lines.push('#####################');
      lines.push('# IMPASSABLE TERRAIN');
      lines.push('#####################');
      lines.push(`# (Add impassable_mountains / impassable_seas here if you tag them)`);
      lines.push('');

      const txt = lines.join('\n');
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'default.map';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      if (typeof setStatus === 'function') {
        setStatus(`Exported default.map (provinces: land ${landCount}, sea ${seaCount}, total ${total}).`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to export default.map (see console).');
    }
  });
})();
*/

// ===== Export default.map (waterType-aware) =====
// ===== Export default.map (vanilla-style RANGE/LIST lines) =====
(function addDefaultMapButton(){
  const headerCards = document.querySelectorAll('header .row.card');
  if (!headerCards.length) return;
  const host = headerCards[0];

  if (document.getElementById('downloadDefaultMap')) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'downloadDefaultMap';
  btn.textContent = 'Export default.map';
  host.appendChild(btn);

  btn.addEventListener('click', () => {
    try {
      if (!seeds || !seeds.length || !label) {
        alert('No provinces found. Seed the map (land + sea) and run the Voronoi first.');
        return;
      }

      // --- Ensure waterType exists (or fallback) -----------------------------
      let anyTyped = false;
      for (let p = 0; p < seeds.length; p++){
        if (!seeds[p].isLand && seeds[p].waterType) { anyTyped = true; break; }
      }
      if (!anyTyped) {
        console.warn('default.map export: No waterType found. All water will be treated as sea_zones.');
      }

      // --- Build definition.csv ordering mapping: land first, then water -----
      // MUST match your definition.csv exporter ordering.
      const landIdx = [], waterIdx = [];
      for (let p = 0; p < seeds.length; p++) (seeds[p].isLand ? landIdx : waterIdx).push(p);
      const ordered = landIdx.concat(waterIdx);

      const defIdOfProv = new Int32Array(seeds.length).fill(-1);
      for (let i = 0; i < ordered.length; i++) defIdOfProv[ordered[i]] = i + 1;

      const total = ordered.length;
      const landCount = landIdx.length;
      const waterCount = waterIdx.length;

      // --- Collect IDs by water type ----------------------------------------
      const seaZoneIds = [];
      const riverIds   = [];
      const lakeIds    = [];

      for (let p = 0; p < seeds.length; p++){
        if (seeds[p].isLand) continue;
        const id = defIdOfProv[p];
        if (id < 0) continue;

        if (!anyTyped) { seaZoneIds.push(id); continue; }

        const t = seeds[p].waterType;
        if (t === 'river') riverIds.push(id);
        else if (t === 'lake') lakeIds.push(id);
        else if (t === 'sea' || t === 'coastal_sea') seaZoneIds.push(id);
        else seaZoneIds.push(id); // unknown -> sea
      }

      seaZoneIds.sort((a,b)=>a-b);
      riverIds.sort((a,b)=>a-b);
      lakeIds.sort((a,b)=>a-b);

      // --- Helper: emit vanilla-style lines (RANGE / LIST) -------------------
      // Strategy:
      //  - consecutive runs of length >= 2 => RANGE
      //  - singletons gathered into LIST lines of up to listChunk (vanilla often uses small lists)
      function emitRangeListLines(key, ids, { listChunk = 12 } = {}){
        const out = [];
        if (!ids.length) return out;

        const singles = [];
        let i = 0;
        while (i < ids.length) {
          let a = ids[i], b = a;
          while (i + 1 < ids.length && ids[i + 1] === b + 1) { i++; b = ids[i]; }

          if (b > a) {
            out.push(`${key} = RANGE { ${a} ${b} }`);
          } else {
            singles.push(a);
          }
          i++;
        }

        for (let j = 0; j < singles.length; j += listChunk) {
          const chunk = singles.slice(j, j + listChunk);
          out.push(`${key} = LIST { ${chunk.join(' ')} }`);
        }

        return out;
      }

      // --- Write file --------------------------------------------------------
      const lines = [];
      lines.push(`#max_provinces = ${total}`);
      lines.push(`definitions = "definition.csv"`);
      lines.push(`provinces = "provinces.png"`);
      lines.push(`#positions = "positions.txt"`);
      lines.push(`rivers = "rivers.png"`);
      lines.push(`#terrain_definition = "terrain.txt"`);
      lines.push(`topology = "heightmap.heightmap"`);
      lines.push(`#tree_definition = "trees.bmp"`);
      lines.push(`continent = "continent.txt"`);
      lines.push(`adjacencies = "adjacencies.csv"`);
      lines.push(`#climate = "climate.txt"`);
      lines.push(`island_region = "island_region.txt"`);
      lines.push(`seasons = "seasons.txt"`);
      lines.push('');

      lines.push('#############');
      lines.push('# SEA ZONES');
      lines.push('#############');
      if (seaZoneIds.length) {
        lines.push(...emitRangeListLines('sea_zones', seaZoneIds, { listChunk: 16 }));
      } else {
        lines.push(`# (No sea zones)`);
      }
      lines.push('');

      lines.push('###############');
      lines.push('# MAJOR RIVERS');
      lines.push('###############');
      if (riverIds.length) {
        lines.push(...emitRangeListLines('river_provinces', riverIds, { listChunk: 16 }));
      } else {
        lines.push(`# (No major rivers)`);
      }
      lines.push('');

      lines.push('########');
      lines.push('# LAKES');
      lines.push('########');
      if (lakeIds.length) {
        lines.push(...emitRangeListLines('lakes', lakeIds, { listChunk: 24 })); // lakes list tends to be longer
      } else {
        lines.push(`# (No lakes)`);
      }
      lines.push('');

      lines.push('#####################');
      lines.push('# IMPASSABLE TERRAIN');
      lines.push('#####################');
      lines.push(`# (Add impassable_mountains / impassable_seas here if you tag them)`);
      lines.push('');

      const txt = lines.join('\n');
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'default.map';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      if (typeof setStatus === 'function') {
        setStatus(
          `Exported default.map — total=${total} land=${landCount} water=${waterCount} | sea_zones=${seaZoneIds.length} rivers=${riverIds.length} lakes=${lakeIds.length}`
        );
      }
    } catch (err) {
      console.error(err);
      alert('Failed to export default.map (see console).');
    }
  });
})();
