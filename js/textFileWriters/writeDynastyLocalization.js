function writeDynastyLocalization() {
    let t = `${daBom}l_english:\n`
    for (let i = 0; i < world.characters.length; i++) {
        let char = world.characters[i]
        let dyn = char.dyn;
        let dynName = char.dynName
        //let name = capitalize(translate(lang, dyn))
        t += `\t${dyn}: "${dynName}"\n`
    }
    //check back at deletion here if you start getting dynasty name bugs.
    var data = new Blob([t], {type: 'text/yaml'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="dynasty_name_localization_link" download="gen_dynasty_names_l_english.yml" href="">Download History</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`dynasty_name_localization_link`).href = url
    document.getElementById(`dynasty_name_localization_link`).click();
}