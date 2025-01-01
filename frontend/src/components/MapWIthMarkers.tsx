import React, { useState, useEffect } from 'react';
import { ExtendedGooglePlace, RestaurantType } from '../types';
import { AdvancedMarker, APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace } from '../utilities';
import '../App.css';
import RestaurantInfoWindow from './RestaurantInfoWindow';

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
  top: '-16px', // Adjust to align the icon and text vertically
  left: '50%',
  transform: 'translate(-50%, -50%)', // Center the icon
  width: '30px', // Set a fixed size for the icon background
  height: '30px',
  backgroundColor: 'lightgray', // Black circle background
  borderRadius: '50%', // Make it a circle
  display: 'flex', // Center the icon inside the circle
  justifyContent: 'center',
  alignItems: 'center',
};

const textStyle: React.CSSProperties = {
  position: 'absolute',
  right: '18px', // Adjust to position text to the left of the icon
  transform: 'translateY(-150%)', // Align text vertically with the icon
  whiteSpace: 'nowrap', // Prevent text wrapping
  color: 'red', // Adjust text color
  fontSize: '14px', // Adjust font size as needed
  fontWeight: '500',
  backgroundColor: 'transparent', // Transparent background
  textShadow: `
    1px 1px 0 white,
    -1px 1px 0 white,
    1px -1px 0 white,
    -1px -1px 0 white
  `, // Creates a solid outline around the text
};

interface MapWithMarkersProps {
  initialCenter: google.maps.LatLngLiteral;
  locations: ExtendedGooglePlace[];
  blueDotLocation?: google.maps.LatLngLiteral;
}

const MapWithMarkers: React.FC<MapWithMarkersProps> = ({ initialCenter, locations, blueDotLocation }) => {

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ExtendedGooglePlace | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && (event.key === '+' || event.key === '=' || event.key === '-')) {
        event.preventDefault();
        if (event.key === '+' || event.key === '=') {
          setZoom(zoom + 1);
        } else if (event.key === '-') {
          setZoom(zoom - 1);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoom]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting current location: ", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const CustomBlueDot = () => (
    <div style={{
      width: '16px',
      height: '16px',
      backgroundColor: '#4285F4',  // Google blue color
      borderRadius: '50%',
      border: '2px solid #FFFFFF',  // White border
      boxShadow: '0 0 8px rgba(66, 133, 244, 0.5)',  // Shadow for emphasis
    }} />
  );

  const handleMarkerClick = (location: ExtendedGooglePlace) => {
    setSelectedLocation(location);
  };

  const handleCloseInfoWindow = () => {
    setSelectedLocation(null);
  };

  const handleZoomChanged = (event: MapCameraChangedEvent) => {
    // console.log('handleZoomChanged event: ', event);
    // console.log('event.detail.zoom: ', event.detail.zoom);
    setZoom(event.detail.zoom);
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

  const renderMarker = (location: ExtendedGooglePlace, index: number): JSX.Element => {
    return (
      <AdvancedMarker
        key={index}
        position={getLatLngFromPlace(location)}
        onClick={() => handleMarkerClick(location)}
      >
        <div style={{ position: 'relative' }}>
          <div style={textStyle}>{location.name}</div>
          <div style={iconContainerStyle}>
            <Icon icon={iconFromRestaurantType(location.restaurantType)} style={{ fontSize: '30px', color: 'red' }} />
          </div>
        </div>
      </AdvancedMarker>
    );
  };

  const renderMarkers = (): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < locations.length; i++) {
      elements.push(renderMarker(locations[i], i));
    }
    return elements;
  }

  const googleMapsApiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!;

  const locationMarkers: JSX.Element[] = renderMarkers();

  const getBlueDotLocation = (): google.maps.LatLngLiteral | null => {
    if (blueDotLocation) {
      return blueDotLocation;
    } else {
      return currentLocation;
    }
  }

  // console.log('MapWithMarkers render:', initialCenter, locations, currentLocation, selectedLocation, zoom);
  // console.log('MapWithMarkers render:');
  // console.log(locations);

  return (
    <APIProvider
      apiKey={googleMapsApiKey}
      version="beta"
    >
      <Map
        style={{ width: '100%', height: '100%' }}
        id="gmap"
        mapId="1ca0b6526e7d4819"
        defaultCenter={initialCenter}
        zoom={zoom}
        onZoomChanged={(event) => handleZoomChanged(event)}
        fullscreenControl={false}
        zoomControl={true}
        gestureHandling={'greedy'}
        scrollwheel={true}

        mapTypeControl={false}
        streetViewControl={false}
        rotateControl={false}
        scaleControl={false}

      >
        {locationMarkers}
        {currentLocation && (
          <AdvancedMarker position={getBlueDotLocation()}>
            <CustomBlueDot />
          </AdvancedMarker>
        )}
        {selectedLocation &&
          (
            <RestaurantInfoWindow
              location={selectedLocation!}
              onClose={handleCloseInfoWindow}
            />
          )}
      </Map>
    </APIProvider>
  );
};

export default MapWithMarkers;
