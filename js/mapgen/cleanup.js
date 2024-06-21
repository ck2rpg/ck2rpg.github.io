/**
 * Performs a comprehensive cleanup of the world map in a single loop.
 * Removes stray land, mountain, and water cells by adjusting their elevation
 * based on the number of neighboring cells of the same type.
 */
function cleanupWorld() {
  let removedCoasts = 0;
  let removedWater = 0;
  let removedMountains = 0;

  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);

      // Clean up stray coasts
      if (cell.elevation >= limits.seaLevel.upper) {
        removedCoasts += cleanupStrayCells(cell, limits.seaLevel.upper, -1, false);
      }

      // Clean up stray water
      if (cell.elevation < limits.seaLevel.upper) {
        removedWater += cleanupStrayCells(cell, limits.seaLevel.upper, limits.seaLevel.upper + 1, true);
      }

      // Clean up stray mountains
      if (cell.elevation >= limits.mountains.lower) {
        removedMountains += cleanupStrayCells(cell, limits.mountains.lower, limits.mountains.lower - 1, false);
      }
    }
  }
  
  console.log(`${removedCoasts} coasts removed`);
  console.log(`${removedWater} water cells removed`);
  console.log(`${removedMountains} mountains removed`);
}

/**
 * Cleans up stray cells by adjusting their elevation based on the number of neighboring cells.
 *
 * @param {Object} cell - The cell to check and potentially adjust.
 * @param {number} limit - The elevation limit to compare against.
 * @param {number} newElevation - The new elevation to set if the cell is determined to be stray.
 * @param {boolean} isWater - Whether the cleanup is for water cells.
 * @returns {number} The number of cells removed (1 if the cell was adjusted, otherwise 0).
 */
function cleanupStrayCells(cell, limit, newElevation, isWater) {
  try {
    let neighbors = getNeighbors(cell.x, cell.y);
    let similarNeighbors = 0;
    for (let n = 0; n < neighbors.length; n++) {
      if (isWater && neighbors[n].elevation < limit) {
        similarNeighbors += 1;
      } else if (!isWater && neighbors[n].elevation >= limit) {
        similarNeighbors += 1;
      }
    }

    if (similarNeighbors < 3) {
      cell.elevation = newElevation;
      if (newElevation === -1) cell.beach = false;
      return 1;
    }
  } catch {
    // Handle potential errors, e.g., accessing undefined neighbors
  }
  return 0;
}


/**
 * Performs a comprehensive cleanup of the world by calling specific cleanup functions.
 * 
 * This function performs the following steps:
 * 1. Cleans up the world by calling the `cleanupWorld` function.
 * 2. Identifies and processes beach areas by calling the `getBeaches` function.
 */
function cleanupAll() {
    cleanupWorld();
    getBeaches();
  }