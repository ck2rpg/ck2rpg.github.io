function writeDescriptor() {
    let t = `version="0.1"\n`
    t += `tags={\n`
	t += `  "Map"\n`
    t += `}\n`
    t += `name="Your Mod Name Here"\n`
    t += `replace_path="gfx/portraits/portrait_modifiers/01_headgear_base.txt"\n`
    t += `replace_path="gui/frontend_main.gui"\n`
    t += `replace_path="common/bookmark_portraits"\n`
    t += `replace_path="common/bookmarks"\n`
    t += `replace_path="common/religion/religions"\n`
    t += `replace_path="common/religion/holy_sites"\n`
    t += `replace_path="common/decisions"\n`
    t += `replace_path="common/culture/creation_names"\n`
    t += `replace_path="history/characters"\n`
    t += `replace_path="history/provinces"\n`
    t += `replace_path="history/titles"\n`
    t += `replace_path="map_data"\n`
    t += `replace_path="gfx/map/map_object_data"\n`
    t += `supported_version="1.12.*"`
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="descriptor-download-link" download="descriptor.mod" href="">Download descriptor.mod</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`descriptor-download-link`).href = url
    document.getElementById(`descriptor-download-link`).click()
}

