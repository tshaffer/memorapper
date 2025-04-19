import mongoose, { Schema, Document, Model } from 'mongoose';
import { MongoPlace } from '../types/mongoTypes';
import { PlaceType, RestaurantType } from '../types';

export interface IMongoPlace extends Omit<MongoPlace, "_id">, Document { }

const GeoJSONPointSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const MongoViewportSchema: Schema = new Schema({
  northeast: GeoJSONPointSchema,
  southwest: GeoJSONPointSchema
});

const MongoGeometrySchema: Schema = new Schema({
  location: GeoJSONPointSchema,
  location_type: { type: String },
  viewport: MongoViewportSchema
});

const OpeningHoursPeriodSchema: Schema = new Schema({
  open: {
    day: { type: Number, required: true }, // Day of the week (0 = Sunday, 6 = Saturday)
    hours: { type: Number, required: true },
    minutes: { type: Number, required: true },
    nextDate: { type: Number },
    time: { type: String, required: true }, // HHMM format (e.g., "0900" for 9:00 AM)
  },
  close: {
    day: { type: Number }, // Optional closing day
    hours: { type: Number },
    minutes: { type: Number },
    nextDate: { type: Number },
    time: { type: String }, // Optional closing time
  },
});

const OpeningHoursSchema: Schema = new Schema({
  periods: { type: [OpeningHoursPeriodSchema] }, // Array of opening/closing times
  weekday_text: { type: [String] }, // Optional human-readable opening hours
});

const MongoPlaceSchema: Schema = new Schema({
  googlePlaceId: { type: String, required: true, unique: true },
  placeType: {
    type: Number,
    enum: [
      PlaceType.Restaurant,
      PlaceType.Accommodations,
      PlaceType.GroceryStore,
      PlaceType.Destination
    ]
  },
  name: { type: String, required: true },
  /*
    address_components: [{
      long_name: { type: String },
      short_name: { type: String },
      types: [{ type: String }]
    }],
  */
  address_components: { type: Array },
  formatted_address: { type: String, required: true },
  website: { type: String },
  opening_hours: { type: OpeningHoursSchema }, // Added opening hours field
  price_level: { type: Number },
  rating: { type: Number },
  user_ratings_total: { type: Number },
  utc_offset_minutes: { type: Number },
  vicinity: { type: String },

  // restaurantType: {
  //   type: Number,
  //   enum: [
  //     RestaurantType.Restaurant,
  //     RestaurantType.CoffeeShop,
  //     RestaurantType.Bar,
  //     RestaurantType.Bakery,
  //     RestaurantType.Taqueria,
  //     RestaurantType.PizzaPlace,
  //     RestaurantType.ItalianRestaurant,
  //     RestaurantType.DessertShop,
  //     RestaurantType.Seafood,
  //   ]
  // },
  geometry: MongoGeometrySchema
}, { collection: "mongoPlaces" });

MongoPlaceSchema.index({ "geometry.location": "2dsphere" });

const MongoPlaceModel: Model<IMongoPlace> = mongoose.model<IMongoPlace>('MongoPlace', MongoPlaceSchema);

export default MongoPlaceModel;
