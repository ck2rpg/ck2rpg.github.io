/* WIND IDEA
https://forhinhexes.blogspot.com/2018/11/clearer-winds.html#comment-form
There are a few things to keep in mind as we create this model.

  Wind slows as it drags across the ground
  Wind picks up speed when going downhill and slows uphill
  Wind is turned aside by mountains

So there are (in the most simple representation) 3 parameters that can be tuned. I'll call them g for ground drag, s for slope change (where Δ can represent the different in height of the hexes), and θ(ρ,Δ) for the change in direction by a mountain (or hill, etc), where ρ is the sensitivity of the wind.
*/

/*
TRAVELOGUE: https://github.com/dariusk/NaNoGenMo-2015/issues/156
*/

function wholeImage() {
  let d = ctx.getImageData(0, 0, world.width, world.height);
  let b = new Uint32Array(d);
  return d
}

function wholeCanvasImage() {
  let d = ctx.getImageData(0, 0, 8192, 4096);
  return d;
}

function normalizeTypedArray(a) {
  let count = 0;
  let map = [];
  for (let i = 0; i < world.height * world.pixelSize; i++) {
    let arr = [];
    for (let j = 0; j < world.width * world.pixelSize; j++) {
      let o = {};
      o.r = a.data[count];
      count += 1;
      o.g = a.data[count];
      count += 1;
      o.b = a.data[count];
      count += 2;
      arr.push(o)
    }
    map.push(arr)
  }
  return map
}

function getRGB(pixels, num) {
  let r = pixels.data[num]
  num += 1
  let g = pixels.data[num]
  num += 1
  let b = pixels.data[num]
  if (r && g && b) {
    return `${r}, ${g}, ${b}`
  } else {
    return undefined
  }

}

function redoLetterMap() {
  world.drawingType = "book";
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      world.map[i][j].text = bookText[currentBookPosition]
      currentBookPosition += 1
      if (currentBookPosition === bookText.length - 1) {
        currentBookPosition = 0
      }
    }
  }

}

GID("letter-map").onclick = function() {
  world.drawingType = "book";
  redoLetterMap()
  drawWorld()
}

let bookText = aliceText.split("");
let currentBookPosition = 0;

function GID(el) {
  return document.getElementById(el);
}

function getRandomColor() {
  return `rgb(${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)})`
}

GID("seedCiv").onclick = function() {
  seedCivilization()
}

function seedCivilization() {
  for (let i = 0; i < 10; i++) {
    let x = getRandomInt(1, world.width);
    let y = getRandomInt(1, world.height);
    let cell = xy(x, y)
    if (cell && biome(cell) !== "ocean") {
      drawInkCastle(cell)
    }
  }
}



function setMoisture() {
  for (let i = 0; i < world.height; i++) {
    let cloud = {};
    cloud.x = 0;
    cloud.y = i;
    cloud.moisture = 50;
    cloud.mountainCount = 0
    while (cloud.x < world.width - 1) {
      let cell = xy(cloud.x, cloud.y)
      cell.moisture = cloud.moisture
      let next = xy(cloud.x + 1, cloud.y)
      let diff = Math.floor(next.elevation - cell.elevation)
      if (diff > 10) {
        cloud.moisture -= 1
      }
      if (next.elevation > limits.mountains.lower) {
        cloud.mountainCount += 1
        if (diff > 0) {
          cloud.moisture -= 1;
          next.moisture = cloud.moisture
        }
        if (cloud.moisture < 0) { cloud.moisture = 0}
      } else {
        cloud.mountainCount -= 1
      }
      if (next.elevation <= limits.seaLevel.upper) {
        cloud.moisture += 1
      }
      if (cloud.mountainCount < 0) {
        cloud.mountainCount = 0
      }
      if (cloud.mountainCount > 0 && next.elevation < limits.mountains.lower) {
        next.desert = true
      } else if (cloud.y > world.desertPointBottom + getRandomInt(1, 10) && cloud.y < world.desertPointTop + getRandomInt(1, 10) && cloud.moisture < 50) {
        next.desert = true
      } else {
        next.desert = false
      }
      cloud.x += 1
    }
  }
}

function getMountains() {
  let arr = [];
  for (let j = 0; j < world.height; j++) {
    for (let i = 0; i < world.width; i++) {
      let cell = xy(i, j);
      if (cell.elevation > limits.mountains.lower) {
        arr.push(cell);
      }
    }
  }
  return arr
}

function getLakes() {
  let arr = [];
  for (let j = 0; j < world.height; j++) {
    for (let i = 0; i < world.width; i++) {
      let cell = xy(i, j);
      if (cell.lake) {
        arr.push(cell);
      }
    }
  }
  return arr
}

function getTrees() {
  let arr = [];
  for (let j = 0; j < world.height; j++) {
    for (let i = 0; i < world.width; i++) {
      let cell = xy(i, j);
      if (cell.tree) {
        arr.push(cell);
      }
    }
  }
  return arr
}

function getLand() {
  let arr = [];
  for (let j = 0; j < world.height; j++) {
    for (let i = 0; i < world.width; i++) {
      let cell = xy(i, j);
      cell.floodFilled = false
      if (cell.elevation > limits.seaLevel.upper) {
        arr.push(cell);
      }
    }
  }
  return arr
}


function createBlankCell(x, y) {
  let cell = {};
  cell.x = x;
  cell.y = y;
  cell.tree = false
  cell.elevation = getRandomInt(-254, -200)
  cell.magma = 0;
  cell.asteroidNames = []
  cell.river = false
  cell.lake = false
  cell.beach = false;
  cell.population = 0;
  cell.raindrops = 0;
  cell.floodFilled = false;
  return cell
}

function createBlankMap() {
  let map = []
  for (let i = 0; i < world.height; i++) {
    let arr = []
    for (let j = 0; j < world.width; j++) {
      arr.push(createBlankCell(j, i))
    }
    map.push(arr)
  }
  return map
}

GID("drift").onclick = function() {
  moveContinents()
}

function moveContinents() {
  let map = createBlankMap()
  for (let i = 0; i < world.continents.length; i++) {
    let continent = world.continents[i]
    for (let n = 0; n < continent.cells.length; n++) {
      let cell = continent.cells[n]
      let x = cell.x
      let y = cell.y
      cell.x += continent.moveX;
      cell.y += continent.moveY
      if (cell.y > world.height) {
        cell.y = 0
      }
      if (cell.x > world.width) {
        cell.x = 0;
      }
      if (cell.y < 0) {
        cell.y = world.height - 1
      }
      if (cell.x < 0) {
        cell.x = world.width - 1
      }
      if (cell.x > 0 && cell.x < world.width && cell.y > 0 && cell.y < world.height) {
        map[cell.y][cell.x] = copyCell(cell)
        map[cell.y][cell.x].copied = true
        if (map[y][x].copied) {

        } else {
          map[y][x] = createBlankCell(x, y)
        }
        //add collison mechanics
      }
    }
  }
  world.map = map

  //COLLISION MECHANICS
  for (let i = 0; i < world.continents.length; i++) {
    let continent = world.continents[i]
    for (let n = 0; n < continent.cells.length; n++) {
      let cell = continent.cells[n]

      try {
        let mapCell = xy(cell.x, cell.y);
        if (mapCell.combined) {
          mapCell.combined += 1
        } else {
          mapCell.combined = 1
        }
        mapCell.elevation += cell.elevation
        if (mapCell.combined > 1) {
          mapCell.elevation += (mapCell.combined * 30)
        }
      } catch {

      }

    }
  }
  cleanupAll()
  setMoisture()
  drawWorld()
}


function copyCell(cell) {
  let c = {};
  c.x = cell.x
  c.y = cell.y
  c.tree = false
  c.elevation = 0
  c.magma = cell.magma
  c.asteroidNames = cell.asteroidNames
  c.river = cell.river
  c.lake = cell.lake
  c.beach = cell.beach
  c.population = cell.population
  c.raindrops = cell.raindrops
  c.floodFilled = cell.floodFilled
  c.continentId = cell.continentId
  return c
}


function floodFillContinent(x, y, color) {
  let cell = xy(x, y);
  let c = color || `rgb(${getRandomInt(1, 255)}, ${getRandomInt(1, 255)}, ${getRandomInt(1, 255)})`
  if (cell && cell.floodFilled === true) {
    return
  }
  if (cell && cell.elevation > (limits.seaLevel.upper)) {
    cell.floodFilled = true;
    cell.continentId = c
    try {
      floodFillContinent(x + 1, y, c);
    } catch {

    }
    try {
      floodFillContinent(x - 1, y, c);
    } catch {

    }
    try {
      floodFillContinent(x, y + 1, c);
    } catch {

    }

    try {
      floodFillContinent(x, y - 1, c)
    } catch {

    }
    
    
    
    
  }
}


function floodFillContinents() {
  let land = getLand()
  for (let i = 0; i < land.length; i++) {
    let cell = land[i]
    if (cell && cell.floodFilled === false) {
      floodFillContinent(cell.x, cell.y)
    }
  }
  for (let i = 0; i < land.length; i++) {
    let cell = land[i]
    let exists = false;
    for (let n = 0; n < world.continents.length; n++) {
      let continent = world.continents[n];
      if (continent.id === cell.continentId) {
        continent.cells.push(cell)
        exists = true
      }
    }
    if (exists === false) {
      let continent = {};
      continent.id = cell.continentId;
      continent.cells = [];
      continent.cells.push(cell);
      continent.moveX = getRandomInt(-1, 1);
      continent.moveY = getRandomInt(-1, 1)
      continent.provinces = []
      world.continents.push(continent)
    }
  }
}

function floodFill(x, y, color) {
  let cell = xy(x, y);
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

function floodFillTree(x, y, color) {
  try {
    let cell = xy(x, y);
    let c = color || `rgb(${getRandomInt(1, 255)}, ${getRandomInt(1, 255)}, ${getRandomInt(1, 255)})`
    if (cell.tree === false || cell.floodFilled === true) {
      return
    }
    if (cell.tree === true) {
      cell.floodFilled = true;
      cell.forestId = c
      floodFillTree(x + 1, y, c);
      floodFillTree(x - 1, y, c);
      floodFillTree(x, y + 1, c);
      floodFillTree(x, y - 1, c)
    }
  } catch {

  }

}

function floodFillMountain(x, y, color) {
  try {
    let cell = xy(x, y);
    let c = color || `rgb(${getRandomInt(1, 255)}, ${getRandomInt(1, 255)}, ${getRandomInt(1, 255)})`
    if (cell.elevation < limits.mountains.lower || cell.floodFilled === true) {
      return
    }
    if (cell.elevation >= limits.mountains.lower) {
      cell.floodFilled = true;
      cell.mountainId = c
      floodFillMountain(x + 1, y, c);
      floodFillMountain(x - 1, y, c);
      floodFillMountain(x, y + 1, c);
      floodFillMountain(x, y - 1, c)
    }
  } catch {

  }
}

function floodFillRivers() {
  //clearRiverStatus();
  world.rivers = []
  let lakes = getLakes()
  for (let i = 0; i < lakes.length; i++) {
    let cell = lakes[i]
    if (cell && cell.floodFilled === false) {
      floodFill(cell.x, cell.y)
    }
  }
  for (let i = 0; i < lakes.length; i++) {
    let cell = lakes[i]
    let exists = false;
    for (let n = 0; n < world.rivers.length; n++) {
      let river = world.rivers[n];
      if (river.id === cell.riverId) {
        river.cells.push(cell)
        exists = true
      }
    }
    if (exists === false) {
      let river = {};
      river.id = cell.riverId;
      river.cells = [];
      river.cells.push(cell);
      world.rivers.push(river)
    }
  }
  console.log(world.rivers)
  for (let i = 0; i < world.rivers.length; i++) {
    let river = world.rivers[i]
    river.coasts = []
    river.oceanOutlets = []
    river.isRiver = false;
    for (let n = 0; n < river.cells.length; n++) {
      let riverCell = river.cells[n]
      //riverCell.dropToWater = true;
      let neighbors = getNeighbors(riverCell.x, riverCell.y)
      for (let j = 0; j < neighbors.length; j++) {
        let neighbor = neighbors[j]
        if (neighbor) {
          if (neighbor.lake === false && neighbor.elevation > limits.seaLevel.upper) {
            river.coasts.push(neighbor)
            let rand = getRandomInt(1, 15);
            if (rand < 5) {
              neighbor.farmlandPotential = true;
            } else if (rand < 10) {
              //neighbor.floodplainPotential = true;
            } else {
              //do nothing
            }
          }
          if (neighbor.elevation <= limits.seaLevel.upper) {
            river.oceanOutlets.push(neighbor)
            river.isRiver = true
          }
        }
      }
    }
  }
  for (let i = 0; i < world.rivers.length; i++) {
    let water = world.rivers[i]
    if (water.isRiver) {
      for (let i = 0; i < water.cells.length; i++) {
        water.cells[i].lake = false;
        water.cells[i].river = true;
      }
    } else {
      for (let i = 0; i < water.cells.length; i++) {
        water.cells[i].lake = true;
        water.cells[i].river = false;
      }
    }
  }
}

function getRiverById(id) {
  for (let i = 0; i < world.rivers.length; i++) {
    let river = world.rivers[i]
    if (id === river.id) {
      return river
    }
  }
}

function clearRiverStatus() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      cell.lake = false;
      cell.river = false;
      if (cell.riverId) {
        cell.riverId = false
      }
      if (cell.dropToWater) {
        cell.dropToWater = false;
      }
      if (cell.highPointRiver) {
        cell.highPointRiver = false;
      }
      if (cell.drawableRiver) {
        cell.drawableRiver = false
      }
      if (cell.farmlandPotential) {
        cell.farmlandPotential = false;
      }
      if (cell.floodplainPotential) {
        cell.floodplainPotential = false;
      }
    }
  }
}

function resetTerrain() {
  world.mountains = [];
  floodFillMountains();
  world.forests = [];
  floodFillTrees();
  world.rivers = [];
  floodFillRivers();
}

function floodFillMountains() {
  let mountains = getMountains()
  for (let i = 0; i < mountains.length; i++) {
    let cell = mountains[i]
    if (cell.floodFilled === false) {
      floodFillMountain(cell.x, cell.y)
    }
  }
  for (let i = 0; i < mountains.length; i++) {
    let cell = mountains[i]
    let exists = false;
    for (let n = 0; n < world.mountains.length; n++) {
      let mountain = world.mountains[n];
      if (mountain.id === cell.mountainId) {
        mountain.cells.push(cell)
        exists = true
      }
    }
    if (exists === false) {
      let mountain = {};
      mountain.id = cell.mountainId;
      mountain.cells = [];
      mountain.cells.push(cell);
      world.mountains.push(mountain)
    }
  }
}

function floodFillTrees() {
  let trees = getTrees();
  for (let i = 0; i < trees.length; i++) {
    let cell = trees[i]
    if (cell.floodFilled === false) {
      floodFillTree(cell.x, cell.y)
    }
  }
  console.log(trees)
  for (let i = 0; i < trees.length; i++) {
    let cell = trees[i]
    let exists = false;
    for (let n = 0; n < world.forests.length; n++) {
      let forest = world.forests[n];
      if (forest.id === cell.forestId) {
        forest.cells.push(cell)
        exists = true
      }
    }
    if (exists === false) {
      let forest = {};
      forest.id = cell.forestId;
      forest.cells = [];
      forest.cells.push(cell);
      world.forests.push(forest)
    }
  }
}

function timeTick() {
  rainErosion();
  getBeaches()
  if (world.trees.length === 0) {
    seedForests()
  }
  floodFillRivers();
  floodFillMountains()
  floodFillTrees()
  //add to check for entities that are too small and disregard
  forestTick()
  setMoisture()
  fixRivers()
  drawWorld();
}

function fixRivers() {
  floodFillRivers()
  world.correctedRivers = []
  for (let i = 0; i < world.rivers.length; i++) {
    let arr = [];
    for (let j = 0; j < world.rivers[i].cells.length; j++) {
      let cell = world.rivers[i].cells[j]
      if (arr[cell.y]) {
        arr[cell.y][cell.x] = "river"
      } else {
        arr[cell.y] = [];
        arr[cell.y][cell.x] = "river"
      }
    }
    world.correctedRivers.push(arr)
  }
}

function getBeaches() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      cell.beach = false
      try {
        let neighbors = getNeighbors(cell.x, cell.y);
        if (cell.elevation >= limits.seaLevel.upper) {
          let isBeach = false;
          for (let n = 0; n < neighbors.length; n++) {
            let neighbor = neighbors[n]
            if (neighbor.elevation < limits.seaLevel.upper) {
              neighbor.coastal = true
              isBeach = true;
              break;
            } else {
              neighbor.coastal = false
            }
          }
          if (isBeach === true) {
            cell.beach = true
          } else {
            cell.beach = false
          }
        }
      } catch {

      }
    }
  }
}

GID("tick").onclick = function() {
  timeTick()
  console.log("TICK")
}

GID("startup").onclick = function() {
  startup()
}

let limits = {}
limits.pineTree = {
  lower: 10,
  upper: 255
}
limits.mountains = {
  lower: 255,
  upper: 510,
  snowLine: 450
}
limits.raindrops = {
  lower: 600
}

limits.seaLevel = {
  upper: 36 // elevation is divided by two in heightmap!
}

let world = {};

function createBlankWorld() {
  world.drawingType = "colorful"
  world.map = []
  world.rivers = []
  world.mountains = []
  world.forests = []
  world.riverIds = []
  world.pixelSize = 16
  world.tectonics = {}
  world.religions = []
  world.tectonics.spreadingCenters = []
  if (world.height) {

  } else {
    //default otherwise
    world.height = 256
    world.width = 512
  }

  world.equator = Math.floor(world.height / 2)
  world.steppeTop = world.equator + Math.floor(world.height / 8)
  world.steppeBottom = world.equator - Math.floor(world.height / 8)
  world.frostPointBottom = Math.floor(world.height / 10);
  world.frostPointTop = world.height - world.frostPointBottom
  world.desertPointTop = Math.floor(world.height / 2) + Math.floor(world.height/ 10)
  world.desertPointBottom = Math.floor(world.height / 2) - Math.floor(world.height/ 10)
  world.asteroids = []
  world.trees = []
  world.continents = []
  world.landCells = [];
  world.populatedCells = [];
  world.provinces = []
  for (let i = 0; i < world.height; i++) {
    let row = []
    for (let j = 0; j < world.width; j++) {
      let cell = {};
      cell.x = j;
      cell.y = i;
      cell.ckX = j * world.pixelSize; // top left corner of extended square
      cell.ckY = 4096 - (i * world.pixelSize) /// top left corner of extended square
      cell.tree = false
      cell.elevation = getRandomInt(-254, -200)
      cell.magma = 0;
      cell.asteroidNames = []
      cell.river = false
      cell.lake = false
      cell.beach = false;
      cell.population = 0;
      cell.raindrops = 0;
      cell.floodFilled = false;
      cell.dropToWater = false;
      row.push(cell)
    }
    world.map.push(row)
  }
}

function createEmptyCell(x, y) {
  let cell = {};
  cell.x = x;
  cell.y = y;
  cell.tree = false
  cell.elevation = getRandomInt(-254, -200)
  cell.magma = 0;
  cell.asteroidNames = []
  cell.river = false
  cell.lake = false
  cell.beach = false;
  cell.population = 0;
  cell.raindrops = 0;
  cell.floodFilled = false;
  return cell
}

function xy(x, y) {
  if (x < 0 || y < 0 || x > world.width || y > world.height) {
    return "edge"
  }
  return world.map[y][x]
}

function drawTrees() {
  for (let i = 0; i < world.trees.length; i++) {
    let tree = world.trees[i]
    if (tree.dead) {
      ctx.clearRect(tree.x * world.pixelSize, tree.y * world.pixelSize, world.pixelSize, world.pixelSize);
      drawCell(tree.x, tree.y)
    } else {
      drawSmallPixel(ctx, tree.x, tree.y, `rgb(0, 50, 0)`)
    }
  }
}
function createTree(type, x, y, parent) {
  let tree = {};
  tree.x = x;
  tree.y = y;
  xy(x, y).tree = true
  tree.type = type;
  tree.age = 0
  if (parent) {
    tree.seedTree = parent
    tree.fireAge = 0
  } else {
    tree.seedTree = tree
  }
  tree.dead = false
  return tree
}

function seedForests() {
  for (let i = 0; i < 100; i++) {
    let randX = getRandomInt(1, world.width - 2);
    let randY = getRandomInt(1, world.height - 2)
    let cell = xy(randX, randY)
    if (cell.elevation >= limits.seaLevel.upper && cell.tree === false && cell.elevation < limits.pineTree.upper) {
      world.trees.push(createTree("pine", randX, randY))
    }
  }
  console.log(world.trees)
}

function treeDeath(tree, num) {
  if (tree.type === "pine" && tree.age > 3) {
    tree.dead = true
    xy(tree.x, tree.y).tree = false
  }

}

function forestTick() {
  let arr = []
  let newX, newY;
  for (let j = 0; j < world.trees.length; j++) {
    let currentTree = world.trees[j]
    currentTree.age += 1
    treeDeath(currentTree, j)
    let rand = getRandomInt(0, 2)
    if (rand === 0) {
      newX = 0
    } else if (rand === 1) {
      newX = -1
    } else {
      newX = 1
    }
    rand = getRandomInt(0, 2)
    if (rand === 0) {
      newY = 0
    } else if (rand === 1) {
      newY = -1
    } else {
      newY = 1
    }
    if (newX === 0 && newY === 0) {
      newX = 1
    }
    newX = currentTree.x + newX;
    newY = currentTree.y + newY
    try {
      let nextTreeCell = xy(newX, newY)
      if (newX !== 0 && newY !== 0 && nextTreeCell.tree !== true && nextTreeCell.x > 0 && nextTreeCell.y > 0 && nextTreeCell.x < world.width && nextTreeCell.y < world.height && nextTreeCell.elevation > limits.pineTree.lower && nextTreeCell.elevation < limits.pineTree.upper && nextTreeCell.river === false && nextTreeCell.lake === false && nextTreeCell.desert === false) {
        arr.push(createTree("pine", nextTreeCell.x, nextTreeCell.y, world.trees[j].seedTree))
      }
    } catch {

    }

  }
  let newArray = world.trees.concat(arr);
  world.trees = newArray
  world.trees = world.trees.filter(item => item.dead !== true)




  /*
  After initialisation, the simulation runs for N steps, with NY steps
constituting a year. For each step, the following occur:
1. If it is the end of the year, all trees seed a number of new plants
in a ring around themselves.
2. For each pair of colliding trees, the plant with lower viability is
removed.
3. Plants which are older than their maximum age are considered
dead and are removed.
4. Each plant grows (its age is increased by 1).
*/
}



function createSpreadingCenters() {
  //let rand = getRandomInt(1, 15)
  //let rand = getRandomInt(30, 60)
  let rand = getRandomInt(5, 45)
  //let rand = getRandomInt(15, 30)
  //let rand = getRandomInt(50, 60)
  let num = Math.floor(world.width / rand)
  for (let i = 0; i < rand; i ++) {
    world.tectonics.spreadingCenters.push(num * i)
  }
  world.tectonics.spreadingLine = []
}
function createSpreadingLine(center) {
  let adjuster = Math.floor(world.height / getRandomInt(1, 15))
  let adjuster2 = Math.floor(world.height / getRandomInt(1, 15))
  let start = adjuster;
  let end = world.height - adjuster
  let widthStart = adjuster2
  let widthEnd = world.width - adjuster2
  for (let i = start; i < end; i++) {
    let rand = getRandomInt(0, 100);
    if (rand < 50) {
      //center -= getRandomInt(1, 20);
      center -= getRandomInt(1, 20);
    } else if (rand >= 50) {
      //center += getRandomInt(1, 20);
      center += getRandomInt(1, 20);
    } else {
      //do nothing
    }
    if (center < widthStart) {
      center = widthStart;
      center += getRandomInt(1, 50)
    }
    if (center >= widthEnd) {
      center = widthEnd - 1
      center -= getRandomInt(1, 50)
    }
    //let centerX = getRandomInt(1, 511)
    //let centerY = getRandomInt(1, 255)
    
    //let cell = xy(centerX, centerY)
    let cell = xy(center, i)
    cell.spreading = true;
    world.tectonics.spreadingLine.push(cell)
  }
}

function createHSpreadLine() {
  let y = getRandomInt(1, world.height - 1);
  for (let i = 1; i < world.width; i++) {
    let rand = getRandomInt(0, 100);
    if (rand < 50) {
      y -= getRandomInt(1, 20);
    } else {
      y += getRandomInt(1, 20);
    }
    if (y < 1) {
      y = 1
    }
    if (y > world.height - 1) {
      y = world.height - 1;
      y -= getRandomInt(1, 20);
    }
    let cell = xy(i, y);
    cell.spreading = true
    world.tectonics.spreadingLine.push(cell)
  }
}

function createWorld() {
  createBlankWorld()
  createSpreadingCenters();
  for (let i = 0; i < world.tectonics.spreadingCenters.length; i++) {
    createSpreadingLine(world.tectonics.spreadingCenters[i])
  }
  createHSpreadLine()
}

var canvas = document.getElementById("canvas");
canvas.style.width = '95vw';  // Example display size
canvas.style.height = '100vh';  // Example display size
var ctx = canvas.getContext('2d')



function drawSmallPixel(context, x, y, color) {
    var roundedX = Math.round(x);
  var roundedY = Math.round(y);
  context.fillStyle = color || '#000';
  context.fillRect(roundedX * world.pixelSize, roundedY * world.pixelSize, world.pixelSize, world.pixelSize);
}

function drawTinyPixel(context, x, y, color) {
  context.fillStyle = color || '#000';
  context.fillRect(x, y, 1, 1);
}

function totalCleanup() {
  let removed = 0;
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      if (cell.elevation >= limits.seaLevel.upper) {
        try {
          let neighbors = getNeighbors(cell.x, cell.y);
          let landNeighbors = 0;
          let stranded = true
          for (let n = 0; n < neighbors.length; n++) {
            if (neighbors[n].elevation >= limits.seaLevel.upper) {
              landNeighbors += 1;
            }
          }
          if (landNeighbors < 3) {
            stranded = true
          } else {
            stranded = false
          }
          if (stranded === true) {
            removed += 1
            cell.elevation = -1;
            cell.beach = false
          }
        } catch {

        }
      }
      if (cell.elevation >= limits.mountains.lower) {
        try {
          let neighbors = getNeighbors(cell.x, cell.y);
          let mountainNeighbors = 0;
          let stranded = true
          for (let n = 0; n < neighbors.length; n++) {
            if (neighbors[n].elevation >= limits.mountains.lower) {
              mountainNeighbors += 1;
            }
          }
          if (mountainNeighbors < 3) {
            stranded = true
          } else {
            stranded = false
          }
          if (stranded === true) {
            removed += 1
            cell.elevation = limits.mountains.lower - 1;
          }
        } catch {

        }
      }
      if (cell.elevation < limits.seaLevel.upper) {
        try {
          let neighbors = getNeighbors(cell.x, cell.y);
          let waterNeighbors = 0;
          let stranded = true
          for (let n = 0; n < neighbors.length; n++) {
            if (neighbors[n].elevation < limits.seaLevel.upper) {
              waterNeighbors += 1;
            }
          }
          if (waterNeighbors < 3) {
            stranded = true
          } else {
            stranded = false
          }
          if (stranded === true) {
            removed += 1
            cell.elevation = limits.seaLevel.upper + 1;
          }
        } catch {

        }
      }
    }
  }
}

function cleanupCoasts() {
  //removes stray land
  let removed = 0;
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      if (cell.elevation >= limits.seaLevel.upper) {
        try {
          let neighbors = getNeighbors(cell.x, cell.y);
          let landNeighbors = 0;
          let stranded = true
          for (let n = 0; n < neighbors.length; n++) {
            if (neighbors[n].elevation >= limits.seaLevel.upper) {
              landNeighbors += 1;
            }
          }
          if (landNeighbors < 3) {
            stranded = true
          } else {
            stranded = false
          }
          if (stranded === true) {
            removed += 1
            cell.elevation = -1;
            cell.beach = false
          }
        } catch {

        }
      }
    }
  }
  console.log(`${removed} removed`)
}

function cleanupMountains() {
  //removes stray land
  let removed = 0;
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      if (cell.elevation >= limits.mountains.lower) {
        try {
          let neighbors = getNeighbors(cell.x, cell.y);
          let mountainNeighbors = 0;
          let stranded = true
          for (let n = 0; n < neighbors.length; n++) {
            if (neighbors[n].elevation >= limits.mountains.lower) {
              mountainNeighbors += 1;
            }
          }
          if (mountainNeighbors < 3) {
            stranded = true
          } else {
            stranded = false
          }
          if (stranded === true) {
            removed += 1
            cell.elevation = limits.mountains.lower - 1;
          }
        } catch {

        }
      }
    }
  }
  console.log(`${removed} removed`)
}

function cleanupWater() {
  //removes stray water
  let removed = 0;
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      if (cell.elevation < limits.seaLevel.upper) {
        try {
          let neighbors = getNeighbors(cell.x, cell.y);
          let waterNeighbors = 0;
          let stranded = true
          for (let n = 0; n < neighbors.length; n++) {
            if (neighbors[n].elevation < limits.seaLevel.upper) {
              waterNeighbors += 1;
            }
          }
          if (waterNeighbors < 3) {
            stranded = true
          } else {
            stranded = false
          }
          if (stranded === true) {
            removed += 1
            cell.elevation = limits.seaLevel.upper + 1;
          }
        } catch {

        }
      }
    }
  }
  console.log(`${removed} removed`)
}

/* This results in too jagged of changes for nor eason - keeping for interest later
function addMountainVariation() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      if (cell.elevation > 160) {
        let rand = getRandomInt(0, 10);
        if (rand > 7) {
          cell.elevation += getRandomInt(1, 10);
          cell.magma = cell.elevation
        } else {
          cell.elevation -= getRandomInt(1, 10);
          cell.magma = cell.elevation
        }
        if (cell.elevation < 161) {
          cell.elevation = 161
          cell.magma = cell.elevation
        }
        if (cell.elevation > 240) {
          cell.elevation -= getRandomInt(1, 25)
          cell.magma = cell.elevation
        }
      }
    }
  }
}*/


GID("cleanup").onclick = function() {
  cleanupAll()
  drawWorld()
}

function cleanupAll() {
  console.log("cleaning coasts")
  cleanupCoasts()
  console.log("coasts cleaned")
  cleanupWater();
  console.log("water cleaned")
  cleanupMountains()
  getBeaches()
}

function lowerMountains() {
  let mountains = getMountains();
  for (let i = 0; i < mountains.length; i++) {
    mountains[i].elevation -= 1;
  }
}

function raiseElevation() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      cell.elevation += 1;
    }
  }
}

function lowerElevation() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      cell.elevation -= 1;
    }
  }
}

GID("raiseElevation").onclick = function() {
  raiseElevation()
}

GID("lowerElevation").onclick = function() {
  lowerElevation()
}

function raiseMountains() {
  let mountains = getMountains();
  for (let i = 0; i < mountains.length; i++) {
    mountains[i].elevation += 1;
  }
}

GID("lowerMountains").onclick = function() {
  lowerMountains();
  drawWorld()
}

GID("raiseMountains").onclick = function() {
  raiseMountains()
  drawWorld()
}

function drawInkTree(cell) {
  //sprite sheet, 32x32, hand-drawn black ink fantasy map tree symbol on white transparent background
  var roundedX = Math.round(cell.x);
  var roundedY = Math.round(cell.y);
  let img = GID(`tree${getRandomInt(1, 4)}`)
  console.log("DRAWING INK TREE")
  ctx.drawImage(img, roundedX * world.pixelSize, roundedY * world.pixelSize)
}

function drawInkMarsh(cell) {
  var roundedX = Math.round(cell.x);
  var roundedY = Math.round(cell.y);
  let img = GID(`marsh1`)
  ctx.drawImage(img, roundedX * world.pixelSize, roundedY * world.pixelSize)
}

function drawInkMountain(cell) {
  var roundedX = Math.round(cell.x);
  var roundedY = Math.round(cell.y);
  let img
  if (cell.elevation < 275) {
    img = GID("hills1");
  } else if (cell.elevation < 295) {
    img = GID("hills2")
  } else if (cell.elevation < 315) {
    img = GID("hills3");
  } else if (cell.elevation < 335) {
    img = GID("hills4")
  } else if (cell.elevation < 375) {
    img = GID("mountain4");
  } else if (cell.elevation < 405) {
    img = GID("mountain3");
  } else if (cell.elevation < 445) {
    img = GID("mountain2")
  } else {
    img = GID("mountain1")
  }
  ctx.drawImage(img, roundedX * world.pixelSize, roundedY * world.pixelSize)
}

function drawInkCastle(cell) {
  var roundedX = Math.round(cell.x);
  var roundedY = Math.round(cell.y);
  let img = GID("castle")
  ctx.drawImage(img, roundedX * world.pixelSize, roundedY * world.pixelSize)
}

function mapOutline(context, x, y, color, cell) {
  let r, g, b;
  b = 140 + Math.floor((cell.elevation / 5))
  g = 120 + Math.floor((cell.elevation / 5))
  r = 100 + Math.floor((cell.elevation / 5))
  context.fillStyle = `rgb(${r}, ${g}, ${b})`
  //context.fillStyle = color || '#000';
  context.fillRect(x, y, 10, 10);
}

function drawName(name, x, y) {
  ctx.font = "48px Georgia";
  /*ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI/2.5);
  */
  ctx.textAlign = "center";
  ctx.fillStyle = "red"
  ctx.fillText(name, x, y);
  //ctx.restore();

}

function drawCell(x, y) {
  let type = world.drawingType
  let cell = xy(x, y)
  let r = Math.floor((cell.elevation / 10) * 8);
  let g = Math.floor((cell.elevation / 10) * 6);
  let b = Math.floor((cell.elevation / 10) * 4);

  if (type === "book") {
    drawSmallPixel(ctx, cell.x, cell.y, "rgb(0, 0, 0)")
    if (biome(cell) === "beach") {
      cell.rgb = `rgb(${194 - (cell.elevation * 3)}, ${178 - (cell.elevation * 3)}, ${128 - (cell.elevation * 3)})`
    } else if (biome(cell) === "lake") {
      cell.rgb = `rgb(0, 0, ${350 - cell.elevation})`
    } else if (biome(cell) === "river") {
      cell.rgb = `rgb(0, 0, ${350 - cell.elevation})`
    } else if (biome(cell) === "mountain") {
      let mountainColor = cell.elevation
      let mountainMod = mountainColor - limits.mountains.lower
      let mountainR, mountainG, mountainB
      mountainR = mountainMod
      mountainG = mountainMod
      mountainB = mountainMod
      cell.rgb = `rgb(${mountainR}, ${mountainG}, ${mountainB})`
    } else if (biome(cell) === "arctic") {
      let el = cell.elevation
      cell.rgb = `rgb(${355 - el}, ${355 - el}, ${355 - el})`
    } else if (biome(cell) === "desert") {
      let correctedColor = getCorrectedColor(cell)
      let el = cell.elevation
      let desertR = Math.floor(194 * (el / 255))
      let desertG = Math.floor(178 * (el / 255))
      let desertB = Math.floor(128 * (el / 255))
      cell.rgb = `rgb(${desertR}, ${desertG}, ${desertB})`
    } else if (biome(cell) === "grass") {
      let correctedColor = getCorrectedColor(cell)
      let grassAccent = 0
      let grassAccent2 = 0
      let grass = correctedColor
      let grassAlpha
      if (grass > 100) {
        let diff = Math.floor(grass - 100)
        grassAccent = grass - 100
        grassAccent2 = Math.floor(grassAccent * 1.3)
        grass -= Math.floor(diff / 2.5)
        //grass -= Math.floor(diff / 3)
        let m = Math.floor(cell.elevation / 25);
        if (m < 1) { m = 1}
        grassAlpha = `0.${m}`
      }
      cell.rgb = `rgb(${grassAccent2}, ${grass}, ${grassAccent})`
    } else if (biome(cell) === "ocean"){
      let correctedColor = getCorrectedColor(cell)
      let waterMod = 255 - Math.floor(correctedColor * 0.6)
      cell.rgb = `rgb(0, 0, ${waterMod})`
    }
    if (cell.tree) {
      drawInkTree(cell)
    }
    if (cell.text) {
      ctx.fillStyle = cell.rgb
      ctx.font = "32px serif";
      ctx.fillText(cell.text, cell.x * world.pixelSize, cell.y * world.pixelSize)
    }

  }

  if (type === "parchment") {
    if (biome(cell) === "beach") {
      r = 0
      g = 0
      b = 0
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      //mapOutline(ctx, cell.x * world.pixelSize, cell.y * world.pixelSize, cell.rgb)
    } else if (cell.wetlands) {
      b = 255
      g = 255
      r = 255
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      drawInkMarsh(cell)
    } else if (biome(cell) === "river") {
      let num = getRandomInt(200, 210)
      b = num
      g = num
      r = num
      cell.rgb = `rgb(${0}, ${0}, ${0})`
      mapOutline(ctx, cell.x * world.pixelSize, cell.y * world.pixelSize, cell.rgb, cell)
    } else if (biome(cell) === "lake") {
      let num = getRandomInt(200, 210)
      b = num
      g = num
      r = num
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      //drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else if (biome(cell) === "ocean") {
      let num = getRandomInt(200, 210)
      b = num
      g = num
      r = num
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      //drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else if (biome(cell) === "mountain") {
      b = 255
      g = 255
      r = 255
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      //drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      drawInkMountain(cell)
    } else if (cell.tree) {
      b = 255
      g = 255
      r = 255
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      //drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      drawInkTree(cell)
    } else {
      cell.rgb = `rgb(255, 255, 255)`
      //drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    }
  }

  //paper
  if (type === "paper") {
    if (biome(cell) === "beach") {
      r = 255
      g = 255
      b = 255
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else if (cell.wetlands) {
      b = 255
      g = 255
      r = 255
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      //drawInkMarsh(cell)
    } else if (biome(cell) === "river") {
      let num = getRandomInt(200, 210)
      b = num
      g = num
      r = num
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else if (biome(cell) === "lake") {
      let num = getRandomInt(200, 210)
      b = num
      g = num
      r = num
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else if (biome(cell) === "ocean") {
      let num = getRandomInt(200, 210)
      b = num
      g = num
      r = num
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else if (biome(cell) === "mountain") {
      b = 255
      g = 255
      r = 255
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      //drawInkMountain(cell)
    } else if (cell.tree) {
      b = 255
      g = 255
      r = 255
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      //drawInkTree(cell)
    } else {
      cell.rgb = `rgb(255, 255, 255)`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    }
  }



  if (type === "papyrus") {
    /*if (biome(cell) === "river") {
      b = 140 + Math.floor((cell.elevation / 5))
      g = 120 + Math.floor((cell.elevation / 5))
      r = 100 + Math.floor((cell.elevation / 5))

      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else */if (biome(cell) === "lake") {
      b = 140 + Math.floor((cell.elevation / 5))
      g = 120 + Math.floor((cell.elevation / 5))
      r = 100 + Math.floor((cell.elevation / 5))

      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else if (cell.tree) {
      r = 230 - Math.floor((cell.elevation / 5))
      g = 210 - Math.floor((cell.elevation / 5))
      b = 183 - Math.floor((cell.elevation / 5))
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      //drawInkTree(cell)
    } else if (biome(cell) === "beach") {
      r = 230 - Math.floor((cell.elevation / 5))
      g = 210 - Math.floor((cell.elevation / 5))
      b = 183 - Math.floor((cell.elevation / 5))
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else if (biome(cell) === "ocean") {
      b = 140 + Math.floor((cell.elevation / 5))
      g = 120 + Math.floor((cell.elevation / 5))
      r = 100 + Math.floor((cell.elevation / 5))
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else if (biome(cell) === "mountain") {
      //drawMountain(cell)
      r = 230 - Math.floor((cell.elevation / 5))
      g = 210 - Math.floor((cell.elevation / 5))
      b = 183 - Math.floor((cell.elevation / 5))
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      //drawInkMountain(cell)
    } else if (biome(cell) === "arctic") {
      drawArctic(cell)
    }else {
      r = 230 - Math.floor((cell.elevation / 5))
      g = 210 - Math.floor((cell.elevation / 5))
      b = 183 - Math.floor((cell.elevation / 5))
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    }
  }





  if (type === "colorful") {
    let n = noise(cell.x, cell.y);
    if (cell.elevation < limits.seaLevel.upper) {
      b = 140 + Math.floor((cell.elevation / 5))
      g = 120 + Math.floor((cell.elevation / 5))
      r = 100 + Math.floor((cell.elevation / 5))
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } if (biome(cell) === "beach") {
      drawBeach(cell)
    } /*else if (biome(cell) === "lake") {
      b = 140 + Math.floor((cell.elevation / 5))
      g = 120 + Math.floor((cell.elevation / 5))
      r = 100 + Math.floor((cell.elevation / 5))
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else if (biome(cell) === "river") {
      b = 140 + Math.floor((cell.elevation / 5))
      g = 120 + Math.floor((cell.elevation / 5))
      r = 100 + Math.floor((cell.elevation / 5))
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    }*/ else if (cell.elevation >= limits.mountains.lower ) {
      drawMountain(cell)
    } else if (biome(cell) === "arctic") {
      drawArctic(cell)
    } else if (biome(cell) === "desert") {
      drawDesert(cell)
    } else if (biome(cell) === "grass") {
      drawGrass(cell)
      if ((n > 0.1 && n < 0.2) || (n > 0.8 && n < 0.9)) {
        //drawInkTree(cell)
      }
    } else if (biome(cell) === "ocean"){
      b = 140 + Math.floor((cell.elevation / 5))
      g = 120 + Math.floor((cell.elevation / 5))
      r = 100 + Math.floor((cell.elevation / 5))
      cell.rgb = `rgb(${r}, ${g}, ${b})`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    } else {
      drawGrass(cell)
    }
    drawRiverTemplateTransparent(cell)
  }

  if (type === "heightmap" ) {
    let c = Math.floor((cell.elevation / 2))
    /*if (cell.highPointRiver) {
      c -= 5
    }*/
    if (c > 255) {
      c = 255
    }
    if (c < 0) {
      c = 0;
    }
    cell.rgb = `rgb(${c}, ${c}, ${c})`
    drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
  }

  if (type === "rivermap") {
    let b = biome(cell)
    let c = Math.floor((cell.elevation / 2))
    if (cell.bebop) {
      drawRiverTemplate(cell)
    } else {
      if (cell.riverDrawn) {

      } else {
        if (c > limits.seaLevel.upper) {
          c = "#ffffff"
        }
        if (c <= limits.seaLevel.upper || cell.river || cell.lake) {
          c = "#ff0080";
        }
        cell.rgb = `${c}`
        drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      }
    }
    
    
  }

  if (type === "desertmask") {
    //coopted from drawDesert
    if (biome(cell) === "desert") {
      let el = cell.elevation
      let desertB = Math.floor(128 * (el / 255))
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${desertB}, ${desertB}, ${desertB})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    } 
  }

  if (type === "beach_02_mask") {
    if (cell.beach_02_mask) {
      let divisor = cell.beach_02_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "beach_02_mediterranean_mask") {
    if (cell.beach_02_mediterranean_mask) {
      let divisor = cell.beach_02_mediterranean_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "beach_02_pebbles_mask") {
    if (cell.beach_02_pebbles_mask) {
      let divisor = cell.beach_02_pebbles_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "coastline_cliff_brown_mask") {
    if (cell.coastline_cliff_brown_mask) {
      let divisor = cell.coastline_cliff_brown_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "coastline_cliff_desert_mask") {
    if (cell.coastline_cliff_desert_mask) {
      let divisor = cell.coastline_cliff_desert_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "coastline_cliff_grey_mask") {
    if (cell.coastline_cliff_grey_mask) {
      let divisor = cell.coastline_cliff_grey_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "desert_01_mask") {
    if (cell.desert_01_mask) {
      let divisor = cell.desert_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "desert_02_mask") {
    if (cell.desert_02_mask) {
      let divisor = cell.desert_02_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "desert_cracked_mask") {
    if (cell.desert_cracked_mask) {
      let divisor = cell.desert_cracked_maskk / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "desert_flat_01_mask") {
    if (cell.desert_flat_01_mask) {
      let divisor = cell.desert_flat_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "desert_rocky_mask") {
    if (cell.desert_rocky_mask) {
      let divisor = cell.desert_rocky_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "desert_wavy_01_larger_mask") {
    if (cell.desert_wavy_01_larger_mask) {
      let divisor = cell.desert_wavy_01_larger_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "desert_wavy_01_mask") {
    if (cell.desert_wavy_01_mask) {
      let divisor = cell.desert_wavy_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "drylands_01_cracked_mask") {
    if (cell.drylands_01_cracked_mask) {
      let divisor = cell.drylands_01_cracked_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "drylands_01_grassy_mask") {
    if (cell.drylands_01_grassy_mask) {
      let divisor = cell.drylands_01_grassy_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "drylands_01_mask") {
    if (cell.drylands_01_mask) {
      let divisor = cell.drylands_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "farmland_01_mask") {
    if (cell.farmland_01_mask) {
      let divisor = cell.farmland_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "floodplains_01_mask") {
    if (cell.floodplains_01_mask) {
      let divisor = cell.floodplains_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "forest_jungle_01_mask") {
    if (cell.forest_jungle_01_mask) {
      let divisor = cell.forest_jungle_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "forest_leaf_01_mask") {
    if (cell.forest_leaf_01_mask) {
      let divisor = cell.forest_leaf_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "forest_pine_01_mask") {
    if (cell.forest_pine_01_mask) {
      let divisor = cell.forest_pine_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "forestfloor_02_mask") {
    if (cell.forestfloor_02_mask) {
      let divisor = cell.forestfloor_02_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "forestfloor_mask") {
    if (cell.forestfloor_mask) {
      let divisor = cell.forestfloor_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "hills_01_mask") {
    if (cell.hills_01_mask) {
      let divisor = cell.hills_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "hills_01_rocks_mask") {
    if (cell.hills_01_rocks_mask) {
      let divisor = cell.hills_01_rocks_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "hills_01_rocks_medi_mask") {
    if (cell.hills_01_rocks_medi_mask) {
      let divisor = cell.hills_01_rocks_medi_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "hills_01_rocks_small_mask") {
    if (cell.hills_01_rocks_small_mask) {
      let divisor = cell.hills_01_rocks_small_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "india_farmlands_mask") {
    if (cell.india_farmlands_mask) {
      let divisor = cell.india_farmlands_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "medi_dry_mud_mask") {
    if (cell.medi_dry_mud_mask) {
      let divisor = cell.medi_dry_mud_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "medi_farmlands_mask") {
    if (cell.medi_farmlands_mask) {
      let divisor = cell.medi_farmlands_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "medi_grass_01_mask") {
    if (cell.medi_grass_01_mask) {
      let divisor = cell.medi_grass_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "medi_grass_02_mask") {
    if (cell.medi_grass_02_mask) {
      let divisor = cell.medi_grass_02_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "medi_hills_01_mask") {
    if (cell.medi_hills_01_mask) {
      let divisor = cell.medi_hills_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "medi_lumpy_grass_mask") {
    if (cell.medi_lumpy_grass_mask) {
      let divisor = cell.medi_lumpy_grass_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "medi_noisy_grass_mask") {
    if (cell.medi_noisy_grass_mask) {
      let divisor = cell.medi_noisy_grass_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_b_mask") {
    if (cell.mountain_02_b_mask) {
      let divisor = cell.mountain_02_b_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_c_mask") {
    if (cell.mountain_02_c_mask) {
      let divisor = cell.mountain_02_c_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_c_snow_mask") {
    if (cell.mountain_02_c_snow_mask) {
      let divisor = cell.mountain_02_c_snow_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_d_desert_mask") {
    if (cell.mountain_02_d_desert_mask) {
      let divisor = cell.mountain_02_d_desert_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_d_mask") {
    if (cell.mountain_02_d_mask) {
      let divisor = cell.mountain_02_d_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_d_snow_mask") {
    if (cell.mountain_02_d_snow_mask) {
      let divisor = cell.mountain_02_d_snow_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_d_valleys_mask") {
    if (cell.mountain_02_d_valleys_mask) {
      let divisor = cell.mountain_02_d_valleys_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_desert_c_mask") {
    if (cell.mountain_02_desert_c_mask) {
      let divisor = cell.mountain_02_desert_c_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_desert_mask") {
    if (cell.mountain_02_desert_mask) {
      let divisor = cell.mountain_02_desert_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_mask") {
    if (cell.mountain_02_mask) {
      let divisor = cell.mountain_02_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountain_02_snow_mask") {
    if (cell.mountain_02_snow_mask) {
      let divisor = cell.mountain_02_snow_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mud_wet_01_mask") {
    if (cell.mud_wet_01_mask) {
      let divisor = cell.mud_wet_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "northern_hills_01_mask") {
    if (cell.northern_hills_01_mask) {
      let divisor = cell.northern_hills_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "northern_plains_01_mask") {
    if (cell.northern_plains_01_mask) {
      let divisor = cell.northern_plains_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "oasis_mask") {
    if (cell.oasis_mask) {
      let divisor = cell.oasis_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "plains_01_desat_mask") {
    if (cell.plains_01_desat_mask) {
      let divisor = cell.plains_01_desat_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "plains_01_dry_mask") {
    if (cell.plains_01_dry_mask) {
      let divisor = cell.plains_01_dry_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "plains_01_dry_mud_mask") {
    if (cell.plains_01_dry_mud_mask) {
      let divisor = cell.plains_01_dry_mud_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "plains_01_mask") {
    if (cell.plains_01_mask) {
      let divisor = cell.plains_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "plains_01_noisy_mask") {
    if (cell.plains_01_noisy_mask) {
      let divisor = cell.plains_01_noisy_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "plains_01_rough_mask") {
    if (cell.plains_01_rough_mask) {
      let divisor = cell.plains_01_rough_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "snow_mask") {
    if (cell.snow_mask) {
      let divisor = cell.snow_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "steppe_01_mask") {
    if (cell.steppe_01_mask) {
      let divisor = cell.steppe_01_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "steppe_bushes_mask") {
    if (cell.steppe_bushes_mask) {
      let divisor = cell.steppe_bushes_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "steppe_rocks_mask") {
    if (cell.steppe_rocks_mask) {
      let divisor = cell.steppe_rocks_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "wetlands_02_mask") {
    if (cell.wetlands_02_mask) {
      let divisor = cell.wetlands_02_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "wetlands_02_mud_mask") {
    if (cell.wetlands_02_mud_mask) {
      let divisor = cell.wetlands_02_mud_mask / 100;
      let color = Math.floor(divisor * 255)
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "beachmask") {
    if (cell.beach) {
      let r = 100 + Math.floor((cell.elevation / 5));
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${r}, ${r}, ${r})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "mountainmask") {
    let b = biome(cell);
    if (b === "mountain") {
      let mountainColor = cell.elevation
      let mountainMod = mountainColor - limits.mountains.lower
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${mountainMod}, ${mountainMod}, ${mountainMod})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "plainsmask" ) {
    let b = biome(cell);
    if (b === "grass") {
      let color = cell.elevation;
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "snowmask") {
    let b = biome(cell);
    if (b === "arctic") {
      let color = cell.elevation;
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "treemask") {
    let b = cell.tree;
    if (b) {
      let color = cell.elevation;
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`)
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
    }
  }

  if (type === "provinceMap") {
    if (cell.province) {
      drawSmallPixel(ctx, cell.x, cell.y, cell.province.color)
    }
  }

}

function drawBeach(cell) {
  drawSmallPixel(ctx, cell.x, cell.y, `rgb(${194 - (cell.elevation * 3)}, ${178 - (cell.elevation * 3)}, ${128 - (cell.elevation * 3)})`)
}

function drawLake(cell) {
  drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, ${getRandomInt(150, 255)})`)
}

function drawTree(cell) {
  drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, ${getRandomInt(25, 75)}, 0)`)
}

function drawMountain(cell) {
  let mountainColor = cell.elevation
  let mountainMod = mountainColor - limits.mountains.lower
  let mountainR, mountainG, mountainB
  mountainR = mountainMod
  mountainG = mountainMod
  mountainB = mountainMod
  drawSmallPixel(ctx, cell.x, cell.y, `rgb(${mountainR}, ${mountainG}, ${mountainB})`)
}

function drawArctic(cell) {
  let el = cell.elevation
  drawSmallPixel(ctx, cell.x, cell.y, `rgb(${355 - el}, ${355 - el}, ${355 - el})`)
}

function drawDesert(cell) {
  let correctedColor = getCorrectedColor(cell)
  let el = cell.elevation
  let desertR = Math.floor(194 * (el / 255))
  let desertG = Math.floor(178 * (el / 255))
  let desertB = Math.floor(128 * (el / 255))
  drawSmallPixel(ctx, cell.x, cell.y, `rgb(${desertR}, ${desertG}, ${desertB})`)
}

function drawGrass(cell) {
  let correctedColor = getCorrectedColor(cell)
  let grassAccent = 0
  let grassAccent2 = 0
  let grass = correctedColor
  let grassAlpha
  if (grass > 100) {
    let diff = Math.floor(grass - 100)
    grassAccent = grass - 100
    grassAccent2 = Math.floor(grassAccent * 1.3)
    grass -= Math.floor(diff / 2.5)
    //grass -= Math.floor(diff / 3)
    let m = Math.floor(cell.elevation / 25);
    if (m < 1) { m = 1}
    grassAlpha = `0.${m}`
  }
  drawSmallPixel(ctx, cell.x, cell.y, `rgba(${grassAccent2}, ${grass}, ${grassAccent})`)
}

function drawOcean(cell) {
  let correctedColor = getCorrectedColor(cell)
  let waterMod = 255 - Math.floor(correctedColor * 0.6)
  drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, ${waterMod})`)
}

function getCorrectedColor(cell) {
  let correctedColor;
  let el = cell.elevation
  if (el >= limits.seaLevel.upper) {
    correctedColor = cell.elevation
  } else {
    correctedColor = cell.elevation * -1
  }
  if (correctedColor > 255) {
    correctedColor = 255;
  }
  if (correctedColor < -255) {
    correctedColor = -255
  }
  return correctedColor
}

function beachable(cell) {
  try {
    let neighbors = getNeighbors(cell.x, cell.y);
    for (let i = 0; i < neighbors.length; i++) {
      if (neighbors[i].lake) {
        return false;
      }
    }
    return true;
  } catch {
    return false
  }

}

function lowerSeaLevel() {
  limits.seaLevel.upper -= 1;
}

function raiseSeaLevel() {
  limits.seaLevel.upper += 1;
}

function drawHeightmapCell(x, y) {
  let cell = world.smallMap[y][x]
  let c;
  if (cell) {
    c = Math.floor((cell.elevation / 2))
    if (c > (limits.seaLevel.upper + 5)) {
      c += getRandomInt(-5, 5)
    }
  }
  if (c > 255) {
    c = 255
  }
  if (c < 0) {
    c = 0;
  }
  if (cell.bigCell && cell.bigCell.dropToWater && cell.bigCell.highPointRiver === false) {
    c = 0;
  }

  drawTinyPixel(ctx, x, y, `rgb(${c}, ${c}, ${c})`)
}

function drawHeightmapFromScratch() {
  if (world.smallMap) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, 8192, 4096);
    ctx.fillStyle = "rgb(75, 75, 75)"
    ctx.fill();
    for (let i = 0; i < 4096; i++) {
      for (let j = 0; j < 8192; j++) {
        drawHeightmapCell(j, i);
      }
    }
  } else {
    world.drawingType = "heightmap"
    drawWorld()
  }
  
}

function drawRiverMapFromScratch() {
  world.drawingType = "rivermap"
  drawWorld()
  /*
  if (world.smallMap) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, 8192, 4096);
    ctx.fillStyle = "#ff0080"
    ctx.fill();
    for (let i = 0; i < 4096; i++) {
      for (let j = 0; j < 8192; j++) {
        let cell = world.smallMap[i][j];
        if (cell.elevation >= limits.seaLevel.upper) {
          drawTinyPixel(ctx, j, i, "#ffffff");
        }
      }
    }
  } else {
    world.drawingType = "rivermap"
    drawWorld()
  }
  */
}

function drawWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let img = GID("parchmentbg")
  canvas.width = world.width * world.pixelSize
  canvas.height = world.height * world.pixelSize
  //ctx.drawImage(img, 0, 0, 3200, 3200)
  let t = ""
  for (let i = 0; i < world.height; i++) {
    let y = i;
    for (let j = 0; j < world.width; j++) {
      let x = j;
      drawCell(x, y)
    }
  }
  //redrawRivers()

  //function to draw name on map, not well developed
  /*for (let i = 0; i < world.mountains.length; i++) {
    if (world.mountains[i].cells.length > 15) {
      let arr = world.mountains[i].cells
      arr.sort((a, b) => (a.y < b.y) ? 1 : -1)
      let y = arr[0].y
      arr.sort((a, b) => (a.x < b.x) ? 1 : -1)
      let x = arr[0].x
      console.log(arr)
      drawName("Coliatha Mountain", (x * world.pixelSize) - 96, (y * world.pixelSize) + 96)
    }
  }
  */

  //clearRain()
}

function randomMove(thing) {
  let x = getRandomInt(-1, 1);
  let y = getRandomInt(-1, 1)
  if (x === 0 && y === 0) {
    while (x === 0 && y === 0) {
      x = getRandomInt(-1, 1);
      y = getRandomInt(-1, 1)
    }
  }
  thing.x = thing.x + x;
  thing.y = thing.y + y
}

function redrawRivers() {
  for (let i = 0; i < world.rivers.length; i++) {
    let currentRiver = world.rivers[i];
    for (let n = 0; n < currentRiver.cells.length; n++) {
      let cell = currentRiver.cells[n]
      let b, r, g;

      if (world.drawingType === "book") {
        cell.rgb = `rgb(0, 0, ${350 - cell.elevation})`
        if (cell.text) {
          ctx.fillStyle = cell.rgb
          ctx.font = "32px serif";
          ctx.fillText(cell.text, cell.x * world.pixelSize, cell.y * world.pixelSize)
        }
      }

      //nice blue version
      if (world.drawingType === "colorful" || world.drawingType === "papyrus") {
        b = 140 + Math.floor((cell.elevation / 5))
        g = 120 + Math.floor((cell.elevation / 5))
        r = 100 + Math.floor((cell.elevation / 5))
        cell.rgb = `rgb(${r}, ${g}, ${b})`
        drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      }


      /*
      r = 230 - Math.floor((cell.elevation / 5))
      g = 210 - Math.floor((cell.elevation / 5));
      b = 183 - Math.floor((cell.elevation / 5));
      */

      //PAPER VERSION
      if (world.drawingType === "paper") {
        let num = getRandomInt(200, 210)
        b = num
        g = num
        r = num
        cell.rgb = `rgb(${r}, ${g}, ${b})`
        drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
      }

      if (world.drawingType === "parchment") {
        cell.rgb = `rgb(${0}, ${0}, ${0})`
        mapOutline(ctx, cell.x * world.pixelSize, cell.y * world.pixelSize, cell.rgb, cell)
      }


    }
  }
}

function getDistance(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  var c = Math.sqrt( a*a + b*b );
  return Math.floor(c);
}

function asteroidStorm(num) {
  for (let i = 0; i < num; i++) {
    let rand = getRandomInt(1, 50);
    let randX = getRandomInt(0, world.width);
    let randY = getRandomInt(0, world.height);
    try {
      asteroid(rand, randX, randY)
    } catch {

    }
  }
}

function smoothCraterElevations() {
  for (let i = 0; i < world.asteroids.length; i++) {
    for (let j = 0; j < world.asteroids[i].cells.length; j++) {
      let cell = world.asteroids[i].cells[j]
      try {
        let neighbors = getNeighbors(asteroidCell.x, asteroidCell.y);
        if (neighbors) {
          let tooMuch = []
          for (let n = 0; n < neighbors.length; n++) {
            if (neighbors[n] && neighbors[n].elevation - cell.elevation > 20) {
              tooMuch.push(neighbors[n])
            }
          }
          for (let n = 0; n < tooMuch.length; n++) {
            let neighbor = tooMuch[n]
            let diff = Math.floor(neighbor.elevation - cell.elevation);
            diff = Math.floor(diff / 4);
            neighbor.elevation -= diff;
            cell.elevation += diff
          }
        }
      } catch {
        //do nothing
      }
    }
  }
}

function smoothElevations() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j ++) {
      let cell = xy(j, i);
      try {
        let neighbors = getNeighbors(j, i);
        if (neighbors) {
          let tooMuch = []
          for (let n = 0; n < neighbors.length; n++) {
            if (neighbors[n] && neighbors[n].elevation - cell.elevation > 20) {
              tooMuch.push(neighbors[n])
            }
          }
          for (let n = 0; n < tooMuch.length; n++) {
            let neighbor = tooMuch[n]
            let diff = Math.floor(neighbor.elevation - cell.elevation);
            diff = Math.floor(diff / 4);
            neighbor.elevation -= diff;
            cell.elevation += diff
          }
        }
      } catch {
        //do nothing
      }
    }
  }
}

function asteroid(size, x, y) {
  let impactPoint = xy(x, y)
  let diameter = size;
  let depth = (Math.floor(1.5 * diameter))
  let backMod = Math.floor((diameter / 2) * -1);
  let forwardMod = diameter / 2
  let asteroidName = "Placeholder"
  let asteroid = {}
  asteroid.impactPoint = impactPoint;
  asteroid.name = asteroidName
  asteroid.cells = [];
  asteroid.cells.push(impactPoint)
  asteroid.size = size
  impactPoint.impactPoint = true;
  impactPoint.asteroidCrater = true;
  impactPoint.asteroidNames.push(asteroidName)
  console.log(backMod);
  console.log(forwardMod)
  for (let n = backMod ; n < forwardMod; n++) {
    for (let j = backMod; j < forwardMod; j++) {
      let newX = impactPoint.x + j;
      let newY = impactPoint.y + n;
      try {
        let nextCell = xy(newX, newY);
        console.log(nextCell)
        let dist = Math.floor(getDistance(nextCell.x, nextCell.y, impactPoint.x, impactPoint.y));
        console.log(dist)
        if (dist < forwardMod) {
          let sub = depth - dist;
          if (sub < 1) {
            sub = 1
          }
          let oldEl = nextCell.elevation
          nextCell.elevation -= sub
          nextCell.asteroidCrater = true
          nextCell.asteroidNames.push(asteroidName)
          asteroid.cells.push(nextCell)
        }
      } catch {

      }

    }
  }
  world.asteroids.push(asteroid)
}

function getLongNeighbors(x, y, num) {
  let neighbors = [];
  let div = Math.floor(num / 2);
  let negDiv = div * -1;
  for (let i = negDiv; i < div; i++) {
    for (let j = negDiv; j < div; j++) {
      let n = xy(x + j, y + i);
      neighbors.push(n);
    }
  }
  return neighbors;
}

function getNeighbors(x, y) {
  let neighbors = [];
  try {
    neighbors.push(xy(x - 1, y));
  } catch {

  }
  try {
    neighbors.push(xy(x + 1, y));
  } catch {

  }
  try {
    neighbors.push(xy(x + 1, y + 1));
  } catch {

  }
  try {
    neighbors.push(xy(x - 1, y - 1));
  } catch {

  }
  try {
    neighbors.push(xy(x, y + 1));
  } catch {

  }
  try {
    neighbors.push(xy(x, y - 1));
  } catch {

  }
  try {
    neighbors.push(xy(x - 1, y + 1));
  } catch {

  }
  try {
    neighbors.push(xy(x + 1, y - 1))
  } catch {

  }
  return neighbors;
}

function erodeRivers() {
  for (let i = 0; i < world.rivers.length; i++) {
    let currentRiver = world.rivers[i];
    for (let n = 0; n < currentRiver.cells.length; n++) {
      //15 is an arbitrary number to ensure erosion doesn't scour mountain tops
      let currentCell = currentRiver.cells[n]
      let erosionRate = Math.floor(n / 30)
      try {
        let neighbors = getNeighbors(currentCell.x, currentCell.y)
        if (currentCell.elevation > erosionRate) {
          currentCell.elevation -= erosionRate
        }
        for (let j = 0; j < neighbors.length; j++) {
          if (neighbors[j].elevation > erosionRate) {
            neighbors[j].elevation -= erosionRate
          }
        }
      } catch {

      }
    }
  }
  drawWorld()
  //redrawRivers()
}

GID("erode").onclick = function() {
  erodeRivers()
}

function getDirection(cell1, cell2) {
  let ew = ""
  let ns = ""
  if (cell1.x < cell2.x) {
    ew = "E"
  } else if (cell1.x > cell2.x) {
    ew = "W"
  } else {
    ew = ""
  }
  if (cell1.y < cell2.y) {
    ns = "N"
  } else if (cell1.y > cell2.y) {
    ns = "S"
  } else {
    ns = ""
  }
  return `${ns}${ew}`
}

function getRealDirection(cell1, cell2) {
  let ew = ""
  let ns = ""
  if (cell1.x < cell2.x) {
    ew = "E"
  } else if (cell1.x > cell2.x) {
    ew = "W"
  } else {
    ew = ""
  }
  if (cell1.y < cell2.y) {
    ns = "S"
  } else if (cell1.y > cell2.y) {
    ns = "N"
  } else {
    ns = ""
  }
  return `${ns}${ew}`
}

function riverPixel(x, y) {
  drawSmallPixel(ctx, x, y, `rgb(0, 0, 255)`)
}

function drawRiverCell(cell, width, direction) {
  //draw a river on cell and the width in direction - so north direction would be the cell and the left and right cell
  /*if (width > 1 && direction.length > 0) {
    console.log(direction);
    console.log(width)
    let correctedWidth = width - 1
    if (direction === "N" || direction === "S") {
      riverPixel(cell.x, cell.y)
      for (let n = 0; n < correctedWidth; n++) {
        console.log("Drawing Big River")
        riverPixel(cell.x + n, cell.y);
        riverPixel(cell.x - n, cell.y)
      }
    }
    if (direction === "W" || direction === "E") {
      riverPixel(cell.x, cell.y)
      for (let n = 0; n < correctedWidth; n++) {
        console.log("Drawing Big River")
        riverPixel(cell.x, cell.y + n);
        riverPixel(cell.x, cell.y - n)
      }
    }
    if (direction === "NW" || direction === "SE") {
      riverPixel(cell.x, cell.y)
      for (let n = 0; n < correctedWidth; n++) {
        console.log("Drawing Big River")
        riverPixel(cell.x - n, cell.y - n); //grow to southwest
        riverPixel(cell.x + n, cell.y + n) //grow to northeast
      }
    }
    if (direction === "SW" || direction === "NE") {
      riverPixel(cell.x, cell.y)
      for (let n = 0; n < correctedWidth; n++) {
        console.log("Drawing Big River")
        riverPixel(cell.x - n, cell.y + n); //grow to northwest
        riverPixel(cell.x + n, cell.y - n) //grow to southeast
      }
    }
  } else {
    drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 255)`)
  }*/
  riverPixel(cell.x, cell.y)
}

function shareRain(cell, neighbor) {
  let cellCombined = cell.raindrops + cell.elevation;
  let neighborCombined = neighbor.raindrops + neighbor.elevation;
  if (cellCombined > neighborCombined && cell.raindrops > 0) {
    neighbor.raindrops += 1;
  }
}

function trackRain(x, y) {
  let running = true
  let next = xy(x, y)
  let arr = [];
  let used = []
  let count = 0;
  while (running === true) {
    try {
      arr = [];
      let w = xy(next.x - 1, next.y);
      let e = xy(next.x + 1, next.y);
      let ne = xy(next.x + 1, next.y + 1);
      let sw = xy(next.x - 1, next.y - 1);
      let n = xy(next.x, next.y + 1);
      let s = xy(next.x, next.y - 1);
      let nw = xy(next.x - 1, next.y + 1);
      let se = xy(next.x + 1, next.y - 1)
      pushIfNotUsed(w, used, arr)
      pushIfNotUsed(e, used, arr);
      //pushIfNotUsed(ne, used, arr);
      //pushIfNotUsed(sw, used, arr);
      pushIfNotUsed(n, used, arr);
      pushIfNotUsed(s, used, arr);
      //pushIfNotUsed(nw, used, arr);
      //pushIfNotUsed(se, used, arr);
      arr.sort((a, b) => (a.elevation > b.elevation) ? 1 : -1)
      used.push(next)
      count += 1
      next.raindrops += count
      for (let n = 0; n < arr.length; n++) {
        shareRain(next, arr[n])
      }
      next = arr[0];
      if (next == undefined || next.elevation < limits.seaLevel.upper || count > 100000) {
        running = false
      } else {
        next.drawableRiver = true
      }
    } catch {
      running = false
    }
  }
}

function deposition(cell, next) {

}

function worldRain() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      if (cell.elevation > limits.seaLevel.upper) {
        cell.raindrops += cell.elevation
        trackRain(cell.x, cell.y)
      }
    }
  }
}

function clearRain() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      xy(j, i).raindrops = 0
    }
  }
}

function erodeFromRaindrops() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i)
      if (cell.elevation < limits.seaLevel.upper) {
        //do nothing
      } else {
        let drops = cell.raindrops
        let erosion = Math.floor(drops / 100) * (Math.floor(cell.elevation / 50))
        //let erosion = Math.floor(drops / 100)
        cell.elevation -= erosion
        if (cell.elevation < limits.seaLevel.upper) {
          cell.elevation = limits.seaLevel.upper
        }
        let comp = 1400 - cell.elevation
        if (cell.raindrops > comp && cell.elevation >= limits.seaLevel.upper) {
          cell.lake = true
        } else {
          cell.lake = false
        }
        cell.raindrops = 0;
      }
    }
    //lakesBreathe()
  }
}

function getLakes() {
  let arr = [];
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      if (cell.lake) {
        arr.push(cell)
      }
    }
  }
  return arr
}

function lakesBreathe() {
  let lakes = getLakes();
  for (let i = 0; i < lakes.length; i++) {
    let cell = lakes[i]
    try {
      let neighbors = getLongNeighbors(cell.x, cell.y, 5)
      for (let n = 0; n < neighbors.length; n++) {
        let neighbor = neighbors[n]
        if (neighbor && neighbor.elevation >= 150) {
          cell.lake = false;
        }
      }
    }
    catch {

    }
  }
}

GID("rainErosion").onclick = function() {
  rainErosion()
  drawWorld()
}

function rainErosion() {
  worldRain();
  erodeFromRaindrops();
  //clearRain()
}

function getRivers() {
  let arr = []
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      if (cell.river) {
        arr.push(cell)
      }
    }
  }
  return arr;
}

function riverErosion() {
  //Doesn't work great
  let used = [];
  let rivers = getRivers();
  for (let i = 0; i < rivers.length; i++) {
    let cell = rivers[i];
    let neighbors = getNeighbors(cell.x, cell.y);
    for (let n = 0; n < neighbors.length; n++) {
      if (neighbors[n].river === false) {
        neighbors[n].elevation -= 1;
        if (neighbors[n].elevation === cell.elevation) {
          neighbors[n].river = true
        }
      }
    }
  }
  drawWorld()
}

function erodeFrom(x, y) {
  let running = true
  let next = xy(x, y)
  let arr = [];
  let used = []
  let count = 0;
  let mountainRunoff = false;
  let untilRunoff = 0;
  while (running === true) {
    try {
      arr = [];
      let w = xy(next.x - 1, next.y);
      let e = xy(next.x + 1, next.y);
      let ne = xy(next.x + 1, next.y + 1);
      let sw = xy(next.x - 1, next.y - 1);
      let n = xy(next.x, next.y + 1);
      let s = xy(next.x, next.y - 1);
      let nw = xy(next.x - 1, next.y + 1);
      let se = xy(next.x + 1, next.y - 1)
      pushIfNotUsed(w, used, arr)
      pushIfNotUsed(e, used, arr);
      pushIfNotUsed(ne, used, arr);
      pushIfNotUsed(sw, used, arr);
      pushIfNotUsed(n, used, arr);
      pushIfNotUsed(s, used, arr);
      pushIfNotUsed(nw, used, arr);
      pushIfNotUsed(se, used, arr);
      arr.sort((a, b) => (a.elevation > b.elevation) ? 1 : -1)

      used.push(next)
      count += 1;
      if (next.elevation > 150) {
        mountainRunoff = true;
      }
      if (next.elevation > limits.seaLevel.upper && next.elevation > 50) {
        next.elevation -= 1
      } else {
        if (untilRunoff === 0) {
          untilRunoff = count
        }
        if (mountainRunoff === true && untilRunoff > 30) {
          next.river = true
        }
      }
      next = arr[0];
      if (next == undefined || next.elevation < 1 || count > 100000) {
        console.log(count)
        running = false
      }
    } catch {
      running = false
    }
  }
}

GID("randomerode").onclick = function() {
  randomErosion(1);
  drawWorld()
}

function sharpenMountains() {
  let mountains = getMountains()
  for (let i = 0; i < mountains.length; i++) {
    mountains[i].elevation += getRandomInt(1, 5)
  }
}

GID("softenMountains").onclick = function() {
  softenMountains()
  spreadingCenterEmitsSmall()
  spread()
  drawWorld()
}

function softenMountains() {
  for (let n = 0; n < world.height; n++) {
    for (let m = 0; m < world.width; m++) {
      let x = getRandomInt(0, world.width);
      let y = getRandomInt(0, world.height)
      try {
        let cell = xy(m, n);
        let sorter
        if (cell.elevation > 230) {
          sorter = 5
        } else if (cell.elevation > 210){
          sorter = 10
        } else if (cell.elevation > 180) {
          sorter = 15
        } else {
          sorter = 20
        }
        let neighbors = getNeighbors(cell.x, cell.y)
        neighbors.sort((a, b) => (a.elevation > b.elevation) ? 1 : -1)
        for (let l = 0; l < neighbors.length; l++) {
          let diff = cell.elevation - neighbors[l].elevation;
          if (diff > sorter) {
            let d = Math.floor(diff / 2)
            let num = getRandomInt(1, d)
            cell.elevation -= num + sorter
            neighbors[l].elevation += num + sorter
          }
          if (neighbors[l].elevation > limits.mountains.lower) {

          }
        }
      } catch {

      }
    }
  }
}

function randomErosion(num) {
  for (let i = 0; i < num; i++) {
    let randX = getRandomInt(1, world.width - 1);
    let randY = getRandomInt(1, world.height - 1);
    erodeFrom(randX, randY)
  }
}

function reverseDirection(d) {
  if (d === "N") {
    return "S"
  } else if (d === "S") {
    return "N"
  } else if (d === "E") {
    return "W"
  } else if (d === "W") {
    return "E"
  }
}

function drawRiver(x, y) {
  let running = true;
  let startingX = x;
  let startingY = y;
  let endingX;
  let endingY
  let next = xy(x, y)
  if (next.riverRun) {

  } else {
    next.riverRun = 0;
  }
  let arr = []
  let count = 0
  let used = [];
  let riverWidth = 1;
  let courseDirection
  let reachedOcean = false;
  let oceanCounter = 0;
  let last;
  let lastX;
  let lastY;
  let tm;
  if (next.highPointRiver) {

  } else {
    while (running === true) {
      count += 1;
      next.dropToWater = true;
      next.drawableRiver = true;
      next.highPointRiver = true;
      next.oldElevation = next.elevation;
      used.push(next)
      //drawRiverCell(next, riverWidth, courseDirection);
      arr = [];
      try {
        let w = xy(next.x - 1, next.y);
        let e = xy(next.x + 1, next.y);
        //let ne = xy(next.x + 1, next.y + 1);
        //let sw = xy(next.x - 1, next.y - 1);
        let n = xy(next.x, next.y + 1);
        let s = xy(next.x, next.y - 1);
        //let nw = xy(next.x - 1, next.y + 1);
        //let se = xy(next.x + 1, next.y - 1)
        pushIfNotUsed(w, used, arr)
        pushIfNotUsed(e, used, arr);
        pushIfNotUsed(n, used, arr);
        pushIfNotUsed(s, used, arr);
        
  
        //pushIfNotUsed(ne, used, arr);
        //pushIfNotUsed(sw, used, arr);
  
  
        //pushIfNotUsed(nw, used, arr);
        //pushIfNotUsed(se, used, arr);
        if (arr.length === 0) {
          running = false;
        }
        arr.sort((a, b) => (a.elevation > b.elevation) ? 1 : -1)
        if (arr[0].highPointRiver) {
          last = xy(lastX, lastY)
          next.comingFrom = getRealDirection(next, last);
          next.headingTo = getRealDirection(next, arr[0]);
          next.riverRun = last.riverRun;
          next.riverRun += 1;
          if (arr[0].riverStartGreen) {
            arr[0].comingFrom = reverseDirection(next.headingTo)
            arr[0].riverStartGreen = false;
            
          } else {
            tributaryMerge(next, arr[0])
            console.log(arr[0].riverRun)
          }
          if (arr[0].riverRun) {
            arr[0].riverRun += next.riverRun
          } else {
            arr[0].riverRun = next.riverRun;
          }

          
          running = false;
          tm = true;
        } else if (used.length === 1) {
          next.headingTo = getRealDirection(next, arr[0]);
          next.riverRun += 1;
        } else {
          last = xy(lastX, lastY)
          next.riverRun = last.riverRun;
          next.riverRun += 1;
          next.comingFrom = getRealDirection(next, last);
          next.headingTo = getRealDirection(next, arr[0]);
          if (next.elevation > last.elevation) {
            next.elevation = last.elevation - 1;
            if (next.elevation < limits.seaLevel.upper) {
              next.elevation = limits.seaLevel.upper + 1;
            }
          }
        }
  
        next.river = true
        lastX = next.x;
        lastY = next.y;
        next = arr[0];
  
  
        next.riverWidth = riverWidth
        endingX = next.x;
        endingY = next.y
        if (next.elevation < limits.seaLevel.upper) {
          reachedOcean = true;
          oceanCounter += 1;
        } else {
          if (oceanCounter) {
            running = false;
          }
        }
        if ((reachedOcean && oceanCounter > 5) || count > 10000) {
          running = false
        }
      } catch {
        running = false
      }
    }
    if (reachedOcean || (tm)) {
      if (tm) {

      } else {
        used[0].riverStartGreen = true;
      }
      
      used[used.length - 1].riverEndRed = true;
      let river = {};
      river.cells = used
      for (let z = 0; z < river.cells.length; z++) {
        let c = river.cells[z]
        c.riverObject = river;
      }
      river.id = "Placeholder"
      river.startingX = used[0].x;
      river.startingY = used[0].y;
      river.endingX = endingX
      river.endingY = endingY
      world.rivers.push(river)
    } else {
      for (let i = 0; i < used.length; i++) {
        used[i].river = false;
        used[i].dropToWater = false;
        used[i].drawableRiver = false;
        used[i].highPointRiver = false;
        used[i].elevation = used[i].oldElevation
        used[i].riverStartGreen = false;
        used[i].riverEndRed = false;
        used[i].tributaryMerge = undefined
        used[i].riverRun -= 1;
      }
    }
  }
  
  
}

function pushIfNotUsed(cell, usedArr, pushArr) {
  if (usedArr.indexOf(cell) === -1) {
    pushArr.push(cell)
  } else {
    return false
  }
}

function riversFromHighPoints() {
  let arr = world.tectonics.spreadingLine;
  arr.sort((a, b) => (a.elevation < b.elevation) ? 1 : -1)
  for (let i = 0; i < 2000; i++) {
    let tooClose = false
    for (let n = 0; n < world.rivers.length; n++) {
      let dist = getDistance(arr[i].x, arr[i].y, world.rivers[n].startingX, world.rivers[n].startingY);
      if (dist < 2) {
        tooClose = true
      }
    }
    if (tooClose === false) {
      let cell = xy(arr[i].x, arr[i].y)
      if (cell.elevation < limits.seaLevel.upper) {

      } else {
        drawRiver(arr[i].x, arr[i].y)
      }
    }
  }
}

function drawHPRivers() {
  for (let i = 0; i < world.rivers.length; i++) {
    let river = world.rivers[i]
    for (let j = 0; j < river.cells.length; j++) {
      let cell = river.cells[j]
      if (cell.riverStartGreen) {
        drawRiverTemplate(cell)
      } else if (cell.riverEndRed) {
        drawRiverTemplate(cell)
      } else if (cell.highPointRiver) {
        drawRiverTemplate(cell, j)
      } else {
        let c = Math.floor((cell.elevation / 2))
        if (cell.riverDrawn) {
  
        } else {
          if (c > limits.seaLevel.upper) {
            c = "#ffffff"
          }
          if (c <= limits.seaLevel.upper || cell.river || cell.lake) {
            c = "#ff0080";
          }
          cell.rgb = `${c}`
          drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
        }
      }
    }
  }
}

function drawRiversTransparent() {
  for (let i = 0; i < world.rivers.length; i++) {
    let river = world.rivers[i]
    for (let j = 0; j < river.cells.length; j++) {
      let cell = river.cells[j]
      if (cell.riverStartGreen) {
        drawRiverTemplateTransparent(cell)
      } else if (cell.riverEndRed) {
        drawRiverTemplateTransparent(cell)
      } else if (cell.highPointRiver) {
        drawRiverTemplateTransparent(cell, j)
      }
    }
  }
}

function hpRivers() {
  riversFromHighPoints()
  drawHPRivers();
  /*
  for (let i = 0; i < world.map.length; i++) {
    for (let j = 0; j < world.map[i].length; j++) {
      let cell = xy(j, i);
      if (cell.dropToWater) {
        drawRiverTemplate(cell)
      } else {
        let c = Math.floor((cell.elevation / 2))
        if (cell.riverDrawn) {
  
        } else {
          if (c > limits.seaLevel.upper) {
            c = "#ffffff"
          }
          if (c <= limits.seaLevel.upper || cell.river || cell.lake) {
            c = "#ff0080";
          }
          cell.rgb = `${c}`
          drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
        }
      }
    }
  }
  */
}

function erodeFromHighPoints() {
  let arr = world.tectonics.spreadingLine;
  for (let i = 0; i < world.tectonics.spreadingLine.length; i++) {
    erodeFrom(arr[i].x, arr[i].y)
  }
}

function spreadProcess(num) {
  clearRain()
  for (let i = 0; i < num; i++) {
    spreadingCenterEmits();
    spread()
    setMoisture()
    //rainErosion()
    //rainErosion()
  }
}

let spreadNum = 0;

GID("spread").onclick = function() {
  clearRain()
  for (let i = 0; i < 3; i++) {
    spreadingCenterEmits();
    spread()
    setMoisture()
    //rainErosion()
    //rainErosion()
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  floodFillRivers()
  cleanupAll()
  drawWorld()
  clearRain()
}

function spreadingCenterEmits() {
  for (let i = 0; i < world.tectonics.spreadingLine.length; i++) {
    let add = getRandomInt(0, 255)
    world.tectonics.spreadingLine[i].magma += add
    world.tectonics.spreadingLine[i].elevation += add
    world.tectonics.spreadingLine[i].id = i
  }
}

function spreadingCenterEmitsSmall() {
  for (let i = 0; i < world.tectonics.spreadingLine.length; i++) {
    let add = getRandomInt(1, 5)
    world.tectonics.spreadingLine[i].magma += add
    world.tectonics.spreadingLine[i].elevation += add
  }
}

//Add a small emit function

function spread() {
  for (let i = 0; i < world.height; i++) {
    let y = i;
    for (let j = 0; j < world.width; j++) {
      let x = j;
      let cell = xy(x, y);
      if (cell.magma > 0) {
        try {
          let w = xy(x - 1, y);
          let e = xy(x + 1, y);
          let ne = xy(x + 1, y + 1);
          let sw = xy(x - 1, y - 1);
          let n = xy(x, y + 1);
          let s = xy(x, y - 1);
          let nw = xy(x - 1, y + 1);
          let se = xy(x + 1, y - 1)
          let rand = getRandomInt(0, 7);
          if (rand === 0) {
            rollMagma(w, cell);
          } else if (rand === 1) {
            rollMagma(e, cell);
          } else if (rand === 2) {
            rollMagma(ne, cell);
          } else if (rand === 3) {
            rollMagma(sw, cell);
          } else if (rand === 4) {
            rollMagma(n, cell);
          } else if (rand === 5) {
            rollMagma(se, cell);
          } else if (rand === 6) {
            rollMagma(nw, cell)
          } else if (rand === 7) {
            rollMagma(s, cell)
          }
          rollMagma(w, cell);
          rollMagma(e, cell);
          rollMagma(ne, cell);
          rollMagma(sw, cell);
          rollMagma(n, cell);
          rollMagma(se, cell);
          rollMagma(nw, cell)
          rollMagma(w, cell);
          rollMagma(e, cell);
          rollMagma(ne, cell);
          rollMagma(sw, cell);
          rollMagma(n, cell);
          rollMagma(se, cell);
          rollMagma(nw, cell)
        } catch {
        }
      }
    }
  }
}


function rollMagma(newCell, oldCell) {
  //let mult = getRandomInt(1, 50)
  let mult = getRandomInt(1, 15)
  if (newCell === "edge" || oldCell === "edge") {

  } else {
    if (newCell.magma < oldCell.magma) {
      let diff = oldCell.magma - newCell.magma
      let div = Math.floor(diff / mult)
      //let div = Math.floor(diff / 2)
      newCell.magma += div;
      newCell.elevation += div;
      oldCell.magma -= div
      oldCell.elevation -= div;
      if (newCell.text) {

      } else {
        newCell.text = bookText[currentBookPosition]
        newCell.desiredX = Math.floor(currentBookPosition / world.width) + Math.floor(currentBookPosition % world.width);
        newCell.desiredY = Math.floor(currentBookPosition / world.width)
        currentBookPosition += 1
      }
    }
  }
}



function jumpElevation() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      cell.elevation += (world.width / 5)
    }
  }
}

function randomizeElevation() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i)
      cell.elevation += getRandomInt(-20, 20)
    }
  }
}

function startup() {
  GID("loading-screen").style.display = "block"

  setTimeout(function() {
    createWorld();
    for (let i = 0; i < 10; i++) {
      console.log(i);
      spreadingCenterEmits();
      spread();
    }
    spreadProcess(20);
    totalCleanup()
    /*cleanupCoasts();
    cleanupWater();
    cleanupMountains();
    */
    getBeaches();
    setMoisture();
    //floodFillRivers();
    hpRivers();
    floodFillMountains();
    drawWorld();

    // Hide the loading screen after the processing is done
    GID("loading-screen").style.display = "none";
  }, 0); // setTimeout with 0 delay
}

function growForests() {
  seedForests()
  forestTick()
}

let paintbrush = "raiseland"
let paintbrushSize = 30;
let paintbrushHardness = 50;

GID("canvas").onclick = function(e) {
  showInfo(e)
  applyBrush(e, paintbrushSize, paintbrush, paintbrushHardness)
}

GID("raisebrush").onclick = function() {
  paintbrush = "raiseLand"
}

GID("lowerbrush").onclick = function() {
  paintbrush = "dropLand"
}

GID("increasebrushsize").onclick = function() {
  paintbrushSize += 1
  GID("increasebrushsize").innerHTML = `Increase Brush (${paintbrushSize})`
  GID("decreasebrushsize").innerHTML = `Decrease Brush (${paintbrushSize})`
}

GID("decreasebrushsize").onclick = function() {
  paintbrushSize -= 1;
  GID("increasebrushsize").innerHTML = `Increase Brush (${paintbrushSize})`
  GID("decreasebrushsize").innerHTML = `Decrease Brush (${paintbrushSize})`
}

GID("increasebrushhardness").onclick = function() {
  paintbrushHardness += 1
  GID("increasebrushhardness").innerHTML = `Increase Brush Hardness (${paintbrushHardness})`
  GID("decreasebrushhardness").innerHTML = `Decrease Brush Hardness (${paintbrushHardness})`
}

GID("decreasebrushhardness").onclick = function() {
  paintbrushHardness -= 1;
  GID("increasebrushhardness").innerHTML = `Increase Brush Hardness (${paintbrushHardness})`
  GID("decreasebrushhardness").innerHTML = `Decrease Brush Hardness (${paintbrushHardness})`
}

function applyBrush(e, brushSize, brushType, brushHardness) {
  let pos = getMousePos(canvas, e);
  let cell = xy(pos.x, pos.y)
  // Calculate start and end points based on brush size
  const halfBrush = Math.floor(brushSize / 2);
  for (let i = cell.y - halfBrush; i < cell.y + halfBrush; i++) {
    for (let j = cell.x - halfBrush; j < cell.x + halfBrush; j++) {
      if (brushType === "dropLand") {
        let nextCell = xy(j, i)
        if (nextCell && nextCell.elevation > limits.seaLevel.upper) {
          nextCell.elevation -= brushHardness;
          if (nextCell.elevation < limits.seaLevel.upper) {
            nextCell.elevation = limits.seaLevel.upper + 1
          }
        }
      }
      if (brushType === "raiseLand") {
        let nextCell = xy(j, i)
        if (nextCell) {
          if (nextCell.elevation > limits.seaLevel.upper) {
            nextCell.elevation += brushHardness;
          }
        }
      }
    }
  }
  cleanupAll()
  drawWorld()
}

function showInfo(e) {
  let pos = getMousePos(canvas, e);
  world.selectedCell = xy(pos.x, pos.y)
  console.log(world.selectedCell)
}

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor(((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width) / world.pixelSize),
        y: Math.floor(((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height) / world.pixelSize),
    };
}

GID("previewmap").onclick = function() {
  world.drawingType = "colorful";
  drawWorld()
}

GID("paper-map").onclick = function() {
  world.drawingType = "paper";
  drawWorld();
}

GID("papyrus-map").onclick = function() {
  world.drawingType = "papyrus";
  drawWorld()
}

GID("heightmap").onclick = function() {
  drawHeightmapFromScratch()
  //world.drawingType = "heightmap"
  //drawWorld();
}

GID("rivermap").onclick = function() {
  world.drawingType = "rivermap"
  drawWorld();
  drawHPRivers();
}

GID("desertmask").onclick = function() {
  world.drawingType = "desertmask"
  drawWorld()
}

GID("beachmask").onclick = function() {
  world.drawingType = "beachmask"
  drawWorld()
}

GID("mountainmask").onclick = function() {
  world.drawingType = "mountainmask";
  drawWorld();
}

GID("plainsmask").onclick = function() {
  world.drawingType = "plainsmask"
  drawWorld()
}

GID("snowmask").onclick = function() {
  world.drawingType = "snowmask";
  drawWorld()
}

GID("treemask").onclick = function() {
  world.drawingType = "treemask"
  drawWorld()
}

GID("downloadallbtn").onclick = function() {
  setMasks();
  downloadAllImages();
}

function downloadWithDelay(index, functions, delay) {
  if (index < functions.length) {
    functions[index]();
    setTimeout(function() {
      downloadWithDelay(index + 1, functions, delay);
    }, delay);
  }
}

GID("add-downloads").onclick = function() {
  const functionsToExecute = [
    () => createProvinceDefinitions(),
    () => createProvinceTerrain(),
    () => createLandedTitles(),
    () => createLocators("buildings"),
    () => createLocators("special_building"),
    () => createLocators("combat"),
    () => createLocators("siege"),
    () => createLocators("unit_stack"),
    () => createLocators("unit_stack_player_owned"),
    () => createLocators("unit_stack_other_owner"),
    () => createDefaultMap(),
    () => outputCultures(),
    () => makeSimpleHistory(),
    () => outputCharacters(),
    () => outputHistory(),
    () => createTitleLocalization(),
    () => createCultureLocalization(),
    () => outputNameLists(),
    () => outputEthnicities(),
    () => outputLanguages(),
    () => outputHeritages(),
    //() => outputNameListLoc(),
    () => outputHeritageLocalization(),
    () => outputLanguagesLocalization(),
    () => createDynastyLocalization(),
    () => createBookmark(),
    () => createBookmarkGroup(),
    () => religionOutputter(),
    () => createWinterSeverity(),
    // Add more functions with their parameters as needed
  ];
  const delayBetweenDownloads = 200;
  downloadWithDelay(0, functionsToExecute, delayBetweenDownloads);
  /*
  createProvinceDefinitions();
  createProvinceTerrain();
  createLandedTitles()
  //createHistory(); old simple version
  createLocators("buildings");
  createLocators("special_building")
  createLocators("combat")
  createLocators("siege")
  createLocators("unit_stack");
  createLocators("unit_stack_player_owned");
  createLocators("unit_stack_other_owner")
  createDefaultMap();
  outputCultures()
  makeSimpleHistory()
  outputCharacters()
  outputHistory()
  createTitleLocalization()
  createCultureLocalization()
  outputNameLists()
  outputEthnicities()
  outputLanguages()
  outputNameListLoc()
  createBookmark();
  createBookmarkGroup()
  */
}

GID("open-editor-menu").onclick = function() {
  GID("main-sidebar").style.display = "none"
  GID("sidebar").style.display = "block"
}

GID("open-download-menu").onclick = function() {
  GID("main-sidebar").style.display = "none"
  GID("downloads-sidebar").style.display = "block"
}

GID("back-to-main-menu-editor").onclick = function() {
  GID("sidebar").style.display = "none"
  GID("main-sidebar").style.display = "block"
}

GID("back-to-main-menu-downloads").onclick = function() {
  GID("downloads-sidebar").style.display = "none"
  GID("main-sidebar").style.display = "block"
}



function drawAndDownload(type, filename, callback) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  world.drawingType = type;
  if (type === "book") {
    redoLetterMap()
  }
  drawWorld();

  requestAnimationFrame(function() {
    if (!canvas.toDataURL) {
      console.error('Canvas is tainted and cannot be converted to data URL.');
      return;
    }
    downloadImage(canvas, filename);
    if (callback) callback(); // Proceed to next step only after download
  });
}

function downloadImage(canvas, filename) {
  let link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  link.href = undefined
}

function downloadAllImages() {
  drawAndDownload("colorful", "colorful.png", function() {
    drawAndDownload("paper", "paper.png", function() {
      drawAndDownload("papyrus", "papyrus.png", function() {
        drawAndDownload("beach_02_mask", "beach_02_mask.png", function() {
          drawAndDownload("beach_02_mediterranean_mask", "beach_02_mediterranean_mask.png", function() {
            drawAndDownload("beach_02_pebbles_mask", "beach_02_pebbles_mask.png", function() {
              drawAndDownload("coastline_cliff_brown_mask", "coastline_cliff_brown_mask.png", function() {
                drawAndDownload("coastline_cliff_desert_mask", "coastline_cliff_desert_mask.png", function() {
                  drawAndDownload("coastline_cliff_grey_mask", "coastline_cliff_grey_mask.png", function() {
                    drawAndDownload("desert_01_mask", "desert_01_mask.png", function() {
                      drawAndDownload("desert_02_mask", "desert_02_mask.png", function() {
                        drawAndDownload("desert_cracked_mask", "desert_cracked_mask.png", function() {
                          drawAndDownload("desert_flat_01_mask", "desert_flat_01_mask.png", function() {
                            drawAndDownload("desert_rocky_mask", "desert_rocky_mask.png", function() {
                              drawAndDownload("desert_wavy_01_larger_mask", "desert_wavy_01_larger_mask.png", function() {
                                drawAndDownload("desert_wavy_01_mask", "desert_wavy_01_mask.png", function() {
                                  drawAndDownload("drylands_01_cracked_mask", "drylands_01_cracked_mask.png", function() {
                                    drawAndDownload("drylands_01_grassy_mask", "drylands_01_grassy_mask.png", function() {
                                      drawAndDownload("drylands_01_mask", "drylands_01_mask.png", function() {
                                        drawAndDownload("farmland_01_mask", "farmland_01_mask.png", function() {
                                          drawAndDownload("floodplains_01_mask", "floodplains_01_mask.png", function() {
                                            drawAndDownload("forest_jungle_01_mask", "forest_jungle_01_mask.png", function() {
                                              drawAndDownload("forest_leaf_01_mask", "forest_leaf_01_mask.png", function() {
                                                drawAndDownload("forest_pine_01_mask", "forest_pine_01_mask.png", function() {
                                                  drawAndDownload("forestfloor_02_mask", "forestfloor_02_mask.png", function() {
                                                    drawAndDownload("forestfloor_mask", "forestfloor_mask.png", function() {
                                                      drawAndDownload("hills_01_mask", "hills_01_mask.png", function() {
                                                        drawAndDownload("hills_01_rocks_mask", "hills_01_rocks_mask.png", function() {
                                                          drawAndDownload("hills_01_rocks_medi_mask", "hills_01_rocks_medi_mask.png", function() {
                                                            drawAndDownload("hills_01_rocks_small_mask", "hills_01_rocks_small_mask.png", function() {
                                                              drawAndDownload("india_farmlands_mask", "india_farmlands_mask.png", function() {
                                                                drawAndDownload("medi_dry_mud_mask", "medi_dry_mud_mask.png", function() {
                                                                  drawAndDownload("medi_farmlands_mask", "medi_farmlands_mask.png", function() {
                                                                    drawAndDownload("medi_grass_01_mask", "medi_grass_01_mask.png", function() {
                                                                      drawAndDownload("medi_grass_02_mask", "medi_grass_02_mask.png", function() {
                                                                        drawAndDownload("medi_hills_01_mask", "medi_hills_01_mask.png", function() {
                                                                          drawAndDownload("medi_lumpy_grass_mask", "medi_lumpy_grass_mask.png", function() {
                                                                            drawAndDownload("medi_noisy_grass_mask", "medi_noisy_grass_mask.png", function() {
                                                                              drawAndDownload("mountain_02_b_mask", "mountain_02_b_mask.png", function() {
                                                                                drawAndDownload("mountain_02_c_mask", "mountain_02_c_mask.png", function() {
                                                                                  drawAndDownload("mountain_02_c_snow_mask", "mountain_02_c_snow_mask.png", function() {
                                                                                    drawAndDownload("mountain_02_d_desert_mask", "mountain_02_d_desert_mask.png", function() {
                                                                                      drawAndDownload("mountain_02_d_mask", "mountain_02_d_mask.png", function() {
                                                                                        drawAndDownload("mountain_02_d_snow_mask", "mountain_02_d_snow_mask.png", function() {
                                                                                          drawAndDownload("mountain_02_d_valleys_mask", "mountain_02_d_valleys_mask.png", function() {
                                                                                            drawAndDownload("mountain_02_desert_c_mask", "mountain_02_desert_c_mask.png", function() {
                                                                                              drawAndDownload("mountain_02_desert_mask", "mountain_02_desert_mask.png", function() {
                                                                                                drawAndDownload("mountain_02_mask", "mountain_02_mask.png", function() {
                                                                                                  drawAndDownload("mountain_02_snow_mask", "mountain_02_snow_mask.png", function() {
                                                                                                    drawAndDownload("mud_wet_01_mask", "mud_wet_01_mask.png", function() {
                                                                                                      drawAndDownload("northern_hills_01_mask", "northern_hills_01_mask.png", function() {
                                                                                                        drawAndDownload("northern_plains_01_mask", "northern_plains_01_mask.png", function() {
                                                                                                          drawAndDownload("oasis_mask", "oasis_mask.png", function() {
                                                                                                            drawAndDownload("plains_01_desat_mask", "plains_01_desat_mask.png", function() {
                                                                                                              drawAndDownload("plains_01_dry_mask", "plains_01_dry_mask.png", function() {
                                                                                                                drawAndDownload("plains_01_mask", "plains_01_mask.png", function() {
                                                                                                                  drawAndDownload("plains_01_noisy_mask", "plains_01_noisy_mask.png", function() {
                                                                                                                    drawAndDownload("plains_01_rough_mask", "plains_01_rough_mask.png", function() {
                                                                                                                      drawAndDownload("snow_mask", "snow_mask.png", function() {
                                                                                                                        drawAndDownload("steppe_01_mask", "steppe_01_mask.png", function() {
                                                                                                                          drawAndDownload("steppe_bushes_mask", "steppe_bushes_mask.png", function() {
                                                                                                                            drawAndDownload("steppe_rocks_mask", "steppe_rocks_mask.png", function() {
                                                                                                                              drawAndDownload("wetlands_02_mask", "wetlands_02_mask.png", function() {
                                                                                                                                drawAndDownload("wetlands_02_mud_mask", "wetlands_02_mud_mask.png", function() {
                                                                                                                                  drawAndDownload("book", "book.png", function() {
                                                                                                                                    world.drawingType = "rivermap"
                                                                                                                                    drawWorld();
                                                                                                                                    drawHPRivers();
                                                                                                                                    downloadImage(canvas, "rivers.png");
                                                                                                                                    drawHeightmapFromScratch()
                                                                                                                                    downloadImage(canvas, "heightmap.png");
                                                                                                                                  })
                                                                                                                                })
                                                                                                                              })
                                                                                                                            })
                                                                                                                          })
                                                                                                                        })
                                                                                                                      })
                                                                                                                    })
                                                                                                                  })
                                                                                                                })
                                                                                                              })
                                                                                                            })
                                                                                                          })
                                                                                                        })
                                                                                                      })
                                                                                                    })
                                                                                                  })
                                                                                                })
                                                                                              })
                                                                                            })
                                                                                          })
                                                                                        })
                                                                                      })
                                                                                    })
                                                                                  })
                                                                                })
                                                                              })
                                                                            })
                                                                          })
                                                                        })
                                                                      })
                                                                    })
                                                                  })
                                                                })
                                                              })
                                                            })
                                                          })
                                                        })
                                                      })
                                                    })
                                                  })
                                                })
                                              })
                                            })
                                          })
                                        })
                                      })
                                    })
                                  })
                                })
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      });
    });
  });
}

function setMasks() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      assignMasks(cell)
    }
  }
}

window.onload = function() {
  document.getElementById("loading-screen").style.display = "none"
  document.getElementById("settings-box").style.display = "block"
  //startup();
};

/* TEMPLATE
GID("").onclick = function() {
  world.drawingType = ""
  drawWorld()
}
*/

GID("beach_02_mask").onclick = function() {
  world.drawingType = "beach_02_mask"
  drawWorld()
}

GID("beach_02_mediterranean_mask").onclick = function() {
  world.drawingType = "beach_02_mediterranean_mask"
  drawWorld()
}

GID("beach_02_pebbles_mask").onclick = function() {
  world.drawingType = "beach_02_pebbles_mask"
  drawWorld()
}

GID("coastline_cliff_brown_mask").onclick = function() {
  world.drawingType = "coastline_cliff_brown_mask"
  drawWorld()
}

GID("coastline_cliff_desert_mask").onclick = function() {
  world.drawingType = "coastline_cliff_desert_mask"
  drawWorld()
}

GID("coastline_cliff_grey_mask").onclick = function() {
  world.drawingType = "coastline_cliff_grey_mask"
  drawWorld()
}

GID("desert_01_mask").onclick = function() {
  world.drawingType = "desert_01_mask"
  drawWorld()
}

GID("desert_02_mask").onclick = function() {
  world.drawingType = "desert_02_mask"
  drawWorld()
}

GID("desert_cracked_mask").onclick = function() {
  world.drawingType = "desert_cracked_mask"
  drawWorld()
}

GID("desert_flat_01_mask").onclick = function() {
  world.drawingType = "desert_flat_01_mask"
  drawWorld()
}

GID("desert_rocky_mask").onclick = function() {
  world.drawingType = "desert_rocky_mask"
  drawWorld()
}

GID("desert_wavy_01_larger_mask").onclick = function() {
  world.drawingType = "desert_wavy_01_larger_mask"
  drawWorld()
}

GID("desert_wavy_01_mask").onclick = function() {
  world.drawingType = "desert_wavy_01_mask"
  drawWorld()
}

GID("drylands_01_cracked_mask").onclick = function() {
  world.drawingType = "drylands_01_cracked_mask"
  drawWorld()
}

GID("drylands_01_grassy_mask").onclick = function() {
  world.drawingType = "drylands_01_grassy_mask"
  drawWorld()
}

GID("drylands_01_mask").onclick = function() {
  world.drawingType = "drylands_01_mask"
  drawWorld()
}

GID("farmland_01_mask").onclick = function() {
  world.drawingType = "farmland_01_mask"
  drawWorld()
}

GID("floodplains_01_mask").onclick = function() {
  world.drawingType = "floodplains_01_mask"
  drawWorld()
}

GID("forest_jungle_01_mask").onclick = function() {
  world.drawingType = "forest_jungle_01_mask"
  drawWorld()
}

GID("forest_leaf_01_mask").onclick = function() {
  world.drawingType = "forest_leaf_01_mask"
  drawWorld()
}

GID("forest_pine_01_mask").onclick = function() {
  world.drawingType = "forest_pine_01_mask"
  drawWorld()
}

GID("forestfloor_02_mask").onclick = function() {
  world.drawingType = "forestfloor_02_mask"
  drawWorld()
}

GID("forestfloor_mask").onclick = function() {
  world.drawingType = "forestfloor_mask"
  drawWorld()
}

GID("hills_01_mask").onclick = function() {
  world.drawingType = "hills_01_mask"
  drawWorld()
}

GID("hills_01_rocks_mask").onclick = function() {
  world.drawingType = "hills_01_rocks_mask"
  drawWorld()
}

GID("hills_01_rocks_medi_mask").onclick = function() {
  world.drawingType = "hills_01_rocks_medi_mask"
  drawWorld()
}

GID("hills_01_rocks_small_mask").onclick = function() {
  world.drawingType = "hills_01_rocks_small_mask"
  drawWorld()
}


GID("india_farmlands_mask").onclick = function() {
  world.drawingType = "india_farmlands_mask"
  drawWorld()
}

GID("medi_dry_mud_mask").onclick = function() {
  world.drawingType = "medi_dry_mud_mask"
  drawWorld()
}

GID("medi_farmlands_mask").onclick = function() {
  world.drawingType = "medi_farmlands_mask"
  drawWorld()
}

GID("medi_grass_01_mask").onclick = function() {
  world.drawingType = "medi_grass_01_mask"
  drawWorld()
}

GID("medi_grass_02_mask").onclick = function() {
  world.drawingType = "medi_grass_02_mask"
  drawWorld()
}

GID("medi_hills_01_mask").onclick = function() {
  world.drawingType = "medi_hills_01_mask"
  drawWorld()
}

GID("medi_lumpy_grass_mask").onclick = function() {
  world.drawingType = "medi_lumpy_grass_mask"
  drawWorld()
}

GID("medi_noisy_grass_mask").onclick = function() {
  world.drawingType = "medi_noisy_grass_mask"
  drawWorld()
}

GID("mountain_02_b_mask").onclick = function() {
  world.drawingType = "mountain_02_b_mask"
  drawWorld()
}

GID("mountain_02_c_mask").onclick = function() {
  world.drawingType = "mountain_02_c_mask"
  drawWorld()
}

GID("mountain_02_c_snow_mask").onclick = function() {
  world.drawingType = "mountain_02_c_snow_mask"
  drawWorld()
}

GID("mountain_02_d_desert_mask").onclick = function() {
  world.drawingType = "mountain_02_d_desert_mask"
  drawWorld()
}

GID("mountain_02_d_mask").onclick = function() {
  world.drawingType = "mountain_02_d_mask"
  drawWorld()
}

GID("mountain_02_d_snow_mask").onclick = function() {
  world.drawingType = "mountain_02_d_snow_mask"
  drawWorld()
}

GID("mountain_02_d_valleys_mask").onclick = function() {
  world.drawingType = "mountain_02_d_valleys_mask"
  drawWorld()
}

GID("mountain_02_desert_c_mask").onclick = function() {
  world.drawingType = "mountain_02_desert_c_mask"
  drawWorld()
}

GID("mountain_02_desert_mask").onclick = function() {
  world.drawingType = "mountain_02_desert_mask"
  drawWorld()
}

GID("mountain_02_mask").onclick = function() {
  world.drawingType = "mountain_02_mask"
  drawWorld()
}

GID("mountain_02_snow_mask").onclick = function() {
  world.drawingType = "mountain_02_snow_mask"
  drawWorld()
}

GID("mud_wet_01_mask").onclick = function() {
  world.drawingType = "mud_wet_01_mask"
  drawWorld()
}

GID("northern_hills_01_mask").onclick = function() {
  world.drawingType = "northern_hills_01_mask"
  drawWorld()
}

GID("northern_plains_01_mask").onclick = function() {
  world.drawingType = "northern_plains_01_mask"
  drawWorld()
}

GID("oasis_mask").onclick = function() {
  world.drawingType = "oasis_mask"
  drawWorld()
}

GID("plains_01_desat_mask").onclick = function() {
  world.drawingType = "plains_01_desat_mask"
  drawWorld()
}

GID("plains_01_dry_mask").onclick = function() {
  world.drawingType = "plains_01_dry_mask"
  drawWorld()
}

GID("plains_01_dry_mud_mask").onclick = function() {
  world.drawingType = "plains_01_dry_mud_mask"
  drawWorld()
}

GID("plains_01_mask").onclick = function() {
  world.drawingType = "plains_01_mask"
  drawWorld()
}

GID("plains_01_noisy_mask").onclick = function() {
  world.drawingType = "plains_01_noisy_mask"
  drawWorld()
}

GID("plains_01_rough_mask").onclick = function() {
  world.drawingType = "plains_01_rough_mask"
  drawWorld()
}

GID("snow_mask").onclick = function() {
  world.drawingType = "snow_mask"
  drawWorld()
}

GID("steppe_01_mask").onclick = function() {
  world.drawingType = "steppe_01_mask"
  drawWorld()
}

GID("steppe_bushes_mask").onclick = function() {
  world.drawingType = "steppe_bushes_mask"
  drawWorld()
}

GID("steppe_rocks_mask").onclick = function() {
  world.drawingType = "steppe_rocks_mask"
  drawWorld()
}

GID("wetlands_02_mask").onclick = function() {
  world.drawingType = "wetlands_02_mask"
  drawWorld()
}

GID("wetlands_02_mud_mask").onclick = function() {
  world.drawingType = "wetlands_02_mud_mask"
  drawWorld()
}

GID("download-palettes").onclick = function() {
  downloadAllPalettes();
}

GID("download-clothing-palettes").onclick = function() {
  downloadAllTextures()
}

GID("civ-process").onclick = function() {
  civProcess()
}

function drawRiverTemplate(cell, r) {
  //have to change this and drawRiverTemplateTransparent at same time
  let ran;
  if (cell.riverRun) {
    ran = cell.riverRun;
  } else {
    ran = 0;
  }
  let template = GID("rivertemp");
  let neighbors = getNeighbors(cell.x, cell.y);
  let drawableNeighbors = 0;
  let nCount = 0;
  let others = []
  let nums = []
  if (neighbors) {
    for (let i = 0; i < neighbors.length; i++) {
      if (neighbors[i] && neighbors[i].highPointRiver) {
        others.push(neighbors[i])
        nums.push(i)
        nCount += 1;
      }
    }
  }

  let possibilities = "01234567" // 3nw 5n 7ne 0w (5)place 1e 6sw 4s 2se - leftover from the way getNeighbors returns array
  let sideNeighbors = []
  /*
  if (neighbors) {
    
    let nw = neighbors[3]
    let n = neighbors[5]
    let ne = neighbors[7]
    let w = neighbors[0]
    let e = neighbors[1]
    let sw = neighbors[6]
    let s = neighbors[4]
    let se = neighbors[2]
    
    if (w && w.highPointRiver) {
      possibilities = riverReplace(possibilities, ["1", "4", "6", "7"])
      if (w.drawableRiver) {
        drawableNeighbors += 1;
      }
    }
    if (n && n.highPointRiver) {
      possibilities = riverReplace(possibilities, ["1", "2", "3", "8"])
      if (n.highPointRiver) {
        drawableNeighbors += 1;
      }
    }
    if (e && e.highPointRiver) {
      possibilities = riverReplace(possibilities, ["3", "4", "6", "9"])
      if (e.highPointRiver) {
        drawableNeighbors += 1;
      }
    }
    if (s && s.highPointRiver) {
      possibilities = riverReplace(possibilities, ["2", "7", "8", "9"])
      if (s.highPointRiver) {
        drawableNeighbors += 1;
      }
    }
  }
  */

  
  if (cell.comingFrom) {
    
    if (cell.comingFrom === "S") {
      possibilities = riverReplace(possibilities, ["5", "4", "6", "2"])
    }

    if (cell.comingFrom === "N") {
      possibilities = riverReplace(possibilities, ["5", "4", "3", "7"])


    }

    if (cell.comingFrom === "E") {
      possibilities = riverReplace(possibilities, ["1", "0", "2", "7"])
    }

    if (cell.comingFrom === "W") {
      possibilities = riverReplace(possibilities, ["1", "0", "6", "3"])
    }

  }

  if (cell.headingTo) {
    
    if (cell.headingTo === "S") {
      possibilities = riverReplace(possibilities, ["5", "4", "3", "7"])

    }

    if (cell.headingTo === "N") {
      possibilities = riverReplace(possibilities, ["5", "4", "6", "2"])
    }

    if (cell.headingTo === "E") {
      possibilities = riverReplace(possibilities, ["1", "0", "6", "3"])
    }

    if (cell.headingTo === "W") {
      possibilities = riverReplace(possibilities, ["1", "0", "2", "7"])
    }  
  }

  if (cell.comingFrom && cell.headingTo) {
    if ((cell.headingTo === "N" && cell.comingFrom === "S") || (cell.comingFrom === "N" && cell.headingTo === "S")) {
      let westNeighbor = xy(cell.x - 1, cell.y);
      let eastNeighbor = xy(cell.x + 1, cell.y);
      sideNeighbors.push(westNeighbor);
      sideNeighbors.push(eastNeighbor);
      possibilities = riverReplace(possibilities, ["3", "5", "7", "6", "4", "2"])
    } 
    if ((cell.headingTo === "W" && cell.comingFrom === "E") || (cell.headingTo === "E" && cell.comingFrom === "W")) {
      let northNeighbor = xy(cell.x, cell.y - 1)
      let southNeighbor = xy(cell.x, cell.y + 1)
      sideNeighbors.push(northNeighbor);
      sideNeighbors.push(southNeighbor);
      possibilities = riverReplace(possibilities, ["3", "7", "0", "1", "6", "2"])
    }
    if ((cell.headingTo === "W" && cell.comingFrom === "N") || (cell.headingTo === "N" && cell.comingFrom === "W")) {
      possibilities = "2"
      let southNeighbor = xy(cell.x, cell.y + 1);
      let eastNeighbor = xy(cell.x + 1, cell.y);
      sideNeighbors.push(southNeighbor)
      sideNeighbors.push(eastNeighbor);
    }
    if ((cell.headingTo === "E" && cell.comingFrom === "N") || (cell.headingTo === "N" && cell.comingFrom === "E")) {
      let westNeighbor = xy(cell.x - 1, cell.y);
      let eastNeighbor = xy(cell.x + 1, cell.y);
      sideNeighbors.push(westNeighbor);
      sideNeighbors.push(eastNeighbor)
      possibilities = "6"
    }
    if ((cell.headingTo === "S" && cell.comingFrom === "E") || (cell.headingTo === "E" && cell.comingFrom === "S")) {
      let westNeighbor = xy(cell.x - 1, cell.y);
      let northNeighbor = xy(cell.x, cell.y - 1)
      sideNeighbors.push(westNeighbor);
      sideNeighbors.push(northNeighbor);
      possibilities = "3"
    }
    if ((cell.headingTo === "W" && cell.comingFrom === "S") || (cell.headingTo === "S" && cell.comingFrom === "W")) {
      let northNeighbor = xy(cell.x, cell.y - 1)
      let eastNeighbor = xy(cell.x + 1, cell.y);
      sideNeighbors.push(northNeighbor);
      sideNeighbors.push(eastNeighbor);
      possibilities = "7"
    }
  }

  cell.possibilities = possibilities

  let tempX;
  let tempY;
  //refactor to get tempY based on one of the three
  if (possibilities.indexOf("0") > -1) {
    //left middle image
    tempX = [0, 48, 96, 144, 192, 240, 288, 336, 384, 432][getRandomInt(0, 9)]
    if (ran < 3) {
      tempY = 16
    } else if (ran < 7) {
      tempY = 64
    } else if (ran < 9) {
      tempY = 112
    } else if (ran < 11) {
      tempY = 160
    } else if (ran < 13) {
      tempY = 208
    } else if (ran < 15) {
      tempY = 256
    } else if (ran < 17) {
      tempY = 304
    } else if (ran < 23) {
      tempY = 352
    } else if (ran < 25) {
      tempY = 400
    } else if (ran < 27) {
      tempY = 448
    } else if (ran < 29) {
      tempY = 496
    } else if (ran < 31) {
      tempY = 544
    } else {
      tempY = 592
    }
  } else if (possibilities.indexOf("1") > -1) {
    //1 is neighboring cell to east of current cell? Not sure if I'm right on this one. It seems to be calling the middle cell
    //tempX = [16, 64, 112, 160, 208, 256, 304, 352, 400, 448][getRandomInt(0, 9)]
    tempX = [0, 48, 96, 144, 192, 240, 288, 336, 384, 432][getRandomInt(0, 9)]
    if (ran < 3) {
      tempY = 16
    } else if (ran < 7) {
      tempY = 64
    } else if (ran < 9) {
      tempY = 112
    } else if (ran < 11) {
      tempY = 160
    } else if (ran < 13) {
      tempY = 208
    } else if (ran < 15) {
      tempY = 256
    } else if (ran < 17) {
      tempY = 304
    } else if (ran < 23) {
      tempY = 352
    } else if (ran < 25) {
      tempY = 400
    } else if (ran < 27) {
      tempY = 448
    } else if (ran < 29) {
      tempY = 496
    } else if (ran < 31) {
      tempY = 544
    } else {
      tempY = 592
    }
  } else if (possibilities.indexOf("2") > -1) {
    tempX = [32, 80, 128, 176, 224, 272, 320, 368, 416, 464][getRandomInt(0, 9)]
    if (ran < 3) {
      tempY = 32
    } else if (ran < 7) {
      tempY = 80
    } else if (ran < 9) {
      tempY = 128
    } else if (ran < 11) {
      tempY = 176
    } else if (ran < 13) {
      tempY = 224
    } else if (ran < 15) {
      tempY = 272
    } else if (ran < 17) {
      tempY = 320
    } else if (ran < 23) {
      tempY = 368
    } else if (ran < 25) {
      tempY = 416
    } else if (ran < 27) {
      tempY = 464
    } else if (ran < 29) {
      tempY = 512
    } else if (ran < 31) {
      tempY = 560
    } else {
      tempY = 608
    }
  } else if (possibilities.indexOf("3") > -1) {
    tempX = [0, 48, 96, 144, 192, 240, 288, 336, 384, 432][getRandomInt(0, 9)]
    if (ran < 3) {
      tempY = 0
    } else if (ran < 7) {
      tempY = 48
    } else if (ran < 9) {
      tempY = 96
    } else if (ran < 11) {
      tempY = 144
    } else if (ran < 13) {
      tempY = 192
    } else if (ran < 15) {
      tempY = 240
    } else if (ran < 17) {
      tempY = 288
    } else if (ran < 23) {
      tempY = 336
    } else if (ran < 25) {
      tempY = 384
    } else if (ran < 27) {
      tempY = 432
    } else if (ran < 29) {
      tempY = 480
    } else if (ran < 31) {
      tempY = 528
    } else {
      tempY = 576
    }
  } else if (possibilities.indexOf("4") > -1) {
    tempX = [16, 64, 112, 160, 208, 256, 304, 352, 400, 448][getRandomInt(0, 9)]
    if (ran < 3) {
      tempY = 32
    } else if (ran < 7) {
      tempY = 80
    } else if (ran < 9) {
      tempY = 128
    } else if (ran < 11) {
      tempY = 176
    } else if (ran < 13) {
      tempY = 224
    } else if (ran < 15) {
      tempY = 272
    } else if (ran < 17) {
      tempY = 320
    } else if (ran < 23) {
      tempY = 368
    } else if (ran < 25) {
      tempY = 416
    } else if (ran < 27) {
      tempY = 464
    } else if (ran < 29) {
      tempY = 512
    } else if (ran < 31) {
      tempY = 560
    } else {
      tempY = 608
    }
  } else if (possibilities.indexOf("5") > -1) {
    tempX = [16, 64, 112, 160, 208, 256, 304, 352, 400, 448][getRandomInt(0, 9)]
    if (ran < 3) {
      tempY = 0
    } else if (ran < 7) {
      tempY = 48
    } else if (ran < 9) {
      tempY = 96
    } else if (ran < 11) {
      tempY = 144
    } else if (ran < 13) {
      tempY = 192
    } else if (ran < 15) {
      tempY = 240
    } else if (ran < 17) {
      tempY = 288
    } else if (ran < 23) {
      tempY = 336
    } else if (ran < 25) {
      tempY = 384
    } else if (ran < 27) {
      tempY = 432
    } else if (ran < 29) {
      tempY = 480
    } else if (ran < 31) {
      tempY = 528
    } else {
      tempY = 576
    }
  } else if (possibilities.indexOf("6") > -1) {
    tempX = [0, 48, 96, 144, 192, 240, 288, 336, 384, 432][getRandomInt(0, 9)]
    if (ran < 3) {
      tempY = 32
    } else if (ran < 7) {
      tempY = 80
    } else if (ran < 9) {
      tempY = 128
    } else if (ran < 11) {
      tempY = 176
    } else if (ran < 13) {
      tempY = 224
    } else if (ran < 15) {
      tempY = 272
    } else if (ran < 17) {
      tempY = 320
    } else if (ran < 23) {
      tempY = 368
    } else if (ran < 25) {
      tempY = 416
    } else if (ran < 27) {
      tempY = 464
    } else if (ran < 29) {
      tempY = 512
    } else if (ran < 31) {
      tempY = 560
    } else {
      tempY = 608
    }
  } else if (possibilities.indexOf("7") > -1) {
    tempX = [32, 80, 128, 176, 224, 272, 320, 368, 416, 464][getRandomInt(0, 9)]
    if (ran < 3) {
      tempY = 0
    } else if (ran < 7) {
      tempY = 48
    } else if (ran < 9) {
      tempY = 96
    } else if (ran < 11) {
      tempY = 144
    } else if (ran < 13) {
      tempY = 192
    } else if (ran < 15) {
      tempY = 240
    } else if (ran < 17) {
      tempY = 288
    } else if (ran < 23) {
      tempY = 336
    } else if (ran < 25) {
      tempY = 384
    } else if (ran < 27) {
      tempY = 432
    } else if (ran < 29) {
      tempY = 480
    } else if (ran < 31) {
      tempY = 528
    } else {
      tempY = 576
    }
  }


  if (possibilities.length > 0 && cell.highPointRiver) {
    let n1 = sideNeighbors[0]
    let n2 = sideNeighbors[1];
    if (cell.elevation < 50) {
      if ((n1 && n1.elevation) && (n2 && n2.elevation)) {
        if (n1.elevation > cell.elevation && n2.elevation > cell.elevation) {
          cell.forceFloodplain = true;
        }
      }
    }

    

    if (cell.riverStartGreen) {
      //add check to make sure it doesn't start over another?
      if (cell.headingTo === "N") {
        tempX = 464
        tempY = 2032
      } else if (cell.headingTo === "S") {
        tempX = 496
        tempY = 2032
      } else if (cell.headingTo === "W") {
        tempX = 496
        tempY = 2000
      } else if (cell.headingTo === "E") {
        tempX = 464
        tempY = 2000
      }
    }
    ctx.drawImage(template, tempX, tempY, 16, 16, cell.x * world.pixelSize, cell.y * world.pixelSize, 16, 16)
    cell.riverDrawn = true;
  } else {
    let color = "white";
    cell.rgb = `${color}`
    drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
  }
  if (cell.tributaryMerge) {
    console.log(`Drawing merged river at x: ${cell.x * world.pixelSize} y: ${cell.y * world.pixelSize}`)
    ctx.drawImage(template, cell.tributaryMerge[0], cell.tributaryMerge[1], 16, 16, cell.x * world.pixelSize, cell.y * world.pixelSize, 16, 16)
    cell.riverDrawn = true;
  }

}

function riverReplace(possible, arr) {
  for (let i = 0; i < arr.length; i++) {
    possible = possible.replace(arr[i], "")
  }
  return possible
}

function sortByElevation(arr) {
  return arr.sort((a, b) => b.elevation - a.elevation);
}

function connectRiverCorners() {
  for (i = 0; i < world.rivers.length; i++) {
    let river = world.rivers[i]
    for (let n = 0; n < river.cells.length; n++) {
      let cell = river.cells[n]
      let neighbors = getNeighbors(cell.x, cell.y)
      if (neighbors) {
        let nw = neighbors[3]
        let n = neighbors[5]
        let ne = neighbors[7]
        let w = neighbors[0]
        let e = neighbors[1]
        let sw = neighbors[6]
        let s = neighbors[4]
        let se = neighbors[2]
        if (nw && nw.dropToWater && !n.dropToWater && !w.dropToWater) {
          w.dropToWater = true
          w.drawableRiver = true;
          w.highPointRiver = true;
        }
        if (ne && n && e && ne.dropToWater && !n.dropToWater && !e.dropToWater) {
          n.dropToWater = true;
          n.drawableRiver = true;
          n.highPointRiver = true;
        }
        if (sw && s && w && sw.dropToWater && !s.dropToWater && !w.dropToWater) {
          s.dropToWater = true;
          s.drawableRiver = true;
          s.highPointRiver = true;
        }
        if (se && s && e && se.dropToWater && !s.dropToWater && !e.dropToWater) {
          e.dropToWater = true;
          e.drawableRiver = true;
          e.highPointRiver = true;
        }
      }
    }
  }
}

function worldErosion() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      try {
        erodeFrom(j, i)
      } catch {
        
      }
    }
  }
}

function lowerElevationIfLand(num) {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      let diff = cell.elevation - num;
      if (diff > limits.seaLevel.upper) {
        cell.elevation -= num;
        if (cell.elevation < limits.seaLevel.upper) {
          cell.elevation = limits.seaLevel.upper + 3;
        }
      }
    }
  }
}

function lowerElevationIfMountain(num) {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      let diff = cell.elevation - num;
      if (diff > limits.mountains.lower) {
        cell.elevation -= num;
        if (cell.elevation < limits.mountains.lower) {
          cell.elevation = limits.mountains.lower + 1;
        }
      }
    }
  }
}

function randomSpreadDesert() {
  let randX = getRandomInt(-1, 1);
  let randY = getRandomInt(-1, 1);
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      if (cell.desert) {
        let x = cell.x + randX;
        let y = cell.y + randY;
        let neighbor = xy(x, y)
        neighbor.desert = true;
      }
    }
  }
}

function freshBase() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      if (cell.elevation > limits.seaLevel.upper) {
        cell.elevation = limits.seaLevel.upper + 1;
      }
    }
  }
}

function popupMountains() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      if (cell.elevation < limits.mountains.lower) {
        let diff = limits.mountains.lower - cell.elevation;
        if (diff < 10) {
          cell.elevation += diff;
          cell.elevation += 1;
        }
      }
      
    }
  }
}

function tributaryMerge(last, next) {
  //override coordinates if a river runs into another river
  if (last.headingTo === "S") {
    //This is a situation where an incoming tributary joins a river from the north (i.e., tributary heading south), so next would not be coming from north. We look therefore to a joined river coming from east, west, and south and don't need to check whether it is flowing north
    if ((next.comingFrom === "S" && next.headingTo === "W") || (next.comingFrom === "W" && next.headingTo === "S")) {
      next.tributaryMerge = [32, 624]
      console.log("MERGE")
    } else if (next.comingFrom === "S" && next.headingTo === "E") {
      next.tributaryMerge = [0, 624]
      console.log("MERGE")
    } else if ((next.comingFrom === "E" && next.headingTo === "W") || (next.comingFrom === "W" && next.headingTo === "E")) {
      next.tributaryMerge = [16, 624]
      console.log("MERGE")
    } else if (next.comingFrom === "E" && next.headingTo === "S") {
      next.tributaryMerge = [0, 624]
      console.log("MERGE")
    } else if (next.comingFrom === "W" && next.headingTo === "S") {
      next.tributaryMerge = [32, 624]
      console.log("MERGE")
    } 
  }
  if (last.headingTo === "N") {
    //this is a situation where an incoming tributary joins a river from the south
    if ((next.comingFrom === "W" && next.headingTo === "E") || next.comingFrom === "E" && next.headingTo === "W") {
      next.tributaryMerge = [16, 656] //bottom middle template
      console.log("MERGE")
    } else if ((next.comingFrom === "N" && next.headingTo === "W") || (next.comingFrom === "W" && next.headingTo === "N")) {
      next.tributaryMerge = [32, 656] //bottom right template
      console.log("MERGE")
    } else if (next.comingFrom === "N" && next.headingTo === "E" || (next.comingFrom === "E" && next.headingTo === "N")) {
      next.tributaryMerge = [0, 656] //bottom left template
      console.log("MERGE")
    } 
  }
  if (last.headingTo === "W") {
    //this is a situation where an incoming tributary joins a river from the east
    if ((next.comingFrom === "W" && next.headingTo === "S") || (next.comingFrom === "S" && next.headingTo === "W")) {
      //top right template
      next.tributaryMerge = [80, 624]
      console.log("MERGE")
    } else if ((next.comingFrom === "S" && next.headingTo === "N") || (next.comingFrom === "N" && next.headingTo === "S")) {
      //middle right template
      next.tributaryMerge = [80, 640]
      console.log("MERGE")
    } else if ((next.comingFrom === "N" && next.headingTo === "W") || (next.comingFrom === "W" && next.headingTo === "N")) {
      //bottom right template
      next.tributaryMerge = [80, 656]
      console.log("MERGE")
    }
  }
  if (last.headingTo === "E") {
    if ((next.comingFrom === "S" && next.headingTo === "E") || (next.comingFrom === "E" && next.headingTo === "S")) {
      next.tributaryMerge = [48, 624] //top right template
      console.log("MERGE")
    } else if ((next.comingFrom === "S" && next.headingTo === "N") || (next.comingFrom === "N" && next.headingTo === "S")) {
      next.tributaryMerge = [48, 640] //middle right template
      console.log("MERGE")
    } else if ((next.comingFrom === "N" && next.headingTo === "E") || (next.comingFrom === "E" && next.headingTo === "W")) {
      next.tributaryMerge = [48, 656] //bottom right template
      console.log("MERGE")
    }
  }
}

function createWinterSeverity() {
  let t = `${daBom}\n`
  for (let i = 0; i < world.provinces.length; i++) {
    let p = world.provinces[i]
    let y = p.y
    let bigY = p.bigCell.y
    if (p.land) {
      if (bigY < world.steppeTop && bigY > world.steppeBottom) {
        p.severity = `0.0`;
      } else if (y > 3800) {
        p.severity = `0.9`
      } else if (y > 3600) {
        p.severity  = `0.8`
      } else if (y > 3400) {
        p.severity = `0.7`
      } else if (y > 3200) {
        p.severity = `0.6`
      } else if (y > 3000) {
        p.severity = `0.5`
      } else if (y > 2800) {
        p.severity = `0.4`
      } else if (y > 2700) {
        p.severity = `0.3`
      } else if (y > 2600) {
        p.severity = `0.2`
      } else if (y > 2500) {
        p.severity = `0.1`
      } else if ( y < 1500) {
        p.severity = `0.1`
      } else if (y < 1400) {
        p.severity = `0.2`
      } else if (y < 1300) {
        p.severity = `0.3`
      } else if (y < 1200) {
        p.severity = `0.4`
      } else if (y < 1000) {
        p.severity = `0.5`
      } else if (y < 800) {
        p.severity = `0.6`
      } else if (y < 600) {
        p.severity = `0.7`
      } else if (y < 400) {
        p.severity = `0.8`
      } else if (y < 200) {
        p.severity = `0.9`
      } else {
        p.severity = `0.0`
      }
    } else {
      p.severity = `0.0`
    }
    
    t += `#b_${p.titleName}\n`
    t += `${p.id} = {\n`
    t += `  winter_severity_bias = ${p.severity}\n`
    t += `}\n`
  }

  var data = new Blob([t], {type: 'text/plain'})
  var url = window.URL.createObjectURL(data);
  let link = `<a id="gen_province_properties" download="gen_province_properties.txt" href="">Download Province Properties (Winter Severity)</a><br>`
  document.getElementById("download-links").innerHTML += `${link}`;
  document.getElementById(`gen_province_properties`).href = url
  document.getElementById(`gen_province_properties`).click();

}

GID("save-settings").onclick = function() {
  GID("settings-box").style.display = "none"
  GID("loading-screen").style.display = "block"
  startup()
}