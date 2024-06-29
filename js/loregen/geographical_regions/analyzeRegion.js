function analyzeAllRegions() {
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        p.out = {}
        p.out.one = analyzeRegion(world.provinces[i], world.provinces, 1)
        p.out.two = analyzeRegion(world.provinces[i], world.provinces, 2)
        p.out.three = analyzeRegion(world.provinces[i], world.provinces, 3)
        p.out.four = analyzeRegion(world.provinces[i], world.provinces, 4)
        p.out.five = analyzeRegion(world.provinces[i], world.provinces, 5)
    }
}

/*

Initialization: Various accumulators and counters are initialized to store information about the neighboring provinces.

BFS Traversal: A breadth-first search (BFS) is conducted up to a distance of num provinces away from the input province. The queue contains objects with the province and the current distance from the original province.

Updating Accumulators: For each province in the BFS traversal, different properties are updated in the respective accumulators.

Average Calculations: After BFS traversal, averages are calculated for relevant metrics.

Assigning Regional Information: The calculated regional information is assigned to the regionalInfo property of the input province.

*/

function analyzeRegion(province, worldProvinces, num) {
    const maxDistance = num;
    const visited = new Set();
    const queue = [{province, distance: 0}];
    let originalX = province.x;
    let originalY = province.y
    let totalProvinces = 0;
    let totalLandProvinces = 0;
    let terrainCount = {};
    let climateCount = {};
    let totalElevation = 0;
    let totalSeverity = 0;
    let totalLandNeighbors = 0;
    let totalWaterNeighbors = 0;
    let totalRivers = 0;
    let totalMountains = 0;
    let totalAgriculturalProductivity = 0;
    let totalSoilQuality = 0;
    let totalMiningSuitability = 0;
    let totalLivestockSuitability = 0;
    let totalResourceProduction = {};
    let buildingMaterialsCount = {};
    let closestWaterProvince = null;
    let closestWaterDistance = Infinity;
    let closestWaterAbsoluteDistance = Infinity
    
    const countIncrement = (obj, key) => {
        if (obj[key]) {
            obj[key]++;
        } else {
            obj[key] = 1;
        }
    };
    
    while (queue.length > 0) {
        const {province, distance} = queue.shift();
        
        if (distance > maxDistance) break;
        
        if (visited.has(province)) continue;
        
        visited.add(province);
        totalProvinces++;
        

        countIncrement(terrainCount, province.terrain);
        countIncrement(climateCount, province.climate);
        totalElevation += province.elevation;
        totalSeverity += province.severity;
        totalLandNeighbors += province.placeInWorld.landNeighbors;
        totalWaterNeighbors += province.placeInWorld.waterNeighbors;
        totalRivers += province.rivers.length;
        totalMountains += province.mountains.length;
        
        if (province.land) {
            totalLandProvinces++
            const productivityMap = {"very poor": 1, "poor": 2, "average": 3, "good": 4, "excellent": 5};
            totalAgriculturalProductivity += productivityMap[province.agriculturalProductivity];
            const qualityMap = {"low": 1, "medium": 2, "high": 3};
            totalSoilQuality += qualityMap[province.soilQuality];
            totalMiningSuitability += qualityMap[province.miningSuitability];
            totalLivestockSuitability += qualityMap[province.livestockSuitability];
            if (province.buildingMaterials) {
                for (const [material, available] of Object.entries(province.buildingMaterials)) {
                    if (available) {
                        countIncrement(buildingMaterialsCount, material);
                    }
                }
            }
            if (province.resourceProduction) {
                for (const [resource, level] of Object.entries(province.resourceProduction)) {
                    if (totalResourceProduction[resource]) {
                        totalResourceProduction[resource] += level === "none" ? 0 : level === "low" ? 1 : level === "medium" ? 2 : 3;
                    } else {
                        totalResourceProduction[resource] = level === "none" ? 0 : level === "low" ? 1 : level === "medium" ? 2 : 3;
                    }
                }
            }
        }
        if (originalX === province.x && originalY === province.y) {
            //don't track closest water if it is original province
        } else {
            if (!province.land && province.adjacentToWater.length > 0 && distance < closestWaterDistance) {
                closestWaterProvince = province;
                closestWaterDistance = distance;
                closestWaterAbsoluteDistance = getDistance(originalX, originalY, province.x, province.y)
            }
        }


        
        for (const neighbor of province.placeInWorld.neighbors) {
            if (!visited.has(worldProvinces[neighbor.nonDef])) {
                queue.push({province: worldProvinces[neighbor.nonDef], distance: distance + 1});
            }
        }
    }
    
    const averageElevation = totalElevation / totalProvinces;
    const averageSeverity = totalSeverity / totalProvinces;
    const averageLandNeighbors = totalLandNeighbors / totalProvinces;
    const averageWaterNeighbors = totalWaterNeighbors / totalProvinces;
    const averageAgriculturalProductivity = totalAgriculturalProductivity / totalLandProvinces;
    const averageSoilQuality = totalSoilQuality / totalLandProvinces;
    const averageMiningSuitability = totalMiningSuitability / totalLandProvinces;
    const averageLivestockSuitability = totalLivestockSuitability / totalLandProvinces;
    const regionalInfo = {
        totalProvinces,
        terrainCount,
        climateCount,
        averageElevation,
        averageSeverity,
        averageLandNeighbors,
        averageWaterNeighbors,
        totalRivers,
        totalMountains,
        averageAgriculturalProductivity,
        averageSoilQuality,
        averageMiningSuitability,
        averageLivestockSuitability,
        //totalResourceProduction,
        buildingMaterialsCount,
        closestWaterProvince: closestWaterProvince ? closestWaterProvince : null
    };
    return regionalInfo
}
