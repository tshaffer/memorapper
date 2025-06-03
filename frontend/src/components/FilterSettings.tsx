import { Box, Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, Checkbox, useMediaQuery, InputLabel, Select, MenuItem, SelectChangeEvent, FormGroup } from '@mui/material';
import { Distance, Filters, MealType, RestaurantOpen, PlaceType, RestaurantType } from "../types";
import { useState } from 'react';

export interface FiltersSettingsProps {
  filters: Filters;
  onUpdateFilters: (filters: Filters) => void;
}

const FiltersSettings: React.FC<FiltersSettingsProps> = (props: FiltersSettingsProps) => {
  const { filters, onUpdateFilters } = props;
  // Destructure current filters; note that we now expect the filters to include an "openFilterMode"
  // and, if in "MEALS" mode, an "openMeals" object.
  const {
    distanceAway = Distance.AnyDistance,
    restaurantOpen = RestaurantOpen.OpenAnyTime,
    placeTypes = [],
    restaurantTypes = [],
    openMeals = { Breakfast: false, Lunch: false, Dinner: false }
  } = filters;

  const [selectedPlaceTypes, setSelectedPlaceTypes] = useState<PlaceType[]>([]);
  const [selectedRestaurantTypes, setSelectedRestaurantTypes] = useState<RestaurantType[]>([]);

  const PLACE_TYPE_OPTIONS: { label: string; value: PlaceType }[] = [
    { label: 'Restaurant', value: PlaceType.Restaurant },
    { label: 'Accommodations', value: PlaceType.Accommodations },
    { label: 'Other', value: PlaceType.Destination },
    { label: 'Grocery Store', value: PlaceType.GroceryStore },
  ];

  const RESTAURANT_TYPE_OPTIONS: { label: string; value: RestaurantType }[] = [
    { label: 'Restaurant', value: RestaurantType.Restaurant },
    { label: 'Coffee Shop', value: RestaurantType.CoffeeShop },
    { label: 'Seafood', value: RestaurantType.Seafood },
    { label: 'Pizza', value: RestaurantType.PizzaPlace },
    { label: 'Bar', value: RestaurantType.Bar },
    { label: 'Bakery', value: RestaurantType.Bakery },
    { label: 'Taqueria', value: RestaurantType.Taqueria },
    { label: 'Italian', value: RestaurantType.ItalianRestaurant },
    { label: 'Ice Cream', value: RestaurantType.DessertShop },
  ];

  const isMobile = useMediaQuery('(max-width:768px)');

  // --- Distance Filter Handlers ---
  const handleDistanceAwayChange = (e: SelectChangeEvent<Distance>) => {
    const newDistanceAway = Number(e.target.value);
    onUpdateFilters({ ...filters, distanceAway: newDistanceAway });
  };

  // const handlePlaceTypeChange = (event: SelectChangeEvent<PlaceType>) => {
  //   const newPlaceType = event.target.value as PlaceType;
  //   onUpdateFilters({ ...filters, placeTypes: newPlaceType });
  // };

  // const handleRestaurantTypeChange = (event: SelectChangeEvent<RestaurantType>) => {
  //   const newRestaurantType = event.target.value as RestaurantType;
  //   onUpdateFilters({ ...filters, restaurantTypes: newRestaurantType });
  // };


  // --- Open Status Filter Handlers ---
  // Handle change in the radio group for open status.
  const handleRestaurantOpenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const restaurantOpen = event.target.value as RestaurantOpen;
    onUpdateFilters({ ...filters, restaurantOpen });
  };

  // Handle the toggling of specific meal checkboxes.
  const handleMealCheckboxChange = (meal: MealType) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedMeals = { ...openMeals, [meal]: event.target.checked };
    // When updating meal selections, set the mode to "MEALS" so that
    // the UI stays consistent with the user's intent.
    onUpdateFilters({ ...filters, restaurantOpen: RestaurantOpen.OpenByMeal, openMeals: updatedMeals });
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
        value={distanceAway}
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
        <MenuItem value={Distance.HalfMile}>HALF MILE</MenuItem>
        <MenuItem value={Distance.OneMile}>1 MILE</MenuItem>
        <MenuItem value={Distance.FiveMiles}>5 MILES</MenuItem>
        <MenuItem value={Distance.TenMiles}>10 MILES</MenuItem>
        <MenuItem value={Distance.AnyDistance}>ANY DISTANCE</MenuItem>
      </Select>
    </FormControl>
  );

  const handlePlaceTypeToggle = (placeType: PlaceType, isChecked: boolean) => {
    const updatedPlaceTypes = isChecked
      ? [...selectedPlaceTypes, placeType]
      : selectedPlaceTypes.filter((type) => type !== placeType);
    setSelectedPlaceTypes(updatedPlaceTypes);
    console.log('Updated place types:', updatedPlaceTypes);
    onUpdateFilters({ ...filters, placeTypes: updatedPlaceTypes });
  };

  const handleRestaurantTypeToggle = (restaurantType: RestaurantType, isChecked: boolean) => {
    const updatedRestaurantTypes = isChecked
      ? [...selectedRestaurantTypes, restaurantType]
      : selectedRestaurantTypes.filter((type) => type !== restaurantType);
    setSelectedRestaurantTypes(updatedRestaurantTypes);
    console.log('Updated restaurant types:', updatedRestaurantTypes);
    onUpdateFilters({ ...filters, restaurantTypes: updatedRestaurantTypes });
  };

  const renderPlaceType = (): JSX.Element => {
    return (
      <FormControl
        component="fieldset"
        style={{ marginBottom: '1rem', flexBasis: '100%' }}
      >
        <FormLabel component="legend" style={{ marginBottom: 8 }}>
          Place Type:
        </FormLabel>
        <FormGroup row>
          {PLACE_TYPE_OPTIONS.map(({ label, value }) => (
            <FormControlLabel
              key={value}
              control={
                <Checkbox
                  checked={selectedPlaceTypes.includes(value)}
                  onChange={(e) =>
                    handlePlaceTypeToggle(value, e.target.checked)
                  }
                  name={label}
                />
              }
              label={label}
            />
          ))}
        </FormGroup>
      </FormControl>
    );
  };

  const renderRestaurantType = (): JSX.Element => {
    return (
      <FormControl
        component="fieldset"
        style={{ marginBottom: '1rem', flexBasis: '100%' }}
      >
        <FormLabel component="legend" style={{ marginBottom: 8 }}>
          Restaurant Type:
        </FormLabel>
        <FormGroup row>
          {RESTAURANT_TYPE_OPTIONS.map(({ label, value }) => (
            <FormControlLabel
              key={value}
              control={
                <Checkbox
                  checked={selectedRestaurantTypes.includes(value)}
                  onChange={(e) =>
                    handleRestaurantTypeToggle(value, e.target.checked)
                  }
                  name={label}
                />
              }
              label={label}
            />
          ))}
        </FormGroup>
      </FormControl>
    );
  };

  // Renders the open status radio group and, if applicable, the meal checkboxes.
  const renderOpenFilter = (): JSX.Element => (
    <FormControl component="fieldset">
      <FormLabel component="legend" sx={{ fontWeight: 500, fontSize: '14px', color: '#1976D2' }}>
        OPEN STATUS
      </FormLabel>
      <RadioGroup row value={openMeals} onChange={handleRestaurantOpenChange}>
        <FormControlLabel value={RestaurantOpen.OpenAnyTime} control={<Radio />} label="Not Specified" />
        <FormControlLabel value={RestaurantOpen.OpenNow} control={<Radio />} label="Open Now" />
        <FormControlLabel value={RestaurantOpen.OpenByMeal} control={<Radio />} label="Open at Meals" />
      </RadioGroup>
      {restaurantOpen === RestaurantOpen.OpenByMeal && (
        <Box sx={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={openMeals.Breakfast}
                onChange={handleMealCheckboxChange(MealType.Breakfast)}
              />
            }
            label="Breakfast"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={openMeals.Lunch}
                onChange={handleMealCheckboxChange(MealType.Lunch)}
              />
            }
            label="Lunch"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={openMeals.Dinner}
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
      {placeTypes.includes(PlaceType.Restaurant) && renderRestaurantType()}
      {placeTypes.includes(PlaceType.Restaurant) && renderOpenFilter()}
    </Box>
  );

  return <>{renderFiltersRow()}</>;
};

export default FiltersSettings;
