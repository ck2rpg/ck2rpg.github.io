/**
 * Creates the terrain types for each province based on various conditions.
 * Updates the province object with the appropriate terrain type.
 */
function createProvinceTerrain() {
    let t = `${daBom}default_land=plains\n`;
    t += `default_sea=sea\n`;
    t += `default_coastal_sea=coastal_sea\n`;
    let count = 0;

    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i];
        if (p.cells > 0) {
            count += 1;
            if (p.land) {
                let cell = world.smallMap[p.y][p.x];
                let n = noise(cell.bigCell.x, cell.bigCell.y);
                let terrain = biome(cell.bigCell);
    
                if (cell.bigCell.elevation >= limits.seaLevel.upper) {
                    if (cell.bigCell.highPointRiver && cell.bigCell.elevation > 40 && cell.bigCell.elevation < 70 && !cell.bigCell.desert && ((n > 0.1 && n < 0.4) || (n > 0.6 && n < 0.9))) {
                        p.terrain = "farmlands";
                    } else if (cell.bigCell.elevation > limits.seaLevel.upper && cell.bigCell.moisture > 150 && cell.bigCell.y < world.steppeTop && cell.bigCell.y > world.steppeBottom) {
                        p.terrain = "jungle";
                    } else if (cell.bigCell.desert) {
                        if (cell.elevation > limits.mountains.lower) {
                            p.terrain = "desert_mountains";
                            p.isDesert = true;
                        } else if (cell.bigCell.y > world.steppeTop || cell.bigCell.y < world.steppeBottom) {
                            p.terrain = "steppe";
                        } else if (cell.bigCell.moisture < 25) {
                            p.terrain = "drylands";
                            p.isDesert = true;
                        } else {
                            p.terrain = "desert";
                            p.isDesert = true;
                        }
                    } else if (cell.bigCell.elevation > limits.mountains.lower) {
                        p.terrain = "mountains";
                    } else if (limits.mountains.lower - cell.bigCell.elevation < 50) {
                        p.terrain = "hills";
                    } else if (!cell.bigCell.maskMarked && ((n > 0.1 && n < 0.2) || (n > 0.6 && n < 0.9))) {
                        p.terrain = "forest";
                    } else if (terrain === "arctic") {
                        p.terrain = "taiga";
                    } else if (terrain === "grass" || terrain === "beach") {
                        p.terrain = "plains";
                    } else {
                        p.terrain = "plains"; // default
                    }
                }
            } else {
                p.terrain = "sea"
                p.seaType = "sea" // this is changed to coastal sea as appropriate later in the setProvinceDirections function. Oddly, coastal_sea is not set anywhere and can't find anything on it. I'm assuming it is set by engine to help with travel danger
            }
        }
    }
}

/**
 * Writes the terrain data for each province to a downloadable file.
 */
function writeProvinceTerrain() {
    let t = `${daBom}default_land=plains\n`;
    t += `default_sea=sea\n`;
    t += `default_coastal_sea=coastal_sea\n`;
    let count = 0;

    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i];
        if (p.terrain !== "sea" && p.cells > 0) {
            count += 1;
            t += `${count}=${p.terrain}\n`;
        }
    }

    var data = new Blob([t], { type: 'text/plain' });
    var url = window.URL.createObjectURL(data);
    let link = `<a id="terrain-download-link" download="00_province_terrain.txt" href="">Download Province Terrain</a><br>`;
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('terrain-download-link').href = url;
    document.getElementById('terrain-download-link').click();
}