let worldCultures = []
let worldHeritages = [];
let worldReligions = [];
let worldFaiths = []
let worldEmpires = [];
let worldKingdoms = [];
let worldDuchies = [];
let worldCounties = [];
let worldProvinces = [];
let faithToReligion = null; // Int32Array maps faithId -> religionId
let provToFaith    = null;  // Int32Array per-province (land only; -1 for sea)
let faithCount     = 0;
let religionCount   = 0;
let cultureToHeritage = null;
let heritageCount     = 0;
let heritagePalette   = null;
const daBom = `\ufeff`

let W=0,H=0;
let heightData=null;        // Uint8 gray
let landMask=null;          // Uint8 0/1 (original mask from sea level)
let effMask=null;           // Uint8 0/1 (effective mask after tiny-island treatment)
let label=null;             // Int32 province label per pixel (land or sea)
let seeds=[];               // province seeds: {x,y,isLand,id,color}
let palette=[];             // province color palette (unique)
let drawScale=1;            // CSS-width / bitmap-width
let currentLevel='provinces';

// Components
let landCompId=null, landCompSize=null, landCompCount=0;   // on original landMask
let effCompId=null,  effCompSize=null,  effCompCount=0;    // on effMask

// Hierarchy maps (for land provinces only):
let provIsLand=null;
let provToCounty=null, provToDuchy=null, provToKingdom=null, provToEmpire=null;
let countyCount=0, duchyCount=0, kingdomCount=0, empireCount=0;
let countyPalette=[], duchyPalette=[], kingdomPalette=[], empirePalette=[];


let terrainMap = null; // Uint8ClampedArray of RGB triples
    const TERRAIN_COLORS = {
    sea:{r:10,g:30,b:80},
    coastal_sea:{r:25,g:80,b:140},
    plains:{r:204,g:163,b:102},
    farmlands:{r:255,g:0,b:0},
    hills:{r:90,g:50,b:12},
    mountains:{r:100,g:100,b:100},
    desert:{r:255,g:230,b:0},
    desert_mountains:{r:23,g:19,b:38},
    oasis:{r:155,g:143,b:204},
    jungle:{r:10,g:60,b:35},
    forest:{r:71,g:179,b:45},
    taiga:{r:46,g:153,b:89},
    wetlands:{r:77,g:153,b:153},
    floodplains:{r:55,g:31,b:153},
    steppe:{r:200,g:100,b:25},
    drylands:{r:220,g:45,b:120},
    default:{r:120,g:120,b:120}
};


const fileInput = document.getElementById('file');
const fitBtn = document.getElementById('fit');
const dlBtn = document.getElementById('download');
const dlDefBtn = document.getElementById('downloadDef');
const dlLTBtn = document.getElementById('downloadLandedTitles');
const sea = document.getElementById('sea');
const seaVal = document.getElementById('seaVal');
const invertMask = document.getElementById('invertMask');
const landSeedsIn = document.getElementById('landSeeds');
const seaSeedsIn = document.getElementById('seaSeeds');
const cellSizeIn = document.getElementById('cellSize');
const autoSeedsBtn = document.getElementById('autoSeeds');
const clearSeedsBtn = document.getElementById('clearSeeds');
const runBtn = document.getElementById('run');
const recolorBtn = document.getElementById('recolor');
const showEdges = document.getElementById('showEdges');
const overlayMask = document.getElementById('overlayMask');
const levelSeg = document.getElementById('levelSeg');
const minIslandPxIn = document.getElementById('minIslandPx');
const tinyAsSea = document.getElementById('tinyAsSea');

const heightCanvas = document.getElementById('heightCanvas');
const hctx = heightCanvas.getContext('2d');
const maskCanvas = document.getElementById('maskCanvas');
const mctx = maskCanvas.getContext('2d');
const view = document.getElementById('view');
const vctx = view.getContext('2d');
const statusEl = document.getElementById('status');
const legend = document.getElementById('legend');
const terrainFile      = document.getElementById('terrainFile');
const koppenFile       = document.getElementById('koppenFile');
const loadTerrainBtn   = document.getElementById('loadTerrain');
const loadHeightmapBtn = document.getElementById('loadHeightmap');
const loadKoppenBtn    = document.getElementById('loadKoppen');

