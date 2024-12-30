import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useEffect, useRef, useState } from 'react';
import { Box, Button, Switch, Typography, useMediaQuery } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { DistanceAwayFilter, Filters } from "../types";
export interface FiltersSettingsProps {
  filters: Filters
  onUpdateFilters: (filters: Filters) => void;
}

const filterButtonStyle: React.CSSProperties = {
  padding: '8px 8px',
  background: '#f8f8f8',
  border: '1px solid #ccc',
  borderRadius: '20px',
  fontSize: '14px',
  cursor: 'pointer',
};

const myButtonStyle: React.CSSProperties = {
  color: '#1976D2',
  fontWeight: 500,
  fontSize: '14px',
};

const FiltersSettings: React.FC<FiltersSettingsProps> = (props: FiltersSettingsProps) => {

  const { filters, onUpdateFilters } = props;
  const { distanceAway, wouldReturnFilter, isOpenNowEnabled } = filters;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [distanceAwayDropdownVisible, setDistanceAwayDropdownVisible] = useState(false);
  const [wouldReturnDropdownVisible, setWouldReturnDropdownVisible] = useState(false);

  const distanceDropdownRef = useRef<HTMLDivElement | null>(null);
  const wouldReturnDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleWouldReturnClick = () => {
    setWouldReturnDropdownVisible((prev) => !prev);
    setDistanceAwayDropdownVisible(false);
  };

  const handleDistanceAwayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistanceAway = Number(e.target.value);
    onUpdateFilters({ ...filters, distanceAway: newDistanceAway });
    setDistanceAwayDropdownVisible(false);
  };

  const handleOpenNowClick = () => {
    setDistanceAwayDropdownVisible(false);
    setWouldReturnDropdownVisible(false);
    const newOpenNowFilterEnabled = !isOpenNowEnabled;
    onUpdateFilters({ ...filters, isOpenNowEnabled: newOpenNowFilterEnabled });
  };

  const handleWouldReturnChange = (updatedValues: any) => {
    const values = { ...wouldReturnFilter.values, ...updatedValues };
    const newWouldReturnFilter = {
      ...wouldReturnFilter,
      values,
    };
    onUpdateFilters({ ...filters, wouldReturnFilter: newWouldReturnFilter });
  }

  const handleWouldReturnToggleEnabled = () => {
    const newWouldReturnFilter = {
      ...wouldReturnFilter,
      enabled: !wouldReturnFilter.enabled,
    };
    onUpdateFilters({ ...filters, wouldReturnFilter: newWouldReturnFilter });
  }

  const handleCloseWouldReturnDropdown = () => {
    setWouldReturnDropdownVisible(false);
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (distanceDropdownRef.current && !distanceDropdownRef.current.contains(event.target as Node)) {
      setDistanceAwayDropdownVisible(false);
    }
    if (wouldReturnDropdownRef.current && !wouldReturnDropdownRef.current.contains(event.target as Node)) {
      setWouldReturnDropdownVisible(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setDistanceAwayDropdownVisible(false);
      setWouldReturnDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (distanceAwayDropdownVisible || wouldReturnDropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [distanceAwayDropdownVisible, wouldReturnDropdownVisible]);


  const renderDistanceAway = (): JSX.Element => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 8px',
        background: '#f8f8f8',
        border: '1px solid #ccc',
        borderRadius: '20px',
        cursor: 'pointer',
      }}
    >
      <Typography
        variant="subtitle1"
        style={myButtonStyle}
      >
        {isMobile ? 'DISTANCE' : 'DISTANCE AWAY'}
      </Typography>
      <select
        value={distanceAway}
        onChange={handleDistanceAwayChange}
        style={{
          color: '#1976D2',
          fontWeight: 500,
          fontSize: '14px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        <option value={DistanceAwayFilter.HalfMile}>HALF MILE</option>
        <option value={DistanceAwayFilter.OneMile}>1 MILE</option>
        <option value={DistanceAwayFilter.FiveMiles}>5 MILES</option>
        <option value={DistanceAwayFilter.TenMiles}>10 MILES</option>
        <option value={DistanceAwayFilter.AnyDistance}>ANY DISTANCE</option>
      </select>
    </Box>
  );

  const renderWouldReturnDropdown = (): JSX.Element => (
    <Box
      ref={wouldReturnDropdownRef}
      sx={{
        position: 'relative',
        left: '48px',
        background: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        zIndex: 10,
        padding: '16px',
        width: '215px',
        maxWidth: '90%',
      }}
    >
      <Typography variant="subtitle1" sx={{ marginBottom: '12px' }}>
        Would Return
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={wouldReturnFilter.values.yes}
              disabled={!wouldReturnFilter.enabled}
              onChange={() =>
                handleWouldReturnChange({ yes: !wouldReturnFilter.values.yes })
              }
            />
          }
          label="Yes"
          sx={{ color: wouldReturnFilter.enabled ? 'inherit' : '#aaa' }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={wouldReturnFilter.values.no}
              disabled={!wouldReturnFilter.enabled}
              onChange={() =>
                handleWouldReturnChange({ no: !wouldReturnFilter.values.no })
              }
            />
          }
          label="No"
          sx={{ color: wouldReturnFilter.enabled ? 'inherit' : '#aaa' }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={wouldReturnFilter.values.notSure}
              disabled={!wouldReturnFilter.enabled}
              onChange={() =>
                handleWouldReturnChange({ notSure: !wouldReturnFilter.values.notSure })
              }
            />
          }
          label="Not Sure"
          sx={{ color: wouldReturnFilter.enabled ? 'inherit' : '#aaa' }}
        />
      </FormGroup>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <Box>
          <Typography variant="body2" sx={{ display: 'inline', marginRight: '8px' }}>
            Enable Filter
          </Typography>
          <Switch
            checked={wouldReturnFilter.enabled}
            onChange={handleWouldReturnToggleEnabled}
          />
        </Box>
        <Button onClick={handleCloseWouldReturnDropdown} aria-label="Close">
          <CloseIcon />
        </Button>
      </Box>
    </Box>
  );

  const renderFiltersRow = (): JSX.Element => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: isMobile ? 'center' : 'flex-start',
        marginBottom: '12px',
      }}
    >
      {renderDistanceAway()}
      <Button style={filterButtonStyle} onClick={handleOpenNowClick}>
        Open Now
        <CheckIcon
          style={{
            marginLeft: '4px',
            visibility: isOpenNowEnabled ? 'visible' : 'hidden',
          }}
        />
      </Button>
      <Button
        style={filterButtonStyle}
        onClick={handleWouldReturnClick}
      >
        Would Return
        <CheckIcon
          style={{
            marginLeft: '4px',
            visibility: wouldReturnFilter.enabled ? 'visible' : 'hidden',
          }}
        />
      </Button>
    </Box>
  );

  return (
    <>
      {renderFiltersRow()}
      {wouldReturnDropdownVisible && renderWouldReturnDropdown()}
    </>
  );

};

export default FiltersSettings;
