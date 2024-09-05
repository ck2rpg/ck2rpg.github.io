function writeGeneratorSettings() {
    let t = `Resolution: ${world.width}x${world.height}\n`
    t += `Map Size: ${settings.width}x${settings.height}\n`
    t += `Culture Per: ${settings.culturePer}\n`
    t += `divergeCulturesAtCounty: ${settings.divergeCulturesAtCounty}\n`
    t += `divergeCulturesAtDuchy: ${settings.divergeCulturesAtDuchy}\n`
    t += `divergeCulturesAtKingdom: ${settings.divergeCulturesAtKingdom}\n`
    t += `divergeFaithLevel: ${settings.divergeFaithLevel}\n`
    t += `elevationToHeightmap: ${settings.elevationToHeightmap}\n`
    t += `equator: ${settings.equator}\n`
    t += `eraLevel: ${settings.eraLevel}\n`
    t += `ethnicities: ${settings.ethnicities}\n`
    t += `farmlandChunk: ${settings.farmlandChunk}\n`
    t += `fillInLimit: ${settings.fillInLimit}\n`
    t += `fixBlockiness: ${settings.fixBlockiness}\n`
    t += `historyHolderLevel: ${settings.historyHolderLevel}\n`
    t += `horizontalSpread: ${settings.horizontalSpread}\n`
    t += `landProvinceLimit: ${settings.landProvinceLimit}\n`
    t += `massBrushAdjuster: ${settings.massBrushAdjuster}\n`
    t += `overRideWithFlatmap: ${settings.overrideWithFlatmap}\n`
    t += `pixelSize: ${settings.pixelSize}\n`
    t += `religionFamilyLevel: ${settings.religionFamilyLevel}\n`
    t += `riverIntoOcean: ${settings.riverIntoOcean}\n`
    t += `riversDistance: ${settings.riversDistance}\n`
    t += `tooSmallProvince: ${settings.tooSmallProvince}\n`
    t += `varyElevation: ${settings.varyElevation}\n`
    t += `verticalSpread: ${settings.verticalSpread}\n`
    t += `waterProvinceLimit: ${settings.waterProvinceLimit}\n`
    t += `wetlandChunk: ${settings.wetlandChunk}\n`
    t += `wetlandElevation: ${settings.wetlandElevation}\n`
    t += `wetlandScattershot: ${settings.wetlandScattershot}\n`
    t += `hillsLower: ${limits.hills.lower}\n`
    t += `hillsUpper: ${limits.hills.upper}\n`
    t += `mountainsLower: ${limits.mountains.lower}\n`
    t += `mountainsUpper: ${limits.mountains.upper}\n`
    t += `tropicalLower: ${limits.tropical.lower}\n`
    t += `tropicalUpper: ${limits.tropical.upper}\n`
    t += `subtropicalLower: ${limits.subTropical.lower}\n`
    t += `subtropicalUpper: ${limits.subTropical.upper}\n`
    t += `temperateLower: ${limits.temperate.lower}\n`
    t += `temperateUpper: ${limits.temperate.upper}\n`
    t += `coldLower: ${limits.cold.lower}\n`
    t += `coldUpper: ${limits.cold.upper}\n`

    
    var data = new Blob([t], {type: 'text/plain'});
    var url = window.URL.createObjectURL(data);
    
    let link = `<a id="generator-settings-download-link" download="generatorsettings.txt" href="">Download generatorsettings.txt</a><br>`;
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`generator-settings-download-link`).href = url;
    document.getElementById(`generator-settings-download-link`).click();
}

function loadGeneratorSettings(file) {
    // Create a file reader to read the input file
    const reader = new FileReader();

    // Define what to do when the file is read
    reader.onload = function(event) {
        // Mapping for eraLevel display names to values
        const eraLevelMapping = {
            "Tribal": "tribal",
            "Early Medieval": "earlyMedieval",
            "High Medieval": "highMedieval",
            "Late Medieval": "lateMedieval"
        };
        const lines = event.target.result.split('\n');
        lines.forEach(line => {
            const [key, value] = line.split(': ').map(item => item.trim());
            switch (key) {
                case 'Resolution':
                    const [width, height] = value.split('x').map(Number);
                    world.width = width;
                    world.height = height;
                    document.getElementById('generator-resolution').value = `${width}x${height}`;
                    break;
                case 'Map Size':
                    const [mapWidth, mapHeight] = value.split('x').map(Number);
                    settings.width = mapWidth;
                    settings.height = mapHeight;
                    document.getElementById('map-sizes').value = `${mapWidth}x${mapHeight}`;
                    break;
                case 'Culture Per':
                    settings.culturePer = value;
                    document.getElementById('culture-per').value = value;
                    break;
                case 'divergeCulturesAtCounty':
                    settings.divergeCulturesAtCounty = value === 'true';
                    document.getElementById('diverge-at-county').value = value;
                    break;
                case 'divergeCulturesAtDuchy':
                    settings.divergeCulturesAtDuchy = value === 'true';
                    document.getElementById('diverge-at-duchy').value = value;
                    break;
                case 'divergeCulturesAtKingdom':
                    settings.divergeCulturesAtKingdom = value === 'true';
                    document.getElementById('diverge-at-kingdom').value = value;
                    break;
                case 'divergeFaithLevel':
                    settings.divergeFaithLevel = value;
                    document.getElementById('diverge-faith-level').value = value;
                    break;
                case 'elevationToHeightmap':
                    settings.elevationToHeightmap = Number(value);
                    document.getElementById('elevation-to-heightmap').value = value;
                    break;
                case 'equator':
                    settings.equator = Number(value);
                    document.getElementById('equatorSlider').value = value;
                    break;
                case 'eraLevel':
                    settings.eraLevel = value;
                    document.getElementById('era-level').value = eraLevelMapping[value] || ""; // Defaults to empty if not found
                    break;
                case 'ethnicities':
                    settings.ethnicities = value;
                    document.getElementById('ethnicities').value = value;
                    break;
                case 'farmlandChunk':
                    settings.farmlandChunk = Number(value);
                    document.getElementById('farmland-chunk').value = value;
                    break;
                case 'fillInLimit':
                    settings.fillInLimit = Number(value);
                    document.getElementById('max-fill-in-setting').value = value;
                    break;
                case 'fixBlockiness':
                    settings.fixBlockiness = value;
                    break;
                case 'landProvinceLimit':
                    settings.landProvinceLimit = Number(value);
                    document.getElementById('max-land-province-setting').value = value;
                    break;
                case 'waterProvinceLimit':
                    settings.waterProvinceLimit = Number(value);
                    document.getElementById('max-water-province-setting').value = value;
                    break;
                case 'wetlandChunk':
                    settings.wetlandChunk = Number(value);
                    document.getElementById('wetland-chunk').value = value;
                    break;
                case 'wetlandElevation':
                    settings.wetlandElevation = Number(value);
                    document.getElementById('wetland-elevation').value = value;
                    break;
                case 'wetlandScattershot':
                    settings.wetlandScattershot = Number(value);
                    document.getElementById('wetland-scattershot').value = value;
                    break;
                case 'horizontalSpread':
                    settings.horizontalSpread = Number(value);
                    break;
                case 'verticalSpread':
                    settings.verticalSpread = Number(value);
                    break;
                case 'massBrushAdjuster':
                    settings.massBrushAdjuster = Number(value);
                    document.getElementById('mass-brush-adjuster').value = value;
                    break;
                case 'overRideWithFlatmap':
                    settings.overrideWithFlatmap = value === 'true';
                    document.getElementById('overrideSelect').value = value;
                    break;
                case 'pixelSize':
                    settings.pixelSize = Number(value);
                    break;
                case 'religionFamilyLevel':
                    settings.religionFamilyLevel = value;
                    document.getElementById('religion-family-level').value = value;
                    break;
                case 'riverIntoOcean':
                    settings.riverIntoOcean = Number(value);
                    break;
                case 'riversDistance':
                    settings.riversDistance = Number(value);
                    GID("riversSlider").value = 31 - Number(value)
                    break;
                case 'tooSmallProvince':
                    settings.tooSmallProvince = Number(value);
                    break;
                case 'varyElevation':
                    settings.varyElevation = value === 'true';
                    break;
                case 'hillsLower':
                    limits.hills.lower = Number(value);
                    document.getElementById('hills-line').value = value;
                    break;
                case 'hillsUpper':
                    limits.hills.upper = Number(value);
                    break;
                case 'mountainsLower':
                    limits.mountains.lower = Number(value);
                    limits.hills.upper = limits.mountains.lower - 1;
                    document.getElementById('mountain-line').value = value;
                    break;
                case 'mountainsUpper':
                    limits.mountains.upper = Number(value);
                    break;
                case 'tropicalLower':
                    limits.tropical.lower = Number(value);
                    break;
                case 'tropicalUpper':
                    limits.tropical.upper = Number(value);
                    document.getElementById('tropicalUpper').value = value;
                    break;
                case 'subtropicalLower':
                    limits.subTropical.lower = Number(value);
                    break;
                case 'subtropicalUpper':
                    limits.subTropical.upper = Number(value);
                    document.getElementById('subTropicalUpper').value = value;
                    break;
                case 'temperateLower':
                    limits.temperate.lower = Number(value);
                    break;
                case 'temperateUpper':
                    limits.temperate.upper = Number(value);
                    document.getElementById('temperateUpper').value = value;
                    break;
                case 'coldLower':
                    limits.cold.lower = Number(value);
                    break;
                case 'coldUpper':
                    limits.cold.upper = Number(value);
                    break;
                case 'historyHolderLevel':
                    settings.historyHolderLevel = value;
                    GID("history-holder-level").value = value;
                    break;
                case '':
                    break;
                default:
                    console.warn(`Unknown setting: ${key}`);
            }
        });
    };



    // Read the file as text
    reader.readAsText(file);
}
