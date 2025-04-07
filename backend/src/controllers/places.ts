import { Request, Response } from 'express';
import MongoPlaceModel, { IMongoPlace } from "../models/MongoPlace";
import { GooglePlace, MongoPlace, Place, SubmitPlaceRequestBody } from "../types";
import PlaceModel, { IPlace } from '../models/Place';
import { getMongoPlace, addMongoPlace } from './dbPlaces';
import { convertMongoGeometryToGoogleGeometry } from '../utilities';

export const getPlaces = async (
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
          place.address_components = mongoPlace.address_components;
          place.formatted_address = mongoPlace.formatted_address;
          place.geometry = convertMongoGeometryToGoogleGeometry(mongoPlace.geometry!);
          place.name = mongoPlace.name;
          place.opening_hours = mongoPlace.opening_hours;
          place.price_level = mongoPlace.price_level;
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

  const { _idPlace, placeId, placeType: placeType, googlePlaceId } = placeRequestBody;

  const googlePlace: GooglePlace = {
    googlePlaceId: googlePlaceId!,
    placeType: placeType,
    name: placeRequestBody.name!,
    address_components: placeRequestBody.address_components,
    formatted_address: placeRequestBody.formatted_address!,
    website: placeRequestBody.website!,
    opening_hours: placeRequestBody.opening_hours,
    price_level: placeRequestBody.price_level,
    vicinity: placeRequestBody.vicinity,
    geometry: placeRequestBody.geometry
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
    placeType,
    placeId,
    googlePlaceId: mongoPlace.googlePlaceId,
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

