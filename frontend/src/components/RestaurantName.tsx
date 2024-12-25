import { useRef } from "react";
import { Box, TextField } from "@mui/material";
import { Autocomplete } from '@react-google-maps/api';
import { GooglePlace, ReviewData } from "../types";
import { pickGooglePlaceProperties } from "../utilities";

interface RestaurantNameProps {
  reviewData: ReviewData;
  setReviewData: React.Dispatch<React.SetStateAction<ReviewData>>;
  onSetGooglePlace: (googlePlace: GooglePlace) => any;
}

const RestaurantName: React.FC<RestaurantNameProps> = (props: RestaurantNameProps) => {

  const { reviewData, setReviewData } = props;
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleChange = (field: keyof ReviewData, value: any) => {
    setReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place: google.maps.places.PlaceResult = autocompleteRef.current.getPlace();
      try {
        const googlePlace: GooglePlace = pickGooglePlaceProperties(place);
        console.log('Place name: ', place.name);
        console.log('Place types:', place.types);
        console.log('Reviews:', place.reviews);

        props.onSetGooglePlace(googlePlace);
        handleChange('restaurantName', googlePlace.name);
      } catch (error) {
        console.error('Error parsing Google Place data: ', error);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  // console.log('RestaurantName reviewData:', reviewData);

  return (
    <Box>
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
      >
        <TextField
          fullWidth
          label="Restaurant Name"
          value={reviewData.restaurantName}
          onChange={(e) => handleChange('restaurantName', e.target.value)}
          placeholder="Enter the restaurant name"
          required
          style={{ marginBottom: 20 }}
          onKeyDown={handleKeyDown} // Intercept Enter key
        />
      </Autocomplete>
    </Box>
  );
};

export default RestaurantName;
