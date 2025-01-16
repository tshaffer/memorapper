import mongoose, { Schema, Document, Model } from 'mongoose';
import { DesiredRestaurant } from '../types/entities';

export interface IDesiredRestaurant extends Omit<DesiredRestaurant, "_id">, Document { }

const DesiredRestaurantSchema: Schema = new Schema({
  googlePlaceId: { type: String, required: true },
  comments: { type: String },
  interestLevel: { type: Number, required: true },
});

const DesiredRestaurantModel: Model<IDesiredRestaurant> = mongoose.model<IDesiredRestaurant>('DesiredRestaurant', DesiredRestaurantSchema);

export default DesiredRestaurantModel;
