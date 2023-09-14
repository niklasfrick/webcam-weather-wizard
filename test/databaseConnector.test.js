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

  afterAll(() => {
    closeDatabase();
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
});
