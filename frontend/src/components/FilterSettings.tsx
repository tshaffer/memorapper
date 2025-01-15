import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useEffect, useRef, useState } from 'react';
import { Box, Button, Switch, Typography, useMediaQuery } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { DistanceAwayFilterValues, Filters } from "../types";
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
  const { distanceAwayFilter: distanceAway, isOpenNowFilterEnabled: isOpenNowEnabled } = filters;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [distanceAwayDropdownVisible, setDistanceAwayDropdownVisible] = useState(false);

  const distanceDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleDistanceAwayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistanceAway = Number(e.target.value);
    onUpdateFilters({ ...filters, distanceAwayFilter: newDistanceAway });
    setDistanceAwayDropdownVisible(false);
  };

  const handleOpenNowClick = () => {
    setDistanceAwayDropdownVisible(false);
    const newOpenNowFilterEnabled = !isOpenNowEnabled;
    onUpdateFilters({ ...filters, isOpenNowFilterEnabled: newOpenNowFilterEnabled });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (distanceDropdownRef.current && !distanceDropdownRef.current.contains(event.target as Node)) {
      setDistanceAwayDropdownVisible(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setDistanceAwayDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (distanceAwayDropdownVisible) {
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
  }, [distanceAwayDropdownVisible, ]);


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
        <option value={DistanceAwayFilterValues.HalfMile}>HALF MILE</option>
        <option value={DistanceAwayFilterValues.OneMile}>1 MILE</option>
        <option value={DistanceAwayFilterValues.FiveMiles}>5 MILES</option>
        <option value={DistanceAwayFilterValues.TenMiles}>10 MILES</option>
        <option value={DistanceAwayFilterValues.AnyDistance}>ANY DISTANCE</option>
      </select>
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
    </Box>
  );

  return (
    <>
      {renderFiltersRow()}
    </>
  );

};

export default FiltersSettings;
