const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Function to crop an image based on coordinates
async function cropImage(inputImagePath, topLeftX, topLeftY, bottomRightX, bottomRightY) {
  const image = await loadImage(inputImagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const x = topLeftX;
  const y = topLeftY;
  const width = bottomRightX - topLeftX;
  const height = bottomRightY - topLeftY;

  const croppedCanvas = createCanvas(width, height);
  const croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

  return croppedCanvas;
}

// Function to convert an image to grayscale
function convertToGrayscale(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const average = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = average;
  }

  ctx.putImageData(imageData, 0, 0);
}

// Function to preprocess an image
async function preprocessImage(inputImagePath, dataType, topLeftX, topLeftY, bottomRightX, bottomRightY) {
  const outputFolder = path.join(__dirname, './images/preprocessed');
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  const preprocessedImageSuffix = dataType === 'weatherData' ? '_wd' : '_td';

  const outputImageName = path.basename(inputImagePath, path.extname(inputImagePath)) + `${preprocessedImageSuffix}.jpg`;
  const outputImagePath = path.join(outputFolder, outputImageName);

  const croppedCanvas = await cropImage(inputImagePath, topLeftX, topLeftY, bottomRightX, bottomRightY);
  convertToGrayscale(croppedCanvas);

  const outputImageStream = fs.createWriteStream(outputImagePath);
  const stream = croppedCanvas.createJPEGStream({ quality: 100 });
  stream.pipe(outputImageStream);

  await new Promise((resolve, reject) => {
    outputImageStream.on('finish', resolve);
    outputImageStream.on('error', reject);
  });

  return outputImagePath;
}

module.exports = {
  preprocessImage,
};
