function calculateLivestockSuitability(province) {
    let score = 0;

    // Elevation suitability
    if (province.elevation < 37) {
        score -= 5; // Not suitable for livestock due to flooding risk or being too flat
    } else if (province.elevation >= 37 && province.elevation <= 205) {
        score += 10; // Ideal elevation for grazing
    } else if (province.elevation > 205 && province.elevation <= 255) {
        score += 5; // Still suitable but less ideal due to rougher terrain
    } else if (province.elevation > 255) {
        score -= 10; // High elevations, less suitable for livestock
    }

    // Climate suitability
    switch (province.climate) {
        case 'BWh':
        case 'BWk':
        case 'BSk':
        case 'Dfc':
        case 'Dfd':
        case 'ET':
        case 'EF':
            score -= 20; // Harsh climates, less suitable for livestock
            break;
        case 'Csa':
        case 'Csb':
        case 'Cfa':
        case 'Cfb':
        case 'Cfc':
        case 'Dfa':
        case 'Dfb':
            score += 20; // Moderate climates, more suitable for livestock
            break;
        default:
            score += 10; // Other climates moderately suitable
            break;
    }

    // Soil quality impact
    switch (province.soilQuality) {
        case 'low':
            score -= 5;
            break;
        case 'medium':
            score += 5;
            break;
        case 'high':
            score += 10;
            break;
    }

    // Agricultural productivity
    switch (province.agriculturalProductivity) {
        case 'very poor':
            score -= 10;
            break;
        case 'poor':
            score -= 5;
            break;
        case 'average':
            score += 5;
            break;
        case 'good':
        case 'excellent':
            score += 15;
            break;
    }

    // Neighbor terrains' influence (more variety can be beneficial)
    const uniqueTerrains = new Set(province.neighborTerrains);
    score += uniqueTerrains.size * 2; // Bonus for each unique neighboring terrain

    // Additional checks for water adjacency
    if (province.adjacentToWater.length > 0 && province.elevation >= 37) {
        score += 5; // Water sources are beneficial
    }

    // Adjust scores based on whether the province is an island or has extreme terrains
    if (province.placeInWorld.island) {
        score -= 20; // Islands might not be suitable due to limited space
    }

    // Normalize the score to be between 0 and 100
    const normalizedScore = Math.min(Math.max(score, 0), 100);
    if (normalizedScore >= 60) {
        return "high";
    } else if (normalizedScore >= 30) {
        return "medium";
    } else if (normalizedScore > 15) {
        return "low";
    } else {
        return "none";
    }
}