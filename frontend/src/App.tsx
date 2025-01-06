import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import GoogleMapsProvider from './components/GoogleMapsProvider';
import ReviewsIcon from '@mui/icons-material/Reviews';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

import './App.css';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import Map from './pages/maps/Map';
import WriteReviewPage from './pages/writeReview/WriteReviewPage';
import RestaurantDetails from './pages/reviews/RestaurantDetails';
import Search from './pages/reviews/Search';
import { useUserContext } from './contexts/UserContext';
import { DistanceAwayFilterValues, Settings, UserEntity } from './types';
import SettingsDialog from './components/SettingsDialog';
import FuturePlaceForm from './pages/futurePlaces/FuturePlaceForm';

// soft orange: #FFA07A
// other possibilities
//    Light Yellow (#FFD700):
//    Light Gray (#D3D3D3):\
//    Sky Blue (#87CEFA):
//    Soft Orange (#FFA07A):
//    Teal (#20B2AA):

const activeButtonStyle: React.CSSProperties = {
  color: '#FFA07A',
};

const App: React.FC = () => {
  const { users, currentUser, setCurrentUser, settings, setSettings, setFilters, setRatingsUI, loading, error } = useUserContext();
  const isMobile = useMediaQuery('(max-width:768px)');
  const location = useLocation(); // Track the current route

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

      const defaultUser: UserEntity | null = users ? users.find((user) => user.id === '0') || null : null;
      if (defaultUser) {
        localStorage.setItem('userId', defaultUser.id);
      }
      return defaultUser;
    }

    const getAppSettings = (): Settings => {
      const appSettings: string | null = localStorage.getItem('appSettings');
      if (appSettings) {
        return JSON.parse(appSettings);
      } else {
        const settings: Settings = {
          filters: {
            distanceAwayFilter: DistanceAwayFilterValues.AnyDistance,
            isOpenNowFilterEnabled: false,
            wouldReturnFilter: {
              enabled: false,
              values: {
                yes: false,
                no: false,
                notSure: false,
              },
            }
          },
          ratingsUI: {
            primaryRatingLabel: 'Rating',
            showSecondaryRating: false,
            secondaryRatingLabel: '',
          }
        };
        localStorage.setItem("appSettings", JSON.stringify(settings));
        return settings;
      }
    }

    const currentUser: UserEntity | null = getCurrentUser();
    setCurrentUser(currentUser);

    const appSettings: Settings = getAppSettings();
    setSettings(appSettings);
    setFilters(appSettings.filters);
    setRatingsUI(appSettings.ratingsUI);

  }, [users]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenAccountDropdown = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseAccountDropdown = () => {
    setAnchorEl(null);
  };

  const handleSignIn = (userId: string) => {
    const selectedUser = users.find((user) => user.id === userId) || null;
    setCurrentUser(selectedUser);
    localStorage.setItem('userId', userId);
    handleCloseAccountDropdown();
  };

  const handleOpenSettingsDialog = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleCloseSettingsDialog = () => {
    setSettingsAnchorEl(null);
  };

  const handleSetSettings = (updatedSettings: Settings) => {
    // Update settings using the UserContext's setSettings
    setSettings(updatedSettings);

    // Persist the updated settings to localStorage
    localStorage.setItem("appSettings", JSON.stringify(updatedSettings));
  };

  const isActive = (path: string) => location.pathname === path; // Check if the button corresponds to the current route

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
        <Route path="/write-review" element={<WriteReviewPage />} />
        <Route path="/write-review/:_id" element={<WriteReviewPage />} />
        <Route path="/add-place" element={<FuturePlaceForm />} />
        <Route path="/add-place/:_id" element={<FuturePlaceForm />} />
      </Routes>
    );
  }

  return (

    <GoogleMapsProvider>
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
                <IconButton color="inherit" component={Link} to="/add-place">
                  <EditIcon />
                </IconButton>
              </>
            ) : (
              // Render labels for desktop
              <>
                <Button
                  style={(isActive('/map') || isActive('/')) ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/map"
                >
                  Home
                </Button>
                <Button
                  style={isActive('/search') ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/search"
                >
                  All Reviews
                </Button>
                <Button
                  style={isActive('/write-review') ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/write-review"
                >
                  Write Review
                </Button>
                <Button
                  style={isActive('/add-place') ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/add-place"
                >
                  Add Place
                </Button>
              </>
            )}
            <IconButton onClick={handleOpenAccountDropdown} color="inherit">
              <AccountCircleIcon />
            </IconButton>
            <IconButton onClick={handleOpenSettingsDialog} color="inherit">
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box id="mainAppContentArea" sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {content}
        </Box>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseAccountDropdown}>
          <MenuItem disabled>{currentUser ? `Signed in as: ${currentUser.userName}` : 'Not signed in'}</MenuItem>
          {users.map((user) => (
            <MenuItem key={user.id} onClick={() => handleSignIn(user.id)}>
              {user.userName}
            </MenuItem>
          ))}
        </Menu>
        <SettingsDialog
          open={settingsAnchorEl !== null}
          onClose={handleCloseSettingsDialog}
          settings={settings}
          onSetSettings={handleSetSettings}
        />
      </Box >
    </GoogleMapsProvider >
  );
};

export default App;

