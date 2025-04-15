import { SearchDistanceFilter } from "./enums";

export interface FilterResultsParams {
  distanceAwayFilter: SearchDistanceFilter;
  openNowFilter: boolean;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

export interface SearchQuery {
  query: string;
  distanceAway: DistanceAwayQuery;
  isOpenNow: boolean;
}