import mongoose, { Schema, Document, Model } from 'mongoose';
import { FuturePlace } from '../types/entities';

export interface IFuturePlace extends Omit<FuturePlace, "_id">, Document {}

export type FuturePlaceModel = Model<IFuturePlace>;

const FuturePlaceSchema: Schema = new Schema({
  place_id: { type: String, required: true},
  comments: { type: String, required: true },
  rating: { type: Number, required: true },
});

const FuturePlace: FuturePlaceModel = mongoose.model<IFuturePlace>('FuturePlace', FuturePlaceSchema);

export default FuturePlace;
