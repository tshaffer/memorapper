import { ItemReview } from "./entities";
import { DistanceAwayFilterValues } from "./enums";
import { GooglePlace } from "./googlePlace";

export interface Account {
  accountId: string; // unique key
  accountName: string;
}

export interface AccountUser {
  accountUserId: string; // unique key
  accountId: string; // Foreign key to Account
  userName: string;
}

export interface AccountUserInput {
  accountUserInputId: string; // unique key
  accountUserId: string; // Foreign key to AccountUser
  rating: number;
  comments: string;
}

export interface AccountUserInterfaceRef {
  accountUserInputId: string; // unique key
  accountUserId: string; // Foreign key to AccountUser
}

export interface UserPlaceSummary {
  userPlaceSummaryId: string; // unique key
  accountId: string; // Foreign key to Account
  placeId: string; // Foreign key to Place
  accountUserInputs: AccountUserInterfaceRef[];
}

export interface AccountPlaceReview {
  accountId: string;
  placeId: string;
  dateOfVisit: string;
  reviewText: string;
  itemReviews: ItemReview[];
}

export interface ChatGPTOutput {
  reviewText: string;
  itemReviews: ItemReview[];
}

export interface PreviewResponse {
  chatGPTOutput: ChatGPTOutput;
}

export interface SubmitReviewBody {
  _id?: string;
  accountId: string;
  place: GooglePlace;
  accountUserInputs: AccountUserInput[];
  dateOfVisit: string;
  reviewText: string;
  itemReviews: ItemReview[];
  sessionId: string;
}

export interface FilterResultsParams {
  distanceAwayFilter: DistanceAwayFilterValues;
  openNowFilter: boolean;
}

export interface ExtendedGooglePlace extends GooglePlace {
  reviews: AccountPlaceReview[];
}

export interface RestaurantVisitInstance {
  dateOfVisit: string;
  reviewText: string;
  itemReviews: ItemReview[];
}

export interface ChatResponse {
  reviewText: string;
  itemReviews: ItemReview[];
  updatedReviewText: string;
}

export type ChatMessage = {
  role: 'user' | 'ai';
  message: string | ChatGPTOutput;
};

export interface ReviewData {
  _id: string;
  accountId: string;
  place: GooglePlace | null;
  accountUserInputs: AccountUserInput[];
  dateOfVisit: string | null;
  reviewText: string | null;
  itemReviews: ItemReview[];
  sessionId: string | null;
  restaurantName: string;
  chatHistory: ChatMessage[]; // Chat history
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
