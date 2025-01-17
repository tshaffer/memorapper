import { Request, Response } from 'express';
import MongoPlaceModel, { IMongoPlace } from "../models/MongoPlace";
import { NewRestaurant, GoogleGeometry, GooglePlace, MongoGeometry, MongoPlace, SubmitNewRestaurantRequestBody } from "../types";
import { getMongoGeometryFromGoogleGeometry } from "./googlePlaces";
import { convertMongoPlacesToGooglePlaces, convertMongoPlaceToGooglePlace } from '../utilities';
import NewRestaurantModel, { INewRestaurant } from '../models/NewRestaurant';
import { v4 as uuidv4 } from 'uuid';

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


export const getNewRestaurants = async (request: Request, response: Response, next: any): Promise<void> => {
  try {
    const mongoPlaceDocuments: IMongoPlace[] = await MongoPlaceModel.find({}).exec();
    const newRestaurantDocuments: INewRestaurant[] = await NewRestaurantModel.find({}).exec();

    const newRestaurants: NewRestaurant[] = [];

    for (const newRestaurantDocument of newRestaurantDocuments) {
      const newRestaurantGooglePlaceId = newRestaurantDocument.googlePlaceId;
      for (const mongoPlaceDocument of mongoPlaceDocuments) {
        if (mongoPlaceDocument.googlePlaceId === newRestaurantGooglePlaceId) {
          const newRestaurant = newRestaurantDocument.toObject();
          newRestaurant.googlePlace = convertMongoPlaceToGooglePlace(mongoPlaceDocument);
          newRestaurants.push(newRestaurant);
        }
      }
    }
    response.status(200).json({ newRestaurants });
  } catch (error) {
    console.error('Error retrieving reviews:', error);
    response.status(500).json({ error: 'An error occurred while retrieving the reviews.' });
  }
}

export const submitNewRestaurantHandler = async (
  req: Request<{}, {}, SubmitNewRestaurantRequestBody>,
  res: Response
): Promise<any> => {

  const body: SubmitNewRestaurantRequestBody = req.body;

  try {
    const newReview = await submitNewRestaurant(body);
    return res.status(201).json({ message: 'Review saved successfully!', review: newReview });
  } catch (error) {
    console.error('Error saving review:', error);
    return res.status(500).json({ error: 'An error occurred while saving the review.' });
  }
};

const submitNewRestaurant = async (submitNewRestaurantBody: SubmitNewRestaurantRequestBody): Promise<INewRestaurant | null> => {

  const { _id, googlePlace, newRestaurantId, diningGroupId, comments, interestLevel } = submitNewRestaurantBody;
  const googlePlaceId = googlePlace.googlePlaceId;

  let mongoPlace: IMongoPlace | null = await getPlace(googlePlaceId);
  if (!mongoPlace) {
    mongoPlace = await addPlace(googlePlace);
    if (!mongoPlace) {
      throw new Error('Error saving place.');
    }
  }

  const addNewRestaurantEntity: NewRestaurant = {
    _id,
    newRestaurantId,
    googlePlaceId,
    diningGroupId,
    comments,
    interestLevel
  };

  let savedNewRestaurant: INewRestaurant | null;

  if (_id) {
    // If _id is provided, update the existing document
    savedNewRestaurant = await NewRestaurantModel.findByIdAndUpdate(_id, addNewRestaurantEntity, {
      new: true,    // Return the updated document
      runValidators: true // Ensure the updated data complies with schema validation
    });

    if (!savedNewRestaurant) {
      throw new Error('Visited restaurant not found for update.');
    }
  } else {
    delete addNewRestaurantEntity._id;
    const newNewRestaurant: INewRestaurant | null = await addNewRestaurant(addNewRestaurantEntity);
    console.log('newNewRestaurant:', newNewRestaurant?.toObject());
  }

  return null;
}

export const addNewRestaurant = async (visitedRestaurant: NewRestaurant): Promise<INewRestaurant | null> => {

  const newNewRestaurant: INewRestaurant = new NewRestaurantModel(visitedRestaurant);

  try {
    const savedNewRestaurant: INewRestaurant | null = await newNewRestaurant.save();
    return savedNewRestaurant;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}
