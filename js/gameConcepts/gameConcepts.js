let gameConcepts = []


function concept(key, name, text, icon, replace) {
    let foundConcept = false;
    for (let i = 0; i < gameConcepts.length; i++) {
        let gc = gameConcepts[i]
        if (gc.key === key) {
            if (replace) {
                gc.name = name
                gc.text = text
                if (icon) {
                    gc.icon = icon
                }
            } else {
                gc.text += ` ${text}`
            }
            foundConcept = true;
        } 
    }
    if (foundConcept === false) {
        let concept = {}
        concept.key = key;
        concept.name = name;
        concept.text = text;
        if (icon) {
            concept.icon = icon
        }
        gameConcepts.push(concept)
    }
}