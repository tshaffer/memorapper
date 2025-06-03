import { PlaceType, RestaurantType } from "./enums";
import { GooglePlace } from "./place";

export interface MrPlace {
  _idPlace?: string;
  placeId: string;
  googlePlaceId: string;
  placeType: PlaceType;
  placeComments: string;
  placeRating?: number;
  restaurantSpecs: MrRestaurant;
  restaurantReviews: MrRestaurantReview[];
}

export interface MrRestaurant {
  restaurantType?: RestaurantType;
  openForBreakfast?: boolean;
  openForLunch?: boolean;
  openForDinner?: boolean;
}

export interface MrRestaurantReview {
  dateOfVisit: string;
  itemReviews: MrItemOrdered[];
}

export interface MrReviewData extends MrRestaurantReview {
  place: MrPlace | null;
  placeComments: string;
}

export interface MrItemOrdered {
  itemName: string;
  rating: number;
  comments: string;
}

export type MrPlaceWithGooglePlace = {
  _idPlace?: string;
  placeId: string;
  googlePlaceId: string;
  placeType?: PlaceType;
  placeComments?: string;
  placeRating?: number;
  googlePlace?: GooglePlace;
  restaurantSpecs?: MrRestaurant;
  restaurantReviews: MrRestaurantReview[];
};

export type EditablePlace = {
  googlePlace: GooglePlace;
  placeComments: string;

}

export type MrSubmitPlaceRequestBody = {
  _idPlace?: string;
  placeId: string;
  placeType?: PlaceType;
  placeComments?: string;
  placeRating?: number;
  googlePlace?: GooglePlace;
  restaurantSpecs?: MrRestaurant;
  restaurantReviews: MrRestaurantReview[];
};

export type MrSubmitAddReviewRequestBody = {
  placeId: string;
  dateOfVisit: string;
  itemReviews: MrItemOrdered[];
}
