import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  Tooltip,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Autocomplete } from '@react-google-maps/api';
import { SelectChangeEvent } from '@mui/material/Select';
import { RecentLocation } from '../types';
import { useSelector } from 'react-redux';
import { selectRecentLocations, setRecentLocations } from '../redux';

interface LocationAutocompleteProps {
  onSetMapLocation: (mapLocation: google.maps.LatLngLiteral) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onSetMapLocation,
}) => {

  const dispatch = useDispatch();

  const isMobile = useMediaQuery('(max-width:768px)');
  const mapAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedLocationKey, setSelectedLocationKey] = useState<string>('');

  const recentLocations: RecentLocation[] = useSelector(selectRecentLocations);

  const [manageDialogOpen, setManageDialogOpen] = useState(false);

  // Get device's current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
      },
      (error) => console.error('Error getting current location: ', error),
      { enableHighAccuracy: true }
    );
  }, []);


  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      onSetMapLocation(currentLocation);
      setSelectedLocationKey(''); // Clear dropdown
      // setShowCustomInput(false);
    }
  };

  const handleMapLocationChanged = () => {
    if (mapAutocompleteRef.current) {
      const place = mapAutocompleteRef.current.getPlace();
      if (place?.geometry?.location && place.formatted_address) {
        const newCoordinates = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        const newLocation: RecentLocation = {
          label: place.formatted_address,
          lat: newCoordinates.lat,
          lng: newCoordinates.lng,
        };

        // Check for duplicates
        const exists = recentLocations.some(loc => loc.label === newLocation.label);
        let updatedLocations = [...recentLocations];
        if (!exists) {
          updatedLocations.push(newLocation);
          dispatch(setRecentLocations(updatedLocations));
          localStorage.setItem('recentLocations', JSON.stringify(updatedLocations));
        }

        onSetMapLocation(newCoordinates);
      } else {
        console.error('No place found in handleMapLocationChanged');
      }
    }
  };

  const handleDeleteLocation = (labelToDelete: string) => {
    const updated = recentLocations.filter(loc => loc.label !== labelToDelete);
    dispatch(setRecentLocations(updated));
    localStorage.setItem('recentLocations', JSON.stringify(updated));

    if (labelToDelete === selectedLocationKey) {
      setSelectedLocationKey('');
    }
  };

  const handleLocationSelect = (event: SelectChangeEvent<string>) => {
    const key = event.target.value;
    setSelectedLocationKey(key);

    const selected = recentLocations.find(loc => loc.label === key);
    if (selected) {
      onSetMapLocation({ lat: selected.lat, lng: selected.lng });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 1 : 2,
        width: '100%',
        flexWrap: 'wrap',
      }}
    >
      <Tooltip title="Use Current Location">
        <IconButton
          onClick={handleUseCurrentLocation}
          sx={{
            backgroundColor: '#007bff',
            color: '#fff',
            '&:hover': { backgroundColor: '#0056b3' },
          }}
        >
          <MyLocationIcon />
        </IconButton>
      </Tooltip>

      <Typography variant="body1" sx={{ whiteSpace: 'nowrap' }}>
        Location:
      </Typography>

      <Select
        value={selectedLocationKey}
        onChange={handleLocationSelect}
        displayEmpty
        size="small"
        sx={{ minWidth: isMobile ? 140 : 180, flexGrow: 1 }}
      >
        <MenuItem value="" disabled>
          Select a location
        </MenuItem>
        {recentLocations.map((loc) => (
          <MenuItem key={loc.label} value={loc.label}>
            {loc.label}
          </MenuItem>
        ))}
      </Select>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Autocomplete
          onLoad={(autocomplete) => (mapAutocompleteRef.current = autocomplete)}
          onPlaceChanged={handleMapLocationChanged}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter a location"
            style={{
              width: '100%',
              padding: isMobile ? '8px' : '10px',
              fontSize: isMobile ? '14px' : '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </Autocomplete>
      </Box>

      <Button
        size="small"
        startIcon={<ManageAccountsIcon />}
        onClick={() => setManageDialogOpen(true)}
        sx={{ marginLeft: isMobile ? 0 : 'auto', marginTop: isMobile ? 1 : 0 }}
      >
        Manage Locations
      </Button>


      <Dialog open={manageDialogOpen} onClose={() => setManageDialogOpen(false)}>
        <DialogTitle>Manage Saved Locations</DialogTitle>
        <DialogContent>
          <List dense>
            {recentLocations
              .slice()
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((loc) => (
                <ListItem
                  key={loc.label}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteLocation(loc.label)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={loc.label} />
                </ListItem>
              ))}
          </List>
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default LocationAutocomplete;
