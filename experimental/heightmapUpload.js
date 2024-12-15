document.getElementById('imageUpload').addEventListener('change', function(event) {
    //const canvas = document.getElementById('heightmap-upload-canvas');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const file = event.target.files[0];
    const reader = new FileReader();
    
    let divider = GID("import-divider-adjuster").value;
    let multiplier = GID("import-multiplier-adjuster").value;

    function getGreyscalePixelAt(pixels, x, y, imgWidth) {
        let yMult = y * world.width * 4; // could change this to allow more
        let xMult = x * 4
        let total =  yMult + xMult
        return pixels.data[total]
    }
    for (let i = 0; i < world.height; i++) {
        for (let j = 0; j < world.width; j++) {
            let cell = world.map[i][j]
            cell.elevation = 0;
        }
    }
    cleanupAll()
    

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Calculate the dimensions to fit the image within 512x512
            let width = img.width;
            let height = img.height;
            const maxWidth = world.width;
            const maxHeight = world.height;

            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            // Clear the canvas and draw the image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, world.width, world.height);

            // Get the image data
            const imageData = ctx.getImageData(0, 0, world.width, world.height);

            // Log the pixel data array to the console
            for (let i = 0; i < world.height; i++) {
                for (let j = 0; j < world.width; j++) {
                    let cell = world.map[i][j]
                    cell.elevation = Math.floor(getGreyscalePixelAt(imageData, j, i)); //5 for CK map
                    if (cell.elevation > 36) {
                        cell.elevation += parseInt(heightmapAdjuster * 2)
                        cell.elevation /= divider
                        cell.elevation *= multiplier
                        if (cell.elevation < 37) {
                            cell.elevation = 37
                        }
                    } else {
                        cell.elevation *= multiplier
                    }
                }
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            world.drawingType = "heightmap"
            setMoisture()
            drawWorld()
        };
        img.src = event.target.result;

    };

    

    if (file) {
        reader.readAsDataURL(file);
    }
});


document.getElementById('overlayUpload').addEventListener('change', function(event) {
    //const canvas = document.getElementById('heightmap-upload-canvas');
    const canvas = document.getElementById('overlay-canvas');
    const ctx = canvas.getContext('2d');
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Calculate the dimensions to fit the image within 512x512
            let width = settings.width;
            let height = settings.height;

            // Clear the canvas and draw the image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = event.target.result;

    };

    

    if (file) {
        reader.readAsDataURL(file);
    }
});




function uploadTitle(event) {
        settings.titlesUploaded = true;
        let colorKeys = {}
        //const canvas = document.getElementById('heightmap-upload-canvas');
        const canvas = document.getElementById('overlay-canvas');
        const ctx = canvas.getContext('2d');
        const file = event.target.files[0];
        const reader = new FileReader();
    
    
        function getColorPixelAt(pixels, x, y, imgWidth) {
            let yMult = y * world.width * 4; // could change this to allow more
            let xMult = x * 4
            let total =  yMult + xMult
            let c = {
                r: pixels.data[total],
                g: pixels.data[total + 1],
                b: pixels.data[total + 2]
            }
            return c
        }
        cleanupAll()
        
    
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Calculate the dimensions to fit the image within 512x512
                let width = img.width;
                let height = img.height;
                const maxWidth = world.width;
                const maxHeight = world.height;
    
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    } else {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                // Clear the canvas and draw the image
                ctx.clearRect(0, 0, world.width, world.height);
                ctx.drawImage(img, 0, 0, world.width, world.height);
    
                // Get the image data
                const imageData = ctx.getImageData(0, 0, world.width, world.height);
    
                // Log the pixel data array to the console
                settings.overrideElevation = true;
                for (let i = 0; i < world.height; i++) {
                    for (let j = 0; j < world.width; j++) {
                        let cell = world.map[i][j]
                        let color = getColorPixelAt(imageData, j, i)
                        
                        if (settings.overrideElevation) {
                            if (color.r === 0 && color.g === 0 && color.b === 0) {
                                if (cell.elevation > limits.seaLevel.upper) {
                                    cell.elevation = 0;
                                }
                            } else {
                                let title = colorKeys[`${color.r}, ${color.g}, ${color.b}`]
                                cell.elevation = 38
                                if (title) {
                                    if (title.faith) {
                                        cell.faithOverride = `rgb(${color.r}, ${color.g}, ${color.b})`
                                    }
                                    if (title.culture) {
                                        cell.cultureOverride = `rgb(${color.r}, ${color.g}, ${color.b})`
                                    }
                                } else {
                                    title = createAppropriateTitle(color, cell)
                                    colorKeys[`${color.r}, ${color.g}, ${color.b}`] = title
                                }
                                cell[`${settings.titleUploadType}Override`] = `rgb(${color.r}, ${color.g}, ${color.b})`
                                //make sure all the overrides are set correctly to vary by title type, and that each button has its own code
                                //antialiasing is a problem
                            }
                        } else {
                            if (color.r === 0 && color.g === 0 && color.b === 0) {

                            } else {
                                if (cell.elevation > limits.seaLevel.upper) {
                                    let title = colorKeys[`${color.r}, ${color.g}, ${color.b}`]
                                    if (title) {
                                    
                                    } else {
                                        title = createAppropriateTitle(color, cell)
                                        colorKeys[`${color.r}, ${color.g}, ${color.b}`] = title
                                    }
                                    cell[`${settings.titleUploadType}Override`] = `rgb(${color.r}, ${color.g}, ${color.b})`
                                }
                            }
                        }
                        
                    }
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawAppropriateTitle(colorKeys)
            };
            img.src = event.target.result;
    
        };
    
        
    
        if (file) {
            reader.readAsDataURL(file);
        }
}

function drawAppropriateTitle(keys) {
    if (settings.titleUploadType === "empire") {
        world.drawingType = "smallEmpire"
        empireKeys = keys;
    } else if (settings.titleUploadType === "kingdom") {
        world.drawingType = "smallKingdom"
        kingdomKeys = keys;
    } else if (settings.titleUploadType === "duchy") {
        world.drawingType = "smallDuchy"
        duchyKeys = keys;
    } else if (settings.titleUploadType === "county") {
        world.drawingType = "smallCounty"
        countyKeys = keys;
    } else if (settings.titleUploadType === "province") {
        world.drawingType = "smallProvince"
        provinceKeys = keys;
    }
    drawWorld()
}

function createAppropriateTitle(color, cell) {
    let title;
    if (settings.titleUploadType === "empire") {
        title = createEmpire(`rgb(${color.r}, ${color.g}, ${color.b})`)
    } else if (settings.titleUploadType === "kingdom") {
        let c = getColorObjectFromString(cell.empireOverride)
        selectedEmpire = getTitleByColor("empire", c)
        title = createKingdom(`rgb(${color.r}, ${color.g}, ${color.b})`)
        selectedEmpire.kingdoms.push(title)
    } else if (settings.titleUploadType === "duchy") {
        let c = getColorObjectFromString(cell.kingdomOverride)
        selectedKingdom = getTitleByColor("kingdom", c)
        title = createDuchy(`rgb(${color.r}, ${color.g}, ${color.b})`)
        selectedKingdom.duchies.push(title)
    } else if (settings.titleUploadType === "county") {
        let c = getColorObjectFromString(cell.duchyOverride)
        selectedDuchy = getTitleByColor("duchy", c);
        title = createCounty(`rgb(${color.r}, ${color.g}, ${color.b})`)
        selectedDuchy.counties.push(title);
    } else if (settings.titleUploadType === "province") {
        let c4 = getColorObjectFromString(cell.empireOverride)
        selectedEmpire = getTitleByColor("empire", c4)
        let c3 = getColorObjectFromString(cell.kingdomOverride)
        selectedKingdom = getTitleByColor("kingdom", c3)
        let c2 = getColorObjectFromString(cell.duchyOverride)
        selectedDuchy = getTitleByColor("duchy", c2);
        let c = getColorObjectFromString(cell.countyOverride)
        selectedCounty = getTitleByColor("county", c)
        title = createDummyProvince(`rgb(${color.r}, ${color.g}, ${color.b})`)
        //selectedCounty.provinces.push(title) - not needed i think - the createdummyprovince function adds to all but have to set selectedduchy etc
    }
    if (title.faith) {
        cell.faithOverride = `rgb(${color.r}, ${color.g}, ${color.b})`
    }
    if (title.culture) {
        cell.cultureOverride = `rgb(${color.r}, ${color.g}, ${color.b})`
    }
    return title;
}

function getTitleByColor(titleType, color) {
    if (titleType === "empire") {
        return empireKeys[`${color.r}, ${color.g}, ${color.b}`]
    }
    if (titleType === "kingdom") {
        return kingdomKeys[`${color.r}, ${color.g}, ${color.b}`]
    }
    if (titleType === "duchy") {
        return duchyKeys[`${color.r}, ${color.g}, ${color.b}`]
    }
    if (titleType === "county") {
        return countyKeys[`${color.r}, ${color.g}, ${color.b}`]
    }
    if (titleType === "province") {
        return provinceKeys[`${color.r}, ${color.g}, ${color.b}`]
    }
}

function clearCanvases() {
    const canvas = document.getElementById('canvas');
    const canvas2 = document.getElementById('overlay-canvas');
    const ctx = canvas.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
}

document.getElementById('empireUpload').addEventListener('change', function(event) {
    settings.titleUploadType = "empire"
    uploadTitle(event)
});

document.getElementById('kingdomUpload').addEventListener('change', function(event) {
    settings.titleUploadType = "kingdom"
    uploadTitle(event)
});

document.getElementById('duchyUpload').addEventListener('change', function(event) {
    settings.titleUploadType = "duchy"
    uploadTitle(event)
});

document.getElementById('countyUpload').addEventListener('change', function(event) {
    settings.titleUploadType = "county"
    uploadTitle(event)
});

document.getElementById('provinceUpload').addEventListener('change', function(event) {
    settings.titleUploadType = "province"
    uploadTitle(event)
});

GID("overmapUpload").addEventListener('change', function(event) {
    uploadOvermap(event)
});

GID("terrainUpload").addEventListener('change', function(event) {
    uploadTerrain(event)
})

function uploadOvermap(event) {
    let colorKeys = {}
    //const canvas = document.getElementById('heightmap-upload-canvas');
    const canvas = document.getElementById('overlay-canvas');
    const ctx = canvas.getContext('2d');
    const file = event.target.files[0];
    const reader = new FileReader();


    function getColorPixelAt(pixels, x, y, imgWidth) {
        let yMult = y * world.width * 4; // could change this to allow more
        let xMult = x * 4
        let total =  yMult + xMult
        let c = {
            r: pixels.data[total],
            g: pixels.data[total + 1],
            b: pixels.data[total + 2]
        }
        return c
    }
    cleanupAll()
    

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Calculate the dimensions to fit the image within 512x512
            let width = img.width;
            let height = img.height;
            const maxWidth = world.width;
            const maxHeight = world.height;

            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            // Clear the canvas and draw the image
            ctx.clearRect(0, 0, world.width, world.height);
            ctx.drawImage(img, 0, 0, world.width, world.height);

            // Get the image data
            const imageData = ctx.getImageData(0, 0, world.width, world.height);

            for (let i = 0; i < world.height; i++) {
                for (let j = 0; j < world.width; j++) {
                    let cell = world.map[i][j]
                    let color = getColorPixelAt(imageData, j, i)
                    cell.overmap = color
                }
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        img.src = event.target.result;

    };

    

    if (file) {
        reader.readAsDataURL(file);
    }
    world.drawingType = "overmap"
    drawWorld()
}

function uploadTerrain(event) {
    let colorKeys = {}
    const canvas = document.getElementById('overlay-canvas');
    const ctx = canvas.getContext('2d');
    const file = event.target.files[0];
    const reader = new FileReader();


    function getColorPixelAt(pixels, x, y, imgWidth) {
        let yMult = y * world.width * 4; // could change this to allow more
        let xMult = x * 4
        let total =  yMult + xMult
        let c = {
            r: pixels.data[total],
            g: pixels.data[total + 1],
            b: pixels.data[total + 2]
        }
        return c
    }
    

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            let width = img.width;
            let height = img.height;
            const maxWidth = world.width;
            const maxHeight = world.height;

            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            // Clear the canvas and draw the image
            ctx.clearRect(0, 0, world.width, world.height);
            ctx.drawImage(img, 0, 0, world.width, world.height);

            // Get the image data
            const imageData = ctx.getImageData(0, 0, world.width, world.height);
            console.log(imageData)

            for (let i = 0; i < world.height; i++) {
                for (let j = 0; j < world.width; j++) {
                    let cell = world.map[i][j]
                    let color = getColorPixelAt(imageData, j, i)
                    let rgb = `${color.r}, ${color.g}, ${color.b}`
                    if (rgb === "255, 230, 0") {
                        cell.terrain = "desert"
                        cell.terrainMarked = true;
                    } else if (rgb === "220, 45, 120") {
                        cell.terrain = "drylands"
                        cell.terrainMarked = true;
                    } else if (rgb === "55, 31, 153") {
                        cell.terrain = "floodplains"
                        cell.terrainMarked = true;
                    } else if (rgb === "90, 50, 12") {
                        cell.terrain = "hills"
                        cell.terrainMarked = true;
                    } else if (rgb === "100, 100, 100") {
                        cell.terrain = "mountains"
                        cell.terrainMarked = true;
                    } else if (rgb === "46, 153, 89") {
                        cell.terrain = "taiga"
                        cell.terrainMarked = true;
                    } else if (rgb === "23, 19, 38") {
                        cell.terrain = "desert_mountains"
                        cell.terrainMarked = true;
                    } else if (rgb === "255, 0, 0") {
                        cell.terrain = "farmlands"
                        cell.terrainMarked = true;
                    } else if (rgb === "71, 179, 45") {
                        cell.terrain = "forest"
                        cell.terrainMarked = true;
                    } else if (rgb === "10, 60, 35") {
                        cell.terrain = "jungle"
                        cell.terrainMarked = true;
                    } else if (rgb === "155, 143, 204") {
                        cell.terrain = "oasis"
                        cell.terrainMarked = true;
                    } else if (rgb === "200, 100, 25") {
                        cell.terrain = "steppe"
                        cell.terrainMarked = true;
                    } else if (rgb === "77, 153, 153") {
                        cell.terrain = "wetlands"
                        cell.terrainMarked = true;
                    } else if (rgb === "204, 163, 102") {
                        cell.terrain = "plains"
                        cell.terrainMarked = true;
                    }
                }
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        img.src = event.target.result;
    };
    if (file) {
        reader.readAsDataURL(file);
    }
    drawWorld()
}