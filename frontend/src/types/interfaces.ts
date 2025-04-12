import { DistanceAwayFilterValues } from "./enums";

export interface FilterResultsParams {
  distanceAwayFilter: DistanceAwayFilterValues;
  openNowFilter: boolean;
}

export interface SearchQuery {
  query: string;
  distanceAway: DistanceAwayQuery;
  isOpenNow: boolean;
}

export interface DistanceFilter {
  enabled: boolean;
  useCurrentLocation: boolean;
  specificLocation: google.maps.LatLngLiteral | null;
  distance: number;
}

export interface Filters {
  distanceAwayFilter: DistanceAwayFilterValues;
  isOpenNowFilterEnabled: boolean;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

