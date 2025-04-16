// PlaceDetailPanel.tsx
import React, { useState } from 'react';
import {
  Drawer,
  IconButton,
  Box,
  Typography,
  Button} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Place, PlaceType, RestaurantReview } from '../../types';
import PlaceEditor from '../../components/PlaceEditor';

interface PlaceDetailPanelProps {
  open: boolean;
  place: Place;
  onClose: () => void;
  onUpdatePlace: (place: Place) => Promise<any>;
  onDeletePlace: (placeId: string) => void;
  onAddReview: (placeId: string, review: RestaurantReview) => void;
  onEditReview: (placeId: string, review: RestaurantReview) => void;
  onDeleteReview: (placeId: string, reviewId: string) => void;
}

const PlaceDetailPanel: React.FC<PlaceDetailPanelProps> = ({
  open,
  place,
  onClose,
  onUpdatePlace,
  onDeletePlace,
  onAddReview,
  onEditReview,
  onDeleteReview
}) => {
  // Local state for editing the place details.
  const [isEditing, setIsEditing] = useState(false);
  const [editPlace, setEditPlace] = useState<Place>({ ...place });

  React.useEffect(() => {
    setEditPlace({ ...place });
  }, [place]);
  
  // Local state for a new review (only used if the place is a restaurant)
  const [newReview, setNewReview] = useState<RestaurantReview>({
    _idRestaurantReview: '',
    user: { name: 'Ted' }, // You may want to fill this in from the logged in user context
    restaurantReviewComments: '',
    rating: 0,
    date: new Date(),
    itemsOrdered: []
  });

  // Update editPlace state when editing fields.
  const handleEditChange = (field: keyof Place, value: any) => {
    setEditPlace(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePlace = async (place: Place) => {
    onUpdatePlace(place);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditPlace({ ...place });
    setIsEditing(false);
  };

  const handleAddReviewSubmit = () => {
    onAddReview(place._idPlace!, newReview);
    // Reset the new review state
    setNewReview({ _idRestaurantReview: '', user: { name: 'Ted' }, restaurantReviewComments: '', rating: 0, date: new Date(), itemsOrdered: [] });
  };

  const handleDeleteReview = (reviewId: string) => {
    onDeleteReview(place._idPlace!, reviewId);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, padding: 2 }}>
        {/* Header with a title and close button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Place Details</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Display either an editing form or read-only details */}
        {isEditing ? (
          <Box>
            <PlaceEditor
              mode={'edit'}
              initialPlace={editPlace}
              onSubmit={(place: Place) => handleSavePlace(place)}
              onCancel={handleCancelEdit}
            >
            </PlaceEditor>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1">{place.name}</Typography>
            <Typography variant="body2" color="textSecondary">{place.formatted_address}</Typography>
            {place.placeType === PlaceType.Restaurant && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Restaurant Details</Typography>
                <Typography variant="body2">Type: {place.restaurantType}</Typography>
                <Typography variant="body2">
                  Breakfast: {place.openForBreakfast ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                  Lunch: {place.openForLunch ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                  Dinner: {place.openForDinner ? 'Yes' : 'No'}
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={() => setIsEditing(true)}>Edit</Button>
              <Button variant="outlined" color="error" onClick={() => onDeletePlace(place._idPlace!)}>Delete</Button>
            </Box>
          </Box>
        )}

        {/* Review management: only shown for restaurants */}
        {/* {place.placeType === PlaceType.Restaurant && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Reviews</Typography>
            {place.restaurantReviews && place.restaurantReviews.length > 0 ? (
              <List>
                {place.restaurantReviews.map(review => (
                  <ListItem key={review._idRestaurantReview}>
                    <ListItemText
                      primary={`Rating: ${review.rating}`}
                      secondary={review.restaurantReviewComments}
                    />
                    <IconButton onClick={() => onEditReview(place._idPlace!, review)}>
                      <Typography variant="caption">Edit</Typography>
                    </IconButton>
                    <IconButton onClick={() => handleDeleteReview(review._idRestaurantReview!)}>
                      <Typography variant="caption" color="error">Del</Typography>
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2">No reviews yet.</Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Add a Review</Typography>
              <TextField
                label="Rating"
                type="number"
                value={newReview.rating}
                onChange={(e) =>
                  setNewReview(prev => ({ ...prev, rating: Number(e.target.value) }))
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Comments"
                multiline
                rows={3}
                value={newReview.restaurantReviewComments}
                onChange={(e) =>
                  setNewReview(prev => ({ ...prev, comments: e.target.value }))
                }
                fullWidth
                margin="normal"
              />
              <Button variant="contained" onClick={handleAddReviewSubmit}>Submit Review</Button>
            </Box>
          </Box>
        )} */}
      </Box>
    </Drawer>
  );
};

export default PlaceDetailPanel;
