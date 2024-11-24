import React, { useState, useEffect } from 'react';
import { ExtendedGooglePlace, GooglePlace } from '../types';
import { AdvancedMarker, APIProvider, InfoWindow, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace } from '../utilities';
import '../App.css';
import { Typography } from '@mui/material';

interface MapWithMarkersProps {
  initialCenter: google.maps.LatLngLiteral;
  locations: ExtendedGooglePlace[];
}

// const DEFAULT_CENTER = { lat: 37.3944829, lng: -122.0790619 };
const DEFAULT_ZOOM = 14;

const MapWithMarkers: React.FC<MapWithMarkersProps> = ({ initialCenter, locations }) => {

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

  const renderMarkers = (): JSX.Element[] => {
    return locations.map((location, index) => (
      <AdvancedMarker
        key={index}
        position={getLatLngFromPlace(location)}
        onClick={() => handleMarkerClick(location)}
      />
    ));
  }

  const renderInfoWindow = (): JSX.Element => {
    return (
      <InfoWindow
        position={getLatLngFromPlace(selectedLocation!)}
        onCloseClick={handleCloseInfoWindow}
      >
        <div style={{ padding: '4px' }}>
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
          <h4 style={{ marginBlockStart: '-6px ' }}>{selectedLocation!.name}</h4>
          <a href={selectedLocation!.website} target="_blank" rel="noopener noreferrer">
            {selectedLocation!.website}
          </a>
          <Typography
            style={{
              marginTop: '8px',
              fontSize: 'inherit',
            }}
          >
            {selectedLocation!.reviews[0]?.freeformReviewProperties?.reviewText || 'No review available.'}
          </Typography>
        </div>
      </InfoWindow>
    );
  };

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY!;

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
