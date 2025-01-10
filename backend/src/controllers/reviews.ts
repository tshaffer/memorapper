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

  const ci1: ContributorInput = { contributorId: '1', rating: 5, comments: 'Great!' };
  const ci2: ContributorInput = { contributorId: '2', rating: 3, comments: 'Needs improvement.' };

  const contributorReviewByContributor: Map<string, any> = new Map();
  contributorReviewByContributor.set('1', { contributorId: '1', contributorInput: ci1 });
  contributorReviewByContributor.set('2', { contributorId: '2', contributorInput: ci2 });

  const tedStructuredReviewProperties = {
    dateOfVisit: '2025-01-10',
    primaryRating: 5,
    wouldReturn: 0,
    reviewerId: '1',
  };

  const freeformReviewProperties: any = {
    reviewText: 'Salad was okay',
    itemReviews: [{ item: 'Salad', review: 'Okay' }],
  };

  const ted = new TedModel({
    googlePlaceId: '69',
    contributorReviewByContributor,
    freeformReviewProperties,
    tedStructuredReviewProperties
  });
  console.log('ted:', ted.toObject());
  const c = ted.contributorReviewByContributor!;
  const co1 = (c.get('1')! as any).toObject();
  const co2 = (c.get('2')! as any).toObject();

  // console.log('contributorReviewByContributor:', ted.contributorReviewByContributor!.toObject());

  // const contributorInputByContributor: Map<string, ContributorInput> = new Map();
  // contributorInputByContributor.set('1', ci1);
  // contributorInputByContributor.set('2', ci2);

  // const structuredReviewProperties = {
  //   dateOfVisit: '2025-01-10',
  //   primaryRating: 5,
  //   wouldReturn: 0,
  //   reviewerId: '1',
  //   contributorInputByContributor,
  // };

  // const review = new Review({
  //   googlePlaceId: 'ChIJbXQkXe6wj4ARdvBYlDi9YNM',
  //   structuredReviewProperties,
  //   freeformReviewProperties: {
  //     reviewText: 'Salad was okay',
  //     itemReviews: [{ item: 'Salad', review: 'Okay' }],
  //   },
  // });

  // console.log('review:', review.toObject());

  // const teds: any[] = await TedModel.find({}).exec();

  // console.log('teds:');
  // teds.forEach(element => {
  //   console.log(element.toObject());
  // });
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