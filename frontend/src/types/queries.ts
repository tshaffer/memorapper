import { MemoRappReview } from "./entities";
import { GooglePlace } from "./googlePlace";

export interface WouldReturnQuery {
  yes: boolean;
  no: boolean;
  notSure: boolean;
}

export type WouldReturnQuerySpec = (boolean | null)[];

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
  itemsOrderedQuery?: string[];
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
