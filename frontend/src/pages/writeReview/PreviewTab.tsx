import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, Typography } from '@mui/material';
import '../../styles/multiPanelStyles.css';
import { ReviewData, WouldReturn } from '../../types';
import { formatDateToMMDDYYYY } from '../../utilities';
import PulsingDots from '../../components/PulsingDots';

interface PreviewTabProps {
  reviewData: ReviewData;
  onSubmitReview: () => void;
}

const PreviewTab: React.FC<PreviewTabProps> = (props: PreviewTabProps) => {

  const { reviewData, onSubmitReview } = props;

  // console.log('ReviewPreviewPanel reviewData:', reviewData);

  const { place, wouldReturn, dateOfVisit, reviewText, itemReviews } = reviewData;

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const navigate = useNavigate();

  const getReturnString = () => {
    if (wouldReturn === WouldReturn.Yes) return 'Yes';
    if (wouldReturn === WouldReturn.No) return 'No';
    if (wouldReturn === WouldReturn.NotSure) return 'Not sure';
    return 'Not specified';
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

    // console.log('renderReviewPreview isLoading:', isLoading);

    if (!place || !reviewText || reviewText === '') return (
      <div id="preview" className="tab-panel active">
        <h2>Review Preview</h2>
        <Typography>Not enough information to generate a preview.</Typography>
        {renderConfirmationDialog()}
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
        {renderPulsingDots()}
        <Button onClick={handleSubmit}>Save Review</Button>
        {renderConfirmationDialog()}
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

export default PreviewTab;
