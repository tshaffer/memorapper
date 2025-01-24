import React, { createContext, useContext, useState, useEffect } from 'react';
import { Diner, DinerRestaurantReview, DiningGroup, DistanceAwayFilterValues, Filters, GooglePlace, NewRestaurant, ReviewedRestaurant, Settings, VisitReview } from '../types';

interface UserContextValue {
  diningGroups: DiningGroup[];

  diners: Diner[];
  setDiners: (diners: Diner[]) => void;

  places: GooglePlace[];
  setPlaces: (places: GooglePlace[]) => void;

  reviewedRestaurants: ReviewedRestaurant[];
  setReviewedRestaurants: (reviewedRestaurants: ReviewedRestaurant[]) => void;

  newRestaurants: NewRestaurant[];
  setNewRestaurants: (newRestaurants: NewRestaurant[]) => void;

  reviews: VisitReview[];
  setReviews: (reviews: VisitReview[]) => void;

  dinerRestaurantReviews: DinerRestaurantReview[];
  setDinerRestaurantReviews: (dinerRestaurantReviews: DinerRestaurantReview[]) => void;

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
  const [diners, setDiners] = useState<Diner[]>([]);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [reviewedRestaurants, setReviewedRestaurants] = useState<ReviewedRestaurant[]>([]);
  const [newRestaurants, setNewRestaurants] = useState<NewRestaurant[]>([]);
  const [reviews, setReviews] = useState<VisitReview[]>([]);
  const [dinerRestaurantReviews, setDinerRestaurantReviews] = useState<DinerRestaurantReview[]>([]);
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
      const response = await fetch('/api/diningGroups');
      const data = await response.json();
      setDiningGroups(data.diningGroups as DiningGroup[]);
    };

    const fetchDiners = async () => {
      const response = await fetch('/api/diners');
      const data = await response.json();
      setDiners(data.diners);
    }

    const fetchPlaces = async () => {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data.googlePlaces);
    };

    const fetchReviewedRestaurants = async () => {
      const response = await fetch('/api/reviewedRestaurants');
      const data = await response.json();
      setReviewedRestaurants(data.reviewedRestaurants);
    };

    const fetchNewRestaurants = async () => {
      const response = await fetch('/api/newRestaurants');
      const data = await response.json();
      setNewRestaurants(data.newRestaurants);
    };

    const fetchReviews = async () => {
      const response = await fetch('/api/visitReviews');
      const data = await response.json();
      setReviews(data.visitReviews);
    };

    const fetchDinerRestaurantReviews = async () => {
      const response = await fetch('/api/dinerRestaurantReviews');
      const data = await response.json();
      setDinerRestaurantReviews(data.dinerRestaurantReviews);
    };


    const fetchData = async () => {
      await fetchDiningGroups();
      await fetchDiners();
      await fetchPlaces();
      await fetchReviewedRestaurants();
      await fetchNewRestaurants();
      await fetchReviews();
      await fetchDinerRestaurantReviews();
      setLoading(false);
    };

    fetchData();

  }, []);

  return (
    <UserContext.Provider
      value={{
        diningGroups: diningGroups,
        diners: diners,
        setDiners: setDiners,
        places: places,
        setPlaces: setPlaces,
        reviewedRestaurants: reviewedRestaurants,
        setReviewedRestaurants: setReviewedRestaurants,
        newRestaurants: newRestaurants,
        setNewRestaurants: setNewRestaurants,
        reviews: reviews,
        setReviews: setReviews,
        dinerRestaurantReviews: dinerRestaurantReviews,
        setDinerRestaurantReviews: setDinerRestaurantReviews,
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
