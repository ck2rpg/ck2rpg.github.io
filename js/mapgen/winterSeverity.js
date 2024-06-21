/**
 * Creates winter severity bias for each province based on their location.
 * Updates the severity attribute of each province in the world object.
 */
function createWinterSeverity() {
    world.provinces.forEach(p => {
      let y = p.y;
      let bigY = p.bigCell.y;
  
      if (p.land) {
        if (bigY < world.steppeTop && bigY > world.steppeBottom) {
          p.severity = `0.0`;
        } else if (y > 3800) {
          p.severity = `0.9`;
        } else if (y > 3600) {
          p.severity = `0.8`;
        } else if (y > 3400) {
          p.severity = `0.7`;
        } else if (y > 3200) {
          p.severity = `0.6`;
        } else if (y > 3000) {
          p.severity = `0.5`;
        } else if (y > 2800) {
          p.severity = `0.4`;
        } else if (y > 2700) {
          p.severity = `0.3`;
        } else if (y > 2600) {
          p.severity = `0.2`;
        } else if (y > 2500) {
          p.severity = `0.1`;
        } else if (y < 1500) {
          p.severity = `0.1`;
        } else if (y < 1400) {
          p.severity = `0.2`;
        } else if (y < 1300) {
          p.severity = `0.3`;
        } else if (y < 1200) {
          p.severity = `0.4`;
        } else if (y < 1000) {
          p.severity = `0.5`;
        } else if (y < 800) {
          p.severity = `0.6`;
        } else if (y < 600) {
          p.severity = `0.7`;
        } else if (y < 400) {
          p.severity = `0.8`;
        } else if (y < 200) {
          p.severity = `0.9`;
        } else {
          p.severity = `0.0`;
        }
      } else {
        p.severity = `0.0`;
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