const cron = require('node-cron');
const extractWebcamData = require('./webcam/webcamData');
const { writeSnapshotData } = require('./database/databaseCommands');

// Configuration
const schedule = '*/2 6-21 * * *'; // Every two minutes between 6:00 and 21:58
const delay = 30000; // 30 seconds delay before running extractWebcamData

async function main() {
  if (process.env.NODE_ENV === 'development') {
    // Run the program instantly for testing purposes
    const snapshotData = await extractWebcamData();

    console.log(snapshotData);
    writeSnapshotData(snapshotData);
  } else {
    // Schedule the program to run on a schedule in production
    console.log('Webcam Data extraction scheduled. Press Ctrl+C to exit.');

    cron.schedule(schedule, async () => {
      const now = new Date();
      console.log(`Running at ${now.toLocaleTimeString()}`);

      setTimeout(async () => {
        try {
          const snapshotData = await extractWebcamData();
          console.log(snapshotData);
        } catch (error) {
          console.error('Error while extracting webcam data:', error);
        }
      }, delay);
    });
  }
}

main();
