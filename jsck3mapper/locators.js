 // ===== Locator exporters (unchanged) =====
  function addLocatorExportButton(type = "buildings"){
    const headerCards = document.querySelectorAll('header .row.card');
    if(!headerCards.length){ console.warn('No header card found for locator button.'); return; }
    const host = headerCards[0];

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.id = `downloadLocators_${type}`;
    btn.textContent = `Export ${type} locators`;
    host.appendChild(btn);

    function exportLocators(selectedType){
      try{
        if(!seeds || !seeds.length) return alert('No provinces found. Seed the map (land + sea) first.');
        const Hh = H || (view && view.height) || 0;
        const daBom = '\ufeff';
        let t = `${daBom}game_object_locator={\n`;
        t += `  name="${selectedType}"\n`;
        t += `  clamp_to_water_level=yes\n`;
        t += `  render_under_water=no\n`;
        t += `  generated_content=no\n`;
        if (selectedType === "buildings" || selectedType === "special_building") {
          t += `  layer="building_layer"\n`;
        } else if (
          selectedType === "combat" ||
          selectedType === "siege" ||
          selectedType === "unit_stack" ||
          selectedType === "unit_stack_player_owned" ||
          selectedType === "unit_stack_other_owner"
        ) {
          t += `  layer="unit_layer"\n`;
        } else if (selectedType === "activities") {
          t += `  layer="activities_layer"\n`;
        }
        t += `  instances={\n`;

        let count = 0;
        for (let i = 0; i < seeds.length; i++) {
          const s = seeds[i]; count += 1;
          const includeSea =
            selectedType === "combat" ||
            selectedType === "unit_stack_player_owned" ||
            selectedType === "unit_stack_other_owner";
          if (s.isLand || (!s.isLand && includeSea)) {
            const px = s.x|0;
            const pyInv = (Hh - (s.y|0))|0;
            t += `    {\n`;
            t += `      id=${count}\n`;
            t += `      position={ ${px}.000000 0.000000 ${pyInv}.000000 }\n`;
            t += `      rotation={ -0.000000 -0.000000 -0.000000 1.000000 }\n`;
            t += `      scale={ 1.000000 1.000000 1.000000 }\n`;
            t += `    }\n`;
          }
        }

        t += `  }\n`;
        t += `}\n`;

        let fileName = "";
        if (selectedType === "buildings") fileName = "building_locators.txt";
        else if (selectedType === "special_building") fileName = "special_building_locators.txt";
        else if (selectedType === "combat") fileName = "combat_locators.txt";
        else if (selectedType === "siege") fileName = "siege_locators.txt";
        else if (selectedType === "unit_stack") fileName = "stack_locators.txt";
        else if (selectedType === "unit_stack_player_owned") fileName = "player_stack_locators.txt";
        else if (selectedType === "unit_stack_other_owner") fileName = "other_stack_locators.txt";
        else if (selectedType === "activities") fileName = "activities.txt";
        else fileName = `${selectedType}_locators.txt`;

        const blob = new Blob([t], {type:'text/plain;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        if (typeof setStatus === 'function') setStatus(`Exported ${fileName}`);
      }catch(err){
        console.error(err);
        alert('Failed to export locator file (see console).');
      }
    }

    btn.addEventListener('click', ()=> exportLocators(type));
  }
  addLocatorExportButton("buildings")
  addLocatorExportButton("special_building");
  addLocatorExportButton("combat");
  addLocatorExportButton("siege");
  addLocatorExportButton("unit_stack");
  addLocatorExportButton("unit_stack_player_owned");
  addLocatorExportButton("unit_stack_other_owner");
  addLocatorExportButton("activities");
