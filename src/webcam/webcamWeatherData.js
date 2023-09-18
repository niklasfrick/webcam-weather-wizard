const cron = require('node-cron');

const { downloadImage } = require('./webcamImageDownload'); // Import the downloadImage and checkImageUrlExists modules
const { extractTextFromImage } = require('./webcamImageOCR'); // Import the extractTextFromImage module
const { constructImageUrl } = require('./fileUtils');

function extractWeatherData() {
  // Schedule the program to run every two minutes between 6:00 and 21:58
  cron.schedule('*/2 6-21 * * *', () => {
    const now = new Date();
    console.log(`Running at ${now.toLocaleTimeString()}`);

    // first wait 30 seconds before running, the webcam lags behind a couple of seconds
    setTimeout(async () => {
      // const imageUrl = constructImageUrl();
      imageUrl = 'https://www.webcam.valuenalopp.li/_webcham01/bilder/2309130826.jpg';
      let imagePath;

      try {
        console.log('Fetching: ', imageUrl);
        imagePath = await downloadImage(imageUrl);
      } catch (error) {
        console.error('Error downloading image:', error.message);
      }

      if (imagePath) {
        const text = await extractTextFromImage(imagePath);

        // Regular expressions to extract numbers with optional decimal points
        const temperatureRegex = /([\d.]+)\s*°C/;
        const windSpeedRegex = /([\d.]+)\s*km\/?[hn]/; // "h" is optional, and "n" is also allowed
        const precipitationRegex = /([\d.]+)\s*mm heute/;

        // Initialize variables with null values
        let temperature = null;
        let windSpeed = null;
        let precipitation = null;

        // Extract numbers using regular expressions
        const temperatureMatch = text.match(temperatureRegex);
        const windSpeedMatch = text.match(windSpeedRegex);
        const precipitationMatch = text.match(precipitationRegex);

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

        console.log('Text extracted from the image:');
        console.log(text);

        console.log('Temperature: ', temperature);
        console.log('Wind Speed: ', windSpeed);
        console.log('Precipitation: ', precipitation);
      }
    }, 30000); // 30000 milliseconds = 30 seconds
  });

  console.log('OCR program scheduled. Press Ctrl+C to exit.');
}

module.exports = extractWeatherData;
