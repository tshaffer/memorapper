import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Request, Response } from 'express';
import { FreeformReviewProperties, GooglePlaceDetails, GooglePlaceDetailsResponse, GooglePlace, GooglePlacesResponse, MemoRappReview, StructuredReviewProperties, WouldReturn, RestaurantType } from '../types';
import { parsePreview } from './manageReview';
import { addPlace } from './places';
import { IMongoPlace, IReview } from '../models';
import { addReview } from './reviews';
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const GOOGLE_PLACE_DETAILS_BASE_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

interface TestReview {
  restaurantName: string;
  dateOfVisit: string;
  wouldReturn: WouldReturn | null;
  reviewText: string;
  restaurantType: RestaurantType;
  reviewerId: string;
};

const generateSessionId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const addTestReview = async (
  restaurantName: string,
  dateOfVisit: string,
  wouldReturn: WouldReturn | null,
  reviewText: string,
  restaurantType: RestaurantType,
  reviewerId: string
): Promise<void> => {
  const sessionId: string = generateSessionId();

  const freeformReviewProperties: FreeformReviewProperties = await parsePreview(sessionId, reviewText);

  const place: GooglePlace = await getRestaurantProperties(restaurantName);
  place.restaurantType = restaurantType;

  const newMongoPlace: IMongoPlace | null = await addPlace(place);

  const placeId: string = place.place_id;
  const addReviewBody: MemoRappReview = {
    place_id: placeId,
    structuredReviewProperties: {
      dateOfVisit,
      wouldReturn,
      reviewerId,
    },
    freeformReviewProperties: freeformReviewProperties,
  };
  const newReview: IReview | null = await addReview(addReviewBody);
  console.log('newReview:', newReview?.toObject());

  return Promise.resolve();
}

interface AddReviewFromFileBody {
  fileName: string;
}

export const addReviewsFromFileHandler = async (
  request: Request<{}, {}, AddReviewFromFileBody>,
  response: Response
): Promise<void> => {

  const { fileName } = request.body;

  const backendRoot = process.cwd();
  const reviewsFilePath = path.join(backendRoot, '../testData', fileName);

  try {
    const data = fs.readFileSync(reviewsFilePath, 'utf8');
    const reviews: TestReview[] = JSON.parse(data);

    for (const review of reviews) {
      const { restaurantName, reviewText, dateOfVisit, wouldReturn, restaurantType, reviewerId }: TestReview = review;
      await addTestReview(restaurantName, dateOfVisit, wouldReturn, reviewText, restaurantType, reviewerId);
      console.log('review added for ' + restaurantName);
    }
    console.log('All reviews loaded:');
    response.status(200).json({ message: "Reviews loaded successfully!" });
  } catch (error) {
    console.error("Error adding reviews:", error);
    response.status(500).json({ error: "Error adding reviews" });
  }
}

const getRestaurantProperties = async (restaurantName: string): Promise<GooglePlace> => {

  const location = '';
  const query = `${restaurantName} ${location}`;
  const url = `${GOOGLE_PLACES_URL}?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`;

  try {
    const place: google.maps.places.PlaceResult = await getGooglePlace(url);
    const placeDetails: GooglePlaceDetails | null = await getGooglePlaceDetails(place!.place_id!);
    const restaurantProperties: GooglePlace = pickGooglePlaceProperties(placeDetails!)
    return restaurantProperties;

  } catch (error) {
    console.error('Error with Google Places API:', error);
    throw error;
  }
};

const getGooglePlace = async (url: string): Promise<google.maps.places.PlaceResult> => {

  try {
    const response = await axios.get<GooglePlacesResponse>(url);
    const places: google.maps.places.PlaceResult[] = (response.data as { results: google.maps.places.PlaceResult[] }).results;
    if (places.length === 0) {
      throw new Error('No places found matching the query');
    }
    // Return the most relevant result
    const place: google.maps.places.PlaceResult = places[0];
    return place;
  }
  catch (error) {
    console.error('Error with Google Places API:', error);
    throw error;
  }
}

const getGooglePlaceDetails = async (placeId: string): Promise<GooglePlaceDetails | null> => {
  try {
    const response: any = await axios.get(
      GOOGLE_PLACE_DETAILS_BASE_URL,
      {
        params: {
          place_id: placeId,
          key: GOOGLE_PLACES_API_KEY,
        },
      }
    );

    // console.log('getPlaceResult response:', response.data);

    const placeDetailsResponse: GooglePlaceDetailsResponse = response.data;
    const googlePlaceDetails: GooglePlaceDetails = placeDetailsResponse.result;
    return googlePlaceDetails;
  } catch (error) {
    console.error("Error fetching city name:", error);
    return null;
  }
}

const getRestaurantType = (googlePlaceResult: google.maps.places.PlaceResult): RestaurantType => {

  const googlePlaceTypes: string[] | undefined = googlePlaceResult.types;
  if (googlePlaceTypes) {
    for (const googlePlaceType of googlePlaceTypes) {
      switch (googlePlaceType) {
        case 'bakery':
          return RestaurantType.Bakery;
        case 'bar':
          return RestaurantType.Bar;
        // case 'cafe':
        //   return RestaurantType.CoffeeShop;
        // case 'meal_takeaway':
        //   return RestaurantType.PizzaPlace;
        // case 'restaurant':
        //   return RestaurantType.Restaurant;
      }
    }
  }

  return RestaurantType.Generic
}

export function pickGooglePlaceProperties(googlePlaceResult: google.maps.places.PlaceResult): GooglePlace {
  const googlePlace: GooglePlace = {
    place_id: googlePlaceResult.place_id!,
    name: googlePlaceResult.name!,
    address_components: googlePlaceResult.address_components,
    formatted_address: googlePlaceResult.formatted_address!,
    geometry: {
      location: {
        lat: googlePlaceResult.geometry!.location!.lat(),
        lng: googlePlaceResult.geometry!.location!.lng()
      },
      viewport: {
        east: googlePlaceResult.geometry!.viewport!.getNorthEast().lng(),
        north: googlePlaceResult.geometry!.viewport!.getNorthEast().lat(),
        south: googlePlaceResult.geometry!.viewport!.getSouthWest().lat(),
        west: googlePlaceResult.geometry!.viewport!.getSouthWest().lng(),
      },
    },
    website: googlePlaceResult.website || '',
    opening_hours: googlePlaceResult.opening_hours,
    price_level: googlePlaceResult.price_level,
    vicinity: googlePlaceResult.vicinity,
    restaurantType: getRestaurantType(googlePlaceResult),
  };
  return googlePlace;

  // const keys = Object.keys(googlePlaceTemplate) as (keyof GooglePlace)[];

  // const result = Object.fromEntries(
  //   keys
  //     .filter(key => key in googlePlaceResult)
  //     .map(key => [key, googlePlaceResult[key]])
  // ) as unknown as GooglePlace;

  // return result;

}

