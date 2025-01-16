import { GooglePlace, FilterResultsParams, AccountPlaceReview, SearchResponse } from "../types";

export const filterResults = async (
  filter: FilterResultsParams,
  places: GooglePlace[],
  reviews: AccountPlaceReview[],
  mapLocation: google.maps.LatLngLiteral,
): Promise<SearchResponse> => {
  const { distanceAwayFilter, openNowFilter }: FilterResultsParams = filter;

  const filteredPlaces: GooglePlace[] = places.filter((place: GooglePlace) => {
    if (!place.geometry || !place.geometry.location) return false;

    // Filter by distance
    const distanceInMiles = haversineDistance(mapLocation, place.geometry.location);
    if (distanceInMiles > distanceAwayFilter) return false;

    // Filter by open now
    if (openNowFilter && !isPlaceOpenNow(place.opening_hours)) {
      return false;
    }

    return true;
  });

  // Extract the filtered place IDs for review filtering
  const filteredPlaceIds = new Set(filteredPlaces.map((place) => place.googlePlaceId));

  // Filter reviews based on filtered places
  const filteredReviews = reviews.filter((review) => {
    // Check if the review belongs to a filtered place
    if (!filteredPlaceIds.has(review.placeId)) return false;
    return true;
  });

  return { places: filteredPlaces, reviews: filteredReviews };
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


