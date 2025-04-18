import { OpenFilterMode, PlaceType, RestaurantType, SearchDistanceFilter } from "./enums";
import { PlaceWithGooglePlace } from "./place";

export interface FilterResultsParams {
  distanceAwayFilter: SearchDistanceFilter;
  placeTypesFilter: PlaceType[];
  restaurantsTypeFilter: RestaurantType[];
  openFilterMode: OpenFilterMode;
  openMealsFilter: OpenMealsSpec;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

export interface SearchQuery {
  query: string;
  distanceAway: DistanceAwayQuery;
  placeTypes: PlaceType[];
  restaurantTypes: RestaurantType[];
  openFilterMode: OpenFilterMode;
  openMeals: OpenMealsSpec;
}

export interface OpenMealsSpec {
  BREAKFAST: boolean;
  LUNCH: boolean;
  DINNER: boolean;
}

export interface SearchResponse {
  places: PlaceWithGooglePlace[];
}

