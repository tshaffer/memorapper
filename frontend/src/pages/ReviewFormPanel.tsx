import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, useMediaQuery } from '@mui/material';
import RestaurantName from '../components/RestaurantName';
import '../styles/multiPanelStyles.css';
import { useEffect, useState } from 'react';
import { FreeformReviewProperties, GooglePlace, PreviewRequestBody, PreviewResponse, WouldReturn } from '../types';
import { getFormattedDate } from '../utilities';
import PulsingDots from '../components/PulsingDots';

type ChatMessage = {
  role: 'user' | 'ai';
  message: string | FreeformReviewProperties;
};

interface ReviewFormPanelProps {
  onSetGooglePlace: (googlePlace: GooglePlace) => any;
  onSetReviewText: (reviewText: string) => any;
  onSetWouldReturn: (wouldReturn: WouldReturn | null) => any;
  onSetDateOfVisit: (dateOfVisit: string) => any;
  onSetFreeformReviewProperties: (freeformReviewProperties: FreeformReviewProperties) => any;
  onSetSessionId: (sessionId: string) => any;
  onReceivedPreviewResponse: () => any;
}

const ReviewFormPanel: React.FC<ReviewFormPanelProps> = (props: ReviewFormPanelProps) => {

  const isMobile = useMediaQuery('(max-width:768px)');

  const [isLoading, setIsLoading] = useState(false);

  const [reviewText, setReviewText] = useState('');
  const [wouldReturn, setWouldReturn] = useState<WouldReturn | null>(null); // New state
  const [dateOfVisit, setDateOfVisit] = useState('');

  const [freeformReviewProperties, setFreeformReviewProperties] = useState<FreeformReviewProperties | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const generateSessionId = (): string => Math.random().toString(36).substring(2) + Date.now().toString(36);

  useEffect(() => {
    setDateOfVisit(getFormattedDate());
    if (!sessionId) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      props.onSetSessionId(newSessionId);
    }
  }, [sessionId]);

  const setTheReviewText = (reviewText: string) => {
    setReviewText(reviewText);
    props.onSetReviewText(reviewText);
  }

  const setTheDateOfVisit = (dateOfVisit: string) => {
    setDateOfVisit(dateOfVisit);
    props.onSetDateOfVisit(dateOfVisit);
  }

  const setTheFreeformReviewProperties = (freeformReviewProperties: FreeformReviewProperties) => {
    setFreeformReviewProperties(freeformReviewProperties);
    props.onSetFreeformReviewProperties(freeformReviewProperties);
  }

  const handleWouldReturnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWouldReturn(event.target.value as WouldReturn);
    props.onSetWouldReturn(event.target.value as WouldReturn);
  };

  const handlePreview = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      const previewBody: PreviewRequestBody = {
        reviewText,
        sessionId,
      };
      const response = await fetch('/api/reviews/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewBody),
      });
      const data: PreviewResponse = await response.json();
      setTheFreeformReviewProperties(data.freeformReviewProperties);
      setChatHistory([...chatHistory, { role: 'user', message: reviewText }, { role: 'ai', message: data.freeformReviewProperties }]);
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
          onSetGooglePlace={props.onSetGooglePlace}
        />

        <label>Review Text (Required):</label>
        <TextField
          style={{ marginTop: 20 }}
          fullWidth
          multiline
          rows={isMobile ? 5 : 8}
          label="Write Your Review"
          value={reviewText}
          onChange={(e) => setTheReviewText(e.target.value)}
          placeholder="Describe your dining experience in detail..."
          required
        />

        <TextField
          fullWidth
          type="date"
          value={dateOfVisit}
          onChange={(e) => setTheDateOfVisit(e.target.value)}
          // placeholder="mm/dd/yyyy"
          label="Date of Visit"
        />

        <FormControl component="fieldset" style={{ marginTop: 20, width: '100%' }}>
          <FormLabel component="legend">Would Return</FormLabel>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <RadioGroup
              row
              name="would-return"
              value={wouldReturn}
              onChange={handleWouldReturnChange}
            >
              <FormControlLabel value={WouldReturn.Yes} control={<Radio />} label="Yes" />
              <FormControlLabel value={WouldReturn.No} control={<Radio />} label="No" />
              <FormControlLabel value={WouldReturn.NotSure} control={<Radio />} label="Not Sure" />
            </RadioGroup>
            <Button onClick={() => setWouldReturn(null)} size="small">
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
