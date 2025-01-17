import mongoose, { Schema, Document, Model } from 'mongoose';
import { ReviewedRestaurant } from '../types';

export interface IReviewedRestaurant extends Document, ReviewedRestaurant { }

export const ReviewedRestaurantSchema: Schema<IReviewedRestaurant> = new Schema({
  reviewedRestaurantId: { type: String, required: true, unique: true },
  googlePlaceId: { type: String, required: true, ref: 'MongoPlace' },
  diningGroupId: { type: String, required: true, ref: 'DiningGroup' },
  dinerRestaurantReviews: [
    {
      dinerId: { type: String, required: true, ref: 'Diner' },
      dinerRestaurantReviewId: { type: String, required: true, ref: 'DinerRestaurantReviews' }
    }
  ]
});

const ReviewedRestaurantModel: Model<IReviewedRestaurant> = mongoose.model<IReviewedRestaurant>('ReviewedRestaurant', ReviewedRestaurantSchema);

export default ReviewedRestaurantModel;

