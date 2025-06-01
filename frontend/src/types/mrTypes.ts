import { PlaceType, RestaurantType } from "./enums";

export type MrPlaceReviews = MrRestaurantReview | any;
export type MrPlaceSpecificities = MrRestaurant | any;

export interface MrPlace {
    _idPlace?: string;
    placeId: string;
    googlePlaceId: string;
    placeType: PlaceType;
    placeComments: string;
    mrPlaceReviews: MrPlaceReviews[];
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
  itemsOrdered: MrItemOrdered[];
  reviewText: string;
}

export interface MrItemOrdered {
  itemName: string;
  rating: number;
  comments: string;
}

export interface MrReviewData {
  _id: string;
  place: MrPlace | null;
  dateOfVisit: string;
  reviewText: string;
  itemReviews: MrItemOrdered[];
  placeRating?: number;
}
