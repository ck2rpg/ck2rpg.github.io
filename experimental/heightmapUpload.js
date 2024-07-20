document.getElementById('imageUpload').addEventListener('change', function(event) {
    //const canvas = document.getElementById('heightmap-upload-canvas');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const file = event.target.files[0];
    const reader = new FileReader();
    
    let divider = GID("import-divider-adjuster").value;
    let multiplier = GID("import-multiplier-adjuster").value;

    function getGreyscalePixelAt(pixels, x, y, imgWidth) {
        let yMult = y * world.width * 4; // could change this to allow more
        let xMult = x * 4
        let total =  yMult + xMult
        return pixels.data[total]
    }
    for (let i = 0; i < world.height; i++) {
        for (let j = 0; j < world.width; j++) {
            let cell = world.map[i][j]
            cell.elevation = 0;
        }
    }
    cleanupAll()
    

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Calculate the dimensions to fit the image within 512x512
            let width = img.width;
            let height = img.height;
            const maxWidth = world.width;
            const maxHeight = world.height;

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
            ctx.drawImage(img, 0, 0, world.width, world.height);
            console.log("here")

            // Get the image data
            const imageData = ctx.getImageData(0, 0, world.width, world.height);

            // Log the pixel data array to the console
            for (let i = 0; i < world.height; i++) {
                for (let j = 0; j < world.width; j++) {
                    let cell = world.map[i][j]
                    cell.elevation = Math.floor(getGreyscalePixelAt(imageData, j, i)); //5 for CK map
                    if (cell.elevation > 37) {
                        cell.elevation += parseInt(heightmapAdjuster * 2)
                        cell.elevation /= divider
                        cell.elevation *= multiplier
                        if (cell.elevation < 38) {
                            cell.elevation = 38
                        }
                    } else {
                        cell.elevation *= multiplier
                    }
                }
            }
            //drawWorld()
        };
        img.src = event.target.result;

    };

    

    if (file) {
        reader.readAsDataURL(file);
    }
});