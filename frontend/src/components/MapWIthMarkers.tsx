import React, { useState, useEffect } from 'react';
import { PlaceWithGooglePlace } from '../types';
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
import '../App.css';

// // https://icon-sets.iconify.design/?query=<query>
// import { useUserContext } from '../contexts/UserContext';
import PlaceMarker from './PlaceMarker';
import PlaceInfoWindow from './PlaceInfoWindow';
import { useSelector } from 'react-redux';
import { RootState } from '../redux';

const DEFAULT_ZOOM = 14;

const CustomBlueDot = () => (
  <div style={{
    width: '16px',
    height: '16px',
    backgroundColor: '#4285F4',
    borderRadius: '50%',
    border: '2px solid #FFFFFF',
    boxShadow: '0 0 8px rgba(66, 133, 244, 0.5)',
  }} />
);

interface MapWithMarkersProps {
  initialCenter: google.maps.LatLngLiteral;
  places: PlaceWithGooglePlace[];
  blueDotLocation?: google.maps.LatLngLiteral;
  onVisiblePlacesChanged: (places: PlaceWithGooglePlace[]) => void;
  onPlaceSelect: (place: PlaceWithGooglePlace) => void;
}

const MapWithMarkers: React.FC<MapWithMarkersProps> = ({ initialCenter, places, blueDotLocation, onVisiblePlacesChanged, onPlaceSelect }) => {

  const { googlePlaces } = useSelector((state: RootState) => state.memorapper);

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const [selectedPlace, setSelectedPlace] = useState<PlaceWithGooglePlace | null>(null);

  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);

  useEffect(() => {

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && (event.key === '+' || event.key === '=' || event.key === '-')) {
        event.preventDefault();
        setZoom((prevZoom) => (event.key === '+' || event.key === '=') ? prevZoom + 1 : prevZoom - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  // }, [zoom]);


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error("Error getting current location: ", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handlePlaceClicked = (place: PlaceWithGooglePlace) => {
    console.log('Place clicked:', place);
    setSelectedPlace(place);
  };

  const handleLinkClick = (): void => {
    console.log('handleLinkClick', selectedPlace);
    onPlaceSelect(selectedPlace!); 
  }

  const handleCloseInfoWindow = () => {
    setSelectedPlace(null);
  };

  const renderPlaceMarker = (place: PlaceWithGooglePlace, index: number): JSX.Element => {
    return (
      <PlaceMarker
        key={`location-${index}`}
        place={place}
        onMarkerClick={(place: PlaceWithGooglePlace) => handlePlaceClicked(place)}
      >
      </PlaceMarker>
    );
  };

  const googleMapsApiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!;

  // Helper: Determine if a marker is inside the current map bounds.
  const isMarkerVisible = (markerPos: google.maps.LatLngLiteral, bounds: google.maps.LatLngBounds) => {
    if (!markerPos) return false;
    const markerLatLng = new google.maps.LatLng(markerPos.lat, markerPos.lng);
    return bounds.contains(markerLatLng);
  };

  const centerLat = bounds?.getCenter().lat();
  const centerLng = bounds?.getCenter().lng();
  const neLat = bounds?.getNorthEast().lat();
  const neLng = bounds?.getNorthEast().lng();
  const swLat = bounds?.getSouthWest().lat();
  const swLng = bounds?.getSouthWest().lng();

  useEffect(() => {

    if (!bounds) return;

    let markerIsVisibleCount = 0;

    const visiblePlaces: PlaceWithGooglePlace[] = [];
    
    for (const place of places) {
      if (place && place.googlePlace!.geometry) {
        const markerIsVisible = isMarkerVisible(place.googlePlace!.geometry.location, bounds);
        if (markerIsVisible) {
          visiblePlaces.push(place);
          markerIsVisibleCount++;
        }
      }
    }
  
    onVisiblePlacesChanged(visiblePlaces);

}, [centerLat, centerLng, neLat, neLng, swLat, swLng]);


return (
  <APIProvider apiKey={googleMapsApiKey} version="beta">
    <Map
      style={{ width: '100%', height: '100%' }}
      id="gmap"
      mapId="1ca0b6526e7d4819"
      defaultCenter={initialCenter}
      zoom={zoom}
      onZoomChanged={(event) => setZoom(event.detail.zoom)}
      fullscreenControl={false}
      zoomControl
      gestureHandling="greedy"
      scrollwheel
      mapTypeControl={false}
      streetViewControl={false}
      rotateControl={false}
      scaleControl={false}
      onBoundsChanged={(event) => {
        const boundsLiteral = event.detail.bounds as google.maps.LatLngBoundsLiteral;
        const newBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(boundsLiteral.south, boundsLiteral.west),
          new google.maps.LatLng(boundsLiteral.north, boundsLiteral.east)
        );
        setBounds(newBounds);
      }}
    >
      {places.map((place, index) => renderPlaceMarker(place, index))}
      {currentLocation && (
        <AdvancedMarker position={blueDotLocation || currentLocation}>
          <CustomBlueDot />
        </AdvancedMarker>
      )}
      {selectedPlace && (
        <PlaceInfoWindow place={selectedPlace} onLinkClick={handleLinkClick} onClose={handleCloseInfoWindow} />
      )}
    </Map>
  </APIProvider>
);
};

export default MapWithMarkers;
