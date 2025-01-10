import mongoose, { Schema, Document, Model } from 'mongoose';
import { ContributorInputSchema } from './ContributorInput'; // Import ContributorInputSchema
import { MemoRappReview } from '../types/entities';
import { WouldReturn } from '../types';

export interface IReview extends Omit<MemoRappReview, "_id">, Document {}

export type ReviewModel = Model<IReview>;

const ContributorInputByContributorSchema: Schema = new Schema(
  {
    // Dynamic object structure where keys are `contributorId` (string)
  },
  { _id: false } // Prevent creating an additional `_id` for this nested schema
);

ContributorInputByContributorSchema.add({
  // The schema doesn't natively support dynamic keys directly; mongoose uses `Map`.
  type: Map,
  of: ContributorInputSchema, // Values follow the ContributorInputSchema
});

const StructuredReviewPropertiesSchema: Schema = new Schema({
  dateOfVisit: { type: String, required: true },
  primaryRating: { type: Number, required: true },
  secondaryRating: { type: Number },
  wouldReturn: {
    type: Number,
    enum: [0, 1, 2, 3], // Explicitly define numeric values
    default: WouldReturn.Undefined,
  },
  reviewerId: { type: String, required: true },
  contributorInputByContributor: ContributorInputByContributorSchema,
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
  googlePlaceId: { type: String, required: true},
  structuredReviewProperties: StructuredReviewPropertiesSchema,
  freeformReviewProperties: FreeformReviewPropertiesSchema
});

const Review: ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;


// Define the ContributorInputByContributorSchema
// Allow arbitrary string keys with `ContributorInput` as the value
ContributorInputByContributorSchema.add({
  // The schema doesn't natively support dynamic keys directly; mongoose uses `Map`.
  type: Map,
  of: ContributorInputSchema, // Values follow the ContributorInputSchema
});
