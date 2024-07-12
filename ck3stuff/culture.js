//nonconforming
/*
gene_bs_ear_bend
face_detail_cheek_def
face_detail_cheek_fat
face_detail_chin_cleft
face_detail_eye_socket
complexion
expression_other
*/

let clothing_gfx_list = [
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
]

let building_gfx_list = [
    "african_building_gfx mena_building_gfx",
    "arabic_group_building_gfx mena_building_gfx",
    "western_building_gfx",
    "berber_group_building_gfx mena_building_gfx",
    "indian_building_gfx",
    "mediterranean_building_gfx",
    "iberian_building_gfx",
    "iranian_building_gfx",
    "steppe_building_gfx",

]

let unit_gfx_list = [
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
]

let coa_gfx_list = [
    "west_african_group_coa_gfx",
    "arabic_group_coa_gfx",
    "baltic_group_coa_gfx steppe_coa_gfx western_coa_gfx",
    "balto_finnic_group_coa_gfx steppe_coa_gfx western_coa_gfx",
    "berber_group_coa_gfx",
    "scottish_coa_gfx western_coa_gfx",
    "welsh_coa_gfx western_coa_gfx",
    "breton_coa_gfx western_coa_gfx",
    "burman_group_coa_gfx",
    "byzantine_group_coa_gfx western_coa_gfx",
    "central_african_group_coa_gfx",
    "german_group_coa_gfx western_coa_gfx",
    "chinese_group_coa_gfx",
    "dravidian_group_coa_gfx",
    "east_african_coa_gfx",
    "east_slavic_group_coa_gfx western_coa_gfx",
    "french_coa_gfx frankish_group_coa_gfx western_coa_gfx",
    "scottish_coa_gfx western_coa_gfx",
    "arabic_group_coa_gfx",
    "indo_aryan_group_coa_gfx",
    "iranian_group_coa_gfx",
    "israelite_group_coa_gfx",
    "latin_group_coa_gfx western_coa_gfx",
    "magyar_group_coa_gfx ugro_permian_group_coa_gfx steppe_coa_gfx",
    "mongol_coa_gfx steppe_coa_gfx",
    "swedish_coa_gfx western_coa_gfx",
    "norwegian_coa_gfx western_coa_gfx",
    "danish_coa_gfx western_coa_gfx",
    "indian_coa_gfx",
    "west_african_group_coa_gfx",
    "south_slavic_group_coa_gfx western_coa_gfx",
    "tibetan_group_coa_gfx",
    "oghuz_coa_gfx turkic_group_coa_gfx steppe_coa_gfx",
    "turkic_group_coa_gfx steppe_coa_gfx",
    "ugro_permian_group_coa_gfx steppe_coa_gfx",
    "steppe_coa_gfx volga_finnic_group_coa_gfx",
    "anglo_saxon_coa_gfx western_coa_gfx",
    "english_coa_gfx western_coa_gfx",
    "west_slavic_group_coa_gfx western_coa_gfx"
]

function getRandomColorPair() { // { xlow ylow xhigh yhigh}
    let lowX1 = getRandomInt(0, 8)
    let uppedX = lowX1 + 1;
    let lowX2 = getRandomInt(0, 9)
    let lowY1 = getRandomInt(0, 8)
    let lowY2 = getRandomInt(0, 9)
    let uppedY = lowY1 + 1;
    let highX1 = getRandomInt(uppedX, 9)
    let highY1 = getRandomInt(uppedY, 9)
    let highX2 = getRandomInt(0, 9);
    let highY2 = getRandomInt(0, 9)
    return `{ 0.${lowX1}${lowX2} 0.${lowY1}${lowY2} 0.${highX1}${highX2} 0.${highY1}${highY2} }`
}

let ethnicities = []

let headShapes = [
    "bumpy_head",
    "star_head",
    "meltface_head",
    "warthog_head"
]

function createRandomEthnicity(culture) {
    let t = `${culture.id}_eth = {\n`
    t += `\tskin_color = {\n`
        t += `\t\t10 = ${getRandomColorPair()}\n`
        t += `\t}\n`
        t += `\teye_color = {\n`
        t += `\t\t10 = ${getRandomColorPair()}\n`
        t += `\t}\n`
        t += `\thair_color = {\n`
        t += `\t\t10 = ${getRandomColorPair()}\n`
        t += `\t}\n`
    for (let i = 0; i < geneticProperties.length; i++) {
        let low = getRandomInt(0, 8);
        let upped = low + 1
        let high = getRandomInt(upped, 9)
        let g = geneticProperties[i]
        let str;
        if (g.o.length === 0) { // pos neg traits
            let posNeg = ["pos", "neg"][getRandomInt(0, 1)]
            if (g.n.includes("_bs_")) {
                str = g.n.replace("gene_bs_", "")
            } else if (g.n.includes("gene_")) {
                str = g.n.replace("gene_", "")
            } else if (g.n.includes("face_detail_")) {
                str = g.n.replace("face_detail_", "")
            }
            t += `\t${g.n} = {\n`
            t += `\t\t10 = { name = ${str}_${posNeg}\trange = { 0.${low} 0.${high} } }\n`
            t += `\t}\n`    
        } else {
            str = g.n
            let p = pickFrom(g.o)
            t += `\t${g.n} = {\n`
            t += `\t\t10 = { name = ${p}\trange = { 0.${low} 0.${high} } }\n`
            t += `\t}\n`   
        }
    }
    //beast
    /*
    let rand = getRandomInt(1, 10);
    if (rand === 5) {
        let low = getRandomInt(0, 8);
        let upped = low + 1
        let high = getRandomInt(upped, 9)
        let hs = pickFrom(headShapes);
        t += `\tbeast_head = {\n`
        t += `\t\t10 = { name = ${hs} range = { 0.${low} 0.${high} } }\n`
        t += `\t}\n`
    }
        */

    t += `}\n`
    return t;
}

function outputEthnicities() {
    let output = `${daBom}`
    for (let i = 0; i < world.cultures.length; i++) {
        let culture = world.cultures[i]
        output += createRandomEthnicity(culture);
    }
    var data = new Blob([output], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="ethnicities_link" download="01_ethnicities_placeholder.txt" href="">Download History</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`ethnicities_link`).href = url
    document.getElementById(`ethnicities_link`).click();
}

function outputHeritageLocalization() {
    let output = `${daBom}l_english:\n`
    for (let i = 0; i < world.cultures.length; i++) {
        let culture = world.cultures[i]
        let heritage = culture.heritage
        output += `${heritage}_name: "${culture.name}"\n`
    }
    var data = new Blob([output], {type: 'text/yaml'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="cultural_heritages_loc" download="gen_cultural_heritages_l_english.yml" href="">Download Cultural Heritages</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`cultural_heritages_loc`).href = url
    document.getElementById(`cultural_heritages_loc`).click();
}

function outputLanguagesLocalization() {
    let output = `${daBom}l_english:\n`
    for (let i = 0; i < world.cultures.length; i++) {
        let culture = world.cultures[i]
        let language = culture.language;
        output += `${language.name}_name: "${capitalize(language.loc)}"\n`
    }
    var data = new Blob([output], {type: 'text/yaml'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="cultural_languages_loc" download="gen_cultural_languages_l_english.yml" href="">Download Language Localization</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`cultural_languages_loc`).href = url
    document.getElementById(`cultural_languages_loc`).click();
}

let dgCount = 0;

function outputNameLists() {
    let onlyUniques = new Set();
    let t = `${daBom}`
    let loc = `${daBom}l_english:\n`
    for (let i = 0; i < world.cultures.length; i++) {
        let culture = world.cultures[i];
        t += `${culture.name_list} = {\n`
        //placeholder for cadet and dynasty names
        t += `\tcadet_dynasty_names = {\n`
        for (let z = 0; z < 100; z++) {
            t += `\t\t"dg${dgCount}"`
            dgCount += 1;
        }
        
        t += `\t}\n`
        t += `\tdynasty_names = {\n`
        for (let z = 0; z < 100; z++) {
            t += `\t\t"dg${dgCount}"`
            dgCount += 1;
        }
        
        t += `\t}\n`
        t += `\tmale_names = {\n`
        for (let n = 0; n < culture.maleNames.length; n++) {
            //let name = culture.maleNames[n]
            let name = generateWordFromTrigrams(maleNameTrigrams, maleNames)
            t += `${name} `
            onlyUniques.add(name)
        }
        t += `\n`
        t += `\t}\n`
        t += `\tfemale_names = {\n`
        for (let n = 0; n < culture.femaleNames.length; n++) {
            //let name = culture.femaleNames[n]
            let name = generateWordFromTrigrams(femaleNameTrigrams, femaleNames)
            t += `${name} `
            onlyUniques.add(name)
        }
        t += `\n`
        t += `\t}\n`
        t += `\tfounder_named_dynasties = yes\n`
        t += `}\n`
    }
    

    onlyUniques = [...onlyUniques]
    for (let i = 0; i < onlyUniques.length; i++) {
        let name = onlyUniques[i]
        loc += `\t${name}:0 "${name}"\n`
    }
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="culture_name_list_link" download="cultural_name_lists.txt" href="">Download History</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`culture_name_list_link`).href = url
    document.getElementById(`culture_name_list_link`).click();

    var data2 = new Blob([loc], {type: 'text/yaml'})
    var url2 = window.URL.createObjectURL(data2);
    let link2 = `<a id="name_lists_loc" download="cultural_names_l_english.yml" href="">Download Localization for Name Lists</a><br>`
    document.getElementById("download-links").innerHTML += `${link2}`;
    document.getElementById(`name_lists_loc`).href = url2
    document.getElementById(`name_lists_loc`).click();
    
}

function outputCulture(t, c) {
    t += `${c.id} = {\n`
    t += `\tcolor = { ${c.color} }\n`
    t += `\tethos = ${c.ethos}\n`
    t += `\tlanguage = ${c.language.name}\n`
    t += `\theritage = ${c.heritage}\n`
    t += `\tmartial_custom = ${c.martial_custom}\n`
    t += `\ttraditions = {\n`
    for (let i = 0; i < c.traditions.length; i++) {
        t += `\t\t${c.traditions[i].n}\n`
    }
    t += `\t}\n`
    t += `\tname_list = ${c.name_list}\n`
    t += `\tcoa_gfx = { ${c.coa_gfx} }\n`
    t += `\tbuilding_gfx = { ${c.buildings_gfx} }\n`
    t += `\tclothing_gfx = { ${c.clothing_gfx} }\n`
    t += `\tunit_gfx = { ${c.unit_gfx} }\n`
    t += `\tethnicities = {\n`
    if (settings.ethnicities === "vanilla") {
        let e = pickFrom(vanillaEthnicityList)
        t += `10 = ${e.n}\n`
    } else if (settings.ethnicities === "random") {
        t += `\t\t10 = ${c.id}_eth\n`
    }

    
    t += `\t}\n`
    t += `}\n`
    return t;
}

function outputCultures() {
    let t = `${daBom}`
    for (let i = 0; i < world.cultures.length; i++) {
        let culture = world.cultures[i]
        t = outputCulture(t, culture)
    }
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="cultures_link" download="generated_cultures.txt" href="">Cultures</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`cultures_link`).href = url
    document.getElementById(`cultures_link`).click();
}

function outputLanguages() {
    let t = `${daBom}`
    for (let i = 0; i < world.cultures.length; i++) {
        let lang = world.cultures[i].language
        t += `${lang.name} = {\n`
        t += `\ttype = language\n`
        t += `\tis_shown = {\n`
        t += `\t\tlanguage_is_shown_trigger = {\n`
        t += `\t\t\tLANGUAGE = ${lang.name}\n`
        t += `\t\t}`
        t += `\t}`
        t += `\tai_will_do = {\n`
        t += `\t\tvalue = 10\n`
        t += `\t\tif = {\n`
        t += `\t\t\tlimit = { has_cultural_pillar = ${lang.name} }\n`
        t += `\t\t\tmultiply = 10\n`
        t += `\t\t}\n`
        t += `\t}\n`
        t += `\tcolor = { 0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)} }\n`
        t += `}\n`
    }
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="languages_link" download="generated_languages.txt" href="">Languages</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`languages_link`).href = url
    document.getElementById(`languages_link`).click();
}

function outputHeritages() {
    let t = `${daBom}`
    for (let i = 0; i < world.cultures.length; i++) {
        let culture = world.cultures[i]
        t += `${culture.heritage} = {\n`
        t += `\ttype = heritage\n`
        t += `}`
    }
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="heritages_link" download="generated_heritages.txt" href="">Heritages</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`heritages_link`).href = url
    document.getElementById(`heritages_link`).click();
}

/* I think this is a duplicate
function outputNameListLoc() {
    let t = `${daBom}`
    t += `l_english:\n`
    for (let i = 0; i < world.cultures.length; i++) {
        let culture = world.cultures[i]
        t += `${culture.name_list}: "${culture.name}"\n`
    }
    var data = new Blob([t], {type: 'text/yaml'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="name_list_loc" download="culture_generated_name_lists_l_english.yml" href="">Download Name List Names</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`name_list_loc`).href = url
    document.getElementById(`name_list_loc`).click();
}

*/

const geneticProperties = [
    // Traits from the previous snippet
    {
 		n: "gene_chin_forward",
        o: []
 	},
    {
 		n: "gene_eye_angle",
        o: []
 	},
    {
 		n: "gene_eye_height",
        o: []
 	},
    {
 		n: "gene_forehead_brow_height",
 		o: []
 	},
    {
 		n: "gene_forehead_roundness",
 		o: []
 	},
    {
 		n: "gene_head_profile",
 		o: []
 	},
    {
 		n: "gene_head_width",
 		o: []
 	},
    {
 		n: "gene_jaw_width",
 		o: []
 	},
    {
 		n: "gene_mouth_height",
 		o: []
 	},
    {
 		n: "gene_mouth_width",
 		o: []
 	},
    {
 		n: "gene_bs_bust",
 		o: ["bust_shape_1_half", "bust_shape_1_full", "bust_shape_2_half", "bust_shape_2_full", "bust_shape_3_half", "bust_shape_3_full", "bust_shape_4_half", "bust_shape_4_full"]
 	},
    {
 		n: "gene_bs_eye_corner_depth",
 		o: []
 	},
    {
 		n: "gene_bs_eye_fold_shape",
 		o: []
 	},
    {
 		n: "gene_bs_eye_upper_lid_size",
 		o: []
 	},
    {
 		n: "gene_bs_jaw_def",
 		o: []
 	},
    {
 		n: "gene_bs_mouth_upper_lip_profile",
 		o: []
 	},
    {
 		n: "gene_bs_mouth_lower_lip_pad",
 		o: []
 	},
    {
 		n: "gene_bs_nose_length",
 		o: []
 	},
    {
 		n: "gene_bs_nose_nostril_height",
 		o: []
 	},
    {
 		n: "gene_bs_nose_nostril_width",
 		o: []
 	},
    {
 		n: "gene_bs_nose_profile",
 		o: []
 	},
    {
 		n: "gene_bs_nose_tip_angle",
 		o: []
 	},
    {
 		n: "gene_bs_nose_tip_forward",
 		o: []
 	},
    {
 		n: "face_detail_cheek_fat",
 		o: ["cheek_fat_01_pos", "cheek_fat_02_pos", "cheek_fat_03_pos", "cheek_fat_04_pos"]
 	},
    {
 		n: "face_detail_nose_ridge_def",
 		o: []
 	},
    {
 		n: "face_detail_nose_tip_def",
 		o: ["nose_tip_def"]
 	},
    {
 		n: "expression_brow_wrinkles",
 		o: ["brow_wrinkles_01", "brow_wrinkles_02", "brow_wrinkles_03", "brow_wrinkles_04"]
 	},
    {
        n: "complexion",
        o: ["complexion_1", "complexion_2", "complexion_3", "complexion_4", "complexion_5", "complexion_6", "complexion_7"],
    },
    {
 		n: "gene_height",
 		o: ["normal_height"]
 	},
    {
 		n: "gene_bs_body_shape",
 		o: ["body_shape_average", "body_shape_apple_half", "body_shape_apple_full", "body_shape_hourglass_half", "body_shape_hourglass_full", "body_shape_pear_half", "body_shape_pear_full", "body_shape_rectangle_half", "body_shape_rectangle_full", "body_shape_triangle_half", "body_shape_triangle_full" ]
 	},
    {
 		n: "gene_eyebrows_shape",
 		o: ["avg_spacing_avg_thickness", "avg_spacing_high_thickness", "avg_spacing_low_thickness", "avg_spacing_lower_thickness", "far_spacing_avg_thickness", "far_spacing_high_thickness", "far_spacing_low_thickness", "far_spacing_lower_thickness", "close_spacing_avg_thickness", "close_spacing_high_thickness", "close_spacing_low_thickness", "close_spacing_lower_thickness"]
 	},
    {
 		n: "gene_eyebrows_fullness",
 		o: ["layer_2_avg_thickness", "layer_2_high_thickness", "layer_2_lower_thickness", "layer_2_low_thickness"]
 	},
    {
 		n: "face_detail_cheek_def",
 		o: ["cheek_def_01", "cheek_def_02"]
 	},
    {
 		n: "face_detail_chin_cleft",
 		o: ["chin_cleft", "chin_dimple"]
 	},
    {
 		n: "face_detail_chin_def",
 		o: ["chin_def", "chin_def_neg"]
 	},
    {
 		n: "face_detail_eye_lower_lid_def",
 		o: ["eye_lower_lid_def"]
 	},
    {
 		n: "face_detail_eye_socket",
 		o: ["eye_socket_01", "eye_socket_02", "eye_socket_03", "eye_socket_color_01", "eye_socket_color_02", "eye_socket_color_03"]
 	},
    {
 		n: "face_detail_temple_def",
 		o: ["temple_def"]
 	},
    {
 		n: "gene_body_hair",
 		o: ["body_hair_sparse", "body_hair_avg", "body_hair_dense"]
 	},
    {
 		n: "gene_hair_type",
 		o: ["hair_straight", "hair_wavy", "hair_curly", "hair_afro", "hair_straight_thin_beard"]
 	},
    {
 		n: "gene_chin_height",
 		o: []
 	},
    {
 		n: "gene_chin_width",
 		o: []
 	},
    {
 		n: "gene_eye_depth",
 		o: []
 	},
    {
 		n: "gene_eye_distance",
 		o: []
 	},
    {
 		n: "gene_eye_shut",
 		o: []
 	},
    {
 		n: "gene_forehead_angle",
 		o: []
 	},
    {
 		n: "gene_forehead_height",
 		o: []
 	},
    {
 		n: "gene_head_height",
 		o: []
 	},
    {
 		n: "gene_jaw_angle",
 		o: []
 	},
    {
 		n: "gene_jaw_forward",
 		o: []
 	},
    {
 		n: "gene_jaw_height",
 		o: []
 	},
    {
 		n: "gene_mouth_corner_depth",
 		o: []
 	},
    {
 		n: "gene_mouth_corner_height",
 		o: []
 	},
    {
 		n: "gene_mouth_forward",
 		o: []
 	},
    {
 		n: "gene_neck_length",
 		o: []
 	},
    {
 		n: "gene_neck_width",
 		o: []
 	},
    {
 		n: "gene_bs_cheek_forward",
 		o: []
 	},
    {
 		n: "gene_bs_cheek_height",
 		o: []
 	},
    {
 		n: "gene_bs_cheek_width",
 		o: []
 	},
    {
 		n: "gene_bs_ear_angle",
 		o: []
 	},
    {
 		n: "gene_bs_ear_inner_shape",
 		o: ["ear_inner_shape_pos"]
 	},
    {
 		n: "gene_bs_ear_bend",
 		o: ["ear_lower_bend_pos", "ear_upper_bend_pos", "ear_both_bend_pos"]
 	},
    {
 		n: "gene_bs_ear_outward",
 		o: []
 	},
    {
 		n: "gene_bs_ear_size",
 		o: []
 	},
    {
 		n: "gene_bs_eye_size",
 		o: []
 	},
    {
 		n: "gene_bs_forehead_brow_curve",
 		o: []
 	},
    {
 		n: "gene_bs_forehead_brow_forward",
 		o: []
 	},
    {
 		n: "gene_bs_forehead_brow_inner_height",
 		o: []
 	},
    {
 		n: "gene_bs_forehead_brow_outer_height",
 		o: []
 	},
    {
 		n: "gene_bs_forehead_brow_width",
 		o: []
 	},
    {
 		n: "gene_bs_jaw_def",
 		o: []
 	},
    {
 		n: "gene_bs_mouth_lower_lip_def",
 		o: ["mouth_lower_lip_def_pos"]
 	},
    {
 		n: "gene_bs_mouth_lower_lip_full",
 		o: []
 	},
    {
 		n: "gene_bs_mouth_lower_lip_pad",
 		o: []
 	},
    {
 		n: "gene_bs_mouth_lower_lip_width",
 		o: []
 	},
    {
 		n: "gene_bs_mouth_philtrum_def",
 		o: ["mouth_philtrum_def_pos"]
 	},
    {
 		n: "gene_bs_mouth_philtrum_shape",
 		o: []
 	},
    {
 		n: "gene_bs_mouth_philtrum_width",
 		o: []
 	},
    {
 		n: "gene_bs_mouth_upper_lip_def",
 		o: ["mouth_upper_lip_def_pos"]
 	},
    {
 		n: "gene_bs_mouth_upper_lip_full",
 		o: []
 	},
    {
 		n: "gene_bs_mouth_upper_lip_profile",
 		o: []
 	},
    {
 		n: "gene_bs_mouth_upper_lip_width",
 		o: []
 	},
    {
 		n: "gene_bs_nose_forward",
 		o: []
 	},
    {
 		n: "gene_bs_nose_height",
 		o: []
 	},
    {
 		n: "gene_bs_nose_length",
 		o: []
 	},
    {
 		n: "gene_bs_nose_nostril_height",
 		o: []
 	},
    {
 		n: "gene_bs_nose_nostril_width",
 		o: []
 	},
    {
 		n: "gene_bs_nose_profile",
 		o: []
 	},
    {
 		n: "gene_bs_nose_ridge_angle",
 		o: []
 	},
    {
 		n: "gene_bs_nose_ridge_width",
 		o: []
 	},
    {
 		n: "gene_bs_nose_size",
 		o: []
 	},
    {
 		n: "gene_bs_nose_tip_angle",
 		o: []
 	},
    {
 		n: "gene_bs_nose_tip_forward",
 		o: []
 	},
    {
 		n: "gene_bs_nose_tip_width",
 		o: []
 	},
    {
 		n: "face_detail_nasolabial",
 		o: ["nasolabial_01", "nasolabial_02", "nasolabial_03"]
 	},
    {
 		n: "expression_eye_wrinkles",
 		o: ["eye_wrinkles_01", "eye_wrinkles_02", "eye_wrinkles_03"]
 	},
    {
 		n: "expression_forehead_wrinkles",
 		o: ["forehead_wrinkles_01", "forehead_wrinkles_02", "forehead_wrinkles_03"]
 	},
    {
 		n: "expression_other",
 		o: ["cheek_wrinkles_both_01"]
 	},
    {
 		n: "gene_age",
 		o: ["old_1", "old_2", "old_3", "old_4"]
 	},
    {
 		n: "eyelashes_accessory",
 		o: ["normal_eyelashes"]
 	},
    {
 		n: "eye_accessory",
 		o: ["normal_eyes"]
 	}
]


function randomEthnicity() {
    let t = ``
    
    return t;
}

const placeNamePrefixes = [
    'Amber', 'Astral', 'Azure', 'Beryl', 'Crimson', 'Crystal', 'Emerald',
    'Frost', 'Golden', 'Iron', 'Ivory', 'Jade', 'Lunar', 'Marble', 'Misty',
    'Obsidian', 'Opal', 'Pearl', 'Quartz', 'Ruby', 'Sapphire', 'Scarlet',
    'Shadow', 'Silver', 'Solar', 'Star', 'Storm', 'Tempest', 'Terra', 'Thunder',
    'Twilight', 'Vermilion', 'Violet', 'Whisper', 'Wild', 'Wind', 'Wraith',
    'Zephyr', 'Bloom', 'Cedar', 'Dawn', 'Echo', 'Elm', 'Fox', 'Gale', 'Haven',
    'Hollow', 'Lark', 'Maple', 'Marsh', 'Meadow', 'Oak', 'Pine', 'River', 'Rose',
    'Sky', 'Snow', 'Spring', 'Stone', 'Summer', 'Sun', 'Sunset', 'Swan', 'Timber',
    'Wolf', 'Wood', 'Aspen', 'Birch', 'Brook', 'Cliff', 'Cloud', 'Cove', 'Deer',
    'Eagle', 'Fern', 'Field', 'Flint', 'Grove', 'Hearth', 'Hill', 'Isle', 'Lake',
    'Leaf', 'Moon', 'Mountain', 'North', 'Ocean', 'Pond', 'Rain', 'Raven', 'Reed',
    'River', 'Rock', 'Sea', 'Shade', 'Shore', 'Snow', 'Spruce', 'Stone', 'Stream',
    'Thorn', 'Tide', 'Tree', 'Vale', 'Wave', 'West', 'Willow', 'Wind', 'Wolf',
    'Wood'
  ];

let placeNameSuffixes = [
        // Desert
    { n: 'sand', t: 'desert' },
    { n: 'dust', t: 'desert' },
    { n: 'arid', t: 'desert' },

    // Desert Mountains
    { n: 'ridge', t: 'desert mountains' },
    { n: 'spire', t: 'desert mountains' },
    { n: 'bluff', t: 'desert mountains' },

    // Drylands
    { n: 'scrub', t: 'drylands' },
    { n: 'bush', t: 'drylands' },
    { n: 'thorn', t: 'drylands' },

    // Farmlands
    { n: 'field', t: 'farmlands' },
    { n: 'acre', t: 'farmlands' },
    { n: 'pasture', t: 'farmlands' },

    // Floodplains
    { n: 'mire', t: 'floodplains' },
    { n: 'marsh', t: 'floodplains' },
    { n: 'fen', t: 'floodplains' },

    // Forest
    { n: 'wood', t: 'forest' },
    { n: 'grove', t: 'forest' },
    { n: 'thicket', t: 'forest' },

    // Hills
    { n: 'knoll', t: 'hills' },
    { n: 'dale', t: 'hills' },
    { n: 'rise', t: 'hills' },

    // Jungle
    { n: 'thicket', t: 'jungle' },
    { n: 'canopy', t: 'jungle' },
    { n: 'glade', t: 'jungle' },

    // Mountains
    { n: 'peak', t: 'mountains' },
    { n: 'crest', t: 'mountains' },
    { n: 'summit', t: 'mountains' },

    // Oasis
    { n: 'spring', t: 'oasis' },
    { n: 'haven', t: 'oasis' },
    { n: 'bloom', t: 'oasis' },

    // Plains
    { n: 'vale', t: 'plains' },
    { n: 'meadow', t: 'plains' },
    { n: 'prairie', t: 'plains' },

    // Steppe
    { n: 'expanse', t: 'steppe' },
    { n: 'flat', t: 'steppe' },
    { n: 'stretch', t: 'steppe' },

    // Taiga
    { n: 'pine', t: 'taiga' },
    { n: 'frost', t: 'taiga' },
    { n: 'snow', t: 'taiga' },

    // Wetlands
    { n: 'swamp', t: 'wetlands' },
    { n: 'bog', t: 'wetlands' },
    { n: 'quag', t: 'wetlands' }
]


function assignCultures() {

    for (let i = 0;i < world.empires.length; i++) {
        let empire = world.empires[i]
        empire.localizedTitle = generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)
    }

    for (let i = 0; i < world.kingdoms.length; i++) {
        let kingdom = world.kingdoms[i];
        let culture = createCulture()
        kingdom.culture = culture;
        if (world.cultures) {
            world.cultures.push(culture)
        } else {
            world.cultures = [];
            world.cultures.push(culture)
        }
        //kingdom.localizedTitle = placeName(kingdom.culture.language)
        kingdom.localizedTitle = generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)
        for (let j = 0; j < kingdom.duchies.length; j++) {
            let duchy = kingdom.duchies[j]
            //duchy.localizedTitle = placeName(kingdom.culture.language)
            duchy.localizedTitle = generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)
            for (let n = 0; n < duchy.counties.length; n++) {
                let county = duchy.counties[n]
                //county.localizedTitle = placeName(kingdom.culture.language)
                county.localizedTitle = generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)
                for (let z = 0; z < county.provinces.length; z++) {
                    let province = county.provinces[z]
                    province.localizedTitle = generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)
                    province.culture = culture // really set at county level but for ease of use with possible province swapping
                    //province.localizedTitle = placeName(kingdom.culture.language)
                }
            }
        }
    }
}

let cultureEthosList = [
    "ethos_bellicose",
    "ethos_stoic",
    "ethos_bureaucratic",
    "ethos_spiritual",
    "ethos_courtly",
    "ethos_egalitarian",
    "ethos_communal",   
]

let martialCustomRuleList = [
    "martial_custom_male_only",
    "martial_custom_equal",
    "martial_custom_female_only",
]

let traditionsList = [
    {
        n: "tradition_winter_warriors",
        t: "combat"
    },
    {
        n: "tradition_forest_fighters",
        t: "combat"
    },
    {
        n: "tradition_mountaineers",
        t: "combat"
    },
    {
        n: "tradition_warriors_of_the_dry",
        t: "combat"
    },
    {
        n: "tradition_highland_warriors",
        t: "combat"
    },
    {
        n: "tradition_jungle_warriors",
        t: "combat"
    },
    {
        n: "tradition_only_the_strong",
        t: "combat"
    },
    {
        n: "tradition_warriors_by_merit",
        t: "combat"
    },
    {
        n: "tradition_warrior_monks",
        t: "combat"
    },
    {
        n: "tradition_talent_acquisition",
        t: "combat"
    },
    {
        n: "tradition_strength_in_numbers",
        t: "combat"
    },
    {
        n: "tradition_frugal_armorsmiths",
        t: "combat"
    },
    {
        n: "tradition_malleable_invaders",
        t: "combat"
    },
    {
        n: "tradition_quarrelsome",
        t: "combat"
    },
    {
        n: "tradition_swords_for_hire",
        t: "combat"
    },
    {
        n: "tradition_reverance_for_veterans",
        t: "combat"
    },
    {
        n: "tradition_stalwart_defenders",
        t: "combat"
    },
    {
        n: "tradition_battlefield_looters",
        t: "combat"
    },
    {
        n: "tradition_hit_and_run",
        t: "combat"
    },
    {
        n: "tradition_stand_and_fight",
        t: "combat"
    },
    {
        n: "tradition_adaptive_skirmishing",
        t: "combat"
    },
    {
        n: "tradition_formation_fighting",
        t: "combat"
    },
    {
        n: "tradition_horse_breeder",
        t: "combat"
    },
    {
        n: "tradition_longbow_competitions",
        t: "combat"
    }, // SKIPPED MAA TRADITIONS HERE - ADD lATER?
    {
        n: "tradition_court_eunuchs",
        t: "realm"
    },
    {
        n: "tradition_legalistic",
        t: "realm"
    },
    {
        n: "tradition_republican_legacy",
        t: "realm"
    },
    {
        n: "tradition_hereditary_hierarchy",
        t: "realm"
    },
    {
        n: "tradition_esteemed_hospitality",
        t: "realm"
    },
    {   
        n: "tradition_gardening",
        t: "realm"
    },
    {
        n: "tradition_tribe_unity",
        t: "realm"
    },
    {
        n: "tradition_astute_diplomats",
        t: "realm"
    },
    {
        n: "tradition_collective_lands",
        t: "realm"
    },
    {
        n: "tradition_female_only_inheritance",
        t: "realm"
    },
    {
        n: "tradition_equal_inheritance",
        t: "realm"
    },
    {
        n: "tradition_roman_legacy",
        t: "realm"
    },
    {
        n: "tradition_metal_craftsmanship",
        t: "realm"
    },
    {
        n: "tradition_family_entrepreneurship",
        t: "realm"
    },
    {
        n: "tradition_wedding_ceremonies",
        t: "realm"
    },
    {
        n: "tradition_culture_blending",
        t: "realm"
    },
    {
        n: "tradition_isolationist",
        t: "realm"
    },
    {
        n: "tradition_fervant_temple_builders",
        t: "realm"
    },
    {
        n: "tradition_agrarian",
        t: "realm"
    },
    {
        n: "tradition_pastoralists",
        t: "realm"
    },
    {
        n: "tradition_parochialism",
        t: "realm"
    },
    {
        n: "tradition_ruling_caste",
        t: "realm"
    },
    {
        n: "tradition_staunch_traditionalists",
        t: "realm"
    },
    {
        n: "tradition_hill_dwellers",
        t: "realm"
    },
    {
        n: "tradition_forest_folk",
        t: "realm"
    },
    {
        n: "tradition_mountain_homes",
        t: "realm"
    },
    {
        n: "tradition_dryland_dwellers",
        t: "realm"
    },
    {
        n: "tradition_jungle_dwellers",
        t: "realm"
    },
    {
        n: "tradition_wetlanders",
        t: "realm"
    },
    {
        n: "tradition_hidden_cities",
        t: "realm"
    },
    {
        n: "tradition_ancient_miners",
        t: "realm"
    },
    {
        n: "tradition_castle_keepers",
        t: "realm"
    },
    {
        n: "tradition_city_keepers",
        t: "realm"
    },
    {
        n: "tradition_maritime_mercantilism",
        t: "realm"
    },
    {
        n: "tradition_monastic_communities",
        t: "realm"
    }, // skipped regional here
    {
        n: "tradition_monogamous",
        t: "ritual"
    },
    {
        n: "tradition_polygamous",
        t: "ritual"
    },
    {
        n: "tradition_concubines",
        t: "ritual"
    },
    {
        n: "tradition_sacred_mountains",
        t: "ritual"
    },
    {
        n: "tradition_sacred_groves",
        t: "ritual"
    },
    {
        n: "tradition_culinary_art",
        t: "ritual"
    },
    {
        n: "tradition_festivities",
        t: "ritual"
    },
    {
        n: "tradition_sorcerous_metallurgy",
        t: "ritual"
    },
    {
        n: "tradition_mystical_ancestors",
        t: "ritual"
    },
    {
        n: "tradition_religion_blending",
        t: "ritual"
    },
    {
        n: "tradition_religious_patronage",
        t: "ritual"
    },
    {
        n: "tradition_medicinal_plants",
        t: "ritual"
    },
    {
        n: "tradition_sacred_hunts",
        t: "ritual"
    },
    {
        n: "tradition_faith_bound",
        t: "ritual"
    },
    {
        n: "tradition_by_the_sword",
        t: "ritual"
    },
    {
        n: "tradition_language_scholars",
        t: "ritual"
    },
    {
        n: "tradition_runestones",
        t: "ritual"
    },
    {
        n: "tradition_merciful_blindings",
        t: "ritual"
    },
    {
        n: "tradition_xenophilic",
        t: "societal"
    },
    {
        n: "tradition_chivalry",
        t: "societal"
    },
    {
        n: "tradition_hard_working",
        t: "societal"
    },
    {
        n: "tradition_loyal_soldiers",
        t: "societal"
    },
    {
        n: "tradition_pacifism",
        t: "societal"
    },
    {
        n: "tradition_spartan",
        t: "societal"
    },
    {
        n: "tradition_diasporic",
        t: "societal"
    },
    {
        n: "tradition_hunters",
        t: "societal"
    },
    {
        n: "tradition_vegetarianism",
        t: "societal"
    },
    {
        n: "tradition_seafaring",
        t: "societal"
    },
    {
        n: "tradition_storytellers",
        t: "societal"
    },
    {
        n: "tradition_music_theory",
        t: "societal"
    },
    {
        n: "tradition_poetry",
        t: "societal"   
    },
    {
        n: "tradition_fishermen",
        t: "societal"
    },
    {
        n: "tradition_mendicant_mystics",
        t: "societal"
    },
    {
        n: "tradition_warrior_culture",
        t: "societal",
    },
    {
        n: "tradition_martial_admiration",
        t: "societal"
    },
    {
        n: "tradition_philosopher_culture",
        t: "societal"
    },
    {
        n: "tradition_welcoming",
        t: "societal"
    },
    {
        n: "tradition_eye_for_an_eye",
        t: "societal"
    },
    {
        n: "tradition_zealous_people",
        t: "societal"
    },
    {
        n: "tradition_forbearing",
        t: "societal"
    },
    {
        n: "tradition_equitable",
        t: "societal"
    },
    {
        n: "tradition_charitable",
        t: "societal"
    },
    {
        n: "tradition_modest",
        t: "societal"
    },
    {
        n: "tradition_practiced_pirates",
        t: "societal"
    },
    {
        n: "tradition_life_is_just_a_joke",
        t: "societal"
    },
    {
        n: "tradition_artisans",
        t: "societal"
    },
    {
        n: "tradition_noble_adoption",
        t: "societal"
    }
    //add DLCs?
]




function setRandomCultureTraditions() {
    let arr = [];
    for (let i = 0; i < 3; i++) {
        pickUniqFromWithoutDelete(traditionsList, arr)
    }
    return arr;
}

function getRandomEthnicities() {
    //implement
}

function getRandomCOA() {
    let res = pickFrom(coa_gfx_list);
    return res;
}

function getRandomCultureBuildings() {
    let res = pickFrom(building_gfx_list);
    return res;
}

function getRandomCultureClothing() {
    let res = pickFrom(clothing_gfx_list)
    return res
}

function getRandomCultureUnit() {
    let res = pickFrom(unit_gfx_list);
    return res
}

function createCulture(parent) {
    let culture = {};
    if (parent) {
        //fix this to where it makes language based on parent - then discard placeholder below
        culture.martial_custom = parent.martial
        culture.ethos = parent.ethos
        culture.traditions = parent.traditions
        culture.language = parent.language
        culture.coa_gfx = parent.coa_gfx;
        culture.buildings_gfx = parent.buildings_gfx;
        culture.clothing_gfx = parent.clothing_gfx
        culture.unit_gfx = parent.unit_gfx
        culture.ethnicities = parent.ethnicities
        culture.name = translate(culture.language, "People")
        culture.name = capitalize(romanizeText(culture.name))
        culture.id = rando()
        culture.name_list = parent.name_list
    } else {
        culture.martial_custom = pickFrom(martialCustomRuleList)
        culture.ethos = pickFrom(cultureEthosList)
        culture.language = createLanguage();
        culture.traditions = setRandomCultureTraditions()
        culture.coa_gfx = getRandomCOA()
        culture.buildings_gfx = getRandomCultureBuildings();
        culture.clothing_gfx = getRandomCultureClothing();
        culture.unit_gfx = getRandomCultureUnit();
        culture.ethnicities = getRandomEthnicities();
        culture.name = generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)
        culture.name = capitalize(romanizeText(culture.name))
        culture.id = rando()
        culture.name_list = `name_list_${culture.id}`
    }
    
    
    culture.language.name = `language_${rando()}`
    culture.color = `0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)}`
    if (parent) {
        culture.heritage = parent.heritage
    } else {
        culture.heritage = `heritage_${culture.id}_seed`
    }
    /*if (world && world.year) {
        culture.created = `${world.year}.${world.month}.${world.day}` //confirm this shouldn't be day month instead
    } else {
        culture.created = `660.1.1` // placeholder
    }*/ // add back when incorporate
    seedNames(culture);
    return culture;
}


function seedNames(culture) {
    culture.maleNames = [];
    culture.femaleNames = [];
    for (let i = 0; i < worldHistory.maleNames.length; i++) {
        let name = worldHistory.maleNames[i]
        let translated = translate(culture.language, name)
        translated = capitalize(romanizeText(translated))
        culture.maleNames.push(translated);
    }
    for (let i = 0; i < worldHistory.femaleNames.length; i++) {
        let name = worldHistory.femaleNames[i]
        let translated = translate(culture.language, name)
        translated = capitalize(romanizeText(translated))
        culture.femaleNames.push(translated);
    }
}

worldHistory.maleNames = ["John", "William", "James", "Charles", "George", "Frank", "Joseph", "Thomas", "Henry", "Robert", "Edward", "Harry", "Walter", "Arthur", "Fred", "Albert", "Samuel", "David", "Louis", "Joe", "Charlie", "Clarence", "Richard", "Andrew", "Daniel", "Ernest", "Will", "Jesse", "Oscar", "Lewis", "Peter", "Benjamin", "Frederick", "Willie", "Alfred", "Sam", "Roy", "Herbert", "Jacob", "Tom", "Elmer", "Carl", "Lee", "Howard", "Martin", "Michael", "Bert", "Herman", "Jim", "Francis", "Harvey", "Earl", "Eugene", "Ralph", "Ed", "Claude", "Edwin", "Ben", "Charley", "Paul", "Edgar", "Isaac", "Otto", "Luther", "Lawrence", "Ira", "Patrick", "Guy", "Oliver", "Theodore", "Hugh", "Clyde", "Alexander", "August", "Floyd", "Homer", "Jack", "Leonard", "Horace", "Marion", "Philip", "Allen", "Archie", "Stephen", "Chester", "Willis", "Raymond", "Rufus", "Warren", "Jessie", "Milton", "Alex", "Leo", "Julius", "Ray", "Sidney", "Bernard", "Dan", "Jerry", "Calvin", "Perry", "Dave", "Anthony", "Eddie", "Amos", "Dennis", "Clifford", "Leroy", "Wesley", "Alonzo", "Garfield", "Franklin", "Emil", "Leon", "Nathan", "Harold", "Matthew", "Levi", "Moses", "Everett", "Lester", "Winfield", "Adam", "Lloyd", "Mack", "Fredrick", "Jay", "Jess", "Melvin", "Noah", "Aaron", "Alvin", "Norman", "Gilbert", "Elijah", "Victor", "Gus", "Nelson", "Jasper", "Silas", "Christopher", "Jake", "Mike", "Percy", "Adolph", "Maurice", "Cornelius", "Felix", "Reuben", "Wallace", "Claud", "Roscoe", "Sylvester", "Earnest", "Hiram", "Otis", "Simon", "Willard", "Irvin", "Mark", "Jose", "Wilbur", "Abraham", "Virgil", "Clinton", "Elbert", "Leslie", "Marshall", "Owen", "Wiley", "Anton", "Morris", "Manuel", "Phillip", "Augustus", "Emmett", "Eli", "Nicholas", "Wilson", "Alva", "Harley", "Newton", "Timothy", "Marvin", "Ross", "Curtis", "Edmund", "Jeff", "Elias", "Harrison", "Stanley", "Columbus", "Lon", "Ora", "Ollie", "Russell", "Pearl", "Solomon", "Arch", "Asa", "Clayton", "Enoch", "Irving", "Mathew", "Nathaniel", "Scott", "Hubert", "Lemuel", "Andy", "Ellis", "Emanuel", "Joshua", "Millard", "Vernon", "Wade", "Cyrus", "Miles", "Rudolph", "Sherman", "Austin", "Bill", "Chas", "Lonnie", "Monroe", "Byron", "Edd", "Emery", "Grant", "Jerome", "Max", "Mose", "Steve", "Gordon", "Abe", "Pete", "Chris", "Clark", "Gustave", "Orville", "Lorenzo", "Bruce", "Marcus", "Preston", "Bob", "Dock", "Donald", "Jackson", "Cecil", "Barney", "Delbert", "Edmond", "Anderson", "Christian", "Glenn", "Jefferson", "Luke", "Neal", "Burt", "Ike", "Myron", "Tony", "Conrad", "Joel", "Matt", "Riley", "Vincent", "Emory", "Isaiah", "Nick", "Ezra", "Green", "Juan", "Clifton", "Lucius", "Porter", "Arnold", "Bud", "Jeremiah", "Taylor", "Forrest", "Roland", "Spencer", "Burton", "Don", "Emmet", "Gustav", "Louie", "Morgan", "Ned", "Van", "Ambrose", "Chauncey", "Elisha", "Ferdinand", "General", "Julian", "Kenneth", "Mitchell", "Allie", "Josh", "Judson", "Lyman", "Napoleon", "Pedro", "Berry", "Dewitt", "Ervin", "Forest", "Lynn", "Pink", "Ruben", "Sanford", "Ward", "Douglas", "Ole", "Omer", "Ulysses", "Walker", "Wilbert", "Adelbert", "Benjiman", "Ivan", "Jonas", "Major", "Abner", "Archibald", "Caleb", "Clint", "Dudley", "Granville", "King", "Mary", "Merton", "Antonio", "Bennie", "Carroll", "Freeman", "Josiah", "Milo", "Royal", "Earle", "Elza", "Emerson", "Fletcher", "Judge", "Laurence", "Neil", "Roger", "Seth", "Glen", "Hugo", "Jimmie", "Johnnie", "Washington", "Elwood", "Gust", "Harmon", "Jordan", "Simeon", "Wayne", "Wilber", "Clem", "Evan", "Frederic", "Irwin", "Junius", "Lafayette", "Loren", "Madison", "Mason", "Orval", "Abram", "Aubrey", "Elliott", "Hans", "Karl", "Minor", "Wash", "Wilfred", "Allan", "Alphonse", "Dallas", "Dee", "Isiah", "Jason", "Johnny", "Lawson", "Lew", "Micheal", "Orin", "Addison", "Cal", "Erastus", "Francisco", "Hardy", "Lucien", "Randolph", "Stewart", "Vern", "Wilmer", "Zack", "Adrian", "Alvah", "Bertram", "Clay", "Ephraim", "Fritz", "Giles", "Grover", "Harris", "Isom", "Jesus", "Johnie", "Jonathan", "Lucian", "Malcolm", "Merritt", "Otho", "Perley", "Rolla", "Sandy", "Tomas", "Wilford", "Adolphus", "Angus", "Arther", "Carlos", "Cary", "Cassius", "Davis", "Hamilton", "Harve", "Israel", "Leander", "Melville", "Merle", "Murray", "Pleasant", "Sterling", "Steven", "Axel", "Boyd", "Bryant", "Clement", "Erwin", "Ezekiel", "Foster", "Frances", "Geo", "Houston", "Issac", "Jules", "Larkin", "Mat", "Morton", "Orlando", "Pierce", "Prince", "Rollie", "Rollin", "Sim", "Stuart", "Wilburn", "Bennett", "Casper", "Christ", "Dell", "Egbert", "Elmo", "Fay", "Gabriel", "Hector", "Horatio", "Lige", "Saul", "Smith", "Squire", "Tobe"]

worldHistory.femaleNames = ["Mary", "Anna", "Emma", "Elizabeth", "Minnie", "Margaret", "Ida", "Alice", "Bertha", "Sarah", "Annie", "Clara", "Ella", "Florence", "Cora", "Martha", "Laura", "Nellie", "Grace", "Carrie", "Maude", "Mabel", "Bessie", "Jennie", "Gertrude", "Julia", "Hattie", "Edith", "Mattie", "Rose", "Catherine", "Lillian", "Ada", "Lillie", "Helen", "Jessie", "Louise", "Ethel", "Lula", "Myrtle", "Eva", "Frances", "Lena", "Lucy", "Edna", "Maggie", "Pearl", "Daisy", "Fannie", "Josephine", "Dora", "Rosa", "Katherine", "Agnes", "Marie", "Nora", "May", "Mamie", "Blanche", "Stella", "Ellen", "Nancy", "Effie", "Sallie", "Nettie", "Della", "Lizzie", "Flora", "Susie", "Maud", "Mae", "Etta", "Harriet", "Sadie", "Caroline", "Katie", "Lydia", "Elsie", "Kate", "Susan", "Mollie", "Alma", "Addie", "Georgia", "Eliza", "Lulu", "Nannie", "Lottie", "Amanda", "Belle", "Charlotte", "Rebecca", "Ruth", "Viola", "Olive", "Amelia", "Hannah", "Jane", "Virginia", "Emily", "Matilda", "Irene", "Kathryn", "Esther", "Willie", "Henrietta", "Ollie", "Amy", "Rachel", "Sara", "Estella", "Theresa", "Augusta", "Ora", "Pauline", "Josie", "Lola", "Sophia", "Leona", "Anne", "Mildred", "Ann", "Beulah", "Callie", "Lou", "Delia", "Eleanor", "Barbara", "Iva", "Louisa", "Maria", "Mayme", "Evelyn", "Estelle", "Nina", "Betty", "Marion", "Bettie", "Dorothy", "Luella", "Inez", "Lela", "Rosie", "Allie", "Millie", "Janie", "Cornelia", "Victoria", "Ruby", "Winifred", "Alta", "Celia", "Christine", "Beatrice", "Birdie", "Harriett", "Mable", "Myra", "Sophie", "Tillie", "Isabel", "Sylvia", "Carolyn", "Isabelle", "Leila", "Sally", "Ina", "Essie", "Bertie", "Nell", "Alberta", "Katharine", "Lora", "Rena", "Mina", "Rhoda", "Mathilda", "Abbie", "Eula", "Dollie", "Hettie", "Eunice", "Fanny", "Ola", "Lenora", "Adelaide", "Christina", "Lelia", "Nelle", "Sue", "Johanna", "Lilly", "Lucinda", "Minerva", "Lettie", "Roxie", "Cynthia", "Helena", "Hilda", "Hulda", "Bernice", "Genevieve", "Jean", "Cordelia", "Marian", "Francis", "Jeanette", "Adeline", "Gussie", "Leah", "Lois", "Lura", "Mittie", "Hallie", "Isabella", "Olga", "Phoebe", "Teresa", "Hester", "Lida", "Lina", "Marguerite", "Winnie", "Claudia", "Vera", "Cecelia", "Bess", "Emilie", "John", "Rosetta", "Verna", "Myrtie", "Cecilia", "Elva", "Olivia", "Ophelia", "Georgie", "Elnora", "Violet", "Adele", "Lily", "Linnie", "Loretta", "Madge", "Polly", "Virgie", "Eugenia", "Lucile", "Lucille", "Mabelle",
"Rosalie", "Kittie", "Meta", "Angie", "Dessie", "Georgiana", "Lila", "Regina", "Selma", "Wilhelmina", "Bridget", "Lilla", "Malinda", "Vina", "Freda", "Gertie", "Jeannette", "Louella", "Mandy", "Roberta", "Cassie", "Corinne", "Ivy", "Melissa", "Lyda", "Naomi", "Norma", "Bell", "Margie", "Nona", "Zella", "Dovie", "Elvira", "Erma", "Irma", "Leota", "William", "Artie", "Blanch", "Charity", "Janet", "Lorena", "Lucretia", "Orpha", "Alvina", "Annette", "Catharine", "Elma", "Geneva", "Lee", "Leora", "Lona", "Miriam", "Zora", "Linda", "Octavia", "Sudie", "Zula", "Adella", "Alpha", "Frieda", "George", "Joanna", "Leonora", "Priscilla", "Tennie", "Angeline", "Docia", "Ettie", "Flossie", "Hanna", "Letha", "Minta", "Retta", "Rosella", "Adah", "Berta", "Elisabeth", "Elise", "Goldie", "Leola", "Margret", "Adaline", "Floy", "Idella", "Juanita", "Lenna", "Lucie", "Missouri", "Nola", "Zoe", "Eda", "Isabell", "James", "Julie", "Letitia", "Madeline", "Malissa", "Mariah", "Pattie", "Vivian", "Almeda", "Aurelia", "Claire", "Dolly", "Hazel", "Jannie", "Kathleen", "Kathrine", "Lavinia", "Marietta", "Melvina", "Ona", "Pinkie", "Samantha", "Susanna", "Chloe", "Donnie", "Elsa", "Gladys", "Matie", "Pearle", "Vesta", "Vinnie", "Antoinette", "Clementine", "Edythe", "Harriette", "Libbie", "Lilian", "Lue", "Lutie", "Magdalena", "Meda", "Rita", "Tena", "Zelma", "Adelia", "Annetta", "Antonia", "Dona", "Elizebeth", "Georgianna", "Gracie", "Iona", "Lessie", "Leta", "Liza", "Mertie", "Molly", "Neva", "Oma", "Alida", "Alva", "Cecile", "Cleo", "Donna", "Ellie"]

