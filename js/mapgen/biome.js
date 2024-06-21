/**
 * Determines the biome type of a given cell based on its properties and location.
 * 
 * @param {Object} cell - The cell object to determine the biome for.
 * @param {number} cell.elevation - The elevation of the cell.
 * @param {boolean} cell.beach - Indicates if the cell is a beach.
 * @param {boolean} cell.lake - Indicates if the cell is a lake.
 * @param {boolean} cell.river - Indicates if the cell is a river.
 * @param {number} cell.moisture - The moisture level of the cell.
 * @param {boolean} cell.desert - Indicates if the cell is in a desert.
 * @param {number} cell.x - The x-coordinate of the cell.
 * @param {number} cell.y - The y-coordinate of the cell.
 * @returns {string} - The biome type of the cell. Possible values are "beach", "lake", "river", "mountain", "arctic", "desert", "grass", or "ocean".
 */
function biome(cell) {
  let el = cell.elevation;
  let distanceBottom = getDistance(cell.x, cell.y, world.frostPointBottom, 0);
  let distanceTop = getDistance(cell.x, cell.y, world.frostPointTop, (world.height - 1));
  
  if (cell.beach && beachable(cell)) {
      return "beach";
  } else if (cell.lake) {
      return "lake";
  } else if (cell.river) {
      return "river";
  } else if (el > limits.mountains.lower) {
      return "mountain";
  } else if (el >= limits.seaLevel.upper && el <= 255 && 
             (distanceBottom + getRandomInt(1, 10) < 300 || distanceTop + getRandomInt(1, 10) < 300) && 
             (cell.y < world.frostPointBottom + getRandomInt(1, 10) || cell.y > world.frostPointTop + getRandomInt(1, 10))) {
      return "arctic";
  } else if ((cell.moisture < 50 && el > limits.seaLevel.lower) || (el >= limits.seaLevel.upper && el <= 255 && cell.desert)) {
      return "desert";
  } else if (el >= limits.seaLevel.upper && el <= 255) {
      if (cell.moisture > 100) {
          return "grass";
      } if (cell.moisture > 0) {
          return "grass";
      }
  } else {
      return "ocean";
  }
}

/**
* Determines if a given cell is suitable to be a beach.
* 
* @param {Object} cell - The cell object to check.
* @param {number} cell.x - The x-coordinate of the cell.
* @param {number} cell.y - The y-coordinate of the cell.
* @param {boolean} cell.lake - Indicates if the cell is a lake.
* @returns {boolean} - True if the cell is suitable to be a beach, false otherwise.
*/
function beachable(cell) {
  try {
      let neighbors = getNeighbors(cell.x, cell.y);
      for (let i = 0; i < neighbors.length; i++) {
          if (neighbors[i].lake) {
              return false;
          }
      }
      return true;
  } catch {
      return false;
  }
}
