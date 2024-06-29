
function evaluateExpansionFavorability(province) {
    let score = 0;
    const terrainScores = {
        'plains': 10, 'farmlands': 10, 'forest': 7, 'hills': 5, 'mountains': -3, 'desert': -2,
        'jungle': -1, 'wetland': -4, 'taiga': 3, 'drylands': 2, 'steppe': 6, "sea": 15,
    };
    score += terrainScores[province.terrain]
    if (province.resourceProduction && typeof province.resourceProduction === 'object') {
        Object.entries(province.resourceProduction).forEach(([resource, level]) => {
            const resourceScores = { 'none': 0, 'low': 2, 'medium': 5, 'high': 10 };
            score += resourceScores[level] || 0;
        });
    }
    if (province.land && province.adjacentToWater.length > 0) {
        score += 15
    }
    if (province.elevation >= 37) {
        score -= Math.floor(province.elevation / 37)
    } else {
        if (province.elevation > -1) {
            let adjusted = 37 - province.elevation
            score -= adjusted
        } else {
            score += province.elevation //negative
        }
    }
    if (province.bay) {
        score += 10
    }
    if (province.out && province.out.five) {
        score += Math.floor(province.out.five.averageAgriculturalProductivity * 1)
        score += Math.floor(province.out.five.averageSoilQuality * 1)
        score += Math.floor(province.out.five.totalRivers / province.out.five.totalProvinces)
        
        if (province.out.five.terrainCount && typeof province.out.five.terrainCount === 'object') {
            let num = 0;
            province.out.five.terrainCount.forEach(([terrainType, number]) => {
            num += terrainScores[`${terrainType}`] * number
            })
            num = Math.floor(num / province.out.five.totalProvinces)
        }
        score += num
    }
    province.expansionFavorability = score;
}