function writeDefines() {
    let t = `${daBom}`
    t += `NJominiMap = {\n`
    t += `    WORLD_EXTENTS_X = ${settings.width - 1}\n`
    t += `    WORLD_EXTENTS_Y = 51\n`
    t += `    WORLD_EXTENTS_Z = ${settings.height - 1}\n`
    t += `    WATERLEVEL = 3.8\n`
    t += `}`
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="define-download-link" download="01_gen_defines.txt" href="">Download gen_defines.txt</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`define-download-link`).href = url
    document.getElementById(`define-download-link`).click()
}