function determineBuildingMaterials(province) {
    let materials = {
        wood: false,
        stone: false,
        clay: false,
        thatch: false,
        bamboo: false,
        adobe: false,
        rammedEarth: false,
        limeMortar: false,
        slateOrTile: false,
        ice: false,
        wattleAndDaub: false,
        animalHides: false,
        coralOrSeashells: false
    };

    // Wood availability
    if (["forest", "taiga", "jungle"].includes(province.terrain) || province.neighborTerrains.includes("forest")) {
        materials.wood = true;
    }

    // Stone availability
    if (province.elevation > 205 || ["mountains", "hills", "desert_mountains"].includes(province.terrain)) {
        materials.stone = true;
    }

    // Clay and Thatch
    if (["floodplains", "wetland", "farmlands"].includes(province.terrain)) {
        materials.clay = true;
        materials.thatch = true;  // Thatch is likely available in agricultural areas.
    }

    // Bamboo (predominantly in regions that could represent parts of Asia)
    if (["jungle", "forest"].includes(province.terrain) && province.climate.startsWith('A')) {
        materials.bamboo = true;
    }

    // Adobe and Rammed earth
    if (["desert", "drylands"].includes(province.terrain) || ["BWh", "BWk", "BSh", "BSk"].includes(province.climate)) {
        materials.adobe = true;
        materials.rammedEarth = true;
    }

    // Lime Mortar and Slate or Tile
    if (materials.stone || province.neighborTerrains.includes("hills")) {
        materials.limeMortar = true;
        materials.slateOrTile = true; // Regions with stone are likely to have slate and tiles.
    }

    // Ice construction in very cold climates
    if (["ET", "EF"].includes(province.climate)) {
        materials.ice = true;
    }

    // Wattle and Daub
    if (materials.wood && materials.clay) {
        materials.wattleAndDaub = true;
    }

    // Animal Hides (in steppe or tundra regions)
    if (["steppe", "taiga"].includes(province.terrain) && province.climate.startsWith('D')) {
        materials.animalHides = true;
    }

    // Coral or Seashells in island or coastal regions
    if (province.placeInWorld.island || province.placeInWorld.bay) {
        materials.coralOrSeashells = true;
    }

    return materials;
}
