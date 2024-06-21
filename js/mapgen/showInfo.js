function showInfo(e) {
  let pos = getMousePos(canvas, e);
  world.selectedCell = xy(pos.x, pos.y)
  console.log(world.selectedCell)
}