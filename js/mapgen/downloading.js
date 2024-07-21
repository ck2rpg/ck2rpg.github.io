function drawAndDownload(type, filename, callback) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    world.drawingType = type;
    if (type === "book") {
      redoLetterMap()
    }
    drawWorld();
  
    requestAnimationFrame(function() {
      if (!canvas.toDataURL) {
        console.error('Canvas is tainted and cannot be converted to data URL.');
        return;
      }
      downloadImage(canvas, filename);
      if (callback) callback(); // Proceed to next step only after download
    });
  }
  
  function downloadImage(canvas, filename) {
    let link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.href = undefined
  }

  function downloadWithDelay(index, functions, delay) {
    if (index < functions.length) {
      functions[index]();
      setTimeout(function() {
        downloadWithDelay(index + 1, functions, delay);
      }, delay);
    }
  }
  

  function downloadAllImages() {
    const functionsToExecute = [];
    /*functionsToExecute.push(() => {
      drawProvinceMapWithoutOceans()
      downloadImage(canvas, "landProvinces.png");
    })*/
    functionsToExecute.push(() => drawAndDownload("black", "black1_mask.png"));
    /*
    functionsToExecute.push(() => drawAndDownload("parchment", "parchment.png"));
    functionsToExecute.push(() => drawAndDownload("pixelRoguelike", "pixelRoguelike.png"));
    */
    if (settings.overrideWithFlatmap) {
      //NO NEEd TO DRAW MASKS IF YOU ARE OVERRIDING WITH FLAT MAP
      functionsToExecute.push(() => drawAndDownload("white", "beach_02_mask.png")); //just make a blank background to avoid errors, paper map will cover
    } else {
            //if (document.getElementById('colorfulCheckbox').checked) functionsToExecute.push(() => drawAndDownload("colorful", "colorful.png"));
      //if (document.getElementById('paperCheckbox').checked) functionsToExecute.push(() => drawAndDownload("paper", "paper.png"));
      functionsToExecute.push(() => drawAndDownload("beach_02_mask", "beach_02_mask.png"));
      //if (document.getElementById('beach02MediterraneanMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("beach_02_mediterranean_mask", "beach_02_mediterranean_mask.png"));
      //if (document.getElementById('beach02PebblesMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("beach_02_pebbles_mask", "beach_02_pebbles_mask.png"));
      //if (document.getElementById('coastlineCliffBrownMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("coastline_cliff_brown_mask", "coastline_cliff_brown_mask.png"));
      //if (document.getElementById('coastlineCliffDesertMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("coastline_cliff_desert_mask", "coastline_cliff_desert_mask.png"));
      //if (document.getElementById('coastlineCliffGreyMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("coastline_cliff_grey_mask", "coastline_cliff_grey_mask.png"));
      functionsToExecute.push(() => drawAndDownload("desert_01_mask", "desert_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("desert_02_mask", "desert_02_mask.png"));
      functionsToExecute.push(() => drawAndDownload("desert_cracked_mask", "desert_cracked_mask.png"));
      //if (document.getElementById('desertFlat01MaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("desert_flat_01_mask", "desert_flat_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("desert_rocky_mask", "desert_rocky_mask.png"));
      functionsToExecute.push(() => drawAndDownload("desert_wavy_01_larger_mask", "desert_wavy_01_larger_mask.png"));
      functionsToExecute.push(() => drawAndDownload("desert_wavy_01_mask", "desert_wavy_01_mask.png"));
      //if (document.getElementById('drylands01CrackedMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("drylands_01_cracked_mask", "drylands_01_cracked_mask.png"));
      //if (document.getElementById('drylands01GrassyMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("drylands_01_grassy_mask", "drylands_01_grassy_mask.png"));
      functionsToExecute.push(() => drawAndDownload("drylands_01_mask", "drylands_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("farmland_01_mask", "farmland_01_mask.png"));
      //if (document.getElementById('floodplains01MaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("floodplains_01_mask", "floodplains_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("forest_jungle_01_mask", "forest_jungle_01_mask.png"));
      //if (document.getElementById('forestLeaf01MaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("forest_leaf_01_mask", "forest_leaf_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("forest_pine_01_mask", "forest_pine_01_mask.png"));
      //if (document.getElementById('forestfloor02MaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("forestfloor_02_mask", "forestfloor_02_mask.png"));
      functionsToExecute.push(() => drawAndDownload("forestfloor_mask", "forestfloor_mask.png"));
      functionsToExecute.push(() => drawAndDownload("hills_01_mask", "hills_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("hills_01_rocks_mask", "hills_01_rocks_mask.png"));
      //if (document.getElementById('hills01RocksMediMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("hills_01_rocks_medi_mask", "hills_01_rocks_medi_mask.png"));
      //if (document.getElementById('hills01RocksSmallMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("hills_01_rocks_small_mask", "hills_01_rocks_small_mask.png"));
      //if (document.getElementById('indiaFarmlandsMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("india_farmlands_mask", "india_farmlands_mask.png"));
      //if (document.getElementById('mediDryMudMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("medi_dry_mud_mask", "medi_dry_mud_mask.png"));
      //if (document.getElementById('mediFarmlandsMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("medi_farmlands_mask", "medi_farmlands_mask.png"));
      //if (document.getElementById('mediGrass01MaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("medi_grass_01_mask", "medi_grass_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("medi_grass_02_mask", "medi_grass_02_mask.png"));
      //if (document.getElementById('mediHills01MaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("medi_hills_01_mask", "medi_hills_01_mask.png"));
      //if (document.getElementById('mediLumpyGrassMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("medi_lumpy_grass_mask", "medi_lumpy_grass_mask.png"));
      //if (document.getElementById('mediNoisyGrassMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("medi_noisy_grass_mask", "medi_noisy_grass_mask.png"));
      //if (document.getElementById('mountain02BMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("mountain_02_b_mask", "mountain_02_b_mask.png"));
      functionsToExecute.push(() => drawAndDownload("mountain_02_c_mask", "mountain_02_c_mask.png"));
      functionsToExecute.push(() => drawAndDownload("mountain_02_c_snow_mask", "mountain_02_c_snow_mask.png"));
      functionsToExecute.push(() => drawAndDownload("mountain_02_d_desert_mask", "mountain_02_d_desert_mask.png"));
      //if (document.getElementById('mountain02DMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("mountain_02_d_mask", "mountain_02_d_mask.png"));
      //if (document.getElementById('mountain02DSnowMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("mountain_02_d_snow_mask", "mountain_02_d_snow_mask.png"));
      //if (document.getElementById('mountain02DValleysMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("mountain_02_d_valleys_mask", "mountain_02_d_valleys_mask.png"));
      //if (document.getElementById('mountain02DesertCMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("mountain_02_desert_c_mask", "mountain_02_desert_c_mask.png"));
      //if (document.getElementById('mountain02DesertMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("mountain_02_desert_mask", "mountain_02_desert_mask.png"));
      functionsToExecute.push(() => drawAndDownload("mountain_02_mask", "mountain_02_mask.png"));
      functionsToExecute.push(() => drawAndDownload("mountain_02_snow_mask", "mountain_02_snow_mask.png"));
      //if (document.getElementById('mudWet01MaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("mud_wet_01_mask", "mud_wet_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("northern_hills_01_mask", "northern_hills_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("northern_plains_01_mask", "northern_plains_01_mask.png"));
      //if (document.getElementById('oasisMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("oasis_mask", "oasis_mask.png"));
      //if (document.getElementById('plains01DesatMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("plains_01_desat_mask", "plains_01_desat_mask.png"));
      //if (document.getElementById('plains01DryMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("plains_01_dry_mask", "plains_01_dry_mask.png"));
      functionsToExecute.push(() => drawAndDownload("plains_01_mask", "plains_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("plains_01_noisy_mask", "plains_01_noisy_mask.png"));
      functionsToExecute.push(() => drawAndDownload("plains_01_rough_mask", "plains_01_rough_mask.png"));
      functionsToExecute.push(() => drawAndDownload("snow_mask", "snow_mask.png"));
      functionsToExecute.push(() => drawAndDownload("steppe_01_mask", "steppe_01_mask.png"));
      functionsToExecute.push(() => drawAndDownload("steppe_bushes_mask", "steppe_bushes_mask.png"));
      functionsToExecute.push(() => drawAndDownload("steppe_rocks_mask", "steppe_rocks_mask.png"));
      //if (document.getElementById('wetlands02MaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("wetlands_02_mask", "wetlands_02_mask.png"));
      //if (document.getElementById('wetlands02MudMaskCheckbox').checked) functionsToExecute.push(() => drawAndDownload("wetlands_02_mud_mask", "wetlands_02_mud_mask.png"));
      //if (document.getElementById('bookCheckbox').checked) functionsToExecute.push(() => drawAndDownload("book", "book.png"));
    }
    functionsToExecute.push(() => drawAndDownload("papyrus", "papyrus.png"));
    functionsToExecute.push(() => {
      world.drawingType = "rivermap";
      drawWorld();
      drawHPRivers();
      downloadImage(canvas, "rivers.png");
    });
    functionsToExecute.push(() => {
      world.drawingType = "heightmap"
      drawWorld()
      downloadImage(canvas, "heightmap.png");
    });
    functionsToExecute.push(() => showDoneDone())
  
    const delayBetweenDownloads = 200;
    downloadWithDelay(0, functionsToExecute, delayBetweenDownloads);
  }
  
  function showDoneDone() {
    GID("image-download-settings").style.display = "none"
    GID("done-done").style.display = "block"
  }