import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';

interface PlaceStarRatingInputProps {
  rating: number | null;
  onChange: (newRating: number | null) => void;
}

const getRatingLabel = (rating: number | null): string => {
  if (rating === null) return 'Not Rated';
  if (rating >= 1 && rating <= 3) return 'Won’t return';
  if (rating >= 4 && rating <= 7) return 'Would try again';
  if (rating >= 8 && rating <= 10) return 'Would return';
  return '';
};

const getRatingColor = (rating: number | null): string => {
  if (rating === null) return 'grey';
  if (rating <= 3) return '#f44336';
  if (rating <= 7) return '#fdd835'; // bright yellow
  return '#4caf50';
};

const PlaceStarRatingInput: React.FC<PlaceStarRatingInputProps> = ({ rating, onChange }) => {

  const [hover, setHover] = useState<number | null>(null);

  console.log('hover', hover);
  console.log('rating', rating);
  const displayRating: number | null =
    hover !== null ? Math.round(hover * 2) : rating;
  console.log('displayRating', displayRating);

  const handleStarChange = (_: any, value: number | null) => {
    if (value !== null) {
      onChange(Math.round(value * 2));
    }
  };

  const handleCheckboxChange = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onChange(checked ? null : 5);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Rating
          name="place-rating"
          precision={0.5}
          value={rating === null ? 0 : rating / 2}
          onChange={handleStarChange}
          onChangeActive={(_, value) => setHover(value !== null && value !== -1 ? value : null)}
          sx={{
            fontSize: '2rem',
            color: getRatingColor(displayRating),
            opacity: rating === null ? 0.6 : 1.0,
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={rating === null}
              onChange={handleCheckboxChange}
            />
          }
          label="Not Rated"
        />
      </Stack>

      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        {displayRating !== null ? `${displayRating} – ` : ''}
        {getRatingLabel(displayRating)}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Typography variant="body2" color="error.main">1–3: Won’t return</Typography>
        <Typography variant="body2" sx={{ color: '#fdd835' }}>4–7: Would try again</Typography>
        <Typography variant="body2" color="success.main">8–10: Would return</Typography>
      </Stack>
    </Box>
  );
};

export default PlaceStarRatingInput;
