/*
Note that doctrines that allow more than one pick can not be defined on a religion level, as there's no obvious override system that would work then. Doctrines cannot be defined after the faiths section. 
*/

function religionGenerator() {
    for (let i = 0; i < world.empires.length; i++) {
        let empire = world.empires[i]
        createReligion(empire);
    }
}

function religionOutputter() {
    let t = `${daBom}`
    let loc = `${daBom}l_english:\n`
    let holySites = `${daBom}`
    for (let i = 0; i < world.religions.length; i++) {
        let r = world.religions[i]
        t += `${r.name} = {\n`
        t += `  family = rf_pagan\n`
        t += `  doctrine = ${r.hostility_doctrine}\n`
        t += `  pagan_roots = yes\n`
        for (let n = 0; n < r.doctrines.length; n++) {
            t += `  doctrine = ${r.doctrines[n]}\n`
        }
        let good = getRandomInt(0, 1);
        let bad;
        if (good === 0) {
            bad = 1;
        } else {
            bad = 0
        }
        t += `  traits = {\n`
        t += `    virtues = {\n`
        for (let n = 0; n < r.virtueSins.length; n++) {
            t += `      ${r.virtueSins[n][good]}\n`;
        }
        t += `    }\n`
        t += `    sins = {\n`
        for (let n = 0; n < r.virtueSins.length; n++) {
            t += `      ${r.virtueSins[n][bad]}\n`
        }
        t += `    }\n`
        t += `  }\n`
        t += `  custom_faith_icons = {\n`
        t += `    ${r.custom_faith_icons}\n`
        t += `  }\n`
        t += `  holy_order_names = {\n`
        t += `    { name = "holy_order_guardians_of_divinerealm" }\n`
        t += `    { name = "holy_order_faithful_of_highgod" }\n`
        t += `    { name = "holy_order_warriors_of_the_symbol" }\n`
        t += `  }\n`
        t += `  holy_order_maa = { ${r.holy_order_maa} }\n`
        t += `${generateReligionLocalizationBlock(r)}\n`
        t += `  faiths = {\n`
        for (let n = 0; n < r.faiths.length; n++) {
            let f = r.faiths[n]
            loc += `  ${f.name}: "${f.nameLoc}"\n`
            loc += `  ${f.name}_adj: "${f.nameLoc}"\n`
            loc += `  ${f.name}_adherent: "${f.nameLoc}"\n`
            loc += `  ${f.name}_adherent_plural: "${f.nameLoc}"\n`
            loc += `  ${f.oldName}: "${f.oldNameLoc}"\n`
            loc += `  ${f.oldNameAdj}: "${f.oldNameAdjLoc}"\n`
            t += `    ${f.name} = {\n`
            t += `      color = { ${f.color} }\n`
            if (f.icon) {
                t += `      icon = ${f.icon}\n`
                t += `      reformed_icon = ${f.reformed_icon}\n`
            }
            for (let z = 0; z < f.holySites.length; z++) {
                let hsIndex = f.holySites[z];
                let prov = world.provinces[hsIndex]
                t += `      holy_site = ${prov.titleName}\n`
                holySites += `${prov.titleName} = {\n`
                holySites += `  county = c_${prov.county.titleName}\n`
                holySites += `  barony = b_${prov.titleName}\n`
                holySites += `}\n`
                loc += `  ${prov.titleName}: "${prov.localizedTitle}"\n`
                loc += `  holy_site_${prov.titleName}: "${prov.localizedTitle}"\n`
            }
            for (let z = 0; z < f.doctrines.length; z++) {
                t += `      doctrine = ${f.doctrines[z]}\n`
            }
            t += `    }\n`
        }
        t += `  }\n`
        t += `}\n`
        loc += generateReligionLocalization(r)
    }
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="religion-download-link" download="gen_religions.txt" href="">Download religions</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`religion-download-link`).href = url
    document.getElementById(`religion-download-link`).click()

    var data2 = new Blob([loc], {type: 'text/yaml'})
    var url2 = window.URL.createObjectURL(data2);
    let link2 = `<a id="gen_religion_loc_link" download="gen_religions_l_english.yml" href="">Download Generated Religion Localization</a><br>`
    document.getElementById("download-links").innerHTML += `${link2}`;
    document.getElementById(`gen_religion_loc_link`).href = url2
    document.getElementById(`gen_religion_loc_link`).click();

    var data3 = new Blob([holySites], {type: 'text/plain'})
    var url3 = window.URL.createObjectURL(data3);
    let link3 = `<a id="holy_sites_download_link" download="gen_holy_sites.txt" href="">Download Holy Sites</a><br>`
    document.getElementById("download-links").innerHTML += `${link3}`;
    document.getElementById(`holy_sites_download_link`).href = url3
    document.getElementById(`holy_sites_download_link`).click()
}

let virtueSinPairs = [
    ["brave", "craven"],
    ["calm", "wrathful"],
    ["chaste", "lustful"],
    ["content", "ambitious"],
    ["diligent", "lazy"],
    ["forgiving", "vengeful"],
    ["generous", "greedy"],
    ["gregarious", "shy"],
    ["honest", "deceitful"],
    ["humble", "arrogant"],
    ["just", "arbitrary"],
    ["patient", "impatient"],
    ["temperate", "gluttonous"],
    ["trusting", "paranoid"],
    ["zealous", "cynical"],
    ["compassionate", "callous"],
    ["compassionate", "sadistic"],
    ["fickle", "stubborn"]
]

let faithIcons = [
    ["achamanism","achamanism_reformed"],
    ["adamites","adamites"],
    ["advaitism","advaitism"],
    ["afridunism","afridunism"],
    ["akanism","akanism_reformed"],
    ["alawite","alawite"],
    ["alevi","alevi"],
    ["ari_buddhism","ari_buddhism"],
    ["armenian","armenian"],
    ["ashari","ashari"],
    ["azariqa","azariqa"],
    ["baltic","baltic_reformed"],
    ["bon","bon"],
    ["bosnian_church","bosnian_church"],
    ["buddhism","buddhism"],
    ["cainitism","cainitism"],
    ["catholic","catholic"],
    ["christianity_Armenian","christianity_Armenian"],
    ["christianity_bogomilist","christianity_bogomilist"],
    ["christianity_cathar","christianity_cathar"],
    ["christianity_Iconoclasm","christianity_Iconoclasm"],
    ["christianity_lollard","christianity_lollard"],
    ["christianity_messalian","christianity_messalian"],
    ["christianity_paulicanism","christianity_paulicanism"],
    ["christianity_waldensian","christianity_waldensian"],
    ["conversos","conversos"],
    ["coptic","coptic"],
    ["default","default"],
    ["donyipoloism","donyipoloism_reformed"],
    ["dualism","dualism"],
    ["exp_ari_buddhism","exp_ari_buddhism"],
    ["finno_ugric","finno_ugric_reformed"],
    ["fp2_adoptionist","fp2_adoptionist"],
    ["fp2_basque","fp2_basque_reformed"],
    ["fp2_mozarabic","fp2_mozarabic"],
    ["gayomarthianism","gayomarthianism"],
    ["germanic","germanic_reformed"],
    ["ghulat","ghulat"],
    ["hellenic","hellenic_reformed"],
    ["hinduism","hinduism"],
    ["hinduism_saura","hinduism_saura"],
    ["iamaism_buddhism","iamaism_buddhism"],
    ["ibadi","ibadi"],
    ["icon_religion_catholicism","icon_religion_catholicism"],
    ["imami","imami"],
    ["insular_celtic","insular_celtic"],
    ["islam_druze","islam_druze"],
    ["jainism","jainism"],
    ["judaism","judaism"],
    ["kabarism","kabarism"],
    ["kalikula_shaktism","kalikula_shaktism"],
    ["karaism","karaism"],
    ["khurmazta","khurmazta"],
    ["khurramism","khurramism"],
    ["kiratism","kiratism_reformed"],
    ["kitebacilweism","kitebacilweism"],
    ["krishnaism","krishnaism"],
    ["kushism","kushism_reformed"],
    ["lamaism_buddhism","lamaism_buddhism"],
    ["mahayana","mahayana"],
    ["malabarism","malabarism"],
    ["mande","mande_reformed"],
    ["manichean","manichean"],
    ["masmudi","masmudi"],
    ["maturidi","maturidi"],
    ["mazdakism","mazdakism"],
    ["melieism","melieism_reformed"],
    ["merkabah","merkabah"],
    ["meshefaresism","meshefaresism"],
    ["miaphysite","miaphysite"],
    ["muhakkima","muhakkima"],
    ["muhakkima_1","muhakkima_1"],
    ["muhakkima_2","muhakkima_2"],
    ["muhakkima_3","muhakkima_3"],
    ["muhakkima_4","muhakkima_4"],
    ["muhakkima_5","muhakkima_5"],
    ["muhakkima_6","muhakkima_6"],
    ["mutazila","mutazila"],
    ["muwalladi","muwalladi"],
    ["nadjat","nadjat"],
    ["nestorian","nestorian"],
    ["nizari","nizari"],
    ["orthodox","orthodox"],
    ["pagan","pagan"],
    ["pagan_default","pagan_default"],
    ["pagan_magyar","pagan_magyar_reformed"],
    ["priscillianism","priscillianism"],
    ["qarmatian","qarmatian"],
    ["quanzhen","quanzhen"],
    ["quranism","quranism"],
    ["quranist","quranist"],
    ["rabbinism","rabbinism"],
    ["rrmeaism","rrmeaism_reformed"],
    ["sabianism","sabianism"],
    ["samaritan","samaritan"],
    ["sedism","sedism_reformed"],
    ["sethianism","sethianism"],
    ["shaivism","shaivism"],
    ["shangqing","shangqing"],
    ["shia","shia"],
    ["siberian","siberian_reformed"],
    ["slavic","slavic_reformed"],
    ["smartism","smartism"],
    ["spidy","spidy_reformed"],
    ["spirit_bon","spirit_bon"],
    ["srikula_shaktism","srikula_shaktism"],
    ["sufri","sufri"],
    ["sunni","sunni"],
    ["svetambara","svetambara"],
    ["taoism","taoism"],
    ["tengri","tengri_reformed"],
    ["unselected","unselected"],
    ["urartuism","urartuism"],
    ["vajrayana","vajrayana"],
    ["valentinianism","valentinianism"],
    ["waaqism","waaqism_reformed"],
    ["west_african","west_african"],
    ["west_african_bori","west_african_bori_reformed"],
    ["west_african_dogon","west_african_reformed"],
    ["west_african_roog_sene","west_african_roog_sene_reformed"],
    ["yapaniya","yapaniya"],
    ["yazidism","yazidism"],
    ["yoruba","yoruba_reformed"],
    ["yumaism","yumaism_reformed"],
    ["zayidi","zayidi"],
    ["zoroastrian","zoroastrian"],
    ["zunist","zunist_reformed"]
]

let faithTenets = [
    "tenet_adorcism",
    "tenet_ritual_celebrations",
    "tenet_ancestor_worship",
    "tenet_sacred_childbirth",
    "tenet_sanctity_of_nature",
    "tenet_cthonic_redoubts",
    "tenet_communal_identity",
    "tenet_sky_burials",
    "tenet_monasticism",
    "tenet_human_sacrifice",
    "tenet_esotericism",
    "tenet_literalism",
    "tenet_mendicant_preachers",
    "tenet_asceticism",
    "tenet_ritual_hospitality",
    "tenet_ritual_celebrations",
    "tenet_communal_identity",
    "tenet_communion",
    "tenet_armed_pilgrimages",
    "tenet_monasticism",
    "tenet_aniconism",
    "tenet_reincarnation",
    "tenet_pacifism",
    "tenet_gnosticism",
    "tenet_vows_of_poverty",
    "tenet_pentarchy",
    "tenet_divine_marriage",
    "tenet_carnal_exaltation",
    "tenet_natural_primitivism",
    "tenet_rite",
    "tenet_adaptive",
    "tenet_religious_legal_pronouncements",
    "tenet_inner_journey",
    "tenet_legalism",
    "tenet_hedonistic",
    "tenet_warmonger",
    "tenet_gruesome_festivals",
    "tenet_astrology",
    "tenet_struggle_submission",
    "tenet_false_conversion_sanction",
    "tenet_unrelenting_faith",
    "tenet_unreformed_syncretism",
    "tenet_communal_possessions",
]

let faithMAAS = [
    "horn_warrior",
    "metsanvartija",
    "mountaineer",
    "khandayat",
    "teutonic_knights",
    "mubarizun",
    "jomsviking_pirates",
    "praetorian",
    "war_elephant",
    "cataphract",
    "khandayat",
    "shomer",
    "horn_warrior",
    "horse_archers",
    "bush_hunter",
]

function createReligion(empire) {
    let r = {};
    //r.empire = empire;
    //empire.religion = r;
    r.name = `${rando()}_religion`;
    r.isPagan = "yes"
    r.graphical_faith = "pagan_gfx"
    r.piety_icon_group = "pagan"
    r.doctrine_background_icon = "core_tenet_banner_pagan.dds"
    r.hostility_doctrine = "pagan_hostility_doctrine"
    r.doctrines = []
    r.doctrines.push(pickFrom(faithHeads))
    r.doctrines.push(pickFrom(faithGendered))
    r.doctrines.push(pickFrom(faithPluralism))
    r.doctrines.push(pickFrom(faithTheocracy))
    r.doctrines.push(pickFrom(faithConcubines))
    r.doctrines.push(pickFrom(faithDivorce))
    r.doctrines.push(pickFrom(faithConsan))
    r.doctrines.push(pickFrom(faithHomosexuality))
    r.doctrines.push(pickFrom(faithAdulteryMen))
    r.doctrines.push(pickFrom(faithAdulteryWomen))
    r.doctrines.push(pickFrom(faithKinslaying))
    r.doctrines.push(pickFrom(faithDeviancy))
    r.doctrines.push(pickFrom(faithWitchcraft))
    r.doctrines.push(pickFrom(faithClerical1))
    r.doctrines.push(pickFrom(faithClerical2))
    r.doctrines.push(pickFrom(faithClerical3))
    r.doctrines.push(pickFrom(faithClerical4))
    r.doctrines.push(pickFrom(faithPilgrimages))
    r.doctrines.push(pickFrom(funeralDoctrines))
    r.virtueSins = []
    pickUniqFromWithoutDelete(virtueSinPairs, r.virtueSins)
    pickUniqFromWithoutDelete(virtueSinPairs, r.virtueSins)
    pickUniqFromWithoutDelete(virtueSinPairs, r.virtueSins)
    r.custom_faith_icons = `custom_faith_1 custom_faith_2 custom_faith_3 custom_faith_4 custom_faith_5 custom_faith_6 custom_faith_7 custom_faith_8 custom_faith_9 custom_faith_10 dualism_custom_1 zoroastrian_custom_1 zoroastrian_custom_2 buddhism_custom_1 buddhism_custom_2 buddhism_custom_3 buddhism_custom_4 taoism_custom_1 yazidi_custom_1 sunni_custom_2 sunni_custom_3 sunni_custom_4 muhakkima_1 muhakkima_2 muhakkima_4 muhakkima_5 muhakkima_6 judaism_custom_1 custom_faith_fp1_fenrir custom_faith_fp1_irminsul custom_faith_fp1_jormungandr custom_faith_fp1_odins_ravens custom_faith_fp1_runestone_moon custom_faith_fp1_thors_hammer custom_faith_fp1_valknut custom_faith_fp1_yggdrasil custom_faith_boromian_circles custom_faith_lotus custom_faith_aum_tibetan custom_faith_pentagram custom_faith_pentagram_inverted custom_faith_burning_bush custom_faith_allah custom_faith_gankyil custom_faith_eye_of_providence custom_faith_dove custom_faith_ichthys custom_faith_lamb custom_faith_black_sheep custom_faith_ankh custom_faith_chi_rho custom_faith_hamsa custom_faith_cool_s`
    r.holy_order_names = [
        "PLACEHOLDER",
        "PLACEHOLDER"
    ]
    r.holy_order_maa = pickFrom(faithMAAS)
    r.faiths = [];
    for (let n = 0; n < empire.kingdoms.length; n++) {
        //create faiths
        let kingdom = empire.kingdoms[n]
        let language = kingdom.culture.language;
        let f = {};
        kingdom.faith = f;
        f.language = language
        let faithIcon = pickFrom(faithIcons);
        f.icon = faithIcon[0]
        f.reformed_icon = faithIcon[1]
        f.color = `0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)}`
        if (n === 0) {
            let old = capitalize(translate(language, "Old"))
            r.nameLoc = capitalize(translate(language, "Religionity"))
            //r.nameLoc = generateNamesBasedOnBigram(religionNamesList, 1)[0]
            r.oldName = `${r.name}_old`;
            r.oldNameAdj = `${r.name}_old_adj`;
            r.oldNameLoc = `${old} ${r.nameLoc}`
            r.oldNameAdjLoc = `${old} ${r.nameLoc}`
            r.language = language
        }
        f.name = `${rando()}_religion`;
        
        
        //f.nameLoc = generateNamesBasedOnBigram(religionNamesList, 1)[0]
        f.nameLoc = capitalize(translate(language, "Faithism"))
        let fOld = capitalize(translate(language, "Old"))

        f.oldName = `${f.name}_old`
        f.oldNameLoc = `${fOld} ${f.nameLoc}`

        f.oldNameAdj = `${f.name}_old_adj`
        f.oldNameAdjLoc = `${fOld} ${f.nameLoc}`
        
        
        f.doctrines = [
            "unreformed_faith_doctrine"
        ]
        pickUniqFromWithoutDelete(faithTenets, f.doctrines);
        pickUniqFromWithoutDelete(faithTenets, f.doctrines);
        pickUniqFromWithoutDelete(faithTenets, f.doctrines);
        f.holySites = [];
        for (let i = 0; i < 6; i++) {
            pickUniqOrDiscard(empire.ownProvinces, f.holySites)
        }
        r.faiths.push(f)
    }
    world.religions.push(r)
}

/*DOCTRINES*/

//main group

let faithHeads = [
    "doctrine_no_head",
    "doctrine_spiritual_head",
    "doctrine_temporal_head"
]

let faithGendered = [
    "doctrine_gender_male_dominated",
    "doctrine_gender_female_dominated",
    "doctrine_gender_equal"
]

let faithPluralism = [
    "doctrine_pluralism_righteous",
    "doctrine_pluralism_pluralistic",
    "doctrine_pluralism_fundamentalist"
]

let faithTheocracy = [
    "doctrine_theocracy_temporal",
    "doctrine_theocracy_lay_clergy",
]

//marriage

let faithConcubines = [
    "doctrine_concubines",
    "doctrine_polygamy",
    "doctrine_monogamy"
]

let faithDivorce = [
    "doctrine_divorce_allowed",
    "doctrine_divorce_disallowed"
]

let faithBastardry = [
    "doctrine_bastardry_legitimization",
    "doctrine_bastardry_none"
]

let faithConsan = [
    "doctrine_consanguinity_cousins",
    "doctrine_consanguinity_aunt_nephew_and_uncle_niece",
    "doctrine_consanguinity_restricted",
    "doctrine_consanguinity_unrestricted"
]

//crimes

let faithHomosexuality = [
    "doctrine_homosexuality_accepted",
    "doctrine_homosexuality_shunned",
    "doctrine_homosexuality_crime"
]

let faithAdulteryMen = [
    "doctrine_adultery_men_accepted",
    "doctrine_adultery_men_shunned",
    "doctrine_adultery_men_crime"
]

let faithAdulteryWomen = [
    "doctrine_adultery_women_accepted",
    "doctrine_adultery_women_shunned",
    "doctrine_adultery_women_crime"
]

let faithKinslaying = [
    "doctrine_kinslaying_close_kin_accepted",
    "doctrine_kinslaying_close_kin_shunned",
    "doctrine_kinslaying_close_kin_crime"
]

let faithDeviancy = [
    "doctrine_deviancy_accepted",
    "doctrine_deviancy_shunned",
    "doctrine_deviancy_crime"
]

let faithWitchcraft = [
    "doctrine_witchcraft_accepted",
    "doctrine_witchcraft_shunned",
    "doctrine_witchcraft_crime"
]

//CLERICAL FUNCTIONS

let faithClerical1 = [
    "doctrine_clerical_function_recruitment",
    "doctrine_clerical_function_taxation",
    "doctrine_clerical_function_alms_and_pacification"
]

let faithClerical2 = [
    "doctrine_clerical_gender_either",
    "doctrine_clerical_gender_male_only",
    "doctrine_clerical_gender_female_only"
]

let faithClerical3 = [
    "doctrine_clerical_marriage_allowed",
    "doctrine_clerical_marriage_disallowed"
]

let faithClerical4 = [
    "doctrine_clerical_succession_temporal_appointment",
    "doctrine_clerical_succession_temporal_fixed_appointment",
    "doctrine_clerical_succession_spiritual_fixed_appointment",
    "doctrine_clerical_succession_spiritual_appointment"
]

//Pilgrimages 

let faithPilgrimages = [
    "doctrine_pilgrimage_encouraged",
    "doctrine_pilgrimage_forbidden"
]

//funerals 

let funeralDoctrines = [
    "doctrine_funeral_sky_burial",
    "doctrine_funeral_cremation",
    "doctrine_funeral_bewailment",
    "doctrine_funeral_stoic",
    "doctrine_funeral_mummification"
]

function generateReligionLocalizationBlock(r) {
    let t = ``
    t += `
    localization = {
        HighGodName = ${r.name}_high_god_name
        HighGodName2 = ${r.name}_high_god_name_2
        HighGodNamePossessive = ${r.name}_high_god_name_possessive
        HighGodNameSheHe = CHARACTER_SHEHE_HE
        HighGodHerselfHimself = CHARACTER_HIMSELF
        HighGodHerHis = CHARACTER_HERHIS_HIS
        HighGodNameAlternate = ${r.name}_high_god_name_alternate
        HighGodNameAlternatePossessive = ${r.name}_high_god_name_alternate_possessive

        #Creator
        CreatorName = ${r.name}_high_god_name
        CreatorNamePossessive = ${r.name}_high_god_name_possessive
        CreatorSheHe = CHARACTER_SHEHE_HE
        CreatorHerHis = CHARACTER_HERHIS_HIS
        CreatorHerHim = CHARACTER_HERHIM_HIM

        #HealthGod
        HealthGodName = ${r.name}_health_god_name
        HealthGodNamePossessive = ${r.name}_health_god_name_possessive
        HealthGodSheHe = CHARACTER_SHEHE_HE
        HealthGodHerHis = CHARACTER_HERHIS_HIS
        HealthGodHerHim = CHARACTER_HERHIM_HIM

        #FertilityGod
        FertilityGodName = ${r.name}_fertility_god_name
        FertilityGodNamePossessive = ${r.name}_fertility_god_name_possessive
        FertilityGodSheHe = CHARACTER_SHEHE_SHE
        FertilityGodHerHis = CHARACTER_HERHIS_HER
        FertilityGodHerHim = CHARACTER_HERHIM_HER

        #WealthGod
        WealthGodName = ${r.name}_wealth_god_name
        WealthGodNamePossessive = ${r.name}_wealth_god_name_possessive
        WealthGodSheHe = CHARACTER_SHEHE_SHE
        WealthGodHerHis = CHARACTER_HERHIS_HER
        WealthGodHerHim = CHARACTER_HERHIM_HER

        #HouseholdGod
        HouseholdGodName = ${r.name}_wealth_god_name
        HouseholdGodNamePossessive = ${r.name}_wealth_god_name_possessive
        HouseholdGodSheHe = CHARACTER_SHEHE_SHE
        HouseholdGodHerHis = CHARACTER_HERHIS_HER
        HouseholdGodHerHim = CHARACTER_HERHIM_HER

        #FateGod
        FateGodName = ${r.name}_high_god_name
        FateGodNamePossessive = ${r.name}_high_god_name_possessive
        FateGodSheHe = CHARACTER_SHEHE_HE
        FateGodHerHis = CHARACTER_HERHIS_HIS
        FateGodHerHim = CHARACTER_HERHIM_HIM

        #KnowledgeGod
        KnowledgeGodName = ${r.name}_knowledge_god_name
        KnowledgeGodNamePossessive = ${r.name}_knowledge_god_name_possessive
        KnowledgeGodSheHe = CHARACTER_SHEHE_HE
        KnowledgeGodHerHis = CHARACTER_HERHIS_HIS
        KnowledgeGodHerHim = CHARACTER_HERHIM_HIM

        #WarGod
        WarGodName = ${r.name}_war_god_name
        WarGodNamePossessive = ${r.name}_war_god_name_possessive
        WarGodSheHe = CHARACTER_SHEHE_HE
        WarGodHerHis = CHARACTER_HERHIS_HIS
        WarGodHerHim = CHARACTER_HERHIM_HIM

        #TricksterGod
        TricksterGodName = ${r.name}_knowledge_god_name
        TricksterGodNamePossessive = ${r.name}_knowledge_god_name_possessive
        TricksterGodSheHe = CHARACTER_SHEHE_HE
        TricksterGodHerHis = CHARACTER_HERHIS_HIS
        TricksterGodHerHim = CHARACTER_HERHIM_HIM

        #NightGod
        NightGodName = ${r.name}_night_god_name
        NightGodNamePossessive = ${r.name}_night_god_name_possessive
        NightGodSheHe = CHARACTER_SHEHE_SHE
        NightGodHerHis = CHARACTER_HERHIS_HER
        NightGodHerHim = CHARACTER_HERHIM_HER

        #WaterGod
        WaterGodName = ${r.name}_water_god_name
        WaterGodNamePossessive = ${r.name}_water_god_name_possessive
        WaterGodSheHe = CHARACTER_SHEHE_IT
        WaterGodHerHis = CHARACTER_HERHIS_ITS
        WaterGodHerHim = CHARACTER_HERHIM_IT


        PantheonTerm = ${r.name}_the_abosom
        PantheonTerm2 = ${r.name}_the_abosom_2
        PantheonTerm3 = ${r.name}_the_abosom_3
        PantheonTermHasHave = pantheon_term_have
        GoodGodNames = { ${r.name}_high_god_name ${r.name}_high_god_name_alternate ${r.name}_health_god_name ${r.name}_knowledge_god_name ${r.name}_the_nsamanfo }
        DevilName = ${r.name}_evil_god_decay
        DevilNamePossessive = ${r.name}_evil_god_decay_possessive
        DevilSheHe = CHARACTER_SHEHE_IT
        DevilHerHis = CHARACTER_HERHIS_ITS
        DevilHerselfHimself = CHARACTER_ITSELF
        EvilGodNames = { ${r.name}_evil_god_decay ${r.name}_evil_god_drought ${r.name}_devil_name }
        HouseOfWorship = ${r.name}_house_of_worship
        HouseOfWorship2 = ${r.name}_house_of_worship_2
        HouseOfWorship3 = ${r.name}_house_of_worship_3
        HouseOfWorshipPlural = ${r.name}_house_of_worship_plural
        ReligiousSymbol = ${r.name}_religious_symbol
        ReligiousSymbol2 = ${r.name}_religious_symbol_2
        ReligiousSymbol3 = ${r.name}_religious_symbol_3
        ReligiousText = ${r.name}_religious_text
        ReligiousText2 = ${r.name}_religious_text_2
        ReligiousText3 = ${r.name}_religious_text_3
        ReligiousHeadName = ${r.name}_religious_head
        ReligiousHeadTitleName = ${r.name}_religious_head_title_name
        DevoteeMale = ${r.name}_devotee_male
        DevoteeMalePlural = ${r.name}_devotee_male_plural
        DevoteeFemale = ${r.name}_devotee_female
        DevoteeFemalePlural = ${r.name}_devotee_female_plural
        DevoteeNeuter = ${r.name}_devotee
        DevoteeNeuterPlural = ${r.name}_devotee_plural
        PriestMale = ${r.name}_priest_male
        PriestMalePlural = ${r.name}_priest__male_plural
        PriestFemale = ${r.name}_priest_female
        PriestFemalePlural = ${r.name}_priest_female_plural
        PriestNeuter = ${r.name}_priest
        PriestNeuterPlural = ${r.name}_priest_plural
        AltPriestTermPlural = ${r.name}_priest_plural
        BishopMale = ${r.name}_high_priest_male
        BishopMalePlural = ${r.name}_high_priest_male_plural
        BishopFemale = ${r.name}_high_priest_female
        BishopFemalePlural = ${r.name}_high_priest_female_plural
        BishopNeuter = ${r.name}_high_priest
        BishopNeuterPlural = ${r.name}_high_priest_plural
        DivineRealm = ${r.name}_divine_realm
        DivineRealm2 = ${r.name}_divine_realm_2
        DivineRealm3 = ${r.name}_divine_realm_3
        PositiveAfterLife = ${r.name}_positive_afterlife
        PositiveAfterLife2 = ${r.name}_positive_afterlife_2
        PositiveAfterLife3 = ${r.name}_positive_afterlife_3
        NegativeAfterLife = ${r.name}_negative_afterlife
        NegativeAfterLife2 = ${r.name}_negative_afterlife_2
        NegativeAfterLife3 = ${r.name}_negative_afterlife_3
        DeathDeityName = ${r.name}_death_deity_name
        DeathDeityNamePossessive = ${r.name}_death_deity_name_possessive
        DeathDeitySheHe = CHARACTER_SHEHE_IT
        DeathDeityHerHis = CHARACTER_HERHIS_ITS
        WitchGodName = ${r.name}_night_god_name
        WitchGodNamePossessive = ${r.name}_night_god_name_possessive
        WitchGodHerHis = CHARACTER_HERHIS_HER
        WitchGodSheHe = CHARACTER_SHEHE_SHE
        WitchGodHerHim = CHARACTER_HERHIM_HER
        WitchGodMistressMaster = mistress
        WitchGodMotherFather = mother

        GHWName = ghw_great_holy_war
        GHWNamePlural = ghw_great_holy_wars
    }\n	    
    `
    return t;
}

function generateReligionLocalization(r) {
    let t = ""
    let language = r.language;
    let highgod = capitalize(translate(language, "highgod"))
    let devil = capitalize(translate(language, "devil"))
    let death = capitalize(translate(language, "death"))
    let temple = capitalize(translate(language, "temple"))
    let holyBook = capitalize(translate(language, "holybook"))
    let pope = capitalize(translate(language, "pope"))
    let popeland = `${pope}` + translate(language, "land")
    let devotee = translate(language, "devotee")
    let mal = translate(language, "mal")
    let fem = translate(language, "fem")
    let priest = translate(language, "priest")
    let bishop = translate(language, "bishop")
    let heaven = translate(language, "heaven")
    let hell = translate(language, "hell")
    let hornedgod = translate(language, "hornedgod")
    let healthgod = capitalize(translate(language, "healthgod"))
    let fertility = capitalize(translate(language, "fertility"))
    let wealth = capitalize(translate(language, "wealth"))
    let household = capitalize(translate(language, "household"))
    let fate = capitalize(translate(language, "fate"))
    let knowledge = capitalize(translate(language, "knowledge"))
    let war = capitalize(translate(language, "war"))
    let trickster = capitalize(translate(language, "trickster"))
    let night = capitalize(translate(language, "night"))
    let water = capitalize(translate(language, "water"))
    let symbol = translate(language, "symbol")
    t += `  ${r.name}_religion: "${r.nameLoc}"
  ${r.oldName}: "${r.oldNameLoc}"
  ${r.oldNameAdj}: "${r.oldNameAdjLoc}"
  ${r.name}_adj: "${r.nameLoc}"
  ${r.name}_adherent: "${r.nameLoc}"
  ${r.name}_adherent_plural: "${r.nameLoc}"
  ${r.name}_desc: "${r.nameLoc}"
  ${r.name}_high_god_name: "${highgod}"
  ${r.name}_high_god_name_2: "${highgod}"
  ${r.name}_high_god_name_3: "${highgod}"
  ${r.name}_high_god_name_possessive: "${highgod}'s"
  ${r.name}_high_god_name_alternate: "${highgod}"
  ${r.name}_high_god_name_alternate_possessive: "${highgod}"
  ${r.name}_good_god_jesus: "${highgod}"
  ${r.name}_good_god_christ: "${highgod}"
  ${r.name}_devil_name: "${devil}"
  ${r.name}_devil_name_possessive: "${devil}'s"
  ${r.name}_evil_god_lucifer: "${devil}"
  ${r.name}_evil_god_beelzebub: "${devil}"
  ${r.name}_evil_god_mephistopheles: "${devil}"
  ${r.name}_death_deity_name: "${death}"
  ${r.name}_death_deity_name_possessive: "${death}'s"
  ${r.name}_house_of_worship: "${temple}"
  ${r.name}_house_of_worship_2: "${temple}"
  ${r.name}_house_of_worship_3: "${temple}"
  ${r.name}_house_of_worship_plural: "${temple}s"
  ${r.name}_religious_symbol: "${symbol} of ${highgod}"
  ${r.name}_religious_symbol_2: "${symbol} of ${highgod}"
  ${r.name}_religious_symbol_3: "${symbol} of ${highgod}"
  ${r.name}_religious_text: "${holyBook}"
  ${r.name}_religious_text_2: "${holyBook}"
  ${r.name}_religious_text_3: "${holyBook}"
  ${r.name}_religious_head: "${pope}"
  ${r.name}_religious_head_title_name: "${popeland}"
  ${r.name}_devotee_male: "${devotee}${mal}"
  ${r.name}_devotee_male_plural: "${devotee}${mal}s"
  ${r.name}_devotee_female: "${devotee}${fem}"
  ${r.name}_devotee_female_plural: "${devotee}${fem}s"
  ${r.name}_devotee_neuter: "${devotee}"
  ${r.name}_devotee_neuter_plural: "${devotee}s"
  ${r.name}_priest: "${priest}"
  ${r.name}_priest_plural: "${priest}s"
  ${r.name}_priest_male: "${priest}${mal}"
  ${r.name}_priest_male_plural: "${priest}${mal}s"
  ${r.name}_priest_female: "${priest}${fem}"
  ${r.name}_priest_female_plural: "${priest}${fem}s"
  ${r.name}_priest_alternate_plural: "${priest}s"
  ${r.name}_bishop: "${bishop}"
  ${r.name}_bishop_plural: "${bishop}s"
  ${r.name}_high_priest_male: "${bishop}${mal}"
  ${r.name}_high_priest_male_plural: "${bishop}${mal}s"
  ${r.name}_high_priest_female: "${bishop}${fem}"
  ${r.name}_high_priest_female_plural: "${bishop}${fem}s"
  ${r.name}_high_priest: "${bishop}"
  ${r.name}_high_priest_plural: "${bishop}s"
  ${r.name}_positive_afterlife: "${heaven}"
  ${r.name}_positive_afterlife_2: "${heaven}"
  ${r.name}_positive_afterlife_3: "${heaven}"
  ${r.name}_negative_afterlife: "${hell}"
  ${r.name}_negative_afterlife_2: "${hell}"
  ${r.name}_negative_afterlife_3: "${hell}"
  ${r.name}_witchgodname_the_horned_god: "${hornedgod}"
  ${r.name}_witchgodname_the_horned_god_possessive: "${hornedgod}"
  ${r.name}_creator_god_name: "${highgod}"
  ${r.name}_creator_god_name_possessive: "${highgod}'s"
  ${r.name}_health_god_name: "${healthgod}"
  ${r.name}_health_god_name_possessive: "${healthgod}'s"
  ${r.name}_fertility_god_name: "${fertility}"
  ${r.name}_fertility_god_name_possessive: "${fertility}'s"
  ${r.name}_wealth_god_name: "${wealth}"
  ${r.name}_wealth_god_name_possessive: "${wealth}'s"
  ${r.name}_household_god_name: "${household}"
  ${r.name}_household_god_name_possessive: "${household}'s"
  ${r.name}_fate_god_name: "${fate}"
  ${r.name}_fate_god_name_possessive: "${fate}'s"
  ${r.name}_knowledge_god_name: "${knowledge}"
  ${r.name}_knowledge_god_name_possessive: "${knowledge}'s"
  ${r.name}_war_god_name: "${war}"
  ${r.name}_war_god_name_possessive: "${war}'s"
  ${r.name}_trickster_god_name: "${trickster}"
  ${r.name}_trickster_god_name_possessive: "${trickster}'s"
  ${r.name}_night_god_name: "${night}"
  ${r.name}_night_god_name_possessive: "${night}'s"
  ${r.name}_water_god_name: "${water}"
  ${r.name}_water_god_name_possessive: "${water}'s"\n`
    return t;
}

