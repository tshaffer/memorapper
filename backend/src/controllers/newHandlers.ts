import { Request, Response } from 'express';
import { DiningGroup, VisitReview, Diner, DinerRestaurantReview, ReviewedRestaurant } from "../types";
import DiningGroupModel from '../models/DiningGroup';
import DinerModel from '../models/Diner';
import DinerRestaurantReviewModel from '../models/DinerRetaurantReview';
import VisitReviewModel from '../models/VisitReview';
import ReviewedRestaurantModel from '../models/ReviewedRestaurant';

export const getDiningGroups = async (request: Request, response: Response) => {
  try {
    const diningGroups: DiningGroup[] = await DiningGroupModel.find({}).exec();
    response.status(200).json({ diningGroups });
    return;
  } catch (error) {
    console.error('Error retrieving diningGroups:', error);
    response.status(500).json({ error: 'An error occurred while retrieving diningGroups.' });
    return;
  }
}

export const getDiners = async (request: Request, response: Response) => {
  try {
    const diners: Diner[] = await DinerModel.find({}).exec();
    response.status(200).json({ diners });
    return;
  } catch (error) {
    console.error('Error retrieving account users:', error);
    response.status(500).json({ error: 'An error occurred while retrieving account users.' });
    return;
  }
}

export const getDinerRestaurantReviews = async (request: Request, response: Response) => {
  try {
    const dinerRestaurantReviews: DinerRestaurantReview[] = await DinerRestaurantReviewModel.find({}).exec();
    response.status(200).json({ dinerRestaurantReviews });
    return;
  } catch (error) {
    console.error('Error retrieving account user inputs:', error);
    response.status(500).json({ error: 'An error occurred while retrieving account user inputs.' });
    return;
  }
}

export const getVisitReviews = async (request: Request, response: Response) => {
  try {
    const visitReviews: VisitReview[] = await VisitReviewModel.find({}).exec();
    response.status(200).json({ visitReviews });
    return;
  } catch (error) {
    console.error('Error retrieving visitReviews:', error);
    response.status(500).json({ error: 'An error occurred while retrieving visitReviews.' });
    return;
  }
}

export const getReviewedRestaurants = async (request: Request, response: Response) => {
  try {
    const reviewedRestaurants: ReviewedRestaurant[] = await ReviewedRestaurantModel.find({}).exec();
    response.status(200).json({ reviewedRestaurants });
    return;
  } catch (error) {
    console.error('Error retrieving reviewedRestaurants:', error);
    response.status(500).json({ error: 'An error occurred while retrieving reviewedRestaurants.' });
    return;
  }
}

