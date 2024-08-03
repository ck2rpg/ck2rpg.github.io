function GID(el) {
  return document.getElementById(el);
}

function eqDist(y) {
  const mapHeight = settings.height; // The height of the map
  const equatorY = settings.equator; // The y-coordinate of the equator

  // Calculate the distance from the equator
  const distanceFromEquator = Math.abs(y - equatorY);

  return distanceFromEquator;
}

function calculateDistanceFromEquator(province) {
  const mapHeight = settings.height; // The height of the map
  const equatorY = mapHeight / 2; // The y-coordinate of the equator

  // Calculate the distance from the equator
  const distanceFromEquator = Math.abs(province.y - equatorY);

  return distanceFromEquator;
}

function getRandomColor() {
  return `rgb(${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)})`
}

function pushIfNotUsed(cell, usedArr, pushArr) {
    if (usedArr.indexOf(cell) === -1) {
        pushArr.push(cell)
    } else {
        return false
    }
}

function pickFrom(arr) {
    return arr[getRandomInt(0, arr.length - 1)]
}

function pickUniqFrom(arr, arr2) {
    let foundUniq = false;
    while (foundUniq === false) {
        let n = pickFrom(arr);
        let i = arr2.indexOf(n)
        if (i > -1) {
        arr.splice(i, 1);
        } else {
        arr2.push(n)
        foundUniq = true
        }
    }
}

function pickUniqFromWithoutDelete(arr, arr2) {
    let foundUniq = false;
    while (foundUniq === false) {
        let n = pickFrom(arr);
        let i = arr2.indexOf(n)
        if (i > -1) {

        } else {
        arr2.push(n)
        foundUniq = true
        }
    }
}

function pickUniqOrDiscard(arr, arr2) {
    let n = pickFrom(arr);
    let i = arr2.indexOf(n);
    if (i > -1) {

    } else {
        arr2.push(n)
    }
}

function subsetOf(arr) {
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
        let rand = getRandomInt(0, 2);
        if (rand === 1) {
        newArr.push(arr[i])
        }
    }
    if (newArr.length === 0) {
        newArr.push(pickFrom(arr))
    }
    return newArr
}

var randomProperty = function (obj) {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};

function capitalize(word) {
    word = word.charAt(0).toUpperCase()
    + word.slice(1)
    return word;
}

function rando() {
    return `${pickFrom(randomAdjectives)}` + `${pickFrom(randomNouns)}`
    let t = ""
    let letters = ["b", "c", "d", "f", "g", "h", "k", "m", "n"]
    for (let i = 0; i < 10; i++) {
        t += letters[getRandomInt(0, letters.length - 1)]
    }
    return t;
}

function getRandomInt(min, max) {
    //inclusive on both sides
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


//figure out difference between getDirection and getRealDirection and which one should be used.

function getDirection(cell1, cell2) {
  let ew = ""
  let ns = ""
  if (cell1.x < cell2.x) {
    ew = "E"
  } else if (cell1.x > cell2.x) {
    ew = "W"
  } else {
    ew = ""
  }
  if (cell1.y < cell2.y) {
    ns = "N"
  } else if (cell1.y > cell2.y) {
    ns = "S"
  } else {
    ns = ""
  }
  return `${ns}${ew}`
}

function getRealDirection(cell1, cell2) {
  let ew = ""
  let ns = ""
  if (cell1.x < cell2.x) {
    ew = "E"
  } else if (cell1.x > cell2.x) {
    ew = "W"
  } else {
    ew = ""
  }
  if (cell1.y < cell2.y) {
    ns = "S"
  } else if (cell1.y > cell2.y) {
    ns = "N"
  } else {
    ns = ""
  }
  return `${ns}${ew}`
}

function reverseDirection(d) {
  if (d === "N") {
    return "S"
  } else if (d === "S") {
    return "N"
  } else if (d === "E") {
    return "W"
  } else if (d === "W") {
    return "E"
  }
}


/**
 * Calculates the Euclidean distance between two points (x1, y1) and (x2, y2).
 *
 * @param {number} x1 - The x-coordinate of the first point.
 * @param {number} y1 - The y-coordinate of the first point.
 * @param {number} x2 - The x-coordinate of the second point.
 * @param {number} y2 - The y-coordinate of the second point.
 * @returns {number} - The distance between the two points, floored to the nearest integer.
 */
function getDistance(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  var c = Math.sqrt(a * a + b * b);
  return Math.floor(c);
}

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor(((evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width) / settings.pixelSize),
        y: Math.floor(((evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height) / settings.pixelSize),
    };
}

function copyCell(cell) {
  let c = {};
  c.x = cell.x
  c.y = cell.y
  c.tree = false
  c.elevation = 0
  c.magma = cell.magma
  c.asteroidNames = cell.asteroidNames
  c.river = cell.river
  c.lake = cell.lake
  c.beach = cell.beach
  c.population = cell.population
  c.raindrops = cell.raindrops
  c.floodFilled = cell.floodFilled
  c.continentId = cell.continentId
  return c
}

/**
 * Generates a sequential color object with unique RGB values.
 * 
 * The function increments the blue color value (`bCount`) each time it's called.
 * When `bCount` reaches 256, it resets to 0, and the green color value (`gCount`) is incremented.
 * This ensures a sequential generation of unique RGB color values.
 * 
 * @returns {Object} An object containing the RGB color values.
 * @returns {number} return.r - The red color value, always set to 0.
 * @returns {number} return.g - The green color value, incremented after blue reaches 256.
 * @returns {number} return.b - The blue color value, incremented on each call until it reaches 256.
 */
function getRandomSequentialColorObject() {
  bCount += 1; 
  if (bCount === 256) {
      bCount = 0;
      gCount += 1;
  }
  let o = {};
  o.r = 0;
  o.g = gCount;
  o.b = bCount;
  return o;
}

function onlyUnique(value, index, array) {
  return array.indexOf(value) === index
}

function getColorObjectFromString(string) {
  let colors = string.match(/(\d+)\,\s(\d+)\,\s(\d+)/)
  let o = {};
  o.r = colors[1];
  o.g = colors[2];
  o.b = colors[3]
  return o;
}
