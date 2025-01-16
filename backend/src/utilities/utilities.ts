import { convertMongoGeometryToGoogleGeometry } from "../controllers";
import { IMongoPlace } from "../models";
import { GooglePlace, ItemReview, MongoPlace } from "../types";

export function extractItemReviews(responseText: string): ItemReview[] {
  console.log('extractItemReviews responseText:', responseText);
  const fieldName = "Item reviews";
  const fieldRegex = new RegExp(`${fieldName}:\\s*\\[(.*?)\\]`, 'is');

  const fieldMatch = responseText.match(fieldRegex);

  // Primary parsing logic
  if (fieldMatch && fieldMatch[1]) {
    try {
      const jsonString = `[${fieldMatch[1].trim()}]`;
      const itemReviews = JSON.parse(jsonString);

      return itemReviews.map((item: any) => ({
        item: item.item?.trim() || "",
        review: item.review?.trim() || "",
      }));
    } catch (error) {
      console.error("Error parsing item reviews:", error);
    }
  }

  // Fallback: Simple regex to extract items if the structured format is missing
  const simpleItemRegex = /(?:-|\*|\n|\b)([a-zA-Z\s]+?)(?:,|\.|\n|$)/g;
  const matches = [...responseText.matchAll(simpleItemRegex)];

  return matches.map((match) => ({
    item: match[1]?.trim() || "",
    review: "",
  }));
}

export function convertMongoPlaceToGooglePlace(mongoPlace: IMongoPlace): GooglePlace {
  const mongoPlaceObject: MongoPlace = mongoPlace.toObject();
  const googlePlace: GooglePlace = {
    ...mongoPlaceObject,
    geometry: convertMongoGeometryToGoogleGeometry(mongoPlace.geometry!)
  };
  return googlePlace;
}

export function convertMongoPlacesToGooglePlaces(mongoPlaces: IMongoPlace[]): GooglePlace[] {
  return mongoPlaces.map((mongoPlace) => {
    const mongoPlaceObject: MongoPlace = mongoPlace.toObject();
    const googlePlace: GooglePlace = {
      ...mongoPlaceObject,
      geometry: convertMongoGeometryToGoogleGeometry(mongoPlace.geometry!)
    };
    return googlePlace;
  });
}