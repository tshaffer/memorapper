import React, { createContext, useContext, useState, useEffect } from 'react';
import { DiningGroup, DistanceAwayFilterValues, Filters, Settings } from '../types';

interface UserContextValue {
  diningGroups: DiningGroup[];
  currentDiningGroup: DiningGroup | null;
  setCurrentDiningGroup: (diningGroup: DiningGroup | null) => void;

  settings: Settings; // Updated to use the new Settings structure
  setFilters: (filters: Filters) => void;
  setSettings: (settings: Settings) => void;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [diningGroups, setDiningGroups] = useState<DiningGroup[]>([]);
  const [currentDiningGroup, setCurrentDiningGroup] = useState<DiningGroup | null>(null);

  const [settings, setSettingsState] = useState<Settings>({
    filters: {
      distanceAwayFilter: DistanceAwayFilterValues.AnyDistance,
      isOpenNowFilterEnabled: false,
    },
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
    const fetchDiningGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/diningGroups');
        if (!response.ok) {
          throw new Error('Failed to fetch dining groups');
        }
        const data = await response.json();
        setDiningGroups(data.diningGroups as DiningGroup[]);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchDiningGroups();
  }, []);

  return (
    <UserContext.Provider
      value={{
        diningGroups: diningGroups,
        currentDiningGroup: currentDiningGroup,
        settings,
        setCurrentDiningGroup: setCurrentDiningGroup,
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
