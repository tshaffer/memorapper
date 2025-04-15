import { Request, Response } from 'express';
import { IMongoPlace } from "../models";
import MongoPlaceModel from "../models/MongoPlace";
import { GooglePlace, SearchQuery, FilterResultsParams, SearchResponse } from "../types";
import { convertMongoPlacesToGooglePlaces } from "../utilities";
import { filterResults } from './filterResults';

export const searchAndFilterHandler = async (
  req: Request<{}, {}, {
    searchQuery: SearchQuery,
  }>,
  res: Response
): Promise<void> => {
  const { searchQuery } = req.body;
  const { distanceAway, placeType, restaurantType, openFilterMode, openMeals }: SearchQuery = searchQuery;

  try {

    const mongoPlaces: IMongoPlace[] = await MongoPlaceModel.find({});

    const filterResultsParams: FilterResultsParams = {
      distanceAwayFilter: distanceAway.radius,
      placeTypeFilter: placeType,
      restaurantTypeFilter: restaurantType,
      openFilterMode: openFilterMode,
      openMealsFilter: openMeals,
    };
    const googlePlaces: GooglePlace[] = convertMongoPlacesToGooglePlaces(mongoPlaces);
    const searchResponse: SearchResponse = await (filterResults(filterResultsParams, googlePlaces, { lat: distanceAway.lat, lng: distanceAway.lng }));

    res.status(200).json(searchResponse);


  } catch (error) {
    console.error('Error handling unified query:', error);
    res.status(500).json({ error: 'An error occurred while querying reviews.' });
  }
}

