import mongoose, { Schema, Document, Model } from 'mongoose';
import { MemoRappReview } from '../types/entities';
import { WouldReturn } from '../types';

export interface IReview extends Omit<MemoRappReview, "_id">, Document {}

export type ReviewModel = Model<IReview>;

const StructuredReviewPropertiesSchema: Schema = new Schema({
  dateOfVisit: { type: String, required: true },
  wouldReturn: {
    type: String,
    enum: Object.values(WouldReturn), // Ensures values are restricted to the enum
    default: WouldReturn.Undefined,
  },
});

const ItemReviewSchema: Schema = new Schema({
  item: { type: String, required: true },
  review: { type: String, required: true }
});

const FreeformReviewPropertiesSchema: Schema = new Schema({
  reviewText: { type: String, required: true },
  itemReviews: [ItemReviewSchema],
  reviewerId: { type: String, required: true }
});

const ReviewSchema: Schema = new Schema({
  place_id: { type: String, required: true},
  structuredReviewProperties: StructuredReviewPropertiesSchema,
  freeformReviewProperties: FreeformReviewPropertiesSchema
});

const Review: ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
