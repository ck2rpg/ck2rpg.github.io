function writeHybridCultures() {
    let t = `${daBom}`
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.land) {
            t += `${world.provinces[i].titleName}_hybrid = {\n`
            t += `  trigger = {\n`
            t += `      capital_barony = title:b_${world.provinces[i].titleName}\n`
            t += `  }\n`
            t += `  hybrid = yes\n`
            t += `}\n`
        }
    }
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="hybrid-download-link" download="gen_hybrid_creation_names.txt" href="">Download Hybrid Creation Names</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('hybrid-download-link').href = url
    document.getElementById('hybrid-download-link').click()
}

function writeHybridCulturesLocalization() {
    let t = `${daBom}l_english:\n`
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.land) {
            t += `${world.provinces[i].titleName}_hybrid: "${world.provinces[i].localizedTitle}"\n`
            t += `${world.provinces[i].titleName}_hybrid_name: "${world.provinces[i].localizedTitle}"\n`
        }
    }
    var data = new Blob([t], {type: 'text/yaml'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="hybrid_cultures_localization_link" download="gen_hybrid_cultures_l_english.yml" href="">Download Hybrid Culture Localization</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`hybrid_cultures_localization_link`).href = url
    document.getElementById(`hybrid_cultures_localization_link`).click();
}