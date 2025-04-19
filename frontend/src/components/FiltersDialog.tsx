import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useEffect, useState } from 'react';
import { Box, Button, Tooltip, useMediaQuery } from '@mui/material';

import FiltersSettings from "./FilterSettings";
import { Filters, PlaceType, RestaurantType } from "../types";

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
  const [distanceAway, setDistanceAway] = useState<number>(props.filters.distanceAway);
  const [placeTypes, setPlaceTypes] = useState<PlaceType[]>(props.filters.placeTypes);
  const [restaurantTypes, setRestaurantTypes] = useState<RestaurantType[]>(props.filters.restaurantTypes);
  const [openFilterMode, setOpenFilterMode] = useState(props.filters.openFilterMode);
  const [openMeals, setOpenMeals] = useState(props.filters.openMealsFilter);

  useEffect(() => {
    setDistanceAway(props.filters.distanceAway);
    setOpenFilterMode(props.filters.openFilterMode);
    setPlaceTypes(props.filters.placeTypes);
    setRestaurantTypes(props.filters.restaurantTypes);
    setOpenMeals(props.filters.openMealsFilter);
  }, [props.filters.distanceAway, props.filters.openFilterMode, props.filters.placeTypes, props.filters.restaurantTypes, props.filters.openMealsFilter]);

  const handleUpdateFilters = (filters: Filters) => {
    setDistanceAway(filters.distanceAway);
    setOpenFilterMode(filters.openFilterMode);
    setPlaceTypes(filters.placeTypes);
    setRestaurantTypes(filters.restaurantTypes);
    setOpenMeals(filters.openMealsFilter);
  }

  function handleSetFilters(): void {
    props.onSetFilters(query, { distanceAway, openFilterMode, placeTypes: placeTypes, restaurantTypes: restaurantTypes, openMealsFilter: openMeals });
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
              distanceAway,
              openFilterMode,
              placeTypes: placeTypes,
              restaurantTypes: restaurantTypes,
              openMealsFilter: openMeals,
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
