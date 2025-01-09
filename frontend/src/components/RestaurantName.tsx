import { useRef } from "react";
import { Box, TextField } from "@mui/material";
import { Autocomplete } from '@react-google-maps/api';
import { GooglePlace } from "../types";
import { pickGooglePlaceProperties } from "../utilities";

interface RestaurantNameProps {
  restaurantName: string;
  onSetRestaurantName: (restaurantName: string) => any;
  onSetGooglePlace: (googlePlace: GooglePlace) => any;
}

const RestaurantName: React.FC<RestaurantNameProps> = (props: RestaurantNameProps) => {

  const { restaurantName, onSetRestaurantName } = props;
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place: google.maps.places.PlaceResult = autocompleteRef.current.getPlace();
      try {
        const googlePlace: GooglePlace = pickGooglePlaceProperties(place);
        props.onSetGooglePlace(googlePlace);
        onSetRestaurantName(googlePlace.name);
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

  return (
    <Box>
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
      >
        <TextField
          fullWidth
          value={restaurantName}
          onChange={(e) => onSetRestaurantName(e.target.value)}
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
