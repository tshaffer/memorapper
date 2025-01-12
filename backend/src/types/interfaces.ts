import { SerializableMap } from "./baseTypes";
import { ItemReview } from "./entities";
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

// export interface AccountUserInputMapValue {
//   accountUserId: string; // Foreign key to AccountUser
//   accountUserInput: AccountUserInput;
// }

// export type AccountUserInputByAccountUser = SerializableMap<string, AccountUserInputMapValue>;


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
  // accountUserInputByAccountUser: AccountUserInputByAccountUser;
  dateOfVisit: string;
  reviewText: string;
  itemReviews: ItemReview[];
  sessionId: string;
}

