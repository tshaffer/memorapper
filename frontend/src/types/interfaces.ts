import { ItemReview } from "./entities";
import { DistanceAwayFilterValues } from "./enums";
import { GooglePlace } from "./googlePlace";

export interface DiningGroup {
  diningGroupId: string; // unique key
  diningGroupName: string;
}

export interface Diner {
  dinerId: string; // unique key
  diningGroupId: string; // Foreign key to DiningGroup
  dinerName: string;
}

export interface DinerRestaurantReview {
  dinerRestaurantReviewId: string; // unique key
  dinerId: string; // Foreign key to Diner
  rating: number;
  comments: string;
}

export interface DinerRestaurantReviewRef {
  dinerRestaurantReviewId: string; // unique key
  dinerId: string; // Foreign key to Diner
}

export interface NewRestaurant {
  _id?: string;
  newRestaurantId: string;
  googlePlace: GooglePlace | undefined;
  diningGroupId: string;
  restaurantName: string;
  interestLevel: number;
  comments: string;
}

export interface ReviewedRestaurant {
  reviewedRestaurantId: string; // unique key
  diningGroupId: string; // Foreign key to DiningGroup
  googlePlaceId: string; // Foreign key to Place
  dinerRestaurantReviews: DinerRestaurantReviewRef[];
}

export interface ReviewedRestaurantWithPlace {
  reviewedRestaurantId: string; // unique key
  diningGroupId: string; // Foreign key to DiningGroup
  googlePlace: GooglePlace; // Foreign key to Place
  dinerRestaurantReviews: DinerRestaurantReviewRef[];
}

export interface VisitReview {
  diningGroupId: string;
  googlePlaceId: string;
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
  diningGroupId: string;
  place: GooglePlace;
  dinerRestaurantReviews: DinerRestaurantReview[];
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
  reviews: VisitReview[];
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
  diningGroupid: string;
  place: GooglePlace | null;
  dinerRestaurantReviews: DinerRestaurantReview[];
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

export interface RestaurantDetailsProps {
  reviewedRestaurant: ReviewedRestaurantWithPlace;
  dinerRestaurantReviews: DinerRestaurantReview[];
  visitReviews: VisitReview[];
  diners: Diner[];
}

