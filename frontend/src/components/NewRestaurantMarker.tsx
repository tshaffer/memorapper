import React, {  } from 'react';
import { NewRestaurant } from '../types';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace, iconFromRestaurantType } from '../utilities';
import '../App.css';

import { Icon } from '@iconify/react';

// // https://icon-sets.iconify.design/?query=<query>
import restaurantIcon from '@iconify/icons-openmoji/fork-and-knife-with-plate';

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

interface NewRestaurantMarkerProps {
  newRestaurant: NewRestaurant;
  onMarkerClick: (reviewedRestaurant: NewRestaurant) => void;
}

const NewRestaurantMarker: React.FC<NewRestaurantMarkerProps> = ({ newRestaurant, onMarkerClick }) => {

  const handleNewRestaurantMarkerClick = () => {
    onMarkerClick(newRestaurant);
  };

  const renderNewRestaurantMarker = (): JSX.Element => (
    <AdvancedMarker
      position={getLatLngFromPlace(newRestaurant.googlePlace!)}
      onClick={() => handleNewRestaurantMarkerClick()}
    >
      <div style={{ position: 'relative' }}>
        <div style={textStyle('blue')}>{newRestaurant.googlePlace!.name}</div>
        <div style={iconContainerStyle}>
          <Icon icon={restaurantIcon} style={{ fontSize: '30px', color: 'blue' }} />
          <Icon icon={iconFromRestaurantType(newRestaurant.googlePlace!.restaurantType)} style={{ fontSize: '30px', color: 'red' }} />
        </div>
      </div>
    </AdvancedMarker>
  );

  return (
    <>
      {renderNewRestaurantMarker()}
    </>
  );
}

export default NewRestaurantMarker;