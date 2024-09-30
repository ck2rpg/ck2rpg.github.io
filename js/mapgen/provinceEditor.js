let currentProvince

function getMousePosAbs(canvas, evt) {
    //necessary bc default getMousePos is for small canvas based on pixel size
    let rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

function saveLastProvince() {
    if (currentProvince) {
        currentProvince.titleName = document.getElementById("namebox").value;
        currentProvince.localizedTitle = document.getElementById("locbox").value;
        currentProvince.id = document.getElementById("defid").innerHTML;
        currentProvince.r = parseInt(document.getElementById("r").innerHTML);
        currentProvince.g = parseInt(document.getElementById("g").innerHTML);
        currentProvince.b = parseInt(document.getElementById("b").innerHTML);
        if (currentProvince.county) {
            console.log(currentProvince)
            currentProvince.county.localizedTitle = document.getElementById("countyLocBox").value
            currentProvince.county.duchy.localizedTitle = document.getElementById("duchyLocBox").value
            currentProvince.county.duchy.kingdom.localizedTitle = document.getElementById("kingdomLocBox").value
            currentProvince.county.duchy.kingdom.empire.localizedTitle = document.getElementById("empireLocBox").value
            //currentProvince.faith.nameLoc = GID("faithbox").value; 
            //currentProvince.culture.name = GID("culturebox").value;
        }
    }
}

function removeEmptyTitles() {
    // Remove empty counties
    for (let duchy of world.duchies) {
        duchy.counties = duchy.counties.filter(county => {
            let hasPassableProvince = county.provinces.some(province => !province.isImpassable);
            if (!hasPassableProvince) {
                // If no passable province in county, mark it for removal
                return false;
            }
            return true;
        });
    }

    // Remove empty duchies
    for (let kingdom of world.kingdoms) {
        kingdom.duchies = kingdom.duchies.filter(duchy => duchy.counties.length > 0);
    }

    // Remove empty kingdoms
    for (let empire of world.empires) {
        empire.kingdoms = empire.kingdoms.filter(kingdom => kingdom.duchies.length > 0);
    }

    // Remove empty empires
    world.empires = world.empires.filter(empire => empire.kingdoms.length > 0);
}

function closeProvinceEditor() {
    saveLastProvince()
}

function startProvinceEditor() {
    GID("province-menu").style.display = "block"
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp)
    canvas.removeEventListener("mousemove", onMouseMove)
    mapContainer.removeEventListener('mousemove', setRedBrush)
    mapContainer.removeEventListener('mouseenter', showRedBrush)
    mapContainer.removeEventListener('mouseleave', hideRedBrush)

    let movableDiv2 = document.getElementById('province-menu');
    let movingDiv2 = document.getElementById("top-bar-province-menu")

    let isDragging = false;
    let offsetX, offsetY;

    movingDiv2.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - movableDiv2.offsetLeft;
        offsetY = e.clientY - movableDiv2.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            movableDiv2.style.left = `${e.clientX - offsetX}px`;
            movableDiv2.style.top = `${e.clientY - offsetY}px`;
            movableDiv2.style.height = `fit-content`;
            movableDiv2.style.width = `fit-content`
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });



    canvas.onclick = function(e) {
        saveLastProvince()
        let pos = getMousePosAbs(canvas, e);
        let output = ctx.getImageData(pos.x, pos.y, 1, 1);
        let r = output.data[0];
        let g = output.data[1];
        let b = output.data[2];
        let colorKey = `${r}, ${g}, ${b}`;
        currentProvince = provinceKeys[colorKey];
    
        if (currentProvince) {
            document.getElementById("namebox").value = currentProvince.titleName || "OCEAN";
            document.getElementById("locbox").value = currentProvince.localizedTitle || "OCEAN";
            document.getElementById("defid").innerHTML = currentProvince.id || "";
            document.getElementById("r").innerHTML = currentProvince.colorR;
            document.getElementById("g").innerHTML = currentProvince.colorG;
            document.getElementById("b").innerHTML = currentProvince.colorB;
            if (currentProvince.county) {
                document.getElementById("countyLocBox").value = currentProvince.county.localizedTitle
                document.getElementById("duchyLocBox").value = currentProvince.county.duchy.localizedTitle
                document.getElementById("kingdomLocBox").value = currentProvince.county.duchy.kingdom.localizedTitle
                document.getElementById("empireLocBox").value = currentProvince.county.duchy.kingdom.empire.localizedTitle
                GID("faithbox").value = currentProvince.faith.nameLoc 
                GID("culturebox").value = currentProvince.culture.name
            } else {
                document.getElementById("countyLocBox").value = "N/A"
                document.getElementById("duchyLocBox").value = "N/A"
                document.getElementById("kingdomLocBox").value = "N/A"
                document.getElementById("empireLocBox").value = "N/A"
                GID("faithbox").value = "N/A"
                GID("culturebox").value = "N/A"
            }
            if (currentProvince.isOcean) {
                oceanCheck = true;
            } else {
                oceanCheck = false;
            }
            if (currentProvince.isLake) {
                lakeCheck = true;
            } else {
                lakeCheck = false;
            }
            if (currentProvince.isImpassableSea) {
                impassableSeaCheck = true;
            } else {
                impassableSeaCheck = false;
            }
            if (currentProvince.isImpassable) {
                impassableCheck = true;
            } else {
                impassableCheck = false;
            }
            if (currentProvince.isRiver) {
                riverCheck = true;
            } else {
                riverCheck = false;
            }
            redoCheckboxes(null)
            if (column === "empire") {
                selectedEmpire = currentProvince.empire
                updateKingdomColorColumn()
                drawTitleSmallMap("kingdom")
            } else if (column === "kingdom") {
                selectedKingdom = currentProvince.kingdom
                updateDuchyColorColumn()
                drawTitleSmallMap("duchy")
            } else if (column === "duchy") {
                selectedDuchy = currentProvince.duchy
                updateCountyColorColumn()
                drawTitleSmallMap("county")
            } else if (column === "county") {
                selectedCounty = currentProvince.county
                updateProvinceColorColumn()
                drawTitleSmallMap("province")
            }
        } else {
            console.log("No province found for color:", colorKey);
        }
    }
}