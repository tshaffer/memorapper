import { Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useEffect, useRef, useState } from 'react';
import { Box, Button, Switch, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { SearchDistanceFilter } from '../types';
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

export interface FiltersDialogPropsFromParent {
  open: boolean;
  onClose: () => void;
  onSetFilters: (
    query: string,
    distanceAway: number,
    isOpenNow: boolean,
    wouldReturn: WouldReturnFilter,
  ) => void;
}

export interface FiltersDialogProps extends FiltersDialogPropsFromParent {
}

const FiltersDialog: React.FC<FiltersDialogProps> = (props: FiltersDialogProps) => {

  const isMobile = useMediaQuery('(max-width:768px)');

  const [distanceAwayDropdownVisible, setDistanceAwayDropdownVisible] = useState(false);
  const [wouldReturnDropdownVisible, setWouldReturnDropdownVisible] = useState(false);

  const [distanceAwayFilter, setDistanceAwayFilter] = useState<number>(initialDistanceAwayFilter);
  const [wouldReturnFilter, setWouldReturnFilter] = useState<WouldReturnFilter>(initialWouldReturnFilter);
  const [isOpenNowFilterEnabled, setIsOpenNowFilterEnabled] = useState(initialIsOpenNowFilterEnabled);

  const [query, setQuery] = useState('');

  const distanceDropdownRef = useRef<HTMLDivElement | null>(null);
  const wouldReturnDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleWouldReturnClick = () => {
    setWouldReturnDropdownVisible((prev) => !prev);
    setDistanceAwayDropdownVisible(false);
  };

  const handleDistanceAwayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distanceAwayFilter = Number(e.target.value as unknown as SearchDistanceFilter);
    setDistanceAwayFilter(distanceAwayFilter);
    setDistanceAwayDropdownVisible(false);
  };

  const handleOpenNowClick = () => {
    setDistanceAwayDropdownVisible(false);
    setWouldReturnDropdownVisible(false);
    const newOpenNowFilterEnabled = !isOpenNowFilterEnabled;
    setIsOpenNowFilterEnabled(newOpenNowFilterEnabled);
  };

  const handleWouldReturnChange = (updatedValues: any) => {
    const values = { ...wouldReturnFilter.values, ...updatedValues };
    const newWouldReturnFilter = {
      ...wouldReturnFilter,
      values,
    };
    setWouldReturnFilter(newWouldReturnFilter);
  }

  const handleWouldReturnToggleEnabled = () => {
    const newWouldReturnFilter = {
      ...wouldReturnFilter,
      enabled: !wouldReturnFilter.enabled,
    };
    setWouldReturnFilter(newWouldReturnFilter);
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

  function handleSetFilters(): void {
    props.onSetFilters(query, distanceAwayFilter, isOpenNowFilterEnabled, wouldReturnFilter);
    props.onClose();
  }

  const handleClose = () => {
    setDistanceAwayDropdownVisible(false);
    setWouldReturnDropdownVisible(false);
    props.onClose();
  }

  const handleCloseWouldReturnDropdown = () => {
    setWouldReturnDropdownVisible(false);
  }

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

  const renderQueryInput = (): JSX.Element => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row', // Stack vertically on mobile, horizontally otherwise
        alignItems: 'center', // Align items vertically in the center for horizontal layout
        gap: '8px',
        marginBottom: '12px',
      }}
    >
      <Typography sx={{ minWidth: '60px' }}>Query:</Typography> {/* Label with consistent width */}
      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a query (optional)"
        fullWidth
        size="small"
        variant="outlined"
      />
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
            visibility: isOpenNowFilterEnabled ? 'visible' : 'hidden',
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
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>Filters</DialogTitle>
      <DialogContent style={{ paddingBottom: '0px' }}>
        <Box sx={{ padding: '8px', overflowY: 'auto' }}>
          {renderQueryInput()}
          {renderFiltersRow()}
          {wouldReturnDropdownVisible && renderWouldReturnDropdown()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Tooltip title="Press Enter to set the filters" arrow>
          <Button
            onClick={handleSetFilters}
            autoFocus
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default FiltersDialog;
