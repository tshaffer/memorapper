import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, useMediaQuery } from '@mui/material';
import RestaurantName from '../components/RestaurantName';
import '../styles/multiPanelStyles.css';
import { useEffect, useState } from 'react';
import { FreeformReviewProperties, GooglePlace, PreviewRequestBody, PreviewResponse } from '../types';
import { getFormattedDate } from '../utilities';

type ChatMessage = {
  role: 'user' | 'ai';
  message: string | FreeformReviewProperties;
};

interface ReviewFormPanelProps {
  onSetGooglePlace: (googlePlace: GooglePlace) => any;
  onSetReviewText: (reviewText: string) => any;
  onSetWouldReturn: (wouldReturn: boolean | null) => any;
  onSetDateOfVisit: (dateOfVisit: string) => any;
  onSetFreeformReviewProperties: (freeformReviewProperties: FreeformReviewProperties) => any;
  onSetSessionId: (sessionId: string) => any;
  onReceivedPreviewResponse: () => any;
}

const ReviewFormPanel: React.FC<ReviewFormPanelProps> = (props: ReviewFormPanelProps) => {

  const isMobile = useMediaQuery('(max-width:768px)');

  const [isLoading, setIsLoading] = useState(false);

  const [reviewText, setReviewText] = useState('');
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null); // New state
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
    const value = event.target.value === "yes" ? true : event.target.value === "no" ? false : null;
    setWouldReturn(value);
    props.onSetWouldReturn(value);
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

  return (

    <div id="form" className="tab-panel active">
      <form>
        <label htmlFor="restaurant-name">Restaurant Name (Required):</label>
        <RestaurantName
          onSetGooglePlace={props.onSetGooglePlace}
        />

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
              value={wouldReturn === true ? 'yes' : wouldReturn === false ? 'no' : ''}
              onChange={handleWouldReturnChange}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
            <Button onClick={() => setWouldReturn(null)} size="small">
              Clear
            </Button>
          </Box>
        </FormControl>

        <Button
          onClick={handlePreview}
        >
          Submit
        </Button>
      </form>
    </div>

  );
};

export default ReviewFormPanel;
