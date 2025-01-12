import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserPlaceSummary } from '../types';

export interface IUserPlaceSummary extends Document, UserPlaceSummary { }

export const UserPlaceSummarySchema: Schema<IUserPlaceSummary> = new Schema({
  userPlaceSummaryId: { type: String, required: true, unique: true },
  accountId: { type: String, required: true, ref: 'Account' },
  placeId: { type: String, required: true, ref: 'MongoPlace' },
  accountUserInputs: [
    {
      accountUserId: { type: String, required: true, ref: 'AccountUser' },
      accountUserInputId: { type: String, required: true, ref: 'AccountUserInput' }
    }
  ]
});

const UserPlaceSummaryModel: Model<IUserPlaceSummary> = mongoose.model<IUserPlaceSummary>('UserPlaceSummary', UserPlaceSummarySchema);

export default UserPlaceSummaryModel;

