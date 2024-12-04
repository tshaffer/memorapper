import { FreeformReviewProperties, ItemReview } from "./entities";
import { WouldReturn } from "./enums";
import { GooglePlace } from "./googlePlace";

export type ChatMessage = {
  role: 'user' | 'ai';
  message: string | FreeformReviewProperties;
};

export interface ReviewData {
  _id: string;
  place: GooglePlace | null;
  reviewText: string | null;
  dateOfVisit: string | null;
  wouldReturn: WouldReturn | null;
  itemReviews: ItemReview[];
  reviewer?: string | null;
  sessionId: string | null;
  restaurantName: string;
  chatHistory: ChatMessage[]; // Chat history
}
