import { IMongoPlace } from "../models";
import { GoogleGeometry, TSGooglePlace, MongoGeometry, MongoPlace } from "../types";
import { MongoViewport, GeoJSONPoint } from '../types';

export function convertMongoPlaceToGooglePlace(mongoPlace: IMongoPlace): TSGooglePlace {
  const mongoPlaceObject: MongoPlace = mongoPlace.toObject();
  const googlePlace: TSGooglePlace = {
    ...mongoPlaceObject,
    geometry: convertMongoGeometryToGoogleGeometry(mongoPlace.geometry!)
  };
  return googlePlace;
}

export function convertMongoPlacesToGooglePlaces(mongoPlaces: IMongoPlace[]): TSGooglePlace[] {
  return mongoPlaces.map((mongoPlace) => {
    const mongoPlaceObject: MongoPlace = mongoPlace.toObject();
    const googlePlace: TSGooglePlace = {
      ...mongoPlaceObject,
      geometry: convertMongoGeometryToGoogleGeometry(mongoPlace.geometry!)
    };
    return googlePlace;
  });
}

export function convertMongoGeometryToGoogleGeometry(mongoGeometry: MongoGeometry): GoogleGeometry {
  return {
    location: {
      lat: mongoGeometry.location.coordinates[1], // GeoJSON uses [lng, lat]
      lng: mongoGeometry.location.coordinates[0]
    },
    viewport: {
      north: mongoGeometry.viewport.northeast.coordinates[1],
      south: mongoGeometry.viewport.southwest.coordinates[1],
      east: mongoGeometry.viewport.northeast.coordinates[0],
      west: mongoGeometry.viewport.southwest.coordinates[0]
    }
  };
}

export const convertGoogleGeometryToMongoGeometry = (googleGeometry: GoogleGeometry): MongoGeometry => {
  const { lat, lng } = googleGeometry.location;
  const geoJSONLocation: GeoJSONPoint = {
    type: 'Point',
    coordinates: [lng, lat]
  };
  const mongoViewport: MongoViewport = buildMongoViewport(googleGeometry.viewport.east, googleGeometry.viewport.north, googleGeometry.viewport.south, googleGeometry.viewport.west);
  const mongoGeometry: MongoGeometry = {
    location: geoJSONLocation,
    viewport: mongoViewport
  };
  return mongoGeometry;
}

const buildMongoViewport = (east: number, north: number, south: number, west: number): MongoViewport => {
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