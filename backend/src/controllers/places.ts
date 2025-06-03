import { Request, Response } from 'express';
import MongoPlaceModel, { IMongoPlace } from "../models/MongoPlace";
import { GooglePlace, MongoPlace, MrItemOrdered, MrPlace, MrSubmitAddReviewRequestBody, MrSubmitPlaceRequestBody } from "../types";
import { MongoGeometry } from "../types";
import { convertGoogleGeometryToMongoGeometry, convertMongoPlacesToGooglePlaces } from '../utilities';
import MrPlaceModel, { IMrPlace } from '../models/MrPlace';

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

export const getMrPlacesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
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
    return res.status(200).json({ places: mrPlaces });
  } catch (error) {
    console.error('Error fetching places:', error);
    return res.status(500).json({ error: 'An error occurred while fetching places.' });
  }
};

export const upsertMrPlaceHandler = async (
  req: Request<{}, {}, MrSubmitPlaceRequestBody>,
  res: Response
): Promise<any> => {
}

export const submitMrPlaceHandler = async (
  req: Request<{}, {}, MrSubmitPlaceRequestBody>,
  res: Response
): Promise<any> => {
  const body: MrSubmitPlaceRequestBody = req.body;
  try {
    const place = await submitMrPlace(body);
    return res.status(201).json({ message: 'MrPlace saved successfully!', place });
  } catch (error) {
    console.error('Error saving place:', error);
    return res.status(500).json({ error: 'An error occurred while saving the place.' });
  }
};

const submitMrPlace = async (placeRequestBody: MrSubmitPlaceRequestBody): Promise<IMrPlace | null> => {

  const { placeId, placeType, placeComments, googlePlace, restaurantSpecs } = placeRequestBody

  let mongoPlace: IMongoPlace | null = await getMongoPlace(googlePlace!.googlePlaceId);
  if (!mongoPlace) {
    mongoPlace = await addMongoPlace(googlePlace!);
    if (!mongoPlace) {
      throw new Error('Error saving place.');
    }
  }

  const addPlaceEntity: MrPlace = {
    placeId,
    googlePlaceId: googlePlace!.googlePlaceId,
    placeType: placeType!,
    placeComments: placeComments || '',
    restaurantReviews: [], // Initialize with an empty array or handle as needed
    restaurantSpecs: restaurantSpecs!,
  };

  let savedPlace: IMrPlace | null;

  // if (_idPlace) {
  //   // If _id is provided, update the existing document
  //   savedPlace = await MrPlaceModel.findByIdAndUpdate(_idPlace, addPlaceEntity, {
  //     new: true,    // Return the updated document
  //     runValidators: true // Ensure the updated data complies with schema validation
  //   });

  //   if (!savedPlace) {
  //     throw new Error('Place not found for update.');
  //   }
  // } else {
  //   delete addPlaceEntity._idPlace;
  //   const newPlace: IMrPlace | null = await addMrPlaceToDb(addPlaceEntity);
  //   console.log('newPlace:', newPlace?.toObject());
  // }

  return null;
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

export const updateMrPlaceHandler = async (
  req: Request<{}, {}, MrSubmitPlaceRequestBody>,
  res: Response
): Promise<any> => {
  const body: MrSubmitPlaceRequestBody = req.body;

  try {
    const updatedPlace = await updateMrPlace(body);
    return res.status(200).json({ message: 'MrPlace updated successfully!', place: updatedPlace });
  } catch (error) {
    console.error('Error updating place:', error);
    return res.status(500).json({ error: 'An error occurred while updating the place.' });
  }
};

const updateMrPlace = async (placeRequestBody: MrSubmitPlaceRequestBody): Promise<IMrPlace | null> => {
  const { placeId, placeType, placeComments, googlePlace, restaurantSpecs, restaurantReviews, placeRating } = placeRequestBody;

  if (!placeId) {
    throw new Error('placeId is required for updating.');
  }

  const filter = { placeId };

  const updateData: Partial<MrPlace> = {
    placeId: placeId || '',
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
  const { placeId, dateOfVisit, itemReviews } = body;

  try {
    const updatedPlace = await addReviewToDb(placeId, dateOfVisit, itemReviews);
    return res.status(200).json({ message: 'Review added successfully!', place: updatedPlace });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ error: 'An error occurred while adding the review.' });
  }
}

const addReviewToDb = async (
  placeId: string,
  dateOfVisit: string,
  itemReviews: MrItemOrdered[]
): Promise<void> => {
  try {
    const place = await MrPlaceModel.findOne({ placeId });

    if (!place) {
      throw new Error(`Place with placeId ${placeId} not found`);
    }

    place.restaurantReviews.push({
      dateOfVisit: new Date(dateOfVisit),
      itemReviews,
    });

    await place.save();
    console.log(`Review added to place ${placeId}`);
  } catch (error) {
    console.error(`Error adding review to place ${placeId}:`, error);
    throw error;
  }
};
