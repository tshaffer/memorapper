import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContributor extends Document {
  id: string;
  userId: string; // Foreign key to UserEntity
  name: string;
}

const ContributorSchema: Schema<IContributor> = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, ref: 'UserEntity' },
  name: { type: String, required: true },
});

const ContributorModel: Model<IContributor> = mongoose.model<IContributor>('Contributor', ContributorSchema);

export default ContributorModel;