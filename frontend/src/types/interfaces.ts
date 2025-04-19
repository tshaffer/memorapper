import { DistanceAwayFilterValues, OpenFilterMode, PlaceType, RestaurantType } from "./enums";

export interface Filters {
  distanceAwayFilter: DistanceAwayFilterValues;
  placeTypes: PlaceType[];
  restaurantTypes: RestaurantType[];
  openFilterMode: OpenFilterMode;
  openMeals: OpenMealsSpec;
}

export interface FilterResultsParams {
  distanceAwayFilter: DistanceAwayFilterValues;
  placeTypes: PlaceType[];
  restaurantTypes: RestaurantType[];
  openFilterMode: OpenFilterMode;
  openMeals: OpenMealsSpec;
}

export interface SearchQuery {
  query: string;
  distanceAway: DistanceAwayQuery;
  placeTypes: PlaceType[];
  restaurantTypes: RestaurantType[];
  openFilterMode: OpenFilterMode;
  openMeals: OpenMealsSpec;
}

export interface DistanceFilter {
  enabled: boolean;
  useCurrentLocation: boolean;
  specificLocation: google.maps.LatLngLiteral | null;
  distance: number;
}

export interface OpenMealsSpec {
  BREAKFAST: boolean;
  LUNCH: boolean;
  DINNER: boolean;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

