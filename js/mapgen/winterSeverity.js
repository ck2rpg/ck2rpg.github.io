/**
 * Creates winter severity bias for each province based on their location.
 * Updates the severity attribute of each province in the world object.
 */
function createWinterSeverity() {
    world.provinces.forEach(p => {
      let y = p.y;
      let dist = eqDist(y);
      if (dist < 1022) {
        p.severity = 0.1
      } else if (dist < 1700) {
        p.severity = 0.2
      } else if (dist < 1900) {
        p.severity = 0.3
      } else if (dist < 2047) {
        p.severity = 0.4
      } else if (dist < 2200) {
        p.severity = 0.5
      } else if (dist < 2400) {
        p.severity = 0.6
      } else if (dist < 2600) {
        p.severity = 0.7
      } else if (dist < 3070) {
        p.severity = 0.8
      } else {
        p.severity = 0.9
      }
    });
  }
  
  /**
   * Writes the winter severity bias for each province to a file.
   * The file is made available for download.
   */
  function writeWinterSeverity() {
    let t = `${daBom}\n`;
  
    world.provinces.forEach(p => {
      t += `#b_${p.titleName}\n`;
      t += `${p.id} = {\n`;
      t += `  winter_severity_bias = ${p.severity}\n`;
      t += `}\n`;
    });
  
    var data = new Blob([t], { type: 'text/plain' });
    var url = window.URL.createObjectURL(data);
    let link = `<a id="gen_province_properties" download="gen_province_properties.txt" href="">Download Province Properties (Winter Severity)</a><br>`;
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`gen_province_properties`).href = url;
    document.getElementById(`gen_province_properties`).click();
  }