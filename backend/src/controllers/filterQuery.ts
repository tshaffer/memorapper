import { IMongoPlace } from '../models/MongoPlace';
import { IReview } from '../models/Review';
import { FilterQueryParams, QueryResponse, WouldReturn } from '../types';
import ItemOrderedModel from '../models/ItemOrdered';

export const getFilteredPlacesAndReviews = async (
  queryParams: FilterQueryParams,
  initialPlaces: IMongoPlace[],
  initialReviews: IReview[]
): Promise<QueryResponse> => {
  const { distanceAwayQuery, wouldReturnQuery, itemsOrderedQuery } = queryParams;
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

    // Step 2: Construct the Items Ordered filter
    if (itemsOrderedQuery && itemsOrderedQuery.length > 0) {
      const standardizedNames = await ItemOrderedModel.find({
        inputName: { $in: itemsOrderedQuery },
      }).distinct('standardizedName');

      const relatedInputNames = await ItemOrderedModel.find({
        standardizedName: { $in: standardizedNames },
      }).distinct('inputName');

      if (relatedInputNames.length > 0) {
        reviewQuery['freeformReviewProperties.itemReviews'] = {
          $elemMatch: {
            item: { $in: relatedInputNames },
          },
        };
      }
    }

    // Step 3: Filter reviews based on the reviewQuery
    if (Object.keys(reviewQuery).length > 0) {
      reviews = reviews.filter((review) => {
        return Object.keys(reviewQuery).every((key) => {
          const queryValue = reviewQuery[key];
          return queryValue.$in.includes(review[key as keyof IReview]);
          // return queryValue.$in.includes(review[key]);
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
