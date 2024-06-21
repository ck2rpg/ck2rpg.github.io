function getMountains() {
  let arr = [];
  for (let j = 0; j < world.height; j++) {
    for (let i = 0; i < world.width; i++) {
      let cell = xy(i, j);
      if (cell.elevation > limits.mountains.lower) {
        arr.push(cell);
      }
    }
  }
  return arr
}

function getLakes() {
  let arr = [];
  for (let j = 0; j < world.height; j++) {
    for (let i = 0; i < world.width; i++) {
      let cell = xy(i, j);
      if (cell.lake) {
        arr.push(cell);
      }
    }
  }
  return arr
}

function getTrees() {
  let arr = [];
  for (let j = 0; j < world.height; j++) {
    for (let i = 0; i < world.width; i++) {
      let cell = xy(i, j);
      if (cell.tree) {
        arr.push(cell);
      }
    }
  }
  return arr
}

function getLand() {
  let arr = [];
  for (let j = 0; j < world.height; j++) {
    for (let i = 0; i < world.width; i++) {
      let cell = xy(i, j);
      cell.floodFilled = false
      if (cell.elevation > limits.seaLevel.upper) {
        arr.push(cell);
      }
    }
  }
  return arr
}

function getRiverById(id) {
  for (let i = 0; i < world.rivers.length; i++) {
    let river = world.rivers[i]
    if (id === river.id) {
      return river
    }
  }
}

function getBeaches() {
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      cell.beach = false
      try {
        let neighbors = getNeighbors(cell.x, cell.y);
        if (cell.elevation >= limits.seaLevel.upper) {
          let isBeach = false;
          for (let n = 0; n < neighbors.length; n++) {
            let neighbor = neighbors[n]
            if (neighbor.elevation < limits.seaLevel.upper) {
              neighbor.coastal = true
              isBeach = true;
              break;
            } else {
              neighbor.coastal = false
            }
          }
          if (isBeach === true) {
            cell.beach = true
          } else {
            cell.beach = false
          }
        }
      } catch {

      }
    }
  }
}

function getRivers() {
  let arr = []
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      if (cell.river) {
        arr.push(cell)
      }
    }
  }
  return arr;
}

function getLakes() {
  let arr = [];
  for (let i = 0; i < world.height; i++) {
    for (let j = 0; j < world.width; j++) {
      let cell = xy(j, i);
      if (cell.lake) {
        arr.push(cell)
      }
    }
  }
  return arr
}