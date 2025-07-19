import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import HomeIcon from '@mui/icons-material/Home';
import GoogleMapsProvider from './components/GoogleMapsProvider';

import './App.css';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery } from '@mui/material';
import { Distance, RecentLocation, RestaurantOpen, Settings, VisitedStatus, } from './types';
import Map from './pages/maps/Map';
import SettingsDialog from './components/SettingsDialog';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppDispatch, fetchMrPlacesWithGooglePlace, RootState, setCurrentMapLocation, setRecentLocations } from './redux';
import { setSettings, setFilters } from './redux';
import MrPlaceForm from './pages/MrPlace';
import MrWriteReviewPage from './pages/MrWriteReviewPage';
import MrPlaces from './pages/MrPlaces';

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
  const dispatch = useDispatch<AppDispatch>();
  const { settings, error, loading } = useSelector((state: RootState) => state.memorapper);

  const isMobile = useMediaQuery('(max-width:768px)');
  const location = useLocation(); // Track the current route

  useEffect(() => {
    const loadData = async () => {
      console.log('loadData useEffect called');
      await dispatch(fetchMrPlacesWithGooglePlace());
    };
    loadData();
  }, [dispatch]);

  useEffect(() => {
    console.log('getLocalStorage useEffect called');

    const getRecentLocations = (): RecentLocation[] => {
      const recentLocations: string | null = localStorage.getItem('recentLocations');
      if (recentLocations) {
        return JSON.parse(recentLocations);
      } else {
        return [];
      }
    };

    const getAppSettings = (): Settings => {
      const appSettings: string | null = localStorage.getItem('appSettings');
      if (appSettings) {
        return JSON.parse(appSettings);
      } else {
        const settings: Settings = {
          filters: {
            distanceAway: Distance.AnyDistance,
            restaurantOpen: RestaurantOpen.OpenAnyTime,
            placeTypes: [],
            restaurantTypes: [],
            openMeals: {
              Breakfast: false,
              Lunch: false,
              Dinner: false,
            },
            visitedStatus: VisitedStatus.VisitedAndUnvisited,
          },
        };
        localStorage.setItem("appSettings", JSON.stringify(settings));
        return settings;
      }
    }

    const recentLocations = getRecentLocations();
    console.log("recentLocations:", recentLocations);
    dispatch(setRecentLocations(recentLocations));

    const appSettings: Settings = getAppSettings();
    dispatch(setSettings(appSettings));
    setFilters(appSettings.filters);

  }, []);

  // Fetch current location on startup
  useEffect(() => {

    const fetchCurrentLocation = async (): Promise<google.maps.LatLngLiteral | null> => {

      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser.');
        return null;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: true }
          );
        });

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };


        dispatch(setCurrentMapLocation(location));

        return location;

      } catch (error) {
        console.error('Error getting current location: ', error);

        const defaultLocation = {
          lat: 37.3920898, // Default to Crapshack
          lng: -122.1479873,
        };
        console.warn('Using default location:', defaultLocation);

        dispatch(setCurrentMapLocation(defaultLocation));

        return defaultLocation;
      }
    };

    fetchCurrentLocation();
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

    dispatch(setSettings(updatedSettings));

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
        <Route path="/places" element={<MrPlaces />} />
        <Route path="/add-place" element={<MrPlaceForm />} />
        <Route path="/add-place/:_id" element={<MrPlaceForm />} />
        <Route path="/write-review" element={<MrWriteReviewPage />} />
        <Route path="/write-review/:placeId/:reviewId?" element={<MrWriteReviewPage />} />
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
                  style={isActive('/places') ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/places"
                >
                  Places
                </Button>
                <Button
                  style={isActive('/add-place') ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/add-place"
                >
                  Add Place
                </Button>
                {/* <Button
                  style={isActive('/write-review') ? activeButtonStyle : { color: 'white' }}
                  component={Link}
                  to="/write-review"
                >
                  Write Review
                </Button> */}
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

