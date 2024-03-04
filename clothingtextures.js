var txtCanvas = document.getElementById("texture-canvas")
txtCanvas.width = 16
txtCanvas.height = 16
var txtCtx = txtCanvas.getContext('2d')

/*
function drawAndDownloadTexture(filename) {
    

    // Using setTimeout to give the browser a "tick" to render the canvas before converting to dataURL
    setTimeout(() => {
        try {
            txtCtx.clearRect(0, 0, txtCanvas.width, txtCanvas.height);
            for (let i = 0; i < 16; i++) {
                for (let j = 0; j < 16; j++) {
                    let randColor = getRandomColor(); // Ensure this function generates a random color string
                    drawTinyPixel(txtCtx, j, i, randColor); // Ensure this function draws a pixel on the canvas
                }
            }
            const dataUrl = txtCanvas.toDataURL(); // Convert canvas to data URL
            downloadTextureImage(dataUrl, filename); // Function to trigger download
        } catch (error) {
            console.error('Error converting canvas to data URL:', error);
        }
    }, 100); // Execute after the current call stack clears
}
*/

function drawAndDownloadTexture(filename) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                txtCtx.clearRect(0, 0, txtCanvas.width, txtCanvas.height);
                for (let i = 0; i < 16; i++) {
                    for (let j = 0; j < 16; j++) {
                        let randColor = getRandomColor(); // Ensure this function generates a random color string
                        drawTinyPixel(txtCtx, j, i, randColor); // Ensure this function draws a pixel on the canvas
                    }
                }
                const dataUrl = txtCanvas.toDataURL(); // Convert canvas to data URL
                downloadTextureImage(dataUrl, filename); // Function to trigger download
                resolve(); // Resolve the promise after the download is triggered
            } catch (error) {
                console.error('Error converting canvas to data URL:', error);
                reject(error); // Reject the promise if there's an error
            }
        }, 100); // Execute after the current call stack clears
    });
}

function downloadTextureImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link); // Append link to body
    link.click(); // Simulate click to trigger download
    document.body.removeChild(link); // Clean up
}

async function downloadAllTextures() {
    for (let i = 0; i < textureNames.length; i++) {
        await drawAndDownloadTexture(textureNames[i]); // Wait for each texture to be downloaded
    }
}

/*powershell script:
# Define the target directory
$directory = "C:\SteamLibrary\steamapps\common\Crusader Kings III\game\gfx\portraits\accessory_variations\textures"

# Get all files in the directory, select their names, and write to filenames.txt in the same directory
Get-ChildItem -Path $directory -File | Select-Object -ExpandProperty Name | Out-File -FilePath "$directory\filenames.txt"

# Confirmation message
Write-Host "Filenames have been written to filenames.txt in the $directory"
*/

let textureNames = [
    "color_palette_01.png",
    "color_palette_01_statue_western_wood_01.png",
    "color_palette_01_statue_western_wood_bare.png",
    "color_palette_01_statue_western_wood_body_01.png",
    "color_palette_01_statue_western_wood_hair_01.png",
    "color_palette_02.png",
    "color_palette_abbasid_headgear_female_high_nobility_01.png",
    "color_palette_abbasid_headgear_female_royalty_01.png",
    "color_palette_abbasid_war_nobility_high_01.png",
    "color_palette_abbasid_war_nobility_low_01.png",
    "color_palette_abbasid_war_nobility_royal_01.png",
    "color_palette_african_pagan_high_01.png",
    "color_palette_afr_f_low_nob_01.png",
    "color_palette_afr_headgear_female_01.png",
    "color_palette_afr_high_01.png",
    "color_palette_afr_legwear.png",
    "color_palette_afr_low_01.png",
    "color_palette_buddhist.png",
    "color_palette_byzantine_common_01.png",
    "color_palette_byzantine_high_01.png",
    "color_palette_byzantine_low_01.png",
    "color_palette_byzantine_war_nobility_high_01.png",
    "color_palette_byzantine_war_nobility_low_01.png",
    "color_palette_byzantine_wedding.png",
    "color_palette_catholic_01.png",
    "color_palette_catholic_devoted_01.png",
    "color_palette_crusaders_01.png",
    "color_palette_crusaders_02.png",
    "color_palette_ep1_adventurer_01.png",
    "color_palette_ep1_jester_01.png",
    "color_palette_ep2_byzantine_war_nobility_high_01.png",
    "color_palette_ep2_byzantine_war_nobility_low_01.png",
    "color_palette_ep2_era4_western_nobility_01.png",
    "color_palette_ep2_horse_01.png",
    "color_palette_ep2_horse_02.png",
    "color_palette_ep2_horse_03.png",
    "color_palette_ep2_mena_travel_01.png",
    "color_palette_ep2_mena_war_nobility_01_high.png",
    "color_palette_ep2_mena_war_nobility_01_low.png",
    "color_palette_ep2_steppe_war_headgear_01.png",
    "color_palette_ep2_steppe_war_nobility_01_high.png",
    "color_palette_ep2_steppe_war_nobility_01_low.png",
    "color_palette_ep2_western_cloak_nobility_01.png",
    "color_palette_ep2_western_headgear_com_01.png",
    "color_palette_ep2_western_headgear_nob_01.png",
    "color_palette_ep2_western_nobility_01.png",
    "color_palette_ep2_western_travel_01.png",
    "color_palette_ep2_western_veil_01.png",
    "color_palette_ep2_western_war_era4_high_nobility_01.png",
    "color_palette_ep2_western_war_high_nobility_01.png",
    "color_palette_ep2_western_war_low_nobility_01.png",
    "color_palette_eye_patch_01.png",
    "color_palette_face_mask_common.png",
    "color_palette_fp1_furs_01.png",
    "color_palette_fp1_furs_02.png",
    "color_palette_fp1_furs_03.png",
    "color_palette_fp1_low_01.png",
    "color_palette_fp1_war_noble_01.png",
    "color_palette_fp2_iberian_christian_common_01.png",
    "color_palette_fp2_iberian_christian_common_headgear_01.png",
    "color_palette_fp2_iberian_christian_headgear_high_01.png",
    "color_palette_fp2_iberian_christian_headgear_war_nobility_high_01.png",
    "color_palette_fp2_iberian_christian_helmets_01.png",
    "color_palette_fp2_iberian_christian_high_01.png",
    "color_palette_fp2_iberian_christian_high_headgear_female_01.png",
    "color_palette_fp2_iberian_christian_low_01.png",
    "color_palette_fp2_iberian_christian_low_headgear_01.png",
    "color_palette_fp2_iberian_christian_low_headgear_female_01.png",
    "color_palette_fp2_iberian_christian_surcoats_01.png",
    "color_palette_fp2_iberian_christian_war_nobility_high_01.png",
    "color_palette_fp2_iberian_muslim_common.png",
    "color_palette_fp2_iberian_muslim_common_headgear.png",
    "color_palette_fp2_iberian_muslim_high.png",
    "color_palette_fp2_iberian_muslim_noble.png",
    "color_palette_fp2_iberian_muslim_noble_headgear.png",
    "color_palette_fp2_iberian_muslim_noble_headgear_female_01.png",
    "color_palette_fp2_iberian_muslim_war_nobility_high.png",
    "color_palette_fp2_iberian_muslim_war_noble.png",
    "color_palette_fp2_muslim_war_noble_headgear.png",
    "color_palette_fp3_iranian_female_nobility_01_headgear.png",
    "color_palette_fp3_iranian_high.png",
    "color_palette_fp3_iranian_low.png",
    "color_palette_fp3_iranian_mask.png",
    "color_palette_fp3_iranian_nobility_headgear_01.png",
    "color_palette_fp3_iranian_nobility_headgear_02.png",
    "color_palette_fp3_iranian_war_clothes.png",
    "color_palette_fp3_iranian_war_helmet_01.png",
    "color_palette_fp3_turkic_male_nobility_01_headgear.png",
    "color_palette_hindu.png",
    "color_palette_hre_veil_01.png",
    "color_palette_indian_headgear_war_nobility_high_01.png",
    "color_palette_indian_nobility_high_01.png",
    "color_palette_indian_war_nobility_high_01.png",
    "color_palette_indian_war_nobility_low_01.png",
    "color_palette_indian_war_nobility_royal_01.png",
    "color_palette_jain.png",
    "color_palette_jewish.png",
    "color_palette_mena_clothing_high_nobility_01.png",
    "color_palette_mena_clothing_war_nobility_01_high.png",
    "color_palette_mena_clothing_war_nobility_01_low.png",
    "color_palette_mena_headgear_high_nobility_01.png",
    "color_palette_mena_headgear_imperial_01.png",
    "color_palette_mena_headgear_low_nobility_01.png",
    "color_palette_mena_headgear_royalty_01.png",
    "color_palette_mena_headgear_war_nobility_high_01.png",
    "color_palette_muslim_ihram_01.png",
    "color_palette_northern_common_01.png",
    "color_palette_northern_high_01.png",
    "color_palette_northern_low_01.png",
    "color_palette_northern_war_noble_01.png",
    "color_palette_placeholder.png",
    "color_palette_sp2_western_01.png",
    "color_palette_sp2_western_cloak_01.png",
    "color_palette_sp2_western_headgear_01.png",
    "color_palette_statue_indian_bronze_01.png",
    "color_palette_statue_indian_sandstone_01.png",
    "color_palette_statue_medi_marble_01.png",
    "color_palette_steppe_clothing_high_nobility_01.png",
    "color_palette_steppe_clothing_war_nobility_01_high.png",
    "color_palette_steppe_clothing_war_nobility_01_low.png",
    "color_palette_steppe_female_clothing_war_nobility_01_high.png",
    "color_palette_steppe_headgear_war_nobility_01_high.png",
    "color_palette_steppe_headgear_war_nobility_01_low.png",
    "color_palette_Sub_Saharan_common_01.png",
    "color_palette_Sub_Saharan_nobility_01.png",
    "color_palette_Sub_Saharan_nobility_headgear_01.png",
    "color_palette_tapestries_byzantine_01.png",
    "color_palette_tapestries_indian_01.png",
    "color_palette_tapestries_mena_01.png",
    "color_palette_tapestries_western_01.png",
    "color_palette_western_cloaks_high_01.png",
    "color_palette_western_common_01.png",
    "color_palette_western_common_big_trim_01.png",
    "color_palette_western_headgear_nobility_low_01.png",
    "color_palette_western_headgear_nobility_veil_01.png",
    "color_palette_western_legwear_common_01.png",
    "color_palette_western_linen_01.png",
    "color_palette_western_nobility_big_trim_high_01.png",
    "color_palette_western_nobility_big_trim_low_01.png",
    "color_palette_western_nobility_high_01.png",
    "color_palette_western_nobility_low_01.png",
    "color_palette_western_prison_01.png",
    "color_palette_western_stealth_01.png",
    "color_palette_western_surcoats_01.png",
    "color_palette_western_war_coa_high_01.png",
    "color_palette_western_war_coa_low_01.png",
    "color_palette_western_war_noble_high_01.png",
    "color_palette_western_war_noble_low_01.png",
    "color_palette_zoroastrian.png",
]





/*
function drawAndDownloadTexture(filename, callback) {
    txtCtx.clearRect(0, 0, txtCanvas.width, txtCanvas.height);
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        let randColor = getRandomColor();
        drawTinyPixel(txtCtx, j, i, randColor)
      }
    }
    requestAnimationFrame(function() {
      if (!canvas.toDataURL) {
        console.error('Canvas is tainted and cannot be converted to data URL.');
        return;
      }
      downloadImage(txtCanvas, filename);
      if (callback) callback(); // Proceed to next step only after download
    });
}

function downloadAllTextures() {
    drawAndDownloadTexture("color_palette_01_statue_western_wood_01.png", function() {
        drawAndDownloadTexture("color_palette_01_statue_western_wood_bare.png", function() {
            drawAndDownloadTexture("color_palette_01_statute_western_wood_body_01.png", function() {
                drawAndDownloadTexture("color_palette_01_statue_western_wood_hair.png", function() {
                    drawAndDownloadTexture("color_palette_abbasid_headgear_female_high_nobility_01.png", function() {
                        drawAndDownloadTexture("color_palette_abbasid_headgear_female_royalty_01.png", function() {
                            drawAndDownloadTexture("color_palette_abbasid_war_nobility_high_01.png", function() {
                                drawAndDownloadTexture("color_palette_abbasid_war_nobility_low_01.png", function() {
                                    drawAndDownloadTexture("color_palette_afrf_low_nob_01.png", function() {
                                        drawAndDownloadTexture("color_palette_afr_headgear_female_01.png", function() {
                                            drawAndDownloadTexture("color_palette_afr_high_01.png", function() {
                                                drawAndDownloadTexture("color_palette_afr_legwear.png", function() {
                                                    drawAndDownloadTexture("color_palette_afr_low_01.png", function() {
                                                        drawAndDownloadTexture("color_palette_african_pagan_high_01.png", function() {
                                                            drawAndDownloadTexture("color_palette_buddhist.png", function() {
                                                                drawAndDownloadTexture("color_palette_byzantine_common_01.png", function() {
                                                                    drawAndDownloadTexture("color_palette_byzantine_high_01.png", function() {
                                                                        drawAndDownloadTexture("color_palette_byzantine_low_01.png", function() {
                                                                            drawAndDownloadTexture("color_palette_byzantine_war_nobility_high_01.png", function() {
                                                                                drawAndDownloadTexture("color_palette_byzantine_war_nobility_low_01.png", function() {
                                                                                    drawAndDownloadTexture("color_palette_byzantine_wedding.png", function() {
                                                                                        drawAndDownloadTexture("color_palette_catholic_01.png", function() {
                                                                                            drawAndDownloadTexture("color_palette_catholic_devoted_01.png", function() {
                                                                                                drawAndDownloadTexture("color_palette_crusaders_01.png", function() {
                                                                                                    drawAndDownloadTexture("color_palette_crusaders_02.png", function() {
                                                                                                        drawAndDownloadTexture("color_palette_ep1_adventurer_01.png", function() {
                                                                                                            drawAndDownloadTexture("color_palette_ep1_jester_01.png", function() {
                                                                                                                drawAndDownloadTexture("color_palette_ep2_byzantine_war_nobility_high_01.png", function() {
                                                                                                                    drawAndDownloadTexture("color_palette_ep2_byzantine_war_nobility_low_01.png", function() {
                                                                                                                        drawAndDownloadTexture("color_palette_ep2_era4_western_nobility_01.png", function() {
                                                                                                                            drawAndDownloadTexture("color_palette_ep2_horse_01.png", function() {
                                                                                                                                drawAndDownloadTexture("color_palette_ep2_horse_02.png", function() {
                                                                                                                                    drawAndDownloadTexture("color_palette_ep2_steppe_war_nobility_01_low.png", function() {
                                                                                                                                        drawAndDownloadTexture("color_palette_ep2_western_cloak_nobility_01.png", function() {
                                                                                                                                            drawAndDownloadTexture("color_palette_ep2_western_headgear_com_01.png", function() {
                                                                                                                                                drawAndDownloadTexture("color_palette_ep2_western_headgear_nob_01.png", function() {
                                                                                                                                                    drawAndDownloadTexture("color_palette_ep2_western_nobility_01.png", function() {
                                                                                                                                                        drawAndDownloadTexture("a.png", function() {
                                                                                                                                                            drawAndDownloadTexture("b.png", function() {
                                                                                                                                                                drawAndDownloadTexture("c.png", function() {
                                                                                                                                                                    drawAndDownloadTexture("d.png", function() {
                                                                                                                                                                        drawAndDownloadTexture("e.png", function() {
                                                                                                                                                                            drawAndDownloadTexture("f.png", function() {
                                                                                                                                                                                drawAndDownloadTexture("g.png", function() {
                                                                                                                                                                                    drawAndDownloadTexture("h.png", function() {
                                                                                                                                                                                        drawAndDownloadTexture("i.png", function() {
                                                                                                                                                                                            drawAndDownloadTexture("j.png", function() {
                                                                                                                                                                                                drawAndDownloadTexture("k.png", function() {
                                                                                                                                                                                                    drawAndDownloadTexture("l.png", function() {
                                                                                                                                                                                                        drawAndDownloadTexture("m.png", function() {
                                                                                                                                                                                                            drawAndDownloadTexture("n.png", function() {
        
                                                                                                                                                                                                            })
                                                                                                                                                                                                        })
                                                                                                                                                                                                    })
                                                                                                                                                                                                })
                                                                                                                                                                                            })
                                                                                                                                                                                        })
                                                                                                                                                                                    })
                                                                                                                                                                                })
                                                                                                                                                                            })
                                                                                                                                                                        })
                                                                                                                                                                    })
                                                                                                                                                                })
                                                                                                                                                            })
                                                                                                                                                        })
                                                                                                                                                    })
                                                                                                                                                })
                                                                                                                                            })
                                                                                                                                        })
                                                                                                                                    })
                                                                                                                                })
                                                                                                                            })
                                                                                                                        })
                                                                                                                    })
                                                                                                                })
                                                                                                            })
                                                                                                        })
                                                                                                    })
                                                                                                })
                                                                                            })
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}
*/
