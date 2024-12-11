import { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Switch, TextField, Tooltip, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';

import { SortCriteria } from '../../types';

import { DistanceFilter, SearchDistanceFilter, SearchUIFilters } from '../../types';
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

  const handleDistanceClick = () => {
    setSortDropdownVisible(false);
    setDistanceAwayDropdownVisible((prev) => !prev);
    setWouldReturnDropdownVisible(false);
  }

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
    console.log('handleWouldReturnChange, on entry wouldReturnFilter:', wouldReturnFilter);
    console.log('handleWouldReturnChange updatedValues: ', updatedValues);
    const values = { ...wouldReturnFilter.values, ...updatedValues };
    console.log('handleWouldReturnChange values: ', values);
    const newWouldReturnFilter = {
      ...wouldReturnFilter,
      values,
    };
    console.log('newWouldReturnFilter:', newWouldReturnFilter);
    setWouldReturnFilter(newWouldReturnFilter);
    console.log('handleWouldReturnChange, after update wouldReturnFilter:', wouldReturnFilter);
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

  const getDistanceAwayLabelFromDistanceAway = (distanceAway: SearchDistanceFilter): string => {
    switch (distanceAway) {
      case SearchDistanceFilter.HalfMile:
        return 'Half mile';
      case SearchDistanceFilter.OneMile:
        return '1 mile';
      case SearchDistanceFilter.FiveMiles:
        return '5 miles';
      case SearchDistanceFilter.TenMiles:
        return '10 miles';
      case SearchDistanceFilter.AnyDistance:
        return 'Any distance';
      default:
        return '5 miles';
    }
  }

  const renderDistanceDropdown = (): JSX.Element => (
    <Box
      ref={distanceDropdownRef}
      sx={{
        position: 'relative',
        left: '48px',
        background: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        zIndex: 10,
        padding: '10px',
        display: 'flex',
        width: '325px',
        maxWidth: '90%',
      }}
    >
      <Typography variant="subtitle1">Distance away:</Typography>
      <select
        value={distanceAwayFilter}
        onChange={handleDistanceAwayChange}
        style={{
          marginLeft: '8px',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          width: '200px',
        }}
      >
        <option value={SearchDistanceFilter.HalfMile}>Half mile</option>
        <option value={SearchDistanceFilter.OneMile}>1 mile</option>
        <option value={SearchDistanceFilter.FiveMiles}>5 miles</option>
        <option value={SearchDistanceFilter.TenMiles}>10 miles</option>
        <option value={SearchDistanceFilter.AnyDistance}>Any distance</option>
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


        <Button style={filterButtonStyle} onClick={handleDistanceClick}>
          Distance Away: {getDistanceAwayLabelFromDistanceAway(distanceAwayFilter)} ▼
        </Button>
        <Button style={filterButtonStyle} onClick={handleOpenNowClick}>
          Open Now {isOpenNowFilterEnabled && <CheckIcon style={{ marginLeft: '4px' }} />}
        </Button>
        <Button
          style={filterButtonStyle}
          onClick={handleWouldReturnClick}
        >
          Would Return {wouldReturnFilter.enabled && <CheckIcon style={{ marginLeft: '4px' }} />}
        </Button>
      </div>
      {distanceAwayDropdownVisible && renderDistanceDropdown()}
      {wouldReturnDropdownVisible && renderWouldReturnDropdown()}
    </div>
  );
};

export default SearchFilters;
