import React, { useEffect, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

import MapWithMarkers from '../../components/MapWIthMarkers';
import { ExtendedGooglePlace, GooglePlace, MemoRappReview } from '../../types';

const Search = () => {
  const [searchArea, setSearchArea] = useState('Current Location');
  const [overlayHeight, setOverlayHeight] = useState(300); // Initial height of the overlay

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);

  // Define the min and max heights for the overlay
  const minHeight = 100; // Minimum height of the overlay (collapsed)
  const maxHeight = window.innerHeight - 100; // Maximum height of the overlay (expanded)

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

  useEffect(() => {
    console.log('Overlay Height Reset:', overlayHeight);
  }, [overlayHeight]);

  const getReviewsForPlace = (placeId: string): MemoRappReview[] =>
    reviews.filter((review) => review.place_id === placeId);

  const getExtendedGooglePlaces = (): ExtendedGooglePlace[] =>
    places.map((place) => ({
      ...place,
      reviews: getReviewsForPlace(place.place_id),
    }));

  // Adjust overlay height on drag
  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    const newHeight = overlayHeight - data.deltaY; // Calculate new height
    console.log('Current overlayHeight:', overlayHeight);
    console.log('deltaY:', data.deltaY);
    console.log('Calculated newHeight:', newHeight);

    setOverlayHeight(Math.min(maxHeight, Math.max(minHeight, newHeight))); // Clamp height within bounds
  };

  // const bounds: any = { top: -(overlayHeight - minHeight), bottom: maxHeight - overlayHeight };
  console.log('Bounds:', {
    top: -(overlayHeight - minHeight),
    bottom: maxHeight - overlayHeight,
  });

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* Map Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        pizza
        {/* <MapWithMarkers
          key={JSON.stringify({ googlePlaces: places, specifiedLocation: mapLocation })}
          initialCenter={mapLocation!}
          locations={getExtendedGooglePlaces()}
        /> */}
      </div>

      {/* Search Area UI */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, background: '#fff', padding: '16px' }}>
        <input
          type="text"
          // value={searchArea}
          // onChange={(e) => setSearchArea(e.target.value)}
          placeholder="Search area"
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        {/* <button onClick={() => setSearchArea('Current Location')}>Current Location</button> */}
        <button onClick={() => console.log('Reset to Current Location')}>Current Location</button>
      </div>

      {/* Overlayed UI */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${overlayHeight}px`,
          zIndex: 2,
          background: '#fff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag Handle */}
        <Draggable
          axis="y"
          bounds={{ top: -(overlayHeight - minHeight), bottom: maxHeight - overlayHeight }}
          onDrag={handleDrag}
        >
          <div
            style={{
              height: '40px',
              background: '#ddd',
              cursor: 'ns-resize',
              textAlign: 'center',
              lineHeight: '40px',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
            }}
          >
            •••
          </div>
        </Draggable>

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
