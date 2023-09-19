const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const mobilenet = require('@tensorflow-models/mobilenet');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function detectObjectsWithCocoSsd(imagePath) {
  const model = await cocoSsd.load();
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, image.width, image.height);
  const input = tf.browser.fromPixels(canvas);
  const predictions = await model.detect(input);

  return predictions;
}

async function detectObjectsWithMobileNet(imagePath) {
  const model = await mobilenet.load();

  // Load and preprocess the image
  const image = await loadImage(imagePath);

  // Create a canvas element and draw the image on it
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  // Convert the canvas to a tensor
  const tfImage = tf.browser.fromPixels(canvas);
  const tfResizedImage = tf.image.resizeBilinear(tfImage, [224, 224]);
  const tfNormalizedImage = tfResizedImage.toFloat().div(tf.scalar(255));
  const tfBatchedImage = tfNormalizedImage.reshape([1, 224, 224, 3]);

  // Perform inference
  const predictions = await model.classify(tfBatchedImage);

  // Process and return results
  const topPredictions = Array.from(predictions)
    .map((p) => ({
      className: p.className,
      probability: p.probability,
    }))
    .slice(0, 5); // Only keep the top 5 predictions for simplicity

  return topPredictions;
}

async function main() {
  const imagePath = path.join(__dirname, 'images', '2309192054.jpg');
  const cocoSsdPredictions = await detectObjectsWithCocoSsd(imagePath);
  const mobileNetPredictions = await detectObjectsWithMobileNet(imagePath);

  console.log('Detected objects with COCO-SSD:');
  cocoSsdPredictions.forEach((prediction) => {
    console.log(`${prediction.class} (score: ${Math.round(prediction.score * 100)}%)`);
  });

  console.log('Detected objects with MobileNet:');
  mobileNetPredictions.forEach((prediction) => {
    console.log(prediction);
  });
}

main();
