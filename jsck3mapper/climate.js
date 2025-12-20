let koppenMap = null; // Int16Array of indices into KOPPEN_CLASSES

const KOPPEN_CLASSES = [
    // A — Equatorial
    { code: 'Af', name: 'Equatorial rainforest', group: 'A', color: '#3c00fb' },
    { code: 'Am', name: 'Equatorial monsoon', group: 'A', color: '#2f66fb' },
    { code: 'Aw', name: 'Equatorial savanna (winter dry)', group: 'A', color: '#4597fb' },
    { code: 'As', name: 'Equatorial savanna (summer dry)', group: 'A', color: '#46be28' },

    // B — Arid & Semi-arid
    { code: 'BWh', name: 'Subtropical desert (hot)', group: 'B', color: '#fd0f00' },
    { code: 'BWk', name: 'Mid-latitude desert (cold)', group: 'B', color: '#fe928f' },
    { code: 'BSh', name: 'Subtropical steppe (hot)', group: 'B', color: '#f3a000' },
    { code: 'BSk', name: 'Mid-latitude steppe (cold)', group: 'B', color: '#fad95d' },

    // C — Warm temperate
    { code: 'Csa', name: 'Mediterranean hot summer', group: 'C', color: '#f6ff09' },
    { code: 'Csb', name: 'Mediterranean warm summer', group: 'C', color: '#c8cb07' },
    { code: 'Csc', name: 'Mediterranean cool summer', group: 'C', color: '#ffcda0' },

    { code: 'Cfa', name: 'Humid subtropical (no dry season, hot)', group: 'C', color: '#bdff4b' },
    { code: 'Cfb', name: 'Marine west coast (warm summer)', group: 'C', color: '#4dff35' },
    { code: 'Cfc', name: 'Marine west coast (cool summer)', group: 'C', color: '#0ec506' },

    { code: 'Cwa', name: 'Humid subtropical (dry winter, hot summer)', group: 'C', color: '#89ff93' },
    { code: 'Cwb', name: 'Humid subtropical highland (warm summer)', group: 'C', color: '#51c660' },
    { code: 'Cwc', name: 'Humid subtropical highland (cool summer)', group: 'C', color: '#219230' },

    // D — Snow / Continental
    { code: 'Dfa', name: 'Humid continental hot summer', group: 'D', color: '#00fafd' },
    { code: 'Dfb', name: 'Humid continental warm summer', group: 'D', color: '#44c2f9' },
    { code: 'Dfc', name: 'Subarctic cool summer', group: 'D', color: '#007b7c' },
    { code: 'Dfd', name: 'Subarctic very cold winter', group: 'D', color: '#02445a' },

    { code: 'Dsa', name: 'Continental hot summer, dry summer', group: 'D', color: '#ff00f9' },
    { code: 'Dsb', name: 'Continental warm summer, dry summer', group: 'D', color: '#ca00c1' },
    { code: 'Dsc', name: 'Continental cool summer, dry summer', group: 'D', color: '#962791' },
    { code: 'Dsd', name: 'Continental very cold winter, dry summer', group: 'D', color: '#8c568d' },

    { code: 'Dwa', name: 'Humid continental dry winter, hot summer', group: 'D', color: '#a4a7ff' },
    { code: 'Dwb', name: 'Humid continental dry winter, warm summer', group: 'D', color: '#506edf' },
    { code: 'Dwc', name: 'Subarctic dry winter, cool summer', group: 'D', color: '#4c47b0' },
    { code: 'Dwd', name: 'Subarctic dry winter, very cold winter', group: 'D', color: '#350087' },

    // E — Polar
    { code: 'ET', name: 'Tundra', group: 'E', color: '#a9aca8' },
    { code: 'EF', name: 'Ice cap', group: 'E', color: '#626361' },

    // H — Highland / Complex
    { code: 'H', name: 'Complex highland', group: 'H', color: '#808080' }
];

const KOPPEN_RGB = KOPPEN_CLASSES.map((k, idx) => {
    const hex = k.color.startsWith('#') ? k.color.slice(1) : k.color;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b, idx };
});

function getKoppenIndexAt(x, y) {
    if (!koppenMap || !W || !H) return -1;
    const k = y * W + x;
    if (k < 0 || k >= koppenMap.length) return -1;
    return koppenMap[k];
}

function getKoppenClassAt(x, y) {
    const idx = getKoppenIndexAt(x, y);
    return (idx >= 0 && idx < KOPPEN_CLASSES.length) ? KOPPEN_CLASSES[idx] : null;
}


function getTerrainAt(x, y) {
    if (!terrainMap) return "default";

    const k = (y * W + x) * 4;
    const r = terrainMap[k], g = terrainMap[k+1], b = terrainMap[k+2];

    for (const key in TERRAIN_COLORS) {
        const t = TERRAIN_COLORS[key];
        if (t.r === r && t.g === g && t.b === b)
        return key;
    }

    return "default";
}
