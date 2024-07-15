function drawPixelRoguelike(cell) {
    drawSmallPixel(ctx, cell.x, cell.y, "rgb(0, 0, 0)");
    let n = noise(cell.x, cell.y)
    let el = cell.elevation;
    
    if (cell.terrain === "taiga") {
        cell.rgb = `rgb(${355 - el}, ${355 - el}, ${355 - el})`;
        drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    } else if (cell.terrain === "hills" || cell.terrain === "mountains") {
        const mountainMod = cell.elevation - limits.mountains.lower;
        cell.rgb = `rgb(${mountainMod}, ${mountainMod}, ${mountainMod})`;
        drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    } else if (n < 0.2 && cell.maskMarked && !cell.desert) { //wetlands?
        drawGrassBookType(cell);
        drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    } else if (cell.terrain === "sea") {
        if (el > 30 && el < 37) {
            cell.rgb = `rgb(${194 - cell.elevation * 3}, ${178 - cell.elevation * 3}, ${128 - cell.elevation * 3})`;
            drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
        } else {
            const waterMod = 255 - Math.floor(getCorrectedColor(cell) * 0.6);
            cell.rgb = `rgb(0, 0, ${waterMod})`;
            drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
        }
    } else if (cell.terrain === "farmlands") {
        cell.rgb = `rgb(${355 - el}, ${355 - el}, ${355 - el})`;
        drawMiniField(cell)
    } else if (cell.terrain === "jungle") {
        drawGrassBookType(cell);
        drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
        drawMiniPalm(cell)
    } else if (cell.terrain === "desert") {
        drawMiniDesert(cell);
        if (n < 0.1) {
            drawMiniCactus(cell);
        } else if (n < 0.85) {

        } else {
            drawMiniCactus(cell);
        }
    } else if (cell.terrain === "desert_mountains") {
        drawMiniDesert(cell);
    } else if (cell.terrain === "steppe") {
        if (el > limits.mountains.lower) {
            const mountainMod = cell.elevation - limits.mountains.lower;
            cell.rgb = `rgb(${mountainMod}, ${mountainMod}, ${mountainMod})`;
            drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
        } else if (limits.mountains.lower - el < 50) {
            const mountainMod = cell.elevation - limits.mountains.lower;
            cell.rgb = `rgb(${mountainMod}, ${mountainMod}, ${mountainMod})`;
            drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
        } else {
            drawMiniSteppe(cell)
            drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
        }
    } else if ((cell.climateCategory === "subtropical" || cell.terrain === "desert" || cell.terrain === "drylands") && limits.mountains.lower - el < 50) {
        drawMiniDesert(cell);
    } else if (cell.terrain === "forest") {
        drawGrassBookType(cell);
        drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
        if (cell.climateCategory === "temperate") {
            drawMiniPine(cell)
        } else {
            drawMiniTree(cell);
        }
    } else if (cell.terrain === "plains") {
        drawGrassBookType(cell);
        drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
    } else {
        let b = biome(cell);  
        if (b === "grass") { //western european plain tppes minus steppe which was too messy/discoloring for our approach
            if ((cell.y > world.steppeTop || cell.y < world.steppeBottom)) {
                cell.rgb = `rgb(${355 - el}, ${355 - el}, ${355 - el})`;
            } else {
                drawGrassBookType(cell);
                drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
            }
        } else if (b === "arctic") {
            const el = cell.elevation;
            cell.rgb = `rgb(${355 - el}, ${355 - el}, ${355 - el})`;
            drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
        } else {
            //DEFAULT TERRAIN
            drawGrassBookType(cell);
            drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
        }
    }
}

function drawMiniSteppe(cell) {
    const correctedColor = getCorrectedColor(cell);
    let grassAccent = 30;
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
    drawSmallPixel(ctx, cell.x, cell.y, cell.rgb);
}

let miniSprites = GID("minisprites")

function drawMiniPine(cell) {
  const roundedX = Math.round(cell.x);
    const roundedY = Math.round(cell.y);
    let sx = 32
    let sy = 240
    ctx.drawImage(miniSprites, sx, sy, 16, 16, roundedX * settings.pixelSize, roundedY * settings.pixelSize, 16, 16);
}

function drawMiniField(cell) {
    const roundedX = Math.round(cell.x);
    const roundedY = Math.round(cell.y);
    let rand = getRandomInt(0, 3);
    let sx = 16 * rand;
    let sy = 256
    ctx.drawImage(miniSprites, sx, sy, 16, 16, roundedX * settings.pixelSize, roundedY * settings.pixelSize, 16, 16);
}

function drawMiniPalm(cell) {
   let rand = getRandomInt(0, 3);
   const roundedX = Math.round(cell.x);
   const roundedY = Math.round(cell.y);
   let sx;
   let sy;
   if (rand === 0) {
    sx = 64
    sy = 256
   } else if (rand === 1) {
    sx = 80
    sy = 256
   } else if (rand === 2) {
    sx = 96
    sy = 256
   } else if (rand === 3) {
    sx = 96
    sy = 240
   }
   ctx.drawImage(miniSprites, sx, sy, 16, 16, roundedX * settings.pixelSize, roundedY * settings.pixelSize, 16, 16);
}

function drawMiniDesert(cell) {
    const roundedX = Math.round(cell.x);
    const roundedY = Math.round(cell.y);
    let rand = getRandomInt(0, 2);
    let sx;
    if (rand === 0) {
        sx = 144
    } else if (rand === 1) {
        sx = 160
    } else if (rand === 2) {
        sx = 176;
    }
    let sy = 256
    ctx.drawImage(miniSprites, sx, sy, 16, 16, roundedX * settings.pixelSize, roundedY * settings.pixelSize, 16, 16);
}

function drawMiniCactus(cell) {
    const roundedX = Math.round(cell.x);
    const roundedY = Math.round(cell.y);
    let rand = getRandomInt(0, 5);
    let sx;
    let sy;
    if (rand === 0) {
        sx = 192;
        sy = 256;
    } else if (rand === 1) {
        sx = 208;
        sy = 256;
    } else if (rand === 2) {
        sx = 224;
        sy = 256;
    } else if (rand === 3) {
        sx = 192;
        sy = 272;
    } else if (rand === 4) {
        sx = 208;
        sy = 256;
    } else if (rand === 5) {
        sx = 224;
        sy = 256
    }
    ctx.drawImage(miniSprites, sx, sy, 16, 16, roundedX * settings.pixelSize, roundedY * settings.pixelSize, 16, 16);
}

function drawMiniTree(cell) {
    const roundedX = Math.round(cell.x);
    const roundedY = Math.round(cell.y);
    let sx = 16;
    let sy = 240;
    ctx.drawImage(miniSprites, sx, sy, 16, 16, roundedX * settings.pixelSize, roundedY * settings.pixelSize, 16, 16);
}