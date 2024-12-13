import React, { useEffect, useState } from 'react';
import {
  DndContext,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
// import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

import { ExtendedGooglePlace, GooglePlace, MemoRappReview, SearchUIFilters, SortCriteria } from '../../types';

// import DragHandle from '../../components/DragHandle';
import PulsingDots from '../../components/PulsingDots';

import LocationAutocomplete from '../../components/LocationAutocomplete';
import MapWithMarkers from '../../components/MapWIthMarkers';
import SearchFilters from './SearchFilters';
import RestaurantsTable from './RestaurantsTable';
import Draggable from '../dndTouch/DndTouchDraggable';

const Search: React.FC = () => {
  const [topHeight, setTopHeight] = useState(window.innerHeight * 0.4); // Initial height for the top div
  const [bottomHeight, setBottomHeight] = useState(window.innerHeight * 0.6); // Initial height for the bottom div

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

  const getReviewsForPlace = (placeId: string): MemoRappReview[] =>
    reviews.filter((review) => review.place_id === placeId);

  const getExtendedGooglePlaces = (): ExtendedGooglePlace[] =>
    places.map((place) => ({
      ...place,
      reviews: getReviewsForPlace(place.place_id),
    }));

  // Handle vertical dragging
  const handleDragMove = (event: any) => {
    console.log('handleDragMove');
    const deltaY = event.delta.y;
    const newTopHeight = Math.max(50, Math.min(topHeight + deltaY, containerHeight - 50));
    setTopHeight(newTopHeight);
    setBottomHeight(containerHeight - newTopHeight);
  };

  const DraggableHandle: React.FC = () => {
    const { attributes, listeners, setNodeRef } = useDraggable({
      id: 'draggable-handle',
    });

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          height: '10px',
          backgroundColor: '#ccc',
          cursor: 'row-resize',
          textAlign: 'center',
          lineHeight: '10px',
          userSelect: 'none',
        }}
      />
    );
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

  return (
    <DndContext sensors={useSensors(useSensor(PointerSensor))} onDragMove={handleDragMove}>
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
            blueDotLocation={mapLocation!}
          />
        </div>

        {/* Draggable Handle */}
        <DraggableHandle />

        {/* Drag Handle */}
        {/* <DragHandle onDrag={handleDrag} /> */}
        {/* <Draggable id="1" /> */}
        {/* <DraggableCore onDrag={handleDrag}>
        <div
          id='dragHandle'
          style={{
            height: '10px',
            background: '#ccc',
            cursor: 'row-resize',
            userSelect: 'none',
          }}
        />
      </DraggableCore> */}

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
      </div>
    </DndContext>
  );



};

export default Search;
