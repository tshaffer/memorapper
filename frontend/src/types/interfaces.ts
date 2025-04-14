import { DistanceAwayFilterValues, OpenFilterMode } from "./enums";

export interface FilterResultsParams {
  distanceAwayFilter: DistanceAwayFilterValues;
  openFilterMode: OpenFilterMode;
  openMeals: OpenMealsSpec;
}

export interface SearchQuery {
  query: string;
  distanceAway: DistanceAwayQuery;
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
  openFilterMode: OpenFilterMode;
  openMeals: OpenMealsSpec;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

