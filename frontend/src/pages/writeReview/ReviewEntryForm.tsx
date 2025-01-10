import { Box, Button, FormControl, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, Select, Slider, TextField, useMediaQuery } from '@mui/material';
import Rating from '@mui/material/Rating';

import RestaurantName from '../../components/RestaurantName';
import '../../styles/multiPanelStyles.css';
import '../../styles/reviewEntryForm.css';
import { useEffect, useState } from 'react';
import { Contributor, ContributorInput, RestaurantType, ReviewData, WouldReturn } from '../../types';
import PulsingDots from '../../components/PulsingDots';
import React from 'react';
import { useUserContext } from '../../contexts/UserContext';
import RatingsAndComments from '../../components/RatingsAndComments';

interface ReviewEntryFormProps {
  reviewData: ReviewData;
  setReviewData: React.Dispatch<React.SetStateAction<ReviewData>>;
  onSubmitPreview: (formData: Omit<ReviewData, 'chatHistory'>) => void;
  onReceivedPreviewResponse: () => any;
}

const ReviewEntryForm: React.FC<ReviewEntryFormProps> = (props: ReviewEntryFormProps) => {

  const { currentUser } = useUserContext();

  const { reviewData, setReviewData, onSubmitPreview } = props;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [contributorInputs, setContributorInputs] = useState<ContributorInput[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof ReviewData, value: any) => {
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

    const fetchContributors = async (): Promise<Contributor[]> => {
      const response = await fetch('/api/contributors');
      const data = await response.json();
      const allContributors: Contributor[] = data.contributors;
      const contributorsForCurrentUser = allContributors.filter((contributor) => contributor.userId === currentUser?.id);
      return contributorsForCurrentUser;
    }

    const fetchContributorInputs = async (): Promise<ContributorInput[]> => {
      const response = await fetch('/api/contributorInputs');
      const data = await response.json();
      return data.contributorInputs;
    }

    const fetchData = async () => {
      const contributors = await fetchContributors();
      setContributors(contributors);
      const contributorInputs = await fetchContributorInputs();
      setContributorInputs(contributorInputs);
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

  const handleContributorInputChange = (
    contributorId: string,
    field: 'rating' | 'comments',
    value: number | string
  ) => {
    console.log('handleContributorInputChange', contributorId, field, value);
    // setContributorInputs((prevInputs) =>
    //   prevInputs.map((input) =>
    //     input.contributorId === contributorId
    //       ? { ...input, [field]: value }
    //       : input
    //   )
    // );
  };

  const handleSave = () => {
    console.log('Saving contributor inputs:', contributorInputs);
    // Add your backend save logic here.
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

  const renderRatingsAndComments = (): JSX.Element => {
    return (
      <RatingsAndComments
        contributors={contributors}
        contributorInputs={contributorInputs}
        onContributorInputChange={handleContributorInputChange}
        onSave={handleSave}
      />
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
          {renderDateOfVisit()}
        </fieldset>

        <fieldset>
          <legend>Review</legend>
          {renderReviewText()}
        </fieldset>
        <fieldset>
          <legend>Ratings and Comments</legend>
          {renderRatingsAndComments()}
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

export default ReviewEntryForm;
