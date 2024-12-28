import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import GoogleMapsProvider from './components/GoogleMapsProvider';
import ReviewsIcon from '@mui/icons-material/Reviews';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Menu, MenuItem } from '@mui/material';

import Map from './pages/maps/Map';
import MultiPanelReviewForm from './pages/writeReview/WriteReviewPage';
import RestaurantDetails from './pages/reviews/RestaurantDetails';
import Search from './pages/reviews/Search';
import { useUserContext } from './contexts/UserContext';
import { UserEntity } from './types';

const App: React.FC = () => {
  const { users, currentUser, setCurrentUser, loading, error } = useUserContext();

  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    const getCurrentUser = (): UserEntity | null => {
      const storedUserId: string | null = localStorage.getItem('userId');
      if (users) {
        for (const user of users) {
          if (!storedUserId && user.userName === 'Guest') {
            return user;
          }
          if (user.id === storedUserId) {
            return user;
          }
        }
      }
      return null;
    };

    setCurrentUser(getCurrentUser());
  }, [users]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignIn = (userId: string) => {
    const selectedUser = users.find((user) => user.id === userId) || null;
    setCurrentUser(selectedUser);
    localStorage.setItem('userId', userId);
    handleMenuClose();
  };

  let content;
  if (loading) {
    content = <p>Loading users...</p>;
  } else if (error) {
    content = <p>Error: {error}</p>;
  } else if (!users || users.length === 0) {
    content = <p>Error: no users found</p>;
  } else {
    content = (
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/search" element={<Search />} />
        <Route path="/restaurantDetails" element={<RestaurantDetails />} />
        <Route path="/map" element={<Map />} />
        <Route path="/map/:_id" element={<Map />} />
        <Route path="/write-review" element={<MultiPanelReviewForm />} />
        <Route path="/write-review/:_id" element={<MultiPanelReviewForm />} />
      </Routes>
    );
  }

  return (
    <GoogleMapsProvider>
      <Router>
        <Box id="mainLayoutContainer" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AppBar
            id="memoRapperAppBar"
            position="static"
            style={{
              marginBottom: isMobile ? '4px' : undefined, // Apply marginBottom only for mobile
            }}
          >
            <Toolbar id="toolBar">
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
              <IconButton onClick={handleMenuOpen} color="inherit">
                <AccountCircleIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Box id="mainAppContentArea" sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {content}
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>{currentUser ? `Signed in as: ${currentUser.userName}` : 'Not signed in'}</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} onClick={() => handleSignIn(user.id)}>
                {user.userName}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Router>
    </GoogleMapsProvider>
  );
};

export default App;
