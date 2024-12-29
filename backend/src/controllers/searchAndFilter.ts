import { Request, Response } from 'express';
import { IMongoPlace, IReview } from "../models";
import MongoPlace from "../models/MongoPlace";
import Review from "../models/Review";
import { QueryResponse, GooglePlace, ParsedQuery, StructuredQueryParams, FilterResultsParams, SearchResponse, SearchQuery } from "../types";
import { convertMongoPlacesToGooglePlaces } from "../utilities";
import { buildStructuredQueryParamsFromParsedQuery, parseQueryWithChatGPT, performHybridQuery, performNaturalLanguageQuery, performStructuredQuery } from './naturalLanguageQuery';
import { filterResults } from './filterResults';

export const searchAndFilterHandler = async (
  req: Request<{}, {}, {
    searchQuery: SearchQuery,
  }>,
  res: Response
): Promise<void> => {
  const { searchQuery } = req.body;
  const { query, distanceAway, isOpenNow, wouldReturn }: SearchQuery = searchQuery;

  try {

    let nlPlaces: IMongoPlace[] = [];
    let nlReviews: IReview[] = [];

    if (!query) {

      nlPlaces = await MongoPlace.find({});
      nlReviews = await Review.find({});

    } else {

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

      nlPlaces = naturalLanguageResponse.places;
      nlReviews = naturalLanguageResponse.reviews;
    }

    // Step 2: Perform structured filtering using natural language query results
    const filterResultsParams: FilterResultsParams = {
      distanceAwayFilter: distanceAway.radius,
      openNowFilter: isOpenNow,
      wouldReturnFilter: wouldReturn,
    };
    const googlePlaces: GooglePlace[] = convertMongoPlacesToGooglePlaces(nlPlaces);
    const searchResponse: SearchResponse = await (filterResults(filterResultsParams, googlePlaces, nlReviews, { lat: distanceAway.lat, lng: distanceAway.lng }));

    res.status(200).json(searchResponse);

  } catch (error) {
    console.error('Error handling unified query:', error);
    res.status(500).json({ error: 'An error occurred while querying reviews.' });
  }
}

