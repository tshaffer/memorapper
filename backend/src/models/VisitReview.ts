import mongoose, { Schema, Document, Model } from 'mongoose';
import { VisitReview } from '../types';

export interface IVisitReview extends VisitReview, Document { }

const ItemReviewSchema: Schema = new Schema({
  item: { type: String, required: true },
  review: { type: String, required: true },
});

const VisitReviewSchema: Schema = new Schema({
  accountId: { type: String, required: true, ref: 'DiningGroup' },
  placeId: { type: String, required: true, ref: 'MongoPlace' },
  dateOfVisit: { type: String, required: true },
  reviewText: { type: String, required: true },
  itemReviews: [ItemReviewSchema],
});

const VisitReviewModel: Model<IVisitReview> = mongoose.model<IVisitReview>('VisitReview', VisitReviewSchema);

export default VisitReviewModel;