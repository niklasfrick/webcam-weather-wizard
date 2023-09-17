const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { formatDateToImageFilename } = require("./fileUtils");

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

// Function to download the image to the image directory after checking its existence
async function downloadImage(imageUrl) {
  // Check if the image URL exists
  const imageExists = await checkImageUrlExists(imageUrl);

  if (!imageExists) {
    throw new Error("Image not available.");
  }

  const imageName = formatDateToImageFilename(new Date());
  const imagePath = path.join(__dirname, "./images", imageName); // Use __dirname to get the current script's directory

  try {
    const response = await axios({
      method: "get",
      url: imageUrl,
      responseType: "arraybuffer",
    });

    fs.writeFileSync(imagePath, response.data);

    return imagePath;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  downloadImage,
};
