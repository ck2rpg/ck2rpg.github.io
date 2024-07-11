let currentProvince

function getMousePosAbs(canvas, evt) {
    //necessary bc default getMousePos is for small canvas based on pixel size
    let rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

function startProvinceEditor() {
    GID("province-screen-menu").style.display = "block"
    GID("province-menu").style.display = "block"
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp)
    canvas.removeEventListener("mousemove", onMouseMove)
    mapContainer.removeEventListener('mousemove', setRedBrush)
    mapContainer.removeEventListener('mouseenter', showRedBrush)
    mapContainer.removeEventListener('mouseleave', hideRedBrush)

    canvas.onclick = function(e) {
        if (currentProvince) {
            // Save last province
            currentProvince.titleName = document.getElementById("namebox").value;
            currentProvince.localizedTitle = document.getElementById("locbox").value;
            currentProvince.id = document.getElementById("defid").innerHTML;
            currentProvince.r = parseInt(document.getElementById("r").innerHTML);
            currentProvince.g = parseInt(document.getElementById("g").innerHTML);
            currentProvince.b = parseInt(document.getElementById("b").innerHTML);
        }
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
        } else {
            console.log("No province found for color:", colorKey);
        }
        /*
        if (currentProvince) {
            //save last province
            currentProvince.titleName = document.getElementById("namebox").value
            currentProvince.localizedTitle = document.getElementById("locbox").value
            currentProvince.id = document.getElementById("defid").innerHTML
            currentProvince.r = parseInt(document.getElementById("r").innerHTML)
            currentProvince.g = parseInt(document.getElementById("g").innerHTML)
            currentProvince.b = parseInt(document.getElementById("b").innerHTML)
        }
        let pos = getMousePosAbs(canvas, e);
        let output = ctx.getImageData(pos.x, pos.y, 1, 1 )
        let r = output.data[0]
        let g = output.data[1];
        let b = output.data[2];
        console.log(r);
        console.log(g);
        console.log(b)
        console.log(world.provinces[0].colorR)
        console.log(world.provinces[0].colorG) 
        console.log(world.provinces[0].colorB)
        for (let i = 0; i < world.provinces.length; i++) {
            //set new province
            currentProvince = world.provinces[i]
            if (parseInt(currentProvince.colorR) === r && parseInt(currentProvince.colorG) === g && parseInt(currentProvince.colorB) === b) {
                console.log(currentProvince)
                if (currentProvince.titleName) {
                    document.getElementById("namebox").value = currentProvince.titleName;
                } else {
                    document.getElementById("namebox").value = "OCEAN";
                }

                if (currentProvince.localizedTitle) {
                    document.getElementById("locbox").value = currentProvince.localizedTitle;
                } else {
                    document.getElementById("locbox").value = "OCEAN";
                }

                
                if (currentProvince.id) {
                    document.getElementById("defid").innerHTML = currentProvince.id
                }
 
                document.getElementById("r").innerHTML = currentProvince.colorR;
                document.getElementById("g").innerHTML = currentProvince.colorG;
                document.getElementById("b").innerHTML = currentProvince.colorB;
                found = true;
                break;
            }
        }
        */
    }
}