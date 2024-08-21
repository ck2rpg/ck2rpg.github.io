function writeSettings() {
    let t = `Resolution: ${world.width}x${world.height}\n`
    t += `Map Size: ${settings.width}x${settings.height}\n`
    
    var data = new Blob([t], {type: 'text/plain'});
    var url = window.URL.createObjectURL(data);
    
    let link = `<a id="settings-download-link" download="settings.txt" href="">Download settings.txt</a><br>`;
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`settings-download-link`).href = url;
    document.getElementById(`settings-download-link`).click();
}
