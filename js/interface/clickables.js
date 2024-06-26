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
  raiseElevation()
  drawWorld()
}

GID("decrease-elevation-icon").onclick = function() {
  lowerElevation()
  drawWorld()
}

GID("lower-mountains-icon").onclick = function() {
  lowerMountains(10);
  drawWorld()
}

GID("raise-mountains-icon").onclick = function() {
  raiseMountains(10)
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
    let last = structuredClone(world.map)
    world.lastMaps.push(last)
    world.lastCounter = world.lastMaps.length - 1
    applyBrush(e, paintbrushSize, paintbrush, paintbrushHardness)
  }
}

GID("paint-increase-elevation").onclick = function() {
  paintbrush = "raiseLand"
}

GID("paint-decrease-elevation").onclick = function() {
  paintbrush = "dropLand"
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
    functionsToExecute.push(() => moveToImageDownloads())
  } 
  
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

GID("add-downloads").onclick = function() {
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
  if (document.getElementById('defaultMapCheckbox').checked) functionsToExecute.push(() => writeDefaultMap());
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
  if (document.getElementById('winterSeverityCreationCheckbox').checked) functionsToExecute.push(() => createWinterSeverity());
  if (document.getElementById('winterSeverityCheckbox').checked) functionsToExecute.push(() => writeWinterSeverity());
  
  const delayBetweenDownloads = 200;
  downloadWithDelay(0, functionsToExecute, delayBetweenDownloads);
}



GID("back-to-main-menu-editor").onclick = function() {
  GID("sidebar").style.display = "none"
  GID("main-sidebar").style.display = "block"
}

GID("back-to-main-menu-downloads").onclick = function() {
  GID("downloads-sidebar").style.display = "none"
  GID("main-sidebar").style.display = "block"
}

GID("download-palettes").onclick = function() {
  downloadAllPalettes();
}

GID("download-clothing-palettes").onclick = function() {
  downloadAllTextures()
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

GID("provinceMap").onclick = function() {
  drawProvinceMap()
}

GID("province-drawn-proceed").onclick = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = "rgb(0, 0, 0)"
  ctx.fill();
  GID("canvas").style.display = "none"
  GID("province-drawn-proceed").style.display = "none"
  GID("text-download-settings").style.display = "block"
}

/*
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
    colorBox.style.backgroundColor = selectedColor;
    tooltip.textContent = selectedTooltip;
    colorPicker.style.display = 'none';
  });
});

document.addEventListener('click', (e) => {
  if (!colorBox.contains(e.target) && !colorPicker.contains(e.target)) {
    colorPicker.style.display = 'none';
  }
});
*/



