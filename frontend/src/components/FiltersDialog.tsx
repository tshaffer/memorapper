import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useEffect, useState } from 'react';
import { Box, Button, Tooltip, useMediaQuery } from '@mui/material';

import FiltersSettings from "./FilterSettings";
import { Filters } from "../types";

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
  const [openFilterMode, setOpenFilterMode] = useState(props.filters.openFilterMode);
  const [openMeals, setOpenMeals] = useState(props.filters.openMeals);

  useEffect(() => {
    setDistanceAwayFilter(props.filters.distanceAwayFilter);
    setOpenFilterMode(props.filters.openFilterMode);
    setOpenMeals(props.filters.openMeals);
  }, [props.filters.distanceAwayFilter, props.filters.openFilterMode, props.filters.openMeals]);

  const handleUpdateFilters = (filters: Filters) => {
    console.log('handleUpdateFilters', filters);
    setDistanceAwayFilter(filters.distanceAwayFilter);
    setOpenFilterMode(filters.openFilterMode);
    setOpenMeals(filters.openMeals);
  }

  function handleSetFilters(): void {
    props.onSetFilters(query, { distanceAwayFilter, openFilterMode, openMeals });
    props.onClose();
  }

  const handleClose = () => {
    props.onClose();
  }

  console.log('FiltersDialog', props.filters);
  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>Filters</DialogTitle>
      <DialogContent style={{ paddingBottom: '0px' }}>
        <Box sx={{ padding: '8px', overflowY: 'auto' }}>
          <FiltersSettings
            filters={{
              distanceAwayFilter,
              openFilterMode,
              openMeals,
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
