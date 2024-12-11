import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box } from '@mui/material';

import DirectionsIcon from '@mui/icons-material/Directions';
import MapIcon from '@mui/icons-material/Map';

import '../../App.css';

import { GooglePlace, MemoRappReview, SortCriteria } from '../../types';
import { getCityNameFromPlace } from '../../utilities';

const smallColumnStyle: React.CSSProperties = {
  width: '35px',
  maxWidth: '35px',
  textAlign: 'center',
  padding: '0',
};

interface RestaurantsTableProps {
  currentLocation: google.maps.LatLngLiteral | null;
  filteredPlaces: GooglePlace[];
  filteredReviews: MemoRappReview[];
  sortCriteria: SortCriteria;
}

const RestaurantsTable: React.FC<RestaurantsTableProps> = (props: RestaurantsTableProps) => {

  const { currentLocation, filteredPlaces, filteredReviews, sortCriteria } = props;

  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const navigate = useNavigate();

  const getSortedPlaces = (): GooglePlace[] => {

    const sortedPlaces = [...filteredPlaces]; // Clone the array to avoid mutating state

    switch (sortCriteria) {
      case SortCriteria.Name:
        return sortedPlaces.sort((a, b) => a.name.localeCompare(b.name));
      case SortCriteria.Distance:
        if (!currentLocation) return sortedPlaces;
        return sortedPlaces.sort((a, b) => {
          const distanceA = Math.hypot(
            (a.geometry?.location.lat || 0) - currentLocation.lat,
            (a.geometry?.location.lng || 0) - currentLocation.lng
          );
          const distanceB = Math.hypot(
            (b.geometry?.location.lat || 0) - currentLocation.lat,
            (b.geometry?.location.lng || 0) - currentLocation.lng
          );
          return distanceA - distanceB;
        });
      case SortCriteria.Reviewer:
        return sortedPlaces.sort((a, b) => {
          const reviewerA = filteredReviews.find((r) => r.place_id === a.place_id)?.freeformReviewProperties.reviewer || '';
          const reviewerB = filteredReviews.find((r) => r.place_id === b.place_id)?.freeformReviewProperties.reviewer || '';
          return reviewerA.localeCompare(reviewerB);
        });
      case SortCriteria.MostRecentReview:
        return sortedPlaces.sort((a, b) => {
          const recentDateA = filteredReviews
            .filter((r) => r.place_id === a.place_id)
            .reduce((latest, r) => Math.max(latest, new Date(r.structuredReviewProperties.dateOfVisit).getTime()), 0);
          const recentDateB = filteredReviews
            .filter((r) => r.place_id === b.place_id)
            .reduce((latest, r) => Math.max(latest, new Date(r.structuredReviewProperties.dateOfVisit).getTime()), 0);
          return recentDateB - recentDateA;
        });
      default:
        return sortedPlaces;
    }
  };


  const handlePlaceClick = (place: GooglePlace) => {
    setSelectedPlaceId(place.place_id); // Update selected place ID
    setSelectedPlace(place);
  };

  const handleShowMap = (placeId: string) => {
    navigate(`/map/${placeId}`);
  };

  const handleShowDirections = (placeId: string) => {
    const destination: GooglePlace | undefined = filteredPlaces.find(place => place.place_id === placeId);
    if (destination && currentLocation) {
      const destinationLocation: google.maps.LatLngLiteral = destination.geometry!.location;
      const destinationLatLng: google.maps.LatLngLiteral = { lat: destinationLocation.lat, lng: destinationLocation.lng };
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destinationLatLng.lat},${destinationLatLng.lng}&destination_place_id=${destination.name}`;
      window.open(url, '_blank');
    }
  };

  const renderPlacesTable = (): JSX.Element | null => {

    const sortedPlaces = getSortedPlaces(); // Get the sorted places

    return (
      <Box
        id='placesTableContainer'
        sx={{
          flexShrink: 0,
          width: { xs: '100%', sm: '30%' },
          minWidth: { sm: '300px' },
          maxWidth: { sm: '50%' },
          overflowY: 'auto',
          borderRight: { sm: '1px solid #ccc' },
          borderBottom: { xs: '1px solid #ccc', sm: 'none' },
          height: { xs: '75vh', sm: '80vh' },
        }}
      >
        {/* Places Table */}
        <TableContainer
          id='tableContainer'
          component={Paper}
          className="scrollable-table-container"
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow className="table-head-fixed">
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
                <TableCell>Place</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlaces.map((place: GooglePlace) => (
                <React.Fragment key={place.place_id}>
                  <TableRow
                    className="table-row-hover"
                    onClick={() => handlePlaceClick(place)}
                    sx={{
                      backgroundColor:
                        place.place_id === selectedPlaceId ? '#f0f8ff' : 'inherit', // Highlight selected row
                      cursor: 'pointer', // Indicate clickable rows
                    }}
                  >
                    <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                      <IconButton onClick={() => handleShowMap(place.place_id)}>
                        <MapIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                      <IconButton onClick={() => handleShowDirections(place.place_id)}>
                        <DirectionsIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>{place.name}</TableCell>
                    <TableCell>{getCityNameFromPlace(place) || 'Not provided'}</TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <React.Fragment>
      {renderPlacesTable()}
    </React.Fragment>
  );
}

export default RestaurantsTable;
