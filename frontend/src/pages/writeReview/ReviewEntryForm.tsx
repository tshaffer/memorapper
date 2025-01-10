import { Box, Button, FormControl, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, Select, Slider, TextField, useMediaQuery } from '@mui/material';
import Rating from '@mui/material/Rating';

import RestaurantName from '../../components/RestaurantName';
import '../../styles/multiPanelStyles.css';
import '../../styles/reviewEntryForm.css';
import { useEffect, useState } from 'react';
import { Contributor, ContributorInput, ContributorInputByContributor, RestaurantType, ReviewData, WouldReturn } from '../../types';
import PulsingDots from '../../components/PulsingDots';
import React from 'react';
import { useUserContext } from '../../contexts/UserContext';

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
  const [contributorInputByContributor, setContributorInputByContributor] = useState<ContributorInputByContributor>({});

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof ReviewData, value: any) => {
    setReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRestaurantTypeChange = (value: RestaurantType) => {
    setReviewData((prev) => ({ ...prev, place: { ...prev.place!, restaurantType: value } }));
  }

  const handleContributorInfoChange = (newContributorInputByContributor: ContributorInputByContributor) => {
    setReviewData((prev) => ({ ...prev, contributorInputByContributor: newContributorInputByContributor }));
  }

  const generateSessionId = (): string => Math.random().toString(36).substring(2) + Date.now().toString(36);

  function generateContributorInputByContributor(
    contributors: Contributor[],
    contributorInputs: ContributorInput[]
  ): ContributorInputByContributor {
    // Create a map of ContributorInputs by contributorId
    const result: ContributorInputByContributor = {};

    // Populate the result object
    contributorInputs.forEach(input => {
      if (contributors.some(contributor => contributor.id === input.contributorId)) {
        result[input.contributorId] = input;
      }
    });

    return result;
  }

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
      const contributorInputByContributor = generateContributorInputByContributor(contributors, contributorInputs);
      setContributorInputByContributor(contributorInputByContributor);
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
    input: Partial<ContributorInput>
  ) => {
    const newContributorInputByContributor = {
      ...contributorInputByContributor,
      [contributorId]: {
        ...contributorInputByContributor[contributorId],
        ...input,
      },
    };
    handleContributorInfoChange(newContributorInputByContributor);
    setContributorInputByContributor(newContributorInputByContributor);
  };
  
  const handlePreview = async () => {
    if (!reviewData.sessionId) return;
    try {
      setIsLoading(true);
      console.log('Submitting review data:', reviewData);
      // await onSubmitPreview(reviewData);
      // props.onReceivedPreviewResponse();
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
      <div className="ratings-and-comments">
        <fieldset className="ratings-comments-section">
          <legend>Ratings and Comments by Contributors</legend>
          {contributors.map((contributor) => {
            const input = contributorInputByContributor[contributor.id] || { rating: 0, comments: '' };
            return (
              <div key={contributor.id} className="contributor-section">
                <div className="contributor-header">
                  <h4>{contributor.name}</h4>
                </div>
                <div className="contributor-rating">
                  <label htmlFor={`rating-${contributor.id}`}>Rating</label>
                  <Rating
                    id={`rating-${contributor.id}`}
                    name={`rating-${contributor.id}`}
                    value={input.rating}
                    max={5}
                    onChange={(event, newValue) =>
                      handleContributorInputChange(contributor.id, { rating: (newValue || 0) })
                    }
                  />
                </div>
                <div className="contributor-comments">
                  <label htmlFor={`comments-${contributor.id}`}>Comments</label>
                  <TextField
                    id={`comments-${contributor.id}`}
                    name={`comments-${contributor.id}`}
                    fullWidth
                    multiline
                    rows={3}
                    value={input.comments}
                    onChange={(event) =>
                      handleContributorInputChange(contributor.id, { comments: event.target.value })
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
