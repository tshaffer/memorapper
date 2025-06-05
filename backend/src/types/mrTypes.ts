import { PlaceType, RestaurantType } from "./enums";
import { GoogleGeometry } from "./googlePlace";

export interface MrPlace {
  _id?: string;
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
  _id?: string;
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
  _id?: string; // Optional for updates
  placeType?: PlaceType;
  placeComments?: string;
  placeRating?: number;
  googlePlace?: GooglePlace;
  restaurantSpecs?: MrRestaurant;
  restaurantReviews: MrRestaurantReview[];
};

export type MrSubmitAddReviewRequestBody = {
  _id: string;
  dateOfVisit: string;
  itemReviews: MrItemOrdered[];
}

export interface GooglePlace {
  googlePlaceId: string;
  address_components?: google.maps.GeocoderAddressComponent[];
  formatted_address?: string;
  geometry?: GoogleGeometry;
  name?: string;
  opening_hours?: google.maps.places.PlaceOpeningHours;
  place_id?: string;
  price_level?: number;
  rating?: number;
  user_ratings_total?: number;
  utc_offset_minutes?: number;
  vicinity?: string;
  website: string;
}
