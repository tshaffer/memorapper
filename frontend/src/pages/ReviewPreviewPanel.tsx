import { Button, Typography } from '@mui/material';
import '../styles/multiPanelStyles.css';
import { FreeformReviewProperties, GooglePlace, StructuredReviewProperties, SubmitReviewBody } from '../types';
import { formatDateToMMDDYYYY } from '../utilities';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

interface ReviewPreviewPanelProps {
  place: GooglePlace | null;
  reviewText: string;
  wouldReturn: boolean | null;
  dateOfVisit: string;
  freeformReviewProperties: FreeformReviewProperties;
  sessionId: string;
}

const ReviewPreviewPanel: React.FC<ReviewPreviewPanelProps> = (props: ReviewPreviewPanelProps) => {

  const { place, wouldReturn, dateOfVisit, reviewText, freeformReviewProperties, sessionId } = props;

  const { _id } = useParams<{ _id: string }>();

  const [isLoading, setIsLoading] = useState(false);

  const getReturnString = () => {
    if (wouldReturn === true) return 'Yes';
    if (wouldReturn === false) return 'No';
    return 'Not specified';
  }

  const handleSubmit = async () => {
    if (!freeformReviewProperties) return;
    try {
      setIsLoading(true);
      const structuredReviewProperties: StructuredReviewProperties = { dateOfVisit, wouldReturn };
      const submitBody: SubmitReviewBody = {
        _id,
        place,
        structuredReviewProperties,
        freeformReviewProperties,
        reviewText,
        sessionId,
      };
      console.log('submitBody:', submitBody);

      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submitBody,
        }),
      });
      const data = await response.json();
      console.log('Review submitted:', data);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
    setIsLoading(false);
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
        <Typography><strong>Date of Visit:</strong> {formatDateToMMDDYYYY(dateOfVisit) || 'Not provided'}</Typography>
        <Typography><strong>Would Return?</strong>{getReturnString()}</Typography>
        <Typography><strong>Review Text:</strong></Typography>
        <Typography>{reviewText}</Typography>
        <h3>Extracted Information</h3>
        <ul>
          {freeformReviewProperties.itemReviews.map((itemReview, idx) => (
            <li key={idx}>
              {itemReview.item} - {itemReview.review || 'No rating provided'}
            </li>
          ))}
        </ul>
        <Button onClick={handleSubmit}>Save Review</Button>
      </div>
    );
  }

  return renderReviewPreview();
};

export default ReviewPreviewPanel;
