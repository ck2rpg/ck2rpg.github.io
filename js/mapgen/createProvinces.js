const funnyMessages = [
    "Taming wild borders... with a whip.",
    "Convincing mountains to stay put.",
    "Teaching rivers to flow gracefully.",
    "Herding provinces like stubborn sheep.",
    "Drawing maps without falling off the edge.",
    "Planting forests pixel by pixel.",
    "Persuading lakes to sit still.",
    "Whispering to mountains to stop growing.",
    "Negotiating peace with the coastline.",
    "Telling deserts to stay dry.",
    "Counting all the invisible dragons.",
    "Smoothing out wrinkles in the map.",
    "Tickling the map for accuracy.",
    "Convincing hills not to roll away.",
    "Patching up cartographer coffee stains.",
    "Making sure the map is dragon-free.",
    "Bargaining with mountains for better views.",
    "Double-checking no provinces are missing.",
    "Aligning stars for perfect navigation.",
    "Drawing borders with a very steady hand.",
    "Keeping forests from wandering off.",
    "Checking for hidden treasure spots.",
    "Ensuring rivers don't get lost.",
    "Convincing volcanoes to behave.",
    "Telling swamps to stay in their lanes."
  ];

function getDominantTerrain(provinces) {
    // List of terrains to consider, excluding "sea"
    const terrainTypes = ["desert", "drylands", "floodplains", "hills", "mountains", "plains", "taiga", "desert_mountains", "farmlands", "forest", "jungle", "oasis", "steppe", "wetlands"];
    
    // Iterate through each province
    provinces.forEach(province => {
        let maxTerrain = null;
        let maxCount = -1;
        if (province.land) {
            // Iterate through each terrain type and find the one with the highest count
            terrainTypes.forEach(terrain => {
                if (province.terrainCount[terrain] > maxCount) {
                    maxCount = province.terrainCount[terrain];
                    maxTerrain = terrain;
                }
            });
            
            // Add a property to the province object for the dominant terrain
            province.dominantTerrain = maxTerrain;
            province.terrain = maxTerrain
        } else {
            province.dominantTerrain = "sea"
            province.terrain = "sea"
        }
        

    });
}

function upscaleOverrides() {

}

function getCellSmallCells(cell) {
    let arr = []
    for (let i = 0; i < settings.pixelSize; i++) {
        for (let j = 0; j < settings.pixelSize; j++) {
            let y = cell.y * settings.pixelSize + i;
            let x = cell.x * settings.pixelSize + j;
            let smallCell = world.smallMap[y][x];
            if (smallCell) {
                arr.push(smallCell);
            }
        }
    }
    return arr;
}

function createOverrideLandProvinces() {
    //set items on provinces that can't be set until after creation
    for (let i = 0; i < world.height; i++) {
        for (let j = 0; j < world.width; j++) {
            let cell = world.map[i][j];
            if (cell.provinceOverride) {
                let c = getColorObjectFromString(cell.provinceOverride)
                let color = `${c.r}, ${c.g}, ${c.b}`;
                if (provinceKeys[color]) { //if province colors already exist on provinceKeys
                    let prov = provinceKeys[color];
                    cell.province = prov
                    let ckX = cell.x * settings.pixelSize;
                    let ckY = cell.y * settings.pixelSize;
                    let smallCell = world.smallMap[ckY][ckX];
                    smallCell.bigCell = cell
                    smallCell.color = color
                    smallCell.colorR = c.r;
                    smallCell.colorG = c.g;
                    smallCell.colorB = c.b;
                    smallCell.province = prov
                    smallCell.elevation = smallCell.bigCell.elevation //+ getRandomInt(-3, 3);

                    if (prov.seed) {
                        prov.seed.children.push(smallCell)
                        smallCell.parent = prov.seed
                    } else {
                        smallCell.children = [];
                        cell.province.seed = smallCell
                        cell.province.farthestEast = smallCell;
                        cell.province.farthestWest = smallCell;
                        cell.province.farthestNorth = smallCell;
                        cell.province.farthestSouth = smallCell
                        cell.province.x = ckX
                        cell.province.y = ckY
                        smallCell.parent = smallCell;
                        smallCell.children.push(smallCell);
                        smallCell.seedCell = true;
                        world.populatedCells.push(cell);
                        world.seedCells.push(smallCell);
                        prov.seed = smallCell;
                        /*
                        let county = prov.county;
                        let duchy = prov.duchy;
                        let kingdom = prov.kingdom;
                        let empire = prov.empire

                        //have to come back and set faiths because can't do it in first instance?
                        if (county.faith) {
                            prov.faith = county.faith
                        } else if (duchy.faith) {
                            prov.faith = duchy.faith;
                            county.faith = duchy.faith;
                        } else if (kingdom.faith) {
                            prov.faith = kingdom.faith;
                            county.faith = kingdom.faith;
                            duchy.faith = kingdom.faith;
                        } else if (empire.faith) {
                            prov.faith = empire.faith;
                            county.faith = empire.faith;
                            duchy.faith = empire.faith;
                            kingdom.faith = empire.faith
                        }
                        */
                    }
                    let arr = getCellSmallCells(cell);
                    for (let n = 0; n < arr.length; n++) {
                        let next = arr[n];
                        if (next === smallCell) {
                            // Don't do anything if it is the seed cell
                        } else {
                            growCell(smallCell, next);
                        }
                    }
                } else {
                    // If province colors do not exist on province keys, create a new province
                    let ckX = cell.x * settings.pixelSize;
                    let ckY = cell.y * settings.pixelSize;
                    let smallCell = world.smallMap[ckY][ckX];
                    let selectedColor = `${c.r}, ${c.g}, ${c.b}`;
                    smallCell.color = selectedColor;
                    let selectedColorObject = getColorObjectFromString(selectedColor);
                    smallCell.colorR = selectedColorObject.r;
                    smallCell.colorG = selectedColorObject.g;
                    smallCell.colorB = selectedColorObject.b;
                    smallCell.elevation = smallCell.bigCell.elevation //+ getRandomInt(-3, 3);
                    //let prov = createProvince(ckX, ckY, "l", smallCell);
                    console.log(`Created province color ${selectedColor}. world.provinces is ${world.provinces.length} now`)
                    smallCell.province = cell.province
                    smallCell.children = [];
                    smallCell.children.push(smallCell);
                    smallCell.parent = smallCell;
                    smallCell.seedCell = true;
                    world.populatedCells.push(cell);
                    world.seedCells.push(smallCell);
                    provinceKeys[color] = cell.province; // Ensure province is added to provinceKeys
                    cell.province.seed = smallCell
                    cell.province.farthestEast = smallCell;
                    cell.province.farthestWest = smallCell;
                    cell.province.farthestNorth = smallCell;
                    cell.province.farthestSouth = smallCell
                    cell.province.x = ckX
                    cell.province.y = ckY
                    let arr = getCellSmallCells(cell);
                    for (let n = 0; n < arr.length; n++) {
                        let next = arr[n];
                        if (next === smallCell) {
                            // Don't do anything if it is the seed cell
                        } else {
                            growCell(smallCell, next);
                        }
                    }
                }
            }
        }
    }
}


function createOverrideWaterProvinces() {
    //creates provinces based on user defined overrides prior to random province generation
    for (let i = 0; i < world.height; i++) {
        for (let j = 0; j < world.width; j++) {
            let cell = world.map[i][j];
            if (cell.waterOverride) {
                let c = getColorObjectFromString(cell.waterOverride)
                let color = `${c.r}, ${c.g}, ${c.b}`;
                if (provinceKeys[color]) { //if province colors already exist on provinceKeys
                    let prov = provinceKeys[color];
                    let seed = prov.seed;
                    let arr = getCellSmallCells(cell);
                    for (let n = 0; n < arr.length; n++) {
                        let next = arr[n];
                        if (next === seed) {
                            // Don't do anything if it is the seed cell
                        } else {
                            growWaterCell(seed, next);
                        }
                    }
                } else {
                    // If province colors do not exist on province keys, create a new province
                    let ckX = cell.x * settings.pixelSize;
                    let ckY = cell.y * settings.pixelSize;
                    let smallCell = world.smallMap[ckY][ckX];
                    let selectedColor = `${c.r}, ${c.g}, ${c.b}`;
                    smallCell.color = selectedColor;
                    let selectedColorObject = getColorObjectFromString(selectedColor);
                    smallCell.colorR = selectedColorObject.r;
                    smallCell.colorG = selectedColorObject.g;
                    smallCell.colorB = selectedColorObject.b;
                    let prov = createProvince(ckX, ckY, "w", smallCell);
                    console.log(`Created province color ${selectedColor}. world.provinces is ${world.provinces.length} now`)
                    smallCell.province = prov;
                    smallCell.children = [];
                    smallCell.children.push(smallCell);
                    smallCell.parent = smallCell;
                    smallCell.seedCell = true;
                    world.populatedCells.push(cell);
                    world.seedCells.push(smallCell);
                    provinceKeys[color] = prov; // Ensure province is added to provinceKeys

                    let arr = getCellSmallCells(cell);
                    for (let n = 0; n < arr.length; n++) {
                        let next = arr[n];
                        if (next === smallCell) {
                            // Don't do anything if it is the seed cell
                        } else {
                            growWaterCell(smallCell, next);
                        }
                    }
                }
            }
        }
    }
}

function createProvince(x, y, landWater, cell) {
    let province = {};
    province.seed = cell;
    province.farthestNorth = cell;
    province.farthestSouth = cell;
    province.farthestWest = cell;
    province.farthestEast = cell;
    province.terrainCount = {}
    province.terrainCount["desert"] = 0
    province.terrainCount["drylands"] = 0
    province.terrainCount["floodplains"] = 0
    province.terrainCount["hills"] = 0
    province.terrainCount["mountains"] = 0
    province.terrainCount["plains"] = 0
    province.terrainCount["taiga"] = 0
    province.terrainCount["desert_mountains"] = 0
    province.terrainCount["farmlands"] = 0
    province.terrainCount["forest"] = 0
    province.terrainCount["jungle"] = 0
    province.terrainCount["oasis"] = 0
    province.terrainCount["steppe"] = 0
    province.terrainCount["wetlands"] = 0
    province.terrainCount["sea"] = 0
    province.terrainCount[`${cell.bigCell.terrain}`] += 1
    province.adjacentToWater = []
    province.rivers = []
    province.mountains = []
    province.population = 0
    province.elevation = cell.elevation
    provinceCount += 1;
    province.geographicalRegions = []
    province.color = cell.color
    province.keyColor = `${cell.colorR}, ${cell.colorG}, ${cell.colorB}`
    provinceKeys[`${province.keyColor}`] = province
    province.colorR = cell.colorR;
    province.colorG = cell.colorG;
    province.colorB = cell.colorB;
    if (landWater === "l") {
        province.land = true;
        province.titleName = `R${province.colorR}G${province.colorG}B${province.colorB}`
    } else {
        province.land = false
    }
    province.adjacencies = []
    province.x = x; 
    province.y = y;
    province.hemisphere = setHemisphere(province)
    province.distanceFromEquator = calculateDistanceFromEquator(province)
    province.bigCell = cell.bigCell
    province.cells = 1
    world.provinces.push(province)
    return province;
}


async function createProvinces() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Initialize all messages
    initializeMessages();

    world.coveredLand = 0;
    world.coveredWater = 0;
    world.seedCells = [];
    if (settings.width === world.width) {
        world.smallMap = world.map;
        for (let n = 0; n < world.map.length; n++) {
            for (let j = 0; j < world.map[n].length; j++) {
                let cell = world.map[n][j]
                cell.bigCell = cell;
                if (cell.elevation > limits.seaLevel.upper) {
                    world.landCells.push(cell)
                } else {
                    world.waterCells += 1;
                }
            }
        }
    } else {
        createSmallMap();
    }
    createCellTerrains()
    createOverrideWaterProvinces()
    createOverrideLandProvinces()


    await updateDOM("Adding Provinces", 0);

    let addProvinceCounter = 0;
    addProvinces();
    let addingProvinces = true;
    while (addingProvinces === true) {
        addProvinceCounter += 1;
        addProvinces();
        //8000
        if ((world.coveredLand >= world.landCells.length) || addProvinceCounter === 10 || world.provinces.length > settings.landProvinceLimit) {
            addingProvinces = false;
        }
    }

    await updateDOM("Adding Water Provinces", 1);

    addWaterProvinces();
    addWaterProvinces();
    addWaterProvinces();
    deleteSmallProvinces();
    

    await updateDOM("Deleting Too Small Provinces", 2);
    for (let i = 0; i < settings.fillInLimit; i++) {
        fillIn();
        await updateDOM(`Filling In (${i + 1}/${settings.fillInLimit})`, 3);
    }

    //addProvinces();
    await updateDOM("Adding Provinces Again", 4);

    bruteFillIn();
    assignProvinceIds();
    await updateDOM("Assigning Province IDs", 5);

    assignNonDefIds();
    setWestEastAdjacency();
    await updateDOM("Setting West-East Adjacency", 6);

    setNorthSouthAdjacency();
    await updateDOM("Setting North-South Adjacency", 7);

    assignAdjacenciesToProvinces();
    await updateDOM("Assigning Adjacency to Provinces", 8);

    flattenAdjacencyArrays();
    await updateDOM("Flattening Adjacency Arrays", 9);

    //resetLand(world);
    //createProvinceTerrainNew();
    getDominantTerrain(world.provinces)
    await updateDOM("Creating Province Terrain", 10);

    floodFillWaterProvinces();
    await updateDOM("Identifying Waterbodies", 11);

    if (world.width === 512) {
        //is this a good limit? Kills memory because it is small cell based. Could we replace with floodFillContinentsByProvince?
        clearFloodFillProvinces();
        floodFillContinents();
        await updateDOM("Identifying Continents", 12);
    
        mapProvincesToContinents();
        await updateDOM("Mapping Provinces to Continents", 13);
    } else {
        console.log("Skipped flood filling continents and waterbodies because resolution is too large")
    }



    assignDaylight();
    await updateDOM("Assigning Daylight", 14);

    createWinterSeverity();
    await updateDOM("Creating Winter Severity", 15);

    setProvinceDirections();
    await updateDOM("Setting Province Directions", 16);

    overloadProvinceProperties();
    await updateDOM("Creating Regional Information", 17)
    let counties = createCounties(world);
    await updateDOM("Creating Counties", 18);

    let duchies = createDuchies(counties, world);
    await updateDOM("Creating Duchies", 19);

    let dk = createMyKingdoms(duchies, world);
    await updateDOM("Creating Kingdoms", 20);

    let empires = createEmpires(dk.k, world);
    await updateDOM("Creating Empires", 21);

    let realCounties = createRealCounties(dk.d); // creates objects from indices arrays
    for (let i = 0; i < empires.length; i++) {
        world.empires.push(empires[i])
    }
    for (let i = 0; i < dk.k.length; i++) {
        let kingdom = dk.k[i]
        world.kingdoms.push(kingdom)
    }
    for (let i = 0; i < dk.d.length; i++) {
        let duchy = dk.d[i]
        world.duchies.push(duchy);
    }
    for (let i = 0; i < realCounties.length; i++) {
        world.counties.push(realCounties[i])
    }
    console.log(world.empires)
    await updateDOM("Creating Real Counties", 22);

    bubbleUpProvinces()

    assignTitleInfo();
    await updateDOM("Assigning Title Info", 23);

    setCountyFavorability()



    assignOverrideCultures();

    if (!settings.titleUploaded) {
        //assuming all or nothing here. If you upload a filled in map, it is assumed cultures and faiths are generated from that map. If that changes in the future, this will not work (it will leave cultures ungenerated for non-drawn areas)
        assignCultures();
    }
    
    await updateDOM("Assigning Cultures", 24);
    //assignTraditionPossibilities()

    assignOverrideFaiths()
    assignHolySites()

    if (!settings.titlesUploaded) {
        religionGenerator();
    } 

    faithsSlideDown()
    await updateDOM("Generating Religions", 25);

    drawProvinceMap();
    await updateDOM("Drawing Province Map", 26);
    GID("province-creation-screen").style.display = "none"
    downloadImage(canvas, "provinces.png")
    GID("province-drawn-proceed").style.display = "block"
    GID("main-generator-div").style.display = "block";
    settings.currentStage = "provincesGenerated"
    world.drawingType = "smallEmpire";
    paintbrush = "empireOverride";
    drawWorld();
    updateEmpireColorColumn();
}

// Function to initialize all messages in red
function initializeMessages() {
    const messages = [
        "Adding Provinces",
        "Adding Water Provinces",
        "Deleting Too Small Provinces",
        "Filling In (0/20)",
        "Adding Provinces Again",
        "Assigning Province IDs",
        "Setting West-East Adjacency",
        "Setting North-South Adjacency",
        "Assigning Adjacency to Provinces",
        "Flattening Adjacency Arrays",
        "Creating Province Terrain",
        "Identifying Waterbodies",
        "Identifying Continents",
        "Mapping Provinces to Continents",
        "Assigning Daylight",
        "Creating Winter Severity",
        "Setting Province Directions",
        "Creating Regional Information",
        "Creating Counties",
        "Creating Duchies",
        "Creating Kingdoms",
        "Creating Empires",
        "Creating Real Counties",
        "Assigning Title Info",
        "Assigning Cultures",
        "Generating Religions",
        "Drawing Province Map"
    ];

    const container = GID("province-creation-screen");
    container.innerHTML = "";
    const timingElement = document.createElement("div")
    timingElement.textContent = `The province generation process generally takes approximately two minutes and thirty seconds:`
    container.appendChild(timingElement)
    messages.forEach((msg, index) => {
        const messageElement = document.createElement("div");
        messageElement.id = `step-${index}`;
        messageElement.style.color = "rgb(148, 78, 78)";
        messageElement.textContent = msg;
        container.appendChild(messageElement);
    });
}

// Function to update the DOM with a message and turn it green when done
function updateDOM(message, step) {
    return new Promise(resolve => {
        let messageContainer = GID(`step-${step}`);
        if (!messageContainer) {
            messageContainer = document.createElement("div");
            messageContainer.id = `step-${step}`;
            GID("province-creation-screen").appendChild(messageContainer);
        }
        messageContainer.innerHTML = message;
        messageContainer.style.color = "#67b96b";
        setTimeout(() => {
            resolve();
        }, 0); // Allows the browser to update the DOM
    });
}


//end new

//monkey patch fix but should work - addresses issue where land was initially set on seed cell but wasn't always right (instead of figuring out the issue...)
function resetLand(world) {
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.elevation > limits.seaLevel.upper ) {
            p.land = true
        } else {
            p.land = false
        }
    }
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
            if (bigCell.elevation > 36) { //limits.seaLevel.upper replacement
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

function createRealCounties(duchies) {
    let countyArr = []
    for (let i = 0; i < duchies.length; i++) {
        let duchy = duchies[i]
        for (let j = 0; j < duchy.counties.length; j++) {
            let county = duchy.counties[j]
            let c = {};
            c.provinces = []
            c.ownProvinces = []
            for (let n = 0; n < county.length; n++) {
                let prov = world.provinces[county[n]]
                c.ownProvinces.push(county[n])
                c.provinces.push(prov)
                prov.county = c;
                prov.duchy = duchy
            }
            duchy.counties[j] = c
            c.duchy = duchy;
            c.kingdom = duchy.kingdom;
            c.empire = c.kingdom.empire
            countyArr.push(c)
        }
    }
    return countyArr
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
            if (cell.colorR || cell.bigCell.provinceOverride) {

            } else {
                if (last.colorR) {
                    cell.colorR = last.colorR
                    cell.colorG = last.colorG;
                    cell.colorB = last.colorB
                } else {
                    world.needsPlaceholder = true;
                }
            }
            last = cell;
        }
    }
    console.log("ending brute fill")
}

function addProvinces() {
    let provinceCount = 0;
    while (provinceCount < settings.landProvinceLimit) {
        if ((world.coveredLand >= world.landCells.length) || world.provinces.length > settings.landProvinceLimit) {
            break;
        }
        provinceCount += 1;
        seedAndGrowCell()
    }
    let num = (world.coveredLand / world.landCells.length)
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
    while (provinceCount < settings.waterProvinceLimit && waterProvinceCounter < settings.waterProvinceLimit) {
        if (world.coveredWater > world.waterCells || waterProvinceCounter > settings.waterProvinceLimit) {
            break;
        }
        provinceCount += 1;

        seedAndGrowWaterCell()
    }
    let num = (world.coveredWater / world.waterCells);
}

function seedAndGrowWaterCell() {
    let cH = settings.height - 1
    let cW = settings.width - 1
    let randomY = getRandomInt(0, cH);
    let randomX = getRandomInt(0, cW);
    let cell = world.smallMap[randomY][randomX]
    if (cell.colorR || cell.bigCell.provinceOverride || cell.bigCell.elevation > limits.seaLevel.upper) {
        //do nothing if province already applied or land
    } else {
        waterProvinceCounter += 1;
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

function growWaterCell(cell, target) {
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

        if (target) {
            randomNeighbor = target
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
                randomNeighbor.color = cell.color
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
    if (cell.colorR || cell.bigCell.provinceOverride) {
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
    if (cell.colorR || cell.bigCell.provinceOverride) {

    } else {
        let randColor = getUniqueColor()
        cell.color = randColor;
        let colorObject = getColorObjectFromString(randColor);
        cell.colorR = colorObject.r;
        cell.colorG = colorObject.g;
        cell.colorB = colorObject.b;
        cell.elevation = cell.bigCell.elevation + getRandomInt(-3, 3)
        let province = createProvince(x, y, landWater, cell);
        world.populatedCells.push(cell)
        cell.province = province
        cell.seedCell = true;
    }
}

function assignClimateCategory(cell) {
    let y = cell.y
    if (isTropical(y)) {
        cell.climateCategory = "tropical"
    } else if (isSubTropical(y)) {
        cell.climateCategory = "subtropical";
    } else if (isTemperate(y)) {
        cell.climateCategory = "temperate"
    } else if (isCold(y)) {
        cell.climateCategory = "cold"
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

function setHemisphere(province) {
    let h;
    if (province.y < settings.equator) {
        h = 'Northern';
    } else {
        h = 'Southern';
    }
    return h;
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

function growCell(cell, target) {    //target is needed to allow you to set a cell in brushEditor.js
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

        if (target) {
            randomNeighbor = target
        }
        
        if (randomNeighbor && (randomNeighbor.colorR || randomNeighbor.bigCell.provinceOverride)) {
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
                randomNeighbor.colorR = cell.province.colorR
                randomNeighbor.colorG = cell.province.colorG
                randomNeighbor.colorB = cell.province.colorB
                randomNeighbor.color = cell.province.color;
                randomNeighbor.parent = cell.parent;
                randomNeighbor.province = cell.province
                randomNeighbor.elevation = randomNeighbor.bigCell.elevation + getRandomInt(-3, 3)
                if (cell.children) {
                    cell.children.push(randomNeighbor)
                } else {
                    cell.parent.children.push(randomNeighbor)
                }
                cell.province.terrainCount[`${randomNeighbor.bigCell.terrain}`] += 1
                if (randomNeighbor.y >= cell.province.farthestSouth.y) {
                    cell.province.farthestSouth = randomNeighbor;
                } 
                if (randomNeighbor.y <= cell.province.farthestNorth.y) {
                    cell.province.farthestNorth = randomNeighbor;
                }
                if (randomNeighbor.x >= cell.province.farthestEast.x) {
                    cell.province.farthestEast = randomNeighbor
                }
                if (randomNeighbor.x <= cell.province.farthestWest.x) {
                    cell.province.farthestWest = randomNeighbor;
                }
                world.coveredLand += 1;
            } else if (randomNeighbor) { //allows spread over water
                if (settings.fixBlockiness) {
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
                    randomNeighbor.colorR = cell.province.colorR
                    randomNeighbor.colorG = cell.province.colorG
                    randomNeighbor.colorB = cell.province.colorB
                    randomNeighbor.color = cell.province.color;
                    randomNeighbor.parent = cell.parent;
                    randomNeighbor.elevation = limits.seaLevel.upper + getRandomInt(15, 20) // change to higher to see if it fixes sinking provinces
                    //randomNeighbor.elevation = cell.elevation;
                    world.landCells.push(randomNeighbor)
                    randomNeighbor.province = cell.province
                    if (cell.children) {
                        cell.children.push(randomNeighbor)
                    } else {
                        cell.parent.children.push(randomNeighbor)
                    }
                    world.coveredLand += 1;
                    cell.province.terrainCount[`${randomNeighbor.bigCell.terrain}`] += 1
                    if (randomNeighbor.y >= cell.province.farthestSouth.y) {
                        cell.province.farthestSouth = randomNeighbor;
                    } 
                    if (randomNeighbor.y <= cell.province.farthestNorth.y) {
                        cell.province.farthestNorth = randomNeighbor;
                    }
                    if (randomNeighbor.x >= cell.province.farthestEast.x) {
                        cell.province.farthestEast = randomNeighbor
                    }
                    if (randomNeighbor.x <= cell.province.farthestWest.x) {
                        cell.province.farthestWest = randomNeighbor;
                    }
                }
            }
        }
    }
}

function deleteSmallProvinces() {
    for (let i = 0; i < world.seedCells.length; i++) {
        let cell = world.seedCells[i]
        if (cell.bigCell.waterOverride || cell.bigCell.provinceOverride) {
            //don't delete provinces if they were created by man
        } else if (cell.children && cell.children.length < settings.tooSmallProvince) { //should be 900
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