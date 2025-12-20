// === Waters map button (IIFE) =============================================
// Adds a "Waters" button into the existing #levelSeg row.
// Renders: land = white, water provinces colored by seed.waterType.
// Requires: label, W, H, seeds[], provIsLand (or seeds[i].isLand), and waterType already annotated.
(function addWatersMapButton(){
  const seg = document.getElementById('levelSeg');
  if(!seg) return;

  // Avoid double-add if script hot-reloads
  if(seg.querySelector('button[data-level="waters"]')) return;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.dataset.level = 'waters';
  btn.textContent = 'Waters';
  seg.appendChild(btn);

  // Keep your active-button behavior consistent
  btn.addEventListener('click', ()=>{
    [...seg.querySelectorAll('button')].forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentLevel = 'waters';
    renderWatersLevel();
  });

  function renderWatersLevel(){
    if(!label){ renderPreview(); return; }

    // Ensure we have waterType classification
    // If you used annotateWaterTypes_BFSWaterbodies, call it once before rendering.
    // Here we only sanity-check:
    let anyWaterTyped = false;
    for(let i=0;i<seeds.length;i++){
      if(!seeds[i].isLand && seeds[i].waterType){ anyWaterTyped = true; break; }
    }
    if(!anyWaterTyped){
      setStatus('No waterType found. Run your water annotator first.');
      // Still render land/sea baseline:
      renderLevel('provinces');
      return;
    }

    const img = vctx.createImageData(W,H);
    const d = img.data;

    // Colors (RGB ints). Change freely.
    const C_LAND        = 0xFFFFFF; // white
    const C_SEA         = 0x0A2236; // deep ocean
    const C_COASTAL     = 0x2B7A78; // teal
    const C_RIVER       = 0x2E86DE; // bright blue
    const C_LAKE        = 0x5DADE2; // lighter blue
    const C_UNKNOWNW    = 0x444444; // fallback water if missing type
    const C_UNLABELED   = 0x111111; // unlabeled pixels

    const lr=(C_LAND>>16)&255,    lg=(C_LAND>>8)&255,    lb=C_LAND&255;
    const sr=(C_SEA>>16)&255,     sg=(C_SEA>>8)&255,     sb=C_SEA&255;
    const cr=(C_COASTAL>>16)&255, cg=(C_COASTAL>>8)&255, cb=C_COASTAL&255;
    const rr=(C_RIVER>>16)&255,   rg=(C_RIVER>>8)&255,   rb=C_RIVER&255;
    const kr=(C_LAKE>>16)&255,    kg=(C_LAKE>>8)&255,    kb=C_LAKE&255;
    const ur=(C_UNKNOWNW>>16)&255,ug=(C_UNKNOWNW>>8)&255,ub=C_UNKNOWNW&255;
    const xr=(C_UNLABELED>>16)&255,xg=(C_UNLABELED>>8)&255,xb=C_UNLABELED&255;

    for(let k=0;k<label.length;k++){
      const p = label[k];
      const i = k*4;

      if(p<0){
        d[i]=xr; d[i+1]=xg; d[i+2]=xb; d[i+3]=255;
        continue;
      }

      const isLandP = (provIsLand ? (provIsLand[p]===1) : !!seeds[p].isLand);

      if(isLandP){
        d[i]=lr; d[i+1]=lg; d[i+2]=lb; d[i+3]=255;
      } else {
        const t = seeds[p].waterType;
        if(t === 'sea'){
          d[i]=sr; d[i+1]=sg; d[i+2]=sb; d[i+3]=255;
        } else if(t === 'coastal_sea'){
          d[i]=cr; d[i+1]=cg; d[i+2]=cb; d[i+3]=255;
        } else if(t === 'river'){
          d[i]=rr; d[i+1]=rg; d[i+2]=rb; d[i+3]=255;
        } else if(t === 'lake'){
          d[i]=kr; d[i+1]=kg; d[i+2]=kb; d[i+3]=255;
        } else {
          d[i]=ur; d[i+1]=ug; d[i+2]=ub; d[i+3]=255;
        }
      }
    }

    // Optional edges using your existing checkbox
    if(showEdges?.checked){
      const ex=0, ey=0, ez=0;
      function gidAt(k){
        const p=label[k]; if(p<0) return -2;
        const isLandP = (provIsLand ? (provIsLand[p]===1) : !!seeds[p].isLand);
        if(isLandP) return 1;
        // encode waterType into small ids
        const t = seeds[p].waterType;
        if(t==='sea') return 10;
        if(t==='coastal_sea') return 11;
        if(t==='river') return 12;
        if(t==='lake') return 13;
        return 14;
      }
      for(let y=1;y<H-1;y++){
        for(let x=1;x<W-1;x++){
          const k=y*W+x;
          const a=gidAt(k);
          const ii=k*4;
          if(a!==gidAt(k-1) || a!==gidAt(k+1) || a!==gidAt(k-W) || a!==gidAt(k+W)){
            d[ii]=ex; d[ii+1]=ey; d[ii+2]=ez;
          }
        }
      }
    }

    vctx.putImageData(img,0,0);

    // Legend / status
    const counts = {sea:0, coastal_sea:0, river:0, lake:0, unknown:0};
    for(const s of seeds){
      if(s.isLand) continue;
      if(s.waterType==='sea') counts.sea++;
      else if(s.waterType==='coastal_sea') counts.coastal_sea++;
      else if(s.waterType==='river') counts.river++;
      else if(s.waterType==='lake') counts.lake++;
      else counts.unknown++;
    }
    legend.textContent = `Waters: sea=${counts.sea} coastal=${counts.coastal_sea} river=${counts.river} lake=${counts.lake}` + (counts.unknown?` unknown=${counts.unknown}`:'');
    setStatus('Rendered Waters map.');
  }

  // If the user clicks the existing level buttons, we want Waters to work too.
  // Your existing handler already calls renderLevel(currentLevel); for "waters"
  // that would do nothing. So we monkeypatch renderLevel just for this new level
  // WITHOUT breaking the rest of your code.
  const _renderLevel = renderLevel;
  window.renderLevel = function(level){
    if(level === 'waters') return renderWatersLevel();
    return _renderLevel(level);
  };
})();
