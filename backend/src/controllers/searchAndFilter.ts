import { Request, Response } from 'express';
import { SearchQuery, Filters, SearchResponse, Place, PlaceWithGooglePlace } from "../types";
import { filterResults } from './filterResults';
import { getPlaces } from './places';

export const searchAndFilterHandler = async (
  req: Request<{}, {}, {
    searchQuery: SearchQuery,
  }>,
  res: Response
): Promise<void> => {
  const { searchQuery } = req.body;
  const { distanceAway, placeTypes, restaurantTypes, openFilterMode, openMeals }: SearchQuery = searchQuery;

  try {

    const places: PlaceWithGooglePlace[] = await getPlaces();

    const filterResultsParams: Filters = {
      distanceAway: distanceAway.radius,
      placeTypes: placeTypes,
      restaurantTypes: restaurantTypes,
      openFilterMode: openFilterMode,
      openMealsFilter: openMeals,
    };
    const searchResponse: SearchResponse = await (filterResults(filterResultsParams, places, { lat: distanceAway.lat, lng: distanceAway.lng }));

    res.status(200).json(searchResponse);


  } catch (error) {
    console.error('Error handling unified query:', error);
    res.status(500).json({ error: 'An error occurred while querying reviews.' });
  }
}

