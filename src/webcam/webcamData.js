const axios = require("axios");
const cron = require("node-cron");

const { downloadImage } = require("./webcamImageDownload"); // Import the downloadImage module
const { extractTextFromImage } = require("./webcamImageOCR"); // Import the extractTextFromImage module
const { constructImageUrl } = require("./fileUtils");

// Function to check if the desired image exists
async function checkImageUrlExists(url) {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false; // URL returns a 404 status code
    } else {
      throw error; // Other error occurred
    }
  }
}

// Schedule the program to run every two minutes between 6:00 and 21:58
cron.schedule("*/2 6-21 * * *", () => {
  const now = new Date();
  console.log(`Running at ${now.toLocaleTimeString()}`);

  // first wait 30 seconds before running, the webcam lags behind a couple of seconds
  setTimeout(async () => {
    const imageUrl = constructImageUrl();
    checkImageUrlExists(imageUrl)
      .then(async (exists) => {
        if (exists) {
          console.log("Fetching: ", imageUrl);
          const imagePath = await downloadImage(imageUrl);
          extractTextFromImage(imagePath);
        } else {
          console.log("Image not available");
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error.message);
      });
  }, 30000); // 30000 milliseconds = 30 seconds
});

console.log("OCR program scheduled. Press Ctrl+C to exit.");
