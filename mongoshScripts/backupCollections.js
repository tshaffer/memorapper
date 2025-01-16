use memorappy;

const collections = [
  "desiredrestaurants",
  "dinerrestaurantreviews",
  "diners",
  "dininggroups",
  "mongoPlaces",
  "restaurantreviews",
  "visitreviews"
];

const outputDir = "/Users/tedshaffer/Documents/MongoDBBackups/memoRapper/backup-16-2-2025";

const fs = require("fs");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

collections.forEach(collectionName => {
  print(`Exporting collection: ${collectionName}`);

  const data = db.getCollection(collectionName).find().toArray();

  const outputFilePath = `${outputDir}/${collectionName}.json`;
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));

  print(`Exported ${collectionName} to ${outputFilePath}`);
});

print("All collections exported successfully!");

