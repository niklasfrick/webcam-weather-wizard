const cron = require("node-cron");

const { downloadImage } = require("./webcamImageDownload"); // Import the downloadImage and checkImageUrlExists modules
const { extractTextFromImage } = require("./webcamImageOCR"); // Import the extractTextFromImage module
const { constructImageUrl } = require("./fileUtils");

function extractWeatherData() {
  // Schedule the program to run every two minutes between 6:00 and 21:58
  cron.schedule("*/2 6-21 * * *", () => {
    const now = new Date();
    console.log(`Running at ${now.toLocaleTimeString()}`);

    // first wait 30 seconds before running, the webcam lags behind a couple of seconds
    setTimeout(async () => {
      const imageUrl = constructImageUrl();
      let imagePath;

      try {
        console.log("Fetching: ", imageUrl);
        imagePath = await downloadImage(imageUrl);
      } catch (error) {
        console.error("Error downloading image:", error.message);
      }

      if (imagePath) {
        const text = await extractTextFromImage(imagePath);
        console.log("Text extracted from the image:");
        console.log(text);
      }
    }, 30000); // 30000 milliseconds = 30 seconds
  });

  console.log("OCR program scheduled. Press Ctrl+C to exit.");
}

module.exports = extractWeatherData;
