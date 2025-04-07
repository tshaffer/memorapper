import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true }
});

export const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
