/**
 * Retrieves the image data from the entire canvas based on the world's dimensions.
 *
 * @returns {ImageData} The image data object containing pixel information.
 */
function wholeImage() {
  return ctx.getImageData(0, 0, world.width, world.height);
}

/**
 * Retrieves the image data from the entire canvas with fixed dimensions.
 *
 * @returns {ImageData} The image data object containing pixel information.
 */
function wholeCanvasImage() {
  return ctx.getImageData(0, 0, settings.width, settings.height);
}


function wholeMapImage() {
    let d = ctx.getImageData(0, 0, (world.width * settings.pixelSize), (world.height * settings.pixelSize));
    return d
}

/**
 * Normalizes the given ImageData object into a 2D array of RGB objects.
 *
 * @param {ImageData} imageData - The ImageData object to normalize.
 * @returns {Array<Array<{r: number, g: number, b: number}>>} 
 *          A 2D array representing the RGB values of the image.
 */
function normalizeTypedArray(imageData) {
  const { data, width } = imageData;
  const height = data.length / (4 * width);
  const map = [];
  let count = 0;

  for (let i = 0; i < height; i++) {
    const row = [];
    for (let j = 0; j < width; j++) {
      row.push({
        r: data[count],
        g: data[count + 1],
        b: data[count + 2]
      });
      count += 4;
    }
    map.push(row);
  }
  return map;
}

/**
 * Retrieves the RGB values at a specific pixel position in the ImageData object.
 *
 * @param {ImageData} pixels - The ImageData object containing pixel data.
 * @param {number} num - The index of the pixel in the ImageData array.
 * @returns {string|undefined} The RGB string or undefined if out of bounds.
 */
function getRGB(pixels, num) {
  const r = pixels.data[num];
  const g = pixels.data[num + 1];
  const b = pixels.data[num + 2];
  return r !== undefined && g !== undefined && b !== undefined
    ? `${r}, ${g}, ${b}`
    : undefined;
}
