import { DistanceAwayFilterValues, OpenFilterMode, PlaceType, PlaceTypeQuery, RestaurantType, RestaurantTypeQuery } from "./enums";

export interface FilterResultsParams {
  distanceAwayFilter: DistanceAwayFilterValues;
  placeType: PlaceTypeQuery;
  restaurantType: RestaurantTypeQuery;
  openFilterMode: OpenFilterMode;
  openMeals: OpenMealsSpec;
}

export interface SearchQuery {
  query: string;
  distanceAway: DistanceAwayQuery;
  placeType: PlaceTypeQuery;
  restaurantType: RestaurantTypeQuery;
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

export interface Filters {
  distanceAwayFilter: DistanceAwayFilterValues;
  placeType: PlaceTypeQuery;
  openFilterMode: OpenFilterMode;
  openMeals: OpenMealsSpec;
  restaurantType: RestaurantTypeQuery;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

