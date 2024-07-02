let bookText = aliceText.split("");
let currentBookPosition = 0;

let settings = {}
settings.width = 8192
settings.height = 4096
settings.tooSmallProvince = 900 // 900 was my default before
settings.horizontalSpread = false; // the new try, not working
settings.verticalSpread = true; //the original I've been using
settings.fixBlockiness = true; // setting to true will allow land provinces to override water
settings.equator = (settings.height - settings.height / 10)
settings.riversDistance = 5

settings.maxLandProvinces = 8000; //not implemented
settings.maxWaterProvinces = 2000; //not implemented


let brush = {}
brush.terrain = "plains"

let limits = {}
limits.pineTree = {
  lower: 10,
  upper: 255
}

limits.hills = {
  lower: 205,
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


//climate classifications defined in distance from equator

function createVaryRange() {
  let arr = [];
  let last = 0;
  for (let i = 0; i < 512; i++) {
    last += getRandomInt(-1, 1);
    if (last > 15) {
      last = 15
    } 
    if (last < -15) {
      last = -15
    }
    arr.push(last)
  }
  return arr;
}

limits.tropical = {
  lower: 0,
  upper: 1007
}

limits.tropical.varyRange = createVaryRange();

limits.subTropical = {
  lower: 1008,
  upper: 1520
}

limits.subTropical.varyRange = createVaryRange()

limits.temperate = {
  lower: 1521,
  upper: 2865
}

limits.temperate.varyRange = createVaryRange();

limits.cold = {
  lower: 2866,
  plains: 3300,
  upper: 4096
}

limits.cold.varyRange = createVaryRange();




let world = {};
world.coveredWater = 0;
world.waterCells = 0
world.lastMaps = []
world.lastCounter = -1

var canvas = document.getElementById("canvas");
//canvas.style.width = '95vw';  // Example display size
canvas.style.width = '100vw'
canvas.style.height = '100vh';  // Example display size
var ctx = canvas.getContext('2d')

let paintbrush = "raiseLand"
let paintbrushSize = 30;
let paintbrushHardness = 50;
let paintbrushLast = 0

let gCount = 0;
let bCount = 0;

const daBom = `\ufeff`
let colorKeys = {}

let provinceCount = 0;
let adjacencySet = new Set();

let uniqueColorSet = new Set();
for (let i = 0; i < 20000; i++) {
   uniqueColorSet.add(getRandomColor())
}
uniqueColorSet = [...uniqueColorSet]

let uniqueColorCount = 0;

let simp = new SimplexNoise()

function noise(nx, ny) {
    return simp.noise2D(nx, ny) / 2 + 0.5;
}