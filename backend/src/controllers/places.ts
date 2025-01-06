import { Request, Response } from 'express';
import MongoPlace, { IMongoPlace } from "../models/MongoPlace";
import { GoogleGeometry, GooglePlace, MongoGeometry, MongoPlaceEntity } from "../types";
import { getMongoGeometryFromGoogleGeometry } from "./googlePlaces";
import { convertMongoPlacesToGooglePlaces } from '../utilities';
import FuturePlace, { IFuturePlace } from '../models/FuturePlace';

export const getPlace = async (placeId: any): Promise<IMongoPlace | null> => {
  try {
    const existingPlace: IMongoPlace | null = await MongoPlace.findOne({ place_id: placeId }).exec();
    return existingPlace;
  } catch (error) {
    throw new Error('An error occurred while retrieving the place.');
  }
}

export const getPlaces = async (request: Request, response: Response, next: any) => {
  try {
    const mongoPlaces: IMongoPlace[] = await MongoPlace.find({}).exec();
    const futurePlaces: IFuturePlace[] = await FuturePlace.find({}).exec();
    const visitedPlaces: IMongoPlace[] = mongoPlaces.filter(
      (mongoPlace) => !futurePlaces.some((futurePlace) => futurePlace.place_id === mongoPlace.place_id)
    );
    const googlePlaces: GooglePlace[] = convertMongoPlacesToGooglePlaces(visitedPlaces);
    response.status(200).json({ googlePlaces });
    return;
  } catch (error) {
    console.error('Error retrieving reviews:', error);
    response.status(500).json({ error: 'An error occurred while retrieving the reviews.' });
    return;
  }
}

export const getFuturePlaces = async (request: Request, response: Response, next: any) => {
  try {
    const futurePlaces: IFuturePlace[] = await FuturePlace.find({}).exec();
    // Extract all place_id values from futurePlaces
    const futurePlaceIds = futurePlaces.map((futurePlace) => futurePlace.place_id);

    // Find all MongoPlaces with a matching place_id
    const futureMongoPlaces: IMongoPlace[] = await MongoPlace.find({
      place_id: { $in: futurePlaceIds }
    }).exec();

    const googlePlaces: GooglePlace[] = convertMongoPlacesToGooglePlaces(futureMongoPlaces);
    
    response.status(200).json({ googlePlaces });
    return;
  } catch (error) {
    console.error('Error retrieving reviews:', error);
    response.status(500).json({ error: 'An error occurred while retrieving the reviews.' });
    return;
  }
}

export const getFuturePlacesToVisit = async (request: Request, response: Response, next: any) => {
  try {
    const futurePlaces: IFuturePlace[] = await FuturePlace.find({}).exec();
    const futurePlacesToVisit: FuturePlace[] = futurePlaces.map((futurePlace) => {
      return futurePlace.toObject();
    });
    response.status(200).json({ futurePlacesToVisit });
    return;
  } catch (error) {
    console.error('Error retrieving reviews:', error);
    response.status(500).json({ error: 'An error occurred while retrieving the reviews.' });
    return;
  }
}

export const addPlace = async (googlePlace: GooglePlace): Promise<IMongoPlace | null> => {
  // Convert Google geometry to MongoDB format
  const mongoGeometry: MongoGeometry = getMongoGeometryFromGoogleGeometry(googlePlace.geometry!);
  const mongoPlace: MongoPlaceEntity = { ...googlePlace, geometry: mongoGeometry };

  const newMongoPlace: IMongoPlace = new MongoPlace(mongoPlace);

  try {
    const savedMongoPlace: IMongoPlace | null = await newMongoPlace.save();
    return savedMongoPlace;
  } catch (error: any) {
    // Check for duplicate key error (E11000 duplicate key error index)
    if (error.code === 11000 && error.keyPattern?.place_id) {
      console.log("Place already exists in the database.");
      const existingPlace = await MongoPlace.findOne({ place_id: googlePlace.place_id });
      return existingPlace;
    } else {
      console.error('Error saving place:', error);
      throw new Error('An error occurred while saving the place.');
    }
  }
}

export function convertMongoGeometryToGoogleGeometry(mongoGeometry: MongoGeometry): GoogleGeometry {
  return {
    location: {
      lat: mongoGeometry.location.coordinates[1], // GeoJSON uses [lng, lat]
      lng: mongoGeometry.location.coordinates[0]
    },
    viewport: {
      north: mongoGeometry.viewport.northeast.coordinates[1],
      south: mongoGeometry.viewport.southwest.coordinates[1],
      east: mongoGeometry.viewport.northeast.coordinates[0],
      west: mongoGeometry.viewport.southwest.coordinates[0]
    }
  };
}
