import { Request, Response } from 'express';
import { IMongoPlace, IReview } from "../models";
import MongoPlace from "../models/MongoPlace";
import Review from "../models/Review";
import { QueryResponse, GooglePlace, MemoRappReview, PlacesReviewsCollection, ParsedQuery, StructuredQueryParams, FilterResultsParams, WouldReturn, SearchResponse } from "../types";
import { convertMongoPlacesToGooglePlaces } from "../utilities";
import { buildStructuredQueryParamsFromParsedQuery, parseQueryWithChatGPT, performHybridQuery, performNaturalLanguageQuery, performStructuredQuery } from './naturalLanguageQuery';

export const nlQueryHandler = async (
  req: Request<{}, {}, { query: string }>,
  res: Response
): Promise<void> => {
  const { query } = req.body;

  try {

    let nlPlaces: IMongoPlace[] = [];
    let nlReviews: IReview[] = [];

    // Step 1: Perform natural language query
    const parsedQuery: ParsedQuery = await parseQueryWithChatGPT(query);
    const { queryType } = parsedQuery;

    let naturalLanguageResponse: QueryResponse = { places: [], reviews: [] };

    if (queryType === 'structured') {
      const structuredQueryParams: StructuredQueryParams =
        buildStructuredQueryParamsFromParsedQuery(parsedQuery);
      naturalLanguageResponse = await performStructuredQuery(structuredQueryParams);
    } else if (queryType === 'full-text') {
      const places = await MongoPlace.find({});
      const reviews = await Review.find({});
      naturalLanguageResponse = await performNaturalLanguageQuery(
        query,
        places,
        reviews
      );
    } else {
      const structuredQueryParams: StructuredQueryParams =
        buildStructuredQueryParamsFromParsedQuery(parsedQuery);
      naturalLanguageResponse = await performHybridQuery(
        query,
        structuredQueryParams
      );
    }

    nlPlaces = naturalLanguageResponse.places;
    nlReviews = naturalLanguageResponse.reviews;

    const googlePlaces: GooglePlace[] =
      convertMongoPlacesToGooglePlaces(nlPlaces);
    const memoRappReviews: MemoRappReview[] = nlReviews.map(
      (review: IReview) => review.toObject()
    );

    const result: PlacesReviewsCollection = {
      places: googlePlaces,
      reviews: memoRappReviews,
    };

    res.status(200).json(result);

  } catch (error) {

    console.error('Error handling unified query:', error);
    res.status(500).json({ error: 'An error occurred while querying reviews.' });

  }
}

export const filterResultsHandler = async (
  req: Request<{}, {}, {
    filter: FilterResultsParams,
    places: GooglePlace[],
    reviews: MemoRappReview[],
    mapLocation: google.maps.LatLngLiteral | null,
  }>,
  res: Response
): Promise<void> => {
  const { filter, places, reviews, mapLocation } = req.body;
  const searchResponse: SearchResponse = await filterResults(filter, places, reviews, mapLocation!);
  res.status(200).json(searchResponse);
}

const filterResults = async (
  filter: FilterResultsParams,
  places: GooglePlace[],
  reviews: MemoRappReview[],
  mapLocation: google.maps.LatLngLiteral,
): Promise<SearchResponse> => {
  const { distanceAwayFilter, openNowFilter, wouldReturnFilter }: FilterResultsParams = filter;

  const filteredPlaces: GooglePlace[] = places.filter((place: GooglePlace) => {
    if (!place.geometry || !place.geometry.location) return false;

    // Filter by distance
    const distanceInMiles = haversineDistance(mapLocation, place.geometry.location);
    if (distanceInMiles > distanceAwayFilter) return false;

    // Filter by open now
    if (openNowFilter && !isPlaceOpenNow(place.opening_hours)) {
      return false;
    }

    return true;
  });

  // Extract the filtered place IDs for review filtering
  const filteredPlaceIds = new Set(filteredPlaces.map((place) => place.place_id));

  // Filter reviews based on filtered places and wouldReturnFilter
  const filteredReviews = reviews.filter((review) => {
    // Check if the review belongs to a filtered place
    if (!filteredPlaceIds.has(review.place_id)) return false;

    // Apply wouldReturnFilter if enabled
    if (wouldReturnFilter.enabled) {
      const wouldReturn: WouldReturn | null = review.structuredReviewProperties.wouldReturn;
      if (!wouldReturn) return false;

      return (
        (wouldReturnFilter.values.yes && wouldReturn === WouldReturn.Yes) ||
        (wouldReturnFilter.values.no && wouldReturn === WouldReturn.No) ||
        (wouldReturnFilter.values.notSure && wouldReturn === WouldReturn.NotSure)
      );
    }

    return true;
  });

  return { places: filteredPlaces, reviews: filteredReviews };
};

// Helper function to calculate distance between two coordinates
function haversineDistance(
  coord1: google.maps.LatLngLiteral,
  coord2: google.maps.LatLngLiteral
): number {
  const R = 3958.8; // Radius of Earth in miles
  const lat1 = coord1.lat * (Math.PI / 180);
  const lat2 = coord2.lat * (Math.PI / 180);
  const deltaLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const deltaLng = (coord2.lng - coord1.lng) * (Math.PI / 180);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
    Math.cos(lat2) *
    Math.sin(deltaLng / 2) *
    Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const isPlaceOpenNow = (openingHours?: google.maps.places.PlaceOpeningHours): boolean => {
  if (!openingHours || !openingHours.periods) return false;

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert current time to HHMM format

  // Find the period matching the current day
  const todayPeriod = openingHours.periods.find((period) => period.open?.day === currentDay);

  if (!todayPeriod || !todayPeriod.open?.time) return false;

  const openingTime = parseInt(todayPeriod.open.time, 10); // Convert opening time to HHMM
  const closingTime = todayPeriod.close ? parseInt(todayPeriod.close.time, 10) : 2400; // Default close to midnight

  return currentTime >= openingTime && currentTime < closingTime;
};


