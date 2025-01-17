import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Typography,
  Grid,
  Rating,
  TextField,
} from '@mui/material';

import { NewRestaurant } from '../../types';
import { restaurantTypeLabelFromRestaurantType } from '../../utilities';

const NewRestaurantDetails: React.FC = () => {

  const location = useLocation();

  const newRestaurant: NewRestaurant = location.state as NewRestaurant;

  const renderRestaurantName = () => {
    return (
        <Typography variant="h6">{newRestaurant.googlePlace!.name}</Typography>
    );
  };

  const renderRestaurantType = () => {
    return (
      <Typography><strong>Restaurant Type:</strong> {restaurantTypeLabelFromRestaurantType(newRestaurant.googlePlace!.restaurantType)}</Typography>
    );
  }

  const renderInterestLevel = (): JSX.Element => {
    return (
      <>
        <label>Rating</label>
        <Rating
          value={newRestaurant.interestLevel}
          max={5}
          readOnly
        />
      </>
    );
  }

  const renderComments = (): JSX.Element => {
    return (
      <Typography>
        <label>Comments:</label>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={newRestaurant.comments}
          inputProps={{ readOnly: true }}
        />
      </Typography>
    );
  }

  return (
    <Grid container spacing={2} sx={{ padding: 2, height: '100vh', overflowY: 'auto' }}>
      <Grid item xs={12} md={4} sx={{ borderRight: { md: '1px solid #ddd' }, paddingRight: 2 }}>
        {renderRestaurantName()}
        {renderRestaurantType()}
        {renderInterestLevel()}
        {renderComments()}
      </Grid>
    </Grid>
  );
};

export default NewRestaurantDetails;
