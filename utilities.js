function pickFrom(arr) {
    return arr[getRandomInt(0, arr.length - 1)]
}

function pickUniqFrom(arr, arr2) {
    let foundUniq = false;
    while (foundUniq === false) {
        let n = pickFrom(arr);
        let i = arr2.indexOf(n)
        if (i > -1) {
        arr.splice(i, 1);
        } else {
        arr2.push(n)
        foundUniq = true
        }
    }
}

function pickUniqFromWithoutDelete(arr, arr2) {
    let foundUniq = false;
    while (foundUniq === false) {
        let n = pickFrom(arr);
        let i = arr2.indexOf(n)
        if (i > -1) {

        } else {
        arr2.push(n)
        foundUniq = true
        }
    }
}

function pickUniqOrDiscard(arr, arr2) {
    let n = pickFrom(arr);
    let i = arr2.indexOf(n);
    if (i > -1) {

    } else {
        arr2.push(n)
    }
}

function subsetOf(arr) {
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
        let rand = getRandomInt(0, 2);
        if (rand === 1) {
        newArr.push(arr[i])
        }
    }
    if (newArr.length === 0) {
        newArr.push(pickFrom(arr))
    }
    return newArr
}

var randomProperty = function (obj) {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};

function capitalize(word) {
    word = word.charAt(0).toUpperCase()
    + word.slice(1)
    return word;
}

function rando() {
    let t = ""
    let letters = ["b", "c", "d", "f", "g", "h", "k", "m", "n"]
    for (let i = 0; i < 10; i++) {
        t += letters[getRandomInt(0, letters.length - 1)]
    }
    return t;
}

function getRandomInt(min, max) {
    //inclusive on both sides
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }