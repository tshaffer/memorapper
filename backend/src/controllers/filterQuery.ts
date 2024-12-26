import { IMongoPlace } from '../models/MongoPlace';
import { IReview } from '../models/Review';
import { FilterQueryParams, QueryResponse, WouldReturn } from '../types';

export const getFilteredPlacesAndReviews = async (
  queryParams: FilterQueryParams,
  initialPlaces: IMongoPlace[],
  initialReviews: IReview[]
): Promise<QueryResponse> => {
  const { distanceAwayQuery, wouldReturnQuery } = queryParams;
  const { lat, lng, radius } = distanceAwayQuery || {};

  try {
    // Start with subsets provided by natural language query
    let places = initialPlaces;
    let reviews = initialReviews;

    const reviewQuery: Record<string, any> = {};

    // Step 1: Construct the Would Return filter for reviews
    if (wouldReturnQuery) {
      const returnFilter: WouldReturn[] = [];
      if (wouldReturnQuery.yes) returnFilter.push(WouldReturn.Yes);
      if (wouldReturnQuery.no) returnFilter.push(WouldReturn.No);
      if (wouldReturnQuery.notSure) returnFilter.push(WouldReturn.NotSure);

      if (returnFilter.length > 0) {
        reviewQuery['structuredReviewProperties.wouldReturn'] = { $in: returnFilter };
      }
    }

    // Step 3: Filter reviews based on the reviewQuery
    if (Object.keys(reviewQuery).length > 0) {
      reviews = reviews.filter((review) => {
        return Object.keys(reviewQuery).every((key) => {
          const queryValue = reviewQuery[key as keyof typeof reviewQuery];
    
          // Handle nested properties with safe traversal
          const keys = key.split('.'); // Split the key by dots to traverse the object
          let value: any = review;
          for (const k of keys) {
            value = value?.[k as keyof typeof value];
            if (value === undefined) return false; // Property doesn't exist
          }
    
          // Check if value is an array for $elemMatch
          if (queryValue.$elemMatch && Array.isArray(value)) {
            return value.some((item: any) =>
              Object.keys(queryValue.$elemMatch).every((elemKey) => {
                const elemValue = queryValue.$elemMatch[elemKey];
                if (elemValue.$in) {
                  return elemValue.$in.includes(item[elemKey]);
                }
                return item[elemKey] === elemValue;
              })
            );
          }
    
          // Handle $in for non-array properties
          if (queryValue.$in) {
            return queryValue.$in.includes(value);
          }
    
          // Fallback for exact matches
          return value === queryValue;
        });
      });
    }
        
    // Extract unique place_ids from the filtered reviews
    const placeIdsWithReviews = Array.from(new Set(reviews.map((review) => review.place_id)));

    // Step 4: Filter places based on distance or matching place IDs
    let placeQuery: any = { place_id: { $in: placeIdsWithReviews } };

    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      placeQuery['geometry.location'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius * 1609.34, // Convert miles to meters
        },
      };
    }

    places = places.filter((place) => placeQuery.place_id.$in.includes(place.place_id));

    // Combine results
    return { places, reviews };
  } catch (error) {
    console.error('Error retrieving filtered places and reviews:', error);
    throw new Error('Failed to retrieve filtered data.');
  }
};
