function riverErosion() {
  //Doesn't work great
  let used = [];
  let rivers = getRivers();
  for (let i = 0; i < rivers.length; i++) {
    let cell = rivers[i];
    let neighbors = getNeighbors(cell.x, cell.y);
    for (let n = 0; n < neighbors.length; n++) {
      if (neighbors[n].river === false) {
        neighbors[n].elevation -= 1;
        if (neighbors[n].elevation === cell.elevation) {
          neighbors[n].river = true
        }
      }
    }
  }
  drawWorld()
}

function erodeFrom(x, y) {
  let running = true
  let next = xy(x, y)
  let arr = [];
  let used = []
  let count = 0;
  let mountainRunoff = false;
  let untilRunoff = 0;
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
      pushIfNotUsed(ne, used, arr);
      pushIfNotUsed(sw, used, arr);
      pushIfNotUsed(n, used, arr);
      pushIfNotUsed(s, used, arr);
      pushIfNotUsed(nw, used, arr);
      pushIfNotUsed(se, used, arr);
      arr.sort((a, b) => (a.elevation > b.elevation) ? 1 : -1)

      used.push(next)
      count += 1;
      if (next.elevation > 150) {
        mountainRunoff = true;
      }
      if (next.elevation > limits.seaLevel.upper && next.elevation > 50) {
        next.elevation -= 1
      } else {
        if (untilRunoff === 0) {
          untilRunoff = count
        }
        if (mountainRunoff === true && untilRunoff > 30) {
          next.river = true
        }
      }
      next = arr[0];
      if (next == undefined || next.elevation < 1 || count > 100000) {
        console.log(count)
        running = false
      }
    } catch {
      running = false
    }
  }
}

function erodeFromHighPoints() {
  let arr = world.tectonics.spreadingLine;
  for (let i = 0; i < world.tectonics.spreadingLine.length; i++) {
    erodeFrom(arr[i].x, arr[i].y)
  }
}

function randomErosion(num) {
  for (let i = 0; i < num; i++) {
    let randX = getRandomInt(1, world.width - 1);
    let randY = getRandomInt(1, world.height - 1);
    erodeFrom(randX, randY)
  }
}

function worldErosion() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      try {
        erodeFrom(j, i)
      } catch {
        
      }
    }
  }
}