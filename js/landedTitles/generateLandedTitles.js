/******************************************BEGIN MAIN GENERATOR THREAD*********************************/
let landedTitleLogger = {};
landedTitleLogger.counties = {};
landedTitleLogger.duchies = {};
landedTitleLogger.kingdoms = {};
let worldHistory = {}

// Merge control variables
let mergeCounties = false;
let mergeDuchies = false;
let mergeKingdoms = false;
let mergeEmpires = false;

function calculateDistance(provinceIndex1, provinceIndex2) {
    let province1 = world.provinces[provinceIndex1];
    let province2 = world.provinces[provinceIndex2];
    let dx = province1.x - province2.x;
    let dy = province1.y - province2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function sanitizeAdjacencies(province) {
    province.adjacencies = province.adjacencies
        .map(adj => parseInt(adj))
        .filter(adj => !isNaN(adj));
}

function createCounties(world) {

    const visited = new Set();
    const counties = [];
    for (let i = 0; i < world.counties.length; i++) {
        let arr = []
        let county = world.counties[i]
        for (let n = 0; n < county.provinces.length; n++) {
            let provId = county.provinces[n].nonDefID;
            visited.add(provId)
        }
    }

    world.provinces.forEach(province => {
        province.adjacencies = province.adjacencies
            .map(adj => parseInt(adj))
            .filter(adj => !isNaN(adj) && adj !== province.index);
    });



    function getRandomUpperLimit() {
        let lim = Math.random() * (maxProvincesInCounty) + 1;
        if (lim < 1) {
            lim = 1
        } 
        return Math.floor(lim);
    }

    function dfs(provinceIndex, currentCounty, upperLimit, firstProvinceIndex) {
        if (currentCounty.length >= upperLimit || visited.has(provinceIndex) || !world.provinces[provinceIndex].land || world.provinces[provinceIndex].doNotCreateLandedTitles || world.provinces[provinceIndex].brushColor) {
            return;
        }

        visited.add(provinceIndex);
        currentCounty.push(provinceIndex);

        world.provinces[provinceIndex].adjacencies.forEach(neighbor => {
            if (!visited.has(neighbor) && world.provinces[neighbor].land) {
                let distance = calculateDistance(firstProvinceIndex, neighbor, world);
                if (distance <= countyDistanceThreshold) {
                    dfs(neighbor, currentCounty, upperLimit, firstProvinceIndex);
                }
            }
        });
    }

    for (let i = 0; i < world.provinces.length; i++) {
        if (!visited.has(i) && world.provinces[i].land && !world.provinces[i].brushColor) {
            const upperLimit = getRandomUpperLimit();
            const currentCounty = [];
            dfs(i, currentCounty, upperLimit, i);

            if (currentCounty.length >= 2) {
                counties.push(currentCounty);
            } else if (mergeCounties) {
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

                if (!merged) {
                    counties.push(currentCounty);
                }
            } else {
                counties.push(currentCounty);
            }
        }
    }

    return counties;
}

function createDuchies(counties, world) {
    console.log(counties)
    const visitedCounties = new Set();
    const duchies = [];

    function areAdjacent(county1, county2) {
        return county1.some(provinceIndex1 =>
            world.provinces[provinceIndex1].adjacencies.some(provinceIndex2 =>
                county2.includes(provinceIndex2)
            )
        );
    }

    function getRandomUpperLimit() {
        let lim = Math.random() * (maxCountiesInDuchy) + 1;
        if (lim < 1) {
            lim = 1
        } 
        return Math.floor(lim);
    }

    function dfs(countyIndex, currentDuchy, upperLimit, firstProvinceIndex) {
        if (currentDuchy.length >= upperLimit || visitedCounties.has(countyIndex)) {
            return;
        }

        visitedCounties.add(countyIndex);
        currentDuchy.push(countyIndex);

        for (let i = 0; i < counties.length; i++) {
            if (!visitedCounties.has(i)) {
                let isAdjacentToCurrentDuchy = currentDuchy.some(duchyCountyIndex =>
                    areAdjacent(counties[duchyCountyIndex], counties[i])
                );

                if (isAdjacentToCurrentDuchy) {
                    let addCounty = true;
                    for (let provinceIndex of counties[i]) {
                        let distance = calculateDistance(firstProvinceIndex, provinceIndex);
                        if (distance > duchyDistanceThreshold) {
                            addCounty = false;
                            break;
                        }
                    }
                    if (addCounty) {
                        dfs(i, currentDuchy, upperLimit, firstProvinceIndex);
                    }
                }
            }
        }
    }

    for (let i = 0; i < counties.length; i++) {
        if (!visitedCounties.has(i)) {
            const upperLimit = getRandomUpperLimit();
            const currentDuchy = [];
            dfs(i, currentDuchy, upperLimit, counties[i][0]);

            if (currentDuchy.length >= 2) {
                duchies.push(currentDuchy.map(index => counties[index]));
            } else if (mergeDuchies) {
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

                if (!merged) {
                    duchies.push(currentDuchy.map(index => counties[index]));
                }
            } else {
                duchies.push(currentDuchy.map(index => counties[index]));
            }
        }
    }

    return duchies;
}

function createMyKingdoms(duchies, world) {
    let dArr = [];
    let kingdoms = [];

    function areDuchiesAdjacent(duchy1, duchy2) {
        return duchy1.ownProvinces.some(province1 =>
            world.provinces[province1].adjacencies.some(province2 =>
                duchy2.ownProvinces.includes(province2)
            )
        );
    }

    for (let i = 0; i < duchies.length; i++) {
        let duchyObj = {};
        duchyObj.adjacentDuchies = [];
        duchyObj.ownProvinces = [];
        duchyObj.counties = [];
        let currentDuchy = duchies[i];
        for (let z = 0; z < currentDuchy.length; z++) {
            let currentCounty = currentDuchy[z];
            for (let j = 0; j < currentCounty.length; j++) {
                let currentProvince = currentCounty[j];
                duchyObj.ownProvinces.push(currentProvince);
            }
            duchyObj.counties.push(currentCounty);
        }
        dArr.push(duchyObj);
    }

    function getRandomUpperLimit() {
        let lim = Math.random() * (maxDuchiesInKingdom) + 1;
        if (lim < 1) {
            lim = 1
        } 
        return Math.floor(lim);
    }

    for (let i = 0; i < dArr.length; i++) {
        for (let j = 0; j < dArr.length; j++) {
            if (i !== j && areDuchiesAdjacent(dArr[i], dArr[j])) {
                dArr[i].adjacentDuchies.push(j);
            }
        }
    }

    for (let i = 0; i < dArr.length; i++) {
        let d1 = dArr[i];
        if (!d1.kingdom) {
            let potentialKingdom = {};
            potentialKingdom.duchies = [];
            potentialKingdom.maxDuchies = getRandomUpperLimit()
            d1.kingdom = potentialKingdom;
            potentialKingdom.duchies.push(d1);
            potentialKingdom.ownProvinces = [];
            potentialKingdom.adjacentKingdoms = [];
            addProvincesFromTitle(d1, potentialKingdom, "kingdom");

            let firstProvinceIndex = d1.ownProvinces[0];

            for (let j = 0; j < d1.adjacentDuchies.length; j++) {
                let d2Index = d1.adjacentDuchies[j];
                let d2 = dArr[d2Index];

                if (!d2.kingdom && d1.kingdom.duchies.length < d1.kingdom.maxDuchies) {
                    let addDuchy = true;

                    for (let k = 0; k < d2.ownProvinces.length; k++) {
                        let distance = calculateDistance(firstProvinceIndex, d2.ownProvinces[k]);
                        if (distance > kingdomDistanceThreshold) {
                            addDuchy = false;
                            break;
                        }
                    }

                    if (addDuchy) {
                        d2.kingdom = d1.kingdom;
                        potentialKingdom.duchies.push(d2);
                        addProvincesFromTitle(d2, potentialKingdom, "kingdom");
                    }
                }
            }
            kingdoms.push(potentialKingdom);
        }
    }

    let arr = [];
    for (let i = 0; i < kingdoms.length; i++) {
        if (!kingdoms[i].delete) {
            arr.push(kingdoms[i]);
        }
    }

    return {
        d: dArr,
        k: arr
    }
}

function addProvincesFromTitle(t1, t2, landedTitleType) {
    for (let i = 0; i < t1.ownProvinces.length; i++) {
        let provinceIndex = t1.ownProvinces[i]
        t2.ownProvinces.push(provinceIndex)
        if (landedTitleType) {
            let province = world.provinces[provinceIndex]
            province[`${landedTitleType}`] = t2;
        }
    }
}

function createEmpires(kingdoms, world) {
    let kArr = kingdoms;
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

    function getRandomUpperLimit() {
        let lim = Math.random() * (maxKingdomsInEmpire) + 1;
        if (lim < 1) {
            lim = 1
        } 
        return Math.floor(lim);
    }

    for (let i = 0; i < kArr.length; i++) {
        let k1 = kArr[i]
        if (k1.empire) {

        } else {
            let potentialEmpire = {};
            potentialEmpire.kingdoms = [];
            potentialEmpire.maxKingdoms = getRandomUpperLimit();
            potentialEmpire.ownProvinces = [];
            k1.empire = potentialEmpire;
            potentialEmpire.kingdoms.push(k1);
            addProvincesFromTitle(k1, potentialEmpire, "empire")
            for (let j = 0; j < k1.adjacentKingdoms.length; j++) {
                let k2Index = k1.adjacentKingdoms[j]
                let k2 = kArr[k2Index]
                if (k2.empire) {

                } else if (k1.empire.kingdoms.length < k1.empire.maxKingdoms) {
                    k2.empire = k1.empire
                    potentialEmpire.kingdoms.push(k2)
                    addProvincesFromTitle(k2, potentialEmpire, "empire")
                }
            }
            empires.push(potentialEmpire);
        }
    }
    if (mergeEmpires) {
        for (let i = 0; i < empires.length; i++) {
            if (empires[i].kingdoms.length === 1) {
                for (let j = 0; j < empires[i].kingdoms.length; j++) {
                    let kingdom = empires[i].kingdoms[j]
                    let rand = getRandomInt(0, kingdom.adjacentKingdoms.length - 1);
                    let adjKingdom = kArr[kingdom.adjacentKingdoms[rand]]
                    if (adjKingdom) {
                        adjKingdom.empire.kingdoms.push(kingdom)
                        addProvincesFromTitle(kingdom, adjKingdom.empire, "empire")
                        empires[i].delete = true;
                        kingdom.empire = adjKingdom.empire;
                        if (adjKingdom.empire.delete) {
                            adjKingdom.empire.delete = false;
                        }
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
    let kingdomExists = false;
    let duchyExists = false;
    let countyExists = false;
    let provinceExists = false;
    let worldEmpires = [];
    let worldKingdoms = [];
    let worldDuchies = [];
    let worldCounties = []
    for (let i = 0; i < world.empires.length; i++) {
        let empireProvinceExists = false;
        let empire = world.empires[i]
        let kingdomArr = []
        for (let n = 0; n < empire.kingdoms.length; n++) {
            let kingdomProvinceExists = false;
            let duchyArr = []
            kingdomExists = true;
            let kingdom = empire.kingdoms[n]
            for (let z = 0; z < kingdom.duchies.length; z++) {
                let duchyProvinceExists = false;
                let countyArr = []
                duchyExists = true;
                let duchy = kingdom.duchies[z];
                for (let j = 0; j < duchy.counties.length; j++) {
                    let countyProvinceExists = false;
                    countyExists = true;
                    let county = duchy.counties[j]
                    let provinceArr = []
                    for (let b = 0; b < county.provinces.length; b++) {
                        countyProvinceExists = true;
                        duchyProvinceExists = true;
                        kingdomProvinceExists = true;
                        empireProvinceExists = true;
                        provinceExists = true;
                        let province = county.provinces[b]
                        provinceArr.push(province)
                    }
                    if (countyProvinceExists) {
                        worldCounties.push(county)
                        countyArr.push(county)
                    }
                    county.provinces = provinceArr
                }
                if (duchyProvinceExists) {
                    worldDuchies.push(duchy);
                    duchyArr.push(duchy)
                }
                duchy.counties = countyArr
            }
            if (kingdomProvinceExists) {
                worldKingdoms.push(kingdom);
                kingdomArr.push(kingdom)
            }
            kingdom.duchies = duchyArr
        }
        if (empireProvinceExists) {
            worldEmpires.push(empire)
        }
        empire.kingdoms = kingdomArr;
    }
    world.empires = worldEmpires;
    world.kingdoms = worldKingdoms;
    world.duchies = worldDuchies;
    world.counties = worldCounties

    for (let i = 0; i < world.provinces.length; i++) {
        let prov = world.provinces[i]
        if (!prov.brushColor) {
            prov.brushColor = `rgb(${prov.colorR}, ${prov.colorG}, ${prov.colorB})`
        }
    }

    for (let i = 0; i < world.counties.length; i++) {
        let county = world.counties[i]
        let prov = county.provinces[0]
        county.titleName = prov.titleName
        giveColors(prov, county)
        if (!county.brushColor) {
            county.brushColor = `rgb(${county.colorR}, ${county.colorG}, ${county.colorB})`
        }
    }
    for (let i = 0; i < world.duchies.length; i++) {
        let duchy = world.duchies[i]
        duchy.capital = duchy.counties[0]
        duchy.titleName = duchy.counties[0].titleName
        giveColors(duchy.counties[0], duchy)
        if (!duchy.brushColor) {
            duchy.brushColor = `rgb(${duchy.colorR}, ${duchy.colorG}, ${duchy.colorB})`
        }
        
    }
    for (let i = 0; i < world.kingdoms.length; i++) {
        let kingdom = world.kingdoms[i]
        kingdom.capital = kingdom.duchies[0].capital
        kingdom.titleName = kingdom.duchies[0].titleName
        giveColors(kingdom.duchies[0], kingdom)
        if (!kingdom.brushColor) {
            kingdom.brushColor = `rgb(${kingdom.colorR}, ${kingdom.colorG}, ${kingdom.colorB})`
        }
    }
    for (let i = 0; i < world.empires.length; i++) {
        let empire = world.empires[i]
        empire.capital = empire.kingdoms[0].capital
        empire.titleName = empire.kingdoms[0].titleName
        giveColors(empire.kingdoms[0], empire)
        if (!empire.brushColor) {
            empire.brushColor = `rgb(${empire.colorR}, ${empire.colorG}, ${empire.colorB})`
        }
    }
}

function bubbleUpProvinces() { //brings provinces from real counties back up
    for (let i = 0; i < world.empires.length; i++) {
        let empire = world.empires[i];
        if (empire.provinces && empire.provinces.length > 0) {

        } else {
            empire.isEmpire = true;
            empire.provinces = []
            for (let i = 0; i < empire.kingdoms.length; i++) {
                let kingdom = empire.kingdoms[i];
                kingdom.isKingdom = true;
                kingdom.provinces = []
                for (let j = 0; j < kingdom.duchies.length; j++) {
                    let duchy = kingdom.duchies[j]
                    duchy.isDuchy = true;
                    duchy.provinces = []
                    for (let n = 0; n < duchy.counties.length; n++) {
                        let county = duchy.counties[n]
                        county.isCounty = true;
                        for (let l = 0; l < county.provinces.length; l++) {
                            let province = county.provinces[l]
                            province.isProvince = true;
                            empire.provinces.push(province);
                            kingdom.provinces.push(province);
                            duchy.provinces.push(province)
                        }
                    }
                }
            }
        }
    }
}