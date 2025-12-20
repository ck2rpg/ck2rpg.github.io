/* ================= Voronoi Distortions (Lloyd / Repel / Jitter / Affine) ================= */
(function addVoronoiDistortions(){
  if (window.__voronoiDistortionsInstalled) return;
  window.__voronoiDistortionsInstalled = true;

  // ---- quick guards ----
  function needSeeds(){ 
    if(!seeds || !seeds.length){ alert('Seed the map (Auto-seed or click) first.'); return true; }
    return false;
  }
  function needLabels(){
    if(!label || label.length !== W*H){
      alert('Run “Barrier-Voronoi” first so we have current cells.');
      return true;
    }
    return false;
  }
  function reRunVoronoi(){
    // reuse your existing pipeline + hierarchy build
    const b = document.getElementById('run');
    if(b) b.click();
  }

  // ---- UI card ----
  const header = document.querySelector('header');
  if(!header) return;

  const card = document.createElement('div');
  card.className = 'row card';
  card.style.flexWrap = 'wrap';
  card.innerHTML = `
    <strong style="margin-right:8px">Voronoi Distortions</strong>
    <label class="small mono">method</label>
    <select id="vd-method" style="min-width:220px">
      <option value="lloyd" selected>Lloyd (barrier-aware)</option>
      <option value="repel">Repel (blue-noise relax)</option>
      <option value="jitter">Jitter (hash noise)</option>
      <option value="affine">Affine (squeeze/rotate)</option>
    </select>

    <span style="width:10px"></span>
    <label class="small mono">iterations</label>
    <input id="vd-iters" type="number" min="1" value="1" style="width:64px">

    <!-- Lloyd-only -->
    <span class="vd-only-lloyd">
      <span style="width:10px"></span>
      <label class="small mono">snap radius</label>
      <input id="vd-lloyd-snap" type="number" min="1" value="12" style="width:64px">
    </span>

    <!-- Repel-only -->
    <span class="vd-only-repel" style="display:none">
      <span style="width:10px"></span>
      <label class="small mono">radius</label>
      <input id="vd-repel-r" type="number" min="2" value="28" style="width:64px">
      <span style="width:10px"></span>
      <label class="small mono">strength</label>
      <input id="vd-repel-k" type="number" min="1" value="6" style="width:64px">
    </span>

    <!-- Jitter-only -->
    <span class="vd-only-jitter" style="display:none">
      <span style="width:10px"></span>
      <label class="small mono">amp (px)</label>
      <input id="vd-jitter-amp" type="number" min="1" value="5" style="width:64px">
    </span>

    <!-- Affine-only -->
    <span class="vd-only-affine" style="display:none">
      <span style="width:10px"></span>
      <label class="small mono">scale X</label>
      <input id="vd-ax" type="number" step="0.01" value="1.00" style="width:70px">
      <span style="width:6px"></span>
      <label class="small mono">scale Y</label>
      <input id="vd-ay" type="number" step="0.01" value="1.00" style="width:70px">
      <span style="width:6px"></span>
      <label class="small mono">rotate°</label>
      <input id="vd-aθ" type="number" step="1" value="0" style="width:64px">
      <label class="small mono"><input id="vd-a-about-center" type="checkbox" checked> about center</label>
    </span>

    <button class="btn primary" id="vd-apply" style="margin-left:10px">Apply Distortion</button>
    <button class="btn" id="vd-apply-run" title="Apply then re-run Voronoi">Apply + Recompute</button>
  `;
  header.appendChild(card);

  // Toggle per-method parameter rows
  const methodSel = card.querySelector('#vd-method');
  function showFor(method){
    card.querySelectorAll('.vd-only-lloyd,.vd-only-repel,.vd-only-jitter,.vd-only-affine')
        .forEach(el=>el.style.display='none');
    if(method==='lloyd')  card.querySelectorAll('.vd-only-lloyd').forEach(el=>el.style.display='inline');
    if(method==='repel')  card.querySelectorAll('.vd-only-repel').forEach(el=>el.style.display='inline');
    if(method==='jitter') card.querySelectorAll('.vd-only-jitter').forEach(el=>el.style.display='inline');
    if(method==='affine') card.querySelectorAll('.vd-only-affine').forEach(el=>el.style.display='inline');
  }
  methodSel.addEventListener('change', ()=>showFor(methodSel.value));
  showFor(methodSel.value);

  // ---- helpers ----
  function hash(x,y){
    // quick integer hash -> [0,1)
    let a = (x*73856093) ^ (y*19349663) ^ 0x9e3779b9;
    a ^= (a<<13); a ^= (a>>>17); a ^= (a<<5);
    return ((a>>>0) % 0x100000)/0x100000;
  }
  function snapInsideSameLabel(seedIndex, cx, cy, maxR){
    // try exact centroid; if not same label or off-mask, expand search
    let x0=cx|0, y0=cy|0;
    x0 = clamp(x0,0,W-1); y0 = clamp(y0,0,H-1);
    const want = seedIndex;
    if(label[idx(x0,y0)]===want) return [x0,y0];

    const R = Math.max(1, maxR|0);
    for(let r=1; r<=R; r++){
      // diamond ring
      for(let dy=-r; dy<=r; dy++){
        const yy = y0+dy; if(yy<0||yy>=H) continue;
        const dx = r-Math.abs(dy);
        const xA = x0-dx, xB = x0+dx;
        if(xA>=0 && xA<W && label[idx(xA,yy)]===want) return [xA,yy];
        if(dx!==0 && xB>=0 && xB<W && label[idx(xB,yy)]===want) return [xB,yy];
      }
    }
    // fallback: keep original
    return [seeds[want].x, seeds[want].y];
  }

  // ---- distortions ----

  // 1) Lloyd relaxation: move each seed to its cell centroid (barrier already baked into labels)
  function doLloyd(iter=1, snapR=12){
    if(needSeeds()||needLabels()) return;
    const N = seeds.length;
    const sx = new Float64Array(N);
    const sy = new Float64Array(N);
    const sc = new Int32Array(N);

    for(let it=0; it<iter; it++){
      sx.fill(0); sy.fill(0); sc.fill(0);

      // accumulate centroids per province
      for(let k=0;k<label.length;k++){
        const li = label[k]; if(li<0) continue;
        const y = (k/W)|0, x = k - y*W;
        sx[li]+=x; sy[li]+=y; sc[li]++;
      }

      // move seeds to centroid (snapped within their own cell)
      for(let i=0;i<N;i++){
        if(sc[i]===0) continue;
        const cx = sx[i]/sc[i], cy = sy[i]/sc[i];
        const [nx,ny] = snapInsideSameLabel(i, cx, cy, snapR);
        seeds[i].x = nx; seeds[i].y = ny;
      }
    }
  }

  // 2) Repel neighbors (blue-noise style): seeds of the same land/sea type push each other
  function doRepel(iter=1, R=28, K=6){
    if(needSeeds()) return;
    // simple O(n^2) works for ~1k seeds; fast enough for a few iterations
    for(let it=0; it<iter; it++){
      const dx = new Float32Array(seeds.length);
      const dy = new Float32Array(seeds.length);

      for(let i=0;i<seeds.length;i++){
        const si = seeds[i];
        for(let j=i+1;j<seeds.length;j++){
          if(seeds[j].isLand !== si.isLand) continue; // don't mix media
          const sj = seeds[j];
          let vx = sj.x - si.x;
          let vy = sj.y - si.y;
          let d2 = vx*vx + vy*vy;
          if(d2===0) { vx = (Math.random()-0.5); vy=(Math.random()-0.5); d2 = vx*vx+vy*vy; }
          if(d2 > R*R) continue;
          const d = Math.sqrt(d2);
          const strength = (R - d) / R;     // 0..1
          const push = (K * strength) / (d+1e-6);
          vx *= push; vy *= push;
          dx[i] -= vx; dy[i] -= vy; // opposite forces
          dx[j] += vx; dy[j] += vy;
        }
      }

      // apply & clamp to mask (keep land seeds on land, sea on sea)
      for(let i=0;i<seeds.length;i++){
        const s = seeds[i];
        let nx = clamp(Math.round(s.x + dx[i]), 0, W-1);
        let ny = clamp(Math.round(s.y + dy[i]), 0, H-1);
        // enforce medium
        const want = s.isLand ? 1 : 0;
        if(effMask && effMask[idx(nx,ny)] !== want){
          // try step back halfway
          nx = clamp(Math.round(s.x + dx[i]*0.3),0,W-1);
          ny = clamp(Math.round(s.y + dy[i]*0.3),0,H-1);
          if(effMask && effMask[idx(nx,ny)] !== want){
            // give up for this seed this round
            nx = s.x; ny = s.y;
          }
        }
        s.x = nx; s.y = ny;
      }
    }
  }

  // 3) Noise jitter (hash-based, deterministic per iteration)
  function doJitter(iter=1, amp=5){
    if(needSeeds()) return;
    for(let it=0; it<iter; it++){
      for(let i=0;i<seeds.length;i++){
        const s = seeds[i];
        const n1 = hash(s.x + it*131, s.y - it*911) - 0.5;
        const n2 = hash(s.x - it*733, s.y + it*379) - 0.5;
        let nx = clamp(Math.round(s.x + n1*2*amp), 0, W-1);
        let ny = clamp(Math.round(s.y + n2*2*amp), 0, H-1);
        const want = s.isLand ? 1 : 0;
        if(effMask && effMask[idx(nx,ny)] !== want){
          // try half amplitude snap
          nx = clamp(Math.round(s.x + n1*amp), 0, W-1);
          ny = clamp(Math.round(s.y + n2*amp), 0, H-1);
          if(effMask && effMask[idx(nx,ny)] !== want){ nx = s.x; ny = s.y; }
        }
        s.x = nx; s.y = ny;
      }
    }
  }

  // 4) Affine transform (scale & rotate around center or origin)
  function doAffine(scaleX=1, scaleY=1, thetaDeg=0, aboutCenter=true){
    if(needSeeds()) return;
    const cx = aboutCenter ? (W-1)/2 : 0;
    const cy = aboutCenter ? (H-1)/2 : 0;
    const θ = thetaDeg * Math.PI/180;
    const c = Math.cos(θ), s = Math.sin(θ);

    for(const p of seeds){
      // translate to origin/center
      const x0 = p.x - cx;
      const y0 = p.y - cy;
      // rotate to principal axes
      const xr =  c*x0 + s*y0;
      const yr = -s*x0 + c*y0;
      // scale
      let xs = xr * scaleX;
      let ys = yr * scaleY;
      // rotate back
      const x1 =  c*xs - s*ys;
      const y1 =  s*xs + c*ys;
      // translate back
      let nx = clamp(Math.round(x1 + cx), 0, W-1);
      let ny = clamp(Math.round(y1 + cy), 0, H-1);
      // keep medium
      const want = p.isLand ? 1 : 0;
      if(effMask && effMask[idx(nx,ny)] !== want){
        // blend toward original until valid
        nx = p.x; ny = p.y;
      }
      p.x = nx; p.y = ny;
    }
  }

  // ---- wire buttons ----
  function applyOnce(){
    const method = methodSel.value;
    const iters  = Math.max(1, (card.querySelector('#vd-iters').value|0));

    const t0 = performance.now();
    if(method==='lloyd'){
      const snapR = Math.max(1, (card.querySelector('#vd-lloyd-snap').value|0));
      doLloyd(iters, snapR);
      setStatus?.(`Applied Lloyd×${iters} (snap ${snapR}) in ${(performance.now()-t0|0)} ms`);
    }else if(method==='repel'){
      const R = Math.max(2, (card.querySelector('#vd-repel-r').value|0));
      const K = Math.max(1, (card.querySelector('#vd-repel-k').value|0));
      doRepel(iters, R, K);
      setStatus?.(`Applied Repel×${iters} (R=${R}, k=${K}) in ${(performance.now()-t0|0)} ms`);
    }else if(method==='jitter'){
      const A = Math.max(1, (card.querySelector('#vd-jitter-amp').value|0));
      doJitter(iters, A);
      setStatus?.(`Applied Jitter×${iters} (amp=${A}) in ${(performance.now()-t0|0)} ms`);
    }else if(method==='affine'){
      const sx = parseFloat(card.querySelector('#vd-ax').value)||1;
      const sy = parseFloat(card.querySelector('#vd-ay').value)||1;
      const th = parseFloat(card.querySelector('#vd-aθ').value)||0;
      const ac = !!card.querySelector('#vd-a-about-center').checked;
      doAffine(sx, sy, th, ac);
      setStatus?.(`Applied Affine (sx=${sx.toFixed(2)}, sy=${sy.toFixed(2)}, θ=${th}°) in ${(performance.now()-t0|0)} ms`);
    }
    // live preview of seeds on base
    if(typeof renderPreview === 'function') renderPreview();
    else if(typeof renderLevel === 'function') renderLevel(currentLevel);
  }

  card.querySelector('#vd-apply').addEventListener('click', applyOnce);
  card.querySelector('#vd-apply-run').addEventListener('click', ()=>{ applyOnce(); reRunVoronoi(); });

})();
