loadHeightmapBtn.addEventListener('click', () => fileInput.click());
loadTerrainBtn.addEventListener('click', () => terrainFile.click());
loadKoppenBtn.addEventListener('click', () => koppenFile.click());

terrainFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();

  if (img.naturalWidth !== W || img.naturalHeight !== H) {
    alert(`Terrain map must be ${W}×${H}`);
    return;
  }

  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);

  terrainMap = ctx.getImageData(0, 0, W, H).data;

  setStatus("Terrain map imported.");
});

koppenFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!W || !H) {
      alert('Load a heightmap first so we know the map size.');
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();

    if (img.naturalWidth !== W || img.naturalHeight !== H) {
      alert(`Köppen map must be ${W}×${H}`);
      return;
    }

    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, W, H).data;

    koppenMap = new Int16Array(W * H);
    koppenMap.fill(-1);

    // Exact RGB match against KOPPEN_CLASSES colors
    for (let i = 0, pix = 0; i < imgData.length; i += 4, pix++) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];

      let idxMatch = -1;
      for (let ci = 0; ci < KOPPEN_RGB.length; ci++) {
        const cdef = KOPPEN_RGB[ci];
        if (cdef.r === r && cdef.g === g && cdef.b === b) {
          idxMatch = cdef.idx;
          break;
        }
      }

      koppenMap[pix] = idxMatch; // -1 = unknown
    }

    setStatus('Köppen climate map imported.');
  });

    // ===== Load Image & Mask =====
  fileInput.addEventListener('change', async (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image(); img.src=url; await img.decode();
    W = img.naturalWidth; H = img.naturalHeight;

    heightCanvas.width=W; heightCanvas.height=H;
    maskCanvas.width=W; maskCanvas.height=H;
    view.width = W; view.height = H;
    setPreviewSize();

    hctx.drawImage(img,0,0);
    const imgData = hctx.getImageData(0,0,W,H).data;
    heightData = new Uint8Array(W*H);
    for(let i=0,j=0;i<imgData.length;i+=4,++j){
      const r=imgData[i], g=imgData[i+1], b=imgData[i+2];
      heightData[j] = (r*0.299 + g*0.587 + b*0.114)|0;
    }
    computeMask();
    seeds=[]; label=null; palette=[]; legend.textContent='';
    resetHierarchy();
    renderPreview();
    setStatus(`Loaded ${W}×${H}`);
  });