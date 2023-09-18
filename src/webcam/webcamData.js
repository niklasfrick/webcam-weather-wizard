const cron = require('node-cron');
require('dotenv').config();

const { downloadImage } = require('./webcamImageDownload');
const { extractTextFromImage } = require('./webcamImageOCR');
const { constructImageUrl } = require('./fileUtils');

async function extractWeatherData() {
  let imageUrl;
  imageUrl = process.env.NODE_ENV === 'production' ? (imageUrl = constructImageUrl()) : (imageUrl = process.env.WEBCAM_TEST_IMAGE_URL);

  let imagePath;

  try {
    console.log('Fetching: ', imageUrl);
    imagePath = await downloadImage(imageUrl);
  } catch (error) {
    console.error('Error downloading image:', error.message);
  }

  if (imagePath) {
    const weatherData = await extractTextFromImage(imagePath, 'weatherData');
    const timeData = await extractTextFromImage(imagePath, 'timeData');

    // Regular expressions to extract numbers with optional decimal points from weather data
    const temperatureRegex = /([\d.]+)\s*°C/;
    const windSpeedRegex = /([\d.]+)\s*km\/?[hn]/; // "h" is optional, and "n" is also allowed
    const precipitationRegex = /([\d.]+)\s*mm heute/;

    // Initialize variables with null values
    let temperature = null;
    let windSpeed = null;
    let precipitation = null;
    let time = null;

    // Extract numbers using regular expressions
    const temperatureMatch = weatherData.match(temperatureRegex);
    const windSpeedMatch = weatherData.match(windSpeedRegex);
    const precipitationMatch = weatherData.match(precipitationRegex);

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

    console.log('Weather data extracted from the image:');
    console.log(weatherData);

    console.log('Temperature: ', temperature);
    console.log('Wind Speed: ', windSpeed);
    console.log('Precipitation: ', precipitation);

    console.log('Time data extracted from the image:');
    console.log(timeData);
  }
}

async function extractWebcamData() {
  if (process.env.NODE_ENV === 'development') {
    // run the program instantly for testing purposes
    await extractWeatherData();
  } else {
    console.log('Webcam Data extraction scheduled. Press Ctrl+C to exit.');
    // Schedule the program to run every two minutes between 6:00 and 21:58
    cron.schedule('*/2 6-21 * * *', () => {
      const now = new Date();
      console.log(`Running at ${now.toLocaleTimeString()}`);

      setTimeout(async () => {
        await extractWeatherData();
      }, 30000);
    });
  }
}

module.exports = extractWebcamData;
