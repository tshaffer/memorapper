import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  id: string;
  userName: string;
  password: string;
  email: string;
}

const UserSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
});

const UserModel: Model<IUser>  = mongoose.model<IUser>('User', UserSchema);

export default UserModel;