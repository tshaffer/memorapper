import React, { useEffect, useRef, useState } from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { Typography, Button, Popover, FormControlLabel, Checkbox, TextField, Slider, Switch, Radio, Box } from '@mui/material';

import '../App.css';

import { FilterQueryParams, GooglePlace, MemoRappReview, PlacesReviewsCollection, QueryRequestBody, ReviewUIFilters, WouldReturnQuery } from '../types';
import { Autocomplete, LoadScript } from '@react-google-maps/api';
import { libraries } from '../utilities';
import PlacesAndReviews from './PlacesAndReviews';
import ReviewFilters from './ReviewFilters';

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 37.3944829, lng: -122.0790619 };

const smallTextStyle: React.CSSProperties = {
  fontSize: '0.875rem'
};

const ReviewsPage: React.FC = () => {

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const [reviews, setReviews] = useState<MemoRappReview[]>([]);
  const [places, setPlaces] = useState<GooglePlace[]>([]);

  const [filteredPlaces, setFilteredPlaces] = useState<GooglePlace[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<MemoRappReview[]>([]);
  const [query, setQuery] = useState<string>("");

  const [anchorElSetDistance, setAnchorElSetDistance] = useState<HTMLElement | null>(null);
  const [distanceFilterEnabled, setDistanceFilterEnabled] = useState(false);
  const [fromLocation, setFromLocation] = useState<'current' | 'specified'>('current');
  const [fromLocationLocation, setFromLocationLocation] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);
  const [fromLocationDistance, setFromLocationDistance] = useState(5);
  const fromLocationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [anchorElWouldReturn, setAnchorElWouldReturn] = useState<HTMLElement | null>(null);
  const [wouldReturnFilter, setWouldReturnFilter] = useState<WouldReturnQuery>({
    yes: false,
    no: false,
    notSpecified: false,
  });

  const [anchorElItemOrdered, setAnchorElItemOrdered] = useState<HTMLElement | null>(null);
  const [standardizedItemsOrdered, setStandardizedItemsOrdered] = useState<string[]>([]);
  const [selectedItemsOrdered, setSelectedItemsOrdered] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting current location: ", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
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
    const fetchStandardizedItemsOrdered = async () => {
      const response = await fetch('/api/standardizedNames');
      const uniqueStandardizedNames: string[] = await response.json();
      setStandardizedItemsOrdered(uniqueStandardizedNames);
    }
    fetchPlaces();
    fetchReviews();
    fetchStandardizedItemsOrdered();
  }, []);

  const handleSearchByFilter = async () => {
    console.log('handleSearchByFilter');

    let lat: number | undefined = undefined;
    let lng: number | undefined = undefined;

    if (distanceFilterEnabled) {
      if (fromLocation === 'current') {
        lat = currentLocation!.lat;
        lng = currentLocation!.lng;
      } else {
        lat = fromLocationLocation.lat;
        lng = fromLocationLocation.lng;
      }
    }

    const wouldReturn: WouldReturnQuery | undefined = wouldReturnFilter.yes || wouldReturnFilter.no || wouldReturnFilter.notSpecified ? wouldReturnFilter : undefined;

    const filterQueryParams: FilterQueryParams = {
      distanceAwayQuery: distanceFilterEnabled ? { lat: lat!, lng: lng!, radius: fromLocationDistance } : undefined,
      wouldReturn,
      itemsOrdered: selectedItemsOrdered.size > 0 ? Array.from(selectedItemsOrdered) : undefined,
    };

    try {
      const apiResponse = await fetch('/api/reviews/filterReviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterQueryParams),
      });
      const data: PlacesReviewsCollection = await apiResponse.json();
      console.log('Filter query results:', data);
      setFilteredPlaces(data.places);
      setFilteredReviews(data.reviews);
    } catch (error) {
      console.error('Error handling query:', error);
    }
  };

  const handleApplyFilters = (reviewFilters: ReviewUIFilters) => {
    console.log('Filters applied:', filterState);
    // setFilters(filterState); // Update the state with the applied filters
    // Add additional logic to apply filters, e.g., updating displayed reviews
  };


  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!} libraries={libraries}>
      <Box id='reviewPageContainer' sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ReviewFilters onApplyFilters={handleApplyFilters} />
        <PlacesAndReviews
          currentLocation={currentLocation}
          places={places}
          filteredPlaces={filteredPlaces}
          filteredReviews={filteredReviews}
        />
      </Box >
    </LoadScript >
  );
};

export default ReviewsPage;
