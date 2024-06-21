function floodFillContinentsByProvince() {
    for (let i = 0; i < hist.land.length; i++) {
      console.log(`filling ${i} of ${hist.land.length}`)
      let p = hist.land[i]
      if (p.floodfilled) {
  
      } else {
        ffcbp(p)
      }
    }
  }
  
  let ff = 0
  
  function ffcbp(p, color, cont) {
    if (p.floodfilled || p.land === false) {
      return;
    }
    ff += 1;
    console.log(ff)
    let newContinent = false
    let continent;
    if (cont) {
      continent = cont
      newContinent = false;
    } else {
      continent = {}
      newContinent = true
    }
    let c;
    if (color) {
      c = color;
    } else {
      c = `rgb(${getRandomInt(1, 255)}, ${getRandomInt(1, 255)}, ${getRandomInt(1, 255)})`
      continent.color = c
      continent.provinces = [];
    }
    p.floodfilled = true;
    p.continentId = c
    continent.provinces.push(p)
    if (newContinent) {
      world.continentsByProvince.push(continent)
    }
  
    for (let n = 0; n < p.adjacencies.length; n++) {
      let adj = parseInt(p.adjacencies[n])
      let neighbor = world.provinces[adj]
      if (neighbor.floodfilled || neighbor.land === false) {
        
      } else {
        try {
          ffcbp(neighbor, c, continent)
        } catch {
    
        }
      }
    }
    
  }
  
  
  function floodFillContinent(x, y, color) {
    let cell = xy(x, y);
    let c = color || `rgb(${getRandomInt(1, 255)}, ${getRandomInt(1, 255)}, ${getRandomInt(1, 255)})`
    if (cell && cell.floodFilled === true) {
      return
    }
    if (cell && cell.elevation > (limits.seaLevel.upper)) {
      cell.floodFilled = true;
      cell.continentId = c
      try {
        floodFillContinent(x + 1, y, c);
      } catch {
  
      }
      try {
        floodFillContinent(x - 1, y, c);
      } catch {
  
      }
      try {
        floodFillContinent(x, y + 1, c);
      } catch {
  
      }
  
      try {
        floodFillContinent(x, y - 1, c)
      } catch {
  
      }
      
      
      
      
    }
  }
  
  
  function floodFillContinents() {
    let land = getLand()
    for (let i = 0; i < land.length; i++) {
      let cell = land[i]
      if (cell && cell.floodFilled === false) {
        floodFillContinent(cell.x, cell.y)
      }
    }
    for (let i = 0; i < land.length; i++) {
      let cell = land[i]
      let exists = false;
      for (let n = 0; n < world.continents.length; n++) {
        let continent = world.continents[n];
        if (continent.id === cell.continentId) {
          if (cell.x < continent.farthestWest) {
            continent.farthestWest = cell.x
          }
          if (cell.x > continent.farthestEast) {
            continent.farthestEast = cell.x;
          }
          if (cell.y < continent.farthestSouth) {
            continent.farthestSouth = cell.y;
          }
          if (cell.y > continent.farthestNorth) {
            continent.farthestNorth = cell.y
          }
          continent.cells.push(cell)
          exists = true
        }
      }
      if (exists === false) {
        let continent = {};
        continent.id = cell.continentId;
        continent.cells = [];
        continent.cells.push(cell);
        continent.farthestWest = cell.x;
        continent.farthestEast = cell.x
        continent.farthestNorth = cell.y;
        continent.farthestSouth = cell.y;
        continent.moveX = getRandomInt(-1, 1);
        continent.moveY = getRandomInt(-1, 1)
        continent.provinces = []
        world.continents.push(continent)
      }
    }
  }
  
  function floodFill(x, y, color) {
    let cell = xy(x, y);
    let c = color || `rgb(${getRandomInt(1, 255)}, ${getRandomInt(1, 255)}, ${getRandomInt(1, 255)})`
    if ((cell && cell.lake === false) || (cell && cell.floodFilled === true)) {
      return
    }
    if (cell && cell.lake === true) {
      cell.floodFilled = true;
      cell.riverId = c
      try {
        floodFill(x + 1, y, c);
      } catch {
  
      }
      try {
        floodFill(x - 1, y, c);
      } catch {
  
      }
      try {
        floodFill(x, y + 1, c);
      } catch {
  
      }
      try {
        floodFill(x, y - 1, c)
      } catch {
  
      }
  
    }
  }
  
  function floodFillTree(x, y, color) {
    try {
      let cell = xy(x, y);
      let c = color || `rgb(${getRandomInt(1, 255)}, ${getRandomInt(1, 255)}, ${getRandomInt(1, 255)})`
      if (cell.tree === false || cell.floodFilled === true) {
        return
      }
      if (cell.tree === true) {
        cell.floodFilled = true;
        cell.forestId = c
        floodFillTree(x + 1, y, c);
        floodFillTree(x - 1, y, c);
        floodFillTree(x, y + 1, c);
        floodFillTree(x, y - 1, c)
      }
    } catch {
  
    }
  
  }
  
  function floodFillMountain(x, y, color) {
    try {
      let cell = xy(x, y);
      let c = color || `rgb(${getRandomInt(1, 255)}, ${getRandomInt(1, 255)}, ${getRandomInt(1, 255)})`
      if (cell.elevation < limits.mountains.lower || cell.floodFilled === true) {
        return
      }
      if (cell.elevation >= limits.mountains.lower) {
        cell.floodFilled = true;
        cell.mountainId = c
        floodFillMountain(x + 1, y, c);
        floodFillMountain(x - 1, y, c);
        floodFillMountain(x, y + 1, c);
        floodFillMountain(x, y - 1, c)
      }
    } catch {
  
    }
  }
  
  function floodFillRivers() {
    world.rivers = []
    let lakes = getLakes()
    for (let i = 0; i < lakes.length; i++) {
      let cell = lakes[i]
      if (cell && cell.floodFilled === false) {
        floodFill(cell.x, cell.y)
      }
    }
    for (let i = 0; i < lakes.length; i++) {
      let cell = lakes[i]
      let exists = false;
      for (let n = 0; n < world.rivers.length; n++) {
        let river = world.rivers[n];
        if (river.id === cell.riverId) {
          river.cells.push(cell)
          exists = true
        }
      }
      if (exists === false) {
        let river = {};
        river.id = cell.riverId;
        river.cells = [];
        river.cells.push(cell);
        world.rivers.push(river)
      }
    }
    console.log(world.rivers)
    for (let i = 0; i < world.rivers.length; i++) {
      let river = world.rivers[i]
      river.coasts = []
      river.oceanOutlets = []
      river.isRiver = false;
      for (let n = 0; n < river.cells.length; n++) {
        let riverCell = river.cells[n]
        //riverCell.dropToWater = true;
        let neighbors = getNeighbors(riverCell.x, riverCell.y)
        for (let j = 0; j < neighbors.length; j++) {
          let neighbor = neighbors[j]
          if (neighbor) {
            if (neighbor.lake === false && neighbor.elevation > limits.seaLevel.upper) {
              river.coasts.push(neighbor)
              let rand = getRandomInt(1, 15);
              if (rand < 5) {
                neighbor.farmlandPotential = true;
              } else if (rand < 10) {
                //neighbor.floodplainPotential = true;
              } else {
                //do nothing
              }
            }
            if (neighbor.elevation <= limits.seaLevel.upper) {
              river.oceanOutlets.push(neighbor)
              river.isRiver = true
            }
          }
        }
      }
    }
    for (let i = 0; i < world.rivers.length; i++) {
      let water = world.rivers[i]
      if (water.isRiver) {
        for (let i = 0; i < water.cells.length; i++) {
          water.cells[i].lake = false;
          water.cells[i].river = true;
        }
      } else {
        for (let i = 0; i < water.cells.length; i++) {
          water.cells[i].lake = true;
          water.cells[i].river = false;
        }
      }
    }
  }

  function floodFillMountains() {
    let mountains = getMountains()
    for (let i = 0; i < mountains.length; i++) {
      let cell = mountains[i]
      if (cell.floodFilled === false) {
        floodFillMountain(cell.x, cell.y)
      }
    }
    for (let i = 0; i < mountains.length; i++) {
      let cell = mountains[i]
      let exists = false;
      for (let n = 0; n < world.mountains.length; n++) {
        let mountain = world.mountains[n];
        if (mountain.id === cell.mountainId) {
          mountain.cells.push(cell)
          exists = true
        }
      }
      if (exists === false) {
        let mountain = {};
        mountain.id = cell.mountainId;
        mountain.cells = [];
        mountain.cells.push(cell);
        world.mountains.push(mountain)
      }
    }
  }
  
  function floodFillTrees() {
    let trees = getTrees();
    for (let i = 0; i < trees.length; i++) {
      let cell = trees[i]
      if (cell.floodFilled === false) {
        floodFillTree(cell.x, cell.y)
      }
    }
    console.log(trees)
    for (let i = 0; i < trees.length; i++) {
      let cell = trees[i]
      let exists = false;
      for (let n = 0; n < world.forests.length; n++) {
        let forest = world.forests[n];
        if (forest.id === cell.forestId) {
          forest.cells.push(cell)
          exists = true
        }
      }
      if (exists === false) {
        let forest = {};
        forest.id = cell.forestId;
        forest.cells = [];
        forest.cells.push(cell);
        world.forests.push(forest)
      }
    }
  }