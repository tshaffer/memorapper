import mongoose from 'mongoose';
import { UserEntity } from '../types/entities';

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
  },
);

const UserModel = mongoose.model<UserEntity>("User", UserSchema);

export default UserModel;
