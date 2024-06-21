/**
 * Simulates the distribution of moisture across a world map.
 * Iterates through each row of the map, simulating the movement of a cloud that adjusts its moisture level based on the elevation of the cells it encounters.
 * The cloud's moisture level decreases when moving uphill and increases when moving downhill or over sea-level cells.
 * Tracks the number of mountains crossed and sets desert properties on cells based on moisture levels and position.
 */
function setMoisture() {
    for (let y = 0; y < world.height; y++) {
      let cloud = initializeCloud(y);
  
      while (cloud.x < world.width - 1) {
        let currentCell = xy(cloud.x, cloud.y);
        let nextCell = xy(cloud.x + 1, cloud.y);
  
        updateMoisture(cloud, currentCell, nextCell);
        adjustCloudForElevation(cloud, currentCell, nextCell);
        adjustCloudForMountains(cloud, currentCell, nextCell);
        markDesertAreas(cloud, nextCell);
  
        cloud.x += 1;
      }
    }
  }
  
  /**
   * Initializes a cloud object with initial properties.
   * 
   * @param {number} y - The y-coordinate of the row being processed.
   * @returns {Object} The initialized cloud object.
   */
  function initializeCloud(y) {
    return {
      x: 0,
      y: y,
      moisture: 50,
      mountainCount: 0
    };
  }
  
  /**
   * Updates the moisture level of the cloud based on the elevation difference between the current and next cell.
   * 
   * @param {Object} cloud - The cloud object.
   * @param {Object} currentCell - The current cell being processed.
   * @param {Object} nextCell - The next cell to be processed.
   */
  function updateMoisture(cloud, currentCell, nextCell) {
    currentCell.moisture = cloud.moisture;
    let elevationDiff = Math.floor(nextCell.elevation - currentCell.elevation);
  
    if (elevationDiff > 10) {
      cloud.moisture = Math.max(cloud.moisture - 1, 0);
    }
  
    if (nextCell.elevation <= limits.seaLevel.upper) {
      cloud.moisture += 1;
    }
  }
  
  /**
   * Adjusts the cloud's moisture level and mountain count based on the elevation of the current and next cell.
   * 
   * @param {Object} cloud - The cloud object.
   * @param {Object} currentCell - The current cell being processed.
   * @param {Object} nextCell - The next cell to be processed.
   */
  function adjustCloudForElevation(cloud, currentCell, nextCell) {
    let elevationDiff = Math.floor(nextCell.elevation - currentCell.elevation);
  
    if (nextCell.elevation > limits.mountains.lower) {
      cloud.mountainCount += 1;
      if (elevationDiff > 0) {
        cloud.moisture = Math.max(cloud.moisture - 1, 0);
        nextCell.moisture = cloud.moisture;
      }
    } else {
      cloud.mountainCount = Math.max(cloud.mountainCount - 1, 0);
    }
  }
  
  /**
   * Sets desert properties on cells based on the cloud's mountain count and the next cell's elevation.
   * 
   * @param {Object} cloud - The cloud object.
   * @param {Object} currentCell - The current cell being processed.
   * @param {Object} nextCell - The next cell to be processed.
   */
  function adjustCloudForMountains(cloud, currentCell, nextCell) {
    if (cloud.mountainCount > 0 && nextCell.elevation < limits.mountains.lower) {
      nextCell.desert = true;
    }
  }
  
  /**
   * Marks areas as desert based on the cloud's moisture level and position within the desert points.
   * 
   * @param {Object} cloud - The cloud object.
   * @param {Object} nextCell - The next cell to be processed.
   */
  function markDesertAreas(cloud, nextCell) {
    if (cloud.y > world.desertPointBottom + getRandomInt(1, 10) && 
        cloud.y < world.desertPointTop + getRandomInt(1, 10) && 
        cloud.moisture < 50) {
      nextCell.desert = true;
    } else {
      nextCell.desert = false;
    }
  }
  