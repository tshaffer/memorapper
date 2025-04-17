import { Request, Response } from 'express';
import MongoPlaceModel, { IMongoPlace } from "../models/MongoPlace";
import { GooglePlace, MongoPlace, Place, PlaceWithGooglePlace, SubmitPlaceRequestBody } from "../types";
import PlaceModel, { IPlace } from '../models/Place';
import { convertMongoGeometryToGoogleGeometry } from '../utilities';
import { MongoGeometry } from "../types";
import { convertGoogleGeometryToMongoGeometry, convertMongoPlacesToGooglePlaces } from '../utilities';
import { ObjectId } from 'mongoose';

export const getPlacesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {

    const mongoPlaceDocuments: IMongoPlace[] = await MongoPlaceModel.find({}).exec();
    const placesDocuments: IPlace[] = await PlaceModel.find({}).exec();

    const places: Place[] = [];

    for (const placeDocument of placesDocuments) {
      const placeGooglePlaceId = placeDocument.googlePlaceId;
      for (const mongoPlaceDocument of mongoPlaceDocuments) {
        if (mongoPlaceDocument.googlePlaceId === placeGooglePlaceId) {
          const place = placeDocument.toObject();
          const mongoPlace: MongoPlace = mongoPlaceDocument.toObject();
          place._idPlace = placeDocument._id;
          place.address_components = mongoPlace.address_components;
          place.formatted_address = mongoPlace.formatted_address;
          place.geometry = convertMongoGeometryToGoogleGeometry(mongoPlace.geometry!);
          place.name = mongoPlace.name;
          place.opening_hours = mongoPlace.opening_hours;
          place.price_level = mongoPlace.price_level;
          place.rating = mongoPlace.rating;
          place.user_ratings_total = mongoPlace.user_ratings_total;
          place.utc_offset_minutes = mongoPlace.utc_offset_minutes;
          place.vicinity = mongoPlace.vicinity;
          place.website = mongoPlace.website;

          places.push(place);
        }
      }
    }
    return res.status(200).json({ places });
  } catch (error) {
    console.error('Error fetching places:', error);
    return res.status(500).json({ error: 'An error occurred while fetching places.' });
  }
};

export const getPlaces = async (): Promise<PlaceWithGooglePlace[]> => {
  try {
    const mongoPlaceDocuments: IMongoPlace[] = await MongoPlaceModel.find({}).exec();
    const placesDocuments: IPlace[] = await PlaceModel.find({}).exec();

    const places: PlaceWithGooglePlace[] = [];

    for (const placeDocument of placesDocuments) {
      const placeGooglePlaceId = placeDocument.googlePlaceId;
      for (const mongoPlaceDocument of mongoPlaceDocuments) {
        if (mongoPlaceDocument.googlePlaceId === placeGooglePlaceId) {
          const mongoPlace: MongoPlace = mongoPlaceDocument.toObject();
          let place: PlaceWithGooglePlace = placeDocument.toObject();
          place._idPlace = (placeDocument._id as ObjectId).toString();
          place.address_components = mongoPlace.address_components;
          place.formatted_address = mongoPlace.formatted_address;
          place.geometry = convertMongoGeometryToGoogleGeometry(mongoPlace.geometry!);
          place.name = mongoPlace.name;
          place.opening_hours = mongoPlace.opening_hours;
          place.price_level = mongoPlace.price_level;
          place.rating = mongoPlace.rating;
          place.user_ratings_total = mongoPlace.user_ratings_total;
          place.utc_offset_minutes = mongoPlace.utc_offset_minutes;
          place.vicinity = mongoPlace.vicinity;
          place.website = mongoPlace.website;

          places.push(place);
        }
      }
    }
    return places;
  } catch (error) {
    console.error('Error fetching places:', error);
    throw new Error('An error occurred while fetching places.');
  }
};

export const submitPlaceHandler = async (
  req: Request<{}, {}, Place>,
  res: Response
): Promise<any> => {
  const body: Place = req.body;
  try {
    const place = await submitPlace(body);
    return res.status(201).json({ message: 'Place saved successfully!', place });
  } catch (error) {
    console.error('Error saving place:', error);
    return res.status(500).json({ error: 'An error occurred while saving the place.' });
  }
};

const submitPlace = async (placeRequestBody: SubmitPlaceRequestBody): Promise<IPlace | null> => {

  const { _idPlace, placeId, visited, placeType, googlePlaceId, placeComments, address_components, formatted_address, geometry, name, opening_hours, price_level, rating, vicinity, openForBreakfast, openForLunch, openForDinner, restaurantType, user_ratings_total, utc_offset_minutes, website } = placeRequestBody;

  const googlePlace: GooglePlace = {
    googlePlaceId: googlePlaceId!,
    placeType,
    name: name!,
    address_components,
    formatted_address: formatted_address!,
    website: website!,
    opening_hours,
    price_level,
    rating,
    user_ratings_total,
    utc_offset_minutes,
    vicinity,
    geometry,
  }

  let mongoPlace: IMongoPlace | null = await getMongoPlace(googlePlaceId);
  if (!mongoPlace) {
    mongoPlace = await addMongoPlace(googlePlace);
    if (!mongoPlace) {
      throw new Error('Error saving place.');
    }
  }

  const addPlaceEntity: Place = {
    _idPlace,
    placeId,
    visited,
    placeType,
    googlePlaceId: mongoPlace.googlePlaceId,
    placeComments,
    restaurantType,
    openForBreakfast,
    openForLunch,
    openForDinner,
    consensusComments: '',
    perUserComments: [],
    restaurantReviews: [],
  };

  let savedPlace: IPlace | null;

  if (_idPlace) {
    // If _id is provided, update the existing document
    savedPlace = await PlaceModel.findByIdAndUpdate(_idPlace, addPlaceEntity, {
      new: true,    // Return the updated document
      runValidators: true // Ensure the updated data complies with schema validation
    });

    if (!savedPlace) {
      throw new Error('Place not found for update.');
    }
  } else {
    delete addPlaceEntity._idPlace;
    const newPlace: IPlace | null = await addPlaceToDb(addPlaceEntity);
    console.log('newPlace:', newPlace?.toObject());
  }

  return null;
}

export const addPlaceToDb = async (place: Place): Promise<IPlace | null> => {

  const newPlace: IPlace = new PlaceModel(place);

  try {
    const savedPlace: IPlace | null = await newPlace.save();
    return savedPlace;
  } catch (error: any) {
    console.error('Error saving place:', error);
    throw new Error('An error occurred while saving the place.');
  }
}

export const deletePlaceHandler = async (
  req: Request,
  res: Response
): Promise<any> => {

  const body = req.body;
  const placeId = body.placeId;

  try {
    await deletePlace(placeId);
    return res.status(200);
  } catch (error) {
    console.error('Error deleting place:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the place.' });
  }
};

const deletePlace = async (placeId: string) => {
  await PlaceModel.findOneAndDelete({ newRestaurantId: placeId });
}

export const getMongoPlace = async (placeId: any): Promise<IMongoPlace | null> => {
  try {
    const existingPlace: IMongoPlace | null = await MongoPlaceModel.findOne({ googlePlaceId: placeId }).exec();
    return existingPlace;
  } catch (error) {
    throw new Error('An error occurred while retrieving the place.');
  }
}

export const getGooglePlaces = async (request: Request, response: Response, next: any) => {
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

export const addMongoPlace = async (googlePlace: GooglePlace): Promise<IMongoPlace | null> => {
  // Convert Google geometry to MongoDB format
  const mongoGeometry: MongoGeometry = convertGoogleGeometryToMongoGeometry(googlePlace.geometry!);
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


