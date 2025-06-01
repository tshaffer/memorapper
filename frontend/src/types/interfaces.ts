import { ItemReview } from "./entities";
import { Distance, RestaurantOpen, PlaceType, RestaurantType } from "./enums";
import { GooglePlace } from "./googlePlace";

export interface Filters {
  distanceAway: Distance;
  placeTypes: PlaceType[];
  restaurantTypes: RestaurantType[];
  restaurantOpen: RestaurantOpen;
  openMeals: OpenForMeals;
}

export interface SearchQuery {
  query: string;
  distanceSpec: DistanceAwayQuery;
  placeTypes: PlaceType[];
  restaurantTypes: RestaurantType[];
  restaurantOpen: RestaurantOpen;
  openMeals: OpenForMeals;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

export interface OpenForMeals {
  Breakfast: boolean;
  Lunch: boolean;
  Dinner: boolean;
}

export interface ReviewData {
  _id: string;
  // diningGroupid: string;
  place: GooglePlace | null;
  // dinerRestaurantReviews: DinerRestaurantReview[];
  dateOfVisit: string | null;
  reviewText: string | null;
  itemReviews: ItemReview[];
  sessionId: string | null;
  restaurantName: string;
  // chatHistory: ChatMessage[]; // Chat history
}

