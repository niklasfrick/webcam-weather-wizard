const extractWebcamData = require('./webcam/webcamData');

async function main() {
  const snapshotDataObject = await extractWebcamData(); // Use await because extractWebcamData is async
  console.log(snapshotDataObject);
}

main();
