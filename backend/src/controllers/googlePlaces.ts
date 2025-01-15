import axios from 'axios';
import { MongoGeometry, GoogleGeometry, MongoViewport, GeoJSONPoint } from '../types';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
console.log('googlePlaces: GOOGLE_PLACES_API_KEY:', GOOGLE_PLACES_API_KEY);

export const getMongoGeometryFromGoogleGeometry = (googleGeometry: GoogleGeometry): MongoGeometry => {
  const { lat, lng } = googleGeometry.location;
  const geoJSONLocation: GeoJSONPoint = {
    type: 'Point',
    coordinates: [lng, lat]
  };
  const mongoViewport: MongoViewport = convertViewport(googleGeometry.viewport.east, googleGeometry.viewport.north, googleGeometry.viewport.south, googleGeometry.viewport.west);
  const mongoGeometry: MongoGeometry = {
    location: geoJSONLocation,
    viewport: mongoViewport
  };
  return mongoGeometry;
}

const convertViewport = (east: number, north: number, south: number, west: number): MongoViewport => {
  const mongoViewport: MongoViewport = {
    northeast: {
      type: 'Point',
      coordinates: [east, north]
    },
    southwest: {
      type: 'Point',
      coordinates: [west, south]
    }
  }
  return mongoViewport;
};