/**
 * Generates the landed titles hierarchy for the world, including empires, kingdoms, duchies, counties, and provinces.
 * 
 * The function constructs a string representation of the landed titles in a hierarchical format,
 * including the RGB color values and the capitals for each level. This string is then converted 
 * to a downloadable text file.
 */
function writeLandedTitles() {
    let t = `${daBom}`
    let landless = `c_${world.counties[0].titleName}`
    for (let j = 0; j < world.empires.length; j++) {
        let empire = world.empires[j]
        t += `e_${empire.titleName} = {\n`
        t += `  color = {${empire.colorR} ${empire.colorG} ${empire.colorB}}\n`
        t += `  capital = c_${empire.capital.titleName}\n`
        for (let i = 0; i < empire.kingdoms.length; i++) {
            let kingdom = empire.kingdoms[i]
            t += `  k_${kingdom.titleName} = {\n`
            t += `    color = {${kingdom.colorR} ${kingdom.colorG} ${kingdom.colorB}}\n`
            t += `    capital = c_${kingdom.capital.titleName}\n`
            for (let n = 0; n < kingdom.duchies.length; n++) {
                let duchy = kingdom.duchies[n]
                t += `    d_${duchy.titleName} = {\n`
                t += `      color = { ${duchy.colorR} ${duchy.colorG} ${duchy.colorB} }\n`
                t += `      capital = c_${duchy.capital.titleName}\n`
                for (let z = 0; z < duchy.counties.length; z++) {
                    let county = duchy.counties[z]
                    t += `      c_${county.titleName} = {\n`
                    t += `        color = {${county.colorR} ${county.colorG} ${county.colorB}}\n`
                    for (let m = 0; m < county.provinces.length; m++) {
                        let province = county.provinces[m]
                        if (province.isImpassable) {
                            //need to ensure that we don't leave empty counties full of impassable terrain
                        } else {
                            t += `        b_${province.titleName} = {\n`
                            t += `          province = ${world.provinces.indexOf(province) + 1}\n`
                            t += `          color = {${county.colorR} ${county.colorG} ${county.colorB}}\n`
                            t += `        }\n`
                        }
                    }
                    t += `      }\n`
                }
                    t += `    }\n`
            }
            t += `  }\n`
        }
        t += `}\n`
    }
    t += `
d_ck2rpg = {
    color = { 100 100 100 }
	capital = ${landless}
	definite_form = yes
	landless = yes
	require_landless = yes
	ruler_uses_title_name = no
	no_automatic_claims = yes
	destroy_if_invalid_heir = yes
	ai_primary_priority = { add = @never_primary_score }
}  
`
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="title-download-link" download="00_landed_titles.txt" href="">Download Landed Titles</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('title-download-link').href = url
    document.getElementById('title-download-link').click()
}