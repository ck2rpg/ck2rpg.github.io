/**
 * Retrieves the cell at the specified coordinates from the world map.
 * Returns "edge" if the coordinates are out of bounds.
 *
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {object|string} The cell at the specified coordinates or "edge" if out of bounds.
 */

function xy(x, y) {
    if (x < 0 || y < 0 || x >= world.width || y >= world.height) {
      return "edge"; // Coordinates are out of bounds
    }
    return world.map[y][x]; // Return the cell at the specified coordinates
  }
  
  
  /**
   * Initializes spreading centers for tectonic activity.
   * Generates a random number of spreading centers based on the world's width
   * and distributes them across the width of the world.
   */
  function createSpreadingCenters() {
    const numCenters = getRandomInt(5, 45); // Random number of spreading centers
    const spacing = Math.floor(world.width / numCenters);
  
    for (let i = 0; i < numCenters; i++) {
      world.tectonics.spreadingCenters.push(spacing * i);
    }
  
    world.tectonics.spreadingLine = [];
  }
  
  
  
  /**
   * Creates a spreading line starting from a given center.
   * The line progresses vertically and adjusts the center randomly,
   * ensuring it stays within the map boundaries.
   *
   * @param {number} center - The starting x-coordinate for the spreading line.
   */
  function createSpreadingLine(center) {
    const verticalAdjuster = Math.floor(world.height / getRandomInt(1, 15));
    const horizontalAdjuster = Math.floor(world.height / getRandomInt(1, 15));
    const start = verticalAdjuster;
    const end = world.height - verticalAdjuster;
    const widthStart = horizontalAdjuster;
    const widthEnd = world.width - horizontalAdjuster;
  
    for (let y = start; y < end; y++) {
      const direction = getRandomInt(0, 100) < 50 ? -1 : 1;
      center += direction * getRandomInt(1, 20);
  
      if (center < widthStart) {
        center = widthStart + getRandomInt(1, 50);
      } else if (center >= widthEnd) {
        center = widthEnd - 1 - getRandomInt(1, 50);
      }
  
      const cell = xy(center, y);
      cell.spreading = true;
      world.tectonics.spreadingLine.push(cell);
    }
  }
  
  /**
   * Creates a horizontal spreading line across the world map.
   * The line starts from a random y-coordinate and progresses horizontally,
   * adjusting the y-coordinate randomly while ensuring it stays within vertical boundaries.
   */
  function createHSpreadLine() {
    let y = getRandomInt(1, world.height - 1);
  
    for (let x = 1; x < world.width; x++) {
      y += getRandomInt(0, 100) < 50 ? -getRandomInt(1, 20) : getRandomInt(1, 20);
  
      if (y < 1) {
        y = 1;
      } else if (y > world.height - 1) {
        y = world.height - 1 - getRandomInt(1, 20);
      }
  
      const cell = xy(x, y);
      cell.spreading = true;
      world.tectonics.spreadingLine.push(cell);
    }
  }
  
  /**
   * Simulates the spreading process over a specified number of iterations.
   * Each iteration involves clearing rain, emitting magma from spreading centers,
   * spreading the magma, and setting moisture levels.
   *
   * @param {number} num - The number of iterations for the spreading process.
   */
  function spreadProcess(num) {
    clearRain();
  
    for (let i = 0; i < num; i++) {
      spreadingCenterEmits();
      spread();
      setMoisture();
    }
  }
  
  
  let spreadNum = 0;
  
  
  
  /**
   * Emits magma from the spreading centers.
   * Increases the magma and elevation of cells in the spreading line by a random amount.
   */
  function spreadingCenterEmits() {
    world.tectonics.spreadingLine.forEach((cell, index) => {
      const add = getRandomInt(0, 255);
      cell.magma += add;
      cell.elevation += add;
      cell.id = index;
    });
  }
  
  /**
   * Emits a small amount of magma from the spreading centers.
   * Increases the magma and elevation of cells in the spreading line by a small random amount.
   */
  function spreadingCenterEmitsSmall() {
    world.tectonics.spreadingLine.forEach(cell => {
      const add = getRandomInt(1, 5);
      cell.magma += add;
      cell.elevation += add;
    });
  }
  
  /**
   * Spreads magma from cells with magma to their adjacent cells.
   * Rolls magma from one cell to its neighboring cells based on random directions.
   */
  function spread() {
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const cell = xy(x, y);
        if (cell.magma > 0) {
          try {
            const neighbors = [
              xy(x - 1, y),     // west
              xy(x + 1, y),     // east
              xy(x + 1, y + 1), // northeast
              xy(x - 1, y - 1), // southwest
              xy(x, y + 1),     // north
              xy(x, y - 1),     // south
              xy(x - 1, y + 1), // northwest
              xy(x + 1, y - 1)  // southeast
            ];
  
            const rand = getRandomInt(0, 7);
            rollMagma(neighbors[rand], cell);
            neighbors.forEach(neighbor => rollMagma(neighbor, cell));
          } catch {
            // Handle any errors that occur during the magma rolling process
          }
        }
      }
    }
  }
  
  /**
   * Transfers magma from one cell to another.
   * Ensures that the magma levels between cells are balanced based on a random multiplier.
   *
   * @param {Object} newCell - The cell to which magma is transferred.
   * @param {Object} oldCell - The cell from which magma is transferred.
   */
  function rollMagma(newCell, oldCell) {
    const mult = getRandomInt(1, 15);
    if (newCell !== "edge" && oldCell !== "edge" && newCell.magma < oldCell.magma) {
      const diff = oldCell.magma - newCell.magma;
      const div = Math.floor(diff / mult);
      newCell.magma += div;
      newCell.elevation += div;
      oldCell.magma -= div;
      oldCell.elevation -= div;
    }
  }