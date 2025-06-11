import React from 'react';
import { PlaceType, MrPlaceWithGooglePlace } from '../types';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace, iconFromRestaurantType } from '../utilities';
import '../App.css';

import { Icon } from '@iconify/react';

// Icons
import restaurantIcon from '@iconify/icons-openmoji/fork-and-knife-with-plate';
import roundPushpin from '@iconify/icons-openmoji/round-pushpin';
import loveHotelIcon from '@iconify/icons-openmoji/love-hotel';
import convenienceStoreIcon from '@iconify/icons-openmoji/convenience-store';
import { Rating } from '@mui/material';

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
  place: MrPlaceWithGooglePlace & { visited?: boolean }; // <- includes visited
  onMarkerClick: (place: MrPlaceWithGooglePlace) => void;
  isHovered?: boolean;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ place, onMarkerClick, isHovered }) => {

  const [hovered, setHovered] = React.useState(false);

  const effectiveHover = hovered || isHovered;

  const handlePlaceMarkerClick = () => {
    onMarkerClick(place);
  };

  const getMarkerIcon = (): any => {
    switch (place.placeType) {
      case PlaceType.Restaurant:
        if (!place.restaurantSpecs) return restaurantIcon;
        return iconFromRestaurantType(place.restaurantSpecs.restaurantType!);
      case PlaceType.Accommodations:
        return loveHotelIcon;
      case PlaceType.GroceryStore:
        return convenienceStoreIcon;
      default:
        return roundPushpin;
    }
  };

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

  const renderHoverRating = (value: number | null | undefined): JSX.Element => {
    return (
      <Rating
        value={!value ? 0 : value / 2}
        max={5}
        readOnly
        size="small"
        precision={0.5}
      />
    );
  };

  const getVisitedPlaceHoverElement = (): JSX.Element => {

    console.log('getVisitedPlaceHoverElement called for place:', place.googlePlace?.name);

    const elements: JSX.Element[] = [];

    if (place.placeRating && place.placeRating > 0) {
      elements.push(
        <span key="rating-label">
          Memorapper Rating: {place.placeRating.toString()}{renderHoverRating(place.placeRating)}
        </span>
      );
    }

    if (place.placeReview && place.placeReview.length > 0) {
      elements.push(<span key="review">{place.placeReview}</span>);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {elements}
      </div>
    );
  }

  const getUnvisitedPlaceHoverElement = (): JSX.Element => {
    const elements: JSX.Element[] = [];

    if (place.interestLevel && place.interestLevel > 0) {
      elements.push(
        <span key="preview-label">
          Interest level: {place.interestLevel.toString()}{renderHoverRating(place.interestLevel)}
        </span>
      );
    }

    if (place.googlePlace?.rating) {
      elements.push(
        <span key="rating-label">
          Google rating: {place.googlePlace.rating.toString()}{renderHoverRating(place.googlePlace?.rating)}
        </span>
      );
    }

    if (place.placePreview && place.placePreview.length > 0) {
      elements.push(<span key="preview">{place.placePreview}</span>);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {elements}
      </div>
    );
  }

  const getPlaceHoverElement = (): JSX.Element => {
    if (place.visited) {
      return getVisitedPlaceHoverElement();
    } else {
      return getUnvisitedPlaceHoverElement();
    }
  };

  const renderPlaceMarker = (): JSX.Element => {
    return (
      <AdvancedMarker
        position={getLatLngFromPlace(place)}
        onClick={handlePlaceMarkerClick}
      >
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Hover Info Box */}
          {effectiveHover && (
            <div
              style={{
                position: 'absolute',
                top: '-4.5rem', // adjust higher if needed
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '6px 10px',
                backgroundColor: '#333',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                zIndex: 1000,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
              }}
            >
              {getPlaceHoverElement()}
            </div>
          )}

          {/* Name Label */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              padding: '2px 4px',
              borderRadius: '4px',
              textAlign: 'center',
              marginBottom: '4px',
            }}
          >
            <div style={textStyle()}>{place.googlePlace?.name}</div>
          </div>

          {/* Marker Icon */}
          <div style={iconContainerStyle}>
            <Icon icon={getMarkerIcon()} style={{ fontSize: '30px' }} />
          </div>
        </div>
      </AdvancedMarker>
    );
  };

  return <>{renderPlaceMarker()}</>;
};

export default PlaceMarker;
