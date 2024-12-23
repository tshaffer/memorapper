import { Tool } from "langchain/tools";
import MongoPlace, { IMongoPlace } from "../models/MongoPlace";
import { MongoPlaceEntity } from "../types";

const filterPlacesByTime = (
  places: IMongoPlace[],
  startTime: string,
  endTime: string
): string[] => {
  return places
    .filter((place) => {
      const mongoPlaceEntity: MongoPlaceEntity = place.toObject();

      const openingHours: google.maps.places.PlaceOpeningHours | undefined = mongoPlaceEntity.opening_hours;

      if (!openingHours) return false;

      const periods: google.maps.places.PlaceOpeningHoursPeriod[] | undefined = openingHours.periods;

      if (!periods) return false;

      // Check if any period covers the specified time range
      return periods.some((period) => {
        if (!period.open || !period.close) return false;

        const openTime: google.maps.places.PlaceOpeningHoursTime = period.open;
        const closeTime: google.maps.places.PlaceOpeningHoursTime = period.close;
        
        return openTime.time <= endTime && closeTime.time >= startTime;
      });
    })
    .map((place) => place.name); // Return names of matching places
};

export class GetOpenForLunchTool extends Tool {
  name = "GetOpenForLunch";
  description = "Finds restaurants open for lunch based on their opening hours.";

  async _call(input: string): Promise<string> {
    try {
      const places: IMongoPlace[] = await MongoPlace.find({});
      console.log("GetOpenForLunchTool invoked");

      // Filter places open for lunch (11:00 AM to 1:00 PM)
      const lunchPlaceNames = filterPlacesByTime(places, "1100", "1300");

      if (lunchPlaceNames.length === 0) {
        return "No restaurants found open for lunch.";
      }
      return JSON.stringify(lunchPlaceNames);
    } catch (error) {
      console.error("Error querying MongoDB:", error);
      return "An error occurred while retrieving lunch data.";
    }
  }
}

export class GetOpenForBreakfastTool extends Tool {
  name = "GetOpenForBreakfast";
  description = "Finds restaurants open for breakfast based on their opening hours.";

  async _call(input: string): Promise<string> {
    try {
      console.log("GetOpenForBreakfast invoked");
      const places: IMongoPlace[] = await MongoPlace.find({});

      // Filter places open for breakfast (6:00 AM to 10:00 AM)
      const breakfastPlaceNames = filterPlacesByTime(places, "0600", "1000");

      if (breakfastPlaceNames.length === 0) {
        return "No restaurants found open for breakfast.";
      }

      return JSON.stringify(breakfastPlaceNames);
    } catch (error) {
      console.error("Error querying MongoDB:", error);
      return "An error occurred while retrieving breakfast data.";
    }
  }
}
