import React, { } from 'react';
import { Place, PlaceType, PlaceWithGooglePlace } from '../types';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace, iconFromRestaurantType } from '../utilities';
import '../App.css';

import { Icon } from '@iconify/react';

// // https://icon-sets.iconify.design/?query=<query>
import restaurantIcon from '@iconify/icons-openmoji/fork-and-knife-with-plate';
import roundPushpin from '@iconify/icons-openmoji/round-pushpin';
import loveHotelIcon from '@iconify/icons-openmoji/love-hotel';
import convenienceStoreIcon from '@iconify/icons-openmoji/convenience-store';

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

interface PlaceMarkerProps {
  place: PlaceWithGooglePlace;
  onMarkerClick: (place: PlaceWithGooglePlace) => void;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ place, onMarkerClick }) => {

  const handlePlaceMarkerClick = () => {
    onMarkerClick(place);
  };

  const getMarkerIcon = (): any => {
    switch (place.placeType) {
      case PlaceType.Restaurant:
        if (!place.restaurant) {
          return restaurantIcon;
        } else {
          return iconFromRestaurantType(place.restaurant.restaurantType!);
        }
      case PlaceType.Accommodations:
        return loveHotelIcon;
      case PlaceType.GroceryStore:
        return convenienceStoreIcon;
      default:
        return roundPushpin;
    }
  }

  const getMarkerColor = (): string => {
    return place.visited ? '#1e7e34' : '#0056b3';
  };

  const textStyle = (): React.CSSProperties => ({
    position: 'absolute',
    right: '18px',
    transform: 'translateY(-150%)',
    whiteSpace: 'nowrap',
    color: getMarkerColor(),
    fontSize: '16px',
    fontWeight: '500',
    backgroundColor: 'transparent',
    textShadow: `
      1px 1px 0 white,
      -1px 1px 0 white,
      1px -1px 0 white,
      -1px -1px 0 white
    `,
  });


  const renderPlaceMarker = (): JSX.Element => (
    <AdvancedMarker
      position={getLatLngFromPlace(place)}
      onClick={() => handlePlaceMarkerClick()}
    >
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.5)',
          padding: '2px 4px',
          borderRadius: '4px',
        }}>
          <div style={textStyle()}>{place.googlePlace!.name}</div>
        </div>
        <div style={iconContainerStyle}>
          <Icon icon={getMarkerIcon()} style={{ fontSize: '30px' }} />
        </div>
      </div>
    </AdvancedMarker>
  );

  return (
    <>
      {renderPlaceMarker()}
    </>
  );
}

export default PlaceMarker;