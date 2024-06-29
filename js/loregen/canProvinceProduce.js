//add any new to the checkProduction function

function setProduction(province) {
    province.resourceProduction = {};

    province.resourceProduction.silk = canProvinceProduceSilk(province);
    province.resourceProduction.spices = canProvinceProduceSpices(province);
    province.resourceProduction.woolAndSheep = canProvinceProduceWoolAndSheep(province);
    province.resourceProduction.goats = canProvinceProduceGoats(province);
    province.resourceProduction.linen = canProvinceProduceLinen(province);
    province.resourceProduction.grain = canProvinceProduceGrain(province);
    province.resourceProduction.wine = canProvinceProduceWine(province);
    province.resourceProduction.oliveOil = canProvinceProduceOliveOil(province);
    province.resourceProduction.salt = canProvinceProduceSalt(province);
    province.resourceProduction.honey = canProvinceProduceHoney(province);
    province.resourceProduction.furs = canProvinceProduceFurs(province);
    province.resourceProduction.copper = canProvinceProduceCopper(province);
    province.resourceProduction.tin = canProvinceProduceTin(province);
    province.resourceProduction.iron = canProvinceProduceIron(province);
    province.resourceProduction.gold = canProvinceProduceGold(province);
    province.resourceProduction.silver = canProvinceProduceSilver(province);
    province.resourceProduction.preciousStones = canProvinceProducePreciousStones(province);
    province.resourceProduction.amber = canProvinceProduceAmber(province);
    province.resourceProduction.glass = canProvinceProduceGlass(province);
    province.resourceProduction.pottery = canProvinceProducePottery(province);
    province.resourceProduction.leather = canProvinceProduceLeather(province);
    province.resourceProduction.flax = canProvinceProduceFlax(province);
    province.resourceProduction.hemp = canProvinceProduceHemp(province);
    province.resourceProduction.cotton = canProvinceProduceCotton(province);
    province.resourceProduction.dyes = canProvinceProduceDyes(province);
    province.resourceProduction.perfumes = canProvinceProducePerfumes(province);
    province.resourceProduction.incense = canProvinceProduceIncense(province);
    province.resourceProduction.horses = canProvinceProduceHorses(province);
    province.resourceProduction.cattle = canProvinceProduceCattle(province);
    province.resourceProduction.pigs = canProvinceProducePigs(province);
    province.resourceProduction.poultry = canProvinceProducePoultry(province);
    province.resourceProduction.saltwaterFish = canProvinceProduceSaltwaterFish(province);
    province.resourceProduction.freshwaterFish = canProvinceProduceFreshwaterFish(province);
    province.resourceProduction.nuts = canProvinceProduceNuts(province);
    province.resourceProduction.medicinalPlants = canProvinceProduceMedicinalPlants(province);
    province.resourceProduction.mead = canProvinceProduceMead(province);
    province.resourceProduction.ale = canProvinceProduceAle(province);
    province.resourceProduction.timber = canProvinceProduceTimber(province);
    province.resourceProduction.charcoal = canProvinceProduceCharcoal(province);
    province.resourceProduction.coal = canProvinceProduceCoal(province);
    province.resourceProduction.marble = canProvinceProduceMarble(province);
}

/*

To determine if a province can produce silk, we need to evaluate the properties provided and return one of the four options: "none", "low", "medium", or "high". Generally, silk production requires a warm climate, suitable agricultural conditions, and availability of mulberry trees or similar vegetation. We'll base our function on these conditions:

    Climate: Favorable climates for silk production typically include warm and humid conditions, such as those classified under the Koppen climate classifications like "Af", "Aw", "Am", "As" (tropical climates), and "Cfa", "Cwa" (temperate climates with hot summers).
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for silk production.
    Soil Quality: Higher soil quality will support the growth of mulberry trees.
    Terrain: Plains, farmlands, and similar terrains are preferable for silk production.

*/

function canProvinceProduceSilk(province) {
    const favorableClimates = ["Af", "Aw", "Am", "As", "Cfa", "Cwa"];
    const favorableTerrains = ["plains", "farmlands"];

    let climateScore = 0;
    let agriculturalScore = 0;
    let soilQualityScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine silk production capability
    const totalScore = climateScore + agriculturalScore + soilQualityScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*

To determine if a province can produce spices, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Generally, spice production requires a warm and humid climate, suitable agricultural conditions, and good soil quality. We'll base our function on these conditions:

    Climate: Favorable climates for spice production typically include tropical and subtropical climates, such as "Af", "Aw", "Am", "As" (tropical climates), "Cfa", "Cfb", "Csa", and "Csb" (temperate climates with warm to hot summers).
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for spice production.
    Soil Quality: Higher soil quality supports better growth of spice plants.
    Terrain: Favorable terrains include plains, farmlands, floodplains, and jungle.

*/

function canProvinceProduceSpices(province) {
    const favorableClimates = ["Af", "Aw", "Am", "As", "Cfa", "Cfb", "Csa", "Csb"];
    const favorableTerrains = ["plains", "farmlands", "floodplains", "jungle"];

    let climateScore = 0;
    let agriculturalScore = 0;
    let soilQualityScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine spice production capability
    const totalScore = climateScore + agriculturalScore + soilQualityScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

//Generally, wool production is associated with suitable climate conditions, appropriate terrain, and high livestock suitability.

function canProvinceProduceWoolAndSheep(province) {
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb", "Cfc", "Dfa", "Dfb", "Dfc", "BSk", "BSh"];
    const favorableTerrains = ["plains", "hills", "steppe", "drylands"];

    let climateScore = 0;
    let livestockScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate livestock suitability
    switch (province.livestockSuitability) {
        case "high":
            livestockScore = 2;
            break;
        case "medium":
            livestockScore = 1;
            break;
        case "low":
            livestockScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine wool production capability
    const totalScore = climateScore + livestockScore + terrainScore;

    if (totalScore >= 4) {
        return "high";
    } else if (totalScore >= 3) {
        return "medium";
    } else if (totalScore >= 1) {
        return "low";
    } else {
        return "none";
    }
}

/*

To determine if a province can produce goats, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Goat production relies on suitable climate, terrain, livestock suitability, and agricultural productivity. Goats are more adaptable to harsher environments than sheep, often thriving in drier and more rugged terrains.

    Climate: Favorable climates for goat production include arid, semi-arid, and temperate climates such as "BWh", "BWk", "BSh", "BSk", "Cfa", "Cfb".
    Terrain: Favorable terrains include hills, drylands, steppe, and plains.
    Livestock Suitability: Indicates the province's suitability for raising livestock.
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for raising goats.

*/

function canProvinceProduceGoats(province) {
    const favorableClimates = ["BWh", "BWk", "BSh", "BSk", "Cfa", "Cfb"];
    const favorableTerrains = ["hills", "drylands", "steppe", "plains"];

    let climateScore = 0;
    let livestockScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate livestock suitability
    switch (province.livestockSuitability) {
        case "high":
            livestockScore = 3;
            break;
        case "medium":
            livestockScore = 2;
            break;
        case "low":
            livestockScore = 1;
            break;
        default:
            livestockScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine goat production capability
    const totalScore = climateScore + livestockScore + agriculturalScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}


/*
Linen production primarily relies on the cultivation of flax, which grows best in temperate climates with adequate rainfall and good soil quality.
*/

function canProvinceProduceLinen(province) {
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb"];
    const favorableTerrains = ["plains", "farmlands", "floodplains"];

    let climateScore = 0;
    let agriculturalScore = 0;
    let soilQualityScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine linen production capability
    const totalScore = climateScore + agriculturalScore + soilQualityScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*

To determine if a province can produce grain, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Generally, grain production relies on favorable climate, good agricultural productivity, high soil quality, and appropriate terrain.

    Climate: Favorable climates for grain production include temperate climates such as "Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb", "BSk", "BSh".
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for grain cultivation.
    Soil Quality: Higher soil quality supports better growth of grain crops.
    Terrain: Favorable terrains include plains, farmlands, floodplains, and steppe.

*/

function canProvinceProduceGrain(province) {
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb", "BSk", "BSh"];
    const favorableTerrains = ["plains", "farmlands", "floodplains", "steppe"];

    let climateScore = 0;
    let agriculturalScore = 0;
    let soilQualityScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine grain production capability
    const totalScore = climateScore + agriculturalScore + soilQualityScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*

To determine if a province can produce wine, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Wine production typically relies on a suitable climate, good agricultural productivity, high soil quality, and appropriate terrain.

    Climate: Favorable climates for wine production include temperate and Mediterranean climates such as "Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb".
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for vineyard cultivation.
    Soil Quality: Higher soil quality supports better growth of grapevines.
    Terrain: Favorable terrains include hills, farmlands, and floodplains.

*/


function canProvinceProduceWine(province) {
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb"];
    const favorableTerrains = ["hills", "farmlands", "floodplains"];

    let climateScore = 0;
    let agriculturalScore = 0;
    let soilQualityScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine wine production capability
    const totalScore = climateScore + agriculturalScore + soilQualityScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce olive oil, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Olive oil production typically relies on a suitable climate, good agricultural productivity, high soil quality, and appropriate terrain.

    Climate: Favorable climates for olive oil production include Mediterranean and temperate climates such as "Csa", "Csb", "Cfa", "Cfb".
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for olive cultivation.
    Soil Quality: Higher soil quality supports better growth of olive trees.
    Terrain: Favorable terrains include hills, farmlands, and plains.
*/

function canProvinceProduceOliveOil(province) {
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb"];
    const favorableTerrains = ["hills", "farmlands", "plains"];

    let climateScore = 0;
    let agriculturalScore = 0;
    let soilQualityScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine olive oil production capability
    const totalScore = climateScore + agriculturalScore + soilQualityScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}


/*

To determine if a province can produce salt, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Salt production is generally associated with proximity to water (for sea salt), dry climates, and specific terrain types that facilitate evaporation.

    Climate: Favorable climates for salt production include arid and semi-arid climates such as "BWh", "BWk", "BSh", "BSk".
    Adjacent to Water: Being adjacent to water is crucial for sea salt production.
    Terrain: Favorable terrains include deserts, drylands, and salt flats (which we can approximate with drylands and deserts in the given data)
*/

function canProvinceProduceSalt(province) {
    const favorableClimates = ["BWh", "BWk", "BSh", "BSk"];
    const favorableTerrains = ["desert", "drylands"];

    let climateScore = 0;
    let adjacentToWaterScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate if province is adjacent to water
    if (province.adjacentToWater.length > 0) {
        adjacentToWaterScore = 1;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine salt production capability
    const totalScore = climateScore + adjacentToWaterScore + terrainScore;

    if (totalScore >= 3) {
        return "high";
    } else if (totalScore == 2) {
        return "medium";
    } else if (totalScore == 1) {
        return "low";
    } else {
        return "none";
    }
}

/*

To determine if a province can produce honey, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Honey production is generally associated with favorable climate, agricultural productivity, vegetation (forest or similar terrain), and soil quality.

    Climate: Favorable climates for honey production include temperate and tropical climates such as "Af", "Aw", "Am", "As", "Cfa", "Cfb", "Dfa", "Dfb".
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for beekeeping.
    Soil Quality: Higher soil quality supports better vegetation growth.
    Terrain: Favorable terrains include forests, jungles, farmlands, and plains.

*/

function canProvinceProduceHoney(province) {
    const favorableClimates = ["Af", "Aw", "Am", "As", "Cfa", "Cfb", "Dfa", "Dfb"];
    const favorableTerrains = ["forest", "jungle", "farmlands", "plains"];

    let climateScore = 0;
    let agriculturalScore = 0;
    let soilQualityScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine honey production capability
    const totalScore = climateScore + agriculturalScore + soilQualityScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce furs, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Fur production is generally associated with colder climates, suitable terrain for fur-bearing animals, and good livestock suitability.

    Climate: Favorable climates for fur production typically include cold and temperate climates such as "Dfa", "Dfb", "Dfc", "Dfd", "ET", "EF", and some forested or taiga regions like "Cfb".
    Livestock Suitability: Higher livestock suitability indicates better conditions for fur-bearing animals.
    Terrain: Favorable terrains include forests, taiga, and possibly hills and mountains.
*/

function canProvinceProduceFurs(province) {
    const favorableClimates = ["Dfa", "Dfb", "Dfc", "Dfd", "ET", "EF", "Cfb"];
    const favorableTerrains = ["forest", "taiga", "hills", "mountains"];

    let climateScore = 0;
    let livestockScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate livestock suitability
    switch (province.livestockSuitability) {
        case "high":
            livestockScore = 2;
            break;
        case "medium":
            livestockScore = 1;
            break;
        case "low":
            livestockScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine fur production capability
    const totalScore = climateScore + livestockScore + terrainScore;

    if (totalScore >= 4) {
        return "high";
    } else if (totalScore == 3) {
        return "medium";
    } else if (totalScore == 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
Although the overall factors such as mining suitability, terrain, and presence of mountains are crucial for all three, some nuances can be introduced based on historical and geographical contexts. Here are some distinctions we can make:

    Copper Production:
        Copper deposits are often found in areas with volcanic activity.
        Presence of specific terrain types such as desert mountains can be an indicator.
        The presence of certain rivers (which might have historically carried copper deposits) could be a factor.

    Tin Production:
        Tin is often found in regions with granite and areas associated with past volcanic activity.
        Tin deposits are often located in mountain ranges but can also be found in river valleys where tin ore (cassiterite) has been washed down.
        Soil quality can be slightly less critical since tin mining often involves alluvial deposits.

    Iron Production:
        Iron deposits are often found in sedimentary rock formations.
        Presence of large mountain ranges is a strong indicator.
        The overall geological stability (e.g., fewer earthquakes) might be more conducive for long-term iron mining operations.
    */

/*

To determine if a province can produce iron, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Iron production is typically associated with suitable mining suitability, terrain conducive to mining, and the presence of mountains or hills.

    Mining Suitability: Higher mining suitability indicates better conditions for iron mining.
    Terrain: Favorable terrains include mountains, hills, and possibly drylands.
    Presence of Mountains: The presence of mountain ranges is an important factor for iron production.

*/

function canProvinceProduceCopper(province) {
    const favorableTerrains = ["mountains", "hills", "desert_mountains"];
    const favorableClimates = ["BWh", "BWk", "BSh", "BSk"];

    let miningSuitabilityScore = 0;
    let terrainScore = 0;
    let climateScore = 0;

    // Evaluate mining suitability
    switch (province.miningSuitability) {
        case "high":
            miningSuitabilityScore = 3;
            break;
        case "medium":
            miningSuitabilityScore = 2;
            break;
        case "low":
            miningSuitabilityScore = 1;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Sum the scores to determine copper production capability
    const totalScore = miningSuitabilityScore + terrainScore + climateScore;

    if (totalScore >= 5) {
        return "high";
    } else if (totalScore >= 3) {
        return "medium";
    } else if (totalScore >= 1) {
        return "low";
    } else {
        return "none";
    }
}

function canProvinceProduceTin(province) {
    const favorableTerrains = ["mountains", "hills"];
    const favorableRivers = province.rivers.length > 0;

    let miningSuitabilityScore = 0;
    let terrainScore = 0;
    let riverScore = 0;

    // Evaluate mining suitability
    switch (province.miningSuitability) {
        case "high":
            miningSuitabilityScore = 3;
            break;
        case "medium":
            miningSuitabilityScore = 2;
            break;
        case "low":
            miningSuitabilityScore = 1;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate presence of rivers
    if (favorableRivers) {
        riverScore = 1;
    }

    // Sum the scores to determine tin production capability
    const totalScore = miningSuitabilityScore + terrainScore + riverScore;

    if (totalScore >= 5) {
        return "high";
    } else if (totalScore >= 3) {
        return "medium";
    } else if (totalScore >= 1) {
        return "low";
    } else {
        return "none";
    }
}

function canProvinceProduceIron(province) {
    const favorableTerrains = ["mountains", "hills", "drylands"];
    const favorableMountainPresence = province.mountains.length > 0;

    let miningSuitabilityScore = 0;
    let terrainScore = 0;
    let mountainScore = 0;

    // Evaluate mining suitability
    switch (province.miningSuitability) {
        case "high":
            miningSuitabilityScore = 3;
            break;
        case "medium":
            miningSuitabilityScore = 2;
            break;
        case "low":
            miningSuitabilityScore = 1;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate presence of mountains
    if (favorableMountainPresence) {
        mountainScore = 1;
    }

    // Sum the scores to determine iron production capability
    const totalScore = miningSuitabilityScore + terrainScore + mountainScore;

    if (totalScore >= 5) {
        return "high";
    } else if (totalScore >= 3) {
        return "medium";
    } else if (totalScore >= 1) {
        return "low";
    } else {
        return "none";
    }
}

/*
o determine if a province can produce gold, there are specific factors that are often considered for gold mining. Gold deposits are typically associated with certain geological formations, the presence of mountains, specific types of terrain, and favorable mining suitability.

    Mining Suitability: Higher mining suitability indicates better conditions for gold mining.
    Terrain: Favorable terrains include mountains, hills, and possibly forests and jungles, as gold can be found in riverbeds and alluvial deposits in these terrains.
    Presence of Rivers: Gold is often found in riverbeds, so the presence of rivers is an important factor.
    Presence of Mountains: The presence of mountain ranges is a strong indicator for gold deposits
*/

function canProvinceProduceGold(province) {
    const favorableTerrains = ["mountains", "hills", "forest", "jungle"];
    const favorableRivers = province.rivers.length > 0;
    const favorableMountainPresence = province.mountains.length > 0;

    let miningSuitabilityScore = 0;
    let terrainScore = 0;
    let riverScore = 0;
    let mountainScore = 0;

    // Evaluate mining suitability
    switch (province.miningSuitability) {
        case "high":
            miningSuitabilityScore = 3;
            break;
        case "medium":
            miningSuitabilityScore = 2;
            break;
        case "low":
            miningSuitabilityScore = 1;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate presence of rivers
    if (favorableRivers) {
        riverScore = 1;
    }

    // Evaluate presence of mountains
    if (favorableMountainPresence) {
        mountainScore = 1;
    }

    // Sum the scores to determine gold production capability
    const totalScore = miningSuitabilityScore + terrainScore + riverScore + mountainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}


/*
To determine if a province can produce silver, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Silver production typically relies on suitable mining suitability, terrain conducive to mining, and the presence of mountains or hills. Additionally, historical silver mining regions are often associated with volcanic activity and the presence of certain geological formations.

    Mining Suitability: Higher mining suitability indicates better conditions for silver mining.
    Terrain: Favorable terrains include mountains, hills, and possibly volcanic terrains like desert mountains.
    Presence of Mountains: The presence of mountain ranges is a strong indicator for silver deposits.
    Presence of Rivers: Silver can be found in riverbeds due to alluvial deposits.
*/

function canProvinceProduceSilver(province) {
    const favorableTerrains = ["mountains", "hills", "desert_mountains"];
    const favorableMountainPresence = province.mountains.length > 0;
    const favorableRivers = province.rivers.length > 0;

    let miningSuitabilityScore = 0;
    let terrainScore = 0;
    let mountainScore = 0;
    let riverScore = 0;

    // Evaluate mining suitability
    switch (province.miningSuitability) {
        case "high":
            miningSuitabilityScore = 3;
            break;
        case "medium":
            miningSuitabilityScore = 2;
            break;
        case "low":
            miningSuitabilityScore = 1;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate presence of mountains
    if (favorableMountainPresence) {
        mountainScore = 1;
    }

    // Evaluate presence of rivers
    if (favorableRivers) {
        riverScore = 1;
    }

    // Sum the scores to determine silver production capability
    const totalScore = miningSuitabilityScore + terrainScore + mountainScore + riverScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce precious stones, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Precious stone production is typically associated with suitable mining suitability, certain terrains, and geological features such as the presence of mountains and rivers.

    Mining Suitability: Higher mining suitability indicates better conditions for precious stone mining.
    Terrain: Favorable terrains include mountains, hills, and possibly forests and jungles.
    Presence of Rivers: Precious stones can be found in riverbeds due to alluvial deposits.
    Presence of Mountains: The presence of mountain ranges is a strong indicator for precious stone deposits
*/

function canProvinceProducePreciousStones(province) {
    const favorableTerrains = ["mountains", "hills", "forest", "jungle"];
    const favorableMountainPresence = province.mountains.length > 0;
    const favorableRivers = province.rivers.length > 0;

    let miningSuitabilityScore = 0;
    let terrainScore = 0;
    let mountainScore = 0;
    let riverScore = 0;

    // Evaluate mining suitability
    switch (province.miningSuitability) {
        case "high":
            miningSuitabilityScore = 3;
            break;
        case "medium":
            miningSuitabilityScore = 2;
            break;
        case "low":
            miningSuitabilityScore = 1;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate presence of mountains
    if (favorableMountainPresence) {
        mountainScore = 1;
    }

    // Evaluate presence of rivers
    if (favorableRivers) {
        riverScore = 1;
    }

    // Sum the scores to determine precious stone production capability
    const totalScore = miningSuitabilityScore + terrainScore + mountainScore + riverScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce amber, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Amber is fossilized tree resin, so its production is typically associated with forested areas, particularly those with coniferous trees, and certain geological conditions that allow the resin to fossilize.

    Terrain: Favorable terrains for amber production include forests and possibly taiga.
    Climate: Favorable climates include temperate and cool climates, such as "Cfa", "Cfb", "Dfa", "Dfb", and "Dfc".
    Mining Suitability: Higher mining suitability indicates better conditions for extracting amber deposits.
*/

function canProvinceProduceAmber(province) {
    const favorableTerrains = ["forest", "taiga"];
    const favorableClimates = ["Cfa", "Cfb", "Dfa", "Dfb", "Dfc"];

    let terrainScore = 0;
    let climateScore = 0;
    let miningSuitabilityScore = 0;

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate mining suitability
    switch (province.miningSuitability) {
        case "high":
            miningSuitabilityScore = 3;
            break;
        case "medium":
            miningSuitabilityScore = 2;
            break;
        case "low":
            miningSuitabilityScore = 1;
            break;
    }

    // Sum the scores to determine amber production capability
    const totalScore = terrainScore + climateScore + miningSuitabilityScore;

    if (totalScore >= 5) {
        return "high";
    } else if (totalScore >= 3) {
        return "medium";
    } else if (totalScore >= 1) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce glass, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Glass production typically relies on the availability of certain raw materials like sand (often found in certain terrains), high soil quality, and the presence of necessary building materials (e.g., lime, stone). Additionally, proximity to water can be advantageous for glass production.

    Terrain: Favorable terrains for glass production include plains, drylands, and possibly floodplains where sand can be abundant.
    Soil Quality: Higher soil quality supports better raw material extraction.
    Building Materials: Presence of lime, stone, and other materials necessary for glass production.
    Proximity to Water: Being adjacent to water can be beneficial for transportation and production processes.
*/

function canProvinceProduceGlass(province) {
    const favorableTerrains = ["plains", "drylands", "floodplains"];
    const requiredBuildingMaterials = ["limeMortar", "stone", "sand"];

    let terrainScore = 0;
    let soilQualityScore = 0;
    let buildingMaterialsScore = 0;
    let waterScore = 0;

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate building materials
    requiredBuildingMaterials.forEach(material => {
        if (province.buildingMaterials[material]) {
            buildingMaterialsScore += 1;
        }
    });

    // Evaluate proximity to water
    if (province.adjacentToWater.length > 0) {
        waterScore = 1;
    }

    // Sum the scores to determine glass production capability
    const totalScore = terrainScore + soilQualityScore + buildingMaterialsScore + waterScore;

    if (totalScore >= 5) {
        return "high";
    } else if (totalScore >= 3) {
        return "medium";
    } else if (totalScore >= 1) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce pottery, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Pottery production typically relies on the availability of suitable raw materials like clay, a stable climate, and appropriate terrain.

    Building Materials: Presence of clay is crucial for pottery production.
    Terrain: Favorable terrains for pottery production include floodplains, farmlands, and plains where clay deposits are often found.
    Soil Quality: Higher soil quality supports better raw material extraction.
    Climate: Moderate climates can be favorable for pottery production.
*/

function canProvinceProducePottery(province) {
    const favorableTerrains = ["floodplains", "farmlands", "plains"];
    const requiredBuildingMaterials = ["clay"];

    let terrainScore = 0;
    let soilQualityScore = 0;
    let buildingMaterialsScore = 0;
    let climateScore = 0;

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate building materials
    requiredBuildingMaterials.forEach(material => {
        if (province.buildingMaterials[material]) {
            buildingMaterialsScore = 2;
        }
    });

    // Evaluate climate
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb"];
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Sum the scores to determine pottery production capability
    const totalScore = terrainScore + soilQualityScore + buildingMaterialsScore + climateScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce leather, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Leather production typically relies on livestock suitability, appropriate terrain, and the presence of necessary building materials (e.g., animal hides).

    Livestock Suitability: Higher livestock suitability indicates better conditions for raising animals whose hides can be used for leather production.
    Terrain: Favorable terrains for raising livestock include plains, farmlands, and hills.
    Building Materials: Presence of animal hides is crucial for leather production.
*/

function canProvinceProduceLeather(province) {
    const favorableTerrains = ["plains", "farmlands", "hills"];
    const requiredBuildingMaterials = ["animalHides"];

    let livestockSuitabilityScore = 0;
    let terrainScore = 0;
    let buildingMaterialsScore = 0;

    // Evaluate livestock suitability
    switch (province.livestockSuitability) {
        case "high":
            livestockSuitabilityScore = 3;
            break;
        case "medium":
            livestockSuitabilityScore = 2;
            break;
        case "low":
            livestockSuitabilityScore = 1;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate building materials
    requiredBuildingMaterials.forEach(material => {
        if (province.buildingMaterials[material]) {
            buildingMaterialsScore = 2;
        }
    });

    // Sum the scores to determine leather production capability
    const totalScore = livestockSuitabilityScore + terrainScore + buildingMaterialsScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

// Example usage
const provinceExample = {
    livestockSuitability: "high",
    terrain: "plains",
    buildingMaterials: {
        animalHides: true,
        // other materials...
    },
    // other properties...
};

console.log(canProvinceProduceLeather(provinceExample));

//add woolen cloth?


/*
To determine if a province can produce flax, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Flax production typically relies on suitable climate, soil quality, agricultural productivity, and appropriate terrain.

    Climate: Favorable climates for flax production include temperate and subtropical climates such as "Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb".
    Soil Quality: Higher soil quality supports better growth of flax.
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for flax cultivation.
    Terrain: Favorable terrains include plains, farmlands, and floodplains.
*/

function canProvinceProduceFlax(province) {
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb"];
    const favorableTerrains = ["plains", "farmlands", "floodplains"];

    let climateScore = 0;
    let soilQualityScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine flax production capability
    const totalScore = climateScore + soilQualityScore + agriculturalScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}


/*

To determine if a province can produce hemp, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Hemp production typically relies on suitable climate, soil quality, agricultural productivity, and appropriate terrain.

    Climate: Favorable climates for hemp production include temperate and subtropical climates such as "Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb".
    Soil Quality: Higher soil quality supports better growth of hemp.
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for hemp cultivation.
    Terrain: Favorable terrains include plains, farmlands, and floodplains.

*/


function canProvinceProduceHemp(province) {
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb"];
    const favorableTerrains = ["plains", "farmlands", "floodplains"];

    let climateScore = 0;
    let soilQualityScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine hemp production capability
    const totalScore = climateScore + soilQualityScore + agriculturalScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce cotton, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Cotton production typically relies on suitable climate, soil quality, agricultural productivity, and appropriate terrain.

    Climate: Favorable climates for cotton production include subtropical and tropical climates such as "Csa", "Csb", "Cfa", "Cfb", "Aw", "Am", "As".
    Soil Quality: Higher soil quality supports better growth of cotton.
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for cotton cultivation.
    Terrain: Favorable terrains include plains, farmlands, and floodplains.

*/

function canProvinceProduceCotton(province) {
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb", "Aw", "Am", "As"];
    const favorableTerrains = ["plains", "farmlands", "floodplains"];

    let climateScore = 0;
    let soilQualityScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine cotton production capability
    const totalScore = climateScore + soilQualityScore + agriculturalScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}


/*
To determine if a province can produce dyes, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Dye production typically relies on suitable climate, soil quality, agricultural productivity, and appropriate terrain. Additionally, access to water sources can be beneficial for dye production processes.

    Climate: Favorable climates for dye production include temperate, subtropical, and tropical climates such as "Csa", "Csb", "Cfa", "Cfb", "Af", "Am", "Aw".
    Soil Quality: Higher soil quality supports better growth of plants used for dyes.
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for dye plant cultivation.
    Terrain: Favorable terrains include plains, farmlands, floodplains, and forests.
    Proximity to Water: Access to rivers or being adjacent to water can enhance dye production.
*/

function canProvinceProduceDyes(province) {
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb", "Af", "Am", "Aw"];
    const favorableTerrains = ["plains", "farmlands", "floodplains", "forest"];

    let climateScore = 0;
    let soilQualityScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;
    let waterScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate proximity to water
    if (province.adjacentToWater.length > 0 || province.rivers.length > 0) {
        waterScore = 1;
    }

    // Sum the scores to determine dye production capability
    const totalScore = climateScore + soilQualityScore + agriculturalScore + terrainScore + waterScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce perfumes, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Perfume production typically relies on the availability of aromatic plants, suitable climate, soil quality, and agricultural productivity. Additionally, access to water sources can be beneficial for cultivation and production processes.

    Climate: Favorable climates for aromatic plant cultivation include temperate, subtropical, and tropical climates such as "Csa", "Csb", "Cfa", "Cfb", "Af", "Am", "Aw".
    Soil Quality: Higher soil quality supports better growth of aromatic plants.
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for cultivating aromatic plants.
    Terrain: Favorable terrains include plains, farmlands, floodplains, and forests.
    Proximity to Water: Access to rivers or being adjacent to water can enhance cultivation and production processes.
*/

function canProvinceProducePerfumes(province) {
    const favorableClimates = ["Csa", "Csb", "Cfa", "Cfb", "Af", "Am", "Aw"];
    const favorableTerrains = ["plains", "farmlands", "floodplains", "forest"];

    let climateScore = 0;
    let soilQualityScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;
    let waterScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate proximity to water
    if (province.adjacentToWater.length > 0 || province.rivers.length > 0) {
        waterScore = 1;
    }

    // Sum the scores to determine perfume production capability
    const totalScore = climateScore + soilQualityScore + agriculturalScore + terrainScore + waterScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
he key factors for incense production involve the use of aromatic plant materials and resins, combined with binders for direct-burning forms. Suitable climates for the growth of these materials include tropical and subtropical regions. Additionally, the presence of certain terrains such as forests, hills, and plains can be beneficial.
*/

function canProvinceProduceIncense(province) {
    const favorableClimates = ["Af", "Aw", "Am", "As", "Csa", "Csb"];
    const favorableTerrains = ["forest", "hills", "floodplains", "plains"];

    let climateScore = 0;
    let soilQualityScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;
    let waterScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Evaluate proximity to water
    if (province.adjacentToWater.length > 0 || province.rivers.length > 0) {
        waterScore = 1;
    }

    // Sum the scores to determine incense production capability
    const totalScore = climateScore + soilQualityScore + agriculturalScore + terrainScore + waterScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}



function canProvinceProduceHorses(province) {
    const favorableClimates = ["Cfa", "Cfb", "Dfa", "Dfb", "BSk"];
    const favorableTerrains = ["plains", "steppe", "hills", "farmlands"];

    let climateScore = 0;
    let livestockScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate livestock suitability
    switch (province.livestockSuitability) {
        case "high":
            livestockScore = 3;
            break;
        case "medium":
            livestockScore = 2;
            break;
        case "low":
            livestockScore = 1;
            break;
        default:
            livestockScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine horse production capability
    const totalScore = climateScore + livestockScore + agriculturalScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce cattle, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Cattle production typically relies on suitable climate, terrain, livestock suitability, and agricultural productivity.

    Climate: Favorable climates for cattle production include temperate and continental climates such as "Cfa", "Cfb", "Dfa", "Dfb", "BSk".
    Terrain: Favorable terrains include plains, steppe, hills, and farmlands.
    Livestock Suitability: Indicates the province's suitability for raising livestock.
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for raising cattle.
*/

function canProvinceProduceCattle(province) {
    const favorableClimates = ["Cfa", "Cfb", "Dfa", "Dfb", "BSk"];
    const favorableTerrains = ["plains", "steppe", "hills", "farmlands"];

    let climateScore = 0;
    let livestockScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate livestock suitability
    switch (province.livestockSuitability) {
        case "high":
            livestockScore = 3;
            break;
        case "medium":
            livestockScore = 2;
            break;
        case "low":
            livestockScore = 1;
            break;
        default:
            livestockScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine cattle production capability
    const totalScore = climateScore + livestockScore + agriculturalScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

function canProvinceProducePigs(province) {
    const favorableClimates = ["Cfa", "Cfb", "Dfa", "Dfb"];
    const favorableTerrains = ["plains", "farmlands", "floodplains"];

    let climateScore = 0;
    let livestockScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate livestock suitability
    switch (province.livestockSuitability) {
        case "high":
            livestockScore = 3;
            break;
        case "medium":
            livestockScore = 2;
            break;
        case "low":
            livestockScore = 1;
            break;
        default:
            livestockScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine pig production capability
    const totalScore = climateScore + livestockScore + agriculturalScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce poultry, we need to evaluate the provided properties and return one of the four options: "none", "low", "medium", or "high". Poultry production typically relies on suitable climate, terrain, livestock suitability, and agricultural productivity.

    Climate: Favorable climates for poultry production include temperate and subtropical climates such as "Cfa", "Cfb", "Dfa", "Dfb".
    Terrain: Favorable terrains include plains, farmlands, and floodplains.
    Livestock Suitability: Indicates the province's suitability for raising livestock.
    Agricultural Productivity: Higher agricultural productivity indicates better conditions for raising poultry.
*/

function canProvinceProducePoultry(province) {
    const favorableClimates = ["Cfa", "Cfb", "Dfa", "Dfb"];
    const favorableTerrains = ["plains", "farmlands", "floodplains"];

    let climateScore = 0;
    let livestockScore = 0;
    let agriculturalScore = 0;
    let terrainScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 1;
    }

    // Evaluate livestock suitability
    switch (province.livestockSuitability) {
        case "high":
            livestockScore = 3;
            break;
        case "medium":
            livestockScore = 2;
            break;
        case "low":
            livestockScore = 1;
            break;
        default:
            livestockScore = 0;
            break;
    }

    // Evaluate agricultural productivity
    switch (province.agriculturalProductivity) {
        case "excellent":
            agriculturalScore = 3;
            break;
        case "good":
            agriculturalScore = 2;
            break;
        case "average":
            agriculturalScore = 1;
            break;
        case "poor":
        case "very poor":
            agriculturalScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 1;
    }

    // Sum the scores to determine poultry production capability
    const totalScore = climateScore + livestockScore + agriculturalScore + terrainScore;

    if (totalScore >= 6) {
        return "high";
    } else if (totalScore >= 4) {
        return "medium";
    } else if (totalScore >= 2) {
        return "low";
    } else {
        return "none";
    }
}

function canProvinceProduceSaltwaterFish(province) {
    // add a lake check on neighbors to make sure it is salt water
    if (province.adjacentToWater.length > 0) {
        return "medium";
    } 
    return "none"
}

function canProvinceProduceFreshwaterFish(province) {
    //add lake check
    if (province.rivers.length > 0) {
        return "medium";
    }
    return "none";
}

/*

To determine if a province can produce nuts, we should consider properties such as terrain, climate, agricultural productivity, and soil quality. Nut trees typically thrive in temperate climates with good soil quality and moderate agricultural productivity.

*/

function canProvinceProduceNuts(province) {
    // Initial score based on agricultural productivity and soil quality
    let score = 0;
    
    // Check agricultural productivity
    switch (province.agriculturalProductivity) {
        case "very poor":
            score += 0;
            break;
        case "poor":
            score += 1;
            break;
        case "average":
            score += 2;
            break;
        case "good":
            score += 3;
            break;
        case "excellent":
            score += 4;
            break;
    }
    
    // Check soil quality
    switch (province.soilQuality) {
        case "low":
            score += 0;
            break;
        case "medium":
            score += 2;
            break;
        case "high":
            score += 4;
            break;
    }

    // Check terrain
    const suitableTerrains = ["forest", "farmlands", "hills", "plains"];
    if (suitableTerrains.includes(province.terrain)) {
        score += 2;
    }

    // Check climate
    const suitableClimates = ["Cfa", "Cfb", "Csa", "Csb"];
    if (suitableClimates.includes(province.climate)) {
        score += 2;
    }

    // Determine the production capability based on the score
    if (score >= 8) {
        return "high";
    } else if (score >= 5) {
        return "medium";
    } else if (score >= 2) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce medicinal plants, we need to consider factors such as terrain, climate, soil quality, and agricultural productivity. Medicinal plants generally thrive in regions with rich biodiversity, good soil quality, and favorable climates.
*/

function canProvinceProduceMedicinalPlants(province) {
    // Initial score based on agricultural productivity, soil quality, and climate
    let score = 0;
    
    // Check agricultural productivity
    switch (province.agriculturalProductivity) {
        case "very poor":
            score += 0;
            break;
        case "poor":
            score += 1;
            break;
        case "average":
            score += 2;
            break;
        case "good":
            score += 3;
            break;
        case "excellent":
            score += 4;
            break;
    }
    
    // Check soil quality
    switch (province.soilQuality) {
        case "low":
            score += 0;
            break;
        case "medium":
            score += 2;
            break;
        case "high":
            score += 4;
            break;
    }

    // Check terrain
    const suitableTerrains = ["forest", "jungle", "wetland", "farmlands"];
    if (suitableTerrains.includes(province.terrain)) {
        score += 2;
    }

    // Check climate
    const suitableClimates = ["Af", "Aw", "Am", "Cfa", "Cfb"];
    if (suitableClimates.includes(province.climate)) {
        score += 2;
    }

    // Determine the production capability based on the score
    if (score >= 9) {
        return "high";
    } else if (score >= 6) {
        return "medium";
    } else if (score >= 3) {
        return "low";
    } else {
        return "none";
    }
}


/*
To determine if a province can produce mead, we need to focus on factors such as terrain, agricultural productivity, climate, and proximity to water, as mead production is closely tied to the availability of flowers for bees to produce honey.
*/

function canProvinceProduceMead(province) {
    let score = 0;

    // Check agricultural productivity
    switch (province.agriculturalProductivity) {
        case "very poor":
            score += 0;
            break;
        case "poor":
            score += 1;
            break;
        case "average":
            score += 2;
            break;
        case "good":
            score += 3;
            break;
        case "excellent":
            score += 4;
            break;
    }

    // Check soil quality
    switch (province.soilQuality) {
        case "low":
            score += 0;
            break;
        case "medium":
            score += 2;
            break;
        case "high":
            score += 4;
            break;
    }

    // Check terrain - suitable terrains for honey production
    const suitableTerrains = ["forest", "jungle", "wetland", "farmlands"];
    if (suitableTerrains.includes(province.terrain)) {
        score += 2;
    }

    // Check climate - suitable climates for beekeeping
    const suitableClimates = ["Af", "Aw", "Am", "Cfa", "Cfb"];
    if (suitableClimates.includes(province.climate)) {
        score += 2;
    }

    // Check proximity to water
    if (province.adjacentToWater.length > 0) {
        score += 1;
    }

    // Determine the production capability based on the score
    if (score >= 9) {
        return "high";
    } else if (score >= 6) {
        return "medium";
    } else if (score >= 3) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce ale, we need to consider several key factors related to barley cultivation, which is the primary ingredient for ale production. Barley grows well in temperate climates with moderate rainfall and good soil quality.
*/

function canProvinceProduceAle(province) {
    // Define suitable climate types for barley
    const suitableClimates = ["Cfa", "Cfb", "Dfa", "Dfb"];
  
    // Check for suitable climate
    if (!suitableClimates.includes(province.climate)) {
      return "none";
    }
  
    // Evaluate terrain suitability
    const suitableTerrains = ["farmlands", "plains", "floodplains"];
    if (!suitableTerrains.includes(province.terrain)) {
      return "none";
    }
  
    // Consider agricultural productivity and soil quality
    const productivity = province.agriculturalProductivity;
    const soilQuality = province.soilQuality;
  
    if (productivity === "very poor" || soilQuality === "low") {
      return "none";
    }
  
    // Determine the production level based on productivity and soil quality
    if (productivity === "excellent" && soilQuality === "high") {
      return "high";
    } else if (productivity === "good" && soilQuality !== "low") {
      return "medium";
    } else {
      return "low";
    }
  }



  function canProvinceProduceTimber(province) {
    // Define suitable terrain types for timber production
    const suitableTerrains = ["forest", "taiga"];
  
    // Check if the terrain is suitable
    if (!suitableTerrains.includes(province.terrain)) {
      return "none";
    }
  
    // Define suitable climate types for timber production
    const suitableClimates = ["Cfb", "Dfb", "Cfc", "Dfc"];
  
    // Check if the climate is suitable
    if (!suitableClimates.includes(province.climate)) {
      return "none";
    }
  
    // Consider the severity of winter
    if (province.severity > 0.7) {
      return "low";
    }
  
    // Evaluate productivity and soil quality
    const productivity = province.agriculturalProductivity;
    const soilQuality = province.soilQuality;
  
    if (productivity === "very poor" || soilQuality === "low") {
      return "none";
    }
  
    // Determine the production level based on productivity and soil quality
    if (productivity === "excellent" && soilQuality === "high") {
      return "high";
    } else if (productivity === "good" && soilQuality !== "low") {
      return "medium";
    } else {
      return "low";
    }
  }

  function canProvinceProduceCharcoal(province) {
    // Define suitable terrain types for charcoal production
    const suitableTerrains = ["forest", "taiga"];
  
    // Check if the terrain is suitable
    if (!suitableTerrains.includes(province.terrain)) {
      return "none";
    }
  
    // Check if wood is available as a building material
    if (!province.buildingMaterials.wood) {
      return "none";
    }
  
    // Define suitable climate types for charcoal production
    const suitableClimates = ["Cfb", "Dfb", "Cfc", "Dfc"];
  
    // Check if the climate is suitable
    if (!suitableClimates.includes(province.climate)) {
      return "none";
    }
  
    // Evaluate productivity and soil quality
    const productivity = province.agriculturalProductivity;
    const soilQuality = province.soilQuality;
  
    if (productivity === "very poor" || soilQuality === "low") {
      return "none";
    }
  
    // Determine the production level based on productivity and soil quality
    if (productivity === "excellent" && soilQuality === "high") {
      return "high";
    } else if (productivity === "good" && soilQuality !== "low") {
      return "medium";
    } else {
      return "low";
    }
  }
  
  /*
To determine if a province can produce coal, we need to evaluate several factors that influence coal production. Here's a detailed explanation for why each factor is considered, followed by the function:

    Climate: Coal deposits are often found in regions with cold to temperate climates, which are suitable for the formation and preservation of coal. Favorable climates include those classified as "Dfb", "Dfc", "Cfb", and "Cfc" in the Köppen climate classification system.

    Terrain: Coal mining is commonly associated with mountainous and hilly regions. Forested areas also indicate the presence of ancient vegetation, which can form coal over geological timescales.

    Mining Suitability: This property directly indicates the province's potential for mining activities. Higher suitability scores mean the province has better conditions for mining operations.

    Soil Quality: Good soil quality can support infrastructure for mining activities, though it is not as critical as other factors. High soil quality contributes positively, but lower quality does not significantly deter coal production.

    Elevation: Elevation can influence the ease of access to coal seams. Provinces with elevations above sea level but not too high are ideal, making coal seams more accessible.

    Proximity to Rivers: Rivers provide essential transportation routes for coal, especially before modern infrastructure. Provinces with access to rivers are better suited for coal production due to easier transportation of mined coal.
  */

function canProvinceProduceCoal(province) {
    // Favorable climates for coal production
    const favorableClimates = ["Dfb", "Dfc", "Cfb", "Cfc"];
    
    // Favorable terrains for coal production
    const favorableTerrains = ["mountains", "hills", "forest"];

    let climateScore = 0;
    let miningSuitabilityScore = 0;
    let soilQualityScore = 0;
    let terrainScore = 0;
    let elevationScore = 0;
    let riverScore = 0;

    // Evaluate climate
    if (favorableClimates.includes(province.climate)) {
        climateScore = 2;
    }

    // Evaluate mining suitability
    switch (province.miningSuitability) {
        case "high":
            miningSuitabilityScore = 3;
            break;
        case "medium":
            miningSuitabilityScore = 2;
            break;
        case "low":
            miningSuitabilityScore = 1;
            break;
        default:
            miningSuitabilityScore = 0;
            break;
    }

    // Evaluate soil quality
    switch (province.soilQuality) {
        case "high":
            soilQualityScore = 2;
            break;
        case "medium":
            soilQualityScore = 1;
            break;
        case "low":
            soilQualityScore = 0;
            break;
    }

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 2;
    }

    // Evaluate elevation
    if (province.elevation > 37 && province.elevation <= 510) {
        elevationScore = 1;
    }

    // Evaluate proximity to rivers for transportation
    if (province.rivers.length > 0) {
        riverScore = 1;
    }

    // Sum the scores to determine coal production capability
    const totalScore = climateScore + miningSuitabilityScore + soilQualityScore + terrainScore + elevationScore + riverScore;

    if (totalScore >= 9) {
        return "high";
    } else if (totalScore >= 6) {
        return "medium";
    } else if (totalScore >= 3) {
        return "low";
    } else {
        return "none";
    }
}

/*
To determine if a province can produce marble, we need to evaluate several factors that influence marble production. Here's a detailed explanation for why each factor is considered, followed by the function:

    Terrain: Marble is a metamorphic rock that forms in mountainous and hilly terrains due to the high pressure and temperature conditions. Favorable terrains include mountains, hills, and forest areas where such geological processes are common.

    Elevation: Marble is typically found at higher elevations where tectonic activities and metamorphic processes are more prevalent. Provinces with elevations between 255 and 510 are ideal.

    Mining Suitability: This property directly indicates the province's potential for mining activities. Higher suitability scores mean the province has better conditions for extracting marble.

    Proximity to Water: Access to water bodies such as rivers facilitates the transportation of marble. Provinces with access to rivers or being adjacent to water bodies are more suitable for marble production.

    Climate: While marble can be found in various climates, regions with less severe winters (lower severity) are preferable as they allow continuous mining operations.

    Building Materials: The presence of other stone materials suggests geological conditions favorable for marble formation. Provinces with existing stone materials like slate or tile are more likely to have marble deposits.

*/

function canProvinceProduceMarble(province) {
    // Favorable terrains for marble production
    const favorableTerrains = ["mountains", "hills", "forest"];

    let terrainScore = 0;
    let elevationScore = 0;
    let miningSuitabilityScore = 0;
    let waterAccessScore = 0;
    let climateScore = 0;
    let buildingMaterialsScore = 0;

    // Evaluate terrain
    if (favorableTerrains.includes(province.terrain)) {
        terrainScore = 2;
    }

    // Evaluate elevation
    if (province.elevation >= 255 && province.elevation <= 510) {
        elevationScore = 2;
    }

    // Evaluate mining suitability
    switch (province.miningSuitability) {
        case "high":
            miningSuitabilityScore = 3;
            break;
        case "medium":
            miningSuitabilityScore = 2;
            break;
        case "low":
            miningSuitabilityScore = 1;
            break;
        default:
            miningSuitabilityScore = 0;
            break;
    }

    // Evaluate proximity to water
    if (province.rivers.length > 0 || province.adjacentToWater.length > 0) {
        waterAccessScore = 1;
    }

    // Evaluate climate
    if (province.severity <= 0.5) {
        climateScore = 1;
    }

    // Evaluate building materials
    if (province.buildingMaterials.stone || province.buildingMaterials.slateOrTile) {
        buildingMaterialsScore = 1;
    }

    // Sum the scores to determine marble production capability
    const totalScore = terrainScore + elevationScore + miningSuitabilityScore + waterAccessScore + climateScore + buildingMaterialsScore;

    if (totalScore >= 8) {
        return "high";
    } else if (totalScore >= 6) {
        return "medium";
    } else if (totalScore >= 4) {
        return "low";
    } else {
        return "none";
    }
}

//add pearls later