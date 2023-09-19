require('dotenv').config();

const { downloadImage } = require('./webcamImageDownload');
const { extractTextFromImage } = require('./webcamImageOCR');
const { constructImageUrl } = require('./fileUtils');

async function extractWebcamData() {
  let imageUrl;
  imageUrl = process.env.NODE_ENV === 'production' ? (imageUrl = constructImageUrl()) : (imageUrl = process.env.WEBCAM_TEST_IMAGE_URL);

  let imagePath;
  let snapshotDataObject = {};

  try {
    console.log('Fetching: ', imageUrl);
    imagePath = await downloadImage(imageUrl);
  } catch (error) {
    console.error('Error downloading image:', error.message);
  }

  if (imagePath) {
    const weatherData = await extractTextFromImage(imagePath, 'weatherData');
    const timeData = await extractTextFromImage(imagePath, 'timeData');

    // Regular expressions to extract data
    const temperatureRegex = /([\d.]+)\s*°C/;
    const windSpeedRegex = /([\d.]+)\s*km\/?[hn]/; // "h" is optional, and "n" is also allowed
    const precipitationRegex = /([\d.]+)\s*mm heute/;
    const timeRegex = /\b(\d{2}:\d{2}:\d{2})\b/;

    // Initialize variables with null values
    let temperature = null;
    let windSpeed = null;
    let precipitation = null;
    let dateTime = null;

    // Extract data using regular expressions
    const temperatureMatch = weatherData.match(temperatureRegex);
    const windSpeedMatch = weatherData.match(windSpeedRegex);
    const precipitationMatch = weatherData.match(precipitationRegex);
    const timeMatch = timeData.match(timeRegex);

    // Assign extracted numbers to variables, or null if not found
    if (temperatureMatch) {
      temperature = parseFloat(temperatureMatch[1]);
    }

    if (windSpeedMatch) {
      windSpeed = parseFloat(windSpeedMatch[1]);
    }

    if (precipitationMatch) {
      precipitation = parseFloat(precipitationMatch[1]);
    }

    if (timeMatch) {
      // Format the extracted time as ISO 8601 without changing the timezone
      const [hours, minutes, seconds] = timeMatch[1].split(':');
      const now = new Date();
      // Check if daylight saving time (DST) is currently in effect (CEST)
      const isDST = (() => {
        const startDST = new Date(now.getFullYear(), 2, 31 - ((14 - now.getDay() + 7) % 7), 1, 0, 0, 0); // Last Sunday in March
        const endDST = new Date(now.getFullYear(), 9, 31 - ((14 - now.getDay() + 7) % 7), 1, 0, 0, 0); // Last Sunday in October
        return now >= startDST && now < endDST;
      })();

      // Apply the appropriate timezone offset (+02:00 for CEST, +01:00 for CET)
      const offset = isDST ? '+02:00' : '+01:00';

      // Construct the ISO 8601 formatted string with the same hour, minute, and second values
      dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(
        2,
        '0',
      )}T${hours}:${minutes}:${seconds}${offset}`;
    }

    return (snapshotDataObject = {
      date_time: dateTime,
      temperature_celsius: temperature,
      wind_speed_kph: windSpeed,
      total_precipitation_mm: precipitation,
      now_coverage: null,
      detected_objects: [],
    });
  }
}

module.exports = extractWebcamData;
