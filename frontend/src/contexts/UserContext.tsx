import React, { createContext, useContext, useState, useEffect } from 'react';
import { DistanceAwayFilterValues, Filters, UserEntity } from '../types';

interface UserContextValue {
  users: UserEntity[];
  currentUser: UserEntity | null;
  filters: Filters;
  setCurrentUser: (user: UserEntity | null) => void;
  setFilters: (filters: Filters) => void;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [currentUser, setCurrentUser] = useState<UserEntity | null>(null);

  const [filters, _setFilters] = useState<Filters>({
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
  });

  const setFilters = (newFilters: Filters) => {
    _setFilters(newFilters);
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
    <UserContext.Provider value={{ users, currentUser, setCurrentUser, filters, setFilters, loading, error }}>
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
