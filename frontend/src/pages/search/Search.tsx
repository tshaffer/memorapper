import React, { useEffect, useState } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';

import { ExtendedGooglePlace, GooglePlace, MemoRappReview } from '../../types';

import LocationAutocomplete from '../../components/LocationAutocomplete';
import MapWithMarkers from '../../components/MapWIthMarkers';

const Search: React.FC = () => {
  const [topHeight, setTopHeight] = useState(window.innerHeight * 0.4); // Initial height for the top div
  const [bottomHeight, setBottomHeight] = useState(window.innerHeight * 0.6); // Initial height for the bottom div

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);
  const [containerHeight, setContainerHeight] = useState(window.innerHeight); // Full height of the viewport

  useEffect(() => {
    const handleResize = () => {
      setContainerHeight(window.innerHeight); // Update container height on window resize
    };

    window.addEventListener('resize', handleResize); // Add listener
    return () => window.removeEventListener('resize', handleResize); // Cleanup listener on unmount
  }, []);

  useEffect(() => {
    const fetchCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setMapLocation(location);
          },
          (error) => console.error('Error getting current location: ', error),
          { enableHighAccuracy: true }
        );
      }
    };

    const fetchPlaces = async () => {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data.googlePlaces);
    };

    const fetchReviews = async () => {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      setReviews(data.memoRappReviews);
    };

    fetchCurrentLocation();
    fetchPlaces();
    fetchReviews();
  }, []);

  const getReviewsForPlace = (placeId: string): MemoRappReview[] =>
    reviews.filter((review) => review.place_id === placeId);

  const getExtendedGooglePlaces = (): ExtendedGooglePlace[] =>
    places.map((place) => ({
      ...place,
      reviews: getReviewsForPlace(place.place_id),
    }));

  const handleDrag: DraggableEventHandler = (_, data) => {
    const newTopHeight = Math.max(50, Math.min(topHeight + data.deltaY, containerHeight - 50));
    setTopHeight(newTopHeight);
    setBottomHeight(containerHeight - newTopHeight); // Adjust bottom height accordingly
  };

  const handleSetMapLocation = (location: google.maps.LatLngLiteral): void => {
    setMapLocation(location);
  }

  const renderSearchAreaUI = (): JSX.Element => {
    return (
      <LocationAutocomplete
        onSetMapLocation={(location) => handleSetMapLocation(location)} />
    );
  }

  const renderSearchAreaUIOld = (): JSX.Element => {
    return (
      <div
        id='searchArea'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          background: '#fff',
          padding: '16px',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', // Optional shadow for a floating effect
        }}
      >
        <input
          type="text"
          placeholder="Search area"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={() => console.log('Reset to Current Location')}
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Current Location
        </button>
      </div>
    );
  }
  return (
    <div
      id='searchContainer'
      style={{
        height: `${containerHeight}px`,
        position: 'relative', // Important for absolutely positioned children
        border: '1px solid #ccc',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Search Area UI */}
      {renderSearchAreaUI()}

      {/* Map Layer */}
      <div
        id='mapLayer'
        style={{
          height: `${topHeight}px`,
          background: '#f0f0f0',
          overflow: 'auto',
        }}
      >
        <MapWithMarkers
          key={JSON.stringify({ googlePlaces: places, specifiedLocation: mapLocation })} // Forces re-render on prop change
          initialCenter={mapLocation!}
          locations={getExtendedGooglePlaces()}
        />
      </div>

      {/* Drag Handle */}
      <DraggableCore onDrag={handleDrag}>
        <div
          id='dragHandle'
          style={{
            height: '10px',
            background: '#ccc',
            cursor: 'row-resize',
            userSelect: 'none',
          }}
        />
      </DraggableCore>

      {/* Overlay Content */}
      <div
        id='overlayContent'
        style={{
          height: `${bottomHeight}px`,
          background: '#e0e0e0',
          overflow: 'auto',
        }}
      >
        {/* Filters */}
        <div style={{ padding: '16px', borderBottom: '1px solid #ccc' }}>Filters go here</div>

        {/* List of Restaurants */}
        <div>Restaurant List (Add list items here)</div>
      </div>
    </div>
  );
};

export default Search;
