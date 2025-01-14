import mongoose, { Schema, Document, Model } from 'mongoose';
import { AccountUserInput } from '../types';

export interface IAccountUserInput extends Document, AccountUserInput {}

export const AccountUserInputSchema: Schema<IAccountUserInput> = new Schema({
  accountUserInputId: { type: String, required: true, unique: true },
  accountUserId: { type: String, required: true, ref: 'AccountUser' },
  rating: { type: Number, required: true, min: 0, max: 5 },
  comments: { type: String },
});

const AccountUserInputModel: Model<IAccountUserInput> = mongoose.model<IAccountUserInput>('AccountUserInput', AccountUserInputSchema);

export default AccountUserInputModel;

