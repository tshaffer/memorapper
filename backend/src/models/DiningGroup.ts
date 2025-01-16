import mongoose, { Schema, Document, Model } from 'mongoose';
import { DiningGroup } from '../types';

export interface IDiningGroup extends DiningGroup, Document { }

const DiningGroupSchema: Schema = new Schema({
  diningGroupId: { type: String, required: true, unique: true },
  diningGroupName: { type: String, required: true, unique: true },
});

const DiningGroupModel: Model<IDiningGroup> = mongoose.model<IDiningGroup>('DiningGroup', DiningGroupSchema);

export default DiningGroupModel;