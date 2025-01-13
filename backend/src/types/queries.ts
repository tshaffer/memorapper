import { MemoRappReview } from "./entities";
import { SearchDistanceFilter } from "./enums";
import { GooglePlace } from "./googlePlace";

interface DateRange {
  start: string;
  end: string;
}

interface QueryParameters {
  location?: string;
  radius?: number;
  dateRange: DateRange;
  restaurantName?: string;
  wouldReturn: boolean | null;
  itemsOrdered: any;
}


interface WouldReturnQuery {
  yes: boolean;
  no: boolean;
  notSure: boolean;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

interface WouldReturnFilter {
  enabled: boolean;
  values: {
    yes: boolean;
    no: boolean;
    notSure: boolean;
  };
}

export interface FilterResultsParams {
  distanceAwayFilter: SearchDistanceFilter;
  openNowFilter: boolean;
  wouldReturnFilter: WouldReturnFilter;
}

export interface PlacesReviewsCollection {
  places: GooglePlace[];
  reviews: MemoRappReview[];
}

export interface StructuredQueryParams {
  distanceAwayQuery?: {
    lat: number;
    lng: number;
    radius: number; // in miles
  };
  wouldReturn?: WouldReturnQuery;
  placeName?: string; // Partial name match for places
  reviewDateRange?: {
    start?: string; // ISO date string
    end?: string;   // ISO date string
  };
  itemsOrdered?: string[]; // Array of item names for filtering reviews
  additionalPlaceFilters?: Record<string, any>; // Additional Mongo filters for places
  additionalReviewFilters?: Record<string, any>; // Additional Mongo filters for reviews
}

export interface ParsedQuery {
  queryType: 'structured' | 'full-text' | 'hybrid';
  queryParameters: QueryParameters;
}

export interface SearchResponse {
  places: GooglePlace[];
  reviews: MemoRappReview[];
}

export interface SearchQuery {
  query: string;
  distanceAway: DistanceAwayQuery;
  isOpenNow: boolean;
  wouldReturn: WouldReturnFilter;
}