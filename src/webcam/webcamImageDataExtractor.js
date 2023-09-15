const { createWorker } = require("tesseract.js");
const cron = require("node-cron");
require("dotenv").config();

// Function to format a date object to match the image filename format
function formatDateToImageFilename(date) {
  const year = date.getFullYear().toString().slice(-2); // Use last two digits of the year
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = Math.floor(date.getMinutes() / 2) * 2; // Round down to the nearest even number (as pictures are uploaded every 2 minutes and program is run every 3 minutes)

  return `${year}${month}${day}${hours}${minutes
    .toString()
    .padStart(2, "0")}.jpg`;
}

// Function to construct the image URL based on the current date and time
function constructImageUrl() {
  const now = new Date();
  const baseUrl = process.env.WEBCAM_URL;
  const imageName = formatDateToImageFilename(now);
  return `${baseUrl}${imageName}`;
}

// Function to extract text from an image URL
async function extractTextFromImage() {
  const imageUrl = constructImageUrl();
  console.log("Fetching: ", imageUrl);

  const worker = await createWorker();
  await worker.loadLanguage("deu");
  await worker.initialize("deu");
  const {
    data: { text },
  } = await worker.recognize(imageUrl);
  await worker.terminate();

  console.log("Text extracted from the image:");
  console.log(text);
}

// Schedule the program to run every two minutes between 6:00 and 21:58
cron.schedule("*/2 6-21 * * *", () => {
  const now = new Date();
  console.log(`Running at ${now.toLocaleTimeString()}`);
  setTimeout(() => extractTextFromImage(), 30000); // wait 30 seconds before running, the webcam lags behind a couple of seconds
});

console.log("OCR program scheduled. Press Ctrl+C to exit.");
