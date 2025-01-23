import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import GoogleMapsProvider from './components/GoogleMapsProvider';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

import './App.css';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import WriteReviewPage from './pages/writeReview/WriteReviewPage';
import RestaurantDetails from './pages/reviews/RestaurantDetails';
import { useUserContext } from './contexts/UserContext';
import { DiningGroup, DistanceAwayFilterValues, Settings, } from './types';
import SettingsDialog from './components/SettingsDialog';
import NewRestaurantForm from './pages/newRestaurants/NewRestaurantForm';
import NewRestaurants from './pages/newRestaurants/NewRestaurants';

import Map from './pages/maps/Map';
import NewRestaurantDetails from './pages/reviews/NewRestaurantDetails';

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
  const { diningGroups: diningGroups, currentDiningGroup, setCurrentDiningGroup, settings, setSettings, setFilters, loading, error } = useUserContext();
  const isMobile = useMediaQuery('(max-width:768px)');
  const location = useLocation(); // Track the current route

  useEffect(() => {

    console.log('App.tsx: useEffect()');
    console.log('diningGroups:', diningGroups);
    
    const getCurrentDiningGroup = (): DiningGroup | null => {
      const storedDiningGroupId: string | null = localStorage.getItem('diningGroupId');
      if (diningGroups) {
        for (const diningGroup of diningGroups) {
          if (!storedDiningGroupId && diningGroup.diningGroupName === 'Anonymous') {
            return diningGroup;
          }
          if (diningGroup.diningGroupId === storedDiningGroupId) {
            return diningGroup;
          }
        }
      }

      const defaultDiningGroup: DiningGroup | null = diningGroups ? diningGroups.find((diningGroup) => diningGroup.diningGroupId === '1') || null : null;
      if (defaultDiningGroup) {
        localStorage.setItem('diningGroupId', defaultDiningGroup.diningGroupId);
      } else {
        // SHOULDN'T NEED TO DO THIS!!
        localStorage.setItem('diningGroupId', '1');
      }
      return defaultDiningGroup;
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
          },
        };
        localStorage.setItem("appSettings", JSON.stringify(settings));
        return settings;
      }
    }

    const currentDiningGroup: DiningGroup | null = getCurrentDiningGroup();
    setCurrentDiningGroup(currentDiningGroup);

    const appSettings: Settings = getAppSettings();
    setSettings(appSettings);
    setFilters(appSettings.filters);

  }, [diningGroups]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenDiningGroupDropdown = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDiningGroupDropdown = () => {
    setAnchorEl(null);
  };

  const handleSignIn = (diningGroupId: string) => {
    const selectedDiningGroup = diningGroups.find((diningGroup) => diningGroup.diningGroupId === diningGroupId) || null;
    setCurrentDiningGroup(selectedDiningGroup);
    localStorage.setItem('diningGroupId', diningGroupId);
    handleCloseDiningGroupDropdown();
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
  } else if (!diningGroups || diningGroups.length === 0) {
    content = <p>Error: no diningGroups found</p>;
  } else {
    content = (
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/map" element={<Map />} />
        <Route path="/map/:_id" element={<Map />} />
        <Route path="/restaurantDetails" element={<RestaurantDetails />} />
        <Route path="/new-restaurant-details" element={<NewRestaurantDetails />} />
        <Route path="/write-review" element={<WriteReviewPage />} />
        <Route path="/write-review/:_id" element={<WriteReviewPage />} />
        <Route path="/new-restaurants" element={<NewRestaurants />} />
        <Route path="/add-place" element={<NewRestaurantForm />} />
        <Route path="/add-place/:_id" element={<NewRestaurantForm />} />
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
                  style={(isActive('/map') || isActive('/map')) ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/map"
                >
                  Map
                </Button>
                <Button
                  style={isActive('/write-review') ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/write-review"
                >
                  Write Review
                </Button>
                <Button
                  style={isActive('/new-restaurants') ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/new-restaurants"
                >
                  New Restaurants
                </Button>
                <Button
                  style={isActive('/add-place') ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/add-place"
                >
                  Add Restaurant
                </Button>
              </>
            )}
            <IconButton onClick={handleOpenDiningGroupDropdown} color="inherit">
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
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseDiningGroupDropdown}>
          <MenuItem disabled>{currentDiningGroup ? `Signed in as: ${currentDiningGroup.diningGroupName}` : 'Not signed in'}</MenuItem>
          {diningGroups.map((diningGroup) => (
            <MenuItem key={diningGroup.diningGroupId} onClick={() => handleSignIn(diningGroup.diningGroupId)}>
              {diningGroup.diningGroupName}
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

