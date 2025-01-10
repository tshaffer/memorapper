// Review.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { ContributorInputSchema } from './ContributorInput';
import { ContributorInput, MemoRappReview } from '../types/entities';
import { WouldReturn } from '../types';


const poopSchema = new Schema({
  contributorReviewByContributor: {
    type: Map,
    of: new Schema({
      contributorId: String,
      contributorInput: ContributorInputSchema,
    })
  }
});
export const PoopModel = mongoose.model('Poop', poopSchema);
const poop = new PoopModel({
  contributorReviewByContributor: {}
});
const ci1: ContributorInput = { contributorId: '1', rating: 5, comments: 'Great!' };
const ci2: ContributorInput = { contributorId: '2', rating: 3, comments: 'Needs improvement.' };

poop.contributorReviewByContributor!.set('1', { contributorId: '1', contributorInput: ci1 });
poop.contributorReviewByContributor!.set('2', { contributorId: '2', contributorInput: ci2 });
poop.save();



export interface IReview extends Omit<MemoRappReview, '_id'>, Document { }

export type ReviewModel = Model<IReview>;

const ContributorInputByContributorSchema: Schema = new Schema({}, { _id: false });
ContributorInputByContributorSchema.add({
  type: Map,
  of: new Schema({
    contributorId: String, ContributorInputSchema,
  })
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

const TedStructuredReviewPropertiesSchema: Schema = new Schema(
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
    // contributorInputByContributor: ContributorInputByContributorSchema,
  },
);


const tedSchema = new Schema({
  googlePlaceId: { type: String, required: true },
  contributorReviewByContributor: {
    type: Map,
    of: new Schema({
      contributorId: String,
      contributorInput: ContributorInputSchema,
    })
  },
  freeformReviewProperties: FreeformReviewPropertiesSchema,
  tedStructuredReviewProperties: TedStructuredReviewPropertiesSchema
});
export const TedModel = mongoose.model('Ted', tedSchema);
