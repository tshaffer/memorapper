import React, {  } from 'react';
import { ReviewedRestaurantWithPlace } from '../types';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace, iconFromRestaurantType } from '../utilities';
import '../App.css';

import { Icon } from '@iconify/react';

// // https://icon-sets.iconify.design/?query=<query>

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

interface ReviewedRestaurantMarkerProps {
  reviewedRestaurant: ReviewedRestaurantWithPlace;
  onMarkerClick: (reviewedRestaurant: ReviewedRestaurantWithPlace) => void;
}

const ReviewedRestaurantMarker: React.FC<ReviewedRestaurantMarkerProps> = ({ reviewedRestaurant, onMarkerClick }) => {

  const handleReviewedRestaurantMarkerClick = () => {
    onMarkerClick(reviewedRestaurant);
  };

  const renderReviewedRestaurantMarker = (): JSX.Element => {
    if (!reviewedRestaurant.googlePlace) {
      return <></>;
    }
    return (
      <AdvancedMarker
        position={getLatLngFromPlace(reviewedRestaurant.googlePlace)}
        onClick={() => handleReviewedRestaurantMarkerClick()}
      >
        <div style={{ position: 'relative' }}>
          <div style={textStyle('red')}>{reviewedRestaurant.googlePlace.name}</div>
          <div style={iconContainerStyle}>
            <Icon icon={iconFromRestaurantType(reviewedRestaurant.googlePlace.restaurantType)} style={{ fontSize: '30px', color: 'red' }} />
          </div>
        </div>
      </AdvancedMarker>
    );
  }

  return (
    <>
      {renderReviewedRestaurantMarker()}
    </>
  );
}

export default ReviewedRestaurantMarker;