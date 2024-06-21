/*TO DO
Language Update
Religion Localization
Set culture traditions based on location and history
in religion, the religion.js talks about oldName oldName adj etc.
set hair and eye color on location
migration, settlement, continent jumping
*/
let hist = {};
hist.heritages = 0;
hist.year = 81
hist.month = 1
hist.day = 1;
hist.religions = []
hist.cultures = []
hist.land = []
hist.log = []
hist.unpopulatedProvinces = 0
hist.populatedProvinces = []

function provinceTurn() {
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
    }
}


function setSkinColorOnLocation(c, p) {
    let y;
    if (p.y <= 2048) {
        y = p.y / 2048
    } else {
        y = 1 - (p.y / 4096)
    }
    let x;
    if (p.x <= 4096) {
        x = 1 - (p.x / 4096);
    } else {
        x = p.x / 8192
    }
    let lowX = x - 0.1;
    if (lowX < 0.01) {
        lowX = 0.05
    }
    let lowY = y - 0.1
    if (lowY < 0.01) {
        lowY = 0.05
    }
    c.genes.skin = {
        chances: [
            {
                chance: 100,
                lowX: lowX,
                lowY: lowY,
                highX: x,
                highY: y
            }
        ]
    }
}

function scribe(t) {
    hist.log.push(`${t}\n`)
}

function historyTick() {
    for (let i = 0; i < hist.tribes.length; i++) {

    }
}


function addPopulatedProvince(p) {
    //general count with no additional information or checks
    hist.populatedProvinces.push(p);
    hist.unpopulatedProvinces -= 1;
}


//don't generate the world. generate a representation of the world.
function generateHistory() {
    hist.dynasties = []
    hist.characters = []
    hist.tribes = []
    setLandProvinces()
    floodFillContinentsByProvince()
    seedEachContinentWithATribe()
    generatePrehistory() 
}

function generatePrehistory() {
    for (let i = 0; i < 300; i++) {
        for (let n = 0; n < hist.populatedProvinces.length; n++) {
            let p = hist.populatedProvinces[n]
            //ADD HERE
        }
    }
}



function setLandProvinces() {
    let land = hist.land
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i];
        if (p.land) {
            land.push(p);
        }
    }
    hist.unpopulatedProvinces = land.length
}

function seedEachContinentWithATribe() {
    for (let i = 0; i < world.continentsByProvince.length; i++) {
        let favorable = []
        let eden = {}
        let continent = world.continentsByProvince[i]
        for (let n = 0; n < continent.provinces.length; n++) {
            let p = continent.provinces[n]
            if (p.rivers && p.adjacentToWater) {
                favorable.push(p);
            }
        }
        if (favorable.length > 0) {
            eden = pickFrom(favorable);
        } else {
            eden = pickFrom(continent.provinces)
        }
        let t1 = {}
        t1.capital = eden
        t1.provinces = [eden];
        eden.owner = t1;
        let r1 = createPrimitiveReligion()
        let c1 = createPrimitiveCulture()
        c1.name = pickFrom(variations.firstPeople)
        c1.language.loc = "Proto-Language"
        setSkinColorOnLocation(c1, eden)
        c1.home = eden
        c1.provinces.push(eden)
        eden.tribe = t1;
        eden.culture = c1;
        eden.religion = r1;
        addPopulatedProvince(eden)
        setTraditionPossibilities(c1)
        c1.traditions.push(pickFrom(c1.possibleTraditions))
        scribe(`${hist.year}: Civilization develops as the ${c1.name} culture rises up in the ${eden.terrain} of ${eden.localizedTitle}.`)
        t1.culture = c1;
        t1.faith = r1.faiths[0];
        t1.faith.holySites.push(eden)
        hist.tribes.push(t1)
    }
}

function average(numbers) {
    if (numbers.length === 0) return 0; // Return 0 if the array is empty to avoid division by zero
    let sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

function mostFrequentString(strings) {
    if (strings.length === 0) return null; // Return null if the array is empty
  
    let frequencyMap = {};
    let maxFrequency = 0;
    let mostFrequent = null;
  
    for (let str of strings) {
      if (frequencyMap[str]) {
        frequencyMap[str]++;
      } else {
        frequencyMap[str] = 1;
      }
  
      if (frequencyMap[str] > maxFrequency) {
        maxFrequency = frequencyMap[str];
        mostFrequent = str;
      }
    }
  
    return mostFrequent;
}


function getContinentByColor(c) {
    for (let n = 0; n < world.continents.length; n++) {
        let cont = world.continents[n]
        if (cont.id === c) {
            return cont
        }
    }
}

function setTraditionPossibilities(c) {
    let possible = []
    //iterate through each province, push stats for each that will help determine tradition
    let elevations = [];
    let distancesFromEquator = []
    let terrains = [];
    let adjacentWaterProvinces = []
    let rivers = []
    let continentSizes = [] //by province num
    let landNeighbors = [];
    let waterNeighbors = [];
    let winterSeverities = [];

    for (let i = 0; i < c.provinces.length; i++) {
        let p = c.provinces[i]
        let provincialContinent = getContinentByColor(p.continent)
        elevations.push(p.elevation);
        distancesFromEquator.push(Math.abs(p.y - 2048))
        terrains.push(p.terrain);
        if (p.adjacentToWater) { //you have to check for these two because not set on a province without adjacencies or rivers
            adjacentWaterProvinces.push(p.adjacentToWater.length);
        } else {
            adjacentWaterProvinces.push(0) 
        }
        if (p.rivers) {
            rivers.push(p.rivers.length)
        } else {
            rivers.push(0)
        }
        continentSizes.push(provincialContinent.provinces.length)
        landNeighbors.push(p.placeInWorld.landNeighbors);
        waterNeighbors.push(p.placeInWorld.waterNeighbors);
        winterSeverities.push(p.severity)
    }

    let e = average(elevations);
    let d = average(distancesFromEquator);
    let t = mostFrequentString(terrains)
    let a = average(adjacentWaterProvinces);
    let r = average(rivers);
    let cs = average(continentSizes)
    let ln = average(landNeighbors);
    let wn = average(waterNeighbors)
    let ws = mostFrequentString(winterSeverities)

    if (t === "taiga") {
        possible.push("tradition_winter_warriors") 
        possible.push(pickFrom(["tradition_forest_wardens", "tradition_forest_folk"]))
        possible.push("tradition_sacred_groves")
    } else if (ws === "0.7" || ws === "0.8" || ws === "0.9") { // is this right for harsh winters?
        possible.push("tradition_winter_warriors")
    }
    if (t === "forest") {
        possible.push("tradition_forest_fighters")
        possible.push("tradition_medicinal_plants")
        possible.push("tradition_sacred_groves")
        possible.push("tradition_hunters")
        possible.push("tradition_forest_folk")
        possible.push("tradition_forest_wardens")
    }
    if (t === "mountains") {
        possible.push("tradition_mountaineers")
        possible.push("sacred_mountains")
        possible.push("tradition_isolationist");
        possible.push("tradition_mountain_homes")
        possible.push("tradition_ancient_miners")
        possible.push("tradition_caucasian_wolves")
        possible.push("tradition_mountain_herding")
    }
    if (t === "desert") {
        possible.push("tradition_desert_ribat")
        possible.push("tradition_desert_nomads")
        possible.push("tradition_saharan_nomads")
        possible.push("tradition_fp3_irrigation_experts")
    } 

    if (t === "desert_mountains") {
        possible.push("tradition_desert_ribat")
        possible.push("tradition_desert_nomads")
        possible.push("tradition_mountaineers")
        possible.push("sacred_mountains")
        possible.push("tradition_isolationist");
        possible.push("tradition_mountain_homes")
        possible.push("tradition_ancient_miners")
        possible.push("tradition_caucasian_wolves")
        possible.push("tradition_saharan_nomads")
        possible.push("tradition_fp3_irrigation_experts")
        possible.push("tradition_mountain_herding")
    }

    if (t === "drylands") {
        possible.push("tradition_warriors_of_the_dry")
        possible.push("tradition_dryland_dwellers")
        possible.push("tradition_bush_hunting")
        possible.push("tradition_fp3_irrigation_experts")
    }
    if (t === "hills") {
        possible.push("tradition_highland_warriors")
        possible.push("tradition_hill_dwellers") 
        possible.push("tradition_ancient_miners")
    }
    if (t === "jungle") {
        possible.push("tradition_jungle_warriors")
        possible.push("tradition_hunters")
        possible.push("tradition_isolationist");
        possible.push("tradition_jungle_dwellers")
        possible.push("tradition_medicinal_plants")
        possible.push("tradition_hidden_cities")
        possible.push("tradition_bush_hunting")
    }
    if (t === "steppe") {
        possible.push("tradition_pastoralists")
        possible.push("tradition_horse_lords")
        possible.push("tradition_steppe_tolerance")
    }
    if (t === "wetland") {
        possible.push("tradition_wetlanders")
    }
    
    if (t === "oasis") {
        possible.push("tradition_saharan_nomads")
        possible.push("tradition_desert_ribat")
        possible.push("tradition_desert_nomads")
        possible.push("tradition_saharan_nomads")
        possible.push("tradition_fp3_irrigation_experts")
    }

    if (t === "floodplains") {
        possible.push("tradition_land_of_the_bow")
        possible.push("tradition_agrarian")
        possible.push("tradition_culinary_art")
    }

    if (t === "farmlands") {
        possible.push("tradition_agrarian")
        possible.push("tradition_culinary_art")
    }

    if (t === "plains") {
        possible.push("tradition_pastoralists")
        possible.push("tradition_vegetarianism")
        possible.push("tradition_hunters")
    }
    

    if (a > 1) {
        possible.push("tradition_fishermen")
        possible.push("tradition_fp1_coastal_warriors")
        possible.push("tradition_practiced_pirates")
        possible.push("tradition_seafaring")
        possible.push("tradition_maritime_mercantilism")
        possible.push("tradition_polders")
    }

    if (c.provinces.indexOf(c.home) === -1) {
        possible.push("tradition_diasporic")
    }

    if (ln < 1 && wn >= 1) {
        possible.push("tradition_isolationist");
        possible.push("tradition_practiced_pirates")
    }


    c.possibleTraditions = possible
    
}

let variations = {}
variations.firstPeople = [
    "First People",
    "First Folk",
    "Primitive Folk",
    "Primitive"
]



function createPrimitiveReligion() {
    let r1 = {}
    r1.name = `primitive${hist.religions.count}_religion`
    r1.nameLoc = "Primitive"
    r1.family = "rf_pagan"
    r1.pagan_roots = "yes"
    r1.graphical_faith = "pagan_gfx"
    r1.piety_icon_group = "pagan"
    r1.doctrine_background_icon = "core_tenet_banner_pagan.dds"
    r1.hostility_doctrine = "pagan_hostility_doctrine"
    r1.custom_faith_icons = `custom_faith_1 custom_faith_2 custom_faith_3 custom_faith_4 custom_faith_5 custom_faith_6 custom_faith_7 custom_faith_8 custom_faith_9 custom_faith_10 dualism_custom_1 zoroastrian_custom_1 zoroastrian_custom_2 buddhism_custom_1 buddhism_custom_2 buddhism_custom_3 buddhism_custom_4 taoism_custom_1 yazidi_custom_1 sunni_custom_2 sunni_custom_3 sunni_custom_4 muhakkima_1 muhakkima_2 muhakkima_4 muhakkima_5 muhakkima_6 judaism_custom_1 custom_faith_fp1_fenrir custom_faith_fp1_irminsul custom_faith_fp1_jormungandr custom_faith_fp1_odins_ravens custom_faith_fp1_runestone_moon custom_faith_fp1_thors_hammer custom_faith_fp1_valknut custom_faith_fp1_yggdrasil custom_faith_boromian_circles custom_faith_lotus custom_faith_aum_tibetan custom_faith_pentagram custom_faith_pentagram_inverted custom_faith_burning_bush custom_faith_allah custom_faith_gankyil custom_faith_eye_of_providence custom_faith_dove custom_faith_ichthys custom_faith_lamb custom_faith_black_sheep custom_faith_ankh custom_faith_chi_rho custom_faith_hamsa custom_faith_cool_s`
    r1.holy_order_names = [
        "PLACEHOLDER",
        "PLACEHOLDER"
    ]
    r1.holy_order_maa = "bush_hunter"
    r1.holy_order_names = 'holy_order_warriors_of_highgod'
    r1.virtues = [
        "brave", "diligent", "gregarious"
    ]
    r1.sins = [
        "craven", "lazy", "gluttonous"
    ]

    r1.doctrines = {}
    r1.doctrines.head = "doctrine_no_head"
    r1.doctrines.gender = "doctrine_gender_equal"
    r1.doctrines.pluralism = "doctrine_pluralism_pluralistic"
    r1.doctrines.theocracy = "doctrine_theocracy_lay_clergy"
    r1.doctrines.concubines = "doctrine_concubines"
    r1.doctrines.divorce = "doctrine_divorce_allowed"
    r1.doctrines.bastardry = "doctrine_bastardry_none"
    r1.doctrines.consan = "doctrine_consanguinity_unrestricted"
    r1.doctrines.homosexuality = "doctrine_homosexuality_accepted"
    r1.doctrines.adultery_men = "doctrine_adultery_men_accepted"
    r1.doctrines.adultery_women = "doctrine_adultery_women_accepted"
    r1.doctrines.kinslaying = "doctrine_kinslaying_close_kin_accepted"
    r1.doctrines.deviancy = "doctrine_deviancy_accepted"
    r1.doctrines.witchcraft = "doctrine_witchcraft_accepted"
    r1.doctrines.clerical_function = "doctrine_clerical_function_taxation" //control
    r1.doctrines.clerical_gender = "doctrine_clerical_gender_either"
    r1.doctrines.clerical_marriage = "doctrine_clerical_marriage_allowed"
    r1.doctrines.clerical_succession = "doctrine_clerical_succession_temporal_appointment"
    r1.doctrines.pilgrimages = "doctrine_pilgrimage_encouraged"
    r1.doctrines.funeral_doctrine = "doctrine_funeral_cremation" 
    let faith = {};
    faith.icon = "west_african"
    faith.icon_reformed = "west_african_reformed"
    faith.color = `0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)}`
    faith.name = "Primitive"
    faith.doctrines = [
        "unreformed_faith_doctrine"
    ]
    faith.tenets = [
        "tenet_natural_primitivism",
        "tenet_sanctity_of_nature",
        "tenet_adorcism"
    ]
    faith.holySites = []
    r1.faiths = [faith]
    //set r1 localization HERE with function -
    hist.religions.push(r1)
    return r1;
}


function createPrimitiveCulture() {
    let c1 = {}
    c1.heritage = `heritage_${hist.heritages}_seed`
    hist.heritages += 1
    c1.martial_custom = "martial_custom_equal" //patriarchy emerged around time of agricultural surplus - so says google
    c1.ethos = "ethos_bellicose" //do we want this to always be bellicose to start?
    c1.traditions = []; //set based on location and/or history
    c1.language = createLanguage()
    c1.name = translate(c1.language, "People")
    c1.name = capitalize(romanizeText(c1.name))
    c1.id = rando()
    c1.name_list = `name_list_${c1.id}`
    c1.language.name = `language_${rando()}`
    c1.color = `0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)}`
    c1.created = `${hist.year}.${hist.month}.${hist.day}`
    c1.provinces = []
    seedNames(c1)

    c1.genes = {}
    c1.genes.gene_height = {
        low: 0.01,
        high: 0.1
    }
    c1.genes.gene_bs_body_shape = "body_shape_average"
    c1.genes.gene_bs_head_height = {
        low: 0.1,
        high: 0.15
    }
    c1.genes.gene_bs_head_profile = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.gene_head_top_height = {
        low: 0.1,
        high: 0.15
    }
    
    c1.genes.gene_head_top_width = {
        low: 0.1,
        high: 0.15
    }
    //head top height and width?
    c1.genes.gene_head_width = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.gene_neck_length = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.gene_neck_width = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.complexion = "complexion_1"

    c1.genes.gene_bs_ear_angle = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.gene_bs_ear_bend = {
        low: 0.45,
        high: 0.55
    },

    c1.genes.gene_bs_ear_outward = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.gene_bs_ear_size = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.face_detail_cheek_def = "cheek_def_02"

    c1.genes.face_detail_cheek_fat = "cheek_fat_03_pos"

    c1.genes.gene_bs_cheek_forward = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_cheek_height = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_cheek_width = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.face_detail_chin_def = "chin_def_neg"

    c1.genes.gene_chin_forward = {
        low: 0.5,
        high: 0.55
    }

    c1.genes.gene_chin_height = {
        low: 0.5,
        high: 0.55
    }

    c1.genes.gene_chin_width = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_forehead_angle = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_forehead_brow_curve = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.gene_bs_forehead_brow_forward = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_forehead_brow_height = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_forehead_brow_inner_height = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_forehead_brow_outer_height = {
        low: 0.45,
        high: 0.45
    }

    c1.genes.gene_bs_forehead_brow_width = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_forehead_height = {
        low: 0.35,
        high: 0.45,
    }

    c1.genes.gene_forehead_roundness = {
        low: 0.9,
        high: 0.99
    }

    //forehead width??

    c1.genes.gene_jaw_angle = {
        low: 0.6, 
        high: 0.7
    }

    c1.genes.gene_bs_jaw_def = {
        low: 0.4,
        high: 0.6
    }

    c1.genes.gene_jaw_forward = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_jaw_height = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_jaw_width = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.face_detail_temple_def = {
        low: 0.55,
        high: 0.66
    }

    c1.genes.gene_eye_angle = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_eye_corner_depth = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_eye_depth = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_eye_distance = {
        low: 0.45, high: 0.55
    }

    c1.genes.gene_eye_fold_shape = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.gene_eye_height = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_eye_size = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.face_detail_eye_socket = "eye_socket_color_03"

    c1.genes.gene_bs_eye_upper_lid_size = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_eyebrows_fullness = "layer_2_high_thickness"

    c1.genes.gene_eyebrows_shape = "close_spacing_high_thickness"

    c1.genes.face_detail_eye_lower_lid_def = "eye_lower_lid_def"

    c1.genes.gene_eye_shut = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.face_detail_nasolabial = "nasolabial_01"

    c1.genes.gene_bs_nose_forward = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.gene_bs_nose_height = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_nose_length = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_nose_profile = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_nose_ridge_angle = {
        low: 0.45,
        high: 0.55,
    }

    c1.genes.face_detail_nose_ridge_def = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_nose_ridge_width = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_nose_size = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.face_detail_nose_tip_def = "nose_tip_def"

    c1.genes.gene_bs_nose_tip_angle = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_nose_tip_forward = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_nose_tip_width = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_nose_nostril_height = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_nose_nostril_width = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_mouth_lower_lip_def = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_mouth_lower_lip_full = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_mouth_lower_lip_pad = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_mouth_lower_lip_size = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_mouth_corner_depth = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_mouth_corner_height = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.gene_mouth_forward = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_mouth_open = {
        low: 0.49,
        high: 0.51
    }

    c1.genes.gene_bs_mouth_philtrum_def = {
        low: 0.1,
        high: 0.15
    }

    c1.genes.gene_bs_mouth_philtrum_shape = {
        low: 0.45,
        high: 0.55
    }

    c1.genes.gene_bs_mouth_philtrum_width = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_mouth_upper_lip_def = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_mouth_upper_lip_full = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_bs_mouth_upper_lip_pad = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.gene_mouth_upper_lip_size = {
        low: 0.9,
        high: 0.99
    }

    c1.genes.hair = {
        chances: [
            //black
            {
                chance: 100,
                lowX: 0.01,
                lowY: 0.9,
                highX: 0.5,
                highY: 0.99 
            }
        ]
    }

    c1.genes.eyes = {
        chances: [
            //black
            {
                chance: 100,
                lowX: 0.05,
                lowY: 0.95,
                highX: 0.35,
                highY: 1.0
            }
        ]
    }

    c1.genes.skin = {
        chances: [
            {
                chance: 100,
                lowX: 0.1,
                lowY: 0.95,
                highX: 0.3,
                highY: 0.99
            }
        ]
    }

    c1.clothing_gfx = "african_clothing_gfx"
    c1.building_gfx = "african_building_gfx mena_building_gfx"
    c1.unit_gfx = "sub_saharan_unit_gfx"
    c1.coa_gfx = "central_african_group_coa_gfx"
    hist.cultures.push(c1)
    return c1;
}


