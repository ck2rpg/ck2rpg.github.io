function writeDynastyLocalization() {
    let t = `${daBom}l_english:\n`
    for (let i = 0; i < world.characters.length; i++) {
        let char = world.characters[i]
        let dyn = char.dyn;
        let lang = char.culture.language
        let name = generateWordFromTrigrams(surnameTrigrams, parsedSurnames)
        //let name = capitalize(translate(lang, dyn))
        t += `\t${dyn}: "${name}"\n`
    }
    for (let i = 0; i < dgCount; i++) {
        t += `\tdg${i}: "${generateWordFromTrigrams(surnameTrigrams, parsedSurnames)}"\n`
    }
    var data = new Blob([t], {type: 'text/yaml'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="dynasty_name_localization_link" download="gen_dynasty_names_l_english.yml" href="">Download History</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`dynasty_name_localization_link`).href = url
    document.getElementById(`dynasty_name_localization_link`).click();
}