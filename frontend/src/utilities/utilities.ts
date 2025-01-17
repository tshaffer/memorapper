import { GoogleGeometry, GooglePlace, RestaurantType } from "../types";
import '../App.css';

import { IconifyIcon } from '@iconify/react';

// // https://icon-sets.iconify.design/?query=<query>
import restaurantIcon from '@iconify/icons-openmoji/fork-and-knife-with-plate';
import bakeryIcon from '@iconify/icons-emojione/bread';
import barIcon from '@iconify/icons-emojione/wine-glass';
import pizzaIcon from '@iconify/icons-emojione/pizza';
import pastaIcon from '@iconify/icons-emojione/spaghetti';
import iceCreamIcon from '@iconify/icons-emojione/ice-cream';
import burritoIcon from '@iconify/icons-noto/burrito';
import coffeeIcon from '@iconify/icons-openmoji/electric-coffee-percolator';

export const getCityNameFromPlace = (place: GooglePlace): string => {
  const addressComponents = place.address_components;
  const cityComponent = addressComponents?.find((component: any) =>
    component.types.includes("locality")
  );
  const cityName: string = cityComponent ? cityComponent.long_name : ''
  return cityName;
}

export const getLatLngFromPlace = (place: GooglePlace): google.maps.LatLngLiteral => {
  try {
    const geometry: GoogleGeometry | undefined = place.geometry;
    const location: google.maps.LatLngLiteral = geometry?.location!;
    return location;
  } catch (error) {
    console.error('getLatLngFromPlace error', error);
    debugger;
    return { lat: 0, lng: 0 };
  }
}

// Dummy object to define the shape of GooglePlace at runtime
// const googlePlaceTemplate: GooglePlace = {
//   place_id: '',
//   name: '',
//   address_components: [],
//   formatted_address: '',
//   geometry: {
//     location: { lat: 0, lng: 0 },
//     viewport: { east: 0, north: 0, south: 0, west: 0 },
//   },
//   website: '',
// };

const getRestaurantType = (googlePlaceResult: google.maps.places.PlaceResult): RestaurantType => {

  const googlePlaceTypes: string[] | undefined = googlePlaceResult.types;
  if (googlePlaceTypes) {
    for (const googlePlaceType of googlePlaceTypes) {
      switch (googlePlaceType) {
        case 'bakery':
          return RestaurantType.Bakery;
        case 'bar':
          return RestaurantType.Bar;
        // case 'cafe':
        //   return RestaurantType.CoffeeShop;
        // case 'meal_takeaway':
        //   return RestaurantType.PizzaPlace;
        // case 'restaurant':
        //   return RestaurantType.Restaurant;
      }
    }
  }

  return RestaurantType.Restaurant
}

export function pickGooglePlaceProperties(googlePlaceResult: google.maps.places.PlaceResult): GooglePlace {
  const googlePlace: GooglePlace = {
    googlePlaceId: googlePlaceResult.place_id!,
    name: googlePlaceResult.name!,
    address_components: googlePlaceResult.address_components,
    formatted_address: googlePlaceResult.formatted_address!,
    geometry: {
      location: {
        lat: googlePlaceResult.geometry!.location!.lat(),
        lng: googlePlaceResult.geometry!.location!.lng()
      },
      viewport: {
        east: googlePlaceResult.geometry!.viewport!.getNorthEast().lng(),
        north: googlePlaceResult.geometry!.viewport!.getNorthEast().lat(),
        south: googlePlaceResult.geometry!.viewport!.getSouthWest().lat(),
        west: googlePlaceResult.geometry!.viewport!.getSouthWest().lng(),
      },
    },
    website: googlePlaceResult.website || '',
    opening_hours: googlePlaceResult.opening_hours,
    price_level: googlePlaceResult.price_level,
    vicinity: googlePlaceResult.vicinity,
    restaurantType: getRestaurantType(googlePlaceResult),
  };
  return googlePlace;

  // const keys = Object.keys(googlePlaceTemplate) as (keyof GooglePlace)[];

  // const result = Object.fromEntries(
  //   keys
  //     .filter(key => key in googlePlaceResult)
  //     .map(key => [key, googlePlaceResult[key]])
  // ) as unknown as GooglePlace;

  // return result;

}

export const formatDateToMMDDYYYY = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${month}/${day}/${year}`;
};

export const getFormattedDate = (): string => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  return `${year}-${month}-${day}`;
};

export const restaurantTypeLabelFromRestaurantType = (restaurantType: RestaurantType): string => {
  switch (restaurantType) {
    case RestaurantType.Bakery:
      return 'Bakery';
    case RestaurantType.Bar:
      return 'Bar';
    case RestaurantType.CoffeeShop:
      return 'Coffee Shop';
    case RestaurantType.PizzaPlace:
      return 'Pizza Place';
    case RestaurantType.ItalianRestaurant:
      return 'Italian Restaurant';
    case RestaurantType.DessertShop:
      return 'Dessert Shop';
    case RestaurantType.Taqueria:
      return 'Taqueria';
  }
  return 'Restaurant';

}
export const iconFromRestaurantType = (restaurantType: RestaurantType): IconifyIcon => {
  switch (restaurantType) {
    case RestaurantType.Bakery:
      return bakeryIcon;
    case RestaurantType.Bar:
      return barIcon;
    case RestaurantType.CoffeeShop:
      return coffeeIcon;
    case RestaurantType.PizzaPlace:
      return pizzaIcon;
    case RestaurantType.ItalianRestaurant:
      return pastaIcon;
    case RestaurantType.DessertShop:
      return iceCreamIcon;
    case RestaurantType.Taqueria:
      return burritoIcon;
  }
  return restaurantIcon;
}

