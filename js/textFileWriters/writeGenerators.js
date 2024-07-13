function writeGenerators() {
    writeGenerator("tree_cypress_01_generator_1", "cypress")
    writeGenerator("tree_jungle_01_c_generator_1", "jungle")
    writeGenerator("tree_palm_generator_1", "palm")
    writeGenerator("tree_pine_01_a_generator_1", "pine")
}

function writeGenerator(name, short) {

    let mesh;
    if (short === "cypress") {
        mesh = "tree_cypress_01_a_mesh"
    } else if (short === "jungle") {
        mesh = "tree_jungle_01_c_mesh"
    } else if (short === "palm") {
        mesh = "tree_palm_01_a_mesh"
    } else if (short === "pine") {
        mesh = "tree_pine_single_01_a_mesh"
    }

    let t = `${daBom}object={\n`
    t += `  name="${name}"\n`
    t += `  render_pass=Map\n`
    t += `  generated_content=yes\n`
    t += `  layer="grass_layer"\n`
    t += `  pdxmesh="${mesh}"\n`
    t += `  count=0\n`
    t += `}`

    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let fileName = name + ".txt"
    let link = `<a id="${short}-download-link" download="${fileName}" href="">Download ${fileName}</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`${short}-download-link`).href = url
    document.getElementById(`${short}-download-link`).click()
}