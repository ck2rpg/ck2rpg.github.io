function raiseMountains() {
  let mountains = getMountains();
  for (let i = 0; i < mountains.length; i++) {
    mountains[i].elevation += 1;
  }
}

function lowerSeaLevel() {
  limits.seaLevel.upper -= 1;
}

function raiseSeaLevel() {
  limits.seaLevel.upper += 1;
}

function lowerMountains(num) {
  let mountains = getMountains();
  for (let i = 0; i < mountains.length; i++) {
    mountains[i].elevation -= num;
  }
}

function raiseElevation() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      cell.elevation += 1;
    }
  }
}

function lowerElevation() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      cell.elevation -= 1;
    }
  }
}

function jumpElevation() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      cell.elevation += (world.width / 5)
    }
  }
}

function randomizeElevation() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i)
      cell.elevation += getRandomInt(-20, 20)
    }
  }
}

function lowerElevationIfLand(num) {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      let diff = cell.elevation - num;
      if (diff > limits.seaLevel.upper) {
        cell.elevation -= num;
        if (cell.elevation < limits.seaLevel.upper) {
          cell.elevation = limits.seaLevel.upper + 3;
        }
      }
    }
  }
}

function lowerElevationIfMountain(num) {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      let diff = cell.elevation - num;
      if (diff > limits.mountains.lower) {
        cell.elevation -= num;
        if (cell.elevation < limits.mountains.lower) {
          cell.elevation = limits.mountains.lower + 1;
        }
      }
    }
  }
}

function freshBase() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      if (cell.elevation > limits.seaLevel.upper) {
        cell.elevation = limits.seaLevel.upper + 1;
      }
    }
  }
}

function popupMountains() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = world.map[i][j]
      if (cell.elevation < limits.mountains.lower) {
        let diff = limits.mountains.lower - cell.elevation;
        if (diff < 10) {
          cell.elevation += diff;
          cell.elevation += 1;
        }
      }
      
    }
  }
}

function sharpenMountains() {
  let mountains = getMountains()
  for (let i = 0; i < mountains.length; i++) {
    mountains[i].elevation += getRandomInt(1, 5)
  }
}

function softenMountains() {
  for (let n = 0; n < world.height; n++) {
    for (let m = 0; m < world.width; m++) {
      let x = getRandomInt(0, world.width);
      let y = getRandomInt(0, world.height)
      try {
        let cell = xy(m, n);
        let sorter
        if (cell.elevation > 230) {
          sorter = 5
        } else if (cell.elevation > 210){
          sorter = 10
        } else if (cell.elevation > 180) {
          sorter = 15
        } else {
          sorter = 20
        }
        let neighbors = getNeighbors(cell.x, cell.y)
        neighbors.sort((a, b) => (a.elevation > b.elevation) ? 1 : -1)
        for (let l = 0; l < neighbors.length; l++) {
          let diff = cell.elevation - neighbors[l].elevation;
          if (diff > sorter) {
            let d = Math.floor(diff / 2)
            let num = getRandomInt(1, d)
            cell.elevation -= num + sorter
            neighbors[l].elevation += num + sorter
          }
          if (neighbors[l].elevation > limits.mountains.lower) {

          }
        }
      } catch {

      }
    }
  }
}