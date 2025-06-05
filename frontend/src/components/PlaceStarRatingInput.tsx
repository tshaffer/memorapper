import React from 'react';
import {
  Box,
  Typography,
  Rating,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';

interface PlaceStarRatingInputProps {
  rating: number | null; // 1–10 or null for not rated
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
  if (rating <= 3) return '#f44336'; // red
  if (rating <= 7) return '#ff9800'; // orange
  return '#4caf50'; // green
};

const PlaceStarRatingInput: React.FC<PlaceStarRatingInputProps> = ({ rating, onChange }) => {
  const handleStarChange = (_: any, value: number | null) => {
    onChange(value ? Math.round(value * 2) : null); // convert 0.5–5 → 1–10
  };

  const handleCheckboxChange = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onChange(checked ? null : 5); // clear or reset to midpoint
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Overall Rating
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={rating === null}
            onChange={handleCheckboxChange}
          />
        }
        label="Not Rated"
      />

      <Rating
        name="place-rating"
        precision={0.5}
        value={rating === null ? 0 : rating / 2}
        onChange={handleStarChange}
        readOnly={rating === null}
        sx={{
          fontSize: '2rem',
          color: getRatingColor(rating),
        }}
      />

      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        {getRatingLabel(rating)}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Typography variant="body2" color="error.main">1–3: Won’t return</Typography>
        <Typography variant="body2" color="warning.main">4–7: Would try again</Typography>
        <Typography variant="body2" color="success.main">8–10: Would return</Typography>
      </Stack>
    </Box>
  );
};

export default PlaceStarRatingInput;
