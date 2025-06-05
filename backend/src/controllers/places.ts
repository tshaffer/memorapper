import { Request, Response } from 'express';
import MongoPlaceModel, { IMongoPlace } from "../models/MongoPlace";
import { GooglePlace, MongoPlace, MrItemOrdered, MrPlace, MrPlaceWithGooglePlace, MrSubmitAddReviewRequestBody, MrSubmitPlaceRequestBody } from "../types";
import { MongoGeometry } from "../types";
import { convertGoogleGeometryToMongoGeometry, convertMongoGeometryToGoogleGeometry, convertMongoPlacesToGooglePlaces } from '../utilities';
import MrPlaceModel, { IMrPlace } from '../models/MrPlace';

export const getMongoPlace = async (googlePlaceId: any): Promise<IMongoPlace | null> => {
  try {
    const existingPlace: IMongoPlace | null = await MongoPlaceModel.findOne({ googlePlaceId: googlePlaceId }).exec();
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

export const getMrPlacesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const mrPlaces: MrPlace[] = await getMrPlaces();
    return res.status(200).json({ places: mrPlaces });
  } catch (error) {
    console.error('Error fetching places:', error);
    return res.status(500).json({ error: 'An error occurred while fetching places.' });
  }
};

export const getMrPlaces = async (): Promise<MrPlace[]> => {
  try {
    const mongoPlaceDocuments: IMongoPlace[] = await MongoPlaceModel.find({}).exec();
    const mrPlacesDocuments: IMrPlace[] = await MrPlaceModel.find({}).exec();

    const mrPlaces: MrPlace[] = [];

    for (const placeDocument of mrPlacesDocuments) {
      const placeGooglePlaceId = placeDocument.googlePlaceId;
      for (const mongoPlaceDocument of mongoPlaceDocuments) {
        if (mongoPlaceDocument.googlePlaceId === placeGooglePlaceId) {
          const place: MrPlace = placeDocument.toObject();
          mrPlaces.push(place);
        }
      }
    }
    return mrPlaces;
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
}

export const getMrPlacesWithGooglePlace = async (): Promise<MrPlaceWithGooglePlace[]> => {
  try {
    const mongoPlaceDocuments: IMongoPlace[] = await MongoPlaceModel.find({}).exec();
    const placesDocuments: IMrPlace[] = await MrPlaceModel.find({}).exec();

    const places: MrPlaceWithGooglePlace[] = [];

    for (const placeDocument of placesDocuments) {
      const placeGooglePlaceId = placeDocument.googlePlaceId;
      for (const mongoPlaceDocument of mongoPlaceDocuments) {
        if (mongoPlaceDocument.googlePlaceId === placeGooglePlaceId) {
          const mongoPlace: MongoPlace = mongoPlaceDocument.toObject();
          let place: MrPlaceWithGooglePlace = placeDocument.toObject();
          place.googlePlace = {
            googlePlaceId: placeGooglePlaceId,
            address_components: mongoPlace.address_components,
            formatted_address: mongoPlace.formatted_address,
            geometry: convertMongoGeometryToGoogleGeometry(mongoPlace.geometry!),
            name: mongoPlace.name,
            opening_hours: mongoPlace.opening_hours,
            price_level: mongoPlace.price_level,
            rating: mongoPlace.rating,
            user_ratings_total: mongoPlace.user_ratings_total,
            utc_offset_minutes: mongoPlace.utc_offset_minutes,
            vicinity: mongoPlace.vicinity,
            website: mongoPlace.website,
          };

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


export const upsertMrPlaceHandler = async (
  req: Request<{}, {}, MrSubmitPlaceRequestBody>,
  res: Response
): Promise<any> => {

  // return submitMrPlaceHandler(req, res);
  const body: MrSubmitPlaceRequestBody = req.body;
  const { _id } = body;

  console.log('submitMrPlace _id:', _id);

  if (_id) {
    const place = await MrPlaceModel.findOne({ _id }).exec();
    if (!place) {
      console.error(`Place with _id ${_id} not found`);
      return res.status(500).json({ error: `An error occurred upsertMrPlaceHandler, Place with _id ${_id} not found.` });
    }
    const mrPlace: IMrPlace | null = await updateMrPlace(body);
    return res.status(200).json({ place: mrPlace });
  } else {
    const mrPlace: IMrPlace | null = await addMrPlace(body);
    return res.status(200).json({ place: mrPlace });
  }
}

const addMrPlace = async (placeRequestBody: MrSubmitPlaceRequestBody): Promise<IMrPlace | null> => {

  const { _id, placeType, placeComments, placeRating, googlePlace, restaurantSpecs } = placeRequestBody;

  let mongoPlace: IMongoPlace | null = await getMongoPlace(googlePlace!.googlePlaceId);
  if (!mongoPlace) {
    mongoPlace = await addMongoPlace(googlePlace!);
    if (!mongoPlace) {
      throw new Error('Error saving place.');
    }
  } else {
    throw new Error('Mongo place already exists:' + mongoPlace.googlePlaceId);
  }

  const addPlaceEntity: MrPlace = {
    _id,
    googlePlaceId: googlePlace!.googlePlaceId,
    placeType: placeType!,
    placeComments: placeComments || '',
    placeRating: placeRating || 0,
    restaurantReviews: [], // Initialize with an empty array or handle as needed
    restaurantSpecs: restaurantSpecs!,
  };

  const newPlace: IMrPlace | null = await addMrPlaceToDb(addPlaceEntity);
  console.log('newPlace:', newPlace?.toObject());

  return newPlace;
}

const addMrPlaceToDb = async (place: MrPlace): Promise<IMrPlace | null> => {

  const newPlace: IMrPlace = new MrPlaceModel(place);

  try {
    const savedPlace: IMrPlace | null = await newPlace.save();
    return savedPlace;
  } catch (error: any) {
    console.error('Error saving place:', error);
    throw new Error('An error occurred while saving the place.');
  }
}

const updateMrPlace = async (placeRequestBody: MrSubmitPlaceRequestBody): Promise<IMrPlace | null> => {
  const { _id, placeType, placeComments, placeRating, googlePlace, restaurantSpecs, restaurantReviews } = placeRequestBody;

  if (!_id) {
    throw new Error('_id is required for updating.');
  }

  const filter = { _id };

  const updateData: Partial<MrPlace> = {
    _id: _id || '',
    googlePlaceId: googlePlace?.googlePlaceId || '',
    placeType: placeType!,
    placeComments: placeComments || '',
    placeRating: placeRating || 0,
    restaurantSpecs: restaurantSpecs || {},
    restaurantReviews: restaurantReviews || [],
  };

  const updatedPlace = await MrPlaceModel.findOneAndUpdate(filter, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedPlace) {
    throw new Error(`MrPlace not found for update using filter: ${JSON.stringify(filter)}`);
  }

  return updatedPlace;
};

export const addReviewHandler = async (
  req: Request<{}, {}, MrSubmitAddReviewRequestBody>,
  res: Response
): Promise<any> => {

  const body: MrSubmitAddReviewRequestBody = req.body;
  const { _id, dateOfVisit, itemReviews } = body;

  try {
    const updatedPlace = await addReviewToDb(_id, dateOfVisit, itemReviews);
    return res.status(200).json({ message: 'Review added successfully!', place: updatedPlace });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ error: 'An error occurred while adding the review.' });
  }
}

const addReviewToDb = async (
  _id: string,
  dateOfVisit: string,
  itemReviews: MrItemOrdered[]
): Promise<void> => {
  try {
    const place = await MrPlaceModel.findOne({ _id });

    if (!place) {
      throw new Error(`Place with _id ${_id} not found`);
    }

    place.restaurantReviews.push({
      dateOfVisit: new Date(dateOfVisit),
      itemReviews,
    });

    await place.save();
    console.log(`Review added to place ${_id}`);
  } catch (error) {
    console.error(`Error adding review to place ${_id}:`, error);
    throw error;
  }
};
