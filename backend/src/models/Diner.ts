import mongoose, { Schema, Document, Model } from 'mongoose';
import { Diner } from '../types';

export interface IDiner extends Diner, Document { }

const DinerSchema: Schema = new Schema({
  dinerId: { type: String, required: true, unique: true },
  diningGroupId: { type: String, required: true, ref: 'DiningGroup' },
  dinerName: { type: String, required: true },
});

const DinerModel: Model<IDiner> = mongoose.model<IDiner>('Diner', DinerSchema);

export default DinerModel;