import { MemoRappReview } from "./entities";
import { DistanceAwayFilter } from "./enums";
import { WouldReturnFilter } from "./frontEndEntities";
import { GooglePlace } from "./googlePlace";

export interface WouldReturnQuery {
  yes: boolean;
  no: boolean;
  notSure: boolean;
}

export interface QueryParameters {
  lat?: number;
  lng?: number;
  radius?: number;
  restaurantName?: string;
  dateRange?: any;
  wouldReturn?: WouldReturnQuery;
  itemsOrdered?: any;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

export interface FilterQueryParams {
  naturalLanguageQuery?: string;
  distanceAwayQuery?: DistanceAwayQuery;
  wouldReturnQuery?: WouldReturnQuery;
}

export interface PlacesReviewsCollection {
  places: GooglePlace[];
  reviews: MemoRappReview[];
}

export interface WouldReturnQuery {
  yes: boolean;
  no: boolean;
  notSure: boolean;
}

export interface FilterResultsParams {
  distanceAwayFilter: DistanceAwayFilter;
  openNowFilter: boolean;
  wouldReturnFilter: WouldReturnFilter;
}

export interface SearchResponse {
  places: GooglePlace[];
  reviews: MemoRappReview[];
}

