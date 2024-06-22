function createProvinces() {
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
    console.log("creating province terrain")
    createProvinceTerrain()

    console.log("identifying waterbodies")
    floodFillWaterProvinces()

    
    clearFloodFillProvinces();
    console.log("identifying continents")
    floodFillContinents()
    console.log("mapping provinces to continents")
    mapProvincesToContinents()
    console.log("mapping the province's place in the world")
    setProvinceDirections()


    //here is where you would intercept with different code after province generation
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
}

function createSmallMap() { 
    let count = 0;
    world.smallMap = []
    world.landCells = [];
    for (let i = 0; i < settings.height; i++) {
        world.smallMap[i] = [];
        for (let j = 0; j < settings.width; j++) {
            let bigX = Math.floor(j / settings.pixelSize)
            let bigY = Math.floor(i / settings.pixelSize)
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
    for (let i = 0; i < settings.height; i++) {
        let last = {};
        for (let j = 0; j < settings.width; j++) {
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
    let cH = settings.height - 1
    let cW = settings.width - 1
    let randomY = getRandomInt(0, cH);
    let randomX = getRandomInt(0, cW);
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
        province.population = 0
        province.elevation = cell.elevation
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

function setWestEastAdjacency() {
    for (let i = 0; i < settings.width; i++) {
        for (let j = 0; j < settings.height; j++) {
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
    for (let i = 0; i < settings.width; i++) {
        for (let j = 0; j < settings.height; j++) {
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

function flattenAdjacencyArrays() {
    for (let i = 0; i < world.provinces.length; i++) {
        let province = world.provinces[i]
        let unique = province.adjacencies.filter(onlyUnique)
        province.adjacencies = unique;
    }
}

function growCell(cell) {    
    //I have to stuff a bunch of unrelated province explainer logic into growcell to avoid another pass since province definition is one of the only times we iterate over small cells for performance reasons.
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
                //rivers for explainer

                if (randomNeighbor.bigCell.riverObject) {
                    if (cell.province.rivers) {
                        if (cell.province.rivers.indexOf(randomNeighbor.bigCell.riverObject.id) === -1) {
                            cell.province.rivers.push(randomNeighbor.bigCell.riverObject.id)
                        }
                    } else {
                        cell.province.rivers = [];
                        cell.province.rivers.push(randomNeighbor.bigCell.riverObject.id)
                    }
                }
                //mountains for explainer
                if (randomNeighbor.bigCell.mountainId) {
                    if (cell.province.mountains) {
                        if (cell.province.mountains.indexOf(randomNeighbor.bigCell.mountainId) === -1) {
                            cell.province.mountains.push(randomNeighbor.bigCell.mountainId)
                        }
                    } else {
                        cell.province.mountains = []
                        cell.province.mountains.push(randomNeighbor.bigCell.mountainId)
                    }
                }

                //adding randomNeighbor to province
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

                //rivers for explainer
                if (randomNeighbor.bigCell.riverObject) {
                    if (cell.province.rivers) {
                        if (cell.province.rivers.indexOf(randomNeighbor.bigCell.riverObject.id) === -1) {
                            cell.province.rivers.push(randomNeighbor.bigCell.riverObject.id)
                        }
                    } else {
                        cell.province.rivers = [];
                        cell.province.rivers.push(randomNeighbor.bigCell.riverObject.id)
                    }
                }

                //mountains for explainer
                if (randomNeighbor.bigCell.mountainId) {
                    if (cell.province.mountains) {
                        if (cell.province.mountains.indexOf(randomNeighbor.bigCell.mountainId) === -1) {
                            cell.province.mountains.push(randomNeighbor.bigCell.mountainId)
                        }
                    } else {
                        cell.province.mountains = []
                        cell.province.mountains.push(randomNeighbor.bigCell.mountainId)
                    }
                }

                //adding randomNeighbor to province
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
        if (cell.children && cell.children.length < settings.tooSmallProvince) { //should be 900
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