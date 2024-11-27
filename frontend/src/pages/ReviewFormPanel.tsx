import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, useMediaQuery } from '@mui/material';
import RestaurantName from '../components/RestaurantName';
import '../styles/multiPanelStyles.css';
import { useEffect, useState } from 'react';
import { FreeformReviewProperties, PreviewRequestBody, PreviewResponse } from '../types';

type ChatMessage = {
  role: 'user' | 'ai';
  message: string | FreeformReviewProperties;
};

const ReviewFormPanel = () => {

  const isMobile = useMediaQuery('(max-width:768px)');

  const [isLoading, setIsLoading] = useState(false);

  const [reviewText, setReviewText] = useState('');
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null); // New state
  const [dateOfVisit, setDateOfVisit] = useState('');

  const [freeformReviewProperties, setFreeformReviewProperties] = useState<FreeformReviewProperties | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const generateSessionId = (): string => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const formatDateToMMDDYYYY = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  const getFormattedDate = (): string => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setDateOfVisit(getFormattedDate());
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
  }, [sessionId]);

  const handleWouldReturnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "yes" ? true : event.target.value === "no" ? false : null;
    setWouldReturn(value);
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
      setFreeformReviewProperties(data.freeformReviewProperties);
      setChatHistory([...chatHistory, { role: 'user', message: reviewText }, { role: 'ai', message: data.freeformReviewProperties }]);
    } catch (error) {
      console.error('Error previewing review:', error);
    }
    setIsLoading(false);
  };

  return (

    <div id="form" className="tab-panel active">
      <form>
        <label htmlFor="restaurant-name">Restaurant Name (Required):</label>
        <RestaurantName />

        <TextField
          style={{ marginTop: 20 }}
          fullWidth
          multiline
          rows={isMobile ? 5 : 8}
          label="Write Your Review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Describe your dining experience in detail..."
          required
        />

        <TextField
          fullWidth
          type="date"
          value={dateOfVisit}
          onChange={(e) => setDateOfVisit(e.target.value)}
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
