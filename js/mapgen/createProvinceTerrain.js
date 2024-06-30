/**
 * Creates the terrain types for each province based on various conditions.
 * Updates the province object with the appropriate terrain type.
 */

function createProvinceTerrainNew() {
    let count = 0;

    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i];
        if (p.cells > 0) {
            let y = p.y;
            let x = p.bigCell.x
            if (p.elevation > limits.seaLevel.upper) {
                if (isTropical(y, x)) {
                    assignTropicalTerrain(p)
                } else if (isSubTropical(y, x)) {
                    assignSubTropicalTerrain(p)
                } else if (isTemperate(y, x)) {
                    assignTemperateTerrain(p);
                } else if (isCold(y, x)) {
                    assignColdTerrain(p)
                }
              } else {
                p.terrain= "sea"
              }
        }
        
        /*
        if (p.cells > 0) {
            count += 1;
            if (p.land) {
                if (isCold(p.y)) {
                    assignColdTerrain(p);
                } else if (isTemperate(p.y)) {
                    assignTemperateTerrain(p)  
                } else if (isSubTropical(p.y)) {
                    assignSubTropicalTerrain(p)
                } else if (isTropical(p.y)) {
                    assignTropicalTerrain(p)
                }
            } else {
                p.terrain = "sea"
                p.seaType = "sea" // this is changed to coastal sea as appropriate later in the setProvinceDirections function. Oddly, coastal_sea is not set anywhere and can't find anything on it. I'm assuming it is set by engine to help with travel danger
            }
        }
            */
    }
}

function createCellTerrains() { // understand that you are passing two different coords here. The x is bigCell x. The y is smallCell y. Need to make corresponding changes to province
    for (let i = 0; i < world.height; i++) {
        for (let j = 0; j < world.width; j++) {
          let cell = world.map[i][j]
          let x = j
          let y = i * settings.pixelSize;
          if (cell.elevation > limits.seaLevel.upper) {
            if (isTropical(y, x)) {
                assignTropicalTerrain(cell)
            } else if (isSubTropical(y, x)) {
                assignSubTropicalTerrain(cell)
            } else if (isTemperate(y, x)) {
                assignTemperateTerrain(cell);
            } else if (isCold(y, x)) {
                assignColdTerrain(cell)
            }
          } else {
            cell.terrain= "sea"
          }
        }
      }
}

function isTropical(y, x) {
    let equatorDistance = eqDist(y)
    let tropDist = limits.tropical.upper;
    if (x) {
        tropDist += (limits.tropical.varyRange[x] * settings.pixelSize);
    } 
    if (equatorDistance <= tropDist) {
      return true;
    }
    return false
  }
  
  function isSubTropical(y, x) {
    let equatorDistance = eqDist(y)
    let subtropDist = limits.subTropical.upper;
    let subTropBottomDist = limits.subTropical.lower
    let modifier = limits.tropical.varyRange[x] * settings.pixelSize
    if (x) {
        subtropDist += (limits.subTropical.varyRange[x] * settings.pixelSize);
        subTropBottomDist += (modifier)
    }  
    if (equatorDistance >= subTropBottomDist && equatorDistance <= subtropDist) {
      return true;
    }
    return false
  }
  
  function isTemperate(y, x) {
    let equatorDistance = eqDist(y)
    let tempDist = limits.temperate.upper;
    let tempBottomDist = limits.temperate.lower;
    if (x) {
        tempDist += (limits.temperate.varyRange[x] * settings.pixelSize);
        tempBottomDist += (limits.subTropical.varyRange[x] * settings.pixelSize)
    }   
    if (equatorDistance >= tempBottomDist && equatorDistance <= tempDist) {
      return true;
    }
    return false
  }
  
  function isCold(y, x) {
    let equatorDistance = eqDist(y)
    let coldBottomDist = limits.cold.lower;
    if (x) {
        coldBottomDist += (limits.temperate.varyRange[x] * settings.pixelSize)
    }
    if (equatorDistance >= coldBottomDist && equatorDistance <= limits.cold.upper) {
      return true;
    }
    return false
  }
  
  function isBelowPlainsLimit(y) {
    let equatorDistance = eqDist(y) 
    if (equatorDistance >= limits.cold.plains) {
      return true;
    }
    return false
  }

function assignColdTerrain(p) {
    let bigCell = {};
    if (p.ckX) {
      bigCell = p
      bigCell.adjacentToWater = []
      let neighbors = getNeighbors(bigCell.x, bigCell.y)
      for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i].elevation <= limits.seaLevel.upper) {
            bigCell.adjacentToWater = [1]
        }
      }  
    } else {
        bigCell = xy(p.x, p.y)
    }
    let n = noise(bigCell.x, bigCell.y)
    p.climateCategory = "cold"
    if (p.elevation >= limits.mountains.lower) {
        p.terrain = "mountains"
    } else if (p.elevation >= limits.hills.lower) {
        p.terrain = "hills"  
    } else if (p.adjacentToWater.length === 0) {
        p.terrain = "taiga"
    } else if (p.adjacentToWater.length > 0) {
        if (isBelowPlainsLimit(p.y)) {
            p.terrain = "plains"
        } else {
            p.terrain = "taiga"
        }
    } else {
        p.terrain = "taiga"
    }
}

function assignTemperateTerrain(p) {
    //add steppe and desert (cold)
    let bigCell;
    if (p.ckX) {
      bigCell = p
      bigCell.adjacentToWater = []
      let neighbors = getNeighbors(bigCell.x, bigCell.y)
      for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i].elevation <= limits.seaLevel.upper) {
            bigCell.adjacentToWater = [1]
        }
      }  
    } else {
        bigCell = xy(p.x, p.y)
    }
    p.climateCategory = "temperate"
    let n = noise(bigCell.x, bigCell.y)
    if (p.elevation >= limits.mountains.lower) {
        p.terrain = "mountains"
    } else if (p.elevation >= limits.hills.lower) {
        p.terrain = "hills"
    } else if (bigCell.highPointRiver && bigCell.elevation > 40 && bigCell.elevation < 70 && bigCell.desert === false && ((n > 0.1 && n < 0.4) || (n > 0.6 && n < 0.9))) {
        p.terrain = "farmlands"
    } else if (bigCell.moisture < 40) {
        p.terrain = "steppe"
    } else if ((n > 0.1 && n < 0.2) || (n > 0.6 && n < 0.9)) {
        p.terrain = "forest"
    } else {
        p.terrain = "plains"
    }
}

function assignSubTropicalTerrain(p) {
    let bigCell;
    if (p.ckX) {
      bigCell = p
      bigCell.adjacentToWater = []
      let neighbors = getNeighbors(bigCell.x, bigCell.y)
      for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i].elevation <= limits.seaLevel.upper) {
            bigCell.adjacentToWater = [1]
        }
      }  
    } else {
        bigCell = xy(p.x, p.y)
    }
    p.climateCategory = "subtropical"
    let n = noise(bigCell.x, bigCell.y)
    if (p.elevation >= limits.mountains.lower) {
        p.terrain = "desert_mountains"
    } else if (p.elevation >= limits.hills.lower) {
        p.terrain = "hills"
    } else if (bigCell.moisture < 25) {
        p.terrain = "drylands"
    } else if (bigCell.moisture < 150) {
        p.terrain = "desert"
    } else if (p.adjacentToWater.length > 0) {
        p.terrain = "jungle"
    } else {
        p.terrain = "plains"
    }
}

function assignTropicalTerrain(p) {
    let bigCell;
    if (p.ckX) {
      bigCell = p
      bigCell.adjacentToWater = []
      let neighbors = getNeighbors(bigCell.x, bigCell.y)
      for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i].elevation <= limits.seaLevel.upper) {
            bigCell.adjacentToWater = [1]
        }
      }  
    } else {
        bigCell = xy(p.x, p.y)
    }
    p.climateCategory = "tropical"
    let n = noise(bigCell.x, bigCell.y)
    if (p.elevation >= limits.mountains.lower) {
        p.terrain = "mountains"
    } else if (p.elevation >= limits.hills.lower) {
        p.terrain = "hills"
    } else {
        p.terrain = "jungle"
    }
}

function secondPassTerrain() {
    for (let i = 0; i < world.provinces.length; i++) {
        //put forest between desert related terrain and jungle
    }
}


function createProvinceTerrain() {
    let t = `${daBom}default_land=plains\n`;
    t += `default_sea=sea\n`;
    t += `default_coastal_sea=coastal_sea\n`;
    let count = 0;

    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i];
        if (p.cells > 0) {
            count += 1;
            if (p.land) {
                let cell = world.smallMap[p.y][p.x];
                let n = noise(cell.bigCell.x, cell.bigCell.y);
                let terrain = biome(cell.bigCell);
    
                if (cell.bigCell.elevation >= limits.seaLevel.upper) {
                    if (cell.bigCell.highPointRiver && cell.bigCell.elevation > 40 && cell.bigCell.elevation < 70 && !cell.bigCell.desert && ((n > 0.1 && n < 0.4) || (n > 0.6 && n < 0.9))) {
                        p.terrain = "farmlands";
                    } else if (cell.bigCell.elevation > limits.seaLevel.upper && cell.bigCell.moisture > 150 && cell.bigCell.y < world.steppeTop && cell.bigCell.y > world.steppeBottom) {
                        p.terrain = "jungle";
                    } else if (cell.bigCell.desert) {
                        if (cell.elevation > limits.mountains.lower) {
                            p.terrain = "desert_mountains";
                            p.isDesert = true;
                        } else if (cell.bigCell.y > world.steppeTop || cell.bigCell.y < world.steppeBottom) {
                            p.terrain = "steppe";
                        } else if (cell.bigCell.moisture < 25) {
                            p.terrain = "drylands";
                            p.isDesert = true;
                        } else {
                            p.terrain = "desert";
                            p.isDesert = true;
                        }
                    } else if (cell.bigCell.elevation > limits.mountains.lower) {
                        p.terrain = "mountains";
                    } else if (limits.mountains.lower - cell.bigCell.elevation < 50) {
                        p.terrain = "hills";
                    } else if (!cell.bigCell.maskMarked && ((n > 0.1 && n < 0.2) || (n > 0.6 && n < 0.9))) {
                        p.terrain = "forest";
                    } else if (terrain === "arctic") {
                        p.terrain = "taiga";
                    } else if (terrain === "grass" || terrain === "beach") {
                        p.terrain = "plains";
                    } else {
                        p.terrain = "plains"; // default
                    }
                }
            } else {
                p.terrain = "sea"
                p.seaType = "sea" // this is changed to coastal sea as appropriate later in the setProvinceDirections function. Oddly, coastal_sea is not set anywhere and can't find anything on it. I'm assuming it is set by engine to help with travel danger
            }
        }
    }
}

/**
 * Writes the terrain data for each province to a downloadable file.
 */
function writeProvinceTerrain() {
    let t = `${daBom}default_land=plains\n`;
    t += `default_sea=sea\n`;
    t += `default_coastal_sea=coastal_sea\n`;
    let count = 0;

    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i];
        if (p.terrain !== "sea" && p.cells > 0 && p.terrain !== "coastal_sea") {
            count += 1;
            t += `${count}=${p.terrain}\n`;
        }
    }

    var data = new Blob([t], { type: 'text/plain' });
    var url = window.URL.createObjectURL(data);
    let link = `<a id="terrain-download-link" download="00_province_terrain.txt" href="">Download Province Terrain</a><br>`;
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('terrain-download-link').href = url;
    document.getElementById('terrain-download-link').click();
}