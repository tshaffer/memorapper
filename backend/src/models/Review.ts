// Review.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { ContributorInputSchema } from './ContributorInput';
import { MemoRappReview } from '../types/entities';
import { WouldReturn } from '../types';

export interface IReview extends Omit<MemoRappReview, '_id'>, Document {}

export type ReviewModel = Model<IReview>;

const ContributorInputByContributorSchema: Schema = new Schema({}, { _id: false });
ContributorInputByContributorSchema.add({
  type: Map,
  of: ContributorInputSchema,
});

const StructuredReviewPropertiesSchema: Schema = new Schema(
  {
    dateOfVisit: { type: String, required: true },
    primaryRating: { type: Number, required: true },
    secondaryRating: { type: Number },
    wouldReturn: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: WouldReturn.Undefined,
    },
    reviewerId: { type: String, required: true },
    contributorInputByContributor: ContributorInputByContributorSchema,
  },
  {
    toObject: {
      transform: function (doc, ret) {
        if (ret.contributorInputByContributor instanceof Map) {
          ret.contributorInputByContributor = Object.fromEntries(
            ret.contributorInputByContributor.entries()
          );
        }
        return ret;
      },
    },
    toJSON: {
      transform: function (doc, ret) {
        if (ret.contributorInputByContributor instanceof Map) {
          ret.contributorInputByContributor = Object.fromEntries(
            ret.contributorInputByContributor.entries()
          );
        }
        return ret;
      },
    },
  }
);

const ItemReviewSchema: Schema = new Schema({
  item: { type: String, required: true },
  review: { type: String, required: true },
});

const FreeformReviewPropertiesSchema: Schema = new Schema({
  reviewText: { type: String, required: true },
  itemReviews: [ItemReviewSchema],
});

const ReviewSchema: Schema = new Schema({
  googlePlaceId: { type: String, required: true },
  structuredReviewProperties: StructuredReviewPropertiesSchema,
  freeformReviewProperties: FreeformReviewPropertiesSchema,
});

const Review: ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
