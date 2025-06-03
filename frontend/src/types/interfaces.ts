import { Distance, RestaurantOpen, PlaceType, RestaurantType } from "./enums";

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

