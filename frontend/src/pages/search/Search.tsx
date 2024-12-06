import React, { useEffect, useState } from 'react';
import MapWithMarkers from '../../components/MapWIthMarkers';
import { ExtendedGooglePlace, GooglePlace, MemoRappReview } from '../../types';

const Search = () => {
  const [searchArea, setSearchArea] = useState('Current Location');
  const [overlayHeight, setOverlayHeight] = useState(300); // Initial height of overlayed UI

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);

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

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const startY = event.clientY;
    const startHeight = overlayHeight;

    const handleMouseMove = (event: MouseEvent) => {
      const newHeight = startHeight + startY - event.clientY;
      handleDrag(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  const handleDrag = (newHeight: number) => {
    setOverlayHeight(newHeight);
  };

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* Map Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <MapWithMarkers
          key={JSON.stringify({ googlePlaces: places, specifiedLocation: mapLocation })} // Forces re-render on prop change
          initialCenter={mapLocation!}
          locations={getExtendedGooglePlaces()}
        />
      </div>

      {/* Search Area UI */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, background: '#fff', padding: '16px' }}>
        <input
          type="text"
          value={searchArea}
          onChange={(e) => setSearchArea(e.target.value)}
          placeholder="Search area"
        />
        <button onClick={() => setSearchArea('Current Location')}>Current Location</button>
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
          transition: 'height 0.3s ease',
        }}
      >
        <div style={{ height: '40px', cursor: 'grab', textAlign: 'center' }} onMouseDown={handleMouseDown}>
          <span>•••</span> {/* Drag Handle */}
        </div>
        <div>
          {/* Filters */}
          <div>Filter Row (Add filters here)</div>

          {/* List of Restaurants */}
          <div>Restaurant List (Add list items here)</div>
        </div>
      </div>
    </div>
  );
};

export default Search;
