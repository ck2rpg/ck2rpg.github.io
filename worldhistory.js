/******************************************BEGIN MAIN GENERATOR THREAD*********************************/
let landedTitleLogger = {};
landedTitleLogger.counties = {};
landedTitleLogger.duchies = {};
landedTitleLogger.kingdoms = {};
let worldHistory = {}

//The results here are disappointing and need work

function createLandedTitleStructure() {
    let titles = []
    for (let i = 0; i < world.empires.length; i++) {
        let empire = world.empires[i]

    }
}


function sanitizeAdjacencies(province) {
    //his function will iterate through each province's adjacencies array and convert any non-integer elements to integers using parseInt. If parseInt fails to convert a value into an integer (for example, if the value is not a number), the function will remove that value from the adjacencies array to maintain data integrity.
    province.adjacencies = province.adjacencies
        .map(adj => parseInt(adj))
        .filter(adj => !isNaN(adj));
}

function createCounties(world) {
    // Sanitize adjacencies
    world.provinces.forEach(province => {
        province.adjacencies = province.adjacencies
            .map(adj => parseInt(adj))
            .filter(adj => !isNaN(adj) && adj !== province.index);
    });

    const visited = new Set();
    const counties = [];

    function getRandomUpperLimit() {
        return Math.floor(Math.random() * (6 - 2 + 1)) + 2;
    }

    function dfs(provinceIndex, currentCounty, upperLimit) {
        if (currentCounty.length >= upperLimit || visited.has(provinceIndex) || !world.provinces[provinceIndex].land) {
            return;
        }

        visited.add(provinceIndex);
        currentCounty.push(provinceIndex);

        world.provinces[provinceIndex].adjacencies.forEach(neighbor => {
            if (!visited.has(neighbor) && world.provinces[neighbor].land) {
                dfs(neighbor, currentCounty, upperLimit);
            }
        });
    }

    for (let i = 0; i < world.provinces.length; i++) {
        if (!visited.has(i) && world.provinces[i].land) {
            const upperLimit = getRandomUpperLimit();
            const currentCounty = [];
            dfs(i, currentCounty, upperLimit);

            if (currentCounty.length >= 2) {
                counties.push(currentCounty);
            } else {
                // Try to merge small counties with an adjacent one
                let merged = false;
                for (const neighbor of world.provinces[i].adjacencies) {
                    if (visited.has(neighbor)) {
                        const adjacentCounty = counties.find(county => county.includes(neighbor));
                        if (adjacentCounty && adjacentCounty.length + currentCounty.length <= upperLimit) {
                            adjacentCounty.push(...currentCounty);
                            merged = true;
                            break;
                        }
                    }
                }

                // If unable to merge, try with a new upper limit
                if (!merged) {
                    counties.push(currentCounty)
                }
            }
        }
    }

    return counties;
}


function createDuchies(counties, world) {
    // Function to check if two counties are adjacent
    function areAdjacent(county1, county2) {
        return county1.some(provinceIndex1 => 
            world.provinces[provinceIndex1].adjacencies.some(provinceIndex2 => 
                county2.includes(provinceIndex2)
            )
        );
    }

    const visitedCounties = new Set();
    const duchies = [];

    function getRandomUpperLimit() {
        return Math.floor(Math.random() * (6 - 2 + 1)) + 2;
    }

    function dfs(countyIndex, currentDuchy, upperLimit) {
        if (currentDuchy.length >= upperLimit || visitedCounties.has(countyIndex)) {
            return;
        }

        visitedCounties.add(countyIndex);
        currentDuchy.push(countyIndex);

        for (let i = 0; i < counties.length; i++) {
            if (!visitedCounties.has(i) && areAdjacent(counties[countyIndex], counties[i])) {
                dfs(i, currentDuchy, upperLimit);
            }
        }
    }

    for (let i = 0; i < counties.length; i++) {
        if (!visitedCounties.has(i)) {
            const upperLimit = getRandomUpperLimit();
            const currentDuchy = [];
            dfs(i, currentDuchy, upperLimit);

            if (currentDuchy.length >= 2) {
                duchies.push(currentDuchy.map(index => counties[index]));
            } else {
                // Merge small duchies with adjacent ones
                let merged = false;
                for (const adjacentCountyIndex of counties[i]) {
                    for (const neighbor of world.provinces[adjacentCountyIndex].adjacencies) {
                        const neighborCountyIndex = counties.findIndex(county => county.includes(neighbor));
                        if (neighborCountyIndex !== -1 && visitedCounties.has(neighborCountyIndex)) {
                            const adjacentDuchy = duchies.find(duchy => duchy.includes(counties[neighborCountyIndex]));
                            if (adjacentDuchy && adjacentDuchy.length + currentDuchy.length <= upperLimit) {
                                adjacentDuchy.push(...currentDuchy.map(index => counties[index]));
                                merged = true;
                                break;
                            }
                        }
                    }
                    if (merged) break;
                }

                // If unable to merge, try with a new upper limit
                if (!merged) {
                    duchies.push(currentDuchy.map(index => counties[index]));
                }
            }
        }
    }

    return duchies;
}


function createMyKingdoms(world) {
    let dArr = [];
    let kingdoms = [];

    function areDuchiesAdjacent(duchy1, duchy2) {
        for (let i = 0; i < duchy1.ownProvinces.length; i++) {
            let province1 = world.provinces[duchy1.ownProvinces[i]]
            for (let j = 0; j < province1.adjacencies.length; j++) {
                let adjIndex = province1.adjacencies[j]
                for (let n = 0; n < duchy2.ownProvinces.length; n++) {
                    let province2Index = duchy2.ownProvinces[n]
                    if (adjIndex === province2Index) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    for (let i = 0; i < world.duchies.length; i++) {
        let duchyObj = {};
        duchyObj.adjacentDuchies = []
        duchyObj.ownProvinces = []
        duchyObj.counties = []
        let currentDuchy = world.duchies[i];
        for (let z = 0; z < currentDuchy.length; z++) {
            let currentCounty = currentDuchy[z];
            for (let j = 0; j < currentCounty.length; j++) {
                let currentProvince = currentCounty[j]
                duchyObj.ownProvinces.push(currentProvince);
            }
            duchyObj.counties.push(currentCounty)
        }
        dArr.push(duchyObj)
    }

    for (let i = 0; i < dArr.length; i++) {
        for (let j = 0; j < dArr.length; j++) {
            let duchy1 = dArr[i]
            let duchy2 = dArr[j]
            if (i === j) {

            } else {
                if (areDuchiesAdjacent(duchy1, duchy2)) {
                    duchy1.adjacentDuchies.push(j)
                }
            }
        }
    }

    for (let i = 0; i < dArr.length; i++) {
        let d1 = dArr[i]
        if (d1.kingdom) {

        } else {
            let potentialKingdom = {};
            potentialKingdom.duchies = [];
            potentialKingdom.maxDuchies = getRandomInt(2, 4);
            d1.kingdom = potentialKingdom;
            potentialKingdom.duchies.push(d1);
            potentialKingdom.ownProvinces = []
            potentialKingdom.adjacentKingdoms = []
            addProvincesFromTitle(d1, potentialKingdom)
            
            for (let j = 0; j < d1.adjacentDuchies.length; j++) {
                let d2Index = d1.adjacentDuchies[j]
                let d2 = dArr[d2Index]
                if (d2.kingdom) {

                } else if (d1.kingdom.duchies.length < d1.kingdom.maxDuchies) {
                    d2.kingdom = d1.kingdom
                    potentialKingdom.duchies.push(d2)
                    addProvincesFromTitle(d2, potentialKingdom)
                }
            }
            kingdoms.push(potentialKingdom);
        }
    }
    for (let i = 0; i < kingdoms.length; i++) {
        if (kingdoms[i].duchies.length === 1) {
            for (let j = 0; j < kingdoms[i].duchies.length; j++) {
                let duchy = kingdoms[i].duchies[j]
                let rand = getRandomInt(0, duchy.adjacentDuchies.length - 1);
                let adjDuchy = dArr[duchy.adjacentDuchies[rand]]
                if (adjDuchy) {
                    adjDuchy.kingdom.duchies.push(duchy)
                    addProvincesFromTitle(duchy, adjDuchy.kingdom)
                    kingdoms[i].delete = true;
                    duchy.kingdom = adjDuchy.kingdom;
                    if (adjDuchy.kingdom.delete) {
                        adjDuchy.kingdom.delete = false;
                    }
                }
            }
        }
    }
    let arr = [];
    for (let i = 0; i < kingdoms.length; i++) {
        if (kingdoms[i].delete) {

        } else {
            arr.push(kingdoms[i])
        }
    }
    world.duchies = dArr
    return arr;
}

function addProvincesFromTitle(t1, t2) {
    for (let i = 0; i < t1.ownProvinces.length; i++) {
        t2.ownProvinces.push(t1.ownProvinces[i])
    }
}

function createEmpires(world) {
    let kArr = world.kingdoms;
    let empires = [];

    function areKingdomsAdjacent(kingdom1, kingdom2) {
        for (let i = 0; i < kingdom1.ownProvinces.length; i++) {
            let province1 = world.provinces[kingdom1.ownProvinces[i]]
            for (let j = 0; j < province1.adjacencies.length; j++) {
                let adjIndex = province1.adjacencies[j]
                for (let n = 0; n < kingdom2.ownProvinces.length; n++) {
                    let province2Index = kingdom2.ownProvinces[n]
                    if (adjIndex === province2Index) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    for (let i = 0; i < kArr.length; i++) {
        for (let j = 0; j < kArr.length; j++) {
            let kingdom1 = kArr[i]
            let kingdom2 = kArr[j]
            if (i === j) {

            } else {
                if (areKingdomsAdjacent(kingdom1, kingdom2)) {
                    kingdom1.adjacentKingdoms.push(j)
                }
            }
        }
    }

    for (let i = 0; i < kArr.length; i++) {
        let k1 = kArr[i]
        console.log(k1)
        if (k1.empire) {

        } else {
            let potentialEmpire = {};
            potentialEmpire.kingdoms = [];
            potentialEmpire.maxKingdoms = getRandomInt(2, 4);
            potentialEmpire.ownProvinces = [];
            k1.empire = potentialEmpire;
            potentialEmpire.kingdoms.push(k1);
            addProvincesFromTitle(k1, potentialEmpire)
            for (let j = 0; j < k1.adjacentKingdoms.length; j++) {
                let k2Index = k1.adjacentKingdoms[j]
                let k2 = kArr[k2Index]
                if (k2.empire) {

                } else if (k1.empire.kingdoms.length < k1.empire.maxKingdoms) {
                    k2.empire = k1.empire
                    potentialEmpire.kingdoms.push(k2)
                    addProvincesFromTitle(k2, potentialEmpire)
                }
            }
            empires.push(potentialEmpire);
        }
    }
    for (let i = 0; i < empires.length; i++) {
        if (empires[i].kingdoms.length === 1) {
            for (let j = 0; j < empires[i].kingdoms.length; j++) {
                let kingdom = empires[i].kingdoms[j]
                let rand = getRandomInt(0, kingdom.adjacentKingdoms.length - 1);
                let adjKingdom = kArr[kingdom.adjacentKingdoms[rand]]
                if (adjKingdom) {
                    adjKingdom.empire.kingdoms.push(kingdom)
                    addProvincesFromTitle(kingdom, adjKingdom.empire)
                    empires[i].delete = true;
                    kingdom.empire = adjKingdom.empire;
                    if (adjKingdom.empire.delete) {
                        adjKingdom.empire.delete = false;
                    }
                }
            }
        }
    }
    let arr = [];
    for (let i = 0; i < empires.length; i++) {
        if (empires[i].delete) {
            // do nothing
        } else {
            arr.push(empires[i])
        }
    }
    return arr;
}

function giveColors(giver, taker) {
    taker.colorR = giver.colorR;
    taker.colorG = giver.colorG;
    taker.colorB = giver.colorB;
}

function assignTitleInfo() {
    //need to convert counties to actual what they need to be? That seems to be the problem.
    for (let i = 0; i < world.counties.length; i++) {
        let county = world.counties[i]
        let prov = county.provinces[0]
        county.titleName = prov.titleName
        giveColors(prov, county)
    }
    for (let i = 0; i < world.duchies.length; i++) {
        let duchy = world.duchies[i]
        duchy.capital = duchy.counties[0].titleName
        duchy.titleName = duchy.counties[0].titleName
        giveColors(duchy.counties[0], duchy)
    }
    for (let i = 0; i < world.kingdoms.length; i++) {
        let kingdom = world.kingdoms[i]
        kingdom.capital = kingdom.duchies[0].capital
        kingdom.titleName = kingdom.duchies[0].titleName
        giveColors(kingdom.duchies[0], kingdom)
    }
    for (let i = 0; i < world.empires.length; i++) {
        let empire = world.empires[i]
        empire.capital = empire.kingdoms[0].capital
        empire.titleName = empire.kingdoms[0].titleName
        giveColors(empire.kingdoms[0], empire)
    }
}



function simpleCounties() { 
    world.counties = [];
    for (let i = 0; i < world.provinces.length; i++) {
        let prov = world.provinces[i]
        let provCounter = 1
        let countySize = getRandomInt(2, 6);
        if (prov.county) {

        } else {
            if (prov.land) {
                let county = {
                    titleName: `c_${prov.titleName}`,
                    provinces: [],
                    colorR: prov.colorR,
                    colorG: prov.colorG,
                    colorB: prov.colorB,
                    capital: `b_${prov.titleName}`,
                    adjacencies: []
                }
                world.counties.push(county)
                prov.county = county
                county.provinces.push(prov)
                if (countySize !== 1) {
                    for (let j = 0; j < prov.adjacencies.length; j++) {
                        let correctedNum = prov.adjacencies[j] - 1;
                        let neighbor = world.provinces[correctedNum]
                        if (neighbor.land) {
                            if (neighbor.county) {
                                //do nothing
                            } else {
                                neighbor.county = county;
                                county.provinces.push(neighbor)
                                provCounter += 1;
                            }
                            if (provCounter === countySize) {

                                break;
                            }
                        }
                    }
                }  
                if (landedTitleLogger.counties[provCounter]) {
                    landedTitleLogger.counties[provCounter] += 1
                } else {
                    landedTitleLogger.counties[provCounter] = 1
                }
            }
        }
    }
    for (let i = 0; i < world.counties.length; i++) {
        let c = world.counties[i];
        for (let n = 0; n < c.provinces.length; n++) {
            let prov = c.provinces[n]
            for (let z = 0; z < prov.adjacencies.length; z++) {
                let adj = prov.adjacencies[z]
                c.adjacencies.push(adj)
            }
        }
        let unique = c.adjacencies.filter(onlyUnique)
        let onlyExteriorProvinces = [];
        for (let z = 0; z < unique.length; z++) {
            let correctedNum = parseInt(unique[z]) - 1; // adjacencies are set on definition files vs. what we need here - the province in array
            let adjProv = world.provinces[correctedNum]
            if (adjProv.county === c) { 
                //Do nothing/get rid of province from adjacencies if it is part of county being checked
            } else {
                onlyExteriorProvinces.push(adjProv.id) // set the adjacency based on the def id
            }
        }
        c.adjacencies = onlyExteriorProvinces
    }
}

function simpleDuchies() {
    world.duchies = [];
    for (let i = 0; i < world.provinces.length; i++) {
        let prov = world.provinces[i]
        let countyCounter = 1
        let duchySize = getRandomInt(2, 6);
        if (prov.duchy) {
            duchySize = prov.duchy.duchySize;
            countyCounter = prov.duchy.counties.length;
            countyCounter = pullNeighborsIntoDuchy(prov, prov.duchy, countyCounter, duchySize)
        } else {
            if (prov.land) {
                let duchy = {
                    titleName: `d_${prov.titleName}`,
                    counties: [],
                    colorR: prov.colorR,
                    colorG: prov.colorG,
                    colorB: prov.colorB,
                    capital: `c_${prov.titleName}`,
                    duchySize: duchySize
                };
                world.duchies.push(duchy);
                duchy.counties.push(prov.county)
                prov.county.duchy = duchy
                prov.duchy = duchy
                for (let j = 0; j < prov.county.provinces.length; j++) {
                    let other = prov.county.provinces[j]
                    other.duchy = duchy;
                }
                for (let j = 0; j < prov.county.provinces.length; j++) {
                    countyCounter = pullNeighborsIntoDuchy(prov.county.provinces[j], duchy, countyCounter, duchySize)
                }
                
                if (landedTitleLogger.duchies[countyCounter]) {
                    landedTitleLogger.duchies[countyCounter] += 1
                } else {
                    landedTitleLogger.duchies[countyCounter] = 1
                }
            }
        }
    }
}

function pullNeighborsIntoDuchy(prov, duchy, countyCounter, duchySize) {
    if (prov.land) {
        for (let j = 0; j < prov.adjacencies.length; j++) {
            if (countyCounter === duchySize) {
                break;
            }
            let correctedNum = parseInt(prov.adjacencies[j]) - 1
            let neighbor = world.provinces[correctedNum]
            if (neighbor.land) {
                
                if (neighbor.duchy) {
                    
                } else {
                    if (neighbor.county !== prov.county) {
                        neighbor.duchy = duchy
                        neighbor.county.duchy = duchy
                        duchy.counties.push(neighbor.county);
                        countyCounter += 1;
                        for (let z = 0; z < neighbor.county.provinces.length; z++) {
                            let p = neighbor.county.provinces[z];
                            p.duchy = duchy;
                        }
                        for (let z = 0; z < neighbor.county.provinces.length; z++) {
                            if (countyCounter === duchySize) {
                                break;
                            }
                            let p = neighbor.county.provinces[z];
                            countyCounter = pullNeighborsIntoDuchy(p, duchy, countyCounter, duchySize)
                        }
                    }
                    
                }
            }
        }
    }
    return countyCounter
}

function simpleKingdoms() {
    world.kingdoms = [];
    for (let i = 0; i < world.provinces.length; i++) {
        let prov = world.provinces[i]
        let duchyCounter = 1;
        let kingdomSize = getRandomInt(2, 8);
        if (prov.kingdom) {

        } else {
            if (prov.land) {
                let kingdom = {
                    titleName: `k_${prov.titleName}`,
                    duchies: [],
                    colorR: prov.colorR,
                    colorG: prov.colorG,
                    colorB: prov.colorB,
                    capital: `c_${prov.titleName}`
                };
                world.kingdoms.push(kingdom);
                kingdom.duchies.push(prov.duchy);
                prov.duchy.kingdom = kingdom
                prov.kingdom = kingdom
                for (let j = 0; j < prov.duchy.counties.length; j++) {
                    let c = prov.duchy.counties[j]
                    for (let z = 0; z < c.provinces.length; z++) {
                        let p = c.provinces[z];
                        p.kingdom = kingdom
                    }
                }
                for (let j = 0; j < prov.adjacencies.length; j++) {
                    let correctedNum = prov.adjacencies[j] - 1
                    let neighbor = world.provinces[correctedNum]
                    if (neighbor.land) {
                        if (neighbor.kingdom || neighbor.duchy.kingdom) {
    
                        } else {
                            if (neighbor.duchy !== prov.duchy) {
                                neighbor.kingdom = kingdom;
                                neighbor.duchy.kingdom = kingdom
                                kingdom.duchies.push(neighbor.duchy);
                                for (let z = 0; z < neighbor.duchy.counties.length; z++) {
                                    let c = neighbor.duchy.counties[z]
                                    for (let y = 0; y < c.provinces.length; y++) {
                                        c.provinces[y].kingdom = kingdom
                                    }
                                } 
                                duchyCounter += 1;
                            }
                            if (duchyCounter === kingdomSize) {
                                break;
                            }
                        }
                    }
                }
                if (landedTitleLogger.kingdoms[duchyCounter]) {
                    landedTitleLogger.kingdoms[duchyCounter] += 1
                } else {
                    landedTitleLogger.kingdoms[duchyCounter] = 1
                }
            }
        }
    }
}





/******************************************END MAIN GENERATOR THREAd***********************************/



/******************************************BEGIN CULTURE GENERATOR***********************************/


/******************************************END CULTURE GENERATOR***********************************/
