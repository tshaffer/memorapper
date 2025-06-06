import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';

export interface PlaceRatingInputProps {
  rating: number | null;
  onChange: (newRating: number | null) => void;
  legendLabels: string[];
  colorBands: string[];
  rangeBands: [number, number][];
}

const getBandIndex = (rating: number | null, rangeBands: [number, number][]): number | null => {
  if (rating === null) return null;
  for (let i = 0; i < rangeBands.length; i++) {
    const [min, max] = rangeBands[i];
    if (rating >= min && rating <= max) return i;
  }
  return null;
};

const PlaceRatingInput: React.FC<PlaceRatingInputProps> = ({
  rating,
  onChange,
  legendLabels,
  colorBands,
  rangeBands,
}) => {
  const [hover, setHover] = useState<number | null>(null);

  const displayRating: number | null =
    hover !== null ? Math.round(hover * 2) : rating;

  const bandIndex = getBandIndex(displayRating, rangeBands);
  const displayLabel = bandIndex !== null ? legendLabels[bandIndex] : 'Not Rated';
  const displayColor = bandIndex !== null ? colorBands[bandIndex] : 'grey';

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
          onChangeActive={(_, value) =>
            setHover(value !== null && value !== -1 ? value : null)
          }
          sx={{
            fontSize: '2rem',
            color: displayColor,
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
        {displayLabel}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        {rangeBands.map(([min, max], index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: colorBands[index] }}
          >
            {min}–{max}: {legendLabels[index]}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};

export default PlaceRatingInput;
