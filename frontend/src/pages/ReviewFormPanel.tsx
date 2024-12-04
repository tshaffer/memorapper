import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, useMediaQuery } from '@mui/material';
import RestaurantName from '../components/RestaurantName';
import '../styles/multiPanelStyles.css';
import { useEffect, useState } from 'react';
import { FreeformReviewProperties, GooglePlace, PreviewRequestBody, PreviewResponse, ReviewData, WouldReturn } from '../types';
import { getFormattedDate } from '../utilities';
import PulsingDots from '../components/PulsingDots';

type ChatMessage = {
  role: 'user' | 'ai';
  message: string | FreeformReviewProperties;
};

interface ReviewFormPanelProps {
  reviewData: ReviewData;
  setReviewData: React.Dispatch<React.SetStateAction<ReviewData>>;
  onSubmit: (formData: Omit<ReviewData, 'chatHistory'>) => void;

  // onSetGooglePlace: (googlePlace: GooglePlace) => any;
  // onSetReviewText: (reviewText: string) => any;
  // onSetWouldReturn: (wouldReturn: WouldReturn | null) => any;
  // onSetDateOfVisit: (dateOfVisit: string) => any;
  // onSetFreeformReviewProperties: (freeformReviewProperties: FreeformReviewProperties) => any;
  // onSetSessionId: (sessionId: string) => any;
  onReceivedPreviewResponse: () => any;
}

const ReviewFormPanel: React.FC<ReviewFormPanelProps> = (props: ReviewFormPanelProps) => {

  const { reviewData, setReviewData, onSubmit } = props;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [isLoading, setIsLoading] = useState(false);

  // const [reviewText, setReviewText] = useState('');
  // const [wouldReturn, setWouldReturn] = useState<WouldReturn | null>(null); // New state
  // const [dateOfVisit, setDateOfVisit] = useState('');

  // const [freeformReviewProperties, setFreeformReviewProperties] = useState<FreeformReviewProperties | null>(null);

  // const [sessionId, setSessionId] = useState<string | null>(null);
  // const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleChange = (field: keyof ReviewData, value: any) => {
    setReviewData((prev) => ({ ...prev, [field]: value }));
  };


  const generateSessionId = (): string => Math.random().toString(36).substring(2) + Date.now().toString(36);

  useEffect(() => {
    // setDateOfVisit(getFormattedDate());
    if (!reviewData.sessionId) {
      const newSessionId = generateSessionId();
      handleChange('sessionId', newSessionId);
    }
  }, [reviewData.sessionId]);

  const handlePreview = async () => {
    if (!reviewData.sessionId) return;
    try {
      setIsLoading(true);
      const previewBody: PreviewRequestBody = {
        reviewText: reviewData.reviewText!,
        sessionId: reviewData.sessionId!,
      };
      const response = await fetch('/api/reviews/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewBody),
      });
      const data: PreviewResponse = await response.json();
      handleChange('reviewText', data.freeformReviewProperties.reviewText);
      handleChange('itemReviews', data.freeformReviewProperties.itemReviews);
      handleChange('reviewer', data.freeformReviewProperties.reviewer);
      handleChange('chatHistory', [...reviewData.chatHistory, { role: 'user', message: reviewData.reviewText }, { role: 'ai', message: data.freeformReviewProperties }]);
      props.onReceivedPreviewResponse();
    } catch (error) {
      console.error('Error previewing review:', error);
    }
    setIsLoading(false);
  };

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) {
      return null;
    }
    return (<PulsingDots />);
  };

  return (

    <div
      id="form"
      className="tab-panel active"
      style={{
        maxHeight: isMobile ? 'calc(60vh)' : 'auto'
      }}
    >
      <form id='add-review-form'>
        <label htmlFor="restaurant-name">Restaurant Name (Required):</label>
        <RestaurantName
          reviewData={reviewData}
          setReviewData={setReviewData}
          onSetGooglePlace={(place) => handleChange('place', place)}
        />

        <label>Review Text (Required):</label>
        <TextField
          label="Review Text"
          fullWidth
          multiline
          rows={4}
          value={reviewData.reviewText}
          onChange={(e) => handleChange('reviewText', e.target.value)}
        />

        <TextField
          fullWidth
          type="date"
          value={reviewData.dateOfVisit}
          onChange={(e) => handleChange('dateOfVisit', e.target.value)}
          // placeholder="mm/dd/yyyy"
          label="Date of Visit"
        />

        <FormControl component="fieldset" style={{ marginTop: 20, width: '100%' }}>
          <FormLabel component="legend">Would Return</FormLabel>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <RadioGroup
              row
              name="would-return"
              value={reviewData.wouldReturn}
              onChange={(e) => handleChange('wouldReturn', e.target.value)}
            >
              <FormControlLabel value={WouldReturn.Yes} control={<Radio />} label="Yes" />
              <FormControlLabel value={WouldReturn.No} control={<Radio />} label="No" />
              <FormControlLabel value={WouldReturn.NotSure} control={<Radio />} label="Not Sure" />
            </RadioGroup>
            <Button onClick={() => handleChange('wouldReturn', null)} size="small">
              Clear
            </Button>
          </Box>
        </FormControl>

      </form>

      <Button onClick={handlePreview}>
        Preview
      </Button>

      {renderPulsingDots()}

    </div>

  );
};

export default ReviewFormPanel;
