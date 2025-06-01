import mongoose, { Schema, Document, Model } from 'mongoose';
import { PlaceType, RestaurantType } from '../types';

// Interfaces for subdocuments
export interface IItemOrdered {
  itemName: string;
  comments: string;
  rating: number;
}

export interface IMrRestaurantReview {
  date: Date;
  itemsOrdered?: IItemOrdered[];
  reviewText: string;
}

export interface IMrRestaurant {
  restaurantType: RestaurantType;
  openForBreakfast?: boolean;
  openForLunch?: boolean;
  openForDinner?: boolean;
}

export interface IMrPlace extends Document {
  placeId: string;
  placeType: PlaceType;
  googlePlaceId: string;
  placeComments?: string;
  mrPlaceReviews: IMrRestaurantReview[];
  mrPlaceSpecificities: IMrRestaurant;
}

const MrItemOrderedSchema: Schema = new Schema({
  itemName: { type: String, required: true },
  comments: { type: String },
  rating: { type: Number }
}, { _id: true });

const RestaurantReviewSchema: Schema = new Schema({
  rating: { type: Number, required: true },
  date: { type: Date, required: true },
  itemsOrdered: [MrItemOrderedSchema]
}, { _id: true });

const RestaurantSchema: Schema = new Schema({
  restaurantType: {
    type: Number,
    enum: [RestaurantType.Restaurant, RestaurantType.Seafood, RestaurantType.CoffeeShop, RestaurantType.Bar, RestaurantType.Bakery, RestaurantType.Taqueria, RestaurantType.PizzaPlace, RestaurantType.ItalianRestaurant, RestaurantType.DessertShop],
    required: true
  },
  openForBreakfast: { type: Boolean },
  openForLunch: { type: Boolean },
  openForDinner: { type: Boolean },
}, { _id: true });

// Place schema with embedded restaurant fields
const MrPlaceSchema: Schema = new Schema({
  placeId: { type: String, required: true, unique: true },
  placeType: {
    type: Number,
    required: true,
    enum: [PlaceType.Restaurant, PlaceType.Accommodations, PlaceType.GroceryStore, PlaceType.Destination]
  },
  googlePlaceId: { type: String, required: true, ref: 'MongoPlace' },
  placeComments: { type: String },
  placeRating: { type: Number },
  placeReviews: [RestaurantReviewSchema],
  placeSpecificities: RestaurantSchema
});

const MrPlaceModel: Model<IMrPlace> = mongoose.model<IMrPlace>('MrPlace', MrPlaceSchema);

export default MrPlaceModel;
