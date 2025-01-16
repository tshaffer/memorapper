import { Request, Response } from 'express';
import { IMongoPlace } from "../models";
import MongoPlaceModel from "../models/MongoPlace";
import { GooglePlace, ParsedQuery, SearchQuery, FilterResultsParams, SearchResponse, QueryResponse, StructuredQueryParams } from "../types";
import { convertMongoPlacesToGooglePlaces } from "../utilities";
import { buildStructuredQueryParamsFromParsedQuery, newPerformHybridQuery, newPerformNaturalLanguageQuery, parseQueryWithChatGPT, performNewStructuredQuery } from './naturalLanguageQuery';
import AccountPlaceReviewModel, { IAccountPlaceReview } from '../models/AccountPlaceReview';
import { filterResults } from './filterResults';

export const searchAndFilterHandler = async (
  req: Request<{}, {}, {
    searchQuery: SearchQuery,
  }>,
  res: Response
): Promise<void> => {
  const { searchQuery } = req.body;
  const { query, distanceAway, isOpenNow }: SearchQuery = searchQuery;

  try {

    let nlPlaces: IMongoPlace[] = [];
    let nlReviews: IAccountPlaceReview[] = [];

    if (!query) {

      nlPlaces = await MongoPlaceModel.find({});
      nlReviews = await AccountPlaceReviewModel.find({});

    } else {

      // Step 1: Perform natural language query
      const parsedQuery: ParsedQuery = await parseQueryWithChatGPT(query);
      const { queryType, queryParameters } = parsedQuery;

      let naturalLanguageResponse: QueryResponse = { places: [], reviews: [] };

      if (queryType === 'structured') {
        const structuredQueryParams: StructuredQueryParams =
          buildStructuredQueryParamsFromParsedQuery(parsedQuery);
        naturalLanguageResponse = await performNewStructuredQuery(structuredQueryParams);
      } else if (queryType === 'full-text') {
        const places = await MongoPlaceModel.find({});
        const reviews = await AccountPlaceReviewModel.find({});
        naturalLanguageResponse = await newPerformNaturalLanguageQuery(
          query,
          places,
          reviews
        );
      } else {
        const structuredQueryParams: StructuredQueryParams =
          buildStructuredQueryParamsFromParsedQuery(parsedQuery);
        naturalLanguageResponse = await newPerformHybridQuery(
          query,
          structuredQueryParams
        );
      }


      nlPlaces = naturalLanguageResponse.places;
      nlReviews = naturalLanguageResponse.reviews;
    }


    // Step 2: Perform structured filtering using natural language query results
    const filterResultsParams: FilterResultsParams = {
      distanceAwayFilter: distanceAway.radius,
      openNowFilter: isOpenNow,
    };
    const googlePlaces: GooglePlace[] = convertMongoPlacesToGooglePlaces(nlPlaces);
    const searchResponse: SearchResponse = await (filterResults(filterResultsParams, googlePlaces, nlReviews, { lat: distanceAway.lat, lng: distanceAway.lng }));

    res.status(200).json(searchResponse);


  } catch (error) {
    console.error('Error handling unified query:', error);
    res.status(500).json({ error: 'An error occurred while querying reviews.' });
  }
}

