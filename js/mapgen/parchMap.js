function cleanBeaches() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      let onlyBeaches = true
      let neighbors = getNeighbors(cell.x, cell.y);
      for (let n = 0; n < neighbors.length; n++) {
        if (n.elevation <= limits.seaLevel.upper || biome(n) === "beach") {

        } else {
          onlyBeaches = false
        }
      }
      if (onlyBeaches === true) {
        cell.elevation = limits.seaLevel.upper - 2
        cell.beach = false
      }
    }
  }
}

function drawParchmentMap() {
  //cleanBeaches()
  ctx.lineWidth = 1
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      cell.drawn = true
      if (biome(cell) === "beach") {
        //drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
        /*
        let bn = getNeighbors(j, i)
        for (let i = 0; i < bn.length; i++) {
          if (bn[i].drawn) {

          } else {
            if (biome(bn[i]) === "beach") {
              let cx = cell.x * world.pixelSize + (world.pixelSize / 2);
              let cy = cell.y * world.pixelSize + (world.pixelSize / 2);
              let bx = bn[i].x * world.pixelSize + (world.pixelSize / 2);
              let by = bn[i].y * world.pixelSize + (world.pixelSize / 2);
              //let cx = cell.x
              //let cy = cell.y
              //let bx = bn[i].x
              //let by = bn[i].y
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(bx, by);
              ctx.stroke();
              bn[i].drawn = true
            }
          }
          */
        drawSmallPixel(ctx, cell.x, cell.y, `rgb(0, 0, 0)`)
      } else {
        let r = 221 * 0.7
        let g = 190 * 0.7
        let b = 160 * 0.7
        drawSmallPixel(ctx, cell.x, cell.y, `rgb(${r}, ${g}, ${b})`)
      }
    }
  }
}