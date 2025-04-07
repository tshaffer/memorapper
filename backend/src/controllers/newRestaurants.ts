import { Request, Response } from 'express';
import MongoPlaceModel, { IMongoPlace } from "../models/MongoPlace";
import { NewRestaurant, SubmitNewRestaurantRequestBody } from "../types";
import { addMongoPlace, getMongoPlace } from "./dbPlaces";
import { convertMongoPlaceToGooglePlace } from '../utilities';
import NewRestaurantModel, { INewRestaurant } from '../models/NewRestaurant';

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

  let mongoPlace: IMongoPlace | null = await getMongoPlace(googlePlaceId);
  if (!mongoPlace) {
    mongoPlace = await addMongoPlace(googlePlace);
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

export const deleteRestaurantHandler = async (
  req: Request,
  res: Response
): Promise<any> => {

  const body = req.body;
  const newRestaurantId = body.newRestaurantId;

  try {
    const newReview = await deleteNewRestaurant(newRestaurantId);
    return res.status(200);
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the restaurant.' });
  }
};

const deleteNewRestaurant = async (newRestaurantId: string) => {

  /*
  let mongoPlace: IMongoPlace | null = await getPlace(googlePlaceId);
  if (!mongoPlace) {
    mongoPlace = await addPlace(googlePlace);
    if (!mongoPlace) {
      throw new Error('Error saving place.');
    }
  }
*/

  await NewRestaurantModel.findOneAndDelete({ newRestaurantId: newRestaurantId });
}

