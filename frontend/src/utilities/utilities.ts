import { GoogleGeometry, GooglePlace, Place, RestaurantType } from "../types";
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

export const getLatLngFromPlace = (place: Place): google.maps.LatLngLiteral => {
  const geometry: GoogleGeometry | undefined = place.geometry;
  if (geometry) {
    return geometry.location;
  }
  return { lat: 0, lng: 0 };
}

/**
 * Returns true if 'now' falls between the last open and the next close.
 */
export function isCurrentlyOpen(
  periods: google.maps.places.PlaceOpeningHoursPeriod[] | undefined,
  now: number
): boolean {
  if (!periods?.length) return false;

  // 1) flatten into a list of open/close events
  type Event = { type: 'open' | 'close'; time: google.maps.places.PlaceOpeningHoursTime };
  const events: Event[] = periods.flatMap(p => {
    const evs: Event[] = [{ type: 'open', time: p.open }];
    if (p.close) evs.push({ type: 'close', time: p.close });
    return evs;
  });

  // 2) drop any events that lack a nextDate
  const withDates = events.filter(e => e.time.nextDate != null);

  // 3) sort chronologically by nextDate
  withDates.sort((a, b) => a.time.nextDate! - b.time.nextDate!);

  // 4) find the very next event after "now"
  const nextEvent = withDates.find(e => e.time.nextDate! > now);

  // if the next event is a close, we must be open *right now*
  return nextEvent?.type === 'close';
}

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
  console.log('pickGooglePlaceProperties', googlePlaceResult);
  console.log('aspects', googlePlaceResult.aspects);
  console.log('rating', googlePlaceResult.rating);
  console.log('userRatingsTotal', googlePlaceResult.user_ratings_total);
  console.log('reviews', googlePlaceResult.reviews);

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
    rating: googlePlaceResult.rating,
    vicinity: googlePlaceResult.vicinity,
    restaurantType: getRestaurantType(googlePlaceResult),
  };
  return googlePlace;

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

