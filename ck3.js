let gCount = 0;
let bCount = 0;

const daBom = `\ufeff`

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
    return o
}

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
            if (cell.bigCell.elevation > limits.seaLevel.upper) {
                //only assign terrain above sea level.
                if (cell.bigCell.highPointRiver && cell.bigCell.elevation > 40 && cell.bigCell.elevation < 70 && cell.bigCell.desert === false && ((n > 0.1 && n < 0.4) || (n > 0.6 && n < 0.9))) {
                    t += `${count}=`
                    t += `farmlands`
                    t += `\n`
                } else if (cell.bigCell.elevation > limits.seaLevel.upper && cell.bigCell.moisture > 150 && cell.bigCell.y < world.steppeTop && cell.bigCell.y > world.steppeBottom) { //using steppe as cutoff of main deserts indicator to keep jungles close to equator
                    t += `${count}=`
                    t += `jungle`
                    t += `\n`
                } else if (cell.bigCell.desert) {
                    if (cell.elevation > limits.mountains.lower) {
                        t += `${count}=`
                        t += `desert_mountains`
                        t += `\n`
                    } else if ((cell.bigCell.y > world.steppeTop || cell.bigCell.y < world.steppeBottom)) {
                        t += `${count}=`
                        t += `steppe`
                        t += `\n`
                    } else if (cell.bigCell.moisture < 25) {
                        t += `${count}=`
                        t += `drylands`
                        t += `\n`
                    } else {
                        t += `${count}=`
                        t += `desert`
                        t += `\n`
                    }
                } else if (cell.bigCell.elevation > limits.mountains.lower) {
                    t += `${count}=`
                    t += `mountains`
                    t += `\n`
                } else if (limits.mountains.lower - cell.bigCell.elevation < 50) {
                    t += `${count}=`
                    t += `hills`
                    t += `\n`
                } else if (!cell.bigCell.maskMarked && ((n > 0.1 && n < 0.2) || (n > 0.6 && n < 0.9))) {
                    t += `${count}=`
                    t += `forest`
                    t += `\n`
                } else if (terrain === "arctic") {
                    t += `${count}=`
                    t += `taiga`
                    t += `\n`
                } else if (terrain === "grass") {
                    t += `${count}=`
                    t += `plains`
                    t += `\n`
                } else if (terrain === "beach") {
                    t += `${count}=` // need because you won't be setting terrain for seas, etc.
                    t += `plains`
                    t += `\n`
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

function createHistory() {
    let t = `${daBom}`
    let counter = 0;
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.land) {
            let num = i + 1
            t += `${num} = { #${p.localizedTitle}\n`
            t += `  culture = french\n`
            t += `  religion = catholic\n`
            t += `  holding = castle_holding\n`
            t += `}\n`
        }
    }
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="history_link" download="k_generic.txt" href="">Download History</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`history_link`).href = url
    document.getElementById(`history_link`).click();
}

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

/*
function createLandedTitles() {
    let t = ``
    for (let i = 0; i < world.empires.length; i++) {
      let e = world.empires[i];
      t += `e_${e.name} = {\n`
      t += `  color = { ${e.color} }\n`
      t += `  color2 = { ${color2()} }\n`
      for (let j = 0; j < e.kingdoms.length; j++) {
        let k = e.kingdoms[j];
        t += `  k_${k.name} = {\n`
        t += `    color = { ${k.color} }\n`
        t += `    color2 = { ${color2()} }\n`
        t += `    capital = ${k.capital.name}\n`
        for (let n = 0; n < k.duchies.length; n++) {
          let d = k.duchies[n]
          t += `    d_${d.name} = {\n`
          t += `      color = ${d.color}\n`
          t += `      color2 = ${color2()}\n`
          t += `      capital = ${d.capital.name}\n`
          for (let z = 0; z < d.counties.length; z++) {
            let c = d.counties[z]
            t += `      c_${c.name} = {\n`
            t += `        color = ${c.color}\n`
            t += `        color2 = ${color2()}\n`
            for (let q = 0; q < c.baronies.length; q++) {
              let b = c.baronies[q]
              if (b && b.isWater) {
                //no history for water
              } else if (b) {
                t += `        b_${b.name} = {\n`
                t += `          color = { ${b.r} ${b.g} ${b.b}} \n`
                t += `          color2 = ${color2()}\n`
                t += `          province = ${b.provinceID}\n`
                t += `        }\n`
              }
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
  }

*/

/*
function createHistory() {
    let t = ``
    for (let i = 0; i < world.empires.length; i++) {
        let e = world.empires[i]
        for (let j = 0; j < e.kingdoms.length; j++) {
        let k = e.kingdoms[j]
        for (let n = 0; n < k.duchies.length; n++) {
            let d = k.duchies[n];
            for (let m = 0; m < d.counties.length; m++) {
            let c = d.counties[m]
            for (let z = 0; z < c.baronies.length; z++) {
                let p = c.baronies[z]
                t += `${p.provinceID} = {\n`
                t += `  culture = french\n`
                t += `  religion = catholic\n`
                t += `  holding = castle_holding\n`
                t += `}\n`
            }
            }
        }
        var data = new Blob([t], {type: 'text/plain'})
        var url = window.URL.createObjectURL(data);
        let link = `<a id="${k.name}_link" download="k_${k.name}.txt" href="">Download k_${k.name}</a><br>`
        document.getElementById("download-links").innerHTML += `${link}`;
        document.getElementById(`${k.name}_link`).href = url
        t = ``
        }
    }
}
*/
  

  
//WORK ON THE STUFF ABOVE
let colorKeys = {}

function getRandomColorObject() {
    let generating = true;
    let o = {};
    while (generating === true) {
        o.r = getRandomInt(0, 255);
        o.g = getRandomInt(0, 255);
        o.b = getRandomInt(0, 255)
        if (colorKeys[`${o.r},${o.g}, ${o.b}`]) {
            // don't use it if it exists - reroll
        } else {
            colorKeys[`${o.r},${o.g}, ${o.b}`] = true
            generating = false
        }
    }
    
    
    return o
  }

function wholeMapImage() {
    let d = ctx.getImageData(0, 0, (world.width * world.pixelSize), (world.height * world.pixelSize));
    //let b = new Uint32Array(d);
    return d
}

 let provinceCount = 0;
 let adjacencySet = new Set();

 let uniqueColorSet = new Set();
 for (let i = 0; i < 20000; i++) {
    uniqueColorSet.add(getRandomColor())
 }
 uniqueColorSet = [...uniqueColorSet]



function setWestEastAdjacency() {
    for (let i = 0; i < 8192; i++) {
        for (let j = 0; j < 4096; j++) {
            let cell1 = world.smallMap[j][i];
            if (cell1 && cell1.province) {
                let east = i + 1;
                let cell2 = world.smallMap[j][east]
                if (cell2 && cell2.province) {
                    let p1 = cell1.province.nonDefID
                    let p2 = cell2.province.nonDefID
                    if (p1 && p2 && p1 !== p2) {
                        adjacencySet.add(`${p1}-${p2}`)
                    }
                }
            } 
        }
    }
}

function setNorthSouthAdjacency() {
    for (let i = 0; i < 8192; i++) {
        for (let j = 0; j < 4096; j++) {
            let cell1 = world.smallMap[j][i];
            if (cell1 && cell1.province) {
                let north = j + 1; 
                if (world.smallMap[north]) {
                    let cell2 = world.smallMap[north][i]
                    if (cell2 && cell2.province) {
                        let p1 = cell1.province.nonDefID
                        let p2 = cell2.province.nonDefID
                        if (p1 && p2 && p1 !== p2) {
                            adjacencySet.add(`${p1}-${p2}`)
                        }
                    }
                }
            } 
        }
    }
}

function assignAdjacenciesToProvinces() {
    adjacencySet.forEach((value) => {
        let p1 = value.match(/(\d+)\-/)[1];
        let p2 = value.match(/\-(\d+)/)[1]
        world.provinces[p1].adjacencies.push(p2);
        world.provinces[p2].adjacencies.push(p1)
    })
}

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index
}

function flattenAdjacencyArrays() {
    for (let i = 0; i < world.provinces.length; i++) {
        let province = world.provinces[i]
        let unique = province.adjacencies.filter(onlyUnique)
        province.adjacencies = unique;
    }
}

let uniqueColorCount = 0;

function getColorObjectFromString(string) {
    let colors = string.match(/(\d+)\,\s(\d+)\,\s(\d+)/)
    let o = {};
    o.r = colors[1];
    o.g = colors[2];
    o.b = colors[3]
    return o;
}

function seedCell(x, y, landWater) {
    let cell = world.smallMap[y][x]
    if (cell.colorR) {

    } else {
        let randColor = uniqueColorSet[uniqueColorCount]
        uniqueColorCount += 1;
        cell.color = randColor;
        let colorObject = getColorObjectFromString(randColor);
        cell.colorR = colorObject.r;
        cell.colorG = colorObject.g;
        cell.colorB = colorObject.b;
        cell.elevation = cell.bigCell.elevation + getRandomInt(-3, 3)
        let province = {};
        if (landWater === "l") {
            province.land = true;
            province.titleName = `${rando()}`
        } else {
            province.land = false
        }
        provinceCount += 1;
        province.color = randColor
        province.colorR = colorObject.r;
        province.colorG = colorObject.g;
        province.colorB = colorObject.b;
        province.adjacencies = []
        province.x = x; 
        province.y = y; 
        province.bigCell = cell.bigCell
        cell.province = province
        cell.seedCell = true;
        province.cells = 1
        world.provinces.push(province)
        world.populatedCells.push(cell)
    }
}

function assignProvinceIds() {
    let count = 0;
    for (let i = 0; i < world.provinces.length; i++) {
        let province = world.provinces[i]
        if (province.cells > 0) {
            count += 1;
            province.id = count
        }
    }
}

function assignNonDefIds() {
    for (let i = 0; i < world.provinces.length; i++) {
        let prov = world.provinces[i]
        prov.nonDefID = i;
    }
}

function addWaterProvinces() {
    let provinceCount = 0;
    while (provinceCount < 10000) {
        if (world.coveredWater > world.waterCells) {
            break;
        }
        provinceCount += 1;
        console.log(`Growing water province attempt ${provinceCount}`)
        seedAndGrowWaterCell()
    }
    let num = (world.coveredWater / world.waterCells);
    console.log(`${num}% water provincing complete`)
}

function seedAndGrowWaterCell() {
    let randomY = getRandomInt(0, 4095);
    let randomX = getRandomInt(0, 8191);
    let cell = world.smallMap[randomY][randomX]
    if (cell.colorR || cell.bigCell.elevation > limits.seaLevel.upper) {
        //do nothing if province already applied or land
    } else {
        let generating = true;
        let count = 0;
        cell.children = [];
        cell.children.push(cell);
        cell.parent = cell;
        seedCell(cell.x, cell.y, "w")
        world.seedCells.push(cell)
        while (generating === true) {
            for (let i = 0; i < cell.children.length; i++) {
                growWaterCell(cell.children[i])
                count += 1;
                if (count === 100000 || cell.children.length > 50000) {
                    generating = false;
                }
            }
        }
    }
}

world.coveredWater = 0;

function growWaterCell(cell) {
    let randX = 0;
    let randY = 0;
    let rand = getRandomInt(0, 3);
    if (rand === 0) {
        randX = -1
    } else if (rand === 1) {
        randX = 1;
    } else if (rand === 2) {
        randY = -1
    } else if (rand === 3) {
        randY = 1;
    }
    let neighborX = randX + cell.x;
    let neighborY = randY + cell.y
    if (randX === 0 && randY === 0) {
        //do nothing if same cell
    } else {
        let randomNeighbor
        if (world.smallMap[neighborY]) {
            randomNeighbor = world.smallMap[neighborY][neighborX]
        }

        if (randomNeighbor) {
            randomNeighbor.elevation = cell.bigCell.elevation;
        }
        
        if (randomNeighbor && randomNeighbor.colorR) {
            //do nothing if assigned - look later to see if wwe need to check elevation - shouldn't have to because it should be assigned.
        } else {
            if (randomNeighbor && cell.bigCell.elevation <= limits.seaLevel.upper && randomNeighbor.bigCell.elevation <= limits.seaLevel.upper) {
                cell.province.cells += 1;
                randomNeighbor.colorR = cell.colorR
                randomNeighbor.colorG = cell.colorG
                randomNeighbor.colorB = cell.colorB
                randomNeighbor.parent = cell.parent;
                randomNeighbor.province = cell.province
                if (cell.children) {
                    cell.children.push(randomNeighbor)
                } else {
                    cell.parent.children.push(randomNeighbor)
                }
                world.coveredWater += 1;
            }
        }
    }
}

function seedAndGrowCell() {
    let cell = world.landCells[getRandomInt(0, world.landCells.length - 1)]
    if (cell.colorR) {
        //do nothing if province already applied
    } else {
        let generating = true;
        let count = 0;
        cell.children = [];
        cell.children.push(cell);
        cell.parent = cell;
        seedCell(cell.x, cell.y, "l")
        world.seedCells.push(cell)
        while (generating === true) {
            for (let i = 0; i < cell.children.length; i++) {
                growCell(cell.children[i])
                count += 1;
                if (count === 20000 || cell.children.length > 5000) {
                    generating = false;
                }
            }
        }
    }
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

function growCell(cell) {
    let randX = 0;
    let randY = 0;
    let rand = getRandomInt(0, 3);
    if (rand === 0) {
        randX = -1
    } else if (rand === 1) {
        randX = 1;
    } else if (rand === 2) {
        randY = -1
    } else if (rand === 3) {
        randY = 1;
    }
    let neighborX = randX + cell.x;
    let neighborY = randY + cell.y
    if (randX === 0 && randY === 0) {
        //do nothing if same cell
    } else {
        let randomNeighbor
        if (world.smallMap[neighborY]) {
            randomNeighbor = world.smallMap[neighborY][neighborX]
        }
        
        if (randomNeighbor && randomNeighbor.colorR) {
            //do nothing if assigned
        } else {
            if (randomNeighbor && cell.bigCell.elevation > limits.seaLevel.upper && randomNeighbor.bigCell.elevation > limits.seaLevel.upper) {
                cell.province.cells += 1;
                randomNeighbor.colorR = cell.colorR
                randomNeighbor.colorG = cell.colorG
                randomNeighbor.colorB = cell.colorB
                randomNeighbor.parent = cell.parent;
                randomNeighbor.province = cell.province
                randomNeighbor.elevation = randomNeighbor.bigCell.elevation + getRandomInt(-3, 3)
                if (cell.children) {
                    cell.children.push(randomNeighbor)
                } else {
                    cell.parent.children.push(randomNeighbor)
                }
                world.coveredLand += 1;
            } else if (randomNeighbor) {
                if (randomNeighbor.bigCell) {
                    randomNeighbor.bigCell.maskMarked = true; //mark for masking
                }
                cell.province.cells += 1;
                randomNeighbor.colorR = cell.colorR
                randomNeighbor.colorG = cell.colorG
                randomNeighbor.colorB = cell.colorB
                randomNeighbor.parent = cell.parent;
                randomNeighbor.elevation = limits.seaLevel.upper + getRandomInt(1, 3)
                //randomNeighbor.elevation = cell.elevation;
                world.landCells.push(randomNeighbor)
                randomNeighbor.province = cell.province
                if (cell.children) {
                    cell.children.push(randomNeighbor)
                } else {
                    cell.parent.children.push(randomNeighbor)
                }
                world.coveredLand += 1;
            }
        }
    }
}

function deleteSmallProvinces() {
    for (let i = 0; i < world.seedCells.length; i++) {
        let cell = world.seedCells[i]
        if (cell.children && cell.children.length < 900) {
            cell.colorR = undefined;
            cell.colorG = undefined;
            cell.colorB = undefined;
            cell.color = undefined;
            for (let j = 0; j < cell.children.length; j++) {
                cell.children[j].colorR = undefined;
                cell.children[j].colorG = undefined;
                cell.children[j].colorB = undefined;
                cell.children[j].color = undefined;
                world.coveredLand -= 1
            }
            cell.children = []
            let index = world.provinces.indexOf(cell.province);
            if (index !== -1) {
                world.provinces.splice(index, 1)
            }
            cell.province.cells = 0
        }
    }
}

function civProcess() {
    world.coveredLand = 0;
    world.coveredWater = 0;
    world.seedCells = []
    createSmallMap()
    console.log("Small Map Created")
    let addProvinceCounter = 0;
    addProvinces();
    let addingProvinces = true
    while (addingProvinces === true) {
        addProvinceCounter += 1;
        addProvinces();
        if ((world.coveredLand >= world.landCells.length) || addProvinceCounter === 10 || world.provinces.length > 8000) {
            addingProvinces = false;
        }
    }
    addWaterProvinces();
    addWaterProvinces();
    addWaterProvinces();
    console.log("Deleting too small provinces")
    deleteSmallProvinces();
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    fillIn()
    console.log("Filling In")
    console.log("Adding Provinces")
    addProvinces();
    bruteFillIn();
    console.log("Assigning province ids")
    assignProvinceIds();
    assignNonDefIds();
    console.log("Setting west-east adjacency")
    setWestEastAdjacency();
    console.log("Setting north-south adjacency");
    setNorthSouthAdjacency();
    console.log("Assigning adjacency to provinces")
    assignAdjacenciesToProvinces();
    console.log("Flattening adjacency arrays")
    flattenAdjacencyArrays();
    console.log("creating province definitions")
    world.counties = createCounties(world)
    world.duchies = createDuchies(world.counties, world) // duchies are later changed in createMyKingdoms function. Not ideal, but was a quick patch
    world.kingdoms = createMyKingdoms(world)
    world.empires = createEmpires(world)
    createRealCounties()
    assignTitleInfo()
    assignCultures();
    religionGenerator()
    console.log("Drawing province map")
    drawProvinceMap()
    //simpleCounties()
    //simpleDuchies()
    //simpleKingdoms()
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

function fillIn() {
    for (let i = 0; i < world.seedCells.length; i++) {
        let cell = world.seedCells[i]
        if (cell.children && cell.children.length > 0) {
            for (let j = 0; j < cell.children.length; j++) {
                if (cell.bigCell.elevation > limits.seaLevel.upper) {
                    growCell(cell.children[j])
                } else {
                    growWaterCell(cell.children[j])
                }
            }
        }
    }
}

function bruteFillIn() {
    console.log("Starting brute fill")
    for (let i = 0; i < 4096; i++) {
        let last = {};
        for (let j = 0; j < 8192; j++) {
            let cell = world.smallMap[i][j]
            if (cell.colorR) {

            } else {
                if (last.colorR) {
                    cell.colorR = last.colorR
                }
            }
            last = cell;
        }
    }
    console.log("ending brute fill")
}

function addProvinces() {
    let provinceCount = 0;
    while (provinceCount < 10000) {
        if ((world.coveredLand >= world.landCells.length) || world.provinces.length > 8000) {
            break;
        }
        provinceCount += 1;
        console.log(`Growing Province ${provinceCount}`)
        seedAndGrowCell()
    }
    let num = (world.coveredLand / world.landCells.length)
    console.log(`${num}% complete`)
}
  
world.waterCells = 0

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

function getGreyscalePixelAt(pixels, x, y) {
    let yMult = y * 8192 * 4;
    let xMult = x * 4
    let total =  yMult + xMult
    return pixels.data[total]
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

function smallXY(x, y) {
    if (x < 0 || y < 0 || x > world.width || y > world.height) {
      return "edge"
    }
    return world.smallMap[y][x]
  }

function smallPixelFloodFill(x, y, color) {
    let cell = smallXY(x, y);
    let c = color || `rgb(${getRandomInt(1, 255)}, ${getRandomInt(1, 255)}, ${getRandomInt(1, 255)})`
    if ((cell && cell.lake === false) || (cell && cell.floodFilled === true)) {
      return
    }
    if (cell && cell.lake === true) {
      cell.floodFilled = true;
      cell.riverId = c
      try {
        floodFill(x + 1, y, c);
      } catch {
  
      }
      try {
        floodFill(x - 1, y, c);
      } catch {
  
      }
      try {
        floodFill(x, y + 1, c);
      } catch {
  
      }
      try {
        floodFill(x, y - 1, c)
      } catch {
  
      }
  
    }
  }


GID("provinceMap").onclick = function() {
    drawProvinceMap()
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

function simpleLandedTitleAssignment() { //a very simple non-functioning top-down generator of title information. I don't like it and only goes to duchy for now.
    let empires = []
    for (let i = 0; i < 20; i++) {
        let e = {};
        e.centerX = getRandomInt(1, 8191);
        e.centerY = getRandomInt(1, 4091);
        e.power = getRandomInt(500, 2000);
        e.provinces = []
        empires.push(e)
    }
    for (let i = 0; i < world.provinces.length; i++) { // Assing provinces to empires
        let closest;
        let closestDist
        let prov = world.provinces[i]
        if (prov.cells > 0 && prov.land) {
            for (let j = 0; j < empires.length; j++) {
                let dist = getDistance(empires[j].centerX, empires[j].centerY, prov.x, prov.y)
                if (j === 0) {
                    closest = empires[j]
                    closestDist = dist
                } else {
                    if (dist < closestDist) {
                        closest = empires[j]
                        closestDist = dist
                    }
                }
            }
            closest.provinces.push(prov)
            prov.empire = closest
        }
    }
    
    for (let i = 0; i < empires.length; i++) { // attach kingdoms to empires and assign provinces
        let currentEmpire = empires[i]
        currentEmpire.kingdoms = [];
        for (let j = 0; j < 20; j++) {
            let k = {};
            k.centerX = currentEmpire.centerX + getRandomInt(-300, 300);
            k.centerY = currentEmpire.centerY + getRandomInt(-300, 300);
            k.power = getRandomInt(100, 300);
            k.provinces = []
            currentEmpire.kingdoms.push(k)
        }
        for (let j = 0; j < currentEmpire.provinces.length; j++) {
            let prov = currentEmpire.provinces[j]
            let closest;
            let closestDist
            for (let n = 0; n < currentEmpire.kingdoms.length; n++) {
                let currentKingdom = currentEmpire.kingdoms[n]
                let dist = getDistance(currentKingdom.centerX, currentKingdom.centerY, prov.x, prov.y)
                if (n === 0) {
                    closest = currentKingdom;
                    closestDist = dist;
                } else {
                    if (dist < closestDist) {
                        closest = currentKingdom;
                        closestDist = dist
                    }
                }
            }
            closest.provinces.push(prov)
            prov.kingdom = closest
        }

        for (let j = 0; j < currentEmpire.kingdoms.length; j++) {
            let currentKingdom = currentEmpire.kingdoms[j]
            currentKingdom.duchies = []
            for (let n = 0; n < 20; n++) {
                let d = {};
                d.centerX = currentKingdom.centerX + getRandomInt(-300, 300);
                d.centerY = currentKingdom.centerY + getRandomInt(-300, 300);
                d.provinces = [];
                currentKingdom.duchies.push(d)
            }
            for (let n = 0; n < currentKingdom.provinces.length; n++) {
                let prov = currentKingdom.provinces[n]
                let closest;
                let closestDist;
                for (let z = 0; z < currentKingdom.duchies.length; z++) {
                    let currentDuchy = currentKingdom.duchies[z]
                    let dist = getDistance(currentDuchy.centerX, currentDuchy.centerY, prov.x, prov.y)
                    if (z === 0) {
                        closest = currentDuchy;
                        closestDist = dist
                    } else {
                        if (dist < closestDist) {
                            closest = currentDuchy
                            closestDist = dist
                        }
                    }
                }
                closest.provinces.push(prov)
                prov.duchy = closest
            }
            
        }
    }
    world.empires = empires
}