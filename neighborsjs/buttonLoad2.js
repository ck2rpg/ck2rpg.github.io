btnLoad.addEventListener("click", async () => {
  try {
    if (!imgFile.files[0]) throw new Error("Please choose a province map image.");

    // ------------------------------------------------------------
    // Ensure offscreen canvases exist (reused across loads)
    // ------------------------------------------------------------
    // Rivers
    window._rcv = window._rcv || document.createElement("canvas");
    window._rctx = window._rctx || window._rcv.getContext("2d", { willReadFrequently: true });

    // Height
    window._hcv = window._hcv || document.createElement("canvas");
    window._hctx = window._hctx || window._hcv.getContext("2d", { willReadFrequently: true });

    // Tect meta
    window._tcv = window._tcv || document.createElement("canvas");
    window._tctx = window._tctx || window._tcv.getContext("2d", { willReadFrequently: true });

    // Köppen
    window._kcv = window._kcv || document.createElement("canvas");
    window._kctx = window._kctx || window._kcv.getContext("2d", { willReadFrequently: true });

    // Texture
    window._xcv = window._xcv || document.createElement("canvas");
    window._xctx = window._xctx || window._xcv.getContext("2d", { willReadFrequently: true });

    // Terrain
    window._pcv = window._pcv || document.createElement("canvas");
    window._pctx = window._pctx || window._pcv.getContext("2d", { willReadFrequently: true });

    // Alias to match your existing variable names (so the rest of your code can keep using them)
    const rcv = window._rcv, rctx = window._rctx;
    const hcv = window._hcv, hctx = window._hctx;
    const tcv = window._tcv, tctx = window._tctx;
    const kcv = window._kcv, kctx = window._kctx;
    const xcv = window._xcv, xctx = window._xctx;
    const pcv = window._pcv, pctx = window._pctx;

    // ------------------------------------------------------------
    // Load province map
    // ------------------------------------------------------------
    setStatus("Loading image...");
    loadedImage = await loadImageFile(imgFile.files[0]);
    cv.width = loadedImage.naturalWidth || loadedImage.width;
    cv.height = loadedImage.naturalHeight || loadedImage.height;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(loadedImage, 0, 0);
    dimLbl.textContent = `${cv.width}×${cv.height}`;

    // ------------------------------------------------------------
    // Reset optional states
    // ------------------------------------------------------------
    // Height
    let heightReady = false;
    loadedHeightImage = null;

    // Rivers
    let riverReady = false;
    loadedRiverImage = null;

    // Tect meta
    let tectReady = false;
    loadedTectMetaImage = null;
    let tectMetaImageData = null;
    window.tectMeta = null;

    // Köppen
    let koppenReady = false;
    let loadedKoppenImage = null;
    let koppenImageData = null;
    window.koppenMap = null;

    // Texture
    let textureReady = false;
    let loadedTextureImage = null;
    let textureImageData = null;
    window.textureMap = null;

    // Terrain
    let terrainReady = false;
    let loadedTerrainImage = null;
    let terrainImageData = null;
    window.terrainMap = null;

    // ------------------------------------------------------------
    // Optional river map
    // ------------------------------------------------------------
    if (riverFile && riverFile.files && riverFile.files[0]) {
      setStatus("Loading river map...");
      loadedRiverImage = await loadImageFile(riverFile.files[0]);

      rcv.width = cv.width;
      rcv.height = cv.height;
      rctx.clearRect(0, 0, rcv.width, rcv.height);
      rctx.drawImage(loadedRiverImage, 0, 0, rcv.width, rcv.height);

      // (optional) expose if your analyzers want it
      window.riverMap = { W: rcv.width, H: rcv.height, canvas: rcv, ctx: rctx };

      riverReady = true;
    } else {
      // keep it quiet, or warn if you prefer:
      // console.warn("River map not uploaded (optional).");
      window.riverMap = null;
    }

    // ------------------------------------------------------------
    // Optional tectonics meta
    // ------------------------------------------------------------
    if (tectMetaFile && tectMetaFile.files && tectMetaFile.files[0]) {
      setStatus("Loading tectonics meta...");
      loadedTectMetaImage = await loadImageFile(tectMetaFile.files[0]);

      tcv.width = cv.width;
      tcv.height = cv.height;
      tctx.clearRect(0, 0, tcv.width, tcv.height);
      tctx.drawImage(loadedTectMetaImage, 0, 0, tcv.width, tcv.height);

      tectMetaImageData = tctx.getImageData(0, 0, tcv.width, tcv.height);

      window.tectMeta = {
        W: tcv.width,
        H: tcv.height,
        data: tectMetaImageData.data, // Uint8ClampedArray RGBA
        imageData: tectMetaImageData,
        canvas: tcv,
        ctx: tctx
      };

      tectReady = true;
    } else {
      window.tectMeta = null;
    }

    // ------------------------------------------------------------
    // Optional Köppen map
    // ------------------------------------------------------------
    if (typeof koppenFile !== "undefined" && koppenFile && koppenFile.files && koppenFile.files[0]) {
      setStatus("Loading Köppen map...");
      loadedKoppenImage = await loadImageFile(koppenFile.files[0]);

      kcv.width = cv.width;
      kcv.height = cv.height;
      kctx.clearRect(0, 0, kcv.width, kcv.height);
      kctx.drawImage(loadedKoppenImage, 0, 0, kcv.width, kcv.height);

      koppenImageData = kctx.getImageData(0, 0, kcv.width, kcv.height);

      window.koppenMap = {
        W: kcv.width,
        H: kcv.height,
        data: koppenImageData.data,
        imageData: koppenImageData,
        canvas: kcv,
        ctx: kctx
      };

      koppenReady = true;
    } else {
      window.koppenMap = null;
    }

    // ------------------------------------------------------------
    // Optional texture map
    // ------------------------------------------------------------
    if (typeof textureFile !== "undefined" && textureFile && textureFile.files && textureFile.files[0]) {
      setStatus("Loading texture map...");
      loadedTextureImage = await loadImageFile(textureFile.files[0]);

      xcv.width = cv.width;
      xcv.height = cv.height;
      xctx.clearRect(0, 0, xcv.width, xcv.height);
      xctx.drawImage(loadedTextureImage, 0, 0, xcv.width, xcv.height);

      textureImageData = xctx.getImageData(0, 0, xcv.width, xcv.height);

      window.textureMap = {
        W: xcv.width,
        H: xcv.height,
        data: textureImageData.data,
        imageData: textureImageData,
        canvas: xcv,
        ctx: xctx
      };

      textureReady = true;
    } else {
      window.textureMap = null;
    }

    // ------------------------------------------------------------
    // Optional terrain map
    // ------------------------------------------------------------
    if (typeof terrainFile !== "undefined" && terrainFile && terrainFile.files && terrainFile.files[0]) {
      setStatus("Loading terrain map...");
      loadedTerrainImage = await loadImageFile(terrainFile.files[0]);

      pcv.width = cv.width;
      pcv.height = cv.height;
      pctx.clearRect(0, 0, pcv.width, pcv.height);
      pctx.drawImage(loadedTerrainImage, 0, 0, pcv.width, pcv.height);

      terrainImageData = pctx.getImageData(0, 0, pcv.width, pcv.height);

      window.terrainMap = {
        W: pcv.width,
        H: pcv.height,
        data: terrainImageData.data,
        imageData: terrainImageData,
        canvas: pcv,
        ctx: pctx
      };

      terrainReady = true;
    } else {
      window.terrainMap = null;
    }

    // ------------------------------------------------------------
    // Optional heightmap
    // ------------------------------------------------------------
    if (heightFile && heightFile.files && heightFile.files[0]) {
      setStatus("Loading heightmap...");
      loadedHeightImage = await loadImageFile(heightFile.files[0]);

      hcv.width = cv.width;
      hcv.height = cv.height;
      hctx.clearRect(0, 0, hcv.width, hcv.height);
      hctx.drawImage(loadedHeightImage, 0, 0, hcv.width, hcv.height);

      // (optional) expose if your analyzers want it
      window.heightMap = { W: hcv.width, H: hcv.height, canvas: hcv, ctx: hctx };

      heightReady = true;
    } else {
      window.heightMap = null;
    }


    let stats;
    // ------------------------------------------------------------
    // Read JSON
    // ------------------------------------------------------------
    if (jsonFile.files && jsonFile.files[0]) {
        setStatus("Reading JSON...");
        const txt = await readFileAsText(jsonFile.files[0]);
        loadedProvincesList = parseProvincesText(txt);
        stats = buildProvinceGlobals(loadedProvincesList)
    }  else {
        stats = buildProvinceGlobalsFromImages();
    }


    // ------------------------------------------------------------
    // Build globals
    // ------------------------------------------------------------
    setStatus("Building global province tables...");
    // Your previous condition `if (!jsonFile.files)` never triggered.
    // Choose the builder you actually want:
    

    // ------------------------------------------------------------
    // Status
    // ------------------------------------------------------------
    setStatus(
      `Loaded.
- Image: ${cv.width}×${cv.height} (${fmt(cv.width * cv.height)} px)
- Heightmap: ${heightReady ? `${hcv.width}×${hcv.height}` : "(none)"}
- River map: ${riverReady ? `${rcv.width}×${rcv.height}` : "(none)"}
- Tect meta: ${tectReady ? `${tcv.width}×${tcv.height}` : "(none)"}
- Köppen map: ${koppenReady ? `${kcv.width}×${kcv.height}` : "(none)"}
- Texture map: ${textureReady ? `${xcv.width}×${xcv.height}` : "(none)"}
- Terrain map: ${terrainReady ? `${pcv.width}×${pcv.height}` : "(none)"}

- Color-mapped provinces: ${fmt(stats.count)}
- Missing/invalid color entries: ${fmt(stats.missingColor)}

Globals:
- window.provinces[id]
- window.connectedTerrainRegions
- window.landmasses
- window.waterbodies
- window.tectMeta (if loaded)
- window.koppenMap (if loaded)
- window.textureMap (if loaded)
- window.terrainMap (if loaded)
- window.heightMap / window.riverMap (if you use them)`
    );

    btnCompute.disabled = false;
    btnExport.disabled = true;

    // If other parts of your code expect these names, keep them updated:
    // (Only do this if you actually have globals named rcv/hcv/tcv elsewhere.)
    window.rcv = rcv; window.rctx = rctx;
    window.hcv = hcv; window.hctx = hctx;
    window.tcv = tcv; window.tctx = tctx;
    window.kcv = kcv; window.kctx = kctx;
    window.xcv = xcv; window.xctx = xctx;
    window.pcv = pcv; window.pctx = pctx;

  } catch (err) {
    console.error(err);
    setStatus("ERROR: " + (err && err.message ? err.message : String(err)));
    btnCompute.disabled = true;
    btnExport.disabled = true;
  }
});
