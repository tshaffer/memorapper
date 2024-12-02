import { ItemReview, MemoRappReview } from "./entities";
import { GooglePlace } from "./googlePlace";

export interface EditableReview {
  place: GooglePlace;
  review: MemoRappReview;
}

export interface ReviewEntity {
  googlePlace: GooglePlace;
  dateOfVisit: string;
  wouldReturn: boolean | null;
  itemReviews: ItemReview[];
  reviewer: string;
  reviewText: string;
}

export interface DistanceFilter {
  enabled: boolean;
  useCurrentLocation: boolean;
  fromLocation: google.maps.LatLngLiteral | null;
  distance: number;
  specificLocation: string | null;
}

export interface WouldReturnFilter {
  enabled: boolean;
  values: {
    yes: boolean;
    no: boolean;
    notSure: boolean;
  };
}

export interface ItemsOrderedFilter {
  enabled: boolean;
  selectedItems: string[];
}

export interface ReviewUIFilters {
  queryText: string | null;
  distanceFilter: DistanceFilter;
  wouldReturnFilter: WouldReturnFilter;
  itemsOrderedFilter: ItemsOrderedFilter;
}
