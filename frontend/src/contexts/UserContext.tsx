import React, { createContext, useContext, useState, useEffect } from 'react';
import { DistanceAwayFilterValues, Filters, RatingsUI, Settings, UserEntity } from '../types';

interface UserContextValue {
  users: UserEntity[];
  currentUser: UserEntity | null;
  settings: Settings; // Updated to use the new Settings structure
  setCurrentUser: (user: UserEntity | null) => void;
  setFilters: (filters: Filters) => void;
  setRatingsUI: (ratingsUI: RatingsUI) => void; // Function to update ratings UI
  setSettings: (settings: Settings) => void;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [currentUser, setCurrentUser] = useState<UserEntity | null>(null);

  const [settings, setSettingsState] = useState<Settings>({
    filters: {
      distanceAwayFilter: DistanceAwayFilterValues.AnyDistance,
      isOpenNowFilterEnabled: false,
      wouldReturnFilter: {
        enabled: false,
        values: {
          yes: false,
          no: false,
          notSure: false,
        },
      },
    },
    ratingsUI: {
      showSecondaryRating: false,
      primaryRatingLabel: 'Rating',
      secondaryRatingLabel: '',
    },
  });

  const setFilters = (newFilters: Filters) => {
    setSettingsState((prevSettings) => ({
      ...prevSettings,
      filters: newFilters,
    }));
  };

  const setRatingsUI = (newRatingsUI: RatingsUI) => {
    setSettingsState((prevSettings) => ({
      ...prevSettings,
      ratingsUI: newRatingsUI,
    }));
  };

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users as UserEntity[]);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        settings,
        setCurrentUser,
        setFilters,
        setRatingsUI,
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
