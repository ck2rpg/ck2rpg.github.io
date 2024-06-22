//MAKE SURE THE HEIGHTMAP IMAGE IS NOT COMMENTED OUT IN HTML FILE
//fix elevatoin shifting for loaded heightmaps
//match heightmap to type of elevation data we're generating

function createSmallMapFromHeightMap() {
    world.heightmapping = true;
    world.smallMap = []
    world.landCells = [];
    world.waterCells = 0
    canvas.width = settings.width;
    canvas.height = settings.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, settings.width, settings.height);
    let img = GID("heightmapImg")
    console.log(img)
    img.onclick = function() {
        alert("Hello")
    }
    ctx.drawImage(img, 0, 0)
    let pixels = wholeCanvasImage()
    for (let i = 0; i < settings.height; i++) {
        world.smallMap[i] = []
        for (let j = 0; j < settings.width; j++) {
            let cell = {};
            cell.x = j;
            cell.y = i
            cell.elevation = getGreyscalePixelAt(pixels, j, i)
            cell.bigCell = {};
            cell.bigCell.elevation = cell.elevation; // super janky approach to not trying to fix bigCell issue
            if (cell.elevation > limits.seaLevel.upper) {
                world.landCells.push(cell)
            } else {
                world.waterCells += 1;
            }
            world.smallMap[i][j] = cell
        }
    }
}

function heightMapCivProcess() {
    createBlankWorld();
    world.coveredLand = 0;
    world.coveredWater = 0;
    world.seedCells = []
    world.provinces = [];
    createSmallMapFromHeightMap()

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
    console.log("Adding Provinces")
    addProvinces();
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
    console.log("Drawing province map")
    drawProvinceMap()
    console.log("creating province definitions")
    simpleCounties()
    simpleDuchies()
    simpleKingdoms()
}

function getGreyscalePixelAt(pixels, x, y) {
    let yMult = y * settings.width * 4;
    let xMult = x * 4
    let total =  yMult + xMult
    return pixels.data[total]
}

//createProvinceTerrain still uses bigCell