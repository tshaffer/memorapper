import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import Map from './pages/Map';
import Reviews from './pages/Reviews';
import MultiPanelReviewForm from './pages/MultiPanelReviewForm';

const App: React.FC = () => {
  return (
    <Router>
      {/* Main layout container */}
      <Box id='mainLayoutContainer' sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* AppBar at the top */}
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

        {/* Main content area below AppBar */}
        <Box id='mainAppContentArea' sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Reviews />} />
            <Route path="/map" element={<Map />} />
            <Route path="/map/:_id" element={<Map />} />
            <Route path="/write-review" element={<MultiPanelReviewForm />} />
            {/* <Route path="/add-review" element={<ReviewForm />} />
            <Route path="/add-review/:_id" element={<ReviewForm />} /> */}
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;
