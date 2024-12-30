import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Box, Button, Tooltip } from '@mui/material';

import FiltersSettings from "./FilterSettings";
import { DistanceAwayFilter, Filters, WouldReturnFilter } from "../types";

const initialDistanceAwayFilter: DistanceAwayFilter = DistanceAwayFilter.FiveMiles;
const initialIsOpenNowFilterEnabled: boolean = false;
const initialWouldReturnFilter: WouldReturnFilter = {
  enabled: false,
  values: {
    yes: false,
    no: true,
    notSure: true,
  },
};

export interface SettingsDialogPropsFromParent {
  open: boolean;
  onClose: () => void;
  onSetSettings: (
    distanceAway: number,
    isOpenNow: boolean,
    wouldReturn: WouldReturnFilter,
  ) => void;
}

export interface SettingsDialogProps extends SettingsDialogPropsFromParent {
}

const SettingsDialog: React.FC<SettingsDialogProps> = (props: SettingsDialogProps) => {

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
  
  const [distanceAwayFilter, setDistanceAwayFilter] = useState<number>(initialDistanceAwayFilter);
  const [wouldReturnFilter, setWouldReturnFilter] = useState<WouldReturnFilter>(initialWouldReturnFilter);
  const [isOpenNowFilterEnabled, setIsOpenNowFilterEnabled] = useState(initialIsOpenNowFilterEnabled);
  
  const handleUpdateFilters = (filters: Filters) => {
    setDistanceAwayFilter(filters.distanceAway);
    setIsOpenNowFilterEnabled(filters.isOpenNowEnabled);
    setWouldReturnFilter(filters.wouldReturnFilter);
  }

  function handleSetSettings(): void {
    props.onSetSettings(distanceAwayFilter, isOpenNowFilterEnabled, wouldReturnFilter);
    props.onClose();
  }

  const handleClose = () => {
    props.onClose();
  }

  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>Filters</DialogTitle>
      <DialogContent style={{ paddingBottom: '0px' }}>
        <Box sx={{ padding: '8px', overflowY: 'auto' }}>
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
            onClick={handleSetSettings}
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

export default SettingsDialog;
