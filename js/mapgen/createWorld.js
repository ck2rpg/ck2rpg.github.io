/**
 * Creates the world by initializing a blank world, setting up spreading centers,
 * creating spreading lines, and generating horizontal spreading lines.
 */
function createWorld(w, h) {
    if (w, h) {
      createBlankWorld(h, w);
    } else {
      createBlankWorld()
    }

    createSpreadingCenters();
    world.tectonics.spreadingCenters.forEach(center => {
      createSpreadingLine(center);
    });
    createHSpreadLine();
  }
  
  /**
   * Initializes a blank world with default settings, geographical points,
   * feature arrays, and populates the world map with cells.
   */
  function createBlankWorld(h, w) {
    if (h) {
      world.height = h;
    }
    if (w) {
      world.width = w
    }
    settings.pixelSize = settings.height / world.height
    resetClimateLimits()
    initializeWorldSettings();
    setGeographicalPoints();
    initializeFeatureArrays();
    populateWorldMap();
    resetVaryRanges()
  }
  
  /**
   * Initializes the world settings such as drawing type, pixel size, tectonics,
   * height, and width.
   */
  function initializeWorldSettings() {
    world.drawingType = "colorful";
    world.tectonics = { spreadingCenters: [] };
    world.height = world.height || 256;
    world.width = world.width || 512;
    settings.pixelSize = settings.height / world.height
  }
  
  /**
   * Sets geographical points such as the equator, steppe top and bottom,
   * frost points, and desert points based on the world's height.
   */
  function setGeographicalPoints() {
    world.equator = Math.floor(world.height / 2);
    world.steppeTop = world.equator + Math.floor(world.height / 8);
    world.steppeBottom = world.equator - Math.floor(world.height / 8);
    world.frostPointBottom = Math.floor(world.height / 10);
    world.frostPointTop = world.height - world.frostPointBottom;
    world.desertPointTop = Math.floor(world.height / 2) + Math.floor(world.height / 10);
    world.desertPointBottom = Math.floor(world.height / 2) - Math.floor(world.height / 10);
  }
  
  /**
   * Initializes arrays to hold various features of the world such as maps, rivers,
   * mountains, forests, and other geographical and cultural elements.
   */
  function initializeFeatureArrays() {
    world.map = [];
    world.rivers = [];
    world.mountains = [];
    world.forests = [];
    world.riverIds = [];
    world.religions = [];
    world.asteroids = [];
    world.trees = [];
    world.continents = [];
    world.continentsByProvince = [];
    world.landCells = [];
    world.populatedCells = [];
    world.provinces = [];
    world.clothingTypes = {}
  }
  
  /**
   * Populates the world map with cells. Each cell is initialized with default properties.
   */
  function populateWorldMap() {
    for (let y = 0; y < world.height; y++) {
      const row = [];
      for (let x = 0; x < world.width; x++) {
        row.push(createCell(x, y));
      }
      world.map.push(row);
    }
  }
  
  /**
   * Creates a cell at the specified coordinates and initializes its properties.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @returns {object} The created cell with initialized properties.
   */
  function createCell(x, y) {
    return {
      x: x,
      y: y,
      ckX: x * settings.pixelSize, // top left corner of extended square
      ckY: settings.height - (y * settings.pixelSize), // top left corner of extended square
      tree: false,
      elevation: getRandomInt(-254, -200),
      magma: 0,
      asteroidNames: [],
      river: false,
      lake: false,
      beach: false,
      population: 0,
      raindrops: 0,
      floodFilled: false,
      dropToWater: false,
      adjacentToWater: [],
    };
  }
  
