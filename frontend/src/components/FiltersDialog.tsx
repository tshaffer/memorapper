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
  const [restaurantOpen, setRestaurantOpen] = useState(props.filters.restaurantOpen);
  const [openMeals, setOpenMeals] = useState(props.filters.openMeals);
  const [visitedStatus, setVisitedStatus] = useState(props.filters.visitedStatus);

  useEffect(() => {
    setDistanceAway(props.filters.distanceAway);
    setRestaurantOpen(props.filters.restaurantOpen);
    setPlaceTypes(props.filters.placeTypes);
    setRestaurantTypes(props.filters.restaurantTypes);
    setOpenMeals(props.filters.openMeals);
    setVisitedStatus(props.filters.visitedStatus);
  }, [props.filters.distanceAway, props.filters.restaurantOpen, props.filters.placeTypes, props.filters.restaurantTypes, props.filters.openMeals, props.filters.visitedStatus]);

  const handleUpdateFilters = (filters: Filters) => {
    setDistanceAway(filters.distanceAway);
    setRestaurantOpen(filters.restaurantOpen);
    setPlaceTypes(filters.placeTypes);
    setRestaurantTypes(filters.restaurantTypes);
    setOpenMeals(filters.openMeals);
    setVisitedStatus(filters.visitedStatus);
  }

  function handleSetFilters(): void {
    props.onSetFilters(query, { 
      distanceAway, 
      restaurantOpen: restaurantOpen, 
      placeTypes: placeTypes, 
      restaurantTypes: restaurantTypes, 
      openMeals: openMeals,
    visitedStatus: props.filters.visitedStatus });
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
              restaurantOpen,
              placeTypes,
              restaurantTypes,
              openMeals,
              visitedStatus,
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
