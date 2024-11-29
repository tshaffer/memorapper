import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemText, useMediaQuery } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Button, Popover, FormControlLabel, Checkbox, TextField, Slider, Switch, Radio, Tooltip, Box } from '@mui/material';

import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DirectionsIcon from '@mui/icons-material/Directions';
import MapIcon from '@mui/icons-material/Map';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

import '../App.css';

import { FilterQueryParams, PlacesReviewsCollection, GooglePlace, ItemReview, MemoRappReview, QueryRequestBody, WouldReturnQuery } from '../types';
import { Autocomplete, LoadScript } from '@react-google-maps/api';
import { getCityNameFromPlace, libraries } from '../utilities';

interface WouldReturnCounts {
  yesCount: number;
  noCount: number;
  nullCount: number;
}

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 37.3944829, lng: -122.0790619 };

const smallColumnStyle: React.CSSProperties = {
  width: '35px',
  maxWidth: '35px',
  textAlign: 'center',
  padding: '0',
};

const thumbsStyle: React.CSSProperties = {
  width: '60px',
  maxWidth: '60px',
  textAlign: 'center',
  padding: '0',
};

const smallTextStyle: React.CSSProperties = {
  fontSize: '0.875rem'
};

const ReviewsPage: React.FC = () => {

  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigate();

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

  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null);


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

  const getPlaceById = (placeId: string): GooglePlace | undefined => {
    return places.find((place: GooglePlace) => place.place_id === placeId);
  }

  const getFilteredReviewsForPlace = (placeId: string): MemoRappReview[] => {
    return filteredReviews.filter((memoRappReview: MemoRappReview) => memoRappReview.place_id === placeId);
  };

  const getWouldReturnToPlaceCounts = (placeId: string): WouldReturnCounts => {
    const counts: WouldReturnCounts = {
      yesCount: 0,
      noCount: 0,
      nullCount: 0,
    };

    reviews.forEach((memoRappReview: MemoRappReview) => {
      if (memoRappReview.place_id === placeId) {
        const wouldReturn = memoRappReview.structuredReviewProperties.wouldReturn;

        if (wouldReturn === true) {
          counts.yesCount += 1;
        } else if (wouldReturn === false) {
          counts.noCount += 1;
        } else {
          counts.nullCount += 1;
        }
      }
    });

    return counts;
  };

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
      const { places, reviews } = data.result;
      setPlaces(places);
      setFilteredPlaces(places);
      setReviews(reviews);
      setFilteredReviews(reviews);
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
      setFilteredPlaces(data.places);
      setFilteredReviews(data.reviews);
    } catch (error) {
      console.error('Error handling query:', error);
    }
  };

  const handlePlaceClick = (place: GooglePlace) => {
    setSelectedPlace(place);
    if (isMobile) {
      setViewMode('details');
    }
  }

  const handleShowMap = (placeId: string) => {
    navigate(`/map/${placeId}`);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPlace(null);
  };

  const handleShowDirections = (placeId: string) => {
    const destination: GooglePlace | undefined = places.find(place => place.place_id === placeId);
    if (destination && currentLocation) {
      const destinationLocation: google.maps.LatLngLiteral = destination.geometry!.location;
      const destinationLatLng: google.maps.LatLngLiteral = { lat: destinationLocation.lat, lng: destinationLocation.lng };
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destinationLatLng.lat},${destinationLatLng.lng}&destination_place_id=${destination.name}`;
      window.open(url, '_blank');
    }
  };

  const handleEditReview = (review: MemoRappReview) => {
    const place: GooglePlace | undefined = getPlaceById(review.place_id);
    if (!place) {
      console.error('Place not found for review:', review);
      return;
    }
    navigate(`/add-review/${review._id}`, { state: { place, review } });
  }

  const handleDeleteReview = (review: MemoRappReview) => {
    console.log('handleDeleteReview', review);
  }

  const renderReviewDetails = (review: MemoRappReview): JSX.Element => {
    return (
      <Paper id='reviewDetails' key={review._id} className="review-details" style={{ marginTop: '16px', boxShadow: 'none' }}>
        <div>
          <Tooltip title="Edit Review">
            <IconButton
              onClick={() => handleEditReview(review)}
              size="small" // Makes the button smaller
              sx={{ padding: '0px' }} // Reduces padding for smaller appearance
            >
              <EditIcon fontSize="small" /> {/* Makes the icon smaller */}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton
              onClick={() => handleDeleteReview(review)}
              size="small" // Makes the button smaller
              sx={{ padding: '0px' }} // Reduces padding for smaller appearance
            >
              <DeleteIcon fontSize="small" /> {/* Makes the icon smaller */}
            </IconButton>
          </Tooltip>
        </div>
        <Typography><strong>Date of Visit:</strong> {review.structuredReviewProperties.dateOfVisit}</Typography>
        <Typography><strong>Would Return:</strong> {(review.structuredReviewProperties.wouldReturn === true) ? 'Yes' : (review.structuredReviewProperties.wouldReturn === false) ? 'No' : 'Unspecified'}</Typography>
        <Typography><strong>Items Ordered:</strong></Typography>
        <ul>
          {review.freeformReviewProperties.itemReviews.map((itemReview: ItemReview, idx) => (
            <li key={idx}>
              {itemReview.item} - {itemReview.review || 'No rating provided'}
            </li>
          ))}
        </ul>
        <Typography><strong>Review Text:</strong> {review.freeformReviewProperties.reviewText}</Typography>
      </Paper>
    );
  }

  const renderReviewDetailsForSelectedPlace = (): JSX.Element | null => {
    if (selectedPlace === null) {
      return null;
    }
    const reviewsForSelectedPlace: MemoRappReview[] = getFilteredReviewsForPlace(selectedPlace.place_id);
    const reviewDetails = reviewsForSelectedPlace.map((review: MemoRappReview) => {
      return renderReviewDetails(review);
    });

    return (
      <Paper style={{ boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" style={{ marginBottom: '16px' }}>
          Reviews for {selectedPlace.name}
        </Typography>
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto', // Scrollable container for all reviews
            maxHeight: 'calc(100vh - 200px)', // Adjust for AppBar and other content
            padding: '0 12px', // Optional: Add horizontal padding
          }}
        >
          {reviewDetails}
        </div>
      </Paper>
    );
  };

  const renderThumbsUps = (placeId: string) => {
    const yesCount = getWouldReturnToPlaceCounts(placeId).yesCount;
    if (yesCount > 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{ marginRight: '8px' }}>{yesCount}</span>
          <ThumbUpIcon />
        </div>
      );
    } else {
      return null;
    }
  }

  const renderThumbsDowns = (placeId: string) => {
    const noCount = getWouldReturnToPlaceCounts(placeId).noCount;
    if (noCount > 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{ marginRight: '8px' }}>{noCount}</span>
          <ThumbDownIcon />
        </div>
      );
    } else {
      return null;
    }
  }

  const renderFiltersUI = (): JSX.Element => {
    return (
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {/* Specify Filter Buttons */}
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
      </div>
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

  const renderDetailsPanel = (): JSX.Element => {
    return (
      <div style={{ flex: 1 }}>
        {renderReviewDetailsForSelectedPlace()}
      </div>
    );
  }

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

        {/* Container for Places Table / Map */}
        {isMobile ? (
          viewMode === 'list' ? (
            <div className="scrollable-table-container">
              {filteredPlaces.map((place) => (
                <div key={place.place_id} style={{ marginBottom: '16px', padding: '8px', borderBottom: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">{place.name}</Typography>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <IconButton onClick={() => handleShowMap(place.place_id)} size="small" title="View Map">
                        <MapOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleShowDirections(place.place_id)} size="small" title="Show Directions">
                        <DirectionsIcon />
                      </IconButton>
                      <IconButton onClick={() => handlePlaceClick(place)} size="small" title="View Reviews">
                        <RateReviewOutlinedIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                  <Typography variant="body2" color="textSecondary">{getCityNameFromPlace(place)}</Typography>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              <Button variant="outlined" onClick={handleBackToList} style={{ marginBottom: '16px' }}>
                Back to List
              </Button>
              {selectedPlace && (
                <div>
                  {renderReviewDetailsForSelectedPlace()}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="table-and-details-container">
            <TableContainer component={Paper} className="scrollable-table-container">
              <Table stickyHeader>
                <TableHead>
                  <TableRow className="table-head-fixed">
                    <TableCell align="center"></TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell>Place</TableCell>
                    <TableCell>Location</TableCell>
                  </TableRow>
                </TableHead >
                <TableBody>
                  {filteredPlaces.map((place: GooglePlace) => (
                    <React.Fragment key={place.place_id}>
                      <TableRow className="table-row-hover" onClick={() => handlePlaceClick(place)} >
                        <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                          <IconButton onClick={() => handleShowMap(place.place_id)}>
                            <MapIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                          <IconButton onClick={() => handleShowDirections(place.place_id)}>
                            <DirectionsIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                          <IconButton onClick={() => handlePlaceClick(place)}>
                            <RateReviewOutlinedIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell align="right" style={thumbsStyle}>
                          {renderThumbsUps(place.place_id)}
                        </TableCell>
                        <TableCell align="right" style={thumbsStyle}>
                          {renderThumbsDowns(place.place_id)}
                        </TableCell>
                        <TableCell>{place.name}</TableCell>
                        <TableCell>{getCityNameFromPlace(place) || 'Not provided'}</TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table >
            </TableContainer >
            {renderDetailsPanel()}
          </div >
        )}
      </Box >
    </LoadScript >
  );
};

export default ReviewsPage;
