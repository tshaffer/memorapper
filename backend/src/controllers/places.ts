import { Request, Response } from 'express';
import MongoPlaceModel, { IMongoPlace } from "../models/MongoPlace";
import { DesiredRestaurant, GoogleGeometry, GooglePlace, MongoGeometry, MongoPlace, SubmitDesiredRestaurantRequestBody } from "../types";
import { getMongoGeometryFromGoogleGeometry } from "./googlePlaces";
import { convertMongoPlacesToGooglePlaces, convertMongoPlaceToGooglePlace } from '../utilities';
import DesiredRestaurantModel, { IDesiredRestaurant } from '../models/DesiredRestaurant';

export const getPlace = async (placeId: any): Promise<IMongoPlace | null> => {
  try {
    const existingPlace: IMongoPlace | null = await MongoPlaceModel.findOne({ googlePlaceId: placeId }).exec();
    return existingPlace;
  } catch (error) {
    throw new Error('An error occurred while retrieving the place.');
  }
}

export const getPlaces = async (request: Request, response: Response, next: any) => {
  try {
    const mongoPlaces: IMongoPlace[] = await MongoPlaceModel.find({}).exec();
    const googlePlaces: GooglePlace[] = convertMongoPlacesToGooglePlaces(mongoPlaces);
    response.status(200).json({ googlePlaces });
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
  const mongoPlace: MongoPlace = { ...googlePlace, geometry: mongoGeometry };

  const newMongoPlace: IMongoPlace = new MongoPlaceModel(mongoPlace);

  try {
    const savedMongoPlace: IMongoPlace | null = await newMongoPlace.save();
    return savedMongoPlace;
  } catch (error: any) {
    // Check for duplicate key error (E11000 duplicate key error index)
    if (error.code === 11000 && error.keyPattern?.googlePlaceId) {
      console.log("Place already exists in the database.");
      const existingPlace = await MongoPlaceModel.findOne({ googlePlaceId: googlePlace.googlePlaceId });
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


export const getDesiredRestaurants = async (request: Request, response: Response, next: any): Promise<void> => {
  try {
    const mongoPlaceDocuments: IMongoPlace[] = await MongoPlaceModel.find({}).exec();
    const desiredRestaurantDocuments: IDesiredRestaurant[] = await DesiredRestaurantModel.find({}).exec();

    const desiredRestaurants: DesiredRestaurant[] = [];

    for (const desiredRestaurantDocument of desiredRestaurantDocuments) {
      const desiredRestaurantGooglePlaceId = desiredRestaurantDocument.googlePlaceId;
      for (const mongoPlaceDocument of mongoPlaceDocuments) {
        if (mongoPlaceDocument.googlePlaceId === desiredRestaurantGooglePlaceId) {
          const desiredRestaurant = desiredRestaurantDocument.toObject();
          desiredRestaurant.googlePlace = convertMongoPlaceToGooglePlace(mongoPlaceDocument);
          desiredRestaurants.push(desiredRestaurant);
        }
      }
    }
    response.status(200).json({ desiredRestaurants });
  } catch (error) {
    console.error('Error retrieving reviews:', error);
    response.status(500).json({ error: 'An error occurred while retrieving the reviews.' });
  }
}

export const submitDesiredRestaurantHandler = async (req: Request, res: Response): Promise<any> => {

  const body: SubmitDesiredRestaurantRequestBody = req.body;

  try {
    const newReview = await submitDesiredRestaurant(body);
    return res.status(201).json({ message: 'Review saved successfully!', review: newReview });
  } catch (error) {
    console.error('Error saving review:', error);
    return res.status(500).json({ error: 'An error occurred while saving the review.' });
  }
};

const submitDesiredRestaurant = async (visitedRestaurant: SubmitDesiredRestaurantRequestBody): Promise<IDesiredRestaurant | null> => {

  const { _id, googlePlace, comments, interestLevel } = visitedRestaurant;
  const googlePlaceId = googlePlace.googlePlaceId;

  let mongoPlace: IMongoPlace | null = await getPlace(googlePlaceId);
  if (!mongoPlace) {
    mongoPlace = await addPlace(googlePlace);
    if (!mongoPlace) {
      throw new Error('Error saving place.');
    }
  }

  const addDesiredRestaurantEntity: DesiredRestaurant = {
    _id,
    googlePlaceId,
    comments,
    interestLevel
  };

  let savedDesiredRestaurant: IDesiredRestaurant | null;

  if (_id) {
    // If _id is provided, update the existing document
    savedDesiredRestaurant = await DesiredRestaurantModel.findByIdAndUpdate(_id, addDesiredRestaurantEntity, {
      new: true,    // Return the updated document
      runValidators: true // Ensure the updated data complies with schema validation
    });

    if (!savedDesiredRestaurant) {
      throw new Error('Visited restaurant not found for update.');
    }
  } else {
    delete addDesiredRestaurantEntity._id;
    const newDesiredRestaurant: IDesiredRestaurant | null = await addDesiredRestaurant(addDesiredRestaurantEntity);
    console.log('newDesiredRestaurant:', newDesiredRestaurant?.toObject());
  }

  return null;
}

export const addDesiredRestaurant = async (visitedRestaurant: DesiredRestaurant): Promise<IDesiredRestaurant | null> => {

  const newDesiredRestaurant: IDesiredRestaurant = new DesiredRestaurantModel(visitedRestaurant);

  try {
    const savedDesiredRestaurant: IDesiredRestaurant | null = await newDesiredRestaurant.save();
    return savedDesiredRestaurant;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}
