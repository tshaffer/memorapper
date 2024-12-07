import React, { useEffect, useState } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';

import MapWithMarkers from '../../components/MapWIthMarkers';
import { ExtendedGooglePlace, GooglePlace, MemoRappReview } from '../../types';

const Search: React.FC = () => {
  const [topHeight, setTopHeight] = useState(200); // Initial height for the top div
  const [bottomHeight, setBottomHeight] = useState(200); // Initial height for the bottom div

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);

  const containerHeight = 800; // Total height of the container

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

  return (
    <div
      style={{
        height: `${containerHeight}px`,
        border: '1px solid #ccc',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top Div */}
      <div
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
          style={{
            height: '10px',
            background: '#ccc',
            cursor: 'row-resize',
            userSelect: 'none',
          }}
        />
      </DraggableCore>

      {/* Overlay Content */}
      <div>
        {/* Filters */}
        <div style={{ padding: '16px', borderBottom: '1px solid #ccc' }}>Filters go here</div>

        {/* List of Restaurants */}
        <div>Restaurant List (Add list items here)</div>
      </div>
    </div>
  );
};

export default Search;
