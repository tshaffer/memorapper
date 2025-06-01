// types/Settings.ts

import { PlaceType } from "./enums";

export type Distance = 'AnyDistance' | '1 Mile' | '5 Miles' | '10 Miles';
export type RestaurantOpen = 'OpenNow' | 'OpenAnyTime';

export interface Filters {
  distanceAway: Distance;
  restaurantOpen: RestaurantOpen;
  placeTypes: PlaceType[];
  restaurantTypes: string[];
  openMeals: {
    Breakfast: boolean;
    Lunch: boolean;
    Dinner: boolean;
  };
}

export interface Settings {
  filters: Filters;
}
