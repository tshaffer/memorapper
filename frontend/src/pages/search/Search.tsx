import React, { useEffect, useState } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';

import MapWithMarkers from '../../components/MapWIthMarkers';
import { ExtendedGooglePlace, GooglePlace, MemoRappReview } from '../../types';

const Search: React.FC = () => {
  const [overlayHeight, setOverlayHeight] = useState(200); // Initial height of the overlay UI
  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);
  const containerHeight = window.innerHeight; // Full height of the viewport

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

  // const handleDrag: DraggableEventHandler = (_, data) => {
  //   const newHeight = Math.max(50, Math.min(overlayHeight - data.deltaY, containerHeight - 50));
  //   setOverlayHeight(newHeight);
  // };

  const handleDrag: DraggableEventHandler = (_, data) => {

    console.log('Container height:', containerHeight);
    console.log('Overlay height:', overlayHeight);
    console.log('deltaY:', data.deltaY);

    const newHeight = Math.max(50, Math.min(overlayHeight - data.deltaY, containerHeight - 50));
    console.log('newHeight:', newHeight);

    setOverlayHeight(newHeight);
  };

  console.log('Render:', overlayHeight);
  
  return (
    <div
      style={{
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Map Layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0, // Map at the bottom layer
        }}
      >
        <MapWithMarkers
          key={JSON.stringify({ googlePlaces: places, specifiedLocation: mapLocation })} // Forces re-render on prop change
          initialCenter={mapLocation!}
          locations={getExtendedGooglePlaces()}
        />
      </div>

      {/* Search Area UI */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2, // Above map
          background: '#fff',
          padding: '16px',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
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

      {/* Overlay UI */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${overlayHeight}px`,
          zIndex: 2, // Above map
          background: '#fff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag Handle */}
        <DraggableCore onDrag={handleDrag}>
          <div
            style={{
              height: '10px',
              background: '#ccc',
              cursor: 'row-resize',
              userSelect: 'none',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
            }}
          />
        </DraggableCore>

        {/* Overlay Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div>Filters go here</div>
          <ul>
            <li>Restaurant 1</li>
            <li>Restaurant 2</li>
            <li>Restaurant 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Search;
