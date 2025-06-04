import { Request, Response } from 'express';
import { SearchQuery, Filters, SearchResponse, MrPlaceWithGooglePlace } from "../types";
import { filterResults } from './filterResults';
import { getMrPlaces, getMrPlacesWithGooglePlace } from './places';

export const searchAndFilterHandler = async (
  req: Request<{}, {}, {
    searchQuery: SearchQuery,
  }>,
  res: Response
): Promise<void> => {
  const { searchQuery } = req.body;
  const { distanceSpec, placeTypes, restaurantTypes, restaurantOpen, openMeals }: SearchQuery = searchQuery;

  try {

    const places: MrPlaceWithGooglePlace[] = await getMrPlacesWithGooglePlace();

    const filterResultsParams: Filters = {
      distanceAway: distanceSpec.radius,
      placeTypes,
      restaurantTypes,
      restaurantOpen,
      openMeals,
    };
    const searchResponse: SearchResponse = await (filterResults(filterResultsParams, places, { lat: distanceSpec.lat, lng: distanceSpec.lng }));

    res.status(200).json(searchResponse);


  } catch (error) {
    console.error('Error handling unified query:', error);
    res.status(500).json({ error: 'An error occurred while querying reviews.' });
  }
}

