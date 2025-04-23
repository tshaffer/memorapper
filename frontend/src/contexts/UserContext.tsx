import React, { createContext, useContext, useState, useEffect } from 'react';
import { Distance, Filters, RestaurantOpen, Place, PlaceWithGooglePlace, Settings, GooglePlace } from '../types';

interface UserContextValue {

  googlePlaces: GooglePlace[];
  setGooglePlaces: (googlePlaces: GooglePlace[]) => void;

  places: Place[];
  setPlaces: (places: Place[]) => void;

  placesWithGooglePlaces: PlaceWithGooglePlace[];
  setPlacesWithGooglePlaces: (placesWithGooglePlaces: PlaceWithGooglePlace[]) => void;

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
  const [placesWithGooglePlaces, setPlacesWithGooglePlaces] = useState<PlaceWithGooglePlace[]>([]);

  const [settings, setSettingsState] = useState<Settings>({
    filters: {
      distanceAway: Distance.AnyDistance,
      restaurantOpen: RestaurantOpen.OpenAnyTime,
      placeTypes: [],
      restaurantTypes: [],
      openMeals: {
        Breakfast: false,
        Lunch: false,
        Dinner: false,
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
      return data.googlePlaces;
    };

    const fetchPlaces = async () => {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data.places);
      return data.places;
    };

    const mergePlacesWithGooglePlaces = (places: Place[], googlePlaces: GooglePlace[]): PlaceWithGooglePlace[] => {
      const placesWithGooglePlaces = places.map((place) => {
        const googlePlace = googlePlaces.find((gPlace) => gPlace.googlePlaceId === place.googlePlaceId);
        const PlaceWithGooglePlace: PlaceWithGooglePlace = {
          ...place,
          googlePlace: googlePlace || undefined,
        };
        return PlaceWithGooglePlace;
      });
      setPlacesWithGooglePlaces(placesWithGooglePlaces);
      return placesWithGooglePlaces;
    };

    const fetchData = async () => {
      const googlePlaces: GooglePlace[] = await fetchGooglePlaces();
      const places: Place[] = await fetchPlaces();
      mergePlacesWithGooglePlaces(places, googlePlaces);
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
        placesWithGooglePlaces: placesWithGooglePlaces,
        setPlacesWithGooglePlaces: setPlacesWithGooglePlaces,
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
