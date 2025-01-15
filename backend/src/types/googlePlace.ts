import { BasePlace } from "./entities";

export interface GooglePlace extends BasePlace {
  geometry?: GoogleGeometry;
}

export interface GoogleGeometry {
  location: google.maps.LatLngLiteral;
  viewport: google.maps.LatLngBoundsLiteral;
}

export interface GooglePlacesResponse {
  html_attributions: string[];
  results: google.maps.places.PlaceResult[];
  status: google.maps.places.PlacesServiceStatus;
}
