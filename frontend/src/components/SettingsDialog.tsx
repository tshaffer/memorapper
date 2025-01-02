import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Box, Button, Tooltip } from '@mui/material';

import FiltersSettings from "./FilterSettings";
import { Filters, WouldReturnFilter } from "../types";

export interface SettingsDialogPropsFromParent {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onSetSettings: (
    filters: Filters,
  ) => void;
}

export interface SettingsDialogProps extends SettingsDialogPropsFromParent {
}

const SettingsDialog: React.FC<SettingsDialogProps> = (props: SettingsDialogProps) => {

  const [distanceAwayFilter, setDistanceAwayFilter] = useState<number>(props.filters.distanceAwayFilter);
  const [wouldReturnFilter, setWouldReturnFilter] = useState<WouldReturnFilter>(props.filters.wouldReturnFilter);
  const [isOpenNowFilterEnabled, setIsOpenNowFilterEnabled] = useState(props.filters.isOpenNowFilterEnabled);

  const handleUpdateFilters = (filters: Filters) => {
    setDistanceAwayFilter(filters.distanceAwayFilter);
    setIsOpenNowFilterEnabled(filters.isOpenNowFilterEnabled);
    setWouldReturnFilter(filters.wouldReturnFilter);
  }

  function handleSetSettings(): void {
    props.onSetSettings({ distanceAwayFilter, isOpenNowFilterEnabled, wouldReturnFilter });
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
              distanceAwayFilter,
              wouldReturnFilter,
              isOpenNowFilterEnabled,
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
