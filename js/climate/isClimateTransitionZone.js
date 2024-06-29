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