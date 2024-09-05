function undoMapChange() {
  if (world.lastCounter > 0) {
    world.lastCounter -= 1;
    world.map = world.lastMaps[world.lastCounter]
    drawWorld()
  }
}

GID("lowerWater").onclick = function() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      if (cell.elevation < 36) {
        cell.elevation -= 1;
      }
    }
  }
  drawWorld()
}

GID("raiseLand").onclick = function() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      if (cell.elevation > 37) {
        cell.elevation += 1;
      } 
    }
  }
  drawWorld()
}

GID("undoMap").onclick = function() {
  undoMapChange();
}

function redoMapChange() {
  if (world.lastCounter < world.lastMaps.length - 1) {
    world.lastCounter += 1;
    world.map = world.lastMaps[world.lastCounter]
    drawWorld()
  }
}

GID("redoMap").onclick = function() {
  redoMapChange()
}

function updateSliderValue(value) {
  paintbrushSize = value;
  //document.getElementById('sizeValue').value = value;
}

function updateSlider(value) {
  
  paintbrushSize = value;
  //document.getElementById('sizeSlider').value = value;
}

function updatePowerSliderValue(value) {
  console.log(value)
  paintbrushHardness = value;
  //document.getElementById('powerValue').value = value;
}

function updatePowerSlider(value) {
  console.log(value)
  paintbrushHardness = value
}

function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

const equatorChange = debounce(() => updateEquatorValue());

function updateEquatorValue(value) {
  settings.equator = parseInt(GID("equatorSlider").value)
  drawWorld()
}

const riverChange = debounce(() => updateRiversValue())

function updateRiversValue(value) {
  settings.riversDistance = 31 - parseInt(GID("riversSlider").value);
  rerunRivers()
  cleanupAll()
  drawWorld()
}

function updateSeaLevelValue(value) {
  limits.seaLevel.upper = value;
  getBeaches()
  drawWorld()
}

function updateProvinceSliderValue(value) {
  settings.tooSmallProvince = value
}

GID("startup").onclick = function() {
  startup()
}

GID("increase-elevation-icon").onclick = function() {
  raiseElevation(settings.massBrushAdjuster)
  drawWorld()
}

GID("decrease-elevation-icon").onclick = function() {
  lowerElevation(settings.massBrushAdjuster)
  drawWorld()
}

GID("lower-mountains-icon").onclick = function() {
  lowerMountains(settings.massBrushAdjuster);
  drawWorld()
}

GID("raise-mountains-icon").onclick = function() {
  raiseMountains(settings.massBrushAdjuster)
  drawWorld()
}


/*
GID("rainErosion").onclick = function() {
  rainErosion()
  drawWorld()
}
*/

GID("broom").onclick = function() {
  cleanupAll()
  drawWorld()
}


GID("soften-spread-icon").onclick = function() {
  softenMountains()
  spreadingCenterEmitsSmall()
  spread()
  drawWorld()
}

GID("canvas").onclick = function(e) {
  if (settings.info === "on") {
    showInfo(e)
  }
  if (paintbrush !== "") {
    applyBrush(e, paintbrushSize, paintbrush, paintbrushHardness)
  }
}

GID("paint-increase-elevation").onclick = function() {
  paintbrush = "raiseLand"
}

GID("paint-decrease-elevation").onclick = function() {
  paintbrush = "dropLand"
}

GID("download-all-checked-images").onclick = function() {
  setMasks();
  downloadAllImages();
}

GID("write-all-checked-texts-button").onclick = function() {
  const functionsToExecute = [];
  
  functionsToExecute.push(() => writeProvinceDefinitions());
  functionsToExecute.push(() => writeLandedTitles());
  functionsToExecute.push(() => writeLocators("buildings"));
  functionsToExecute.push(() => writeLocators("special_building"));
  functionsToExecute.push(() => writeLocators("combat"));
  functionsToExecute.push(() => writeLocators("siege"));
  functionsToExecute.push(() => writeLocators("unit_stack"));
  functionsToExecute.push(() => writeLocators("unit_stack_player_owned"));
  functionsToExecute.push(() => writeLocators("unit_stack_other_owner"));
  functionsToExecute.push(() => writeLocators("activities"));
  functionsToExecute.push(() => outputCultures());
  functionsToExecute.push(() => makeSimpleHistory());
  functionsToExecute.push(() => outputCulturesHistory());
  functionsToExecute.push(() => outputCharacters());
  functionsToExecute.push(() => outputHistory());
  functionsToExecute.push(() => writeTitleLocalization());
  functionsToExecute.push(() => writeCultureLocalization());
  functionsToExecute.push(() => outputNameLists());
  functionsToExecute.push(() => outputEthnicities());
  functionsToExecute.push(() => outputLanguages());
  functionsToExecute.push(() => outputHeritages());
  functionsToExecute.push(() => writeProvinceTerrain());
  //if (document.getElementById('nameListLocCheckbox').checked) functionsToExecute.push(() => outputNameListLoc());
  functionsToExecute.push(() => outputHeritageLocalization());
  functionsToExecute.push(() => outputLanguagesLocalization());
  functionsToExecute.push(() => writeDynastyLocalization());
  functionsToExecute.push(() => writeBookmark());
  functionsToExecute.push(() => writeBookmarkGroup());
  functionsToExecute.push(() => religionOutputter());
  functionsToExecute.push(() => writeDefaultMap());
  functionsToExecute.push(() => createWinterSeverity());
  functionsToExecute.push(() => writeWinterSeverity());
  if (settings.overrideWithFlatmap) {
    functionsToExecute.push(() => writeTerrainShader())
    functionsToExecute.push(() => writeWaterShader())
  }
  functionsToExecute.push(() => moveToImageDownloads())
  functionsToExecute.push(() => writeDescriptor());
  functionsToExecute.push(() => writeHybridCultures()) 
  functionsToExecute.push(() => writeHybridCulturesLocalization())
  functionsToExecute.push(() => writeGenerators());
  functionsToExecute.push(() => writeDefines());
  functionsToExecute.push(() => writeHeightmapHeightmap())
  functionsToExecute.push(() => writeSettings())
  
  const delayBetweenDownloads = 200;
  downloadWithDelay(0, functionsToExecute, delayBetweenDownloads);
}

function moveToImageDownloads() {
  GID("download-links").style.display = "none"
  GID("text-download-settings").style.display = "none"
  GID("image-download-settings").style.display = "block"
}

GID("color-map-icon").onclick = function() {
  world.drawingType = "colorful"
  drawWorld()
}

GID("heightmap-icon").onclick = function() {
  world.drawingType = "heightmap"
  drawWorld()
}

GID("river-map-icon").onclick = function() {
  world.drawingType = "rivermap"
  rerunRivers()
  drawWorld()
}

GID("papyrus-map-icon").onclick = function() {
  world.drawingType = "papyrus"
  drawWorld()
}

GID("roguelike-icon").onclick = function() {
  world.drawingType = "roguelike"
  drawWorld()
}

GID("create-provinces").onclick = function() {
  world.lastMaps = null
  GID("main-generator-div").style.display = "none";
  GID("menus-main").style.display = "none"
  GID("menus-map-modes").style.display = "none"
  GID("province-creation-screen").style.display = "block";
  // Delay the createProvinces function call
  setTimeout(function() {
    createProvinces();
  }, 0); // A delay of 0ms still allows the browser to update the DOM first
}


GID("rerun-rivers-icon").onclick = function() {
  rerunRivers() 
}

GID("spread-icon").onclick = function() {
  clearRain()
  for (let i = 0; i < 3; i++) {
    spreadingCenterEmits();
    spread()
    setMoisture()
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  floodFillRivers()
  cleanupAll()
  drawWorld()
  clearRain()
}

GID("colorswatch").onclick = function() {
  world.drawingType = "terrainMap"
  paintbrush = "terrain"
  drawWorld()
}

GID("droptowater").onclick = function() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      world.map[i][j].elevation = 35
    }
  }
  rerunRivers() 
  cleanupAll()
  drawWorld()
}

GID("water-to-sea-level").onclick = function() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j];
      if (cell.elevation < 37) {
        cell.elevation = 37
      }
    }
  }
  cleanupAll()
  drawWorld()
}

GID("all-to-sea-level").onclick = function() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      world.map[i][j].elevation = 37
    }
  }
  cleanupAll()
  drawWorld()
}

function redoCheckboxes(c) {
  if (c === "river") {
    if (riverCheck === false) {
      lakeCheck = false;
      oceanCheck = false;
      impassableCheck = false;
      impassableSeaCheck = false;
      riverCheck = true;
      currentProvince.isRiver = true;
    } else {
      riverCheck = false;
      currentProvince.isRiver = false;
    }
  } else if (c === "lake") {
    if (lakeCheck === false) {
      riverCheck = false;
      oceanCheck = false;
      impassableCheck = false;
      impassableSeaCheck = false;
      lakeCheck = true;
      currentProvince.isLake = true
    } else {
      lakeCheck = false
      currentProvince.isLake = false;
    }
  } else if (c === "impassable") {
    if (impassableCheck === false) {
      riverCheck = false;
      lakeCheck = false;
      oceanCheck = false;
      impassableSeaCheck = false;
      impassableCheck = true;
      currentProvince.isImpassable = true;
    } else {
      impassableCheck = false;
      currentProvince.isImpassable = false;
    } 
  } else if (c === "ocean") {
    if (oceanCheck === false) {
      riverCheck = false;
      lakeCheck = false;
      impassableCheck = false;
      impassableSeaCheck = false;
      oceanCheck = true;
      currentProvince.isOcean = true;

    } else {
      oceanCheck = false;
      currentProvince.isOcean = false;
    }
  } else if (c === "impassableSea") {
    if (impassableSeaCheck === false) {
      riverCheck = false;
      lakeCheck = false;
      impassableCheck = false;
      oceanCheck = false;
      impassableSeaCheck = true;
      currentProvince.isImpassableSea = true;

    } else {
      impassableSeaCheck = false;
      currentProvince.isImpassableSea = false;
    }
  }
  GID("riverCheckbox").checked = riverCheck
  GID("lakeCheckbox").checked = lakeCheck;
  GID("impassableCheckbox").checked = impassableCheck;
  GID("oceanCheckbox").checked = oceanCheck;
  GID("impassableSeaCheckbox").checked = impassableSeaCheck;
}

let lakeCheck = false;
let riverCheck = false;
let impassableCheck = false;
let oceanCheck = false
let impassableSeaCheck = false;

GID("province-drawn-proceed").onclick = function() {
  GID("province-drawn-proceed").style.display = "none";
  GID("province-menu").style.display = "block";
  GID("lakeCheckbox").addEventListener('click', function() { redoCheckboxes('lake'); });
  GID("riverCheckbox").addEventListener('click', function() { redoCheckboxes('river'); });
  GID("impassableCheckbox").addEventListener('click', function() { redoCheckboxes('impassable'); });
  GID("oceanCheckbox").addEventListener('click', function() { redoCheckboxes('ocean'); });
  GID("impassableSeaCheckbox").addEventListener('click', function() { redoCheckboxes('impassableSea'); });
  startProvinceEditor();
  /*
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = "rgb(0, 0, 0)"
  ctx.fill();
  GID("canvas").style.display = "none"
  GID("province-drawn-proceed").style.display = "none"
  GID("text-download-settings").style.display = "block"
  */
}

GID("province-edits-done-proceed").onclick = function() {
  saveLastProvince()
  removeEmptyTitles()
  world.smallMap = null
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = "rgb(0, 0, 0)"
  ctx.fill();
  GID("canvas").style.display = "none"
  GID("province-menu").style.display = "none"
  GID("province-drawn-proceed").style.display = "none"
  GID("text-download-settings").style.display = "block"
}

GID("paint-erode").onclick = function() {
  paintbrush = "erosion"
}


//color picker

const colorBox = document.getElementById('selected-color');
const colorPicker = document.getElementById('color-picker');
const tooltip = document.getElementById('selected-tooltip');
const colorOptions = document.querySelectorAll('.color-option');

colorBox.addEventListener('click', () => {
  colorPicker.style.display = colorPicker.style.display === 'block' ? 'none' : 'block';
});

colorOptions.forEach(option => {
  option.addEventListener('click', () => {
    const selectedColor = option.style.backgroundColor;
    const selectedTooltip = option.dataset.tooltip;
    console.log(option.dataset)
    colorBox.style.backgroundColor = selectedColor;
    tooltip.textContent = selectedTooltip;
    paintbrush = "terrain"
    paintbrushTerrain = option.dataset.tooltip.toLowerCase()
    colorPicker.style.display = 'none';
  });
});

document.addEventListener('click', (e) => {
  if (!colorBox.contains(e.target) && !colorPicker.contains(e.target)) {
    colorPicker.style.display = 'none';
  }
});



//BRUSH VIEW

/*

const bbb = document.getElementById('brush');
const mapContainer = document.getElementById('canvas');



mapContainer.addEventListener('mousemove', (event) => {
    let correctedBrush = parseInt(paintbrushSize) * parseInt(settings.pixelSize / 2);
    bbb.style.setProperty('--brush-size', `${correctedBrush}px`);
    const x = event.clientX;
    const y = event.clientY;

    bbb.style.left = `${x}px`;
    bbb.style.top = `${y}px`;
});

// Show the brush when entering the map container
mapContainer.addEventListener('mouseenter', () => {
  bbb.style.display = 'block';
});

// Hide the brush when leaving the map container
mapContainer.addEventListener('mouseleave', () => {
  bbb.style.display = 'none';
});

*/

// BRUSH VIEW

const bbb = document.getElementById('brush');
const mapContainer = document.getElementById('canvas');

bbb.style.setProperty('--brush-size', `${paintbrushSize}px`);

function setRedBrush() {
  if (paintbrushShape && paintbrushShape === "circle") {
    bbb.style.borderRadius = '50%'
    const rect = mapContainer.getBoundingClientRect();
    const scaleX = mapContainer.width / rect.width;
    const scaleY = mapContainer.height / rect.height;
    
    const x = (event.clientX - rect.left)
    const y = (event.clientY - rect.top)
    
    const brushSize = paintbrushSize * settings.pixelSize / scaleY; // Scaling brush size

    bbb.style.width = `${brushSize}px`;  // Setting the width of the brush preview
    bbb.style.height = `${brushSize}px`; // Setting the height of the brush preview
    bbb.style.left = `${x}px`;
    bbb.style.top = `${y}px`;
  } else {
    const rect = mapContainer.getBoundingClientRect();
    const scaleX = mapContainer.width / rect.width;
    const scaleY = mapContainer.height / rect.height;
    
    const x = (event.clientX - rect.left)
    const y = (event.clientY - rect.top)
    let correctedBrush = parseInt(paintbrushSize) * 16 * scaleY;
    const brushSize = paintbrushSize * 16 / scaleY; // Scaling brush size
    bbb.style.borderRadius = '0%'
    bbb.style.width = `${brushSize}px`;  // Setting the width of the brush preview
    bbb.style.height = `${brushSize}px`; // Setting the height of the brush preview

    bbb.style.left = `${x}px`;
    bbb.style.top = `${y}px`;
  }
}

function showRedBrush() {
  bbb.style.display = 'block';
  console.log('Brush shown');
}

function hideRedBrush() {
  bbb.style.display = 'none';
}

mapContainer.addEventListener('mousemove', setRedBrush)

// Show the brush when entering the map container
mapContainer.addEventListener('mouseenter', showRedBrush)

// Hide the brush when leaving the map container
mapContainer.addEventListener('mouseleave', hideRedBrush)

// Initialize the brush display
bbb.style.display = 'none';
console.log('Brush initialized');


//title color picker

function hexToRgb(hex) {
  // Remove the leading # if it exists
  hex = hex.replace(/^#/, '');

  // Parse the r, g, b values
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}

function setTitleColor() {
  paintbrushTitle = GID("title-color").value;
  // Remove the leading # if it exists
  paintbrushTitle = paintbrushTitle.replace(/^#/, '');
  paintbrushTitleR = parseInt(paintbrushTitle.substring(0, 2), 16);
  paintbrushTitleG = parseInt(paintbrushTitle.substring(2, 4), 16);
  paintbrushTitleB = parseInt(paintbrushTitle.substring(4, 6), 16);
  paintbrushTitle = `rgb(${paintbrushTitleR}, ${paintbrushTitleG}, ${paintbrushTitleB})`
}

GID("title-color").addEventListener('change', setTitleColor);

GID("provmap-icon").onclick = function() {
  world.drawingType = "smallProv"
  paintbrush = "provinceOverride"
  setTitleColor()
  drawWorld()
}

GID("culturemap-icon").onclick = function() {
  updateCultureColorColumn()
  world.drawingType = "smallCulture"
  paintbrush = "cultureOverride"
  setTitleColor()
  drawWorld()
}

GID("faithmap-icon").onclick = function() {
  updateFaithColorColumn()
  world.drawingType = "smallFaith"
  paintbrush = "faithOverride"
  setTitleColor()
  drawWorld()
}

GID("watermap-icon").onclick = function() {
  world.drawingType = "smallWater"
  paintbrush = "waterOverride"
  setTitleColor()
  drawWorld()
}

GID("full-province-map").onclick = function() {
  drawProvinceMap()
  GID("province-drawn-proceed").style.display = "none"
  GID("province-menu").style.display = "block"
  startProvinceEditor()
}


GID("only-land-map").onclick = function() {
  drawProvinceMapWithoutOceans()
  GID("province-drawn-proceed").style.display = "none"
  GID("province-menu").style.display = "block"
  startProvinceEditor()
}

GID("only-water-map").onclick = function() {
  drawProvinceMapWithoutLand()
  GID("province-drawn-proceed").style.display = "none"
  GID("province-menu").style.display = "block"
  startProvinceEditor()
}

GID("county-map").onclick = function() {
  drawTitleMap("county")
}

GID("duchy-map").onclick = function() {
  drawTitleMap("duchy")
}

GID("kingdom-map").onclick = function() {
  drawTitleMap("kingdom")
}

GID("empire-map").onclick = function() {
  drawTitleMap("empire")
}

function updateMaxLandProvinces(num) {
  settings.landProvinceLimit = parseInt(num);
}

function updateMaxWaterProvinces(num) {
  settings.waterProvinceLimit = parseInt(num);
}

function updateMaxFill(num) {
  settings.fillInLimit = parseInt(num)
}

function updateMassBrushAdjuster(num) {
  settings.massBrushAdjuster += parseInt(num)
}

document.getElementById('map-sizes').addEventListener('change', function(event) {
  const selectedValue = event.target.value;
  const [width, height] = selectedValue.split('x').map(Number);

  settings.width = width;
  settings.height = height;
  settings.pixelSize = settings.height / world.height
  resetClimateLimits()
  drawWorld()
});

GID("absoluteBrush").addEventListener('change', function(event) {
  const selectedValue = event.target;
  if (selectedValue.checked) {
    paintbrushAbsolute = true;
  } else {
    paintbrushAbsolute = false;
  }
})

document.getElementById('generator-resolution').addEventListener('change', function(event) {
  const selectedValue = event.target.value;
  const [width, height] = selectedValue.split('x').map(Number);
  world = {}
  createWorld(width, height)
  settings.pixelSize = settings.height / world.height
  resetClimateLimits()
  randomMap()
  cleanupAll()
  drawWorld()
});

let heightmapAdjuster = 0
function updateHeightmapAdjuster(num) {
  heightmapAdjuster = num;
}

let limitAdjuster = debounce(() => adjustLimits());

function adjustLimits() {
  const tropicalUpper = parseInt(document.getElementById('tropicalUpper').value);
  const subTropicalUpper = parseInt(document.getElementById('subTropicalUpper').value);
  const temperateUpper = parseInt(document.getElementById('temperateUpper').value);

  limits.tropical.upper = tropicalUpper;
  limits.subTropical.lower = tropicalUpper + 1;
  limits.subTropical.upper = subTropicalUpper;
  limits.temperate.lower = subTropicalUpper + 1;
  limits.temperate.upper = temperateUpper;
  limits.cold.lower = temperateUpper + 1;
  limits.cold.upper = 4096; // Assuming the maximum limit is fixed
  document.getElementById('tropicalUpper').value = limits.tropical.upper;
  document.getElementById('subTropicalUpper').value = limits.subTropical.upper;
  document.getElementById('temperateUpper').value = limits.temperate.upper
  drawWorld()
}

document.getElementById('overrideSelect').addEventListener('change', function() {
  settings.overrideWithFlatmap = this.value === 'true';
});


let elevationToHeightmapAdjuster = debounce(() => adjustElevationToHeightmap())

function adjustElevationToHeightmap() {
  settings.elevationToHeightmap = parseInt(GID("elevation-to-heightmap").value);
}

let hillAdjuster = debounce(() => adjustHillLimits())

function adjustHillLimits() {
  limits.hills.lower = parseInt(GID("hills-line").value);
}

let mountainAdjuster = debounce(() => adjustMountainLimits())

function adjustMountainLimits() {
  limits.mountains.lower = parseInt(GID("mountain-line").value);
  limits.hills.upper = limits.mountains.lower - 1;
}

let snowLineAdjuster = debounce(() => adjustSnowLine())

function adjustSnowLine() {
  limits.mountains.snowLine = parseInt(GID("snow-line").value);
}

let farmlandElevationAdjuster = debounce(() => adjustFarmlandElevation())

function adjustFarmlandElevation() {
  settings.farmlandElevation = parseInt(GID("farmland-elevation").value)
  createCellTerrains()
  drawWorld()
}

let farmlandChunkAdjuster = debounce(() => adjustFarmlandChunk())

function adjustFarmlandChunk() {
  settings.farmlandChunk = parseInt(GID("farmland-chunk").value)
  createCellTerrains()
  drawWorld()
}

let farmlandScattershotAdjuster = debounce(() => adjustFarmlandScattershot())

function adjustFarmlandScattershot() {
  settings.farmlandScattershot = parseInt(GID("farmland-scattershot").value)
  createCellTerrains()
  drawWorld()
}

settings.farmlandElevation = parseInt(GID("farmland-elevation").value)
settings.farmlandChunk = parseInt(GID("farmland-chunk").value)
settings.farmlandScattershot = parseInt(GID("farmland-scattershot").value)

let wetlandElevationAdjuster = debounce(() => adjustWetlandElevation())

function adjustWetlandElevation() {
  settings.wetlandElevation = parseInt(GID("wetland-elevation").value)
  createCellTerrains()
  drawWorld()
}

let wetlandChunkAdjuster = debounce(() => adjustWetlandChunk())

function adjustWetlandChunk() {
  settings.wetlandChunk = parseInt(GID("wetland-chunk").value)
  createCellTerrains()
  drawWorld()
}

let wetlandScattershotAdjuster = debounce(() => adjustWetlandScattershot())

function adjustWetlandScattershot() {
  settings.wetlandScattershot = parseInt(GID("wetland-scattershot").value)
  createCellTerrains()
  drawWorld()
}

settings.wetlandElevation = parseInt(GID("wetland-elevation").value)
settings.wetlandChunk = parseInt(GID("wetland-chunk").value)
settings.wetlandScattershot = parseInt(GID("wetland-scattershot").value)

let updateLowerLimitSliderValue = debounce(() => adjustLowerLimitSlider())

function adjustLowerLimitSlider() {
  lowerPaintbrushLimit = parseInt(GID("lowerLimitSlider").value)
}

let updateLimitSliderValue = debounce(() => adjustLimitSlider())

function adjustLimitSlider() {
  paintbrushLimit = parseInt(GID("limitSlider").value)
}

GID("erase-province").onclick = function() {
  paintbrush = "province-eraser"
}

const countyDistanceThresholdInput = GID("county-distance-threshold")
const duchyDistanceThresholdInput = GID("duchy-distance-threshold")
const kingdomDistanceThresholdInput = GID("kingdom-distance-threshold")

let countyDistanceThreshold = parseFloat(countyDistanceThresholdInput.value);
let duchyDistanceThreshold = parseFloat(duchyDistanceThresholdInput.value);
let kingdomDistanceThreshold = parseFloat(kingdomDistanceThresholdInput.value);

countyDistanceThresholdInput.addEventListener('input', () => {
    countyDistanceThreshold = parseFloat(countyDistanceThresholdInput.value);
});

duchyDistanceThresholdInput.addEventListener('input', () => {
    duchyDistanceThreshold = parseFloat(duchyDistanceThresholdInput.value);
});

kingdomDistanceThresholdInput.addEventListener('input', () => {
    kingdomDistanceThreshold = parseFloat(kingdomDistanceThresholdInput.value);
});

let maxProvincesInCounty = 6;
let maxCountiesInDuchy = 6;
let maxDuchiesInKingdom = 6;
let maxKingdomsInEmpire = 6;

document.getElementById('max-provinces-in-county').addEventListener('input', function(event) {
  maxProvincesInCounty = parseInt(event.target.value);
});

document.getElementById('max-counties-in-duchy').addEventListener('input', function(event) {
  maxCountiesInDuchy = parseInt(event.target.value);
});

document.getElementById('max-duchies-in-kingdom').addEventListener('input', function(event) {
  maxDuchiesInKingdom = parseInt(event.target.value);
});

document.getElementById('max-kingdoms-in-empire').addEventListener('input', function(event) {
  maxKingdomsInEmpire = parseInt(event.target.value);
});

function openTab(evt, tabName) {
  var i, tabcontent, tabbuttons;

  // Hide all tab content
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove the active class from all tab buttons
  tabbuttons = document.getElementsByClassName("tab-button");
  for (i = 0; i < tabbuttons.length; i++) {
    tabbuttons[i].className = tabbuttons[i].className.replace(" active", "");
  }

  // Show the current tab and add an active class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Open the first tab by default
document.addEventListener("DOMContentLoaded", function() {
  document.querySelector(".tab-button").click();
});


const ethnicitiesSelect = document.getElementById('ethnicities');
const culturePerSelect = GID("culture-per");
const divergeAtKingdomSelect = GID("diverge-at-kingdom");
const divergeAtDuchySelect = GID("diverge-at-duchy");
const divergeAtCountySelect = GID("diverge-at-county");
const paletteSelect = GID("palettes");

function updateDivergenceOptions() {
  const culturePerValue = culturePerSelect.value;

  // Enable or disable divergence options based on the selected culturePer tier
  switch (culturePerValue) {
    case "county":
      divergeAtCountySelect.value = "false";
      divergeAtCountySelect.disabled = true;
      divergeAtDuchySelect.value = "false";
      divergeAtDuchySelect.disabled = true;
      divergeAtKingdomSelect.value = "false";
      divergeAtKingdomSelect.disabled = true;
      break;
    case "duchy":
      divergeAtCountySelect.disabled = false;
      divergeAtDuchySelect.value = "false";
      divergeAtDuchySelect.disabled = true;
      divergeAtKingdomSelect.value = "false";
      divergeAtKingdomSelect.disabled = true;
      break;
    case "kingdom":
      divergeAtCountySelect.disabled = false;
      divergeAtDuchySelect.disabled = false;
      divergeAtKingdomSelect.value = "false";
      divergeAtKingdomSelect.disabled = true;
      break;
    case "empire":
      divergeAtCountySelect.disabled = false;
      divergeAtDuchySelect.disabled = false;
      divergeAtKingdomSelect.disabled = false;
      break;
  }

  // Update settings based on new values
  settings.divergeCulturesAtKingdom = divergeAtKingdomSelect.value === "true";
  settings.divergeCulturesAtDuchy = divergeAtDuchySelect.value === "true";
  settings.divergeCulturesAtCounty = divergeAtCountySelect.value === "true";
}

// Initialize settings
settings.ethnicities = ethnicitiesSelect.value;
settings.culturePer = culturePerSelect.value;
updateDivergenceOptions();

// Event listeners for divergence selection
divergeAtKingdomSelect.addEventListener('change', () => {
  settings.divergeCulturesAtKingdom = divergeAtKingdomSelect.value === "true";
});

divergeAtDuchySelect.addEventListener('change', () => {
  settings.divergeCulturesAtDuchy = divergeAtDuchySelect.value === "true";
});

divergeAtCountySelect.addEventListener('change', () => {
  settings.divergeCulturesAtCounty = divergeAtCountySelect.value === "true";
});

// Event listener for culturePer selection
culturePerSelect.addEventListener('change', () => {
  settings.culturePer = culturePerSelect.value;
  updateDivergenceOptions();
});

ethnicitiesSelect.addEventListener('change', () => {
  settings.ethnicities = ethnicitiesSelect.value
})

paletteSelect.addEventListener('change', () => {
  settings.palettes = paletteSelect.value
})




const religionFamilyLevelSelect = GID("religion-family-level")
const divergeFaithLevelSelect = GID("diverge-faith-level");

function updateFaithDivergenceOptions() {
  const religionFamilyLevelValue = religionFamilyLevelSelect.value;

  // Enable options in divergeFaithLevelSelect based on religionFamilyLevel
  switch (religionFamilyLevelValue) {
    case "empire":
      divergeFaithLevelSelect.querySelectorAll('option').forEach(option => {
        option.disabled = false; // Enable all options
      });
      break;
    case "kingdom":
      divergeFaithLevelSelect.querySelectorAll('option').forEach(option => {
        option.disabled = option.value === "empire";
      });
      if (divergeFaithLevelSelect.value === "empire") {
        divergeFaithLevelSelect.value = "kingdom"; // Set to a valid level
      }
      break;
    case "duchy":
      divergeFaithLevelSelect.querySelectorAll('option').forEach(option => {
        option.disabled = option.value === "empire" || option.value === "kingdom";
      });
      if (divergeFaithLevelSelect.value === "empire" || divergeFaithLevelSelect.value === "kingdom") {
        divergeFaithLevelSelect.value = "duchy"; // Set to a valid level
      }
      break;
    case "county":
      divergeFaithLevelSelect.querySelectorAll('option').forEach(option => {
        option.disabled = option.value !== "county"; // Only county is valid
      });
      if (divergeFaithLevelSelect.value !== "county") {
        divergeFaithLevelSelect.value = "county"; // Set to county level
      }
      break;
  }

  // Update settings based on new values
  settings.religionFamilyLevel = religionFamilyLevelSelect.value;
  settings.divergeFaithLevel = divergeFaithLevelSelect.value;
}

// Initialize settings
settings.religionFamilyLevel = religionFamilyLevelSelect.value;
settings.divergeFaithLevel = divergeFaithLevelSelect.value;
updateFaithDivergenceOptions();

// Event listener for religionFamilyLevel selection
religionFamilyLevelSelect.addEventListener('change', () => {
  updateFaithDivergenceOptions();
});

// Event listener for divergeFaithLevel selection
divergeFaithLevelSelect.addEventListener('change', () => {
  settings.divergeFaithLevel = divergeFaithLevelSelect.value;
});

const historyHolderLevelSelect = GID("history-holder-level");

historyHolderLevelSelect.addEventListener('change', () => {
  updateHistoryHolderLevel();
})

function updateHistoryHolderLevel() {
  settings.historyHolderLevel = historyHolderLevelSelect.value;
}

const eraLevelSelect = document.getElementById('era-level');

eraLevelSelect.addEventListener('change', function() {
    settings.eraLevel = eraLevelSelect.options[eraLevelSelect.selectedIndex].text;
});

GID("randomNoiseMap").onclick = function() {
  randomMap()
  cleanupAll()
  drawWorld()
}

GID("save-settings").onclick = function() {
  writeGeneratorSettings()
}

GID('loadSettingsInput').addEventListener('change', function(event) {
  console.log("CLICKED LOAD")
  const file = event.target.files[0];
  loadGeneratorSettings(file);
  let width = world.width;
  let height = world.height;
  world = {}
  world.width = width;
  world.height = height
  createWorld()
  settings.pixelSize = settings.height / world.height
  //resetClimateLimits()
  randomMap()
  cleanupAll()
  world.drawingType = "colorful"
  drawWorld()
});

function closeEditor(culture) {
  updateCultureValues(culture); // Save the current changes back to the culture object
  document.getElementById('culture-editor').style.display = 'none'; // Hide the editor
}

// Event listener for the close button
document.getElementById('close-editor').addEventListener('click', () => {
  closeEditor(settings.currentCulture); // Assuming currentCulture is defined globally
});