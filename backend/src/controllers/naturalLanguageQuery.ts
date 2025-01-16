import getOpenAIClient from '../services/openai';
import MongoPlaceModel, { IMongoPlace } from '../models/MongoPlace';
import { QueryResponse, ParsedQuery, StructuredQueryParams } from '../types';
import VisitReview, { IVisitReview } from '../models/VisitReview';

export const buildStructuredQueryParamsFromParsedQuery = (parsedQuery: ParsedQuery): StructuredQueryParams => {
  const { queryParameters } = parsedQuery;
  const { restaurantName, dateRange, itemsOrdered } = queryParameters;
  const structuredQueryParams: StructuredQueryParams = {};

  if (restaurantName) {
    structuredQueryParams.placeName = restaurantName;
  }

  if (dateRange) {
    structuredQueryParams.reviewDateRange = { start: dateRange.start, end: dateRange.end };
  }

  if (itemsOrdered) {
    structuredQueryParams.itemsOrdered = itemsOrdered;
  }

  return structuredQueryParams;
}

export const parseQueryWithChatGPT = async (query: string): Promise<ParsedQuery> => {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `
        You are an assistant that converts natural language queries into structured parameters for searching restaurant reviews.
        Your task is to parse the query into structured fields that align with the fields in a restaurant review schema.
        
        Please extract any of the following fields as relevant from the user's query:
        - location: a city, region, or specific place (e.g., "Mountain View")
        - radius: a distance in meters, if provided (e.g., "within 10 miles")
        - date range: start and end dates for queries related to dates, formatted as YYYY-MM-DD
        - restaurantName: the name of a specific restaurant (e.g., "La Costena")
        - itemsOrdered: specific items ordered, if mentioned (e.g., "Caesar Salad")

        Determine the queryType based on the following:
        - If the query only references structured fields (e.g., location, date, restaurant name, items ordered), set "queryType" to "structured".
        - If the query only references full review text or user comments not part of structured fields, set "queryType" to "full-text".
        - If the query references both structured fields and full review text, set "queryType" to "hybrid".

        Return the results in the following JSON format:
        {
          "queryType": "structured" or "full-text" or "hybrid",
          "queryParameters": {
            "location": "Location Name",
            "radius": Distance in meters,
            "dateRange": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
            "restaurantName": "Restaurant Name",
            "itemsOrdered": ["Item1", "Item2", ...]
          }
        }

        If any field is missing, set its value to null. Pay close attention to queries that include both structured and full-text elements and classify them as "hybrid".

        Example inputs and outputs:
        Input: "Show me reviews for restaurants in Mountain View within the past month"
        Output: { "queryType": "structured", "queryParameters": { "location": "Mountain View", "radius": null, "dateRange": { "start": "YYYY-MM-01", "end": "YYYY-MM-DD" }, "restaurantName": null, "itemsOrdered": null } }

        Input: "What did I say about the Caesar Salad at Doppio Zero?"
        Output: { "queryType": "structured", "queryParameters": { "location": null, "radius": null, "dateRange": null, "restaurantName": "Doppio Zero", "itemsOrdered": ["Caesar Salad"] } }

        Input: "Would I return to La Costena for the tacos?"
        Output: { "queryType": "structured", "queryParameters": { "location": null, "radius": null, "dateRange": null, "restaurantName": "La Costena", "itemsOrdered": ["tacos"] } }

        Input: "Show me reviews from August 2024 where the reviewer mentioned that parking was difficult"
        Output: { "queryType": "hybrid", "queryParameters": { "location": null, "radius": null, "dateRange": { "start": "2024-08-01", "end": "2024-08-31" }, "restaurantName": null, "itemsOrdered": null } }
        `
      },
      { role: "user", content: query },
    ],
  });

  const parsedContent = response.choices[0].message?.content || "{}";
  return JSON.parse(parsedContent) as ParsedQuery;
};

export const performNewStructuredQuery = async (queryParams: StructuredQueryParams): Promise<QueryResponse> => {
  const {
    distanceAwayQuery,
    placeName,
    reviewDateRange,
    itemsOrdered,
    additionalPlaceFilters,
    additionalReviewFilters
  } = queryParams;
  const { lat, lng, radius } = distanceAwayQuery || {};

  try {
    // Step 0: Initialize queries
    let placeQuery: any = {};
    let reviewQuery: any = {};

    // Step 2: Add reviewDateRange filter if provided
    if (reviewDateRange?.start || reviewDateRange?.end) {
      reviewQuery['structuredReviewProperties.dateOfVisit'] = {};
      if (reviewDateRange.start) {
        reviewQuery['structuredReviewProperties.dateOfVisit'].$gte = reviewDateRange.start;
      }
      if (reviewDateRange.end) {
        reviewQuery['structuredReviewProperties.dateOfVisit'].$lte = reviewDateRange.end;
      }
    }

    // Step 3: Add itemsOrdered filter if provided
    if (itemsOrdered && itemsOrdered.length > 0) {
      reviewQuery["freeformReviewProperties.itemReviews"] = {
        $elemMatch: { item: { $regex: new RegExp(itemsOrdered.join("|"), "i") } },
      };
    }

    // Step 4: Apply additional review filters if provided
    if (additionalReviewFilters) {
      Object.assign(reviewQuery, additionalReviewFilters);
    }

    // Fetch reviews matching reviewQuery
    let reviews: IVisitReview[] = await VisitReview.find(reviewQuery);

    // Step 5: Extract unique place IDs from the filtered reviews
    const placeIdsWithReviews = Array.from(new Set(reviews.map((review) => review.placeId)));
    if (placeIdsWithReviews.length === 0) {
      return { places: [], reviews: [] };
    }

    // Step 6: Construct the Place query
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      placeQuery['geometry.location'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius * 1609.34, // Convert miles to meters
        },
      };
    }

    // Add name filter if provided
    if (placeName) {
      placeQuery['name'] = { $regex: new RegExp(placeName, 'i') }; // Case-insensitive partial match
    }

    // Add additional place filters if provided
    if (additionalPlaceFilters) {
      Object.assign(placeQuery, additionalPlaceFilters);
    }

    // Restrict to places that have matching reviews
    placeQuery['googlePlaceId'] = { $in: placeIdsWithReviews };

    // Fetch places matching placeQuery
    let places: IMongoPlace[] = await MongoPlaceModel.find(placeQuery);

    // Step 7: Refine reviews to only those belonging to filtered places
    const filteredPlaceIds = places.map((place) => place.googlePlaceId);
    reviews = reviews.filter((review) => filteredPlaceIds.includes(review.placeId));

    // Combine results
    return {
      places,
      reviews,
    };
  } catch (error) {
    console.error('Error retrieving filtered places and reviews:', error);
    throw new Error('Failed to retrieve filtered data.');
  }
};

export const newPerformNaturalLanguageQuery = async (
  query: string,
  places: IMongoPlace[],
  reviews: IVisitReview[]
): Promise<QueryResponse> => {
  console.log("newPerformNaturalLanguageQuery:", query);

  // Step 1: Prepare data for OpenAI query
  const placeData = places.map(place => ({
    id: place.googlePlaceId,
    name: place.name,
    address: place.formatted_address,
    location: place.geometry?.location,
  }));

  const reviewData = reviews.map(review => ({
    id: review._id,
    text: review.reviewText,
    dateOfVisit: review.dateOfVisit,
    googlePlaceId: review.placeId,
  }));

  // Step 2: Call OpenAI API
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that retrieves relevant places and reviews based on a natural language query. Respond with JSON data only, without additional commentary.`,
      },
      {
        role: "user",
        content: `Find relevant places and reviews for the query: "${query}". 
        The places are: ${JSON.stringify(placeData)}. 
        The reviews are: ${JSON.stringify(reviewData)}.

        Return the results in the following JSON format:
        {
          "places": [
            { "id": "place_id_1" },
            { "id": "place_id_2" },
            ...
          ],
          "reviews": [
            { "id": "review_id_1" },
            { "id": "review_id_2" },
            ...
          ]
        }`,
      },
    ],
  });

  // Step 3: Parse the JSON response
  const result = JSON.parse(response.choices[0].message?.content || "{}");
  const relevantPlaceIds = result.places?.map((place: { id: string }) => place.id) || [];
  const relevantReviewIds = result.reviews?.map((review: { id: string }) => review.id) || [];

  // Step 4: Filter places and reviews based on IDs
  const filteredPlaces = places.filter(place => relevantPlaceIds.includes(place.googlePlaceId));
  const filteredReviews = reviews.filter(review => relevantReviewIds.includes(review._id!.toString()));

  // Step 5: Return the filtered data
  return {
    places: filteredPlaces,
    reviews: filteredReviews,
  };
};

export const newPerformHybridQuery = async (
  query: string,
  queryParams: StructuredQueryParams
): Promise<QueryResponse> => {
  const {
    distanceAwayQuery,
    placeName,
    reviewDateRange,
    itemsOrdered,
    additionalPlaceFilters,
    additionalReviewFilters,
  } = queryParams;

  const { lat, lng, radius } = distanceAwayQuery || {};

  try {
    // Step 1: Perform structured filtering on places and reviews
    let placeQuery: any = {};
    let reviewQuery: any = {};

    // Would Return filter
    // Date range filter
    if (reviewDateRange?.start || reviewDateRange?.end) {
      reviewQuery['structuredReviewProperties.dateOfVisit'] = {};
      if (reviewDateRange.start) {
        reviewQuery['structuredReviewProperties.dateOfVisit'].$gte = reviewDateRange.start;
      }
      if (reviewDateRange.end) {
        reviewQuery['structuredReviewProperties.dateOfVisit'].$lte = reviewDateRange.end;
      }
    }

    // Items ordered filter
    if (itemsOrdered && itemsOrdered.length > 0) {
      reviewQuery["freeformReviewProperties.itemReviews"] = {
        $elemMatch: { item: { $regex: new RegExp(itemsOrdered.join("|"), "i") } },
      };
    }

    // Additional review filters
    if (additionalReviewFilters) {
      Object.assign(reviewQuery, additionalReviewFilters);
    }

    // Fetch structured reviews
    let reviews: IVisitReview[] = await VisitReview.find(reviewQuery);

    // Extract unique place IDs from the filtered reviews
    const placeIdsWithReviews = Array.from(new Set(reviews.map((review) => review.placeId)));
    if (placeIdsWithReviews.length === 0) {
      return { places: [], reviews: [] };
    }

    // Construct place query
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      placeQuery['geometry.location'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius * 1609.34, // Convert miles to meters
        },
      };
    }

    // Place name filter
    if (placeName) {
      placeQuery['name'] = { $regex: new RegExp(placeName, 'i') }; // Case-insensitive partial match
    }

    // Additional place filters
    if (additionalPlaceFilters) {
      Object.assign(placeQuery, additionalPlaceFilters);
    }

    // Restrict places to those with matching reviews
    placeQuery['googlePlaceId'] = { $in: placeIdsWithReviews };

    // Fetch structured places
    let places: IMongoPlace[] = await MongoPlaceModel.find(placeQuery);

    // Refine reviews to those matching structured places
    const filteredPlaceIds = places.map((place) => place.googlePlaceId);
    reviews = reviews.filter((review) => filteredPlaceIds.includes(review.placeId));

    // Step 2: Perform natural language query using OpenAI

    const reviewData = reviews.map((review) => ({
      id: review._id,
      text: review.reviewText,
      dateOfVisit: review.dateOfVisit,
      googlePlaceId: review.placeId,
    }));

    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that retrieves relevant places and reviews based on a natural language query. Only include reviews that explicitly match the query. Respond with JSON data only, without additional commentary.`,
        },
        {
          role: "user",
          content: `Find relevant places and reviews for the query: "${query}". 
          The reviews are: ${JSON.stringify(reviewData)}.
    
          Only include reviews that explicitly contain the term "${query}" or closely match it contextually. Do not include reviews that do not mention "${query}". 
    
          Return the results in the following JSON format:
          {
            "places": [
              { "id": "place_id_1" },
              { "id": "place_id_2" },
              ...
            ],
            "reviews": [
              { "id": "review_id_1" },
              { "id": "review_id_2" },
              ...
            ]
          }`,
        },
      ],
    });

    const result = JSON.parse(response.choices[0].message?.content || "{}");
    const relevantPlaceIds = result.places?.map((place: { id: string }) => place.id) || [];
    const relevantReviewIds = result.reviews?.map((review: { id: string }) => review.id) || [];

    // Step 3: Combine structured and full-text results
    const hybridPlaces = places.filter((place) => relevantPlaceIds.includes(place.googlePlaceId));
    const hybridReviews = reviews.filter((review) => relevantReviewIds.includes(review._id!.toString()));

    // Step 4: Return combined results
    return {
      places: hybridPlaces,
      reviews: hybridReviews,
    };
  } catch (error) {
    console.error("Error performing hybrid query:", error);
    throw new Error("Failed to perform hybrid query.");
  }
};
