GID("startup").onclick = function() {
  startup()
}

GID("raiseElevation").onclick = function() {
  raiseElevation()
}

GID("lowerElevation").onclick = function() {
  lowerElevation()
}

GID("lowerMountains").onclick = function() {
  lowerMountains(10);
  drawWorld()
}

GID("raiseMountains").onclick = function() {
  raiseMountains(10)
  drawWorld()
}

GID("rainErosion").onclick = function() {
  rainErosion()
  drawWorld()
}

GID("cleanup").onclick = function() {
  cleanupAll()
  drawWorld()
}



GID("softenMountains").onclick = function() {
  softenMountains()
  spreadingCenterEmitsSmall()
  spread()
  drawWorld()
}

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

GID("downloadallbtn").onclick = function() {
  setMasks();
  downloadAllImages();
}

GID("add-downloads").onclick = function() {
  const functionsToExecute = [
    () => writeProvinceDefinitions(),
    () => writeLandedTitles(),
    () => writeLocators("buildings"),
    () => writeLocators("special_building"),
    () => writeLocators("combat"),
    () => writeLocators("siege"),
    () => writeLocators("unit_stack"),
    () => writeLocators("unit_stack_player_owned"),
    () => writeLocators("unit_stack_other_owner"),
    () => writeDefaultMap(),
    () => outputCultures(),
    () => makeSimpleHistory(),
    () => outputCharacters(),
    () => outputHistory(),
    () => writeTitleLocalization(),
    () => writeCultureLocalization(),
    () => outputNameLists(),
    () => outputEthnicities(),
    () => outputLanguages(),
    () => outputHeritages(),
    () => writeProvinceTerrain(),
    //() => outputNameListLoc(),
    () => outputHeritageLocalization(),
    () => outputLanguagesLocalization(),
    () => writeDynastyLocalization(),
    () => writeBookmark(),
    () => writeBookmarkGroup(),
    () => religionOutputter(),
    () => createWinterSeverity(),
    () => writeWinterSeverity(),
  ];
  const delayBetweenDownloads = 200;
  downloadWithDelay(0, functionsToExecute, delayBetweenDownloads);
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

GID("download-palettes").onclick = function() {
  downloadAllPalettes();
}

GID("download-clothing-palettes").onclick = function() {
  downloadAllTextures()
}

GID("create-provinces").onclick = function() {
  createProvinces()
}

GID("save-settings").onclick = function() {
  GID("settings-box").style.display = "none"
  GID("loading-screen").style.display = "block"
  startup()
}

GID("rerunRivers").onclick = function() {
  rerunRivers() 
}

GID("spread").onclick = function() {
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

GID("provinceMap").onclick = function() {
  drawProvinceMap()
}