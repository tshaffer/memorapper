import React, { useEffect, useState } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';

import { ExtendedGooglePlace, GooglePlace, MemoRappReview, SearchUIFilters } from '../../types';

import PulsingDots from '../../components/PulsingDots';

import LocationAutocomplete from '../../components/LocationAutocomplete';
import MapWithMarkers from '../../components/MapWIthMarkers';
import SearchFilters from './SearchFilters';

const Search: React.FC = () => {
  const [topHeight, setTopHeight] = useState(window.innerHeight * 0.4); // Initial height for the top div
  const [bottomHeight, setBottomHeight] = useState(window.innerHeight * 0.6); // Initial height for the bottom div

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);
  const [containerHeight, setContainerHeight] = useState(window.innerHeight); // Full height of the viewport

  const [isLoading, setIsLoading] = useState(false);

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

  const executeQuery = async (query: string): Promise<void> => {
    const requestBody = { query };

    try {
      const apiResponse = await fetch('/api/reviews/nlQuery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data: any = await apiResponse.json();
      console.log('nlQuery:', data);
      const { places, reviews } = data;
      console.log('nl query results:', places, reviews);

      // setPlaces(places);
      // setFilteredPlaces(places);
      // setFilteredReviews(reviews);
    } catch (error) {
      console.error('Error executing nl query:', error);
    }
  }

  const handleExecuteQuery = async (query: string): Promise<void> => {

    console.log('handleExecuteQuery:', query);

    setIsLoading(true);

    await executeQuery(query);

    setIsLoading(false);

  }

  const executeFilter = async (filter: SearchUIFilters): Promise<void> => {
    const requestBody = { filter };

    try {
      const apiResponse = await fetch('/api/reviews/filterResults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data: any = await apiResponse.json();
      console.log('filterQuery:', data);
      const { places, reviews } = data;
      console.log('filter query results:', places, reviews);

      // setPlaces(places);
      // setFilteredPlaces(places);
      // setFilteredReviews(reviews);
    } catch (error) {
      console.error('Error executing filter query:', error);
    }
  }
  const handleExecuteFilter = async (filter: SearchUIFilters): Promise<void> => {

    console.log('handleExecuteFilter:', filter);

    setIsLoading(true);

    await executeFilter(filter);

    setIsLoading(false);
  }

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) {
      return null;
    }
    return (<PulsingDots />);
  };

  const renderSearchAreaUI = (): JSX.Element => {
    return (
      <LocationAutocomplete
        onSetMapLocation={(location) => handleSetMapLocation(location)} />
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
        <SearchFilters
          onExecuteQuery={(query: string) => handleExecuteQuery(query)}
          onExecuteFilter={(filter: SearchUIFilters) => handleExecuteFilter(filter)}
        />

        {renderPulsingDots()}

        {/* List of Restaurants */}
        <div>Restaurant List (Add list items here)</div>
      </div>
    </div>
  );
};

export default Search;
