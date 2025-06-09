// PlaceDetailPanel.tsx
import React, { useState } from 'react';
import {
  Drawer,
  IconButton,
  Box,
  Typography,
  Button,
  Rating
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PlaceType, MrPlaceWithGooglePlace } from '../../types';
import { restaurantTypeLabelFromRestaurantType } from '../../utilities';
import { OpeningHours } from '../../components';

interface PlaceDetailPanelProps {
  open: boolean;
  place: MrPlaceWithGooglePlace;
  onClose: () => void;
  onDeletePlace: (_id: string) => void;
}

const PlaceDetailPanel: React.FC<PlaceDetailPanelProps> = ({
  open,
  place,
  onClose,
  onDeletePlace,
}) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, padding: 2 }}>
        {/* Header with a title and close button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{place.googlePlace!.name}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">{place.googlePlace!.formatted_address}</Typography>
          {place.googlePlace!.rating && (
            <>
              <Typography variant="body2" color="textSecondary">
                <Rating
                  value={place.googlePlace!.rating}
                  max={5}
                  readOnly
                />
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {place.googlePlace!.rating} ({place.googlePlace!.user_ratings_total} reviews)
              </Typography>
            </>
          )}
          {place.placeType === PlaceType.Restaurant && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">{restaurantTypeLabelFromRestaurantType(place.restaurantSpecs!.restaurantType!)}</Typography>
              {place.googlePlace!.opening_hours && <OpeningHours openingHours={place.googlePlace!.opening_hours!}></OpeningHours>}
              <Typography variant="body2">
                Breakfast: {place.restaurantSpecs!.openForBreakfast ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2">
                Lunch: {place.restaurantSpecs!.openForLunch ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2">
                Dinner: {place.restaurantSpecs!.openForDinner ? 'Yes' : 'No'}
              </Typography>
            </Box>
          )}
          {place.googlePlace!.website && (
            <Typography variant="body2">
              <a href={place.googlePlace!.website} target="_blank" rel="noopener noreferrer">
                {place.googlePlace!.website}
              </a>
            </Typography>
          )}
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="error" onClick={() => onDeletePlace(place._id!)}>Delete</Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default PlaceDetailPanel;
