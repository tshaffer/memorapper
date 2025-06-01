// pages/SearchPage.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux';
import { Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { fetchGooglePlaces } from '../redux';

const SearchPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { googlePlaces, loading, error } = useSelector((state: RootState) => state.memorapper);
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    await dispatch(fetchGooglePlaces());
  };

  return (
    <Box p={2}>
      <Box display="flex" gap={1} mb={2}>
        <TextField
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <List>
        {googlePlaces.map((place) => (
          <ListItem key={place.place_id} divider>
            <ListItemText
              primary={place.name}
              secondary={place.formatted_address}
            />
            <Button variant="outlined" size="small">Add to Wishlist</Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SearchPage;
