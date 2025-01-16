import React, { useState, useEffect } from 'react';
import { ExtendedGooglePlaceToVisit, ExtendedGooglePlace, RestaurantType } from '../types';
import { AdvancedMarker, APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace } from '../utilities';
import '../App.css';
import RestaurantInfoWindow from './RestaurantInfoWindow';
import RestaurantToVisitInfoWindow from './RestaurantToVisitInfoWindow';

import { Icon, IconifyIcon } from '@iconify/react';

// // https://icon-sets.iconify.design/?query=<query>
import restaurantIcon from '@iconify/icons-openmoji/fork-and-knife-with-plate';
import bakeryIcon from '@iconify/icons-emojione/bread';
import barIcon from '@iconify/icons-emojione/wine-glass';
import pizzaIcon from '@iconify/icons-emojione/pizza';
import pastaIcon from '@iconify/icons-emojione/spaghetti';
import iceCreamIcon from '@iconify/icons-emojione/ice-cream';
import burritoIcon from '@iconify/icons-noto/burrito';
import coffeeIcon from '@iconify/icons-openmoji/electric-coffee-percolator';

const DEFAULT_ZOOM = 14;

const iconContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-16px',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '30px',
  height: '30px',
  backgroundColor: 'lightgray',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const textStyle = (color: string): React.CSSProperties => ({
  position: 'absolute',
  right: '18px',
  transform: 'translateY(-150%)',
  whiteSpace: 'nowrap',
  color, // Dynamic color
  fontSize: '14px',
  fontWeight: '500',
  backgroundColor: 'transparent',
  textShadow: `
    1px 1px 0 white,
    -1px 1px 0 white,
    1px -1px 0 white,
    -1px -1px 0 white
  `,
});

interface MapWithMarkersProps {
  initialCenter: google.maps.LatLngLiteral;
  locations: ExtendedGooglePlace[];
  locationsToVisit: ExtendedGooglePlaceToVisit[];
  blueDotLocation?: google.maps.LatLngLiteral;
}

const MapWithMarkers: React.FC<MapWithMarkersProps> = ({ initialCenter, locations, locationsToVisit, blueDotLocation }) => {
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ExtendedGooglePlace | null>(null);
  const [selectedLocationToVisit, setSelectedLocationToVisit] = useState<ExtendedGooglePlaceToVisit | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {

    // const handleKeyDown = (event: KeyboardEvent) => {
    //   if ((event.metaKey || event.ctrlKey) && (event.key === '+' || event.key === '=' || event.key === '-')) {
    //     event.preventDefault();
    //     if (event.key === '+' || event.key === '=') {
    //       setZoom(zoom + 1);
    //     } else if (event.key === '-') {
    //       setZoom(zoom - 1);
    //     }
    //   }
    // };

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

  const handleMarkerClick = (location: ExtendedGooglePlace) => {
    setSelectedLocation(location);
    setSelectedLocationToVisit(null);
  };

  const handleLocationToVisitClick = (location: ExtendedGooglePlaceToVisit) => {
    setSelectedLocationToVisit(location);
    setSelectedLocation(null);
  };

  const handleCloseInfoWindow = () => {
    setSelectedLocation(null);
    setSelectedLocationToVisit(null);
  };

  const iconFromRestaurantType = (restaurantType: RestaurantType): IconifyIcon => {
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

  const renderMarker = (location: ExtendedGooglePlace, index: number): JSX.Element => (
    <AdvancedMarker
      key={`location-${index}`}
      position={getLatLngFromPlace(location)}
      onClick={() => handleMarkerClick(location)}
    >
      <div style={{ position: 'relative' }}>
        <div style={textStyle('red')}>{location.name}</div>
        <div style={iconContainerStyle}>
          <Icon icon={iconFromRestaurantType(location.restaurantType)} style={{ fontSize: '30px', color: 'red' }} />
        </div>
      </div>
    </AdvancedMarker>
  );

  const renderLocationToVisitMarker = (location: ExtendedGooglePlaceToVisit, index: number): JSX.Element => (
    <AdvancedMarker
      key={`locationToVisit-${index}`}
      position={getLatLngFromPlace(location)}
      onClick={() => handleLocationToVisitClick(location)}
    >
      <div style={{ position: 'relative' }}>
        <div style={textStyle('blue')}>{location.name}</div>
        <div style={iconContainerStyle}>
          <Icon icon={restaurantIcon} style={{ fontSize: '30px', color: 'blue' }} />
        </div>
      </div>
    </AdvancedMarker>
  );

  const googleMapsApiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!;

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
      >
        {locations.map((location, index) => renderMarker(location, index))}
        {locationsToVisit.map((location, index) => renderLocationToVisitMarker(location, index))}
        {currentLocation && (
          <AdvancedMarker position={blueDotLocation || currentLocation}>
            <CustomBlueDot />
          </AdvancedMarker>
        )}
        {selectedLocation && (
          <RestaurantInfoWindow location={selectedLocation} onClose={handleCloseInfoWindow} />
        )}
        {selectedLocationToVisit && (
          <RestaurantToVisitInfoWindow location={selectedLocationToVisit} onClose={handleCloseInfoWindow} />
        )}
      </Map>
    </APIProvider>
  );
};

export default MapWithMarkers;
