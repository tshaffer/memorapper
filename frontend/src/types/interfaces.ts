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

export interface NewPreviewResponse {
  chatGPTOutput: ChatGPTOutput;
}

export interface NewSubmitReviewBody {
  _id?: string;
  accountId: string;
  place: GooglePlace;
  accountUserInputs: AccountUserInput[];
  dateOfVisit: string;
  reviewText: string;
  itemReviews: ItemReview[];
  sessionId: string;
}

export interface NewFilterResultsParams {
  distanceAwayFilter: DistanceAwayFilterValues;
  openNowFilter: boolean;
}

export interface NewExtendedGooglePlace extends GooglePlace {
  reviews: AccountPlaceReview[];
}

export interface RestaurantVisitInstance {
  dateOfVisit: string;
  reviewText: string;
  itemReviews: ItemReview[];
}

export interface NewChatResponse {
  reviewText: string;
  itemReviews: ItemReview[];
  updatedReviewText: string;
}

export type NewChatMessage = {
  role: 'user' | 'ai';
  message: string | ChatGPTOutput;
};

export interface NewReviewData {
  _id: string;
  accountId: string;
  place: GooglePlace | null;
  accountUserInputs: AccountUserInput[];
  dateOfVisit: string | null;
  reviewText: string | null;
  itemReviews: ItemReview[];
  sessionId: string | null;
  restaurantName: string;
  chatHistory: NewChatMessage[]; // Chat history
}
