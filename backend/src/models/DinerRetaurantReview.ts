import mongoose, { Schema, Document, Model } from 'mongoose';
import { DinerRestaurantReview } from '../types';

export interface IDinerRestaurantReview extends Document, DinerRestaurantReview { }

export const DinerRestaurantReviewSchema: Schema<IDinerRestaurantReview> = new Schema({
  dinerRestaurantReviewId: { type: String, required: true, unique: true },
  dinerId: { type: String, required: true, ref: 'Diner' },
  rating: { type: Number, required: true, min: 0, max: 5 },
  comments: { type: String },
});

const DinerRestaurantReviewModel: Model<IDinerRestaurantReview> = mongoose.model<IDinerRestaurantReview>('DinerRestaurantReview', DinerRestaurantReviewSchema);

export default DinerRestaurantReviewModel;

