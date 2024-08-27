function writeDynastyLocalization() {
    let t = `${daBom}l_english:\n`
    for (let i = 0; i < world.dynasties.length; i++) {
        //let name = capitalize(translate(lang, dyn))
        let dyn = world.dynasties[i]
        t += `\t${dyn.k}: "${dyn.v}"\n`
    }
    //check back at deletion here if you start getting dynasty name bugs.
    var data = new Blob([t], {type: 'text/yaml'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="dynasty_name_localization_link" download="gen_dynasty_names_l_english.yml" href="">Download History</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`dynasty_name_localization_link`).href = url
    document.getElementById(`dynasty_name_localization_link`).click();
}