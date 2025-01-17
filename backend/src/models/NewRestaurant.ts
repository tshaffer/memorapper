import mongoose, { Schema, Document, Model } from 'mongoose';
import { NewRestaurant } from '../types/entities';

export interface INewRestaurant extends Omit<NewRestaurant, "_id">, Document { }

const NewRestaurantSchema: Schema = new Schema({
  newRestaurantId: { type: String, required: true, unique: true },
  googlePlaceId: { type: String, required: true, ref: 'MongoPlace' },
  diningGroupId: { type: String, required: true, ref: 'DiningGroup' },
  comments: { type: String },
  interestLevel: { type: Number, required: true },
});

const NewRestaurantModel: Model<INewRestaurant> = mongoose.model<INewRestaurant>('NewRestaurant', NewRestaurantSchema);

export default NewRestaurantModel;
