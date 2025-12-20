/**
 * After buildWorldTitles + culture generation, assign place names to:
 *   - empires, kingdoms, duchies, counties
 *   - provinces (seeds)
 *
 * Based on dominant culture shares at each title level, and per-province culture.
 */
function assignPlaceNamesToTitles() {
  if (!Array.isArray(seeds) || !seeds.length) {
    console.warn('assignPlaceNamesToTitles: no seeds/provinces.');
    return null;
  }

  if (!window.worldTitles) {
    const wtBuilt = (typeof buildWorldTitles === 'function') ? buildWorldTitles() : null;
    if (!wtBuilt) {
      console.warn('assignPlaceNamesToTitles: worldTitles could not be built.');
      return null;
    }
  }

  const wt = window.worldTitles;
  const N = seeds.length;
  const cultures = Array.isArray(worldCultures) ? worldCultures : [];
  const numCult = cultures.length;

  if (!numCult) {
    console.warn('assignPlaceNamesToTitles: no worldCultures defined.');
    return wt;
  }

  // --- helper: get culture index for a province ---
  function cultureIndexForProvince(p) {
    if (p == null || p < 0 || p >= N) return -1;
    const s = seeds[p];
    if (!s || !s.isLand) return -1;

    // 1) direct province map
    if (typeof provToCulture !== 'undefined' && provToCulture) {
      const cIdx = provToCulture[p];
      if (cIdx != null && cIdx >= 0 && cIdx < numCult) return cIdx;
    }

    // 2) fallback to seed.cultureIndex
    if (typeof s.cultureIndex === 'number' &&
        s.cultureIndex >= 0 && s.cultureIndex < numCult) {
      return s.cultureIndex | 0;
    }

    return -1;
  }

  // --- helper: dominant culture for a list of province indices ---
  function dominantCultureForProvinces(provList) {
    if (!provList || !provList.length || numCult <= 0) {
      return { index: -1, total: 0, bestCount: 0, share: 0, counts: null };
    }

    const counts = new Int32Array(numCult);
    let total = 0;
    let bestIdx = -1;
    let bestCount = 0;

    for (const p of provList) {
      const cIdx = cultureIndexForProvince(p);
      if (cIdx < 0) continue;
      total++;
      const c = ++counts[cIdx];
      if (c > bestCount) {
        bestCount = c;
        bestIdx = cIdx;
      }
    }

    const share = (total > 0 && bestIdx >= 0) ? bestCount / total : 0;
    return { index: bestIdx, total, bestCount, share, counts };
  }

  // --- helper: pick a stable place name for a culture + base id ---
  function pickPlaceName(cIdx, fallbackId) {
    const baseId = fallbackId || 'Unnamed';
    if (cIdx < 0 || cIdx >= numCult) {
      return baseId;
    }
    const c = cultures[cIdx];

    // Prefer dynastyNames pool if present
    let pool = Array.isArray(c.dynastyNames) && c.dynastyNames.length
      ? c.dynastyNames
      : null;

    if (pool && pool.length) {
      // Deterministic "random" pick based on fallbackId so it's stable
      const seedStr = String(
        baseId ||
        c.language ||
        c.id ||
        c.key ||
        cIdx
      );
      let h = 0;
      for (let i = 0; i < seedStr.length; i++) {
        h = (h * 31 + seedStr.charCodeAt(i)) | 0;
      }
      const idx = Math.abs(h) % pool.length;
      return pool[idx];
    }

    // Otherwise, generate a fresh place name using the culture's language
    if (typeof makePlaceName === 'function' && c.genLanguage) {
      try {
        return makePlaceName(c.genLanguage);
      } catch (e) {
        console.warn('pickPlaceName: makePlaceName failed:', e);
      }
    }

    return baseId;
  }

  // --- helper: annotate an array of titles (empire/kingdom/duchy/county) ---
  function annotateTitleArray(arr, levelType) {
    if (!Array.isArray(arr)) return;

    for (const node of arr) {
      if (!node) continue;

      const provs = node.provinces || [];
      const dom = dominantCultureForProvinces(provs);

      node.dominantCultureIndex  = dom.index;
      node.dominantCultureShare  = dom.share;
      node.dominantCultureCount  = dom.bestCount;
      node.dominantCultureTotal  = dom.total;
      node.dominantCultureCounts = dom.counts; // Int32Array or null

      if (dom.index >= 0 && cultures[dom.index]) {
        const c = cultures[dom.index];
        node.dominantCultureId   = c.id   || c.key || `culture_${dom.index}`;
        node.dominantLanguageKey = c.language || `language_${dom.index}`;
      } else {
        node.dominantCultureId   = null;
        node.dominantLanguageKey = null;
      }

      const baseId = node.id || `${levelType || node.type || 'title'}_${node.index}`;
      const placeName = pickPlaceName(dom.index, baseId);

      node.placeName   = placeName;
      node.displayName = placeName; // handy for UI

      // Also push onto the original worldX object if present
      if (node.ref) {
        node.ref.placeName   = placeName;
        node.ref.displayName = placeName;
        node.ref.dominantCultureIndex  = dom.index;
        node.ref.dominantCultureId     = node.dominantCultureId;
        node.ref.dominantLanguageKey   = node.dominantLanguageKey;
        node.ref.dominantCultureShare  = dom.share;
      }
    }
  }

  // --- 1) Annotate titles: counties -> duchies -> kingdoms -> empires ------
  annotateTitleArray(wt.counties,  'county');
  annotateTitleArray(wt.duchies,   'duchy');
  annotateTitleArray(wt.kingdoms,  'kingdom');
  annotateTitleArray(wt.empires,   'empire');

  // --- 2) Assign names to provinces (seeds) ---------------------------------
  for (let p = 0; p < N; p++) {
    const s = seeds[p];
    if (!s || !s.isLand) continue;

    // Skip if already named (e.g. imported vanilla data)
    if (s.placeName || s.displayName || s.name) continue;

    const cIdx = cultureIndexForProvince(p);
    const baseId = (typeof s.id === 'number') ? `province_${s.id}` : `province_${p}`;
    const placeName = pickPlaceName(cIdx, baseId);

    s.placeName   = placeName;
    s.displayName = placeName;
  }

  return wt;
}
