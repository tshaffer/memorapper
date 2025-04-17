import React, { createContext, useContext, useState, useEffect } from 'react';
import { DistanceAwayFilterValues, Filters, GooglePlace, OpenFilterMode, Place, PlaceTypeQuery, RestaurantType, RestaurantTypeQuery, Settings } from '../types';

interface UserContextValue {

  googlePlaces: GooglePlace[];
  setGooglePlaces: (googlePlaces: GooglePlace[]) => void;

  places: Place[];
  setPlaces: (places: Place[]) => void;

  settings: Settings; // Updated to use the new Settings structure
  setFilters: (filters: Filters) => void;
  setSettings: (settings: Settings) => void;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [googlePlaces, setGooglePlaces] = useState<GooglePlace[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);

  const [settings, setSettingsState] = useState<Settings>({
    filters: {
      distanceAwayFilter: DistanceAwayFilterValues.AnyDistance,
      openFilterMode: OpenFilterMode.Any,
      placeType: PlaceTypeQuery.Restaurant,
      restaurantType: RestaurantTypeQuery.Any,
      openMeals: {
        BREAKFAST: false,
        LUNCH: false,
        DINNER: false,
      },
    }
  });

  const setFilters = (newFilters: Filters) => {
    setSettingsState((prevSettings) => ({
      ...prevSettings,
      filters: newFilters,
    }));
  };

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchGooglePlaces = async () => {
      const response = await fetch('/api/googlePlaces');
      const data = await response.json();
      setGooglePlaces(data.googlePlaces);
    };

    const fetchPlaces = async () => {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data.places);
    };

    const fetchData = async () => {
      await fetchGooglePlaces();
      await fetchPlaces();
      setLoading(false);
    };

    fetchData();

  }, []);

  return (
    <UserContext.Provider
      value={{
        googlePlaces: googlePlaces,
        setGooglePlaces: setGooglePlaces,
        places: places,
        setPlaces: setPlaces,
        settings,
        setFilters,
        setSettings,
        loading,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
