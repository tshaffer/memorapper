import mongoose, { Schema, Document, Model } from 'mongoose';
import { AccountPlaceReview } from '../types';

export interface IAccountPlaceReview extends AccountPlaceReview, Document {}

const ItemReviewSchema: Schema = new Schema({
  item: { type: String, required: true },
  review: { type: String, required: true },
});

const AccountPlaceReviewSchema: Schema = new Schema({
  accountId: { type: String, required: true, ref: 'Account' },
  placeId: { type: String, required: true, ref: 'MongoPlace'},
  dateOfVisit: { type: String, required: true },
  reviewText: { type: String, required: true },
  itemReviews: [ItemReviewSchema],
});

const AccountPlaceReviewModel: Model<IAccountPlaceReview>  = mongoose.model<IAccountPlaceReview>('AccountPlaceReview', AccountPlaceReviewSchema);

export default AccountPlaceReviewModel;