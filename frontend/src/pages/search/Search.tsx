import React, { useEffect, useState } from 'react';
import {
  DndContext,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core';

import { ExtendedGooglePlace, GooglePlace, MemoRappReview, SearchUIFilters, SortCriteria } from '../../types';

import PulsingDots from '../../components/PulsingDots';

import LocationAutocomplete from '../../components/LocationAutocomplete';
import MapWithMarkers from '../../components/MapWIthMarkers';
import SearchFilters from './SearchFilters';
import RestaurantsTable from './RestaurantsTable';
import { Button } from '@mui/material';

const Search: React.FC = () => {

  const [topHeight, setTopHeight] = useState(window.innerHeight / 2); // Initial position for the draggable component
  const [containerHeight, setContainerHeight] = useState(window.innerHeight); // Full height of the viewport

  const [mapLocation, setMapLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<GooglePlace[]>([]);
  const [reviews, setReviews] = useState<MemoRappReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<MemoRappReview[]>([]);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>(SortCriteria.Distance);

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

  const getReviewsForPlace = (placeId: string): MemoRappReview[] =>
    reviews.filter((review) => review.place_id === placeId);

  const getExtendedGooglePlaces = (): ExtendedGooglePlace[] =>
    places.map((place) => ({
      ...place,
      reviews: getReviewsForPlace(place.place_id),
    }));

  const handleDragMove = (event: any) => {
    // No state update during dragging; rely on `transform` for smooth UI feedback
  };
  
  const handleDragEnd = (event: any) => {
    if (event.delta.y) {
      const newTopHeight = Math.max(
        50,
        Math.min(topHeight + event.delta.y, containerHeight - 50)
      );
      setTopHeight(newTopHeight); // Update state only at the end of the drag
    }
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

  const executeFilter = async (filter: SearchUIFilters): Promise<void> => {
    const requestBody = { filter, places, reviews, mapLocation };

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

      setFilteredPlaces(places);
      setFilteredReviews(reviews);
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

  const handleSetSortCriteria = (sortCriteria: SortCriteria): void => {
    console.log('handleSetSortCriteria:', sortCriteria);
    setSortCriteria(sortCriteria as SortCriteria);
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

  const renderOverlayContent = (): JSX.Element => {

    return (
      <div
        id='overlayContent'
        style={{
          background: '#e0e0e0',
          overflow: 'auto',
        }}
      >
        {/* Filters */}
        <SearchFilters
          onExecuteQuery={(query: string) => handleExecuteQuery(query)}
          onExecuteFilter={(filter: SearchUIFilters) => handleExecuteFilter(filter)}
          onSetSortCriteria={(sortCriteria: SortCriteria) => handleSetSortCriteria(sortCriteria)}
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
    );
  }

  function Draggable() {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: 'draggable',
    });
  
    const draggableStyle = {
      top: `${topHeight}px`, // Use topHeight for initial positioning
      left: '0',
      width: '100%',
      height: `${containerHeight - topHeight}px`,
      position: 'absolute' as const, // Keep it positioned above mapLayer
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      boxShadow: '0px -2px 8px rgba(0,0,0,0.2)',
      overflow: 'auto',
      zIndex: 10, // Ensure it overlays mapLayer
      cursor: 'row-resize',
      touchAction: 'none', // Prevents scroll interference on touch devices
      transform: transform ? `translateY(${transform.y}px)` : undefined, // Inline transform for smooth drag
      transition: transform ? 'none' : 'top 0.2s ease', // Disable smooth transition while dragging
    };
  
    return (
      <button
        ref={setNodeRef}
        style={draggableStyle}
        {...listeners}
        {...attributes}
      >
        {renderOverlayContent()}
      </button>
    );
  }
  
  const renderMapLayer = (): JSX.Element => {
    return (
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
          blueDotLocation={mapLocation!}
        />
      </div>
    );
  }

  const renderSearchContainer = (): JSX.Element => {
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
        {renderSearchAreaUI()}
        {renderMapLayer()}
      </div>
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 1 } })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd} // Track drag end
  >
      <Draggable />
      {renderSearchContainer()}
    </DndContext>
  );

};

export default Search;
