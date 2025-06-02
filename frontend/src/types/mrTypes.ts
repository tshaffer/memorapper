import { PlaceType, RestaurantType } from "./enums";
import { GooglePlace, Restaurant } from "./place";

export type MrPlaceSpecificities = MrRestaurant | any;

export interface MrPlace {
  _idPlace?: string;
  placeId: string;
  googlePlaceId: string;
  placeType: PlaceType;
  placeComments: string;
  placeRating?: number;
  mrPlaceReviews: MrRestaurantReview[];
  mrPlaceSpecificities: MrPlaceSpecificities;
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
  reviewText: string;
}

export interface MrReviewData extends MrRestaurantReview {
  place: MrPlace | null;
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
  restaurant?: Restaurant;
};

export type MrSubmitPlaceRequestBody = {
  _idPlace?: string;
  placeId: string;
  placeType?: PlaceType;
  placeComments?: string;
  googlePlace?: GooglePlace;
  restaurant?: Restaurant;
};

