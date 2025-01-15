import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, DistanceAwayFilterValues, Filters, Settings } from '../types';

interface UserContextValue {
  accounts: Account[];
  currentAccount: Account | null;
  setCurrentAccount: (account: Account | null) => void;

  settings: Settings; // Updated to use the new Settings structure
  setFilters: (filters: Filters) => void;
  setSettings: (settings: Settings) => void;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

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
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/accounts');
        if (!response.ok) {
          throw new Error('Failed to fetch accounts');
        }
        const data = await response.json();
        setAccounts(data.accounts as Account[]);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <UserContext.Provider
      value={{
        accounts,
        currentAccount,
        settings,
        setCurrentAccount,
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
