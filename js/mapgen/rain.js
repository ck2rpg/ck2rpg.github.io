function shareRain(cell, neighbor) {
    let cellCombined = cell.raindrops + cell.elevation;
    let neighborCombined = neighbor.raindrops + neighbor.elevation;
    if (cellCombined > neighborCombined && cell.raindrops > 0) {
      neighbor.raindrops += 1;
    }
  }
  
  function trackRain(x, y) {
    let running = true
    let next = xy(x, y)
    let arr = [];
    let used = []
    let count = 0;
    while (running === true) {
      try {
        arr = [];
        let w = xy(next.x - 1, next.y);
        let e = xy(next.x + 1, next.y);
        let ne = xy(next.x + 1, next.y + 1);
        let sw = xy(next.x - 1, next.y - 1);
        let n = xy(next.x, next.y + 1);
        let s = xy(next.x, next.y - 1);
        let nw = xy(next.x - 1, next.y + 1);
        let se = xy(next.x + 1, next.y - 1)
        pushIfNotUsed(w, used, arr)
        pushIfNotUsed(e, used, arr);
        //pushIfNotUsed(ne, used, arr);
        //pushIfNotUsed(sw, used, arr);
        pushIfNotUsed(n, used, arr);
        pushIfNotUsed(s, used, arr);
        //pushIfNotUsed(nw, used, arr);
        //pushIfNotUsed(se, used, arr);
        arr.sort((a, b) => (a.elevation > b.elevation) ? 1 : -1)
        used.push(next)
        count += 1
        next.raindrops += count
        for (let n = 0; n < arr.length; n++) {
          shareRain(next, arr[n])
        }
        next = arr[0];
        if (next == undefined || next.elevation < limits.seaLevel.upper || count > 100000) {
          running = false
        } else {
          next.drawableRiver = true
        }
      } catch {
        running = false
      }
    }
  }
  
  
  function worldRain() {
    for (let i = 0; i < world.height; i++) {
      for (let j = 0; j < world.width; j++) {
        let cell = xy(j, i);
        if (cell.elevation > limits.seaLevel.upper) {
          cell.raindrops += cell.elevation
          trackRain(cell.x, cell.y)
        }
      }
    }
  }
  
  function clearRain() {
    for (let i = 0; i < world.height; i++) {
      for (let j = 0; j < world.width; j++) {
        xy(j, i).raindrops = 0
      }
    }
  }
  
  function erodeFromRaindrops() {
    for (let i = 0; i < world.height; i++) {
      for (let j = 0; j < world.width; j++) {
        let cell = xy(j, i)
        if (cell.elevation < limits.seaLevel.upper) {
          //do nothing
        } else {
          let drops = cell.raindrops
          let erosion = Math.floor(drops / 100) * (Math.floor(cell.elevation / 50))
          //let erosion = Math.floor(drops / 100)
          cell.elevation -= erosion
          if (cell.elevation < limits.seaLevel.upper) {
            cell.elevation = limits.seaLevel.upper
          }
          let comp = 1400 - cell.elevation
          if (cell.raindrops > comp && cell.elevation >= limits.seaLevel.upper) {
            cell.lake = true
          } else {
            cell.lake = false
          }
          cell.raindrops = 0;
        }
      }
    }
  }

  function rainErosion() {
    worldRain();
    erodeFromRaindrops();
    //clearRain()
  }