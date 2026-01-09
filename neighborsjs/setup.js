  // ---- Globals ----
window.provinces = [];                 // provinces[id] = province object
window.provinceByRgbInt = new Map();   // rgbInt -> id

window.connectedTerrainRegions = [];   // regions array
window.landmasses = [];               // continents+islands (land-only components)
window.waterbodies = [];              // connected components of water provinces

window.lastExportPayload = null;       // { meta, provinces, regions, landmasses, waterbodies }



// ---- DOM ----

const $ = (id) => document.getElementById(id);
const imgFile = $("imgFile");
const jsonFile = $("jsonFile");
const heightFile = $("heightFile");
const koppenFile  = document.getElementById("koppenFile");
const textureFile = document.getElementById("textureFile");
const terrainFile = document.getElementById("terrainFile");

// offscreen height canvas (scaled to province-map size for perfect alignment)
const hcv = document.createElement("canvas");
const hctx = hcv.getContext("2d", { willReadFrequently: true });

// offscreen river canvas (scaled to province-map size for perfect alignment)
const rcv = document.createElement("canvas");
const rctx = rcv.getContext("2d", { willReadFrequently: true });
const RIVER_INDEXED_PALETTE = [
[  0, 255, 255],
[  0, 200, 255],
[  0, 150, 255],
[  0, 100, 255],
[  0,   0, 255],
[  0,   0, 200],
[  0,   0, 150],
[  0,   0, 100],
[  0,  85,   0],
[  0, 125,   0],
[  0, 158,   0],
[ 24, 206,   0],
]
const btnLoad = $("btnLoad");
const btnCompute = $("btnCompute");
const btnExport = $("btnExport");
const btnReset = $("btnReset");
const statusEl = $("status");
const cv = $("cv");
const ctx = cv.getContext("2d", { willReadFrequently: true });
const dimLbl = $("dimLbl");

const kmPerPxEl = $("kmPerPx");
const missingMode = $("missingMode");
const terrainKeyEl = $("terrainKey");
const includeWaterEl = $("includeWater");
const missingTerrainEl = $("missingTerrain");
const islandCutoffEl = $("islandCutoff");
const riverFile = $("riverFile");

  // ---- State ----
let loadedImage = null;
let loadedProvincesList = null;
let loadedRiverImage = null; // optional
let riverReady = false;

let loadedHeightImage = null; // optional
let heightReady = false;
// Optional tectonics meta: load + draw into offscreen canvas, scaled to match province map
let tectReady = false;
let loadedTectMetaImage = null;
const tcv = document.createElement("canvas");
const tctx = tcv.getContext("2d", { willReadFrequently: true });
let tectMetaImageData = null; // ImageData for fast per-pixel sampling
const tectMetaFile = document.getElementById("tectMetaFile");

function setStatus(msg){ statusEl.textContent = msg; }
function fmt(n){ return (n|0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function rgbToInt(r,g,b){ return (r<<16) | (g<<8) | b; }

// ---- Parsing ----
function braceBalance(s){
    let b=0;
    for (let i=0;i<s.length;i++){
        const c=s.charCodeAt(i);
        if (c===123) b++; else if (c===125) b--;
    }
    return b;
}

function parseProvincesText(text) {
    text = text.trim();
    if (!text) return [];
    try {
        const v = JSON.parse(text);
        if (Array.isArray(v)) return v;
        if (v && typeof v === "object") return [v];
    } catch {}

    const out = [];
    const lines = text.split(/\r?\n/);
    for (let i=0;i<lines.length;i++){
        let line = lines[i].trim();
        if (!line) continue;
        if (line.endsWith(",")) line = line.slice(0,-1);

        try { out.push(JSON.parse(line)); continue; } catch {}

        let acc = line;
        let bal = braceBalance(acc);
        while (bal !== 0 && i+1 < lines.length) {
        i++;
        acc += "\n" + lines[i];
        bal = braceBalance(acc);
        }
        acc = acc.trim();
        if (acc.endsWith(",")) acc = acc.slice(0,-1);
        try { out.push(JSON.parse(acc)); } catch {}
    }
    return out;
}

function normalizeProvinceColor(p) {
    if (typeof p.rgbInt === "number") return p.rgbInt|0;

    if (typeof p.rgbR === "number" && typeof p.rgbG === "number" && typeof p.rgbB === "number") {
        p.rgbInt = rgbToInt(p.rgbR|0, p.rgbG|0, p.rgbB|0);
        return p.rgbInt;
    }

    if (typeof p.rgbHex === "string" && /^#?[0-9a-fA-F]{6}$/.test(p.rgbHex.trim())) {
        const hex = p.rgbHex.trim().replace("#","");
        const n = parseInt(hex, 16) >>> 0;
        p.rgbInt = n;
        p.rgbR = (n>>16)&255; p.rgbG = (n>>8)&255; p.rgbB = n&255;
        return p.rgbInt;
    }
    return null;
}

function buildProvinceGlobals(list) {
    window.provinces = [];
    window.provinceByRgbInt = new Map();

    window.connectedTerrainRegions = [];
    window.landmasses = [];
    window.waterbodies = [];
    window.lastExportPayload = null;

    let missingColor = 0;

    for (const p of list) {
        if (!p || typeof p.id !== "number") continue;
        const id = p.id|0;

        const c = normalizeProvinceColor(p);
        if (c == null) { missingColor++; continue; }

        // Computed fields
        p.neighbors = [];
        p.neighborBorderPx = {}; // { neighborId: borderPx }

        p.areaPx = 0;
        p.areaFrac = 0;

        p.centroidX = 0;
        p.centroidY = 0;
        p.centroidXNorm = 0;
        p.centroidYNorm = 0;
        p.minX =  1e9; p.minY =  1e9;
        p.maxX = -1e9; p.maxY = -1e9;

        p.connectedTerrainRegion = null;

        // Landmass fields
        p.landmassId = null;
        p.landmassType = null;

        // Coast distance (land only)
        p.isCoastal = (p.isCoastal|0) || 0; // keep if you already have it
        p.distanceToCoast = null;          // integer hops; 0 if coastal; null if unreachable/unknown

        // Waterbody fields (water only)
        p.waterbodyId = null;

        window.provinces[id] = p;
        window.provinceByRgbInt.set(c, id);
    }
    return { count: window.provinceByRgbInt.size, missingColor };
}

function buildProvinceGlobalsFromImages() {
    // ---- Globals ----
    window.provinces = [];
    window.provinceByRgbInt = new Map();

    window.connectedTerrainRegions = [];
    window.landmasses = [];
    window.waterbodies = [];
    window.lastExportPayload = null;

    if (!cv || !ctx) {
        throw new Error("Province canvas not initialized");
    }

    const W = cv.width;
    const H = cv.height;
    const img = ctx.getImageData(0, 0, W, H).data;

    let nextId = 0;
    let missingColor = 0;

    for (let i = 0; i < img.length; i += 4) {
        const a = img[i + 3];
        if (a === 0) continue; // ignore transparent

        const rgbInt = rgbToInt(img[i], img[i + 1], img[i + 2]);

        if (window.provinceByRgbInt.has(rgbInt)) continue;

        const id = nextId++;

        // ---- Create province object ----
        const p = {
            id,

            rgbInt,
            rgbR: img[i],
            rgbG: img[i + 1],
            rgbB: img[i + 2],

            // Computed fields (EXACT defaults)
            neighbors: [],
            neighborBorderPx: {},

            areaPx: 0,
            areaFrac: 0,

            centroidX: 0,
            centroidY: 0,
            centroidXNorm: 0,
            centroidYNorm: 0,
            minX:  1e9,
            minY:  1e9,
            maxX: -1e9,
            maxY: -1e9,

            connectedTerrainRegion: null,

            // Landmass fields
            landmassId: null,
            landmassType: null,

            // Coast distance (land only)
            isCoastal: 0,
            distanceToCoast: null,

            // Waterbody fields (water only)
            waterbodyId: null
        };

        window.provinces[id] = p;
        window.provinceByRgbInt.set(rgbInt, id);
    }

    return {
        count: window.provinceByRgbInt.size,
        missingColor
    };
}


// ---- file helpers ----
function loadImageFile(file){
    return new Promise((resolve,reject)=>{
        const url = URL.createObjectURL(file);
        const im = new Image();
        im.onload = () => { URL.revokeObjectURL(url); resolve(im); };
        im.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
        im.src = url;
    });
}

function readFileAsText(file){
    return new Promise((resolve,reject)=>{
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result || ""));
        fr.onerror = reject;
        fr.readAsText(file);
    });
}





// ---- export ----
function downloadText(filename, text) {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}