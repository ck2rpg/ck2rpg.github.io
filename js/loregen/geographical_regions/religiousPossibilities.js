/*
The region we will define is "sun_worship_possible." The concept of sun worship, which involves reverence for the sun as a deity or as a symbol of a deity, has been historically observed in various cultures around the world. These cultures often inhabit regions with certain environmental and geographical characteristics that support sun worship practices.
Criteria for "sun_worship_possible" Region

    Climate and Weather: Sun worship is more likely in regions with consistent sunlight. These are typically found in tropical or desert climates where the sun is a dominant environmental factor.
    Geographical Features: Open terrains like plains and deserts, where the sun's presence is constant and overwhelming, are ideal. Regions with minimal forest cover or dense vegetation are less likely to develop sun-worshipping traditions.
    Cultural and Agricultural Practices: High agricultural productivity, particularly in regions where the sun plays a critical role in crop growth, can lead to the development of sun worship as a form of gratitude or reverence.
    Building Materials: Regions rich in materials that are not typically associated with heavy forestation (e.g., adobe, stone) may indicate a reliance on the sun for drying and hardening these materials.
    Location: Proximity to the equator ensures more consistent solar exposure throughout the year, making sun worship more plausible.
    Historical Precedence: Presence of certain resources like gold, which historically has been associated with the sun in various cultures, can also be an indicator.

These factors collectively form a plausible basis for defining a region where sun worship is likely to occur. We will use these criteria to determine if a province can be classified as "sun_worship_possible."
*/
function isSunWorshipPossible(province) {
    // Criteria for "sun_worship_possible" region
    const validClimates = ["BWh", "BSh", "Csa", "Csb", "Aw", "Am"];
    const validTerrains = ["plains", "desert", "drylands", "steppe", "farmlands"];
    const highSunlightRegions = province.placeInWorld.distanceFromEquator < 2048; // Closer to the equator
    const adequateAgriculturalProductivity = ["good", "excellent"].includes(province.agriculturalProductivity);
    const appropriateBuildingMaterials = province.buildingMaterials.adobe || province.buildingMaterials.stone;
    const historicalGoldPresence = province.resourceProduction.gold === "Medium" || province.resourceProduction.gold === "High";
    const minimalForestCoverage = !["forest", "jungle", "wetland", "taiga"].includes(province.terrain);

    // Check all criteria
    return validClimates.includes(province.climate) &&
           validTerrains.includes(province.terrain) &&
           highSunlightRegions &&
           adequateAgriculturalProductivity &&
           appropriateBuildingMaterials &&
           historicalGoldPresence &&
           minimalForestCoverage;
}


function isOceanWorshipPossible(province) {
    // Criteria for "ocean_worship_possible" region
    const proximityToWater = province.adjacentToWater.length > 0 || province.placeInWorld.waterNeighbors > 0 || province.placeInWorld.island || province.placeInWorld.bay;
    const validClimates = ["Af", "Am", "As", "Csa", "Csb", "Cfa", "Cfb"];
    const marineResourceDependence = ["saltwaterFish", "salt", "freshwaterFish"].some(resource => province.resourceProduction[resource] === "Medium" || province.resourceProduction[resource] === "High");
    const seafaringTradition = province.placeInWorld.waterNeighbors > 1; // More water neighbors imply stronger maritime tradition
    // Check all criteria
    return proximityToWater &&
           validClimates.includes(province.climate) &&
           marineResourceDependence &&
           seafaringTradition
}