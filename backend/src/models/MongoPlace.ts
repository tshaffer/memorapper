import mongoose, { Schema, Document, Model } from 'mongoose';
import { MongoPlaceEntity } from '../types/mongoTypes';

export interface IMongoPlace extends Omit<MongoPlaceEntity, "_id">, Document { }

export type MongoPlaceModel = Model<IMongoPlace>;

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
    time: { type: String, required: true }, // HHMM format (e.g., "0900" for 9:00 AM)
  },
  close: {
    day: { type: Number }, // Optional closing day
    time: { type: String }, // Optional closing time
  },
});

const OpeningHoursSchema: Schema = new Schema({
  periods: { type: [OpeningHoursPeriodSchema] }, // Array of opening/closing times
  weekday_text: { type: [String] }, // Optional human-readable opening hours
});

const MongoPlaceSchema: Schema = new Schema({
  place_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address_components: { type: Array },
  formatted_address: { type: String, required: true },
  website: { type: String },
  opening_hours: { type: OpeningHoursSchema }, // Added opening hours field
  price_level: { type: Number },
  vicinity: { type: String },
  restaurantType: { type: Number, required: true },
  geometry: MongoGeometrySchema
}, { collection: "mongoPlaces" });

MongoPlaceSchema.index({ "geometry.location": "2dsphere" });

const MongoPlace: MongoPlaceModel = mongoose.model<IMongoPlace>('MongoPlace', MongoPlaceSchema);

export default MongoPlace;
