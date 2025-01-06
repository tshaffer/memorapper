import { RestaurantType, WouldReturn } from "./enums";
import { Filters } from "./frontEndEntities";
import { GooglePlace } from "./googlePlace";
import { AddressComponent } from "./place";

export interface RatingsUI {
  showSecondaryRating: boolean;
  primaryRatingLabel: string;
  secondaryRatingLabel: string;
}

export interface Settings {
  filters: Filters;
  ratingsUI: RatingsUI;
}

export interface MemoRappReview {
  _id?: any;
  place_id: string;
  structuredReviewProperties: StructuredReviewProperties;
  freeformReviewProperties: FreeformReviewProperties;
}

export interface FuturePlaceRequestBody {
  _id?: string;
  place: GooglePlace;
  comments: string;
  rating: number;
}


export interface FuturePlace {
  _id?: any;
  place_id: string;
  comments: string;
  rating: number;
}

export interface EditableFuturePlace {
  place: GooglePlace;
  comments: string;
  rating: number;

  // review: MemoRappReview;
}

export interface FuturePlaceData {
  _id: string;
  place: GooglePlace | null;
  comments: string;
  rating: number | null;
  restaurantName: string;
}

export interface StructuredReviewProperties {
  dateOfVisit: string;
  primaryRating: number;
  secondaryRating?: number;
  wouldReturn: WouldReturn | null;
  reviewerId: string;
}

export interface FreeformReviewProperties {
  reviewText: string;
  itemReviews: ItemReview[];
}

export interface ItemReview {
  item: string;
  review: string;
}

export interface SubmitReviewBody {
  _id?: string;
  place: GooglePlace;
  structuredReviewProperties: StructuredReviewProperties;
  freeformReviewProperties: FreeformReviewProperties;
  reviewText: string;
  sessionId: string;
}

export interface PreviewRequestBody {
  reviewText: string;
  sessionId: string;
}

export interface ChatRequestBody {
  userInput: string;
  sessionId: string;
  reviewText: string;
}

export interface MemoRappPlace {
  place_id: string;
  name: string;
  restaurantType: RestaurantType;
  address_components?: AddressComponent[];
  formatted_address: string;
  website: string;
  opening_hours?: google.maps.places.PlaceOpeningHours;
  price_level?: number;
  vicinity?: string;
}

export interface QueryRequestBody {
  query: string;
}

export interface PreviewResponse {
  freeformReviewProperties: FreeformReviewProperties;
}

export interface ChatResponse {
  freeformReviewProperties: FreeformReviewProperties;
  updatedReviewText: string;
}

export interface UserEntity {
  id: string;
  userName: string;
  password: string;
  email: string;
}

