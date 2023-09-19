const Ajv = require('ajv');
const { connectToDatabase, closeDatabase } = require('./databaseConnector');
const snapshotDataSchema = require('./snapshot-data.schema.json');

// Function to write data to the database, checking against the schema
async function dbWriteSnapshotData(snapshotData) {
  const db = await connectToDatabase();
  const collection = db.collection('snapshot-data');

  const ajv = new Ajv({ allErrors: true }); // Create an instance of Ajv with allErrors set to true

  // Add a custom format to the schema to validate date_time
  ajv.addFormat('custom-date-time', function (dateTimeString) {
    if (typeof dateTimeString === 'object') {
      dateTimeString = dateTimeString.toISOString();
    }

    return !isNaN(Date.parse(dateTimeString)); // any test that returns true/false
  });
  const validate = ajv.compile(snapshotDataSchema); // Compile the schema

  // Validate the snapshotData against the schema
  const isValid = validate(snapshotData);

  if (!isValid) {
    const validationError = new Error('Error validating snapshot data against schema');
    validationError.validationErrors = validate.errors;
    throw validationError; // Throw an error with validationErrors property
  }

  try {
    const result = await collection.insertOne(snapshotData);
    console.log(`Inserted ${result.insertedCount} documents into the database`);
  } catch (error) {
    console.error('Error inserting documents into the database:', error);
    throw error;
  }

  closeDatabase();
}

module.exports = { dbWriteSnapshotData };
