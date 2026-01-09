btnReset.addEventListener("click", () => {
    loadedImage = null;
    loadedProvincesList = null;

    window.provinces = [];
    window.provinceByRgbInt = new Map();

    window.connectedTerrainRegions = [];
    window.landmasses = [];
    window.waterbodies = [];
    window.lastExportPayload = null;

    ctx.clearRect(0,0,cv.width,cv.height);
    cv.width = 2; cv.height = 2;
    dimLbl.textContent = "—";
    imgFile.value = "";
    jsonFile.value = "";
    btnCompute.disabled = true;
    btnExport.disabled = true;
    loadedHeightImage = null;
    heightReady = false;
    heightFile.value = "";
    hctx.clearRect(0,0,hcv.width,hcv.height);
    hcv.width = 2; hcv.height = 2;
    setStatus("Status: idle");
});