// Downloads all old webcam images to a folder
// this will be highly specific to the used webcam
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Define the URL pattern and the date range
const baseUrl = process.env.WEBCAM_URL;
const startDate = new Date("2021-09-01");
const endDate = new Date("2023-09-13");
endDate.setHours(21, 58, 0, 0); // Set the end time to 9:58 PM

// Function to check if the current time is before the end time
function isBeforeEndTime(date) {
  return date <= endDate;
}

// Create a function to download images
async function downloadImages() {
  const currentDate = new Date(startDate);

  while (currentDate <= endDate && isBeforeEndTime(currentDate)) {
    const year = currentDate.getFullYear().toString().slice(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const imageUrl = `${baseUrl}${year}${month}${day}${hours}${minutes}.jpg`;

    try {
      const response = await axios.get(imageUrl, { responseType: "stream" });

      const folderPath = path.join(__dirname, "images");
      const filePath = path.join(
        folderPath,
        `${year}${month}${day}${hours}${minutes}.jpg`,
      );

      // Create the folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      const imageStream = response.data;
      const fileStream = fs.createWriteStream(filePath);

      imageStream.pipe(fileStream);

      console.log(`Downloaded: ${filePath}`);
    } catch (error) {
      console.error(`Error downloading: ${imageUrl}`);
    }

    // Increment currentDate by 2 minutes
    currentDate.setMinutes(currentDate.getMinutes() + 2);
  }
}

downloadImages();
