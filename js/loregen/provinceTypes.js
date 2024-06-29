/**
 * Determines if a province is a fertile river valley province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a fertile river valley, false otherwise.
 */
function isFertileRiverValleyProvince(province) {
    const fertileTerrains = ['floodplains', 'farmlands', 'plains'];
    return fertileTerrains.includes(province.terrain) && province.rivers.length > 0 && province.elevation < 255;
}

/**
 * Determines if a province is a high altitude icy mountain province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a high altitude icy mountain, false otherwise.
 */
function isHighAltitudeIcyMountainProvince(province) {
    return province.terrain === 'mountains' && province.elevation > 450 && province.severity > 0.8;
}

/**
 * Determines if a province is a tropical island province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a tropical island, false otherwise.
 */
function isTropicalIslandProvince(province) {
    const tropicalTerrains = ['jungle', 'wetland'];
    const tropicalLatitude = 1024; // assuming equator is at y = 2048 on an 8,192 x 4,096 map
    return tropicalTerrains.includes(province.terrain) &&
           province.placeInWorld.island &&
           province.placeInWorld.distanceFromEquator <= tropicalLatitude &&
           province.placeInWorld.distanceFromEquator >= -tropicalLatitude;
}

/**
 * Determines if a province is a temperate forest province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a temperate forest, false otherwise.
 */
function isTemperateForestProvince(province) {
    const temperateTerrains = ['forest'];
    const temperateSeverityThreshold = 0.5; // assuming 0.5 as the threshold for temperate severity
    return temperateTerrains.includes(province.terrain) &&
           province.severity <= temperateSeverityThreshold &&
           province.elevation > 37 && province.elevation < 255; // between sea level and mountain level
}

/**
 * Determines if a province is a dry desert province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a dry desert, false otherwise.
 */
function isDryDesertProvince(province) {
    const desertTerrains = ['desert', 'drylands', 'desert_mountains'];
    return desertTerrains.includes(province.terrain) && province.rivers.length === 0 && province.severity < 0.1;
}

//FiX

/**
 * Determines if a province is a coastal province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a coastal province, false otherwise.
 */
function isCoastalProvince(province) {
    return province.adjacentToWater.length > 0 && province.placeInWorld.waterNeighbors > 0;
}

/**
 * Determines if a province is a lake province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a lake province, false otherwise.
 */
function isLakeProvince(province) {
    return province.placeInWorld.lake;
}

/**
 * Determines if a province is a bay province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a bay province, false otherwise.
 */
function isBayProvince(province) {
    return province.placeInWorld.bay;
}

/**
 * Determines if a province is an island province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is an island province, false otherwise.
 */
function isIslandProvince(province) {
    return province.placeInWorld.island;
}

/**
 * Determines if a province is a highland valley province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a highland valley province, false otherwise.
 */
function isHighlandValleyProvince(province) {
    return province.terrain === 'hills' && province.elevation > 255 && province.rivers.length > 0;
}

/**
 * Determines if a province is a dense forest province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a dense forest province, false otherwise.
 */
function isDenseForestProvince(province) {
    const forestNeighbors = province.neighborTerrains.filter(terrain => terrain === 'forest').length;
    return province.terrain === 'forest' && 
           province.cells.length > 1500 && 
           province.placeInWorld.landNeighbors > 2 &&
           forestNeighbors >= 3;
}

/**
 * Determines if a province is a coastal mountain province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a coastal mountain province, false otherwise.
 */
function isCoastalMountainProvince(province) {
    return province.terrain === 'mountains' && province.adjacentToWater.length > 0 && province.placeInWorld.waterNeighbors > 0;
}

/**
 * Determines if a province is a frozen tundra province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a frozen tundra province, false otherwise.
 */
function isFrozenTundraProvince(province) {
    return province.terrain === 'taiga' && province.severity >= 0.8 && province.elevation > 0 && province.elevation < 255;
}

/**
 * Determines if a province is a major river delta province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a major river delta province, false otherwise.
 */
function isMajorRiverDeltaProvince(province) {
    return province.terrain === 'wetland' && province.rivers.length >= 3 && province.adjacentToWater.length > 0;
}

/**
 * Determines if a province is a fertile plateau province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a fertile plateau province, false otherwise.
 */
function isFertilePlateauProvince(province) {
    const fertileTerrains = ['farmlands', 'plains'];
    return fertileTerrains.includes(province.terrain) && province.elevation >= 255 && province.elevation <= 450 && province.rivers.length > 0;
}

/**
 * Determines if a province is a coastal wetland province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a coastal wetland province, false otherwise.
 */
function isCoastalWetlandProvince(province) {
    return province.terrain === 'wetland' && province.adjacentToWater.length > 0 && province.placeInWorld.waterNeighbors > 0;
}

/**
 * Determines if a province is a subtropical island with jungle province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a subtropical island with jungle, false otherwise.
 */
function isSubtropicalIslandWithJungleProvince(province) {
    const subtropicalLatitude = 2048; // assuming equator is at y = 2048 on an 8,192 x 4,096 map
    return province.terrain === 'jungle' && 
           province.placeInWorld.island && 
           province.placeInWorld.distanceFromEquator <= subtropicalLatitude &&
           province.placeInWorld.distanceFromEquator >= -subtropicalLatitude &&
           province.severity < 0.5;
}

/**
 * Determines if a province is an alpine forest province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is an alpine forest province, false otherwise.
 */
function isAlpineForestProvince(province) {
    return province.terrain === 'forest' && 
           province.elevation > 255 && province.elevation <= 450 && 
           province.severity > 0.5 && province.severity <= 0.8;
}

/**
 * Determines if a province is a coastal desert with oasis province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a coastal desert with oasis, false otherwise.
 */
function isCoastalDesertWithOasisProvince(province) {
    return province.terrain === 'desert' && 
           province.adjacentToWater.length > 0 && 
           province.placeInWorld.waterNeighbors > 0 &&
           province.neighborTerrains.includes('oasis');
}

/**
 * Determines if a province is a river-crossing mountain province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a river-crossing mountain province, false otherwise.
 */
function isRiverCrossingMountainProvince(province) {
    return province.terrain === 'mountains' && 
           province.rivers.length >= 2 && 
           province.placeInWorld.landNeighbors > 3;
}

/**
 * Determines if a province is a wetland adjacent to a forest province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a wetland adjacent to a forest, false otherwise.
 */
function isWetlandAdjacentToForestProvince(province) {
    return province.terrain === 'wetland' && 
           province.neighborTerrains.includes('forest') && 
           province.adjacentToWater.length > 0;
}

/**
 * Determines if a province is a highland with multiple rivers province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a highland with multiple rivers, false otherwise.
 */
function isHighlandWithMultipleRiversProvince(province) {
    return province.terrain === 'hills' && 
           province.elevation > 255 && province.elevation <= 450 && 
           province.rivers.length >= 3;
}

/**
 * Determines if a province is a farmland adjacent to mountains province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a farmland adjacent to mountains, false otherwise.
 */
function isFarmlandAdjacentToMountainsProvince(province) {
    return province.terrain === 'farmlands' && 
           province.neighborTerrains.includes('mountains') && 
           province.elevation < 255;
}

/**
 * Determines if a province is a coastal province with significant rivers.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a coastal province with significant rivers, false otherwise.
 */
function isCoastalProvinceWithSignificantRivers(province) {
    return province.adjacentToWater.length > 0 && 
           province.rivers.length >= 3 && 
           province.placeInWorld.waterNeighbors > 0;
}

/**
 * Determines if a province is a large mountain range province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a large mountain range province, false otherwise.
 */
function isLargeMountainRangeProvince(province) {
    return province.terrain === 'mountains' && 
           province.mountains.length >= 3 && 
           province.cells.length > 2000;
}

/**
 * Determines if a province is a central desert province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a central desert province, false otherwise.
 */
function isCentralDesertProvince(province) {
    return province.terrain === 'desert' && 
           !province.adjacentToWater.length > 0 && 
           province.placeInWorld.landNeighbors > 4 && 
           province.placeInWorld.waterNeighbors === 0 &&
           province.neighborTerrains.every(terrain => terrain === 'desert');
}

/**
 * Determines if a province is a high altitude tropical mountain province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a high altitude tropical mountain, false otherwise.
 */
function isHighAltitudeTropicalMountainProvince(province) {
    return province.terrain === 'mountains' && 
           province.elevation >= 450 && 
           province.severity < 0.5 && 
           province.placeInWorld.distanceFromEquator <= 1024 &&
           province.placeInWorld.distanceFromEquator >= -1024;
}

/**
 * Determines if a province is an isolated farmlands province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is an isolated farmlands province, false otherwise.
 */
function isIsolatedFarmlandsProvince(province) {
    return province.terrain === 'farmlands' && 
           province.placeInWorld.landNeighbors < 2 && 
           !province.adjacentToWater.length > 0;
}


//NEW

/**
 * Determines if a province is a tundra province with no rivers.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a tundra province with no rivers, false otherwise.
 */
function isTundraNoRiversProvince(province) {
    return province.terrain === 'taiga' && 
           province.rivers.length === 0 && 
           province.severity >= 0.5 && province.elevation > 0;
}

/**
 * Determines if a province is a fertile coastal province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a fertile coastal province, false otherwise.
 */
function isFertileCoastalProvince(province) {
    const fertileTerrains = ['floodplains', 'farmlands', 'plains'];
    return fertileTerrains.includes(province.terrain) && 
           province.adjacentToWater.length > 0 && 
           province.rivers.length > 0;
}

/**
 * Determines if a province is a dry coastal province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a dry coastal province, false otherwise.
 */
function isDryCoastalProvince(province) {
    const dryTerrains = ['desert', 'drylands', 'desert_mountains'];
    return dryTerrains.includes(province.terrain) && 
           province.adjacentToWater.length > 0 && 
           province.severity < 0.1;
}

/**
 * Determines if a province is a wetland with multiple rivers.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a wetland with multiple rivers, false otherwise.
 */
function isWetlandWithMultipleRiversProvince(province) {
    return province.terrain === 'wetland' && 
           province.rivers.length >= 2;
}

/**
 * Determines if a province is a highland desert province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a highland desert province, false otherwise.
 */
function isHighlandDesertProvince(province) {
    const desertTerrains = ['desert', 'drylands', 'desert_mountains'];
    return desertTerrains.includes(province.terrain) && 
           province.elevation > 255 && 
           province.elevation <= 450;
}

/**
 * Determines if a province is a lowland swamp province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a lowland swamp province, false otherwise.
 */
function isLowlandSwampProvince(province) {
    return province.terrain === 'wetland' && 
           province.elevation < 37 && 
           province.neighborTerrains.includes('forest');
}

/**
 * Determines if a province is an alpine meadow province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is an alpine meadow province, false otherwise.
 */
function isAlpineMeadowProvince(province) {
    return province.terrain === 'hills' && 
           province.elevation > 255 && 
           province.elevation <= 450 && 
           province.severity > 0.5 && 
           province.neighborTerrains.includes('plains');
}

/**
 * Determines if a province is a tropical rain forest province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a tropical rain forest province, false otherwise.
 */
function isTropicalRainForestProvince(province) {
    return province.terrain === 'jungle' && 
           province.severity < 0.5 && 
           province.placeInWorld.distanceFromEquator <= 1024 && 
           province.placeInWorld.distanceFromEquator >= -1024;
}

/**
 * Determines if a province is a temperate highland forest province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a temperate highland forest province, false otherwise.
 */
function isTemperateHighlandForestProvince(province) {
    return province.terrain === 'forest' &&
           province.elevation > 255 && 
           province.elevation <= 450 &&
           province.severity > 0.3 && 
           province.severity <= 0.7;
}

/**
 * Determines if a province is a coastal steppe province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a coastal steppe province, false otherwise.
 */
function isCoastalSteppeProvince(province) {
    return province.terrain === 'steppe' && 
           province.adjacentToWater.length > 0;
}

/**
 * Determines if a province is a dry inland steppe province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a dry inland steppe province, false otherwise.
 */
function isDryInlandSteppeProvince(province) {
    return province.terrain === 'steppe' && 
           !province.adjacentToWater.length > 0 && 
           province.severity < 0.3;
}

/**
 * Determines if a province is a lush valley province.
 * @param {Province} province - The province object to evaluate.
 * @returns {boolean} - True if the province is a lush valley province, false otherwise.
 */
function isLushValleyProvince(province) {
    const lushTerrains = ['floodplains', 'farmlands', 'plains'];
    return lushTerrains.includes(province.terrain) &&
           province.placeInWorld.landNeighbors > 2 &&
           province.rivers.length > 1 &&
           province.severity > 0.2 && 
           province.severity <= 0.6;
}
