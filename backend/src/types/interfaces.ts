import { RestaurantOpen, PlaceType, RestaurantType, Distance } from "./enums";
import { MrPlaceWithGooglePlace } from "./mrTypes";

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

interface OpenForMeals {
  Breakfast: boolean;
  Lunch: boolean;
  Dinner: boolean;
}

export interface SearchResponse {
  places: MrPlaceWithGooglePlace[];
}

