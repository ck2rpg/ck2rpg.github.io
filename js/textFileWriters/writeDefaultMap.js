function writeDefaultMap() {
    //This was harder than it should have been because of not making the placeholder a province in JS object, which will be the cause of many bugs until fixed.
    let t = `definitions = "definition.csv"\n`
    t += `provinces = "provinces.png"\n`
    t += `rivers = "rivers.png"\n`
    t += `topology = "heightmap.heightmap"\n`
    t += `continent = "continent.txt"\n`
    t += `adjacencies = "adjacencies.csv"\n`
    t += `island_region = "island_region.txt"\n`
    t += `seasons = "seasons.txt"\n`
    t += `sea_zones = LIST { ` //come back and reimplement ranges at some point
    let first = 1
    let last = world.provinces.length + 1; //this takes care of the placeholder province
    let arr = [];
    for (let i = 0; i < world.provinces.length; i++) {
        let province = world.provinces[i];
        /*if (province.cells > 0 && (province.terrain === "sea" || province.terrain === "coastal_sea")) {
            t == `${province.id} `
        }*/
        if (province.waterId) {
            t += `${province.id} `
        }
    }
    t += ` }\n`
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="default-download-link" download="default.map" href="">Download default.map</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`default-download-link`).href = url
    document.getElementById(`default-download-link`).click()
}