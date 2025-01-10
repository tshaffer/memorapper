import { Request, Response } from 'express';
import Review, { IReview, TedModel } from "../models/Review";
import { MemoRappReview } from "../types";

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

  const teds: any[] = await TedModel.find({}).exec();

  console.log('teds:');
  teds.forEach(element => {
    console.log(element.toObject());
  });
  // const review = new Review({
  //   googlePlaceId: 'ChIJbXQkXe6wj4ARdvBYlDi9YNM',
  //   structuredReviewProperties: {
  //     dateOfVisit: '2025-01-10',
  //     primaryRating: 5,
  //     wouldReturn: 0,
  //     reviewerId: '1',
  //     contributorInputByContributor: new Map([
  //       ['1', { contributorId: '1', rating: 5, comments: 'Great!' }],
  //       ['2', { contributorId: '2', rating: 3, comments: 'Needs improvement.' }],
  //     ]),
  //   },
  //   freeformReviewProperties: {
  //     reviewText: 'Salad was okay',
  //     itemReviews: [{ item: 'Salad', review: 'Okay' }],
  //   },
  // });

  // console.log('review:', review.toObject());

  res.sendStatus(200);
};


export const addReview = async (memoRappReview: MemoRappReview): Promise<IReview | null> => {

  const review = new Review({
    googlePlaceId: 'ChIJbXQkXe6wj4ARdvBYlDi9YNM',
    structuredReviewProperties: {
      dateOfVisit: '2025-01-10',
      primaryRating: 5,
      wouldReturn: 0,
      reviewerId: '1',
      contributorInputByContributor: new Map([
        ['1', { contributorId: '1', rating: 5, comments: 'Great!' }],
        ['2', { contributorId: '2', rating: 3, comments: 'Needs improvement.' }],
      ]),
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