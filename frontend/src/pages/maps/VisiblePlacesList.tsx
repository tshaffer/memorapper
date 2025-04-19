import React, { } from 'react';
import { useMediaQuery, List, ListItemButton } from '@mui/material';
import { Place, PlaceWithGooglePlace } from '../../types';

export interface VisiblePlacesListProps {
  visiblePlaces: PlaceWithGooglePlace[];
  onPlaceSelect: (place: PlaceWithGooglePlace) => void;
}

const VisiblePlacesList: React.FC<VisiblePlacesListProps> = (props: VisiblePlacesListProps) => {

  const isMobile = useMediaQuery('(max-width:768px)');

  // List container style:
  // - When on mobile, take full width.
  // - When on desktop, use 30% width.
  // - Add a right border (or bottom border on mobile) for separation.
  const listContainerStyle: React.CSSProperties = {
    width: isMobile ? '100%' : '15%',
    overflowY: 'auto',
    borderRight: isMobile ? 'none' : '1px solid #ccc',
    borderBottom: isMobile ? '1px solid #ccc' : 'none',
  };
  
  return (
    <div style={listContainerStyle}>
      <List>
        {props.visiblePlaces.map((place: PlaceWithGooglePlace, index) => (
          <ListItemButton key={index}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4
                style={{
                  margin: '0',
                  color: 'blue', // Typical link color
                  textDecoration: 'underline', // Typical link underline
                  cursor: 'pointer', // Indicate it's clickable
                  fontWeight: 'bold', // Make the link more prominent
                }}
                onClick={() => props.onPlaceSelect(place)}
              >
                {place.googlePlace!.name}
              </h4>
            </div>
          </ListItemButton>
        ))}
      </List>
    </div>
  );
}

export default VisiblePlacesList;