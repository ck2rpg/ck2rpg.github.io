btnExport.addEventListener("click", () => {
    try {
    const payload = window.lastExportPayload || makeExportPayload();
    downloadText("provinces_with_regions_landmasses_waterbodies_coastdist.json", JSON.stringify(payload, null, 2));
    setStatus(statusEl.textContent + "\n\nExported: provinces_with_regions_landmasses_waterbodies_coastdist.json");
    } catch (err) {
    console.error(err);
    setStatus("ERROR: " + (err && err.message ? err.message : String(err)));
    }
});