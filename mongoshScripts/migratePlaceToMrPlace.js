// Open mongosh, connect to your database, and load this script like:
// load('/path/to/migratePlaceToMrPlace.js')

const migratePlacesToMrPlaces = async () => {
  const sourceCollection = db.getCollection('places'); // Old collection
  const targetCollection = db.getCollection('mrplaces'); // New collection

  const placesCursor = sourceCollection.find();

  let count = 0;

  while (await placesCursor.hasNext()) {
    const place = await placesCursor.next();

    const mrPlace = {
      _idPlace: place._id.toString(),
      placeId: place.placeId,
      googlePlaceId: place.googlePlaceId,
      placeType: place.placeType,
      placeComments: place.placeComments || '',
      placeRating: null, // No rating field in Place, so set null

      mrPlaceReviews: [],
      mrPlaceSpecificities: {},
    };

    // Transform reviews if they exist
    if (place.restaurant && place.restaurant.restaurantReviews) {
      mrPlace.mrPlaceReviews = place.restaurant.restaurantReviews.map((review) => ({
        date: review.date,
        reviewText: review.comments,
        itemsOrdered: (review.itemsOrdered || []).map((item) => ({
          itemName: item.name,
          comments: item.comments || '',
          rating: item.rating || 0,
        })),
      }));
    }

    // Transform restaurant-specific fields
    if (place.restaurant) {
      mrPlace.mrPlaceSpecificities = {
        restaurantType: place.restaurant.restaurantType,
        openForBreakfast: place.restaurant.openForBreakfast || false,
        openForLunch: place.restaurant.openForLunch || false,
        openForDinner: place.restaurant.openForDinner || false,
      };
    }

    // Insert into MrPlace collection
    await targetCollection.insertOne(mrPlace);
    count++;
  }

  print(`Migration complete. ${count} documents migrated from Place to MrPlace.`);
};

migratePlacesToMrPlaces();
