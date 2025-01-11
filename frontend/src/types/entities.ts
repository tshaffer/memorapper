import { RestaurantType, WouldReturn } from "./enums";
import { Filters } from "./frontEndEntities";
import { GooglePlace } from "./googlePlace";
import { AddressComponent } from "./place";

export interface UserEntity {
  id: string;
  userName: string;
  password: string;
  email: string;
}

export interface Contributor {
  id: string;
  userId: string; // Foreign key to UserEntity
  name: string;
}

export interface ContributorInput {
  contributorId: string; // Foreign key to Contributor
  rating: number;
  comments: string;
}

export type ContributorInputByContributor = Record<string, ContributorInput>;

export interface ContributorInputMapValue {
  contributorId: string; // Foreign key to Contributor
  contributorInput: ContributorInput; // The input data for the contributor
}

export interface VisitedRestaurant {
  _id?: string;
  googlePlaceId: string;
  contributorInput?: ContributorInput[]; // Input per contributor
}

export interface DesiredRestaurant {
  _id?: string;
  googlePlace: GooglePlace | undefined;
  restaurantName: string;
  interestLevel: number;
  comments: string;
}

export interface EditableDesiredRestaurant {
  googlePlace: GooglePlace;
  restaurantName: string;
  comments: string;
  interestLevel: number;
}

export interface SubmitVisitedRestaurantRequestBody {
  _id?: string;
  googlePlace: GooglePlace;
}

export interface SubmitDesiredRestaurantRequestBody {
  _id?: string;
  googlePlace: GooglePlace;
  interestLevel: number;
  comments: string;
}

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

export interface UnvisitedPlace {
  _id?: any;
  place: GooglePlace | null;
  comments: string;
  rating: number;
}

export interface UnvisitedPlaceFromDb {
  _id?: any;
  place_id: string;
  comments: string;
  rating: number;
}

export interface EditableUnvisitedPlace {
  place: GooglePlace;
  comments: string;
  rating: number;
}

export interface StructuredReviewProperties {
  dateOfVisit: string;
  primaryRating: number;
  secondaryRating?: number;
  wouldReturn: WouldReturn | null;
  reviewerId: string;
  contributorInputByContributor?: ContributorInputByContributor;
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

export interface BasePlace {
  googlePlaceId: string;
  name: string;
  address_components?: AddressComponent[];
  formatted_address: string;
  website: string;
  opening_hours?: google.maps.places.PlaceOpeningHours;
  price_level?: number;
  vicinity?: string;
  restaurantType: RestaurantType;
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

