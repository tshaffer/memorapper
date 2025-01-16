import { Request, Response } from 'express';
import { DiningGroup, VisitReview, Diner, DinerRestaurantReview, RestaurantReview } from "../types";
import DiningGroupModel from '../models/DiningGroup';
import DinerModel from '../models/Diner';
import DinerRestaurantReviewModel from '../models/DinerRetaurantReview';
import VisitReviewModel from '../models/VisitReview';
import UserPlaceSummaryModel from '../models/RestaurantReview';

export const getAccounts = async (request: Request, response: Response) => {
  try {
    const accounts: DiningGroup[] = await DiningGroupModel.find({}).exec();
    response.status(200).json({ accounts });
    return;
  } catch (error) {
    console.error('Error retrieving accounts:', error);
    response.status(500).json({ error: 'An error occurred while retrieving accounts.' });
    return;
  }
}

export const getAccountUsers = async (request: Request, response: Response) => {
  try {
    const accountUsers: Diner[] = await DinerModel.find({}).exec();
    response.status(200).json({ accountUsers });
    return;
  } catch (error) {
    console.error('Error retrieving account users:', error);
    response.status(500).json({ error: 'An error occurred while retrieving account users.' });
    return;
  }
}

export const getAccountUserInputs = async (request: Request, response: Response) => {
  try {
    const accountUserInputs: DinerRestaurantReview[] = await DinerRestaurantReviewModel.find({}).exec();
    response.status(200).json({ accountUserInputs });
    return;
  } catch (error) {
    console.error('Error retrieving account user inputs:', error);
    response.status(500).json({ error: 'An error occurred while retrieving account user inputs.' });
    return;
  }
}

export const getAccountPlaceReviews = async (request: Request, response: Response) => {
  try {
    const accountPlaceReviews: VisitReview[] = await VisitReviewModel.find({}).exec();
    response.status(200).json({ accountPlaceReviews });
    return;
  } catch (error) {
    console.error('Error retrieving accountPlaceReviews:', error);
    response.status(500).json({ error: 'An error occurred while retrieving accountPlaceReviews.' });
    return;
  }
}

export const getUserPlaceSummaries = async (request: Request, response: Response) => {
  try {
    const userPlaceSummaries: RestaurantReview[] = await UserPlaceSummaryModel.find({}).exec();
    response.status(200).json({ userPlaceSummaries });
    return;
  } catch (error) {
    console.error('Error retrieving userPlaceSummaries:', error);
    response.status(500).json({ error: 'An error occurred while retrieving userPlaceSummaries.' });
    return;
  }
}

