import { useRef, useState } from "react";

import { Box, TextField } from "@mui/material";

import { Autocomplete } from '@react-google-maps/api';
import { GooglePlace } from "../types";
import { pickGooglePlaceProperties } from "../utilities";

const RestaurantName = () => {

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [googlePlace, setGooglePlace] = useState<GooglePlace | null>(null);
  const [restaurantLabel, setRestaurantLabel] = useState('');

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place: google.maps.places.PlaceResult = autocompleteRef.current.getPlace();
      const googlePlace: GooglePlace = pickGooglePlaceProperties(place);
      setGooglePlace(googlePlace);
      const restaurantLabel = googlePlace.name;
      setRestaurantLabel(restaurantLabel);
    }
  };

  return (
    <Box>
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
      >
        <TextField
          fullWidth
          label="Restaurant Name"
          value={restaurantLabel}
          onChange={(e) => setRestaurantLabel(e.target.value)}
          placeholder="Enter the restaurant name"
          required
          style={{ marginBottom: 20 }}
        />
      </Autocomplete>
    </Box>

  );
};

export default RestaurantName;