import { Request, Response } from 'express';
import { IMongoPlace, IReview } from "../models";
import MongoPlace from "../models/MongoPlace";
import Review from "../models/Review";
import { QueryResponse, GooglePlace, MemoRappReview, PlacesReviewsCollection, ParsedQuery, StructuredQueryParams, FilterResultsParams } from "../types";
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
  req: Request<{}, {}, { filter: FilterResultsParams }>,
  res: Response
): Promise<void> => {
  const { filter } = req.body;
  const { distanceAwayFilter, openNowFilter, wouldReturnFilter } = filter;
  console.log('filterResultsHandler:', distanceAwayFilter, openNowFilter, wouldReturnFilter);

  res.sendStatus(200);
}


export const filterResults = async (
  queryParams: FilterResultsParams,
  initialPlaces: IMongoPlace[],
  initialReviews: IReview[]
): Promise<QueryResponse> => {
  try {
    let places = initialPlaces;
    let reviews = initialReviews;

    return { places, reviews };
  } catch (error) {
    console.error('Error retrieving filtered places and reviews:', error);
    throw new Error('Failed to retrieve filtered data.');
  }
};