import { ItemReview, MemoRappReview } from "./entities";
import { DistanceAwayFilter, WouldReturn } from "./enums";
import { GooglePlace } from "./googlePlace";
import { DistanceAwayQuery } from "./queries";

export interface EditableReview {
  place: GooglePlace;
  review: MemoRappReview;
}

export interface RestaurantDetailsProps {
  place: GooglePlace;
  reviews: MemoRappReview[];
}

export interface ReviewEntity {
  googlePlace: GooglePlace;
  dateOfVisit: string;
  wouldReturn: WouldReturn | null;
  itemReviews: ItemReview[];
  reviewerId: string;
  reviewText: string;
}

export interface DistanceFilter {
  enabled: boolean;
  useCurrentLocation: boolean;
  specificLocation: google.maps.LatLngLiteral | null;
  distance: number;
}

export interface WouldReturnFilter {
  enabled: boolean;
  values: {
    yes: boolean;
    no: boolean;
    notSure: boolean;
  };
}

export interface SearchQuery {
  query: string;
  distanceAway: DistanceAwayQuery;
  isOpenNow: boolean;
  wouldReturn: WouldReturnFilter;
}

export interface Filters {
  distanceAway: DistanceAwayFilter;
  wouldReturnFilter: WouldReturnFilter;
  isOpenNowEnabled: boolean;
}