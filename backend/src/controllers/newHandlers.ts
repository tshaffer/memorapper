import { Request, Response } from 'express';
import { Account, AccountPlaceReview, AccountUser, AccountUserInput, UserPlaceSummary } from "../types";
import AccountModel from '../models/Account';
import AccountUserModel from '../models/AccountUser';
import AccountUserInputModel from '../models/AccountUserInput';
import AccountPlaceReviewModel from '../models/AccountPlaceReview';
import UserPlaceSummaryModel from '../models/UserPlaceSummary';

export const getAccounts = async (request: Request, response: Response) => {
  try {
    const accounts: Account[] = await AccountModel.find({}).exec();
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
    const accountUsers: AccountUser[] = await AccountUserModel.find({}).exec();
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
    const accountUserInputs: AccountUserInput[] = await AccountUserInputModel.find({}).exec();
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
    const accountPlaceReviews: AccountPlaceReview[] = await AccountPlaceReviewModel.find({}).exec();
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
    const userPlaceSummaries: UserPlaceSummary[] = await UserPlaceSummaryModel.find({}).exec();
    response.status(200).json({ userPlaceSummaries });
    return;
  } catch (error) {
    console.error('Error retrieving userPlaceSummaries:', error);
    response.status(500).json({ error: 'An error occurred while retrieving userPlaceSummaries.' });
    return;
  }
}

