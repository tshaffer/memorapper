// PlaceDetailPanel.tsx
import React, { useEffect, useState } from 'react';
import {
  Drawer,
  IconButton,
  Box,
  Typography,
  Rating
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/TurnRight'; // or use a better-fitting icon
import CloseIcon from '@mui/icons-material/Close';
import { PlaceType, MrPlaceWithGooglePlace, GoogleGeometry, MrRestaurantReview, MrDeleteReviewRequestBody } from '../../types';
import { restaurantTypeLabelFromRestaurantType } from '../../utilities';
import { OpeningHours } from '../../components';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { deleteMrRestaurantReview } from '../../redux';
import { useDispatch } from 'react-redux';

interface PlaceDetailPanelProps {
  open: boolean;
  place: MrPlaceWithGooglePlace & { visited?: boolean }; // <- includes visited
  onClose: () => void;
}

const PlaceDetailPanel: React.FC<PlaceDetailPanelProps> = ({
  open,
  place,
  onClose,
}) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!place.googlePlace?.geometry) {
    return null; // or loading spinner
  }

  const placeLocation: GoogleGeometry = place.googlePlace!.geometry!;
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    if (place?.googlePlace?.geometry?.location) {
      setCurrentLocation(null); // optional: reset before setting new
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
    }
  }, [place]);


  const handleEditReview = (reviewId: string) => {
    console.log('handleEditReview called for reviewId:', reviewId);
    navigate(`/write-review/${place._id}/${reviewId}`);
  };

  const handleDeleteReview = async (review: MrRestaurantReview) => {

    const reviewId: string = review._id!;
    console.log('handleDeleteReview called for reviewId:', reviewId);

    if (!window.confirm("Are you sure you want to delete this review?")) return;

    if (!place._id) {
      console.error("Cannot delete review: place._id is missing");
      return;
    }

    dispatch(deleteMrRestaurantReview({ placeId: place._id!, reviewId }));

    const deleteReviewRequestBody: MrDeleteReviewRequestBody = {
      placeId: place._id,
      reviewId: review._id!,
    };

    try {
      const response = await fetch(`/api/deleteReview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteReviewRequestBody),
      });

      const data = await response.json();
      console.log('Review saved to backend:', data);
      navigate('/'); // or back to the place panel
    } catch (error) {
      console.error('Error saving review to backend:', error);
    }
  };

  const handleShowDirections = () => {
    if (placeLocation && currentLocation) {
      const destinationLocation: google.maps.LatLngLiteral = placeLocation.location;
      const destinationLatLng: google.maps.LatLngLiteral = { lat: destinationLocation.lat, lng: destinationLocation.lng };
      const subject = encodeURIComponent("Directions to " + place.googlePlace!.name);
      const body = encodeURIComponent(
        `Directions to ${place.googlePlace!.name}\n\n` +
        `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}` +
        `&destination=${destinationLatLng.lat},${destinationLatLng.lng}`
      ); const mailtoUrl = `mailto:shaffer.family@gmail.com?subject=${subject}&body=${body}`;
      window.open(mailtoUrl, '_blank');
    }
  };

  const renderRating = (value: number | null | undefined): JSX.Element => {
    return (
      <Rating
        value={!value ? 0 : value / 2}
        max={5}
        readOnly
        size="small"
        precision={0.5}
      />
    );
  };

  const renderVisitedPlaceRatingLine = (): JSX.Element | null => {

    const elements: JSX.Element[] = [];

    if (place.placeRating && place.placeRating > 0) {
      elements.push(
        <span key="rating-label">
          Memorapper Rating: {place.placeRating.toString()}{renderRating(place.placeRating)}
        </span>
      );
    }

    if (place.placeReview && place.placeReview.length > 0) {
      elements.push(<span key="review">{place.placeReview}</span>);
    }


    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {elements}
      </div>
    );
  }

  const renderUnvisitedPlaceRatingLine = (): JSX.Element | null => {

    const elements: JSX.Element[] = [];

    if (place.interestLevel && place.interestLevel > 0) {
      elements.push(
        <span key="preview-label">
          Interest level: {place.interestLevel.toString()}{renderRating(place.interestLevel)}
        </span>
      );
    }

    if (place.googlePlace?.rating) {
      elements.push(
        <span key="rating-label">
          Google rating: {(place.googlePlace.rating * 2).toString()}{renderRating((place.googlePlace.rating * 2))} ({place.googlePlace?.user_ratings_total})
        </span>
      );
    }

    if (place.placePreview && place.placePreview.length > 0) {
      elements.push(<span key="preview">{place.placePreview}</span>);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {elements}
      </div>
    );
  }

  const renderRatingLine = (): JSX.Element | null => {
    if (place.visited) {
      return renderVisitedPlaceRatingLine();
    } else {
      return renderUnvisitedPlaceRatingLine();
    }
  }

  const renderAddressLine = (): JSX.Element => {
    return (
      <Typography variant="body2" color="textSecondary">{place.googlePlace!.formatted_address}</Typography>
    );
  }

  const renderOpeningHours = (): JSX.Element | null => {
    if (place.placeType === PlaceType.Restaurant && place.googlePlace!.opening_hours) {
      return (
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
      )
    }
    return null;
  }

  const renderLinkToWebsite = (): JSX.Element | null => {
    if (place.googlePlace!.website) {
      return (
        <Typography variant="body2">
          <a href={place.googlePlace!.website} target="_blank" rel="noopener noreferrer">
            {place.googlePlace!.website}
          </a>
        </Typography>
      );
    }
    return null;
  }

  const renderDirectionsButton = (): JSX.Element | null => {
    return (
      <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            onClick={handleShowDirections}
            sx={{
              backgroundColor: '#00838F',
              color: '#fff',
              width: 40,
              height: 40,
              '&:hover': {
                backgroundColor: '#006064',
              }
            }}
          >
            <DirectionsIcon />
          </IconButton>
          <Typography variant="body2" sx={{ mt: 1, color: '#004D40' }}>
            Directions
          </Typography>
        </Box>
      </Box>
    );
  }

  const renderListOfReviews = (): JSX.Element | null => {

    if (!place.restaurantReviews || place.restaurantReviews.length === 0) return null;

    return (
      <>
        {place.restaurantReviews.map((review, reviewIndex) => (
          <Box key={reviewIndex} sx={{ mb: 2, pl: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">
                Date of Visit: {new Date(review.dateOfVisit).toLocaleDateString()}
              </Typography>
              <Box>
                <IconButton size="small" onClick={() => handleEditReview(review._id!)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteReview(review)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ ml: 2 }}>
              {review.itemReviews && review.itemReviews.length > 0 ? (
                review.itemReviews.map((item, itemIndex) => (
                  <Box key={itemIndex} sx={{ mb: 1 }}>
                    <Typography variant="body2"><strong>Item:</strong> {item.itemName}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2"><strong>Rating:</strong></Typography>
                      <Rating
                        value={item.rating === null ? 0 : item.rating / 2}
                        max={5}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                    </Box>
                    {item.comments && (
                      <Typography variant="body2"><strong>Comments:</strong> {item.comments}</Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">No items recorded.</Typography>
              )}
            </Box>
          </Box>
        ))}
      </>
    );
  }

  const renderReviewsSection = (): JSX.Element | null => {
    return (
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Reviews</Typography>
          <IconButton
            size="small"
            onClick={() => navigate(`/write-review/${place._id}`)}
            title="Add Review"
          >
            <AddIcon />
          </IconButton>
        </Box>
        {renderListOfReviews()}
      </Box>
    );
  };

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
          {renderRatingLine()}
          {renderAddressLine()}
          {renderOpeningHours()}
          {renderLinkToWebsite()}
          {renderDirectionsButton()}
          {renderReviewsSection()}
        </Box>
      </Box>
    </Drawer>
  );
};

export default PlaceDetailPanel;
