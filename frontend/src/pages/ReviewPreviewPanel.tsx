import { Typography } from '@mui/material';
import '../styles/multiPanelStyles.css';
import { FreeformReviewProperties, GooglePlace } from '../types';
import { formatDateToMMDDYYYY } from '../utilities';

interface ReviewPreviewPanelProps {
  place: GooglePlace;
  wouldReturn: boolean | null;
  dateOfVisit: string;
  reviewText: string;
  freeformReviewProperties: FreeformReviewProperties
}

const ReviewPreviewPanel: React.FC<ReviewPreviewPanelProps> = (props: ReviewPreviewPanelProps) => {

  const { place, wouldReturn, dateOfVisit, reviewText, freeformReviewProperties } = props;

  const getReturnString = () => {
    if (wouldReturn === true) return 'Yes';
    if (wouldReturn === false) return 'No';
    return 'Not specified';
  }
  return (
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
      <button>Save Review</button>
      <button>Edit Form</button>
      <button>Chat with ChatGPT</button>
    </div>
  );
};

export default ReviewPreviewPanel;
