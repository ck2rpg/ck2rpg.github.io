function clearFloodFillProvinces() {
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        p.floodFilled = false;
    }
}

//floodfill deserts, etc... needed

function floodFillWaterProvinces() {
    world.waterBodies = []
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.land) {

        } else {
            floodFillWater(p)
        }
    }
    
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.land) {

        } else {
            let exists = false;
            for (let n = 0; n < world.waterBodies.length; n++) {
                let wb = world.waterBodies[n]
                if (wb.id === p.waterId) {
                    exists = true
                    wb.provinces.push(p)
                    wb.size += p.cells
                }
            }
            if (exists === false) {
                let wb = {}
                wb.size = 0;
                wb.id = p.waterId
                wb.provinces = [];
                wb.provinces.push(p)
                wb.size += p.cells
                world.waterBodies.push(wb)
            }
        }
        p.floodFilled = false;
    }
}

function floodFillWater(p, color) {
    let c = color || `rgb(${getRandomInt(1, 255)}, ${getRandomInt(1, 255)}, ${getRandomInt(1, 255)})`
    if (p && p.floodFilled) {
        return;
    }
    if (p.land) {
        p.adjacentToWater.push(c);
        return
    } else {
        p.floodFilled = true;
        p.waterId = c

    }
    for (let i = 0; i < p.adjacencies.length; i++) {
        let correctedNum = parseInt(p.adjacencies[i])
        let neighbor = world.provinces[correctedNum]
        if (neighbor.adjacentToWater) {

        } else {
            neighbor.adjacentToWater = []
        }
        try {
            floodFillWater(neighbor, c)
        } catch {

        }
    }
}

function slope(rise, run) {
    return rise / run
}

function getElevationChange(cell1, cell2) {
    return cell2.elevation - cell1.elevation
}

function terrainPenalty(currentTerrain, terrain) {
    if (currentTerrain === terrain) {
        return 1
    } else if (terrain === "farmlands" || terrain === "oasis" || terrain === "floodplains") {
      return 1.5  
    } else if (terrain === "plains" || terrain === "forest") {
        return 2
    } else if (terrain === "hills" || terrain === "jungle" || terrain === "wetlands" || terrain === "steppe") {
        return 2.5
    } else if (terrain === "mountains") {
        return 3
    } else if (terrain === "desert" || terrain === "desert_mountains" || terrain === "drylands" || terrain === "taiga") {
        return 3.5;
    } else {
        //default if none of terrains match
        return 1
    }
}

let geo = {}
geo.bay = 0;
geo.lake = 0;
geo.island = 0; // geo.island only counts single province islands - counting larger islands will require a monkey patch to continent counts, which are currently pulling single cells elsewhere that do not appear to be continents.

function setProvinceDirections() {
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        p.placeInWorld = {}
        p.placeInWorld.neighbors = []
        p.placeInWorld.waterNeighbors = 0;
        p.placeInWorld.landNeighbors = 0;
        p.neighborTerrains = [];
        for (let n = 0; n < p.adjacencies.length; n++) {
            let adj = parseInt(p.adjacencies[n])
            let neighbor = world.provinces[adj]
            let o = {};
            o.def = adj + 1
            o.nonDef = adj
            o.direction = getDirection(p, neighbor);
            o.distance = getDistance(p.x, p.y, neighbor.x, neighbor.y)
            o.elevationChange = getElevationChange(p, neighbor)
            o.slope = slope(o.elevationChange, o.distance)


            if (neighbor.land) {
                o.attractiveness = (o.elevationChange * -1) - o.distance / terrainPenalty(p.terrain, neighbor.terrain)
                p.placeInWorld.landNeighbors += 1;
            } else {
                o.attractiveness = -1
                o.water
                p.placeInWorld.waterNeighbors += 1;
            }
            p.neighborTerrains.push(neighbor.terrain)
            p.placeInWorld.neighbors.push(o)
        }
        if (p.land && p.placeInWorld.landNeighbors === 0) {
            p.placeInWorld.island = true
            geo.island +=1 ;
        }
        if (p.land === false && p.placeInWorld.waterNeighbors === 0) {
            p.placeInWorld.lake = true
            geo.lake += 1;
        }
        if (p.land === false && p.placeInWorld.waterNeighbors === 1 && p.placeInWorld.landNeighbors > 1) {
            p.placeInWorld.bay = true
            geo.bay += 1
        }
    }
}

function explain() {
    floodFillWaterProvinces()
    clearFloodFillProvinces();
    floodFillContinents()
    mapProvincesToContinents()
    setProvinceDirections()
    //mountains and rivers are taken care of in growCell function

    let t = ``
    t += `There are ${world.continents.length} continents on this world.\n`
    for (let i = 0; i < world.continents.length; i++) {
        if (world.continents[i].provinces.length > 0) {
            let c = world.continents[i]
            t += `Continent ${c.id}:\n`
            t += `North Reach: ${c.farthestNorth}\n`
            t += `South Reach: ${c.farthestSouth}\n`
            t += `West Reach: ${c.farthestWest}\n`
            t += `East Reach: ${c.farthestEast}\n`
            t += `Big Cells: ${c.cells.length}\n`
            t += `Provinces: ${c.provinces.length}\n`
        }
    }
    t += `There are ${world.waterBodies.length} waterbodies on this world.\n`
    for (let i = 0; i < world.waterBodies.length; i++) {
        let wb = world.waterBodies[i]
        t += `Waterbody ${wb.id} is ${wb.provinces.length} Provinces\n`

    }
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i];
        if (p.localizedTitle) {
            t += `Province ${p.id}; b_${p.titleName}; ${p.localizedTitle}\n`
        } else {
            t += `Province ${p.id}; WATER\n`
            t += `Waterbody: ${p.waterId}\n`
        }
        t += `Coords: ${p.x}, ${p.y}\n`
        t += `Elevation: ${p.elevation}\n`
        t += `Color: ${p.colorR}, ${p.colorG}, ${p.colorB}\n`
        t += `Land: ${p.land}\n`
        if (p.land) {
            t += `Terrain: ${p.terrain}\n`
        } else {
            t += `Terrain: Water\n`
        }
        if (p.adjacentToWater) {
            t += `Adjacent to Water: `
            for (let z = 0; z < p.adjacentToWater.length; z++) {
                t += `${p.adjacentToWater[z]};`
            }
            t += `\n`
        }
        t += `Size: ${p.cells}\n`
        t += `Adjacencies: `
        for (let n = 0; n < p.placeInWorld.neighbors.length; n++) {
            let p2 = p.placeInWorld.neighbors[n]
            t += `${p2.def} (${p2.distance} ${p2.direction}, ${p2.elevationChange}, ${p2.slope});`
        }
        t += `\n`
        let c = p.county;
        if (c) {
            t += `County: c_${c.titleName}; ${c.localizedTitle}\n`
        }
        if (p.rivers && p.rivers.length > 0) {
            t += `Rivers in Province:\n`
            for (let n = 0; n < p.rivers.length; n++) {
                t += `${p.rivers[n]}; `
            }
            t += `\n`
        }
        if (p.mountains && p.mountains.length > 0) {
            t += `Mountain Ranges in Province:\n`
            for (let n = 0; n < p.mountains.length; n++) {
                t += `Mountain Range ${p.mountains[n]}; `
            }
            t += `\n`
        }
        if (p.continent) {
            t += `Continent: ${p.continent}`
            t += `\n`
        }
    }
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="gen_province_properties" download="gen_province_properties.txt" href="">Download Province Properties (Winter Severity)</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`gen_province_properties`).href = url
    document.getElementById(`gen_province_properties`).click();
}