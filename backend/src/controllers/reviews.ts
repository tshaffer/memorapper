import { Request, Response } from 'express';
import Review, { IReview, TedModel, } from "../models/Review";
import { ContributorInput, MemoRappReview } from "../types";

export const getReviews = async (request: Request, response: Response, next: any) => {
  try {
    const reviews: IReview[] = await Review.find({}).exec();
    const memoRappReviews: MemoRappReview[] = reviews.map((review) => {
      const memoRappReview: MemoRappReview = review.toObject();
      return memoRappReview;
    });
    response.status(200).json({ memoRappReviews });
    return;
  }
  catch (error) {
    console.error('Error retrieving reviews:', error);
    response.status(500).json({ error: 'An error occurred while retrieving the reviews.' });
    return;
  }
}

export const addReview = async (memoRappReview: MemoRappReview): Promise<IReview | null> => {

  const review: IReview = new Review(memoRappReview);

  try {
    const savedReview: IReview = await review.save();
    return savedReview;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}
