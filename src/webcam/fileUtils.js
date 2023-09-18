require('dotenv').config();

// Function to format a date object to match the image filename format
function formatDateToImageFilename(date) {
  const year = date.getFullYear().toString().slice(-2); // Use last two digits of the year
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = Math.floor(date.getMinutes() / 2) * 2; // Round down to the nearest even number (as pictures are uploaded every 2 minutes and the program is run every 3 minutes)

  return `${year}${month}${day}${hours}${minutes.toString().padStart(2, '0')}.jpg`;
}

// Function to construct the image URL based on the current date and time
function constructImageUrl() {
  const now = new Date();
  const baseUrl = process.env.WEBCAM_URL;
  const imageName = formatDateToImageFilename(now);
  return `${baseUrl}${imageName}`;
}

module.exports = {
  formatDateToImageFilename,
  constructImageUrl,
};
