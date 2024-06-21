/**
 * Generates a sequential color object with unique RGB values.
 * 
 * The function increments the blue color value (`bCount`) each time it's called.
 * When `bCount` reaches 256, it resets to 0, and the green color value (`gCount`) is incremented.
 * This ensures a sequential generation of unique RGB color values.
 * 
 * @returns {Object} An object containing the RGB color values.
 * @returns {number} return.r - The red color value, always set to 0.
 * @returns {number} return.g - The green color value, incremented after blue reaches 256.
 * @returns {number} return.b - The blue color value, incremented on each call until it reaches 256.
 */
function getRandomSequentialColorObject() {
    bCount += 1; 
    if (bCount === 256) {
        bCount = 0;
        gCount += 1;
    }
    let o = {};
    o.r = 0;
    o.g = gCount;
    o.b = bCount;
    return o;
}

/**
 * Generates a CSV file containing province definitions and triggers a download.
 * 
 * The function iterates over all the provinces in the world, creating a CSV string
 * with the necessary details. It includes both land and ocean provinces, ensuring
 * that all areas are accounted for.
 */
function createProvinceDefinitions() {
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

function createProvinceTerrain() {
    //ALWAYS NEED CORRESPONDING CHANGES IN MASKING FOR ANY CHANGES HERE
    let t = `${daBom}default_land=plains\n`
    t += `default_sea=sea\n`
    t += `default_coastal_sea=coastal_sea\n`
    let count = 0;
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.cells > 0) {
            count += 1;
            let cell = world.smallMap[p.y][p.x]
            let n = noise(cell.bigCell.x, cell.bigCell.y)
            let terrain = biome(cell.bigCell)
            if (cell.bigCell.elevation >= limits.seaLevel.upper) {
                //only assign terrain above sea level.
                if (cell.bigCell.highPointRiver && cell.bigCell.elevation > 40 && cell.bigCell.elevation < 70 && cell.bigCell.desert === false && ((n > 0.1 && n < 0.4) || (n > 0.6 && n < 0.9))) {
                    t += `${count}=`
                    t += `farmlands`
                    t += `\n`
                    p.terrain = "farmlands"
                } else if (cell.bigCell.elevation > limits.seaLevel.upper && cell.bigCell.moisture > 150 && cell.bigCell.y < world.steppeTop && cell.bigCell.y > world.steppeBottom) { //using steppe as cutoff of main deserts indicator to keep jungles close to equator
                    t += `${count}=`
                    t += `jungle`
                    t += `\n`
                    p.terrain = "jungle"
                } else if (cell.bigCell.desert) {
                    if (cell.elevation > limits.mountains.lower) {
                        t += `${count}=`
                        t += `desert_mountains`
                        t += `\n`
                        p.terrain = "desert_mountains"
                        p.isDesert = true
                    } else if ((cell.bigCell.y > world.steppeTop || cell.bigCell.y < world.steppeBottom)) {
                        t += `${count}=`
                        t += `steppe`
                        t += `\n`
                        p.terrain = "steppe"
                    } else if (cell.bigCell.moisture < 25) {
                        t += `${count}=`
                        t += `drylands`
                        t += `\n`
                        p.terrain = "drylands"
                        p.isDesert = true
                    } else {
                        t += `${count}=`
                        t += `desert`
                        t += `\n`
                        p.terrain = "desert"
                        p.isDesert = true
                    }
                } else if (cell.bigCell.elevation > limits.mountains.lower) {
                    t += `${count}=`
                    t += `mountains`
                    t += `\n`
                    p.terrain = "mountains"
                } else if (limits.mountains.lower - cell.bigCell.elevation < 50) {
                    t += `${count}=`
                    t += `hills`
                    t += `\n`
                    p.terrain = "hills"
                } else if (!cell.bigCell.maskMarked && ((n > 0.1 && n < 0.2) || (n > 0.6 && n < 0.9))) {
                    t += `${count}=`
                    t += `forest`
                    t += `\n`
                    p.terrain = "forest"
                } else if (terrain === "arctic") {
                    t += `${count}=`
                    t += `taiga`
                    t += `\n`
                    p.terrain = "taiga"
                } else if (terrain === "grass") {
                    t += `${count}=`
                    t += `plains`
                    t += `\n`
                    p.terrain = "plains"
                } else if (terrain === "beach") {
                    t += `${count}=` // need because you won't be setting terrain for seas, etc.
                    t += `plains`
                    t += `\n`
                    p.terrain = "plains"
                } else {
                    p.terrain = "plains" // default
                }
            }
        }
    }
    console.log(t)
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="terrain-download-link" download="00_province_terrain.txt" href="">Download Province Terrain</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('terrain-download-link').href = url
    document.getElementById('terrain-download-link').click()
}

function createBookmark() {
    let t = `${daBom}bm_mod_placeholder = {\n`
    t += `  start_date = ${world.year}.${world.month}.${world.day}\n`
    t += `  is_playable = yes\n`
    t += `  group = bm_mod_group\n`
    t += `  weight = { value = 100 }\n`
    t += `
    character = {\n
		name = "bookmark_canarias_guanarigato\n"
		dynasty = ${world.counties[0].holder.dyn}\n
		dynasty_splendor_level = 1\n
		type = ${world.counties[0].holder.gender}\n
		birth = ${world.counties[0].holder.birth}\n
		title = c_${world.counties[0].titleName}\n
		government = tribal_government\n
		culture = ${world.counties[0].holder.culture.id}\n
		religion = "${world.counties[0].holder.religion.id}\n"
		difficulty = "BOOKMARK_CHARACTER_DIFFICULTY_EASY\n"
		history_id = ${world.counties[0].holder.id}\n
		position = { 500 1000 }\n

		animation = happiness\n
	}\n
}`
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="bm-download-link" download="00_bookmarks.txt" href="">Bookmark</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('bm-download-link').href = url
    document.getElementById('bm-download-link').click() 
}

function createBookmarkGroup() {
    let n = `${daBom}bm_mod_group = {\n`
    n += `  default_start_date = ${world.year}.${world.month}.${world.day}\n`
    n += `}`
    var data = new Blob([n], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="bm-group-download-link" download="00_bookmark_groups.txt" href="">Bookmark Group</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('bm-group-download-link').href = url
    document.getElementById('bm-group-download-link').click()
}

/**
 * Generates the landed titles hierarchy for the world, including empires, kingdoms, duchies, counties, and provinces.
 * 
 * The function constructs a string representation of the landed titles in a hierarchical format,
 * including the RGB color values and the capitals for each level. This string is then converted 
 * to a downloadable text file.
 */
function createLandedTitles() {
    let t = `${daBom}`
    for (let j = 0; j < world.empires.length; j++) {
        let empire = world.empires[j]
        t += `e_${empire.titleName} = {\n`
        t += `  color = {${empire.colorR} ${empire.colorG} ${empire.colorB}}\n`
        t += `  capital = c_${empire.capital}\n`
        for (let i = 0; i < empire.kingdoms.length; i++) {
            let kingdom = empire.kingdoms[i]
            t += `  k_${kingdom.titleName} = {\n`
            t += `    color = {${kingdom.colorR} ${kingdom.colorG} ${kingdom.colorB}}\n`
            t += `    capital = c_${kingdom.capital}\n`
            for (let n = 0; n < kingdom.duchies.length; n++) {
                let duchy = kingdom.duchies[n]
                t += `    d_${duchy.titleName} = {\n`
                t += `      color = { ${duchy.colorR} ${duchy.colorG} ${duchy.colorB} }\n`
                t += `      capital = c_${duchy.capital}\n`
                for (let z = 0; z < duchy.counties.length; z++) {
                    let county = duchy.counties[z]
                    t += `      c_${county.titleName} = {\n`
                    t += `        color = {${county.colorR} ${county.colorG} ${county.colorB}}\n`
                    for (let m = 0; m < county.provinces.length; m++) {
                        let province = county.provinces[m]
                        t += `        b_${province.titleName} = {\n`
                        t += `          province = ${world.provinces.indexOf(province) + 1}\n`
                        t += `          color = {${county.colorR} ${county.colorG} ${county.colorB}}\n`
                        t += `        }\n`
                    }
                    t += `      }\n`
                }
                    t += `    }\n`
            }
            t += `  }\n`
        }
        t += `}\n`
    }
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="title-download-link" download="00_landed_titles.txt" href="">Download Landed Titles</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('title-download-link').href = url
    document.getElementById('title-download-link').click()
}

/**
 * Generates the localization file for all titles in the world.
 * 
 * This function constructs a string containing the localized names for all titles 
 * (empires, kingdoms, duchies, counties, and provinces) in the world in YAML format.
 * The string is then converted to a downloadable YAML file.
 */
function createTitleLocalization() {
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

function createCultureLocalization() {
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

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index
}

function getColorObjectFromString(string) {
    let colors = string.match(/(\d+)\,\s(\d+)\,\s(\d+)/)
    let o = {};
    o.r = colors[1];
    o.g = colors[2];
    o.b = colors[3]
    return o;
}



function isOnContinent(x, y, continent) {
    let pixelCell = world.smallMap[y][x];
    for (let i = 0; i < continent.cells.length; i++) {
        if (pixelCell.bigCell.continentId === continent.id) {
            return true;
        } else {
            return false;
        }
    }
}

function mapProvincesToContinents() {
    for (let i = 0; i < world.provinces.length; i++) {
        let province = world.provinces[i]
        for (let j = 0; j < world.continents.length; j++) {
            let continent = world.continents[j]
            if (isOnContinent(province.x, province.y, continent)) {
                continent.provinces.push(province)
                province.continent = continent.id
            }
        }
    }
}

function defineProvinceDistances() {
    for (let i = 0; i < world.continents.length; i++) {
        let continent = world.continents[i]
        continent.distances = []
        for (let j = 0; j < continent.provinces.length; j++) {
            let province1 = continent.provinces[j]
            for (let n = 0; n < continent.provinces.length; n++) {
                let province2 = continent.provinces[n]
                let distance = getDistance(province1.x, province1.y, province2.x, province2.y)
                continent.distances.push({
                    p1: province1.color,
                    p2: province2.color,
                    d: distance
                })
            }
        }
    }
}

function createKingdoms() {
    floodFillContinents();
}

function createRealCounties() {
    let countyArr = []
    for (let i = 0; i < world.duchies.length; i++) {
        let duchy = world.duchies[i]
        for (let j = 0; j < duchy.counties.length; j++) {
            let county = duchy.counties[j]
            let c = {};
            c.provinces = []
            for (let n = 0; n < county.length; n++) {
                c.provinces.push(world.provinces[county[n]])
            }
            duchy.counties[j] = c
            countyArr.push(c)
        }
    }
    world.counties = countyArr
}

function createSmallMap() { //this is only land
    let count = 0;
    world.smallMap = []
    world.landCells = [];
    for (let i = 0; i < 4096; i++) {
        world.smallMap[i] = [];
        for (let j = 0; j < 8192; j++) {
            let bigX = Math.floor(j / world.pixelSize)
            let bigY = Math.floor(i / world.pixelSize)
            let bigCell = xy(bigX, bigY);
            if (bigCell.elevation > limits.seaLevel.upper) {
                count += 1;
                let cell = {};
                cell.x = j;
                cell.y = i;
                cell.bigCell = bigCell
                world.smallMap[i][j] = cell
                world.landCells.push(cell)
            } else {
                let cell = {};
                cell.x = j;
                cell.y = i;
                cell.bigCell = bigCell
                world.smallMap[i][j] = cell
                world.waterCells += 1;
            }
        }
    }
}

function drawProvinceMap() {
    let count = 0
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, 8192, 4096);
    ctx.fillStyle = "rgb(75, 75, 75)"
    ctx.fill();
    let pixels = wholeMapImage()
    for (let i = 0; i < 4096; i++) {
        for (let j = 0; j < 8192; j++) {
            let c = world.smallMap[i][j]
            if (c && c.colorR) {
                pixels.data[count] = c.colorR //r
                count += 1;
                pixels.data[count] = c.colorG //g 
                count += 1;
                pixels.data[count] = c.colorB //b
                count += 2;
            } else {
                count += 4;
            }
        }
    }
    console.log(pixels)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(pixels, 0, 0)
    alert("done")
}

function createLocators(type) {
    let t = `game_object_locator={\n`
    t += `  name="${type}"\n`
    t += `  clamp_to_water_level=yes\n`
    t += `  render_under_water=no\n`
    t += `  generated_content=no\n`
    if (type === "buildings" || type === "special_building") {
        t += `  layer="building_layer"\n`
    } else if (type === "combat" || type === "siege" || type === "unit_stack" || type === "unit_stack_player_owned" || type === "unit_stack_other_owner") {
        t += `  layer="unit_layer"\n`
    } else if (type === "activities") {
        t += `  layer="activities_layer"\n`
    }
    
    t += `  instances={\n`
    let count = 0;
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.cells > 0) {
            count += 1;
            if (p.land) {
                t += `    {\n`
                t += `      id=${count}\n`
                t += `      position={ ${p.x}.000000 0.000000 ${4096 - p.y}.000000 }\n`
                t += `      rotation={ -0.000000 -0.000000 -0.000000 1.000000 }\n`
                t += `      scale={ 1.000000 1.000000 1.000000 }\n`
                t += `    }\n`
            }
        }
    }
    t += `  }\n`
    t += `}\n`


    let fileName = "";
    let short = ""
    if (type === "buildings") {
        fileName = "building_locators.txt";
        short = "building"
    } else if (type === "special_building") {
        short = "special"
        fileName = "special_building_locators.txt"
    } else if (type === "combat") {
        short = "combat"
        fileName = "combat_locators.txt"
    } else if (type === "siege") {
        short = "siege"
        fileName = "siege_locators.txt"
    } else if (type === "unit_stack") {
        short = "unit"
        fileName = "stack_locators.txt"
    } else if (type === "unit_stack_player_owned") {
        short = "player"
        fileName = "player_stack_locators.txt"
    } else if (type === "unit_stack_other_owner") {
        short = "other"
        fileName = "other_stack_locators.txt"
    }


    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="${short}-download-link" download="${fileName}" href="">Download ${fileName}</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`${short}-download-link`).href = url
    document.getElementById(`${short}-download-link`).click()
}

function createDefaultMap() {
    //This was harder than it should have been because of not making the placeholder a province in JS object, which will be the cause of many bugs until fixed.
    let t = `definitions = "definition.csv"\n`
    t += `provinces = "provinces.png"\n`
    t += `rivers = "rivers.png"\n`
    t += `topology = "heightmap.heightmap"\n`
    t += `continent = "continent.txt"\n`
    t += `adjacencies = "adjacencies.csv"\n`
    t += `island_region = "island_region.txt"\n`
    t += `seasons = "seasons.txt"\n`
    t += `sea_zones = RANGE {`
    let first = 1
    let last = world.provinces.length + 1; //this takes care of the placeholder province
    for (let i = 0; i < world.provinces.length; i++) {
        if (world.provinces[i].land !== true) {
            first = i + 1;
            break;
        }
    }
    t += `${first} ${last} }\n`
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="default-download-link" download="default.map" href="">Download default.map</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`default-download-link`).href = url
    document.getElementById(`default-download-link`).click()
}