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
    drawAndDownload("colorful", "colorful.png", function() {
      drawAndDownload("paper", "paper.png", function() {
        drawAndDownload("papyrus", "papyrus.png", function() {
          drawAndDownload("beach_02_mask", "beach_02_mask.png", function() {
            drawAndDownload("beach_02_mediterranean_mask", "beach_02_mediterranean_mask.png", function() {
              drawAndDownload("beach_02_pebbles_mask", "beach_02_pebbles_mask.png", function() {
                drawAndDownload("coastline_cliff_brown_mask", "coastline_cliff_brown_mask.png", function() {
                  drawAndDownload("coastline_cliff_desert_mask", "coastline_cliff_desert_mask.png", function() {
                    drawAndDownload("coastline_cliff_grey_mask", "coastline_cliff_grey_mask.png", function() {
                      drawAndDownload("desert_01_mask", "desert_01_mask.png", function() {
                        drawAndDownload("desert_02_mask", "desert_02_mask.png", function() {
                          drawAndDownload("desert_cracked_mask", "desert_cracked_mask.png", function() {
                            drawAndDownload("desert_flat_01_mask", "desert_flat_01_mask.png", function() {
                              drawAndDownload("desert_rocky_mask", "desert_rocky_mask.png", function() {
                                drawAndDownload("desert_wavy_01_larger_mask", "desert_wavy_01_larger_mask.png", function() {
                                  drawAndDownload("desert_wavy_01_mask", "desert_wavy_01_mask.png", function() {
                                    drawAndDownload("drylands_01_cracked_mask", "drylands_01_cracked_mask.png", function() {
                                      drawAndDownload("drylands_01_grassy_mask", "drylands_01_grassy_mask.png", function() {
                                        drawAndDownload("drylands_01_mask", "drylands_01_mask.png", function() {
                                          drawAndDownload("farmland_01_mask", "farmland_01_mask.png", function() {
                                            drawAndDownload("floodplains_01_mask", "floodplains_01_mask.png", function() {
                                              drawAndDownload("forest_jungle_01_mask", "forest_jungle_01_mask.png", function() {
                                                drawAndDownload("forest_leaf_01_mask", "forest_leaf_01_mask.png", function() {
                                                  drawAndDownload("forest_pine_01_mask", "forest_pine_01_mask.png", function() {
                                                    drawAndDownload("forestfloor_02_mask", "forestfloor_02_mask.png", function() {
                                                      drawAndDownload("forestfloor_mask", "forestfloor_mask.png", function() {
                                                        drawAndDownload("hills_01_mask", "hills_01_mask.png", function() {
                                                          drawAndDownload("hills_01_rocks_mask", "hills_01_rocks_mask.png", function() {
                                                            drawAndDownload("hills_01_rocks_medi_mask", "hills_01_rocks_medi_mask.png", function() {
                                                              drawAndDownload("hills_01_rocks_small_mask", "hills_01_rocks_small_mask.png", function() {
                                                                drawAndDownload("india_farmlands_mask", "india_farmlands_mask.png", function() {
                                                                  drawAndDownload("medi_dry_mud_mask", "medi_dry_mud_mask.png", function() {
                                                                    drawAndDownload("medi_farmlands_mask", "medi_farmlands_mask.png", function() {
                                                                      drawAndDownload("medi_grass_01_mask", "medi_grass_01_mask.png", function() {
                                                                        drawAndDownload("medi_grass_02_mask", "medi_grass_02_mask.png", function() {
                                                                          drawAndDownload("medi_hills_01_mask", "medi_hills_01_mask.png", function() {
                                                                            drawAndDownload("medi_lumpy_grass_mask", "medi_lumpy_grass_mask.png", function() {
                                                                              drawAndDownload("medi_noisy_grass_mask", "medi_noisy_grass_mask.png", function() {
                                                                                drawAndDownload("mountain_02_b_mask", "mountain_02_b_mask.png", function() {
                                                                                  drawAndDownload("mountain_02_c_mask", "mountain_02_c_mask.png", function() {
                                                                                    drawAndDownload("mountain_02_c_snow_mask", "mountain_02_c_snow_mask.png", function() {
                                                                                      drawAndDownload("mountain_02_d_desert_mask", "mountain_02_d_desert_mask.png", function() {
                                                                                        drawAndDownload("mountain_02_d_mask", "mountain_02_d_mask.png", function() {
                                                                                          drawAndDownload("mountain_02_d_snow_mask", "mountain_02_d_snow_mask.png", function() {
                                                                                            drawAndDownload("mountain_02_d_valleys_mask", "mountain_02_d_valleys_mask.png", function() {
                                                                                              drawAndDownload("mountain_02_desert_c_mask", "mountain_02_desert_c_mask.png", function() {
                                                                                                drawAndDownload("mountain_02_desert_mask", "mountain_02_desert_mask.png", function() {
                                                                                                  drawAndDownload("mountain_02_mask", "mountain_02_mask.png", function() {
                                                                                                    drawAndDownload("mountain_02_snow_mask", "mountain_02_snow_mask.png", function() {
                                                                                                      drawAndDownload("mud_wet_01_mask", "mud_wet_01_mask.png", function() {
                                                                                                        drawAndDownload("northern_hills_01_mask", "northern_hills_01_mask.png", function() {
                                                                                                          drawAndDownload("northern_plains_01_mask", "northern_plains_01_mask.png", function() {
                                                                                                            drawAndDownload("oasis_mask", "oasis_mask.png", function() {
                                                                                                              drawAndDownload("plains_01_desat_mask", "plains_01_desat_mask.png", function() {
                                                                                                                drawAndDownload("plains_01_dry_mask", "plains_01_dry_mask.png", function() {
                                                                                                                  drawAndDownload("plains_01_mask", "plains_01_mask.png", function() {
                                                                                                                    drawAndDownload("plains_01_noisy_mask", "plains_01_noisy_mask.png", function() {
                                                                                                                      drawAndDownload("plains_01_rough_mask", "plains_01_rough_mask.png", function() {
                                                                                                                        drawAndDownload("snow_mask", "snow_mask.png", function() {
                                                                                                                          drawAndDownload("steppe_01_mask", "steppe_01_mask.png", function() {
                                                                                                                            drawAndDownload("steppe_bushes_mask", "steppe_bushes_mask.png", function() {
                                                                                                                              drawAndDownload("steppe_rocks_mask", "steppe_rocks_mask.png", function() {
                                                                                                                                drawAndDownload("wetlands_02_mask", "wetlands_02_mask.png", function() {
                                                                                                                                  drawAndDownload("wetlands_02_mud_mask", "wetlands_02_mud_mask.png", function() {
                                                                                                                                    drawAndDownload("book", "book.png", function() {
                                                                                                                                      world.drawingType = "rivermap"
                                                                                                                                      drawWorld();
                                                                                                                                      drawHPRivers();
                                                                                                                                      downloadImage(canvas, "rivers.png");
                                                                                                                                      drawHeightmapFromScratch()
                                                                                                                                      downloadImage(canvas, "heightmap.png");
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
        });
      });
    });
  }