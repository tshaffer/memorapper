import React, { useMemo, useState } from 'react';
import {
  useMediaQuery,
  List,
  ListItemButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
} from '@mui/material';
import { MrPlaceWithGooglePlace } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux';
import { haversineDistance } from '../../utilities';

export interface VisiblePlacesListProps {
  visiblePlaces: (MrPlaceWithGooglePlace & { visited?: boolean })[];
  onPlaceSelect: (place: MrPlaceWithGooglePlace) => void;
}

type SortOption = 'name' | 'distance' | 'rating' | 'visitedFirst' | 'unvisitedFirst';

const VisiblePlacesList: React.FC<VisiblePlacesListProps> = ({
  visiblePlaces,
  onPlaceSelect,
}) => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const [sortOption, setSortOption] = useState<SortOption>('name');

  const listContainerStyle: React.CSSProperties = {
    width: isMobile ? '100%' : '15%',
    overflowY: 'auto',
    borderRight: isMobile ? 'none' : '1px solid #ccc',
    borderBottom: isMobile ? '1px solid #ccc' : 'none',
    padding: '8px',
  };

  const { currentMapLocation } = useSelector((state: RootState) => state.memorapper);

  const getRating = (place: MrPlaceWithGooglePlace) => {
    if (place.placeRating) {
      return place.placeRating;
    } else if (place.interestLevel) {
      return place.interestLevel;
    } else if (place.googlePlace?.rating) {
      return place.googlePlace.rating;
    } else {
      return 0; // Default rating if none available
    }     
  }

  const sortedPlaces = useMemo(() => {
    const places = [...visiblePlaces];
    switch (sortOption) {
      case 'name':  // alphabetical order
        return places.sort((a, b) =>
          a.googlePlace!.name!.localeCompare(b.googlePlace!.name!)
        );
      case 'rating':  // high to low
        const sortedByRating = places.sort((a, b) => {
          return Number(getRating(b)) - Number(getRating(a));
        });
        return sortedByRating;
      case 'visitedFirst':
        const sortedByVisitedFirst = places.sort((a, b) => {
          return Number(b.visited) - Number(a.visited);
        });
        return sortedByVisitedFirst;
      case 'unvisitedFirst':
        const sortedByUnvisitedFirst = places.sort((a, b) => {
          return Number(a.visited) - Number(b.visited);
        });
        return sortedByUnvisitedFirst;
      case 'distance':
        const sortedByDistance = places.sort((a, b) => {
          const distanceFromA = haversineDistance(currentMapLocation!, a.googlePlace!.geometry!.location!);
          const distanceFromB = haversineDistance(currentMapLocation!, b.googlePlace!.geometry!.location!);
          if (distanceFromA < distanceFromB) return -1;
          if (distanceFromA > distanceFromB) return 1;
          return 0;
        });
        return sortedByDistance;
      default:
        return places;
    }
  }, [visiblePlaces, sortOption]);

  return (
    <div style={listContainerStyle}>
      <Box mb={1}>
        <FormControl fullWidth size="small">
          <InputLabel id="sort-label">Sort by</InputLabel>
          <Select
            labelId="sort-label"
            value={sortOption}
            label="Sort by"
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="distance">Distance</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="visitedFirst">Visited (visited first)</MenuItem>
            <MenuItem value="unvisitedFirst">Visited (unvisited first)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <List>
        {sortedPlaces.map((place, index) => (
          <ListItemButton key={index}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4
                style={{
                  margin: '0',
                  color: 'blue',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
                onClick={() => onPlaceSelect(place)}
              >
                {place.googlePlace!.name}
              </h4>
            </div>
          </ListItemButton>
        ))}
      </List>
    </div>
  );
};

export default VisiblePlacesList;
