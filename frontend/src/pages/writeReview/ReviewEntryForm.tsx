import { v4 as uuidv4 } from 'uuid';

import { Button, MenuItem, Select, TextField, useMediaQuery } from '@mui/material';
import Rating from '@mui/material/Rating';

import RestaurantName from '../../components/RestaurantName';
import '../../styles/multiPanelStyles.css';
import '../../styles/reviewEntryForm.css';
import { useEffect, useState } from 'react';
import {
  AccountUser,
  AccountUserInput,
  RestaurantType,
  NewReviewData,
} from '../../types';
import PulsingDots from '../../components/PulsingDots';
import React from 'react';
import { useUserContext } from '../../contexts/UserContext';

interface ReviewEntryFormProps {
  reviewData: NewReviewData;
  setReviewData: React.Dispatch<React.SetStateAction<NewReviewData>>;
  onSubmitPreview: (formData: Omit<NewReviewData, 'chatHistory'>) => void;
  onReceivedPreviewResponse: () => any;
}

const NewReviewEntryForm: React.FC<ReviewEntryFormProps> = (props: ReviewEntryFormProps) => {

  const { currentAccount } = useUserContext();
  // console.log('currentAccount:', currentAccount);

  const { reviewData, setReviewData, onSubmitPreview } = props;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [accountUsers, setAccountUsers] = useState<AccountUser[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof NewReviewData, value: any) => {
    setReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRestaurantTypeChange = (value: RestaurantType) => {
    setReviewData((prev) => ({ ...prev, place: { ...prev.place!, restaurantType: value } }));
  }

  const generateSessionId = (): string => Math.random().toString(36).substring(2) + Date.now().toString(36);

  useEffect(() => {
    if (!reviewData.sessionId) {
      const newSessionId = generateSessionId();
      handleChange('sessionId', newSessionId);
    }
  }, [reviewData.sessionId]);

  useEffect(() => {

    const fetchAccountUsers = async (): Promise<AccountUser[]> => {
      const response = await fetch('/api/accountUsers');
      const data = await response.json();
      const allAccountUsers: AccountUser[] = data.accountUsers;
      const accountUsersForCurrentAccount: AccountUser[] = allAccountUsers.filter((accountUser) => accountUser.accountId === currentAccount?.accountId);
      return accountUsersForCurrentAccount;
    }

    const fetchData = async () => {
      const accountUsers = await fetchAccountUsers();
      setAccountUsers(accountUsers);
    };

    fetchData();

  }, []);


  const restaurantTypeOptions = Object.keys(RestaurantType)
    .filter((key) => isNaN(Number(key)))
    .map((label) => ({
      label, // The human-readable label
      value: RestaurantType[label as keyof typeof RestaurantType], // The corresponding numeric value
    }));

  const handleSetRestaurantName = (name: string) => {
    setReviewData((prev) => ({ ...prev, restaurantName: name }));
  }

  const handleAccountUserInputChange = (
    accountUserId: string,
    input: Partial<AccountUserInput>
  ) => {
    console.log('accountUserId:', accountUserId);
    console.log('input:', input);

    let matchedAccountUserInput: AccountUserInput | null = null;
    for (const accountUserInput of reviewData.accountUserInputs) {
      if (accountUserInput.accountUserId === accountUserId) {
        matchedAccountUserInput = accountUserInput;
        break;
      }
    }
    if (!matchedAccountUserInput) {
      const newAccountUserInput: AccountUserInput = {
        accountUserInputId: uuidv4(),
        accountUserId,
        rating: input.rating ?? 0,
        comments: input.comments ?? '',
      };
      const newAccountUserInputs = [...reviewData.accountUserInputs, newAccountUserInput];
      console.log('newAccountUserInputs:', newAccountUserInputs);
      const newReviewData = { ...reviewData, accountUserInputs: newAccountUserInputs };
      setReviewData(newReviewData);
      return;
    } else {
      const updatedAccountUserInput = {
        ...matchedAccountUserInput,
        ...input,
      };
      console.log('updatedAccountUserInput:', updatedAccountUserInput);
      const newAccountUserInputs = reviewData.accountUserInputs.map((accountUserInput) => {
        if (accountUserInput.accountUserId === accountUserId) {
          return updatedAccountUserInput;
        }
        return accountUserInput;
      });
      console.log('newAccountUserInputs:', newAccountUserInputs);
      const newReviewData = { ...reviewData, accountUserInputs: newAccountUserInputs };
      setReviewData(newReviewData);
    }

  };

  const handlePreview = async () => {
    if (!reviewData.sessionId) return;
    try {
      setIsLoading(true);
      await onSubmitPreview(reviewData);
      props.onReceivedPreviewResponse();
    } catch (error) {
      console.error('Error previewing review:', error);
    }
    setIsLoading(false);
  };

  const renderRestaurantName = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="restaurant-name">Restaurant Name</label>
      <RestaurantName
        restaurantName={reviewData.restaurantName}
        onSetRestaurantName={handleSetRestaurantName}
        onSetGooglePlace={(place) => handleChange('place', place)}
      />
    </div>
  );

  const renderRestaurantType = (): JSX.Element => {
    const value = reviewData?.place?.restaurantType || RestaurantType.Restaurant;
    return (
      <div className="form-group">
        <label htmlFor="restaurant-type">Restaurant Type</label>
        <Select
          id="restaurant-type"
          value={value}
          onChange={(event) => handleRestaurantTypeChange(Number(event.target.value) as RestaurantType)}
        >
          {restaurantTypeOptions.map(({ label, value }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </div>
    );
  };

  const renderDateOfVisit = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="date-of-visit">Date of Visit</label>
      <TextField
        id="date-of-visit"
        type="date"
        fullWidth
        value={reviewData.dateOfVisit}
        onChange={(e) => handleChange('dateOfVisit', e.target.value)}
      />
    </div>
  );

  const renderReviewText = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="review-text">Review Text</label>
      <TextField
        id="review-text"
        fullWidth
        multiline
        rows={4}
        value={reviewData.reviewText}
        onChange={(e) => handleChange('reviewText', e.target.value)}
      />
    </div>
  );

  const getAccountUserInput = (accountUserId: string): AccountUserInput | null => {
    if (!reviewData || !reviewData.accountUserInputs) return null;

    for (const accountUserInput of reviewData.accountUserInputs) {
      if (accountUserInput.accountUserId === accountUserId) {
        return accountUserInput;
      }
    }
    return null;
  }

  const renderRatingsAndComments = (): JSX.Element => {
    return (
      <div className="ratings-and-comments">
        <fieldset className="ratings-comments-section">
          <legend>Ratings and Comments by Users</legend>
          {accountUsers.map((accountUser) => {
            const input: AccountUserInput = getAccountUserInput(accountUser.accountUserId) || {
              accountUserInputId: uuidv4(),
              accountUserId: accountUser.accountUserId,
              rating: 0,
              comments: '',
            };
            return (
              <div key={accountUser.accountUserId} className="contributor-section">
                <div className="contributor-header">
                  <h4>{accountUser.userName}</h4>
                </div>
                <div className="contributor-rating">
                  <label htmlFor={`rating-${accountUser.accountUserId}`}>Rating</label>
                  <Rating
                    id={`rating-${accountUser.accountUserId}`}
                    name={`rating-${accountUser.accountUserId}`}
                    value={input.rating}
                    max={5}
                    onChange={(event, newValue) =>
                      handleAccountUserInputChange(accountUser.accountUserId, { rating: (newValue || 0) })
                    }
                  />
                </div>
                <div className="contributor-comments">
                  <label htmlFor={`comments-${accountUser.accountUserId}`}>Comments</label>
                  <TextField
                    id={`comments-${accountUser.accountUserId}`}
                    name={`comments-${accountUser.accountUserId}`}
                    fullWidth
                    multiline
                    rows={3}
                    value={input.comments}
                    onChange={(event) =>
                      handleAccountUserInputChange(accountUser.accountUserId, { comments: event.target.value })
                    }
                  />
                </div>
              </div>
            );
          })}
        </fieldset>
      </div>
    );
  };

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) return null;
    return <PulsingDots />;
  };

  return (
    <div
      id="form"
      className="tab-panel active"
      style={{
        maxHeight: isMobile ? 'calc(60vh)' : '80vh', // Fixed height for desktop
        overflowY: 'auto', // Enable vertical scrolling
        padding: '1rem',   // Optional: Add some padding for better visuals
      }}
    >
      <form id="add-review-form">
        <fieldset>
          <legend>Restaurant Details</legend>
          {renderRestaurantName()}
          {renderRestaurantType()}
        </fieldset>

        <fieldset>
          <legend>Ratings and Comments</legend>
          {renderRatingsAndComments()}
        </fieldset>

        <fieldset>
          <legend>Review</legend>
          {renderReviewText()}
          {renderDateOfVisit()}
        </fieldset>
      </form>

      <div className="form-actions">
        <Button
          disabled={!reviewData.place || !reviewData.reviewText}
          onClick={handlePreview}
          variant="contained"
          color="primary"
        >
          Preview
        </Button>
      </div>

      {renderPulsingDots()}
    </div>
  );
};

export default NewReviewEntryForm;
