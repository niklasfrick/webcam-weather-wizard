const { createWorker } = require("tesseract.js");

// Function to extract text from an image file
async function extractTextFromImage(imagePath) {
  const worker = await createWorker();
  await worker.loadLanguage("deu");
  await worker.initialize("deu");
  const {
    data: { text },
  } = await worker.recognize(imagePath);
  await worker.terminate();

  console.log("Text extracted from the image:");
  console.log(text);
}

module.exports = {
  extractTextFromImage,
};
