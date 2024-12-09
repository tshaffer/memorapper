import { Box, Button, IconButton, Switch, Tooltip, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import { useEffect, useRef, useState } from 'react';

const filterButtonStyle: React.CSSProperties = {
  padding: '8px 8px',
  background: '#f8f8f8',
  border: '1px solid #ccc',
  borderRadius: '20px',
  fontSize: '14px',
  cursor: 'pointer',
};

interface WouldReturnFilter {
  enabled: boolean;
  values: {
    yes: boolean;
    no: boolean;
    notSure: boolean;
  };
}

const initialWouldReturnFilter: WouldReturnFilter = {
  enabled: false,
  values: {
    yes: false,
    no: false,
    notSure: false,
  },
};

const SearchFilters = () => {
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [wouldReturnDropdownVisible, setWouldReturnDropdownVisible] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<'name' | 'distance' | 'reviewer' | 'most recent review'>('distance');
  const [isOpenNowSelected, setIsOpenNowSelected] = useState(false);
  const [wouldReturnFilters, setWouldReturnFilters] = useState<WouldReturnFilter>(initialWouldReturnFilter);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const wouldReturnDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleMoreFiltersIcon = () => {
    console.log('More Filters Icon Clicked');
  };

  const handleSortButtonClick = () => {
    setSortDropdownVisible((prev) => !prev);
    setWouldReturnDropdownVisible(false);
  };

  const handleOpenNowClick = () => {
    setIsOpenNowSelected((prev) => !prev);
  };

  const handleWouldReturnClick = () => {
    setWouldReturnDropdownVisible((prev) => !prev);
    setSortDropdownVisible(false);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortCriteria(e.target.value as 'name' | 'distance' | 'reviewer' | 'most recent review');
    setSortDropdownVisible(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setSortDropdownVisible(false);
    }
    if (wouldReturnDropdownRef.current && !wouldReturnDropdownRef.current.contains(event.target as Node)) {
      setWouldReturnDropdownVisible(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setSortDropdownVisible(false);
      setWouldReturnDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (sortDropdownVisible || wouldReturnDropdownVisible) {
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
  }, [sortDropdownVisible, wouldReturnDropdownVisible]);

  const renderSortDropdown = (): JSX.Element => (
    <Box
      ref={dropdownRef}
      sx={{
        position: 'relative',
        left: '48px',
        background: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        zIndex: 10,
        padding: '10px',
        display: 'flex',
        width: '280px',
        maxWidth: '90%',
      }}
    >
      <Typography variant="subtitle1">Sort by:</Typography>
      <select
        value={sortCriteria}
        onChange={handleSortChange}
        style={{
          marginLeft: '8px',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          width: '200px',
        }}
      >
        <option value="distance">Distance</option>
        <option value="name">Name</option>
        <option value="most recent review">Most Recent Review</option>
        <option value="reviewer">Reviewer</option>
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
        padding: '10px',
        width: '280px',
        maxWidth: '90%',
      }}
    >
      <Typography variant="subtitle1" sx={{ marginBottom: '8px' }}>
        Would Return
      </Typography>
      <Box>
        <label>
          <input
            type="checkbox"
            checked={wouldReturnFilters.values.yes}
            onChange={() =>
              setWouldReturnFilters((prev) => ({
                ...prev,
                values: { ...prev.values, yes: !prev.values.yes },
                enabled: !prev.values.yes || prev.values.no || prev.values.notSure,
              }))
            }
          />
          Yes
        </label>
      </Box>
      <Box>
        <label>
          <input
            type="checkbox"
            checked={wouldReturnFilters.values.no}
            onChange={() =>
              setWouldReturnFilters((prev) => ({
                ...prev,
                values: { ...prev.values, no: !prev.values.no },
                enabled: prev.values.yes || !prev.values.no || prev.values.notSure,
              }))
            }
          />
          No
        </label>
      </Box>
      <Box>
        <label>
          <input
            type="checkbox"
            checked={wouldReturnFilters.values.notSure}
            onChange={() =>
              setWouldReturnFilters((prev) => ({
                ...prev,
                values: { ...prev.values, notSure: !prev.values.notSure },
                enabled: prev.values.yes || prev.values.no || !prev.values.notSure,
              }))
            }
          />
          Not Sure
        </label>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <Box>
          <Typography variant="body2" sx={{ display: 'inline', marginRight: '8px' }}>
            Enable
          </Typography>
          <Switch
            checked={wouldReturnFilters.enabled}
            onChange={() =>
              setWouldReturnFilters((prev) => ({
                ...prev,
                enabled: !prev.enabled,
              }))
            }
          />
        </Box>
        <Button onClick={() => setWouldReturnDropdownVisible(false)} variant="contained">
          Close
        </Button>
      </Box>
    </Box>
  );

  return (
    <div style={{ paddingTop: '8px', paddingBottom: '4px', paddingLeft: '8px', paddingRight: '8px' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
        <Tooltip title="More Filters">
          <IconButton style={filterButtonStyle} onClick={handleMoreFiltersIcon}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
        <Button style={filterButtonStyle} onClick={handleSortButtonClick}>
          Sort: {sortCriteria} ▼
        </Button>
        <Button style={filterButtonStyle} onClick={handleOpenNowClick}>
          Open Now {isOpenNowSelected && <CheckIcon style={{ marginLeft: '4px' }} />}
        </Button>
        <Button
          style={filterButtonStyle}
          onClick={handleWouldReturnClick}
        >
          Would Return {wouldReturnFilters.enabled && <CheckIcon style={{ marginLeft: '4px' }} />}
        </Button>
      </div>
      {sortDropdownVisible && renderSortDropdown()}
      {wouldReturnDropdownVisible && renderWouldReturnDropdown()}
    </div>
  );
};

export default SearchFilters;
