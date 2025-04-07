import React, { } from 'react';
import { useMediaQuery, List, ListItemButton } from '@mui/material';
import { ReviewedRestaurantWithPlace, NewRestaurant, Place } from '../../types';
import { restaurantTypeLabelFromRestaurantType } from '../../utilities';

export interface VisiblePlacesListProps {
  visibleRestaurants: ReviewedRestaurantWithPlace[];
  visibleNewRestaurants: NewRestaurant[];
  visiblePlaces: Place[];
  onPlaceSelect: (place: Place) => void;
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

  function handleNewRestaurantLinkClicked(newRestaurant: NewRestaurant): void {
    console.log('handleNewRestaurantLinkClicked');
    console.log(newRestaurant);
    // navigate(`/new-restaurant-details`, { state: newRestaurant });
  }

  
  return (
    <div style={listContainerStyle}>
      <List>
        {/* {props.visibleRestaurants.map((restaurant, index) => (
          <ListItemButton key={index}>
            <ListItemText primary={restaurant.googlePlace!.name} />
          </ListItemButton>
        ))} */}
        {/* {props.visibleNewRestaurants.map((newRestaurant, index) => (
          <ListItemButton key={index}>
            <ListItemText primary={newRestaurant.googlePlace!.name} />
          </ListItemButton>
        ))} */}
        {props.visiblePlaces.map((place: Place, index) => (
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
                {place.name}
              </h4>
              {/* <span>{restaurantTypeLabelFromRestaurantType(place.restaurantType)}</span>
              <span>Rating: {place.interestLevel}</span>
              <span>{place.comments}</span> */}
            </div>
          </ListItemButton>
        ))}
        {props.visibleNewRestaurants.map((newRestaurant: NewRestaurant, index) => (
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
                onClick={() => handleNewRestaurantLinkClicked(newRestaurant)}
              >
                {newRestaurant.googlePlace!.name}
              </h4>
              <span>{restaurantTypeLabelFromRestaurantType(newRestaurant.googlePlace!.restaurantType)}</span>
              <span>Rating: {newRestaurant.interestLevel}</span>
              <span>{newRestaurant.comments}</span>
            </div>
          </ListItemButton>
        ))}
      </List>
    </div>
  );
}

export default VisiblePlacesList;