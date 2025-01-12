import mongoose, { Schema, Document, Model } from 'mongoose';
import { AccountUser } from '../types';

export interface IAccountUser extends AccountUser, Document {}

const AccountUserSchema: Schema = new Schema({
  accountUserId: { type: String, required: true, unique: true },
  accountId: { type: String, required: true, ref: 'Account' },
  userName: { type: String, required: true },
});

const AccountUserModel: Model<IAccountUser>  = mongoose.model<IAccountUser>('AccountUser', AccountUserSchema);

export default AccountUserModel;