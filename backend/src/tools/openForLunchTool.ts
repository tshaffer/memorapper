import { Tool } from "langchain/tools";
import { MongoClient } from "mongodb";
import MongoPlace, { IMongoPlace } from "../models/MongoPlace";
import { MongoPlaceEntity } from "../types";

// MongoDB client setup
// const mongoClient = new MongoClient(process.env.MONGO_URI!);

export class GetOpenForLunchTool extends Tool {
  // Define the tool's name and description
  name = "GetOpenForLunch";
  description = "Finds restaurants open for lunch based on their opening hours.";

  // Implement the method to handle tool execution
  async _call(input: string): Promise<string> {
    try {
      const places: IMongoPlace[] = await MongoPlace.find({});

      console.log('places:', places);

      for (const place of places) {
        const mongoPlaceEntity: MongoPlaceEntity = place.toObject();
        const openingHours: google.maps.places.PlaceOpeningHours | undefined = mongoPlaceEntity.opening_hours;
        if (openingHours) {
          const periods: google.maps.places.PlaceOpeningHoursPeriod[] | undefined = openingHours.periods;
          if (periods) {
            const lunchPeriods = periods.filter((period) => {
              if (!period.open || !period.close) return false;
              const placeOpeningHoursTime: google.maps.places.PlaceOpeningHoursTime = period.open;
              const placeClosingHoursTime: google.maps.places.PlaceOpeningHoursTime = period.close;
              return placeOpeningHoursTime.time < "1300" && placeClosingHoursTime.time > "1300";
            });
            if (lunchPeriods.length > 0) {
              // Return a list of restaurant names
            }
          }
        }
      }
    } catch (error) {
      console.error("Error querying MongoDB:", error);
      return "An error occurred while retrieving lunch data.";
    }

    return 'test';
  }

  //               return `The following restaurants are open for lunch: ${places.map(p => p.name).join(", ")}`;

  // await mongoClient.connect();
  // const db = mongoClient.db("memorapper");

  // const restaurants = await db.collection("restaurants").find({
  //   "openingHours.lunch": { $exists: true },
  // }).toArray();

  // if (restaurants.length === 0) {
  //   return "No restaurants are open for lunch.";
  // }

  // return restaurants.map(r => r.name).join(", "); // Return a list of restaurant names
}
