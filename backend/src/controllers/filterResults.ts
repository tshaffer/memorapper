import { FilterResultsParams, SearchResponse, RestaurantType, OpenFilterMode, MealType, PlaceWithGooglePlace, PlaceType } from "../types";

export const filterResults = async (
  filter: FilterResultsParams,
  places: PlaceWithGooglePlace[],
  mapLocation: google.maps.LatLngLiteral,
): Promise<SearchResponse> => {
  const {
    distanceAwayFilter,
    placeTypesFilter,
    restaurantsTypeFilter,
    openFilterMode,
    openMealsFilter,
  } = filter;

  const filteredPlaces = places.filter(place => {
    // 1) Must have geometry
    if (!place.geometry?.location) return false;

    // 2) Distance filter
    const distanceInMiles = haversineDistance(
      mapLocation,
      place.geometry.location
    );
    if (distanceInMiles > distanceAwayFilter) return false;

    // 3) Place‐type filter
    if (placeTypesFilter.length > 0) {
      if (!placeTypesFilter.includes(place.placeType as unknown as PlaceType)) {
        return false;
      }
    }

    // 4) Restaurant‐type filter: only if this place is a restaurant
    if (
      restaurantsTypeFilter.length > 0 &&
      (place.placeType as unknown as PlaceType) === PlaceType.Restaurant
    ) {
      if (
        !restaurantsTypeFilter.includes(
          place.restaurantType as RestaurantType
        )
      ) {
        return false;
      }
    }

    // 5) Open‐now vs. open‐for‐meals vs. no open filter
    if (openFilterMode === OpenFilterMode.Now) {
      if (!isPlaceOpenNow(place.opening_hours)) return false;

    } else if (openFilterMode === OpenFilterMode.Meals) {
      // figure out which meals are checked
      const selectedMeals = (Object.entries(openMealsFilter) as [
        MealType,
        boolean
      ][])
        .filter(([, ok]) => ok)
        .map(([meal]) => meal);

      // only apply if at least one meal is checked
      if (selectedMeals.length > 0) {
        if (!place.opening_hours) return false;

        const availability = inferMealAvailability(place.opening_hours);
        const isOpenForAny = selectedMeals.some(meal => {
          switch (meal) {
            case MealType.Breakfast:
              return availability.openForBreakfast;
            case MealType.Lunch:
              return availability.openForLunch;
            case MealType.Dinner:
              return availability.openForDinner;
            default:
              return false;
          }
        });

        if (!isOpenForAny) return false;
      }
    }

    return true;
  });

  return { places: filteredPlaces };
};

// This function calculates the distance between two geographical coordinates using the Haversine formula.
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

