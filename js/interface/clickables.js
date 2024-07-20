const movableDiv = document.getElementById('main-sidebar');
const movingDiv = document.getElementById("main-sidebar-top")

let isDragging = false;
let offsetX, offsetY;

movingDiv.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - movableDiv.offsetLeft;
    offsetY = e.clientY - movableDiv.offsetTop;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        movableDiv.style.left = `${e.clientX - offsetX}px`;
        movableDiv.style.top = `${e.clientY - offsetY}px`;
        movableDiv.style.width = `10vw`
        movableDiv.style.height = `10vw`
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

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

GID("noiseMap").onclick = function() {
  let singSimp = new SimplexNoise()
  let singSimp2 = new SimplexNoise();
  let singSimp3 = new SimplexNoise();
  let min = getRandomInt(100, 300)
  let max = getRandomInt(300, 765);
  function singNoise(nx, ny) {
      return singSimp.noise2D(nx, ny) / 2 + 0.5;
  }
  function singNoise2(nx, ny) {
    return singSimp2.noise2D(nx, ny) / 2 + 0.5;
  }
  function singNoise3(nx, ny) {
    return singSimp3.noise2D(nx, ny) / 2 + 0.5;
  }
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      let n = singNoise(j, i)
      let n2 = singNoise3(j, i)
      if (n < 0.3 || n2 < 0.3) {
        n = 15
      } else {
        n = n * 510
      }
      cell.elevation = n
    }
  }
  cleanupAll()
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

function updateEquatorValue(value) {
  settings.equator = parseInt(value)
  drawWorld()
}

function updateRiversValue(value) {
  settings.riversDistance = 30 - value;
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

GID("magnify").onclick = function() {
  if (settings.info === "on") {
    settings.info = "off"
  } else {
    settings.info = "on"
  }
}

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
    if (saveState === true) {
      let last = structuredClone(world.map)
      world.lastMaps.push(last)
      world.lastCounter = world.lastMaps.length - 1
    }
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
  
  if (document.getElementById('provinceDefinitionsCheckbox').checked) functionsToExecute.push(() => writeProvinceDefinitions());
  if (document.getElementById('landedTitlesCheckbox').checked) functionsToExecute.push(() => writeLandedTitles());
  if (document.getElementById('locatorsBuildingsCheckbox').checked) functionsToExecute.push(() => writeLocators("buildings"));
  if (document.getElementById('locatorsSpecialBuildingCheckbox').checked) functionsToExecute.push(() => writeLocators("special_building"));
  if (document.getElementById('locatorsCombatCheckbox').checked) functionsToExecute.push(() => writeLocators("combat"));
  if (document.getElementById('locatorsSiegeCheckbox').checked) functionsToExecute.push(() => writeLocators("siege"));
  if (document.getElementById('locatorsUnitStackCheckbox').checked) functionsToExecute.push(() => writeLocators("unit_stack"));
  if (document.getElementById('locatorsUnitStackPlayerOwnedCheckbox').checked) functionsToExecute.push(() => writeLocators("unit_stack_player_owned"));
  if (document.getElementById('locatorsUnitStackOtherOwnerCheckbox').checked) functionsToExecute.push(() => writeLocators("unit_stack_other_owner"));
  functionsToExecute.push(() => writeLocators("activities"));
  if (document.getElementById('culturesCheckbox').checked) functionsToExecute.push(() => outputCultures());
  if (document.getElementById('simpleHistoryCheckbox').checked) functionsToExecute.push(() => makeSimpleHistory());
  if (document.getElementById('charactersCheckbox').checked) functionsToExecute.push(() => outputCharacters());
  if (document.getElementById('historyCheckbox').checked) functionsToExecute.push(() => outputHistory());
  if (document.getElementById('titleLocalizationCheckbox').checked) functionsToExecute.push(() => writeTitleLocalization());
  if (document.getElementById('cultureLocalizationCheckbox').checked) functionsToExecute.push(() => writeCultureLocalization());
  if (document.getElementById('nameListsCheckbox').checked) functionsToExecute.push(() => outputNameLists());
  if (document.getElementById('ethnicitiesCheckbox').checked) functionsToExecute.push(() => outputEthnicities());
  if (document.getElementById('languagesCheckbox').checked) functionsToExecute.push(() => outputLanguages());
  if (document.getElementById('heritagesCheckbox').checked) functionsToExecute.push(() => outputHeritages());
  if (document.getElementById('provinceTerrainCheckbox').checked) functionsToExecute.push(() => writeProvinceTerrain());
  //if (document.getElementById('nameListLocCheckbox').checked) functionsToExecute.push(() => outputNameListLoc());
  if (document.getElementById('heritageLocalizationCheckbox').checked) functionsToExecute.push(() => outputHeritageLocalization());
  if (document.getElementById('languagesLocalizationCheckbox').checked) functionsToExecute.push(() => outputLanguagesLocalization());
  if (document.getElementById('dynastyLocalizationCheckbox').checked) functionsToExecute.push(() => writeDynastyLocalization());
  if (document.getElementById('bookmarkCheckbox').checked) functionsToExecute.push(() => writeBookmark());
  if (document.getElementById('bookmarkGroupCheckbox').checked) functionsToExecute.push(() => writeBookmarkGroup());
  if (document.getElementById('religionOutputCheckbox').checked) functionsToExecute.push(() => religionOutputter());
  if (document.getElementById('defaultMapCheckbox').checked) functionsToExecute.push(() => writeDefaultMap());
  if (document.getElementById('winterSeverityCheckbox').checked) {
    functionsToExecute.push(() => createWinterSeverity());
    functionsToExecute.push(() => writeWinterSeverity());
  }
  functionsToExecute.push(() => moveToImageDownloads())
  functionsToExecute.push(() => writeDescriptor());
  functionsToExecute.push(() => writeHybridCultures()) 
  functionsToExecute.push(() => writeHybridCulturesLocalization())
  functionsToExecute.push(() => writeGenerators());
  functionsToExecute.push(() => writeDefines());
  functionsToExecute.push(() => writeHeightmapHeightmap())
  
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

GID("create-provinces").onclick = function() {
  world.lastMaps = null
  GID("main-generator-div").style.display = "none";
  GID("sidebars").style.display = "none";
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


//Minimizing
document.getElementById('minimize-button').addEventListener('click', function() {
  var sidebar = document.getElementById('main-sidebar');
  if (sidebar.classList.contains('minimized')) {
    sidebar.style.height = "fit-content"
  }

  sidebar.classList.toggle('minimized');
  var bottomSidebar = document.getElementById("main-sidebar-bottom")
  this.textContent = sidebar.classList.contains('minimized') ? '+' : '-';
  bottomSidebar.style.display = sidebar.classList.contains('minimized') ? "none" : "block";
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
  const selectedValue = event.target.value;
  if (selectedValue === "true") {
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
  drawWorld()
});

let heightmapAdjuster = 0
function updateHeightmapAdjuster(num) {
  heightmapAdjuster = num;
}

let allImagesChecked = true;

GID("toggle-all-image-downloads").onclick = function() {
  toggleAllImages()
}

function toggleAllImages() {
  if (allImagesChecked) {
    let els = document.getElementsByClassName("imageDownloadCheckbox")
    for (let i = 0; i < els.length; i++) {
      els[i].checked = false;
    }
    allImagesChecked = false;
  } else {
    let els = document.getElementsByClassName("imageDownloadCheckbox")
    for (let i = 0; i < els.length; i++) {
      els[i].checked = true;
    }
    allImagesChecked = true;
  }
}