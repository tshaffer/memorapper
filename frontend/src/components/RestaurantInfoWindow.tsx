import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import directionsIcon from '@iconify/icons-mdi/directions';
import { Account, AccountPlaceReview, AccountUser, AccountUserInput, AccountUserInterfaceRef, NewExtendedGooglePlace, UserPlaceSummary } from '../types';
import { InfoWindow } from '@vis.gl/react-google-maps';
import { getLatLngFromPlace, restaurantTypeLabelFromRestaurantType } from '../utilities';
import '../App.css';
import { Typography, useMediaQuery } from '@mui/material';
import Rating from '@mui/material/Rating';

interface RestaurantInfoWindowProps {
  location: NewExtendedGooglePlace;
  onClose: () => void;
}

const RestaurantInfoWindow: React.FC<RestaurantInfoWindowProps> = ({ location, onClose }) => {

  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigate();

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountUsers, setAccountUsers] = useState<AccountUser[]>([]);
  const [userPlaceSummaries, setUserPlaceSummaries] = useState<UserPlaceSummary[]>([]);
  const [accountUserInputs, setAccountUserInputs] = useState<AccountUserInput[]>([]);
  const [accountPlaceReviews, setAccountPlaceReviews] = useState<AccountPlaceReview[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting current location: ", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);


  useEffect(() => {
    if (!location) {
      return;
    }

    const { reviews, googlePlaceId, name, address_components, formatted_address, website, opening_hours, price_level, vicinity, restaurantType } = location;

    console.log('reviews:', reviews);

    const fetchAccounts = async (): Promise<Account[]> => {
      const response = await fetch('/api/accounts');
      const data = await response.json();
      setAccounts(data.accounts);
      return data.accounts;
    }

    const fetchAccountUsers = async (): Promise<AccountUser[]> => {
      const response = await fetch('/api/accountUsers');
      const data = await response.json();
      setAccountUsers(data.accountUsers);
      return data.accountUsers;
    }

    const fetchUserPlaceSummaries = async (): Promise<UserPlaceSummary[]> => {
      const response = await fetch('/api/userPlaceSummaries');
      const data = await response.json();
      setUserPlaceSummaries(data.userPlaceSummaries);
      return data.userPlaceSummaries;
    };

    const fetchAccountUserInputs = async (): Promise<AccountUserInput[]> => {
      const response = await fetch('/api/accountUserInputs');
      const data = await response.json();
      setAccountUserInputs(data.accountUserInputs);
      return data.accountUserInputs;
    };

    const fetchAccountPlaceReviews = async (): Promise<AccountPlaceReview[]> => {
      const response = await fetch('/api/accountPlaceReviews');
      const data = await response.json();
      setAccountPlaceReviews(data.accountPlaceReviews);
      return data.accountPlaceReviews;
    };

    const fetchData = async () => {
      await fetchAccounts();
      await fetchAccountUsers();
      await fetchUserPlaceSummaries();
      await fetchAccountUserInputs();
      await fetchAccountPlaceReviews();
    };

    fetchData();
  }, []);

  const getUserPlaceSummary = (): UserPlaceSummary | null => {
    for (const userPlaceSummary of userPlaceSummaries) {
      if (userPlaceSummary.placeId === location.googlePlaceId) {
        const accountId = userPlaceSummary.accountId;
        for (const account of accounts) {
          if (account.accountId === accountId) {
            return userPlaceSummary;
          }
        }
      }
    }
    return null;
  }

  const handleShowDirections = () => {
    if (location && currentLocation) {
      const destinationLocation: google.maps.LatLngLiteral = location.geometry!.location;
      const destinationLatLng: google.maps.LatLngLiteral = { lat: destinationLocation.lat, lng: destinationLocation.lng };
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destinationLatLng.lat},${destinationLatLng.lng}&destination_place_id=${location.name}`;
      window.open(url, '_blank');
    }
  };

  function handleRestaurantLinkClicked(): void {
    console.log('handleRestaurantLinkClicked');
    // const reviews: AccountPlaceReview[] = location.reviews;
    // navigate(`/restaurantDetails`, { state: { place: location, reviews } });
  }

  const renderAccountUserInput = (accountUserInputRef: AccountUserInterfaceRef): JSX.Element | null => {
    const accountUserId = accountUserInputRef.accountUserId;
    let matchedUserAccount: AccountUser | null = null;
    for (const account of accountUsers) {
      if (account.accountUserId === accountUserId) {
        matchedUserAccount = account;
        break;
      }
    }
    if (!matchedUserAccount) {
      return null;
    }
    const accountUserInputId = accountUserInputRef.accountUserInputId;
    for (const accountUserInput of accountUserInputs) {
      if (accountUserInput.accountUserInputId === accountUserInputId) {
        console.log('accountUserInput:');
        console.log(accountUserInput);
        return (
          <>
            <div>
              <label>{matchedUserAccount.userName}</label>
              <Rating
                value={accountUserInput.rating}
                max={5}
                readOnly
              />
            </div>
            <Typography variant="body2">{accountUserInput.comments}</Typography>
          </>
        )
      }
    }
    return null;
  }

  const renderUserPlaceSummary = (): JSX.Element[] | null => {
    const userPlaceSummary = getUserPlaceSummary();
    if (!userPlaceSummary) {
      return null;
    }
    const accountUserInputRefs: AccountUserInterfaceRef[] = userPlaceSummary.accountUserInputs;
    if (accountUserInputRefs.length === 0) {
      return null;
    }
    console.log('find accountUserInputs for this restaurant, account');
    const accountUserInputElements: JSX.Element[] = [];
    for (const accountUserInputRef of accountUserInputRefs) {
      const accountUserInputElement = renderAccountUserInput(accountUserInputRef);
      if (accountUserInputElement) {
        accountUserInputElements.push(accountUserInputElement);
      }
    }
    return accountUserInputElements;
  }

  return (
    <InfoWindow
      position={getLatLngFromPlace(location)}
      onCloseClick={onClose}
    >
      <div
        style={{
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          fontSize: '13px', // Matches .gm-style-iw
        }}
      >
        <style>
          {`
            .gm-style-iw-chr {
              margin-top: -8px;
              height: 30px;
            }
  
            .gm-style-iw {
              font-size: 13px;
            }
          `}
        </style>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px', // Space between the link and the icon
          }}
        >
          <h4
            style={{
              margin: '0',
              color: 'blue', // Typical link color
              textDecoration: 'underline', // Typical link underline
              cursor: 'pointer', // Indicate it's clickable
              fontWeight: 'bold', // Make the link more prominent
            }}
            onClick={() => handleRestaurantLinkClicked()}
          >
            {location.name}
          </h4>

          <div
            onClick={handleShowDirections}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px', // Size consistent with Google Maps icon buttons
              height: '36px',
              backgroundColor: '#fff', // White background
              borderRadius: '50%', // Circular button
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)', // Subtle shadow for depth
              cursor: 'pointer', // Indicate it's clickable
            }}
          >
            <Icon
              icon={directionsIcon}
              style={{
                fontSize: '20px', // Icon size
                color: '#4285F4', // Google Maps-like blue
              }}
            />
          </div>
        </div>
        <Typography variant="body2" style={{ margin: '0 0 8px 0' }}>
          {restaurantTypeLabelFromRestaurantType(location.restaurantType)}
        </Typography>
        {renderUserPlaceSummary()}
      </div>
    </InfoWindow>
  );
}

export default RestaurantInfoWindow;

