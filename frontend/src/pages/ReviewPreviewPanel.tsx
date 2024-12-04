import { Button, Typography } from '@mui/material';
import '../styles/multiPanelStyles.css';
import { ReviewData, WouldReturn } from '../types';
import { formatDateToMMDDYYYY } from '../utilities';
import { useState } from 'react';
import PulsingDots from '../components/PulsingDots';

interface ReviewPreviewPanelProps {
  reviewData: ReviewData;
  onSubmitReview: () => void;
}

const ReviewPreviewPanel: React.FC<ReviewPreviewPanelProps> = (props: ReviewPreviewPanelProps) => {

  const { reviewData, onSubmitReview } = props;

  console.log('ReviewPreviewPanel reviewData:', reviewData);

  const { place, wouldReturn, dateOfVisit, reviewText, itemReviews } = reviewData;

  const [isLoading, setIsLoading] = useState(false);

  const getReturnString = () => {
    if (wouldReturn === WouldReturn.Yes) return 'Yes';
    if (wouldReturn === WouldReturn.No) return 'No';
    if (wouldReturn === WouldReturn.NotSure) return 'Not sure';
    return 'Not specified';
  }

  const handleSubmit = async () => {
    // if (!freeformReviewProperties) return;
    try {
      setIsLoading(true);
      onSubmitReview();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderReviewPreview = () => {
    if (!place || !reviewText || reviewText === '') return (
      <div id="preview" className="tab-panel active">
        <h2>Review Preview</h2>
        <Typography>Not enough information to generate a preview.</Typography>
      </div>
    )
    else return (
      <div id="preview" className="tab-panel active">
        <h2>Review Preview</h2>
        <Typography><strong>Restaurant Name:</strong> {place.name || 'Not provided'}</Typography>
        <Typography><strong>Date of Visit:</strong> {formatDateToMMDDYYYY(dateOfVisit!) || 'Not provided'}</Typography>
        <Typography><strong>Would Return?</strong>{getReturnString()}</Typography>
        <Typography><strong>Review Text:</strong></Typography>
        <Typography>{reviewText}</Typography>
        <h3>Extracted Information</h3>
        <ul>
          {itemReviews.map((itemReview, idx) => (
            <li key={idx}>
              {itemReview.item} - {itemReview.review || 'No rating provided'}
            </li>
          ))}
        </ul>
        <Button onClick={handleSubmit}>Save Review</Button>

        {renderPulsingDots()}

      </div>
    );
  }

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) {
      return null;
    }
    return (<PulsingDots />);
  };


  return renderReviewPreview();
};

export default ReviewPreviewPanel;
