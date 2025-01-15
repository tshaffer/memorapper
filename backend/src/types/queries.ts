interface DateRange {
  start: string;
  end: string;
}

interface QueryParameters {
  location?: string;
  radius?: number;
  dateRange: DateRange;
  restaurantName?: string;
  itemsOrdered: any;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

export interface StructuredQueryParams {
  distanceAwayQuery?: {
    lat: number;
    lng: number;
    radius: number; // in miles
  };
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

export interface SearchQuery {
  query: string;
  distanceAway: DistanceAwayQuery;
  isOpenNow: boolean;
}