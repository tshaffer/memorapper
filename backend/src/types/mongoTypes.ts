import mongoose from "mongoose";
import { MemoRappPlace } from "./entities";
import { IMongoPlace, IReview } from "../models";

export interface MongoPlaceEntity extends MemoRappPlace{
  _id?: mongoose.Types.ObjectId;
  geometry?: MongoGeometry;
}

export interface MongoGeometry {
  location: GeoJSONPoint;
  location_type?: string;
  viewport: MongoViewport;
}

export interface MongoViewport {
  northeast: GeoJSONPoint;
  southwest: GeoJSONPoint;
}

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface QueryResponse {
  places: IMongoPlace[];
  reviews: IReview[];
}
