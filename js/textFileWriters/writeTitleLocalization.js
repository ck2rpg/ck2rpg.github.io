/**
 * Generates the localization file for all titles in the world.
 * 
 * This function constructs a string containing the localized names for all titles 
 * (empires, kingdoms, duchies, counties, and provinces) in the world in YAML format.
 * The string is then converted to a downloadable YAML file.
 */
function writeTitleLocalization() {
    let t = `${daBom}l_english:\n`

    for (let i = 0; i < world.empires.length; i++) {
        let empire = world.empires[i]
        t += `e_${empire.titleName}: "${empire.localizedTitle}"\n`
    }

    for (let i = 0; i < world.kingdoms.length; i++) {
        let kingdom = world.kingdoms[i]
        t += `k_${kingdom.titleName}: "${kingdom.localizedTitle}"\n`
    }
    for (let i = 0; i < world.duchies.length; i++) {
        let duchy = world.duchies[i]
        t += `d_${duchy.titleName}: "${duchy.localizedTitle}"\n`
    }
    for (let i = 0; i < world.counties.length; i++) {
        let county = world.counties[i]
        t += `c_${county.titleName}: "${county.localizedTitle}"\n`
    }
    for (let i = 0; i < world.provinces.length; i++) {
        let province = world.provinces[i]
        if (province.land) {
            t += `b_${province.titleName}: "${province.localizedTitle}"\n`
        }
    }
    var data = new Blob([t], {type: 'text/yaml'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="title_loc_link" download="gtitles_l_english.yml" href="">Download Title Localization</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`title_loc_link`).href = url
    document.getElementById(`title_loc_link`).click();
}