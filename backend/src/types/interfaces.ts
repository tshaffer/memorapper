import { OpenFilterMode, PlaceTypeQuery, RestaurantType, RestaurantTypeQuery, SearchDistanceFilter } from "./enums";
import { PlaceWithGooglePlace } from "./place";

export interface FilterResultsParams {
  distanceAwayFilter: SearchDistanceFilter;
  placeTypesFilter: PlaceTypeQuery[];
  restaurantsTypeFilter: RestaurantTypeQuery[];
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
  placeTypes: PlaceTypeQuery[];
  restaurantTypes: RestaurantTypeQuery[];
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

