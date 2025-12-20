// =========================
// Export Province Terrain
// =========================

document.getElementById("exportProvinceTerrain").addEventListener("click", exportProvinceTerrain);

function exportProvinceTerrain() {
  if (!seeds || seeds.length === 0) {
    alert("No provinces exist. Seed the map and run Voronoi first.");
    return;
  }

  // Ensure terrain is assigned
  for (const s of seeds) {
    if (!s.terrain) s.terrain = getTerrainAt(s.x, s.y);
  }

  //
  // 1. Province IDs in definition.csv are:
  //    Land provinces first, then sea provinces.
  //
  const landIdx = [];
  const seaIdx = [];

  for (let i = 0; i < seeds.length; i++) {
    (seeds[i].isLand ? landIdx : seaIdx).push(i);
  }

  const ordering = landIdx.concat(seaIdx);

  //
  // 2. Build lines
  //
  const lines = [];
  lines.push("default_land=plains");
  lines.push("default_sea=sea");
  lines.push("default_coastal_sea=coastal_sea");

  // Provincial terrain list:
  // ID starts at 1
  let id = 1;
  for (const seedIndex of ordering) {
    const s = seeds[seedIndex];
    const terrain = s.terrain ?? "plains";
    lines.push(`${id}=${terrain}`);
    id++;
  }

  //
  // 3. Save file
  //
  const txt = lines.join("\n");
  const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "00_province_terrain.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  setStatus("Exported 00_province_terrain.txt");
}