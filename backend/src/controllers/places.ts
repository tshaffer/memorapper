import { Request, Response } from 'express';
import MongoPlaceModel, { IMongoPlace } from "../models/MongoPlace";
import { GooglePlace, MongoPlace, MrDeleteReviewRequestBody, MrItemOrdered, MrPlace, MrPlaceWithGooglePlace, MrReviewData, MrSubmitPlaceRequestBody } from "../types";
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

  const { _id, placeType, interestLevel, placePreview, placeReview, placeRating, googlePlace, restaurantSpecs } = placeRequestBody;

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
    interestLevel: interestLevel || 0,
    placePreview: placePreview || '',
    placeRating: placeRating || 0,
    placeReview: placeReview || '',
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
  const { _id, placeType, interestLevel, placePreview, placeReview, placeRating, googlePlace, restaurantSpecs, restaurantReviews } = placeRequestBody;

  if (!_id) {
    throw new Error('_id is required for updating.');
  }

  const filter = { _id };

  const updateData: Partial<MrPlace> = {
    _id: _id || '',
    googlePlaceId: googlePlace?.googlePlaceId || '',
    placeType: placeType!,
    interestLevel: interestLevel || 0,
    placePreview: placePreview || '',
    placeReview: placeReview || '',
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

export const deletePlaceHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  const body = req.body;
  const placeId = body.placeId;

  try {
    await deletePlace(placeId);
    return res.status(200).json({ message: 'Place deleted successfully.' }); // ✅ ends the response
  } catch (error) {
    console.error('Error deleting place:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the place.' });
  }
};

const deletePlace = async (placeId: string) => {
  await MrPlaceModel.findOneAndDelete({ _id: placeId });
}

export const addReviewHandler = async (
  req: Request<{}, {}, MrReviewData>,
  res: Response
): Promise<any> => {

  const reviewData: MrReviewData = req.body;
  const { place, dateOfVisit, itemReviews } = reviewData;

  try {
    const updatedPlace = await addReviewToDb(place!, dateOfVisit, itemReviews);
    return res.status(200).json({ message: 'Review added successfully!', place: updatedPlace });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ error: 'An error occurred while adding the review.' });
  }
}

const addReviewToDb = async (
  place: MrPlace,
  // placeId: string,
  dateOfVisit: string,
  itemReviews: MrItemOrdered[]
): Promise<void> => {
  try {
    // is this necessary or was the place already fetched in the handler?
    const existingPlace = await MrPlaceModel.findOne({ _id: place._id }).exec();

    if (!existingPlace) {
      throw new Error(`Place with _id ${place._id} not found`);
    }

    existingPlace.restaurantReviews.push({
      dateOfVisit: new Date(dateOfVisit),
      itemReviews,
    });

    existingPlace.placeType = place.placeType!;
    existingPlace.interestLevel = place.interestLevel || 0;
    existingPlace.placePreview = place.placePreview || '';
    existingPlace.placeReview = place.placeReview || '';
    existingPlace.placeRating = place.placeRating || 0;
    existingPlace.restaurantSpecs.restaurantType = place.restaurantSpecs?.restaurantType!;
    existingPlace.restaurantSpecs.openForBreakfast = place.restaurantSpecs?.openForBreakfast || false;
    existingPlace.restaurantSpecs.openForLunch = place.restaurantSpecs?.openForLunch || false;
    existingPlace.restaurantSpecs.openForDinner = place.restaurantSpecs?.openForDinner || false;

    await existingPlace.save();
    console.log(`Review added to place ${place._id}`);
  } catch (error) {
    console.error(`Error adding review to place ${place._id}:`, error);
    throw error;
  }
};

export const updateReviewHandler = async (
  req: Request<{}, {}, MrReviewData>,
  res: Response
): Promise<any> => {
  const reviewData: MrReviewData = req.body;
  const { _id: reviewId, place, dateOfVisit, itemReviews } = reviewData;

  if (!place || !place._id || !reviewId) {
    return res.status(400).json({ error: 'Missing place ID or review ID.' });
  }

  try {
    const updatedPlace = await updateReviewInDb(place._id, reviewId, dateOfVisit, itemReviews);

    return res.status(200).json({ message: 'Review updated successfully!', place: updatedPlace });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ error: 'An error occurred while updating the review.' });
  }
};

const updateReviewInDb = async (
  placeId: string,
  reviewId: string,
  dateOfVisit: string,
  itemReviews: MrItemOrdered[]
): Promise<IMrPlace> => {
  const existingPlace = await MrPlaceModel.findById(placeId).exec();

  if (!existingPlace) {
    throw new Error(`Place with _id ${placeId} not found`);
  }

  const review = existingPlace.restaurantReviews.find(r => String(r._id) === String(reviewId));
  if (!review) {
    throw new Error(`Review with _id ${reviewId} not found in place ${placeId}`);
  }

  review.dateOfVisit = new Date(dateOfVisit);
  review.itemReviews = itemReviews;

  await existingPlace.save();
  return existingPlace.toObject() as IMrPlace; // ✅ return plain object typed correctly
};

export const deleteReviewHandler = async (
  req: Request<{}, {}, MrDeleteReviewRequestBody>,
  res: Response
): Promise<any> => {
  const { placeId, reviewId } = req.body;

  if (!placeId || !reviewId) {
    return res.status(400).json({ error: 'Missing place ID or review ID.' });
  }

  try {
    const updatedPlace = await deleteReviewFromDb(placeId, reviewId);
    return res.status(200).json({ message: 'Review deleted successfully!', place: updatedPlace });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the review.' });
  }
};

export const deleteReviewFromDb = async (
  placeId: string,
  reviewId: string
): Promise<IMrPlace> => {
  const existingPlace = await MrPlaceModel.findById(placeId).exec();

  if (!existingPlace) {
    throw new Error(`Place with _id ${placeId} not found`);
  }

  const originalLength = existingPlace.restaurantReviews.length;

  existingPlace.restaurantReviews = existingPlace.restaurantReviews.filter(
    (r) => String(r._id) !== String(reviewId)
  );

  if (existingPlace.restaurantReviews.length === originalLength) {
    throw new Error(`Review with _id ${reviewId} not found in place ${placeId}`);
  }

  await existingPlace.save();
  console.log(`Review ${reviewId} deleted from place ${placeId}`);

  return existingPlace.toObject() as IMrPlace;
};
