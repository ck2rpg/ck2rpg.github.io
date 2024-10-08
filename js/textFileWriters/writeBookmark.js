function writeBookmark() {
    let c;
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        if (p.isImpassable || p.isOcean || p.isRiver || p.isImpassableSea) {

        } else {
            c = p.county;
            break;
        }
    }
    let t = `${daBom}bm_mod_placeholder = {\n`
    t += `  start_date = ${world.year}.${world.month}.${world.day}\n`
    t += `  is_playable = yes\n`
    t += `  group = bm_mod_group\n`
    t += `  weight = { value = 100 }\n`
    t += `
    character = {\n
		name = "bookmark_ck2rpg\n"
		dynasty = ${c.holder.dyn}\n
		dynasty_splendor_level = 1\n
		type = ${c.holder.gender}\n
		birth = ${c.holder.birth}\n
		title = c_${c.titleName}\n
		government = tribal_government\n
		culture = ${c.holder.culture.id}\n
		religion = ${c.holder.religion.name}\n
		difficulty = "BOOKMARK_CHARACTER_DIFFICULTY_EASY"\n
		history_id = ${c.holder.id}\n
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

    let t2 = `${daBom}`
    t2 = `
bookmark_ck2rpg={
    type=${c.gender}
    id=${c.id}
    age=0.${c.age}0000
    genes={ 		
        hair_color={ 99 231 74 244 }
        skin_color={ 138 155 125 147 }
        eye_color={ 24 236 82 246 }
        gene_chin_forward={ "chin_forward_pos" 147 "chin_forward_neg" 102 }
        gene_chin_height={ "chin_height_pos" 133 "chin_height_pos" 132 }
        gene_chin_width={ "chin_width_neg" 120 "chin_width_pos" 127 }
        gene_eye_angle={ "eye_angle_pos" 127 "eye_angle_neg" 90 }
        gene_eye_depth={ "eye_depth_neg" 118 "eye_depth_neg" 123 }
        gene_eye_height={ "eye_height_pos" 136 "eye_height_neg" 122 }
        gene_eye_distance={ "eye_distance_pos" 131 "eye_distance_neg" 104 }
        gene_eye_shut={ "eye_shut_pos" 137 "eye_shut_pos" 133 }
        gene_forehead_angle={ "forehead_angle_pos" 128 "forehead_angle_pos" 152 }
        gene_forehead_brow_height={ "forehead_brow_height_pos" 139 "forehead_brow_height_pos" 130 }
        gene_forehead_roundness={ "forehead_roundness_pos" 176 "forehead_roundness_neg" 121 }
        gene_forehead_width={ "forehead_width_neg" 77 "forehead_width_neg" 118 }
        gene_forehead_height={ "forehead_height_neg" 84 "forehead_height_neg" 51 }
        gene_head_height={ "head_height_neg" 104 "head_height_neg" 90 }
        gene_head_width={ "head_width_pos" 152 "head_width_pos" 149 }
        gene_head_profile={ "head_profile_pos" 182 "head_profile_neg" 102 }
        gene_head_top_height={ "head_top_height_pos" 140 "head_top_height_neg" 122 }
        gene_head_top_width={ "head_top_width_pos" 168 "head_top_width_pos" 150 }
        gene_jaw_angle={ "jaw_angle_pos" 141 "jaw_angle_neg" 112 }
        gene_jaw_forward={ "jaw_forward_pos" 128 "jaw_forward_neg" 114 }
        gene_jaw_height={ "jaw_height_neg" 124 "jaw_height_pos" 136 }
        gene_jaw_width={ "jaw_width_pos" 134 "jaw_width_neg" 82 }
        gene_mouth_corner_depth={ "mouth_corner_depth_pos" 131 "mouth_corner_depth_pos" 131 }
        gene_mouth_corner_height={ "mouth_corner_height_neg" 123 "mouth_corner_height_neg" 124 }
        gene_mouth_forward={ "mouth_forward_neg" 119 "mouth_forward_neg" 118 }
        gene_mouth_height={ "mouth_height_pos" 158 "mouth_height_neg" 76 }
        gene_mouth_width={ "mouth_width_neg" 118 "mouth_width_pos" 181 }
        gene_mouth_upper_lip_size={ "mouth_upper_lip_size_pos" 167 "mouth_upper_lip_size_neg" 121 }
        gene_mouth_lower_lip_size={ "mouth_lower_lip_size_pos" 176 "mouth_lower_lip_size_pos" 168 }
        gene_mouth_open={ "mouth_open_pos" 157 "mouth_open_neg" 88 }
        gene_neck_length={ "neck_length_neg" 117 "neck_length_neg" 104 }
        gene_neck_width={ "neck_width_neg" 105 "neck_width_pos" 133 }
        gene_bs_cheek_forward={ "cheek_forward_neg" 35 "cheek_forward_neg" 23 }
        gene_bs_cheek_height={ "cheek_height_pos" 19 "cheek_height_neg" 32 }
        gene_bs_cheek_width={ "cheek_width_pos" 21 "cheek_width_neg" 26 }
        gene_bs_ear_angle={ "ear_angle_pos" 111 "ear_angle_pos" 15 }
        gene_bs_ear_inner_shape={ "ear_inner_shape_pos" 95 "ear_inner_shape_pos" 22 }
        gene_bs_ear_bend={ "ear_upper_bend_pos" 39 "ear_both_bend_pos" 142 }
        gene_bs_ear_outward={ "ear_outward_neg" 35 "ear_outward_neg" 3 }
        gene_bs_ear_size={ "ear_size_neg" 5 "ear_size_neg" 30 }
        gene_bs_eye_corner_depth={ "eye_corner_depth_pos" 170 "eye_corner_depth_pos" 2 }
        gene_bs_eye_fold_shape={ "eye_fold_shape_neg" 13 "eye_fold_shape_neg" 2 }
        gene_bs_eye_size={ "eye_size_pos" 29 "eye_size_neg" 51 }
        gene_bs_eye_upper_lid_size={ "eye_upper_lid_size_pos" 82 "eye_upper_lid_size_pos" 65 }
        gene_bs_forehead_brow_curve={ "forehead_brow_curve_pos" 1 "forehead_brow_curve_neg" 75 }
        gene_bs_forehead_brow_forward={ "forehead_brow_forward_pos" 17 "forehead_brow_forward_neg" 26 }
        gene_bs_forehead_brow_inner_height={ "forehead_brow_inner_height_neg" 47 "forehead_brow_inner_height_neg" 39 }
        gene_bs_forehead_brow_outer_height={ "forehead_brow_outer_height_pos" 32 "forehead_brow_outer_height_neg" 16 }
        gene_bs_forehead_brow_width={ "forehead_brow_width_neg" 70 "forehead_brow_width_neg" 4 }
        gene_bs_jaw_def={ "jaw_def_neg" 63 "jaw_def_neg" 48 }
        gene_bs_mouth_lower_lip_def={ "mouth_lower_lip_def_pos" 104 "mouth_lower_lip_def_pos" 81 }
        gene_bs_mouth_lower_lip_full={ "mouth_lower_lip_full_pos" 81 "mouth_lower_lip_full_pos" 58 }
        gene_bs_mouth_lower_lip_pad={ "mouth_lower_lip_pad_pos" 118 "mouth_lower_lip_pad_pos" 15 }
        gene_bs_mouth_lower_lip_width={ "mouth_lower_lip_width_neg" 74 "mouth_lower_lip_width_pos" 125 }
        gene_bs_mouth_philtrum_def={ "mouth_philtrum_def_pos" 10 "mouth_philtrum_def_pos" 49 }
        gene_bs_mouth_philtrum_shape={ "mouth_philtrum_shape_neg" 24 "mouth_philtrum_shape_pos" 15 }
        gene_bs_mouth_philtrum_width={ "mouth_philtrum_width_neg" 0 "mouth_philtrum_width_neg" 141 }
        gene_bs_mouth_upper_lip_def={ "mouth_upper_lip_def_pos" 28 "mouth_upper_lip_def_pos" 49 }
        gene_bs_mouth_upper_lip_full={ "mouth_upper_lip_full_pos" 68 "mouth_upper_lip_full_pos" 39 }
        gene_bs_mouth_upper_lip_profile={ "mouth_upper_lip_profile_pos" 12 "mouth_upper_lip_profile_pos" 43 }
        gene_bs_mouth_upper_lip_width={ "mouth_upper_lip_width_pos" 16 "mouth_upper_lip_width_pos" 13 }
        gene_bs_nose_forward={ "nose_forward_pos" 35 "nose_forward_neg" 4 }
        gene_bs_nose_height={ "nose_height_pos" 118 "nose_height_pos" 5 }
        gene_bs_nose_length={ "nose_length_neg" 45 "nose_length_neg" 81 }
        gene_bs_nose_nostril_height={ "nose_nostril_height_neg" 32 "nose_nostril_height_neg" 8 }
        gene_bs_nose_nostril_width={ "nose_nostril_width_neg" 88 "nose_nostril_width_neg" 15 }
        gene_bs_nose_profile={ "nose_profile_pos" 112 "nose_profile_pos" 57 }
        gene_bs_nose_ridge_angle={ "nose_ridge_angle_neg" 35 "nose_ridge_angle_neg" 33 }
        gene_bs_nose_ridge_width={ "nose_ridge_width_pos" 18 "nose_ridge_width_neg" 17 }
        gene_bs_nose_size={ "nose_size_pos" 107 "nose_size_pos" 210 }
        gene_bs_nose_tip_angle={ "nose_tip_angle_pos" 115 "nose_tip_angle_neg" 104 }
        gene_bs_nose_tip_forward={ "nose_tip_forward_pos" 29 "nose_tip_forward_neg" 49 }
        gene_bs_nose_tip_width={ "nose_tip_width_pos" 133 "nose_tip_width_neg" 16 }
        face_detail_cheek_def={ "cheek_def_02" 175 "cheek_def_02" 102 }
        face_detail_cheek_fat={ "cheek_fat_01_pos" 79 "cheek_fat_04_pos" 26 }
        face_detail_chin_cleft={ "chin_cleft" 149 "chin_dimple" 15 }
        face_detail_chin_def={ "chin_def" 117 "chin_def_neg" 102 }
        face_detail_eye_lower_lid_def={ "eye_lower_lid_def" 83 "eye_lower_lid_def" 41 }
        face_detail_eye_socket={ "eye_socket_color_02" 124 "eye_socket_03" 12 }
        face_detail_nasolabial={ "nasolabial_01" 66 "nasolabial_02" 22 }
        face_detail_nose_ridge_def={ "nose_ridge_def_pos" 7 "nose_ridge_def_pos" 92 }
        face_detail_nose_tip_def={ "nose_tip_def" 193 "nose_tip_def" 65 }
        face_detail_temple_def={ "temple_def" 47 "temple_def" 4 }
        expression_brow_wrinkles={ "brow_wrinkles_04" 0 "brow_wrinkles_04" 246 }
        expression_eye_wrinkles={ "eye_wrinkles_02" 218 "eye_wrinkles_01" 34 }
        expression_forehead_wrinkles={ "forehead_wrinkles_01" 64 "forehead_wrinkles_01" 12 }
        expression_other={ "cheek_wrinkles_both_01" 51 "cheek_wrinkles_both_01" 0 }
        complexion={ "complexion_3" 236 "complexion_7" 210 }
        gene_height={ "normal_height" 117 "normal_height" 128 }
        gene_bs_body_type={ "body_fat_head_fat_medium" 111 "body_fat_head_fat_medium" 140 }
        gene_bs_body_shape={ "body_shape_hourglass_full" 10 "body_shape_rectangle_full" 0 }
        gene_bs_bust={ "bust_clothes" 199 "bust_default" 150 }
        gene_age={ "old_3" 147 "old_1" 1 }
        gene_eyebrows_shape={ "close_spacing_low_thickness" 217 "close_spacing_avg_thickness" 230 }
        gene_eyebrows_fullness={ "layer_2_avg_thickness" 182 "layer_2_avg_thickness" 179 }
        gene_body_hair={ "body_hair_dense" 240 "body_hair_avg" 252 }
        gene_hair_type={ "hair_curly" 174 "hair_wavy" 103 }
        gene_baldness={ "no_baldness" 127 "no_baldness" 127 }
        eye_accessory={ "normal_eyes" 152 "normal_eyes" 152 }
        teeth_accessory={ "normal_teeth" 0 "normal_teeth" 0 }
        eyelashes_accessory={ "normal_eyelashes" 82 "normal_eyelashes" 82 }
        pose={ "" 255 "" 0 }
        beards={ "mena_beards_curly" 159 "no_beard" 0 }
        clothes={ "mena_low_nobility_clothes" 198 "most_clothes" 0 }
        hairstyles={ "mena_hairstyles_curly" 145 "all_hairstyles" 0 }
        headgear={ "mena_low_nobility" 168 "no_headgear" 0 }
        legwear={ "mena_war_legwear" 44 "all_legwear" 0 }
    }
    entity={ 807438772 807438772 }
}
    `
    var data2 = new Blob([t2], {type: 'text/plain'})
    var url2 = window.URL.createObjectURL(data2);
    let link2 = `<a id="bm-character-download-link" download="bookmark_ck2rpg.txt" href="">Bookmark Character</a><br>`
    document.getElementById("download-links").innerHTML += `${link2}`;
    document.getElementById('bm-character-download-link').href = url2
    document.getElementById('bm-character-download-link').click() 
}

function writeBookmarkLocalization() {
    let t = `${daBom}l_english:\n`
    let namelist = `${daBom}l_english:\n`
    t += `bm_mod_group:0 "Procedural Map Generator\n`
    t += `bm_mod_placeholder:0 "The Beginning of History\n`
    t += `bm_mod_placeholder_desc:0 "This is the first bookmark"\n`
    t += `start_year_${world.year}_${world.month}_${world.day}_desc:0 "History"`
    for (let i = 0; i < world.cultures.length; i++) {
        let culture = world.cultures[i]
        t += `${culture.id}_group: "${culture.name}"\n`
        t += `${culture.id}_group_collective_nooun: "${culture.name}"\n`
        t += `${culture.id}_prefix: "${culture.name}"\n`
        t += `${culture.id}: "${culture.name}"\n`
        t += `${culture.id}_collective_noun: "${culture.name}"\n`
        namelist += `${culture.name_list}: "${culture.name}"\n`
    }
    var data = new Blob([t], {type: 'text/yaml'})
    var url = window.URL.createObjectURL(data);
    let link = `<a id="culture_loc_link" download="gen_cultures_l_english.yml" href="">Download Culture Localization</a><br>`
    document.getElementById("download-links").innerHTML += `${link}`;
    document.getElementById(`culture_loc_link`).href = url
    document.getElementById(`culture_loc_link`).click();
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