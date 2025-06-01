// pages/ReviewPage.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux';
import { Box, Typography, Card, CardContent, Divider } from '@mui/material';

const ReviewPage: React.FC = () => {
  const { places } = useSelector((state: RootState) => state.memorapper);

  return (
    <Box p={2} sx={{ overflowY: 'auto', height: '100%' }}>
      <Typography variant="h5" gutterBottom>Reviews</Typography>
      {places.flatMap((place) =>
        (place.reviews || []).map((review) => (
          <Card key={`${place.googlePlaceId}-${review.dateOfVisit}`} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{place.googlePlaceId}</Typography>
              <Typography variant="caption">Visited: {review.dateOfVisit}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">{review.reviewText}</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default ReviewPage;
