function drawRiverTemplateTransparent(cell, r) {
    let ran;
    if (cell.riverRun) {
      ran = cell.riverRun;
    } else {
      ran = 0;
    }
    let template2 = GID("river-temp-trans");
    let neighbors = getNeighbors(cell.x, cell.y);
    let drawableNeighbors = 0;
    let nCount = 0;
    let others = []
    let nums = []
    if (neighbors) {
      for (let i = 0; i < neighbors.length; i++) {
        if (neighbors[i] && neighbors[i].highPointRiver) {
          others.push(neighbors[i])
          nums.push(i)
          nCount += 1;
        }
      }
    }
  
    let possibilities = "01234567" // 3nw 5n 7ne 0w (5)place 1e 6sw 4s 2se - leftover from the way getNeighbors returns array
    let sideNeighbors = []
      
    if (cell.comingFrom) {
      
      if (cell.comingFrom === "S") {
        possibilities = riverReplace(possibilities, ["5", "4", "6", "2"])
      }
  
      if (cell.comingFrom === "N") {
        possibilities = riverReplace(possibilities, ["5", "4", "3", "7"])
  
  
      }
  
      if (cell.comingFrom === "E") {
        possibilities = riverReplace(possibilities, ["1", "0", "2", "7"])
      }
  
      if (cell.comingFrom === "W") {
        possibilities = riverReplace(possibilities, ["1", "0", "6", "3"])
      }
  
    }
  
    if (cell.headingTo) {
      
      if (cell.headingTo === "S") {
        possibilities = riverReplace(possibilities, ["5", "4", "3", "7"])
  
      }
  
      if (cell.headingTo === "N") {
        possibilities = riverReplace(possibilities, ["5", "4", "6", "2"])
      }
  
      if (cell.headingTo === "E") {
        possibilities = riverReplace(possibilities, ["1", "0", "6", "3"])
      }
  
      if (cell.headingTo === "W") {
        possibilities = riverReplace(possibilities, ["1", "0", "2", "7"])
      }  
    }
  
    if (cell.comingFrom && cell.headingTo) {
      if ((cell.headingTo === "N" && cell.comingFrom === "S") || (cell.comingFrom === "N" && cell.headingTo === "S")) {
        let westNeighbor = xy(cell.x - 1, cell.y);
        let eastNeighbor = xy(cell.x + 1, cell.y);
        sideNeighbors.push(westNeighbor);
        sideNeighbors.push(eastNeighbor);
        possibilities = riverReplace(possibilities, ["3", "5", "7", "6", "4", "2"])
      } 
      if ((cell.headingTo === "W" && cell.comingFrom === "E") || (cell.headingTo === "E" && cell.comingFrom === "W")) {
        let northNeighbor = xy(cell.x, cell.y - 1)
        let southNeighbor = xy(cell.x, cell.y + 1)
        sideNeighbors.push(northNeighbor);
        sideNeighbors.push(southNeighbor);
        possibilities = riverReplace(possibilities, ["3", "7", "0", "1", "6", "2"])
      }
      if ((cell.headingTo === "W" && cell.comingFrom === "N") || (cell.headingTo === "N" && cell.comingFrom === "W")) {
        possibilities = "2"
        let southNeighbor = xy(cell.x, cell.y + 1);
        let eastNeighbor = xy(cell.x + 1, cell.y);
        sideNeighbors.push(southNeighbor)
        sideNeighbors.push(eastNeighbor);
      }
      if ((cell.headingTo === "E" && cell.comingFrom === "N") || (cell.headingTo === "N" && cell.comingFrom === "E")) {
        let westNeighbor = xy(cell.x - 1, cell.y);
        let eastNeighbor = xy(cell.x + 1, cell.y);
        sideNeighbors.push(westNeighbor);
        sideNeighbors.push(eastNeighbor)
        possibilities = "6"
      }
      if ((cell.headingTo === "S" && cell.comingFrom === "E") || (cell.headingTo === "E" && cell.comingFrom === "S")) {
        let westNeighbor = xy(cell.x - 1, cell.y);
        let northNeighbor = xy(cell.x, cell.y - 1)
        sideNeighbors.push(westNeighbor);
        sideNeighbors.push(northNeighbor);
        possibilities = "3"
      }
      if ((cell.headingTo === "W" && cell.comingFrom === "S") || (cell.headingTo === "S" && cell.comingFrom === "W")) {
        let northNeighbor = xy(cell.x, cell.y - 1)
        let eastNeighbor = xy(cell.x + 1, cell.y);
        sideNeighbors.push(northNeighbor);
        sideNeighbors.push(eastNeighbor);
        possibilities = "7"
      }
    }
  
    cell.possibilities = possibilities
  
    let tempX;
    let tempY;
    //refactor to get tempY based on one of the three
    if (possibilities.indexOf("0") > -1) {
      //left middle image
      tempX = [0, 48, 96, 144, 192, 240, 288, 336, 384, 432][getRandomInt(0, 9)]
      if (ran < 3) {
        tempY = 16
      } else if (ran < 7) {
        tempY = 64
      } else if (ran < 9) {
        tempY = 112
      } else if (ran < 11) {
        tempY = 160
      } else if (ran < 13) {
        tempY = 208
      } else if (ran < 15) {
        tempY = 256
      } else if (ran < 17) {
        tempY = 304
      } else if (ran < 23) {
        tempY = 352
      } else if (ran < 25) {
        tempY = 400
      } else if (ran < 27) {
        tempY = 448
      } else if (ran < 29) {
        tempY = 496
      } else if (ran < 31) {
        tempY = 544
      } else {
        tempY = 592
      }
    } else if (possibilities.indexOf("1") > -1) {
      //1 is neighboring cell to east of current cell? Not sure if I'm right on this one. It seems to be calling the middle cell
      //tempX = [16, 64, 112, 160, 208, 256, 304, 352, 400, 448][getRandomInt(0, 9)]
      tempX = [0, 48, 96, 144, 192, 240, 288, 336, 384, 432][getRandomInt(0, 9)]
      if (ran < 3) {
        tempY = 16
      } else if (ran < 7) {
        tempY = 64
      } else if (ran < 9) {
        tempY = 112
      } else if (ran < 11) {
        tempY = 160
      } else if (ran < 13) {
        tempY = 208
      } else if (ran < 15) {
        tempY = 256
      } else if (ran < 17) {
        tempY = 304
      } else if (ran < 23) {
        tempY = 352
      } else if (ran < 25) {
        tempY = 400
      } else if (ran < 27) {
        tempY = 448
      } else if (ran < 29) {
        tempY = 496
      } else if (ran < 31) {
        tempY = 544
      } else {
        tempY = 592
      }
    } else if (possibilities.indexOf("2") > -1) {
      tempX = [32, 80, 128, 176, 224, 272, 320, 368, 416, 464][getRandomInt(0, 9)]
      if (ran < 3) {
        tempY = 32
      } else if (ran < 7) {
        tempY = 80
      } else if (ran < 9) {
        tempY = 128
      } else if (ran < 11) {
        tempY = 176
      } else if (ran < 13) {
        tempY = 224
      } else if (ran < 15) {
        tempY = 272
      } else if (ran < 17) {
        tempY = 320
      } else if (ran < 23) {
        tempY = 368
      } else if (ran < 25) {
        tempY = 416
      } else if (ran < 27) {
        tempY = 464
      } else if (ran < 29) {
        tempY = 512
      } else if (ran < 31) {
        tempY = 560
      } else {
        tempY = 608
      }
    } else if (possibilities.indexOf("3") > -1) {
      tempX = [0, 48, 96, 144, 192, 240, 288, 336, 384, 432][getRandomInt(0, 9)]
      if (ran < 3) {
        tempY = 0
      } else if (ran < 7) {
        tempY = 48
      } else if (ran < 9) {
        tempY = 96
      } else if (ran < 11) {
        tempY = 144
      } else if (ran < 13) {
        tempY = 192
      } else if (ran < 15) {
        tempY = 240
      } else if (ran < 17) {
        tempY = 288
      } else if (ran < 23) {
        tempY = 336
      } else if (ran < 25) {
        tempY = 384
      } else if (ran < 27) {
        tempY = 432
      } else if (ran < 29) {
        tempY = 480
      } else if (ran < 31) {
        tempY = 528
      } else {
        tempY = 576
      }
    } else if (possibilities.indexOf("4") > -1) {
      tempX = [16, 64, 112, 160, 208, 256, 304, 352, 400, 448][getRandomInt(0, 9)]
      if (ran < 3) {
        tempY = 32
      } else if (ran < 7) {
        tempY = 80
      } else if (ran < 9) {
        tempY = 128
      } else if (ran < 11) {
        tempY = 176
      } else if (ran < 13) {
        tempY = 224
      } else if (ran < 15) {
        tempY = 272
      } else if (ran < 17) {
        tempY = 320
      } else if (ran < 23) {
        tempY = 368
      } else if (ran < 25) {
        tempY = 416
      } else if (ran < 27) {
        tempY = 464
      } else if (ran < 29) {
        tempY = 512
      } else if (ran < 31) {
        tempY = 560
      } else {
        tempY = 608
      }
    } else if (possibilities.indexOf("5") > -1) {
      tempX = [16, 64, 112, 160, 208, 256, 304, 352, 400, 448][getRandomInt(0, 9)]
      if (ran < 3) {
        tempY = 0
      } else if (ran < 7) {
        tempY = 48
      } else if (ran < 9) {
        tempY = 96
      } else if (ran < 11) {
        tempY = 144
      } else if (ran < 13) {
        tempY = 192
      } else if (ran < 15) {
        tempY = 240
      } else if (ran < 17) {
        tempY = 288
      } else if (ran < 23) {
        tempY = 336
      } else if (ran < 25) {
        tempY = 384
      } else if (ran < 27) {
        tempY = 432
      } else if (ran < 29) {
        tempY = 480
      } else if (ran < 31) {
        tempY = 528
      } else {
        tempY = 576
      }
    } else if (possibilities.indexOf("6") > -1) {
      tempX = [0, 48, 96, 144, 192, 240, 288, 336, 384, 432][getRandomInt(0, 9)]
      if (ran < 3) {
        tempY = 32
      } else if (ran < 7) {
        tempY = 80
      } else if (ran < 9) {
        tempY = 128
      } else if (ran < 11) {
        tempY = 176
      } else if (ran < 13) {
        tempY = 224
      } else if (ran < 15) {
        tempY = 272
      } else if (ran < 17) {
        tempY = 320
      } else if (ran < 23) {
        tempY = 368
      } else if (ran < 25) {
        tempY = 416
      } else if (ran < 27) {
        tempY = 464
      } else if (ran < 29) {
        tempY = 512
      } else if (ran < 31) {
        tempY = 560
      } else {
        tempY = 608
      }
    } else if (possibilities.indexOf("7") > -1) {
      tempX = [32, 80, 128, 176, 224, 272, 320, 368, 416, 464][getRandomInt(0, 9)]
      if (ran < 3) {
        tempY = 0
      } else if (ran < 7) {
        tempY = 48
      } else if (ran < 9) {
        tempY = 96
      } else if (ran < 11) {
        tempY = 144
      } else if (ran < 13) {
        tempY = 192
      } else if (ran < 15) {
        tempY = 240
      } else if (ran < 17) {
        tempY = 288
      } else if (ran < 23) {
        tempY = 336
      } else if (ran < 25) {
        tempY = 384
      } else if (ran < 27) {
        tempY = 432
      } else if (ran < 29) {
        tempY = 480
      } else if (ran < 31) {
        tempY = 528
      } else {
        tempY = 576
      }
    }
  
  
    if (cell.tributaryMerge) {
      //console.log(`Drawing merged river at x: ${cell.x * settings.pixelSize} y: ${cell.y * settings.pixelSize}`)
      ctx.drawImage(template2, cell.tributaryMerge[0], cell.tributaryMerge[1], 16, 16, cell.x * settings.pixelSize, cell.y * settings.pixelSize, 16, 16)
      cell.riverDrawn = true;
    } else if (possibilities.length > 0 && cell.highPointRiver) {
      let n1 = sideNeighbors[0]
      let n2 = sideNeighbors[1];
      if (cell.elevation < 50) {
        if ((n1 && n1.elevation) && (n2 && n2.elevation)) {
          if (n1.elevation > cell.elevation && n2.elevation > cell.elevation) {
            cell.forceFloodplain = true;
          }
        }
      }
  
      
  
      if (cell.riverStartGreen) {
        //add check to make sure it doesn't start over another?
        if (cell.headingTo === "N") {
          tempX = 464
          tempY = 2032
        } else if (cell.headingTo === "S") {
          tempX = 496
          tempY = 2032
        } else if (cell.headingTo === "W") {
          tempX = 496
          tempY = 2000
        } else if (cell.headingTo === "E") {
          tempX = 464
          tempY = 2000
        }
      }
      ctx.drawImage(template2, tempX, tempY, 16, 16, cell.x * settings.pixelSize, cell.y * settings.pixelSize, 16, 16)
      cell.riverDrawn = true;
    } 

  
  }