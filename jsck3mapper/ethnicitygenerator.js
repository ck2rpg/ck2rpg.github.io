/*
Eye Colors
a	Hue band	0 → brown, 0.33 → green, 0.67 → teal/blue	Horizontal region
b	Lightness	0 → light, 1 → dark	Vertical position
c	Fine hue	0 → left of band, 1 → right of band	Tint inside band
d	Saturation/contrast	0–1	Vibrancy

*/

const eyeColors = [
  { name: "Brown", color: [0.05, 0.5, 0.33, 0.8] },
  { name: "Green", color: [0.33, 0.5, 0.67, 0.8] },
  { name: "Caucasian Base Blue", color: [0.67, 0.5, 1.0, 0.8] },
  { name: "Brown", color: [0.05, 0.7, 0.35, 1.0] },
  { name: "Black", color: [0.05, 0.95, 0.35, 1.0] },
  { name: "Byzantine Blue", color: [0.0, 0.0, 0.33, 0.7] },
  { name: "Byzantine Green", color: [0.33, 0.0, 0.67, 0.7] },
  { name: "Byzantine Brown", color: [0.67, 0.4, 1.0, 1.0] },
  { name: "Default Morph Blue", color: [0.0, 0.05, 0.33, 0.6] },
  { name: "Default Morph Green", color: [0.33, 0.05, 0.67, 0.6] },
  { name: "Default Morph Brown", color: [0.67, 0.1, 0.9, 0.8] },
  { name: "Black", color: [0.05, 0.95, 0.35, 0.99] },
];




/*

The hair palette is a 2D gradient texture (your hair_palette.dds) that looks like:

Left side: cool blondes & ash tones

Upper-middle: warm blondes

Center: mid-browns

Right side: reds → bright gingers

Bottom: dark browns → black

BUT the palette is not sampled directly by X/Y click positions.

Instead, CK3 uses a four-number melanin model, and the shader uses those four parameters to compute UV coordinates into the palette.

TOP LEFT    = Ash blonde / platinum  
TOP MIDDLE  = Warm blondes / sandy blondes  
TOP RIGHT   = Orange → Ginger  
MID LEFT    = Light browns  
MID CENTER  = Browns  
MID RIGHT   = Red-browns / coppers  
BOTTOM      = Browns → Dark browns → Black

The melanin parameters determine how high/low you land vertically.
The red_bias shifts you left/right.
*/

const hairColors = [
  { name: "Mid brown", color: [0.6, 0.75, 0.6, 0.75] },
  { name: "Blonde", color: [0.4, 0.25, 0.75, 0.5] },
  { name: "Brown", color: [0.65, 0.5, 0.9, 0.8] },
  { name: "Red", color: [0.85, 0.0, 0.97, 0.5] },
  { name: "Black", color: [0.0, 0.9, 0.5, 1.0] },
  { name: "Red", color: [0.85, 0.0, 1.0, 0.5] },
  { name: "Commented Blonde", color: [0.25, 0.2, 0.75, 0.55] },
  { name: "Brown", color: [0.65, 0.7, 0.9, 1.0] },
  { name: "Red", color: [0.85, 0.0, 1.0, 0.5] },
  { name: "Black", color: [0.01, 0.9, 0.5, 0.99] },
  { name: "Black", color: [0.01, 0.95, 0.5, 0.99] },
  { name: "Brown", color: [0.65, 0.8, 0.9, 1.0] },
  { name: "Blonde", color: [0.25, 0.2, 0.75, 0.25] },
  { name: "Brown", color: [0.65, 0.45, 0.9, 1.0] },
  { name: "Black", color: [0.0, 0.9, 0.5, 1.0] },
  { name: "Blonde", color: [0.25, 0.2, 0.6, 0.55] },
  { name: "Red", color: [0.85, 0.0, 0.95, 0.5] },
  { name: "Black", color: [0.0, 0.9, 0.5, 1.0] },
  { name: "Red", color: [0.7, 0.3, 0.95, 0.5] },
  { name: "Auburn", color: [0.8, 0.55, 0.95, 0.8] },
  { name: "Brown", color: [0.65, 0.65, 0.9, 0.8] },
  { name: "Blonde", color: [0.25, 0.2, 0.75, 0.25] },
  { name: "Red", color: [0.85, 0.0, 1.0, 0.5] },
  { name: "Brown", color: [0.65, 0.65, 0.9, 0.8] },
  { name: "Brown", color: [0.65, 0.5, 0.9, 1.0] },
  { name: "Black", color: [0.0, 0.9, 0.2, 1.0] },
  { name: "Brown", color: [0.65, 0.8, 0.9, 1.0] },
  { name: "Black", color: [0.01, 0.96, 0.3, 0.99] },
  { name: "Blonde", color: [0.25, 0.4, 0.75, 0.65] },
  { name: "Red", color: [0.85, 0.0, 1.0, 0.5] },
  { name: "Black", color: [0.01, 0.95, 0.3, 0.99] },
  { name: "Blonde", color: [0.25, 0.2, 0.6, 0.55] },
];

const genes = [
  { gene: "complexion", attributes: ["complexion_1", "complexion_2", "complexion_3", "complexion_4", "complexion_5", "complexion_6", "complexion_7"] },
  { gene: "face_detail_cheek_def", attributes: ["cheek_def_01", "cheek_def_02"] },
  { gene: "face_detail_cheek_fat", attributes: ["cheek_fat_01_neg", "cheek_fat_01_pos", "cheek_fat_02_pos", "cheek_fat_03_pos", "cheek_fat_04_pos"] },
  { gene: "face_detail_chin_cleft", attributes: ["chin_cleft", "chin_dimple"] },
  { gene: "face_detail_chin_def", attributes: ["chin_def", "chin_def_neg"] },
  { gene: "face_detail_eye_lower_lid_def", attributes: ["eye_lower_lid_def", "eye_lower_lid_def_02"] },
  { gene: "face_detail_eye_socket", attributes: ["eye_socket_01", "eye_socket_02", "eye_socket_03", "eye_socket_color_01", "eye_socket_color_02", "eye_socket_color_03"] },
  { gene: "face_detail_nasolabial", attributes: ["nasolabial_01", "nasolabial_02", "nasolabial_03", "nasolabial_04"] },
  { gene: "face_detail_nose_ridge_def", attributes: ["nose_ridge_def_neg", "nose_ridge_def_pos"] },
  { gene: "face_detail_nose_tip_def", attributes: ["nose_tip_def"] },
  { gene: "face_detail_temple_def", attributes: ["temple_def"] },
  { gene: "gene_age", attributes: ["old_1", "old_2", "old_3", "old_4", "old_5"] },
  { gene: "gene_baldness", attributes: ["male_pattern_baldness"] },
  { gene: "gene_body_hair", attributes: ["body_hair_avg", "body_hair_avg_low_stubble", "body_hair_avg_lower_stubble", "body_hair_dense", "body_hair_dense_low_stubble", "body_hair_dense_lower_stubble", "body_hair_sparse", "body_hair_sparse_low_stubble", "body_hair_sparse_lower_stubble"] },
  { gene: "gene_bs_body_shape", attributes: ["body_shape_apple_full", "body_shape_apple_half", "body_shape_average", "body_shape_hourglass_full", "body_shape_hourglass_half", "body_shape_pear_full", "body_shape_pear_half", "body_shape_rectangle_full", "body_shape_rectangle_half", "body_shape_triangle_full", "body_shape_triangle_half"] },
  { gene: "gene_bs_body_type", attributes: ["body_average", "body_fat_head_fat_full", "body_fat_head_fat_low", "body_fat_head_fat_medium"] },
  { gene: "gene_bs_bust", attributes: ["bust_clothes", "bust_default", "bust_shape_1_full", "bust_shape_1_half", "bust_shape_2_full", "bust_shape_2_half", "bust_shape_3_full", "bust_shape_3_half", "bust_shape_4_full", "bust_shape_4_half"] },
  { gene: "gene_bs_cheek_forward", attributes: ["cheek_forward_neg", "cheek_forward_pos"] },
  { gene: "gene_bs_cheek_height", attributes: ["cheek_height_neg", "cheek_height_pos"] },
  { gene: "gene_bs_cheek_width", attributes: ["cheek_width_neg", "cheek_width_pos"] },
  { gene: "gene_bs_ear_angle", attributes: ["ear_angle_neg", "ear_angle_pos"] },
  { gene: "gene_bs_ear_bend", attributes: ["ear_both_bend_pos", "ear_lower_bend_pos", "ear_upper_bend_pos"] },
  { gene: "gene_bs_ear_inner_shape", attributes: ["ear_inner_shape_pos"] },
  { gene: "gene_bs_ear_outward", attributes: ["ear_outward_neg", "ear_outward_pos"] },
  { gene: "gene_bs_ear_size", attributes: ["ear_size_neg", "ear_size_pos"] },
  { gene: "gene_bs_eye_corner_depth", attributes: ["eye_corner_depth_neg", "eye_corner_depth_pos"] },
  { gene: "gene_bs_eye_fold_shape", attributes: ["eye_fold_shape_02_neg", "eye_fold_shape_neg", "eye_fold_shape_pos"] },
  { gene: "gene_bs_eye_size", attributes: ["eye_size_neg", "eye_size_pos"] },
  { gene: "gene_bs_eye_upper_lid_size", attributes: ["eye_upper_lid_size_neg", "eye_upper_lid_size_pos"] },
  { gene: "gene_bs_forehead_brow_curve", attributes: ["forehead_brow_curve_neg", "forehead_brow_curve_pos"] },
  { gene: "gene_bs_forehead_brow_forward", attributes: ["forehead_brow_forward_neg", "forehead_brow_forward_pos"] },
  { gene: "gene_bs_forehead_brow_inner_height", attributes: ["forehead_brow_inner_height_neg", "forehead_brow_inner_height_pos"] },
  { gene: "gene_bs_forehead_brow_outer_height", attributes: ["forehead_brow_outer_height_neg", "forehead_brow_outer_height_pos"] },
  { gene: "gene_bs_forehead_brow_width", attributes: ["forehead_brow_width_neg", "forehead_brow_width_pos"] },
  { gene: "gene_bs_jaw_def", attributes: ["jaw_def_neg", "jaw_def_pos"] },
  { gene: "gene_bs_mouth_lower_lip_def", attributes: ["mouth_lower_lip_def_pos"] },
  { gene: "gene_bs_mouth_lower_lip_full", attributes: ["mouth_lower_lip_full_neg", "mouth_lower_lip_full_pos"] },
  { gene: "gene_bs_mouth_lower_lip_pad", attributes: ["mouth_lower_lip_pad_neg", "mouth_lower_lip_pad_pos"] },
  { gene: "gene_bs_mouth_lower_lip_width", attributes: ["mouth_lower_lip_width_neg", "mouth_lower_lip_width_pos"] },
  { gene: "gene_bs_mouth_philtrum_def", attributes: ["mouth_philtrum_def_pos"] },
  { gene: "gene_bs_mouth_philtrum_shape", attributes: ["mouth_philtrum_shape_neg", "mouth_philtrum_shape_pos"] },
  { gene: "gene_bs_mouth_philtrum_width", attributes: ["mouth_philtrum_width_neg", "mouth_philtrum_width_pos"] },
  { gene: "gene_bs_mouth_upper_lip_def", attributes: ["mouth_upper_lip_def_pos"] },
  { gene: "gene_bs_mouth_upper_lip_full", attributes: ["mouth_upper_lip_full_neg", "mouth_upper_lip_full_pos"] },
  { gene: "gene_bs_mouth_upper_lip_profile", attributes: ["mouth_upper_lip_profile_neg", "mouth_upper_lip_profile_pos"] },
  { gene: "gene_bs_mouth_upper_lip_width", attributes: ["mouth_upper_lip_width_neg", "mouth_upper_lip_width_pos"] },
  { gene: "gene_bs_nose_forward", attributes: ["nose_forward_neg", "nose_forward_pos"] },
  { gene: "gene_bs_nose_height", attributes: ["nose_height_neg", "nose_height_pos"] },
  { gene: "gene_bs_nose_length", attributes: ["nose_length_neg", "nose_length_pos"] },
  { gene: "gene_bs_nose_nostril_height", attributes: ["nose_nostril_height_neg", "nose_nostril_height_pos"] },
  { gene: "gene_bs_nose_nostril_width", attributes: ["nose_nostril_width_neg", "nose_nostril_width_pos"] },
  { gene: "gene_bs_nose_profile", attributes: ["nose_profile_hawk", "nose_profile_hawk_pos", "nose_profile_neg", "nose_profile_pos"] },
  { gene: "gene_bs_nose_ridge_angle", attributes: ["nose_ridge_angle_neg", "nose_ridge_angle_pos"] },
  { gene: "gene_bs_nose_ridge_width", attributes: ["nose_ridge_width_neg", "nose_ridge_width_pos"] },
  { gene: "gene_bs_nose_size", attributes: ["nose_size_neg", "nose_size_pos"] },
  { gene: "gene_bs_nose_tip_angle", attributes: ["nose_tip_angle_neg", "nose_tip_angle_pos"] },
  { gene: "gene_bs_nose_tip_forward", attributes: ["nose_tip_forward_neg", "nose_tip_forward_pos"] },
  { gene: "gene_bs_nose_tip_width", attributes: ["nose_tip_width_neg", "nose_tip_width_pos"] },
  { gene: "gene_chin_forward", attributes: ["chin_forward_neg", "chin_forward_pos"] },
  { gene: "gene_chin_height", attributes: ["chin_height_neg", "chin_height_pos"] },
  { gene: "gene_chin_width", attributes: ["chin_width_neg", "chin_width_pos"] },
  { gene: "gene_eye_angle", attributes: ["eye_angle_neg", "eye_angle_pos"] },
  { gene: "gene_eye_depth", attributes: ["eye_depth_neg", "eye_depth_pos"] },
  { gene: "gene_eye_distance", attributes: ["eye_distance_neg", "eye_distance_pos"] },
  { gene: "gene_eye_height", attributes: ["eye_height_neg", "eye_height_pos"] },
  { gene: "gene_eye_shut", attributes: ["eye_shut_neg", "eye_shut_pos"] },
  { gene: "gene_eyebrows_fullness", attributes: ["layer_2_avg_thickness", "layer_2_high_thickness", "layer_2_low_thickness", "layer_2_lower_thickness"] },
  { gene: "gene_eyebrows_shape", attributes: ["avg_spacing_avg_thickness", "avg_spacing_high_thickness", "avg_spacing_low_thickness", "avg_spacing_lower_thickness", "close_spacing_avg_thickness", "close_spacing_high_thickness", "close_spacing_low_thickness", "close_spacing_lower_thickness", "far_spacing_avg_thickness", "far_spacing_high_thickness", "far_spacing_low_thickness", "far_spacing_lower_thickness"] },
  { gene: "gene_forehead_angle", attributes: ["forehead_angle_neg", "forehead_angle_pos"] },
  { gene: "gene_forehead_brow_height", attributes: ["forehead_brow_height_neg", "forehead_brow_height_pos"] },
  { gene: "gene_forehead_height", attributes: ["forehead_height_neg", "forehead_height_pos"] },
  { gene: "gene_forehead_roundness", attributes: ["forehead_roundness_neg", "forehead_roundness_pos"] },
  { gene: "gene_forehead_width", attributes: ["forehead_width_neg", "forehead_width_pos"] },
  { gene: "gene_hair_type", attributes: ["hair_afro", "hair_curly", "hair_straight", "hair_straight_thin_beard", "hair_wavy"] },
  { gene: "gene_head_height", attributes: ["head_height_neg", "head_height_pos"] },
  { gene: "gene_head_profile", attributes: ["head_profile_neg", "head_profile_pos"] },
  { gene: "gene_head_top_height", attributes: ["head_top_height_neg", "head_top_height_pos"] },
  { gene: "gene_head_top_width", attributes: ["head_top_width_neg", "head_top_width_pos"] },
  { gene: "gene_head_width", attributes: ["head_width_neg", "head_width_pos"] },
  { gene: "gene_height", attributes: ["normal_height"] },
  { gene: "gene_jaw_angle", attributes: ["jaw_angle_neg", "jaw_angle_pos"] },
  { gene: "gene_jaw_forward", attributes: ["jaw_forward_neg", "jaw_forward_pos"] },
  { gene: "gene_jaw_height", attributes: ["jaw_height_neg", "jaw_height_pos"] },
  { gene: "gene_jaw_width", attributes: ["jaw_width_neg", "jaw_width_pos"] },
  { gene: "gene_mouth_corner_depth", attributes: ["mouth_corner_depth_neg", "mouth_corner_depth_pos"] },
  { gene: "gene_mouth_corner_height", attributes: ["mouth_corner_height_neg", "mouth_corner_height_pos"] },
  { gene: "gene_mouth_forward", attributes: ["mouth_forward_neg", "mouth_forward_pos"] },
  { gene: "gene_mouth_height", attributes: ["mouth_height_neg", "mouth_height_pos"] },
  { gene: "gene_mouth_lower_lip_size", attributes: ["mouth_lower_lip_size_neg", "mouth_lower_lip_size_pos"] },
  { gene: "gene_mouth_open", attributes: ["mouth_open_neg", "mouth_open_pos"] },
  { gene: "gene_mouth_upper_lip_size", attributes: ["mouth_upper_lip_size_neg", "mouth_upper_lip_size_pos"] },
  { gene: "gene_mouth_width", attributes: ["mouth_width_neg", "mouth_width_pos"] },
  { gene: "gene_neck_length", attributes: ["neck_length_neg", "neck_length_pos"] },
  { gene: "gene_neck_width", attributes: ["neck_width_neg", "neck_width_pos"] },
];


// Assumes your `genes` array is in scope.
// This function returns an object like:
//
// {
//   name: "Believable Procedural Ethnicity #1",
//   description: "...",
//   skinTone: { base: 0.45 },
//   hairTone: { darkness: 0.6 },
//   eyeTone:  { lightness: 0.5 },
//   genes: {
//     gene_chin_forward: { chin_forward_neg: 0.38, chin_forward_pos: 0.61 },
//     ...
//   }
// }


function generateEthnicityFromHeritage(heritage) {
  const gs = heritage?.geostats || heritage?.geo || heritage?.gs || null;

  // fallback to your current generator if no stats
  if (!gs) return generateEthnicity();

  // ---------------- helpers ----------------
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const clamp01 = (x) => clamp(x, 0, 1);
  const q2 = (x) => Math.round(x * 100) / 100;

  function pickWeighted(items) {
    // items: [{w:number, v:any}, ...]
    let sum = 0;
    for (const it of items) sum += Math.max(0, it.w || 0);
    if (sum <= 0) return items[Math.floor(Math.random() * items.length)]?.v;
    let r = Math.random() * sum;
    for (const it of items) {
      r -= Math.max(0, it.w || 0);
      if (r <= 0) return it.v;
    }
    return items[items.length - 1].v;
  }

  function choice(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // Triangular-ish distribution around center (less extreme than uniform)
  function randNear(center = 0.5, spread = 0.2, min = 0, max = 1) {
    const a = center - spread;
    const b = center + spread;
    const u = Math.random();
    const v = Math.random();
    let x = a + (b - a) * Math.max(u, v);
    x = clamp(x, min, max);
    return q2(x);
  }

  // ---------------- world signals ----------------
  const terrain = gs.terrainShares || {};
  const koppenS = gs.koppenGroupShares || {};
  const flags = gs.flags || {};
  const elev = gs.elevation || {};
  const ext = gs.extended || {};

  const hot = clamp((koppenS.A || 0) + 0.6 * (koppenS.B || 0), 0, 1); // A + some B
  const cold = clamp((koppenS.D || 0) + 1.2 * (koppenS.E || 0), 0, 1); // D + strong E
  const arid = clamp((koppenS.B || 0), 0, 1);
  const humid = clamp(
    (koppenS.A || 0) +
      0.7 * (terrain.wetland || 0) +
      0.4 * (terrain.jungle || 0) +
      0.25 * (terrain.forest || 0),
    0,
    1
  );

  const coastal = clamp(gs.coastalShare || 0, 0, 1);
  const mountainous = clamp(
    (terrain.mountains || 0) + 0.6 * (terrain.hills || 0) + (flags.isMountainous ? 0.25 : 0),
    0,
    1
  );

  // normalize elevation mean to 0..1 (assume 0..4500ish; tune if your world differs)
  const elev01 = clamp(((elev.mean || 0) / 4500), 0, 1);

  // diversity scalars
  const terrainDiv = clamp(ext.terrainDiversity ?? 0.5, 0, 1);
  const climateDiv = clamp(ext.climateDiversity ?? 0.5, 0, 1);

  // ---------------- phenotype centers (subtle) ----------------
  const skinCenter = clamp(0.38 + 0.28 * hot + 0.12 * humid - 0.22 * cold - 0.08 * coastal, 0.08, 0.9);
  const hairCenter = clamp(0.52 + 0.10 * cold + 0.12 * humid - 0.08 * arid, 0.08, 0.92);
  const eyeCenter = clamp(0.52 + 0.14 * cold + 0.10 * coastal - 0.10 * hot, 0.08, 0.92);

  const spreadBoost = clamp(0.06 + 0.10 * terrainDiv + 0.08 * climateDiv, 0.06, 0.22);

  // Weighted “profiles” (still mild)
  const skinProfile = pickWeighted([
    { w: (1 - hot) * 0.8 + cold * 1.2, v: { id: "light", center: 0.25 } },
    { w: 0.9 + coastal * 0.4, v: { id: "olive", center: 0.4 } },
    { w: hot * 1.2 + humid * 0.6, v: { id: "brown", center: 0.55 } },
    { w: hot * 1.6 + arid * 0.8, v: { id: "dark", center: 0.7 } },
    { w: cold * 0.6, v: { id: "very_light", center: 0.15 } },
  ]);

  const hairProfile = pickWeighted([
    { w: arid * 0.8 + coastal * 0.4, v: { id: "light_brown", center: 0.35 } },
    { w: 1.0, v: { id: "medium_brown", center: 0.5 } },
    { w: humid * 0.8 + cold * 0.6, v: { id: "dark_brown", center: 0.65 } },
    { w: humid * 1.0 + cold * 0.8, v: { id: "black", center: 0.8 } },
    { w: arid * 0.4, v: { id: "light_blond", center: 0.2 } },
  ]);

  const eyeProfile = pickWeighted([
    { w: cold * 1.0 + coastal * 0.8, v: { id: "light", center: 0.3 } },
    { w: 1.0, v: { id: "mixed", center: 0.5 } },
    { w: hot * 1.0 + arid * 0.6, v: { id: "dark", center: 0.7 } },
  ]);

  // ---------------- base ethnicity object ----------------
  const ethnicity = {
    // IMPORTANT: CK3 keys cannot contain spaces; exporter should sanitize keying.
    name: `Procedural Ethnicity ${Math.floor(Math.random() * 100000)}`,
    description: `Geo-biased ethnicity from heritage ${heritage?.key || heritage?.id || ""}`.trim(),
    skinTone: {
      profile: skinProfile.id,
      base: randNear(skinCenter, 0.12 + spreadBoost * 0.25, 0.05, 0.95),
    },
    hairTone: {
      profile: hairProfile.id,
      darkness: randNear(hairCenter, 0.15 + spreadBoost * 0.25, 0.05, 0.95),
    },
    eyeTone: {
      profile: eyeProfile.id,
      lightness: randNear(eyeCenter, 0.15 + spreadBoost * 0.25, 0.05, 0.95),
    },
    genes: {},
  };

  // ---------------- gene generation (scalar weights) ----------------
  // NOTE: CK3 ethnicities want distributions of (weight + name + range),
  // but we still generate scalars first, then convert to CK3 ranges below.

  const categoricalGenes = new Set([
    "gene_body_hair",
    "gene_bs_body_shape",
    "gene_bs_body_type",
    "gene_bs_bust",
    "gene_hair_type",
    "gene_eyebrows_shape",
    "gene_eyebrows_fullness",
    // DO NOT include gene_age here; it caused "old_5" invalid template key in your logs.
    // "gene_age",
  ]);

  const likelyBalancedGenes = new Set([
    "gene_chin_forward","gene_chin_height","gene_chin_width",
    "gene_eye_angle","gene_eye_depth","gene_eye_distance","gene_eye_height","gene_eye_shut",
    "gene_forehead_angle","gene_forehead_brow_height","gene_forehead_height","gene_forehead_roundness","gene_forehead_width",
    "gene_head_height","gene_head_profile","gene_head_top_height","gene_head_top_width","gene_head_width",
    "gene_jaw_angle","gene_jaw_forward","gene_jaw_height","gene_jaw_width",
    "gene_mouth_corner_depth","gene_mouth_corner_height","gene_mouth_forward","gene_mouth_height",
    "gene_mouth_lower_lip_size","gene_mouth_upper_lip_size","gene_mouth_width",
    "gene_neck_length","gene_neck_width",
    "gene_bs_cheek_forward","gene_bs_cheek_height","gene_bs_cheek_width",
    "gene_bs_ear_angle","gene_bs_ear_outward","gene_bs_ear_size",
    "gene_bs_eye_corner_depth","gene_bs_eye_size","gene_bs_eye_upper_lid_size",
    "gene_bs_forehead_brow_curve","gene_bs_forehead_brow_forward","gene_bs_forehead_brow_inner_height","gene_bs_forehead_brow_outer_height","gene_bs_forehead_brow_width",
    "gene_bs_jaw_def",
    "gene_bs_mouth_lower_lip_full","gene_bs_mouth_lower_lip_pad","gene_bs_mouth_lower_lip_width",
    "gene_bs_mouth_philtrum_shape","gene_bs_mouth_philtrum_width",
    "gene_bs_mouth_upper_lip_full","gene_bs_mouth_upper_lip_profile","gene_bs_mouth_upper_lip_width",
    "gene_bs_nose_forward","gene_bs_nose_height","gene_bs_nose_length",
    "gene_bs_nose_nostril_height","gene_bs_nose_nostril_width",
    "gene_bs_nose_profile","gene_bs_nose_ridge_angle","gene_bs_nose_ridge_width",
    "gene_bs_nose_size","gene_bs_nose_tip_angle","gene_bs_nose_tip_forward","gene_bs_nose_tip_width"
  ]);

  function biasValue(v, delta, lo = 0.2, hi = 0.8) {
    return q2(clamp(v + delta, lo, hi));
  }

  // Requires your global `genes` array
  for (const g of genes) {
    const geneName = g.gene;

    // HARD SKIP gene_age (fixes your log spam)
    if (geneName === "gene_age") continue;

    const attrs = g.attributes;
    const geneData = {};

    // 1) categorical genes: pick one dominant attribute
    if (categoricalGenes.has(geneName)) {
      if (geneName === "gene_hair_type") {
        const weighted = attrs.map((a) => {
          let w = 1;
          if (a === "hair_afro") w += humid * 0.9;
          if (a === "hair_curly") w += humid * 0.6;
          if (a === "hair_wavy") w += humid * 0.2;
          if (a === "hair_straight") w += arid * 0.2 + cold * 0.2;
          return { w, v: a };
        });
        const chosenAttr = pickWeighted(weighted);
        for (const attr of attrs) {
          geneData[attr] =
            attr === chosenAttr
              ? randNear(0.65, 0.12, 0.35, 0.95)
              : randNear(0.05, 0.03, 0.0, 0.2);
        }
        ethnicity.genes[geneName] = geneData;
        continue;
      }

      if (geneName === "gene_body_hair") {
        const weighted = attrs.map((a) => {
          let w = 1;
          if (String(a).includes("dense")) w += cold * 0.4 + humid * 0.2;
          if (String(a).includes("sparse")) w += arid * 0.2;
          return { w, v: a };
        });
        const chosenAttr = pickWeighted(weighted);
        for (const attr of attrs) {
          geneData[attr] =
            attr === chosenAttr
              ? randNear(0.65, 0.12, 0.35, 0.95)
              : randNear(0.05, 0.03, 0.0, 0.2);
        }
        ethnicity.genes[geneName] = geneData;
        continue;
      }

      const chosenAttr = choice(attrs);
      for (const attr of attrs) {
        geneData[attr] =
          attr === chosenAttr
            ? randNear(0.65, 0.12, 0.35, 0.95)
            : randNear(0.05, 0.03, 0.0, 0.2);
      }
      ethnicity.genes[geneName] = geneData;
      continue;
    }

    // 2) balanced genes: generate neg/pos pairs around 0.5 with subtle geo influence
    if (likelyBalancedGenes.has(geneName)) {
      const groups = {};
      for (const attr of attrs) {
        const m = attr.match(/^(.*)_(neg|pos)$/);
        if (m) {
          const base = m[1];
          const sign = m[2];
          if (!groups[base]) groups[base] = {};
          groups[base][sign] = attr;
        } else {
          geneData[attr] = randNear(0.5, 0.15, 0.2, 0.8);
        }
      }

      let deltaCenter = 0;
      if (geneName.startsWith("gene_bs_nose_") || geneName === "gene_bs_nose_profile") {
        deltaCenter = (mountainous * 0.08 + elev01 * 0.06) * (Math.random() < 0.5 ? -1 : 1);
      } else if (geneName.startsWith("gene_bs_jaw_") || geneName === "gene_bs_jaw_def") {
        deltaCenter = (mountainous * 0.05) * (Math.random() < 0.5 ? -1 : 1);
      }

      for (const { neg, pos } of Object.values(groups)) {
        let delta = randNear(0, 0.18, -0.35, 0.35);
        delta = clamp(delta + deltaCenter, -0.35, 0.35);

        const base = 0.5;
        const posVal = q2(clamp(base + delta, 0.2, 0.8));
        const negVal = q2(clamp(base - delta, 0.2, 0.8));

        if (pos) geneData[pos] = posVal;
        if (neg) geneData[neg] = negVal;
      }

      ethnicity.genes[geneName] = geneData;
      continue;
    }

    // 3) face_detail_: keep subtle; tiny mountain nudge for nose detail
    if (geneName.startsWith("face_detail_")) {
      for (const attr of attrs) {
        let v = randNear(0.3, 0.15, 0.0, 0.7);
        if (geneName.includes("nose") && mountainous > 0.35) {
          v = biasValue(v, mountainous * 0.05, 0.0, 0.8);
        }
        geneData[attr] = v;
      }
      ethnicity.genes[geneName] = geneData;
      continue;
    }

    // 4) fallback mild
    for (const attr of attrs) {
      geneData[attr] = randNear(0.5, 0.18, 0.2, 0.8);
    }
    ethnicity.genes[geneName] = geneData;
  }

  // ---------------- CK3-SHAPED OUTPUT (THIS IS THE IMPORTANT FIX) ----------------
  // Your exporter should print ethnicity.ck3.*, NOT the scalar fields directly.
  //
  // Fixes:
  // - "invalid color bounds": we output { xmin ymin xmax ymax } with min <= max (and clamped).
  // - "old_5 invalid gene template key": we never output gene_age.

  function rectFromCenter(cx, cy, rx = 0.08, ry = 0.06) {
    let xmin = clamp01(cx - rx), xmax = clamp01(cx + rx);
    let ymin = clamp01(cy - ry), ymax = clamp01(cy + ry);
    if (xmin > xmax) [xmin, xmax] = [xmax, xmin];
    if (ymin > ymax) [ymin, ymax] = [ymax, ymin];
    return [q2(xmin), q2(ymin), q2(xmax), q2(ymax)];
  }

  // IMPORTANT: these (cx,cy) mappings are *heuristics*.
  // They are VALID format and won’t crash. You can tune to match your palette texture semantics.
  const skinRect = rectFromCenter(clamp01(ethnicity.skinTone.base), 0.78, 0.08, 0.06);
  const eyeRect  = rectFromCenter(clamp01(ethnicity.eyeTone.lightness), 0.62, 0.08, 0.08);
  const hairRect = rectFromCenter(0.55, clamp01(ethnicity.hairTone.darkness), 0.08, 0.08);

  // Vanilla-like 6-band distribution around a center value v for a given attr name
  function mkBands(attrName, v) {
    v = clamp01(+v || 0.5);
    const steps   = [-0.18, -0.10, -0.04,  0.04,  0.10,  0.18];
    const weights = [   1,     5,    40,    40,     5,     1];
    const out = [];
    for (let i = 0; i < steps.length; i++) {
      const a = clamp01(v + steps[i] - 0.03);
      const b = clamp01(v + steps[i] + 0.03);
      out.push({
        w: weights[i],
        name: attrName,
        range: [q2(Math.min(a, b)), q2(Math.max(a, b))],
      });
    }
    return out;
  }

  // Build CK3 distributions per gene. To keep file size sane, only export top 1–2 attrs per gene.
  const ck3Genes = {};
  for (const [geneName, attrs] of Object.entries(ethnicity.genes || {})) {
    if (geneName === "gene_age") continue;
    if (!attrs || typeof attrs !== "object") continue;

    const ranked = Object.entries(attrs)
      .map(([a, v]) => [a, +v])
      .filter(([, v]) => Number.isFinite(v))
      .sort((A, B) => B[1] - A[1])
      .slice(0, 2);

    if (!ranked.length) continue;

    const rows = [];
    for (const [attrName, v] of ranked) {
      rows.push(...mkBands(attrName, v));

      // Optional: beauty hooks like vanilla (weights are 0 until traits applied)
      rows.push({ w: 0, name: attrName, range: ["@beauty1min", "@beauty1max"], traits: ["beauty_1"] });
      rows.push({ w: 0, name: attrName, range: ["@beauty2min", "@beauty2max"], traits: ["beauty_2"] });
      rows.push({ w: 0, name: attrName, range: ["@beauty3min", "@beauty3max"], traits: ["beauty_3"] });
    }

    ck3Genes[geneName] = rows;
  }

  ethnicity.ck3 = {
    template: "ethnicity_template",
    using: heritage?.key || heritage?.id || "akan", // exporter can override
    skin_color: [{ w: 10, rect: skinRect }],
    eye_color:  [{ w: 10, rect: eyeRect }],
    hair_color: [{ w: 10, rect: hairRect }],
    genes: ck3Genes,
  };

  return ethnicity;
}


function q2(x) { return Math.round(x * 100) / 100; }

function generateEthnicity() {
  // ---------- Small RNG helpers ----------

  // Triangular-ish distribution around center (less extreme than uniform)
  function randNear(center = 0.5, spread = 0.2, min = 0, max = 1) {
    const a = center - spread;
    const b = center + spread;
    const u = Math.random();
    const v = Math.random();

    let x = a + (b - a) * Math.max(u, v); // bias toward center-ish
    if (x < min) x = min;
    if (x > max) x = max;

    // round to at most 2 decimal places
    return Math.round(x * 100) / 100;
  }

  function clamp(x, min = 0, max = 1) {
    return x < min ? min : x > max ? max : x;
  }

  function choice(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // ---------- High-level phenotype "profiles" ----------

  const skinProfiles = [
    { id: "very_light", center: 0.15 },
    { id: "light",      center: 0.25 },
    { id: "olive",      center: 0.4  },
    { id: "brown",      center: 0.55 },
    { id: "dark",       center: 0.7  }
  ];

  const hairProfiles = [
    { id: "light_blond", center: 0.2 },
    { id: "light_brown", center: 0.35 },
    { id: "medium_brown", center: 0.5 },
    { id: "dark_brown", center: 0.65 },
    { id: "black", center: 0.8 }
  ];

  const eyeProfiles = [
    { id: "light", center: 0.3 },
    { id: "mixed", center: 0.5 },
    { id: "dark", center: 0.7 }
  ];

  const skinProfile = choice(skinProfiles);
  const hairProfile = choice(hairProfiles);
  const eyeProfile  = choice(eyeProfiles);

  // ---------- Gene classification helpers ----------

  // Genes we treat as "choose one main attribute"
  const categoricalGenes = new Set([
    "gene_body_hair",
    "gene_bs_body_shape",
    "gene_bs_body_type",    // could be more continuous, but one-dominant works fine
    "gene_bs_bust",
    "gene_hair_type",
    "gene_eyebrows_shape",
    "gene_eyebrows_fullness",
    "gene_age"              // we pick a dominant age morph distribution
  ]);

  // Some genes where we *expect* one negative + one positive attribute
  // (but we'll detect *_neg/_pos dynamically anyway)
  // This is just for clarity; not strictly required.
  const likelyBalancedGenes = new Set([
    "gene_chin_forward",
    "gene_chin_height",
    "gene_chin_width",
    "gene_eye_angle",
    "gene_eye_depth",
    "gene_eye_distance",
    "gene_eye_height",
    "gene_eye_shut",
    "gene_forehead_angle",
    "gene_forehead_brow_height",
    "gene_forehead_height",
    "gene_forehead_roundness",
    "gene_forehead_width",
    "gene_head_height",
    "gene_head_profile",
    "gene_head_top_height",
    "gene_head_top_width",
    "gene_head_width",
    "gene_jaw_angle",
    "gene_jaw_forward",
    "gene_jaw_height",
    "gene_jaw_width",
    "gene_mouth_corner_depth",
    "gene_mouth_corner_height",
    "gene_mouth_forward",
    "gene_mouth_height",
    "gene_mouth_lower_lip_size",
    "gene_mouth_upper_lip_size",
    "gene_mouth_width",
    "gene_neck_length",
    "gene_neck_width",

    "gene_bs_cheek_forward",
    "gene_bs_cheek_height",
    "gene_bs_cheek_width",
    "gene_bs_ear_angle",
    "gene_bs_ear_outward",
    "gene_bs_ear_size",
    "gene_bs_eye_corner_depth",
    "gene_bs_eye_size",
    "gene_bs_eye_upper_lid_size",
    "gene_bs_forehead_brow_curve",
    "gene_bs_forehead_brow_forward",
    "gene_bs_forehead_brow_inner_height",
    "gene_bs_forehead_brow_outer_height",
    "gene_bs_forehead_brow_width",
    "gene_bs_jaw_def",
    "gene_bs_mouth_lower_lip_full",
    "gene_bs_mouth_lower_lip_pad",
    "gene_bs_mouth_lower_lip_width",
    "gene_bs_mouth_philtrum_shape",
    "gene_bs_mouth_philtrum_width",
    "gene_bs_mouth_upper_lip_full",
    "gene_bs_mouth_upper_lip_profile",
    "gene_bs_mouth_upper_lip_width",
    "gene_bs_nose_forward",
    "gene_bs_nose_height",
    "gene_bs_nose_length",
    "gene_bs_nose_nostril_height",
    "gene_bs_nose_nostril_width",
    "gene_bs_nose_profile",
    "gene_bs_nose_ridge_angle",
    "gene_bs_nose_ridge_width",
    "gene_bs_nose_size",
    "gene_bs_nose_tip_angle",
    "gene_bs_nose_tip_forward",
    "gene_bs_nose_tip_width"
  ]);

  // ---------- Main ethnicity object ----------

  const ethnicity = {
    name: "Procedural Ethnicity " + Math.floor(Math.random() * 100000),
    description: "A procedurally generated but grounded population type.",
    skinTone: {
      profile: skinProfile.id,
      base: randNear(skinProfile.center, 0.12, 0.05, 0.95)
    },
    hairTone: {
      profile: hairProfile.id,
      darkness: randNear(hairProfile.center, 0.15, 0.05, 0.95)
    },
    eyeTone: {
      profile: eyeProfile.id,
      lightness: randNear(eyeProfile.center, 0.15, 0.05, 0.95)
    },
    genes: {}
  };

  // ---------- Per-gene generation ----------

  for (const g of genes) {
    const geneName = g.gene;
    const attrs = g.attributes;
    const geneData = {};

    // 1) Categorical genes: pick one main attribute, others near-zero
    if (categoricalGenes.has(geneName)) {
      const chosenAttr = choice(attrs);
      for (const attr of attrs) {
        if (attr === chosenAttr) {
          // Chosen attribute: moderate-to-strong presence but not maxed
          geneData[attr] = randNear(0.65, 0.12, 0.35, 0.95);
        } else {
          // Others: tiny influence
          geneData[attr] = randNear(0.05, 0.03, 0.0, 0.2);
        }
      }
      ethnicity.genes[geneName] = geneData;
      continue;
    }

    // 2) Genes with neg/pos pairs: give a mild bias, avoid extremes
    if (likelyBalancedGenes.has(geneName)) {
      // Group attributes by base name + suffix (_neg / _pos)
      const groups = {};
      for (const attr of attrs) {
        const m = attr.match(/^(.*)_(neg|pos)$/);
        if (m) {
          const base = m[1];
          const sign = m[2]; // "neg" | "pos"
          if (!groups[base]) groups[base] = {};
          groups[base][sign] = attr;
        } else {
          // Anything not neg/pos gets a mild 0.5-ish value
          geneData[attr] = randNear(0.5, 0.15, 0.2, 0.8);
        }
      }

      // For each neg/pos pair, create subtle bias
      Object.values(groups).forEach(({ neg, pos }) => {
        // delta determines direction and magnitude of bias
        const delta = randNear(0, 0.18, -0.35, 0.35); // smallish shift
        const base = 0.5;
        const posVal = q2(clamp(base + delta, 0.2, 0.8));
        const negVal = q2(clamp(base - delta, 0.2, 0.8));

        if (pos) geneData[pos] = posVal;
        if (neg) geneData[neg] = negVal;

        if (pos) geneData[pos] = posVal;
        if (neg) geneData[neg] = negVal;
      });

      ethnicity.genes[geneName] = geneData;
      continue;
    }

    // 3) Face-detail genes, age details, etc. that are not classified above
    //    Keep them mild so nothing becomes caricatured.
    if (geneName.startsWith("face_detail_")) {
      for (const attr of attrs) {
        // Face detail: mostly subtle, rarely strong
        geneData[attr] = randNear(0.3, 0.15, 0.0, 0.7);
      }
      ethnicity.genes[geneName] = geneData;
      continue;
    }

    // 4) Fallback: generic mild variation 0.3–0.7
    for (const attr of attrs) {
      geneData[attr] = randNear(0.5, 0.18, 0.2, 0.8);
    }
    ethnicity.genes[geneName] = geneData;
  }

  return ethnicity;
}

// Example usage:
// const e = generateEthnicity();
// console.log(e);

function describeEthnicityExtensive(e) {
  const g = e?.genes || {};

  // --- thresholds ---
  const LO = 0.35;     // below: "low"
  const HI = 0.65;     // above: "high"
  const EXT = 0.75;    // strongly high/low
  const NEUTRAL_BAND = 0.08; // around 0.5 ignore

  const out = [];
  const bullets = [];

  // --- helpers ---
  const clamp01 = (x)=> x < 0 ? 0 : x > 1 ? 1 : x;
  const fmt = (x)=> (Math.round(x * 100) / 100).toFixed(2);

  function pickMax(obj) {
    if (!obj) return null;
    let bestK = null, bestV = -1;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v !== "number") continue;
      if (v > bestV) { bestV = v; bestK = k; }
    }
    return bestK ? { key: bestK, val: bestV } : null;
  }

  // For neg/pos pairs encoded as {something_neg: a, something_pos: b}
  // Return signed bias where + means "pos dominates", - means "neg dominates".
  function signedBias(obj, baseName) {
    if (!obj) return 0;
    const neg = obj[`${baseName}_neg`];
    const pos = obj[`${baseName}_pos`];
    if (typeof neg !== "number" || typeof pos !== "number") return 0;
    // in your generator these tend to be symmetric around ~0.5, but we’ll treat it generally
    const d = pos - neg; // + means pos stronger
    return d;
  }

  function neutralish(v) {
    return Math.abs(v - 0.5) <= NEUTRAL_BAND;
  }

  function intensityWord(v) {
    if (v >= EXT) return "very pronounced";
    if (v >= HI)  return "noticeable";
    if (v <= 1 - EXT) return "very subtle";
    if (v <= LO)  return "subtle";
    return "moderate";
  }

  function addSentence(s) { if (s) out.push(s); }
  function addBullet(s)   { if (s) bullets.push(s); }

  // --- 1) Overall palette anchor: skin/hair/eyes ---
  const skinProfileText = {
    very_light: "very fair to porcelain-toned",
    light: "light",
    olive: "olive-toned",
    brown: "medium-brown",
    dark: "dark"
  }[e?.skinTone?.profile] || "balanced";

  const hairProfileText = {
    light_blond: "lighter blond to sandy shades",
    light_brown: "light brown shades",
    medium_brown: "medium browns",
    dark_brown: "dark browns",
    black: "very dark brown to black"
  }[e?.hairTone?.profile] || "varied tones";

  const eyeProfileText =
    e?.eyeTone?.profile === "light" ? "lighter eye colors (greens/blues/bright hazels)" :
    e?.eyeTone?.profile === "mixed" ? "a broad mix of light and dark eye colors" :
    "darker eye colors (browns/deep hazels)";

  addSentence(
    `Overall impression: a grounded, believable look. Skin tends toward ${skinProfileText} tones (base ~${fmt(clamp01(e?.skinTone?.base ?? 0.5))}).`
  );
  addSentence(
    `Hair commonly falls in ${hairProfileText} (darkness ~${fmt(clamp01(e?.hairTone?.darkness ?? 0.5))}), and eyes usually show ${eyeProfileText} (lightness ~${fmt(clamp01(e?.eyeTone?.lightness ?? 0.5))}).`
  );

  // --- 2) Categorical genes: pick the dominant attribute as "most common" ---
  function describeCategorical(geneName, mappingFn) {
    const obj = g[geneName];
    const m = pickMax(obj);
    if (!m) return;

    const desc = mappingFn(m.key, m.val);
    if (desc) addSentence(desc);
  }

  // Hair type
  describeCategorical("gene_hair_type", (k, v) => {
    const label =
      k === "hair_afro" ? "tightly coiled / afro-textured hair" :
      k === "hair_curly" ? "curly hair" :
      k === "hair_wavy" ? "wavy hair" :
      k === "hair_straight_thin_beard" ? "straight hair (often paired with finer beard growth styling)" :
      k === "hair_straight" ? "straight hair" :
      null;
    if (!label) return null;
    if (v < HI) return null; // only mention if it’s actually dominant
    return `Hair texture tends to skew toward ${label}.`;
  });

  // Body hair
  describeCategorical("gene_body_hair", (k, v) => {
    if (v < HI) return null;
    const label =
      k.includes("dense") ? "denser body hair" :
      k.includes("sparse") ? "sparser body hair" :
      k.includes("avg") ? "average body hair" :
      null;
    if (!label) return null;
    const stubble =
      k.includes("low_stubble") ? "with a low-stubble tendency" :
      k.includes("lower_stubble") ? "with a more persistent stubble tendency" :
      "";
    return `Body hair trends ${label} ${stubble}`.trim() + ".";
  });

  // Age
  describeCategorical("gene_age", (k, v) => {
    if (v < HI) return null;
    const label =
      k === "old_1" ? "mild aging traits" :
      k === "old_2" ? "noticeable aging traits" :
      k === "old_3" ? "strong aging traits" :
      k === "old_4" ? "very strong aging traits" :
      k === "old_5" ? "extreme aging traits" :
      null;
    return label ? `Aging morphology leans toward ${label} (as a baseline morph tendency, not literal age).` : null;
  });

  // Baldness
  if (g.gene_baldness?.male_pattern_baldness != null) {
    const b = g.gene_baldness.male_pattern_baldness;
    if (!neutralish(b)) {
      const word = intensityWord(b);
      addSentence(`Male-pattern baldness tendency is ${word} (value ~${fmt(b)}).`);
    }
  }

  // Height (simple)
  if (g.gene_height?.normal_height != null) {
    const h = g.gene_height.normal_height;
    if (!neutralish(h)) {
      const word =
        h >= EXT ? "notably tall" :
        h >= HI  ? "slightly taller than average" :
        h <= 1 - EXT ? "notably short" :
        h <= LO  ? "slightly shorter than average" :
        "average";
      addSentence(`Stature trends ${word} (height morph ~${fmt(h)}).`);
    }
  }

  // --- 3) Balanced face structure: interpret key neg/pos genes using your notes ---

  // Small interpreter for common neg/pos pairs where "pos up means X" and "neg up means inverse".
  // In your generator, negVal and posVal are usually symmetric, so we can read direction from (pos - neg).
  function describePair(geneName, base, posMeaning, negMeaning, opts = {}) {
    const obj = g[geneName];
    if (!obj) return;

    const neg = obj[`${base}_neg`];
    const pos = obj[`${base}_pos`];
    if (typeof neg !== "number" || typeof pos !== "number") return;

    const d = pos - neg; // + => pos dominates, - => neg dominates
    if (Math.abs(d) < 0.10) return; // ignore near-neutral
    const strength = Math.min(1, Math.abs(d) / 0.6);

    const qual =
      strength > 0.75 ? "strongly" :
      strength > 0.45 ? "noticeably" :
      "slightly";

    const chosen = d > 0 ? posMeaning : negMeaning;
    const topic = opts.topic ? `${opts.topic} ` : "";
    addSentence(`${topic}${qual} ${chosen}.`);
  }

  // --- Cheeks ---
  describePair(
    "gene_bs_cheek_forward",
    "cheek_forward",
    "with cheekbones pushed outward (more projection under the eyes)",
    "with cheekbones sitting more inward (less projection under the eyes)",
    { topic: "Cheek structure:" }
  );

  describePair(
    "gene_bs_cheek_height",
    "cheek_height",
    "with cheekbones set higher on the face",
    "with cheekbones set lower on the face",
    { topic: "Cheek placement:" }
  );

  describePair(
    "gene_bs_cheek_width",
    "cheek_width",
    "with cheekbones flaring farther out toward the sides (wider facial midline)",
    "with a narrower, more sunken cheekbone width (closer to the eye line)",
    { topic: "Cheek width:" }
  );

  // --- Jaw ---
  describePair(
    "gene_jaw_width",
    "jaw_width",
    "with a wider jaw (more breadth at the back of the jawline)",
    "with a narrower jaw (more drawn-in / emaciated-looking at the back of the jawline)",
    { topic: "Jaw width:" }
  );

  describePair(
    "gene_jaw_height",
    "jaw_height",
    "with a longer jaw vertically",
    "with a shorter jaw vertically",
    { topic: "Jaw height:" }
  );

  describePair(
    "gene_jaw_forward",
    "jaw_forward",
    "with a forward-set jaw (underbite-like tendency)",
    "with a recessed jaw (overbite-like tendency)",
    { topic: "Jaw projection:" }
  );

  describePair(
    "gene_jaw_angle",
    "jaw_angle",
    "with a sharper, more acute jaw angle (more downward-pointing)",
    "with a squarer jaw angle (more outward / horizontal emphasis)",
    { topic: "Jaw angle:" }
  );

  // Jaw definition (sharp vs smooth)
  describePair(
    "gene_bs_jaw_def",
    "jaw_def",
    "with a sharper, more defined jawline",
    "with a smoother, rounder jawline",
    { topic: "Jaw definition:" }
  );

  // --- Chin ---
  describePair(
    "gene_chin_forward",
    "chin_forward",
    "with a very forward chin profile (chin approaches the nose line)",
    "with a recessed chin profile (chin sits noticeably behind the mouth line)",
    { topic: "Chin projection:" }
  );

  describePair(
    "gene_chin_height",
    "chin_height",
    "with a longer chin vertically",
    "with a shorter chin vertically (closer to the lips)",
    { topic: "Chin height:" }
  );

  describePair(
    "gene_chin_width",
    "chin_width",
    "with a broad chin bone (wide, blunt chin)",
    "with a narrow or pointier chin bone",
    { topic: "Chin width:" }
  );

  // --- Eyes ---
  describePair(
    "gene_eye_angle",
    "eye_angle",
    "with an upward/inward slant (outer corner down → inner corner up)",
    "with a downward/inward slant (outer corner up → inner corner down), giving a droopier look",
    { topic: "Eye slant:" }
  );

  describePair(
    "gene_eye_depth",
    "eye_depth",
    "with deeper-set eyes",
    "with more protruding eyes",
    { topic: "Eye depth:" }
  );

  describePair(
    "gene_eye_distance",
    "eye_distance",
    "with wider-set eyes",
    "with closer-set eyes",
    { topic: "Eye spacing:" }
  );

  describePair(
    "gene_eye_height",
    "eye_height",
    "with eyes sitting higher on the face",
    "with eyes sitting lower on the face",
    { topic: "Eye placement:" }
  );

  describePair(
    "gene_eye_shut",
    "eye_shut",
    "with a more narrowed / nearly-shut resting eye shape",
    "with a more open, wide-eyed resting shape",
    { topic: "Eye openness:" }
  );

  // Fold shape: monolid vs double eyelid (3 attributes, but you described it)
  if (g.gene_bs_eye_fold_shape) {
    const m = pickMax(g.gene_bs_eye_fold_shape);
    if (m && m.val >= HI) {
      const label =
        m.key === "eye_fold_shape_pos" ? "a heavier eyelid fold (more monolid-like)" :
        (m.key === "eye_fold_shape_neg" || m.key === "eye_fold_shape_02_neg") ? "a lighter eyelid fold (more double-eyelid-like)" :
        null;
      if (label) addSentence(`Eyelids tend toward ${label}.`);
    }
  }

  // Eye size + upper lid size (your notes)
  describePair(
    "gene_bs_eye_size",
    "eye_size",
    "with larger eyes overall",
    "with smaller eyes overall",
    { topic: "Eye size:" }
  );

  describePair(
    "gene_bs_eye_upper_lid_size",
    "eye_upper_lid_size",
    "with a taller upper eyelid (more vertical lid area)",
    "with a shorter upper eyelid (less vertical lid area)",
    { topic: "Upper eyelid:" }
  );

  describePair(
    "gene_bs_eye_corner_depth",
    "eye_corner_depth",
    "with inner eye corners that sink in more near the nose (including bridge influence)",
    "with inner eye corners that protrude slightly (a fuller inner-corner region)",
    { topic: "Inner eye corners:" }
  );

  // --- Forehead / brow ---
  describePair(
    "gene_forehead_angle",
    "forehead_angle",
    "with a more forward-slanting / protruding forehead",
    "with a more backward-slanting forehead near the hairline",
    { topic: "Forehead angle:" }
  );

  describePair(
    "gene_forehead_brow_height",
    "forehead_brow_height",
    "with brows sitting higher (a more surprised/open look)",
    "with brows sitting lower (a more intense/angry resting look)",
    { topic: "Brow height:" }
  );

  describePair(
    "gene_forehead_height",
    "forehead_height",
    "with a taller forehead",
    "with a shorter forehead",
    { topic: "Forehead height:" }
  );

  describePair(
    "gene_forehead_roundness",
    "forehead_roundness",
    "with a rounder, dome-like forehead",
    "with a flatter forehead contour",
    { topic: "Forehead shape:" }
  );

  describePair(
    "gene_forehead_width",
    "forehead_width",
    "with a broader forehead side-to-side",
    "with a narrower forehead tapering toward the middle",
    { topic: "Forehead width:" }
  );

  describePair(
    "gene_bs_forehead_brow_forward",
    "forehead_brow_forward",
    "with a more protruding brow ridge",
    "with a flatter brow ridge",
    { topic: "Brow ridge:" }
  );

  describePair(
    "gene_bs_forehead_brow_width",
    "forehead_brow_width",
    "with a wider brow region ridge-to-ridge",
    "with a thinner brow region ridge-to-ridge",
    { topic: "Brow width:" }
  );

  describePair(
    "gene_bs_forehead_brow_curve",
    "forehead_brow_curve",
    "with an arched brow curve (center of brow higher)",
    "with an inverted/flattened curve (center of brow lower)",
    { topic: "Brow curve:" }
  );

  describePair(
    "gene_bs_forehead_brow_inner_height",
    "forehead_brow_inner_height",
    "with the inner brow set higher",
    "with the inner brow set lower",
    { topic: "Inner brow:" }
  );

  describePair(
    "gene_bs_forehead_brow_outer_height",
    "forehead_brow_outer_height",
    "with the outer brow set higher",
    "with the outer brow set lower",
    { topic: "Outer brow:" }
  );

  // Eyebrows fullness/shape as categorical-ish
  if (g.gene_eyebrows_fullness) {
    const m = pickMax(g.gene_eyebrows_fullness);
    if (m && m.val >= HI) {
      const thick =
        m.key.includes("high") ? "very full and bushy" :
        m.key.includes("avg") ? "moderately full" :
        m.key.includes("low") ? "fairly thin" :
        "variable";
      addSentence(`Eyebrow fullness trends ${thick}.`);
    }
  }

  if (g.gene_eyebrows_shape) {
    const m = pickMax(g.gene_eyebrows_shape);
    if (m && m.val >= HI) {
      const spacing =
        m.key.startsWith("close_spacing") ? "closer-set brows" :
        m.key.startsWith("far_spacing") ? "wider-spaced brows" :
        "average-spaced brows";
      const thickness =
        m.key.includes("high_thickness") ? "with thicker brow hairs" :
        m.key.includes("avg_thickness") ? "with average brow thickness" :
        m.key.includes("low_thickness") ? "with thinner brow hairs" :
        m.key.includes("lower_thickness") ? "with very fine brow hairs" :
        "";
      addSentence(`Brow shape suggests ${spacing}${thickness ? ` ${thickness}` : ""}.`);
    }
  }

  // --- Nose ---
  describePair(
    "gene_bs_nose_forward",
    "nose_forward",
    "with a more projecting nose (prominent from the face)",
    "with a flatter nose projection (bridge sits back relative to brow)",
    { topic: "Nose projection:" }
  );

  describePair(
    "gene_bs_nose_height",
    "nose_height",
    "with a higher nose start / shorter vertical nose",
    "with a longer vertical nose (starts lower)",
    { topic: "Nose height:" }
  );

  describePair(
    "gene_bs_nose_length",
    "nose_length",
    "with a tip that sits farther from the face (often tightening nostril look)",
    "with a tip closer to the face (often making nostrils appear larger)",
    { topic: "Nose length:" }
  );

  describePair(
    "gene_bs_nose_nostril_width",
    "nose_nostril_width",
    "with wider nostrils side-to-side",
    "with narrower nostrils side-to-side",
    { topic: "Nostrils:" }
  );

  describePair(
    "gene_bs_nose_nostril_height",
    "nose_nostril_height",
    "with nostrils meeting the face slightly higher",
    "with nostrils meeting the face slightly lower",
    { topic: "Nostril attachment:" }
  );

  describePair(
    "gene_bs_nose_ridge_width",
    "nose_ridge_width",
    "with a wider nose bridge",
    "with a thinner nose bridge",
    { topic: "Nose bridge:" }
  );

  describePair(
    "gene_bs_nose_ridge_angle",
    "nose_ridge_angle",
    "with a more angled / ski-jump bridge shape",
    "with a straighter bridge shape",
    { topic: "Bridge angle:" }
  );

  describePair(
    "gene_bs_nose_size",
    "nose_size",
    "with a larger overall nose size",
    "with a smaller overall nose size",
    { topic: "Nose size:" }
  );

  describePair(
    "gene_bs_nose_tip_angle",
    "nose_tip_angle",
    "with a pointier, slightly up-tilted nose tip",
    "with a flatter, down-tilted nose tip",
    { topic: "Nose tip:" }
  );

  describePair(
    "gene_bs_nose_tip_forward",
    "nose_tip_forward",
    "with a tip that protrudes forward more",
    "with a tip that recedes back more",
    { topic: "Tip projection:" }
  );

  describePair(
    "gene_bs_nose_tip_width",
    "nose_tip_width",
    "with a wider nose tip",
    "with a narrower nose tip",
    { topic: "Tip width:" }
  );

  // Nose profile special: hawk bump vs concave/convex
  if (g.gene_bs_nose_profile) {
    const p = g.gene_bs_nose_profile;
    const hawk = Math.max(p.nose_profile_hawk ?? 0, p.nose_profile_hawk_pos ?? 0);
    const concConv = signedBias(p, "nose_profile"); // uses nose_profile_neg/pos

    if (hawk >= HI) addSentence("A bridge bump / aquiline tendency is common (hawk profile influence).");
    if (Math.abs(concConv) >= 0.12) {
      addSentence(concConv > 0
        ? "The nose bridge tends to read more convex (a stronger outward curve)."
        : "The nose bridge tends to read more concave (a softer inward curve)."
      );
    }
  }

  // --- Mouth & lips ---
  describePair(
    "gene_mouth_width",
    "mouth_width",
    "with a wider mouth",
    "with a narrower mouth",
    { topic: "Mouth width:" }
  );

  describePair(
    "gene_mouth_forward",
    "mouth_forward",
    "with a more forward-set mouth",
    "with a more recessed mouth",
    { topic: "Mouth projection:" }
  );

  describePair(
    "gene_mouth_height",
    "mouth_height",
    "with the mouth sitting higher (closer to the nose)",
    "with the mouth sitting lower (closer to the chin)",
    { topic: "Mouth placement:" }
  );

  describePair(
    "gene_bs_mouth_lower_lip_full",
    "mouth_lower_lip_full",
    "with a fuller lower lip",
    "with a thinner lower lip",
    { topic: "Lower lip fullness:" }
  );

  describePair(
    "gene_bs_mouth_lower_lip_pad",
    "mouth_lower_lip_pad",
    "with a lower lip that protrudes more",
    "with a lower lip that recedes more",
    { topic: "Lower lip projection:" }
  );

  describePair(
    "gene_bs_mouth_lower_lip_width",
    "mouth_lower_lip_width",
    "with a wider lower lip",
    "with a narrower lower lip",
    { topic: "Lower lip width:" }
  );

  describePair(
    "gene_mouth_lower_lip_size",
    "mouth_lower_lip_size",
    "with a larger overall lower lip",
    "with a smaller overall lower lip",
    { topic: "Lower lip size:" }
  );

  describePair(
    "gene_bs_mouth_upper_lip_full",
    "mouth_upper_lip_full",
    "with a fuller upper lip",
    "with a thinner upper lip",
    { topic: "Upper lip fullness:" }
  );

  describePair(
    "gene_bs_mouth_upper_lip_width",
    "mouth_upper_lip_width",
    "with a wider upper lip",
    "with a narrower upper lip",
    { topic: "Upper lip width:" }
  );

  describePair(
    "gene_mouth_upper_lip_size",
    "mouth_upper_lip_size",
    "with a larger overall upper lip",
    "with a smaller overall upper lip",
    { topic: "Upper lip size:" }
  );

  describePair(
    "gene_bs_mouth_upper_lip_profile",
    "mouth_upper_lip_profile",
    "with fuller upper sides of the upper lip (more shaped upper lip)",
    "with flatter upper sides of the upper lip (less shaped upper lip)",
    { topic: "Upper lip shape:" }
  );

  // Mouth openness (resting)
  describePair(
    "gene_mouth_open",
    "mouth_open",
    "with a more open resting mouth",
    "with a more closed resting mouth",
    { topic: "Resting mouth:" }
  );

  // Corners of mouth
  describePair(
    "gene_mouth_corner_height",
    "mouth_corner_height",
    "with slightly upturned mouth corners",
    "with slightly downturned mouth corners",
    { topic: "Mouth corners:" }
  );

  describePair(
    "gene_mouth_corner_depth",
    "mouth_corner_depth",
    "with deeper-set mouth corners",
    "with shallower mouth corners",
    { topic: "Mouth corner depth:" }
  );

  // --- Neck ---
  describePair(
    "gene_neck_length",
    "neck_length",
    "with a longer neck",
    "with a shorter, thicker-necked silhouette",
    { topic: "Neck length:" }
  );

  describePair(
    "gene_neck_width",
    "neck_width",
    "with a thicker neck",
    "with a thinner neck",
    { topic: "Neck width:" }
  );

  // --- Ears ---
  describePair(
    "gene_bs_ear_outward",
    "ear_outward",
    "with ears that stick out more",
    "with ears that sit closer to the head",
    { topic: "Ear set:" }
  );

  describePair(
    "gene_bs_ear_size",
    "ear_size",
    "with larger ears",
    "with smaller ears",
    { topic: "Ear size:" }
  );

  describePair(
    "gene_bs_ear_angle",
    "ear_angle",
    "with ears angled more diagonally back",
    "with ears angled in a more upright/elf-like direction",
    { topic: "Ear angle:" }
  );

  if (g.gene_bs_ear_bend) {
    const m = pickMax(g.gene_bs_ear_bend);
    if (m && m.val >= HI) {
      const which =
        m.key === "ear_both_bend_pos" ? "a bend affecting both upper ear and lobes" :
        m.key === "ear_upper_bend_pos" ? "a bend more focused on the upper ear" :
        m.key === "ear_lower_bend_pos" ? "a bend more focused on the ear lobes" :
        null;
      if (which) addSentence(`Ear shape shows ${which} (bend influence).`);
    }
  }

  if (g.gene_bs_ear_inner_shape?.ear_inner_shape_pos != null) {
    const v = g.gene_bs_ear_inner_shape.ear_inner_shape_pos;
    if (!neutralish(v)) {
      addSentence(v >= HI
        ? "Inner ear structure tends to protrude a bit more."
        : "Inner ear structure tends to sit closer to the head."
      );
    }
  }

  // --- 4) Face detail genes (wrinkles, fat pads, definition) ---
  function describeFaceDetail(geneName, mappingFn) {
    const obj = g[geneName];
    if (!obj) return;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v !== "number") continue;
      if (v < 0.20) continue; // ignore tiny
      const s = mappingFn(k, v);
      if (s) addSentence(s);
    }
  }

  describeFaceDetail("face_detail_cheek_def", (k, v) => {
    if (v < HI) return null;
    return k === "cheek_def_01"
      ? "Cheek definition tends to wrap tighter around the lower cheek area (lower cheekbone emphasis)."
      : "Cheek definition tends to wrap tighter around the upper cheek area (higher cheekbone emphasis).";
  });

  // cheek fat: pos adds, neg removes
  if (g.face_detail_cheek_fat) {
    const obj = g.face_detail_cheek_fat;
    const neg = obj.cheek_fat_01_neg;
    const posMax = Math.max(
      obj.cheek_fat_01_pos ?? 0,
      obj.cheek_fat_02_pos ?? 0,
      obj.cheek_fat_03_pos ?? 0,
      obj.cheek_fat_04_pos ?? 0
    );
    if (typeof neg === "number" && neg >= HI && posMax <= 0.55) {
      addSentence("Cheeks trend leaner and slightly more angular (reduced fat pad influence).");
    } else if (posMax >= HI && (typeof neg !== "number" || neg <= 0.55)) {
      addSentence("Cheeks trend fuller and softer (increased cheek fat pad influence).");
    }
  }

  // Chin cleft/dimple
  if (g.face_detail_chin_cleft) {
    const m = pickMax(g.face_detail_chin_cleft);
    if (m && m.val >= HI) {
      addSentence(m.key === "chin_cleft"
        ? "A chin cleft is a relatively common defining detail."
        : "A small dimple above the chin is a relatively common defining detail."
      );
    }
  }

  // Chin definition / smoothness (inverse pair but stored as two attrs)
  if (g.face_detail_chin_def) {
    const d = g.face_detail_chin_def;
    const def = d.chin_def ?? 0;
    const smooth = d.chin_def_neg ?? 0;
    if (def >= HI && smooth <= 0.55) addSentence("Chin surfaces tend to be more defined rather than smooth.");
    if (smooth >= HI && def <= 0.55) addSentence("Chin surfaces tend to be smoother rather than sharply defined.");
  }

  // Lower lid (eye bags)
  if (g.face_detail_eye_lower_lid_def) {
    const m = pickMax(g.face_detail_eye_lower_lid_def);
    if (m && m.val >= HI) addSentence("Lower eyelids commonly show more pronounced definition (eye-bag / lid contour).");
  }

  // Nose ridge definition sides (subtle)
  describePair(
    "face_detail_nose_ridge_def",
    "nose_ridge_def",
    "with slightly stronger definition around the sides of the nose bridge",
    "with softer definition around the sides of the nose bridge",
    { topic: "Bridge definition:" }
  );

  // Nose tip definition (single attr)
  if (g.face_detail_nose_tip_def?.nose_tip_def != null) {
    const v = g.face_detail_nose_tip_def.nose_tip_def;
    if (!neutralish(v)) {
      addSentence(v >= HI
        ? "The nose tip tends to read a bit sharper/more defined rather than round."
        : "The nose tip tends to read rounder/smoother rather than sharply defined."
      );
    }
  }

  // Temple definition
  if (g.face_detail_temple_def?.temple_def != null) {
    const v = g.face_detail_temple_def.temple_def;
    if (!neutralish(v)) {
      addSentence(v >= HI
        ? "Temples tend to be slightly more sunken, giving a more sculpted side profile."
        : "Temples tend to be fuller, giving a softer side profile."
      );
    }
  }

  // --- 5) Close with a cohesive summary "vibe" ---
  // We can infer “angular vs soft” from jaw_def + cheek_fat + temple_def as a quick vibe pass.
  const jawDefPos = g.gene_bs_jaw_def?.jaw_def_pos ?? 0.5;
  const cheekFatPos = (() => {
    const cf = g.face_detail_cheek_fat;
    if (!cf) return 0.5;
    return Math.max(cf.cheek_fat_01_pos ?? 0, cf.cheek_fat_02_pos ?? 0, cf.cheek_fat_03_pos ?? 0, cf.cheek_fat_04_pos ?? 0);
  })();
  const temple = g.face_detail_temple_def?.temple_def ?? 0.5;

  const angularScore = (jawDefPos - 0.5) + ((0.5 - cheekFatPos) * 0.8) + ((temple - 0.5) * 0.5);
  const vibe =
    angularScore > 0.35 ? "more angular and sculpted overall" :
    angularScore < -0.35 ? "softer and rounder overall" :
    "balanced between sculpted and soft";

  addSentence(`Taken together, the facial “read” is ${vibe}, with most features staying within believable, non-caricatured bounds.`);

  // Optional: add a quick bullet summary of strongest signals (useful for debugging)
  // (comment out if you don't want it)
  addBullet(`Skin base: ${fmt(e?.skinTone?.base ?? 0.5)} (${e?.skinTone?.profile ?? "?"})`);
  addBullet(`Hair darkness: ${fmt(e?.hairTone?.darkness ?? 0.5)} (${e?.hairTone?.profile ?? "?"})`);
  addBullet(`Eye lightness: ${fmt(e?.eyeTone?.lightness ?? 0.5)} (${e?.eyeTone?.profile ?? "?"})`);

  const text = out.join(" ");

  // Return both: prose + debug bullets
  return {
    text,
    summary: bullets
  };
}

function shiftEthnicityWithinGroup(eth, opts = {}) {
  const strength = opts.strength ?? 0.12;          // 0.05 subtle … 0.20 noticeable
  const catSwapChance = opts.catSwapChance ?? 0.05;
  const rng = opts.rng ?? Math.random;

  const q2 = (x) => Math.round(x * 100) / 100;
  const clamp = (x, lo = 0, hi = 1) => (x < lo ? lo : x > hi ? hi : x);

  const jitter = (amp) => {
    const u = rng(), v = rng();
    return (Math.max(u, v) * 2 - 1) * amp;
  };

  // ---- copy base object shallowly, deep-copy genes, preserve ck3 payload ----
  const out = {
    ...eth,
    name: (eth?.name ?? "Ethnicity") + " (variant)",
    skinTone: { ...eth.skinTone },
    hairTone: { ...eth.hairTone },
    eyeTone:  { ...eth.eyeTone  },
    genes: {},
    ck3: eth?.ck3 ? JSON.parse(JSON.stringify(eth.ck3)) : undefined // preserve CK3 blocks exactly
  };

  // 1) Shift the tone bases slightly but keep profile (these are YOUR metadata)
  if (out.skinTone?.base != null) out.skinTone.base = q2(clamp(out.skinTone.base + jitter(strength * 0.6), 0.05, 0.95));
  if (out.hairTone?.darkness != null) out.hairTone.darkness = q2(clamp(out.hairTone.darkness + jitter(strength * 0.8), 0.05, 0.95));
  if (out.eyeTone?.lightness != null) out.eyeTone.lightness = q2(clamp(out.eyeTone.lightness + jitter(strength * 0.8), 0.05, 0.95));

  // helper: pick dominant key in a categorical gene block
  function dominantKey(obj) {
    let bestK = null, bestV = -1;
    for (const [k, v] of Object.entries(obj || {})) {
      if (typeof v !== "number") continue;
      if (v > bestV) { bestV = v; bestK = k; }
    }
    return bestK;
  }

  // helper: apply "same dominant choice, different intensity" to categorical blocks
  function varyCategoricalBlock(obj) {
    if (!obj) return obj;
    const keys = Object.keys(obj);
    if (!keys.length) return obj;

    const dom = dominantKey(obj);
    if (!dom) return obj;

    let dom2 = dom;
    if (rng() < catSwapChance && keys.length > 1) {
      const sorted = keys
        .map(k => [k, obj[k]])
        .filter(([,v]) => typeof v === "number")
        .sort((a,b) => (b[1] ?? 0) - (a[1] ?? 0));
      const pickPool = sorted.slice(0, Math.min(3, sorted.length)).map(x => x[0]);
      dom2 = pickPool[Math.floor(rng() * pickPool.length)] || dom;
    }

    const outBlock = {};
    for (const k of keys) {
      const v = obj[k];
      if (typeof v !== "number") { outBlock[k] = v; continue; }

      if (k === dom2) outBlock[k] = q2(clamp(v + jitter(strength * 0.9), 0.45, 0.95));
      else            outBlock[k] = q2(clamp(v + jitter(strength * 0.3), 0.0, 0.25));
    }
    return outBlock;
  }

  // helper: for neg/pos pairs, keep symmetry
  function varyNegPosPair(negVal, posVal) {
    const curDelta = clamp((posVal - negVal) * 0.5, -0.35, 0.35);
    const nextDelta = clamp(curDelta + jitter(strength * 0.35), -0.35, 0.35);
    const base = 0.5;

    const pos = q2(clamp(base + nextDelta, 0.2, 0.8));
    const neg = q2(clamp(base - nextDelta, 0.2, 0.8));
    return { neg, pos };
  }

  // genes treated as categorical in your generator
  // IMPORTANT: do NOT include gene_age here (CK3 validation is picky)
  const categoricalGenes = new Set([
    "gene_body_hair",
    "gene_bs_body_shape",
    "gene_bs_body_type",
    "gene_bs_bust",
    "gene_hair_type",
    "gene_eyebrows_shape",
    "gene_eyebrows_fullness"
  ]);

  // 2) Walk all gene blocks and perturb
  for (const [geneName, block] of Object.entries(eth.genes || {})) {
    // hard-skip gene_age so it never leaks into export
    if (geneName === "gene_age") continue;

    if (!block || typeof block !== "object") {
      out.genes[geneName] = block;
      continue;
    }

    if (categoricalGenes.has(geneName)) {
      out.genes[geneName] = varyCategoricalBlock(block);
      continue;
    }

    const nextBlock = {};
    const seenBases = new Set();

    for (const [attr, val] of Object.entries(block)) {
      if (typeof val !== "number") {
        nextBlock[attr] = val;
        continue;
      }

      const m = attr.match(/^(.*)_(neg|pos)$/);
      if (m) {
        const base = m[1];
        if (seenBases.has(base)) continue;
        seenBases.add(base);

        const negKey = `${base}_neg`;
        const posKey = `${base}_pos`;
        const negVal = typeof block[negKey] === "number" ? block[negKey] : 0.5;
        const posVal = typeof block[posKey] === "number" ? block[posKey] : 0.5;

        const { neg, pos } = varyNegPosPair(negVal, posVal);
        if (negKey in block) nextBlock[negKey] = neg;
        if (posKey in block) nextBlock[posKey] = pos;
      } else {
        const amp = geneName.startsWith("face_detail_") ? strength * 0.6 : strength * 0.8;
        nextBlock[attr] = q2(clamp(val + jitter(amp), 0.0, 1.0));
      }
    }

    out.genes[geneName] = nextBlock;
  }

  // 3) If a CK3 payload exists, keep it valid (rects must be [xmin,ymin,xmax,ymax] with min<=max)
  // We are NOT changing colors here, just repairing if something upstream wrote bad values.
  function repairRect(rect){
    if (!Array.isArray(rect) || rect.length !== 4) return rect;
    let [xmin,ymin,xmax,ymax] = rect.map(v => clamp(+v || 0, 0, 1));
    if (xmin > xmax) [xmin,xmax] = [xmax,xmin];
    if (ymin > ymax) [ymin,ymax] = [ymax,ymin];
    return [xmin,ymin,xmax,ymax].map(q2);
  }

  if (out.ck3) {
    for (const k of ["skin_color","eye_color","hair_color"]) {
      const rows = out.ck3[k];
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        if (row && row.rect) row.rect = repairRect(row.rect);
      }
    }
    // also ensure gene_age never ends up in ck3 genes
    if (out.ck3.genes && out.ck3.genes.gene_age) delete out.ck3.genes.gene_age;
  }

  return out;
}


// Assumes you already have shiftEthnicityWithinGroup(eth, opts) in scope.
// This assigns a per-culture ethnicity by taking the culture’s heritage ethnicity
// and generating a “same-group” variant via shifting.

function assignCultureEthnicitiesFromHeritages(opts = {}) {
  const {
    strength = 0.12,
    catSwapChance = 0.05,
    rng = Math.random
  } = opts;

  if (!Array.isArray(worldCultures) || !worldCultures.length) {
    console.warn("assignCultureEthnicitiesFromHeritages: worldCultures missing/empty.");
    return;
  }
  if (!Array.isArray(worldHeritages) || !worldHeritages.length) {
    console.warn("assignCultureEthnicitiesFromHeritages: worldHeritages missing/empty.");
    return;
  }
  if (typeof shiftEthnicityWithinGroup !== "function") {
    console.warn("assignCultureEthnicitiesFromHeritages: shiftEthnicityWithinGroup() not in scope.");
    return;
  }

  let assigned = 0, skipped = 0, missingHeritage = 0, missingEthnicity = 0;

  for (const c of worldCultures) {
    if (!c) { skipped++; continue; }

    const hi = c.heritageIndex;
    console.log(hi)
    if (hi == null || hi < 0 || hi >= worldHeritages.length) {
      console.log("MISSING FIRST")
      missingHeritage++;
      continue;
    }

    const h = worldHeritages[hi];
    console.log(h)
    if (!h) { missingHeritage++; continue; }
    const baseEth = h.ethnicity;
    if (!baseEth) {
      console.log("NO ETHNICITY ON HERITAGE")
      missingEthnicity++;
      continue;
    }

    // Create a shifted “within-group” ethnicity and store it on the culture.
    const shifted = shiftEthnicityWithinGroup(baseEth, { strength, catSwapChance, rng });

    // Optional: make it easier to trace/debug in exports
    shifted.source = shifted.source || {};
    shifted.source.kind = "heritage_shift";
    shifted.source.heritageIndex = hi;
    shifted.source.heritageKey = h.key || h.id || null;
    shifted.source.cultureKey = c.key || c.id || null;

    c.ethnicity = shifted;
    assigned++;
  }

  console.log(
    `assignCultureEthnicitiesFromHeritages: assigned=${assigned}, skipped=${skipped}, ` +
    `missingHeritage=${missingHeritage}, missingEthnicity=${missingEthnicity}`
  );
}

function ensureHeritageEthnicities() {
  if (!Array.isArray(worldHeritages)) return;
  for (let i = 0; i < worldHeritages.length; i++) {
    const h = worldHeritages[i];
    if (!h) continue;
    if (!h.ethnicity) {
      h.ethnicity = generateEthnicityFromHeritage(h)//generateEthnicity(); // must be in scope
    }
  }
}