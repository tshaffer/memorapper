import { useRef, useState } from "react";

import { Box, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, useMediaQuery } from "@mui/material";

import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { GooglePlace } from "../types";
import { pickGooglePlaceProperties } from "../utilities";

const RestaurantName = () => {

  const isMobile = useMediaQuery('(max-width:768px)');

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [googlePlace, setGooglePlace] = useState<GooglePlace | null>(null);
  const [restaurantLabel, setRestaurantLabel] = useState('');
  const [dateOfVisit, setDateOfVisit] = useState('');
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null); // New state
  const [reviewText, setReviewText] = useState('');

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place: google.maps.places.PlaceResult = autocompleteRef.current.getPlace();
      const googlePlace: GooglePlace = pickGooglePlaceProperties(place);
      setGooglePlace(googlePlace);
      const restaurantLabel = googlePlace.name;
      setRestaurantLabel(restaurantLabel);
    }
  };

  const handleWouldReturnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "yes" ? true : event.target.value === "no" ? false : null;
    setWouldReturn(value);
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
      <TextField
        fullWidth
        type="date"
        value={dateOfVisit}
        onChange={(e) => setDateOfVisit(e.target.value)}
        placeholder="mm/dd/yyyy"
        label="Date of Visit"
      />
      <FormControl component="fieldset" style={{ marginTop: 20, width: '100%' }}>
        <FormLabel component="legend">Would Return</FormLabel>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <RadioGroup
            row
            name="would-return"
            value={wouldReturn === true ? 'yes' : wouldReturn === false ? 'no' : ''}
            onChange={handleWouldReturnChange}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
          <Button onClick={() => setWouldReturn(null)} size="small">
            Clear
          </Button>
        </Box>
      </FormControl>
      <TextField
        style={{ marginTop: 20 }}
        fullWidth
        multiline
        rows={isMobile ? 5 : 8}
        label="Write Your Review"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Describe your dining experience in detail..."
        required
      />
    </Box>

  );
};

export default RestaurantName;