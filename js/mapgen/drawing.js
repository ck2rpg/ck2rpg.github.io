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

/**
 * Draws the entire world map by clearing the canvas, setting its dimensions,
 * and iterating over each cell to draw it.
 */
function drawWorld() {
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
  } else if (world.drawingType === "parchment") {
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

