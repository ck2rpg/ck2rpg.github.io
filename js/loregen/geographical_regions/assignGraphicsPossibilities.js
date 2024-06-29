/**
 * Assigns clothing types based on a variety of environmental, geographical, and cultural properties of a province.
 * 
 * @param {Object} province - The province object containing all required details.
 * @returns {Array} An array of clothing types that are suitable for the province.
 * 
 * Properties used:
 * - climate: Determines suitability based on weather conditions.
 * - terrain: Influences the type of clothing based on the geographical features.
 * - resourceProduction: Considers local resources that might influence clothing material.
 * - geographicalRegions: Uses regional woods and metals to hint at cultural influences.
 * - hemisphere: Determines specific seasonal clothing needs.
 */

/*

    "african_clothing_gfx",
    "dde_abbasid_clothing_gfx mena_clothing_gfx",
    "afr_berber_clothing_gfx mena_clothing_gfx",
    "northern_clothing_gfx",
    "western_clothing_gfx",
    "indian_clothing_gfx",
    "byzantine_clothing_gfx",
    "dde_hre_clothing_gfx western_clothing_gfx",
    "mongol_clothing_gfx",
    "mena_clothing_gfx",
    "iberian_muslim_clothing_gfx dde_abbasid_clothing_gfx mena_clothing_gfx",
    "iranian_clothing_gfx mena_clothing_gfx",
    "turkic_clothing_gfx mongol_clothing_gfx"

*/

/*
    "northern_unit_gfx",
    "mena_unit_gfx",
    "western_unit_gfx",
    "sub_sahran_unit_gfx",
    "indian_unit_gfx",
    "eastern_unit_gfx",
    "mongol_unit_gfx",
    "iberian_muslim_unit_gfx",
    "iberian_christian_unit_gfx",
    "iranian_unit_gfx",
    "norse_unit_gfx"
*/

/*
    "african_building_gfx mena_building_gfx",
    "arabic_group_building_gfx mena_building_gfx",
    "western_building_gfx",
    "berber_group_building_gfx mena_building_gfx",
    "indian_building_gfx",
    "mediterranean_building_gfx",
    "iberian_building_gfx",
    "iranian_building_gfx",
    "steppe_building_gfx",

*/

function assignGraphicsPossibilities(province) {
    //keyed to clothing types and then assigned out from there
    let gp = []

    if (province.climate === "H") { //probably not the best
        gp.push("northern")
    }

    if (province.climate === "Af") {
        gp.push("african")
        gp.push("mena");
    }

    if (province.climate === "Am") {
        gp.push("african");
        gp.push("indian")
    }

    if (province.climate === "As") {
        gp.push("african")
        gp.push("indian")
    }

    if (province.climate === "Aw") {
        gp.push("african");
        gp.push("indian");
    }

    if (province.climate === "BWh") {
        gp.push("mena");
        gp.push("dde_abbasid");
        gp.push("afr_berber");
        gp.push("african");
    }

    if (province.climate === "BWk") {
        gp.push("mongol");
        gp.push("iranian");
    }

    if (province.climate === "BSh") {
        gp.push("mena")
    }

    if (province.climate === "BSk") {
        gp.push("iranian");
        gp.push("iberian_muslim");
    }

    if (province.climate === "Csa") {
        gp.push("byzantine");
        gp.push("iberian_christian");
    }

    if (province.climate === "Csb") {
        gp.push("iberian_christian")
    }

    if (province.climate === "Dsa") {
        gp.push("turkic");
        gp.push("iranian")
    }

    if (province.climate === "Dsb") {
        gp.push("northern");
    }

    if (province.climate === "Dfa") {
        //not really - it is really just the south of Ukraine and a bit of Russia and Kazakhstan
        gp.push("western");
        gp.push("northern");
        gp.push("mongol")
    }

    if (province.climate === "Dfb") {
        gp.push("western");
        gp.push("northern");
    }

    if (province.climate === "Dfc") {
        gp.push("northern");
    }

    if (province.climate === "Dfd") {
        gp.push("northern");
    }

    if (province.climate === "ET") {
        gp.push("northern");
    }

    if (province.climate === "EF") {
        gp.push("northern");
    }

    if (province.terrain === "steppe") {
        gp.push("mongol");
    }

    return gp;
}