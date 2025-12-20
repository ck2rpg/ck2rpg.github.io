(function setupDownloadAll(){
  const btn = document.getElementById('downloadAll');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;

    try {
      // 1) Download map PNG for each level
      await downloadAllLevelsPNGs();

      // 2) Click every "Export" button (same as before)
      await clickAllExportButtons();
    } finally {
      btn.disabled = false;
    }
  });

  async function downloadAllLevelsPNGs(){
    const seg = document.getElementById('levelSeg');
    const downloadPngBtn = document.getElementById('download');
    if (!seg || !downloadPngBtn) return;

    const levelButtons = Array.from(seg.querySelectorAll('button[data-level]'))
      .filter(b => !b.disabled && b.offsetParent !== null);

    for (let i = 0; i < levelButtons.length; i++) {
      const b = levelButtons[i];

      // switch level
      b.click();

      // give your renderer time to update
      await sleep(120);

      // download current map
      downloadPngBtn.click();

      // stagger downloads to avoid browser throttling
      await sleep(350);
    }
  }

  async function clickAllExportButtons(){
    const exportButtons = Array.from(document.querySelectorAll('button'))
      .filter(b =>
        b !== btn &&
        !b.disabled &&
        b.offsetParent !== null &&
        /\bexport\b/i.test(b.textContent)
      );

    for (let i = 0; i < exportButtons.length; i++) {
      exportButtons[i].click();
      await sleep(250);
    }
  }

  function sleep(ms){
    return new Promise(res => setTimeout(res, ms));
  }
})();


/*(function setupDownloadAll(){
  const btn = document.getElementById('downloadAll');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    // Find *all* buttons whose visible text includes "Export"
    const exportButtons = Array.from(document.querySelectorAll('button'))
      .filter(b =>
        b !== btn &&
        !b.disabled &&
        b.offsetParent !== null &&              // visible
        /\bexport\b/i.test(b.textContent)       // matches "Export"
      );

    if (!exportButtons.length) {
      alert('No export buttons found.');
      return;
    }

    console.log(`Download All: triggering ${exportButtons.length} exports`);

    // Sequential clicks with delay to avoid browser blocking
    for (let i = 0; i < exportButtons.length; i++) {
      const b = exportButtons[i];
      console.log(`→ Export ${i+1}/${exportButtons.length}:`, b.textContent.trim());
      b.click();

      // IMPORTANT: delay between downloads
      await sleep(250);
    }

    console.log('Download All complete.');
  });

  function sleep(ms){
    return new Promise(res => setTimeout(res, ms));
  }
})();*/
