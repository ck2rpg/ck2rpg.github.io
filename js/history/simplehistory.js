function makeSimpleHistory() {
    world.dynasties = [];
    world.characters = [];
    world.year = getRandomInt(100, 1000);
    world.month = getRandomInt(1, 12);
    world.day = getRandomInt(1, 28);
    world.personCounter = 1
    world.dynastyCounter = 1
    let histLevel = settings.historyHolderLevel
    let levels = ["empire", "kingdom", "duchy", "county"]
    //it works if you use kingdom for faith divergence but will throw errors otherwise at         chist += `\treligion = ${char.religion.name}\n`
    for (let z = 0; z < world.empires.length; z++) {
        if (histLevel === "random") {
            histLevel = pickFrom(levels)
        }
        let empire = world.empires[z]
        let emperor;
        if (histLevel === "empire") {
            emperor = createCharacter(empire.provinces[0].culture, empire.provinces[0].faith)
            empire.holder = emperor;
        }
        for (let i = 0; i < empire.kingdoms.length; i++) {
            let kingdom = empire.kingdoms[i];
            let king;
            if (histLevel === "empire" && i === 0) {
                kingdom.holder = emperor;
                king = emperor;
            } else if (histLevel === "empire" || histLevel === "kingdom") {
                king = createCharacter(kingdom.culture, kingdom.provinces[0].faith);
                kingdom.holder = king
            }
            for (let j = 0; j < kingdom.duchies.length; j++) {
                let duchy = kingdom.duchies[j]
                let duke;
                if (j === 0 && (histLevel === "empire" || histLevel === "kingdom")) {
                    duchy.holder = king
                    duke = king;
                } else if (histLevel === "empire" || histLevel === "kingdom" || histLevel === "duchy") {
                    duke = createCharacter(duchy.culture, duchy.provinces[0].faith)
                    duchy.holder = duke
                }
                for (let n = 0; n < duchy.counties.length; n++) {
                    let county = duchy.counties[n]
                    if (n === 0 && (histLevel === "empire" || histLevel === "kingdom" || histLevel === "duchy")) {
                        county.holder = duchy.holder
                    } else {
                        let count = createCharacter(county.culture, county.provinces[0].faith);
                        county.holder = count
                    }
                    for (let l = 0; l < county.provinces.length; l++) {
                        let province = county.provinces[l]
                        province.county = county
                        if (l === 0) {
                            if (settings.eraLevel === "tribal") {
                                province.holdingType = "tribal_holding"
                            } else {
                                province.holdingType = "castle_holding"
                            }
                        } else {
                            province.holdingType = false
                        }
                        if (province.holdingType) {
                            province.culture = county.culture;
                            province.religion = county.faith
                        }
                        
                    }
                }
            }
        }
    }

}

function outputCharacters() {
    let chist = `${daBom}`
    let dyns = `${daBom}`
    for (let i = 0; i < world.characters.length; i++) {
        let char = world.characters[i]
        chist += `${char.id} = {\n`
        chist += `\tname = "${char.name}"\n`
        if (char.gender === "female") {
            chist += `\tfemale = yes\n`
        }
        chist += `\tdynasty = ${char.dyn}\n`
        chist += `\treligion = ${char.religion.name}\n`
        chist += `\tculture = "${char.culture.id}"\n`
        let birthYear = world.year - char.age;
        let deathYear = world.year + getRandomInt(5, 40);
        chist += `\t${birthYear}.${world.month}.${world.day} = {\n`
        chist += `\t\tbirth = yes\n`
        chist += `\t}\n`
        chist += `\t${deathYear}.${world.month}.${world.day} ={\n`
        chist += `\t\tdeath = yes\n`
        chist += `\t}\n`
        chist += `}\n`
        dyns += `${char.dyn} = {\n`
        dyns += `\tname = ${char.dyn}\n`
        dyns += `\tculture = ${char.culture.id}\n`
        dyns += `}\n`
    }
    var data = new Blob([chist], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="characters_link" download="gen_characters.txt" href="">Download History</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`characters_link`).href = url
    document.getElementById(`characters_link`).click();

    var data2 = new Blob([dyns], {type: 'text/plain'})
    var url2 = window.URL.createObjectURL(data2);
    let link2 = `<a id="dynasties_link" download="gen_dynasties.txt" href="">Download History</a><br>`
    document.getElementById("download-links").innerHTML += `${link2}`;
    document.getElementById(`dynasties_link`).href = url2
    document.getElementById(`dynasties_link`).click();
}

function outputHistory() {
    let titleHistory = `${daBom}`;
    let provinceHistory = `${daBom}`
    for (let z = 0; z < world.empires.length; z++) {
        let empire = world.empires[z]
        if (empire.holder) {
            titleHistory += `e_${empire.titleName} = {\n`
            titleHistory += `\t${world.year}.${world.month}.${world.day} = {\n`
            titleHistory += `\t\tholder = ${empire.holder.id}\n`
            titleHistory += `\t}\n`
            titleHistory += `}\n`
        }
        for (let i = 0; i < empire.kingdoms.length; i++) {
            let kingdom = empire.kingdoms[i]
            if (kingdom.holder) {
                titleHistory += `k_${kingdom.titleName} = {\n`
                titleHistory += `\t${world.year}.${world.month}.${world.day} = {\n`
                titleHistory += `\t\tholder = ${kingdom.holder.id}\n`
                if (empire.holder) {
                    titleHistory += `\t\tliege = e_${empire.titleName}`
                }
                titleHistory += `\t}\n`
                titleHistory += `}\n`
            }
            for (let j = 0; j < kingdom.duchies.length; j++) {
                let duchy = kingdom.duchies[j]
                if (duchy.holder) {
                    titleHistory += `d_${duchy.titleName} = {\n`
                    titleHistory += `\t${world.year}.${world.month}.${world.day} = {\n`
                    titleHistory += `\t\tholder = ${duchy.holder.id}\n`
                    if (kingdom.holder) {
                        titleHistory += `\t\tliege = k_${kingdom.titleName}`
                    }
    
                    titleHistory += `\t}\n`
                    titleHistory += `}\n`
                }
    
                for (let n = 0; n < duchy.counties.length; n++) {
                    let county = duchy.counties[n]
                    if (county.holder) {
                        titleHistory += `c_${county.titleName} = {\n`
                        titleHistory += `\t${world.year}.${world.month}.${world.day} = {\n`
                        titleHistory += `\t\tchange_development_level = ${county.developmentLevel}\n`
                        titleHistory += `\t\tholder = ${county.holder.id}\n`
                        if (duchy.holder) {
                            titleHistory += `\t\tliege = d_${duchy.titleName}\n`
                        }
                        titleHistory += `\t}\n`
                        titleHistory += `}\n`
                    }
    
                    for (let l = 0; l < county.provinces.length; l++) {
                        let province = county.provinces[l]
                        provinceHistory += `${province.id} = {\n`
                        if (province.holdingType) {
                            provinceHistory += `\tculture = ${kingdom.culture.id}\n`
                            provinceHistory += `\treligion = ${kingdom.faith.name}\n`
                            provinceHistory += `\tholding = ${province.holdingType}\n`
                        } else {
                            provinceHistory += `\tholding = none\n`
                        }
                        provinceHistory += `}\n`
                    }
                }
            }
        }
    }
    var data = new Blob([provinceHistory], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="province_history_link" download="k_generated.txt" href="">Download History</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`province_history_link`).href = url
    document.getElementById(`province_history_link`).click();

    var data2 = new Blob([titleHistory], {type: 'text/plain'})
    var url2 = window.URL.createObjectURL(data2);
    let link2 = `<a id="title_history_link" download="hist_titles.txt" href="">Download History</a><br>`
    document.getElementById("download-links").innerHTML += `${link2}`;
    document.getElementById(`title_history_link`).href = url2
    document.getElementById(`title_history_link`).click();
}

world.dynasties = []

function createCharacter(culture, faith) {
    let o = {};
    o.gender = pickFrom(["male", "female"])
    o.age = getRandomInt(6, 80)
    o.birth = `${world.year - o.age}.1.1`
    o.id = `gen_${world.personCounter}`
    let dg = `dynn_gen_${world.dynasties.length}`
    o.dyn = dg
    let dgLoc = makeCharacterName(culture.language)
    o.dynName = dgLoc
    world.dynasties.push({k: o.dyn, v: dgLoc})
    o.culture = culture;
    o.religion = faith;
    if (o.gender === "male") {
        //o.name = pickFrom(culture.maleNames)
        o.name = makeCharacterName(culture.language)
    } else {
        o.name = makeCharacterName(culture.language)
        //o.name = pickFrom(culture.femaleNames)
    }
    world.characters.push(o)
    world.personCounter += 1
    return o;
}

