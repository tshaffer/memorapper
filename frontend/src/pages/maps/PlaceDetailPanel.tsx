// PlaceDetailPanel.tsx
import React, { useEffect, useState } from 'react';
import {
  Drawer,
  IconButton,
  Box,
  Typography,
  Button,
  Rating
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/TurnRight'; // or use a better-fitting icon
import CloseIcon from '@mui/icons-material/Close';
import { PlaceType, MrPlaceWithGooglePlace, GoogleGeometry } from '../../types';
import { restaurantTypeLabelFromRestaurantType } from '../../utilities';
import { OpeningHours } from '../../components';
import { render } from 'react-dom';

interface PlaceDetailPanelProps {
  open: boolean;
  place: MrPlaceWithGooglePlace & { visited?: boolean }; // <- includes visited
  onClose: () => void;
  onDeletePlace: (_id: string) => void;
}

const PlaceDetailPanel: React.FC<PlaceDetailPanelProps> = ({
  open,
  place,
  onClose,
  onDeletePlace,
}) => {

  const placeLocation: GoogleGeometry = place.googlePlace!.geometry!;
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);

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

    console.log('getVisitedPlaceHoverElement called for place:', place.googlePlace?.name);

    const elements: JSX.Element[] = [];

    if (place.placeRating && place.placeRating > 0) {
      elements.push(
        <span key="rating-label">
          Rating: {renderRating(place.placeRating)}
        </span>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {elements}
      </div>
    );
  }

  const renderUnvisitedPlaceRatingLine = (): JSX.Element | null => {

    console.log('renderUnvisitedPlaceRatingLine called for place:', place.googlePlace?.name);

    const elements: JSX.Element[] = [];

    if (place.interestLevel && place.interestLevel > 0) {
      elements.push(
        <span key="preview-label">
          Interest level: {renderRating(place.interestLevel)}
        </span>
      );
    }

    if (place.placePreview && place.placePreview.length > 0) {
      elements.push(<span key="preview">{place.placePreview}</span>);
    }

    if (elements.length === 0 && place.googlePlace?.rating) {
      elements.push(
        <span key="rating-label">
          Google rating: {place.googlePlace.rating.toString()}{renderRating(place.googlePlace.rating)} ({place.googlePlace?.user_ratings_total})
        </span>
      );
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
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="error" onClick={() => onDeletePlace(place._id!)}>Delete</Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default PlaceDetailPanel;
