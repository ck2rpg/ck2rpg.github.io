function writeBookmark() {
    let t = `${daBom}bm_mod_placeholder = {\n`
    t += `  start_date = ${world.year}.${world.month}.${world.day}\n`
    t += `  is_playable = yes\n`
    t += `  group = bm_mod_group\n`
    t += `  weight = { value = 100 }\n`
    t += `
    character = {\n
		name = "bookmark_canarias_guanarigato\n"
		dynasty = ${world.counties[0].holder.dyn}\n
		dynasty_splendor_level = 1\n
		type = ${world.counties[0].holder.gender}\n
		birth = ${world.counties[0].holder.birth}\n
		title = c_${world.counties[0].titleName}\n
		government = tribal_government\n
		culture = ${world.counties[0].holder.culture.id}\n
		religion = "${world.counties[0].holder.religion.id}\n"
		difficulty = "BOOKMARK_CHARACTER_DIFFICULTY_EASY\n"
		history_id = ${world.counties[0].holder.id}\n
		position = { 500 1000 }\n

		animation = happiness\n
	}\n
}`
    var data = new Blob([t], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="bm-download-link" download="00_bookmarks.txt" href="">Bookmark</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('bm-download-link').href = url
    document.getElementById('bm-download-link').click() 
}

function writeBookmarkGroup() {
    let n = `${daBom}bm_mod_group = {\n`
    n += `  default_start_date = ${world.year}.${world.month}.${world.day}\n`
    n += `}`
    var data = new Blob([n], {type: 'text/plain'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="bm-group-download-link" download="00_bookmark_groups.txt" href="">Bookmark Group</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById('bm-group-download-link').href = url
    document.getElementById('bm-group-download-link').click()
}