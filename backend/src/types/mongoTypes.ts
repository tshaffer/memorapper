import mongoose from "mongoose";
import { GooglePlace } from "./place";

export interface MongoPlace extends Omit<GooglePlace, 'geometry'> {
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

