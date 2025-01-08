import mongoose, { Schema, Document, Types } from 'mongoose';
import { ContributorInputSchema, IContributorInput } from './ContributorInput';

export interface IVisitedRestaurant extends Document {
  googlePlaceId: string;
  contributorInput?: Types.Array<IContributorInput>; // Array of inputs per contributor
}

const VisitedRestaurantSchema: Schema<IVisitedRestaurant> = new Schema({
  googlePlaceId: { type: String, required: true },
  contributorInput: { type: [ContributorInputSchema], default: [] }, // Array of ContributorInput
});

const VisitedRestaurantModel = mongoose.model<IVisitedRestaurant>(
  'VisitedRestaurant',
  VisitedRestaurantSchema
);

export default VisitedRestaurantModel;
