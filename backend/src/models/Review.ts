import mongoose, { Schema, Document, Model } from 'mongoose';
import { MemoRappReview } from '../types/entities';
import { WouldReturn } from '../types';

export interface IReview extends Omit<MemoRappReview, "_id">, Document {}

export type ReviewModel = Model<IReview>;

const StructuredReviewPropertiesSchema: Schema = new Schema({
  dateOfVisit: { type: String, required: true },
  wouldReturn: {
    type: Number,
    enum: [0, 1, 2, 3], // Explicitly define numeric values
    default: WouldReturn.Undefined,
  },
  reviewerId: { type: String, required: true }
});

const ItemReviewSchema: Schema = new Schema({
  item: { type: String, required: true },
  review: { type: String, required: true }
});

const FreeformReviewPropertiesSchema: Schema = new Schema({
  reviewText: { type: String, required: true },
  itemReviews: [ItemReviewSchema],
});

const ReviewSchema: Schema = new Schema({
  place_id: { type: String, required: true},
  structuredReviewProperties: StructuredReviewPropertiesSchema,
  freeformReviewProperties: FreeformReviewPropertiesSchema
});

const Review: ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
