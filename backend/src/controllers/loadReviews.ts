import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Request, Response } from 'express';
import { GooglePlace, GooglePlacesResponse, RestaurantType, ChatGPTOutput, SubmitReviewBody } from '../types';
import { addPlace } from './places';

import { parsePreview } from './preview';
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
import {
  IMongoPlace,
} from '../models';
import { newSubmitReview } from './review';
import { v4 as uuidv4 } from 'uuid';

interface AddReviewFromFileBody {
  fileName: string;
}

interface TestReview {
  diningGroupId: string;
  dinerRestaurantReviews: any[];
  dateOfVisit: string;
  restaurantName: string;
  restaurantType: number;
  reviewText: string;
};

const generateSessionId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

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
    console.log(reviews);
    for (const review of reviews) {
      const { diningGroupId, dinerRestaurantReviews, dateOfVisit, restaurantName, restaurantType, reviewText }: TestReview = review;
      for (const dinerRestaurantReview of dinerRestaurantReviews) {
        dinerRestaurantReview.dinerRestaurantReviewId = uuidv4();
      }
      await addTestReview(diningGroupId, dinerRestaurantReviews, dateOfVisit, restaurantName, restaurantType, reviewText);
      console.log('review added for ' + restaurantName);
    }
    console.log('All reviews loaded:');
    response.status(200).json({ message: "Reviews loaded successfully!" });
  } catch (error) {
    console.error("Error adding reviews:", error);
    response.status(500).json({ error: "Error adding reviews" });
  }
}

const addTestReview = async (
  diningGroupId: string,
  dinerRestaurantReview: any[],
  dateOfVisit: string,
  restaurantName: string,
  restaurantType: number,
  reviewText: string
): Promise<void> => {

  const chatGPTOutput: ChatGPTOutput = await parsePreview('xyz', reviewText);
  console.log('chatGPTOutput:', chatGPTOutput);

  const { itemReviews } = chatGPTOutput;

  const place: GooglePlace = await getRestaurantProperties(restaurantName);
  place.restaurantType = restaurantType;
  console.log('place:', place);

  const newMongoPlace: IMongoPlace | null = await addPlace(place);
  console.log('newMongoPlace:', newMongoPlace);

  const submitReviewBody: SubmitReviewBody = {
    diningGroupId,
    place,
    dinerRestaurantReviews: dinerRestaurantReview,
    dateOfVisit,
    reviewText,
    itemReviews,
    sessionId: generateSessionId(),
  };
  await newSubmitReview(submitReviewBody);
}

const getRestaurantProperties = async (restaurantName: string): Promise<GooglePlace> => {

  const location = '';
  const query = `${restaurantName} ${location}`;
  const url = `${GOOGLE_PLACES_URL}?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`;

  try {
    const place: google.maps.places.PlaceResult = await getGooglePlace(url);
    const restaurantProperties: GooglePlace = pickGooglePlaceProperties(place);
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

  return RestaurantType.Restaurant;
}

function pickGooglePlaceProperties(googlePlaceResult: google.maps.places.PlaceResult): GooglePlace {
  const googlePlace: GooglePlace = {
    googlePlaceId: googlePlaceResult.place_id!,
    name: googlePlaceResult.name!,
    address_components: googlePlaceResult.address_components,
    formatted_address: googlePlaceResult.formatted_address!,
    geometry: {
      location: {
        lat: googlePlaceResult.geometry!.location!.lat as unknown as number,
        lng: googlePlaceResult.geometry!.location!.lng as unknown as number
      },
      viewport: {
        east: (googlePlaceResult.geometry!.viewport! as any).northeast.lng,
        north: (googlePlaceResult.geometry!.viewport! as any).northeast.lat,
        south: (googlePlaceResult.geometry!.viewport! as any).southwest.lat,
        west: (googlePlaceResult.geometry!.viewport! as any).southwest.lng,
      },
    },
    website: googlePlaceResult.website || '',
    opening_hours: googlePlaceResult.opening_hours,
    price_level: googlePlaceResult.price_level,
    vicinity: googlePlaceResult.vicinity,
    restaurantType: getRestaurantType(googlePlaceResult),
  };
  return googlePlace;
}

