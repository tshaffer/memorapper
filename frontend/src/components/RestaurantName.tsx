import { useRef } from "react";

import { Box, TextField } from "@mui/material";

import { Autocomplete, LoadScript } from '@react-google-maps/api';
import { GooglePlace, ReviewData } from "../types";
import { libraries, pickGooglePlaceProperties } from "../utilities";

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
      const googlePlace: GooglePlace = pickGooglePlaceProperties(place);
      props.onSetGooglePlace(googlePlace);
      handleChange('restaurantName', googlePlace.name);
    }
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY!} libraries={libraries}>
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
        />
      </Autocomplete>
    </Box>
    </LoadScript >

  );
};

export default RestaurantName;