//fix bugs - seashell, tortoiseshell, and mother of pearl are coming back undefined. Ensure that we need to do the buildingMaterials checks
function assignMaterialRegions(province) {
    province.geographicalRegions.material_wood_elm = isMaterialWoodElm(province);
    province.geographicalRegions.material_wood_walnut = isMaterialWoodWalnut(province);
    province.geographicalRegions.material_wood_maple = isMaterialWoodMaple(province);
    province.geographicalRegions.material_woods_sri_lanka = isMaterialWoodsSriLanka(province);
    province.geographicalRegions.material_woods_pine_and_fir = isMaterialWoodsPineAndFir(province);
    province.geographicalRegions.material_woods_sub_saharan = isMaterialWoodsSubSaharan(province);
    province.geographicalRegions.material_woods_padauk = isMaterialWoodsPadauk(province);
    province.geographicalRegions.material_woods_india = isMaterialWoodsIndia(province);
    province.geographicalRegions.material_woods_india_burma = isMaterialWoodsIndiaBurma(province);
    province.geographicalRegions.material_woods_ebony = isMaterialWoodsEbony(province);
    province.geographicalRegions.material_woods_yew = isMaterialWoodsYew(province);
    province.geographicalRegions.material_woods_bamboo = isMaterialWoodsBamboo(province);
    province.geographicalRegions.material_woods_palm = isMaterialWoodsPalm(province);
    province.geographicalRegions.material_woods_mulberry = isMaterialWoodsMulberry(province);
    province.geographicalRegions.material_woods_mediterranean = isMaterialWoodsMediterranean(province);
    province.geographicalRegions.material_woods_sri_lanka = isMaterialWoodsSriLanka(province);
    province.geographicalRegions.material_cloth_no_silk = isMaterialClothNoSilk(province);
    province.geographicalRegions.material_cloth_linen = isMaterialClothLinen(province);
    province.geographicalRegions.material_cloth_cotton = isMaterialClothCotton(province);
    province.geographicalRegions.material_hsb_camel_bone = isMaterialHSBCamelBone(province);
    province.geographicalRegions.material_hsb_deer_antler = isMaterialHSBDeerAntler(province);
    province.geographicalRegions.material_hsb_boar_tusk = isMaterialHSBBoarTusk(province);
    province.geographicalRegions.material_hsb_ivory_native = isMaterialHSBIvoryNative(province);
    province.geographicalRegions.material_mother_of_pearl = isMaterialMotherOfPearl(province);
    province.geographicalRegions.material_hsb_tortoiseshell = isMaterialHsbTortoiseshell(province);
    province.geographicalRegions.material_hsb_seashell = isMaterialHsbSeashell(province);
}

function isMaterialWoodElm(province) {
    // Criteria for material_wood_elm region
    const validTerrains = ["forest", "plains"];
    const validClimates = ["Cfa", "Cfb", "Dfb"];
    const hasElmWood = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasElmWood;
}

function isMaterialWoodWalnut(province) {
    // Criteria for material_wood_walnut region
    const validTerrains = ["forest", "hills"];
    const validClimates = ["Csa", "Csb", "Dfa"];
    const hasWalnutWood = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasWalnutWood;
}


function isMaterialWoodMaple(province) {
    // Criteria for material_wood_maple region
    const validTerrains = ["forest", "hills"];
    const validClimates = ["Cfa", "Cfb", "Dfa", "Dfb"];
    const hasMapleWood = province.buildingMaterials.wood;
    const containsMapleProduction = province.resourceProduction.maple === "Medium" || province.resourceProduction.maple === "High";

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasMapleWood &&
           containsMapleProduction;
}

function isMaterialWoodsSriLanka(province) {
    // Criteria for material_woods_sri_lanka region
    const validTerrains = ["forest", "jungle", "wetland"];
    const validClimates = ["Af", "Am", "Aw"]; // Tropical climates
    const hasWood = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasWood &&
           validElevationRange;
}

function isMaterialWoodsPineAndFir(province) {
    // Criteria for material_woods_pine_and_fir region
    const validTerrains = ["forest", "taiga", "hills", "mountains"];
    const validClimates = ["Cfa", "Cfb", "Dfa", "Dfb", "Dfc", "Dfd", "ET"];
    const hasPineOrFirWood = province.buildingMaterials.wood;
    const containsPineOrFirProduction = province.resourceProduction.timber === "Medium" || province.resourceProduction.timber === "High";

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasPineOrFirWood &&
           containsPineOrFirProduction;
}

function isMaterialWoodsSubSaharan(province) {
    // Criteria for material_woods_subsaharan region
    const validTerrains = ["forest", "jungle"];
    const validClimates = ["Aw", "Am", "As", "BSh", "BWh"];
    const hasSubSaharanWood = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasSubSaharanWood;
}

function isMaterialWoodsPadauk(province) {
    // Criteria for material_woods_padauk region
    const validTerrains = ["forest", "jungle"];
    const validClimates = ["Aw", "Am", "As", "BSh"];
    const hasPadaukWood = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasPadaukWood;
}

function isMaterialWoodsIndia(province) {
    // Criteria for material_woods_india region
    const validTerrains = ["forest", "jungle", "hills", "mountains"];
    const validClimates = ["Aw", "Am", "As", "BSh", "Csa", "Cwa"];
    const hasIndianWoods = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasIndianWoods;
}

function isMaterialWoodsIndiaBurma(province) {
    // Criteria for material_woods_india_burma region
    const validTerrains = ["forest", "jungle", "hills", "mountains"];
    const validClimates = ["Aw", "Am", "As", "BSh", "Cwa", "Cwb"];
    const hasIndianOrBurmeseWoods = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasIndianOrBurmeseWoods;
}

function isMaterialWoodsEbony(province) {
    // Criteria for material_woods_ebony region
    const validTerrains = ["forest", "jungle"];
    const validClimates = ["Af", "Am", "Aw"];
    const hasEbonyWood = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasEbonyWood;
}

function isMaterialWoodsYew(province) {
    // Criteria for material_woods_yew region
    const validTerrains = ["forest", "hills", "mountains"];
    const validClimates = ["Csa", "Csb", "Cfa", "Cfb", "Dfa", "Dfb"];
    const hasYewWood = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasYewWood;
}

function isMaterialWoodsBamboo(province) {
    // Criteria for material_woods_bamboo region
    const validTerrains = ["forest", "jungle", "hills"];
    const validClimates = ["Af", "Am", "Aw", "Cwa", "Cwb"];
    const hasBamboo = province.buildingMaterials.bamboo;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasBamboo;
}

function isMaterialWoodsPalm(province) {
    // Criteria for material_woods_palm region
    const validTerrains = ["jungle", "forest", "wetland"];
    const validClimates = ["Af", "Am", "Aw", "BSh"];
    const hasPalmWood = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasPalmWood;
}

function isMaterialWoodsMulberry(province) {
    // Criteria for material_woods_mulberry region
    const validTerrains = ["forest", "hills", "plains"];
    const validClimates = ["Cfa", "Cfb", "Cwa", "Cwb"]; // Humid subtropical and temperate climates where mulberry trees are commonly found
    const hasMulberryWood = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasMulberryWood;
}

function isMaterialWoodsMediterranean(province) {
    // Criteria for material_woods_mediterranean region
    const validTerrains = ["forest", "hills", "plains"];
    const validClimates = ["Csa", "Csb"]; // Mediterranean climates
    const hasWood = province.buildingMaterials.wood;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasWood;
}

function isMaterialWoodsSriLanka(province) {
    // Criteria for material_woods_sri_lanka region
    const validTerrains = ["forest", "jungle", "wetland"];
    const validClimates = ["Af", "Am", "Aw"]; // Tropical climates
    const hasWood = province.buildingMaterials.wood;
    const validElevationRange = province.elevation >= -256 && province.elevation <= 205; // Sea level to hills

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           hasWood &&
           validElevationRange;
}

function isMaterialClothNoSilk(province) {
    // Criteria for material_cloth_no_silk region
    const validClimates = ["Cfa", "Cfb", "Csa", "Csb", "Aw", "Am"]; // Suitable climates for growing non-silk fibers
    const validResources = ["cotton", "flax", "linen"];
    const hasValidResourceProduction = validResources.some(resource => province.resourceProduction[resource] && province.resourceProduction[resource] !== "none");
    const validAgriculturalProductivity = ["average", "good", "excellent"];
    const validSoilQuality = ["medium", "high"];

    return validClimates.includes(province.climate) &&
           hasValidResourceProduction &&
           validAgriculturalProductivity.includes(province.agriculturalProductivity) &&
           validSoilQuality.includes(province.soilQuality);
}

function isMaterialClothLinen(province) {
    // Criteria for material_cloth_linen region
    const validClimates = ["Cfa", "Cfb", "Cfc", "Dfa", "Dfb"]; // Suitable climates for growing flax
    const validResources = ["flax", "linen"];
    const hasValidResourceProduction = validResources.some(resource => province.resourceProduction[resource] && province.resourceProduction[resource] !== "none");
    const validAgriculturalProductivity = ["average", "good", "excellent"];
    const validSoilQuality = ["medium", "high"];

    return validClimates.includes(province.climate) &&
           hasValidResourceProduction &&
           validAgriculturalProductivity.includes(province.agriculturalProductivity) &&
           validSoilQuality.includes(province.soilQuality);
}

function isMaterialClothCotton(province) {
    // Criteria for material_cloth_cotton region
    const validClimates = ["Aw", "BSh", "Csa", "Csb"]; // Suitable climates for growing cotton
    const hasValidResourceProduction = province.resourceProduction.cotton && province.resourceProduction.cotton !== "none";
    const validAgriculturalProductivity = ["average", "good", "excellent"];
    const validSoilQuality = ["medium", "high"];

    return validClimates.includes(province.climate) &&
           hasValidResourceProduction &&
           validAgriculturalProductivity.includes(province.agriculturalProductivity) &&
           validSoilQuality.includes(province.soilQuality);
}

function isMaterialHSBCamelBone(province) {
    // Criteria for material_hsb_camel_bone region
    const validTerrains = ["desert", "desert_mountains", "steppe"];
    const validClimates = ["BWh", "BWk", "BSh", "BSk"];

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate)
}

function isMaterialHSBDeerAntler(province) {
    // Criteria for material_hsb_deer_antler region
    const validTerrains = ["forest", "taiga", "hills"];
    const validClimates = ["Cfa", "Cfb", "Cfc", "Dfa", "Dfb", "Dfc"];

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate)
}

function isMaterialHSBBoarTusk(province) {
    // Criteria for material_hsb_boar_tusk region
    const validTerrains = ["forest", "taiga", "hills", "farmlands"];
    const validClimates = ["Csa", "Csb", "Cfa", "Cfb", "Cfc", "Dfa", "Dfb", "Dfc"];
    const validNeighborTerrains = ["forest", "taiga", "hills", "farmlands", "steppe", "plains"];

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           province.neighborTerrains.some(terrain => validNeighborTerrains.includes(terrain));
}

function isMaterialHSBIvoryNative(province) {
    // Criteria for material_hsb_ivory_native region
    const validTerrains = ["savanna", "jungle", "wetland", "drylands", "plains"];
    const validClimates = ["Af", "Aw", "Am", "BSh"];
    const minDistanceFromEquator = 0;
    const maxDistanceFromEquator = 3000;

    return validTerrains.includes(province.terrain) &&
           validClimates.includes(province.climate) &&
           province.placeInWorld.distanceFromEquator >= minDistanceFromEquator &&
           province.placeInWorld.distanceFromEquator <= maxDistanceFromEquator;
}

function isMaterialMotherOfPearl(province) {
    // Criteria for material_mother_of_pearl region
    const validTerrains = ["wetland"];
    const validClimates = ["Af", "Am", "As", "Aw", "BWh", "Csa", "Csb", "Cfa"];

    if (province.adjacentToWater.length > 0 || (validTerrains.includes(province.terrain) && validClimates.includes(province.climate))) {
        return true;
    }
    return false;
}

function isMaterialHsbTortoiseshell(province) {
    // Criteria for material_hsb_tortoiseshell region
    // Tortoiseshell is often associated with regions where tortoises are found, such as tropical and subtropical climates,
    // and provinces adjacent to water bodies, especially coastal areas.

    const validClimates = ["Af", "Am", "As", "Aw", "Cfa", "Cfb", "Cfc"];
    if (province.adjacentToWater.length > 0) {
        return province.adjacentToWater.length > 0 &&
        validClimates.includes(province.climate);
    }
    return false

}

function isMaterialHsbSeashell(province) {
    // Criteria for material_hsb_seashell region
    // Seashells are often associated with coastal or marine environments.

    const adjacentToWater = province.adjacentToWater.length > 0;
    if (adjacentToWater) {
        return true;
    }
    return false;
}