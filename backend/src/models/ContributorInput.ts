import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContributorInput extends Document {
  contributorId: string; // Foreign key to Contributor
  rating: number;
  comments: string;
}

export const ContributorInputSchema: Schema<IContributorInput> = new Schema({
  contributorId: { type: String, required: true, ref: 'Contributor' },
  rating: { type: Number, required: true, min: 0, max: 10 },
  comments: { type: String, required: true },
});

const ContributorInputModel: Model<IContributorInput> = mongoose.model<IContributorInput>('Contributor', ContributorInputSchema);

export default ContributorInputModel;