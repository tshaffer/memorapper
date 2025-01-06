import { Request, Response } from 'express';
import { IReview } from "../models/Review";
import { FuturePlaceRequestBody } from '../types';
import { addPlace, getPlace } from './places';
import { IFuturePlace, IMongoPlace } from '../models';
import FuturePlace from '../models/FuturePlace';

export const submitFuturePlaceHandler = async (req: Request, res: Response): Promise<any> => {

  const body: FuturePlaceRequestBody = req.body;

  try {
    const newReview = await submitFuturePlace(body);
    return res.status(201).json({ message: 'Review saved successfully!', review: newReview });
  } catch (error) {
    console.error('Error saving review:', error);
    return res.status(500).json({ error: 'An error occurred while saving the review.' });
  }
};

export const submitFuturePlace = async (futurePlace: FuturePlaceRequestBody): Promise<IReview | null> => {

  const { _id, place, comments, rating } = futurePlace;
  const place_id = place.place_id;

  let mongoPlace: IMongoPlace | null = await getPlace(place_id);
  console.log('place:', place);
  if (!mongoPlace) {
    mongoPlace = await addPlace(place);
    if (!place) {
      throw new Error('Error saving place.');
    }
  }

  const addFuturePlaceBody: FuturePlace = {
    place_id: place.place_id,
    comments,
    rating
  };

  let savedFuturePlace: IFuturePlace | null;

  if (_id) {
    // If _id is provided, update the existing document
    savedFuturePlace = await FuturePlace.findByIdAndUpdate(_id, addFuturePlaceBody, {
      new: true,    // Return the updated document
      runValidators: true // Ensure the updated data complies with schema validation
    });

    if (!savedFuturePlace) {
      throw new Error('Review not found for update.');
    }
  } else {
    const newFuturePlace: IFuturePlace | null = await addFuturePlace(addFuturePlaceBody);
    console.log('newFuturePlace:', newFuturePlace?.toObject());
  }

  return null;
}

export const addFuturePlace = async (futurePlace: FuturePlace): Promise<IFuturePlace | null> => {

  const newFuturePlace: IFuturePlace = new FuturePlace(futurePlace);

  try {
    const savedFuturePlace: IFuturePlace | null = await newFuturePlace.save();
    return savedFuturePlace;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}
