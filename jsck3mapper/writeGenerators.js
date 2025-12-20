// Writes ALL your generator files exactly as specified (names/layers/meshes),
// downloading each as its own .txt.
//
// Assumes you have:
//  - daBom (optional string prefix; if not present, it will just write plain text)
//  - a container #download-links (optional; links will still download without it)


// ===== Tree generator exporters — FAILSAFE FULL VERSION =====
//
// What this does:
// - Generates the 18 generator .txt files exactly as specified
// - Uses safe pacing + delayed URL revocation
// - Retries a couple times if something errors
// - Optionally creates visible/manual links in #download-links for anything blocked
// - Logs a full report

(function addTreeGeneratorExportButton_FAILSAFE(){
  const headerCards = document.querySelectorAll('header .row.card');
  if(!headerCards.length){
    console.warn('No header card found for tree generator button.');
    return;
  }
  const host = headerCards[0];

  // ---- button ----
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'export_tree_generators';
  btn.textContent = 'Export tree generators';
  host.appendChild(btn);

  // ---- specs (18) ----
  const SPECS = [
    { file:"reeds_01_generator_1.txt",                  name:"reeds_01_generator_1_0",                  clamp:"no", layer:"grass_layer",     mesh:"reeds_06_grass_mesh" },
    { file:"steppe_bush_01_generator.txt",              name:"steppe_bush_01_generator_0",              clamp:"no", layer:"grass_layer",     mesh:"steppe_bush_01_mesh" },

    { file:"tree_cypress_01_generator_1.txt",           name:"tree_cypress_01_generator_1_0",           clamp:"no", layer:"tree_high_layer", mesh:"tree_cypress_01_a_mesh" },

    { file:"tree_jungle_01_c_generator_1.txt",          name:"tree_jungle_01_c_generator_1_0",          clamp:"no", layer:"tree_high_layer", mesh:"tree_jungle_01_c_mesh" },
    { file:"tree_jungle_01_d_generator_1.txt",          name:"tree_jungle_01_d_generator_1_0",          clamp:"no", layer:"tree_high_layer", mesh:"tree_jungle_01_d_mesh" },

    { file:"tree_leaf_01_single_generator_1.txt",       name:"tree_leaf_01_single_generator_1_0",       clamp:"no", layer:"tree_high_layer", mesh:"tree_leaf_01_single_a_mesh" },

    { file:"tree_leaf_2_high_generator_1.txt",          name:"tree_leaf_2_high_generator_1_0",          clamp:"no", layer:"tree_high_layer", mesh:"tree_leaf_01_a_mesh" },

    { file:"tree_leaf_high_generator_1.txt",            name:"tree_leaf_high_generator_1_0",            clamp:"no", layer:"tree_high_layer", mesh:"tree_leaf_01_a_mesh" },
    { file:"tree_leaf_high_generator_2.txt",            name:"tree_leaf_high_generator_2_0",            clamp:"no", layer:"tree_high_layer", mesh:"tree_leaf_01_b_mesh" },
    { file:"tree_leaf_high_generator_3.txt",            name:"tree_leaf_high_generator_3_0",            clamp:"no", layer:"tree_high_layer", mesh:"tree_leaf_01_c_mesh" },

    { file:"tree_palm_generator_1.txt",                 name:"tree_palm_generator_1_0",                 clamp:"no", layer:"tree_high_layer", mesh:"tree_palm_01_a_mesh" },

    { file:"tree_pine_01_a_generator_1.txt",            name:"tree_pine_01_a_generator_1_0",            clamp:"no", layer:"tree_high_layer", mesh:"tree_pine_single_01_a_mesh" },
    { file:"tree_pine_01_b_generator_1.txt",            name:"tree_pine_01_b_generator_1_0",            clamp:"no", layer:"tree_high_layer", mesh:"tree_pine_01_b_mesh" },
    { file:"tree_pine_impassable_01_a_generator_1.txt", name:"tree_pine_impassable_01_a_generator_1_0", clamp:"no", layer:"tree_high_layer", mesh:"tree_pine_impassable_01_a_mesh" },

    { file:"tree_sakura_01_generator.txt",              name:"tree_sakura_01_generator_0",              clamp:"no", layer:"tree_high_layer", mesh:"tree_sakura_01_mesh" },
    { file:"tree_sakura_02_generator.txt",              name:"tree_sakura_02_generator_0",              clamp:"no", layer:"tree_high_layer", mesh:"tree_sakura_02_mesh" },
    { file:"tree_sakura_03_generator.txt",              name:"tree_sakura_03_generator_0",              clamp:"no", layer:"tree_high_layer", mesh:"tree_sakura_03_mesh" },
    { file:"tree_sakura_forest_generator.txt",          name:"tree_sakura_forest_generator_0",          clamp:"no", layer:"tree_high_layer", mesh:"tree_sakura_01_mesh" },
  ];

  // ---- helpers ----
  const sleep = (ms)=> new Promise(r=>setTimeout(r, ms));

  function buildFileText(bom, s){
    let t = `${bom}object={\n`;
    t += `\tname="${s.name}"\n`;
    t += `\trender_pass=Map\n`;
    t += `\tclamp_to_water_level=${s.clamp}\n`;
    t += `\tgenerated_content=yes\n`;
    t += `\tlayer="${s.layer}"\n`;
    t += `\tpdxmesh="${s.mesh}"\n`;
    t += `\tcount=0\n`;
    t += `}\n`;
    return t;
  }

  function ensureDownloadHost(){
    // Optional debug host. If user already has it, we use it.
    // If not, we create one at the bottom so you can manually click any blocked ones.
    let h = document.getElementById('download-links');
    if(h) return h;

    h = document.createElement('div');
    h.id = 'download-links';
    h.style.cssText = 'margin:12px 0; padding:8px; border:1px solid #334155; border-radius:8px; max-height:200px; overflow:auto;';
    h.innerHTML = '<div style="font-weight:700; margin-bottom:6px;">Download links (fallback)</div>';
    document.body.appendChild(h);
    return h;
  }

  // Creates a manual link (always) and optionally auto-clicks it.
  // Returns { ok, url, a }
  function createDownloadLink({ filename, text, autoClick=true }){
    const blob = new Blob([text], { type:'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.textContent = filename;
    a.style.display = 'block';
    a.style.margin = '2px 0';

    // Put link in fallback host so user can click if browser blocks auto-download
    const h = ensureDownloadHost();
    h.appendChild(a);

    // Try auto click
    if(autoClick){
      try { a.click(); }
      catch(e){ /* ignore */ }
    }

    return { ok:true, url, a };
  }

  async function safeDownloadOne(spec, opts){
    const {
      bom,
      perFileDelayMs,
      revokeDelayMs,
      retries
    } = opts;

    const text = buildFileText(bom, spec);

    let lastErr = null;

    for(let attempt=1; attempt<=retries; attempt++){
      try{
        const { url } = createDownloadLink({
          filename: spec.file,
          text,
          autoClick: true
        });

        // DO NOT revoke immediately. Delay so browser can start download.
        setTimeout(()=> {
          try { URL.revokeObjectURL(url); } catch(e){}
        }, revokeDelayMs);

        // pacing between downloads (reduces multi-download blocking)
        await sleep(perFileDelayMs);

        return { file: spec.file, ok:true, attempts: attempt };
      }catch(err){
        lastErr = err;
        console.warn(`Download attempt ${attempt} failed for ${spec.file}`, err);
        // extra pause before retry
        await sleep(perFileDelayMs * 2);
      }
    }

    return { file: spec.file, ok:false, attempts: retries, error: lastErr };
  }

  async function exportTreeGenerators_FAILSAFE(){
    // Clear prior links for cleanliness
    const h = ensureDownloadHost();
    // preserve header line
    h.innerHTML = '<div style="font-weight:700; margin-bottom:6px;">Download links (fallback)</div>';

    const opts = {
      bom: '\ufeff',          // always include BOM
      perFileDelayMs: 300,    // IMPORTANT: increase if your browser still blocks
      revokeDelayMs: 4000,    // give downloads time to start
      retries: 2              // retries per file if something throws
    };

    console.log(`Exporting tree generators: ${SPECS.length} files`);
    if(typeof setStatus === 'function') setStatus(`Exporting ${SPECS.length} generator files…`);

    const results = [];
    for(let i=0;i<SPECS.length;i++){
      const spec = SPECS[i];
      console.log(`(${i+1}/${SPECS.length}) ${spec.file}`);
      const r = await safeDownloadOne(spec, opts);
      results.push(r);
    }

    const ok = results.filter(r=>r.ok);
    const bad = results.filter(r=>!r.ok);

    console.log('Export results:', results);
    console.log(`Done. Success: ${ok.length}/${results.length}. Failed: ${bad.length}.`);

    if(typeof setStatus === 'function'){
      setStatus(bad.length
        ? `Export finished: ${ok.length}/${results.length} ok (some blocked—use fallback links)`
        : `Export finished: ${ok.length}/${results.length} ok`);
    }

    if(bad.length){
      alert(
        `Some downloads may have been blocked by the browser.\n\n` +
        `Success: ${ok.length}/${results.length}\n` +
        `Fallback links were generated on the page so you can click the missing ones manually.`
      );
    }else{
      // Optional: you can comment this out if you don’t want a popup
      // alert(`Exported ${ok.length} generator files.`);
    }
  }

  btn.addEventListener('click', ()=>{
    exportTreeGenerators_FAILSAFE().catch(err=>{
      console.error(err);
      alert('Failed to export tree generator files (see console).');
    });
  });

})(); // end IIFE


/*
function writeGenerators() {
  const specs = [
    {
      file: "reeds_01_generator_1.txt",
      objectName: "reeds_01_generator_1_0",
      clamp_to_water_level: "no",
      layer: "grass_layer",
      pdxmesh: "reeds_06_grass_mesh",
    },
    {
      file: "steppe_bush_01_generator.txt",
      objectName: "steppe_bush_01_generator_0",
      clamp_to_water_level: "no",
      layer: "grass_layer",
      pdxmesh: "steppe_bush_01_mesh",
    },
    {
      file: "tree_cypress_01_generator_1.txt",
      objectName: "tree_cypress_01_generator_1_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_cypress_01_a_mesh",
    },
    {
      file: "tree_jungle_01_c_generator_1.txt",
      objectName: "tree_jungle_01_c_generator_1_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_jungle_01_c_mesh",
    },
    {
      file: "tree_jungle_01_d_generator_1.txt",
      objectName: "tree_jungle_01_d_generator_1_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_jungle_01_d_mesh",
    },
    {
      file: "tree_leaf_01_single_generator_1.txt",
      objectName: "tree_leaf_01_single_generator_1_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_leaf_01_single_a_mesh",
    },
    {
      file: "tree_leaf_2_high_generator_1.txt",
      objectName: "tree_leaf_2_high_generator_1_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_leaf_01_a_mesh",
    },
    {
      file: "tree_leaf_high_generator_1.txt",
      objectName: "tree_leaf_high_generator_1_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_leaf_01_a_mesh",
    },
    {
      file: "tree_leaf_high_generator_2.txt",
      objectName: "tree_leaf_high_generator_2_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_leaf_01_b_mesh",
    },
    {
      file: "tree_leaf_high_generator_3.txt",
      objectName: "tree_leaf_high_generator_3_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_leaf_01_c_mesh",
    },
    {
      file: "tree_palm_generator_1.txt",
      objectName: "tree_palm_generator_1_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_palm_01_a_mesh",
    },
    {
      file: "tree_pine_01_a_generator_1.txt",
      objectName: "tree_pine_01_a_generator_1_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_pine_single_01_a_mesh",
    },
    {
      file: "tree_pine_01_b_generator_1.txt",
      objectName: "tree_pine_01_b_generator_1_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_pine_01_b_mesh",
    },
    {
      file: "tree_pine_impassable_01_a_generator_1.txt",
      objectName: "tree_pine_impassable_01_a_generator_1_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_pine_impassable_01_a_mesh",
    },
    {
      file: "tree_sakura_01_generator.txt",
      objectName: "tree_sakura_01_generator_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_sakura_01_mesh",
    },
    {
      file: "tree_sakura_02_generator.txt",
      objectName: "tree_sakura_02_generator_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_sakura_02_mesh",
    },
    {
      file: "tree_sakura_03_generator.txt",
      objectName: "tree_sakura_03_generator_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_sakura_03_mesh",
    },
    {
      file: "tree_sakura_forest_generator.txt",
      objectName: "tree_sakura_forest_generator_0",
      clamp_to_water_level: "no",
      layer: "tree_high_layer",
      pdxmesh: "tree_sakura_01_mesh",
    },
  ];

  // optional: clear any prior links
  const host = document.getElementById("download-links");
  if (host) host.innerHTML = "";

  // Download all (synchronous create+click is fine; you can add awaits if you want pacing)
  for (const s of specs) {
    writeGeneratorFile(s);
  }
}

function writeGeneratorFile(spec) {
  const bom = (typeof daBom === "string") ? daBom : "";

  // Build exact object block
  let t = `${bom}object={\n`;
  t += `\tname="${spec.objectName}"\n`;
  t += `\trender_pass=Map\n`;
  t += `\tclamp_to_water_level=${spec.clamp_to_water_level}\n`;
  t += `\tgenerated_content=yes\n`;
  t += `\tlayer="${spec.layer}"\n`;
  t += `\tpdxmesh="${spec.pdxmesh}"\n`;
  t += `\tcount=0\n`;
  t += `}\n`;

  const data = new Blob([t], { type: "text/plain" });
  const url = URL.createObjectURL(data);

  // Create a unique link (helps debugging; also lets you see them if downloads are blocked)
  const host = document.getElementById("download-links");
  const safeId = ("dl_" + spec.file).replace(/[^a-z0-9_-]/gi, "_");

  const a = document.createElement("a");
  a.id = safeId;
  a.download = spec.file;
  a.href = url;
  a.textContent = `Download ${spec.file}`;

  if (host) {
    host.appendChild(a);
    host.appendChild(document.createElement("br"));
  } else {
    // still need it in DOM for some browsers
    a.style.display = "none";
    document.body.appendChild(a);
  }

  a.click();

  // Cleanup (don't revoke immediately)
  setTimeout(() => {
    URL.revokeObjectURL(url);
    if (!host && a.parentNode) a.parentNode.removeChild(a);
  }, 2000);
}

// ===== Tree generator exporters (matches your locator-button layout) =====
function addTreeGeneratorExportButton(){
  const headerCards = document.querySelectorAll('header .row.card');
  if(!headerCards.length){ console.warn('No header card found for tree generator button.'); return; }
  const host = headerCards[0];

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.id = 'export_tree_generators';
  btn.textContent = 'Export tree generators';
  host.appendChild(btn);

  function exportTreeGenerators(){
    try{
      const daBom = '\ufeff';

      // In the exact order + filenames you specified
      const specs = [
        { file:"reeds_01_generator_1.txt",                 name:"reeds_01_generator_1_0",                 clamp:"no", layer:"grass_layer",    mesh:"reeds_06_grass_mesh" },
        { file:"steppe_bush_01_generator.txt",             name:"steppe_bush_01_generator_0",             clamp:"no", layer:"grass_layer",    mesh:"steppe_bush_01_mesh" },

        { file:"tree_cypress_01_generator_1.txt",          name:"tree_cypress_01_generator_1_0",          clamp:"no", layer:"tree_high_layer",mesh:"tree_cypress_01_a_mesh" },

        { file:"tree_jungle_01_c_generator_1.txt",         name:"tree_jungle_01_c_generator_1_0",         clamp:"no", layer:"tree_high_layer",mesh:"tree_jungle_01_c_mesh" },
        { file:"tree_jungle_01_d_generator_1.txt",         name:"tree_jungle_01_d_generator_1_0",         clamp:"no", layer:"tree_high_layer",mesh:"tree_jungle_01_d_mesh" },

        { file:"tree_leaf_01_single_generator_1.txt",      name:"tree_leaf_01_single_generator_1_0",      clamp:"no", layer:"tree_high_layer",mesh:"tree_leaf_01_single_a_mesh" },

        { file:"tree_leaf_2_high_generator_1.txt",         name:"tree_leaf_2_high_generator_1_0",         clamp:"no", layer:"tree_high_layer",mesh:"tree_leaf_01_a_mesh" },

        { file:"tree_leaf_high_generator_1.txt",           name:"tree_leaf_high_generator_1_0",           clamp:"no", layer:"tree_high_layer",mesh:"tree_leaf_01_a_mesh" },
        { file:"tree_leaf_high_generator_2.txt",           name:"tree_leaf_high_generator_2_0",           clamp:"no", layer:"tree_high_layer",mesh:"tree_leaf_01_b_mesh" },
        { file:"tree_leaf_high_generator_3.txt",           name:"tree_leaf_high_generator_3_0",           clamp:"no", layer:"tree_high_layer",mesh:"tree_leaf_01_c_mesh" },

        { file:"tree_palm_generator_1.txt",                name:"tree_palm_generator_1_0",                clamp:"no", layer:"tree_high_layer",mesh:"tree_palm_01_a_mesh" },

        { file:"tree_pine_01_a_generator_1.txt",           name:"tree_pine_01_a_generator_1_0",           clamp:"no", layer:"tree_high_layer",mesh:"tree_pine_single_01_a_mesh" },
        { file:"tree_pine_01_b_generator_1.txt",           name:"tree_pine_01_b_generator_1_0",           clamp:"no", layer:"tree_high_layer",mesh:"tree_pine_01_b_mesh" },
        { file:"tree_pine_impassable_01_a_generator_1.txt",name:"tree_pine_impassable_01_a_generator_1_0",clamp:"no", layer:"tree_high_layer",mesh:"tree_pine_impassable_01_a_mesh" },

        { file:"tree_sakura_01_generator.txt",             name:"tree_sakura_01_generator_0",             clamp:"no", layer:"tree_high_layer",mesh:"tree_sakura_01_mesh" },
        { file:"tree_sakura_02_generator.txt",             name:"tree_sakura_02_generator_0",             clamp:"no", layer:"tree_high_layer",mesh:"tree_sakura_02_mesh" },
        { file:"tree_sakura_03_generator.txt",             name:"tree_sakura_03_generator_0",             clamp:"no", layer:"tree_high_layer",mesh:"tree_sakura_03_mesh" },
        { file:"tree_sakura_forest_generator.txt",         name:"tree_sakura_forest_generator_0",         clamp:"no", layer:"tree_high_layer",mesh:"tree_sakura_01_mesh" },
      ];

      // Optional small pacing between downloads to keep things stable
      const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));

      (async ()=>{
        for(const s of specs){
          let t = `${daBom}object={\n`;
          t += `\tname="${s.name}"\n`;
          t += `\trender_pass=Map\n`;
          t += `\tclamp_to_water_level=${s.clamp}\n`;
          t += `\tgenerated_content=yes\n`;
          t += `\tlayer="${s.layer}"\n`;
          t += `\tpdxmesh="${s.mesh}"\n`;
          t += `\tcount=0\n`;
          t += `}\n`;

          const blob = new Blob([t], {type:'text/plain;charset=utf-8;'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = s.file;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);

          // tiny delay so the browser doesn't choke on rapid-fire downloads
          await sleep(60);
        }

        if (typeof setStatus === 'function') setStatus('Exported tree generator files');
      })().catch(err=>{
        console.error(err);
        alert('Failed to export tree generator files (see console).');
      });

    }catch(err){
      console.error(err);
      alert('Failed to export tree generator files (see console).');
    }
  }

  btn.addEventListener('click', exportTreeGenerators);
}

// Call once, like your locator buttons:
addTreeGeneratorExportButton();

*/