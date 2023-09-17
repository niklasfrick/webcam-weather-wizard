const { createWorker } = require("tesseract.js");
const preprocessImage = require("./imagePreprocess");

// Function to extract text from an image file
async function extractTextFromImage(imagePath) {
  try {
    const outputImagePath = await preprocessImage(imagePath);
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage("deu");
    await worker.initialize("deu");
    const {
      data: { text },
    } = await worker.recognize(outputImagePath);
    await worker.terminate();

    console.log("Text extracted from the image:");
    console.log(text);
  } catch (error) {
    console.error(
      "Error preprocessing or extracting text from the image:",
      error,
    );
  }
}

module.exports = {
  extractTextFromImage,
};
