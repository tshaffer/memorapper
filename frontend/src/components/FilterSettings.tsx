import { Box, Typography, Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, Checkbox, useMediaQuery, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { DistanceAwayFilterValues, Filters, MealType, OpenFilterMode, Place, PlaceType, PlaceTypeQuery, RestaurantType, RestaurantTypeQuery } from "../types";

export interface FiltersSettingsProps {
  filters: Filters;
  onUpdateFilters: (filters: Filters) => void;
}

const FiltersSettings: React.FC<FiltersSettingsProps> = (props: FiltersSettingsProps) => {
  const { filters, onUpdateFilters } = props;
  // Destructure current filters; note that we now expect the filters to include an "openFilterMode"
  // and, if in "MEALS" mode, an "openMeals" object.
  const {
    distanceAwayFilter = DistanceAwayFilterValues.AnyDistance,
    openFilterMode = OpenFilterMode.Any,
    placeType = PlaceTypeQuery.Any,
    restaurantType = RestaurantTypeQuery.Any,
    openMeals = { BREAKFAST: false, LUNCH: false, DINNER: false }
  } = filters;

  const isMobile = useMediaQuery('(max-width:768px)');

  // --- Distance Filter Handlers ---
  const handleDistanceAwayChange = (e: SelectChangeEvent<DistanceAwayFilterValues>) => {
    const newDistanceAway = Number(e.target.value);
    onUpdateFilters({ ...filters, distanceAwayFilter: newDistanceAway });
  };

  const handlePlaceTypeChange = (event: SelectChangeEvent<PlaceTypeQuery>) => {
    const newPlaceType = event.target.value as PlaceTypeQuery;
    onUpdateFilters({ ...filters, placeType: newPlaceType });
  };

  const handleRestaurantTypeChange = (event: SelectChangeEvent<RestaurantTypeQuery>) => {
    const newRestaurantType = event.target.value as RestaurantTypeQuery;
    onUpdateFilters({ ...filters, restaurantType: newRestaurantType });
  };


  // --- Open Status Filter Handlers ---
  // Handle change in the radio group for open status.
  const handleOpenFilterModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value as OpenFilterMode;
    onUpdateFilters({ ...filters, openFilterMode: newMode });
  };

  // Handle the toggling of specific meal checkboxes.
  const handleMealCheckboxChange = (meal: MealType) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedMeals = { ...openMeals, [meal]: event.target.checked };
    // When updating meal selections, set the mode to "MEALS" so that
    // the UI stays consistent with the user's intent.
    onUpdateFilters({ ...filters, openFilterMode: OpenFilterMode.Meals, openMeals: updatedMeals });
  };

  // --- Rendering Sub-Components ---

  // Renders the distance selector with a separate label.
  const renderDistanceAway = (): JSX.Element => (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        // Pill shape styling:
        background: '#f8f8f8',
        border: '1px solid #ccc',
        borderRadius: '20px',
        // Make width flexible or set a minWidth:
        minWidth: isMobile ? 140 : 180,
      }}
    >
      <InputLabel
        id="distance-away-label"
        shrink // keeps the label from floating on select
        sx={{
          color: '#1976D2',
          fontWeight: 500,
          fontSize: '14px',
          mb: '6px',            // 6 pixels of space below the label
        }}
      >
        {isMobile ? 'DISTANCE' : 'DISTANCE AWAY'}
      </InputLabel>
      <Select
        labelId="distance-away-label"
        id="distance-away-select"
        notched
        label={isMobile ? 'DISTANCE' : 'DISTANCE AWAY'}
        value={distanceAwayFilter}
        onChange={handleDistanceAwayChange}
        sx={{
          color: '#1976D2',
          fontWeight: 500,
          fontSize: '14px',
          // Remove the standard 'outlined' border:
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          // Optionally remove focus outline if desired:
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        }}
      >
        <MenuItem value={DistanceAwayFilterValues.HalfMile}>HALF MILE</MenuItem>
        <MenuItem value={DistanceAwayFilterValues.OneMile}>1 MILE</MenuItem>
        <MenuItem value={DistanceAwayFilterValues.FiveMiles}>5 MILES</MenuItem>
        <MenuItem value={DistanceAwayFilterValues.TenMiles}>10 MILES</MenuItem>
        <MenuItem value={DistanceAwayFilterValues.AnyDistance}>ANY DISTANCE</MenuItem>
      </Select>
    </FormControl>
  );

  const renderPlaceType = (): JSX.Element => {
    return (
      <div style={{ marginBottom: '1rem', flexBasis: '100%' }}>
        <label>{'Place Type:'}</label>
        <Select
          labelId="place-type-select-label"
          value={placeType}
          onChange={handlePlaceTypeChange}
          fullWidth
        >
          <MenuItem value={PlaceTypeQuery.Any}>Any</MenuItem>
          <MenuItem value={PlaceTypeQuery.Restaurant}>Restaurant</MenuItem>
          <MenuItem value={PlaceTypeQuery.Destination}>Other</MenuItem>
          <MenuItem value={PlaceTypeQuery.GroceryStore}>Grocery Store</MenuItem>
        </Select>
      </div>
    );
  }

  const renderRestaurantType = (): JSX.Element | null => {
    return (
      <div style={{ marginBottom: '1rem', flexBasis: '100%' }}>
        <label>{'Restaurant Type:'}</label>
        <Select
          labelId="restaurant-type-select-label"
          value={restaurantType}
          onChange={handleRestaurantTypeChange}
          fullWidth
        >
          <MenuItem value={RestaurantTypeQuery.Any}>Any</MenuItem>
          <MenuItem value={RestaurantTypeQuery.Restaurant}>Restaurant</MenuItem>
          <MenuItem value={RestaurantTypeQuery.CoffeeShop}>Coffee Shop</MenuItem>
          <MenuItem value={RestaurantTypeQuery.Bar}>Bar</MenuItem>
          <MenuItem value={RestaurantTypeQuery.Bakery}>Bakery</MenuItem>
          <MenuItem value={RestaurantTypeQuery.Taqueria}>Taqueria</MenuItem>
          <MenuItem value={RestaurantTypeQuery.PizzaPlace}>Pizza</MenuItem>
          <MenuItem value={RestaurantTypeQuery.ItalianRestaurant}>Italian</MenuItem>
          <MenuItem value={RestaurantTypeQuery.DessertShop}>Dessert</MenuItem>
        </Select>
      </div>
    );
  };

  // Renders the open status radio group and, if applicable, the meal checkboxes.
  const renderOpenFilter = (): JSX.Element => (
    <FormControl component="fieldset">
      <FormLabel component="legend" sx={{ fontWeight: 500, fontSize: '14px', color: '#1976D2' }}>
        OPEN STATUS
      </FormLabel>
      <RadioGroup row value={openFilterMode} onChange={handleOpenFilterModeChange}>
        <FormControlLabel value={OpenFilterMode.Any} control={<Radio />} label="Not Specified" />
        <FormControlLabel value={OpenFilterMode.Now} control={<Radio />} label="Open Now" />
        <FormControlLabel value={OpenFilterMode.Meals} control={<Radio />} label="Open at Meals" />
      </RadioGroup>
      {openFilterMode === OpenFilterMode.Meals && (
        <Box sx={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={openMeals.BREAKFAST}
                onChange={handleMealCheckboxChange(MealType.Breakfast)}
              />
            }
            label="Breakfast"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={openMeals.LUNCH}
                onChange={handleMealCheckboxChange(MealType.Lunch)}
              />
            }
            label="Lunch"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={openMeals.DINNER}
                onChange={handleMealCheckboxChange(MealType.Dinner)}
              />
            }
            label="Dinner"
          />
        </Box>
      )}
    </FormControl>
  );

  // Combines the distance and open status filter UI components.
  const renderFiltersRow = (): JSX.Element => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: isMobile ? 'center' : 'flex-start',
        marginBottom: '12px',
        alignItems: 'center',
      }}
    >
      {renderDistanceAway()}
      {renderPlaceType()}
      {placeType === PlaceTypeQuery.Restaurant && renderRestaurantType()}
      {placeType === PlaceTypeQuery.Restaurant && renderOpenFilter()}
    </Box>
  );

  return <>{renderFiltersRow()}</>;
};

export default FiltersSettings;
