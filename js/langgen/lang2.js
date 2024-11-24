//https://www.masswerk.at/mespeak/
//https://github.com/itinerarium/phoneme-synthesis/blob/master/mespeak.js
//https://www.vulgarlang.com/

//meSpeak.loadVoice('voices/pt.json')

//// TODO:
/*
1. Check coverage of consonants by segment frequency list against cons list http://web.phonetik.uni-frankfurt.de/upsid_segment_freq.html
2. compare to exclusions
3. phonotactics
4. romanization orthography
5. consonant lists trend too small

*/

let ling = {}

ling.consonantList = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "z", "br", "sm", "sn", "st", "sw", "sk", "sl", "sp", "sph", "thw", "dw", "tw", "thr", "dr", "tr", "kw", "qu", "cr", "kr", "kl", "cl", "pr", "fr", "br", "gr", "pl", "fl", "bl", "phl", "gl", "shr", "spl", "spr", "str", "skr", "scr"]
ling.vowelList = ["a", "e", "i", "o", "u", "oo", "ae", "ee", "y"]

/*
ling.consonantList = [
"b", "ɓ", "β", "ʙ", "c", "ç", "d", "ɖ", "ɗ", "ʣ", "ʥ", "ʤ", "f", "ɸ", "g", "ɠ", "ɢ", "ʛ", "ɰ", "h", "ɦ", "ħ", "ɧ", "ɥ", "ʜ", "j", "ʝ", "ɟ", "ʄ", "k", "l", "ɫ", "ɬ", "ɮ", "ɭ", "ʟ", "m", "ɱ", "n", "ɳ", "ɲ", "ŋ", "ɴ", "p", "q", "r", "ɹ", "ɾ", "ɽ", "ɻ", "ʁ", "ʀ", "s", "ʂ", "ɕ", "ʃ", "t", "ʈ", "ʦ", "ʨ", "ʧ", "v", "ⱱ", "w", "ʍ", "x", "ɣ", "χ", "ʎ", "z", "ʐ", "ʑ", "ʒ", "θ", "ð",
]
//ʋ "ʔ", "ʡ", "ʕ", "ʢ", "ʘ", "ǀ", "ǂ", "ǁ"
ling.vowelList = [
    "a", "æ", "ɑ", "ɒ", "ɐ", "e", "ɛ", "ɜ", "ə", "i", "ɨ", "ɪ", "y", "ʏ", "ø", "ɘ", "ɵ", "œ", "ɶ", "ɤ", "o", "ɔ", "u", "ʉ", "ʊ", "ɯ", "ʌ"
]
*/

function consFrequencies(lang) {
  //http://web.phonetik.uni-frankfurt.de/upsid_info.html
  let rand = getRandomInt(0, 100);
  if (rand < 94) {
    lang.consonantList.push("m");
  }
  rand = getRandomInt(0, 100);
  if (rand < 89) {
    lang.consonantList.push("k")
  }
  rand = getRandomInt(0, 100);
  if (rand < 83) {
    lang.consonantList.push("ʤ")
  }
  rand = getRandomInt(0, 100);
  if (rand < 73) {
    lang.consonantList.push("w")
  }
  rand = getRandomInt(0, 100);
  if (rand < 62) {
    lang.consonantList.push("h")
  }
  rand = getRandomInt(0, 100);
  if (rand < 56) {
    lang.consonantList.push("g");
  }
  rand = getRandomInt(0, 100);
  if (rand < 52) {
    lang.consonantList.push("ɴ")
  }
  rand = getRandomInt(0, 100);
  if (rand < 48) {
    lang.consonantList.push()
  }
  rand = getRandomInt(0, 100);
  if (rand < 45) {
    lang.consonantList.push("n")
  }
  rand = getRandomInt(0, 100);
  if (rand < 44) {
    lang.consonantList.push("s")
  }
  rand = getRandomInt(0, 100);
  if (rand < 42) {
    lang.consonantList.push("ʧ")
  }
  rand = getRandomInt(0, 100);
  if (rand < 42) {
    lang.consonantList.push("S")
  }
  rand = getRandomInt(0, 100);
  if (rand < 40) {
    lang.consonantList.push("t");
  }
  rand = getRandomInt(0, 40);
  if (rand < 40) {
    lang.consonantList.push("f");
  }
  rand = getRandomInt(0, 100);
  //voiced dental/alveolar nasal

  rand = getRandomInt(0, 100);
  if (rand < 31) {
    lang.consonantList.push("ɲ")
  }
}

function getLingFactor(arr) {
  let totalFactor = 0;
  let runningFactor = 0;
  for (let i = 0; i < arr.length; i++) {
    totalFactor += arr[i].f
  }
  let rand = getRandomInt(0, totalFactor);
  for (let i = 0; i < arr.length; i++) {
    runningFactor += arr[i].f
    if (rand < runningFactor) {
      return arr[i].n
    }
  }
}

function setPlosives(lang) {
  let p = lang.plosiveSystems;
  let pArr = ["p", "t", "k", "b", "d", "g"]
  if (p === "p t k b d g") {
    lang.consonantList.push("p");
    lang.consonantList.push("t");
    lang.consonantList.push("k");
    lang.consonantList.push("b");
    lang.consonantList.push("d");
    lang.consonantList.push("g");
  } else if (p === "missing p") {
    lang.consonantList.push("t");
    lang.consonantList.push("k");
    lang.consonantList.push("b");
    lang.consonantList.push("d");
    lang.consonantList.push("g");
  } else if (p === "missing g") {
    lang.consonantList.push("p");
    lang.consonantList.push("t");
    lang.consonantList.push("k");
    lang.consonantList.push("b");
    lang.consonantList.push("d");
  } else if (p === "both missing") {
    lang.consonantList.push("t");
    lang.consonantList.push("k");
    lang.consonantList.push("b");
    lang.consonantList.push("d");
  } else if (p === "other") {
      let rand = getRandomInt(0, 100);
      if (rand < 18) {
        //do nothing, no plosives
      } else {
        for (let i = 0; i < 6; i++) {
          let rand2 = getRandomInt(0, 10);
          if (rand2 > 5) {
            lang.consonantList.push(pArr[i])
          }
        }
      }
  }
}

//The most common type of uvular consonant is a stop of one kind or another, including plosives, affricates and ejective stops
//Continuants include fricatives and nasals, as well as trills and approximants

function setUvulars(lang) {
  let p = lang.uvulars;
  let continuants = [];
  let stops = [];
  let add = [];
  let add2 = []
  for (let i = 0; i < sounds.length; i++) {
    let s = sounds[i]
    if (s.sp === "uvular") {
      if (s.m === "plosive" || s.m === "implosive" || s.m.includes("affricate") || s.m === "ejective") {
        stops.push(s.t);
      }
      if (s.m.includes("fricative") || s.m === "nasal" || s.m === "trill" || s.m === "approximant") {
        continuants.push(s.t)
      }
    }
  }
  if (p === "no uvulars") {
    //do nothing, no uvulars
  } else if (p === "uvular stops only") {
    add = subsetOf(stops);
  } else if (p === "uvular continuants only") {
    add = subsetOf(continuants);
  } else if (p === "uvular stops and continuants") {
    add = subsetOf(stops);
    add2 = subsetOf(continuants);
  }
  for (let i = 0; i < add.length; i++) {
    lang.consonantList.push(add[i])
  }
  for (let i = 0; i < add2.length; i++) {
    lang.consonantList.push(add2[i])
  }
}

function setGlottalizedConsonants(lang) {
    let p = lang.glottalizedConsonants;
    if (p === "no glottalized consonants") {
      //add nothing
    } else if (p === "ejectives only") {

    } else if (p === "implosives only") {

    } else if (p === "glottalized resonants only") {

    } else if (p === "ejectives and implosives only") {

    } else if (p === "ejectives and glottalized resonants") {

    } else if (p === "implosives and glottalized resonants") {

    } else if (p === "ejectives, implosives, and glottalized resonants") {

    }
}


function setLateralConsonants(lang) {
  let p = lang.lateralConsonants;
  let obstruents = [];
  let sonorants = []
  let add = []
  let add2 = []
  for (let i = 0; i < sounds.length; i++) {
    let s = sounds[i]
    if (s.m === "lateral affricate" || s.m === "lateral fricative" || s.m === "lateral tap/flap") {
      obstruents.push(s.t);
    }
    if (s.m === "lateral approximant") {
      sonorants.push(s.t)
    }
  }
  if (p === "no laterals") {
    // add nothing
  } else if (p === "/l/, no obstruent laterals") {
    lang.consonantList.push("l")
    add = subsetOf(sonorants)
  } else if (p === "laterals, but no /l/, no obstruent lateral") {
    add = subsetOf(sonorants)
  } else if (p === "/l/ and lateral obstruents") {
    lang.consonantList.push("l")
    add = subsetOf(sonorants);
    add2 = subsetOf(obstruents)
  } else if (p === "no /l/,but lateral obstruents") {
    add = subsetOf(sonorants);
    add2 = subsetOf(obstruents)
  }
  for (let i = 0; i < add.length; i++) {
    lang.consonantList.push(add[i])
  }
  for (let i = 0; i < add2.length; i++) {
    lang.consonantList.push(add2[i])
  }
}

function setVelarNasal(lang) {
  let p = lang.velarNasal;
  if (p === "velar nasal, also initially") {
    lang.consonantList.push("ŋ")
  } else if (p === "velar nasal, but not initially") {
    lang.consonantList.push("ŋ")
  } else if (p === "no velar nasal") {
    // nothing
  }
}

function setVowelNasalization(lang) {
  //do we have ability to make nasal?
}

function setVowels(lang) {
  let p = lang.frontRoundedVowels;
  let add = [];
  let high = ["y","i","ʏ"]
  let mid = ["ø", "ø̞", "œ", "ɶ"]
  let other = []
  for (let i = 0; i < ling.vowelList.length; i++) {
    let v = ling.vowelList[i];
    if (high.indexOf(v) === -1 && mid.indexOf(v) === -1) {
      other.push(v)
    }
  }
  let add2 = []
  if (p === "none") {
    //nothing
  } else if (p === "high and mid") {
    add = subsetOf(high)
    add2 = subsetOf(mid)
  } else if (p === "high only") {
    add = subsetOf(high)
  } else if (p === "mid only") {
    add = subsetOf(mid)
  }
  for (let i = 0; i < add.length; i++) {
    lang.vowelList.push(add[i])
  }
  for (let i = 0; i < add2.length; i++) {
    lang.vowelList.push(add2[i])
  }

  let flat = [...new Set(lang.vowelList)]
  lang.vowelList = flat
}

function otherVowels(lang) {
  /*
  let high = ["y","i","ʏ"]
  let mid = ["ø", "ø̞", "œ", "ɶ"]
  */
  let rand = getRandomInt(0, 100);
  if (rand < 94) {
    lang.vowelList.push("i")
  }
  rand = getRandomInt(0, 100);
  if (rand < 87) {
    lang.vowelList.push("a")
  }
  rand = getRandomInt(0, 100);
  if (rand < 82) {
    lang.vowelList.push("u");
  }
  rand = getRandomInt(0, 100);
  if (rand < 41) {
    lang.vowelList.push("ɛ")
  }
  rand = getRandomInt(0, 100);
  if (rand < 40) {
    lang.vowelList.push("o");
  }
  rand = getRandomInt(0, 100);
  if (rand < 38) {
    lang.vowelList.push("e")
  }
  rand = getRandomInt(0, 100);
  if (rand < 36) {
    lang.vowelList.push("ɔ")
  }
}


function setLanguageFactors(lang) {
  lang.vowelRanges = getLingFactor(vowelRanges)
  lang.voicingInPlosivesAndFricatives = getLingFactor(voicingInPlosivesAndFricatives)
  lang.plosiveSystems = getLingFactor(plosiveSystems);
  lang.uvulars = getLingFactor(uvulars);
  lang.glottalizedConsonants = getLingFactor(glottalizedConsonants)
  lang.lateralConsonants = getLingFactor(lateralConsonants)
  lang.velarNasal = getLingFactor(velarNasal)
  lang.vowelNasalization = getLingFactor(vowelNasalization);
  lang.frontRoundedVowels = getLingFactor(frontRoundedVowels);
  lang.syllableStructTypes = getLingFactor(syllableStructTypes)
  lang.toneSystems = getLingFactor(toneSystems);
  lang.stressSystem = getLingFactor(stressSystem);
  lang.absenceOfCommonConsonants = getLingFactor(absenceOfCommonConsonants);
  lang.presenceOfUncommonConsonants = getLingFactor(presenceOfUncommonConsonants);
}

let consonantRanges = [ //wals.info/chapter/1 //563 total
  {
    n: "small",
    low: 6,
    high: 14,
    f: 89
  },
  {
    n: "moderately small",
    low: 15,
    high: 18,
    f: 122
  },
  {
    n: "average",
    low: 19,
    high: 25,
    f: 201
  },
  {
    n: "moderately large",
    low: 26,
    high: 33,
    f: 94
  },
  {
    n: "large",
    low: 34,
    high: ling.consonantList.length - 1,
    f: 57
  }
]

let vowelRanges = [ //wals.info/chapter/2
  //564 total
  {
    n: "small",
    low: 2,
    high: 4,
    f: 93
  },
  {
    n: "average",
    low: 5,
    high: 6,
    f: 287
  },
  {
    n: "large",
    low: 7,
    high: 14,
    f: 184
  }
]

let consonantVowelRatios = [
  {
    n: "low",
    low: 0.0,
    high: 2.0
  },
  {
    n: "moderately low",
    low: 2.0,
    high: 2.75
  },
  {
    n: "average",
    low: 2.75,
    high: 4.5
  },
  {
    n: "moderately high",
    low: 4.5,
    high: 6.5,
    f: 102,
  },
  {
    n: "high",
    low: 6.5,
    high: 12,
    f: 59
  },
  {
    n: "rare",
    low: 12,
    high: 1000, //made up high range to catch everything, only 10 languages on inventory have over 12
    f: 10
  }
]

//todo
let voicingInPlosivesAndFricatives = [
  {
    n: "no voicing contrast",
    f: 182
  },
  {
    n: "voicing contrast in plosives alone",
    f: 189
  },
  {
    n: "voicing contrast in fricatives alone",
    f: 38
  },
  {
    n: "voicing contrast in both plosives and fricatives",
    f: 158
  }
]

let plosiveSystems = [ //https://wals.info/chapter/5
  {
    n: "other",
    f: 242
  },
  {
    n: "p t k b d g",
    f: 255
  },
  {
    n: "missing p",
    f: 33
  },
  {
    n: "missing g",
    f: 34
  },
  {
    n: "both missing",
    f: 3
  }
]

let uvulars = [ // https://wals.info/chapter/6
  //total 567
  {
    n: "no uvulars",
    f: 470
  },
  {
    n: "uvular stops only",
    f: 38
  },
  {
    n: "uvular continuants only",
    f: 11
  },
  {
    n: "uvular stops and continuants",
    f: 48
  }
]

let langSizeGlottalizedConsonants = [ // https://wals.info/chapter/7 if this size of consonant inventory, this percent ofhave glotallized Cs
  {
    n: "small",
    f: 9
  },
  {
    n: "moderately small",
    f: 11
  },
  {
    n: "average",
    f: 22
  },
  {
    n: "moderately large",
    f: 39
  },
  {
    n: "large",
    f: 67
  }
]

let glottalizedConsonants = [ // https://wals.info/chapter/7 total 567 - does not include glottal stop ʔ, which is quite common, or breathy voiced consonants
  {
    n: "no glottalized consonants",
    f: 409,
  },
  {
    n: "ejectives only",
    f: 58
  },
  {
    n: "implosives only",
    f: 55
  },
  {
    n: "glottalized resonants only",
    f: 4
  },
  {
    n: "ejectives and implosives only",
    f: 14
  },
  {
    n: "ejectives and glottalized resonants",
    f: 20
  },
  {
    n: "implosives and glottalized resonants",
    f: 4
  },
  {
    n: "ejectives, implosives, and glottalized resonants",
    f: 3
  }
]

let lateralConsonants = [
  {
    n: "no laterals",
    f: 95
  },
  {
    n: "/l/, no obstruent laterals",
    f: 388
  },
  {
    n: "laterals, but no /l/, no obstruent lateral",
    f: 29
  },
  {
    n: "/l/ and lateral obstruents",
    f: 47
  },
  {
    n: "no /l/,but lateral obstruents",
    f: 8
  },
]

let velarNasal = [ //https://wals.info/chapter/9
  {
    n: "velar nasal, also initially",
    f: 147
  },
  {
    n: "velar nasal, but not initially",
    f: 87
  },
  {
    n: "no velar nasal",
    f: 235
  }
]

let vowelNasalization = [ //https://wals.info/chapter/10
  {
    n: "contrastive nasal vowels present",
    f: 64
  },
  {
    n: "contrastive nasal vowels absent",
    f: 180
  }
]

let frontRoundedVowels = [ //https://wals.info/chapter/11
  //562 total
  {
    n: "none",
    f: 525
  },
  {
    n: "high and mid",
    f: 23
  },
  {
    n: "high only",
    f: 8
  },
  {
    n: "mid only",
    f: 6
  }
]

let syllableStructTypes = [ //https://wals.info/chapter/12
  {
    n: "simple syllable structure",
    f: 61
  },
  {
    n: "moderately complex syllable structure",
    f: 274
  },
  {
    n: "complex syllable structure",
    f: 151
  }
]

let toneSystems = [ //https://wals.info/chapter/13
  //total 527
  {
    n: "no tones",
    f: 307
  },
  {
    n: "simple tone system",
    f: 132
  },
  {
    n: "complex tone system",
    f: 88
  }
]

let stressSystem = [
  //https://wals.info/chapter/14
  {
    n: "no fixed stress (mostly weight-sensitive stress)",
    f: 220
  },
  {
    n: "initial",
    f: 92
  },
  {
    n: "second",
    f: 16
  },
  {
    n: "third",
    f: 1
  },
  {
    n: "antepenultimate: third from the right",
    f: 12
  },
  {
    n: "penultimate: second from right",
    f: 110
  },
  {
    n: "ultimate",
    f: 51
  }
]

let weightSensitiveStress = [
  //https://wals.info/chapter/15 and 16 and 17
]

let absenceOfCommonConsonants = [
  //total 567
  {
    n: "all present",
    f: 503
  },
  {
    n: "no bilabials",
    f: 4
  },
  {
    n: "no fricatives",
    f: 48
  },
  {
    n: "no nasals",
    f: 10
  },
  {
    n: "no bilabials or nasals",
    f: 1
  },
  {
    n: "no fricatives or nasals",
    f: 1
  }
]

let presenceOfUncommonConsonants = [
  //https://wals.info/chapter/19
  //total: 567
  {
    n: "none",
    f: 449
  },
  {
    n: "clicks",
    f: 9
  },
  {
    n: "labial-velars",
    f: 45
  },
  {
    n: "pharyngeals",
    f: 21
  },
  {
    n: `'Th' sounds`,
    f: 40
  },
  {
    n: `clicks, pharyngeals, and 'th'`,
    f: 1
  },
  {
    n: "pharyngeals and 'th'",
    f: 2
  }

  //add table 1
]





let prohibitedCVTypes = [
  {
    sequence: ["consonant", "consonant"],
    likelihood: 25
  },
  {
    sequence: ["consonant", "consonant", "consonant"],
    likelihood: 75
  },
  {
    sequence: ["consonant", "consonant", "consonant", "consonant"],
    likelihood: 99
  },
  {
    sequence: ["vowel", "vowel"],
    likelihood: 25
  },
  {
    sequence: ["vowel", "vowel", "vowel"],
    likelihood: 75
  },
  {
    sequence: ["vowel", "vowel", "vowel", "vowel"],
    likelihood: 99
  }
]

let prohibitedSPTypes = [ //only check if CC pattern
  {
    sequence: ["labio-dental", "dorsal"],
    likelihood: 99
  },
  {
    sequence: ["bilabial", "dorsal"],
    likelihood: 99
  }
]

let prohibitedAnywhere = [
  {
    seq: [
      {
        sp: "plosive"
      },
      {
        sp: "plosive"
      }
    ],
    likelihood: 99
  },
  {
    seq: [
      {
        sp: "bilabial"
      },
      {
        sp: "dorsal"
      }
    ],
    likelihood: 99
  },
  {
    seq: [
      {
        sp: "labio-dental",
      },
      {
        sp: "dorsal"
      },
    ],
    likelihood: 99
  }
]

let prohibitedStarts = [ // do your sounds in same pattern as sounds for ease
  { //bm
    seq: [
      {
        m: "plosive"
      },
      {
        m: "nasal"
      }
    ],
    likelihood: 75
  },
  { //mb
    seq: [
      {
        m: "nasal"
      },
      {
        m: "plosive"
      }
    ],
    likelihood: 75
  },
  {
    seq: [
      {
        t: "p"
      },
      {
        t: "g"
      }
    ],
    likelihood: 99
  }
]

let prohibitedEnds = [

]

let sounds = [
  {
    t: "b",
    orth: ["b"],
    cv: "consonant",
    m: "plosive",
    p: "labial",
    sp: "bilabial",
    v: "voiced",
    pn: [],
    f: 100,
    alwaysIf: [

    ],
    prohibitIf: [

    ]
  },
  {
    t: "p",
    orth: ["p"],
    cv: "consonant",
    m: "plosive",
    p: "labial",
    sp: "bilabial",
    v: "voiceless",
    pn: [],
    f: 100,
  },
  {
    t: "β",
    orth: ["b"],
    cv: "consonant",
    m: "fricative",
    p: "labial",
    sp: "bilabial",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʙ",
    orth: ["b"],
    cv: "consonant",
    m: "trill",
    p: "labial",
    sp: "bilabial",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "c",
    orth: ["ch"],
    cv: "consonant",
    m: "plosive",
    p: "coronal",
    sp: "palatal",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ɟ",
    orth: ["dj", "dge"],
    cv: "consonant",
    m: "plosive",
    p: "dorsal",
    sp: "palatal",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ç",
    orth: ["c", "k", "h"],
    cv: "consonant",
    m: "fricative",
    p: "coronal",
    sp: "palatal",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "d",
    orth: ["d"],
    cv: "consonant",
    m: "plosive",
    p: "coronal",
    sp: "alveolar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɖ",
    orth: ["d"],
    cv: "consonant",
    m: "plosive",
    p: "coronal",
    sp: "retroflex",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɗ",
    orth: ["d"],
    cv: "consonant",
    m: "implosive",
    p: "coronal",
    sp: "alveolar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʣ",
    orth: ["dz"],
    cv: "consonant",
    m: "sibilant affricate",
    p: "coronal",
    sp: "alveolar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʥ",
    orth: ["j"],
    cv: "consonant",
    m: "sibilant affricate",
    p: "dorsal",
    sp: "palatal",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {

  },
  {
    t: "ʤ",
    orth: ["j"],
    cv: "consonant",
    m: "sibilant affricate",
    p: "coronal",
    sp: "post-alveolar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "f",
    orth: ["f"],
    cv: "consonant",
    m: "sibilant fricative",
    p: "labial",
    sp: "labio-dental",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ɸ",
    orth: ["f"],
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "labial",
    sp: "bilabial",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "g",
    orth: ["g"],
    cv: "consonant",
    m: "plosive",
    p: "dorsal",
    sp: "velar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɠ",
    orth: ["g", "k", "q"],
    cv: "consonant",
    m: "implosive",
    p: "dorsal",
    sp: "velar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɢ",
    orth: ["g"],
    cv: "consonant",
    m: "plosive",
    p: "dorsal",
    sp: "uvular",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʛ",
    orth: ["g"],
    cv: "consonant",
    m: "implosive",
    p: "dorsal",
    sp: "uvular",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɰ",
    orth: ["g"],
    cv: "consonant",
    m: "approximant",
    p: "dorsal",
    sp: "velar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "h",
    orth: ["h"],
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "laryngeal",
    sp: "glottal",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ɦ",
    orth: ["h"],
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "laryngeal",
    sp: "glottal",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ħ",
    orth: ["h", "x"],
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "laryngeal",
    sp: "pharyngeal/epiglottal",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ɥ",
    orth: ["u", "w", "y"],
    cv: "consonant",
    m: "approximant",
    p: "",
    sp: "labial-palatal", //coarticulated
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʜ",
    orth: ["x", "h"],
    cv: "consonant",
    m: "trill",
    p: "laryngeal",
    sp: "pharyngeal/epiglottal",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "j",
    orth: ["y", "j"],
    cv: "consonant",
    m: "approximant",
    p: "dorsal",
    sp: "palatal",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʝ",
    orth: ["y", "j"],
    cv: "consonant",
    m: "non-sibilant affricate",
    p: "dorsal",
    sp: "palatal",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɟ",
    orth: ["gj", "g", "gh", "jj", "yy"],
    cv: "consonant",
    m: "plosive",
    p: "dorsal",
    sp: "palatal",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʄ",
    orth: ["j"],
    cv: "consonant",
    m: "implosive",
    p: "",
    sp: "palatal",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "k",
    orth: ["k"],
    cv: "consonant",
    m: "plosive",
    p: "dorsal",
    sp: "velar",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "l", //regular l in legal.
    orth: ["l"],
    cv: "consonant",
    m: "lateral approximant",
    p: "coronal",
    sp: "alveolar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɫ", //coarticulated
    cv: "consonant",
    m: "",
    p: "",
    sp: "",
    v: "",
    pn: [],
    f: undefined
  },
  {
    t: "ɬ",
    orth: [
      "ll"
    ],
    cv: "consonant",
    m: "lateral fricative",
    p: "coronal",
    sp: "alveolar",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ɮ",
    orth: ["l"],
    cv: "consonant",
    m: "lateral fricative",
    p: "coronal",
    sp: "alveolar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɭ", //retroflex l (tongue bent back)
    orth: ["l"],
    cv: "consonant",
    m: "lateral approximant",
    p: "coronal",
    sp: "retroflex",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʟ",
    orth: ["l", "ll"],
    cv: "consonant",
    m: "lateral approximant",
    p: "dorsal",
    sp: "velar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "m",
    orth: ["m"],
    cv: "consonant",
    m: "nasal",
    p: "labial",
    sp: "bilabial",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɱ",
    orth: ["m"],
    cv: "consonant",
    m: "nasal",
    p: "labial",
    sp: "labio-dental",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "n",
    orth: ["n"],
    cv: "consonant",
    m: "nasal",
    p: "coronal",
    sp: "alveolar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɳ",
    orth: ["rn"],
    cv: "consonant",
    m: "nasal",
    p: "coronal",
    sp: "retroflex",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɲ",
    orth: ["nj", "ñ", "ny", "gn", "ni"],
    cv: "consonant",
    m: "nasal",
    p: "dorsal",
    sp: "palatal",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ŋ",
    orth: ["n", "ŋ", "ng"],
    cv: "consonant",
    m: "nasal",
    p: "dorsal",
    sp: "velar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɴ",
    orth: ["n", "ng", "rng"],
    cv: "consonant",
    m: "nasal",
    p: "dorsal",
    sp: "uvular",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "p",
    orth: ["p"],
    cv: "consonant",
    m: "plosive",
    p: "labial",
    sp: "bilabial",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "q",
    orth: ["q", "k"],
    cv: "consonant",
    m: "plosive",
    p: "dorsal",
    sp: "uvular",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "r",
    orth: ["r"],
    cv: "consonant",
    m: "trill",
    p: "coronal",
    sp: "alveolar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɹ",
    orth: ["r"],
    cv: "consonant",
    m: "approximant",
    p: "coronal",
    sp: "alveolar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɾ",
    cv: "consonant",
    m: "",
    p: "",
    sp: "",
    v: "",
    pn: [],
    f: undefined
  },
  {
    t: "ɽ",
    orth: ["l", "r", "d"],
    cv: "consonant",
    m: "tap/flap",
    p: "coronal",
    sp: "retroflex",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ɻ",
    cv: "consonant",
    m: "",
    p: "",
    sp: "",
    v: "",
    pn: [],
    f: undefined
  },
  {
    t: "ʁ",
    orth: ["r", "rr"],
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "dorsal",
    sp: "uvular",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʀ",
    orth: ["r", "rr"],
    cv: "consonant",
    m: "trill",
    p: "dorsal",
    sp: "uvular",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "S",
    orth: ["s"],
    cv: "consonant",
    m: "",
    p: "",
    sp: "",
    v: "",
    pn: [],
    f: undefined
  },
  {
    t: "s",
    orth: ["s"],
    cv: "consonant",
    m: "sibilant fricative",
    p: "coronal",
    sp: "alveolar",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ʂ",
    orth: ["sh"],
    cv: "consonant",
    m: "sibilant fricative",
    p: "coronal",
    sp: "retroflex",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ɕ",
    orth: ["sh", "x"],
    cv: "consonant",
    m: "sibilant fricative",
    p: "coronal",
    sp: "palatal",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ʃ",
    orth: ["sh"],
    cv: "consonant",
    m: "sibilant fricative",
    p: "coronal",
    sp: "post-alveolar",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "t",
    orth: ["t"],
    cv: "consonant",
    m: "plosive",
    p: "coronal",
    sp: "alveolar",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ʈ",
    orth: "t",
    cv: "consonant",
    m: "plosive",
    p: "coronal",
    sp: "retroflex",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ʦ",
    orth: ["tz", "z"], //grazia
    cv: "consonant",
    m: "sibilant affricate",
    p: "coronal",
    sp: "alveolar",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ʨ",
    orth: ["ch", "x", "j"],
    cv: "consonant",
    m: "sibilant affricate",
    p: "coronal",
    sp: "palatal",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ʧ",
    orth: ["ch"],
    cv: "consonant",
    m: "sibilant affricate",
    p: "coronal",
    sp: "post-alveolar",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "v",
    orth: ["v"],
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "labial",
    sp: "labio-dental",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ⱱ",
    orth: ["v", "vw"],
    cv: "consonant",
    m: "tap/flap",
    p: "labial",
    sp: "labio-dental",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "w", //coarticulated,
    orth: ["w"],
    cv: "consonant",
    m: "",
    p: "",
    sp: "",
    v: "",
    pn: [],
    f: undefined
  },
  {
    t: "ʍ", //coarticulated
    orth: ["wh"],
    cv: "consonant",
    m: "",
    p: "",
    sp: "",
    v: "",
    pn: [],
    f: undefined
  },
  {
    t: "x",
    orth: ["ch", "k"],
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "dorsal",
    sp: "velar",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ɣ",
    orth: ["g"],
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "dorsal",
    sp: "velar",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "χ",
    orth: ["ch", "k", "gg"],
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "dorsal",
    sp: "uvular",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ʎ",
    orth: ["ly", "ll"],
    cv: "consonant",
    m: "lateral tap/flap",
    p: "dorsal",
    sp: "palatal",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "z",
    orth: ["z"],
    cv: "consonant",
    m: "",
    p: "",
    sp: "",
    v: "",
    pn: [],
    f: undefined
  },
  {
    t: "ʐ",
    orth: ["z", "ž"],
    cv: "consonant",
    m: "sibilant fricative",
    p: "coronal",
    sp: "retroflex",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʑ",
    orth: ["si", "ź", "j", "zi"],
    cv: "consonant",
    m: "sibilant fricative",
    p: "dorsal",
    sp: "palatal",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "ʒ",
    orth: ["si", "g", "zs"], //vision
    cv: "consonant",
    m: "sibilant fricative",
    p: "post-alveolar",
    sp: "coronal",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "θ",
    orth: ["th"], //thin
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "coronal",
    sp: "dental",
    v: "voiceless",
    pn: [],
    f: undefined
  },
  {
    t: "ð",
    orth: ["th"], //this
    cv: "consonant",
    m: "non-sibilant fricative",
    p: "coronal",
    sp: "dental",
    v: "voiced",
    pn: [],
    f: undefined
  },
  {
    t: "a",
    orth: ["a"], //father
    cv: "vowel",
    height: "open",
    backness: "front",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "æ",
    orth: ["a"], //cat
    cv: "vowel",
    height: "near-open",
    backness: "front",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɑ",
    orth: ["o"], //hot
    cv: "vowel",
    height: "open",
    backness: "back",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɒ",
    orth: ["o"], //thought
    cv: "vowel",
    height: "open",
    backness: "back",
    roundness: "rounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɐ",
    orth: ["e"], //bet
    cv: "vowel",
    height: "near-open",
    backness: "central",
    roundness: "undefined",
    pn: [],
    f: undefined
  },
  {
    t: "e",
    orth: ["ay"], //may
    cv: "vowel",
    height: "close-mid",
    backness: "front",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɛ",
    orth: ["e"], //bed
    cv: "vowel",
    height: "open-mid",
    backness: "front",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɜ",
    orth: ["u"], //bud in texas or bird in british
    cv: "vowel",
    height: "open-mid",
    backness: "central",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "ə",
    orth: ["a"], //Tina
    cv: "vowel",
    height: "mid",
    backness: "central",
    roundness: "undefined",
    pn: [],
    f: undefined
  },
  {
    t: "i",
    orth: ["e"], //free
    cv: "vowel",
    height: "close",
    backness: "front",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɨ",
    orth: ["i", "u"], //rude in southern english or lip
    cv: "vowel",
    height: "close",
    backness: "central",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɪ",
    orth: ["i"], //bit
    cv: "vowel",
    height: "near-close",
    backness: "front",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "y",
    orth: ["ew"], //few
    cv: "vowel",
    height: "",
    backness: "",
    roundness: "",
    pn: [],
    f: undefined
  },
  {
    t: "ʏ",
    orth: ["o"], //southern foot
    cv: "vowel",
    height: "near-close",
    backness: "front",
    roundness: "rounded",
    pn: [],
    f: undefined
  },
  {
    t: "ø",
    orth: ["ö"], //german schön
    cv: "vowel",
    height: "close-mid",
    backness: "front",
    roundness: "rounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɘ",
    orth: ["u"], //southern nut
    cv: "vowel",
    height: "close-mid",
    backness: "central",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɵ",
    orth: ["u", "o"], //British foot
    cv: "vowel",
    height: "close-mid",
    backness: "central",
    roundness: "rounded",
    pn: [],
    f: undefined
  },
  {
    t: "œ",
    orth: ["ö"], //German Hölle
    cv: "vowel",
    height: "",
    backness: "",
    roundness: "",
    pn: [],
    f: undefined
  },
  {
    t: "ɶ",
    orth: ["ø"], //danish grøn
    cv: "vowel",
    height: "open-mid",
    backness: "front",
    roundness: "rounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɤ",
    orth: ["oi", "õ"], //Estonian kõrv
    cv: "vowel",
    height: "close-mid",
    backness: "back",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "o",
    orth: ["ó", "o"], //camión
    cv: "vowel",
    height: "close-mid",
    backness: "back",
    roundness: "rounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɔ",
    orth: ["o"], //thought
    cv: "vowel",
    height: "open-mid",
    backness: "back",
    roundness: "rounded",
    pn: [],
    f: undefined
  },
  {
    t: "u",
    orth: ["o"], //boot
    cv: "vowel",
    height: "close",
    backness: "back",
    roundness: "rounded",
    pn: [],
    f: undefined
  },
  {
    t: "ʉ",
    orth: ["o"], //goose
    cv: "vowel",
    height: "close",
    backness: "central",
    roundness: "rounded",
    pn: [],
    f: undefined
  },
  {
    t: "ʊ",
    orth: ["o"], //hook
    cv: "vowel",
    height: "near-close",
    backness: "back",
    roundness: "rounded",
    pn: [],
    f: undefined
  },
  {
    t: "ɯ",
    orth: ["o"], //californian goose
    cv: "vowel",
    height: "close",
    backness: "back",
    roundness: "unrounded",
    pn: [],
    f: undefined
  },
  {
    t: "ʌ",
    orth: ["u"], //gut
    cv: "vowel",
    height: "open-mid",
    backness: "back",
    roundness: "unrounded",
    pn: [],
    f: undefined
  }
]


let stops = [
  "p",
  "b",
  "t",
  "d",
  "k",
  "g"
]

let fricatives = [
  "f",
  "v",
  "θ",
  "ð",
  "s",
  "z",
  "ʃ",
  "ʒ",
  "h"
]

let affricates = [
  "tʃ",
  "dʒ"
]

let nasals = [
  "m",
  "n",
  "ŋ"
]

let approximants = [
  "l",
  "ɹ",
  "j",
  "w"
]

let flaps = [
  "ɾ"
]

let frontVowels = [
  "i",
  "ɪ",
  "e",
  "ɛ",
  "æ",
  "a"
]

let backVowels = [
  "u",
  "ʊ",
  "o",
  "ʌ",
  "ɔ",
  "ɑ"
]

let centralVowels = [
  "ə",
  "ɨ", //in an unstressed syllable that is a suffix (roses, wanted)
  "ɚ", //weather, editor (last syllable)
  "ɝ" //bird, fur
]

let dipthongs = [
  "aɪ", // fly, lie, smile
  "aʊ", //now, frown, loud
  "ɔɪ", //boy, spoil, noise
  "ju"
]

ling.svo = [
    "SVO",
    "SOV",
    "VSO",
    "VOS",
    "OVS",
    "OSV"
]


ling.adjectives = [
    "before noun",
    "after noun"
]

ling.adposition = [
    "prepositions",
    "postpositions"
]

ling.syllableStructures = [
   "C,V,C",
   "V,C",
   "C,V",
]

ling.stress = [
    "Ultimate",
    "Penultimate",
    "Initial",
    "Second"
]

ling.nounGenders = [
    "Masculine",
    "Feminine",
    "Neuter"
]

ling.sp = [
    "Singular",
    "Plural"
]

ling.cases = [
    "Nominative",
    "Accusative",
    "Genitive",
    "Dative",
    "Locative",
    "Ablative"
]

ling.nonArticles = [
    "the",
    "a"
]

ling.differentArticle = [
    "before personal name",

]

ling.tenses = [
    "Present",
    "Past",
    "Remote Past",
    "Future"
]


//aspects
ling.imperfective = [
    "standalone particle"
]

ling.perfect = [
    "affix"
]

ling.progressive = []
ling.habitual = []


//numbers
ling.numberSystem = [
    "base-10",
    "base-20",
]

ling.derivationalMorphology = []



function createLanguage() {
    let lang = {};
    lang.name = `language_${rando()}`
    lang.consonantList = []
    lang.vowelList = []
    setLanguageFactors(lang)
    lang.consonantList = subsetOf(ling.consonantList);
    lang.vowelList = subsetOf(ling.vowelList);
    /*setPlosives(lang)
    setUvulars(lang)
    setLateralConsonants(lang)
    setVowels(lang)
    consFrequencies(lang)
    otherVowels(lang)*/
    let flat = [...new Set(lang.vowelList)]
    lang.vowelList = flat
    let flat2 = [...new Set(lang.consonantList)];
    lang.consonantList = flat2
    lang.svo = pickFrom(ling.svo);
    lang.adjectives = pickFrom(ling.adjectives);
    lang.adposition = pickFrom(ling.adposition);
    //let struct = pickFrom(ling.syllableStructures);
    //lang.syllableStructures = struct.split(",")
    lang.syllableStructures = subsetOf(ling.syllableStructures)
    lang.syllableStructures.push("C,V")
    lang.stress = pickFrom(ling.stress);
    lang.nounGenders = subsetOf(ling.nounGenders);

    lang.dictionary = {

    }
    lang.loc = translate(lang, "word")
    return lang;
}

function createLanguage2() {
  let lang = {};
  lang.name = `language_${rando()}`
  lang.consonantList = []
  lang.vowelList = []
  setLanguageFactors(lang)
  lang.consonantList = subsetOf(ling.consonantList);
  lang.vowelList = subsetOf(ling.vowelList);
  setPlosives(lang)
  setUvulars(lang)
  setLateralConsonants(lang)
  setVowels(lang)
  consFrequencies(lang)
  otherVowels(lang)
  let flat = [...new Set(lang.vowelList)]
  lang.vowelList = flat
  let flat2 = [...new Set(lang.consonantList)];
  lang.consonantList = flat2
  lang.svo = pickFrom(ling.svo);
  lang.adjectives = pickFrom(ling.adjectives);
  lang.adposition = pickFrom(ling.adposition);
  //let struct = pickFrom(ling.syllableStructures);
  //lang.syllableStructures = struct.split(",")
  lang.syllableStructures = subsetOf(ling.syllableStructures)
  lang.syllableStructures.push("C,V")
  lang.stress = pickFrom(ling.stress);
  lang.nounGenders = subsetOf(ling.nounGenders);

  lang.dictionary = {

  }
  lang.loc = translate(lang, "word")
  return lang;
}

function createSyllable(lang) {
    let syll = ""
    for (let i = 0; i < lang.syllableStructures.length; i++) {
        let s = lang.syllableStructures[i]
        if (s === "(C)") {
            let rand = getRandomInt(0, 10);
            if (rand > 5) {
                syll += pickFrom(lang.consonantList)
            }
        } else if (s === ("(V)")) {
            let rand = getRandomInt(0, 10);
            if (rand > 5) {
                syll += pickFrom(lang.vowelList)
            }
        } else if (s === "C") {
            syll += pickFrom(lang.consonantList)
        } else if (s === "V") {
            syll += pickFrom(lang.vowelList)
        }
    }
    return syll
}

function translate(lang, word, part) {
    let newWord = ``
    let m = word.match(/[?\,\.\:\!\;]/)
    let syllables;
    if (m) {
        word = word.replace(/[?\,\.\:\!\;]/, "")
    }
    word = word.toLowerCase()
    if (lang.dictionary[`${word}`]) {
        return lang.dictionary[`${word}`]
    }
    if (word.length === 1) {
      newWord = pickFrom(lang.vowelList);
    } else if (word.length === 2) {
      let rand = getRandomInt(0, 1);
      if (rand === 0) {
        newWord += pickFrom(lang.vowelList);
        newWord += pickFrom(lang.consonantList)
      } else if (rand === 1) {
        newWord += pickFrom(lang.consonantList)
        newWord += pickFrom(lang.vowelList);
      }
    } else {
      //you could change this based on language preferences
      let rand = getRandomInt(0, 100);
      if (rand < 70) {
        syllables = 1
      } else if (rand < 95) {
        syllables = 2
      } else if (rand < 97) {
        syllables = 3
      } else if (rand < 99) {
        syllables = 4;
      } else {
        syllables = 5
      }
      if (part) {
        syllables = 1
      }
    }

    for (let i = 0; i < syllables; i++) {
      let randNum = getRandomInt(0, lang.syllableStructures.length - 1)
      let randStructure = lang.syllableStructures[randNum]
      randStructure = randStructure.split(",")
      let structLength = randStructure.length
      for (let j = 0; j < structLength; j++) {
        let s = randStructure[j]
        if (s === "(C)") {
            let rand = getRandomInt(0, 1);
            if (rand === 0) {
              newWord += pickFrom(lang.consonantList)
            }
        } else if (s === "C") {
          newWord += pickFrom(lang.consonantList)
        } else if (s === "V") {
          newWord += pickFrom(lang.vowelList);
        } else if (s === "(V)") {
          let rand = getRandomInt(0, 1);
          if (rand === 0) {
            newWord += pickFrom(lang.consonantList)
          }
        } else {
            if (s.match(/\(/)) {
              let t = s.match(/\w+/);
              newWord += t
            }
        }
      }
    }

    /*
    let rand = getRandomInt(0, lang.syllableStructures.length);
    let randStructure = lang.syllableStructures[rand]
    randStructure = randStructure.split(",")
    let structLength = randStructure.length
    let newWord = ``
    */

    /*
    let len = Math.floor(word.length / structLength);
    if (len === 0) {
        len = 1
    }

    for (let i = 0; i < len; i++) {
        let syll = createSyllable(lang)
        newWord += syll;
    }
    */

    /*
    let len = word.length;
    let newLen
    if (len > 2) {
        newLen = getRandomInt(len - 1, len + 1);
    }

    if (newLen < 1) {
        newLen = getRandomInt(1, 4);
    }
    if (newLen === structLength) {
        for (let i = 0; i < structLength; i++) {
            let s = randStructure[i]
            if (s === "(C)" || s === "C") {
                let rand = getRandomInt(0, 10);
                if (rand > 4) {
                    newWord += pickFrom(lang.consonantList)
                }
            } else {
                newWord += pickFrom(lang.vowelList)
            }
        }
    }
    if (newLen < structLength) {
        let randomLength = getRandomInt(1, structLength)
        let hasVowel = false;
        for (let i = 0; i < randomLength; i++) {
            let s = randStructure[i]
            if (hasVowel) {
                if (s === "(C)" || s === "C") {
                    let rand = getRandomInt(0, 10);
                    if (rand > 4) {
                        newWord += pickFrom(lang.consonantList)
                    }
                } else {
                    newWord += pickFrom(lang.vowelList)
                }
            } else {
                if (s === "(C)" || s === "C") {
                    //do nothing until you get a vowel
                } else {
                    hasVowel = true
                    newWord += pickFrom(lang.vowelList)
                }
            }
        }
        //short words
        if (hasVowel === false || newWord.length === 1) {
            if (word.length === 1) {

            } else {
                let rand = getRandomInt(0, 3);
                if (rand === 0) {
                    newWord += pickFrom(lang.consonantList)
                    newWord += pickFrom(lang.vowelList)
                } else if (rand === 1) {
                    newWord += pickFrom(lang.vowelList)
                    newWord += pickFrom(lang.consonantList)
                } else {
                    newWord += pickFrom(lang.vowelList)
                    newWord += pickFrom(lang.vowelList)
                }
            }
        }
    }

    if (newLen  > structLength) {
        let num = Math.floor(newLen / structLength)
        for (let i = 0; i < num; i++) {
            for (let j = 0; j < structLength; j++) {
                let s = randStructure[j]
                if (s === "(C)" || s === "C") {
                    let rand = getRandomInt(0, 10);
                    if (rand > 4) {
                        newWord += pickFrom(lang.consonantList)
                    }
                } else {
                    newWord += pickFrom(lang.vowelList)
                }
            }
        }
    }
    */


    lang.dictionary[`${word}`] = newWord
    if (m) {
        newWord += m
    }
    return newWord
}

//rudimentary vso
function vso(termsArr, lang) {
    let lastNoun = -1;
    let lastVerb = -1;
    let sentence = []
    let terms = [];
    let shift = 0;
    for (let i = 0; i < termsArr.length; i++) {

        for (let j = 0; j < termsArr[i].length; j++) {
            terms.push(termsArr[i][j])
        }
    }
    for (let i = 0; i < terms.length; i++) {
        sentence.push(terms[i].text)
    }
    for (let i = 0; i < terms.length; i++) {
        if (lang.adjectives === "after noun" && terms[i] && (terms[i].tags.has("Adjective") || terms[i].tags.has("Value")) && terms[i + 1] && terms[i +1].tags.has("Noun")) {
            sentence[i + 1] = sentence[i + 1] + " " + terms[i].text
            sentence[i] = ""
        }
        if (terms[i] && terms[i].tags && terms[i].tags.has("Noun")) {
            lastNoun = i;
        }
        if (terms[i] && terms[i].tags && terms[i].tags.has("Verb") && terms[i].tags.has("Auxiliary") !== true) {
            lastVerb = i
            if (lastNoun > -1) {
                let lastNounText = terms[lastNoun].text;
                let currVerbText = terms[i].text;
                let lnt = sentence[lastNoun]
                let lvt = sentence[i]
                sentence[lastNoun] = lvt
                sentence[i] = lnt;
                if (terms[lastNoun - 1] && (terms[lastNoun - 1].tags.has("Adjective") || terms[lastNoun - 1].tags.has("Value")) && terms[lastNoun - 2] && terms[lastNoun - 2].tags.has("Determiner")) {
                    sentence[i] = sentence[lastNoun - 2] + " " + sentence[i];
                    sentence[lastNoun - 2] = ""
                }
                if ((terms[lastNoun - 1] && terms[lastNoun - 1].tags.has("Determiner")) || (terms[lastNoun - 1] && terms[lastNoun - 1].tags.has("Conjunction"))) {
                    //article
                    console.log(sentence[lastNoun - 1])
                    sentence[i] = sentence[lastNoun - 1] + " " + sentence[i]
                    sentence[lastNoun - 1] = ""
                }

                if ((terms[i - 1] && terms[i - 1].text === "to") || (terms[i - 1] && terms[i - 1].text === "and") || (terms[i - 1] && terms[i - 1].text === "not") || (terms[i - 1] && terms[i - 1].tags.has("Auxiliary"))) {
                    //infinitive and "and" and auxiliary
                    sentence[lastNoun] = terms[i - 1].text + " " + sentence[lastNoun]
                    sentence[i - 1] = ""
                }
                if (terms[i + 1] && terms[i + 1].tags.has("Particle")) {
                    //like up in "run up the score"
                    sentence[lastNoun] = sentence[lastNoun] + " " + terms[i + 1].text
                    sentence[i + 1] = ""
                }
                lastNoun = -1;
                lastVerb = -1;
            }
        }

    }
    sentence = sentence.join(" ")
    return sentence
}

function placeName(lang) {
  let prefix = pickFrom(placeNamePrefixes)
  let suffix = pickFrom(placeNameSuffixes)
  suffix = suffix.n
  let translatedPrefix = capitalize(romanizeText(translate(lang, prefix, true)))
  let translatedSuffix = romanizeText(translate(lang, suffix, true));
  return `${translatedPrefix}${translatedSuffix}`
}

function rt(lang, text) {
  let newText = ``
  let arr = text.split(" ");
  for (let i = 0; i < arr.length; i++) {
      newText += `${translate(lang, arr[i])} `
  }
  newText = capitalize((newText).trim())
  return newText;
}

let currSpeech

function letterized(text) {
  let mappings = [
    { 'src': /ʌ/g, 'dest': 'ɘw'},
    { 'src': /ʊ/g, 'dest': 'uw'},
    { 'src': /ʉ/g, 'dest': 'ii'},
    { 'src': /ɤ/g, 'dest': 'o'}, //not right
    { 'src': /ɶ/g, 'dest': 'a:'},
    { 'src': /œ/g, 'dest': 'uh'},
    { 'src': /ɵ/g, 'dest': 'uI'},
    { 'src': /ɘ/g, 'dest': 'u:w'},
    { 'src': /ø/g, 'dest': 'u:3'},
    { 'src': /ʏ/g, 'dest': 'u:'}, // come back
    { 'src': /y/g, 'dest': 'i:'},
    { 'src': /ǁ/g, 'dest': 'q:'},
    { 'src': /ǀ/g, 'dest': 'q:'},
    { 'src': /ǂ/g, 'dest': 'q:'},
    { 'src': /ʢ/g, 'dest': 'q:'},
    { 'src': /ʕ/g, 'dest': 'q:'},
    { 'src': /ʘ/g, 'dest': 'q:'}, //change - needs to be a click
    { 'src': /ʡ/g, 'dest': 'h:'},
    { 'src': /ð/g, 'dest': 'th' },
    { 'src': /θ/g, 'dest': 'th' },
    { 'src': /ʑ/g, 'dest': 'zj'},
    { 'src': /ʐ/g, 'dest': 'zzz' },
    { 'src': /ʎ/g, 'dest': 'j:'},
    { 'src': /χ/g, 'dest': 'x:'},
    { 'src': /ɣ/g, 'dest': 'g:'},
    { 'src': /ʍ/g, 'dest': 'w'},
    { 'src': /ⱱ/g, 'dest': 'vb'},
    { 'src': /ʨ/g, 'dest': 'CH'},
    { 'src': /ʦ/g, 'dest': 'ts'},
    { 'src': /ʈ/g, 'dest': 'td'},
    { 'src': /ʂ/g, 'dest': 'ssh'},
    { 'src': /ʁ/g, 'dest': 'rh'},
    { 'src': /ʀ/g, 'dest': 'rrr'},
    { 'src': /ɻ/g, 'dest': 'r'},
    { 'src': /ɽ/g, 'dest': 'dr'},
    { 'src': /ɹ/g, 'dest': 'lr'},
    { 'src': /ɴ/g, 'dest': 'ngh'},
    { 'src': /ɲ/g, 'dest': 'nj'},
    { 'src': /ɳ/g, 'dest': 'n:'},
    { 'src': /ɱ/g, 'dest': 'm:3'},
    { 'src': /^\s*\//g, 'dest': '' },
    { 'src': /\/\s*$/g, 'dest': '' },

    { 'src': /(\.)/g, 'dest': '%' },
    { 'src': /(\u02c8)/g, 'dest': '\'' },
    { 'src': /(\u02cc)/g, 'dest': ',' },
    { 'src': /(\u0251)/g, 'dest': 'A:' },
    { 'src': /(\u02d0)/g, 'dest': ':' },
    { 'src': /(\u0251\u02d0)/g, 'dest': 'A' },
    { 'src': /(\u0251\u0279)/g, 'dest': 'A' },
    { 'src': /(a\u02d0)/g, 'dest': 'A' },

    // feedback from formantzero via r/linguistics
    { 'src': /(\u0329)/g, 'dest': 'r' },

    // feedback from scharfes_s via r/linguistics
    { 'src': /(\u027e)/g, 'dest': 't' },

    { 'src': /(\xe6)/g, 'dest': 'a' },
    { 'src': /(a)/g, 'dest': 'a' },
    { 'src': /(\u028c)/g, 'dest': 'V' },
    { 'src': /(\u0252)/g, 'dest': '0' },
    { 'src': /(\u0254)/g, 'dest': '0' },
    { 'src': /(a\u028a)/g, 'dest': 'aU' },
    { 'src': /(\xe6\u0254)/g, 'dest': 'aU' },
    { 'src': /(\u0259)/g, 'dest': '@' },
    { 'src': /(\u025a)/g, 'dest': '3' },
    { 'src': /(\u0259\u02d0)/g, 'dest': '3:' },
    { 'src': /(a\u026a)/g, 'dest': 'aI' },
    { 'src': /(\u028c\u026a)/g, 'dest': 'aI' },
    { 'src': /(\u0251e)/g, 'dest': 'aI' },
    { 'src': /(b)/g, 'dest': 'b' },
    { 'src': /(t\u0283)/g, 'dest': 'tS' },
    { 'src': /(\u02a7)/g, 'dest': 'tS' },
    { 'src': /(d)/g, 'dest': 'd' },
    { 'src': /(\xf0)/g, 'dest': 'D' },
    { 'src': /(\u025b)/g, 'dest': 'E' },
    { 'src': /(e)/g, 'dest': 'E' },
    { 'src': /(\u025d)/g, 'dest': '3:' },
    { 'src': /(\u025c\u02d0)/g, 'dest': '3:' },
    { 'src': /(\u025b\u0259)/g, 'dest': 'e@' },
    { 'src': /(e)/g, 'dest': 'E' },
    { 'src': /(\u025d)/g, 'dest': '3:' },
    { 'src': /(\u025c\u02d0)/g, 'dest': '3:' },
    { 'src': /(e\u026a)/g, 'dest': 'eI' },
    { 'src': /(\xe6\u026a)/g, 'dest': 'eI' },
    { 'src': /(f)/g, 'dest': 'f' },
    { 'src': /(\u0261)/g, 'dest': 'g' },
    { 'src': /(g)/g, 'dest': 'g' },
    { 'src': /(h)/g, 'dest': 'h' },
    { 'src': /(\u026a)/g, 'dest': 'I' },
    { 'src': /(\u0268)/g, 'dest': 'I' },
    { 'src': /(\u026a\u0259)/g, 'dest': 'i@' },
    { 'src': /(\u026a\u0279)/g, 'dest': 'i@' },
    { 'src': /(\u026a\u0279\u0259)/g, 'dest': 'i@3' },
    { 'src': /(i)/g, 'dest': 'i:' },
    { 'src': /(i\u02d0)/g, 'dest': 'i:' },
    { 'src': /(d\u0292)/g, 'dest': 'dZ' },
    { 'src': /(\u02a4)/g, 'dest': 'dZ' },
    { 'src': /(k)/g, 'dest': 'k' },
    { 'src': /(x)/g, 'dest': 'x' },
    { 'src': /(l)/g, 'dest': 'l' },
    { 'src': /(d\u026b)/g, 'dest': 'l' },
    { 'src': /(m)/g, 'dest': 'm' },
    { 'src': /(n)/g, 'dest': 'n' },
    { 'src': /(\u014b)/g, 'dest': 'N' },
    { 'src': /(\u0259\u028a)/g, 'dest': 'oU' },
    { 'src': /(o)/g, 'dest': 'oU' },
    { 'src': /(o\u028a)/g, 'dest': 'oU' },
    { 'src': /(\u0259\u0289)/g, 'dest': 'V' },
    { 'src': /(\u0254\u026a)/g, 'dest': 'OI' },
    { 'src': /(o\u026a)/g, 'dest': 'OI' },
    { 'src': /(p)/g, 'dest': 'p' },
    { 'src': /(\u0279)/g, 'dest': 'r' },
    { 'src': /(s)/g, 'dest': 's' },
    { 'src': /(\u0283)/g, 'dest': 'S' },
    { 'src': /(t)/g, 'dest': 't' },
    { 'src': /(\u027e)/g, 'dest': 't' },
    { 'src': /(\u03b8)/g, 'dest': 'T' },
    { 'src': /(\u028a\u0259)/g, 'dest': 'U@' },
    { 'src': /(\u028a\u0279)/g, 'dest': 'U@' },
    { 'src': /(\u028a)/g, 'dest': 'U' },
    { 'src': /(\u0289\u02d0)/g, 'dest': 'u:' },
    { 'src': /(u\u02d0)/g, 'dest': 'u:' },
    { 'src': /(u)/g, 'dest': 'u:' },
    { 'src': /(\u0254\u02d0)/g, 'dest': 'O:' },
    { 'src': /(o\u02d0)/g, 'dest': 'O:' },
    { 'src': /(v)/g, 'dest': 'v' },
    { 'src': /(w)/g, 'dest': 'w' },
    { 'src': /(\u028d)/g, 'dest': 'w' },
    { 'src': /(j)/g, 'dest': 'j' },
    { 'src': /(z)/g, 'dest': 'z' },
    { 'src': /(\u0292)/g, 'dest': 'Z' },
    { 'src': /(\u0294)/g, 'dest': '?' },

    // special edits
    { 'src': /(k\'a2n)/g, 'dest': 'k\'@n' },
    { 'src': /(ka2n)/g, 'dest': 'k@n' },
    { 'src': /(gg)/g, 'dest': 'g' },
    { 'src': /(@U)/g, 'dest': 'oU' },
    { 'src': /rr$/g, 'dest': 'r' },
    { 'src': /3r$/g, 'dest': '3:' },
    { 'src': /([iU]|([AO]:))@r$/g, 'dest': '$1@' },
    { 'src': /([^e])@r/g, 'dest': '$1:3' },
    { 'src': /e@r$/g, 'dest': 'e@' },
    { 'src': /e@r([bdDfghklmnNprsStTvwjzZ])/g, 'dest': 'e@$1' },

    // edits arising from testing
    { 'src': /(\'k)+/g, 'dest': 'k\'' },
    { 'src': /(\ː)+/g, 'dest': ':' },
    { 'src': /(\:)+/g, 'dest': ':' },
    { 'src': /(ᵻ)/g, 'dest': 'I' },
    { 'src': /(ɜ)/g, 'dest': '3' },
    { 'src': /(ɔ)/g, 'dest': 'O' },

    // feedback from formantzero via r/linguistics
    { 'src': /\u0361(.)/g, 'dest': '$1\'' },
    { 'src': /3$/g, 'dest': 'R' },
    { 'src': /ɓ/g, 'dest': 'b3:'},
    { 'src': /β/g, 'dest': 'bv' },
    { 'src': /ʙ/g, 'dest': 'bwwbww'},
    { 'src': /ç/g, 'dest': 'sh'},
    { 'src': /ɖ/g, 'dest': 'd:'},
    { 'src': /ɗ/g, 'dest': 'd:'},
    { 'src': /ʣ/g, 'dest': 'dz' },
    { 'src': /ʥ/g, 'dest': 'dj'},
    { 'src': /ʤ/g, 'dest': 'j'},
    { 'src': /ɠ/g, 'dest': 'gh'},
    { 'src': /g/g, 'dest': 'gh'},
    { 'src': /ɢ/g, 'dest': 'kg'},
    { 'src': /ʛ/g, 'dest': 'qg'},
    { 'src': /ɥ/g, 'dest': 'w'},
    { 'src': /ʜ/g, 'dest': 'hkh'},
    { 'src': /ʝ/g, 'dest': 'gj'},
    { 'src': /ɟ/g, 'dest': 'zdj'},
    { 'src': /ʄ/g, 'dest': 'ydj' },
    { 'src': /ɭ/g, 'dest': 'l'},
    { 'src': /ʟ/g, 'dest': 'l'},
    { 'src': /ɱ/g, 'dest': 'mv'},
    { 'src': /ɲ/g, 'dest': 'nj'},

  ];
  for (var i = 0; i < mappings.length; i++) {
    text = text.replace(mappings[i].src, mappings[i].dest);
  //console.log(mappings[i].src + uipa);
  }
  console.log(`SOURCED: ${text}`)
  return text;
}



function romanizeText(t) {
  return t;
  t = t.split("");
  for (let i = 0; i < t.length; i++) {
    let letter = t[i];
    for (let j = 0; j < sounds.length; j++) {
      if (sounds[j].t === letter) {
        if (sounds[j].orth) {
          //THIS ISN"'t WHAT IS CHANGING THINGS'
          t[i] = t[i].replace(t[i], pickFrom(sounds[j].orth))
        }
      }
    }
  }
  t = t.join("")
  return t;
}

function romanizeDictionary(d) {
  for (let p in d) {
    d[p] = romanizeText(d[p])
  }
}

let a;

function seedDictionary(lang, seed) {
  for (let i = 0; i < seed.length; i++) {
    translate(lang, seed[i])
  }
}

let orthedText;


/*START BIGRAM WORK*/



function setTrigrams(wordsArray, trigrams) {
  // Step 1: Create trigrams from the array of words
  
  wordsArray.forEach(word => {
      for (let i = 0; i < word.length - 2; i++) {
          const trigram = word.substring(i, i + 3);
          const nextChar = word[i + 3] || null; // Get the character following the trigram, or null if it's the end

          if (!trigrams[trigram]) {
              trigrams[trigram] = [];
          }
          if (nextChar && !trigrams[trigram].includes(nextChar)) {
              trigrams[trigram].push(nextChar);
          }
      }
  });
}

function generateWordFromTrigrams(trigrams, type) {
  let rand = getRandomInt(0, type.length - 1)
  let seed = type[rand]
  let firstThree = seed.substring(0,3);
    let currentTrigram = firstThree
    let newWord = currentTrigram;
    let count = 0;
    let max = getRandomInt(2, 9); // messing with this makes a big difference in generation
    while (true && count < max) {
        const possibleNextChars = trigrams[currentTrigram];
        if (!possibleNextChars || possibleNextChars.length === 0) {
            break; // End the word if there are no possible next characters
        }
        const nextChar = possibleNextChars[Math.floor(Math.random() * possibleNextChars.length)];
        newWord += nextChar;
        currentTrigram = newWord.substring(newWord.length - 3); // Update the trigram to the last three chars of the new word
        count += 1;
    }

    return newWord;
}

function generateWordsFromTrigrams(trigrams, type) {
  const newWords = [];
  for (let i = 0; i < 1000; i++) {
      newWords.push(generateWordFromTrigrams(trigrams, type));
  }

  return newWords;
}

const surnameTrigrams = {};
const maleNameTrigrams = {};
const femaleNameTrigrams = {}
const britishPlacesTrigrams = {}
const religionNamesTrigrams = {}

// Example usage
setTrigrams(parsedSurnames, surnameTrigrams)
setTrigrams(maleNames, maleNameTrigrams)
setTrigrams(femaleNames, femaleNameTrigrams)
setTrigrams(britishPlaces, britishPlacesTrigrams)
setTrigrams(religionNamesList, religionNamesTrigrams)

function gg() {
  let t = ``
  t += generateWordFromTrigrams(maleNameTrigrams, maleNames);
  t += ` ${generateWordFromTrigrams(surnameTrigrams, parsedSurnames)}`
  t += ` of ${generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)} is marrying ${generateWordFromTrigrams(femaleNameTrigrams, femaleNames)} ${generateWordFromTrigrams(surnameTrigrams, parsedSurnames)} of ${generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)}. They are both followers of ${generateWordFromTrigrams(religionNamesTrigrams, religionNamesList)}`
  console.log(t)
}


//bigram approach

function generateNamesBasedOnBigram(inputNames, numberOfNames) {
  // Split input names into tokens
  const tokens = inputNames.flatMap(name => name.split(' '));

  // Generate bigrams and map them to possible next tokens
  const bigrams = new Map();
  for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      const nextToken = tokens[i + 2] || null; // null for the end of a sequence

      if (!bigrams.has(bigram)) {
          bigrams.set(bigram, []);
      }
      if (nextToken) {
          bigrams.get(bigram).push(nextToken);
      }
  }

  // Function to generate a single name
  function generateName() {
      let currentBigram = Array.from(bigrams.keys())[Math.floor(Math.random() * bigrams.size)];
      let nameTokens = currentBigram.split(' ');
      let count = 0;
      let max = 4;
      while (true && count < max) {
          const possibleNextTokens = bigrams.get(currentBigram);
          if (!possibleNextTokens || possibleNextTokens.length === 0) break; // End if no possible continuation

          const nextToken = possibleNextTokens[Math.floor(Math.random() * possibleNextTokens.length)];
          nameTokens.push(nextToken);

          // Update the current bigram to the last two tokens of the name
          currentBigram = `${nameTokens[nameTokens.length - 2]} ${nextToken}`;
          count += 1;
      }

      let last = nameTokens[nameTokens.length - 1]
      while (last === "of" || last === "the") {
        nameTokens.pop();
        last = nameTokens[nameTokens.length - 1]
      }

      return nameTokens.join(' ');
  }

  // Generate the requested number of names
  const generatedNames = [];
  for (let i = 0; i < numberOfNames; i++) {
      generatedNames.push(generateName());
  }

  return generatedNames;
}

function nameChecks() {
  let t = ``
  for (let i = 0; i < 1000; i++) {
    t += `${generateWordFromTrigrams(maleNameTrigrams, maleNames)} ${generateWordFromTrigrams(surnameTrigrams, parsedSurnames)} of ${generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)} married ${generateWordFromTrigrams(femaleNameTrigrams, femaleNames)} ${generateWordFromTrigrams(surnameTrigrams, parsedSurnames)} of ${generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)} in a small ceremony in ${generateWordFromTrigrams(britishPlacesTrigrams, britishPlaces)}.`
  }
  console.log(t)
}
