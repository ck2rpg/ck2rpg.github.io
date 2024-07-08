function writeLocators(type) {
    let t = `${daBom}game_object_locator={\n`
    t += `  name="${type}"\n`
    t += `  clamp_to_water_level=yes\n`
    t += `  render_under_water=no\n`
    t += `  generated_content=no\n`
    if (type === "buildings" || type === "special_building") {
        t += `  layer="building_layer"\n`
    } else if (type === "combat" || type === "siege" || type === "unit_stack" || type === "unit_stack_player_owned" || type === "unit_stack_other_owner") {
        t += `  layer="unit_layer"\n`
    } else if (type === "activities") {
        t += `  layer="activities_layer"\n`
    }
    
    t += `  instances={\n`
    let count = 0;
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.cells > 0) {
            count += 1;
            if (p.land) {
                t += `    {\n`
                t += `      id=${count}\n`
                t += `      position={ ${p.x}.000000 0.000000 ${settings.height - p.y}.000000 }\n`
                t += `      rotation={ -0.000000 -0.000000 -0.000000 1.000000 }\n`
                t += `      scale={ 1.000000 1.000000 1.000000 }\n`
                t += `    }\n`
            }
        }
    }
    t += `  }\n`
    t += `}\n`


    let fileName = "";
    let short = ""
    if (type === "buildings") {
        fileName = "building_locators.txt";
        short = "building"
    } else if (type === "special_building") {
        short = "special"
        fileName = "special_building_locators.txt"
    } else if (type === "combat") {
        short = "combat"
        fileName = "combat_locators.txt"
    } else if (type === "siege") {
        short = "siege"
        fileName = "siege_locators.txt"
    } else if (type === "unit_stack") {
        short = "unit"
        fileName = "stack_locators.txt"
    } else if (type === "unit_stack_player_owned") {
        short = "player"
        fileName = "player_stack_locators.txt"
    } else if (type === "unit_stack_other_owner") {
        short = "other"
        fileName = "other_stack_locators.txt"
    }


    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="${short}-download-link" download="${fileName}" href="">Download ${fileName}</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`${short}-download-link`).href = url
    document.getElementById(`${short}-download-link`).click()
}