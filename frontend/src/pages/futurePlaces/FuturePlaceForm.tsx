import { useState } from 'react';
import '../../styles/multiPanelStyles.css';
import { Box, Button, MenuItem, Select, Slider, TextField, useMediaQuery } from "@mui/material";
import { RestaurantType, FuturePlaceData, GooglePlace, EditableFuturePlace, FuturePlaceRequestBody } from "../../types";
import RestaurantName from '../../components/RestaurantName';
import PulsingDots from '../../components/PulsingDots';
import { useLocation, useParams } from 'react-router-dom';

const FuturePlaceForm = () => {

  const { _id } = useParams<{ _id: string }>();
  const location = useLocation();
  const editableFuturePlace = location.state as EditableFuturePlace | null;

  let place: GooglePlace | null = null;
  let comments = '';
  if (editableFuturePlace) {
    place = editableFuturePlace.place;
    comments = editableFuturePlace.comments;
  }

  const initialFuturePlaceData: FuturePlaceData = {
    _id: _id ? _id : '',
    place,
    comments,
    rating: editableFuturePlace ? editableFuturePlace.rating : null,
    restaurantName: place ? place.name : '',
  };

  const [futurePlaceData, setFuturePlaceData] = useState<FuturePlaceData>(initialFuturePlaceData);

  const isMobile = useMediaQuery('(max-width:768px)');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof FuturePlaceData, value: any) => {
    setFuturePlaceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRestaurantTypeChange = (value: RestaurantType) => {
    setFuturePlaceData((prev) => ({ ...prev, place: { ...prev.place!, restaurantType: value } }));
  }

  const handleAddPlace = async (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
    
    console.log('handleAddPlace');
    console.log('futurePlaceData:', futurePlaceData);

    const futurePlaceRequestBody: FuturePlaceRequestBody = {
      _id: futurePlaceData._id,
      place: futurePlaceData.place!,
      comments: futurePlaceData.comments,
      rating: futurePlaceData.rating || 0,
    };

    setIsLoading(true);

    try {
      const response = await fetch('/api/submitFuturePlace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...futurePlaceRequestBody,
        }),
      });
      const data = await response.json();
      console.log('Future Place submitted:', data);
      setIsLoading(false);
      // resetReviewData();
    } catch (error) {
      console.error('Error submitting review:', error);
      setIsLoading(false);
    }

  };


  const renderRestaurantName = (): JSX.Element => {
    return (
      <>
        <label htmlFor="restaurant-name">Restaurant Name (Required):</label>
        <RestaurantName
          restaurantName={futurePlaceData!.restaurantName}
          onSetRestaurantName={(name) => handleChange('restaurantName', name)}
          onSetGooglePlace={(place) => handleChange('place', place)}
        />
      </>
    );
  }

  const renderRestaurantType = (): JSX.Element => {
    const value = futurePlaceData ? (futurePlaceData.place ? futurePlaceData.place!.restaurantType.toString() : 0) : 0;
    return (
      <>
        <label>Restaurant Type (Required):</label>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          onChange={(event) => handleRestaurantTypeChange(event.target.value as RestaurantType)}
        >
          <MenuItem value={RestaurantType.Generic}>Restaurant</MenuItem>
          <MenuItem value={RestaurantType.CoffeeShop}>Coffee Shop</MenuItem>
          <MenuItem value={RestaurantType.Bar}>Bar</MenuItem>
          <MenuItem value={RestaurantType.Bakery}>Bakery</MenuItem>
          <MenuItem value={RestaurantType.Taqueria}>Taqueria</MenuItem>
          <MenuItem value={RestaurantType.PizzaPlace}>Pizza</MenuItem>
          <MenuItem value={RestaurantType.ItalianRestaurant}>Italian</MenuItem>
          <MenuItem value={RestaurantType.DessertShop}>Dessert</MenuItem>
        </Select>
      </>
    );
  }

  const renderRating = (): JSX.Element => {
    return (
      <>
        <label>Rating</label>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "fit-content(300px) 200px", // First column auto-sizes up to a maximum of 300px
            gridAutoRows: "auto", // Each row's height adjusts to its content
            gap: 2, // Optional: spacing between items
          }}
        >
          {/* Primary Rating */}
          <Box
            sx={{
              border: "1px solid",
              padding: 1,
              display: "flex", // Use flexbox
              justifyContent: "center", // Horizontally center the content
            }}
          >
            <Slider
              sx={{ width: '150px' }}
              defaultValue={5}
              value={futurePlaceData.rating || 5}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={10}
              onChange={(_, value) => handleChange('rating', value as number)}
            />
          </Box>
        </Box>
      </>
    );
  }

  const renderComments = (): JSX.Element => {
    return (
      <>
        <label>Comments:</label>
        <TextField
          label="Comments"
          fullWidth
          multiline
          rows={4}
          value={futurePlaceData.comments}
          onChange={(e) => handleChange('comments', e.target.value)}
        />
      </>
    );
  }


  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) {
      return null;
    }
    return (<PulsingDots />);
  };

  return (
    <div
      id="form"
      className="tab-panel active"
      style={{
        maxHeight: isMobile ? 'calc(60vh)' : 'auto',
        padding: '1rem',
      }}
    >
      <form id='add-review-form'>
        {renderRestaurantName()}
        {renderRestaurantType()}
        {renderRating()}
        {renderComments()}
      </form>

      <Button
        disabled={!futurePlaceData.place || !futurePlaceData.place.place_id}
        onClick={handleAddPlace}
      >
        Add Place
      </Button>

      {renderPulsingDots()}

    </div>
  );
};

export default FuturePlaceForm;
