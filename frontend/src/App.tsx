import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import Map from './pages/Map';
import ReviewForm from './pages/ReviewForm';
import Reviews from './pages/Reviews';

const App: React.FC = () => {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MemoRapp
          </Typography>
          <Button color="inherit" component={Link} to="/">Reviews</Button>
          <Button color="inherit" component={Link} to="/map">Map</Button>
          <Button color="inherit" component={Link} to="/add-review">Add Review</Button>
        </Toolbar>
      </AppBar>
      <Container
        className="full-width-container"
        style={{
          height: 'calc(100vh - 64px)', // Subtract AppBar height
          overflow: 'hidden',          // Prevent unwanted scrollbars
        }}
      >
        <Routes>
          <Route path="/" element={<Reviews />} />
          <Route path="/map" element={<Map />} />
          <Route path="/map/:_id" element={<Map />} />
          <Route path="/add-review" element={<ReviewForm />} />
          <Route path="/add-review/:_id" element={<ReviewForm />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
