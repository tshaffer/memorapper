import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Button,
  Tooltip,
  Typography,
} from "@mui/material";

import FiltersSettings from "./FilterSettings";
import { Filters, Settings } from "../types";

export interface SettingsDialogPropsFromParent {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onSetSettings: (settings: Settings) => void;
}

export interface SettingsDialogProps extends SettingsDialogPropsFromParent {}

const SettingsDialog: React.FC<SettingsDialogProps> = (props: SettingsDialogProps) => {
  const [filters, setFilters] = useState<Filters>(props.settings.filters);

  const handleUpdateFilters = (updatedFilters: Filters) => {
    setFilters(updatedFilters);
  };

  const handleSetSettings = () => {
    const updatedSettings: Settings = {
      filters,
    };
    props.onSetSettings(updatedSettings);
    props.onClose();
  };

  const handleClose = () => {
    props.onClose();
  };

  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent style={{ paddingBottom: "0px" }}>
        <Box sx={{ padding: "8px", overflowY: "auto" }}>
          {/* Filter Settings Section */}
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <Typography variant="h6" component="div" gutterBottom>
              Filters
            </Typography>
            <FiltersSettings filters={filters} onUpdateFilters={handleUpdateFilters} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Tooltip title="Press Enter to save settings" arrow>
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
