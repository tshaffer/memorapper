import { OpenFilterMode, PlaceType, RestaurantType, Distance } from "./enums";
import { PlaceWithGooglePlace } from "./place";

export interface FilterResultsParams {
  distanceAway: Distance;
  placeTypes: PlaceType[];
  restaurantTypes: RestaurantType[];
  openFilterMode: OpenFilterMode;
  openMealsFilter: OpenMealsSpec;
}

export interface SearchQuery {
  query: string;
  distanceAwayQuery: DistanceAwayQuery;
  placeTypes: PlaceType[];
  restaurantTypes: RestaurantType[];
  openFilterMode: OpenFilterMode;
  openMeals: OpenMealsSpec;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

export interface OpenMealsSpec {
  BREAKFAST: boolean;
  LUNCH: boolean;
  DINNER: boolean;
}

export interface SearchResponse {
  places: PlaceWithGooglePlace[];
}

