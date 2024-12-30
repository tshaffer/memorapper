import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useEffect, useState } from 'react';
import { Box, Button, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';

import FiltersSettings from "./FilterSettings";
import { DistanceAwayFilter, Filters, WouldReturnFilter } from "../types";

const initialDistanceAwayFilter: DistanceAwayFilter = DistanceAwayFilter.FiveMiles;
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

  useEffect(() => {
    const initializeSettings = (): void => {
      const defaultFilters: string | null = localStorage.getItem('defaultFilters');
      if (defaultFilters) {
        const filters: Filters = JSON.parse(defaultFilters);
        setDistanceAwayFilter(filters.distanceAway);
        setIsOpenNowFilterEnabled(filters.isOpenNowEnabled);
        setWouldReturnFilter(filters.wouldReturnFilter);
      } else {
        setDistanceAwayFilter(initialDistanceAwayFilter);
        setIsOpenNowFilterEnabled(initialIsOpenNowFilterEnabled);
        setWouldReturnFilter(initialWouldReturnFilter);
      }
    }
    initializeSettings();

  }, []);

  const isMobile = useMediaQuery('(max-width:768px)');

  const [query, setQuery] = useState('');
  const [distanceAwayFilter, setDistanceAwayFilter] = useState<number>(initialDistanceAwayFilter);
  const [wouldReturnFilter, setWouldReturnFilter] = useState<WouldReturnFilter>(initialWouldReturnFilter);
  const [isOpenNowFilterEnabled, setIsOpenNowFilterEnabled] = useState(initialIsOpenNowFilterEnabled);

  const handleUpdateFilters = (filters: Filters) => {
    setDistanceAwayFilter(filters.distanceAway);
    setIsOpenNowFilterEnabled(filters.isOpenNowEnabled);
    setWouldReturnFilter(filters.wouldReturnFilter);
  }

  function handleSetFilters(): void {
    props.onSetFilters(query, distanceAwayFilter, isOpenNowFilterEnabled, wouldReturnFilter);
    props.onClose();
  }

  const handleClose = () => {
    props.onClose();
  }

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

  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>Filters</DialogTitle>
      <DialogContent style={{ paddingBottom: '0px' }}>
        <Box sx={{ padding: '8px', overflowY: 'auto' }}>
          {renderQueryInput()}
          <FiltersSettings
            filters={{
              distanceAway: distanceAwayFilter,
              wouldReturnFilter: wouldReturnFilter,
              isOpenNowEnabled: isOpenNowFilterEnabled,
            }}
            onUpdateFilters={handleUpdateFilters}
          />
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
