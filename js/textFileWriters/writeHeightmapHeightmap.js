function writeHeightmapHeightmap() {
    let t = `${daBom}`
    t += ``
    t += `heightmap_file="map_data/packed_heightmap.png"\n`
    t += `indirection_file="map_data/indirection_heightmap.png"\n`
    t += `original_heightmap_size={ ${settings.width} ${settings.height} }\n`
    t += `tile_size=33\n`
    t += `should_wrap_x=no\n`
    t += `level_offsets={ { 0 0 } { 0 0 } { 0 42 } { 0 667 } { 0 879 } }\n`
    t += `max_compress_level=4\n`
    t += `empty_tile_offset={ 220 30 }`
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="heightmap-dot-heightmap-download-link" download="heightmap.heightmap" href="">Download heightmap.heightmap</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`heightmap-dot-heightmap-download-link`).href = url
    document.getElementById(`heightmap-dot-heightmap-download-link`).click()
}