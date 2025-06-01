// App.tsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';

import GoogleMapsProvider from './components/GoogleMapsProvider';
import Map from './pages/maps/Map';
import PlacesPage from './pages/PlacesPage';
import SearchPage from './pages/SearchPage';
import ReviewPage from './pages/ReviewPage';
import SettingsDialog from './components/SettingsDialog';

import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery } from '@mui/material';
import { AppDispatch, RootState, setPlacesWithGooglePlaces } from './redux';
import { setSettings, setFilters, fetchGooglePlaces, fetchPlaces } from './redux';
import { mergePlacesWithGooglePlaces } from './utilities/mergePlaces';

const activeButtonStyle: React.CSSProperties = {
  color: '#FFA07A',
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { googlePlaces, places, settings, error, loading } = useSelector((state: RootState) => state.memorapper);

  const isMobile = useMediaQuery('(max-width:768px)');
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      console.log('loadData useEffect called');
      await dispatch(fetchGooglePlaces());
      await dispatch(fetchPlaces());
    };
    loadData();
  }, [dispatch]);

  useEffect(() => {
    const merged = mergePlacesWithGooglePlaces(places, googlePlaces);
    dispatch(setPlacesWithGooglePlaces(merged));
  }, [places, googlePlaces, dispatch]);

  useEffect(() => {
    const getAppSettings = () => {
      const appSettings = localStorage.getItem('appSettings');
      if (appSettings) {
        return JSON.parse(appSettings);
      }
      const settings = {
        filters: {
          distanceAway: 'AnyDistance',
          restaurantOpen: 'OpenAnyTime',
          placeTypes: [],
          restaurantTypes: [],
          openMeals: { Breakfast: false, Lunch: false, Dinner: false },
        },
      };
      localStorage.setItem('appSettings', JSON.stringify(settings));
      return settings;
    };
    dispatch(setSettings(getAppSettings()));
  }, []);

  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenSettingsDialog = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleCloseSettingsDialog = () => {
    setSettingsAnchorEl(null);
  };

  const handleSetSettings = (updatedSettings: any) => {
    dispatch(setSettings(updatedSettings));
    localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  let content;
  if (loading) {
    content = <p>Loading places...</p>;
  } else if (error) {
    content = <p>Error: {error}</p>;
  } else {
    content = (
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/map" element={<Map />} />
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/reviews" element={<ReviewPage />} />
      </Routes>
    );
  }

  return (
    <GoogleMapsProvider>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Memorapper
            </Typography>

            {isMobile ? (
              <>
                <IconButton color="inherit" component={Link} to="/map"><MapIcon /></IconButton>
                <IconButton color="inherit" component={Link} to="/places"><RestaurantIcon /></IconButton>
                <IconButton color="inherit" component={Link} to="/search"><SearchIcon /></IconButton>
                <IconButton color="inherit" component={Link} to="/reviews"><HomeIcon /></IconButton>
              </>
            ) : (
              <>
                <Button style={isActive('/map') ? activeButtonStyle : { color: 'white' }} component={Link} to="/map">Map</Button>
                <Button style={isActive('/places') ? activeButtonStyle : { color: 'white' }} component={Link} to="/places">Places</Button>
                <Button style={isActive('/search') ? activeButtonStyle : { color: 'white' }} component={Link} to="/search">Search</Button>
                <Button style={isActive('/reviews') ? activeButtonStyle : { color: 'white' }} component={Link} to="/reviews">Reviews</Button>
              </>
            )}

            <IconButton onClick={handleOpenSettingsDialog} color="inherit">
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {content}
        </Box>

        <SettingsDialog
          open={settingsAnchorEl !== null}
          onClose={handleCloseSettingsDialog}
          settings={settings}
          onSetSettings={handleSetSettings}
        />
      </Box>
    </GoogleMapsProvider>
  );
};

export default App;
