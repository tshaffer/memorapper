import React, { useEffect, useRef, useState } from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { Typography, Button, Popover, FormControlLabel, Checkbox, TextField, Slider, Switch, Radio, Box } from '@mui/material';

import '../App.css';

import { FilterQueryParams, GooglePlace, MemoRappReview, PlacesReviewsCollection, QueryRequestBody, WouldReturnQuery } from '../types';
import { Autocomplete, LoadScript } from '@react-google-maps/api';
import { libraries } from '../utilities';
import PlacesAndReviews from './PlacesAndReviews';

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

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleNaturalLanguageQuery = async () => {

    console.log('Query:', query);

    const queryRequestBody: QueryRequestBody = {
      query,
    };

    try {
      const apiResponse = await fetch('/api/reviews/naturalLanguageQuery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryRequestBody),
      });
      const data = await apiResponse.json();
      console.log('Natural language query results:', data);
      // const { places, reviews } = data.result;
    } catch (error) {
      console.error('Error handling query:', error);
    }
  }

  const handleDistanceClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElSetDistance(event.currentTarget);
  };

  const handleDistanceFilterToggle = () => {
    setDistanceFilterEnabled((prev) => !prev);
  };

  const handleDistanceSliderChange = (_: Event, newValue: number | number[]) => {
    setFromLocationDistance(newValue as number);
  };

  const handleFromLocationPlaceChanged = () => {
    if (fromLocationAutocompleteRef.current) {
      const place: google.maps.places.PlaceResult = fromLocationAutocompleteRef.current.getPlace();
      if (place.geometry !== undefined) {
        const geometry: google.maps.places.PlaceGeometry = place.geometry!;
        setFromLocationLocation(
          {
            lat: geometry.location!.lat(),
            lng: geometry.location!.lng(),
          }
        );
        console.log("From location place changed:", place);
      }
    }
  };

  const handleDistanceClose = () => {
    setAnchorElSetDistance(null);
  };

  const handleWouldReturnClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElWouldReturn(event.currentTarget);
  };

  const handleWouldReturnChange = (filter: keyof typeof wouldReturnFilter) => {
    setWouldReturnFilter((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleClearWouldReturnFilter = () => {
    setWouldReturnFilter({ yes: false, no: false, notSpecified: false });
  };

  const handleWouldReturnClose = () => {
    setAnchorElWouldReturn(null);
  };

  const handleItemOrderedClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElItemOrdered(event.currentTarget);
  };

  const handleToggleItemOrdered = (item: string) => {
    setSelectedItemsOrdered((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const handleItemOrderedClose = () => {
    setAnchorElItemOrdered(null);
  };

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
    } catch (error) {
      console.error('Error handling query:', error);
    }
  };

  const renderFiltersUI = (): JSX.Element => {
    return (
      <Box
        id='filtersRow'
        sx={{
          display: 'flex',
          gap: 1,
          padding: 2,
          borderBottom: '1px solid #ccc',
        }}
      >        {/* Specify Filter Buttons */}
        <Button
          variant="outlined"
          onClick={handleDistanceClick}
          sx={{
            borderColor: '#1976d2', // MUI primary color
            color: '#1976d2',
            textTransform: 'none', // Prevents uppercase transformation
          }}
        >
          Distance Away
        </Button>
        <Button
          variant="outlined"
          onClick={handleWouldReturnClick}
          sx={{
            borderColor: '#1976d2', // MUI primary color
            color: '#1976d2',
            textTransform: 'none',
          }}
        >
          Return?
        </Button>
        <Button
          variant="outlined"
          onClick={handleItemOrderedClick}
          sx={{
            borderColor: '#1976d2', // MUI primary color
            color: '#1976d2',
            textTransform: 'none',
          }}
        >
          Item Ordered
        </Button>

        {/* Apply Filter Button */}
        <Button
          variant="contained"
          onClick={handleSearchByFilter}
          sx={{
            backgroundColor: '#1976d2', // MUI primary color
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#1565c0', // Darker shade of primary color
            },
          }}
        >
          Apply
        </Button>
        {renderDistanceAwayFilterPopover()}
        {renderWouldReturnFilterPopover()}
        {renderItemOrderedFilterPopover()}
      </Box>
    );
  }

  const renderDistanceAwayFilterPopover = (): JSX.Element => {
    return (
      <Popover
        open={Boolean(anchorElSetDistance)}
        anchorEl={anchorElSetDistance}
        onClose={handleDistanceClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div style={{ padding: '20px', minWidth: '200px' }}>
          <Typography variant="subtitle1">Distance Away Filter</Typography>

          <FormControlLabel
            control={<Switch checked={distanceFilterEnabled} onChange={handleDistanceFilterToggle} />}
            label={
              <Typography sx={smallTextStyle}>
                Enable Distance Filter
              </Typography>
            }
          />

          {/* From Label and Radio Buttons */}
          <Typography variant="body2" style={{ marginTop: '10px', marginBottom: '5px' }}>From</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <FormControlLabel
              control={
                <Radio
                  checked={fromLocation === 'current'}
                  onChange={() => setFromLocation('current')}
                  disabled={!distanceFilterEnabled} // Disable when the filter is off
                />
              }
              label={
                <Typography sx={smallTextStyle}>
                  Current Location
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Radio
                  checked={fromLocation === 'specified'}
                  onChange={() => setFromLocation('specified')}
                  disabled={!distanceFilterEnabled} // Disable when the filter is off
                />
              }
              label={
                <Typography sx={smallTextStyle}>
                  Specify Location
                </Typography>
              }
            />
          </div>

          {/* Google Maps Autocomplete Element */}
          {fromLocation === 'specified' && (
            <Autocomplete
              onLoad={(autocomplete) => (fromLocationAutocompleteRef.current = autocomplete)}
              onPlaceChanged={handleFromLocationPlaceChanged}
            >
              <input
                type="text"
                placeholder="Enter a from location"
                style={{
                  fontSize: '0.875rem',
                  width: '100%',
                  padding: '10px',
                  boxSizing: 'border-box',
                  marginBottom: '10px',
                }}
                disabled={!distanceFilterEnabled} // Disable the input when filter is off
              />
            </Autocomplete>
          )}

          <Typography sx={smallTextStyle} style={{ marginTop: '10px', marginBottom: '5px' }}>Distance</Typography>

          {/* Slider */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={smallTextStyle}>0 mi</Typography>
            <Typography sx={smallTextStyle}>{fromLocationDistance} mi</Typography>
          </div>
          <Slider
            value={fromLocationDistance}
            onChange={handleDistanceSliderChange}
            min={0}
            max={10}
            step={0.5}
            disabled={!distanceFilterEnabled} // Disable slider when filter is off
            valueLabelDisplay="off"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDistanceClose}
            >
              Close
            </Button>
          </div>
        </div>
      </Popover>
    );
  }

  const renderWouldReturnFilterPopover = (): JSX.Element => {
    const disableClearButton = !wouldReturnFilter.yes && !wouldReturnFilter.no && !wouldReturnFilter.notSpecified;
    return (
      <Popover
        open={Boolean(anchorElWouldReturn)}
        anchorEl={anchorElWouldReturn}
        onClose={handleWouldReturnClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <Typography sx={smallTextStyle} gutterBottom>
            Would Return Filter
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FormControlLabel
              control={<Checkbox checked={wouldReturnFilter.yes} onChange={() => handleWouldReturnChange('yes')} />}
              label={
                <Typography sx={smallTextStyle}>
                  Yes
                </Typography>
              }
            />
            <FormControlLabel
              control={<Checkbox checked={wouldReturnFilter.no} onChange={() => handleWouldReturnChange('no')} />}
              label={
                <Typography sx={smallTextStyle}>
                  No
                </Typography>
              }
            />
            <FormControlLabel
              control={<Checkbox checked={wouldReturnFilter.notSpecified} onChange={() => handleWouldReturnChange('notSpecified')} />}
              label={
                <Typography sx={smallTextStyle}>
                  Not Specified
                </Typography>
              }
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearWouldReturnFilter}
              style={{
                color: 'black',
                borderColor: 'black',
                height: 'fit-content', // Adjusts height to match the checkbox labels
              }}
              disabled={disableClearButton}
            >
              Clear
            </Button>
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleWouldReturnClose} // Ensure you have this function defined to handle the search
            style={{ alignSelf: 'flex-end', marginTop: '10px' }}
          >
            Close
          </Button>
        </div>
      </Popover>
    );
  }

  const renderItemOrderedFilterPopover = (): JSX.Element => {
    return (
      <Popover
        open={Boolean(anchorElItemOrdered)}
        anchorEl={anchorElItemOrdered}
        onClose={handleItemOrderedClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ padding: 2, minWidth: 250 }}>
          <Typography variant="subtitle1" gutterBottom>
            Items Ordered Filter
          </Typography>

          {standardizedItemsOrdered.length > 0 ? (
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              <List>
                {standardizedItemsOrdered.map((item) => (
                  <ListItem key={item} disablePadding>
                    <Checkbox
                      checked={selectedItemsOrdered.has(item)}
                      onChange={() => handleToggleItemOrdered(item)}
                    />
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No items available to filter.
            </Typography>
          )}

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button variant="contained" color="primary" onClick={handleItemOrderedClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Popover>
    );
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!} libraries={libraries}>
      <Box id='reviewPageContainer' sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Freeform Query Input */}
        <Box
          id='freeFormQueryInput'
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            borderBottom: '1px solid #ccc',
          }}
        >
          <TextField
            label="Enter query"
            variant="outlined"
            value={query}
            onChange={handleQueryChange}
            fullWidth
            sx={{ marginRight: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleNaturalLanguageQuery}>
            Search
          </Button>
        </Box>

        {/* Filters */}
        {renderFiltersUI()}

        {/* Places and Reviews*/}
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
