/**
 * Draws a small pixel on the canvas at the specified coordinates with the given color.
 *
 * @param {CanvasRenderingContext2D} context - The canvas rendering context.
 * @param {number} x - The x-coordinate where the pixel will be drawn.
 * @param {number} y - The y-coordinate where the pixel will be drawn.
 * @param {string} color - The color of the pixel. Defaults to black if not specified.
 */
function drawSmallPixel(context, x, y, color) {
  context.fillStyle = color || '#000';
  context.fillRect(x * settings.pixelSize, y * settings.pixelSize, settings.pixelSize, settings.pixelSize);
}
  
  /**
   * Draws a tiny pixel on the canvas at the specified coordinates with the given color.
   *
   * @param {CanvasRenderingContext2D} context - The canvas rendering context.
   * @param {number} x - The x-coordinate where the pixel will be drawn.
   * @param {number} y - The y-coordinate where the pixel will be drawn.
   * @param {string} color - The color of the pixel. Defaults to black if not specified.
   */
  function drawTinyPixel(context, x, y, color) {
    context.fillStyle = color || '#000';
    context.fillRect(x, y, 1, 1);
  }

/**
 * Draws a cell on the canvas based on the world's drawing type and the cell's properties.
 *
 * @param {number} x - The x-coordinate of the cell.
 * @param {number} y - The y-coordinate of the cell.
 */
function drawCell(x, y) {
    const type = world.drawingType;
    const cell = xy(x, y);
  
    const { r, g, b } = getRGBFromElevation(cell.elevation);
  
    if (type === "pixelRoguelike") {
      drawPixelRoguelike(cell)
    } else if (type === "book") {
      drawBookType(cell);
    } else if (type === "parchment") {
      drawParchmentType(cell, r, g, b);
    } else if (type === "paper") {
      drawPaperType(cell, r, g, b);
    } else if (type === "papyrus") {
      drawPapyrusType(cell, r, g, b);
    } else if (type === "colorful") {
      drawColorfulType(cell);
    } else if (type === "heightmap") {
      drawHeightmapType(cell);
    } else if (type === "rivermap") {
      drawRivermapType(cell);
    } else if (type === "roguelike") {
      drawRoguelike(cell)
    } else {
      drawSpecialType(cell, type);
    }
  }
  
  /**
   * Calculates RGB values from the elevation.
   *
   * @param {number} elevation - The elevation of the cell.
   * @returns {Object} An object containing the r, g, and b values.
   */
  function getRGBFromElevation(elevation) {
    return {
      r: Math.floor((elevation / 10) * 8),
      g: Math.floor((elevation / 10) * 6),
      b: Math.floor((elevation / 10) * 4),
    };
  }

  function getFantasyColor(cell) {
    let rgb = { r: 255, g: 255, b: 255 }; // Default white
    const cellBiome = biome(cell);
    let ascii = ""
    if (cell.river) {
      rgb = { r: 0, g: 0, b: 255 }; // Default white
    } else if (cellBiome === "beach") {
      rgb = { r: 255, g: 255, b: 255 }; // Default white
    } else if (cell.terrain === "forest") {
      rgb = { r: 255, g: 255, b: 255 }; // Default white
    } else if (cell.elevation >= limits.mountains.lower) {
      rgb = { r: 255, g: 255, b: 255 }; // Default white
    } else if (cell.terrain === "taiga" || (cell.climateCategory === "cold" && cell.terrain === "hills")) {
      rgb = { r: 255, g: 255, b: 255 }; // Default white
    } else if (cell.terrain === "jungle") {
      let red = 10 + getRandomInt(-15, 15)
      let blue = 70 + getRandomInt(-15, 15)
      let green = 70 + getRandomInt(-15, 15)
      rgb = { r: red, g: green, b: blue };
    } else if (cell.climateCategory === "tropical" && cell.terrain === "hills") {
      rgb = { r: 255, g: 255, b: 255 }; // Default white
    } else if (cell.terrain === "drylands") {
      let red = 10 + getRandomInt(-15, 15)
      let blue = 230 + getRandomInt(-15, 15)
      let green = 230 + getRandomInt(-15, 15)
      rgb = { r: red, g: green, b: blue };
    } else if (cell.terrain === "steppe") {
      let red = 10 + getRandomInt(-15, 15)
      let blue = 230 + getRandomInt(-15, 15)
      let green = 230 + getRandomInt(-15, 15)
      rgb = { r: red, g: green, b: blue };
    } else if (cell.terrain === "desert" || cell.terrain === "drylands") {
      let red = 10 + getRandomInt(-15, 15)
      let blue = 230 + getRandomInt(-15, 15)
      let green = 230 + getRandomInt(-15, 15)
      rgb = { r: red, g: green, b: blue };
    } else if (cell.terrain === "plains" || cell.terrain === "farmlands" || cell.terrain === "hills" || cell.terrain === "wetlands" || cell.terrain === "floodplains") {
      rgb = { r: 255, g: 255, b: 255 }; // Default white
    } else if (cell.elevation <= limits.seaLevel.upper || cell.terrain === "oasis") {
      let red = 20 + getRandomInt(-15, 15)
      let blue = 140 + getRandomInt(-15, 15)
      let green = 93 + getRandomInt(-15, 15)
      rgb = { r: red, g: green, b: blue };
    } else {
      rgb = { r: 255, g: 255, b: 255 }; // Default white
    }
    return rgb;
  }

  function drawRoguelike(cell) {
    const cellBiome = biome(cell);
    let ascii = ""
    if (cell.river) {
      ascii = "≈"
      const waterMod = 255 - Math.floor(getCorrectedColor(cell) * 0.6);
      cell.rgb = `rgb(0, 0, ${waterMod})`;
    } else if (cellBiome === "beach") {
      ascii = "."
      cell.rgb = `rgb(${194 - cell.elevation * 3}, ${178 - cell.elevation * 3}, ${128 - cell.elevation * 3})`;
    } else if (cell.terrain === "forest") {
      const el = cell.elevation;
      ascii = "♠"
      cell.rgb = `rgb(0, ${el / 3}, 0)`;
    } else if (cell.elevation >= limits.mountains.lower) {
      ascii = "^"
      const mountainMod = cell.elevation - limits.mountains.lower;
      cell.rgb = `rgb(${mountainMod}, ${mountainMod}, ${mountainMod})`;
    } else if (cell.terrain === "taiga" || (cell.climateCategory === "cold" && cell.terrain === "hills")) {
      const el = cell.elevation;
        ascii = "."
        cell.rgb = `rgb(${355 - el}, ${355 - el}, ${355 - el})`;
    } else if (cell.terrain === "jungle") {
      const el = cell.elevation;
      ascii = "§"
      cell.rgb = `rgb(0, ${el / 5}, 0)`;
    } else if (cell.climateCategory === "tropical" && cell.terrain === "hills") {
      const el = cell.elevation;
      ascii = "§"
      cell.rgb = `rgb(0, ${el / 5}, 0)`;
    } else if (cell.terrain === "drylands") {
      ascii = "~"
      const el = cell.elevation;
      cell.rgb = `rgb(${Math.floor(194 * (el / 255))}, ${Math.floor(178 * (el / 255))}, ${Math.floor(128 * (el / 255))})`;
    } else if (cell.terrain === "steppe") {
      ascii = `"`
      cell.rgb = drawSteppeColor(cell);
    } else if (cell.terrain === "desert" || cell.terrain === "drylands") {
      ascii = "~"
      const el = cell.elevation;
      cell.rgb = `rgb(${Math.floor(194 * (el / 255))}, ${Math.floor(178 * (el / 255))}, ${Math.floor(128 * (el / 255))})`;
    } else if (cell.terrain === "plains" || cell.terrain === "farmlands" || cell.terrain === "hills" || cell.terrain === "wetlands" || cell.terrain === "floodplains") {
      ascii = "."
      cell.rgb = {
       r: 0,
       g: 255,
       b: 0, 
      }//drawGrassColor(cell);
    } else if (cell.elevation <= limits.seaLevel.upper || cell.terrain === "oasis") {
      ascii = "≈"
      const waterMod = 255 - Math.floor(getCorrectedColor(cell) * 0.6);
      cell.rgb = `rgb(0, 0, ${waterMod})`;
    } else {
      ascii = "."
      cell.rgb = drawGrassColor(cell);
    }
    ctx.fillStyle = cell.rgb;
    ctx.font = `${settings.pixelSize}px monospace`;
    ctx.fillText(ascii, cell.x * settings.pixelSize, cell.y * settings.pixelSize);
  }
  
  /**
   * Draws a cell of "book" type.
   *
   * @param {Object} cell - The cell to draw.
   */
  function drawBookType(cell) {
    drawSmallPixel(ctx, cell.x, cell.y, "rgb(0, 0, 0)");
  
    const cellBiome = biome(cell);
  
    if (cellBiome === "beach") {
      cell.rgb = `rgb(${194 - cell.elevation * 3}, ${178 - cell.elevation * 3}, ${128 - cell.elevation * 3})`;
    } else if (cellBiome === "lake" || cellBiome === "river") {
      cell.rgb = `rgb(0, 0, ${350 - cell.elevation})`;
    } else if (cellBiome === "mountain") {
      const mountainMod = cell.elevation - limits.mountains.lower;
      cell.rgb = `rgb(${mountainMod}, ${mountainMod}, ${mountainMod})`;
    } else if (cellBiome === "arctic") {
      const el = cell.elevation;
      cell.rgb = `rgb(${355 - el}, ${355 - el}, ${355 - el})`;
    } else if (cellBiome === "desert") {
      const el = cell.elevation;
      cell.rgb = `rgb(${Math.floor(194 * (el / 255))}, ${Math.floor(178 * (el / 255))}, ${Math.floor(128 * (el / 255))})`;
    } else if (cellBiome === "grass") {
      drawGrassBookType(cell);
    } else if (cellBiome === "ocean") {
      const waterMod = 255 - Math.floor(getCorrectedColor(cell) * 0.6);
      cell.rgb = `rgb(0, 0, ${waterMod})`;
    }
  
    if (cell.tree) {
      drawInkTree(cell);
    }
    if (cell.text) {
      ctx.fillStyle = cell.rgb;
      ctx.font = "16px serif";
      ctx.fillText(cell.text, cell.x * settings.pixelSize, cell.y * settings.pixelSize);
    }
  }

  function getBookColor(cell) {
    let rgb = { r: 0, g: 0, b: 0 }; // Default black
  
    const cellBiome = biome(cell);
  
    if (cellBiome === "beach") {
      rgb = {
        r: 194 - cell.elevation * 3,
        g: 178 - cell.elevation * 3,
        b: 128 - cell.elevation * 3,
      };
    } else if (cellBiome === "lake" || cellBiome === "river") {
      rgb = {
        r: 0,
        g: 0,
        b: 350 - cell.elevation,
      };
    } else if (cellBiome === "mountain") {
      const mountainMod = cell.elevation - limits.mountains.lower;
      rgb = {
        r: mountainMod,
        g: mountainMod,
        b: mountainMod,
      };
    } else if (cellBiome === "arctic") {
      const el = cell.elevation;
      rgb = {
        r: 355 - el,
        g: 355 - el,
        b: 355 - el,
      };
    } else if (cellBiome === "desert") {
      const el = cell.elevation;
      rgb = {
        r: Math.floor(194 * (el / 255)),
        g: Math.floor(178 * (el / 255)),
        b: Math.floor(128 * (el / 255)),
      };
    } else if (cellBiome === "grass") {
      rgb = getGrassBookColor(cell);
    } else if (cellBiome === "ocean") {
      const waterMod = 255 - Math.floor(getCorrectedColor(cell) * 0.6);
      rgb = {
        r: 0,
        g: 0,
        b: waterMod,
      };
    }
  
    return rgb;
  }
  
  function getGrassBookColor(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 0;
    let grassAccent2 = 0;
    let grass = correctedColor;
    let grassAlpha;
  
    if (grass > 100) {
      const diff = Math.floor(grass - 100);
      grassAccent = grass - 100;
      grassAccent2 = Math.floor(grassAccent * 1.3);
      grass -= Math.floor(diff / 2.5);
      const m = Math.max(1, Math.floor(cell.elevation / 25));
      grassAlpha = `0.${m}`;
    }
    return {
      r: grassAccent2,
      g: grass,
      b: grassAccent,
    };
  }

  function getParchmentColor(cell, r, g, b) {
    let rgb = { r: 255, g: 255, b: 255 }; // Default white
  
    const cellBiome = biome(cell);
  
    if (cellBiome === "beach") {
      rgb = { r: 0, g: 0, b: 0 };
    } else if (cell.wetlands) {
      rgb = { r: 255, g: 255, b: 255 };
    } else if (cellBiome === "river" || cellBiome === "lake" || cellBiome === "ocean") {
      rgb = { r: 200, g: 200, b: 200 };
    } else if (cellBiome === "mountain") {
      rgb = { r: 255, g: 255, b: 255 };
    } else if (cell.tree) {
      rgb = { r: 255, g: 255, b: 255 };
    } else {
      rgb = { r: 255, g: 255, b: 255 };
    }
  
    return rgb;
  }

  function getPaperColor(cell, r, g, b) {
    let rgb = { r: 255, g: 255, b: 255 }; // Default white
  
    const cellBiome = biome(cell);
  
    if (cellBiome === "beach" || cell.wetlands || cellBiome === "river" || cellBiome === "lake" || cellBiome === "ocean") {
      rgb = { r: 255, g: 255, b: 255 };
    } else if (cellBiome === "mountain" || cell.tree) {
      rgb = { r: 255, g: 255, b: 255 };
    } else {
      rgb = { r: 255, g: 255, b: 255 };
    }
  
    return rgb;
  }

  function getPapyrusColor(cell, r, g, b) {
    let rgb = { r: 230 - Math.floor(cell.elevation / 5), g: 210 - Math.floor(cell.elevation / 5), b: 183 - Math.floor(cell.elevation / 5) };
  
    const cellBiome = biome(cell);
  
    if (cellBiome === "lake" || cellBiome === "ocean") {
      rgb = {
        r: 100 + Math.floor(cell.elevation / 5),
        g: 120 + Math.floor(cell.elevation / 5),
        b: 140 + Math.floor(cell.elevation / 5),
      };
    } else if (cell.tree || cellBiome === "beach" || cellBiome === "mountain" || cellBiome === "arctic") {
      rgb = {
        r: 230 - Math.floor(cell.elevation / 5),
        g: 210 - Math.floor(cell.elevation / 5),
        b: 183 - Math.floor(cell.elevation / 5),
      };
    }
  
    return rgb;
  }

  function getKoppenColor(cell) {
    let rgb = { r: 255, g: 255, b: 255 }
    if (cell.k === "Af") {
      rgb.r = 0;
      rgb.g = 0;
      rgb.b = 100
    } else if (cell.k === "Am") {
      rgb.r = 0;
      rgb.g = 120;
      rgb.b = 255
    } else if (cell.k === "Aw") {
      rgb.r = 70;
      rgb.g = 170;
      rgb.b = 250
    } else if (cell.k === "BWh") {
      rgb.r = 255;
      rgb.g = 0;
      rgb.b = 0
    } else if (cell.k === "BWk") {
      rgb.r = 255;
      rgb.g = 150;
      rgb.b = 150
    } else if (cell.k === "BSh") {
      rgb.r = 245;
      rgb.g = 165;
      rgb.b = 0
    } else if (cell.k === "BSk") {
      rgb.r = 255;
      rgb.g = 220;
      rgb.b = 100
    } else if (cell.k === "Csa") {
      rgb.r = 255;
      rgb.g = 255;
      rgb.b = 0
    } else if (cell.k === "Csb") {
      rgb.r = 200;
      rgb.g = 200;
      rgb.b = 0
    } else if (cell.k === "Csc") {
      rgb.r = 150;
      rgb.g = 150;
      rgb.b = 0
    } else if (cell.k === "Cwa") {
      rgb.r = 150;
      rgb.g = 255;
      rgb.b = 150
    } else if (cell.k === "Cwb") {
      rgb.r = 100;
      rgb.g = 200;
      rgb.b = 100
    } else if (cell.k === "Cwc") {
      rgb.r = 50;
      rgb.g = 150;
      rgb.b = 50
    } else if (cell.k === "Cfa") {
      rgb.r = 200;
      rgb.g = 255;
      rgb.b = 80
    } else if (cell.k === "Cfb") {
      rgb.r = 100;
      rgb.g = 255;
      rgb.b = 80
    } else if (cell.k === "Cfc") {
      rgb.r = 50;
      rgb.g = 200;
      rgb.b = 0
    } else if (cell.k === "Dsa") {
      rgb.r = 255;
      rgb.g = 0;
      rgb.b = 255
    } else if (cell.k === "Dsb") {
      rgb.r = 200;
      rgb.g = 0;
      rgb.b = 200
    } else if (cell.k === "Dsc") {
      rgb.r = 150;
      rgb.g = 50;
      rgb.b = 150
    } else if (cell.k === "Dsd") {
      rgb.r = 150;
      rgb.g = 100;
      rgb.b = 150
    } else if (cell.k === "Dwa") {
      rgb.r = 170;
      rgb.g = 175;
      rgb.b = 255
    } else if (cell.k === "Dwb") {
      rgb.r = 90;
      rgb.g = 120;
      rgb.b = 220
    } else if (cell.k === "Dwc") {
      rgb.r = 76;
      rgb.g = 79;
      rgb.b = 179
    } else if (cell.k === "Dwd") {
      rgb.r = 50;
      rgb.g = 0;
      rgb.b = 135
    } else if (cell.k === "Dfa") {
      rgb.r = 0;
      rgb.g = 255;
      rgb.b = 255
    } else if (cell.k === "Dfb") {
      rgb.r = 55;
      rgb.g = 200;
      rgb.b = 255
    } else if (cell.k === "Dfc") {
      rgb.r = 0;
      rgb.g = 125;
      rgb.b = 125
    } else if (cell.k === "Dfd") {
      rgb.r = 0;
      rgb.g = 70;
      rgb.b = 95
    } else if (cell.k === "ET") {
      rgb.r = 178;
      rgb.g = 178;
      rgb.b = 178
    } else if (cell.k === "EF") {
      rgb.r = 102;
      rgb.g = 102;
      rgb.b = 102
    } else if (cell.k === "H") {
      rgb.r = 200
      rgb.g = 200
      rgb.b = 200
    } else {
      if (cell.hemisphere === "N") {
        console.log(cell)
      }
    }
    return rgb
  }


  const temperatureColors = [ //dark red to near white purple
    [84, 0, 0],
    [83, 1, 0],
    [82, 1, 0],
    [83, 0, 0],
    [86, 0, 0],
    [88, 0, 1],
    [89, 1, 0],
    [90, 0, 0],
    [91, 0, 0],
    [92, 0, 0],
    [94, 0, 0],
    [95, 0, 0],
    [93, 1, 0],
    [95, 1, 1],
    [98, 0, 2],
    [101, 0, 1],
    [102, 0, 0],
    [100, 0, 0],
    [101, 0, 0],
    [104, 0, 0],
    [105, 1, 0],
    [104, 0, 0],
    [105, 0, 0],
    [107, 1, 1],
    [107, 1, 1],
    [109, 1, 1],
    [110, 0, 0],
    [111, 0, 0],
    [112, 0, 0],
    [113, 1, 0],
    [115, 1, 0],
    [118, 1, 0],
    [116, 0, 1],
    [115, 0, 0],
    [116, 0, 0],
    [119, 0, 1],
    [121, 0, 1],
    [122, 0, 1],
    [123, 1, 0],
    [122, 0, 0],
    [123, 0, 0],
    [124, 0, 0],
    [126, 0, 1],
    [128, 0, 0],
    [129, 0, 0],
    [130, 0, 0],
    [133, 0, 1],
    [132, 0, 0],
    [138, 0, 0],
    [139, 0, 0],
    [136, 1, 0],
    [140, 0, 0],
    [144, 0, 0],
    [143, 1, 0],
    [145, 0, 0],
    [153, 1, 0],
    [153, 0, 2],
    [152, 0, 1],
    [159, 1, 2],
    [162, 0, 0],
    [160, 0, 0],
    [164, 0, 1],
    [168, 0, 0],
    [169, 0, 0],
    [170, 0, 0],
    [178, 0, 2],
    [178, 0, 0],
    [175, 1, 0],
    [184, 0, 0],
    [185, 0, 0],
    [190, 0, 0],
    [194, 0, 1],
    [193, 1, 0],
    [194, 0, 0],
    [200, 0, 2],
    [202, 0, 0],
    [210, 0, 1],
    [209, 1, 1],
    [208, 0, 0],
    [214, 0, 0],
    [216, 0, 1],
    [218, 0, 0],
    [222, 0, 0],
    [225, 0, 0],
    [229, 1, 0],
    [235, 0, 0],
    [229, 1, 0],
    [235, 0, 0],
    [233, 1, 0],
    [239, 0, 0],
    [243, 0, 1],
    [243, 1, 0],
    [246, 1, 0],
    [250, 0, 1],
    [253, 4, 0],
    [255, 2, 0],
    [255, 3, 0],
    [254, 12, 0],
    [255, 12, 0],
    [255, 16, 0],
    [255, 20, 1],
    [254, 22, 0],
    [255, 28, 1],
    [255, 27, 1],
    [254, 34, 0],
    [255, 36, 1],
    [255, 40, 1],
    [255, 44, 0],
    [254, 48, 0],
    [254, 53, 0],
    [254, 62, 0],
    [255, 60, 0],
    [255, 67, 1],
    [254, 70, 0],
    [254, 72, 0],
    [254, 77, 0],
    [255, 78, 0],
    [255, 87, 0],
    [255, 86, 1],
    [255, 94, 1],
    [254, 103, 0],
    [255, 110, 1],
    [255, 111, 0],
    [255, 119, 1],
    [255, 128, 0],
    [255, 127, 0],
    [255, 134, 1],
    [253, 136, 0],
    [254, 143, 1],
    [255, 144, 0],
    [255, 151, 0],
    [255, 159, 2],
    [254, 160, 0],
    [255, 166, 0],
    [255, 168, 0],
    [255, 174, 0],
    [253, 176, 0],
    [253, 185, 0],
    [255, 183, 0],
    [255, 192, 0],
    [254, 196, 0],
    [254, 201, 0],
    [255, 208, 0],
    [254, 210, 0],
    [255, 216, 0],
    [255, 221, 0],
    [255, 226, 0],
    [255, 233, 0],
    [255, 241, 0],
    [254, 246, 0],
    [255, 250, 0],
    [254, 255, 3],
    [255, 255, 5],
    [255, 255, 11],
    [251, 255, 20],
    [244, 255, 28],
    [242, 254, 30],
    [235, 255, 34],
    [227, 255, 44],
    [225, 255, 45],
    [220, 255, 51],
    [210, 255, 62],
    [209, 255, 61],
    [201, 255, 69],
    [194, 255, 76],
    [195, 255, 77],
    [187, 255, 84],
    [180, 255, 90],
    [177, 255, 93],
    [169, 255, 102],
    [161, 254, 111],
    [160, 255, 111],
    [153, 255, 119],
    [145, 255, 126],
    [145, 254, 125],
    [136, 255, 135],
    [127, 255, 144],
    [123, 254, 148],
    [120, 255, 152],
    [111, 255, 158],
    [106, 254, 168],
    [103, 255, 168],
    [94, 255, 177],
    [88, 255, 183],
    [81, 255, 191],
    [79, 255, 193],
    [72, 255, 199],
    [63, 255, 206],
    [63, 255, 208],
    [55, 255, 216],
    [46, 255, 224],
    [38, 254, 231],
    [30, 255, 241],
    [20, 254, 251],
    [13, 255, 255],
    [12, 255, 255],
    [5, 255, 254],
    [0, 252, 255],
    [0, 244, 255],
    [1, 243, 255],
    [0, 235, 255],
    [0, 227, 254],
    [1, 219, 255],
    [0, 211, 254],
    [0, 212, 254],
    [1, 202, 255],
    [0, 194, 255],
    [0, 186, 255],
    [0, 180, 255],
    [1, 178, 254],
    [0, 170, 255],
    [1, 161, 255],
    [0, 155, 255],
    [1, 149, 255],
    [0, 145, 254],
    [0, 139, 254],
    [0, 128, 255],
    [0, 121, 254],
    [0, 118, 254],
    [1, 112, 255],
    [0, 104, 255],
    [2, 96, 255],
    [1, 86, 255],
    [0, 79, 254],
    [0, 74, 255],
    [1, 71, 255],
    [0, 63, 255],
    [0, 50, 230],
    [1, 30, 255],
    [0, 23, 255],
    [0, 22, 255],
    [1, 13, 255],
    [1, 4, 255],
    [1, 0, 252],
    [0, 0, 244],
    [0, 0, 236],
    [0, 0, 234],
    [1, 0, 226],
    [0, 0, 220],
    [0, 0, 212],
    [0, 0, 202],
    [0, 0, 194],
    [0, 0, 186],
    [0, 0, 178],
    [0, 0, 168],
    [0, 0, 162],
    [0, 0, 152],
    [0, 0, 145],
    [2, 0, 145],
    [9, 0, 143],
    [10, 0, 143],
    [11, 0, 143],
    [13, 0, 143],
    [14, 0, 143],
    [15, 0, 141],
    [16, 0, 141],
    [17, 0, 141],
    [20, 0, 142],
    [21, 0, 142],
    [21, 0, 141],
    [22, 0, 142],
    [23, 0, 142],
    [24, 0, 142],
    [25, 0, 143],
    [25, 1, 141],
    [25, 1, 140],
    [25, 0, 140],
    [27, 0, 141],
    [28, 1, 142],
    [29, 0, 141],
    [29, 0, 140],
    [28, 0, 141],
    [29, 0, 140],
    [31, 0, 140],
    [32, 0, 140],
    [33, 0, 141],
    [34, 0, 140],
    [35, 1, 140],
    [36, 0, 140],
    [37, 0, 140],
    [39, 0, 140],
    [41, 0, 140],
    [39, 1, 140],
    [38, 0, 139],
    [39, 1, 140],
    [38, 0, 139],
    [39, 1, 140],
    [42, 0, 141],
    [43, 0, 141],
    [44, 0, 141],
    [47, 0, 140],
    [48, 0, 139],
    [49, 0, 139],
    [51, 0, 139],
    [53, 0, 139],
    [55, 0, 138],
    [57, 0, 138],
    [58, 0, 138],
    [60, 0, 138],
    [62, 0, 138],
    [64, 0, 138],
    [66, 0, 138],
    [68, 0, 138],
    [70, 0, 137],
    [72, 0, 137],
    [74, 0, 137],
    [76, 0, 137],
    [78, 0, 137],
    [80, 0, 137],
    [82, 0, 136],
    [84, 0, 136],
    [86, 0, 136],
    [88, 0, 136],
    [90, 0, 136],
    [92, 0, 136],
    [94, 0, 135],
    [96, 0, 135],
    [98, 0, 135],
    [100, 0, 135],
    [102, 0, 135],
    [104, 0, 135],
    [106, 0, 134],
    [108, 0, 134],
    [110, 0, 134],
    [112, 0, 134],
    [114, 0, 134],
    [116, 0, 134],
    [118, 0, 133],
    [120, 0, 133],
    [122, 0, 133],
    [124, 0, 133],
    [126, 0, 133],
    [128, 0, 133],
    [130, 0, 132],
    [132, 0, 132],
    [134, 0, 132],
    [136, 0, 132],
    [138, 0, 132],
    [140, 0, 132],
    [142, 0, 131],
    [144, 0, 131],
    [146, 0, 131],
    [148, 0, 131],
    [150, 0, 131],
    [152, 0, 131],
    [154, 0, 130],
    [156, 0, 130],
    [158, 0, 130],
    [160, 0, 130],
    [162, 0, 130],
    [164, 0, 130],
    [166, 0, 129],
    [168, 0, 129],
    [170, 0, 129],
    [172, 0, 129],
    [174, 0, 129],
    [176, 0, 129],
    [178, 0, 128],
    [179, 0, 128],
    [180, 2, 129],
    [181, 4, 130],
    [181, 6, 131],
    [182, 8, 132],
    [183, 10, 133],
    [183, 12, 134],
    [184, 14, 135],
    [185, 16, 136],
    [186, 18, 137],
    [186, 20, 138],
    [187, 22, 139],
    [188, 24, 140],
    [189, 26, 141],
    [189, 28, 142],
    [190, 30, 143],
    [191, 32, 144],
    [191, 34, 145],
    [192, 36, 146],
    [193, 38, 147],
    [193, 40, 148],
    [194, 42, 149],
    [195, 44, 150],
    [195, 46, 151],
    [196, 48, 152],
    [197, 50, 153],
    [197, 52, 154],
    [198, 54, 155],
    [199, 56, 156],
    [199, 58, 157],
    [200, 60, 158],
    [201, 62, 159],
    [201, 64, 160],
    [202, 66, 161],
    [203, 68, 162],
    [203, 70, 163],
    [204, 72, 164],
    [205, 74, 165],
    [205, 76, 166],
    [206, 78, 167],
    [207, 80, 168],
    [207, 82, 169],
    [208, 84, 170],
    [209, 86, 171],
    [209, 88, 172],
    [210, 90, 173],
    [211, 92, 174],
    [211, 94, 175],
    [212, 96, 176],
    [213, 98, 177],
    [213, 100, 178],
    [214, 102, 179],
    [215, 104, 180],
    [215, 106, 181],
    [216, 108, 182],
    [217, 110, 183],
    [217, 112, 184],
    [218, 114, 185],
    [219, 116, 186],
    [219, 118, 187],
    [220, 120, 188],
    [221, 122, 189],
    [221, 124, 190],
    [222, 126, 191],
    [223, 128, 192],
    [223, 130, 193],
    [224, 132, 194],
    [225, 134, 195],
    [225, 136, 196],
    [226, 138, 197],
    [227, 140, 198],
    [227, 142, 199],
    [228, 144, 200],
    [229, 146, 201],
    [229, 148, 202],
    [230, 150, 203],
    [231, 152, 204],
    [231, 154, 205],
    [232, 156, 206],
    [233, 158, 207],
    [233, 160, 208],
    [234, 162, 209],
    [235, 164, 210],
    [235, 166, 211],
    [236, 168, 212],
    [237, 170, 213],
    [237, 172, 214],
    [238, 174, 215],
    [239, 176, 216],
    [239, 178, 217],
    [240, 180, 218],
    [241, 182, 219],
    [241, 184, 220],
    [242, 186, 221],
    [243, 188, 222],
    [243, 190, 223],
    [244, 192, 224],
    [245, 194, 225],
    [245, 196, 226],
    [246, 198, 227],
    [247, 200, 228],
    [247, 202, 229],
    [247, 204, 230],
    [247, 206, 231],
    [247, 208, 232],
    [247, 210, 233],
    [247, 212, 234],
    [247, 214, 235],
    [247, 216, 236],
    [247, 218, 237],
    [247, 220, 238],
    [247, 222, 239],
    [247, 224, 240],
];

function clearTemperatures() {
  for (let i = 0; i < world.map.length; i++) {
    for (let j = 0; j < world.map[i].length; j++) {
      let cell = xy(j, i);
      cell.temperature = 0;
    }
  }
}


function getLatitudeFactor(cell) {
  let latitude = cell.latitude;
  let hemisphere = cell.hemisphere;
  if (hemisphere === "N") {
    hemisphere = "north"
  } else {
    hemisphere = "south"
  }
  // Ensure latitude is between 1 and 90
  if (latitude < 0 || latitude > 90) {
      throw new Error("Latitude must be between 1 and 90 degrees.");
  }

  // Convert latitude to radians for trigonometric calculations
  const latInRadians = (latitude * Math.PI) / 180;

  // High precipitation near the equator (ITCZ)
  const equatorialComponent = 1.2 * Math.exp(-Math.pow(latitude / 20, 2));

  // Low precipitation in subtropical highs (~30 degrees)
  const subtropicalComponent = -0.5 * Math.exp(-Math.pow((latitude - 20) / 5, 2));

  // Moderate to high precipitation in mid-latitudes (~50 degrees)
  const midLatitudeComponent = 0.7 * Math.exp(-Math.pow((latitude - 50) / 10, 2));

  // Combine components to model precipitation factor
  let factor = Math.sin(latInRadians) + equatorialComponent + subtropicalComponent + midLatitudeComponent;

  // Normalize factor to be between 0 and 1
  factor = Math.max(0, Math.min(factor, 1));
  return factor
}

function clearOceanCurrents() {
  for (let i = 0; i < world.map.length; i++) {
    for (let j = 0; j < world.map[i].length; j++) {
      let cell = xy(j, i);
      if (cell.warmCurrent) {
        cell.warmCurrent = false;
      }
      if (cell.coldCurrent) {
        cell.coldCurrent = false;
      }
      if (cell.neutralCurrent) {
        cell.neutralCurrent = false
      }
    }
  }
}

function setOceanCurrents() {
  //fix for islands
  for (let i = 0; i < world.map.length; i++) {
    let waterCount = 0;
    let landCount = 0;
    let lastOceanX = 0;
    let lastElevation = 0
    let oceanCount = 0;
    let resetOcean = false;
    //west to east
    for (let j = 0; j < world.map[i].length; j++) {
      let cell = xy(j, i);
      if (cell.elevation < 38) {
        oceanCount += 1;
      } else {
        resetOcean = true;
      }
      if (cell.elevation > 37 && lastElevation < 38 && oceanCount > Math.floor(world.width / 20)) {
        let currentCell = xy(j - 3, i)
        if (currentCell.latitude < 10) {
          currentCell.neutralCurrent = true
        } else if (currentCell.latitude > 59 && cell.hemisphere === "N") {
          currentCell.warmCurrent = true;
        } else if (cell.latitude > 59 && cell.hemisphere === "S") {
          currentCell.neutralCurrent = true
        } else {
          currentCell.coldCurrent = true
        }

      }
      lastElevation = cell.elevation; 
      if (resetOcean === true) {
        oceanCount = 0;
        resetOcean = false
      }
    }

    //east to west
    lastElevation = 0
    oceanCount = 0
    resetOcean = false;
    for (let j = world.map[i].length - 1; j > 0; j--) {
      let cell = xy(j, i);
      if (cell.elevation < 38) {
        oceanCount += 1;
      } else {
        resetOcean = true
      }
      if (cell.elevation > 37 && lastElevation < 38 && oceanCount > Math.floor(world.width / 20)) {
        let currentCell = xy(j + 3, i)
        if (currentCell.latitude < 10) {
          currentCell.neutralCurrent = true
        } else if (cell.latitude > 59 && cell.hemisphere === "N") {
          currentCell.coldCurrent = true;
        } else if (cell.latitude > 59 && cell.hemisphere === "S") {
          currentCell.neutralCurrent = true
        } else {
          currentCell.warmCurrent = true;
        }
      }
      lastElevation = cell.elevation; 
      if (resetOcean === true) {
        oceanCount = 0;
        resetOcean = false
      }
    }
  }
}



function changeWestCoast(cell, westCoast) {
  let currentCreationDistance = 500//Math.floor(world.width / 30)
  if (cell.elevation > 37) {
    cell.westCoast = westCoast;
    counters.landCount += 1;
    if (counters.resettableWaterCount > currentCreationDistance) {
      counters.waterCount = 0
      counters.resettableWaterCount = 0;
      cell.westCoast = cell.x - 1
      westCoast = cell.x - 1
    }
  } else {
    counters.waterCount += 1;
    counters.resettableWaterCount += 1
    let next = xy(cell.x + 1, cell.y)
    if (counters.resettableWaterCount > currentCreationDistance) {
      westCoast = cell.x
    }
    if (next && next.elevation > 37 && counters.resettableWaterCount > currentCreationDistance) {
      let currentCell = xy(cell.x - 3, cell.y)
      setSimpleCurrentsWestCoast(currentCell)
    }
  }
  return westCoast
}

function changeEastCoast(cell, eastCoast) {
  let currentCreationDistance = 50//Math.floor(world.width / 10)
  if (cell.elevation > 37) {
    cell.eastCoast = eastCoast;
    counters.landCount += 1;
    if (counters.resettableWaterCount > currentCreationDistance) {
      counters.waterCount = 0
      counters.resettableWaterCount = 0;
      cell.eastCoast = cell.x + 1
      eastCoast = cell.x + 1
    }
  } else {
    counters.waterCount += 1;
    counters.resettableWaterCount += 1
    let next = xy(cell.x - 1, cell.y)
    if (counters.resettableWaterCount > currentCreationDistance) {
      eastCoast = cell.x
    }
    if (next && next.elevation > 37 && counters.resettableWaterCount > currentCreationDistance) {
      let currentCell = xy(cell.x + 3, cell.y)
      setSimpleCurrentsEastCoast(currentCell)
    }
  }
  return eastCoast
}

function changeHighestMountain(cell, highestMountain, mountainRun) {
  if (cell.elevation < 255 && mountainRun === 0) {
    highestMountain = 0
  }
  if (cell.elevation > highestMountain) {
    highestMountain = cell.elevation;
  }
  return highestMountain
}

let counters = {}

function setGeo() {
  let mountainRun = 0
  let highestMountain = 0
  let westCoast = 0;
  let eastCoast = 0;

  for (let i = 0; i < world.map.length; i++) {
    //west to east
    westCoast = 0
    mountainRun = 0
    highestMountain = 0
    counters.waterCount = 500
    counters.resettableWaterCount = 500;
    counters.landCount = 0
    for (let j = 0; j < world.map[i].length; j++) {
      let cell = xy(j, i);
      getSmallCellLatitude(cell);
      westCoast = changeWestCoast(cell, westCoast)
      if ((cell.latitude > 29 && cell.latitude < 61)) {
        mountainRun += incrementMountainRun(cell, mountainRun)
        highestMountain = changeHighestMountain(cell, highestMountain, mountainRun)
        cell.mountainRun = mountainRun;
        cell.highestMountain = highestMountain
      }
      setWindReference(cell)
      
    }

    mountainRun = 0
    highestMountain = 0
    eastCoast = world.width - 1
    counters.waterCount = 500
    counters.resettableWaterCount = 500
    counters.landCount = 0

    //east to west
    for (let j = world.map[i].length - 1; j > 0; j--) {
      let cell = xy(j, i);
      if (cell.elevation < 38) {
      getSmallCellLatitude(cell);
      eastCoast = changeEastCoast(cell, eastCoast)
      if (cell.latitude < 30 || cell.latitude > 60) {
        mountainRun += incrementMountainRun(cell, mountainRun)
        highestMountain = changeHighestMountain(cell, highestMountain, mountainRun)
        cell.mountainRun = mountainRun;
        cell.highestMountain = highestMountain
      }
      setWindReference(cell) 
    }
  }
}
}

function setSimpleCurrentsWestCoast(cell) {
  if (cell.latitude < 10) {
    cell.neutralCurrent = true
  } else if (cell.latitude > 59 && cell.hemisphere === "N") {
    cell.warmCurrent = true;
  } else if (cell.latitude > 59 && cell.hemisphere === "S") {
    cell.neutralCurrent = true
  } else {
    cell.coldCurrent = true
  }
}

function setSimpleCurrentsEastCoast(cell) {
  if (cell.latitude < 10) {
    cell.neutralCurrent = true
  } else if (cell.latitude > 59 && cell.hemisphere === "N") {
    cell.coldCurrent = true;
  } else if (cell.latitude > 59 && cell.hemisphere === "S") {
    cell.neutralCurrent = true
  } else {
    cell.warmCurrent = true;
  }
}

function incrementMountainRun(cell, mountainRun) {
  if (cell.elevation > 254) {
    return 1
  } else {
    if (mountainRun > 0) {
      return -1
    } else {
      return 0
    }
  }
}

/*
function setWindReference(cell) {
  let lat = cell.latitude;
  let hem = cell.hemisphere
  if (hem === "N") {
    if (lat < 30) {
      cell.windReference = 10
    } else if (lat < 60) {
      cell.windReference = -10
    } else {
      cell.windReference = 5
    }
  } else {
    if (lat < 30) {
      cell.windReference = -10
    } else if (lat < 60) {
      cell.windReference = 10
    } else {
      cell.windReference = 5
    }
  }
  if (world.width === 1024) {
    cell.windReference *= 2
  } else if (world.width === 2048) {
    cell.windReference *= 4
  } else if (world.width === 4096) {
    cell.windReference *= 8
  } else if (world.width === 8192) {
    cell.windReference *= 16
  }
  let refCell = xy(cell.x, cell.y + windReference);
}
  */

function setWindReference(cell) {
  let lat = cell.latitude;
  let hem = cell.hemisphere;

  // Determine the initial wind reference based on the latitude and hemisphere
  if (hem === "N") {
    if (lat < 30) {
      cell.windReference = 10;
    } else if (lat < 60) {
      cell.windReference = -10;
    } else {
      cell.windReference = 5;
    }
  } else {
    if (lat < 30) {
      cell.windReference = -10;
    } else if (lat < 60) {
      cell.windReference = 10;
    } else {
      cell.windReference = 5;
    }
  }

  // Scale the wind reference based on the world width
  if (world.width === 1024) {
    cell.windReference *= 2;
  } else if (world.width === 2048) {
    cell.windReference *= 2;
  } else if (world.width === 4096) {
    cell.windReference *= 2;
  } else if (world.width === 8192) {
    cell.windReference *= 5;
  }

  // Calculate the reference cell coordinates
  let refCell = xy(cell.x, cell.y + cell.windReference);

  // Adjust the windReference to ensure refCell is in the same latitudinal band
  if (refCell) {
    let sameBand
    let refLat = refCell.latitude;
    if (hem === "N") {
      if (lat < 30 && refLat < 30) {
        sameBand = true;
      } else if (lat >= 30 && lat < 60 && refLat >= 30 && refLat < 60) {
        sameBand = true;
      } else if (lat >= 60 && refLat >= 60) {
        sameBand = true;
      }
    } else {
      if (lat < 30 && refLat < 30) {
        sameBand = true;
      } else if (lat >= 30 && lat < 60 && refLat >= 30 && refLat < 60) {
        sameBand = true;
      } else if (lat >= 60 && refLat >= 60) {
        sameBand = true;
      }
    }
    if (!sameBand) {
      cell.windReference = Math.floor(cell.windReference / 2)
    } 
  }
}




//let windMap = createWindMap(24, 18)


function setTemperatures() {
  
  for (let i = 0; i < world.map.length; i++) {
    let moisture = 500
    let lastOceanX = 0
    let waterCount = 0; //something is wrong with approach to watercount
    let lastElevation = 38;
    let runArid = false;
    let totalSlope = 1
    let totalDescent = 1
    let mountainRun = 0
    for (let j = 0; j < world.map[i].length; j++) {
      let cell = xy(j, i)
      let below = xy(j, i + cell.windReference)
      if (cell.elevation > 254) {
        mountainRun += 1;
      } else {
        mountainRun -= 1
        if (mountainRun < 0) {
          mountainRun = 0;
        }
      }
      if (cell.elevation < 38) {
        moisture += 1;
      } else {
        moisture -= 1 / world.width;
      }
      if (moisture > 500) {
        moisture = 500
      }
      if (moisture < 1) {
        moisture = 1
      }
      getTemperature(cell)
      if (cell.elevation < 38 && waterCount > world.width / 10) {
        runArid = false;
        totalSlope = 1
        totalDescent = 1
      }
      if (cell.elevation < 38 && waterCount > world.width / 10) {
        lastOceanX = j
      } else {
        if (cell.elevation > 37) {
          cell.distanceFromWestCoast = j - lastOceanX
        }
      }
      if (cell.latitude > 29 && cell.latitude < 60) {
        if (cell.elevation < 38 && waterCount > (world.width / 10)) {
          lastOceanX = j
          waterCount += 1;
        } else if (cell.elevation < 38) {
          waterCount += 1
        } else if (cell.elevation > 37) {
          if (cell.elevation > lastElevation) {
            totalSlope += cell.elevation - lastElevation
          } else if (runArid) {
            totalDescent += lastElevation - cell.elevation
          }
          lastElevation = cell.elevation
          waterCount = 0
          cell.distanceFromWestCoast = j - lastOceanX
          let modifier = Math.floor(cell.distanceFromWestCoast / 100)
          cell.temperature += modifier;
          //delete
          if (cell.elevation > 255) {
            runArid = true;
          }
          if (totalSlope > 1000) {
            totalSlope = 1000
          }
          if (totalDescent > 1000) {
            totalDescent = 1000
          }
          //cell.precipitation = 400
          cell.precipitation = Math.floor((1 - cell.distanceFromWestCoast / (world.width * 2)) * (300 + waterCount) * (getLatitudeFactor(cell)) * (1 - totalDescent / 2001)) // * randFactor

          if (cell.elevation < 255 && below) {
            if (below.mountainRun && below.mountainRun > 0) { //hamhanded attempt to deal with ocean or off screen grabs
              cell.precipitation -= below.mountainRun
            } else {
              //do nothing
            }
          }
          cell.precipitation = Math.floor(cell.precipitation * 1)
          cell.summerPrecipitation = cell.precipitation;
          cell.winterPrecipitation = cell.precipitation;
        } else {
          cell.distanceFromWestCoast = j - lastOceanX
          let modifier = Math.floor(cell.distanceFromWestCoast / 100)
          cell.temperature += modifier;
        }
      }

      if (cell.latitude > 59) {
        if (cell.elevation < 38 && waterCount > 50) {
          lastOceanX = j
          waterCount += 1;
        } else if (cell.elevation < 38) {
          waterCount += 1
        } else if (cell.elevation > 37) {
          waterCount = 0
          cell.distanceFromWestCoast = j - lastOceanX
        }
      }


    }
    lastOceanX = world.map[i].length - 1;
    waterCount = 0
    slope = 0
    runArid = false;
    totalDescent = 1
    moisture = 400
    mountainRun = 0
    for (let j = world.map[i].length - 1; j >= 0; j--) {
      let cell = xy(j, i)
      let below = xy(j, i + cell.windReference)
      if (cell.elevation > 254) {
        mountainRun += 1;
      } else {
        mountainRun -= 1
        if (mountainRun < 0) {
          mountainRun = 0;
        }
      }
      if (cell.elevation < 38 && waterCount > 50) {
        lastOceanX = j
      } else if (cell.elevation > 37) {
        cell.distanceFromEastCoast = lastOceanX - j
      }
      if (cell.latitude < 30) {
        if (waterCount > 50) {
          runArid = false;
          totalSlope = 1
          totalDescent = 1 
        }
        if (cell.elevation < 38 && waterCount > 50) {

          lastOceanX = j
          waterCount += 1;
        } else if (cell.elevation < 38) {
          waterCount += 1
        } else if (cell.elevation > 37) {
          if (cell.elevation > lastElevation) {
            totalSlope += cell.elevation - lastElevation
          } else if (runArid) {
            totalDescent += lastElevation - cell.elevation
          }
          lastElevation = cell.elevation
          waterCount = 0
          cell.distanceFromEastCoast = lastOceanX - j
          let modifier = Math.floor(cell.distanceFromEastCoast / 100)
          cell.temperature -= modifier;
          //delete
          if (cell.elevation > 255) {
            runArid = true;
          }
          if (totalSlope > 1000) {
            totalSlope = 1000
          }
          if (totalDescent > 1000) {
            totalDescent = 1000
          }
          cell.totalDescent = totalDescent;
          //cell.precipitation = 400
          cell.precipitation = Math.floor((1 - cell.distanceFromEastCoast / world.width) * (300 + waterCount) * getLatitudeFactor(cell) * (1 - totalDescent / 2001)) // * randFactor
          if (cell.elevation < 255 && below) {
            if (below.mountainRun && below.mountainRun > 0) { //hamhanded attempt to deal with ocean or off screen grabs
              cell.precipitation -= below.mountainRun
            } else {
              //do nothing
            }
          }
          cell.precipitation = Math.floor(cell.precipitation * 1)
          cell.summerPrecipitation = cell.precipitation;
          cell.winterPrecipitation = cell.precipitation;
        } else {
          cell.distanceFromEastCoast = lastOceanX - j
          let modifier = Math.floor(cell.distanceFromEastCoast / 100)
          cell.temperature -= modifier;
        }
      } else if (cell.latitude > 59) {
        if (waterCount > 50) {
          runArid = false;
          totalSlope = 1
          totalDescent = 1 
        }
        if (cell.elevation < 38 && waterCount > 50) {
          lastOceanX = j
          waterCount += 1;
        } else if (cell.elevation < 38) {
          waterCount += 1;
        } else if (cell.elevation > 37) {
          if (cell.elevation > lastElevation) {
            totalSlope += cell.elevation - lastElevation
          } else if (runArid) {
            totalDescent += lastElevation - cell.elevation
          }
          lastElevation = cell.elevation
          waterCount = 0
          cell.distanceFromEastCoast = lastOceanX - j
          let modifier = Math.floor(cell.distanceFromEastCoast / 100)
          cell.temperature -= modifier;
          //delete
          if (cell.elevation > 255) {
            runArid = true;
          }
          if (totalSlope > 1000) {
            totalSlope = 1000
          }
          if (totalDescent > 1000) {
            totalDescent = 1000
          }
          cell.totalDescent = totalDescent;
          //cell.precipitation = 400
          cell.precipitation = Math.floor((1 - cell.distanceFromEastCoast / world.width) * (300 + waterCount) * getLatitudeFactor(cell) * (1 - totalDescent / 2001))
          if (cell.elevation < 255 && below.mountainRun && below.mountainRun > 0) { //hamhanded attempt to deal with ocean or off screen grabs
            cell.precipitation -= below.mountainRun
          } else {
            //do nothing
          }
          cell.precipitation = Math.floor(cell.precipitation * 1)
          cell.summerPrecipitation = cell.precipitation;
          cell.winterPrecipitation = cell.precipitation;
        } else {
          cell.distanceFromEastCoast = lastOceanX - j
          let modifier = Math.floor(cell.distanceFromEastCoast / 100)
          cell.temperature += modifier;
        }
      }
    }
  }
}

settings.month = "December"

function getWindCellFromMap(mapX, mapY) {
  //returns a wind map cell based on regular map coordinates
  let windX = Math.floor(mapX / world.width * world.windMap.width)
  let windY = Math.floor(mapY / world.height * world.windMap.height)
  let windCell = world.windMap[windY][windX]
  return windCell
}

function getWindCell(x, y) {
  return world.windMap[y][x]
}

let highPressureSystems = []


//drawWindArrows(canvas, ctx, windMap, "icons/northArrow.jpg")

function drawWindArrows(canvas, ctx, windMap, imagePath) {
  // Load the directional arrow image
  const img = new Image();
  img.src = imagePath;

  img.onload = () => {
      const cellWidth = canvas.width / windMap[0].length;
      const cellHeight = canvas.height / windMap.length;

      // Iterate over the windMap cells
      for (let i = 0; i < windMap.length; i++) {
          for (let j = 0; j < windMap[i].length; j++) {
              const windCell = windMap[i][j];
              if (windCell.windDirection !== "unknown") {
                  const x = j * cellWidth;
                  const y = i * cellHeight;

                  // Save context state
                  ctx.save();

                  // Move context to the center of the cell
                  ctx.translate(x + cellWidth / 2, y + cellHeight / 2);

                  // Rotate based on wind direction
                  switch (windCell.windDirection) {
                      case "north":
                          ctx.rotate(0);
                          break;
                      case "northeast":
                          ctx.rotate(Math.PI / 4);
                          break;
                      case "east":
                          ctx.rotate(Math.PI / 2);
                          break;
                      case "southeast":
                          ctx.rotate((3 * Math.PI) / 4);
                          break;
                      case "south":
                          ctx.rotate(Math.PI);
                          break;
                      case "southwest":
                          ctx.rotate((-3 * Math.PI) / 4);
                          break;
                      case "west":
                          ctx.rotate(-Math.PI / 2);
                          break;
                      case "northwest":
                          ctx.rotate(-Math.PI / 4);
                          break;
                  }

                  // Draw the arrow image
                  ctx.drawImage(img, -cellWidth / 4, -cellHeight / 4, cellWidth / 2, cellHeight / 2);

                  // Restore context state
                  ctx.restore();
              }
          }
      }
  };

  img.onerror = () => {
      console.error("Failed to load the image:", imagePath);
  };
}

function createWindMap(width, height) {
  world.windMap = []
  world.windMap.width = width;
  world.windMap.height = height
  let wSize = Math.floor(world.width / width);
  let hSize = Math.floor(world.height / height)
  world.windMap.cellArea = wSize * hSize
  let equatorMod = (settings.equator / settings.height)
  let equator = Math.floor(equatorMod * height);
  world.windMap.equator = equator
  let northernSubTropicHigh = Math.floor(world.windMap.equator - height / 6)
  let southernSubTropicHigh = Math.floor(world.windMap.equator + height / 6)
  for (let i = 0; i < height; i++) {
    let arr = []
    for (let j = 0; j < width; j++) {
      let windCell = {}
      windCell.land = 0
      windCell.water = 0
      windCell.itcz = 0
      windCell.x = j;
      windCell.y = i;
      windCell.windDirection = "unknown"
      if (i === northernSubTropicHigh) {
        windCell.northernSubTropicHigh = true
      } else if (i === southernSubTropicHigh) {
        windCell.southernSubTropicHigh = true
      }
      arr.push(windCell)
    }
    world.windMap.push(arr);
  }
  for (let i = 0; i < world.map.length; i++) {
    for (let j = 0; j < world.map[i].length; j++) {
      let cell = xy(j, i);
      let windX = Math.floor(j / world.width * width)
      let windY = Math.floor(i / world.height * height)
      let windCell = world.windMap[windY][windX]
      if (cell.elevation > 37) {
        windCell.land += 1
      } else {
        windCell.water += 1
      }
    }
  }
  for (let i = 0; i < world.windMap.length; i++) {
    for (let j = 0; j < world.windMap[i].length; j++) {
      let windCell = world.windMap[i][j]
      if (windCell.land > windCell.water) {
        windCell.isLand = true;
      } else {
        windCell.isWater = true
      }
    }
  }

  return world.windMap
}

function interpolateArrayWrap(arr) {
  const n = arr.length;
  const result = [...arr];

  // Find indices of defined values
  const definedIndices = [];
  arr.forEach((val, i) => {
    if (val !== undefined) definedIndices.push(i);
  });

  // If no defined values, return as-is
  if (definedIndices.length === 0) return result;

  // If only one defined value, fill the entire array with it
  if (definedIndices.length === 1) {
    result.fill(arr[definedIndices[0]]);
    return result;
  }

  // Add the first index + n to handle circular wrapping
  definedIndices.push(definedIndices[0] + n);

  // Interpolate undefined values
  for (let i = 0; i < definedIndices.length - 1; i++) {
    const start = definedIndices[i];
    const end = definedIndices[i + 1];
    const startValue = arr[start % n];
    const endValue = arr[end % n];
    const steps = end - start;

    for (let j = 1; j < steps; j++) {
      const currentIndex = (start + j) % n;
      result[currentIndex] = Math.floor(startValue + ((endValue - startValue) * j) / steps);
    }
  }

  return result;
}

let oldWindITCZ = []

function runWindModel() {
  let height = world.windMap.height;
  let width = world.windMap.width;
  let equator = Math.floor(height / 2);
  let northernSubTropicHigh = Math.floor(world.windMap.equator - height / 6)
  console.log(northernSubTropicHigh)
  let southernSubTropicHigh = Math.floor(world.windMap.equator + height / 6)
  windITCZ = []

  for (let i = 0; i < world.windMap.height; i++) {
    for (let j = 0; j < world.windMap.width; j++) {
      let cell = getWindCell(j, i);
      if (cell.itcz > Math.floor(world.windMap.cellArea / 2)) {
        cell.isITCZ = true;
        windITCZ[cell.x] = i
      }
    }
  }
  for (let i = 0; i < world.windMap.height; i++) {
    for (let j = 0; j < world.windMap.width; j++) {
      let cell = getWindCell(j, i);
      if (cell.isITCZ) {
        cell.windDirection = "west"
      }
    }
  }

  console.log(windITCZ)
  oldWindITCZ = []
  for (let i = 0; i < windITCZ.length; i++) {
    oldWindITCZ.push(windITCZ[i])
  }
  oldWindITCZ = windITCZ
  windITCZ = interpolateArrayWrap(windITCZ);
  let last = windITCZ[windITCZ.length - 1]
  while (windITCZ.length < world.windMap.width) {
    windITCZ.push(last)
  }
  for (let j = 0; j < windITCZ.length; j++) {
    let cell = getWindCell(j, windITCZ[j])
    if (cell) {
      cell.windDirection = "west"
    }

  }
    

  //northern hemisphere
  let waterCount = 0;
  let lastCurrent;
  let landCount = 0;
  let passedLand = true;
  let lastCell = 10
  let first = true
  //scale the multipliers
  let one = Math.floor(world.windMap.height / 18)
  let two = Math.floor(world.windMap.height / 18 * 2)
  let three = Math.floor(world.windMap.height / 18 * 3)
  let four = Math.floor(world.windMap.height / 18 * 4)
  let five = Math.floor(world.windMap.height / 18 * 5)
  let six = Math.floor(world.windMap.height / 18 * 6)
  let seven = Math.floor(world.windMap.height / 18 * 7)
  let eight = Math.floor(world.windMap.height / 18 * 8)

  for (let j = 0; j < world.windMap.width; j++) {
    let itczAdjustment = Math.floor(windITCZ[j] - (height / 6))
    let circCellX = j;
    let circCellY = itczAdjustment
    let windCell;
    if (world.windMap[itczAdjustment]) {
      windCell = world.windMap[itczAdjustment][j]
    }
 

    if (windCell) {
      if (windCell.isWater) {
        waterCount += 1;
        lastCell += 1
        landCount = 0
      } else {
        passedLand = true
        waterCount = 0;
        landCount += 1
      }
    } else {
      passedLand = true
      waterCount += 1;
      lastCell += 1;
      landCount = 0
    }

    if ((waterCount === two && first === true) || (waterCount === four || landCount === three) && passedLand && lastCell > seven) {
      first = false
      lastCell = 0
      if (windCell) {
        highPressureSystems.push(windCell)
        windCell.isHighPressure = true;
        windCell.westwardReach = 3
      }
      //windCell.windDirection = "east"

      let equator = world.windMap.equator 
      for (let n = 0; n < world.windMap.height; n++) {
        for (let z = 0; z < world.windMap.width; z++) {
          let limit;
          if (windITCZ[z]) {
            limit = windITCZ[z]
          } else {
            limit = world.windMap.equator;
          }
          let c = world.windMap[n][z]
          if (n === limit) { // ITCZ
            c.oceanCurrent = "neutral"
          } else if (n < limit) {
            if (c.y < limit) {
              if (c === windCell) {
                //do nothing
              } else if (c.windDirection === "unknown") {
                let d = getDistance(c.x, c.y, circCellX, circCellY)

                if (d > two && c.x < circCellX && d < five && c.y > circCellY) {
                  c.windDirection = "northwest"
                  c.oceanCurrent = "warm"
                } else if (d < five && c.x < circCellX && c.y === circCellY) {
                  c.windDirection = "northwest"
                  c.oceanCurrent = "warm"
                } else if (c.x > circCellX && d < five && c.y < circCellY) {
                  c.windDirection = "southeast"
                  c.oceanCurrent = "cold"
                } else if (d > three && d < five && c.y === circCellY && c.x > circCellX) {
                  c.windDirection = "south"       
                  c.oceanCurrent = "cold"
                } else if (d > three && d < five && c.y > circCellY && c.x > circCellX) {
                  c.windDirection = "southwest"
                  c.oceanCurrent = "cold"       
                } else if (d < five) {
                  if (d > two && c.y < circCellY) {
                    if (c.x <= circCellX + 1) {
                      c.windDirection = "northeast"
                      c.oceanCurrent = "warm"
                    } else {
                      c.windDirection = "east"
                      c.oceanCurrent = "warm"
                    }
  
                  } else if (c.y < circCellY) {
                    if (c.x > circCellX) {
                      c.windDirection = "southeast"
                      c.oceanCurrent = "cold"
                    } else {
                      c.windDirection = "northeast"
                      c.oceanCurrent = "warm"
                    }
                    
                  } else if (c.x < circCellX && c.y < circCellY) {
                    c.windDirection = "northeast"
                    c.oceanCurrent = "warm"
                  } else {
                    c.windDirection = "southwest"
                    c.oceanCurrent = "cold"
                  }
                } 
              }
            }
          }   
        }
      }
      waterCount = 0
      passedLand = false;
    }
  }


  //EVERYTHING SOUTHwest IN NORTHERN HEMISPHERE IF NOT ASSIGNED
  
  for (let n = 0; n < world.windMap.height; n++) {
    for (let z = 0; z < world.windMap.width; z++) { 
      let limit;
      if (windITCZ[z]) {
        limit = windITCZ[z]
      } else {
        limit = world.windMap.equator;
      }
      if (n < limit) {
        let c = world.windMap[n][z]
        if (c.windDirection === "unknown" && !c.isHighPressure) {
          c.windDirection = "southwest"
          c.oceanCurrent = "cold"
        }
      }
    }
  }
  
    
  

    //southern hemisphere

  waterCount = 0;
  passedLand = true;
  lastCell = 10
  landCount = 0
  first = true;
  for (let j = 0; j < world.windMap.width; j++) {
    let itczAdjustment = Math.floor(windITCZ[j] + height / 6)
    let circCellX = j;
    let circCellY = itczAdjustment
    let windCell;
    let next;
    let last;
    if (world.windMap[itczAdjustment]) {
      windCell = world.windMap[itczAdjustment][j]
      next = windCell = world.windMap[itczAdjustment][j + 1]
      last = windCell = world.windMap[itczAdjustment][j - 1]
    }

    let neighborsLand = false
    if (windCell && windCell.isWater) {
      for (let i = 0; i < 5; i++) { // need to scale this for wind map size
        let c = world.windMap[itczAdjustment][j + i]
        let cw = world.windMap[itczAdjustment][j - i]
        if (c && c.isWater === false) {
          neighborsLand = true;
        }
        if (cw && cw.isWater === false) {
          neighborsLand = true;
        }
      }
    }
 

    if (windCell) {
      if (windCell.isWater) {
        waterCount += 1;
        lastCell += 1
        landCount = 0
      } else {
        passedLand = true
        waterCount = 0;
        landCount += 1
      }
    } else {
      passedLand = true
      waterCount += 1;
      lastCell += 1;
      landCount = 0
    }

    if (!neighborsLand && (waterCount === two && first === true) || (waterCount === four) && passedLand && lastCell > seven && first === false || lastCell > eight) { // || landCount === three
      if (first) {
        first = false
      }
      lastCell = 0
      
      if (windCell) {
        highPressureSystems.push(windCell)
        windCell.isHighPressure = true;
        windCell.westwardReach = 3
      }

      //windCell.windDirection = "west"
      waterCount = 0
      passedLand = false;

      for (let n = 0; n < world.windMap.height; n++) {
        for (let z = 0; z < world.windMap.width; z++) {
          let limit;
          if (windITCZ[z]) {
            limit = windITCZ[z]
          } else {
            limit = world.windMap.equator;
          }
          let c = world.windMap[n][z]
          if (n === limit) {
            c.oceanCurrent = "neutral"
          } else if (n > limit) { // should be the ITCZ
            
            if (c.y > limit) {
              //need to add a check for how far north
              if (c === windCell) {
                //do nothing
              } else if (c.windDirection === "unknown") {
                let d = getDistance(c.x, c.y, circCellX, circCellY)
                if (d > four && d < five && c.y === circCellY && c.x < circCellX) {
                  c.windDirection = "south"
                  c.oceanCurrent = "warm"       
                } else if (d < five) {
                  if (d > 2 && c.y > circCellY) {
                    if (c.x > circCellX) {
                      c.windDirection = "northeast"
                      c.oceanCurrent = "cold"
                    } else {
                      c.windDirection = "southeast"
                      c.oceanCurrent = "warm"
                    }
                    
                  } else if (c.y > circCellY && c.x < circCellX) {
                    c.windDirection = "southeast"
                    c.oceanCurrent = "warm"
                  } else if (c.x > circCellX && c.y > circCellY) {
                    c.windDirection = "northeast"
                    c.oceanCurrent = "cold"
                  } else if (c.x < circCellX) {
                    c.windDirection = "southwest"
                    c.oceanCurrent = "warm"
                  } else if (c.x > circCellX) {
                    c.windDirection = "northwest"
                    c.oceanCurrent = "cold"
                  } else if (c.x === circCellX && circCellY > c.y) {
                    c.windDirection = "west"
                  } else if (c.x === circCellX && circCellY < c.y) {
                    c.windDirection = "east"
                    c.oceanCurrent = "cold"
                  } else {
                    //c.windDirection = "northeast"
                  }
                } else if (c.y < circCellY && d < five) {
                  if (c.x > circCellX) {
                    c.windDirection = "northwest"
                  } else if (c.x === circCellX) {
                    c.windDirection = "west"
                    c.oceanCurrent = "warm"
                  } else if (c.x < circCellX) {
                    c.windDirection = "southwest"
                    c.oceanCurrent = "warm"
                  }
                } else if (c.y === circCellY && c.x < circCellX && d < five) {
                  c.windDirection = "southwest"
                  c.oceanCurrent = "warm"
                } else if (c.y === circCellY && c.x > circCellX && d < five) {
                  c.windDirection = "northwest"
                  c.oceanCurrent = "cold"
                }
              } 
            }   
          }
        }
      }
    } 
  }

  
    //EVERYTHING northwest IN southern HEMISPHERE IF NOT ASSIGNED
    for (let n = 0; n < world.windMap.height; n++) {
      for (let z = 0; z < world.windMap.width; z++) { 
        let limit;
        if (windITCZ[z]) {
          limit = windITCZ[z]
        } else {
          limit = world.windMap.equator;
        }
        if (n > limit) {
          let c = world.windMap[n][z]

          if (c.windDirection === "unknown" && !c.isHighPressure) {
            c.windDirection = "northwest"
            c.oceanCurrent = "cold"
          }
        }
      }
    }
      
}


function seedWind(x, y, rotation, initialDirection, hemisphere) {
  let windCell = world.windMap[y][x]
  windCell.highPressureSeed = true;
  windCell.spin = rotation
  windCell.initialDirection = initialDirection
  windCell.hemisphere = "northern"
}

let clockwiseDirections = [
  "east",
  "southeast",
  "south",
  "southwest",
  "west",
  "northwest",
  "north",
  "northeast"
]

function trackIncomingWind(world) {
  const rows = world.windMap.length;
  const cols = world.windMap[0].length;

  // Mapping directions to their coordinate changes
  const directions = {
      "northeast": [1, -1],
      "east": [1, 0],
      "southeast": [1, 1],
      "southwest": [-1, 1],
      "west": [-1, 0],
      "northwest": [-1, -1]
  };

  // Reverse mapping to check incoming wind
  const reverseDirections = {
      "northeast": [-1, 1],
      "east": [-1, 0],
      "southeast": [-1, -1],
      "southwest": [1, -1],
      "west": [1, 0],
      "northwest": [1, 1]
  };

  // Function to find neighbors sending wind toward the target cell
  function findIncomingNeighbors(x, y) {
      const incomingNeighbors = [];
      for (const [dir, [dx, dy]] of Object.entries(reverseDirections)) {
          const neighborX = x + dx;
          const neighborY = y + dy;

          // Check if neighbor is within bounds
          if (
              neighborX >= 0 &&
              neighborX < cols &&
              neighborY >= 0 &&
              neighborY < rows
          ) {
              const neighbor = world.windMap[neighborY][neighborX];
              if (neighbor && neighbor.windDirection === dir) {
                  incomingNeighbors.push(neighbor);
              }
          }
      }
      return incomingNeighbors;
  }



  // Function to calculate incoming wind path for a single cell
  function calculateIncomingWind(x, y) {
      let windXMult = Math.floor(world.windMap.width / world.width);
      let windYMult = Math.floor(world.windMap.height / world.height);
      let lastCurrent;
      let lastCurrentLocation;
      let landCount = 0;
      let waterCount = 0;

      // Find all neighbors sending wind to this cell
      let incomingCells = findIncomingNeighbors(x, y);

      // Track back up to 6 layers
      for (let steps = 0; steps < 20 && incomingCells.length > 0; steps++) {
          const nextIncoming = [];

          for (const cell of incomingCells) {
              if (cell.isWater) {
                  lastCurrent = cell.oceanCurrent
                  let lastX = cell.x * windXMult
                  let lastY = cell.y * windYMult
                  lastCurrentLocation = [lastX, lastY]
                  waterCount++;
              } else {
                  landCount++;
              }

              // Check the neighbors of the current incoming cell for the next step
              const neighbors = findIncomingNeighbors(cell.x, cell.y);
              nextIncoming.push(...neighbors);
          }

          incomingCells = nextIncoming; // Prepare for the next layer
      }

      return { landCount, waterCount, lastCurrent, lastCurrentLocation};
  }

  // Iterate over each cell and calculate incoming wind
  const windTracking = [];
  for (let y = 0; y < rows; y++) {
      windTracking[y] = [];
      for (let x = 0; x < cols; x++) {
          windTracking[y][x] = calculateIncomingWind(x, y);
          world.windMap[y][x].waterCount = windTracking[y][x].waterCount;
          world.windMap[y][x].landCount = windTracking[y][x].landCount;
          world.windMap[y][x].lastCurrent = windTracking[y][x].lastCurrent;
          world.windMap[y][x].lastCurrentLocation = windTracking[y][x].lastCurrentLocation
      }
  }

  return windTracking; // Return a map of incoming land and water counts for each cell
}

function advanceWind(seed) {
  seed.windDirection = seed.iniitalDirection;
  let blocked = false;
  let next = seed
  let lastDirection = seed.windDirection;
  while (blocked === false) {
    next = getWindCellByDirection(next, lastDirection)
    if (lastDirection === "N") {
      lastDirection = "E"
    } else if (lastDirection === "E") {
      lastDirection = "SW"
    } else if (lastDirection === "W") {
      lastDirection = "N"
    }
  }
}

function getWindCellByDirection(from, direction) {
  let next;
  if (direction === "east") {
    next = getWindCell(from.x + 1, from.y)
  } else if (direction === "southeast") {
    next = getWindCell(from.x + 1, from.y + 1)
  } else if (direction === "south") {
    next = getWindCell(from.x, from.y + 1)
  } else if (direction === "southwest") {
    next = getWindCell(from.x - 1, from.y + 1) 
  } else if (direction === "west") {
    next = getWindCell(from.x - 1, from.y);
  } else if (direction === "northwest") {
    next = getWindCell(from.x - 1, from.y - 1);
  } else if (direction === "north") {
    next = getWindCell(from.x, from.y - 1);
  } else if (direction === "northeast") {
    next = getWindCell(from.x + 1, from.y - 1)
  }
  return next;
}
 

let windITCZ = []

function getTemperature(cell) {
  let latitude = getSmallCellLatitude(cell);
  cell.latitude = latitude
  let windCell = getWindCellFromMap(cell.x, cell.y)

  let adjustedColor = Math.floor(cell.uncorrectedLatitude * 2.5) //Math.floor(latitude * 2.5) // we're just trying for sea here, which goes to this at the lowest at equator
  
  if (cell.elevation > 37) {
    //adjust for elevation
    let num = Math.floor((cell.elevation - 37) / 10); //7
    adjustedColor += num
  }

  //seasonal adjustments
  let adjustedWinterColor = adjustedColor;
  if (cell.hemisphere === "N") { //WINTER IN NORTHERN HEMI
    adjustedWinterColor += Math.floor((90 - cell.latitude) / 4);
    //adjustedWinterColor += Math.floor(3 * windCell.waterCount / windCell.landCount); // continentality?
  } else if (cell.hemisphere === "S") { //If it is winter in northern hemi, then it is summer in southern so ITCZ
    
    
    //ITCZ
    let mod = (cell.x - cell.westCoast) / (world.width);
    let num = mod * 30;
    if (cell.latitude > num && cell.latitude < num + 3) {
      adjustedWinterColor -= 15
      if (settings.month === "December") {
        windCell.itcz += 1
      }
    }
    //adjustedWinterColor += Math.floor(3 * windCell.waterCount / windCell.landCount); // continentality?
    adjustedWinterColor -= Math.floor((90 - cell.latitude) / 4);
  }
  cell.winterTemp = adjustedWinterColor


  if (cell.hemisphere === "N") { //SUMMER IN NORTHERN HEMI
    let mod = (cell.x - cell.westCoast) / (world.width);
    let num = mod * 30;
    if (cell.latitude > num && cell.latitude < num + 3) {
      adjustedColor -= 15
      if (settings.month === "June") {
        windCell.itcz += 1     
      }
    }
    //adjustedColor += Math.floor(3 * windCell.waterCount / windCell.landCount); //continentality?
    adjustedColor -= Math.floor((90 - cell.latitude) / 4);
  } else if (cell.hemisphere === "S") { //if summer in northern hemi, then winter in southern
    adjustedColor += Math.floor((90 - cell.latitude) / 4);
    //adjustedColor += Math.floor(3 * windCell.waterCount / windCell.landCount); //continentality?
  }
  cell.summerTemp = adjustedColor;

  /*
  if (settings.month === "December") { //WINTER

    cell.winterTemp = adjustedWinterColor
  } else if (settings.month === "June") { //SUMMER 

  }
  */

  if (cell.temperature) {
    //cell.temperature = adjustedColor; //WHY DID I HAVE THIS AS ADD AND NOT EQUALS ORIGINALLY?
    cell.temperature = adjustedColor;
  } else {
    cell.temperature = adjustedColor;
  }
}

function convertToGradient(input) {
  const inputMin = 0;
  const inputMax = 2;
  const outputMin = 0;
  const outputMax = 400;

  if (input < inputMin || input > inputMax) {
      throw new Error("Input must be between 0 and 2.");
  }

  // Linear mapping formula
  const output = ((input - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin;

  return Math.floor(output);
}

function koppenColor(cell) {

}

function setNumerics() {
  for (let i = 0; i < world.map.length; i++) {
    for (let j = 0; j < world.map[i].length; j++) {
      let cell = xy(j, i)
      setNumericsCell(cell)
    }
  }
}

function setNumericsCell(cell) {

  let temp = cell.temperature;
  temp = (400 - temp) / 2.7 - 89 //convert to celsius (400 - temp) / 2.7 - 129
  let winterTemp = cell.winterTemp;
  winterTemp = (400 - winterTemp) / 2.7 - 109
  cell.numericSummerTemp = temp //celsius
  cell.numericWinterTemp = winterTemp
  cell.numericSummerPrecipitation = cell.summerPrecipitation * 25.4;
  cell.numericWinterPrecipitation = cell.winterPrecipitation * 25.4

  cell.numericPrecipitation = cell.precipitation * 25.4
  //https://www.eldoradoweather.com/climate/world-maps/world-annual-precip-map.html shows precip map in inches up to 400 - just convert to mM
}

function isCoastalWindCell(windCell) {
  // Define the directions for adjacent cells (including diagonals)
  const directions = [
    { dx: -1, dy: -1 }, // NW
    { dx: 0, dy: -1 },  // N
    { dx: 1, dy: -1 },  // NE
    { dx: -1, dy: 0 },  // W
    { dx: 1, dy: 0 },   // E
    { dx: -1, dy: 1 },  // SW
    { dx: 0, dy: 1 },   // S
    { dx: 1, dy: 1 }    // SE
  ];

  // Loop through all adjacent cells
  for (let dir of directions) {
    let adjacentCellY = world.windMap[windCell.y + dir.dy]
    if (adjacentCellY) {
      let adjacentCell = adjacentCellY[windCell.x + dir.dx]
      if (adjacentCell && adjacentCell.isLand) {
        return true; 
      }
    }
  }
  return false;
}

function newGetOceanCurrentColor(cell) {
  let windCell = getWindCellFromMap(cell.x, cell.y)
  let colors = []
  let rgb
  if (windCell.isWater && isCoastalWindCell(windCell)) {
    if (windCell.oceanCurrent === "cold") {
      colors = [0, 0, 255]
    } else if (windCell.oceanCurrent === "warm") {
      colors = [255, 0, 0 ]
    } else if (windCell.oceanCurrent === "neutral") {
      colors = [255, 255, 255]
    }
    rgb = { r: colors[0], g: colors[1], b: colors[2]}
    cell.rgb = rgb
  } else {
    rgb = getReliefColor(cell)
  }
  
  return rgb
}

function newGetContinentalityColor(cell) {
  let windCell = getWindCellFromMap(cell.x, cell.y)
  cell.precipitation = Math.floor(200 * windCell.waterCount / windCell.landCount);
  let adjustedColor = cell.precipitation;
  let colors;
  if (adjustedColor) {

  } else {
    adjustedColor = 0
  }
  if (adjustedColor < 0) {
    adjustedColor = 0;
  }
  if (adjustedColor > temperatureColors.length - 1) {
    adjustedColor = temperatureColors.length - 1
  }
  colors = temperatureColors[adjustedColor]
  if (cell.elevation < 38) {
   colors = [0, 0, 0] 
  }
  if (cell.coldCurrent) {
    colors = [0, 0, 255]
  }
  if (cell.warmCurrent) {
    colors = [255, 0, 0]
  }
  if (cell.neutralCurrent) {
    colors = [255, 255, 255]
  }
  let rgb = { r: colors[0], g: colors[1], b: colors[2]}
  cell.rgb = rgb
  return rgb
}

function newGetPrecipitationColor(cell) {

  //calculateMonthlyPrecipitation(world, cell.x, cell.y, world.windMap)
  /*
  let windCell = getWindCellFromMap(cell.x, cell.y)
  let p = cell.precipitation;
  let continentalEffect = Math.floor(5 * windCell.waterCount / windCell.landCount)
  p -= continentalEffect;

  if (settings.month === "June") {
    cell.summerPrecipitation = p
    cell.precipitation = p
  } else if (settings.month === "December") {
    cell.winterPrecipitation = p 
    cell.precipitation = p
  }
  cell.precipitation = p
  */
  let adjustedColor = Math.floor(1 * cell.precipitation);
  let colors;
  if (adjustedColor) {

  } else {
    adjustedColor = 0
  }
  if (adjustedColor < 0) {
    adjustedColor = 0;
  }
  if (adjustedColor > temperatureColors.length - 1) {
    adjustedColor = temperatureColors.length - 1
  }
  colors = temperatureColors[adjustedColor]
  if (cell.elevation < 38) {
   colors = [0, 0, 0] 
  }
  if (cell.coldCurrent) {
    colors = [0, 0, 255]
  }
  if (cell.warmCurrent) {
    colors = [255, 0, 0]
  }
  if (cell.neutralCurrent) {
    colors = [255, 255, 255]
  }
  let rgb = { r: colors[0], g: colors[1], b: colors[2]}
  cell.rgb = rgb
  return rgb
}

function newGetTemperatureColor(cell) {
  let adjustedColor = cell.temperature;
  if (settings.month === "June") {
    adjustedColor = cell.summerTemp;
  } else if (settings.month === "December") {
    adjustedColor = cell.winterTemp
  }
  adjustedColor += 38 // fix for starting at equator do we need to change for ITCZ
  if (adjustedColor) {

  } else {
    adjustedColor = 0
  }
  if (adjustedColor < 0) {
    adjustedColor = 0;
  }
  if (adjustedColor > temperatureColors.length - 1) {
    adjustedColor = temperatureColors.length - 1
  }
    

  let colors = temperatureColors[adjustedColor]
  if (cell.elevation < 38) {
   colors = [0, 0, 0] 
  }
  /*
  if (cell.coldCurrent) {
    colors = [0, 0, 255]
  }
  if (cell.warmCurrent) {
    colors = [255, 0, 0]
  }
  if (cell.neutralCurrent) {
    colors = [255, 255, 255]
  }
    */

  let rgb = { r: colors[0], g: colors[1], b: colors[2]}
  cell.rgb = rgb
  return rgb
}



/**
 * Maps a temperature to the corresponding color in the temperatureColors array.
 * @param {number} t - The temperature in Celsius.
 * @returns {Array} - The RGB color array.
 */
function getColorForTemperature(t) {
    // Clamp the temperature within the defined range
    if (t > maxTemp) t = maxTemp;
    if (t < minTemp) t = minTemp;
    
    // Normalize the temperature to a 0-1 scale
    const normalized = (t - minTemp) / tempRange;
    
    // Calculate the corresponding index in the color array
    const index = Math.round(normalized * (numTempColors - 1));
    
    return temperatureColors[index];
}





  function getReliefColor(cell) {
    let rgb = { r: 255, g: 255, b: 255 }; // Default white
  
    if (cell.elevation < -230) {
      rgb = {
        r: 39,
        g: 22,
        b: 123,
      }; 
    } else if (cell.elevation < -205) {
      rgb = {
        r: 47,
        g: 37,
        b: 152,
      }; 
    } else if (cell.elevation < -180) {
      rgb = {
        r: 56,
        g: 52,
        b: 179,
      }; 
    } else if (cell.elevation < -155) {
      rgb = {
        r: 66,
        g: 66,
        b: 205,
      }; 
    } else if (cell.elevation < - 130) {
      rgb = {
        r: 70,
        g: 74,
        b: 214,
      }; 
    } else if (cell.elevation < -105) {
      rgb = {
        r: 74,
        g: 86,
        b: 214,
      }; 
    } else if (cell.elevation < -80) {
      rgb = {
        r: 78,
        g: 96,
        b: 217,
      }; 
    } else if (cell.elevation < -55) {
      rgb = {
        r: 85,
        g: 108,
        b: 220,
      }; 
    } else if (cell.elevation < -30) {
      rgb = {
        r: 101,
        g: 130,
        b: 233,
      }; 
    } else if (cell.elevation < -5) {
      rgb = {
        r: 125,
        g: 154,
        b: 230,
      }; 
    } else if (cell.elevation <= limits.seaLevel.upper) {
      rgb = {
        r: 155,
        g: 184,
        b: 237,
      }; 
    } else if (cell.elevation < 60) {
      rgb = {
        r: 32,
        g: 59,
        b: 39,
      }
    } else if (cell.elevation < 90) {
      rgb = {
        r: 45,
        g: 86,
        b: 56,
      }
    } else if (cell.elevation < 120) {
      rgb = {
        r: 95,
        g: 146,
        b: 94,
      }
    } else if (cell.elevation < 150) {
      rgb = {
        r: 130,
        g: 163,
        b: 103,
      }
    } else if (cell.elevation < 180) {
      rgb = {
        r: 166,
        g: 182,
        b: 110,
      }
    } else if (cell.elevation < 205) {
      rgb = {
        r: 201,
        g: 200,
        b: 118,
      }
    } else if (cell.elevation < 209) {
      rgb = {
        r: 226,
        g: 213,
        b: 124,
      }
    } else if (cell.elevation < 213) {
      rgb = {
        r: 231,
        g: 214,
        b: 124,
      }
    } else if (cell.elevation < 217) {
      rgb = {
        r: 228,
        g: 206,
        b: 118,
      }
    } else if (cell.elevation < 221) {
      rgb = {
        r: 222,
        g: 193,
        b: 107,
      }
    } else if (cell.elevation < 225) {
      rgb = {
        r: 215,
        g: 179,
        b: 95,
      }
    } else if (cell.elevation < 229) {
      rgb = {
        r: 208,
        g: 164,
        b: 84,
      }
    } else if (cell.elevation < 233) {
      rgb = {
        r: 202,
        g: 151,
        b: 71,
      }
    } else if (cell.elevation < 237) {
      rgb = {
        r: 195,
        g: 138,
        b: 60,
      }
    } else if (cell.elevation < 241) {
      rgb = {
        r: 188,
        g: 124,
        b: 48,
      }
    } else if (cell.elevation < 245) {
      rgb = {
        r: 182,
        g: 109,
        b: 37,
      }
    } else if (cell.elevation < 249) {
      rgb = {
        r: 176,
        g: 96,
        b: 24,
      }
    } else if (cell.elevation < 253) {
      rgb = {
        r: 160,
        g: 66,
        b: 1,
      }
    } else if (cell.elevation < 257) {
      rgb = {
        r: 158,
        g: 63,
        b: 3,
      }
    } else if (cell.elevation < 261) {
      rgb = {
        r: 156,
        g: 61,
        b: 4,
      }
    } else if (cell.elevation < 265) {
      rgb = {
        r: 151,
        g: 59,
        b: 4,
      }
    } else if (cell.elevation < 269) {
      rgb = {
        r: 144,
        g: 57,
        b: 5,
      }
    } else if (cell.elevation < 273) {
      rgb = {
        r: 137,
        g: 53,
        b: 6,
      }
    } else if (cell.elevation < 277) {
      rgb = {
        r: 130,
        g: 49,
        b: 8,
      }
    } else if (cell.elevation < 281) {
      rgb = {
        r: 123,
        g: 46,
        b: 8,
      }
    } else if (cell.elevation < 285) {
      rgb = {
        r: 115,
        g: 43,
        b: 10,
      }
    } else if (cell.elevation < 289) {
      rgb = {
        r: 101,
        g: 37,
        b: 11,
      }
    } else if (cell.elevation < 293) {
      rgb = {
        r: 93,
        g: 34,
        b: 12,
      }
    } else if (cell.elevation < 297) {
      rgb = {
        r: 90,
        g: 31,
        b: 13,
      }
    } else if (cell.elevation < 301) {
      rgb = {
        r: 89,
        g: 32,
        b: 13,
      }
    } else if (cell.elevation < 305) {
      rgb = {
        r: 90,
        g: 31,
        b: 12,
      }
    } else if (cell.elevation < 309) {
      rgb = {
        r: 90,
        g: 40,
        b: 23,
      }
    } else if (cell.elevation < 313) {
      rgb = {
        r: 92,
        g: 45,
        b: 28,
      }
    } else if (cell.elevation < 317) {
      rgb = {
        r: 92,
        g: 48,
        b: 33,
      }
    } else if (cell.elevation < 321) {
      rgb = {
        r: 93,
        g: 52,
        b: 38,
      }
    } else if (cell.elevation < 325) {
      rgb = {
        r: 94,
        g: 57,
        b: 44,
      }
    } else if (cell.elevation < 329) {
      rgb = {
        r: 95,
        g: 61,
        b: 50,
      }
    } else if (cell.elevation < 333) {
      rgb = {
        r: 95,
        g: 65,
        b: 55,
      }
    } else if (cell.elevation < 337) {
      rgb = {
        r: 96,
        g: 70,
        b: 61,
      }
    } else if (cell.elevation < 341) {
      rgb = {
        r: 97,
        g: 73,
        b: 65,
      }
    } else if (cell.elevation < 345) {
      rgb = {
        r: 97,
        g: 77,
        b: 71,
      }
    } else if (cell.elevation < 349) {
      rgb = {
        r: 98,
        g: 82,
        b: 76,
      }
    } else if (cell.elevation < 353) {
      rgb = {
        r: 100,
        g: 86,
        b: 82,
      }
    } else if (cell.elevation < 357) {
      rgb = {
        r: 100,
        g: 90,
        b: 86,
      }
    } else if (cell.elevation < 361) {
      rgb = {
        r: 100,
        g: 94,
        b: 92,
      }
    } else if (cell.elevation < 365) {
      rgb = {
        r: 101,
        g: 98,
        b: 97,
      }
    } else if (cell.elevation < 369) {
      rgb = {
        r: 105,
        g: 107,
        b: 108,
      }
    } else if (cell.elevation < 373) {
      rgb = {
        r: 104,
        g: 109,
        b: 109,
      }
    } else if (cell.elevation < 377) {
      rgb = {
        r: 105,
        g: 110,
        b: 111,
      }
    } else if (cell.elevation < 381) {
      rgb = {
        r: 107,
        g: 112,
        b: 113,
      }
    } else if (cell.elevation < 385) {
      rgb = {
        r: 108,
        g: 113,
        b: 115,
      }
    } else if (cell.elevation < 389) {
      rgb = {
        r: 108,
        g: 115,
        b: 117,
      }
    } else if (cell.elevation < 393) {
      rgb = {
        r: 110,
        g: 118,
        b: 119,
      }
    } else if (cell.elevation < 397) {
      rgb = {
        r: 110,
        g: 119,
        b: 120,
      }
    } else if (cell.elevation < 401) {
      rgb = {
        r: 116,
        g: 124,
        b: 127,
      }
    } else if (cell.elevation < 405) {
      rgb = {
        r: 120,
        g: 128,
        b: 130,
      }
    } else if (cell.elevation < 409) {
      rgb = {
        r: 123,
        g: 131,
        b: 133,
      }
    } else if (cell.elevation < 413) {
      rgb = {
        r: 127,
        g: 135,
        b: 136,
      }
    } else if (cell.elevation < 417) {
      rgb = {
        r: 131,
        g: 138,
        b: 140,
      }
    } else if (cell.elevation < 421) {
      rgb = {
        r: 119,
        g: 126,
        b: 127,
      }
    } else if (cell.elevation < 425) {
      rgb = {
        r: 145,
        g: 152,
        b: 154,
      }
    } else if (cell.elevation < 429) {
      rgb = {
        r: 148,
        g: 155,
        b: 156,
      }
    } else if (cell.elevation < 433) {
      rgb = {
        r: 152,
        g: 159,
        b: 160,
      }
    } else if (cell.elevation < 437) {
      rgb = {
        r: 155,
        g: 161,
        b: 163,
      }
    } else if (cell.elevation < 441) {
      rgb = {
        r: 159,
        g: 165,
        b: 167,
      }
    } else if (cell.elevation < 445) {
      rgb = {
        r: 163,
        g: 169,
        b: 170,
      }
    } else if (cell.elevation < 449) {
      rgb = {
        r: 166,
        g: 171,
        b: 173,
      }
    } else if (cell.elevation < 453) {
      rgb = {
        r: 170,
        g: 175,
        b: 176,
      }
    } else if (cell.elevation < 457) {
      rgb = {
        r: 173,
        g: 178,
        b: 179,
      }
    } else if (cell.elevation < 461) {
      rgb = {
        r: 177,
        g: 181,
        b: 182,
      }
    } else if (cell.elevation < 465) {
      rgb = {
        r: 180,
        g: 185,
        b: 186,
      }
    } else if (cell.elevation < 469) {
      rgb = {
        r: 185,
        g: 189,
        b: 190,
      }
    } else if (cell.elevation < 473) {
      rgb = {
        r: 188,
        g: 191,
        b: 192,
      }
    } else if (cell.elevation < 477) {
      rgb = {
        r: 191,
        g: 195,
        b: 196,
      }
    } else if (cell.elevation < 481) {
      rgb = {
        r: 194,
        g: 199,
        b: 199,
      }
    } else {
      rgb = {
        r: 200,
        g: 203,
        b: 203,
      }
    }
    return rgb
  }


  function getColorfulColor(cell) {
    let rgb = { r: 255, g: 255, b: 255 }; // Default white
    if (cell.elevation < limits.seaLevel.upper) {
      rgb = {
        r: 100 + Math.floor(cell.elevation / 5),
        g: 120 + Math.floor(cell.elevation / 5),
        b: 140 + Math.floor(cell.elevation / 5),
      };
    } else {
      const cellBiome = biome(cell);
  
      if (cellBiome === "beach") {
        rgb = drawBeachColor(cell);
      } else if (cell.elevation >= limits.mountains.lower) {
        rgb = drawMountainColor(cell);
      } else if (cell.terrain === "taiga" || (cell.climateCategory === "cold" && cell.terrain === "hills")) {
        rgb = drawArcticColor(cell);
      } else if (cell.terrain === "jungle") {
        rgb = drawJungleColor(cell);
      } else if (cell.climateCategory === "tropical" && cell.terrain === "hills") {
        rgb = drawJungleColor(cell);
      } else if (cell.terrain === "drylands") {
        rgb = drawDrylandsColor(cell);
      } else if (cell.terrain === "steppe") {
        rgb = drawSteppeColor(cell);
      } else if (cell.terrain === "desert" || cell.terrain === "drylands") {
        rgb = drawDesertColor(cell);
      } else if (cell.terrain === "plains" || cell.terrain === "farmlands" || cell.terrain === "hills" || cell.terrain === "wetlands" || cell.terrain === "floodplains") {
        rgb = drawGrassColor(cell);
      } else if (cellBiome === "ocean" || cell.terrain === "oasis") {
        rgb = {
          r: 100 + Math.floor(cell.elevation / 5),
          g: 120 + Math.floor(cell.elevation / 5),
          b: 140 + Math.floor(cell.elevation / 5),
        };
      } else {
        rgb = drawGrassColor(cell);
      }
    }
    return rgb;
  }
  
  function drawBeachColor(cell) {
    return {
      r: 194 - cell.elevation * 3,
      g: 178 - cell.elevation * 3,
      b: 128 - cell.elevation * 3,
    };
  }
  
  function drawMountainColor(cell) {
    const mountainMod = cell.elevation - limits.mountains.lower;
    return {
      r: mountainMod,
      g: mountainMod,
      b: mountainMod,
    };
  }
  
  function drawArcticColor(cell) {
    const el = cell.elevation;
    return {
      r: 355 - el,
      g: 355 - el,
      b: 355 - el,
    };
  }
  
  function drawJungleColor(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 0;
    let grassAccent2 = 0;
    let grass = Math.floor(correctedColor / 5);
  
    if (grass > 100) {
      const diff = Math.floor(grass - 100);
      grassAccent = grass - 100;
      grassAccent2 = Math.floor(grassAccent * 3);
      grass -= Math.floor(diff / 2.5);
    }
    return {
      r: grassAccent2,
      g: grass,
      b: grassAccent,
    };
  }
  
  function drawDrylandsColor(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 0;
    let grassAccent2 = 0;
    let grass = correctedColor;
  
    if (grass > 50) {
      const diff = Math.floor(grass - 49);
      grassAccent = grass - 49;
      grassAccent2 = Math.floor(grassAccent * 1.3);
      grass -= Math.floor(diff / 2.5);
    }
    return {
      r: grassAccent2,
      g: grass,
      b: grassAccent,
    };
  }
  
  function drawSteppeColor(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 0;
    let grassAccent2 = 0;
    let grass = correctedColor;
  
    if (grass > 100) {
      const diff = Math.floor(grass - 100);
      grassAccent = grass - 100;
      grassAccent2 = Math.floor(grassAccent * 3);
      grass -= Math.floor(diff / 2.5);
    }
    return {
      r: grassAccent2,
      g: grass,
      b: grassAccent,
    };
  }
  
  function drawDesertColor(cell) {
    const el = cell.elevation;
    return {
      r: Math.floor(194 * (el / 255)),
      g: Math.floor(178 * (el / 255)),
      b: Math.floor(128 * (el / 255)),
    };
  }
  
  function drawGrassColor(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 0;
    let grassAccent2 = 0;
    let grass = correctedColor;
  
    if (grass > 100) {
      const diff = Math.floor(grass - 100);
      grassAccent = grass - 100;
      grassAccent2 = Math.floor(grassAccent * 1.3);
      grass -= Math.floor(diff / 2.5);
    }
    return {
      r: grassAccent2,
      g: grass,
      b: grassAccent,
    };
  }
  
  function getHeightmapColor(cell) {
    let c;
    if (cell.elevation > 36) {
      // Squishing in the land to whatever the elevationToHeightmap settings are
      let el = cell.elevation - 36;
      c = Math.floor(el / settings.elevationToHeightmap);
      c += 36;
    } else {
      // don't squish water
      c = Math.floor(cell.elevation / 2);
    }
    c = Math.min(255, Math.max(0, c));
    return { r: c, g: c, b: c };
  }

  function getRivermapColorPapyrus(cell) {
    const c = cell.elevation > limits.seaLevel.upper ? true : false; // white for land, pink for water
    cell.rgb = c;
    let ran = cell.riverRun
    //need to check whether actually river
    if (ran > -1) {
      let rgb = {
        r: 100 + Math.floor(cell.elevation / 5),
        g: 120 + Math.floor(cell.elevation / 5),
        b: 140 + Math.floor(cell.elevation / 5),
      };
      return rgb
    }
  }

function getRivermapColor(cell) {
  const c = cell.elevation > limits.seaLevel.upper ? true : false; // white for land, pink for water
  cell.rgb = c;
  let ran = cell.riverRun
  //need to check whether actually river
  if (ran > -1) {
    if (cell.riverStartGreen) {
      return { r: 0, g: 255, b: 0}
    } else if (cell.isTributary) {
      return { r: 255, g: 0, b: 0}
    } else {
      return { r: 0, g: 225, b: 255}
    } //the below is what you would use if you want the fatter rivers, but simplifying for now to be closer to vanilla 
    /*else if (ran < 3) {
      return { r: 0, g: 225, b: 225}
    } else if (ran < 7) {
      return { r: 0, g: 200, b: 255}
    } else if (ran < 9) {
      return { r: 0, g: 150, b: 255}
    } else if (ran < 11) {
      return { r: 0, g: 100, b: 255}
    } else if (ran < 13) {
      return { r: 0, g: 0, b: 255}
    } else if (ran < 15) {
      return { r: 0, g: 0, b: 225}
    } else if (ran < 17) {
      return { r: 0, g: 0, b: 200}
    } else if (ran < 23) {
      return { r: 0, g: 0, b: 150}
    } else if (ran < 25) {
      return { r: 0, g: 0, b: 100}
    } else if (ran < 27) {
      return { r: 0, g: 85, b: 0 }
    } else if (ran < 29) {
      return { r: 0, g: 125, b: 0 }
    } else if (ran < 31) {
      return { r: 0, g: 158, b: 0 }
    } else if (ran > 30) {
      return { r: 24, g: 206, b: 0 }
    }*/
  } else if (c) {
    return { r: 255, g: 255, b: 255 };
  } else {
    return { r: 255, g: 0, b: 128 };
  }
}

function getRiverMapColorLowRes(cell) {
  const c = cell.elevation > limits.seaLevel.upper ? true : false; // white for land, pink for water
  cell.rgb = c;
  if (c) {
    return { r: 255, g: 255, b: 255 };
  } else {
    return { r: 255, g: 0, b: 128 };
  }
}

  function getSpecialColor(cell, type) {
    const maskValue = cell[type];
    if (maskValue) {
      const color = Math.floor((maskValue / 100) * 255);
      return { r: color, g: color, b: color };
    } else {
      return { r: 0, g: 0, b: 0 };
    }
  }
  
  
  
  
  
  /**
   * Draws a grass cell of "book" type.
   *
   * @param {Object} cell - The cell to draw.
   */
  function drawGrassBookType(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 0;
    let grassAccent2 = 0;
    let grass = correctedColor;
    let grassAlpha;
  
    if (grass > 100) {
      const diff = Math.floor(grass - 100);
      grassAccent = grass - 100;
      grassAccent2 = Math.floor(grassAccent * 1.3);
      grass -= Math.floor(diff / 2.5);
      const m = Math.max(1, Math.floor(cell.elevation / 25));
      grassAlpha = `0.${m}`;
    }
    cell.rgb = `rgb(${grassAccent2}, ${grass}, ${grassAccent})`;
  }
  
  /**
   * Draws a cell of "parchment" type.
   *
   * @param {Object} cell - The cell to draw.
   * @param {number} r - The red color component.
   * @param {number} g - The green color component.
   * @param {number} b - The blue color component.
   */
  function drawParchmentType(cell, r, g, b) {
    const cellBiome = biome(cell);
    if (cell.elevation > 37 && cell.elevation < 50 && world.height !== 256) {
      cell.rgb = `rgb(0, 0, 0)`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    } else if (cell.terrain === "forest") {
      cell.rgb = `rgb(255, 255, 255)`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
      if (world.height === 256) {
        drawInkTree(cell);
      }

    } else if (cell.terrain === "wetlands") {
      cell.rgb = `rgb(255, 255, 255)`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
      if (world.height === 256) {
        drawInkMarsh(cell);
      }
    } else if (cellBiome === "river" || cellBiome === "lake" || cellBiome === "ocean") {
      cell.rgb = `rgb(200, 200, 200)`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
      //mapOutline(ctx, cell.x * settings.pixelSize, cell.y * settings.pixelSize, cell.rgb, cell);
    } else if (cellBiome === "mountain") {
      cell.rgb = `rgb(255, 255, 255)`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
      if (world.height === 256) {
        drawInkMountain(cell);
      }

    } else if (cell.tree) {
      cell.rgb = `rgb(255, 255, 255)`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
      if (world.height === 256) {
        drawInkTree(cell);
      }
    } else {
      cell.rgb = `rgb(255, 255, 255)`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    }
  }
  
  /**
   * Draws a cell of "paper" type.
   *
   * @param {Object} cell - The cell to draw.
   * @param {number} r - The red color component.
   * @param {number} g - The green color component.
   * @param {number} b - The blue color component.
   */
  function drawPaperType(cell, r, g, b) {
    const cellBiome = biome(cell);
  
    if (cellBiome === "beach" || cell.wetlands || cellBiome === "river" || cellBiome === "lake" || cellBiome === "ocean") {
      cell.rgb = `rgb(255, 255, 255)`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    } else if (cellBiome === "mountain" || cell.tree) {
      cell.rgb = `rgb(255, 255, 255)`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    } else {
      cell.rgb = `rgb(255, 255, 255)`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    }
  }
  
  /**
   * Draws a cell of "papyrus" type.
   *
   * @param {Object} cell - The cell to draw.
   * @param {number} r - The red color component.
   * @param {number} g - The green color component.
   * @param {number} b - The blue color component.
   */
  function drawPapyrusType(cell, r, g, b) {
    const cellBiome = biome(cell);
  
    if (cellBiome === "lake" || cellBiome === "ocean") {
      cell.rgb = `rgb(${100 + Math.floor(cell.elevation / 5)}, ${120 + Math.floor(cell.elevation / 5)}, ${140 + Math.floor(cell.elevation / 5)})`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    } else if (cell.tree || cellBiome === "beach" || cellBiome === "mountain" || cellBiome === "arctic") {
      cell.rgb = `rgb(${230 - Math.floor(cell.elevation / 5)}, ${210 - Math.floor(cell.elevation / 5)}, ${183 - Math.floor(cell.elevation / 5)})`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    } else {
      cell.rgb = `rgb(${230 - Math.floor(cell.elevation / 5)}, ${210 - Math.floor(cell.elevation / 5)}, ${183 - Math.floor(cell.elevation / 5)})`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    }
  }
  
  /**
   * Draws a cell of "colorful" type.
   *
   * @param {Object} cell - The cell to draw.
   */
  function drawColorfulType(cell) {
    const n = noise(cell.x, cell.y);
  
    if (cell.elevation < limits.seaLevel.upper) {
      cell.rgb = `rgb(${100 + Math.floor(cell.elevation / 5)}, ${120 + Math.floor(cell.elevation / 5)}, ${140 + Math.floor(cell.elevation / 5)})`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    }
  
    const cellBiome = biome(cell);
  
    if (cellBiome === "beach") {
      drawBeach(cell);
    } else if (cell.elevation >= limits.mountains.lower) {
      drawMountain(cell);
    } else if (cell.terrain === "taiga" || (cell.climateCategory === "cold" && cell.terrain === "hills")) {
      drawArctic(cell);
    } else if (cell.terrain === "jungle") {
      drawJungle(cell)
    } else if (cell.climateCategory === "tropical" && cell.terrain === "hills") {
      drawJungle(cell)
    } else if (cell.terrain === "drylands") {
      drawDrylands(cell)
    } else if (cell.terrain === "steppe") {
      drawSteppe(cell)
    } else if (cell.terrain === "desert" || cell.terrain === "drylands") {
      drawDesert(cell);
    } else if (cell.terrain === "plains" || cell.terrain === "farmlands" || cell.terrain === "hills" || cell.terrain === "wetlands" || cell.terrain === "floodplains") {
      drawGrass(cell);
    } else if (cellBiome === "ocean" || cell.terrain === "oasis") {
      cell.rgb = `rgb(${100 + Math.floor(cell.elevation / 5)}, ${120 + Math.floor(cell.elevation / 5)}, ${140 + Math.floor(cell.elevation / 5)})`;
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    } else {
      drawGrass(cell);
    }
  
    drawRiverTemplateTransparent(cell);
  }
  
  /**
   * Draws a cell of "heightmap" type.
   *
   * @param {Object} cell - The cell to draw.
   */
  function drawHeightmapType(cell) {
    let c;
    if (cell.elevation > 36) {
      //Squishing in the land to whatever the elevationToHeightmap settings are
      let el = cell.elevation - 36;
      c = Math.floor(el / settings.elevationToHeightmap);
      c += 36
    } else {
      //don't squish water
      c = Math.floor(cell.elevation / 2)
    }
    c = Math.min(255, Math.max(0, c));
    cell.rgb = `rgb(${c}, ${c}, ${c})`;
    drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
  }
  
  /**
   * Draws a cell of "rivermap" type.
   *
   * @param {Object} cell - The cell to draw.
   */
  function drawRivermapType(cell) {
    const c = cell.elevation > limits.seaLevel.upper ? "#ffffff" : "#ff0080";
    cell.rgb = c;
    drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
  }
  
  /**
   * Draws a cell of a special mask type.
   *
   * @param {Object} cell - The cell to draw.
   * @param {string} type - The type of mask.
   */
  function drawSpecialType(cell, type) {
    const maskValue = cell[type];
    if (maskValue) {
      const color = Math.floor((maskValue / 100) * 255);
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(${color}, ${color}, ${color})`);
    } else {
      drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`);
    }
  }
  
  /**
 * Draws a name on the canvas at the specified coordinates.
 *
 * @param {string} name - The name to be drawn.
 * @param {number} x - The x-coordinate where the name will be drawn.
 * @param {number} y - The y-coordinate where the name will be drawn.
 */
function drawName(name, x, y) {
    ctx.font = "48px Georgia";
    ctx.textAlign = "center";
    ctx.fillStyle = "red";
    ctx.fillText(name, x, y);
  }
  
  /**
   * Draws a beach cell on the canvas.
   *
   * @param {Object} cell - The cell to be drawn.
   */
  function drawBeach(cell) {
    drawSmallPixel(ctx, cell.x, cell.y, `rgb(${194 - (cell.elevation * 3)}, ${178 - (cell.elevation * 3)}, ${128 - (cell.elevation * 3)})`);
  }
  
  /**
   * Draws a lake cell on the canvas.
   *
   * @param {Object} cell - The cell to be drawn.
   */
  function drawLake(cell) {
    drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, ${getRandomInt(150, 255)})`);
  }
  
  /**
   * Draws a tree cell on the canvas.
   *
   * @param {Object} cell - The cell to be drawn.
   */
  function drawTree(cell) {
    drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, ${getRandomInt(25, 75)}, 0)`);
  }
  
  /**
   * Draws a mountain cell on the canvas.
   *
   * @param {Object} cell - The cell to be drawn.
   */
  function drawMountain(cell) {
    const mountainMod = cell.elevation - limits.mountains.lower;
    const mountainR = mountainMod;
    const mountainG = mountainMod;
    const mountainB = mountainMod;
    drawSmallPixel(ctx, cell.x, cell.y, `rgb(${mountainR}, ${mountainG}, ${mountainB})`);
  }
  
  /**
   * Draws an arctic cell on the canvas.
   *
   * @param {Object} cell - The cell to be drawn.
   */
  function drawArctic(cell) {
    const el = cell.elevation;
    drawSmallPixel(ctx, cell.x, cell.y, `rgb(${355 - el}, ${355 - el}, ${355 - el})`);
  }
  
  /**
   * Draws a desert cell on the canvas.
   *
   * @param {Object} cell - The cell to be drawn.
   */
  function drawDesert(cell) {
    const el = cell.elevation;
    const desertR = Math.floor(194 * (el / 255));
    const desertG = Math.floor(178 * (el / 255));
    const desertB = Math.floor(128 * (el / 255));
    drawSmallPixel(ctx, cell.x, cell.y, `rgb(${desertR}, ${desertG}, ${desertB})`);
  }
  
  /**
   * Draws a grass cell on the canvas.
   *
   * @param {Object} cell - The cell to be drawn.
   */

  function drawSteppe(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 0;
    let grassAccent2 = 0;
    let grass = correctedColor;
    let grassAlpha;
  
    if (grass > 100) {
      const diff = Math.floor(grass - 100);
      grassAccent = grass - 100;
      grassAccent2 = Math.floor(grassAccent * 3);
      grass -= Math.floor(diff / 2.5);
      const m = Math.max(1, Math.floor(cell.elevation / 25));
      grassAlpha = `0.${m}`;
    }
    drawSmallPixel(ctx, cell.x, cell.y, `rgba(${grassAccent2}, ${grass}, ${grassAccent})`);
  }

  function drawGrass(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 0;
    let grassAccent2 = 0;
    let grass = correctedColor;
    let grassAlpha;
  
    if (grass > 100) {
      const diff = Math.floor(grass - 100);
      grassAccent = grass - 100;
      grassAccent2 = Math.floor(grassAccent * 1.3);
      grass -= Math.floor(diff / 2.5);
      const m = Math.max(1, Math.floor(cell.elevation / 25));
      grassAlpha = `0.${m}`;
    }
    drawSmallPixel(ctx, cell.x, cell.y, `rgba(${grassAccent2}, ${grass}, ${grassAccent})`);
  }

  function drawJungle(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 0;
    let grassAccent2 = 0;
    let grass = Math.floor(correctedColor / 5);
    let grassAlpha;
  
    if (grass > 100) {
      const diff = Math.floor(grass - 100);
      grassAccent = grass - 100;
      grassAccent2 = Math.floor(grassAccent * 3);
      grass -= Math.floor(diff / 2.5);
      const m = Math.max(1, Math.floor(cell.elevation / 25));
      grassAlpha = `0.${m}`;
    }
    drawSmallPixel(ctx, cell.x, cell.y, `rgba(${grassAccent2}, ${grass}, ${grassAccent})`);
  }

  function drawDrylands(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 0;
    let grassAccent2 = 0;
    let grass = correctedColor;
    let grassAlpha;
  
    if (grass > 50) {
      const diff = Math.floor(grass - 49);
      grassAccent = grass - 49;
      grassAccent2 = Math.floor(grassAccent * 1.3);
      grass -= Math.floor(diff / 2.5);
      const m = Math.max(1, Math.floor(cell.elevation / 25));
      grassAlpha = `0.${m}`;
    }
    drawSmallPixel(ctx, cell.x, cell.y, `rgba(${grassAccent2}, ${grass}, ${grassAccent})`);
  }
  
  /**
   * Draws an ocean cell on the canvas.
   *
   * @param {Object} cell - The cell to be drawn.
   */
  function drawOcean(cell) {
    const correctedColor = getCorrectedColor(cell);
    const waterMod = 255 - Math.floor(correctedColor * 0.6);
    drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, ${waterMod})`);
  }
  
  /**
 * Draws an ink tree symbol on the canvas at the cell's coordinates.
 *
 * @param {Object} cell - The cell to be drawn.
 */
function drawInkTree(cell) {
    // sprite sheet, 32x32, hand-drawn black ink fantasy map tree symbol on white transparent background
    const roundedX = Math.round(cell.x);
    const roundedY = Math.round(cell.y);
    const img = GID(`tree${getRandomInt(1, 4)}`);
    ctx.drawImage(img, roundedX * settings.pixelSize, roundedY * settings.pixelSize, 16, 16);
  }
  
  /**
   * Draws an ink marsh symbol on the canvas at the cell's coordinates.
   *
   * @param {Object} cell - The cell to be drawn.
   */
  function drawInkMarsh(cell) {
    const roundedX = Math.round(cell.x);
    const roundedY = Math.round(cell.y);
    const img = GID('marsh1');
    ctx.drawImage(img, roundedX * settings.pixelSize, roundedY * settings.pixelSize, 16, 16);
  }
  
  /**
   * Draws an ink mountain or hill symbol on the canvas at the cell's coordinates
   * based on the cell's elevation.
   *
   * @param {Object} cell - The cell to be drawn.
   */
  function drawInkMountain(cell) {
    const roundedX = Math.round(cell.x);
    const roundedY = Math.round(cell.y);
    let img;
  
    if (cell.elevation < 275) {
      img = GID("hills1");
    } else if (cell.elevation < 295) {
      img = GID("hills2");
    } else if (cell.elevation < 315) {
      img = GID("hills3");
    } else if (cell.elevation < 335) {
      img = GID("hills4");
    } else if (cell.elevation < 375) {
      img = GID("mountain4");
    } else if (cell.elevation < 405) {
      img = GID("mountain3");
    } else if (cell.elevation < 445) {
      img = GID("mountain2");
    } else {
      img = GID("mountain1");
    }
  
    ctx.drawImage(img, roundedX * settings.pixelSize, roundedY * settings.pixelSize, 16, 16);
  }
  

  /**
 * Draws an outline of a cell on the canvas at the specified coordinates with the given color.
 * The color is determined based on the cell's elevation.
 *
 * @param {CanvasRenderingContext2D} context - The canvas rendering context.
 * @param {number} x - The x-coordinate where the outline will be drawn.
 * @param {number} y - The y-coordinate where the outline will be drawn.
 * @param {string} color - The color of the outline. Defaults to a calculated color if not specified.
 * @param {Object} cell - The cell object containing elevation information.
 */
function mapOutline(context, x, y, color, cell) {
  const r = 100 + Math.floor((cell.elevation / 5));
  const g = 120 + Math.floor((cell.elevation / 5));
  const b = 140 + Math.floor((cell.elevation / 5));
  context.fillStyle = `rgb(${r}, ${g}, ${b})`;
  context.fillRect(x, y, 16, 16);
}

/**
 * Corrects the color of a cell based on its elevation.
 *
 * @param {Object} cell - The cell object containing elevation information.
 * @returns {number} The corrected color value.
 */
function getCorrectedColor(cell) {
  let correctedColor;
  const el = cell.elevation;

  if (el >= limits.seaLevel.upper) {
    correctedColor = el;
  } else {
    correctedColor = el * -1;
  }

  if (correctedColor > 255) {
    correctedColor = 255;
  } else if (correctedColor < -255) {
    correctedColor = -255;
  }

  return correctedColor;
}

/**
 * Draws the heightmap from scratch by iterating over the world map and drawing each cell.
 * If the small map is available, it clears the canvas, fills it with a base color,
 * and then draws each cell. Otherwise, it sets the drawing type to 'heightmap' and redraws the world.
 */
function drawHeightmapFromScratch() {
  if (world.smallMap) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, settings.width, settings.height);
    ctx.fillStyle = "rgb(75, 75, 75)";
    ctx.fill();
    for (let i = 0; i < settings.height; i++) {
      for (let j = 0; j < settings.width; j++) {
        drawHeightmapCell(j, i);
      }
    }
  } else {
    world.drawingType = "heightmap";
    drawWorld();
  }
}

function drawRiverMapFromScratch() {
  world.drawingType = "rivermap"
  drawWorld()
  /*
  if (world.smallMap) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rect(0, 0, settings.width, settings.height);
    ctx.fillStyle = "#ff0080"
    ctx.fill();
    for (let i = 0; i < settings.height; i++) {
      for (let j = 0; j < settings.width; j++) {
        let cell = world.smallMap[i][j];
        if (cell.elevation >= limits.seaLevel.upper) {
          drawTinyPixel(ctx, j, i, "#ffffff");
        }
      }
    }
  } else {
    world.drawingType = "rivermap"
    drawWorld()
  }
  */
}

function redoLetterMap() {
  world.drawingType = "book";
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      world.map[i][j].text = bookText[currentBookPosition]
      currentBookPosition += 1
      if (currentBookPosition === bookText.length - 1) {
        currentBookPosition = 0
      }
    }
  }

}

function setPrecipitationCell(cell) {
  let windCell = getWindCellFromMap(cell.x, cell.y)
  let p;
  if (windCell.lastCurrent === "cold") {
    p = 0
  }  else {
    p = 400
    if (windCell.landCount > 4) {
      p -= 100
    }
  }
  /*
  let p = 0;
  if (windCell.waterCount === 0 && windCell.landCount === 0) {
    p += 20
  } else {
    let continentalEffect = 20 * windCell.waterCount / windCell.landCount
    p += continentalEffect
  }
  */

  p *= getLatitudeFactor(cell)

  if (settings.month === "June") {
    cell.summerPrecipitation = p
  } else if (settings.month === "December") {
    cell.winterPrecipitation = p 
    cell.precipitation = p
  }
}

function classifyAClimate(summerPrecip, winterPrecip, summer, winter) {
  // Step 1: Calculate r (annual precipitation)
  const r = summerPrecip + winterPrecip;

  // Step 2: Interpolate coolest month temperature and driest month precipitation
  const coolestTemp = Math.min(summer, winter);
  const driestPrecip = Math.min(summerPrecip, winterPrecip);

  // Step 3: Check if it's an A climate
  if (coolestTemp < 18) {
      return "NOT A";
  }

  // Step 4: Classify f, m, or w
  if (driestPrecip >= 60) {
      return "Af";
  }

  const mThreshold = 100 - (r / 25);
  if (driestPrecip >= mThreshold) {
      return "Am";
  }

  return "Aw";
}

function classifyBClimate(summerPrecip, winterPrecip, summer, winter) {
  // Step 1: Calculate r and t
  const r = summerPrecip + winterPrecip;
  const t = (summer + winter) / 2;

  // Step 2: Determine precipitation dominance
  const summerPercent = summerPrecip / r;
  const winterPercent = winterPrecip / r;
  
  let bTypeUpperLimit = null;

  if (summerPercent >= 0.7 && r < 20 * t + 280) {
      bTypeUpperLimit = 20 * t + 280;
  } else if (winterPercent >= 0.7 && r < 20 * t) {
      bTypeUpperLimit = 20 * t;
  } else if (summerPercent < 0.7 && winterPercent < 0.7 && r < 20 * t + 140) {
      bTypeUpperLimit = 20 * t + 140;
  }

  if (bTypeUpperLimit === null) {
      return "NOT B";
  }

  // Step 3: Determine W or S
  const halfUpperLimit = bTypeUpperLimit / 2;
  const typeWorS = r < halfUpperLimit ? "W" : "S";

  // Step 4: Determine h or k
  const typeHorK = t >= 18 ? "h" : "k";

  // Combine and return the classification
  return `B${typeWorS}${typeHorK}`;
}

function classifyCClimate(summerPrecip, winterPrecip, summer, winter) {
  // Step 1: Determine warmest and coldest month temperatures
  const warmestTemp = Math.max(summer, winter);
  const coldestTemp = Math.min(summer, winter);

  // Step 2: Check if it's a C climate
  if (warmestTemp < 10 || coldestTemp >= 18 || coldestTemp <= -3) {
      return "NOT C";
  }

  // Step 3: Determine driest and wettest months
  const driestPrecip = Math.min(summerPrecip, winterPrecip);
  const wettestPrecip = Math.max(summerPrecip, winterPrecip);

  const summerDriest = summerPrecip < winterPrecip;
  const winterDriest = !summerDriest;

  // Step 4: Classify s, w, or f
  let precipitationType = "f"; // Default
  if (summerDriest && driestPrecip < 30 && driestPrecip < wettestPrecip / 3) {
      precipitationType = "s";
  } else if (winterDriest && driestPrecip < wettestPrecip / 10) {
      precipitationType = "w";
  }

  // Step 5: Classify a, b, or c
  let temperatureType = "";
  if (warmestTemp >= 22) {
      temperatureType = "a";
  } else if (warmestTemp < 22 && summer >= 10 && winter >= 10) {
      temperatureType = "b";
  } else if (warmestTemp < 22) {
      const monthsAbove10 = (summer >= 10 ? 1 : 0) + (winter >= 10 ? 1 : 0);
      if (monthsAbove10 >= 1 && monthsAbove10 <= 3) {
          temperatureType = "c";
      }
  }

  // Combine and return the classification
  return `C${precipitationType}${temperatureType}`;
}

function classifyDClimate(summerPrecip, winterPrecip, summer, winter) {
  // Step 1: Determine warmest and coldest month temperatures
  const warmestTemp = Math.max(summer, winter);
  const coldestTemp = Math.min(summer, winter);

  // Step 2: Check if it's a D climate
  if (warmestTemp < 10 || coldestTemp > -3) {
      return "NOT D";
  }

  // Step 3: Determine driest and wettest months
  const driestPrecip = Math.min(summerPrecip, winterPrecip);
  const wettestPrecip = Math.max(summerPrecip, winterPrecip);

  const summerDriest = summerPrecip < winterPrecip;
  const winterDriest = !summerDriest;

  // Step 4: Classify s, w, or f
  let precipitationType = "f"; // Default
  if (summerDriest && driestPrecip < 30 && driestPrecip < wettestPrecip / 3) {
      precipitationType = "s";
  } else if (winterDriest && driestPrecip < wettestPrecip / 10) {
      precipitationType = "w";
  }

  // Step 5: Classify a, b, or c
  let temperatureType = "";
  if (warmestTemp >= 22) {
      temperatureType = "a";
  } else if (warmestTemp < 22 && summer >= 10 && winter >= 10) {
      temperatureType = "b";
  } else if (warmestTemp < 22) {
      const monthsAbove10 = (summer >= 10 ? 1 : 0) + (winter >= 10 ? 1 : 0);
      if (monthsAbove10 >= 1 && monthsAbove10 <= 3) {
          temperatureType = "c";
      }
  }

  // Combine and return the classification
  return `D${precipitationType}${temperatureType}`;
}


function setKoppenMap() {
  for (let i = 0; i < world.map.length; i++) {
    for (let j = 0; j < world.map[i].length; j++) {
      let first = ""
      let second = ""
      let third = ""
      let cell = xy(j, i);

      if (cell.elevation > 37) {
        let summer = cell.numericSummerTemp;
        let winter = cell.numericWinterTemp;
        let summerPrecip = cell.summerPrecipitation;
        let winterPrecip = cell.winterPrecipitation
        /*
        precipitation mapping so far:
        370 = 60mm
        185 = 30mm
        */
        let aType;
        let bTYpe;
        let cType;
        let dType

        if (cell.hemisphere === "N") {
          aType = classifyAClimate(summerPrecip, winterPrecip, summer, winter)
          bType = classifyBClimate(summerPrecip, winterPrecip, summer, winter)
          cType = classifyCClimate(summerPrecip, winterPrecip, summer, winter)
          dType = classifyDClimate(summerPrecip, winterPrecip, summer, winter)
        } else {
          aType = classifyAClimate(winterPrecip, summerPrecip, winter, summer)
          bType = classifyBClimate(winterPrecip, summerPrecip, winter, summer)
          cType = classifyCClimate(winterPrecip, summerPrecip, winter, summer)
          dType = classifyDClimate(winterPrecip, summerPrecip, winter, summer)
        }
        if (cell.elevation > 255) {
          first = "H"
        } else if (bType !== "NOT B") {
          let t = bType.split("")
          first = "B"
          second = t[1]
          third = t[2]
        } else if (aType !== "NOT A") {
          let t = aType.split("")
          first = "A"
          second = t[1]
        } else if (cType !== "NOT C") {
          let t = cType.split("")
          first = t[0]
          second = t[1]
          third = t[2]
        } else if (dType !== "NOT D") {
          let t = dType.split("")
          first = t[0]
          second = t[1]
          third = t[2]
        } else if (summer < 10) {
          first = "E"
          if (summer > 0 && summer < 10) {
            second = "T"
          }
          if (summer <= 0) {
            second = "F"
          }
        } 
        cell.k = `${first}`
        if (second) {
          cell.k += `${second}`
        }
        if (third) {
          cell.k += `${third}`
        }
      }
    }
  }
}

function setPrecipitationAndTemperatures() {
  for (let i = 0; i < world.map.length; i++) {
    for (let j = 0; j < world.map[i].length; j++) {
      let cell = xy(j, i);
      getTemperature(cell)
      //setPrecipitationCell(cell)
    }
  }
}

/**
 * Draws the entire world map by clearing the canvas, setting its dimensions,
 * and iterating over each cell to draw it.
 */
function drawWorld() {
  if (world.drawingType === "precipitation" || world.drawingType === "currents") {
    clearOceanCurrents()
    clearTemperatures()
    createWindMap(96, 48)
    //createWindMap(512, 256)
    setGeo()
    setTemperatures();
    setPrecipitationAndTemperatures()
    runWindModel()
    trackIncomingWind(world)
    setPrecipitationAndTemperatures()
    setNumerics()
    setKoppenMap() 
    drawWindArrows(canvas, ctx, world.windMap, "icons/northArrow.png")
    //setOceanCurrents()
  }

  if (world.drawingType === "temperature") {
    clearOceanCurrents()
    clearTemperatures()
    createWindMap(96, 48)
    setGeo()
    setTemperatures();
    //setPrecipitationAndTemperatures()
    //runWindModel()
    //trackIncomingWind(world)
    //setPrecipitationAndTemperatures()
    //setNumerics()
    //setKoppenMap() 
    //drawWindArrows(canvas, ctx, world.windMap, "icons/northArrow.png")
  }

  if (world.drawingType === "wind") {
    clearOceanCurrents()
    clearTemperatures()
    createWindMap(96, 48)
    setGeo()
    runWindModel()
    trackIncomingWind(world)
    drawWindArrows(canvas, ctx, world.windMap, "icons/northArrow.png")

  }

  if (world.drawingType === "koppen") {
    settings.month = "June"
    clearOceanCurrents()
    clearTemperatures()
    createWindMap(96, 48)
    //createWindMap(512, 256)
    setGeo()
    setTemperatures()
    runWindModel()
    trackIncomingWind(world)
    setPrecipitationAndTemperatures()
    settings.month = "December"
    clearOceanCurrents()
    clearTemperatures()
    createWindMap(96, 48)
    setGeo()
    setTemperatures()
    runWindModel()
    trackIncomingWind(world)
    setPrecipitationAndTemperatures()
    setNumerics()
    setKoppenMap() 
    //drawWindArrows(canvas, ctx, world.windMap, "icons/northArrow.png")
  }

  // Clear the entire canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Set the canvas dimensions based on the world's size and pixel size
  canvas.width = world.width * settings.pixelSize;
  canvas.height = world.height * settings.pixelSize;
  overlayCanvas.width = world.width * settings.pixelSize;
  overlayCanvas.height = world.height * settings.pixelSize;

  if (world.drawingType === "roguelike") {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < world.height; i++) {
      for (let j = 0; j < world.width; j++) {
        drawCell(j, i)
      }
    }
  } else if (world.drawingType === "parchment" && world.width === 512) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < world.height; i++) {
      for (let j = 0; j < world.width; j++) {
        drawCell(j, i)
      }
    }
  } else if (world.drawingType === "black") { // use for empty masks so you don't have to repeat.
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (world.drawingType === "white") {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    createCellTerrains();
    if (world.drawingType === "terrainMap") {
      drawTerrainSmallMap();
    } else if (world.drawingType === "smallProv" || world.drawingType === "smallWater") {
      drawTitleSmallMap("province");
    } else if (world.drawingType === "smallCulture") {
      drawTitleSmallMap("culture");
    } else if (world.drawingType === "smallFaith") {
      console.log("SMALL FAITH")
      drawTitleSmallMap("faith")
    } else if (world.drawingType === "smallEmpire") {
      drawTitleSmallMap("empire")
    } else if (world.drawingType === "smallKingdom") {
      drawTitleSmallMap("kingdom")
    } else if (world.drawingType === "smallDuchy") {
      drawTitleSmallMap("duchy")
    } else if (world.drawingType === "smallCounty") {
      drawTitleSmallMap("county")
    } else if (world.drawingType === "smallProvince") {
      drawTitleSmallMap("province")
    } else {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let y = 0; y < world.height; y++) {
        for (let x = 0; x < world.width; x++) {
          drawCellToImageData(imageData, x, y);
        }
      }
      ctx.putImageData(imageData, 0, 0);
      console.log("DRAWN")

      if (world.drawingType === "colorful") {
        ctx.beginPath(); // Start a new path
        ctx.moveTo(0, settings.equator);
        ctx.lineTo(canvas.width, settings.equator);
        ctx.stroke(); // Render the path
      }
    }
  }
}

function drawCellToImageData(imageData, x, y) {
  const cell = xy(x, y);
  const { r, g, b } = getRGBFromElevation(cell.elevation);
  let color;

  switch (world.drawingType) {
    case "book":
      color = getBookColor(cell);
      break;
    case "parchment":
      if (cell.elevation >= 37) {
      color = getParchmentColor(cell, r, g, b);
      } else {
        color = "skip"
      }
      break;
    case "paper":
      color = getPaperColor(cell, r, g, b);
      break;
    case "papyrus":
      if (cell.riverRun > -1) {
        color = getRivermapColorPapyrus(cell)
      } else {
        color = getPapyrusColor(cell, r, g, b);
      }
      break;
    case "relief":
      color = getReliefColor(cell);
      break;
    case "temperature":
      color = newGetTemperatureColor(cell);
      break;
    case "koppen":
      if (cell.elevation < 38) {
        color = { r: 0, g: 0, b: 0 }
      } else {
        color = getKoppenColor(cell);
      }
      break;
    case "precipitation":
      if (cell.elevation < 38) {
        color = { r: 0, g: 0, b: 0 }
      } else {
        color = newGetPrecipitationColor(cell);
      }
      break;
    case "continentality":
      color = newGetContinentalityColor(cell);
      break;
    case "currents":
      color = newGetOceanCurrentColor(cell);
      break;
    case "colorful":
      color = getColorfulColor(cell);
      break;
    case "heightmap":
      color = getHeightmapColor(cell);
      break;
    case "rivermap":
      color = getRivermapColor(cell);
      break;
    case "rivermapLowRes":
      color = getRiverMapColorLowRes(cell);
      break;
    case "fantasy":
      color = getFantasyColor(cell)
      break;
    case "overmap":
      color = cell.overmap
      break
    default:
      color = getSpecialColor(cell, world.drawingType);
      break;
  }
  if (color !== "skip") {
  setBlock(imageData, x * settings.pixelSize, y * settings.pixelSize, settings.pixelSize, color);
  }
}

function setBlock(imageData, startX, startY, size, color) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      setPixel(imageData, startX + x, startY + y, color);
    }
  }
}

function setPixel(imageData, x, y, color) {
  const index = (x + y * imageData.width) * 4;
  imageData.data[index] = color.r;
  imageData.data[index + 1] = color.g;
  imageData.data[index + 2] = color.b;
  imageData.data[index + 3] = 255; // alpha channel
}

  /**
   * Draws a heightmap cell at the specified coordinates (x, y).
   * The function calculates the color value based on the cell's elevation and 
   * adjusts it slightly for a more natural look. The cell is then drawn as a tiny pixel.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   */
  
  function drawHeightmapCell(x, y) {
    let cell = world.smallMap[y][x]
    let c;
    c = Math.floor((cell.elevation / 5)) //was cell.elevation / 2 - should match whatever we scale incoming heightmap to (right now * 5 because max el is 51)
    if (cell && settings.varyElevation) {
      if (c > (limits.seaLevel.upper + 5)) {
        c += getRandomInt(-5, 5)
      }
    }
    if (c > 255) {
      c = 255
    }
    if (c < 0) {
      c = 0;
    }
    if (cell.bigCell && cell.bigCell.dropToWater && cell.bigCell.highPointRiver === false) {
      c = 0;
    }
  
    drawTinyPixel(ctx, x, y, `rgb(${c}, ${c}, ${c})`)
  }

function drawProvinceMap(labels) {
  let count = 0
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = "rgb(75, 75, 75)"
  ctx.fill();
  let pixels = wholeMapImage()
  for (let i = 0; i < settings.height; i++) {
      for (let j = 0; j < settings.width; j++) {
          let c = world.smallMap[i][j]
          if (c && c.colorR) {
              pixels.data[count] = c.colorR //r
              count += 1;
              pixels.data[count] = c.colorG //g 
              count += 1;
              pixels.data[count] = c.colorB //b
              count += 2;
          } else {
              count += 4;
          }
      }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(pixels, 0, 0)
  if (labels) {
    ctx.font = "12px Arial";
    for (let i = 0; i < world.provinces.length; i++) {
      let province = world.provinces[i]
      if (province.localizedTitle) {
        ctx.beginPath();
        ctx.arc(province.x, province.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.fillStyle = "black"
        ctx.fillText(province.localizedTitle, province.x - 13, province.y - 4);
      }
      
    }
  }
  //pixels = null
  //world.smallMap = null
}

function drawTitleMap(t) {
  let count = 0
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = "rgb(75, 75, 75)"
  ctx.fill();
  let pixels = wholeMapImage()
  for (let i = 0; i < settings.height; i++) {
      for (let j = 0; j < settings.width; j++) {
          let c = world.smallMap[i][j]
          if (c && c.colorR) {
              let prov = provinceKeys[`${c.colorR}, ${c.colorG}, ${c.colorB}`]
              let title;
              if (prov) {
                title = prov[`${t}`]
              }
              if (title) {
                //water
                pixels.data[count] = title.colorR //r
                count += 1;
                pixels.data[count] = title.colorG //g 
                count += 1;
                pixels.data[count] = title.colorB //b
                count += 2;
              } else {
                //water
                pixels.data[count] = 0 //r
                count += 1;
                pixels.data[count] = 0 //g 
                count += 1;
                pixels.data[count] = 255 //b
                count += 2;
              }

          } else {
              count += 4;
          }
      }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(pixels, 0, 0)
  pixels = null
}

function drawProvinceMapWithoutOceans() {
  let count = 0
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = "rgb(75, 75, 75)"
  ctx.fill();
  let pixels = wholeMapImage()
  for (let i = 0; i < settings.height; i++) {
      for (let j = 0; j < settings.width; j++) {
          let c = world.smallMap[i][j]
          if (c && c.elevation <= limits.seaLevel.upper) {
            pixels.data[count] = 0 //r
            count += 1;
            pixels.data[count] = 0 //g 
            count += 1;
            pixels.data[count] = 0 //b
            count += 2;     
          } else {
            if (c && c.colorR) {
              pixels.data[count] = c.colorR //r
              count += 1;
              pixels.data[count] = c.colorG //g 
              count += 1;
              pixels.data[count] = c.colorB //b
              count += 2;
            } else {
                count += 4;
            }
        }
      }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(pixels, 0, 0)
  //pixels = null
  //world.smallMap = null
}

function drawProvinceMapWithoutLand() {
  let count = 0
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = "rgb(255, 255, 255)"
  ctx.fill();
  let pixels = wholeMapImage()
  for (let i = 0; i < settings.height; i++) {
      for (let j = 0; j < settings.width; j++) {
          let c = world.smallMap[i][j]
          if (c && c.elevation > limits.seaLevel.upper) {
            pixels.data[count] = 255 //r
            count += 1;
            pixels.data[count] = 255 //g 
            count += 1;
            pixels.data[count] = 255 //b
            count += 2;     
          } else {
            if (c && c.colorR) {
              pixels.data[count] = c.colorR //r
              count += 1;
              pixels.data[count] = c.colorG //g 
              count += 1;
              pixels.data[count] = c.colorB //b
              count += 2;
            } else {
                count += 4;
            }
        }
      }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(pixels, 0, 0)
  //pixels = null
  //world.smallMap = null
}

function drawTitlePixel(x, y, convTitleType) {
  let color = "rgb(255, 255, 255)"
  let cell = world.map[y][x]

  if (cell.elevation <= limits.seaLevel.upper) {
    if (cell.waterOverride) {
      let c = getColorObjectFromString(cell.waterOverride)
      color = `rgb(${c.r}, ${cell.g}, ${cell.b})`
      drawSmallPixel(ctx, x, y, color)
    }
    //do nothing because you drew water above
  } else {
    let drawn = false;
    let p;
    if (settings.currentStage === "provincesGenerated") {
      let smallX = x * settings.pixelSize
      let smallY = y * settings.pixelSize;
      let smallCell = world.smallMap[smallY][smallX]
      p = smallCell.province;
      if (p && p.county) {
        let empire = p.county.duchy.kingdom.empire;
        let kingdom = p.county.duchy.kingdom;
        let duchy = p.county.duchy;
        let county = p.county;
        if (convTitleType === "empireOverride" && empire && empire.brushColor) {
          drawSmallPixel(ctx, x, y, empire.brushColor)
          drawn = true
        } else if (convTitleType === "kingdomOverride" && kingdom && kingdom.brushColor && selectedEmpire && selectedEmpire.brushColor === empire.brushColor) {
          drawSmallPixel(ctx, x, y, kingdom.brushColor)
          drawn = true
        } else if (convTitleType === "duchyOverride" && duchy && duchy.brushColor && selectedKingdom && selectedKingdom.brushColor === kingdom.brushColor) {
          drawSmallPixel(ctx, x, y, duchy.brushColor)
          drawn = true
        } else if (convTitleType === "countyOverride" && county && county.brushColor && selectedDuchy && selectedDuchy.brushColor === duchy.brushColor) {
          drawSmallPixel(ctx, x, y, county.brushColor)
          drawn = true
        } else if (p.brushColor && county && selectedCounty && selectedCounty.brushColor === county.brushColor) {
          drawSmallPixel(ctx, x, y, p.brushColor)
          drawn = true
        }
      }
    }
    if (drawn === false) {
      if (cell[`${convTitleType}`]) { //does it have an overide?
        color = cell[`${convTitleType}`]
        drawSmallPixel(ctx, x, y, color)
      } else if (convTitleType === "kingdomOverride" && cell["empireOverride"]) {
        color = cell["empireOverride"]
        drawSmallPixel(ctx, x, y, color)
      } else if (convTitleType === "duchyOverride" && cell["kingdomOverride"]) {
        color = cell["kingdomOverride"]
        drawSmallPixel(ctx, x, y, color)
      } else if (convTitleType === "countyOverride" && cell["duchyOverride"]) {
        color = cell["duchyOverride"]
        drawSmallPixel(ctx, x, y, color)
      } else if (convTitleType === "provinceOverride" && cell["countyOverride"]) {
        color = cell["countyOverride"]
        drawSmallPixel(ctx, x, y, color)
      } else {
        if (cell.terrain === "plains") {
          color = `rgb(204, 163, 102)`
        } else if (cell.terrain === "desert") {
          color = `rgb(255, 230, 0)`
        } else if (cell.terrain === "drylands") {
          color = `rgb(220, 45, 120)`
        } else if (cell.terrain === "floodplains") {
          color = `rgb(55, 31, 153)`
        } else if (cell.terrain === `hills`) {
          color = `rgb(90, 50, 12)`
        } else if (cell.terrain === "mountains") {
          color = `rgb(100, 100, 100)`
        } else if (cell.terrain === "taiga") {
          color = `rgb(46, 153, 89)`
        } else if (cell.terrain === "desert_mountains") {
          color = `rgb(23, 19, 38)`
        } else if (cell.terrain === "farmlands") {
          color = `rgb(255, 0, 0)`
        } else if (cell.terrain === "forest") {
          color = `rgb(71, 179, 45)`
        } else if (cell.terrain === "jungle") {
          color = `rgb(10, 60, 35)`
        } else if (cell.terrain === "oasis") {
          color = `rgb(155, 143, 204)`
        } else if (cell.terrain === "steppe") {
          color = `rgb(200, 100, 25)`
        } else if (cell.terrain === "wetlands") {
          color = `rgb(77, 153, 153)`
        }
        color = `rgb(255, 255, 255)`
        drawSmallPixel(ctx, x, y, color)
      }
    }
  } 
}

function drawTitleSmallMap(titleType) { // This function is too cute in trying to do too much. It handles both override and drawing from kingdom etc
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = `rgb(97, 170, 229)`
  ctx.fill();
  let convTitleType = titleType + "Override"
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      drawTitlePixel(j, i, convTitleType)
    }
  }
  let labels = true; //placeholder for optional later
  let titles;
  if (titleType === "empire") {
    titles = world.empires;
  } else if (titleType === "kingdom") {
    titles = world.kingdoms;
  } else if (titleType === "duchy") {
    titles = world.duchies;
  } else if (titleType === "county") {
    titles = world.counties;
  } else {
    titles = world.provinces;
  }
  console.log(titles)
  if (labels) {
    ctx.font = `${settings.labelFontSize}px Arial`;
    if (titleType === "province") {
      for (let i = 0; i < world.provinces.length; i++) {
        let province = world.provinces[i]
        if (province.localizedTitle) {
          ctx.beginPath();
          ctx.arc(province.x, province.y, 2, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
          ctx.fill();
          ctx.fillStyle = "black"
          ctx.fillText(province.localizedTitle, province.x - 13, province.y - 4);
        }
      }
    } else {
      for (let i = 0; i < titles.length; i++) {
        if (titles[i].provinces) {
          let capital = titles[i].provinces[0];
          if (capital) {
            ctx.beginPath();
            ctx.arc(capital.x, capital.y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.fillStyle = "black"
            ctx.fillText(titles[i].localizedTitle, capital.x - 13, capital.y - 4);
          }
        }
      }
    }
  }
}

function drawTerrainPixel(x, y) {
  let cell = world.map[y][x]
  if (cell.elevation <= limits.seaLevel.upper) {
    color = `rgb(97, 170, 229)`
  } else {
    if (cell.terrain === "plains") {
      color = `rgb(204, 163, 102)`
    } else if (cell.terrain === "desert") {
      color = `rgb(255, 230, 0)`
    } else if (cell.terrain === "drylands") {
      color = `rgb(220, 45, 120)`
    } else if (cell.terrain === "floodplains") {
      color = `rgb(55, 31, 153)`
    } else if (cell.terrain === `hills`) {
      color = `rgb(90, 50, 12)`
    } else if (cell.terrain === "mountains") {
      color = `rgb(100, 100, 100)`
    } else if (cell.terrain === "taiga") {
      color = `rgb(46, 153, 89)`
    } else if (cell.terrain === "desert_mountains") {
      color = `rgb(23, 19, 38)`
    } else if (cell.terrain === "farmlands") {
      color = `rgb(255, 0, 0)`
    } else if (cell.terrain === "forest") {
      color = `rgb(71, 179, 45)`
    } else if (cell.terrain === "jungle") {
      color = `rgb(10, 60, 35)`
    } else if (cell.terrain === "oasis") {
      color = `rgb(155, 143, 204)`
    } else if (cell.terrain === "steppe") {
      color = `rgb(200, 100, 25)`
    } else if (cell.terrain === "wetlands") {
      color = `rgb(77, 153, 153)`
    } else {
      color = "rgb(255, 0, 0)"
    }
  }
  drawSmallPixel(ctx, x, y, color)
}

function drawTerrainSmallMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = "rgb(255, 255, 255)"
  ctx.fill();
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      drawTerrainPixel(j, i)
    }
  }
}

function drawTerrainDotMap() {
  let count = 0
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = "rgb(0, 0, 0)"
  ctx.fill();
  for (let i = 0; i < world.provinces.length; i++) {
    let color;
    let province = world.provinces[i]
    if (province.terrain === "plains") {
      color = `rgb(204, 163, 102)`
    } else if (province.terrain === "desert") {
      color = `rgb(255, 230, 0)`
    } else if (province.terrain === "drylands") {
      color = `rgb(220, 45, 120)`
    } else if (province.terrain === "floodplains") {
      color = `rgb(55, 31, 153)`
    } else if (province.terrain === `hills`) {
      color = `rgb(90, 50, 12)`
    } else if (province.terrain === "mountains") {
      color = `rgb(100, 100, 100)`
    } else if (province.terrain === "taiga") {
      color = `rgb(46, 153, 89)`
    } else if (province.terrain === "desert_mountains") {
      color = `rgb(23, 19, 38)`
    } else if (province.terrain === "farmlands") {
      color = `rgb(255, 0, 0)`
    } else if (province.terrain === "forest") {
      color = `rgb(71, 179, 45)`
    } else if (province.terrain === "jungle") {
      color = `rgb(10, 60, 35)`
    } else if (province.terrain === "oasis") {
      color = `rgb(155, 143, 204)`
    } else if (province.terrain === "steppe") {
      color = `rgb(200, 100, 25)`
    } else if (province.terrain === "wetlands") {
      color = `rgb(77, 153, 153)`
    } else {
      //water
      color = `rgb(97, 170, 229)`
    }
    drawTinyPixel(ctx, province.x, province.y, color)
  }
  /*ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(pixels, 0, 0)
  */
  alert("done")
}

function drawTerrainDotMapBlackBig() {
  let count = 0
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.rect(0, 0, settings.width, settings.height);
  ctx.fillStyle = "rgb(0, 0, 0)"
  ctx.fill();
  for (let i = 0; i < world.provinces.length; i++) {
    let color;
    let province = world.provinces[i]
    if (province.terrain === "plains") {
      color = `rgb(204, 163, 102)`
    } else if (province.terrain === "desert") {
      color = `rgb(255, 230, 0)`
    } else if (province.terrain === "drylands") {
      color = `rgb(220, 45, 120)`
    } else if (province.terrain === "floodplains") {
      color = `rgb(55, 31, 153)`
    } else if (province.terrain === `hills`) {
      color = `rgb(90, 50, 12)`
    } else if (province.terrain === "mountains") {
      color = `rgb(100, 100, 100)`
    } else if (province.terrain === "taiga") {
      color = `rgb(46, 153, 89)`
    } else if (province.terrain === "desert_mountains") {
      color = `rgb(23, 19, 38)`
    } else if (province.terrain === "farmlands") {
      color = `rgb(255, 0, 0)`
    } else if (province.terrain === "forest") {
      color = `rgb(71, 179, 45)`
    } else if (province.terrain === "jungle") {
      color = `rgb(10, 60, 35)`
    } else if (province.terrain === "oasis") {
      color = `rgb(155, 143, 204)`
    } else if (province.terrain === "steppe") {
      color = `rgb(200, 100, 25)`
    } else if (province.terrain === "wetlands") {
      color = `rgb(77, 153, 153)`
    } else {
      //water
      color = `rgb(97, 170, 229)`
    }
    drawTinyPixel(ctx, province.x, province.y, color)
      drawTinyPixel(ctx, province.x - 1, province.y, color)
      drawTinyPixel(ctx, province.x + 1, province.y, color)
      drawTinyPixel(ctx, province.x, province.y + 1, color)
      drawTinyPixel(ctx, province.x, province.y - 1, color)
      drawTinyPixel(ctx, province.x + 1, province.y + 1, color)
      drawTinyPixel(ctx, province.x - 1, province.y + 1, color)
      drawTinyPixel(ctx, province.x - 1, province.y - 1, color)
      drawTinyPixel(ctx, province.x + 1, province.y - 1, color)
  }
  /*ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(pixels, 0, 0)
  */
  alert("done")
}

function getIcePlanetColor(cell) {
  let rgb = { r: 255, g: 255, b: 255 }; // Default white
  if (cell.elevation < -230) {
    rgb = {
      r: 0,
      g: 0,
      b: 80,
    }; 
  } else if (cell.elevation < -205) {
    rgb = {
      r: 0,
      g: 0,
      b: 100,
    }; 
  } else if (cell.elevation < -180) {
    rgb = {
      r: 0,
      g: 0,
      b: 120,
    }; 
  } else if (cell.elevation < -155) {
    rgb = {
      r: 0,
      g: 0,
      b: 140,
    }; 
  } else if (cell.elevation < -130) {
    rgb = {
      r: 0,
      g: 0,
      b: 160,
    }; 
  } else if (cell.elevation < -105) {
    rgb = {
      r: 0,
      g: 50,
      b: 180,
    }; 
  } else if (cell.elevation < -80) {
    rgb = {
      r: 0,
      g: 100,
      b: 200,
    }; 
  } else if (cell.elevation < -55) {
    rgb = {
      r: 0,
      g: 150,
      b: 220,
    }; 
  } else if (cell.elevation < -30) {
    rgb = {
      r: 0,
      g: 200,
      b: 240,
    }; 
  } else if (cell.elevation < -5) {
    rgb = {
      r: 135,
      g: 206,
      b: 250,
    }; 
  } else if (cell.elevation <= limits.seaLevel.upper) {
    rgb = {
      r: 173,
      g: 216,
      b: 230,
    }; 
  } else if (cell.elevation < 60) {
    rgb = {
      r: 224,
      g: 255,
      b: 255,
    };
  } else if (cell.elevation < 90) {
    rgb = {
      r: 240,
      g: 248,
      b: 255,
    };
  } else if (cell.elevation < 120) {
    rgb = {
      r: 245,
      g: 245,
      b: 245,
    };
  } else if (cell.elevation < 150) {
    rgb = {
      r: 250,
      g: 250,
      b: 250,
    };
  } else if (cell.elevation < 180) {
    rgb = {
      r: 255,
      g: 255,
      b: 255,
    };
  } else if (cell.elevation < 205) {
    rgb = {
      r: 230,
      g: 230,
      b: 230,
    };
  } else if (cell.elevation < 209) {
    rgb = {
      r: 220,
      g: 220,
      b: 220,
    };
  } else if (cell.elevation < 213) {
    rgb = {
      r: 210,
      g: 210,
      b: 210,
    };
  } else if (cell.elevation < 217) {
    rgb = {
      r: 200,
      g: 200,
      b: 200,
    };
  } else if (cell.elevation < 221) {
    rgb = {
      r: 190,
      g: 190,
      b: 190,
    };
  } else if (cell.elevation < 225) {
    rgb = {
      r: 180,
      g: 180,
      b: 180,
    };
  } else if (cell.elevation < 229) {
    rgb = {
      r: 170,
      g: 170,
      b: 170,
    };
  } else if (cell.elevation < 233) {
    rgb = {
      r: 160,
      g: 160,
      b: 160,
    };
  } else if (cell.elevation < 237) {
    rgb = {
      r: 150,
      g: 150,
      b: 150,
    };
  } else if (cell.elevation < 241) {
    rgb = {
      r: 140,
      g: 140,
      b: 140,
    };
  } else if (cell.elevation < 245) {
    rgb = {
      r: 130,
      g: 130,
      b: 130,
    };
  } else if (cell.elevation < 249) {
    rgb = {
      r: 120,
      g: 120,
      b: 120,
    };
  } else if (cell.elevation < 253) {
    rgb = {
      r: 110,
      g: 110,
      b: 110,
    };
  } else if (cell.elevation < 257) {
    rgb = {
      r: 100,
      g: 100,
      b: 100,
    };
  } else if (cell.elevation < 261) {
    rgb = {
      r: 90,
      g: 90,
      b: 90,
    };
  } else if (cell.elevation < 265) {
    rgb = {
      r: 80,
      g: 80,
      b: 80,
    };
  } else if (cell.elevation < 269) {
    rgb = {
      r: 70,
      g: 70,
      b: 70,
    };
  } else if (cell.elevation < 273) {
    rgb = {
      r: 60,
      g: 60,
      b: 60,
    };
  } else if (cell.elevation < 277) {
    rgb = {
      r: 50,
      g: 50,
      b: 50,
    };
  } else if (cell.elevation < 281) {
    rgb = {
      r: 40,
      g: 40,
      b: 40,
    };
  } else if (cell.elevation < 285) {
    rgb = {
      r: 30,
      g: 30,
      b: 30,
    };
  } else if (cell.elevation < 289) {
    rgb = {
      r: 20,
      g: 20,
      b: 20,
    };
  } else if (cell.elevation < 293) {
    rgb = {
      r: 10,
      g: 10,
      b: 10,
    };
  } else if (cell.elevation < 297) {
    rgb = {
      r: 5,
      g: 5,
      b: 5,
    };
  } else if (cell.elevation < 301) {
    rgb = {
      r: 0,
      g: 0,
      b: 0,
    };
  } else if (cell.elevation < 305) {
    rgb = {
      r: 10,
      g: 10,
      b: 10,
    };
  } else if (cell.elevation < 309) {
    rgb = {
      r: 20,
      g: 20,
      b: 20,
    };
  } else if (cell.elevation < 313) {
    rgb = {
      r: 30,
      g: 30,
      b: 30,
    };
  } else if (cell.elevation < 317) {
    rgb = {
      r: 40,
      g: 40,
      b: 40,
    };
  } else if (cell.elevation < 321) {
    rgb = {
      r: 50,
      g: 50,
      b: 50,
    };
  } else if (cell.elevation < 325) {
    rgb = {
      r: 60,
      g: 60,
      b: 60,
    };
  } else if (cell.elevation < 329) {
    rgb = {
      r: 70,
      g: 70,
      b: 70,
    };
  } else if (cell.elevation < 333) {
    rgb = {
      r: 80,
      g: 80,
      b: 80,
    };
  } else if (cell.elevation < 337) {
    rgb = {
      r: 90,
      g: 90,
      b: 90,
    };
  } else if (cell.elevation < 341) {
    rgb = {
      r: 100,
      g: 100,
      b: 100,
    };
  } else if (cell.elevation < 345) {
    rgb = {
      r: 110,
      g: 110,
      b: 110,
    };
  } else if (cell.elevation < 349) {
    rgb = {
      r: 120,
      g: 120,
      b: 120,
    };
  } else if (cell.elevation < 353) {
    rgb = {
      r: 130,
      g: 130,
      b: 130,
    };
  } else if (cell.elevation < 357) {
    rgb = {
      r: 140,
      g: 140,
      b: 140,
    };
  } else if (cell.elevation < 361) {
    rgb = {
      r: 150,
      g: 150,
      b: 150,
    };
  } else if (cell.elevation < 365) {
    rgb = {
      r: 160,
      g: 160,
      b: 160,
    };
  } else if (cell.elevation < 369) {
    rgb = {
      r: 170,
      g: 170,
      b: 170,
    };
  } else if (cell.elevation < 373) {
    rgb = {
      r: 180,
      g: 180,
      b: 180,
    };
  } else if (cell.elevation < 377) {
    rgb = {
      r: 190,
      g: 190,
      b: 190,
    };
  } else if (cell.elevation < 381) {
    rgb = {
      r: 200,
      g: 200,
      b: 200,
    };
  } else if (cell.elevation < 385) {
    rgb = {
      r: 210,
      g: 210,
      b: 210,
    };
  } else if (cell.elevation < 389) {
    rgb = {
      r: 220,
      g: 220,
      b: 220,
    };
  } else if (cell.elevation < 393) {
    rgb = {
      r: 230,
      g: 230,
      b: 230,
    };
  } else if (cell.elevation < 397) {
    rgb = {
      r: 240,
      g: 240,
      b: 240,
    };
  } else if (cell.elevation < 401) {
    rgb = {
      r: 245,
      g: 245,
      b: 245,
    };
  } else if (cell.elevation < 405) {
    rgb = {
      r: 250,
      g: 250,
      b: 250,
    };
  } else if (cell.elevation < 409) {
    rgb = {
      r: 255,
      g: 255,
      b: 255,
    };
  } else if (cell.elevation < 413) {
    rgb = {
      r: 240,
      g: 240,
      b: 240,
    };
  } else if (cell.elevation < 417) {
    rgb = {
      r: 225,
      g: 225,
      b: 225,
    };
  } else if (cell.elevation < 421) {
    rgb = {
      r: 210,
      g: 210,
      b: 210,
    };
  } else if (cell.elevation < 425) {
    rgb = {
      r: 195,
      g: 195,
      b: 195,
    };
  } else if (cell.elevation < 429) {
    rgb = {
      r: 180,
      g: 180,
      b: 180,
    };
  } else if (cell.elevation < 433) {
    rgb = {
      r: 165,
      g: 165,
      b: 165,
    };
  } else if (cell.elevation < 437) {
    rgb = {
      r: 150,
      g: 150,
      b: 150,
    };
  } else if (cell.elevation < 441) {
    rgb = {
      r: 135,
      g: 135,
      b: 135,
    };
  } else if (cell.elevation < 445) {
    rgb = {
      r: 120,
      g: 120,
      b: 120,
    };
  } else if (cell.elevation < 449) {
    rgb = {
      r: 105,
      g: 105,
      b: 105,
    };
  } else if (cell.elevation < 453) {
    rgb = {
      r: 90,
      g: 90,
      b: 90,
    };
  } else if (cell.elevation < 457) {
    rgb = {
      r: 75,
      g: 75,
      b: 75,
    };
  } else if (cell.elevation < 461) {
    rgb = {
      r: 60,
      g: 60,
      b: 60,
    };
  } else if (cell.elevation < 465) {
    rgb = {
      r: 45,
      g: 45,
      b: 45,
    };
  } else if (cell.elevation < 469) {
    rgb = {
      r: 30,
      g: 30,
      b: 30,
    };
  } else if (cell.elevation < 473) {
    rgb = {
      r: 15,
      g: 15,
      b: 15,
    };
  } else if (cell.elevation < 477) {
    rgb = {
      r: 0,
      g: 0,
      b: 0,
    };
  } else if (cell.elevation < 481) {
    rgb = {
      r: 10,
      g: 10,
      b: 10,
    };
  } else {
    rgb = {
      r: 20,
      g: 20,
      b: 20,
    };
  }
  return rgb
}

function calculateMonthlyPrecipitation(world, x, y, windMap) {
  const cell = world.map[y][x];
  const {
      distanceFromEastCoast,
      distanceFromWestCoast,
      hemisphere,
      latitude,
      temperature
  } = cell;
  
  const worldWidth = world.map[0].length;
  const worldHeight = world.map.length;

  // Scale coordinates to 96x48 for windMap
  const scaledX = Math.floor((x / worldWidth) * 96);
  const scaledY = Math.floor((y / worldHeight) * 48);
  
  // Retrieve wind data and high pressure info
  const windCell = windMap[scaledY][scaledX];
  const { lastCurrent, waterCount, landCount, isHighPressure } = windCell;

  // Baseline precipitation by latitude (approximate linear scale):
  // Equator: ~200 mm; Poles: ~10 mm
  let baseline = 300 - (latitude * (300 / 90));

  if (cell.coldCurrent) {
    baseline -= 200; 
  } else if (cell.warmCurrent) {
    baseline += 100
  }

  // Seasonal factor by hemisphere
  let juneSeasonFactor, decSeasonFactor;
  if (hemisphere === "N") {
      // Northern Hemisphere: June ~ summer, December ~ winter
      juneSeasonFactor = 1.1;
      decSeasonFactor = 0.9;
  } else {
      // Southern Hemisphere: June ~ winter, December ~ summer
      juneSeasonFactor = 0.9;
      decSeasonFactor = 1.1;
  }

  // Distance from coast factor:
  // More inland => less precipitation.  
  // Example: at 0 distance (coastline), factor = 1  
  // at 500 cells inland, factor might drop to ~0.5, etc.
  const avgDistance = (distanceFromEastCoast + distanceFromWestCoast) / 2;
  const inlandFactor = Math.max(0.5, 1 - (avgDistance / 1000));

  // Current type factor:
  // warm = +20%, cold = -20%, neutral = no change
  let currentFactor = 1;
  if (lastCurrent === "warm") currentFactor = 1.2;
  else if (lastCurrent === "cold") currentFactor = 0.8;



  // High pressure factor:
  // If isHighPressure = true, reduce precipitation (e.g., by 30%)
  const hpsFactor = isHighPressure ? 0.7 : 1.0;

  // Moisture availability from wind path:
  // Each water cell crossed before reaching this point: +1% per cell
  // Each land cell crossed: -0.5% per cell
  const moistureFactor = Math.max(0.5, Math.min(2, 1 + (waterCount * 0.01) - (landCount * 0.005)));

  // Temperature factor:
  // For every 1°C above 0, add 1%. For negative temps, reduce similarly.
  // Example: temp = 20°C => factor = 1.20; temp = -10°C => factor = 0.90
  const tempFactor = 1 + (temperature / 100);

  // Calculate final precipitation for June and December
  const junePrecip = baseline * juneSeasonFactor * inlandFactor * currentFactor * hpsFactor * moistureFactor * tempFactor;
  const decPrecip = baseline * decSeasonFactor * inlandFactor * currentFactor * hpsFactor * moistureFactor * tempFactor;
  cell.summerPrecipitation = junePrecip;
  cell.winterPrecipitation = decPrecip
  if (settings.month === "June") {
    cell.precipitation = junePrecip;
  } else {
    cell.precipitation = decPrecip
  }
}
