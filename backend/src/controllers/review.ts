import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { AccountPlaceReview, AccountUserInput, SubmitReviewBody, UserPlaceSummary } from '../types';
import { IMongoPlace } from '../models';
import { addPlace, getPlace } from './places';
import AccountPlaceReviewModel, { IAccountPlaceReview } from '../models/AccountPlaceReview';
import UserPlaceSummaryModel, { IUserPlaceSummary } from '../models/UserPlaceSummary';
import AccountUserInputModel, { IAccountUserInput } from '../models/AccountUserInput';

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

  const accountPlaceReview: AccountPlaceReview = {
    accountId,
    placeId: googlePlaceId,
    dateOfVisit,
    reviewText,
    itemReviews,
  };

  const newAccountPlaceReview: IAccountPlaceReview | null = await addNewAccountPlaceReview(accountPlaceReview);
  console.log('newReview:', newAccountPlaceReview?.toObject());

  for (const accountUserInput of accountUserInputs) {
    const newAccountUserInput: IAccountUserInput | null = await addNewAccountUserInput(accountUserInput);
    console.log('newAccountUserInput:', newAccountUserInput?.toObject());
  }

  const userPlaceSummary: UserPlaceSummary = {
    userPlaceSummaryId: uuidv4(),
    accountId,
    placeId: googlePlaceId,
    accountUserInputs
  };

  const newUserPlaceSummary: IUserPlaceSummary | null = await addNewUserPlaceSummary(userPlaceSummary);
  console.log('newUserPlaceSummary:', newUserPlaceSummary?.toObject());

  // Clear conversation history for the session after submission
  // delete reviewConversations[sessionId];

  return;
}

export const addNewAccountPlaceReview = async (accountPlaceReview: AccountPlaceReview): Promise<IAccountPlaceReview | null> => {

  const accountPlaceReviewDoc: IAccountPlaceReview = new AccountPlaceReviewModel(accountPlaceReview);

  try {
    const savedReview: IAccountPlaceReview = await accountPlaceReviewDoc.save();
    return savedReview;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}

export const addNewAccountUserInput = async (accountUserInput: AccountUserInput): Promise<IAccountUserInput | null> => {

  const accountUserInputDoc: IAccountUserInput = new AccountUserInputModel(accountUserInput);

  try {
    const savedUserInput: IAccountUserInput = await accountUserInputDoc.save();
    return savedUserInput;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}

export const addNewUserPlaceSummary = async (userPlaceSummary: UserPlaceSummary): Promise<IUserPlaceSummary | null> => {

  const userPlaceSummaryDoc: IUserPlaceSummary = new UserPlaceSummaryModel(userPlaceSummary);

  try {
    const savedUserPlaceSummnary: IUserPlaceSummary = await userPlaceSummaryDoc.save();
    return savedUserPlaceSummnary;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}
