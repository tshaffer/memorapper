import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { VisitReview, DinerRestaurantReview, SubmitReviewBody, ReviewedRestaurant } from '../types';
import { IMongoPlace } from '../models';
import { addPlace, getPlace } from './places';
import VisitReviewModel, { IVisitReview } from '../models/VisitReview';
import ReviewedRestaurantModel, { IReviewedRestaurant } from '../models/ReviewedRestaurant';
import DinerRestaurantReviewModel, { IDinerRestaurantReview } from '../models/DinerRetaurantReview';

export const reviewHandler = async (
  req: Request<{}, {}, SubmitReviewBody>,
  res: Response
): Promise<any> => {

  const body: SubmitReviewBody = req.body;
  console.log('Submit review request:', body); // Debugging log

  try {
    await newSubmitReview(body);
    return res.sendStatus(201);
  } catch (error) {
    console.error('Error saving review:', error);
    return res.status(500).json({ error: 'An error occurred while saving the review.' });
  }
}
export const newSubmitReview = async (submitReviewBody: SubmitReviewBody): Promise<void> => {

  const { _id, diningGroupId, place, dinerRestaurantReviews, dateOfVisit, reviewText, itemReviews, sessionId } = submitReviewBody;

  const googlePlaceId = place.googlePlaceId;

  let mongoPlace: IMongoPlace | null = await getPlace(googlePlaceId);
  console.log('place:', place);
  if (!mongoPlace) {
    mongoPlace = await addPlace(place);
    if (!place) {
      throw new Error('Error saving place.');
    }
  }

  const visitReview: VisitReview = {
    diningGroupId,
    googlePlaceId: googlePlaceId,
    dateOfVisit,
    reviewText,
    itemReviews,
  };

  const newVisitReview: IVisitReview | null = await addNewVisitReview(visitReview);
  console.log('newReview:', newVisitReview?.toObject());

  for (const dinerRestaurantReview of dinerRestaurantReviews) {
    const newDinerRestaurantReview: IDinerRestaurantReview | null = await addNewDinerRestaurantReview(dinerRestaurantReview);
    console.log('dinerRestaurantReview:', newDinerRestaurantReview?.toObject());
  }

  const reviewedRestaurant: ReviewedRestaurant = {
    reviewedRestaurantId: uuidv4(),
    diningGroupId: diningGroupId,
    googlePlaceId: googlePlaceId,
    dinerRestaurantReviews
  };

  const newReviewedRestaurant: IReviewedRestaurant | null = await addNewReviewedRestaurant(reviewedRestaurant);
  console.log('newReviewedRestaurant:', newReviewedRestaurant?.toObject());

  // Clear conversation history for the session after submission
  // delete reviewConversations[sessionId];

  return;
}

export const addNewVisitReview = async (visitReview: VisitReview): Promise<IVisitReview | null> => {

  const visitReviewDoc: IVisitReview = new VisitReviewModel(visitReview);

  try {
    const savedReview: IVisitReview = await visitReviewDoc.save();
    return savedReview;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}

export const addNewDinerRestaurantReview = async (dinerRestaurantReview: DinerRestaurantReview): Promise<IDinerRestaurantReview | null> => {

  const dinerRestaurantReviewDoc: IDinerRestaurantReview = new DinerRestaurantReviewModel(dinerRestaurantReview);

  try {
    const savedUserInput: IDinerRestaurantReview = await dinerRestaurantReviewDoc.save();
    return savedUserInput;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}

export const addNewReviewedRestaurant = async (reviewedRestaurant: ReviewedRestaurant): Promise<IReviewedRestaurant | null> => {

  const reviewedRestaurantDoc: IReviewedRestaurant = new ReviewedRestaurantModel(reviewedRestaurant);

  try {
    const savedReviewedRestaurantSummary: IReviewedRestaurant = await reviewedRestaurantDoc.save();
    return savedReviewedRestaurantSummary;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}
