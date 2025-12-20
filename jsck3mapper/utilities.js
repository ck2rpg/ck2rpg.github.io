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

// Helper function to get a random decimal between min and max
function getRandomDecimal(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
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

// --- Utility: tiny deterministic hash so choices are stable per-culture ---
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function chooseFrom(list, seedKey, salt) {
  if (!Array.isArray(list) || !list.length) return null;
  const h = hashString(String(seedKey || "") + ":" + salt);
  const idx = h % list.length;
  return list[idx];
}

 // --- Helper: is a seed/pixel coastal in the effective mask? ---
  function isCoastalPixel(x, y) {
    if (!effMask || !W || !H) return false;
    const r = 2;
    const k0 = y * W + x;
    const hereLand = effMask[k0] === 1;
    for (let dy = -r; dy <= r; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= H) continue;
      for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= W) continue;
        const kk = yy * W + xx;
        if (effMask[kk] === (hereLand ? 0 : 1)) {
          return true;
        }
      }
    }
    return false;
  }

  // --- Helper: approx height -> meters (assumes 19 ~ sea level, 255 ~ 8550m) ---
  function heightToMeters(h) {
    if (h == null) return null;
    const SEA = (+sea.value | 0) || 19;
    const span = 255 - SEA || 1;
    const rel = (h - SEA) / span;
    return Math.max(0, rel) * 8550;
  }

function getIdFromSeed(seed, spec) {
  if (!seed || spec == null) return null;
  if (typeof spec === "function") return spec(seed);
  if (typeof spec === "string")  return seed[spec];
  return null;
}

function normalizeCounts(counts) {
  const shares = {};
  let total = 0;
  for (const k in counts) total += counts[k];
  if (total <= 0) return { counts, shares, total: 0 };
  for (const k in counts) shares[k] = counts[k] / total;
  return { counts, shares, total };
}

function clampInt(v,min,max){ v = (v|0); if(v<min) v=min; if(v>max) v=max; return v; }
function normalizeRange(a,b, fallback){
  let mn = clampInt(+a, 1, 1<<30);
  let mx = clampInt(+b, 1, 1<<30);
  if(mx < mn){ const t=mn; mn=mx; mx=t; }
  if(!Number.isFinite(mn) || !Number.isFinite(mx)) return fallback;
  return [mn,mx];
}

  function sorted(it) {
    return Array.from(it).sort((a, b) => a - b);
  }

  // cache province adjacency derived from current labels (land only)
  let _provAdjCache = null;
  function provAdj(){
    if(_provAdjCache) return _provAdjCache;
    _provAdjCache = buildAdjacencyFromLabels(seeds.length, i=>provIsLand && provIsLand[i]===1);
    return _provAdjCache;
  }
  // allow other code to invalidate after Voronoi (call window._invalidateProvAdj?.())
  try{ window._invalidateProvAdj = ()=>{ _provAdjCache = null; }; }catch(_){}


  // ---- guards ----
  function needHierarchy() {
    if (!seeds || !seeds.length) {
      alert('Seed and run Voronoi first.');
      return true;
    }
    if (!provToCounty || !provToDuchy || !provToKingdom || !provToEmpire) {
      alert('Run "Barrier-Voronoi" to build the hierarchy first.');
      return true;
    }
    if (
      !countyPalette || !duchyPalette || !kingdomPalette || !empirePalette ||
      !countyPalette.length || !duchyPalette.length ||
      !kingdomPalette.length || !empirePalette.length
    ) {
      alert('Palettes missing. Run Voronoi first.');
      return true;
    }
    return false;
  }

  // ---- utils ----
  function blobSave(text, filename) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function rgbFromInt(c) {
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  }

  function nameFromRGB([R, G, B]) {
    return `R${R}G${G}B${B}`;
  }

  function colorTitle(prefix, pal, id) {
    return `${prefix}_${nameFromRGB(rgbFromInt(pal[id]))}`;
  }