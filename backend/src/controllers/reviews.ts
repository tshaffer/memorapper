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

export const testAddReviewHandler = async (req: Request, res: Response): Promise<any> => {

  const ci1: ContributorInput = { contributorId: '1', rating: 1, comments: 'Great!' };
  const ci2: ContributorInput = { contributorId: '2', rating: 2, comments: 'Needs improvement.' };

  const contributorInputByContributor: Map<string, any> = new Map();
  contributorInputByContributor.set('3', { contributorId: '1', contributorInput: ci1 });
  contributorInputByContributor.set('4', { contributorId: '2', contributorInput: ci2 });

  const tedStructuredReviewProperties = {
    dateOfVisit: '2025-01-10',
    primaryRating: 5,
    wouldReturn: 0,
    reviewerId: '1',
    contributorInputByContributor,
  };

  const freeformReviewProperties: any = {
    reviewText: 'Salad was okay',
    itemReviews: [{ item: 'Salad', review: 'Okay' }],
  };

  const ted = new TedModel({
    googlePlaceId: '69',
    freeformReviewProperties,
    tedStructuredReviewProperties
  });
  console.log('ted:', ted.toObject());

  const savedReview = await ted.save();
  console.log('savedReview:', savedReview);

  res.sendStatus(200);
};


export const addReview = async (memoRappReview: MemoRappReview): Promise<IReview | null> => {

  const ci1: ContributorInput = { contributorId: '1', rating: 4, comments: 'Great!' };
  const ci2: ContributorInput = { contributorId: '2', rating: 5, comments: 'Needs improvement.' };

  const contributorInputByContributor: Map<string, any> = new Map();
  contributorInputByContributor.set('1', { contributorId: '1', contributorInput: ci1 });
  contributorInputByContributor.set('2', { contributorId: '2', contributorInput: ci2 });


  const review = new Review({
    googlePlaceId: 'ChIJbXQkXe6wj4ARdvBYlDi9YNM',
    structuredReviewProperties: {
      dateOfVisit: '2025-01-10',
      primaryRating: 5,
      wouldReturn: 0,
      reviewerId: '1',
      contributorInputByContributor,
      // contributorInputByContributor: new Map([
      //   ['1', { contributorId: '1', rating: 5, comments: 'Great!' }],
      //   ['2', { contributorId: '2', rating: 3, comments: 'Needs improvement.' }],
      // ]),
    },
    freeformReviewProperties: {
      reviewText: 'Salad was okay',
      itemReviews: [{ item: 'Salad', review: 'Okay' }],
    },
  });

  console.log('review:', review.toObject());

  try {
    const savedReview = await review.save();
    console.log('savedReview:', savedReview);
    return savedReview;
  } catch (error: any) {
    console.error('Error saving review:', error);
    throw new Error('An error occurred while saving the review.');
  }
}

/*
  // const newReview: IReview = new Review(memoRappReview);

  // console.log('memoRappReview:', memoRappReview);
  // console.log('newReview:', newReview);
  // console.log('newReview.toObject():', newReview.toObject());

  // try {
  //   const savedReview: IReview | null = await newReview.save();
  //   return savedReview;
*/