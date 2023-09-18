const { createWorker } = require('tesseract.js');
const { preprocessImage } = require('./imagePreprocess');

// Function to extract text from an image file
async function extractTextFromImage(imagePath, dataType) {
  const cropCoordinates = {
    weatherData: {
      topLeftX: 1,
      topLeftY: 26,
      bottomRightX: 93,
      bottomRightY: 75,
    },
    timeData: {
      topLeftX: 1080,
      topLeftY: -10,
      bottomRightX: 1290,
      bottomRightY: 15,
    },
  };
  const { topLeftX, topLeftY, bottomRightX, bottomRightY } = cropCoordinates[dataType];
  const preprocessedImagePath = await preprocessImage(imagePath, dataType, topLeftX, topLeftY, bottomRightX, bottomRightY);
  const worker = await createWorker();
  await worker.loadLanguage('deu');
  await worker.initialize('deu');
  const {
    data: { text },
  } = await worker.recognize(preprocessedImagePath);
  await worker.terminate();

  return text;
}

module.exports = {
  extractTextFromImage,
};
