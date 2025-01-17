import { useState } from 'react';
import '../../styles/multiPanelStyles.css';
import { Button, MenuItem, Rating, Select, TextField, useMediaQuery } from "@mui/material";
import { RestaurantType, NewRestaurant, GooglePlace, EditableNewRestaurant, SubmitNewRestaurantRequestBody } from "../../types";
import RestaurantName from '../../components/RestaurantName';
import PulsingDots from '../../components/PulsingDots';
import { useLocation, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useUserContext } from '../../contexts/UserContext';

const NewRestaurantForm = () => {

  const { _id } = useParams<{ _id: string }>();
  console.log('NewRestaurantForm _id:', _id);

  const { currentDiningGroup } = useUserContext();

  const location = useLocation();
  const editableNewRestaurant = location.state as EditableNewRestaurant | null;

  let googlePlace: GooglePlace | undefined = undefined;
  let restaurantName = '';
  let comments = '';
  let interestLevel = 0;
  if (editableNewRestaurant) {
    googlePlace = editableNewRestaurant.googlePlace;
    restaurantName = editableNewRestaurant.googlePlace!.name;
    interestLevel = editableNewRestaurant.interestLevel;
    comments = editableNewRestaurant.comments;
  }

  const initialNewRestaurantData: NewRestaurant = {
    _id,
    newRestaurantId: uuidv4(),
    googlePlace,
    diningGroupId: currentDiningGroup ? currentDiningGroup.diningGroupId : '',
    restaurantName,
    comments,
    interestLevel: editableNewRestaurant ? editableNewRestaurant.interestLevel : 3,
  };

  const [newRestaurantData, setNewRestaurantData] = useState<NewRestaurant>(initialNewRestaurantData);

  const isMobile = useMediaQuery('(max-width:768px)');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof NewRestaurant, value: any) => {
    setNewRestaurantData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRestaurantTypeChange = (value: RestaurantType) => {
    setNewRestaurantData((prev) => ({ ...prev, googlePlace: { ...prev.googlePlace!, restaurantType: value } }));
  }

  const handleAddPlace = async (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {

    console.log('handleAddPlace');
    console.log('newRestaurantData:', newRestaurantData);

    const newRestaurantRequestBody: SubmitNewRestaurantRequestBody = {
      _id: newRestaurantData._id,
      googlePlace: newRestaurantData.googlePlace!,
      newRestaurantId: newRestaurantData.newRestaurantId,
      diningGroupId: currentDiningGroup ? currentDiningGroup.diningGroupId : '',
      comments: newRestaurantData.comments,
      interestLevel: newRestaurantData.interestLevel || 0,
    };

    setIsLoading(true);

    try {
      const response = await fetch('/api/submitNewRestaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRestaurantRequestBody,
        }),
      });
      const data = await response.json();
      console.log('New Place submitted:', data);
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
          restaurantName={newRestaurantData!.restaurantName}
          onSetRestaurantName={(name) => handleChange('restaurantName', name)}
          onSetGooglePlace={(googlePlace) => handleChange('googlePlace', googlePlace)}
        />
      </>
    );
  }

  const renderRestaurantType = (): JSX.Element => {
    const value = newRestaurantData ? (newRestaurantData.googlePlace ? newRestaurantData.googlePlace!.restaurantType : 0) : 0;
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
          value={newRestaurantData.interestLevel || 5}
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
          value={newRestaurantData.comments}
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
        disabled={!newRestaurantData.googlePlace || !newRestaurantData.googlePlace.googlePlaceId}
        onClick={handleAddPlace}
      >
        Add Place
      </Button>

      {renderPulsingDots()}

    </div>
  );
};

export default NewRestaurantForm;
