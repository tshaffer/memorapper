import { useState } from 'react';
import '../../styles/multiPanelStyles.css';
import { Box, Button, MenuItem, Rating, Select, Slider, TextField, useMediaQuery } from "@mui/material";
import { RestaurantType, DesiredRestaurant, GooglePlace, EditableDesiredRestaurant, SubmitDesiredRestaurantRequestBody } from "../../types";
import RestaurantName from '../../components/RestaurantName';
import PulsingDots from '../../components/PulsingDots';
import { useLocation, useParams } from 'react-router-dom';

const DesiredRestaurantForm = () => {

  const { _id } = useParams<{ _id: string }>();
  const location = useLocation();
  const editableDesiredRestaurant = location.state as EditableDesiredRestaurant | null;

  let googlePlace: GooglePlace | undefined = undefined;
  let restaurantName = '';
  let comments = '';
  let interestLevel = 0;
  if (editableDesiredRestaurant) {
    googlePlace = editableDesiredRestaurant.googlePlace;
    restaurantName = editableDesiredRestaurant.restaurantName;
    interestLevel = editableDesiredRestaurant.interestLevel;
    comments = editableDesiredRestaurant.comments;
  }

  const initialDesiredRestaurantData: DesiredRestaurant = {
    _id,
    googlePlace,
    restaurantName,
    comments,
    interestLevel: editableDesiredRestaurant ? editableDesiredRestaurant.interestLevel : 3,
  };

  const [desiredRestaurantData, setDesiredRestaurantData] = useState<DesiredRestaurant>(initialDesiredRestaurantData);

  const isMobile = useMediaQuery('(max-width:768px)');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof DesiredRestaurant, value: any) => {
    setDesiredRestaurantData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRestaurantTypeChange = (value: RestaurantType) => {
    setDesiredRestaurantData((prev) => ({ ...prev, googlePlace: { ...prev.googlePlace!, restaurantType: value } }));
  }

  const handleAddPlace = async (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {

    console.log('handleAddPlace');
    console.log('desiredRestaurantData:', desiredRestaurantData);

    const desiredRestaurantRequestBody: SubmitDesiredRestaurantRequestBody = {
      _id: desiredRestaurantData._id,
      googlePlace: desiredRestaurantData.googlePlace!,
      comments: desiredRestaurantData.comments,
      interestLevel: desiredRestaurantData.interestLevel || 0,
    };

    setIsLoading(true);

    try {
      const response = await fetch('/api/submitDesiredRestaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...desiredRestaurantRequestBody,
        }),
      });
      const data = await response.json();
      console.log('Unvisited Place submitted:', data);
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
          restaurantName={desiredRestaurantData!.restaurantName}
          onSetRestaurantName={(name) => handleChange('restaurantName', name)}
          onSetGooglePlace={(googlePlace) => handleChange('googlePlace', googlePlace)}
        />
      </>
    );
  }

  const renderRestaurantType = (): JSX.Element => {
    const value = desiredRestaurantData ? (desiredRestaurantData.googlePlace ? desiredRestaurantData.googlePlace!.restaurantType : 0) : 0;
    return (
      <>
        <label>Restaurant Type (Required):</label>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          onChange={(event) => handleRestaurantTypeChange(event.target.value as RestaurantType)}
        >
          <MenuItem value={RestaurantType.Restaurant}>Restaurant</MenuItem>
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
        <label >Rating</label>
        <Rating
          value={desiredRestaurantData.interestLevel || 5}
          max={5}
          onChange={(_, value) => handleChange('interestLevel', value as number)}
        />
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
          value={desiredRestaurantData.comments}
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
        disabled={!desiredRestaurantData.googlePlace || !desiredRestaurantData.googlePlace.googlePlaceId}
        onClick={handleAddPlace}
      >
        Add Place
      </Button>

      {renderPulsingDots()}

    </div>
  );
};

export default DesiredRestaurantForm;
