import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Typography,
  Grid,
  Rating,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
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

  const renderOpeningHours = (): JSX.Element => {
    if (!newRestaurant.googlePlace!.opening_hours || !newRestaurant.googlePlace!.opening_hours.weekday_text) {
      return (
        <Typography variant="body2" color="textSecondary">
          Opening hours not available
        </Typography>
      );
    }
  
    return (
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6" sx={{ marginBottom: 1 }}>
          Opening Hours
        </Typography>
        <List
          sx={{
            padding: 0,
            '& .MuiListItem-root': {
              padding: 0,
              marginBottom: 0.5, // Minimal spacing between lines
            },
          }}
        >
          {newRestaurant.googlePlace!.opening_hours.weekday_text.map((day, index) => (
            <ListItem key={index} sx={{ padding: 0 }}>
              <ListItemText
                primary={day}
                sx={{
                  marginBottom: 0, // Ensure no extra margin
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };
  
  const renderAddress = (): JSX.Element => {
    return (
      <Typography>{newRestaurant.googlePlace!.vicinity}</Typography>
    );
  }

  const renderWebPage = (): JSX.Element => {
    return (
      <Typography>
        <a href={newRestaurant.googlePlace!.website} target="_blank" rel="noreferrer">
          {newRestaurant.googlePlace!.website}
        </a>
      </Typography>
    )
  }

  return (
    <Grid container spacing={2} sx={{ padding: 2, height: '100vh', overflowY: 'auto' }}>
      <Grid item xs={12} md={4} sx={{ borderRight: { md: '1px solid #ddd' }, paddingRight: 2 }}>
        {renderRestaurantName()}
        {renderRestaurantType()}
        {renderAddress()}
        {renderWebPage()}
        {renderInterestLevel()}
        {renderComments()}
        {renderOpeningHours()}
      </Grid>
    </Grid>
  );
};

export default NewRestaurantDetails;
