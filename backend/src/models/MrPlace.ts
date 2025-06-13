import mongoose, { Schema, Document, Model } from 'mongoose';
import { PlaceType, RestaurantType } from '../types';

// Interfaces for subdocuments
export interface IItemOrdered {
  itemName: string;
  comments: string;
  rating: number;
}

export interface IMrRestaurantReview {
  _id?: string;
  dateOfVisit: Date;
  itemReviews?: IItemOrdered[];
}

export interface IMrRestaurant {
  restaurantType: RestaurantType;
  openForBreakfast?: boolean;
  openForLunch?: boolean;
  openForDinner?: boolean;
}

export interface IMrPlace extends Document {
  googlePlaceId: string;
  placeType: PlaceType;
  interestLevel?: number;
  placePreview?: string;
  placeReview?: string;
  placeRating?: number;
  restaurantSpecs: IMrRestaurant;
  restaurantReviews: IMrRestaurantReview[];
}

const MrItemOrderedSchema: Schema = new Schema({
  itemName: { type: String, required: true },
  comments: { type: String },
  rating: { type: Number }
}, { _id: true });

const RestaurantReviewSchema: Schema = new Schema({
  dateOfVisit: { type: Date, required: true }, // appears as dateOfVisit, not date
  itemReviews: [MrItemOrderedSchema]
}, { _id: true });

const RestaurantSpecsSchema: Schema = new Schema({
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
  googlePlaceId: { type: String, required: true, ref: 'MongoPlace' },
  placeType: {
    type: Number,
    required: true,
    enum: [PlaceType.Restaurant, PlaceType.Accommodations, PlaceType.GroceryStore, PlaceType.Destination]
  },
  interestLevel: { type: Number },
  placePreview: { type: String },
  placeReview: { type: String },
  placeRating: { type: Number },
  restaurantSpecs: RestaurantSpecsSchema,
  restaurantReviews: [RestaurantReviewSchema],
});

const MrPlaceModel: Model<IMrPlace> = mongoose.model<IMrPlace>('MrPlace', MrPlaceSchema);

export default MrPlaceModel;
