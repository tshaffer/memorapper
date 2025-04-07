import React, { } from 'react';
import { Place } from '../types';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace } from '../utilities';
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

interface PlaceMarkerProps {
  place: Place;
  onMarkerClick: (place: Place) => void;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ place, onMarkerClick }) => {

  const handlePlaceMarkerClick = () => {
    onMarkerClick(place);
  };

  const renderPlaceMarker = (): JSX.Element => (
    <AdvancedMarker
      position={getLatLngFromPlace(place)}
      onClick={() => handlePlaceMarkerClick()}
    >
      <div style={{ position: 'relative' }}>
        <div style={textStyle('pink')}>{place.name}</div>
        <div style={iconContainerStyle}>
          <Icon icon={restaurantIcon} style={{ fontSize: '30px', color: 'pink' }} />
          {/* <Icon icon={iconFromRestaurantType(place.restaurantType!)} style={{ fontSize: '30px', color: 'red' }} /> */}
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