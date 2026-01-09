
  // ---- Distance to coast (land-only BFS) ----
  function computeDistanceToCoast() {
    const provinces = window.provinces || [];

    // Determine coastal land provinces using actual water-neighbor borders
    const coastal = [];
    for (let id=0; id<provinces.length; id++){
      const p = provinces[id];
      if (!p) continue;

      // only land (treat null/undefined as land-ish; adjust if you want stricter)
      if (p.isLand === false) {
        p.distanceToCoast = null;
        continue;
      }

      let coast = false;
      const nb = p.neighborBorderPx || {};
      for (const k in nb){
        const nid = k|0;
        const q = provinces[nid];
        if (q && q.isLand === false && (nb[k]|0) > 0) { coast = true; break; }
      }

      p.isCoastal = coast ? 1 : 0;
      p.distanceToCoast = coast ? 0 : null;

      if (coast) coastal.push(id);
    }

    // Multi-source BFS over land graph (unweighted hops)
    const q = new Int32Array(provinces.length);
    let qh = 0, qt = 0;

    for (let i=0;i<coastal.length;i++){
      q[qt++] = coastal[i];
    }

    while (qh < qt) {
      const cur = q[qh++];
      const p = provinces[cur];
      if (!p) continue;
      const d = p.distanceToCoast|0;

      const neigh = p.neighbors || [];
      for (let i=0;i<neigh.length;i++){
        const nb = neigh[i]|0;
        const u = provinces[nb];
        if (!u) continue;
        if (u.isLand === false) continue; // do not propagate through water

        if (u.distanceToCoast == null) {
          u.distanceToCoast = d + 1;
          q[qt++] = nb;
        }
      }
    }

    // stats
    let maxD = -1, maxId = -1, unreachable = 0, landCount = 0;
    for (let id=0; id<provinces.length; id++){
      const p = provinces[id];
      if (!p) continue;
      if (p.isLand === false) continue;
      landCount++;
      if (p.distanceToCoast == null) unreachable++;
      else if (p.distanceToCoast > maxD) { maxD = p.distanceToCoast; maxId = id; }
    }

    return { coastalCount: coastal.length, landCount, unreachable, maxDistance: maxD, maxDistanceId: maxId };
  }
