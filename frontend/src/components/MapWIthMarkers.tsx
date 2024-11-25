import React, { useState, useEffect } from 'react';
import { ExtendedGooglePlace } from '../types';
import { AdvancedMarker, APIProvider, InfoWindow, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace } from '../utilities';
import '../App.css';
import { Button, useMediaQuery } from '@mui/material';

const DEFAULT_ZOOM = 14;

const pinStyle: React.CSSProperties = {
  width: '0',
  height: '0',
  borderLeft: '10px solid transparent',
  borderRight: '10px solid transparent',
  borderBottom: '20px solid red', /* Change color as needed */
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -100%)' /* Adjust as needed */
};

const textStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-18px', // Move the text slightly up to align with the triangle's tip
  left: '6px', // Position to the right of the triangle
  whiteSpace: 'nowrap', // Prevent text wrapping
  color: 'red',
  background: 'transparent', // Optional: Add background for better readability
  padding: '2px 4px', // Optional: Add padding
  borderRadius: '4px', // Optional: Round the corners of the background
  fontSize: '14px', // Adjust font size as needed
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' // Optional: Add shadow for a floating effect
};

interface MapWithMarkersProps {
  initialCenter: google.maps.LatLngLiteral;
  locations: ExtendedGooglePlace[];
}

const MapWithMarkers: React.FC<MapWithMarkersProps> = ({ initialCenter, locations }) => {

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
    console.log('handleZoomChanged event: ', event);
    console.log('event.detail.zoom: ', event.detail.zoom);
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
          <div style={pinStyle}></div>
          <div style={textStyle}>{location.name}</div>
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
      >
        {locationMarkers}
        {currentLocation && (
          <AdvancedMarker position={currentLocation}>
            <CustomBlueDot />
          </AdvancedMarker>
        )}
        {selectedLocation && (renderInfoWindow())}
      </Map>
    </APIProvider>
  );
};

export default MapWithMarkers;
