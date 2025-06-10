import { RestaurantOpen, PlaceType, RestaurantType, Distance, VisitedStatus } from "./enums";
import { MrPlaceWithGooglePlace } from "./mrTypes";

export interface Filters {
  distanceAway: Distance;
  placeTypes: PlaceType[];
  restaurantTypes: RestaurantType[];
  restaurantOpen: RestaurantOpen;
  openMeals: OpenForMeals;
  visitedStatus: VisitedStatus;
}

export interface SearchQuery {
  query: string;
  distanceSpec: DistanceAwayQuery;
  placeTypes: PlaceType[];
  restaurantTypes: RestaurantType[];
  restaurantOpen: RestaurantOpen;
  openMeals: OpenForMeals;
  visitedStatus: VisitedStatus;
}

export interface DistanceAwayQuery {
  lat: number;
  lng: number;
  radius: number;
}

interface OpenForMeals {
  Breakfast: boolean;
  Lunch: boolean;
  Dinner: boolean;
}

export interface SearchResponse {
  places: MrPlaceWithGooglePlace[];
}

