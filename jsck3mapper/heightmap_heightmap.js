// ===== Export heightmap.heightmap =====
(function addHeightmapMetaButton(){
  const headerCards = document.querySelectorAll('header .row.card');
  if (!headerCards.length) return;
  const host = headerCards[0];

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'downloadHeightmapMeta';
  btn.textContent = 'Export heightmap.heightmap';
  host.appendChild(btn);

  btn.addEventListener('click', () => {
    if (!W || !H) { alert('Load a heightmap first.'); return; }

    // Format exactly as requested
    const lines = [];
    lines.push(`heightmap_file="map_data/packed_heightmap.png"`);
    lines.push(`indirection_file="map_data/indirection_heightmap.png"`);
    lines.push(`original_heightmap_size={ ${W} ${H} }`);
    lines.push(`tile_size=33`);
    lines.push(`should_wrap_x=no`);
    lines.push(`level_offsets={ { 0 0 } { 0 0 } { 0 42 } { 0 667 } { 0 879 } }`);
    lines.push(`max_compress_level=4`);
    lines.push(`empty_tile_offset={ 220 30 }`);

    const txt = lines.join('\n');
    const blob = new Blob([txt], { type:'text/plain;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heightmap.heightmap';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    if (typeof setStatus === 'function') {
      setStatus(`Exported heightmap.heightmap (${W}×${H}).`);
    }
  });
})();