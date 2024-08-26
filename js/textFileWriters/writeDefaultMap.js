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





    let seas =[]
    let impassable = []
    let lakes = []
    let impassableSea = []
    let river = []
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.isOcean) {
            seas.push(p);
        }
        if (p.isImpassable) {
            impassable.push(p)
        }
        if (p.isLake) {
            lakes.push(p)
        }
        if (p.isImpassableSea) {
            impassableSea.push(p)
        }
        if (p.isRiver) {
            river.push(p)
        }
    }

    if (seas.length > 0) {
        t += `sea_zones = LIST { ` //come back and reimplement ranges at some point
        for (let i = 0; i < seas.length; i++) {
            let province = seas[i];

            t += `${province.id} `
        }
        if (world.needsPlaceholder) {
            let num = world.provinces.length
            t += `${num} `
        }
        t += ` }\n`
    }
    if (impassable.length > 0) {
        t += `impassable_mountains = LIST { ` //come back and reimplement ranges at some point
        for (let i = 0; i < impassable.length; i++) {
            let province = impassable[i];
            t += `${province.id} `
        }
        t += ` }\n` 
    }
    if (lakes.length > 0) {
        t += `lakes = LIST { ` //come back and reimplement ranges at some point
        for (let i = 0; i < lakes.length; i++) {
            let province = lakes[i];
            t += `${province.id} `
        }
        t += ` }\n` 
    }
    if (impassableSea.length > 0) {
        t += `impassable_seas = LIST { ` //come back and reimplement ranges at some point
        for (let i = 0; i < impassableSea.length; i++) {
            let province = impassableSea[i];
            t += `${province.id} `
        }
        t += ` }\n` 
    }
    if (river.length > 0) {
        t += `river_provinces = LIST { `
        for (let i = 0; i < river.length; i++) {
            let province = river[i];
            t += `${province.id} `
        }
        t += ` }\n` 
    }

    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="default-download-link" download="default.map" href="">Download default.map</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`default-download-link`).href = url
    document.getElementById(`default-download-link`).click()
}