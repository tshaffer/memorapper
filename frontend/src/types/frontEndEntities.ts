import { ItemReview, MemoRappReview } from "./entities";
import { SearchDistanceFilter, WouldReturn } from "./enums";
import { GooglePlace } from "./googlePlace";

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

export interface ReviewUIFilters {
  queryText: string | null;
  distanceFilter: DistanceFilter;
  wouldReturnFilter: WouldReturnFilter;
}

export interface SearchUIFilters {
  distanceAwayFilter: SearchDistanceFilter;
  openNowFilter: boolean;
  wouldReturnFilter: WouldReturnFilter;
}