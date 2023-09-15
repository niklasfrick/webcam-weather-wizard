const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { formatDateToImageFilename } = require("./fileUtils");

// Function to download the image to the image directory
async function downloadImage(imageUrl) {
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
