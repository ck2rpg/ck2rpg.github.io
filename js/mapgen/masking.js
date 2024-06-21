//modding rivers: https://forum.paradoxplaza.com/forum/threads/how-to-mod-rivers-navigable-rivers-and-lakes.1478521/
function setMasks() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      assignMasks(cell)
    }
  }
}

function assignMasks(cell) { //need to convert from percentages to actual - do we want for individual pixels or just cells? Will blur sort it out for us?
    let n = noise(cell.x, cell.y)
    //NOTE: THIS FUNCTION NEEDS TO BE MADE CONSISTENT WITH TERRAIN GENERATION AT createProvinceTerrain() function!

    let remaining = 100;
    let el = cell.elevation;
    if (n < 0.2 && cell.maskMarked && !cell.desert) {
        cell.wetlands_02_mask = 100
    } else if (el < limits.seaLevel.upper - 15 && !cell.maskMarked) { //ocean - limit was 15 before (or 10?)
        cell.beach_02_mask = 80;
        cell.desert_02_mask = 20;
    } /*else if (cell.desert && cell.forceFloodplain) {
        cell.floodplains_01_mask = 100 
    } */else if (cell.highPointRiver && cell.elevation > 40 && cell.elevation < 70 && cell.desert === false && ((n > 0.1 && n < 0.4) || (n > 0.6 && n < 0.9))) {
        cell.farmland_01_mask = 100  
    } else if (cell.floodplainPotential) {
        cell.floodplains_01_mask = 100  
    } else if (cell.elevation > limits.seaLevel.upper && cell.moisture > 150 && (cell.y < world.steppeTop && cell.y > world.steppeBottom) && ((n > 0.1 && n < 0.2) || (n > 0.6 && n < 0.9))) { //using steppe as cutoff of main deserts indicator to keep jungles close to equator
        cell.forest_jungle_01_mask = getRandomInt(30, 50);
        remaining -= cell.forest_jungle_01_mask
        cell.medi_grass_02_mask = getRandomInt(30, 50);
        remaining -= cell.medi_grass_02_mask; 
        cell.hills_01_rocks_mask = remaining
    } else if (cell.desert) {
        if ((cell.y > world.steppeTop || cell.y < world.steppeBottom)) {
            //steppe
            if (el > limits.mountains.lower) {
                cell.hills_01_mask = getRandomInt(40, 60);
                remaining = 100 - cell.hills_01_mask
                cell.steppe_01_mask = remaining
            } else if (limits.mountains.lower - el < 50) {
                cell.steppe_01_mask = getRandomInt(70, 80);
                remaining -= cell.steppe_01_mask;
                cell.steppe_rocks_mask = remaining
            } else {
                cell.steppe_01_mask = getRandomInt(60, 70);
                remaining = 100 - cell.steppe_01_mask;
                cell.steppe_rocks_mask = getRandomInt(1, remaining);
                remaining -= cell.steppe_rocks_mask
                cell.steppe_bushes_mask = remaining
            }
        } else if (el > limits.mountains.lower) {
            //desert mountains
            cell.mountain_02_d_desert_mask = getRandomInt(50, 100);
            remaining -= cell.mountain_02_d_desert_mask;
            cell.drylands_01_mask = getRandomInt(0, remaining)
            remaining -= cell.drylands_01_mask;
            cell.mountain_02_desert_mask = getRandomInt(0, remaining)
            remaining -= cell.mountain_02_desert_mask;
        } else if (limits.mountains.lower - el < 50) {
            //hill
            cell.desert_rocky_mask = getRandomInt(38, 65);
            remaining -= cell.desert_rocky_mask;
            cell.desert_wavy_01_mask = getRandomInt(20, remaining);
            remaining -= cell.desert_wavy_01_mask;
            cell.desert_wavy_01_larger_mask = getRandomInt(0, remaining);
            remaining -= cell.desert_wavy_01_larger_mask;
            cell.drylands_01_mask = getRandomInt(0, remaining);
            remaining -= cell.drylands_01_mask
            cell.desert_02_mask = getRandomInt(0, remaining);
            remaining -= cell.desert_02_mask;
            if (remaining > 0) {
                cell.desert_wavy_01_mask += remaining
            }
        } else if (cell.moisture < 25) {
            //drylands
            cell.drylands_01_mask = 100
        } else if (cell.moisture < 10) {
            cell.desert_cracked_mask = 100;  
        } else {
            //regular desert
            
            if (n < 0.1) {
                cell.desert_01_mask = 100
            } else if (n < 0.85) {
                cell.desert_wavy_01_mask = getRandomInt(38, 65)
                remaining -= cell.desert_wavy_01_mask;
                cell.desert_wavy_01_larger_mask = getRandomInt(20, remaining);
                remaining -= cell.desert_wavy_01_larger_mask;
                cell.desert_rocky_mask = getRandomInt(0, remaining);
                remaining -= cell.desert_rocky_mask;
                cell.drylands_01_mask = getRandomInt(0, remaining);
                remaining -= cell.drylands_01_mask
                cell.desert_02_mask = getRandomInt(0, remaining);
                remaining -= cell.desert_02_mask;
                if (remaining > 0) {
                    cell.desert_wavy_01_mask += remaining
                }
            } else {
                cell.desert_rocky_mask = getRandomInt(38, 65);
                remaining -= cell.desert_rocky_mask;
                cell.desert_wavy_01_mask = getRandomInt(20, remaining);
                remaining -= cell.desert_wavy_01_mask;
                cell.desert_wavy_01_larger_mask = getRandomInt(0, remaining);
                remaining -= cell.desert_wavy_01_larger_mask;
                cell.drylands_01_mask = getRandomInt(0, remaining);
                remaining -= cell.drylands_01_mask
                cell.desert_02_mask = getRandomInt(0, remaining);
                remaining -= cell.desert_02_mask;
                if (remaining > 0) {
                    cell.desert_wavy_01_mask += remaining
                }
            }
        }
    } else if (el > limits.mountains.snowLine) {
        cell.mountain_02_c_snow_mask = getRandomInt(40, 70);
        remaining -= cell.mountain_02_c_snow_mask;
        cell.mountain_02_mask = remaining;
    } else if (el >= limits.mountains.lower) {
        cell.mountain_02_mask = getRandomInt(1, 70);
        remaining -= cell.mountain_02_mask;
        cell.mountain_02_c_mask = remaining;  
    } else if (!cell.maskMarked && ((n > 0.1 && n < 0.2) || (n > 0.6 && n < 0.9))) {
        if (cell.elevation > 60) {
            cell.forest_pine_01_mask = 100;
        } else {
            cell.forestfloor_mask = 100;
        }
    } else if (limits.mountains.lower - el < 50) {
        if ((cell.y > world.steppeTop || cell.y < world.steppeBottom)) {
            cell.northern_hills_01_mask = getRandomInt(40, 70);
            remaining -= cell.northern_hills_01_mask;
            cell.medi_grass_02_mask = getRandomInt(1, remaining);
            remaining -= cell.medi_grass_02_mask;
            cell.hills_01_rocks_mask = remaining
        } else {
            cell.hills_01_mask = getRandomInt(40, 70);
            remaining -= cell.hills_01_mask;
            cell.medi_grass_02_mask = getRandomInt(1, remaining);
            remaining -= cell.medi_grass_02_mask;
            cell.hills_01_rocks_mask = remaining
        }

    } else {
        let b = biome(cell);  
        if (b === "grass") { //western european plain tppes minus steppe which was too messy/discoloring for our approach
            if ((cell.y > world.steppeTop || cell.y < world.steppeBottom)) {
                cell.medi_grass_02_mask = getRandomInt(30, 50);
                remaining -= cell.medi_grass_02_mask;
                cell.plains_01_noisy_mask = getRandomInt(15, remaining);
                remaining -= cell.plains_01_noisy_mask
                cell.plains_01_rough_mask = getRandomInt(15, remaining);
                remaining -= cell.plains_01_rough_mask
                cell.plains_01_mask = getRandomInt(0, remaining);
                remaining -= cell.plains_01_mask
                if (remaining > 0) {
                    cell.plains_01_noisy_mask += remaining
                }
            } else {
                cell.northern_plains_01_mask = getRandomInt(30, 50);
                remaining -= cell.northern_plains_01_mask;
                cell.plains_01_noisy_mask = getRandomInt(15, remaining);
                remaining -= cell.plains_01_noisy_mask
                cell.plains_01_rough_mask = getRandomInt(15, remaining);
                remaining -= cell.plains_01_rough_mask
                cell.plains_01_mask = getRandomInt(0, remaining);
                remaining -= cell.plains_01_mask
                if (remaining > 0) {
                    cell.plains_01_noisy_mask += remaining
                }
            }
        } else if (b === "arctic") {
            cell.snow_mask = 100;
        } else {
            //DEFAULT TERRAIN
            cell.medi_grass_02_mask = getRandomInt(30, 50);
            remaining -= cell.medi_grass_02_mask;
            cell.plains_01_noisy_mask = getRandomInt(15, remaining);
            remaining -= cell.plains_01_noisy_mask
            cell.plains_01_rough_mask = getRandomInt(15, remaining);
            remaining -= cell.plains_01_rough_mask
            cell.plains_01_mask = getRandomInt(0, remaining);
            remaining -= cell.plains_01_mask
            if (remaining > 0) {
                cell.plains_01_noisy_mask += remaining
            }
        }
    }
}

