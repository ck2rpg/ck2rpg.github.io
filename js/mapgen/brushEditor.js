let isDrawing = false;
let touchedPositions = [];
let affectedCells = new Set();
let redrawTimeout;

const DEBOUNCE_TIME = 0; // Adjust debounce time as needed
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Define erosion parameters
let EROSION_RATE = 0.1; // Rate of erosion
const DEPOSITION_RATE = 0.05; // Rate of sediment deposition
const MAX_ITERATIONS = 200; // Max iterations for erosion simulation

function applySquareBrush(pos, brushSize, brushType, brushHardness) {
  const cell = xy(pos.x, pos.y);
  const halfBrush = Math.floor(brushSize / 2);
  const startY = cell.y - halfBrush;
  const endY = cell.y + halfBrush;
  const startX = cell.x - halfBrush;
  const endX = cell.x + halfBrush;

  for (let i = startY; i < endY; i++) {
    for (let j = startX; j < endX; j++) {
      let nextCell = xy(j, i);
      if (nextCell) {
        affectedCells.add(`${j},${i}`);
        if (brushType === "terrain" && nextCell.elevation > limits.seaLevel.upper) {
          nextCell.terrain = paintbrushTerrain === "desert mountains" ? "desert_mountains" : paintbrushTerrain;
          nextCell.terrainMarked = true;
        }
        if (brushType === "dropLand") {
          nextCell.elevation -= brushHardness;
          if (nextCell.elevation < limits.seaLevel.lower) {
            nextCell.elevation = limits.seaLevel.lower + 1;
          }
        } else if (brushType === "raiseLand") {
          nextCell.elevation += parseInt(brushHardness);
        } else if (brushType === "jitterRaise") {
          let n = paintbrushLast + getRandomInt(-5, 5);
          nextCell.elevation = Math.max(-255, Math.min(510, nextCell.elevation + n));
        }
      }
    }
  }
}

function applyBrush(pos, brushSize, brushType, brushHardness) {
  if (brushType === "erosion") {
    applyErosionBrush(pos, brushSize);
    return;
  }  else if (paintbrush === "erosionOnly") {
    applyErosionBrush(pos, brushSize);
    return;
  }



  const cell = xy(pos.x, pos.y);
  const radius = brushSize / 2;
  const radiusSquared = radius * radius;

  const startY = Math.floor(cell.y - radius);
  const endY = Math.ceil(cell.y + radius);
  const startX = Math.floor(cell.x - radius);
  const endX = Math.ceil(cell.x + radius);
  let currHardness = parseInt(brushHardness);

  for (let i = startY; i <= endY; i++) {
    for (let j = startX; j <= endX; j++) {
      const dx = j - cell.x;
      const dy = i - cell.y;
      const dist = dx * dx + dy * dy;
      let change = dist / brushSize;
      let mod = 1 - change
    
      if (mod > 1) {
        mod = 1;
      }

      if (paintbrushFeather) {
        currHardness = Math.floor(brushHardness * mod);
        if (currHardness < 0) currHardness = 0;
      }

      if (dist <= radiusSquared) {
        let nextCell = xy(j, i);
        if (nextCell) {
          affectedCells.add(`${j},${i}`);
          if (brushType === "terrain" && nextCell.elevation > limits.seaLevel.upper) {
            nextCell.terrain = paintbrushTerrain === "desert mountains" ? "desert_mountains" : paintbrushTerrain;
            nextCell.terrainMarked = true;
          }
          if (brushType === "province-eraser") {
            nextCell.provinceOverride = undefined;
            nextCell.provinceOverrideR = undefined;
            nextCell.provinceOverrideG = undefined;
            nextCell.provinceOverrideB = undefined;
            nextCell.waterOverride = undefined;
            nextCell.waterOverrideR = undefined;
            nextCell.waterOverrideG = undefined;
            nextCell.waterOverrideB = undefined;

          } else if (brushType === "dropLand") {
            if (nextCell.elevation < lowerPaintbrushLimit) {
              //don't do anything if existing cell is less than brush limit
            } else {
              nextCell.elevation = paintbrushAbsolute ? currHardness : nextCell.elevation - currHardness;
              //push cell back up to brush limit if it goes below after change
              if (nextCell.elevation < lowerPaintbrushLimit) {
                nextCell.elevation = lowerPaintbrushLimit
              }
            }

          } else if (brushType === "raiseLand") {
            if (nextCell.elevation > paintbrushLimit) {
              
            } else {
              nextCell.elevation = paintbrushAbsolute ? parseInt(currHardness) : nextCell.elevation + parseInt(currHardness);
              if (nextCell.elevation > paintbrushLimit) {
                nextCell.elevation = paintbrushLimit
              }
            }
          } else if (brushType.includes("Override")) {
            applyOverrideBrushType(brushType, nextCell);
          }
        }
      }
    }
  }
}

// Function to simulate erosion
function applyErosionBrush(pos, brushSize) {
  EROSION_RATE = 0.1 * paintbrushHardness
  const cell = xy(pos.x, pos.y);
  const radius = brushSize / 2;
  const radiusSquared = radius * radius;

  const startY = Math.floor(cell.y - radius);
  const endY = Math.ceil(cell.y + radius);
  const startX = Math.floor(cell.x - radius);
  const endX = Math.ceil(cell.x + radius);

  for (let i = startY; i <= endY; i++) {
    for (let j = startX; j <= endX; j++) {
      const dx = j - cell.x;
      const dy = i - cell.y;
      const dist = dx * dx + dy * dy;

      if (dist <= radiusSquared) {
        let nextCell = xy(j, i);
        if (nextCell) {
          applyErosion(nextCell, EROSION_RATE, DEPOSITION_RATE);
          affectedCells.add(`${j},${i}`);
        }
      }
    }
  }
}

// Erosion simulation function
function applyErosion(cell, erosionRate, depositionRate) {
  let sediment = 0;

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let neighbors = getErosionNeighbors(cell.x, cell.y);
    let steepestSlope = null;
    let maxSlope = -Infinity;

    // Find the steepest downhill neighbor
    for (let neighbor of neighbors) {
      let slope = cell.elevation - neighbor.elevation;
      if (slope > maxSlope) {
        maxSlope = slope;
        steepestSlope = neighbor;
      }
    }

    if (steepestSlope && maxSlope > 0) {
      // Erode material from the current cell
      let erodedMaterial = Math.min(maxSlope * erosionRate, cell.elevation);
      cell.elevation -= erodedMaterial;
      sediment += erodedMaterial;

      // Move to the steepest downhill neighbor
      cell = steepestSlope;

      // Deposit sediment if erosion brush
      if (paintbrush === "erosion") {
        let depositedMaterial = sediment * depositionRate;
        cell.elevation += depositedMaterial;
        sediment -= depositedMaterial;
      } else {
        if (cell.elevation > limits.seaLevel.upper) {
          let depositedMaterial = sediment * depositionRate;
          cell.elevation += depositedMaterial;
          sediment -= depositedMaterial;
        }
      }
    } else {
      // No downhill neighbor or maximum slope is zero
      break;
    }
  }
}

// Function to get neighboring cells
function getErosionNeighbors(x, y) {
  const neighbors = [];
  const directions = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: -1 }
  ];

  for (let dir of directions) {
    let neighbor = xy(x + dir.dx, y + dir.dy);
    if (neighbor) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

const overrideProps = {
  "cultureOverride": "cultureOverride",
  "faithOverride": "faithOverride",
  "waterOverride": "waterOverride",
  "provinceOverride": "provinceOverride",
  "countyOverride": "countyOverride",
  "duchyOverride": "duchyOverride",
  "kingdomOverride": "kingdomOverride",
  "empireOverride": "empireOverride"
};

let workableLandCell;

function applyOverrideBrushType(brushType, nextCell) {
  //So you're applying this on front end before doing anything
  const overrideProp = overrideProps[brushType];

  if (overrideProp === "waterOverride") {
    if (nextCell.elevation <= limits.seaLevel.upper) {
      nextCell[overrideProp] = paintbrushTitle;
      nextCell[`${overrideProp}R`] = paintbrushTitleR;
      nextCell[`${overrideProp}G`] = paintbrushTitleG;
      nextCell[`${overrideProp}B`] = paintbrushTitleB;
    }
  } else if (overrideProp === "cultureOverride") {
    if (nextCell.elevation > limits.seaLevel.upper) {
      nextCell[overrideProp] = paintbrushTitle;
      nextCell[`${overrideProp}R`] = paintbrushTitleR;
      nextCell[`${overrideProp}G`] = paintbrushTitleG;
      nextCell[`${overrideProp}B`] = paintbrushTitleB;
    }
  } else if (overrideProp === "faithOverride") {
    if (nextCell.elevation > limits.seaLevel.upper) {
      nextCell[overrideProp] = paintbrushTitle;
      nextCell[`${overrideProp}R`] = paintbrushTitleR;
      nextCell[`${overrideProp}G`] = paintbrushTitleG;
      nextCell[`${overrideProp}B`] = paintbrushTitleB;
    }
  } else if (overrideProp === "empireOverride") {
    if (nextCell.elevation > limits.seaLevel.upper && !nextCell["kingdomOverride"]) {
      nextCell[overrideProp] = paintbrushTitle;
      nextCell[`${overrideProp}R`] = paintbrushTitleR;
      nextCell[`${overrideProp}G`] = paintbrushTitleG;
      nextCell[`${overrideProp}B`] = paintbrushTitleB;

      if (selectedEmpire.culture) {
        nextCell[`cultureOverride`] = paintbrushTitle;
        nextCell[`cultureOverrideR`] = paintbrushTitleR;
        nextCell[`cultureOverrideG`] = paintbrushTitleG;
        nextCell[`cultureOverrideB`] = paintbrushTitleB;
      }

      if (selectedEmpire.faith) {
        nextCell[`faithOverride`] = paintbrushTitle;
        nextCell[`faithOverrideR`] = paintbrushTitleR;
        nextCell[`faithOverrideG`] = paintbrushTitleG;
        nextCell[`faithOverrideB`] = paintbrushTitleB;
      }
    }
  } else if (overrideProp === "kingdomOverride") {
    // Restrict drawing to cells within the current empire
    if (nextCell.elevation > limits.seaLevel.upper && selectedKingdom.empire.brushColor === nextCell["empireOverride"]  && !nextCell["duchyOverride"]) {
      nextCell[overrideProp] = paintbrushTitle;
      nextCell[`${overrideProp}R`] = paintbrushTitleR;
      nextCell[`${overrideProp}G`] = paintbrushTitleG;
      nextCell[`${overrideProp}B`] = paintbrushTitleB;
      if (selectedKingdom.culture && settings.divergeCulturesAtKingdom) {
        nextCell[`cultureOverride`] = paintbrushTitle;
        nextCell[`cultureOverrideR`] = paintbrushTitleR;
        nextCell[`cultureOverrideG`] = paintbrushTitleG;
        nextCell[`cultureOverrideB`] = paintbrushTitleB;
      }
      if (settings.divergeFaithLevel === "kingdom") {
        nextCell[`faithOverride`] = paintbrushTitle;
        nextCell[`faithOverrideR`] = paintbrushTitleR;
        nextCell[`faithOverrideG`] = paintbrushTitleG;
        nextCell[`faithOverrideB`] = paintbrushTitleB;
      }
    }
  } else if (overrideProp === "duchyOverride") {
    // Restrict drawing to cells within the current kingdom
    if (nextCell.elevation > limits.seaLevel.upper && selectedDuchy.kingdom.brushColor === nextCell["kingdomOverride"] && !nextCell["countyOverride"]) {
      nextCell[overrideProp] = paintbrushTitle;
      nextCell[`${overrideProp}R`] = paintbrushTitleR;
      nextCell[`${overrideProp}G`] = paintbrushTitleG;
      nextCell[`${overrideProp}B`] = paintbrushTitleB;

      if (selectedDuchy.culture && settings.divergeCulturesAtDuchy) {
        nextCell[`cultureOverride`] = paintbrushTitle;
        nextCell[`cultureOverrideR`] = paintbrushTitleR;
        nextCell[`cultureOverrideG`] = paintbrushTitleG;
        nextCell[`cultureOverrideB`] = paintbrushTitleB;
      }

      if (settings.divergeFaithLevel === "duchy") {
        nextCell[`faithOverride`] = paintbrushTitle;
        nextCell[`faithOverrideR`] = paintbrushTitleR;
        nextCell[`faithOverrideG`] = paintbrushTitleG;
        nextCell[`faithOverrideB`] = paintbrushTitleB;
      }
    }
  } else if (overrideProp === "countyOverride") {
    // Restrict drawing to cells within the current duchy
    if (nextCell.elevation > limits.seaLevel.upper && selectedCounty.duchy.brushColor === nextCell["duchyOverride"] && !nextCell["provinceOverride"]) {
      nextCell[overrideProp] = paintbrushTitle;
      nextCell[`${overrideProp}R`] = paintbrushTitleR;
      nextCell[`${overrideProp}G`] = paintbrushTitleG;
      nextCell[`${overrideProp}B`] = paintbrushTitleB;

      if (selectedCounty.culture && settings.divergeCulturesAtCounty) {
        nextCell[`cultureOverride`] = paintbrushTitle;
        nextCell[`cultureOverrideR`] = paintbrushTitleR;
        nextCell[`cultureOverrideG`] = paintbrushTitleG;
        nextCell[`cultureOverrideB`] = paintbrushTitleB;
      }

      if (settings.divergeFaithLevel === "county") {
        nextCell[`faithOverride`] = paintbrushTitle;
        nextCell[`faithOverrideR`] = paintbrushTitleR;
        nextCell[`faithOverrideG`] = paintbrushTitleG;
        nextCell[`faithOverrideB`] = paintbrushTitleB;
      }
    }
  } else if (overrideProp === "provinceOverride") {
    // Restrict drawing to cells within the current county
    if (!nextCell.provinceOverride && nextCell.elevation > limits.seaLevel.upper && selectedProvince.county.brushColor === nextCell["countyOverride"]) {
      if (!selectedProvince.x) {
        setProvinceLocatorProperties(selectedProvince, nextCell)
      }
      /*if (!selectedProvince.seed) {
        nextCell.isSeedCell = true;
        selectedProvince.seed = nextCell
        selectedProvince.elevation = nextCell.elevation
        selectedProvince.hemisphere = setHemisphere(selectedProvince)
        selectedProvince.distanceFromEquator = calculateDistanceFromEquator(selectedProvince);
        selectedProvince.bigCell = nextCell;
      }
      */
      nextCell[overrideProp] = paintbrushTitle;
      nextCell[`${overrideProp}R`] = paintbrushTitleR;
      nextCell[`${overrideProp}G`] = paintbrushTitleG;
      nextCell[`${overrideProp}B`] = paintbrushTitleB;
      nextCell.province = selectedProvince
    }
  }
}

function onMouseDown(e) {
  isDrawing = true;
  touchedPositions = [];
  affectedCells.clear();
  recordPosition(e);
}

function onMouseMove(e) {
  if (isDrawing) {
    recordPosition(e);
    debounceDraw();
  }
}

function onMouseUp(e) {
  if (isDrawing) {
    isDrawing = false;
    applyBrushToTouchedPositions();
    redrawAffectedCells();
  }
}

function recordPosition(e) {
  const pos = getMousePos(canvas, e);
  touchedPositions.push(pos);
}

//THIS IS WHERE YOU ARE WORKING

let selectedEmpire;
let selectedKingdom;
let selectedDuchy;
let selectedCounty
let selectedProvince;

function createEmpire(brushColor) {
  let empire = {}
  empire.kingdoms = [];
  empire.maxKingdoms = 6;
  empire.ownProvinces = [];
  empire.provinces = []
  empire.brushColor = brushColor
  empire.isEmpire = true;

  if (settings.culturePer === "empire") {
    let culture = createCulture()
    culture.brushColor = brushColor
    pushCultureOverrideKey(brushColor, culture)
    empire.culture = culture
    empire.localizedTitle = makePlaceName(culture.language)
    if (world.cultures) {
      world.cultures.push(culture)
    } else {
        world.cultures = [];
        world.cultures.push(culture)
    }
  }

  if (settings.religionFamilyLevel === "empire") {
    let religion = createReligion(empire)
    if (settings.divergeFaithLevel === "empire") {
      let faith = createFaith(religion, empire)
      addFaithColorIfNotExists(brushColor, faith)
    }
  }

  world.empires.push(empire)
  return empire;
}

function createKingdom(brushColor) {
  let kingdom = {}
  kingdom.duchies = [];
  kingdom.maxDuchies = 10;
  kingdom.ownProvinces = [];
  kingdom.provinces = []
  kingdom.brushColor = brushColor
  kingdom.empire = selectedEmpire 
  kingdom.isKingdom = true;

  if (kingdom.empire.culture) {
    if (settings.divergeCulturesAtKingdom) {
      kingdom.culture = createCulture(kingdom.empire.culture)
      kingdom.culture.brushColor = brushColor
      pushCultureOverrideKey(brushColor, kingdom.culture)
      if (world.cultures) {
          world.cultures.push(kingdom.culture)
      } else {
          world.cultures = [];
          world.cultures.push(kingdom.culture)
      }
    } else {
        kingdom.culture = kingdom.empire.culture;
    }

    kingdom.localizedTitle = makePlaceName(kingdom.culture.language)
  } else if (settings.culturePer === "kingdom") {
    let culture = createCulture()
    kingdom.culture = culture;
    kingdom.culture.brushColor = brushColor
    pushCultureOverrideKey(brushColor, culture)
    if (world.cultures) {
        world.cultures.push(kingdom.culture)
    } else {
        world.cultures = [];
        world.cultures.push(kingdom.culture)
    }
    if (kingdom.empire.kingdoms.length === 1) { // go back and set empire to first kingdom's language
      kingdom.empire.localizedTitle = makePlaceName(culture.language)
    }
    kingdom.localizedTitle = makePlaceName(kingdom.culture.language)
  }
  let religion
  if (settings.religionFamilyLevel === "kingdom") {
    religion = createReligion(kingdom)
  }
  if (settings.divergeFaithLevel === "kingdom") {
    if (settings.religionFamilyLevel === "empire") {
      religion = kingdom.empire.religion
    } else if (settings.religionFamilyLevel === "kingdom") {
      religion = kingdom.religion
    }
    let faith = createFaith(religion, kingdom)
    addFaithColorIfNotExists(brushColor, faith)
  }
  world.kingdoms.push(kingdom)
  return kingdom;
}

function createDuchy(brushColor) {
  let duchy = {};
  duchy.counties = [];
  duchy.maxCounties = 10;
  duchy.ownProvinces = [];
  duchy.provinces = []
  duchy.kingdom = selectedKingdom;
  duchy.brushColor = brushColor
  duchy.isDuchy = true;

  if (duchy.kingdom.culture) {
    if (settings.divergeCulturesAtDuchy) {
      duchy.culture = createCulture(duchy.kingdom.culture)
      duchy.culture.brushColor = brushColor
      pushCultureOverrideKey(brushColor, duchy.culture)
      if (world.cultures) {
          world.cultures.push(duchy.culture)
      } else {
          world.cultures = [];
          world.cultures.push(duchy.culture)
      }
    } else {
        duchy.culture = duchy.kingdom.culture;
    }
    duchy.localizedTitle = makePlaceName(duchy.culture.language)
  } else if (settings.culturePer === "duchy") {
    let culture = createCulture()
    duchy.culture = culture;
    duchy.culture.brushColor = brushColor
    pushCultureOverrideKey(brushColor, culture)
    if (world.cultures) {
        world.cultures.push(duchy.culture)
    } else {
        world.cultures = [];
        world.cultures.push(duchy.culture)
    }
    if (duchy.kingdom.duchies.length === 1) { // go back and set empire to first kingdom's language
      duchy.kingdom.empire.localizedTitle = makePlaceName(culture.language)
      duchy.kingdom.localizedTitle = makePlaceName(culture.language)
    }
    if (settings.religionFamilyLevel === "duchy") {
      let religion = createReligion(duchy)
    }
    duchy.localizedTitle = makePlaceName(duchy.culture.language)
  }
  let religion
  if (settings.religionFamilyLevel === "duchy") {
    religion = createReligion(duchy)
  }
  if (settings.divergeFaithLevel === "duchy") {
    if (settings.religionFamilyLevel === "empire") {
      religion = duchy.kingdom.empire.religion
    } else if (settings.religionFamilyLevel === "kingdom") {
      religion = duchy.kingdom.religion
    } else if (settings.religionFamilyLevel === "duchy") {
      religion = duchy.religion
    }
    let faith = createFaith(religion, duchy)
    addFaithColorIfNotExists(brushColor, faith)
  }
  world.duchies.push(duchy)
  return duchy;
}

function pushCultureOverrideKey(c, culture) {
  let cultureColor = getColorObjectFromString(c);
  cultureColor.r = parseInt(cultureColor.r);
  cultureColor.g = parseInt(cultureColor.g);
  cultureColor.b = parseInt(cultureColor.b);

  cultureColor.culture = culture;

  const exists = cultureOverrideKeys.some(color => areColorsEqual(color, cultureColor));

  if (!exists) { 
    cultureOverrideKeys.push(cultureColor);
  }
}

function createCounty(brushColor) {
  let county = {};
  county.provinces = [];
  county.maxProvinces = 5;
  county.ownProvinces = [];
  county.provinces = []
  county.duchy = selectedDuchy;
  county.brushColor = brushColor
  county.isCounty = true;

  if (county.duchy.culture) {
    if (settings.divergeCulturesAtCounty) {
      county.culture = createCulture(county.kingdom.culture)
      county.culture.brushColor = brushColor
      pushCultureOverrideKey(brushColor, county.culture)
      if (world.cultures) {
          world.cultures.push(county.culture)
      } else {
          world.cultures = [];
          world.cultures.push(county.culture)
      }
    } else {
        county.culture = county.duchy.culture;
    }
    county.localizedTitle = makePlaceName(county.culture.language)
  } else if (settings.culturePer === "county") {
    let culture = createCulture()
    county.culture = culture;
    county.culture.brushColor = brushColor
    pushCultureOverrideKey(brushColor, culture)
    if (world.cultures) {
        world.cultures.push(county.culture)
    } else {
        world.cultures = [];
        world.cultures.push(county.culture)
    }
    if (county.duchy.counties.length === 1) { // go back and set empire to first kingdom's language
      county.duchy.kingdom.empire.localizedTitle = makePlaceName(culture.language)
      county.duchy.kingdom.localizedTitle = makePlaceName(culture.language)
      county.duchy.localizedTitle = makePlaceName(culture.language)
    }
    county.localizedTitle = makePlaceName(county.culture.language)
  }
  let religion
  if (settings.religionFamilyLevel === "county") {
    religion = createReligion(county)
  }
  if (settings.divergeFaithLevel === "county") {
    if (settings.religionFamilyLevel === "empire") {
      religion = county.duchy.kingdom.empire.religion
    } else if (settings.religionFamilyLevel === "kingdom") {
      religion = county.duchy.kingdom.religion
    } else if (settings.religionFamilyLevel === "duchy") {
      religion = county.duchy.religion
    } else if (settings.religionFamilyLevel === "county") {
      religion = county.religion
    }
    let faith = createFaith(religion, county)
    addFaithColorIfNotExists(brushColor, faith)
  }
  world.counties.push(county)
  return county;
}

function createDummyProvince(brushColor) {
  let province = {};
  province.isProvince = true;
  province.seed = undefined;
  province.farthestNorth = undefined;
  province.farthestSouth = undefined;
  province.farthestWest = undefined;
  province.farthestEast = undefined;
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
 // province.terrainCount[`${cell.bigCell.terrain}`] += 1
  province.adjacentToWater = []
  province.rivers = []
  province.mountains = []
  province.population = 0
  //province.elevation = cell.elevation
  provinceCount += 1;
  province.geographicalRegions = []
  province.color = brushColor
  let o = getColorObjectFromString(brushColor);
  province.colorR = o.r
  province.colorG = o.g
  province.colorB = o.b
  provinceKeys[`${o.r}, ${o.g}, ${o.b}`] = province
  province.land = true;
  province.titleName = `R${province.colorR}G${province.colorG}B${province.colorB}`
  province.localizedTitle = makePlaceName(selectedCounty.culture.language)
  province.adjacencies = []
  //province.x = x; 
  //province.y = y;
  //province.hemisphere = setHemisphere(province)
  //province.distanceFromEquator = calculateDistanceFromEquator(province)
  //province.bigCell = cell.bigCell
  province.cells = 0
  //
  province.nameLoc = "Unnamed Province";
  province.county = selectedCounty;
  selectedEmpire.ownProvinces.push(province);
  selectedKingdom.ownProvinces.push(province);
  selectedDuchy.ownProvinces.push(province)
  selectedCounty.ownProvinces.push(province)
  selectedEmpire.provinces.push(province);
  selectedKingdom.provinces.push(province);
  selectedDuchy.provinces.push(province)
  selectedCounty.provinces.push(province)
  province.brushColor = brushColor
  world.provinces.push(province)
  province.nonDefId = world.provinces.length
  return province;
}

function setProvinceLocatorProperties(province, cell) {
  province.x = cell.x
  province.y = cell.y
  province.hemisphere = setHemisphere(province)
  province.bigCell = cell.bigCell
}


function applyBrushToTouchedPositions() {

  if (world.drawingType === "smallEmpire") {
    let brushColor = paintbrushTitle
    let exists = false;
    for (let i = 0; i < world.empires.length; i++) {
      let empire = world.empires[i]
      if (empire.brushColor === brushColor) {
        selectedEmpire = empire;
        exists = true;
      }
    }
    if (!exists) {
      let o = createEmpire(brushColor)
      selectedEmpire = o
    }
  } else if (world.drawingType === "smallKingdom") {
    let brushColor = paintbrushTitle
    let exists = false;
    for (let i = 0; i < selectedEmpire.kingdoms.length; i++) {
      let kingdom = selectedEmpire.kingdoms[i]
      if (kingdom.brushColor === brushColor) {
        selectedKingdom = kingdom;
        exists = true
      }
    }
    if (!exists) {
      let k = createKingdom(brushColor)
      selectedEmpire.kingdoms.push(k);
      selectedKingdom = k
    }
  } else if (world.drawingType === "smallDuchy") {
    let brushColor = paintbrushTitle
    let exists = false;
    for (let i = 0; i < selectedKingdom.duchies.length; i++) {
      let duchy = selectedKingdom.duchies[i]
      if (duchy.brushColor === brushColor) {
        selectedDuchy = duchy;
        exists = true
      }
    }
    if (!exists) {
      let d = createDuchy(brushColor)
      selectedKingdom.duchies.push(d);
      selectedDuchy = d
    }
  } else if (world.drawingType === "smallCounty") {
    let brushColor = paintbrushTitle
    let exists = false;
    for (let i = 0; i < selectedDuchy.counties.length; i++) {
      let county = selectedDuchy.counties[i]
      if (county.brushColor === brushColor) {
        selectedCounty = county;
        exists = true
      }
    }
    if (!exists) {
      let c = createCounty(brushColor)
      selectedDuchy.counties.push(c);
      selectedCounty = c
    }
  } else if (world.drawingType === "smallProvince") {
    let brushColor = paintbrushTitle
    let exists = false;
    for (let i = 0; i < selectedCounty.provinces.length; i++) {
      let province = selectedCounty.provinces[i]
      if (province.brushColor === brushColor) {
        selectedProvince = province;
        exists = true
      }
    }
    if (!exists) {
      let p = createDummyProvince(brushColor)
      //selectedCounty.provinces.push(p);
      selectedProvince = p
    }
  }

  touchedPositions.forEach(pos => {
    if (paintbrushShape === "square") {
      applySquareBrush(pos, paintbrushSize, paintbrush, paintbrushHardness);
    } else if (paintbrush === "erosion") {
      applyErosionBrush(pos, paintbrushSize);
    } else if (paintbrush === "erosionOnly") {
      applyErosionBrush(pos, paintbrushSize);
    } else {
      applyBrush(pos, paintbrushSize, paintbrush, paintbrushHardness);
    }
  });
}

function debounceDraw() {
  if (redrawTimeout) clearTimeout(redrawTimeout);
  redrawTimeout = setTimeout(() => {
    applyBrushToTouchedPositions();
    redrawAffectedCells();
    touchedPositions = [];
    affectedCells.clear();
  }, DEBOUNCE_TIME);
}

let faithOverrideKeys = [];


// Helper function to check if faith exists in the list of override colors and add it if not
function addFaithColorIfNotExists(faithColor, faith) {
  // Check if the faith color already exists in the list
  if (faithColor.r) {

  } else {
    faithColor = getColorObjectFromString(faithColor)
  }
  const exists = faithOverrideKeys.some(color => areColorsEqual(color, faithColor));

  // If the faith does not exist, add it to the list
  if (!exists) {
    if (faith) {
      faithColor.faith = faith
    } else {
      let religion = createReligion()
      faithColor.faith = createFaith(religion)
    }
    faithColor.r = parseInt(faithColor.r);
    faithColor.g = parseInt(faithColor.g);
    faithColor.b = parseInt(faithColor.b)
    faithOverrideKeys.push(faithColor);
  }
}

function updateFaithColorColumn() {
  const editorDiv = document.getElementById('main-generator-editor');
  
  // Clear the existing content
  editorDiv.innerHTML = '';
  editorDiv.innerHTML += "<h1 class='right-menu-header'>Faiths</h1>"

  // Loop through the faithOverrideKeys and create a div for each faith (name and color)
  faithOverrideKeys.forEach(faith => {
    const faithDiv = document.createElement('div');
    faithDiv.style.display = 'flex';
    faithDiv.style.alignItems = 'center';
    faithDiv.style.marginBottom = '5px'; // Add some space between faith rows

    // Create the color swatch (small colored square)
    const colorSwatch = document.createElement('div');
    colorSwatch.style.backgroundColor = `rgb(${faith.r}, ${faith.g}, ${faith.b})`;
    colorSwatch.style.width = '20px';  // Adjust width to make it a small square
    colorSwatch.style.height = '20px'; // Adjust height to make it a small square
    colorSwatch.style.marginRight = '10px'; // Space between the swatch and the faith name

    colorSwatch.onclick = () => updatePaintbrushTitle(faith)

    const faithName = document.createElement('span');
    faithName.textContent = faith.faith.nameLoc
    faithName.onclick = () => showFaithEditor(faith.faith);

    // Append the color swatch and faith name
    faithDiv.appendChild(colorSwatch);
    faithDiv.appendChild(faithName)
    editorDiv.appendChild(faithDiv);
  });
}

function areColorsEqual(color1, color2) {
  return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
}

let cultureOverrideKeys = [];

// Helper function to check if culture exists in the list of override colors and add it if not
function addCultureIfNotExists(cultureColor, parent) {
  const exists = cultureOverrideKeys.some(color => areColorsEqual(color, cultureColor));

  if (!exists) {
    let o = parent ? createCulture(parent) : createCulture();
    cultureColor.culture = o;

    if (!world.cultures) {
      world.cultures = [];
    }
    world.cultures.push(o);

    o.brushColor = `rgb(${cultureColor.r}, ${cultureColor.g}, ${cultureColor.b})`;
    cultureOverrideKeys.push(cultureColor);
  }
}

// Helper function to create a text area for comma-separated names
function createNamesTextarea(names, id) {
  const container = document.createElement('div');
  const textArea = document.createElement('textarea');
  textArea.id = id;
  textArea.value = names.join(', ');
  textArea.style.width = '100%'; // Adjust the width as needed
  textArea.style.height = '400px'; // Adjust the height as needed
  container.appendChild(textArea);
  return container;
}


// Function to add a new tradition
function addTradition(culture) {
  if (culture.traditions.length < 5) {
      const newTradition = { n: 'tradition_winter_warriors' }; // default tradition
      culture.traditions.push(newTradition);
      showCultureEditor(culture);
  } else {
      alert('Maximum 5 traditions allowed.');
  }
}

// Function to remove a tradition
function removeTradition(index, culture) {
  culture.traditions.splice(index, 1);
  showCultureEditor(culture);
}

function updateCultureValues(culture) {

  // Get the culture name input value
  const nameInput = document.getElementById('culture-name-input');
  culture.name = nameInput.value;  // Update the culture's name with the new value

  // Get values by their unique IDs
  const clothingGfxSelect = document.getElementById('clothing_gfx_select');
  const buildingGfxSelect = document.getElementById('buildings_gfx_select');
  const unitGfxSelect = document.getElementById('unit_gfx_select');
  const coaGfxSelect = document.getElementById('coa_gfx_select');

  culture.clothing_gfx = clothingGfxSelect.value;
  culture.buildings_gfx = buildingGfxSelect.value;
  culture.unit_gfx = unitGfxSelect.value;
  culture.coa_gfx = coaGfxSelect.value;

  // Ethos and Martial Custom
  const ethosSelect = document.getElementById('ethos_select');
  const martialCustomSelect = document.getElementById('martial_custom_select');
  culture.ethos = ethosSelect.value;
  culture.martial_custom = martialCustomSelect.value;

  // Male and female names (comma-separated input)
  const maleNamesTextarea = document.getElementById('male_names_textarea');
  const femaleNamesTextarea = document.getElementById('female_names_textarea');

  // Parse the comma-separated names and trim any extra spaces
  culture.maleNames = maleNamesTextarea.value.split(',').map(name => name.trim());
  culture.femaleNames = femaleNamesTextarea.value.split(',').map(name => name.trim());

  // Update traditions
  culture.traditions = [];
  let index = 0;
  while (true) {
    const traditionSelect = document.getElementById(`tradition_select_${index}`);
    if (!traditionSelect) {
      break; // Exit loop if no more tradition select elements
    }
    if (traditionSelect.value) {
      culture.traditions.push({ n: traditionSelect.value });
    }
    index++;
  }

  // Update genes

  const geneInputs = document.querySelectorAll('.gene-input');
  geneInputs.forEach(input => {
    const geneName = input.dataset.gene;
    const valueType = input.dataset.type;
    if (valueType === 'low') {
      // Handle low value
      culture.genes[geneName].low = parseFloat(input.value);
    } else if (valueType === 'high') {
      // Handle high value
      culture.genes[geneName].high = parseFloat(input.value);
    } else {
      culture.genes[geneName] = input.value
    }
  });
  updateCultureColorColumn()
}


function removeProhibitionsForSounds(language, sounds) {
  language.prohibitions = language.prohibitions.filter(prohibition => {
      // Keep prohibitions that do not match any of the sounds from the edited text areas
      return !sounds.some(sound => prohibition.sound === sound);
  });
}

// Function to handle the click on a culture name or swatch
function showCultureEditor(culture) {
  settings.currentCulture = culture
  const editorDiv = document.getElementById('culture-editor-content');

  // Clear the existing content
  editorDiv.innerHTML = '';

  // Add Name field (this will be the first item in the grid)
  const nameSection = document.createElement('div');
  nameSection.style.marginBottom = '20px';
  nameSection.innerHTML = `<h3>Name</h3>`;
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = culture.name;
  nameInput.id = 'culture-name-input';  // We will use this ID later to access the value
  nameSection.appendChild(nameInput);
  editorDiv.appendChild(nameSection);

  // Dropdown for Buildings GFX
  editorDiv.appendChild(createDropdown('Buildings GFX', building_gfx_list, culture.buildings_gfx, 'buildings_gfx', 'buildings_gfx_select'));

  // Dropdown for Clothing GFX
  editorDiv.appendChild(createDropdown('Clothing GFX', clothing_gfx_list, culture.clothing_gfx, 'clothing_gfx', 'clothing_gfx_select'));

  // Dropdown for Ethos
  editorDiv.appendChild(createDropdown('Ethos', cultureEthosList, culture.ethos, 'ethos', 'ethos_select'));

  // Dropdown for CoA GFX
  editorDiv.appendChild(createDropdown('CoA GFX', coa_gfx_list, culture.coa_gfx, 'coa_gfx', 'coa_gfx_select'));

  // Dropdown for Martial Custom
  editorDiv.appendChild(createDropdown('Martial Custom', martialCustomRuleList, culture.martial_custom, 'martial_custom', 'martial_custom_select'));

  // Dropdown for Unit GFX
  editorDiv.appendChild(createDropdown('Unit GFX', unit_gfx_list, culture.unit_gfx, 'unit_gfx', 'unit_gfx_select'));


  // Section for traditions
  const traditionsSection = document.createElement('div');
  traditionsSection.style.marginTop = '20px';
  traditionsSection.innerHTML = `<h3>Traditions</h3>`;
  editorDiv.appendChild(traditionsSection);

  culture.traditions.forEach((tradition, index) => {
    const traditionDiv = document.createElement('div');
    traditionDiv.style.marginBottom = '10px';

    const traditionLabel = document.createElement('label');
    traditionLabel.textContent = `Tradition ${index + 1}: `;
    //traditionDiv.appendChild(traditionLabel);

    const selectElement = createDropdown(`Tradition ${index + 1}`, traditionsList.map(t => t.n), tradition.n, `traditions.${index}.n`, `tradition_select_${index}`);
    traditionDiv.appendChild(selectElement);

    // Add a button to remove the tradition
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => removeTradition(index, culture);
    traditionDiv.appendChild(removeButton);

    traditionsSection.appendChild(traditionDiv);
  });

  // Button to add a new tradition
  const addTraditionButton = document.createElement('button');
  addTraditionButton.textContent = 'Add Tradition';
  addTraditionButton.onclick = () => addTradition(culture);
  traditionsSection.appendChild(addTraditionButton);

  // Section for genes
  const genesSection = document.createElement('div'); 
  genesSection.style.marginTop = '20px';
  genesSection.innerHTML = `<h3>Ethnicities (Genes)</h3>`;
  editorDiv.appendChild(genesSection);
  console.log(culture)
  Object.keys(culture.genes).forEach(geneName => {
    const geneValue = culture.genes[geneName];
  
    // Create a container for each gene
    const geneDiv = document.createElement('div');
    geneDiv.style.marginBottom = '10px';
  
    // Label for gene name
    const geneLabel = document.createElement('label');
    geneLabel.textContent = `${geneName}: `;
    geneLabel.style.fontWeight = 'bold';
    geneDiv.appendChild(geneLabel);
  
    // Handle string or range values for genes
    if (typeof geneValue === 'string') {
      // If the gene has a string value (an option), create a dropdown
      console.log(geneValue)
      let gene = geneticProperties.find(g => g.n === geneName)
      let geneObject
      if (gene) {
        geneObject = gene.o;
      }

      if (geneObject) {
        const selectElement = createDropdown(geneName, geneticProperties.find(g => g.n === geneName).o, geneValue, `genes.${geneName}`, `gene_${geneName}`, true);
        geneDiv.appendChild(selectElement);
      } else {
        console.log(`${geneName} is a problem.`)
      }

    } else if (typeof geneValue === 'object' && geneValue.low !== undefined && geneValue.high !== undefined) {
      // If the gene has a range (low and high values), create inputs for the range
  
      const lowInput = document.createElement('input');
      lowInput.type = 'number';
      lowInput.step = '0.01';
      lowInput.min = '0';
      lowInput.max = '1';
      lowInput.value = geneValue.low;
      lowInput.dataset.gene = geneName;
      lowInput.dataset.type = 'low'; // Identifier for low value
      lowInput.classList.add('gene-input'); // Add the .gene-input class
  
      const highInput = document.createElement('input');
      highInput.type = 'number';
      highInput.step = '0.01';
      highInput.min = '0';
      highInput.max = '1';
      highInput.value = geneValue.high;
      highInput.dataset.gene = geneName;
      highInput.dataset.type = 'high'; // Identifier for high value
      highInput.classList.add('gene-input'); // Add the .gene-input class
  
      // Add inputs to geneDiv
      geneDiv.appendChild(document.createTextNode('Low: '));
      geneDiv.appendChild(lowInput);
      geneDiv.appendChild(document.createTextNode(' High: '));
      geneDiv.appendChild(highInput);
    }
  
    genesSection.appendChild(geneDiv);
  });

  // Section for male names
  const maleNamesSection = document.createElement('div');
  maleNamesSection.style.marginTop = '20px';
  maleNamesSection.innerHTML = `<h3>Male Names</h3>`;
  editorDiv.appendChild(maleNamesSection);
  // Add Regenerate Male Names button
  const regenerateMaleNamesButton = document.createElement('button');
  regenerateMaleNamesButton.textContent = 'Regenerate Male Names';
  regenerateMaleNamesButton.onclick = function() {
    seedMaleNames(culture);  // Regenerate the names for the culture
    showCultureEditor(culture)
  };
  maleNamesSection.appendChild(regenerateMaleNamesButton);
  maleNamesSection.appendChild(createNamesTextarea(culture.maleNames, 'male_names_textarea'));

  // Section for female names
  const femaleNamesSection = document.createElement('div');
  femaleNamesSection.style.marginTop = '20px';
  femaleNamesSection.innerHTML = `<h3>Female Names</h3>`;
  editorDiv.appendChild(femaleNamesSection);

  // Add Regenerate Female Names button
  const regenerateFemaleNamesButton = document.createElement('button');
  regenerateFemaleNamesButton.textContent = 'Regenerate Female Names';
  regenerateFemaleNamesButton.onclick = function() {
    seedFemaleNames(culture);  // Regenerate the names for the culture
    showCultureEditor(culture)
  };
  femaleNamesSection.appendChild(regenerateFemaleNamesButton);
  femaleNamesSection.appendChild(createNamesTextarea(culture.femaleNames, 'female_names_textarea'));




  // Add the new Language Section
  const languageSection = document.createElement('div');
  languageSection.style.marginTop = '20px';
  languageSection.innerHTML = `<h3>Language</h3>`;

  // Ensure language object exists in culture
  if (!culture.language) {
    culture.language = {
      initialSimpleConsonants: [],
      initialClusterConsonants: [],
      medialSimpleConsonants: [],
      medialClusterConsonants: [],
      finalSimpleConsonants: [],
      finalClusterConsonants: [],
      initialSimpleVowels: [],
      initialClusterVowels: [],
      medialSimpleVowels: [],
      medialClusterVowels: [],
      finalSimpleVowels: [],
      finalClusterVowels: []
    };
  }

  // Editable text areas for consonants and vowels
  const initialSimpleConsonantsTextArea = createTextArea('initial_simple_consonants_textarea', culture.language.initialSimpleConsonants, (newValue) => {
    culture.language.initialSimpleConsonants = newValue.split(',').map(val => val.trim());
  });

  const initialClusterConsonantsTextArea = createTextArea('initial_cluster_consonants_textarea', culture.language.initialClusterConsonants, (newValue) => {
    culture.language.initialClusterConsonants = newValue.split(',').map(val => val.trim());
  });

  const medialSimpleConsonantsTextArea = createTextArea('medial_simple_consonants_textarea', culture.language.medialSimpleConsonants, (newValue) => {
    culture.language.medialSimpleConsonants = newValue.split(',').map(val => val.trim());
  });

  const medialClusterConsonantsTextArea = createTextArea('medial_cluster_consonants_textarea', culture.language.medialClusterConsonants, (newValue) => {
    culture.language.medialClusterConsonants = newValue.split(',').map(val => val.trim());
  });

  const finalSimpleConsonantsTextArea = createTextArea('final_simple_consonants_textarea', culture.language.finalSimpleConsonants, (newValue) => {
    culture.language.finalSimpleConsonants = newValue.split(',').map(val => val.trim());
  });

  const finalClusterConsonantsTextArea = createTextArea('final_cluster_consonants_textarea', culture.language.finalClusterConsonants, (newValue) => {
    culture.language.finalClusterConsonants = newValue.split(',').map(val => val.trim());
  });

  const initialSimpleVowelsTextArea = createTextArea('initial_simple_vowels_textarea', culture.language.initialSimpleVowels, (newValue) => {
    culture.language.initialSimpleVowels = newValue.split(',').map(val => val.trim());
  });

  const initialClusterVowelsTextArea = createTextArea('initial_cluster_vowels_textarea', culture.language.initialClusterVowels, (newValue) => {
    culture.language.initialClusterVowels = newValue.split(',').map(val => val.trim());
  });

  const medialSimpleVowelsTextArea = createTextArea('medial_simple_vowels_textarea', culture.language.medialSimpleVowels, (newValue) => {
    culture.language.medialSimpleVowels = newValue.split(',').map(val => val.trim());
  });

  const medialClusterVowelsTextArea = createTextArea('medial_cluster_vowels_textarea', culture.language.medialClusterVowels, (newValue) => {
    culture.language.medialClusterVowels = newValue.split(',').map(val => val.trim());
  });

  const finalSimpleVowelsTextArea = createTextArea('final_simple_vowels_textarea', culture.language.finalSimpleVowels, (newValue) => {
    culture.language.finalSimpleVowels = newValue.split(',').map(val => val.trim());
  });

  const finalClusterVowelsTextArea = createTextArea('final_cluster_vowels_textarea', culture.language.finalClusterVowels, (newValue) => {
    culture.language.finalClusterVowels = newValue.split(',').map(val => val.trim());
  });

  // Button to generate and update the language in real-time
  const generateButton = document.createElement('button');
  generateButton.textContent = 'Generate Language';
  generateButton.onclick = function () {
    const newLang = makeLanguage(consSet, vowelSet);  // Generate new language using your language generation code

    // Also update the `culture.language` object with the new generated language
    culture.language = newLang;
    seedNames(culture);
    showCultureEditor(culture)
  };

  const applySoundChanges = document.createElement('button')
  applySoundChanges.textContent = 'Apply Sound Changes';
  applySoundChanges.onclick = function() {
      const allSounds = [
        ...culture.language.initialSimpleConsonants,
        ...culture.language.initialClusterConsonants,
        ...culture.language.medialSimpleConsonants,
        ...culture.language.medialClusterConsonants,
        ...culture.language.finalSimpleConsonants,
        ...culture.language.finalClusterConsonants,
        ...culture.language.initialSimpleVowels,
        ...culture.language.initialClusterVowels,
        ...culture.language.medialSimpleVowels,
        ...culture.language.medialClusterVowels,
        ...culture.language.finalSimpleVowels,
        ...culture.language.finalClusterVowels
    ];
      removeProhibitionsForSounds(culture.language, allSounds)
  }

  languageSection.appendChild(generateButton);
  languageSection.appendChild(applySoundChanges)
  // Append the editable text areas for consonants and vowels
  languageSection.appendChild(createLabel('Initial Simple Consonants', initialSimpleConsonantsTextArea));
  languageSection.appendChild(createLabel('Initial Cluster Consonants', initialClusterConsonantsTextArea));
  languageSection.appendChild(createLabel('Medial Simple Consonants', medialSimpleConsonantsTextArea));
  languageSection.appendChild(createLabel('Medial Cluster Consonants', medialClusterConsonantsTextArea));
  languageSection.appendChild(createLabel('Final Simple Consonants', finalSimpleConsonantsTextArea));
  languageSection.appendChild(createLabel('Final Cluster Consonants', finalClusterConsonantsTextArea));

  languageSection.appendChild(createLabel('Initial Simple Vowels', initialSimpleVowelsTextArea));
  languageSection.appendChild(createLabel('Initial Cluster Vowels', initialClusterVowelsTextArea));
  languageSection.appendChild(createLabel('Medial Simple Vowels', medialSimpleVowelsTextArea));
  languageSection.appendChild(createLabel('Medial Cluster Vowels', medialClusterVowelsTextArea));
  languageSection.appendChild(createLabel('Final Simple Vowels', finalSimpleVowelsTextArea));
  languageSection.appendChild(createLabel('Final Cluster Vowels', finalClusterVowelsTextArea));

  editorDiv.appendChild(languageSection);


  editorDiv.appendChild(languageSection);
  



  GID("culture-editor").style.display = "block"
  GID("culture-editor-content").style.display = "grid"
}

// Helper function to create dropdowns

function createDropdown(label, options, selectedOption, dataAttribute, id, isGene) {
  const container = document.createElement('div');
  const dropdownLabel = document.createElement('label');
  dropdownLabel.textContent = `${label}: `;
  container.appendChild(dropdownLabel);

  const selectElement = document.createElement('select');
  selectElement.setAttribute('data-culture', dataAttribute);
  selectElement.id = id; // Set the unique ID
  if (isGene) {
    selectElement.classList.add('gene-input'); // Add the .gene-input class
    selectElement.dataset.gene = label; // Ensure it has the correct gene dataset
  }
  options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.text = option;
      if (option === selectedOption) {
          optionElement.selected = true;
      }
      selectElement.appendChild(optionElement);
  });

  container.appendChild(selectElement);
  return container;
}



// Helper function to create text areas
function createTextArea(id, value, onChangeCallback) {
  const textArea = document.createElement('textarea');
  textArea.id = id;
  textArea.value = value.join(', ');
  textArea.style.width = "100%"
  textArea.oninput = (e) => onChangeCallback(e.target.value);
  return textArea;
}

// Helper function to create labeled elements
function createLabel(labelText, element) {
  const label = document.createElement('label');
  label.textContent = labelText;
  label.style.display = 'block';
  label.appendChild(element);
  return label;
}

// Function to update the color column in the <div id="main-generator-editor">
function updateCultureColorColumn() {
  const editorDiv = document.getElementById('main-generator-editor');
  
  // Clear the existing content
  editorDiv.innerHTML = '';
  editorDiv.innerHTML += "<h1 class='right-menu-header'>Cultures</h1>"
  if (!world.cultures) {
    world.cultures = []
  }

  // Loop through the cultureOverrideKeys and create a div for each culture (name and color)
  world.cultures.forEach(culture => {
    // Create a wrapper div for the culture name and color swatch
    const cultureDiv = document.createElement('div');
    cultureDiv.style.display = 'flex';
    cultureDiv.style.alignItems = 'center';
    cultureDiv.style.marginBottom = '5px'; // Add some space between culture rows

    // Create the color swatch (small colored square)
    const colorSwatch = document.createElement('div');
    colorSwatch.style.backgroundColor = culture.brushColor;
    colorSwatch.style.width = '20px';  // Adjust width to make it a small square
    colorSwatch.style.height = '20px'; // Adjust height to make it a small square
    colorSwatch.style.marginRight = '10px'; // Space between the swatch and the culture name

    // Create the text element for the culture name
    const cultureName = document.createElement('span');
    cultureName.textContent = culture.name

    // Make the color swatch and culture name clickable
    colorSwatch.onclick = () => updatePaintbrushTitle(culture)
    cultureName.onclick = () => showCultureEditor(culture);

    // Append the color swatch and the culture name to the wrapper div
    cultureDiv.appendChild(colorSwatch);
    cultureDiv.appendChild(cultureName);

    // Append the culture div to the main editor div
    editorDiv.appendChild(cultureDiv);
  });
}

function updatePaintbrushTitle(culture) {
  GID("title-color").value = rgbStringToHex(culture.brushColor)
  setTitleColor()
}

function redrawAffectedCells() {
  const context = canvas.getContext('2d');

  if (world.drawingType === "terrainMap") {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      clearCell(x, y, context);
      drawTerrainPixel(x, y);
    });
  } else if (world.drawingType === "smallProv" || world.drawingType === "smallWater") {
    const overrideProp = overrideProps[paintbrush];
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      let cell = xy(x, y);
      if (cell.provinceOverride || cell.waterOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "provinceOverride");
      } else {
        clearCell(x, y, context);
        drawTerrainPixel(x, y);
      }
    });
  } else if (world.drawingType === "smallFaith") {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      let cell = xy(x, y);
      cell.x = x;
      cell.y = y;

      if (cell.faithOverride) {
        let faithColor = {
          r: cell.faithOverrideR,
          g: cell.faithOverrideG,
          b: cell.faithOverrideB
        };
        addFaithColorIfNotExists(faithColor);
        clearCell(x, y, context);
        drawTitlePixel(x, y, "faithOverride");
      }
    });
    updateFaithColorColumn();
  } else if (world.drawingType === "smallCulture") {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      let cell = xy(x, y);
      cell.x = x;
      cell.y = y;

      if (cell.cultureOverride) {
        let cultureColor = {
          r: cell.cultureOverrideR,
          g: cell.cultureOverrideG,
          b: cell.cultureOverrideB
        };
        addCultureIfNotExists(cultureColor);
        clearCell(x, y, context);
        drawTitlePixel(x, y, "cultureOverride");
      }
      updateCultureColorColumn();
    });
  } else if (world.drawingType === "smallEmpire") {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      let cell = xy(x, y);
      cell.x = x;
      cell.y = y;
      if (cell.empireOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "empireOverride");
      }
    });
    updateEmpireColorColumn();
  } else if (world.drawingType === "smallKingdom") {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      let cell = xy(x, y);
      if (cell.kingdomOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "kingdomOverride");
      } else if (cell.empireOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "empireOverride");
      }
    });
    updateKingdomColorColumn();
  } else if (world.drawingType === "smallDuchy") {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      let cell = xy(x, y);
      if (cell.duchyOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "duchyOverride");
      } else if (cell.kingdomOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "kingdomOverride");
      }
    });
    updateDuchyColorColumn();
  } else if (world.drawingType === "smallCounty") {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      let cell = xy(x, y);
      if (cell.countyOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "countyOverride");
      } else if (cell.duchyOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "duchyOverride");
      }
    });
    updateCountyColorColumn();
  } else if (world.drawingType === "smallProvince") {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      let cell = xy(x, y);
      if (cell.provinceOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "provinceOverride");
      } else if (cell.countyOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "countyOverride");
      }
    });
    updateProvinceColorColumn();
  } else if (world.drawingType === "roguelike") {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      clearCell(x, y, context);
      ctx.fillStyle = "black";
      let adjX = x * settings.pixelSize;
      let adjY = y * settings.pixelSize;
      ctx.fillRect(adjX, adjY, settings.pixelSize, settings.pixelSize);
      let cell = world.map[y][x];
      drawRoguelike(cell);
    });
  } else {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      clearCell(x, y, context);
      drawCell(x, y, context);
    });
  }
}

function clearCell(x, y, context) {
  const cellSizeX = settings.pixelSize
  const cellSizeY = settings.pixelSize
  context.clearRect(x * cellSizeX, y * cellSizeY, cellSizeX, cellSizeY);
}

// Add event listeners
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);

function closeFaithEditor() {
  GID("faith-editor").style.display = "none";
  GID("faith-editor-content").style.display = "none";
}

function saveFaithChanges(faith) {
  // Save the name and localization
  const nameInput = document.getElementById('faith-name-input');
  faith.nameLoc = nameInput.value;

  // Save isPagan checkbox state
  const isPaganInput = document.getElementById('faith-is-pagan-checkbox');
  faith.isPagan = isPaganInput.checked ? 'yes' : 'no';

  // Save graphical faith and piety icon group
  const graphicalFaithSelect = document.getElementById('graphical_faith_select');
  faith.graphical_faith = graphicalFaithSelect.value;

  const pietyIconGroupSelect = document.getElementById('piety_icon_group_select');
  faith.piety_icon_group = pietyIconGroupSelect.value;

  // Save doctrines
  const doctrineSelects = Array.from(document.querySelectorAll('select[id^="doctrine_select_"]'));
  faith.doctrines = doctrineSelects.map(select => select.value);

  // Save holy order names
  faith.holy_order_names = faith.holy_order_names.map((_, index) => {
    const holyOrderInput = document.getElementById(`holy_order_${index}_input`);
    return holyOrderInput.value;
  });

  // Save localization
  updateFaithLocalization(faith);
  updateFaithColorColumn()
}

// Function to handle the click on a faith name or swatch
function showFaithEditor(faith) {
  const closeButton = GID("close-faith-editor")
  closeButton.onclick = () => {
    saveFaithChanges(faith);
    closeFaithEditor();
  };
  settings.currentFaith = faith;
  const editorDiv = document.getElementById('faith-editor-content');

  // Clear the existing content
  editorDiv.innerHTML = '';

  // Add Name field
  const nameSection = document.createElement('div');
  nameSection.style.marginBottom = '20px';
  nameSection.innerHTML = `<h3>Faith Name</h3>`;
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = faith.nameLoc;
  nameInput.id = 'faith-name-input';  // We will use this ID later to access the value
  nameSection.appendChild(nameInput);
  editorDiv.appendChild(nameSection);

  // Add isPagan toggle
  const isPaganSection = document.createElement('div');
  isPaganSection.style.marginBottom = '20px';
  isPaganSection.innerHTML = `<h3>Is Pagan</h3>`;
  const isPaganInput = document.createElement('input');
  isPaganInput.type = 'checkbox';
  isPaganInput.checked = faith.isPagan === 'yes';
  isPaganInput.id = 'faith-is-pagan-checkbox';
  isPaganSection.appendChild(isPaganInput);
  editorDiv.appendChild(isPaganSection);


  // Dropdown for graphical_faith
  editorDiv.appendChild(createDropdown('Graphical Faith', graphicalFaithList, faith.graphical_faith, 'graphical_faith', 'graphical_faith_select'));

  // Dropdown for piety_icon_group
  editorDiv.appendChild(createDropdown('Piety Icon Group', pietyIconGroupList, faith.piety_icon_group, 'piety_icon_group', 'piety_icon_group_select'));



  const doctrinesSection = document.createElement('div');
  doctrinesSection.style.marginTop = '20px';
  doctrinesSection.innerHTML = `<h3>Doctrines</h3>`;
  editorDiv.appendChild(doctrinesSection);

  // Group doctrines by their group property
  const doctrineGroups = doctrinesList.reduce((acc, doctrine) => {
    if (!acc[doctrine.group]) {
      acc[doctrine.group] = [];
    }
    acc[doctrine.group].push(doctrine);
    return acc;
  }, {});

  // Create a dropdown for each group of doctrines
  Object.keys(doctrineGroups).forEach((group, index) => {
    const groupDiv = document.createElement('div');
    groupDiv.style.marginBottom = '10px';

    // Label for the group
    const groupLabel = document.createElement('h4');
    groupLabel.textContent = group;  // Group name as label
    groupDiv.appendChild(groupLabel);

    // Find the currently selected doctrine for this group
    const selectedDoctrine = faith.doctrines.find(doctrine =>
      doctrineGroups[group].some(d => d.n === doctrine)
    ) || doctrineGroups[group][0].n;

    // Create the dropdown for this group
    const selectElement = createDropdown(
      `${group} Doctrine`,
      doctrineGroups[group].map(d => d.n),
      selectedDoctrine,
      `doctrines.${index}`,
      `doctrine_select_${index}`
    );
    groupDiv.appendChild(selectElement);

    doctrinesSection.appendChild(groupDiv);
  });

  // Dropdown for holy order names
  const holyOrderNamesSection = document.createElement('div');
  holyOrderNamesSection.style.marginTop = '20px';
  holyOrderNamesSection.innerHTML = `<h3>Holy Order Names</h3>`;
  editorDiv.appendChild(holyOrderNamesSection);

  faith.holy_order_names.forEach((holyOrder, index) => {
    const holyOrderDiv = document.createElement('div');
    holyOrderDiv.style.marginBottom = '10px';

    const holyOrderInput = document.createElement('input');
    holyOrderInput.type = 'text';
    holyOrderInput.value = holyOrder;
    holyOrderInput.id = `holy_order_${index}_input`;
    holyOrderDiv.appendChild(holyOrderInput);

    holyOrderNamesSection.appendChild(holyOrderDiv);
  });

  // Section for virtueSins pairs
  const virtueSinsSection = document.createElement('div');
  virtueSinsSection.style.marginTop = '20px';
  virtueSinsSection.innerHTML = `<h3>Virtues and Sins</h3>`;
  editorDiv.appendChild(virtueSinsSection);

  faith.virtueSins.forEach((pair, index) => {
    const pairDiv = document.createElement('div');
    pairDiv.style.marginBottom = '10px';

    const virtueSelect = createDropdown(`Virtue ${index + 1}`, virtuesList, pair[0], `virtueSins.${index}.0`, `virtue_select_${index}`);
    const sinSelect = createDropdown(`Sin ${index + 1}`, sinsList, pair[1], `virtueSins.${index}.1`, `sin_select_${index}`);
    
    pairDiv.appendChild(virtueSelect);
    pairDiv.appendChild(sinSelect);
    virtueSinsSection.appendChild(pairDiv);
  });

  // Add button to generate random virtues and sins
  const randomVirtueSinsButton = document.createElement('button');
  randomVirtueSinsButton.textContent = 'Randomize Virtues and Sins';
  randomVirtueSinsButton.onclick = () => randomizeVirtueSins(faith);
  virtueSinsSection.appendChild(randomVirtueSinsButton);

  // Section for faith language
  const languageSection = document.createElement('div');
  languageSection.style.marginTop = '20px';
  languageSection.innerHTML = `<h3>Language</h3>`;
  editorDiv.appendChild(languageSection);


  // Button to regenerate the faith names and descriptions
  const regenerateLocalizationButton = document.createElement('button');
  regenerateLocalizationButton.textContent = 'Regenerate Localization';
  regenerateLocalizationButton.onclick = function() {
    faith.language = makeLanguage(consSet, vowelSet);
    setReligionLocalization(faith)
    updateLocalizationInputs(faith); 
  };
  languageSection.appendChild(regenerateLocalizationButton);

  // Localization Section
  const localizationSection = document.createElement('div');
  localizationSection.id = 'localization-section'; // Add this line
  localizationSection.style.marginTop = '20px';
  localizationSection.innerHTML = `<h3>Localization</h3>`;
  editorDiv.appendChild(localizationSection);
  // Iterate through the localization object and create input fields for each key-value pair
  Object.keys(faith.localization).forEach(key => {
    const localizationDiv = document.createElement('div');
    localizationDiv.style.marginBottom = '10px';

    const label = document.createElement('label');
    label.textContent = `${key}:`;
    localizationDiv.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = faith.localization[key];
    input.id = `localization-${key}`;  // Set a unique ID for each input
    input.style.width = '100%'; // Adjust the width as needed
    localizationDiv.appendChild(input);

    // Append each localization key and input field to the localization section
    localizationSection.appendChild(localizationDiv);
  });

  // Add Save Changes button to update localization values
  const saveLocalizationButton = document.createElement('button');
  saveLocalizationButton.textContent = 'Save Localization Changes';
  saveLocalizationButton.onclick = () => updateFaithLocalization(faith);
  localizationSection.appendChild(saveLocalizationButton);

  // Display the faith editor
  GID("faith-editor").style.display = "block";
  GID("faith-editor-content").style.display = "grid";
}

// Function to update faith localization based on user input
function updateFaithLocalization(faith) {
  Object.keys(faith.localization).forEach(key => {
    const input = document.getElementById(`localization-${key}`);
    if (input) {
      faith.localization[key] = input.value;
    }
  });
}

function updateLocalizationInputs(faith) {
  const localizationSection = document.getElementById('localization-section'); // Use the id

  if (!localizationSection) {
    console.error('Localization section not found!');
    return;
  }

  // Clear the existing content in the localization section
  localizationSection.innerHTML = '<h3>Localization</h3>';

  // Iterate through the new localization object and create input fields for each key-value pair
  Object.keys(faith.localization).forEach(key => {
    const localizationDiv = document.createElement('div');
    localizationDiv.style.marginBottom = '10px';

    const label = document.createElement('label');
    label.textContent = `${key}:`;
    localizationDiv.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = faith.localization[key];
    input.id = `localization-${key}`;  // Set a unique ID for each input
    input.style.width = '100%'; // Adjust the width as needed
    localizationDiv.appendChild(input);

    // Append each localization key and input field to the localization section
    localizationSection.appendChild(localizationDiv);
  });
}


// Helper function to create dropdowns
function createDropdown(label, options, selectedOption, dataAttribute, id) {
  const container = document.createElement('div');
  const dropdownLabel = document.createElement('label');
  dropdownLabel.textContent = `${label}: `;
  container.appendChild(dropdownLabel);

  const selectElement = document.createElement('select');
  selectElement.setAttribute('data-faith', dataAttribute);
  selectElement.id = id; 
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.text = option;
    if (option === selectedOption) {
      optionElement.selected = true;
    }
    selectElement.appendChild(optionElement);
  });

  container.appendChild(selectElement);
  return container;
}

function createFontSizeToggle() {
  const fontSizeDiv = document.createElement('div');
  fontSizeDiv.style.display = 'flex';
  fontSizeDiv.style.alignItems = 'center';
  fontSizeDiv.style.marginBottom = '5px';

  const label = document.createElement('label');
  label.textContent = 'Toponym Font Size:';
  label.style.marginRight = '10px';

  const input = document.createElement('input');
  input.type = 'number';
  input.value = settings.labelFontSize || 16; // Default value if not set
  input.style.width = '50px';

  const debouncedChange = debounce(function() {
    const fontSize = parseInt(input.value, 10);
    if (!isNaN(fontSize)) {
      settings.labelFontSize = fontSize;
      drawWorld();
    }
  });

  input.oninput = debouncedChange; 

  fontSizeDiv.appendChild(label);
  fontSizeDiv.appendChild(input);
  return fontSizeDiv;
}


let column;

function updateEmpireColorColumn() {
  column = "empire"
  selectedCounty = undefined;
  const editorDiv = document.getElementById('main-generator-editor');
  editorDiv.innerHTML = '';
  editorDiv.innerHTML += "<h1 class='right-menu-header'>Empires</h1>";
  for (let i = 0; i < world.empires.length; i++) {
    let empire = world.empires[i]
    const titleDiv = createTitleEntry(empire)
    editorDiv.appendChild(titleDiv);
  }
  editorDiv.appendChild(createFontSizeToggle())
}

function updateKingdomColorColumn() {
  column = "kingdom"
  selectedCounty = undefined;
  const editorDiv = document.getElementById('main-generator-editor');
  editorDiv.innerHTML = '';
  editorDiv.innerHTML += "<h1 class='right-menu-header'><span id='back-arrow'>◀</span> Kingdoms</h1>";
  for (let i = 0; i < selectedEmpire.kingdoms.length; i++) {
    let kingdom = selectedEmpire.kingdoms[i]
    const titleDiv = createTitleEntry(kingdom);
    editorDiv.appendChild(titleDiv);
  }
  editorDiv.appendChild(createFontSizeToggle())
  GID("back-arrow").onclick = function() {
    updateEmpireColorColumn()
  }
}

function updateDuchyColorColumn() {
  column = "duchy"
  selectedCounty = undefined;
  const editorDiv = document.getElementById('main-generator-editor');
  editorDiv.innerHTML = '';
  editorDiv.innerHTML += "<h1 class='right-menu-header'><span id='back-arrow'>◀</span> Duchies</h1>";
  for (let i = 0; i < selectedKingdom.duchies.length; i++) {
    let duchy = selectedKingdom.duchies[i]
    const titleDiv = createTitleEntry(duchy);
    editorDiv.appendChild(titleDiv);
  }
  editorDiv.appendChild(createFontSizeToggle())
  GID("back-arrow").onclick = function() {
    updateKingdomColorColumn()
  }
}

function updateCountyColorColumn() {
  column = "county"
  const editorDiv = document.getElementById('main-generator-editor');
  editorDiv.innerHTML = '';
  editorDiv.innerHTML += "<h1 class='right-menu-header'><span id='back-arrow'>◀</span> Counties</h1>";
  for (let i = 0; i < selectedDuchy.counties.length; i++) {
    let county = selectedDuchy.counties[i]
    const titleDiv = createTitleEntry(county);
    editorDiv.appendChild(titleDiv);
  }
  editorDiv.appendChild(createFontSizeToggle())
  GID("back-arrow").onclick = function() {
    updateDuchyColorColumn()
  }
}

function updateProvinceColorColumn() {
  column = "province"
  const editorDiv = document.getElementById('main-generator-editor');
  editorDiv.innerHTML = '';
  editorDiv.innerHTML += "<h1 class='right-menu-header'><span id='back-arrow'>◀</span> Provinces</h1>";
  for (let i = 0; i < selectedCounty.provinces.length; i++) {
    let province = selectedCounty.provinces[i]
    const titleDiv = createTitleEntry(province);
    editorDiv.appendChild(titleDiv);
  }
  editorDiv.appendChild(createFontSizeToggle())
  GID("back-arrow").onclick = function() {
    updateCountyColorColumn()
  }
}

function getParentTitle(title) {
  let parentTitle
  if (title.isKingdom) {
    parentTitle = title.empire;
  } else if (title.isDuchy) {
    parentTitle = title.kingdom;
  } else if (title.isCounty) {
    parentTitle = title.duchy;
  } else if (title.isProvince) {
    parentTitle = title.county;
  } else {
    parentTitle = title
  }
  return parentTitle
}

function createTitleEntry(title) {
  const titleDiv = document.createElement('div');
  titleDiv.style.display = 'flex';
  titleDiv.style.alignItems = 'center';
  titleDiv.style.marginBottom = '5px';

  // Create the left arrow for moving up the hierarchy
  if (title.kingdoms) {

  } else {
    const leftArrow = document.createElement('span');
    leftArrow.textContent = '◀';
    leftArrow.style.marginRight = '10px';
    leftArrow.style.cursor = 'pointer';
    
    let parentTitle;
    parentTitle = getParentTitle(title)
    console.log(title);
    console.log(parentTitle)
    
    if (parentTitle) {
      let t = parentTitle;
      leftArrow.onclick = function() {
        if (parentTitle.kingdoms) {
          console.log("Updating empire")
          selectedEmpire = t;
          world.drawingType = "smallEmpire";
          paintbrush = "empireOverride";
          drawWorld();
          updateEmpireColorColumn();
        } else if (parentTitle.duchies) {
          console.log("Updating kingdoms")
          selectedKingdom = t;
          world.drawingType = "smallKingdom";
          paintbrush = "kingdomOverride";
          drawWorld();
          updateKingdomColorColumn();
        } else if (parentTitle.counties) {
          selectedDuchy = t;
          world.drawingType = "smallDuchy";
          paintbrush = "duchyOverride";
          drawWorld();
          updateDuchyColorColumn();
        } else if (parentTitle.provinces) {
          selectedCounty = t;
          world.drawingType = "smallCounty";
          paintbrush = "countyOverride";
          drawWorld();
          updateCountyColorColumn();
        } else {
          selectedProvince = t;
          world.drawingType = "smallProvince";
          paintbrush = "provinceOverride";
          drawWorld();
          updateProvinceColorColumn();
        }
      }
    }
    titleDiv.appendChild(leftArrow);
  }

  const colorSwatch = document.createElement('div');
  colorSwatch.style.backgroundColor = title.brushColor;
  colorSwatch.style.width = '20px';
  colorSwatch.style.height = '20px';
  colorSwatch.style.marginRight = '10px';
  colorSwatch.style.marginLeft = '10px'
  colorSwatch.onclick = function() {
    GID("title-color").value = rgbStringToHex(title.brushColor);
    setTitleColor()
  };

  const titleName = document.createElement('span');
  titleName.id = "open-title-editor"
  titleName.textContent = `${title.localizedTitle}`;

  // Create the right arrow for moving down the hierarchy

  const rightArrow = document.createElement('span');
  rightArrow.textContent = '▶';
  rightArrow.style.marginLeft = 'auto';
  rightArrow.style.cursor = 'pointer';
  let titles;
  let curr;
  if (title.kingdoms) {
    titles = title.kingdoms;
    curr = "kingdoms";
  } else if (title.duchies) {
    titles = title.duchies;
    curr = "duchies";
  } else if (title.counties) {
    titles = title.counties;
    curr = "counties";
  } else if (title.provinces) {
    titles = title.provinces;
    curr = "provinces";
  }
  if (titles) {
    let t = title;
    rightArrow.onclick = function() {
      if (curr === "kingdoms") {
        selectedEmpire = t;
        world.drawingType = "smallKingdom";
        paintbrush = "kingdomOverride";
        drawWorld();
        updateKingdomColorColumn();
      } else if (curr === "duchies") {
        selectedKingdom = t;
        world.drawingType = "smallDuchy";
        paintbrush = "duchyOverride";
        drawWorld();
        updateDuchyColorColumn();
      } else if (curr === "counties") {
        selectedDuchy = t;
        world.drawingType = "smallCounty";
        paintbrush = "countyOverride";
        drawWorld();
        updateCountyColorColumn();
      } else if (curr === "provinces") {
        selectedCounty = t;
        world.drawingType = "smallProvince";
        paintbrush = "provinceOverride";
        drawWorld();
        updateProvinceColorColumn();
      }
    };
  }

  // Append all elements in order: leftArrow, colorSwatch, titleName, rightArrow

  titleDiv.appendChild(colorSwatch);
  titleDiv.appendChild(titleName);
  titleDiv.appendChild(rightArrow);
  titleName.onclick = function() {
    showTitleEditor(title);
  };
  return titleDiv;
}

// Function to handle the click on a title to bring up the title editor
function showTitleEditor(title) {
  settings.currentTitle = title;
  GID("title-editor").style.display = "block"
  const editorDiv = document.getElementById('title-editor-content');

  // Clear the existing content
  editorDiv.innerHTML = '';

  // Add Localized Title field
  const localizedTitleSection = document.createElement('div');
  localizedTitleSection.style.marginBottom = '20px';
  localizedTitleSection.innerHTML = `<h3>Localized Title</h3>`;
  const localizedTitleInput = document.createElement('input');
  localizedTitleInput.type = 'text';
  localizedTitleInput.value = title.localizedTitle;
  localizedTitleInput.id = 'localized-title-input';  // ID for future reference
  localizedTitleSection.appendChild(localizedTitleInput);
  editorDiv.appendChild(localizedTitleSection);

  // Additional settings for provinces
  if (title.isProvince) {
    const provinceSettingsSection = document.createElement('div');
    provinceSettingsSection.style.marginTop = '20px';
    provinceSettingsSection.innerHTML = `<h3>Province Settings</h3>`;

    // Create checkboxes for province-specific flags
    const flags = [
      { name: 'isOcean', label: 'Is Ocean' },
      { name: 'isLake', label: 'Is Lake' },
      { name: 'isImpassableSea', label: 'Is Impassable Sea' },
      { name: 'isImpassable', label: 'Is Impassable' },
      { name: 'isRiver', label: 'Is River' }
    ];

    flags.forEach(flag => {
      const flagDiv = document.createElement('div');
      const flagLabel = document.createElement('label');
      flagLabel.textContent = flag.label;
      const flagCheckbox = document.createElement('input');
      flagCheckbox.type = 'checkbox';
      flagCheckbox.checked = title[flag.name];
      flagCheckbox.id = `province-${flag.name}-input`;  // Unique ID for each checkbox
      flagCheckbox.onchange = function() {
        title[flag.name] = flagCheckbox.checked;  // Update the title object when toggled
      };

      flagDiv.appendChild(flagCheckbox);
      flagDiv.appendChild(flagLabel);
      provinceSettingsSection.appendChild(flagDiv);
    });

    editorDiv.appendChild(provinceSettingsSection);
  }
  GID("close-title-editor").onclick = function() {
    saveTitleEdits(title)
    GID("title-editor").style.display = "none"
    drawWorld()
  }
}

function saveTitleEdits(title) {
  title.localizedTitle = document.getElementById('localized-title-input').value;
  if (title.isProvince) {
    title.isOcean = document.getElementById('province-isOcean-input').checked;
    title.isLake = document.getElementById('province-isLake-input').checked;
    title.isImpassableSea = document.getElementById('province-isImpassableSea-input').checked;
    title.isImpassable = document.getElementById('province-isImpassable-input').checked;
    title.isRiver = document.getElementById('province-isRiver-input').checked;
  }
  if (title.kingdoms) {
    updateEmpireColorColumn()
  } else if (title.duchies) {
    updateKingdomColorColumn();
  } else if (title.counties) {
    updateDuchyColorColumn()
  } else if (title.provinces) {
    updateCountyColorColumn();
  } else {
    updateProvinceColorColumn()
  }
}