import mongoose, { Schema, Document, Model } from 'mongoose';
import { RestaurantReview } from '../types';

export interface IRestaurantReview extends Document, RestaurantReview { }

export const RestaurantReviewSchema: Schema<IRestaurantReview> = new Schema({
  restaurantReviewId: { type: String, required: true, unique: true },
  diningGroupId: { type: String, required: true, ref: 'DiningGroup' },
  placeId: { type: String, required: true, ref: 'MongoPlace' },
  accountUserInputs: [
    {
      dinerId: { type: String, required: true, ref: 'Diner' },
      dinerRestaurantReviewId: { type: String, required: true, ref: 'DinerRestaurantReview' }
    }
  ]
});

const UserPlaceSummaryModel: Model<IRestaurantReview> = mongoose.model<IRestaurantReview>('RestaurantReview', RestaurantReviewSchema);

export default UserPlaceSummaryModel;

