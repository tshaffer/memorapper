import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useEffect, useState } from 'react';
import { Box, Button, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';

import FiltersSettings from "./FilterSettings";
import { Filters, WouldReturnFilter } from "../types";

export interface FiltersDialogPropsFromParent {
  open: boolean;
  filters: Filters;
  onClose: () => void;
  onSetFilters: (
    query: string,
    filters: Filters,
  ) => void;
}

export interface FiltersDialogProps extends FiltersDialogPropsFromParent {
  filters: Filters;
}

const FiltersDialog: React.FC<FiltersDialogProps> = (props: FiltersDialogProps) => {

  const isMobile = useMediaQuery('(max-width:768px)');

  const [query, setQuery] = useState('');
  const [distanceAwayFilter, setDistanceAwayFilter] = useState<number>(props.filters.distanceAwayFilter);
  const [wouldReturnFilter, setWouldReturnFilter] = useState<WouldReturnFilter>(props.filters.wouldReturnFilter);
  const [isOpenNowFilterEnabled, setIsOpenNowFilterEnabled] = useState(props.filters.isOpenNowFilterEnabled);

  useEffect(() => {
    setDistanceAwayFilter(props.filters.distanceAwayFilter);
    setWouldReturnFilter(props.filters.wouldReturnFilter);
    setIsOpenNowFilterEnabled(props.filters.isOpenNowFilterEnabled);
  }, [props.filters.distanceAwayFilter, props.filters.wouldReturnFilter, props.filters.isOpenNowFilterEnabled]);

  const handleUpdateFilters = (filters: Filters) => {
    setDistanceAwayFilter(filters.distanceAwayFilter);
    setIsOpenNowFilterEnabled(filters.isOpenNowFilterEnabled);
    setWouldReturnFilter(filters.wouldReturnFilter);
  }

  function handleSetFilters(): void {
    props.onSetFilters(query, { distanceAwayFilter, isOpenNowFilterEnabled, wouldReturnFilter });
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
              distanceAwayFilter: distanceAwayFilter,
              wouldReturnFilter: wouldReturnFilter,
              isOpenNowFilterEnabled: isOpenNowFilterEnabled,
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
