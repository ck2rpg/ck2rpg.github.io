function extractConsonantClusters(text) {
    // Define regex patterns for consonants including those in other languages
    const consonantPattern = /[bcdfghjklmnpqrtvwxz]+/gi;

    // Arrays to hold consonant clusters at different positions
    let initialConsonants = [];
    let medialConsonants = [];
    let finalConsonants = [];

    // Split the text into words
    text = text.toLowerCase();
    const words = text.split(/\s+/);

    words.forEach(word => {
        // Find all consonant clusters in the word
        const consonantClusters = word.match(consonantPattern) || [];

        // Track the position in the word for initial, medial, and final consonants
        let lastIndex = 0;

        consonantClusters.forEach((cluster, index) => {
            const clusterIndex = word.indexOf(cluster, lastIndex);
            lastIndex = clusterIndex + cluster.length;

            if (index === 0 && clusterIndex === 0) {
                // Initial consonant cluster
                initialConsonants.push({ cluster, word });
            } else if (lastIndex === word.length) {
                // Final consonant cluster
                finalConsonants.push({ cluster, word });
            } else {
                // Medial consonant cluster
                medialConsonants.push({ cluster, word });
            }
        });
    });

    return {
        initialConsonants,
        medialConsonants,
        finalConsonants
    };
}

function extractVowelClusters(text) {
    // Define regex patterns for vowels including those in other languages
    const vowelPattern = /[aeiouy]+/gi;

    // Arrays to hold vowel clusters at different positions
    let initialVowels = [];
    let medialVowels = [];
    let finalVowels = [];

    // Split the text into words
    text = text.toLowerCase();
    const words = text.split(/\s+/);

    words.forEach(word => {
        // Find all vowel clusters in the word
        const vowelClusters = word.match(vowelPattern) || [];

        // Track the position in the word for initial, medial, and final vowels
        let lastIndex = 0;

        vowelClusters.forEach((cluster, index) => {
            const clusterIndex = word.indexOf(cluster, lastIndex);
            lastIndex = clusterIndex + cluster.length;

            if (index === 0 && clusterIndex === 0) {
                // Initial vowel cluster
                initialVowels.push({ cluster, word });
            } else if (lastIndex === word.length) {
                // Final vowel cluster
                finalVowels.push({ cluster, word });
            } else {
                // Medial vowel cluster
                medialVowels.push({ cluster, word });
            }
        });
    });

    return {
        initialVowels,
        medialVowels,
        finalVowels
    };
}

function reduceClustersToSets(clusterObject) {
    // Use Set to reduce clusters to unique sets
    const initial = new Set(clusterObject.initialConsonants?.map(c => c.cluster) || clusterObject.initialVowels?.map(c => c.cluster));
    const medial = new Set(clusterObject.medialConsonants?.map(c => c.cluster) || clusterObject.medialVowels?.map(c => c.cluster));
    const final = new Set(clusterObject.finalConsonants?.map(c => c.cluster) || clusterObject.finalVowels?.map(c => c.cluster));
    initialSet = Array.from(initial);
    medialSet = Array.from(medial);
    finalSet = Array.from(final);
    return {
        initialSet,
        medialSet,
        finalSet
    };
}


function createClusterProhibitions(lang) {
    if (Math.random() < 0.8) {
        lang.fourConsonantsProhibitedInitial = true;
    } else {
        lang.fourConsonantsProhibitedInitial = false;
    }
    if (Math.random() < 0.8) {
        lang.fourVowelsProhibitedInitial = true;
    } else {
        lang.fourVowelsProhibitedInitial = false
    }
    if (Math.random() < 0.6) {
        lang.threeConsonantsProhibitedInitial = true;
    } else {
        lang.threeConsonantsProhibitedInitial = false;
    }
    if (Math.random() < 0.6) {
        lang.threeVowelsProhibitedInitial = true;
    } else {
        lang.threeVowelsProhibitedInitial = false;
    }
    if (Math.random() < 0.4) {
        lang.twoVowelsProhibitedInitial = true;
    } else {
        lang.twoVowelsProhibitedInitial = false;
    }
    if (Math.random() < 0.4) {
        lang.twoConsonantsProhibitedInitial = true;
    } else {
        lang.twoConsonantsProhibitedInitial = false;
    }

    if (Math.random() < 0.8) {
        lang.fourConsonantsProhibitedMedial = true;
    } else {
        lang.fourConsonantsProhibitedMedial = false;
    }
    if (Math.random() < 0.8) {
        lang.fourVowelsProhibitedMedial = true;
    } else {
        lang.fourVowelsProhibitedMedial = false
    }
    if (Math.random() < 0.6) {
        lang.threeConsonantsProhibitedMedial = true;
    } else {
        lang.threeConsonantsProhibitedMedial = false;
    }
    if (Math.random() < 0.6) {
        lang.threeVowelsProhibitedMedial = true;
    } else {
        lang.threeVowelsProhibitedMedial = false;
    }
    if (Math.random() < 0.4) {
        lang.twoVowelsProhibitedMedial = true;
    } else {
        lang.twoVowelsProhibitedMedial = false;
    }
    if (Math.random() < 0.4) {
        lang.twoConsonantsProhibitedMedial = true;
    } else {
        lang.twoConsonantsProhibitedMedial = false;
    }

    if (Math.random() < 0.8) {
        lang.fourConsonantsProhibitedFinal = true;
    } else {
        lang.fourConsonantsProhibitedFinal = false;
    }
    if (Math.random() < 0.8) {
        lang.fourVowelsProhibitedFinal = true;
    } else {
        lang.fourVowelsProhibitedFinal = false
    }
    if (Math.random() < 0.6) {
        lang.threeConsonantsProhibitedFinal = true;
    } else {
        lang.threeConsonantsProhibitedFinal = false;
    }
    if (Math.random() < 0.6) {
        lang.threeVowelsProhibitedFinal = true;
    } else {
        lang.threeVowelsProhibitedFinal = false;
    }
    if (Math.random() < 0.4) {
        lang.twoVowelsProhibitedFinal = true;
    } else {
        lang.twoVowelsProhibitedFinal = false;
    }
    if (Math.random() < 0.4) {
        lang.twoConsonantsProhibitedFinal = true;
    } else {
        lang.twoConsonantsProhibitedFinal = false;
    }

}

function createProhibitions() {
    let prohibitions = [];
    let consonantProbabilities = [
        { sound: "b", probability: 0.20 },
        { sound: "bl", probability: 0.20 },
        { sound: "bt", probability: 0.95 },


        { sound: "m", probability: 0.06 },
        { sound: "mb", probability: 0.20 },
        { sound: "mn", probability: 0.20 },
        { sound: "mm", probability: 0.20 },
        { sound: "mgr", probability: 0.90 },
    
        { sound: "k", probability: 0.11 },
        { sound: "kn", probability: 0.20 },
        { sound: "kl", probability: 0.20 },
        { sound: "ks", probability: 0.20 },
        { sound: "kr", probability: 0.20 },
        { sound: "kb", probability: 0.20 },
    
        { sound: "j", probability: 0.17 },
        { sound: "dj", probability: 0.20 },
        { sound: "bj", probability: 0.20 },
        { sound: "nj", probability: 0.20 },
        { sound: "jck", probability: 1.00 },
    
        { sound: "w", probability: 0.27 },
        { sound: "wd", probability: 0.20 },
        { sound: "wl", probability: 0.20 },
        { sound: "wr", probability: 0.20 },
        { sound: "wnw", probability: 0.95 },
    
        { sound: "h", probability: 0.38 },
        { sound: "dh", probability: 0.20 },
    
        { sound: "g", probability: 0.44 },
        { sound: "gg", probability: 0.20 },
        { sound: "gh", probability: 0.20 },
        { sound: "gn", probability: 0.7 },
    
        { sound: "n", probability: 0.48 }, 
    
        { sound: "p", probability: 0.52 },
        { sound: "pl", probability: 0.20 },
        { sound: "pp", probability: 0.20 },
        { sound: "ph", probability: 0.20 },
    
        { sound: "s", probability: 0.56 },
        { sound: "sq", probability: 0.80 },
        { sound: "sm", probability: 0.20 },
        { sound: "spr", probability: 0.20 },
        { sound: "str", probability: 0.20 },
        { sound: "sl", probability: 0.20 },
        { sound: "scr", probability: 0.20 },
        { sound: "shr", probability: 0.20 },
    
        { sound: "t", probability: 0.58 },
        { sound: "tt", probability: 0.20 },
        { sound: "th", probability: 0.60 },
    
        { sound: "z", probability: 0.58 },
        { sound: "zz", probability: 0.20 },
        { sound: "zw", probability: 0.8 },
    
        { sound: "f", probability: 0.60 },
        { sound: "fl", probability: 0.20 },
        { sound: "ff", probability: 0.20 },
        { sound: "ft", probability: 0.20 },
    

    
        { sound: "ll", probability: 0.60 },
        { sound: "ld", probability: 0.20 },
        { sound: "lf", probability: 0.20 },
        { sound: "lk", probability: 0.20 },
        { sound: "lv", probability: 0.20 },
        { sound: "rld", probability: 0.90 },
    
        { sound: "q", probability: 0.60 },
    
        { sound: "c", probability: 0.20 },
        { sound: "ck", probability: 0.20 },
        { sound: "ckd", probability: 0.95 },
        { sound: "cr", probability: 0.20 },
        { sound: "cl", probability: 0.20 },
        { sound: "cl", probability: 0.95 },
        { sound: "ch", probability: 0.20 },
        { sound: "cf", probability: 0.20 },
    
        { sound: "d", probability: 0.20 },    
        { sound: "dr", probability: 0.20 },
    
        { sound: "r", probability: 0.3 },
        { sound: "rr", probability: 0.20 },
        { sound: "rpl", probability: 0.5 },
        { sound: "rgl", probability: 0.5 },
        { sound: "rpr", probability: 0.5 },
    
        { sound: "x", probability: 0.60 },
        { sound: "xx", probability: 1.00 },
        { sound: "xcl", probability: 0.90 },
        { sound: "xv", probability: 0.90 },
        { sound: "xp", probability: 0.2 },
        { sound: "xpl", probability: 0.6 },
        

    ];
    let vowelProbabilities = [
        { sound: "o", probability: 0.2 },
        { sound: "oo", probability: 0.4 },
        { sound: "ee", probability: 0.4 },
        { sound: "aa", probability: 0.4 },
        { sound: "ii", probability: 1.00 },
        { sound: "a", probability: 0.2 },
        { sound: "e", probability: 0.2 },
        { sound: "i", probability: 0.2 },
        { sound: "u", probability: 0.2 },
        { sound: "y", probability: 0.95 },
    ]
    for (let i = 0; i < consonantProbabilities.length; i++) {
        prohibitions.push(consonantProbabilities[i])
    }
    for (let i = 0; i < vowelProbabilities.length; i++) {
        prohibitions.push(vowelProbabilities[i])
    }
    
    // Add more prohibitions as needed

    // Determine which prohibitions will be applied based on probability
    let appliedProhibitions = prohibitions.filter(p => Math.random() < p.probability);

    return appliedProhibitions;
}

function applyProhibition(sound, prohibitions) {
    for (let i = 0; i < prohibitions.length; i++) {
        let prohibition = prohibitions[i];
        if (sound.includes(prohibition.sound)) {
            return false; // Prohibited
        }
    }
    return true; // Not prohibited
}

function makeLanguage(consonants, vowels) {
    let lang = {
        initialConsonants: [],
        initialSimpleConsonants: [],
        initialClusterConsonants: [],
        medialConsonants: [],
        medialSimpleConsonants: [],
        medialClusterConsonants: [],
        finalConsonants: [],
        finalClusterConsonants: [],
        finalSimpleConsonants: [],
        initialVowels: [],
        initialSimpleVowels: [],
        initialClusterVowels: [],
        medialVowels: [],
        medialClusterVowels: [],
        medialSimpleVowels: [],
        finalVowels: [],
        finalClusterVowels: [],
        finalSimpleVowels: [],
    };
    createClusterProhibitions(lang)

    let prohibitions = createProhibitions();
    lang.prohibitions = prohibitions;

    // Template function to handle consonants and vowels
    function processClusters(clusterSet, positionType, lengthCriteria, lengthName) {
        clusterSet.forEach(sound => {
            if (applyProhibition(sound, prohibitions)) {
                let targetArray, targetClusterArray, targetSimpleArray;
                
                if (positionType === 'initial') {
                    targetArray = lang.initialConsonants;
                    targetClusterArray = lang.initialClusterConsonants;
                    targetSimpleArray = lang.initialSimpleConsonants;
                } else if (positionType === 'medial') {
                    targetArray = lang.medialConsonants;
                    targetClusterArray = lang.medialClusterConsonants;
                    targetSimpleArray = lang.medialSimpleConsonants;
                } else if (positionType === 'final') {
                    targetArray = lang.finalConsonants;
                    targetClusterArray = lang.finalClusterConsonants;
                    targetSimpleArray = lang.finalSimpleConsonants;
                }

                if (sound.length >= lengthCriteria) {
                    if (!lang[`${lengthName}ConsonantsProhibited${capitalize(positionType)}`]) {
                        if (targetArray.indexOf(sound) === -1) {
                            targetArray.push(sound);
                        }
                        targetClusterArray.push(sound);
                    }
                } else {
                    if (targetArray.indexOf(sound) === -1) {
                        targetArray.push(sound);
                        if (sound.length === 1) {
                            targetSimpleArray.push(sound);
                        }
                    }

                }
            }
        });
    }

    // Process consonant clusters
    processClusters(consonants.initialSet, 'initial', 4, 'four');
    processClusters(consonants.medialSet, 'medial', 4, 'four');
    processClusters(consonants.finalSet, 'final', 4, 'four');
    processClusters(consonants.initialSet, 'initial', 3, 'three');
    processClusters(consonants.medialSet, 'medial', 3, 'three');
    processClusters(consonants.finalSet, 'final', 3, 'three');
    processClusters(consonants.initialSet, 'initial', 2, 'two');
    processClusters(consonants.medialSet, 'medial', 2, 'two');
    processClusters(consonants.finalSet, 'final', 2, 'two');

    // Process vowel clusters (similar to consonants, adjusting for vowels)
    function processVowelClusters(clusterSet, positionType, lengthCriteria, lengthName) {
        clusterSet.forEach(sound => {
            if (applyProhibition(sound, prohibitions)) {
                let targetArray, targetClusterArray, targetSimpleArray;

                if (positionType === 'initial') {
                    targetArray = lang.initialVowels;
                    targetClusterArray = lang.initialClusterVowels;
                    targetSimpleArray = lang.initialSimpleVowels;
                } else if (positionType === 'medial') {
                    targetArray = lang.medialVowels;
                    targetClusterArray = lang.medialClusterVowels;
                    targetSimpleArray = lang.medialSimpleVowels;
                } else if (positionType === 'final') {
                    targetArray = lang.finalVowels;
                    targetClusterArray = lang.finalClusterVowels;
                    targetSimpleArray = lang.finalSimpleVowels;
                }

                if (sound.length >= lengthCriteria) {
                    if (!lang[`${lengthName}VowelsProhibited${capitalize(positionType)}`]) {
                        if (targetArray.indexOf(sound) === -1) {
                            targetArray.push(sound);
                        }
                        targetClusterArray.push(sound);
                    }
                } else {
                    if (targetArray.indexOf(sound) === -1) {
                        targetArray.push(sound);
                        if (sound.length === 1) {
                            targetSimpleArray.push(sound);
                        }
                    }
                }
            }
        });
    }

    processVowelClusters(vowels.initialSet, 'initial', 4, 'four');
    processVowelClusters(vowels.medialSet, 'medial', 4, 'four');
    processVowelClusters(vowels.finalSet, 'final', 4, 'four');

    processVowelClusters(vowels.initialSet, 'initial', 3, 'three');
    processVowelClusters(vowels.medialSet, 'medial', 3, 'three');
    processVowelClusters(vowels.finalSet, 'final', 3, 'three');

    processVowelClusters(vowels.initialSet, 'initial', 2, 'two');
    processVowelClusters(vowels.medialSet, 'medial', 2, 'two');
    processVowelClusters(vowels.finalSet, 'final', 2, 'two');

    // Ensure there is at least one vowel in each position
    if (lang.initialVowels.length === 0) {
        lang.initialVowels.push("o");
    }
    if (lang.medialVowels.length === 0) {
        lang.medialVowels.push("o");
    }
    if (lang.finalVowels.length === 0) {
        lang.finalVowels.push("o");
    }

    if (lang.initialConsonants.length === 0) {
        lang.initialConsonants.push("b");
    }
    if (lang.medialConsonants.length === 0) {
        lang.medialConsonants.push("b");
    }
    if (lang.finalVowels.length === 0) {
        lang.finalVowels.push("b");
    }



    // Generate sample words
    lang.desert = makeRandomWord(lang);
    lang.forest = makeRandomWord(lang);
    lang.ocean = makeRandomWord(lang);
    lang.plains = makeRandomWord(lang);
    lang.cvcv = pickFrom([true, false])
    lang.cvc = pickFrom([true, false])
    lang.vcvc = pickFrom([true, false])
    lang.vcv = pickFrom([true, false])
    lang.vcvcvc = pickFrom([true, false])
    lang.vc = pickFrom([true, false])
    lang.loc = makeRandomWord(lang)
    return lang;
}

function makeRandomWord(lang) {
    let vowels = ["a", "e", "i", "o", "u"]
    let consonants = ["b", "c", "d", "f", "g", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w"]
    let initialCons = pickFrom(lang.initialConsonants);
    let medialCons = pickFrom(lang.medialConsonants);
    let finalCons = pickFrom(lang.finalConsonants);
    let initialVowel = pickFrom(lang.initialVowels)
    let medianCons2 = pickFrom(lang.medialConsonants);
    let medialVowel = pickFrom(lang.medialVowels);
    let medialVowel2 = pickFrom(lang.medialVowels)
    let finalVowel = pickFrom(lang.finalVowels)

    //let word = initial + pickFrom(vowels) + median2 + pickFrom(vowels) + final;

    let word;
    let rand = getRandomInt(0, 3);
    if (rand === 0 && lang.cvcv && medialVowel && medialCons && finalVowel) {
        word = initialCons + medialVowel + medialCons + finalVowel;
    } else if (rand === 1 && lang.cvc && initialCons && medialVowel && finalCons) {
        word = initialCons + medialVowel + finalCons
    } else if (rand === 2 && lang.vcvc && initialVowel && medialCons && finalCons) {
        word = initialVowel + medialCons + medialVowel + finalCons
    } else if (rand === 3 && lang.vcv && initialVowel && medialCons && finalVowel) {
        word = initialVowel + medialCons + finalVowel
    } else {
        //simple cvc - check above is for medianVowels
        word = pickFrom(consonants) + pickFrom(vowels) + pickFrom(consonants) 
    }
    //word = initial + pickFrom(vowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels)
 
    
    //let word = initial + pickFrom(lang.medialVowels) + pickFrom(lang.medialConsonants) + pickFrom(lang.medialVowels) + final + pickFrom(arr2);
    //let word = initial + pickFrom(lang.finalVowels)
    return capitalize(word);
}

function makeFaithName(lang) {
    let vowels = ["a", "e", "i", "o", "u"]
    let consonants = ["b", "c", "d", "f", "g", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w"]
    let initialCons = pickFrom(lang.initialConsonants);
    let medialCons = pickFrom(lang.medialConsonants);
    let finalCons = pickFrom(lang.finalConsonants);
    let initialVowel = pickFrom(lang.initialVowels)
    let medianCons2 = pickFrom(lang.medialConsonants);
    let medialVowel = pickFrom(lang.medialVowels);
    let medialVowel2 = pickFrom(lang.medialVowels)
    let finalVowel = pickFrom(lang.finalVowels)
    let word;
    let rand = getRandomInt(0, 3);
    if (rand === 0 && lang.cvcv && medialVowel && medialCons && finalVowel) {
        word = initialCons + medialVowel + medialCons + finalVowel;
    } else if (rand === 1 && lang.cvc && initialCons && medialVowel && finalCons) {
        word = initialCons + medialVowel + finalCons
    } else if (rand === 2 && lang.vcvc && initialVowel && medialCons && finalCons) {
        word = initialVowel + medialCons + medialVowel + finalCons
    } else if (rand === 3 && lang.vcv && initialVowel && medialCons && finalVowel) {
        word = initialVowel + medialCons + finalVowel
    } else {
        //simple cvc - check above is for medianVowels
        word = pickFrom(consonants) + pickFrom(vowels) + pickFrom(consonants) 
    }
    //word = initial + pickFrom(vowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels) + "ism"
    word += "ism"
    word = word.replace("ii", "i")

    
    //let word = initial + pickFrom(lang.medialVowels) + pickFrom(lang.medialConsonants) + pickFrom(lang.medialVowels) + final + pickFrom(arr2);
    //let word = initial + pickFrom(lang.finalVowels)
    return capitalize(word);
}

function makeCharacterName(lang) {
    let vowels = ["a", "e", "i", "o", "u"]
    let initial = pickFrom(lang.initialConsonants);
    //let word = initial + pickFrom(vowels) + median2 + pickFrom(vowels) + final;
    let arr = ["ism", "ianity", "u", "o"]
    let arr2 = [" Plains", " Lake", " River", " Ocean", " Mountains", " Desert"]
    let word;
    let rand = getRandomInt(0, 6);
    if (rand === 0) {
        word = initial + pickFrom(vowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels)
    } else if (rand === 1) {
        word = pickFrom(lang.initialVowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels)
    } else if (rand === 2) {
        word = pickFrom(lang.initialVowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels) + pickFrom(lang.finalConsonants);
    } else if (rand === 3) {
        word = pickFrom(lang.initialVowels) + pickFrom(lang.medialConsonants) + pickFrom(lang.medialVowels) + pickFrom(lang.finalConsonants);
    } else if (rand === 4) {
        word = pickFrom(lang.initialConsonants) + pickFrom(lang.medialVowels) + pickFrom(lang.medialConsonants) + pickFrom(lang.medialVowels) + pickFrom(lang.finalConsonants);
    } else if (rand === 5) {
        word = pickFrom(lang.initialConsonants) + pickFrom(vowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels) + pickFrom(lang.finalConsonants); 
    } else {
        word = pickFrom(lang.initialConsonants) + pickFrom(lang.medialVowels) + pickFrom(lang.medialConsonants) + pickFrom(lang.finalVowels)
    }
    return capitalize(word);
}

function makePlaceName(lang) {
    let vowels = ["a", "e", "i", "o", "u"]
    let initial = pickFrom(lang.initialConsonants);
    let medial = pickFrom(lang.medialConsonants);
    let final = pickFrom(lang.finalConsonants);
    let median2 = pickFrom(lang.medialConsonants);
    let final2 = pickFrom(lang.finalConsonants);

    let word;
    let rand = getRandomInt(0, 6);
    if (rand === 0) {
        word = initial + pickFrom(vowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels)
    } else if (rand === 1) {
        word = pickFrom(lang.initialVowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels)
    } else if (rand === 2) {
        word = pickFrom(lang.initialVowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels) + pickFrom(lang.finalConsonants);
    } else if (rand === 3) {
        word = pickFrom(lang.initialVowels) + pickFrom(lang.medialConsonants) + pickFrom(lang.medialVowels) + pickFrom(lang.finalConsonants);
    } else if (rand === 4) {
        word = pickFrom(lang.initialConsonants) + pickFrom(lang.medialVowels) + pickFrom(lang.medialConsonants) + pickFrom(lang.medialVowels) + pickFrom(lang.finalConsonants);
    } else if (rand === 5) {
        word = pickFrom(lang.initialConsonants) + pickFrom(vowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels) + pickFrom(lang.medialConsonants) + pickFrom(vowels) + pickFrom(lang.finalConsonants); 
    } else {
        word = pickFrom(lang.initialConsonants) + pickFrom(lang.medialVowels) + pickFrom(lang.medialConsonants) + pickFrom(lang.finalVowels)
    }
    //word += pickFrom(arr2)
    return capitalize(word);
}

let cons = extractConsonantClusters(aliceText);
let consSet = reduceClustersToSets(cons);
let vowels = extractVowelClusters(aliceText);
let vowelSet = reduceClustersToSets(vowels)

let germanCons = extractConsonantClusters(germanSeed);
let germanConsSet = reduceClustersToSets(germanCons);
let germanVowels = extractVowelClusters(germanSeed);
let germanVowelSet = reduceClustersToSets(germanVowels)

let frenchCons = extractConsonantClusters(frenchSeed);
let frenchConsSet = reduceClustersToSets(frenchCons);
let frenchVowels = extractVowelClusters(frenchSeed);
let frenchVowelSet = reduceClustersToSets(frenchVowels);

let portugueseCons = extractConsonantClusters(portugueseSeed);
let portugueseConsSet = reduceClustersToSets(portugueseCons);
let portugueseVowels = extractVowelClusters(portugueseSeed);
let portugueseVowelSet = reduceClustersToSets(portugueseVowels);

let quechuaCons = extractConsonantClusters(quechuaSeed);
let quechuaConsSet = reduceClustersToSets(quechuaCons);
let quechuaVowels = extractVowelClusters(quechuaSeed);
let quechuaVowelSet = reduceClustersToSets(quechuaVowels);

let arabicCons = extractConsonantClusters(arabicSeed);
let arabicConsSet = reduceClustersToSets(arabicCons);
let arabicVowels = extractVowelClusters(arabicSeed);
let arabicVowelSet = reduceClustersToSets(arabicVowels);



let lang = makeLanguage(consSet, vowelSet);
let lang2 = makeLanguage(frenchConsSet, frenchVowelSet);
let lang3 = makeLanguage(germanConsSet, germanVowelSet);
let lang4 = makeLanguage(portugueseConsSet, portugueseVowelSet)
let lang5 = makeLanguage(quechuaConsSet, quechuaVowelSet)
let lang6 = makeLanguage(arabicConsSet, arabicVowelSet)


function generateReligiousSentence() {
    let t = `${makeCharacterName(lang)} practices ${makeFaithName(lang)} in the land of ${makePlaceName(lang)}`
    return t;
}