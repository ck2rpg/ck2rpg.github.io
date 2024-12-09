function isClimateTransitionZone(province) {
    // Extract the climate of the current province
    const currentClimate = province.climate;
  
    // Iterate through the neighboring provinces
    for (const neighbor of province.neighbors) {
      // If any neighbor has a different climate, it is a transition zone
      if (neighbor.climate !== currentClimate) {
        return true;
      }
    }
  
    // If no neighbors have a different climate, it is not a transition zone
    return false;
  }

function assignClimateTransitionZones() {
  for (let i = 0; i < world.provinces.length; i++) {
    let p = world.provinces[i]
    p.climateTransitionZone = isClimateTransitionZone(p)
  }
}

function getSmallCellLatitude(cell) {
  let climateRow = (cell.y / world.height) * 100;
  let equatorRow = (settings.equator / settings.height) * 100;
  let furthestExtent = equatorRow > 50 ? equatorRow : 100 - equatorRow; 
  let equatorDistance = Math.abs(climateRow - equatorRow);
  let latitude = (equatorDistance / furthestExtent) * 90;
  cell.latitude = latitude
  cell.uncorrectedLatitude = (equatorDistance / furthestExtent) * 90
  if (climateRow < equatorRow) {
    cell.hemisphere = "N"
  } else {
    cell.hemisphere = "S"
  }
  return latitude
}