const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function preprocessImage(inputImagePath, outputPath) {
  // Load the input image
  const image = await loadImage(inputImagePath);

  // Create a canvas to work with
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  // Draw the input image onto the canvas
  ctx.drawImage(image, 0, 0);

  // Define the new coordinates of the text box to isolate (Top Left: (1, 26), Bottom Right: (93, 75))
  const x = 1;
  const y = 26;
  const width = 93 - 1; // Calculate the width
  const height = 75 - 26; // Calculate the height

  // Crop the canvas to the specified coordinates
  const croppedCanvas = createCanvas(width, height);
  const croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

  // Convert the cropped image to grayscale
  const grayscaleCanvas = createCanvas(width, height);
  const grayscaleCtx = grayscaleCanvas.getContext('2d');
  grayscaleCtx.drawImage(croppedCanvas, 0, 0, width, height);
  const grayscaleImageData = grayscaleCtx.getImageData(0, 0, width, height);
  for (let i = 0; i < grayscaleImageData.data.length; i += 4) {
    const average = (grayscaleImageData.data[i] + grayscaleImageData.data[i + 1] + grayscaleImageData.data[i + 2]) / 3;
    grayscaleImageData.data[i] = grayscaleImageData.data[i + 1] = grayscaleImageData.data[i + 2] = average;
  }
  grayscaleCtx.putImageData(grayscaleImageData, 0, 0);

  // Create the "preprocessed" folder if it doesn't exist
  const outputFolder = path.join(__dirname, './images/preprocessed');
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  // Generate the output file path in the "preprocessed" folder
  const outputImageName = path.basename(inputImagePath, path.extname(inputImagePath)) + '_preprocessed.jpg';
  const outputImagePath = path.join(outputFolder, outputImageName);

  // Save the preprocessed image with the "_preprocessed" suffix as a JPG
  const outputImageStream = fs.createWriteStream(outputImagePath);
  const stream = grayscaleCanvas.createJPEGStream({ quality: 100 }); // Adjust quality as needed
  stream.pipe(outputImageStream);

  // Wait for the image to be saved
  await new Promise((resolve, reject) => {
    outputImageStream.on('finish', resolve);
    outputImageStream.on('error', reject);
  });

  return outputImagePath;
}

module.exports = {
  preprocessImage,
};
