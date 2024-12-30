import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, Typography } from '@mui/material';
import '../../styles/multiPanelStyles.css';
import { ReviewData, UserEntity, WouldReturn } from '../../types';
import { formatDateToMMDDYYYY, restaurantTypeLabelFromRestaurantType } from '../../utilities';
import PulsingDots from '../../components/PulsingDots';
import { useUserContext } from '../../contexts/UserContext';

interface PreviewTabProps {
  reviewData: ReviewData;
  onSubmitReview: () => void;
}

const PreviewTab: React.FC<PreviewTabProps> = (props: PreviewTabProps) => {

  const { users } = useUserContext();

  const { reviewData, onSubmitReview } = props;

  // console.log('ReviewPreviewPanel reviewData:', reviewData);

  const { place, wouldReturn, dateOfVisit, reviewerId, reviewText, itemReviews } = reviewData;

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const navigate = useNavigate();

  const getReturnString = () => {
    if (wouldReturn === WouldReturn.Yes) return 'Yes';
    if (wouldReturn === WouldReturn.No) return 'No';
    if (wouldReturn === WouldReturn.NotSure) return 'Not sure';
    return 'Not specified';
  }

  const reviewerFromReviewerId = (): string => {
    let reviewer: UserEntity | undefined = users.find((user) => user.id === reviewerId);
    return reviewer!.userName;
  }

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false);
    navigate('/'); // Navigate to "/"
  };

  const handleSubmit = async () => {
    // if (!freeformReviewProperties) return;
    try {
      setIsLoading(true);
      await onSubmitReview();
      setIsConfirmationOpen(true);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfirmationDialog = () => {
    return (
      <Dialog open={isConfirmationOpen} onClose={handleConfirmationClose}>
        <DialogTitle>Save Successful</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your review has been saved successfully.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const renderReviewPreview = () => {

    if (!place || !reviewText || reviewText === '') return (
      <div id="preview" className="tab-panel active">
        <h2>Review Preview</h2>
        <Typography>Not enough information to generate a preview.</Typography>
        {renderConfirmationDialog()}
      </div>
    )
    else return (
      <>
        <div
          id="preview"
          className="tab-panel active"
          style={{
            marginLeft: '8px',
          }}
        >
          <h2
            style={{
              marginBottom: '4px',
            }}
          >
            Review Preview
          </h2>
          <Typography><strong>Restaurant Name:</strong> {place.name || 'Not provided'}</Typography>
          <Typography><strong>Restaurant Type:</strong> {restaurantTypeLabelFromRestaurantType(place.restaurantType)}</Typography>
          <Typography><strong>Reviewer:</strong> {reviewerFromReviewerId()}</Typography>
          <Typography><strong>Date of Visit:</strong> {formatDateToMMDDYYYY(dateOfVisit!) || 'Not provided'}</Typography>
          <Typography><strong>Would Return?</strong> {getReturnString()}</Typography>
          <Typography><strong>Review Text:</strong></Typography>
          <Typography>{reviewText}</Typography>
          <h3
            style={{
              marginBottom: '4px',
            }}
          >
            Items Ordered
          </h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {itemReviews.map((itemReview, idx) => (
              <li key={idx} style={{ marginLeft: '8px' }}>
                {itemReview.item}
                {itemReview.review ? ` - ${itemReview.review}` : ''}
              </li>
            ))}
          </ul>
          {renderPulsingDots()}
          {renderConfirmationDialog()}
        </div>
        <Button
          onClick={handleSubmit}
          style={{
            marginTop: '16px',
            marginLeft: '7px',
          }}
          variant="outlined"
        >
          Save Review
        </Button>
      </>
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

export default PreviewTab;
