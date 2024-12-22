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

      // Fetch all places from MongoDB
      const places: IMongoPlace[] = await MongoPlace.find({});
      console.log("places:", places);
  
      // Filter places open for lunch
      const lunchPlaces = places.filter((place) => {
        const mongoPlaceEntity: MongoPlaceEntity = place.toObject();
        const openingHours: google.maps.places.PlaceOpeningHours | undefined = mongoPlaceEntity.opening_hours;
  
        if (!openingHours) return false;
  
        const periods: google.maps.places.PlaceOpeningHoursPeriod[] | undefined = openingHours.periods;
  
        if (!periods) return false;
  
        // Check if any period covers lunch time
        const hasLunchPeriod = periods.some((period) => {
          if (!period.open || !period.close) return false;
  
          const openTime: google.maps.places.PlaceOpeningHoursTime = period.open;
          const closeTime: google.maps.places.PlaceOpeningHoursTime = period.close;
  
          // Lunch is assumed to fall within the 11:00 AM - 1:00 PM window
          return openTime.time <= "1300" && closeTime.time >= "1100";
        });
  
        return hasLunchPeriod;
      });
  
      // Extract names of places open for lunch
      const lunchPlaceNames = lunchPlaces.map((place) => place.name);
  
      if (lunchPlaceNames.length === 0) {
        return "No restaurants found open for lunch.";
      }
  
      // Return the names as a JSON string
      return JSON.stringify(lunchPlaceNames);
    } catch (error) {
      console.error("Error querying MongoDB:", error);
      return "An error occurred while retrieving lunch data.";
    }
  }
  
}
