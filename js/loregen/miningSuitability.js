function calculateMiningSuitability(province) {
    // Define weights for each factor influencing medieval mining suitability
    const weights = {
        elevation: 0.2,
        terrain: 0.3,
        rivers: 0.1,
        mountains: 0.4,
        soilQuality: 0.1
    };

    // Helper function to normalize a value within a range [min, max]
    function normalize(value, min, max) {
        return (value - min) / (max - min);
    }

    // Assess elevation suitability: moderate elevation is better for medieval mining
    let elevationScore = 0;
    if (province.elevation >= 37 && province.elevation <= 510) {
        if (province.elevation > 37 && province.elevation <= 205) {
            elevationScore = normalize(province.elevation, 37, 205);
        } else if (province.elevation > 205 && province.elevation <= 510) {
            elevationScore = normalize(510 - province.elevation, 37, 205);
        }
    }

    // Assess terrain suitability for medieval mining
    const miningTerrains = ['mountains', 'hills', 'forest'];
    let terrainScore = miningTerrains.includes(province.terrain) ? 1 : 0;

    // Assess river impact: presence of rivers might provide water for mining but complicate operations
    let riverScore = province.rivers.length > 0 ? 0.5 : 1;

    // Assess mountain ranges: presence of mountains is a highly positive factor
    let mountainScore = province.mountains.length > 0 ? 1 : 0;

    // Assess soil quality: less important in a medieval context, but still a factor
    const soilQualityMap = {
        low: 0,
        medium: 0.5,
        high: 1
    };
    let soilQualityScore = soilQualityMap[province.soilQuality] || 0;

    // Calculate the final medieval mining suitability score
    let miningSuitabilityScore = (
        (elevationScore * weights.elevation) +
        (terrainScore * weights.terrain) +
        (riverScore * weights.rivers) +
        (mountainScore * weights.mountains) +
        (soilQualityScore * weights.soilQuality)
    );

    if (miningSuitabilityScore > 0.7) {
        return "high"
    } else if (miningSuitabilityScore > 0.4) {
        return "medium"
    } else if (miningSuitabilityScore > 0.2) {
        return "low"
    } else {
        return "none"
    }

    return {
        suitabilityScore: miningSuitabilityScore,
        evaluation: miningSuitabilityScore > 0.7 ? 'High' :
                    miningSuitabilityScore > 0.4 ? 'Medium' : 'Low'
    };
}
