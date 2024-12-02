import { Request, Response } from 'express';
import { IReview } from "../models";
import MongoPlace from "../models/MongoPlace";
import Review from "../models/Review";
import { FilterQueryParams, QueryResponse, GooglePlace, MemoRappReview, PlacesReviewsCollection, ParsedQuery, StructuredQueryParams } from "../types";
import { convertMongoPlacesToGooglePlaces } from "../utilities";
import { buildStructuredQueryParamsFromParsedQuery, parseQueryWithChatGPT, performHybridQuery, performNaturalLanguageQuery, performStructuredQuery } from './naturalLanguageQuery';
import { getFilteredPlacesAndReviews } from './filterQuery';

export const unifiedQueryHandler = async (
  req: Request<{}, {}, { query: string; filterQueryParams: FilterQueryParams }>,
  res: Response
): Promise<void> => {
  const { query, filterQueryParams } = req.body;

  try {
    // Step 1: Perform natural language query
    const parsedQuery: ParsedQuery = await parseQueryWithChatGPT(query);
    const { queryType, queryParameters } = parsedQuery;

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

    const { places: nlPlaces, reviews: nlReviews } = naturalLanguageResponse;

    // Step 2: Perform structured filtering using natural language query results
    const filteredResponse: QueryResponse = await getFilteredPlacesAndReviews(
      filterQueryParams,
      nlPlaces,
      nlReviews
    );

    // Step 3: Prepare response
    const googlePlaces: GooglePlace[] =
      convertMongoPlacesToGooglePlaces(filteredResponse.places);
    const memoRappReviews: MemoRappReview[] = filteredResponse.reviews.map(
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
};
