const { MongoClient } = require("mongodb");
const {
  connectToDatabase,
  closeDatabase,
} = require("../src/database/databaseConnector");

describe("MongoDB Connector Tests", () => {
  let db;

  beforeAll(async () => {
    db = await connectToDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    // Add dummy data to the database before each test
    const collection = db.collection("snapshot-data");
    const dummyData = {
      _id: "2",
      date_time: "2023-09-15T12:00:00Z",
      temperature_celsius: 20.0,
      wind_speed_kph: 2.5,
      total_precipitation_mm: 0.5,
      snow_coverage: 0,
      detected_objects: ["building", "car", "road"],
    };
    await collection.insertOne(dummyData);
  });

  afterEach(async () => {
    // Delete the dummy data from the database after each test
    const collection = db.collection("snapshot-data");
    await collection.deleteOne({ _id: "2" });
  });

  it("should connect to the MongoDB database", async () => {
    expect(db).toBeDefined();
  });

  it("should find a document in the database", async () => {
    const collection = db.collection("snapshot-data");
    const query = { _id: "1" };

    const foundDocument = await collection.findOne(query);
    expect(foundDocument).toEqual({
      _id: "1",
      date_time: "2023-09-14T17:26:04Z",
      temperature_celsius: 14.6,
      wind_speed_kph: 1.4,
      total_precipitation_mm: 2,
      snow_coverage: 0,
      detected_objects: ["tent", "animal", "tree", "mountain"],
    });
  });

  it("should find the dummy data in the database", async () => {
    const collection = db.collection("snapshot-data");
    const query = { _id: "2" };

    const foundDocument = await collection.findOne(query);
    expect(foundDocument).toEqual({
      _id: "2",
      date_time: "2023-09-15T12:00:00Z",
      temperature_celsius: 20.0,
      wind_speed_kph: 2.5,
      total_precipitation_mm: 0.5,
      snow_coverage: 0,
      detected_objects: ["building", "car", "road"],
    });
  });

  it("should delete the dummy data from the database", async () => {
    const collection = db.collection("snapshot-data");
    const query = { _id: "2" };

    // Delete the dummy data
    await collection.deleteOne(query);

    // Check if the dummy data is no longer in the database
    const foundDocument = await collection.findOne(query);
    expect(foundDocument).toBeNull();
  });
});
