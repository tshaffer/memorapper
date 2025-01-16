import { IMongoPlace } from "../models";
import { IVisitReview } from "../models/VisitReview";
import { ItemReview } from "./entities";
import { SearchDistanceFilter } from "./enums";
import { GooglePlace } from "./googlePlace";

export interface DiningGroup {
  diningGroupId: string; // unique key
  diningGroupName: string;
}

export interface Diner {
  dinerId: string; // unique key
  diningGroupId: string; // Foreign key to Account
  dinerName: string;
}

export interface DinerRestaurantReview {
  dinerRestaurantReviewId: string; // unique key
  dinerId: string; // Foreign key to AccountUser
  rating: number;
  comments: string;
}

export interface DinerRestaurantReview {
  dinerId: string; // Foreign key to AccountUser
  dinerRestaurantReviewId: string; // Foreign key to AccountUserInput
}

export interface RestaurantReview {
  restaurantReviewId: string; // unique key
  diningGroupId: string; // Foreign key to Account
  placeId: string; // Foreign key to Place
  dinerRestaurantReviews: DinerRestaurantReview[];
}

export interface VisitReview {
  diningGroupId: string;
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
  accountUserInputs: DinerRestaurantReview[];
  dateOfVisit: string;
  reviewText: string;
  itemReviews: ItemReview[];
  sessionId: string;
}

export interface FilterResultsParams {
  distanceAwayFilter: SearchDistanceFilter;
  openNowFilter: boolean;
}

export interface SearchResponse {
  places: GooglePlace[];
  reviews: VisitReview[];
}

export interface QueryResponse {
  places: IMongoPlace[];
  reviews: IVisitReview[];
}

export interface ChatResponse {
  reviewText: string;
  itemReviews: ItemReview[];
  updatedReviewText: string;
}

