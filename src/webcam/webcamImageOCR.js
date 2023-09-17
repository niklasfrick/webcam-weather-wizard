const { createWorker } = require("tesseract.js");
const { preprocessImage } = require("./imagePreprocess");

// Function to extract text from an image file
async function extractTextFromImage(imagePath) {
  // Get the preprocessed image path
  const preprocessedImagePath = await preprocessImage(imagePath);
  const worker = await createWorker();
  await worker.loadLanguage("deu");
  await worker.initialize("deu");
  const {
    data: { text },
  } = await worker.recognize(preprocessedImagePath);
  await worker.terminate();

  console.log("Text extracted from the image:");
  console.log(text);
}

module.exports = {
  extractTextFromImage,
};
