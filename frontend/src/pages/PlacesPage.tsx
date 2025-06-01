// pages/PlacesPage.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux';
import { Box, Typography, Card, CardContent, Divider, Chip } from '@mui/material';

const PlacesPage: React.FC = () => {
  const { places } = useSelector((state: RootState) => state.memorapper);

  const wishlist = places.filter((place) => !place.rating || place.rating === 0);
  const visited = places.filter((place) => place.rating && place.rating > 0);

  return (
    <Box p={2} sx={{ overflowY: 'auto', height: '100%' }}>
      <Typography variant="h5" gutterBottom>Wishlist</Typography>
      {wishlist.length === 0 && <Typography>No places in your wishlist.</Typography>}
      {wishlist.map((place) => (
        <Card key={place.googlePlaceId} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{place.googlePlaceId}</Typography>
            <Typography variant="body2">{place.placeComments}</Typography>
            <Chip label={place.placeType} sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      ))}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" gutterBottom>Visited</Typography>
      {visited.length === 0 && <Typography>No visited places yet.</Typography>}
      {visited.map((place) => (
        <Card key={place.googlePlaceId} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{place.googlePlaceId}</Typography>
            <Typography variant="body2">{place.placeComments}</Typography>
            <Chip label={place.placeType} sx={{ mt: 1 }} />
            <Typography variant="caption">Rating: {place.rating}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default PlacesPage;
