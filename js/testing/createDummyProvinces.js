function bigTab() {
    return `&nbsp&nbsp&nbsp&nbsp`
}

function createDummyProvinces() {
    let t = "let dummyProvinces = [<br>"
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        t += `{<br>` // open province
        if (p.severity) {
            t += `${bigTab()}severity: ${p.severity},<br>`
        }
        if (p.adjacentToWater.length > 0) {
            t += `${bigTab()}adjacentToWater: [` // begin adjacencies
            for (let n = 0; n < p.adjacentToWater.length; n++) {
                if (n === p.adjacentToWater.length - 1) {
                    t += `"${p.adjacentToWater[n]}"`
                } else {
                    t += `"${p.adjacentToWater[n]}", `
                }
                
            }
            t += `],<br>` //end adjacencies
        }
        if (p.adjacencies) {
            t += `${bigTab()}adjacencies: [` // begin adjacencies
            for (let n = 0; n < p.adjacencies.length; n++) {
                if (n === p.adjacencies.length - 1) {
                    t += `${p.adjacencies[n]}`
                } else {
                    t += `${p.adjacencies[n]}, `
                }
                
            }
            t += `],<br>` //end adjacencies
        }
        if (p.climateCategory) {
            t += `${bigTab()}climateCategory: "${p.climateCategory}",<br>`
        }
        if (p.color) {
            t += `${bigTab()}color: "${p.color}",<br>`
        }
        if (p.continent) {
            t += `${bigTab()}continent: "${p.continent}",<br>`
        }
        if (p.distanceFromEquator) {
            t += `${bigTab()}distanceFromEquator: ${p.distanceFromEquator},<br>`
        }
        if (p.elevation) {
            t += `${bigTab()}elevation: ${p.elevation},<br>`
        }
        if (p.floodFilled) {
            t += `${bigTab()}floodFilled: ${p.floodFilled},<br>`
        }
        if (p.geographicalRegions) {
            t += `${bigTab()}geographicalRegions: [`
            for (let n = 0; n < p.geographicalRegions.length; n++) {
                if (n === p.geographicalRegions.length - 1) {
                    t += `"${p.geographicalRegions[n]}"`
                } else {
                    t += `"${p.geographicalRegions[n]}", `
                }
            }
            t += `],<br>` //close geographical regions
        }
        if (p.hemisphere) {
            t += `${bigTab()}hemisphere: "${p.hemisphere}",<br>`
        }
        if (p.land) {
            t += `${bigTab()}land: true,<br>`
        } else {
            t += `${bigTab()}land: false,<br>`
        }
        if (p.localizedTitle) {
            t += `${bigTab()}localizedTitle: "${p.localizedTitle}",<br>`
        }
        if (p.mountains) {
            t += `${bigTab()}mountains: [`
            for (let n = 0; n < p.mountains.length; n++) {
                if (n === p.mountains.length - 1) {
                    t += `"${p.mountains[n]}"`
                } else {
                    t += `"${p.mountains[n]}", `
                }
            }
            t += `],<br>` //close mountains
        }
        if (p.rivers) {
            t += `${bigTab()}rivers: [`
            for (let n = 0; n < p.rivers.length; n++) {
                if (n === p.rivers.length - 1) {
                    t += `"${p.rivers[n]}"`
                } else {
                    t += `"${p.rivers[n]}", `
                }
            }
            t += `],<br>` //close rivers
        }
        if (p.terrain) {
            t += `${bigTab()}terrain: "${p.terrain}",<br>`
        }
        if (p.titleName) {
            t += `${bigTab()}titleName: "${p.titleName}",<br>`
        }
        if (p.x) {
            t += `${bigTab()}x: ${p.x},<br>`
        }
        if (p.y) {
            t += `${bigTab()}y: ${p.y},<br>`
        }
        if (p.cells) {
            t += `${bigTab()}cells: ${p.cells},<br>`
        }
        if (p.waterId) {
            t += `${bigTab()}waterId: "${p.waterId}",<br>`
        }
        t += `},<br>` //close province
    }
    t += `]`//close array of provinces
    document.getElementById("main-generator-div").innerHTML = "";
    document.getElementById("main-sidebar").innerHTML = ""
    document.getElementById("testing-div").innerHTML = t;
}

/*
rivers
: 
['Placeholder River Name 547']
terrain
: 
"forest"
titleName
: 
"hnbkncnfdk"
x
: 
4785
y
: 
3416
*/


/*
adjacencies
: 
(6) [1589, 2281, 1529, 5757, 2242, 1407]
bigCell
: 
{x: 299, y: 213, ckX: 4784, ckY: 688, tree: false, …}
cells
: 
3020
climateCategory
: 
"temperate"
color
: 
"rgb(152, 127, 100)"
colorB
: 
"100"
colorG
: 
"127"
colorR
: 
"152"
continent
: 
"rgb(105, 72, 179)"
distanceFromEquator
: 
1368
elevation
: 
172
floodFilled
: 
false
geographicalRegions
: 
[]
hemisphere
: 
"Southern"
id
: 
6
land
: 
true
localizedTitle
: 
"Felmbusbi"
mountains
: 
[]
neighborTerrains
: 
(6) ['plains', 'plains', 'plains', 'hills', 'plains', 'hills']
neighbors
: 
(6) [{…}, {…}, {…}, {…}, {…}, {…}]
nonDefID
: 
5
placeInWorld
: 
{neighbors: Array(6), waterNeighbors: 0, landNeighbors: 6, island: false, lake: false, …}
population
: 
0
rivers
: 
['Placeholder River Name 547']
terrain
: 
"forest"
titleName
: 
"hnbkncnfdk"
x
: 
4785
y
: 
3416
*/