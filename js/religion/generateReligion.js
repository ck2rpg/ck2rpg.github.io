/*
Note that doctrines that allow more than one pick can not be defined on a religion level, as there's no obvious override system that would work then. Doctrines cannot be defined after the faiths section. 
*/

function religionGenerator() {
    // Generate religions based on the religionFamilyLevel setting
    if (settings.religionFamilyLevel === "empire") {
        world.empires.forEach(empire => {
            createReligion(empire, true)
    });
    } else if (settings.religionFamilyLevel === "kingdom") {
        world.empires.forEach(empire => {
            empire.kingdoms.forEach(kingdom => createReligion(kingdom, true));
        });
    } else if (settings.religionFamilyLevel === "duchy") {
        world.empires.forEach(empire => {
            empire.kingdoms.forEach(kingdom => {
                kingdom.duchies.forEach(duchy => createReligion(duchy, true));
            });
        });
    } else if (settings.religionFamilyLevel === "county") {
        world.empires.forEach(empire => {
            empire.kingdoms.forEach(kingdom => {
                kingdom.duchies.forEach(duchy => {
                    duchy.counties.forEach(county => {
                        if (!county.religion) {
                            createReligion(county, true)
                        }
                    });
                });
            });
        });
    }
}

// Global state for religion and faith indexes
let availableReligionIndexes = [];
let availableFaithIndexes = [];
const MAX_RELIGION_INDEX = 43;
const MAX_FAITH_INDEX = 12;

// Initialize/reset available religion indexes
function resetReligionIndexes() {
    availableReligionIndexes = Array.from(
        {length: MAX_RELIGION_INDEX}, 
        (_, i) => i + 1
    );
}

// Initialize/reset available faith indexes
function resetFaithIndexes() {
    availableFaithIndexes = Array.from(
        {length: MAX_FAITH_INDEX}, 
        (_, i) => i + 1
    );
}

// Get next available religion index
function getNextReligionIndex() {
    if (availableReligionIndexes.length === 0) {
        resetReligionIndexes();
    }
    const randomIndex = getRandomInt(0, availableReligionIndexes.length - 1);
    return availableReligionIndexes.splice(randomIndex, 1)[0];
}

// Get next available faith index
function getNextFaithIndex(isFirstFaith) {
    if (availableFaithIndexes.length === 0) {
        resetFaithIndexes();
    }
    
    if (isFirstFaith && availableFaithIndexes.includes(1)) {
        availableFaithIndexes = availableFaithIndexes.filter(i => i !== 1);
        return 1;
    }
    
    const randomIndex = getRandomInt(0, availableFaithIndexes.length - 1);
    return availableFaithIndexes.splice(randomIndex, 1)[0];
}

// Generate custom icons string for religion
function getCustomIconsForReligion(religionIndex) {
    return `rel_fam${religionIndex}_faith1_custom rel_fam${religionIndex}_faith2_custom rel_fam${religionIndex}_faith3_custom rel_fam${religionIndex}_faith4_custom`;
}

// Initialize indexes on script load
resetReligionIndexes();
resetFaithIndexes();

function revampedReligion() {
    
}

function createReligion(entity, genFaiths) {
    let suff = rando()
    let relIndex = getNextReligionIndex();
    let religion = {
        name: `${suff}`,
        isPagan: "yes",
        graphical_faith: "pagan_gfx",
        piety_icon_group: "pagan",
        doctrine_background_icon: "core_tenet_banner_pagan.dds",
        hostility_doctrine: "pagan_hostility_doctrine",
        relIndex: relIndex, // Store for faith generation
        doctrines: [
            pickFrom(faithHeads),
            pickFrom(faithGendered),
            pickFrom(faithPluralism),
            pickFrom(faithTheocracy),
            pickFrom(faithConcubines),
            pickFrom(faithDivorce),
            pickFrom(faithConsan),
            pickFrom(faithHomosexuality),
            pickFrom(faithAdulteryMen),
            pickFrom(faithAdulteryWomen),
            pickFrom(faithKinslaying),
            pickFrom(faithDeviancy),
            pickFrom(faithWitchcraft),
            pickFrom(faithClerical1),
            pickFrom(faithClerical2),
            pickFrom(faithClerical3),
            pickFrom(faithClerical4),
            pickFrom(faithPilgrimages),
            pickFrom(funeralDoctrines)
        ],
        virtueSins: [],
        custom_faith_icons: getCustomIconsForReligion(relIndex),
        holy_order_names: [
            "PLACEHOLDER",
            "PLACEHOLDER"
        ],
        holy_order_maa: pickFrom(faithMAAS),
        faiths: []
    };
    if (entity) {
        if (entity.culture) {
            religion.language = entity.culture.language
        } else {
            religion.language = entity.provinces[0].culture.language
        }
        religion.nameLoc = makeFaithName(religion.language)
        religion.oldName = religion.name + "_religion_old";
        religion.oldNameLoc = `Old ${religion.nameLoc}`
        religion.oldNameAdj = religion.name + "_religion_old_adj";
        religion.oldNameAdjLoc = `Old ${religion.nameLoc}`
        setReligionLocalization(religion)
    } else {
        religion.language = makeLanguage(consSet, vowelSet)
        religion.nameLoc = makeFaithName(religion.language)
        religion.oldName = religion.name + "_religion_old";
        religion.oldNameLoc = `Old ${religion.nameLoc}`
        religion.oldNameAdj = religion.name + "_religion_old_adj";
        religion.oldNameAdjLoc = `Old ${religion.nameLoc}`
        setReligionLocalization(religion)
    }

    pickUniqFromWithoutDelete(virtueSinPairs, religion.virtueSins);
    pickUniqFromWithoutDelete(virtueSinPairs, religion.virtueSins);
    pickUniqFromWithoutDelete(virtueSinPairs, religion.virtueSins);
    if (entity) {
        entity.religion = religion;
    }

    
    world.religions.push(religion);

    // Generate faiths based on divergeFaithLevel
    if (genFaiths) {
        generateFaiths(religion, entity);
    }
    return religion
}

// Generate faiths based on divergeFaithLevel
function generateFaiths(religion, entity) {
    if (entity) {
        const divergeLevel = settings.divergeFaithLevel;

        if (divergeLevel === "empire" && entity.isEmpire) {
            createFaith(religion, entity);
        } else if (divergeLevel === "kingdom") {
            if (entity.isEmpire) {
                entity.kingdoms.forEach(kingdom => createFaith(religion, kingdom));
            } else if (entity.isKingdom) {
                createFaith(religion, entity);
            }
        } else if (divergeLevel === "duchy") {
            if (entity.isEmpire) {
                entity.kingdoms.forEach(kingdom => {
                    kingdom.duchies.forEach(duchy => createFaith(religion, duchy));
                });
            } else if (entity.isKingdom) {
                entity.duchies.forEach(duchy => createFaith(religion, duchy));
            } else if (entity.isDuchy) {
                createFaith(religion, entity);
            }
        } else if (divergeLevel === "county") {
            if (entity.isEmpire) {
                entity.kingdoms.forEach(kingdom => {
                    kingdom.duchies.forEach(duchy => {
                        duchy.counties.forEach(county => {
                            if (!county.faith) {
                                createFaith(religion, county)               
                            }
                        });
                    });
                });
            } else if (entity.isKingdom) {
                entity.duchies.forEach(duchy => {
                    duchy.counties.forEach(county => {
                        if (!county.faith) {
                            createFaith(religion, county)
                        }
                    });
                });
            } else if (entity.isDuchy) {
                entity.counties.forEach(county => {
                    if (!county.faith) {
                        createFaith(religion, county)
                    }
                });
            } else if (entity.isCounty) {
                if (!entity.faith) {
                    createFaith(religion, entity);
                }
            }
        }
    } else {
        createFaith(religion)
    }

}

function assignHolySites() {
    for (let i = 0; i < world.faiths.length; i++) {
        let f = world.faiths[i]
        if (f.holySites && f.holySites[0]) {

        } else {
            f.holySites = []
            let arr = []
            console.log(f.provinces)
            for (let i = 0; i < 6; i++) {
                pickUniqOrDiscard(f.provinces, arr)
            }
            for (let i = 0; i < arr.length; i++) {
                console.log(arr)
                let prov = arr[i]
                f.holySites.push(prov.nonDefID)
            }
        }
    }
}

function createFaith(religion, entity) {
    let faith = {};
    if (entity) {
        faith.language = entity.culture.language;
    } else {
        faith.language = religion.language
    }

    const isFirstFaith = religion.faiths.length === 0;
    const faithIndex = getNextFaithIndex(isFirstFaith);
    
    faith.icon = `rel_fam${religion.relIndex}_faith${faithIndex}`;
    faith.reformed_icon = `rel_fam${religion.relIndex}_faith${faithIndex}`;
    faith.religion = religion;
    faith.color = `0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)} 0.${getRandomInt(1, 9)}`;
    let pref = rando()
    faith.name = `${pref}_faith`;
    faith.nameLoc = makeFaithName(faith.language)
    let fOld = makeRandomWord(faith.language)
    faith.oldName = `${faith.name}_old`;
    faith.oldNameLoc = `${fOld} ${faith.nameLoc}`;
    faith.oldNameAdj = `${faith.name}_old_adj`;
    faith.oldNameAdjLoc = `${fOld} ${faith.nameLoc}`;
    faith.doctrines = ["unreformed_faith_doctrine"];
    pickUniqFromWithoutDelete(faithTenets, faith.doctrines);
    pickUniqFromWithoutDelete(faithTenets, faith.doctrines);
    pickUniqFromWithoutDelete(faithTenets, faith.doctrines);
    faith.holySites = [];
    faith.holy_order_names = religion.holy_order_names
    faith.virtueSins = religion.virtueSins
    faith.localization = religion.localization
    faith.provinces = []
    if (entity) {
        for (let i = 0; i < 6; i++) {
            pickUniqOrDiscard(entity.ownProvinces, faith.holySites);
        }
    }
    religion.faiths.push(faith);
    if (entity) {
        if (!entity.faith) {
            entity.faith = faith
        }

        // Propagate faith property down to province level to track through later reassignments
        if (entity.isKingdom) {
            entity.duchies.forEach(duchy => {
                duchy.faith = faith;
                duchy.counties.forEach(county => {
                    if (!county.faith) {
                        county.faith = faith;
                        county.provinces.forEach(province => {
                            province.faith = faith; // Set faith at province level
                            faith.provinces.push(province)
                        });
                    }
                });
            });
        } else if (entity.isDuchy) {
            entity.counties.forEach(county => {
                if (!county.faith) {
                    county.faith = faith;
                    county.provinces.forEach(province => {
                        province.faith = faith; // Set faith at province level
                        faith.provinces.push(province)
                    });
                }
            });
        } else if (entity.isCounty) {
            if (entity.faith) {

            } else {
                entity.provinces.forEach(province => {
                    province.faith = faith; // Set faith at province level
                    faith.provinces.push(province)
                });
            }
        }
    }
    world.faiths.push(faith)
    return faith
}

function getFaithFromColor(r, g, b) {
    r = parseInt(r);
    g = parseInt(g);
    b = parseInt(b);
    for (let i = 0; i < faithOverrideKeys.length; i++) {
        let colorObj = faithOverrideKeys[i];
        if (colorObj.r === r && colorObj.g === g && colorObj.b === b) {
            return colorObj.faith;
        }
    }
    return null; // Return null if no matching culture is found
}

function assignOverrideFaiths() {
    if (!world.faiths) {
        world.faiths = []
    }
    for (let i = 0; i < world.counties.length; i++) {
        let county = world.counties[i];
        let capital = county.provinces[0];
        let cell = world.smallMap[capital.y][capital.x].bigCell;
        if (cell.faithOverride) {
            let c = getColorObjectFromString(cell.faithOverride)
            let faith = getFaithFromColor(c.r, c.g, c.b);
            if (faith) {
                console.log("GOT ONE!")
                county.faith = faith
                county.religion = county.faith.religion
                for (let i = 0; i < county.provinces.length; i++) {
                    let prov = county.provinces[i]
                    prov.faith = county.faith;
                    prov.religion = county.religion;
                    faith.provinces.push(prov)
                }
            }
        }
    }
}



function faithsSlideDown() {
    console.log(world)
    for (let i = 0; i < world.empires.length; i++) {
        let empire = world.empires[i]
        if (empire.faith) {

        } else {
            empire.faith = empire.provinces[0].faith;
        }
        
        for (let j = 0; j < empire.kingdoms.length; j++) {
            let kingdom = empire.kingdoms[j]
            if (kingdom.faith) {

            } else {
                kingdom.faith = kingdom.provinces[0].faith;
            }
            for (let n = 0; n < kingdom.duchies.length; n++) {
                let duchy = kingdom.duchies[n];
                if (duchy.faith) {

                } else {
                    duchy.faith = duchy.provinces[0].faith;
                }
                for (let z = 0; z < duchy.counties.length; z++) {
                    let county = duchy.counties[z]
                    if (county.faith) {

                    } else {
                        county.faith = county.provinces[0].faith
                    }
                }
            }
        }
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
    "doctrine_kinslaying_shunned",
    "doctrine_kinslaying_accepted",
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
        DeathDeityHerHim = CHARACTER_HERHIM_HER
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
    let highgod = makeCharacterName(language)
    let devil = makeCharacterName(language)
    let death = makeRandomWord(language)
    let temple = makeRandomWord(language)
    let holyBook = makeRandomWord(language)
    let pope = makeRandomWord(language)
    let popeland = `${pope}` + makeRandomWord(language)
    let devotee = makeRandomWord(language)
    let mal = makeRandomWord(language)
    let fem = makeRandomWord(language)
    let priest = makeRandomWord(language)
    let bishop = makeRandomWord(language)
    let heaven = makeRandomWord(language)
    let hell = makeRandomWord(language)
    let hornedgod = makeCharacterName(language)
    let healthgod = makeCharacterName(language)
    let fertility = makeRandomWord(language)
    let wealth = makeRandomWord(language)
    let household = makeRandomWord(language)
    let fate = makeRandomWord(language)
    let knowledge = makeRandomWord(language)
    let war = makeRandomWord(language)
    let trickster = makeCharacterName(language)
    let night = makeRandomWord(language)
    let water = makeRandomWord(language)
    let symbol = makeRandomWord(language)
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
  ${r.name}_evil_god_drought: "${devil}"
  ${r.name}_evil_god_lucifer: "${devil}"
  ${r.name}_evil_god_beelzebub: "${devil}"
  ${r.name}_evil_god_mephistopheles: "${devil}"
  ${r.name}_evil_god_decay: "${devil}"
  ${r.name}_evil_god_decay_possessive: "${devil}'s"
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

function setReligionLocalization(r) {
    let language = r.language;
    let highgod = makeCharacterName(language);
    let devil = makeCharacterName(language);
    let death = makeRandomWord(language);
    let temple = makeRandomWord(language);
    let holyBook = makeRandomWord(language);
    let pope = makeRandomWord(language);
    let popeland = `${pope} ${makeRandomWord(language)}`;
    let devotee = makeRandomWord(language);
    let mal = makeRandomWord(language);
    let fem = makeRandomWord(language);
    let priest = makeRandomWord(language);
    let bishop = makeRandomWord(language);
    let heaven = makeRandomWord(language);
    let hell = makeRandomWord(language);
    let hornedgod = makeCharacterName(language);
    let healthgod = makeCharacterName(language);
    let fertility = makeRandomWord(language);
    let wealth = makeRandomWord(language);
    let household = makeRandomWord(language);
    let fate = makeRandomWord(language);
    let knowledge = makeRandomWord(language);
    let war = makeRandomWord(language);
    let trickster = makeCharacterName(language);
    let night = makeRandomWord(language);
    let water = makeRandomWord(language);
    
    let localization = {
        religion: r.nameLoc,
        oldName: r.oldNameLoc,
        oldNameAdj: r.oldNameAdjLoc,
        adj: r.nameLoc,
        adherent: r.nameLoc,
        adherent_plural: r.nameLoc,
        desc: r.nameLoc,
        high_god_name: highgod,
        high_god_name_2: highgod,
        high_god_name_3: highgod,
        high_god_name_possessive: `${highgod}'s`,
        high_god_name_alternate: highgod,
        high_god_name_alternate_possessive: `${highgod}'s`,
        good_god_jesus: highgod,
        good_god_christ: highgod,
        devil_name: devil,
        devil_name_possessive: `${devil}'s`,
        evil_god_drought: devil,
        evil_god_lucifer: devil,
        evil_god_beelzebub: devil,
        evil_god_mephistopheles: devil,
        evil_god_decay: devil,
        evil_god_decay_possessive: `${devil}'s`,
        death_deity_name: death,
        death_deity_name_possessive: `${death}'s`,
        house_of_worship: temple,
        house_of_worship_plural: `${temple}s`,
        religious_symbol: `${makeRandomWord(language)} of ${highgod}`,
        religious_text: holyBook,
        religious_head: pope,
        religious_head_title_name: popeland,
        devotee_male: `${devotee}${mal.toLowerCase()}`,
        devotee_female: `${devotee}${fem.toLowerCase()}`,
        devotee_neuter: devotee,
        devotee_neuter_plural: `${devotee}s`,
        priest: priest,
        bishop: bishop,
        positive_afterlife: heaven,
        negative_afterlife: hell,
        witchgodname_the_horned_god: hornedgod,
        creator_god_name: highgod,
        creator_god_name_possessive: `${highgod}'s`,
        health_god_name: healthgod,
        health_god_name_possessive: `${healthgod}'s`,
        fertility_god_name: fertility,
        fertility_god_name_possessive: `${fertility}'s`,
        wealth_god_name: wealth,
        wealth_god_name_possessive: `${wealth}'s`,
        household_god_name: household,
        household_god_name_possessive: `${household}'s`,
        fate_god_name: fate,
        fate_god_name_possessive: `${fate}'s`,
        knowledge_god_name: knowledge,
        knowledge_god_name_possessive: `${knowledge}'s`,
        war_god_name: war,
        war_god_name_possessive: `${war}'s`,
        trickster_god_name: trickster,
        trickster_god_name_possessive: `${trickster}'s`,
        night_god_name: night,
        night_god_name_possessive: `${night}'s`,
        water_god_name: water,
        water_god_name_possessive: `${water}'s`
    };

    // Set the localization object on the religion
    r.localization = localization;
}

const virtuesList = [
    "brave",
    "calm",
    "chaste",
    "content",
    "diligent",
    "forgiving",
    "generous",
    "gregarious",
    "honest",
    "humble",
    "just",
    "patient",
    "temperate",
    "trusting",
    "zealous",
    "compassionate",
    "fickle" // Add any additional virtues as needed
];

const sinsList = [
    "craven",
    "wrathful",
    "lustful",
    "ambitious",
    "lazy",
    "vengeful",
    "greedy",
    "shy",
    "deceitful",
    "arrogant",
    "arbitrary",
    "impatient",
    "gluttonous",
    "paranoid",
    "cynical",
    "callous",
    "sadistic",
    "stubborn" // Add any additional sins as needed
];

const doctrinesList = [
    { n: "doctrine_no_head", group: "Faith Head" },
    { n: "doctrine_spiritual_head", group: "Faith Head" },
    { n: "doctrine_temporal_head", group: "Faith Head" },
    { n: "doctrine_gender_male_dominated", group: "Gender" },
    { n: "doctrine_gender_female_dominated", group: "Gender" },
    { n: "doctrine_gender_equal", group: "Gender" },
    { n: "doctrine_pluralism_righteous", group: "Pluralism" },
    { n: "doctrine_pluralism_pluralistic", group: "Pluralism" },
    { n: "doctrine_pluralism_fundamentalist", group: "Pluralism" },
    { n: "doctrine_theocracy_temporal", group: "Theocracy" },
    { n: "doctrine_theocracy_lay_clergy", group: "Theocracy" },
    { n: "doctrine_concubines", group: "Marriage" },
    { n: "doctrine_polygamy", group: "Marriage" },
    { n: "doctrine_monogamy", group: "Marriage" },
    { n: "doctrine_divorce_allowed", group: "Divorce" },
    { n: "doctrine_divorce_disallowed", group: "Divorce" },
    { n: "doctrine_consanguinity_cousins", group: "Consanguinity" },
    { n: "doctrine_consanguinity_aunt_nephew_and_uncle_niece", group: "Consanguinity" },
    { n: "doctrine_consanguinity_restricted", group: "Consanguinity" },
    { n: "doctrine_consanguinity_unrestricted", group: "Consanguinity" },
    { n: "doctrine_homosexuality_accepted", group: "Homosexuality" },
    { n: "doctrine_homosexuality_shunned", group: "Homosexuality" },
    { n: "doctrine_homosexuality_crime", group: "Homosexuality" },
    { n: "doctrine_adultery_men_accepted", group: "Adultery Men" },
    { n: "doctrine_adultery_men_shunned", group: "Adultery Men" },
    { n: "doctrine_adultery_men_crime", group: "Adultery Men" },
    { n: "doctrine_adultery_women_accepted", group: "Adultery Women" },
    { n: "doctrine_adultery_women_shunned", group: "Adultery Women" },
    { n: "doctrine_adultery_women_crime", group: "Adultery Women" },
    { n: "doctrine_kinslaying_shunned", group: "Kinslaying" },
    { n: "doctrine_kinslaying_accepted", group: "Kinslaying" },
    { n: "doctrine_kinslaying_close_kin_crime", group: "Kinslaying" },
    { n: "doctrine_deviancy_accepted", group: "Deviancy" },
    { n: "doctrine_deviancy_shunned", group: "Deviancy" },
    { n: "doctrine_deviancy_crime", group: "Deviancy" },
    { n: "doctrine_witchcraft_accepted", group: "Witchcraft" },
    { n: "doctrine_witchcraft_shunned", group: "Witchcraft" },
    { n: "doctrine_witchcraft_crime", group: "Witchcraft" },
    { n: "doctrine_clerical_function_recruitment", group: "Clerical Function" },
    { n: "doctrine_clerical_function_taxation", group: "Clerical Function" },
    { n: "doctrine_clerical_function_alms_and_pacification", group: "Clerical Function" },
    { n: "doctrine_clerical_gender_either", group: "Clerical Gender" },
    { n: "doctrine_clerical_gender_male_only", group: "Clerical Gender" },
    { n: "doctrine_clerical_gender_female_only", group: "Clerical Gender" },
    { n: "doctrine_clerical_marriage_allowed", group: "Clerical Marriage" },
    { n: "doctrine_clerical_marriage_disallowed", group: "Clerical Marriage" },
    { n: "doctrine_clerical_succession_temporal_appointment", group: "Clerical Succession" },
    { n: "doctrine_clerical_succession_temporal_fixed_appointment", group: "Clerical Succession" },
    { n: "doctrine_clerical_succession_spiritual_fixed_appointment", group: "Clerical Succession" },
    { n: "doctrine_clerical_succession_spiritual_appointment", group: "Clerical Succession" },
    { n: "doctrine_pilgrimage_encouraged", group: "Pilgrimages" },
    { n: "doctrine_pilgrimage_forbidden", group: "Pilgrimages" },
    { n: "doctrine_funeral_sky_burial", group: "Funerals" },
    { n: "doctrine_funeral_cremation", group: "Funerals" },
    { n: "doctrine_funeral_bewailment", group: "Funerals" },
    { n: "doctrine_funeral_stoic", group: "Funerals" },
    { n: "doctrine_funeral_mummification", group: "Funerals" }
];

const pietyIconGroupList = [
    "pagan",
    "catholic",
    "islamic",
    "orthodox"
    // Add more as needed
];

const graphicalFaithList = [
    "pagan_gfx",
    "catholic_gfx",
    "islamic_gfx",
    "orthodox_gfx"
    // Add more as needed
];