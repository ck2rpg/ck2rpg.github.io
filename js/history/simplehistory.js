function makeSimpleHistory() {
    world.dynasties = [];
    world.characters = [];
    world.year = getRandomInt(100, 1000);
    world.month = getRandomInt(1, 12);
    world.day = getRandomInt(1, 28);
    world.personCounter = 1
    world.dynastyCounter = 1
    //it works if you use kingdom for faith divergence but will throw errors otherwise at         chist += `\treligion = ${char.religion.name}\n`
    for (let i = 0; i < world.kingdoms.length; i++) {
        let kingdom = world.kingdoms[i];
        console.log(kingdom)
        let king = createCharacter(kingdom.culture, kingdom.provinces[0].faith);
        kingdom.holder = king
        for (let j = 0; j < kingdom.duchies.length; j++) {
            let duchy = kingdom.duchies[j]
            console.log(duchy)
            if (j === 0) {
                duchy.holder = king
            } else {
                let duke = createCharacter(duchy.culture, duchy.provinces[0].faith)
                duchy.holder = duke
            }
            for (let n = 0; n < duchy.counties.length; n++) {
                let county = duchy.counties[n]
                console.log(county)
                if (n === 0) {
                    county.holder = duchy.holder
                } else {
                    let count = createCharacter(county.culture, county.provinces[0].faith);
                    county.holder = count
                }
                for (let l = 0; l < county.provinces.length; l++) {
                    let province = county.provinces[l]
                    province.county = county
                    if (l === 0) {
                        province.holdingType = "tribal_holding"
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
    for (let i = 0; i < world.kingdoms.length; i++) {
        let kingdom = world.kingdoms[i]
        titleHistory += `k_${kingdom.titleName} = {\n`
        titleHistory += `\t${world.year}.${world.month}.${world.day} = {\n`
        titleHistory += `\t\tholder = ${kingdom.holder.id}\n`
        titleHistory += `\t}\n`
        titleHistory += `}\n`
        for (let j = 0; j < kingdom.duchies.length; j++) {
            let duchy = kingdom.duchies[j]
            titleHistory += `d_${duchy.titleName} = {\n`
            titleHistory += `\t${world.year}.${world.month}.${world.day} = {\n`
            titleHistory += `\t\tholder = ${duchy.holder.id}\n`
            titleHistory += `\t\tliege = k_${kingdom.titleName}`
            titleHistory += `\t}\n`
            titleHistory += `}\n`
            for (let n = 0; n < duchy.counties.length; n++) {
                let county = duchy.counties[n]
                titleHistory += `c_${county.titleName} = {\n`
                titleHistory += `\t${world.year}.${world.month}.${world.day} = {\n`
                titleHistory += `\t\tholder = ${county.holder.id}\n`
                titleHistory += `\t\tliege = d_${duchy.titleName}`
                titleHistory += `\t}\n`
                titleHistory += `}\n`
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

function createCharacter(culture, faith) {
    let o = {};
    o.gender = pickFrom(["male", "female"])
    o.age = getRandomInt(6, 80)
    o.birth = `${world.year - o.age}.1.1`
    o.id = `gen_${world.personCounter}`
    o.dyn = `dynn_gen_${world.dynastyCounter}`
    o.culture = culture;
    o.religion = faith;
    if (o.gender === "male") {
        //o.name = pickFrom(culture.maleNames)
        o.name = generateWordFromTrigrams(maleNameTrigrams, maleNames)
    } else {
        o.name = generateWordFromTrigrams(femaleNameTrigrams, femaleNames)
        //o.name = pickFrom(culture.femaleNames)
    }
    world.characters.push(o)
    world.personCounter += 1
    world.dynastyCounter += 1;
    return o;
}

