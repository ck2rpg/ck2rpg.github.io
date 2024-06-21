/**
 * Applies a brush effect on the map based on the mouse event.
 *
 * @param {MouseEvent} e - The mouse event triggering the brush.
 * @param {number} brushSize - The size of the brush.
 * @param {string} brushType - The type of brush ("dropLand" or "raiseLand").
 * @param {number} brushHardness - The hardness of the brush, affecting the degree of elevation change.
 */
function applyBrush(e, brushSize, brushType, brushHardness) {
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
          nextCell.elevation += brushHardness;
        }
      }
    }
  }

  cleanupAll();
  drawWorld();
}