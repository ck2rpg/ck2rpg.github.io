//https://pressbooks.bccampus.ca/physgeoglabmanual1/back-matter/appendix-2-koppen-climate-classification-system/
function getKoppenClimateClassification(province) {
    const { terrain, elevation, severity, placeInWorld, distanceFromEquator } = province;
    const { landNeighbors, waterNeighbors, island, lake, bay, neighborTerrains } = placeInWorld;

    const isNearWater = waterNeighbors > 0 || province.adjacentToWater.length > 0 || lake || bay || island;
    const elevationLevel = elevation < 37 ? 'low' : elevation > 255 ? 'high' : 'medium';
    const isTropical = distanceFromEquator < limits.tropical.upper;
    const isSubtropical = distanceFromEquator >= limits.subTropical.lower && limits.subTropical.upper < 1024;
    const isTemperate = distanceFromEquator >= limits.temperate.lower && limits.temperate.upper < 1536;
    const isCold = distanceFromEquator >= limits.cold.lower;

    let climateType = '';

    // Determine climate based on terrain, elevation, and distance from equator
    if (isTropical) {
        if (terrain === 'jungle' || terrain === 'forest') {
            climateType = 'Af'; // Tropical Rainforest
        } else if (terrain === 'savanna' || terrain === 'drylands' || severity > 0.2) {
            climateType = 'Aw'; // Tropical Savanna
        } else if (terrain === 'wetland') {
            climateType = 'Am'; // Tropical Monsoon
        } else {
            climateType = 'As'; // Tropical Dry
        }
    } else if (isSubtropical) {
        if (terrain === 'desert' || terrain === 'drylands') {
            climateType = 'BWh'; // Hot Desert
        } else if (terrain === 'steppe') {
            climateType = 'BSh'; // Hot Steppe
        } else if (terrain === 'forest' || terrain === 'farmlands' || isNearWater) {
            climateType = 'Cfa'; // Humid Subtropical
        } else if (terrain === 'wetland') {
            climateType = 'Cwa'; // Humid Subtropical with dry winter
        } else {
            climateType = 'Csa'; // Mediterranean with hot summer
        }
    } else if (isTemperate) {
        if (terrain === 'forest' || terrain === 'hills') {
            climateType = 'Cfb'; // Oceanic
        } else if (terrain === 'steppe' || severity > 0.3) {
            climateType = 'BSk'; // Cold Steppe
        } else if (terrain === 'desert') {
            climateType = 'BWk'; // Cold Desert
        } else if (terrain === 'wetland') {
            climateType = 'Cwb'; // Oceanic with dry winter
        } else {
            climateType = 'Csb'; // Mediterranean with warm summer
        }
    } else if (isCold) {
        if (terrain === 'taiga' || terrain === 'forest') {
            climateType = 'Dfc'; // Subarctic
        } else if (terrain === 'steppe' || terrain === 'tundra' || severity > 0.5) {
            climateType = 'ET'; // Tundra
        } else if (elevationLevel === 'high') {
            climateType = 'EF'; // Ice Cap
        } else {
            climateType = 'Dfd'; // Subarctic with severe winters
        }
    }

    // Adjust classification based on elevation
    if (elevationLevel === 'high') {
        if (isTropical || isSubtropical) {
            climateType = 'H'; // Highland
        } else if (isTemperate && terrain !== 'mountains') {
            climateType = 'Cfb'; // Oceanic (for highlands in temperate regions)
        } else if (isCold) {
            climateType = 'ET'; // Tundra (for highlands in cold regions)
        }
    }

    // Additional fine-tuning based on specific terrain types
    if (terrain === 'floodplains' || terrain === 'wetland') {
        if (isTemperate) {
            climateType = 'Cfb'; // Oceanic (for wetlands in temperate regions)
        } else if (isSubtropical) {
            climateType = 'Cfa'; // Humid Subtropical (for wetlands in subtropical regions)
        } else if (isTropical) {
            climateType = 'Af'; // Tropical Rainforest (for wetlands in tropical regions)
        }
    } else if (terrain === 'mountains' || terrain === 'desert_mountains') {
        climateType = 'H'; // Highland
    } else if (terrain === 'oasis') {
        climateType = 'BWh'; // Hot Desert (oasis usually found in deserts)
    } else if (terrain === 'floodplains') {
        if (isSubtropical) {
            climateType = 'Cwa'; // Humid Subtropical with dry winter
        } else if (isTemperate) {
            climateType = 'Cwb'; // Oceanic with dry winter
        } else if (isCold) {
            climateType = 'Dwb'; // Cold with dry winter
        }
    } else if (province.placeInWorld.bay) {
        if (isSubtropical) {
            climateType = 'Cfa'; // Humid Subtropical
        } else if (isTemperate) {
            climateType = 'Cfb'; // Oceanic
        } else if (isCold) {
            climateType = 'Dfc'; // Subarctic
        }
    }
    
    if (climateType) {
        return climateType
    } else {
        return "sea"
    }

    return climateType || 'unknown';
}
