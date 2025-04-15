import { FilterResultsParams, SearchResponse, PlaceTypeQuery, RestaurantType, OpenFilterMode, MealType, Place, PlaceWithGooglePlace } from "../types";

export const filterResults = async (
  filter: FilterResultsParams,
  places: PlaceWithGooglePlace[],
  mapLocation: google.maps.LatLngLiteral,
): Promise<SearchResponse> => {
  const { distanceAwayFilter, placeTypeFilter, restaurantTypeFilter, openFilterMode, openMealsFilter }: FilterResultsParams = filter;

  const filteredPlaces: PlaceWithGooglePlace[] = places.filter((place: PlaceWithGooglePlace) => {
    if (!place.geometry || !place.geometry.location) return false;

    // Filter by distance
    const distanceInMiles = haversineDistance(mapLocation, place.geometry.location);
    if (distanceInMiles > distanceAwayFilter) return false;

    // Filter by place type
    if (placeTypeFilter !== PlaceTypeQuery.Any) {
      if (placeTypeFilter !== (place.placeType! as unknown as PlaceTypeQuery)) {
        return false;;
      }
    }
    // Filter by restaurant type
    if (placeTypeFilter === PlaceTypeQuery.Restaurant && place.restaurantType) {
      if (restaurantTypeFilter !== RestaurantType.Restaurant) {
        if (place.restaurantType !== restaurantTypeFilter) {
          return false;
        }
      }
    }

    // Filter by opening hours and meal types
    if (openFilterMode !== OpenFilterMode.Any) {
      if (openFilterMode === OpenFilterMode.Now && !isPlaceOpenNow(place.opening_hours)) {
        return false;
      } else if (openFilterMode === OpenFilterMode.Meals) {

        const mealTypes = Object.keys(openMealsFilter).filter((meal) => openMealsFilter[meal as keyof typeof openMealsFilter]);
        
        if (mealTypes.length > 0 && !place.opening_hours) {
          return false;
        }

        const mealAvailability: MealAvailability = inferMealAvailability(place.opening_hours);
        const isOpenForMeal = mealTypes.some((meal) => {
          if (meal === MealType.Breakfast) return mealAvailability.openForBreakfast;
          if (meal === MealType.Lunch) return mealAvailability.openForLunch;
          if (meal === MealType.Dinner) return mealAvailability.openForDinner;
          return false;
        });
        
        if (!isOpenForMeal) {
          return false;
        }
      }
    }

    return true;
  });

  return { places: filteredPlaces };
};

// Helper function to calculate distance between two coordinates
function haversineDistance(
  coord1: google.maps.LatLngLiteral,
  coord2: google.maps.LatLngLiteral
): number {
  const R = 3958.8; // Radius of Earth in miles
  const lat1 = coord1.lat * (Math.PI / 180);
  const lat2 = coord2.lat * (Math.PI / 180);
  const deltaLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const deltaLng = (coord2.lng - coord1.lng) * (Math.PI / 180);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
    Math.cos(lat2) *
    Math.sin(deltaLng / 2) *
    Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const isPlaceOpenNow = (openingHours?: google.maps.places.PlaceOpeningHours): boolean => {
  if (!openingHours || !openingHours.periods) return false;

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert current time to HHMM format

  // Find the period matching the current day
  const todayPeriod = openingHours.periods.find((period) => period.open?.day === currentDay);

  if (!todayPeriod || !todayPeriod.open?.time) return false;

  const openingTime = parseInt(todayPeriod.open.time, 10); // Convert opening time to HHMM
  const closingTime = todayPeriod.close ? parseInt(todayPeriod.close.time, 10) : 2400; // Default close to midnight

  return currentTime >= openingTime && currentTime < closingTime;
};

interface MealAvailability {
  openForBreakfast: boolean;
  openForLunch: boolean;
  openForDinner: boolean;
}

const inferMealAvailability = (opening_hours: any): MealAvailability => {
  let openForBreakfast = false;
  let openForLunch = false;
  let openForDinner = false;

  if (opening_hours.weekday_text && Array.isArray(opening_hours.weekday_text)) {
    const allDaysOpen24 = opening_hours.weekday_text.every((dayText: string) =>
      dayText.toLowerCase().includes("open 24 hours")
    );
    if (allDaysOpen24) {
      return {
        openForBreakfast: true,
        openForLunch: true,
        openForDinner: true,
      };
    }
  }

  if (opening_hours.periods && Array.isArray(opening_hours.periods)) {
    opening_hours.periods.forEach((period: any) => {
      if (period.open && period.open.time) {
        const hour = parseInt(period.open.time.substring(0, 2), 10);
        if (hour < 10) openForBreakfast = true;
        if (hour >= 10 && hour < 14) openForLunch = true;
        if (hour >= 14) openForDinner = true;
      }
    });
  }
  return { openForBreakfast, openForLunch, openForDinner };
};

