 // ===== Export 01_gen_defines.txt =====
(function addGenDefinesButton(){
  const headerCards = document.querySelectorAll('header .row.card');
  if (!headerCards.length) return;
  const host = headerCards[0];

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'downloadGenDefines';
  btn.textContent = 'Export 01_gen_defines.txt';
  host.appendChild(btn);

  btn.addEventListener('click', () => {
    if (!W || !H) { alert('Load a heightmap first.'); return; }

    const X = (W - 1) | 0;   // width minus 1
    const Z = (H - 1) | 0;   // height minus 1
    const Y = 50;            // vertical extent (adjust if your project needs a different value)
    const WATERLEVEL = 3.0;  // constant as requested

    const txt =
`NJominiMap = {
    WORLD_EXTENTS_X = ${X}
    WORLD_EXTENTS_Y = ${Y}
    WORLD_EXTENTS_Z = ${Z}
    WATERLEVEL = ${WATERLEVEL}
}`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '01_gen_defines.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    if (typeof setStatus === 'function') setStatus(`Exported 01_gen_defines.txt (${X}×${Y}×${Z})`);
  });
})();
