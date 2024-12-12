import { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Switch, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';

import { SortCriteria } from '../../types';

import { SearchDistanceFilter, SearchUIFilters } from '../../types';
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

interface WouldReturnFilter {
  enabled: boolean;
  values: {
    yes: boolean;
    no: boolean;
    notSure: boolean;
  };
}

const initialDistanceAwayFilter: SearchDistanceFilter = SearchDistanceFilter.FiveMiles;
const initialIsOpenNowFilterEnabled: boolean = false;
const initialWouldReturnFilter: WouldReturnFilter = {
  enabled: false,
  values: {
    yes: false,
    no: false,
    notSure: false,
  },
};

interface SearchFiltersProps {
  onExecuteQuery: (query: string) => void;
  onExecuteFilter: (filter: SearchUIFilters) => void;
  onSetSortCriteria: (sortCriteria: SortCriteria) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = (props: SearchFiltersProps) => {

  const isMobile = useMediaQuery('(max-width:768px)');

  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [distanceAwayDropdownVisible, setDistanceAwayDropdownVisible] = useState(false);
  const [wouldReturnDropdownVisible, setWouldReturnDropdownVisible] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>(SortCriteria.Distance);

  const [distanceAwayFilter, setDistanceAwayFilter] = useState<number>(initialDistanceAwayFilter);
  const [wouldReturnFilter, setWouldReturnFilter] = useState<WouldReturnFilter>(initialWouldReturnFilter);
  const [isOpenNowFilterEnabled, setIsOpenNowFilterEnabled] = useState(initialIsOpenNowFilterEnabled);

  const [query, setQuery] = useState('');
  const [executedQuery, setExecutedQuery] = useState<string | null>(null); // Stores the executed query

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const distanceDropdownRef = useRef<HTMLDivElement | null>(null);
  const wouldReturnDropdownRef = useRef<HTMLDivElement | null>(null);

  const invokeExecuteFilter = (
    distanceAwayFilter: SearchDistanceFilter,
    openNowFilter: boolean,
    wouldReturnFilter: WouldReturnFilter) => {
    const filter: SearchUIFilters = {
      distanceAwayFilter,
      openNowFilter,
      wouldReturnFilter,
    };
    props.onExecuteFilter(filter);
  }

  const handleMoreFiltersIcon = () => {
    console.log('More Filters Icon Clicked');
  };

  const handleWouldReturnClick = () => {
    setWouldReturnDropdownVisible((prev) => !prev);
    setSortDropdownVisible(false);
    setDistanceAwayDropdownVisible(false);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortCriteria(e.target.value as SortCriteria);
    props.onSetSortCriteria(e.target.value as SortCriteria);
    setSortDropdownVisible(false);
  };

  const handleDistanceAwayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('handleDistanceAwayChange', e.target.value);
    console.log(e.target.value as unknown as SearchDistanceFilter);
    console.log(typeof (e.target.value));
    const distanceAwayFilter = Number(e.target.value as unknown as SearchDistanceFilter);
    setDistanceAwayFilter(distanceAwayFilter);
    setDistanceAwayDropdownVisible(false);
    invokeExecuteFilter(distanceAwayFilter, isOpenNowFilterEnabled, wouldReturnFilter);
  };

  const handleOpenNowClick = () => {
    setSortDropdownVisible(false);
    setDistanceAwayDropdownVisible(false);
    setWouldReturnDropdownVisible(false);
    const newOpenNowFilterEnabled = !isOpenNowFilterEnabled;
    setIsOpenNowFilterEnabled(newOpenNowFilterEnabled);
    invokeExecuteFilter(distanceAwayFilter, newOpenNowFilterEnabled, wouldReturnFilter);
  };

  const handleWouldReturnChange = (updatedValues: any) => {
    const values = { ...wouldReturnFilter.values, ...updatedValues };
    const newWouldReturnFilter = {
      ...wouldReturnFilter,
      values,
    };
    setWouldReturnFilter(newWouldReturnFilter);
    invokeExecuteFilter(distanceAwayFilter, isOpenNowFilterEnabled, newWouldReturnFilter);
  }

  const handleWouldReturnToggleEnabled = () => {
    const newWouldReturnFilter = {
      ...wouldReturnFilter,
      enabled: !wouldReturnFilter.enabled,
    };
    setWouldReturnFilter(newWouldReturnFilter);
    invokeExecuteFilter(distanceAwayFilter, isOpenNowFilterEnabled, newWouldReturnFilter);
  }

  const handleQueryExecute = () => {
    setExecutedQuery(query);
    props.onExecuteQuery(query);
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
    if (distanceDropdownRef.current && !distanceDropdownRef.current.contains(event.target as Node)) {
      setDistanceAwayDropdownVisible(false);
    }
    if (wouldReturnDropdownRef.current && !wouldReturnDropdownRef.current.contains(event.target as Node)) {
      setWouldReturnDropdownVisible(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setSortDropdownVisible(false);
      setDistanceAwayDropdownVisible(false);
      setWouldReturnDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (sortDropdownVisible || distanceAwayDropdownVisible || wouldReturnDropdownVisible) {
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
  }, [sortDropdownVisible, distanceAwayDropdownVisible, wouldReturnDropdownVisible]);

  const renderSortBy = (): JSX.Element => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: '#f8f8f8',
        border: '1px solid #ccc',
        borderRadius: '20px',
        width: isMobile ? '100%' : 'auto',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
        SORT BY:
      </Typography>
      <select
        value={sortCriteria}
        onChange={handleSortChange}
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
        <option value="distance">DISTANCE</option>
        <option value="name">NAME</option>
        <option value="most recent review">MOST RECENT REVIEW</option>
        <option value="reviewer">REVIEWER</option>
      </select>
    </Box>
  );

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
        DISTANCE AWAY:
      </Typography>
      <select
        value={distanceAwayFilter}
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
        <option value={SearchDistanceFilter.HalfMile}>HALF MILE</option>
        <option value={SearchDistanceFilter.OneMile}>1 MILE</option>
        <option value={SearchDistanceFilter.FiveMiles}>5 MILES</option>
        <option value={SearchDistanceFilter.TenMiles}>10 MILES</option>
        <option value={SearchDistanceFilter.AnyDistance}>ANY DISTANCE</option>
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
        <label style={{ color: wouldReturnFilter.enabled ? 'inherit' : '#aaa' }}>
          <input
            type="checkbox"
            checked={wouldReturnFilter.values.yes}
            disabled={!wouldReturnFilter.enabled}
            onChange={() =>
              handleWouldReturnChange({ yes: !wouldReturnFilter.values.yes })
            }
          />
          Yes
        </label>
      </Box>
      <Box>
        <label style={{ color: wouldReturnFilter.enabled ? 'inherit' : '#aaa' }}>
          <input
            type="checkbox"
            checked={wouldReturnFilter.values.no}
            disabled={!wouldReturnFilter.enabled}
            onChange={() =>
              handleWouldReturnChange({ no: !wouldReturnFilter.values.no })
            }
          />
          No
        </label>
      </Box>
      <Box>
        <label style={{ color: wouldReturnFilter.enabled ? 'inherit' : '#aaa' }}>
          <input
            type="checkbox"
            checked={wouldReturnFilter.values.notSure}
            disabled={!wouldReturnFilter.enabled}
            onChange={() =>
              handleWouldReturnChange({ notSure: !wouldReturnFilter.values.notSure })
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
            checked={wouldReturnFilter.enabled}
            onChange={() =>
              handleWouldReturnToggleEnabled()
            }
          />
        </Box>
        <Button onClick={() => setWouldReturnDropdownVisible(false)} variant="contained">
          Close
        </Button>
      </Box>
    </Box>
  );

  const renderQueryInput = (): JSX.Element => (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px', marginBottom: '12px' }}>
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
      {renderSortBy()}
      {renderDistanceAway()}
      <Button style={filterButtonStyle} onClick={handleOpenNowClick}>
        Open Now {isOpenNowFilterEnabled && <CheckIcon style={{ marginLeft: '4px' }} />}
      </Button>
      <Button
        style={filterButtonStyle}
        onClick={handleWouldReturnClick}
      >
        Would Return {wouldReturnFilter.enabled && <CheckIcon style={{ marginLeft: '4px' }} />}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ padding: '8px', overflowY: 'auto' }}>
      {/* Query Input */}
      {renderQueryInput()}

      {/* Row of Filter Buttons */}
      {renderFiltersRow()}
      {wouldReturnDropdownVisible && renderWouldReturnDropdown()}
    </Box>
  );
};

export default SearchFilters;
