import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Map from './pages/maps/Map';
import Reviews from './pages/viewReviews/Reviews';
import MultiPanelReviewForm from './pages/writeReview/WriteReviewPage';
import GoogleMapsProvider from './components/GoogleMapsProvider';

const App: React.FC = () => {
  return (
    <GoogleMapsProvider>
      <Router>
        <Box id='mainLayoutContainer' sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AppBar id='appBar' position="static">
            <Toolbar id='toolBar'>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                MemoRapp
              </Typography>
              <Button color="inherit" component={Link} to="/">Reviews</Button>
              <Button color="inherit" component={Link} to="/map">Map</Button>
              <Button color="inherit" component={Link} to="/write-review">Write Review</Button>
            </Toolbar>
          </AppBar>

          <Box id='mainAppContentArea' sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Routes>
              <Route path="/" element={<Reviews />} />
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
