/**
 * Build a hierarchical worldTitles object from:
 *   worldEmpires, worldKingdoms, worldDuchies, worldCounties, seeds
 *
 * Assumes:
 *   - Each worldX[i] has .provinces = [provinceIndex, ...]
 *   - seeds[provinceIndex] is the province object, like:
 *       { x, y, isLand, id, countyIndex, duchyIndex, kingdomIndex, empireIndex, ... }
 *
 * Result:
 *   worldTitles = {
 *     empires:  [ empireNode,  ... ],
 *     kingdoms: [ kingdomNode, ... ],
 *     duchies:  [ duchyNode,  ... ],
 *     counties: [ countyNode, ... ]
 *   }
 *
 * Each node has:
 *   type: 'empire'|'kingdom'|'duchy'|'county'
 *   index: index in its worldX array
 *   id:    existing .id or fallback "empire_0" etc
 *   ref:   reference to the original worldX object
 *   provinces: array of province indices
 *   parentType / parentIndex / parentId (except for empires)
 *   children:
 *     - empire  -> kingdoms[]
 *     - kingdom -> duchies[]
 *     - duchy   -> counties[]
 *     - county  -> seeds[] (province objects)
 */
function buildWorldTitles() {
  if (!Array.isArray(seeds) || seeds.length === 0) {
    console.warn('buildWorldTitles: no seeds/provinces available.');
    return null;
  }

  const N = seeds.length;

  const empires  = Array.isArray(worldEmpires)  ? worldEmpires  : [];
  const kingdoms = Array.isArray(worldKingdoms) ? worldKingdoms : [];
  const duchies  = Array.isArray(worldDuchies)  ? worldDuchies  : [];
  const counties = Array.isArray(worldCounties) ? worldCounties : [];

  const worldTitles = {
    empires:  [],
    kingdoms: [],
    duchies:  [],
    counties: []
  };

  // --- helper: find dominant parent index for a group of provinces, using seeds[*].<key> ---
  function dominantParentIndex(provList, key, parentArrayLength) {
    if (!provList || provList.length === 0 || parentArrayLength <= 0) return -1;
    const counts = new Int32Array(parentArrayLength);
    let bestIdx = -1;
    let bestCnt = 0;

    for (const p of provList) {
      if (p == null || p < 0 || p >= N) continue;
      const s = seeds[p];
      if (!s || typeof s[key] !== 'number') continue;
      const idx = s[key] | 0;
      if (idx < 0 || idx >= parentArrayLength) continue;
      const c = ++counts[idx];
      if (c > bestCnt) {
        bestCnt = c;
        bestIdx = idx;
      }
    }

    return bestIdx; // -1 if nothing valid
  }

  // --- 1) Empire nodes -------------------------------------------------------
  for (let i = 0; i < empires.length; i++) {
    const e = empires[i];
    if (!e) continue;
    worldTitles.empires[i] = {
      type: 'empire',
      index: i,
      id: e.id || `empire_${i}`,
      ref: e,
      provinces: Array.isArray(e.provinces) ? e.provinces.slice() : [],
      parentType: null,
      parentIndex: -1,
      parentId: null,
      children: [] // kingdoms
    };
  }

  // --- 2) Kingdom nodes ------------------------------------------------------
  for (let i = 0; i < kingdoms.length; i++) {
    const k = kingdoms[i];
    if (!k) continue;

    const provs = Array.isArray(k.provinces) ? k.provinces.slice() : [];
    // Use seeds[*].empireIndex to find the dominant empire for this kingdom
    const eIdx = dominantParentIndex(provs, 'empireIndex', empires.length);

    const node = {
      type: 'kingdom',
      index: i,
      id: k.id || `kingdom_${i}`,
      ref: k,
      provinces: provs,
      parentType: (eIdx >= 0 ? 'empire' : null),
      parentIndex: (eIdx >= 0 ? eIdx : -1),
      parentId: (eIdx >= 0 ? (worldTitles.empires[eIdx]?.id ?? null) : null),
      children: [] // duchies
    };

    worldTitles.kingdoms[i] = node;

    if (eIdx >= 0 && worldTitles.empires[eIdx]) {
      worldTitles.empires[eIdx].children.push(node);
    }
  }

  // --- 3) Duchy nodes --------------------------------------------------------
  for (let i = 0; i < duchies.length; i++) {
    const d = duchies[i];
    if (!d) continue;

    const provs = Array.isArray(d.provinces) ? d.provinces.slice() : [];
    // Use seeds[*].kingdomIndex to find dominant kingdom
    const kIdx = dominantParentIndex(provs, 'kingdomIndex', kingdoms.length);

    const node = {
      type: 'duchy',
      index: i,
      id: d.id || `duchy_${i}`,
      ref: d,
      provinces: provs,
      parentType: (kIdx >= 0 ? 'kingdom' : null),
      parentIndex: (kIdx >= 0 ? kIdx : -1),
      parentId: (kIdx >= 0 ? (worldTitles.kingdoms[kIdx]?.id ?? null) : null),
      children: [] // counties
    };

    worldTitles.duchies[i] = node;

    if (kIdx >= 0 && worldTitles.kingdoms[kIdx]) {
      worldTitles.kingdoms[kIdx].children.push(node);
    }
  }

  // --- 4) County nodes (children = seeds for those provinces) ---------------
  for (let i = 0; i < counties.length; i++) {
    const cty = counties[i];
    if (!cty) continue;

    const provs = Array.isArray(cty.provinces) ? cty.provinces.slice() : [];
    // Use seeds[*].duchyIndex to find dominant duchy
    const dIdx = dominantParentIndex(provs, 'duchyIndex', duchies.length);

    const countyId = cty.id || `county_${i}`;

    // Children are the actual seed objects for those provinces
    const provinceSeeds = [];
    for (const p of provs) {
      if (p == null || p < 0 || p >= N) continue;
      const s = seeds[p];
      if (!s) continue;
      // optional filter: only land provinces
      // if (!s.isLand) continue;
      provinceSeeds.push(s);
    }

    const node = {
      type: 'county',
      index: i,
      id: countyId,
      ref: cty,
      provinces: provs, // raw indices kept for convenience
      parentType: (dIdx >= 0 ? 'duchy' : null),
      parentIndex: (dIdx >= 0 ? dIdx : -1),
      parentId: (dIdx >= 0 ? (worldTitles.duchies[dIdx]?.id ?? null) : null),
      children: provinceSeeds // <--- THIS is your seed objects
    };

    worldTitles.counties[i] = node;

    if (dIdx >= 0 && worldTitles.duchies[dIdx]) {
      worldTitles.duchies[dIdx].children.push(node);
    }
  }

  // (Optional) sanity: you already store indices on seeds, but we could ensure them here:
  try {
    for (let p = 0; p < N; p++) {
      const s = seeds[p];
      if (!s) continue;
      if (typeof s.id !== 'number') s.id = p;
    }
  } catch (e) {
    console.warn('buildWorldTitles: minor issue normalizing seed ids:', e);
  }

  // Store globally for convenience
  window.worldTitles = worldTitles;
  return worldTitles;
}
