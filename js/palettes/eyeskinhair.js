function randomColor() {
    // Generates a random RGB color
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
    };
}

function colorToHex({ r, g, b }) {
    // Converts an RGB color to hex format
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function rgbStringToHex(rgbString) {
    // Extract the numbers from the string using a regular expression
    const result = rgbString.match(/\d+/g).map(Number);
    
    // Convert the RGB values to hex
    return "#" + ((1 << 24) + (result[0] << 16) + (result[1] << 8) + result[2]).toString(16).slice(1).toUpperCase();
}

function colorDistance(color1, color2) {
    // Calculates the Euclidean distance between two colors in RGB space
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}

function lerp(start, end, t) {
    // Linearly interpolates between two values
    return start * (1 - t) + end * t;
}

function mixColors(color1, color2, t) {
    // Mixes two colors
    let r = Math.round(lerp(parseInt(color1.substring(1, 3), 16), parseInt(color2.substring(1, 3), 16), t));
    let g = Math.round(lerp(parseInt(color1.substring(3, 5), 16), parseInt(color2.substring(3, 5), 16), t));
    let b = Math.round(lerp(parseInt(color1.substring(5, 7), 16), parseInt(color2.substring(5, 7), 16), t));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function generateDiverseColors(count, minDistance) {
    // Generates a set of colors that are sufficiently different from each other
    let colors = [];
    while (colors.length < count) {
        let newColor = randomColor();
        let isDiverse = colors.every(existingColor => colorDistance(newColor, existingColor) > minDistance);

        if (isDiverse) {
            colors.push(newColor);
        }
    }
    return colors;
}

const eCanvas = document.getElementById("gradientCanvas")
const eCtx = eCanvas.getContext('2d');

let paletteFileNames = [
    "hair_palette.png",
    "eye_palette.png",
    "skin_palette.png"
]

function generatePalette() {
    eCanvas.width = 256;
    eCanvas.height = 256;
    

    // Generate 4 random base colors
    const baseColors = generateDiverseColors(4, 100).map(colorToHex);

    for (let x = 0; x < eCanvas.width; x++) {
        for (let y = 0; y < eCanvas.height; y++) {
            // Calculate interpolation factors based on position
            const horizontalFactor = x / (eCanvas.width - 1);
            const verticalFactor = y / (eCanvas.height - 1);

            // Determine start and end colors for interpolation
            const topLeftColor = baseColors[0];
            const topRightColor = baseColors[1];
            const bottomLeftColor = baseColors[2];
            const bottomRightColor = baseColors[3];

            // Interpolate between the four corner colors
            const topColor = mixColors(topLeftColor, topRightColor, horizontalFactor);
            const bottomColor = mixColors(bottomLeftColor, bottomRightColor, horizontalFactor);
            const finalColor = mixColors(topColor, bottomColor, verticalFactor);

            // Set the color to the current pixel
            eCtx.fillStyle = finalColor;
            eCtx.fillRect(x, y, 1, 1);
        }
    }
}

function drawAndDownloadPalette(filename) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                eCtx.clearRect(0, 0, eCanvas.width, eCanvas.height);
                generatePalette()
                const dataUrl = eCanvas.toDataURL(); // Convert eCanvas to data URL
                downloadPaletteImage(dataUrl, filename); // Function to trigger download
                resolve(); // Resolve the promise after the download is triggered
            } catch (error) {
                console.error('Error converting eCanvas to data URL:', error);
                reject(error); // Reject the promise if there's an error
            }
        }, 100); // Execute after the current call stack clears
    });
}

function downloadPaletteImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link); // Append link to body
    link.click(); // Simulate click to trigger download
    document.body.removeChild(link); // Clean up
}

function downloadAllPalettes() {
    for (let i = 0; i < paletteFileNames.length; i++) {
        let p = paletteFileNames[i]
        drawAndDownloadPalette(p)
    }
}

function hidePalette() {
    eCanvas.style.display = "none"
}