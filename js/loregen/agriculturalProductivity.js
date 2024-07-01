function calculateAgriculturalProductivity(province) {
    let productivity = 0;

    // Define productivity factors for different terrains
    const terrainProductivity = {
        floodplains: 1.5,
        oasis: 1.3,
        farmlands: 1.4,
        plains: 1.2,
        forest: 0.9,
        hills: 0.7,
        jungle: 0.6,
        steppe: 0.5,
        wetland: 0.4,
        desert: 0.2,
        desert_mountains: 0.1,
        drylands: 0.3,
        mountains: 0.1,
        taiga: 0.3,
        sea: 0
    };

    // Base productivity based on terrain
    productivity += terrainProductivity[province.terrain] || 0;

    // Adjust based on elevation
    if (province.elevation > 205) {
        productivity -= 0.3; // Hills and mountains, less suitable for agriculture
    }

    // Adjust based on severity of winter
    productivity *= (1 - province.severity); // Severe winters reduce productivity

    // Adjust based on distance from the equator
    const distanceFactor = 1 - (Math.abs(province.distanceFromEquator - 2048) / 2048);
    productivity *= distanceFactor;

    // Adjust for the presence of water (beneficial for irrigation)
    if (province.length > 0) {
        productivity += 0.2;
    }

    // Adjust for the number of rivers passing through the province
    if (province.rivers.length > 0) {
        productivity += 0.1 * province.rivers.length;
    }

    // Adjust for the number of neighboring land provinces (indicates connectivity and potential for trade and support)
    productivity += 0.05 * province.placeInWorld.landNeighbors;

    // Adjust for island, lake, and bay conditions
    if (province.placeInWorld.island) {
        productivity -= 0.2; // Islands may have limited arable land
    }
    /* This should check neighboring provinces for lake instead
    if (province.placeInWorld.lake) {
        productivity += 0.1; // Lakes can provide irrigation benefits
    }
    */
    if (province.placeInWorld.bay) {
        productivity += 0.1; // Bays can provide additional water resources
    }

    // Adjust for the Koppen climate classification
    const climateProductivity = {
        Af: 1.2, // Tropical rainforest
        Am: 1.1, // Tropical monsoon
        Aw: 1.0, // Tropical savanna
        BWh: 0.3, // Desert (hot)
        BWk: 0.2, // Desert (cold)
        BSh: 0.5, // Semi-arid (hot)
        BSk: 0.4, // Semi-arid (cold)
        Csa: 1.1, // Mediterranean
        Csb: 1.0, // Mediterranean
        Cfa: 1.2, // Humid subtropical
        Cfb: 1.1, // Oceanic
        Cfc: 0.8, // Subpolar oceanic
        Dfa: 0.9, // Humid continental (hot summer)
        Dfb: 0.8, // Humid continental (warm summer)
        Dfc: 0.7, // Subarctic
        Dfd: 0.6, // Subarctic (severe winter)
        ET: 0.4, // Tundra
        EF: 0.1  // Ice cap
    };

    productivity *= climateProductivity[province.climate] || 0.5;

    // Adjust for additional complex factors
    province.soilQuality = calculateSoilQuality(province)
    productivity += calculateAdditionalFactors(province);
    let cp = Math.max(0, productivity) // Ensure productivity is not negative
    if (cp < 0.8) {
        return "very poor"
    } else if (cp < 1.2) {
        return "poor"
    } else if (cp < 1.6) {
        return "average"
    } else if (cp < 2.0) {
        return "good"
    } else if (cp >= 2.0) {
        return "excellent"
    } else {
        return "average" //catch all
    }
}

function calculateSoilQuality(province) {
    let soilQualityScore = 0;

    // Factors influencing soil quality
    const terrainFactors = {
        floodplains: 1.5,
        oasis: 1.3,
        farmlands: 1.4,
        plains: 1.2,
        forest: 0.9,
        hills: 0.7,
        jungle: 0.6,
        steppe: 0.5,
        wetland: 0.4,
        desert: 0.2,
        desert_mountains: 0.1,
        drylands: 0.3,
        mountains: 0.1,
        taiga: 0.3,
        sea: 0
    };

    const climateFactors = {
        Af: 1.2, // Tropical rainforest
        Am: 1.1, // Tropical monsoon
        Aw: 1.0, // Tropical savanna
        BWh: 0.3, // Desert (hot)
        BWk: 0.2, // Desert (cold)
        BSh: 0.5, // Semi-arid (hot)
        BSk: 0.4, // Semi-arid (cold)
        Csa: 1.1, // Mediterranean
        Csb: 1.0, // Mediterranean
        Cfa: 1.2, // Humid subtropical
        Cfb: 1.1, // Oceanic
        Cfc: 0.8, // Subpolar oceanic
        Dfa: 0.9, // Humid continental (hot summer)
        Dfb: 0.8, // Humid continental (warm summer)
        Dfc: 0.7, // Subarctic
        Dfd: 0.6, // Subarctic (severe winter)
        ET: 0.4, // Tundra
        EF: 0.1  // Ice cap
    };

    // Base soil quality from terrain
    soilQualityScore += terrainFactors[province.terrain] || 0;

    // Adjust for climate
    soilQualityScore *= climateFactors[province.climate] || 0.5;

    // Adjust for proximity to water
    if (province.adjacentToWater.length > 0) {
        soilQualityScore += 0.2;
    }

    // Adjust for elevation (higher elevation may have poorer soil quality)
    if (province.elevation < 37) {
        soilQualityScore -= 0.5; // Sea level or below
    } else if (province.elevation > 205) {
        soilQualityScore -= 0.3; // Hills and mountains
    }

    // Final classification based on the score
    if (soilQualityScore > 1.5) {
        return 'high';
    } else if (soilQualityScore > 1.0) {
        return 'medium';
    } else {
        return 'low';
    }
}

function calculateAdditionalFactors(province) {
    let additionalProductivity = 0;

    // Example additional factors (these could be more detailed in a real application)
    const soilQuality = {
        high: 1.2,
        medium: 1.0,
        low: 0.8
    };

    // Simulate getting these values from the province object
    const soil = province.soilQuality || 'medium'; // Default to 'medium' if not specified

    additionalProductivity += soilQuality[soil];

    return additionalProductivity;
}
