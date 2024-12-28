import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import EditIcon from '@mui/icons-material/Edit';
import GoogleMapsProvider from './components/GoogleMapsProvider';

import Map from './pages/maps/Map';
import MultiPanelReviewForm from './pages/writeReview/WriteReviewPage';
import RestaurantDetails from './pages/search/RestaurantDetails';
import Search from './pages/search/Search';

const App: React.FC = () => {
  const isMobile = useMediaQuery('(max-width:768px)');

  return (
    <GoogleMapsProvider>
      <Router>
        <Box id='mainLayoutContainer' sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AppBar
            id='memoRapperAppBar'
            position="static"
            style={{
              marginBottom: isMobile ? '4px' : undefined, // Apply marginBottom only for mobile
            }}
          >
            <Toolbar id='toolBar'>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                MemoRapp
              </Typography>

              {isMobile ? (
                // Render icons for mobile
                <>
                  <Tooltip title="Search">
                    <IconButton color="inherit" component={Link} to="/search">
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Map">
                    <IconButton color="inherit" component={Link} to="/map">
                      <MapIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Write Review">
                    <IconButton color="inherit" component={Link} to="/write-review">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                // Render labels for desktop
                <>
                  <Button color="inherit" component={Link} to="/map">Home</Button>
                  <Button color="inherit" component={Link} to="/search">All Reviews</Button>
                  <Button color="inherit" component={Link} to="/write-review">Write Review</Button>
                </>
              )}
            </Toolbar>
          </AppBar>

          <Box id='mainAppContentArea' sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Routes>
              <Route path="/" element={<Map />} />
              <Route path="/search" element={<Search />} />
              <Route path="/restaurantDetails" element={<RestaurantDetails />} />
              <Route path="/map" element={<Map />} />
              <Route path="/map/:_id" element={<Map />} />
              <Route path="/write-review" element={<MultiPanelReviewForm />} />
              <Route path="/write-review/:_id" element={<MultiPanelReviewForm />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </GoogleMapsProvider>
  );
};

export default App;
