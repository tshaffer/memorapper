import mongoose, { Schema, Document, Model } from 'mongoose';
import { Account } from '../types';

export interface IAccount extends Account, Document {}

const AccountSchema: Schema = new Schema({
  accountId: { type: String, required: true, unique: true },
  accountName: { type: String, required: true, unique: true },
});

const AccountModel: Model<IAccount>  = mongoose.model<IAccount>('Account', AccountSchema);

export default AccountModel;