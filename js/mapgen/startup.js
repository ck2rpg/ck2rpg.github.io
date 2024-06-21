function startup() {
  GID("loading-screen").style.display = "block"

  setTimeout(function() {
    createWorld();
    for (let i = 0; i < 10; i++) {
      console.log(i);
      spreadingCenterEmits();
      spread();
    }
    spreadProcess(20);
    cleanupAll()
    getBeaches();
    setMoisture();
    hpRivers();
    floodFillMountains();
    drawWorld();

    // Hide the loading screen after the processing is done
    GID("loading-screen").style.display = "none";
  }, 0); // setTimeout with 0 delay
}

window.onload = function() {
  document.getElementById("loading-screen").style.display = "none"
  document.getElementById("settings-box").style.display = "block"
};