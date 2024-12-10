import { Box, Button, IconButton, Switch, TextField, Tooltip, Typography } from '@mui/material';
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
  const [wouldReturnFilter, setWouldReturnFilter] = useState<WouldReturnFilter>(initialWouldReturnFilter);

  const [query, setQuery] = useState('');
  const [executedQuery, setExecutedQuery] = useState<string | null>(null); // Stores the executed query

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

  const handleQueryExecute = () => {
    setExecutedQuery(query);
    console.log('Executed Query:', query);
  };

  const handleQueryClear = () => {
    setQuery('');
    setExecutedQuery(null);
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

  return (
    <div style={{ paddingTop: '8px', paddingBottom: '4px', paddingLeft: '8px', paddingRight: '8px' }}>
      {/* Query Input */}
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a query (optional)"
          fullWidth
          size="small"
          variant="outlined"
        />
        <Button onClick={handleQueryExecute} variant="contained" disabled={!query}>
          Execute
        </Button>
        <Button onClick={handleQueryClear} variant="outlined" disabled={!query}>
          Clear
        </Button>
      </Box>

      {/* Row of Filter Buttons */}
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
          Would Return {wouldReturnFilter.enabled && <CheckIcon style={{ marginLeft: '4px' }} />}
        </Button>
      </div>
      {sortDropdownVisible && renderSortDropdown()}
      {wouldReturnDropdownVisible && (
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
          {/* Would Return Dropdown Content */}
          {/* Similar logic as above */}
        </Box>
      )}
    </div>
  );
};

export default SearchFilters;
