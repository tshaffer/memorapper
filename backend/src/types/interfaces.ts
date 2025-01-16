import { IMongoPlace } from "../models";
import { IAccountPlaceReview } from "../models/AccountPlaceReview";
import { ItemReview } from "./entities";
import { SearchDistanceFilter } from "./enums";
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

export interface AccountUserInputById {
  accountUserId: string; // Foreign key to AccountUser
  accountUserInputId: string; // Foreign key to AccountUserInput
}

export interface UserPlaceSummary {
  userPlaceSummaryId: string; // unique key
  accountId: string; // Foreign key to Account
  placeId: string; // Foreign key to Place
  accountUserInputs: AccountUserInputById[];
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
  distanceAwayFilter: SearchDistanceFilter;
  openNowFilter: boolean;
}

export interface SearchResponse {
  places: GooglePlace[];
  reviews: AccountPlaceReview[];
}

export interface QueryResponse {
  places: IMongoPlace[];
  reviews: IAccountPlaceReview[];
}

export interface ChatResponse {
  reviewText: string;
  itemReviews: ItemReview[];
  updatedReviewText: string;
}

