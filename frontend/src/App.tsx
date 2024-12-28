import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import GoogleMapsProvider from './components/GoogleMapsProvider';
import ReviewsIcon from '@mui/icons-material/Reviews';

import Map from './pages/maps/Map';
import MultiPanelReviewForm from './pages/writeReview/WriteReviewPage';
import RestaurantDetails from './pages/reviews/RestaurantDetails';
import Search from './pages/reviews/Search';

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
                // Home, All Reviews, Write Review
                <>
                  <IconButton color="inherit" component={Link} to="/map">
                    <HomeIcon />
                  </IconButton>
                  <IconButton color="inherit" component={Link} to="/search">
                    <ReviewsIcon />
                  </IconButton>
                  <IconButton color="inherit" component={Link} to="/write-review">
                    <EditIcon />
                  </IconButton>
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
