/**
 * Generates a CSV file containing province definitions and triggers a download.
 * 
 * The function iterates over all the provinces in the world, creating a CSV string
 * with the necessary details. It includes both land and ocean provinces, ensuring
 * that all areas are accounted for.
 */
function writeProvinceDefinitions() {
    let t = ``
    t += `0;0;0;0;x;x;\n`
    let count = 0;
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.cells > 0) {
            count += 1;
            if (p.land) {
                t += `${count};${p.colorR};${p.colorG};${p.colorB};${p.titleName};x;\n`
            } else {
                t += `${count};${p.colorR};${p.colorG};${p.colorB};OCEAN;x;\n`
            }
            
            
        }
        
    }
    count += 1;
    t += `${count};75;75;75;OCEAN;x;\n` // this is necessary for now to deal with placeholder color from unfilled areas
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="definition-download-link" download="definition.csv" href="">Download Province Definitions</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('definition-download-link').href = url
    document.getElementById('definition-download-link').click()
}
