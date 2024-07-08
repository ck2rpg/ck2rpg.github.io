/**
 * Applies a brush effect on the map based on the mouse event.
 *
 * @param {MouseEvent} e - The mouse event triggering the brush.
 * @param {number} brushSize - The size of the brush.
 * @param {string} brushType - The type of brush ("dropLand" or "raiseLand").
 * @param {number} brushHardness - The hardness of the brush, affecting the degree of elevation change.
 */
/*function applyBrush(e, brushSize, brushType, brushHardness) {
  const pos = getMousePos(canvas, e);
  const cell = xy(pos.x, pos.y);

  // Calculate start and end points based on brush size
  const halfBrush = Math.floor(brushSize / 2);
  const startY = cell.y - halfBrush;
  const endY = cell.y + halfBrush;
  const startX = cell.x - halfBrush;
  const endX = cell.x + halfBrush;

  for (let i = startY; i < endY; i++) {
    for (let j = startX; j < endX; j++) {
      let nextCell = xy(j, i);
      if (nextCell) {
        if (brushType === "dropLand" && nextCell.elevation > limits.seaLevel.upper) {
          nextCell.elevation -= brushHardness;
          if (nextCell.elevation < limits.seaLevel.upper) {
            nextCell.elevation = limits.seaLevel.upper + 1;
          }
        } else if (brushType === "raiseLand") {
          nextCell.elevation += parseInt(brushHardness);
        }
      }
    }
  }

  cleanupAll();
  drawWorld();
}
  */

let isDrawing = false;
let touchedPositions = [];

/**
 * Applies a brush effect on the map based on the mouse event.
 *
 * @param {MouseEvent} e - The mouse event triggering the brush.
 * @param {number} brushSize - The size of the brush.
 * @param {string} brushType - The type of brush ("dropLand" or "raiseLand").
 * @param {number} brushHardness - The hardness of the brush, affecting the degree of elevation change.
 */

function applySquareBrush(pos, brushSize, brushType, brushHardness) {
  const cell = xy(pos.x, pos.y);

  // Calculate start and end points based on brush size
  const halfBrush = Math.floor(brushSize / 2);
  const startY = cell.y - halfBrush;
  const endY = cell.y + halfBrush;
  const startX = cell.x - halfBrush;
  const endX = cell.x + halfBrush;

  for (let i = startY; i < endY; i++) {
    for (let j = startX; j < endX; j++) {
      let nextCell = xy(j, i);
      if (nextCell) {
        if (brushType === "terrain") {
          if (nextCell.elevation > limits.seaLevel.upper) {
            nextCell.terrain = paintbrushTerrain
            nextCell.terrainMarked = true;
          }
        }
        if (brushType === "dropLand") {
          nextCell.elevation -= brushHardness;
          if (nextCell.elevation < limits.seaLevel.lower) {
            nextCell.elevation = limits.seaLevel.lower + 1;
          }
        } else if (brushType === "raiseLand") {
          nextCell.elevation += parseInt(brushHardness);
        }
        if (brushType === "jitterRaise") {
          let n = paintbrushLast + getRandomInt(-5, 5)
          if (n > 510) {
            n = 510;
          } else if (n < -255) {
            n = -255
          }
          nextCell.elevation += n
        }
      }
    }
  }
}


/**
 * Applies a brush effect on the map based on the mouse event.
 *
 * @param {MouseEvent} e - The mouse event triggering the brush.
 * @param {number} brushSize - The size of the brush.
 * @param {string} brushType - The type of brush ("dropLand" or "raiseLand").
 * @param {number} brushHardness - The hardness of the brush, affecting the degree of elevation change.
 */
function applyBrush(pos, brushSize, brushType, brushHardness) {
  const cell = xy(pos.x, pos.y);
  const radius = brushSize / 2;
  const radiusSquared = radius * radius;

  // Calculate start and end points based on brush size
  const startY = Math.floor(cell.y - radius);
  const endY = Math.ceil(cell.y + radius);
  const startX = Math.floor(cell.x - radius);
  const endX = Math.ceil(cell.x + radius);

  for (let i = startY; i <= endY; i++) {
    for (let j = startX; j <= endX; j++) {
      const dx = j - cell.x;
      const dy = i - cell.y;
      if (dx * dx + dy * dy <= radiusSquared) {
        let nextCell = xy(j, i);
        if (nextCell) {
          if (brushType === "terrain") {
            if (nextCell.elevation > limits.seaLevel.upper) {
              nextCell.terrain = paintbrushTerrain
              nextCell.terrainMarked = true;
            }
          }
          if (brushType === "dropLand") {
            nextCell.elevation -= brushHardness;
            if (nextCell.elevation < limits.seaLevel.lower) {
              nextCell.elevation = limits.seaLevel.lower + 1;
            }
          } else if (brushType === "raiseLand") {
            nextCell.elevation += parseInt(brushHardness);
          }
          if (brushType === "jitterRaise") {
            let n = paintbrushLast + getRandomInt(-5, 5)
            if (n > 510) {
              n = 510;
            } else if (n < -255) {
              n = -255
            }
            nextCell.elevation += n
          }
        }
      }
    }
  }
}

function onMouseDown(e) {
  isDrawing = true;
  touchedPositions = [];
  recordPosition(e);
}

function onMouseMove(e) {
  if (isDrawing) {
    recordPosition(e);
  }
}

function onMouseUp(e) {
  if (isDrawing) {
    isDrawing = false;
    applyBrushToTouchedPositions();
    cleanupAll();
    drawWorld();
  }
}

function recordPosition(e) {
  const pos = getMousePos(canvas, e);
  touchedPositions.push(pos);
}

function applyBrushToTouchedPositions() {
  paintbrushLast = paintbrushHardness;
  if (paintbrushShape === "square") {
    touchedPositions.forEach(pos => {
      applySquareBrush(pos, paintbrushSize, paintbrush, paintbrushHardness);
    });
  } else {
    touchedPositions.forEach(pos => {
      applyBrush(pos, paintbrushSize, paintbrush, paintbrushHardness);
    });
  }

}

// Add event listeners
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);