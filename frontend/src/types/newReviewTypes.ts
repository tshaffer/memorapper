import { FreeformReviewProperties, ItemReview } from "./entities";
import { GooglePlace } from "./googlePlace";
import { AccountUserInput } from "./interfaces";

export type NewChatMessage = {
  role: 'user' | 'ai';
  message: string | FreeformReviewProperties;
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
