import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, useMediaQuery } from '@mui/material';
import RestaurantName from '../components/RestaurantName';
import '../styles/multiPanelStyles.css';
import { useState } from 'react';

const ReviewFormPanel = () => {

  const isMobile = useMediaQuery('(max-width:768px)');

  const [reviewText, setReviewText] = useState('');
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null); // New state
  const [dateOfVisit, setDateOfVisit] = useState('');

  const handleWouldReturnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "yes" ? true : event.target.value === "no" ? false : null;
    setWouldReturn(value);
  };

  return (
    
    <div id="form" className="tab-panel active">
      <h2>Form</h2>
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

        <button type="submit">Submit</button>
      </form>
    </div>

  );
};

export default ReviewFormPanel;
