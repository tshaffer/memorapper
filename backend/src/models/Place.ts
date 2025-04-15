import mongoose, { Schema, Document, Model } from 'mongoose';
import { PlaceType, RestaurantType } from '../types';

// Interfaces for subdocuments
export interface IUserComment {
  user: mongoose.Types.ObjectId;
  comment: string;
}

export interface IItemOrdered {
  name: string;
  comments?: string;
  rating?: number;
}

export interface IRestaurantReview {
  user: mongoose.Types.ObjectId;
  comments: string;
  rating: number;
  date: Date;
  itemsOrdered?: IItemOrdered[];
}

// Updated IPlace interface merging Place and MRRestaurant fields
export interface IPlace extends Document {
  placeId: string;
  placeType: PlaceType;
  googlePlaceId: string;
  placeComments?: string;
  restaurantType?: RestaurantType;
  openForBreakfast?: boolean;
  openForLunch?: boolean;
  openForDinner?: boolean;
  consensusComments?: string;
  perUserComments?: IUserComment[];
  restaurantReviews?: IRestaurantReview[];
}

// Subdocument schemas for restaurant-specific fields
const UserCommentSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true }
}, { _id: true });

const ItemOrderedSchema: Schema = new Schema({
  name: { type: String, required: true },
  comments: { type: String },
  rating: { type: Number }
}, { _id: true });

const RestaurantReviewSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comments: { type: String, required: true },
  rating: { type: Number, required: true },
  date: { type: Date, required: true },
  itemsOrdered: [ItemOrderedSchema]
}, { _id: true });

// Place schema with embedded restaurant fields
const PlaceSchema: Schema = new Schema({
  placeId: { type: String, required: true, unique: true },
  placeType: {
    type: Number,
    required: true,
    enum: [PlaceType.Restaurant, PlaceType.GroceryStore, PlaceType.Destination]
  },
  googlePlaceId: { type: String, required: true, ref: 'MongoPlace' },
  placeComments: { type: String },
  restaurantType: {
    type: Number,
    enum: Object.values(RestaurantType)
  },
  openForBreakfast: { type: Boolean },
  openForLunch: { type: Boolean },
  openForDinner: { type: Boolean },
  consensusComments: { type: String },
  perUserComments: [UserCommentSchema],
  restaurantReviews: [RestaurantReviewSchema]
});

const PlaceModel: Model<IPlace> = mongoose.model<IPlace>('Place', PlaceSchema);

export default PlaceModel;
