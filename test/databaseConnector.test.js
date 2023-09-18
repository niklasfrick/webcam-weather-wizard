const { MongoClient, ObjectId } = require('mongodb');
const { connectToDatabase, closeDatabase } = require('../src/database/databaseConnector');

describe('MongoDB Connector Tests', () => {
  let db;
  let dummyObjectId;

  beforeAll(async () => {
    db = await connectToDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    // Add dummy data to the database before each test
    const collection = db.collection('snapshot-data');
    dummyObjectId = new ObjectId();
    const dummyData = {
      _id: dummyObjectId,
      date_time: '2023-09-15T12:00:00Z',
      temperature_celsius: 20.0,
      wind_speed_kph: 2.5,
      total_precipitation_mm: 0.5,
      snow_coverage: 0,
      detected_objects: ['building', 'car', 'road'],
    };
    await collection.insertOne(dummyData);
  });

  afterEach(async () => {
    // Delete the dummy data from the database after each test
    const collection = db.collection('snapshot-data');
    await collection.deleteOne({ _id: dummyObjectId });
  });

  it('should connect to the MongoDB database', async () => {
    expect(db).toBeDefined();
  });

  it('should find a document in the database', async () => {
    const collection = db.collection('snapshot-data');
    const objectId = new ObjectId('65083bc15d90473a13292160');
    const query = { _id: objectId };

    const foundDocument = await collection.findOne(query);
    expect(foundDocument).toEqual({
      _id: objectId,
      date_time: '2023-09-14T17:26:04Z',
      temperature_celsius: 14.6,
      wind_speed_kph: 1.4,
      total_precipitation_mm: 2,
      snow_coverage: 0,
      detected_objects: ['tent', 'animal', 'tree', 'mountain'],
    });
  });

  it('should find the dummy data in the database', async () => {
    const collection = db.collection('snapshot-data');
    const query = { _id: dummyObjectId };

    const foundDocument = await collection.findOne(query);
    expect(foundDocument).toEqual({
      _id: dummyObjectId,
      date_time: '2023-09-15T12:00:00Z',
      temperature_celsius: 20.0,
      wind_speed_kph: 2.5,
      total_precipitation_mm: 0.5,
      snow_coverage: 0,
      detected_objects: ['building', 'car', 'road'],
    });
  });

  it('should delete the dummy data from the database', async () => {
    const collection = db.collection('snapshot-data');
    const query = { _id: dummyObjectId };

    // Delete the dummy data
    await collection.deleteOne(query);

    // Check if the dummy data is no longer in the database
    const foundDocument = await collection.findOne(query);
    expect(foundDocument).toBeNull();
  });
});
