import React from 'react';

import { useSelector } from 'react-redux';
import { RootState, selectAllMrPlacesWithGooglePlaces } from '../redux';

import { Box, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, IconButton } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


import { MrPlaceWithGooglePlace } from '../types';
import { getCityNameFromPlace } from '../utilities';
import { useNavigate } from 'react-router-dom';

const smallColumnStyle: React.CSSProperties = {
  width: '35px',
  maxWidth: '35px',
  textAlign: 'center',
  padding: '0',
};

const MrPlaces: React.FC<any> = () => {

  const mrPlacesWithGooglePlaces: MrPlaceWithGooglePlace[] = useSelector(selectAllMrPlacesWithGooglePlaces);

  const navigate = useNavigate();

  function handleEditPlace(mrPlaceWithGooglePlace: MrPlaceWithGooglePlace) {
    // For now, just log the place to the console.
    // In a real app, you might open a dialog or navigate to an edit page.
    console.log('Edit place:', mrPlaceWithGooglePlace);
    navigate(`/add-place/${mrPlaceWithGooglePlace._id}`, { state: mrPlaceWithGooglePlace });
  }

  function handleDeletePlace(mrPlaceWithGooglePlace: MrPlaceWithGooglePlace) {
    // For now, just log the place to the console.
    // In a real app, you might open a dialog or navigate to an edit page.
    console.log('Delete place:', mrPlaceWithGooglePlace);
  }

  const renderPlaces = (): JSX.Element | null => {

    if (mrPlacesWithGooglePlaces.length === 0) {
      return <div>No places found</div>;
    }

    return (
      <Box
        id='placesBoxT'
        sx={{
          flexShrink: 0,
          width: { xs: '100%', sm: '100%' },
          overflowY: 'auto',
          borderRight: { sm: '1px solid #ccc' },
          borderBottom: { xs: '1px solid #ccc', sm: 'none' },
          height: { xs: '75vh', sm: '80vh' },
        }}
      >
        {/* Places Table */}
        <TableContainer
          id='placesTableContainer'
          component={Paper}
          className="scrollable-table-container"
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow className="table-head-fixed">
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mrPlacesWithGooglePlaces.map((mrPlaceWithGooglePlace: MrPlaceWithGooglePlace) => {
                return (
                  <React.Fragment key={mrPlaceWithGooglePlace._id}>
                    <TableRow>
                      <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                        <Tooltip title="View/Edit">
                          <IconButton onClick={(event) => {
                            event.stopPropagation();
                            handleEditPlace(mrPlaceWithGooglePlace)
                          }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                      </TableCell>
                      <TableCell align="right" className="dimmed" style={smallColumnStyle}>
                        <Tooltip title="Delete">
                          <IconButton onClick={(event) => {
                            event.stopPropagation();
                            handleDeletePlace(mrPlaceWithGooglePlace)
                          }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{mrPlaceWithGooglePlace.googlePlace!.name}</TableCell>
                      <TableCell>{getCityNameFromPlace(mrPlaceWithGooglePlace.googlePlace!) || 'Not provided'}</TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody >
          </Table >
        </TableContainer >
      </Box >
    );
  }

  return (
    <Paper>
      {renderPlaces()}
    </Paper>
  );
}

export default MrPlaces;
