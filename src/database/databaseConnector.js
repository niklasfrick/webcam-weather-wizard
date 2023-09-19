const { MongoClient } = require('mongodb');
require('dotenv').config();

// Load MongoDB URI with credentials and Database Name from .env
const { MONGODB_URI, MONGODB_DB } = process.env;

let dbClient;

async function connectToDatabase() {
  if (!dbClient) {
    try {
      dbClient = new MongoClient(MONGODB_URI);

      await dbClient.connect();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  return dbClient.db(MONGODB_DB);
}

function closeDatabase() {
  if (dbClient) {
    dbClient.close();
    console.log('Closed MongoDB connection');
  }
}

module.exports = { connectToDatabase, closeDatabase };
