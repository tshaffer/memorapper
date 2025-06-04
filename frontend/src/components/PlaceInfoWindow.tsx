import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import directionsIcon from '@iconify/icons-mdi/directions';
import { GoogleGeometry, Place, PlaceType, MrPlaceWithGooglePlace } from '../types';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace, restaurantTypeLabelFromRestaurantType } from '../utilities';
import '../App.css';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface PlaceInfoWindowProps {
  place: MrPlaceWithGooglePlace;
  onLinkClick: (place: MrPlaceWithGooglePlace) => void;
  onClose: () => void;
}

const PlaceInfoWindow: React.FC<PlaceInfoWindowProps> = ({ place, onLinkClick, onClose }) => {

  const navigate = useNavigate();

  const placeLocation: GoogleGeometry = place.googlePlace!.geometry!;
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);

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

  function handlePlaceLinkClicked(): void {
    console.log('handlePlaceLinkClicked');
    console.log(place);
    onLinkClick(place);
  }

  const handleShowDirections = () => {
    if (placeLocation && currentLocation) {
      const destinationLocation: google.maps.LatLngLiteral = placeLocation.location;
      const destinationLatLng: google.maps.LatLngLiteral = { lat: destinationLocation.lat, lng: destinationLocation.lng };
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destinationLatLng.lat},${destinationLatLng.lng}&destination_place_id=${place.googlePlace!.name}`;
      window.open(url, '_blank');
    }
  };

  return (
    <InfoWindow
      position={getLatLngFromPlace(place)}
      onCloseClick={onClose}
    >
      <div
        style={{
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px', // Space between the link and the icon
          }}
        >
          <h4
            style={{
              margin: '0',
              color: 'blue', // Typical link color
              textDecoration: 'underline', // Typical link underline
              cursor: 'pointer', // Indicate it's clickable
              fontWeight: 'bold', // Make the link more prominent
            }}
            onClick={() => handlePlaceLinkClicked()}
          >
            {place.googlePlace!.name}
          </h4>
          <div
            onClick={handleShowDirections}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px', // Size consistent with Google Maps icon buttons
              height: '36px',
              backgroundColor: '#fff', // White background
              borderRadius: '50%', // Circular button
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)', // Subtle shadow for depth
              cursor: 'pointer', // Indicate it's clickable
            }}
          >
            <Icon
              icon={directionsIcon}
              style={{
                fontSize: '20px', // Icon size
                color: '#4285F4', // Google Maps-like blue
              }}
            />
          </div>
        </div>

        {place.placeType === PlaceType.Restaurant && (
          <Typography variant="body2" style={{ margin: '0 0 8px 0' }}>
            {restaurantTypeLabelFromRestaurantType(place.restaurantSpecs!.restaurantType!)}
          </Typography>
        )}
        <Typography variant="body2" style={{ margin: '0 0 8px 0' }}>
          {place.placeComments}
        </Typography>
      </div>
    </InfoWindow>
  );
}

export default PlaceInfoWindow;

