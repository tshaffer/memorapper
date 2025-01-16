import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { VisitReview, DinerRestaurantReview, SubmitReviewBody, RestaurantReview } from '../types';
import { IMongoPlace } from '../models';
import { addPlace, getPlace } from './places';
import VisitReviewModel, { IVisitReview } from '../models/VisitReview';
import UserPlaceSummaryModel, { IRestaurantReview } from '../models/RestaurantReview';
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

  const { _id, accountId, place, accountUserInputs, dateOfVisit, reviewText, itemReviews, sessionId } = submitReviewBody;

  const googlePlaceId = place.googlePlaceId;

  let mongoPlace: IMongoPlace | null = await getPlace(googlePlaceId);
  console.log('place:', place);
  if (!mongoPlace) {
    mongoPlace = await addPlace(place);
    if (!place) {
      throw new Error('Error saving place.');
    }
  }

  const accountPlaceReview: VisitReview = {
    diningGroupId: accountId,
    placeId: googlePlaceId,
    dateOfVisit,
    reviewText,
    itemReviews,
  };

  const newAccountPlaceReview: IVisitReview | null = await addNewAccountPlaceReview(accountPlaceReview);
  console.log('newReview:', newAccountPlaceReview?.toObject());

  for (const accountUserInput of accountUserInputs) {
    const newAccountUserInput: IDinerRestaurantReview | null = await addNewAccountUserInput(accountUserInput);
    console.log('newAccountUserInput:', newAccountUserInput?.toObject());
  }

  const userPlaceSummary: RestaurantReview = {
    restaurantReviewId: uuidv4(),
    diningGroupId: accountId,
    placeId: googlePlaceId,
    dinerRestaurantReviews: accountUserInputs
  };

  const newUserPlaceSummary: IRestaurantReview | null = await addNewUserPlaceSummary(userPlaceSummary);
  console.log('newUserPlaceSummary:', newUserPlaceSummary?.toObject());

  // Clear conversation history for the session after submission
  // delete reviewConversations[sessionId];

  return;
}

export const addNewAccountPlaceReview = async (accountPlaceReview: VisitReview): Promise<IVisitReview | null> => {

  const accountPlaceReviewDoc: IVisitReview = new VisitReviewModel(accountPlaceReview);

  try {
    const savedReview: IVisitReview = await accountPlaceReviewDoc.save();
    return savedReview;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}

export const addNewAccountUserInput = async (accountUserInput: DinerRestaurantReview): Promise<IDinerRestaurantReview | null> => {

  const accountUserInputDoc: IDinerRestaurantReview = new DinerRestaurantReviewModel(accountUserInput);

  try {
    const savedUserInput: IDinerRestaurantReview = await accountUserInputDoc.save();
    return savedUserInput;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}

export const addNewUserPlaceSummary = async (userPlaceSummary: RestaurantReview): Promise<IRestaurantReview | null> => {

  const userPlaceSummaryDoc: IRestaurantReview = new UserPlaceSummaryModel(userPlaceSummary);

  try {
    const savedUserPlaceSummnary: IRestaurantReview = await userPlaceSummaryDoc.save();
    return savedUserPlaceSummnary;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}
