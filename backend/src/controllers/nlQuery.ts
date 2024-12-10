import { Request, Response } from 'express';
import { IMongoPlace, IReview } from "../models";
import MongoPlace from "../models/MongoPlace";
import Review from "../models/Review";
import { QueryResponse, GooglePlace, MemoRappReview, PlacesReviewsCollection, ParsedQuery, StructuredQueryParams, FilterResultsParams, FilterQueryParams, DistanceAwayQuery, WouldReturnQuery, WouldReturn, SearchDistanceFilter, SearchResponse } from "../types";
import { convertMongoPlacesToGooglePlaces } from "../utilities";
import { buildStructuredQueryParamsFromParsedQuery, parseQueryWithChatGPT, performHybridQuery, performNaturalLanguageQuery, performStructuredQuery } from './naturalLanguageQuery';
import { getFilteredPlacesAndReviews } from './filterQuery';

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

  const queryResponse: QueryResponse = await findMyStuff(filter, places, reviews, mapLocation!);

  res.sendStatus(200);
}

/*
export interface FilterResultsParams {
  distanceAwayFilter: SearchDistanceFilter;
  openNowFilter: boolean;
  wouldReturnFilter: WouldReturnFilter;
}
*/
const findMyStuff = async (
  filter: FilterResultsParams,
  places: GooglePlace[],
  reviews: MemoRappReview[],
  mapLocation: google.maps.LatLngLiteral,
): Promise<SearchResponse> => {

  const { distanceAwayFilter, openNowFilter, wouldReturnFilter }: FilterResultsParams = filter;

  // const distanceAwayFilterInMiles: number = getDistanceAwayFilterInMiles(distanceAwayFilter);
  const filteredPlaces: GooglePlace[] = places.filter((place: GooglePlace) => {
    if (!place.geometry || !place.geometry.location) return false;
    const distanceInMiles = haversineDistance(mapLocation, place.geometry.location);
    return distanceInMiles <= distanceAwayFilter;
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

    return true; // If wouldReturnFilter is not enabled, include the review
  });

  return { places: filteredPlaces, reviews: filteredReviews };

  // // Step 0: Initialize queries
  // let placeQuery: any = {};
  // let reviewQuery: any = {};

  // // Step 1: Construct the Would Return filter for reviews
  // if (wouldReturnFilter.enabled) {
  //   const returnFilter: WouldReturn[] = [];
  //   if (wouldReturnFilter.values.yes) returnFilter.push(WouldReturn.Yes);
  //   if (wouldReturnFilter.values.no) returnFilter.push(WouldReturn.No);
  //   if (wouldReturnFilter.values.notSure) returnFilter.push(WouldReturn.NotSure);

  //   if (returnFilter.length > 0) {
  //     reviewQuery['structuredReviewProperties.wouldReturn'] = { $in: returnFilter };
  //   }
  // }

  // // Fetch reviews matching reviewQuery (from all reviews, not just the reviews provided)
  // let reviews: IReview[] = await Review.find(reviewQuery);

  // return { places: [], reviews: [] };

}

// const getDistanceAwayFilterInMiles = (searchDistanceFilter: SearchDistanceFilter): number => {
//   switch (searchDistanceFilter) {
//     case SearchDistanceFilter.HalfMile:
//       return 0.5;
//     case SearchDistanceFilter.OneMile:
//       return 1;
//     case SearchDistanceFilter.FiveMiles:
//       return 5;
//     case SearchDistanceFilter.TenMiles:
//       return 10;
//     case SearchDistanceFilter.AnyDistance:
//       return 10000;
//     default:
//       throw new Error('Invalid search distance filter.');
//   }
// }

// export const filterResults = async (
//   filter: FilterResultsParams,
//   places: GooglePlace[],
//   reviews: MemoRappReview[],
//   mapLocation: google.maps.LatLngLiteral,
// ): Promise<QueryResponse> => {
//   try {
//     const { distanceAwayFilter, openNowFilter, wouldReturnFilter } = filter;
//     console.log('filterResultsHandler:', distanceAwayFilter, openNowFilter, wouldReturnFilter, places, reviews);

//     const distanceAwayQuery: DistanceAwayQuery = {
//       lat: mapLocation.lat,
//       lng: mapLocation.lng,
//       radius: distanceAwayFilter,
//     };
//     const wouldReturnQuery: WouldReturnQuery | undefined = wouldReturnFilter.enabled ?
//       {
//         yes: wouldReturnFilter.values.yes,
//         no: wouldReturnFilter.values.no,
//         notSure: wouldReturnFilter.values.notSure,
//       } : undefined;

//     const queryParams: FilterQueryParams = {
//       distanceAwayQuery,
//       wouldReturnQuery,
//     }

//     const queryResponse: QueryResponse = await getFilteredPlacesAndReviews(queryParams, places, reviews);
//     return queryResponse;

//   } catch (error) {
//     console.error('Error retrieving filtered places and reviews:', error);
//     throw new Error('Failed to retrieve filtered data.');
//   }
// };

// const searchFilteredPlacesAndReviews = async (
//   queryParams: FilterQueryParams,
//   initialPlaces: IMongoPlace[],
//   initialReviews: IReview[]
// ): Promise<QueryResponse> => {
//   const { distanceAwayQuery, wouldReturnQuery } = queryParams;
//   const { lat, lng, radius } = distanceAwayQuery || {};

//   try {
//     // let places = initialPlaces;
//     let reviews = initialReviews;

//     // Initialize queries
//     let placeQuery: any = {};
//     let reviewQuery: any = {};

//     // Extract unique place IDs from the provided reviews
//     const placeIdsWithReviews = Array.from(new Set(reviews.map((review) => review.place_id)));
//     if (placeIdsWithReviews.length === 0) {
//       return { places: [], reviews: [] };
//     }

//     // Construct the Place query
//     if (lat !== undefined && lng !== undefined && radius !== undefined) {
//       placeQuery['geometry.location'] = {
//         $near: {
//           $geometry: { type: 'Point', coordinates: [lng, lat] },
//           $maxDistance: radius * 1609.34, // Convert miles to meters
//         },
//       };
//     }

//     // Restrict to places that have matching reviews
//     placeQuery['place_id'] = { $in: placeIdsWithReviews };

//     // Fetch places matching placeQuery
//     let places: IMongoPlace[] = await MongoPlace.find(placeQuery);

//     // const reviewQuery: Record<string, any> = {};

//     // // Step 1: Construct the Would Return filter for reviews
//     // if (wouldReturnQuery) {
//     //   const returnFilter: WouldReturn[] = [];
//     //   if (wouldReturnQuery.yes) returnFilter.push(WouldReturn.Yes);
//     //   if (wouldReturnQuery.no) returnFilter.push(WouldReturn.No);
//     //   if (wouldReturnQuery.notSure) returnFilter.push(WouldReturn.NotSure);

//     //   if (returnFilter.length > 0) {
//     //     reviewQuery['structuredReviewProperties.wouldReturn'] = { $in: returnFilter };
//     //   }
//     // }

//     // // Step 3: Filter reviews based on the reviewQuery
//     // if (Object.keys(reviewQuery).length > 0) {
//     //   reviews = reviews.filter((review) => {
//     //     return Object.keys(reviewQuery).every((key) => {
//     //       const queryValue = reviewQuery[key as keyof typeof reviewQuery];

//     //       // Handle nested properties with safe traversal
//     //       const keys = key.split('.'); // Split the key by dots to traverse the object
//     //       let value: any = review;
//     //       for (const k of keys) {
//     //         value = value?.[k as keyof typeof value];
//     //         if (value === undefined) return false; // Property doesn't exist
//     //       }

//     //       // Check if value is an array for $elemMatch
//     //       if (queryValue.$elemMatch && Array.isArray(value)) {
//     //         return value.some((item: any) =>
//     //           Object.keys(queryValue.$elemMatch).every((elemKey) => {
//     //             const elemValue = queryValue.$elemMatch[elemKey];
//     //             if (elemValue.$in) {
//     //               return elemValue.$in.includes(item[elemKey]);
//     //             }
//     //             return item[elemKey] === elemValue;
//     //           })
//     //         );
//     //       }

//     //       // Handle $in for non-array properties
//     //       if (queryValue.$in) {
//     //         return queryValue.$in.includes(value);
//     //       }

//     //       // Fallback for exact matches
//     //       return value === queryValue;
//     //     });
//     //   });
//     // }

//     // // Extract unique place_ids from the filtered reviews
//     // const placeIdsWithReviews = Array.from(new Set(reviews.map((review) => review.place_id)));

//     // // Step 4: Filter places based on distance or matching place IDs
//     // let placeQuery: any = { place_id: { $in: placeIdsWithReviews } };

//     // if (lat !== undefined && lng !== undefined && radius !== undefined) {
//     //   placeQuery['geometry.location'] = {
//     //     $near: {
//     //       $geometry: { type: 'Point', coordinates: [lng, lat] },
//     //       $maxDistance: radius * 1609.34, // Convert miles to meters
//     //     },
//     //   };
//     // }

//     // places = places.filter((place) => placeQuery.place_id.$in.includes(place.place_id));

//     // Combine results
//     return { places, reviews };
//   } catch (error) {
//     console.error('Error retrieving filtered places and reviews:', error);
//     throw new Error('Failed to retrieve filtered data.');
//   }
// };

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

