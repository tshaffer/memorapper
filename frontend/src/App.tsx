import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import GoogleMapsProvider from './components/GoogleMapsProvider';

import './App.css';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery } from '@mui/material';
import { useUserContext } from './contexts/UserContext';
import { DistanceAwayFilterValues, OpenFilterMode, PlaceTypeQuery, RestaurantType, RestaurantTypeQuery, Settings, } from './types';
import PlaceForm from './pages/places/PlaceForm';
import Map from './pages/maps/Map';
import SettingsDialog from './components/SettingsDialog';
import SettingsIcon from '@mui/icons-material/Settings';

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
  const { settings, setSettings, setFilters, loading, error } = useUserContext();
  const isMobile = useMediaQuery('(max-width:768px)');
  const location = useLocation(); // Track the current route

  useEffect(() => {

    const getAppSettings = (): Settings => {
      const appSettings: string | null = localStorage.getItem('appSettings');
      if (appSettings) {
        return JSON.parse(appSettings);
      } else {
        const settings: Settings = {
          filters: {
            distanceAwayFilter: DistanceAwayFilterValues.AnyDistance,
            openFilterMode: OpenFilterMode.Any,
            placeType: PlaceTypeQuery.Restaurant,
            restaurantType: RestaurantTypeQuery.Any,
            openMeals: {
              BREAKFAST: false,
              LUNCH: false,
              DINNER: false,
            }
          },
        };
        localStorage.setItem("appSettings", JSON.stringify(settings));
        return settings;
      }
    }

    const appSettings: Settings = getAppSettings();
    setSettings(appSettings);
    setFilters(appSettings.filters);

  }, []);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenSettingsDialog = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleCloseSettingsDialog = () => {
    setSettingsAnchorEl(null);
  };

  const handleSetSettings = (updatedSettings: Settings) => {

    console.log("handleSetSettings called with updatedSettings:", updatedSettings);

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
  } else {
    content = (
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/map" element={<Map />} />
        <Route path="/map/:_id" element={<Map />} />
        <Route path="/add-place" element={<PlaceForm />} />
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
                  style={isActive('/add-place') ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/add-place"
                >
                  Add Place
                </Button>
              </>
            )}
            <IconButton onClick={handleOpenSettingsDialog} color="inherit">
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box id="mainAppContentArea" sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {content}
        </Box>
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

