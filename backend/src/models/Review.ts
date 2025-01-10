// Review.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import ContributorInput, { ContributorInputSchema } from './ContributorInput';
import { MemoRappReview } from '../types/entities';
import { WouldReturn } from '../types';



const tedSchema = new Schema({
  socialMediaHandles: {
    type: Map,
    of: String
  }
});
export const TedModel = mongoose.model('Ted', tedSchema);
const ted = new TedModel({
  socialMediaHandles: {}
});
ted.socialMediaHandles!.set('github', 'vkarpov15');
ted.set('socialMediaHandles.twitter', '@code_barbarian');
ted.save();

const poopSchema = new Schema({
  contributorReviewByContributor: {
    type: Map,
    of: String
  }
});
export const PoopModel = mongoose.model('Poop', poopSchema);
const poop = new PoopModel({
  contributorReviewByContributor: {}
});
poop.contributorReviewByContributor!.set('github', 'vkarpov15');
poop.set('contributorReviewByContributor.twitter', '@code_barbarian');
poop.save();



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
