import { convertMongoGeometryToGoogleGeometry } from "../controllers";
import { IMongoPlace } from "../models";
import { GooglePlace, ItemReview, MongoPlaceEntity } from "../types";

// Extract a field from the response based on a keyword
export const extractFieldFromResponse = (response: string, fieldName: string): string => {
  const regex = new RegExp(`${fieldName}:\\s*(.*)`, 'i');
  const match = response.match(regex);
  return match ? match[1].trim() : '';
};

// Extract a list of items from the response based on a keyword
export const extractListFromResponse = (response: string, fieldName: string): string[] => {
  const regex = new RegExp(`${fieldName}:\\s*(.*)`, 'i');
  const match = response.match(regex);
  return match ? match[1].split(',').map(item => item.trim()) : [];
};

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

export function removeSquareBrackets(text: string): string {
  return text.replace(/^\[|\]$/g, '').trim();
}

export function convertMongoPlacesToGooglePlaces(mongoPlaces: IMongoPlace[]): GooglePlace[] {
  return mongoPlaces.map((mongoPlace) => {
    const mongoPlaceObject: MongoPlaceEntity = mongoPlace.toObject();
    const googlePlace: GooglePlace = {
      ...mongoPlaceObject,
      geometry: convertMongoGeometryToGoogleGeometry(mongoPlace.geometry!)
    };
    return googlePlace;
  });
}