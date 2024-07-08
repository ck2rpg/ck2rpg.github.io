document.getElementById('imageUpload').addEventListener('change', function(event) {
    const canvas = document.getElementById('heightmap-upload-canvas');
    const ctx = canvas.getContext('2d');
    const file = event.target.files[0];
    const reader = new FileReader();

    function getGreyscalePixelAt(pixels, x, y) {
        let yMult = y * 512 * 4; // could change this to allow more
        let xMult = x * 4
        let total =  yMult + xMult
        return pixels.data[total]
    }
    

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Calculate the dimensions to fit the image within 512x512
            let width = img.width;
            let height = img.height;
            const maxWidth = 512;
            const maxHeight = 512;

            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            // Clear the canvas and draw the image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);

            // Get the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixelData = imageData.data; // This is a Uint8ClampedArray

            // Log the pixel data array to the console
            console.log(pixelData);
            for (let i = 0; i < world.height; i++) {
                for (let j = 0; j < world.width; j++) {
                    let cell = world.map[i][j]
                    cell.elevation = getGreyscalePixelAt(imageData, j, i);
                }
            }
            drawWorld()
            // You can process the pixelData array as needed
        };
        img.src = event.target.result;

    };

    

    if (file) {
        reader.readAsDataURL(file);
    }
});