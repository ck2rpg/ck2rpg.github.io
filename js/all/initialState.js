let bookText = aliceText.split("");
let currentBookPosition = 0;

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
world.coveredWater = 0;
world.waterCells = 0

var canvas = document.getElementById("canvas");
canvas.style.width = '95vw';  // Example display size
canvas.style.height = '100vh';  // Example display size
var ctx = canvas.getContext('2d')

let paintbrush = "raiseland"
let paintbrushSize = 30;
let paintbrushHardness = 50;

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