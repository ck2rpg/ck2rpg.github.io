function biome(cell) {
    let el = cell.elevation
    let distanceBottom = getDistance(cell.x, cell.y, world.frostPointBottom, 0)
    let distanceTop = getDistance(cell.x, cell.y, world.frostPointTop, (world.height - 1))
    if (cell.beach && beachable(cell)) {
      return "beach"
    } else if (cell.lake) {
      return "lake"
    } else if (cell.river) {
      return "river"
    } else if (el > limits.mountains.lower) {
      return "mountain"
      //try again some time - different based on snow line
    } else if (el >= limits.seaLevel.upper && el <= 255 && (distanceBottom + getRandomInt(1, 10) < 300 || distanceTop + getRandomInt(1, 10) < 300) && (cell.y < world.frostPointBottom + getRandomInt(1, 10) || cell.y > world.frostPointTop + getRandomInt(1, 10))) {
      return "arctic"
    } else if ((cell.moisture < 50 && el > limits.seaLevel.lower) || (el >= limits.seaLevel.upper && el <= 255 && cell.desert)) {
      return "desert"
    } else if (el >= limits.seaLevel.upper && el <= 255) {
      if (cell.moisture > 100) {
        return "grass"
     } if (cell.moisture > 0) {
        return "grass"
      }
      
    } else {
      return "ocean"
    }
  }
  