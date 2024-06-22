function writeCultureLocalization() {
    let t = `${daBom}l_english:\n`
    let namelist = `${daBom}l_english:\n`
    for (let i = 0; i < world.cultures.length; i++) {
        let culture = world.cultures[i]
        t += `${culture.id}_group: "${culture.name}"\n`
        t += `${culture.id}_group_collective_nooun: "${culture.name}"\n`
        t += `${culture.id}_prefix: "${culture.name}"\n`
        t += `${culture.id}: "${culture.name}"\n`
        t += `${culture.id}_collective_noun: "${culture.name}"\n`
        namelist += `${culture.name_list}: "${culture.name}"\n`
    }
    var data = new Blob([t], {type: 'text/yaml'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="culture_loc_link" download="gen_cultures_l_english.yml" href="">Download Culture Localization</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`culture_loc_link`).href = url
    document.getElementById(`culture_loc_link`).click();

    var data2 = new Blob([namelist], {type: 'text/yaml'})
    var url2 = window.URL.createObjectURL(data2);
    let link2 = `<a id="name_lists_loc_link" download="gen_name_lists_l_english.yml" href="">Download Culture Name List Localization</a><br>`
    document.getElementById("download-links").innerHTML += `${link2}`;
    document.getElementById(`name_lists_loc_link`).href = url2
    document.getElementById(`name_lists_loc_link`).click();
}