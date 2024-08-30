function generateNoise(width, height) {
    const grid = new Array(width);
    for (let x = 0; x < width; x++) {
    grid[x] = new Array(height);
    for (let y = 0; y < height; y++) {
        grid[x][y] = Math.random();
    }
    }
    return grid;
}

function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}

function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

function perlin(x, y, grid) {
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;
    
    const dx = smoothstep(x - Math.floor(x));
    const dy = smoothstep(y - Math.floor(y));
    
    const v00 = grid[x0 % grid.length][y0 % grid[0].length];
    const v01 = grid[x0 % grid.length][y1 % grid[0].length];
    const v10 = grid[x1 % grid.length][y0 % grid[0].length];
    const v11 = grid[x1 % grid.length][y1 % grid[0].length];
    
    const v0 = lerp(v00, v01, dy);
    const v1 = lerp(v10, v11, dy);
    
    return lerp(v0, v1, dx);
}

function getColor(elevation) {
    // Define colors
    const deepOcean = [0, 0, 128];
    const shallowWater = [0, 105, 148];
    const beach = [245, 213, 160];
    const plains = [85, 128, 0];
    const forest = [34, 84, 34];
    const mountain = [130, 130, 130];
    const snow = [255, 255, 255];
    let diff
    if (elevation < 0.6) { // change here for sea level
        return 1;
    } else {
        let num = Math.floor(elevation * 100)
        let num2 = 100 - num;
        let num3 = 8 * num2;
        return (300 - (37 + num3));
    }
    let num = (512 * elevation) / 2
    return Math.floor((512 * elevation) / 2)
    // Interpolate based on elevation
    if (elevation < 0.6) {  // Raised to 0.6 for even deeper oceans
        let range = 600
        let diff = elevation * 1000
        let mult = diff / range;
        return Math.floor(15 * mult)
    } else if (elevation < 0.7) {  // Raised to 0.7 for even shallower waters
        let range = 1000;
        let el = 0.7 - elevation;
        let diff = el * 100;
        let mult = diff / range;
        return Math.floor(36 * mult);
    } else {
        let range = 600;
        let el = 1 - elevation;
        let diff = el * 1000;
        let mult = diff / range;
        return (512 * mult);
    
    
    /*if (elevation < 0.75) {  // Raised to 0.75 for longer beaches
        return 37
    } else if (elevation < 0.8) {  // Raised to 0.8 for very short plains
    return 40
    } else if (elevation < 0.85) {  // Raised to 0.85 for very short forests
    return 70
    } else if (elevation < 0.9) {  // Raised to 0.9 for very short mountains
    return 205
    } else {
    return 256
    }
    */
    }


}

function continentFunction(x, y, hotspots) {
    let sum = 0;
    for (let i = 0; i < hotspots.length; i++) {
    const dx = hotspots[i].x - x;
    const dy = hotspots[i].y - y;
    sum += Math.exp(-(dx * dx + dy * dy) / (3 * hotspots[i].r * hotspots[i].r));
    }
    return sum;
}

function generateHotspots() {
    let hotspots = []
    for (let i = 0; i < settings.hotSpotsAdjuster; i++) {
        let hs = {}
        hs.x = getRandomInt(1, world.width - 1);
        hs.y = getRandomInt(1, world.height - 1);
        hs.r  = getRandomInt(settings.hotSpotsRadiusAdjuster, settings.hotSpotsMaximumRadiusAdjuster)
        hotspots.push(hs);
    }
    return hotspots
}

function generateAutoHotspots() {
    let hotspots = []
    let div = world.width / 8192;

    let continentCount = getRandomInt(3, 5);
    //bottom left
    for (let i = 0; i < continentCount; i++) { // 4
        let hs = {}
        let low = Math.floor(getRandomInt(100, 200) * div); // 800
        let high = Math.floor(getRandomInt(200, 800) * div); // 600 (archipelago at 100, 200)
        let ww = Math.floor(world.width / 10);
        let hh = Math.floor(world.height / 10);
        hs.x = getRandomInt(0, Math.floor(world.width / 2));
        hs.y = getRandomInt(0, Math.floor(world.height / 2));
        hs.r  = getRandomInt(low, high)
        hotspots.push(hs);
    }
    //top left
    for (let i = 0; i < continentCount; i++) { // 4
        let hs = {}
        let low = Math.floor(getRandomInt(100, 300) * div); // 800
        let high = Math.floor(getRandomInt(300, 800) * div); // 600 (archipelago at 100, 200)
        let ww = Math.floor(world.width / 10);
        let hh = Math.floor(world.height / 10);
        hs.x = getRandomInt(0, Math.floor(world.width / 2));
        hs.y = getRandomInt(Math.floor(world.height / 2), world.height - 1);
        hs.r  = getRandomInt(low, high)
        hotspots.push(hs);
    }
    //bottom right
    for (let i = 0; i < continentCount; i++) { // 4
        let hs = {}
        let low = Math.floor(getRandomInt(100, 200) * div); // 800
        let high = Math.floor(getRandomInt(200, 800) * div); // 600 (archipelago at 100, 200)
        let ww = Math.floor(world.width / 10);
        let hh = Math.floor(world.height / 10);
        hs.x = getRandomInt(Math.floor(world.width / 2), world.width - 1);
        hs.y = getRandomInt(0, Math.floor(world.height / 2));
        hs.r  = getRandomInt(low, high)
        hotspots.push(hs);
    }
    //top right
    for (let i = 0; i < continentCount; i++) { // 4
        let hs = {}
        let low = Math.floor(getRandomInt(100, 300) * div); // 800
        let high = Math.floor(getRandomInt(300, 800) * div); // 600 (archipelago at 100, 200)
        let ww = Math.floor(world.width / 10);
        let hh = Math.floor(world.height / 10);
        hs.x = getRandomInt(Math.floor(world.width / 2), world.width - 1);
        hs.y = getRandomInt(Math.floor(world.height / 2), world.height - 1);
        hs.r  = getRandomInt(low, high)
        hotspots.push(hs);
    }

    return hotspots
}

settings.hotspots = []

function randomMap() {
    settings.hotspots = generateAutoHotspots();
    generateElevations()
    setMoisture()
}

function constrainedMap() {
    settings.hotspots = generateAutoHotspots()
    generateElevations();
    setMoisture()
    cleanupAll();
    drawWorld()
}

function generateElevations() {
    let s = new SimplexNoise()
    const elevationNoise = generateNoise(world.width, world.height);
    let num = world.width / 4;
    let num2 = world.height / 4
    const continentNoise = generateNoise(num2, num); 
    let hotspots = settings.hotspots


    for (let i = 0; i < world.height; i++) {
        for (let j = 0; j < world.width; j++) {
            let x = j;
            let y = i
            let cell = world.map[i][j]
            let elevation = 0;
            let amplitude = 1.0; // lower makes it less increase, higher makes it more  increase
            let frequency = 0.0075; //lower makes it smoother, higher makes it more varied from cell to cell, 0.01 or 0.005 seem like best results
    
            // Smaller details
            for (let i = 0; i < 12; i++) {
                elevation += amplitude * genericNoise(x * frequency, y * frequency, s) //perlin(x * frequency, y * frequency, elevationNoise);
                amplitude *= 0.6;
                frequency *= 2;
            }
    
            // Continent bias
            let continentFactor = continentFunction(x, y, hotspots);
            elevation += genericNoise(x * 0.002, y * 0.002, s) * continentFactor * 2.0 //perlin(x * 0.002, y * 0.002, continentNoise) * continentFactor * 2.0;
    
            elevation = elevation / 3.0;
            let a = getColor(elevation)
            a = Math.floor(a / 1.8) // delete this if need be - it just smushes everything down
            if (a < 37) {
                a = 10
            }
            cell.elevation = a
        }
    }
}

