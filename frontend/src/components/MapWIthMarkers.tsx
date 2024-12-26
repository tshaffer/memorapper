import React, { useState, useEffect } from 'react';
import { ExtendedGooglePlace } from '../types';
import { AdvancedMarker, APIProvider, InfoWindow, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace } from '../utilities';
import '../App.css';
import { Button, useMediaQuery } from '@mui/material';
// import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Icon } from '@iconify/react';
// https://icon-sets.iconify.design/?query=<query>
// import pizzaIcon from '@iconify/icons-emojione/pizza';
// noto:burrito
// mdi:bakery
// twemoji:baguette-bread
// maki:bar
// catppuccin:coffeescript

const DEFAULT_ZOOM = 14;

const iconContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-16px', // Adjust to align the icon and text vertically
  left: '50%',
  transform: 'translate(-50%, -50%)', // Center the icon
  width: '24px', // Set a fixed size for the icon background
  height: '24px',
  backgroundColor: 'lightgray', // Black circle background
  borderRadius: '50%', // Make it a circle
  display: 'flex', // Center the icon inside the circle
  justifyContent: 'center',
  alignItems: 'center',
};

const iconStyle: React.CSSProperties = {
  fontSize: '16px', // Reduce icon size
  color: 'white', // White icon color for contrast
};

const textStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px', // Adjust to position text to the left of the icon
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

  const isMobile = useMediaQuery('(max-width:768px)');

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

  const handleShowDirections = () => {
    if (selectedLocation && currentLocation) {
      const destinationLocation: google.maps.LatLngLiteral = selectedLocation.geometry!.location;
      const destinationLatLng: google.maps.LatLngLiteral = { lat: destinationLocation.lat, lng: destinationLocation.lng };
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destinationLatLng.lat},${destinationLatLng.lng}&destination_place_id=${selectedLocation.name}`;
      window.open(url, '_blank');
    }
  };

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
            {/* <Icon icon={pizzaIcon} style={{ fontSize: '24px', color: 'red' }} /> */}
            <Icon icon={pizzaIcon} style={{ fontSize: '18px' }} />
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

  const renderInfoWindow = (): JSX.Element => {
    return (
      <InfoWindow
        position={getLatLngFromPlace(selectedLocation!)}
        onCloseClick={handleCloseInfoWindow}
      >
        <div
          style={{
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            fontSize: '13px', // Matches .gm-style-iw
          }}
        >
          <style>
            {`
              .gm-style-iw-chr {
                margin-top: -8px;
                height: 30px;
              }
  
              .gm-style-iw {
                font-size: 13px;
              }
            `}
          </style>
          <h4 style={{ margin: '0 0 8px 0' }}>{selectedLocation!.name}</h4>
          <a
            href={selectedLocation!.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'blue' }}
          >
            {selectedLocation!.website}
          </a>
          <Button
            onClick={handleShowDirections}
            style={{
              alignSelf: 'flex-start',
              marginBottom: '8px',
              padding: '8px 16px', // Ensure it's easy to tap
              fontSize: isMobile ? '14px' : '16px', // Adjust font size for mobile
            }}
          >
            Directions
          </Button>
          <div
            style={{
              fontSize: 'inherit',
              lineHeight: '1.5',
            }}
          >
            {selectedLocation!.reviews[0]?.freeformReviewProperties?.reviewText || 'No review available.'}
          </div>
        </div>
      </InfoWindow>
    );
  };

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
        {selectedLocation && (renderInfoWindow())}
      </Map>
    </APIProvider>
  );
};

export default MapWithMarkers;
