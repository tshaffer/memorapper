import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import directionsIcon from '@iconify/icons-mdi/directions';
import { ExtendedGooglePlace, MemoRappReview } from '../types';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace, restaurantTypeLabelFromRestaurantType } from '../utilities';
import '../App.css';
import { Typography, useMediaQuery } from '@mui/material';

interface RestaurantInfoWindowProps {
  location: ExtendedGooglePlace;
  onClose: () => void;
}

const RestaurantInfoWindow: React.FC<RestaurantInfoWindowProps> = ({ location, onClose }) => {

  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigate();

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


  const handleShowDirections = () => {
    if (location && currentLocation) {
      const destinationLocation: google.maps.LatLngLiteral = location.geometry!.location;
      const destinationLatLng: google.maps.LatLngLiteral = { lat: destinationLocation.lat, lng: destinationLocation.lng };
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destinationLatLng.lat},${destinationLatLng.lng}&destination_place_id=${location.name}`;
      window.open(url, '_blank');
    }
  };

  function handleRestaurantLinkClicked(): void {
    console.log('handleRestaurantLinkClicked');
    const reviews: MemoRappReview[] = location.reviews
    navigate(`/restaurantDetails`, { state: { place: location, reviews } });
  }

  return (
    <InfoWindow
      position={getLatLngFromPlace(location)}
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
            onClick={() => handleRestaurantLinkClicked()}
          >
            {location.name}
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
        <Typography variant="body2" style={{ margin: '0 0 8px 0' }}>
          {restaurantTypeLabelFromRestaurantType(location.restaurantType)}
        </Typography>
      </div>
    </InfoWindow>
  );
}

export default RestaurantInfoWindow;

