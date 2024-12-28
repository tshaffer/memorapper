import React, { useEffect, useState } from 'react';

import { GooglePlace, MemoRappReview, SearchUIFilters, SortCriteria } from '../../types';

import PulsingDots from '../../components/PulsingDots';

import RestaurantsTable from './RestaurantsTable';
import Query from '../../components/Query';

const Search: React.FC = () => {

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<MemoRappReview[]>([]);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>(SortCriteria.Distance);

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
      setFilteredPlaces(data.googlePlaces);
    };

    const fetchReviews = async () => {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      setReviews(data.memoRappReviews);
      setFilteredReviews(data.memoRappReviews);
    };

    fetchCurrentLocation();
    fetchPlaces();
    fetchReviews();
  }, []);

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

      setPlaces(places);
      setReviews(reviews);
      setFilteredPlaces(places);
      setFilteredReviews(reviews);
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

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) {
      return null;
    }
    return (<PulsingDots />);
  };

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
      {/* Overlay Content */}
      <div
        id='overlayContent'
        style={{
          background: '#e0e0e0',
          overflow: 'auto',
        }}
      >
        {/* Filters */}
        <Query
          onExecuteQuery={(query: string) => handleExecuteQuery(query)}
        />

        {renderPulsingDots()}

        {/* List of Restaurants */}
        <RestaurantsTable
          currentLocation={mapLocation}
          filteredPlaces={filteredPlaces}
          filteredReviews={filteredReviews}
          sortCriteria={sortCriteria}
        />
      </div>
    </div>
  );
};

export default Search;
