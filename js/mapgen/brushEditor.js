let isDrawing = false;
let touchedPositions = [];
let affectedCells = new Set();
let redrawTimeout;

const DEBOUNCE_TIME = 0; // Adjust debounce time as needed
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

function applySquareBrush(pos, brushSize, brushType, brushHardness) {
  const cell = xy(pos.x, pos.y);
  const halfBrush = Math.floor(brushSize / 2);
  const startY = cell.y - halfBrush;
  const endY = cell.y + halfBrush;
  const startX = cell.x - halfBrush;
  const endX = cell.x + halfBrush;

  for (let i = startY; i < endY; i++) {
    for (let j = startX; j < endX; j++) {
      let nextCell = xy(j, i);
      if (nextCell) {
        affectedCells.add(`${j},${i}`);
        if (brushType === "terrain" && nextCell.elevation > limits.seaLevel.upper) {
          nextCell.terrain = paintbrushTerrain === "desert mountains" ? "desert_mountains" : paintbrushTerrain;
          nextCell.terrainMarked = true;
        }
        if (brushType === "dropLand") {
          nextCell.elevation -= brushHardness;
          if (nextCell.elevation < limits.seaLevel.lower) {
            nextCell.elevation = limits.seaLevel.lower + 1;
          }
        } else if (brushType === "raiseLand") {
          nextCell.elevation += parseInt(brushHardness);
        } else if (brushType === "jitterRaise") {
          let n = paintbrushLast + getRandomInt(-5, 5);
          nextCell.elevation = Math.max(-255, Math.min(510, nextCell.elevation + n));
        }
      }
    }
  }
}

function applyBrush(pos, brushSize, brushType, brushHardness) {
  const cell = xy(pos.x, pos.y);
  const radius = brushSize / 2;
  const radiusSquared = radius * radius;

  const startY = Math.floor(cell.y - radius);
  const endY = Math.ceil(cell.y + radius);
  const startX = Math.floor(cell.x - radius);
  const endX = Math.ceil(cell.x + radius);
  let currHardness = parseInt(brushHardness);

  for (let i = startY; i <= endY; i++) {
    for (let j = startX; j <= endX; j++) {
      const dx = j - cell.x;
      const dy = i - cell.y;
      const dist = dx * dx + dy * dy;
      let change = dist / brushSize;
      let mod = 1 - change
    
      if (mod > 1) {
        mod = 1;
      }

      if (paintbrushFeather) {
        currHardness = Math.floor(brushHardness * mod);
        if (currHardness < 0) currHardness = 0;
      }

      if (dist <= radiusSquared) {
        let nextCell = xy(j, i);
        if (nextCell) {
          affectedCells.add(`${j},${i}`);
          if (brushType === "terrain" && nextCell.elevation > limits.seaLevel.upper) {
            nextCell.terrain = paintbrushTerrain === "desert mountains" ? "desert_mountains" : paintbrushTerrain;
            nextCell.terrainMarked = true;
          }
          if (brushType === "dropLand") {
            if (nextCell.elevation < paintbrushLimit) {
              //don't do anything if existing cell is less than brush limit
            } else {
              nextCell.elevation = paintbrushAbsolute ? currHardness : nextCell.elevation - currHardness;
              //push cell back up to brush limit if it goes below after change
              if (nextCell.elevation < paintbrushLimit) {
                nextCell.elevation = paintbrushLimit
              }
            }

          } else if (brushType === "raiseLand") {
            let change;
            if (nextCell.elevation > paintbrushLimit) {
              
            } else {
              nextCell.elevation = paintbrushAbsolute ? parseInt(currHardness) : nextCell.elevation + parseInt(currHardness);
              if (nextCell.elevation > paintbrushLimit) {
                nextCell.elevation = paintbrushLimit
              }
            }
          } else if (brushType.includes("Override")) {
            applyOverrideBrushType(brushType, nextCell);
          }
        }
      }
    }
  }
}

const overrideProps = {
  "waterOverride": "waterOverride",
  "provinceOverride": "provinceOverride",
  "duchyOverride": "duchyOverride",
  "kingdomOverride": "kingdomOverride",
  "empireOverride": "empireOverride"
};

function applyOverrideBrushType(brushType, nextCell) {
  const overrideProp = overrideProps[brushType];
  if (overrideProp === "waterOverride") {
    if (nextCell.elevation <= limits.seaLevel.upper) {
      nextCell[overrideProp] = paintbrushTitle;
      nextCell[`${overrideProp}R`] = paintbrushTitleR;
      nextCell[`${overrideProp}G`] = paintbrushTitleG;
      nextCell[`${overrideProp}B`] = paintbrushTitleB;
    }
  } else {
    if (overrideProp === "provinceOverride") {
      if (nextCell.elevation > limits.seaLevel.upper) {
        nextCell[overrideProp] = paintbrushTitle;
        nextCell[`${overrideProp}R`] = paintbrushTitleR;
        nextCell[`${overrideProp}G`] = paintbrushTitleG;
        nextCell[`${overrideProp}B`] = paintbrushTitleB;
      }
    }
  }
}

function onMouseDown(e) {
  isDrawing = true;
  touchedPositions = [];
  affectedCells.clear();
  recordPosition(e);
}

function onMouseMove(e) {
  if (isDrawing) {
    recordPosition(e);
    debounceDraw();
  }
}

function onMouseUp(e) {
  if (isDrawing) {
    isDrawing = false;
    applyBrushToTouchedPositions();
    redrawAffectedCells();
  }
}

function recordPosition(e) {
  const pos = getMousePos(canvas, e);
  touchedPositions.push(pos);
}

function applyBrushToTouchedPositions() {
  touchedPositions.forEach(pos => {
    if (paintbrushShape === "square") {
      applySquareBrush(pos, paintbrushSize, paintbrush, paintbrushHardness);
    } else {
      applyBrush(pos, paintbrushSize, paintbrush, paintbrushHardness);
    }
  });
}

function debounceDraw() {
  if (redrawTimeout) clearTimeout(redrawTimeout);
  redrawTimeout = setTimeout(() => {
    applyBrushToTouchedPositions();
    redrawAffectedCells();
    touchedPositions = [];
    affectedCells.clear();
  }, DEBOUNCE_TIME);
}

function redrawAffectedCells() {
  const context = canvas.getContext('2d');

  if (world.drawingType === "terrainMap") {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      clearCell(x, y, context);
      drawTerrainPixel(x, y)
    });
  } else if (world.drawingType === "smallProv" || world.drawingType === "smallWater") {
    const overrideProp = overrideProps[paintbrush];
    console.log(overrideProp)
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      let cell = xy(x, y)
      if (cell.provinceOverride || cell.waterOverride) {
        clearCell(x, y, context);
        drawTitlePixel(x, y, "provinceOverride")
      }
    });
  } else {
    affectedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number);
      clearCell(x, y, context);
      drawCell(x, y, context);
    });
  }


}

function clearCell(x, y, context) {
  const cellSizeX = settings.pixelSize
  const cellSizeY = settings.pixelSize
  context.clearRect(x * cellSizeX, y * cellSizeY, cellSizeX, cellSizeY);
}



// Add event listeners
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);
