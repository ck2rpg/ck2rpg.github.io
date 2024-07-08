function drawRiver(x, y) {
    let running = true;
    let startingX = x;
    let startingY = y;
    let endingX;
    let endingY
    let next = xy(x, y)
    if (next.riverRun) {
  
    } else {
      next.riverRun = 0;
    }
    let arr = []
    let count = 0
    let used = [];
    let riverWidth = 1;
    let courseDirection
    let reachedOcean = false;
    let oceanCounter = 0;
    let last;
    let lastX;
    let lastY;
    let tm;
    if (next.highPointRiver) {
  
    } else {
      while (running === true) {
        count += 1;
        next.dropToWater = true;
        next.drawableRiver = true;
        next.highPointRiver = true;
        next.oldElevation = next.elevation;
        used.push(next)
        //drawRiverCell(next, riverWidth, courseDirection);
        arr = [];
        try {
          let w = xy(next.x - 1, next.y);
          let e = xy(next.x + 1, next.y);
          //let ne = xy(next.x + 1, next.y + 1);
          //let sw = xy(next.x - 1, next.y - 1);
          let n = xy(next.x, next.y + 1);
          let s = xy(next.x, next.y - 1);
          //let nw = xy(next.x - 1, next.y + 1);
          //let se = xy(next.x + 1, next.y - 1)
          pushIfNotUsed(w, used, arr)
          pushIfNotUsed(e, used, arr);
          pushIfNotUsed(n, used, arr);
          pushIfNotUsed(s, used, arr);
          
    
          //pushIfNotUsed(ne, used, arr);
          //pushIfNotUsed(sw, used, arr);
    
    
          //pushIfNotUsed(nw, used, arr);
          //pushIfNotUsed(se, used, arr);
          if (arr.length === 0) {
            running = false;
          }
          arr.sort((a, b) => (a.elevation > b.elevation) ? 1 : -1)
          if (arr[0].highPointRiver) {
            last = xy(lastX, lastY)
            next.comingFrom = getRealDirection(next, last);
            next.headingTo = getRealDirection(next, arr[0]);
            next.riverRun = last.riverRun;
            next.riverRun += 1;
            if (arr[0].riverStartGreen) {
              arr[0].comingFrom = reverseDirection(next.headingTo)
              arr[0].riverStartGreen = false;
              
            } else {
              tributaryMerge(next, arr[0])
            }
            if (arr[0].riverRun) {
              arr[0].riverRun += next.riverRun
            } else {
              arr[0].riverRun = next.riverRun;
            }
  
            
            running = false;
            tm = true;
          } else if (used.length === 1) {
            next.headingTo = getRealDirection(next, arr[0]);
            next.riverRun += 1;
          } else {
            last = xy(lastX, lastY)
            next.riverRun = last.riverRun;
            next.riverRun += 1;
            next.comingFrom = getRealDirection(next, last);
            next.headingTo = getRealDirection(next, arr[0]);
            if (next.elevation > last.elevation) {
              next.elevation = last.elevation - 1;
              if (next.elevation < limits.seaLevel.upper) {
                next.elevation = limits.seaLevel.upper + 1;
              }
            }
          }
    
          next.river = true
          lastX = next.x;
          lastY = next.y;
          next = arr[0];
    
    
          next.riverWidth = riverWidth
          endingX = next.x;
          endingY = next.y
          if (next.elevation < limits.seaLevel.upper) {
            reachedOcean = true;
            oceanCounter += 1;
          } else {
            if (oceanCounter) {
              running = false;
            }
          }
          if ((reachedOcean && oceanCounter > settings.riverIntoOcean) || count > 10000) {
            running = false
          }
        } catch {
          running = false
        }
      }
      if (reachedOcean || (tm)) {
        if (tm) {
  
        } else {
          used[0].riverStartGreen = true;
        }
        
        used[used.length - 1].riverEndRed = true;
        let river = {};
        river.cells = used
        for (let z = 0; z < river.cells.length; z++) {
          let c = river.cells[z]
          c.riverObject = river;
        }
        river.startingX = used[0].x;
        river.startingY = used[0].y;
        river.endingX = endingX
        river.endingY = endingY
        world.rivers.push(river)
        river.id = `Placeholder River Name ${world.rivers.length }`
      } else {
        for (let i = 0; i < used.length; i++) {
          used[i].river = false;
          used[i].dropToWater = false;
          used[i].drawableRiver = false;
          used[i].highPointRiver = false;
          used[i].elevation = used[i].oldElevation
          used[i].riverStartGreen = false;
          used[i].riverEndRed = false;
          used[i].tributaryMerge = undefined
          used[i].riverRun -= 1;
        }
      }
    }
    
    
  }
  
  function rerunRivers() {
    world.rivers = [];
    let arr = []
    for (let i = 0; i < world.height; i++) {
      for (let j = 0; j < world.width; j++) {
        let cell = xy(j, i)
        cell.river = false;
        cell.drawableRiver = false;
        cell.highPointRiver = false;
        cell.riverStartGreen = false;
        cell.riverEndRed = false;
        cell.tributaryMerge = undefined;
        cell.riverRun = -1;
        cell.headingTo = undefined;
        cell.comingFrom = undefined;
        arr.push(cell);
      }
    }
    arr.sort((a, b) => (a.elevation < b.elevation) ? 1 : -1)
    for (let i = 0; i < arr.length; i++) {
  
      let tooClose = false
      let wet = arr[i].moisture > 100 ? true : false
      for (let n = 0; n < world.rivers.length; n++) {
        try {
          let dist = getDistance(arr[i].x, arr[i].y, world.rivers[n].startingX, world.rivers[n].startingY);
          if (dist < settings.riversDistance) {
            tooClose = true
          }
        } catch {
          tooClose = true;
        }
  
      }
      if (tooClose === false && wet) {
        let cell = xy(arr[i].x, arr[i].y)
        if (cell.elevation < limits.seaLevel.upper) {
  
        } else {
          drawRiver(cell.x, cell.y)
        }
      }
    }
  
    
    drawWorld()
  
  }
  
  function riversFromHighPoints() {
    let arr = world.tectonics.spreadingLine;
    arr.sort((a, b) => (a.elevation < b.elevation) ? 1 : -1)
    for (let i = 0; i < 2000; i++) {
      let tooClose = false
      for (let n = 0; n < world.rivers.length; n++) {
        try {
          let dist = getDistance(arr[i].x, arr[i].y, world.rivers[n].startingX, world.rivers[n].startingY);
          if (dist < 2) {
            tooClose = true
          }
        } catch {
          tooClose = true;
        }
  
      }
      if (tooClose === false) {
        let cell = xy(arr[i].x, arr[i].y)
        if (cell.elevation < limits.seaLevel.upper) {
  
        } else {
          drawRiver(arr[i].x, arr[i].y)
        }
      }
    }
  }
  
  function drawHPRivers() {
    for (let i = 0; i < world.rivers.length; i++) {
      let river = world.rivers[i]
      for (let j = 0; j < river.cells.length; j++) {
        let cell = river.cells[j]
        if (cell.riverStartGreen) {
          drawRiverTemplate(cell)
        } else if (cell.riverEndRed) {
          drawRiverTemplate(cell)
        } else if (cell.highPointRiver) {
          drawRiverTemplate(cell, j)
        } else {
          let c = Math.floor((cell.elevation / 2))
          if (cell.riverDrawn) {
    
          } else {
            if (c > limits.seaLevel.upper) {
              c = "#ffffff"
            }
            if (c <= limits.seaLevel.upper || cell.river || cell.lake) {
              c = "#ff0080";
            }
            cell.rgb = `${c}`
            drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
          }
        }
      }
    }
  }
  
  function drawRiversTransparent() {
    for (let i = 0; i < world.rivers.length; i++) {
      let river = world.rivers[i]
      for (let j = 0; j < river.cells.length; j++) {
        let cell = river.cells[j]
        if (cell.riverStartGreen) {
          drawRiverTemplateTransparent(cell)
        } else if (cell.riverEndRed) {
          drawRiverTemplateTransparent(cell)
        } else if (cell.highPointRiver) {
          drawRiverTemplateTransparent(cell, j)
        }
      }
    }
  }

  function hpRivers() {
    riversFromHighPoints()
    drawHPRivers();
  }

  function drawRiverTemplate(cell, r) {
    //have to change this and drawRiverTemplateTransparent at same time
    let ran;
    if (cell.riverRun) {
      ran = cell.riverRun;
    } else {
      ran = 0;
    }
    let template = GID("rivertemp");
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
  
  
    if (possibilities.length > 0 && cell.highPointRiver) {
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
      ctx.drawImage(template, tempX, tempY, 16, 16, cell.x * settings.pixelSize, cell.y * settings.pixelSize, 16, 16)
      cell.riverDrawn = true;
    } else {
      let color = "white";
      cell.rgb = `${color}`
      drawSmallPixel(ctx, cell.x, cell.y, cell.rgb)
    }
    if (cell.tributaryMerge) {
      ctx.drawImage(template, cell.tributaryMerge[0], cell.tributaryMerge[1], 16, 16, cell.x * settings.pixelSize, cell.y * settings.pixelSize, 16, 16)
      cell.riverDrawn = true;
    }
  
  }

  function riverReplace(possible, arr) {
    for (let i = 0; i < arr.length; i++) {
      possible = possible.replace(arr[i], "")
    }
    return possible
  }

  function connectRiverCorners() {
    for (i = 0; i < world.rivers.length; i++) {
      let river = world.rivers[i]
      for (let n = 0; n < river.cells.length; n++) {
        let cell = river.cells[n]
        let neighbors = getNeighbors(cell.x, cell.y)
        if (neighbors) {
          let nw = neighbors[3]
          let n = neighbors[5]
          let ne = neighbors[7]
          let w = neighbors[0]
          let e = neighbors[1]
          let sw = neighbors[6]
          let s = neighbors[4]
          let se = neighbors[2]
          if (nw && nw.dropToWater && !n.dropToWater && !w.dropToWater) {
            w.dropToWater = true
            w.drawableRiver = true;
            w.highPointRiver = true;
          }
          if (ne && n && e && ne.dropToWater && !n.dropToWater && !e.dropToWater) {
            n.dropToWater = true;
            n.drawableRiver = true;
            n.highPointRiver = true;
          }
          if (sw && s && w && sw.dropToWater && !s.dropToWater && !w.dropToWater) {
            s.dropToWater = true;
            s.drawableRiver = true;
            s.highPointRiver = true;
          }
          if (se && s && e && se.dropToWater && !s.dropToWater && !e.dropToWater) {
            e.dropToWater = true;
            e.drawableRiver = true;
            e.highPointRiver = true;
          }
        }
      }
    }
  }

  function tributaryMerge(last, next) {
    //override coordinates if a river runs into another river
    if (last.headingTo === "S") {
      //This is a situation where an incoming tributary joins a river from the north (i.e., tributary heading south), so next would not be coming from north. We look therefore to a joined river coming from east, west, and south and don't need to check whether it is flowing north
      if ((next.comingFrom === "S" && next.headingTo === "W") || (next.comingFrom === "W" && next.headingTo === "S")) {
        next.tributaryMerge = [32, 624]
      } else if (next.comingFrom === "S" && next.headingTo === "E") {
        next.tributaryMerge = [0, 624]
      } else if ((next.comingFrom === "E" && next.headingTo === "W") || (next.comingFrom === "W" && next.headingTo === "E")) {
        next.tributaryMerge = [16, 624]
      } else if (next.comingFrom === "E" && next.headingTo === "S") {
        next.tributaryMerge = [0, 624]
      } else if (next.comingFrom === "W" && next.headingTo === "S") {
        next.tributaryMerge = [32, 624]
      } 
    }
    if (last.headingTo === "N") {
      //this is a situation where an incoming tributary joins a river from the south
      if ((next.comingFrom === "W" && next.headingTo === "E") || next.comingFrom === "E" && next.headingTo === "W") {
        next.tributaryMerge = [16, 656] //bottom middle template
      } else if ((next.comingFrom === "N" && next.headingTo === "W") || (next.comingFrom === "W" && next.headingTo === "N")) {
        next.tributaryMerge = [32, 656] //bottom right template
      } else if (next.comingFrom === "N" && next.headingTo === "E" || (next.comingFrom === "E" && next.headingTo === "N")) {
        next.tributaryMerge = [0, 656] //bottom left template
      } 
    }
    if (last.headingTo === "W") {
      //this is a situation where an incoming tributary joins a river from the east
      if ((next.comingFrom === "W" && next.headingTo === "S") || (next.comingFrom === "S" && next.headingTo === "W")) {
        //top right template
        next.tributaryMerge = [80, 624]
      } else if ((next.comingFrom === "S" && next.headingTo === "N") || (next.comingFrom === "N" && next.headingTo === "S")) {
        //middle right template
        next.tributaryMerge = [80, 640]
      } else if ((next.comingFrom === "N" && next.headingTo === "W") || (next.comingFrom === "W" && next.headingTo === "N")) {
        //bottom right template
        next.tributaryMerge = [80, 656]
      }
    }
    if (last.headingTo === "E") {
      if ((next.comingFrom === "S" && next.headingTo === "E") || (next.comingFrom === "E" && next.headingTo === "S")) {
        next.tributaryMerge = [48, 624] //top right template
      } else if ((next.comingFrom === "S" && next.headingTo === "N") || (next.comingFrom === "N" && next.headingTo === "S")) {
        next.tributaryMerge = [48, 640] //middle right template
      } else if ((next.comingFrom === "N" && next.headingTo === "E") || (next.comingFrom === "E" && next.headingTo === "W")) {
        next.tributaryMerge = [48, 656] //bottom right template
      }
    }
  }

  function riverPixel(x, y) {
    drawSmallPixel(ctx, x, y, `rgb(0, 0, 255)`)
  }
  
  function drawRiverCell(cell, width, direction) {
    riverPixel(cell.x, cell.y)
  }

  