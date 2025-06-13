
import { Box, Button, Divider, Paper, Stack, TextField, useMediaQuery } from '@mui/material';
import Rating from '@mui/material/Rating';

import '../styles/multiPanelStyles.css';
import '../styles/reviewEntryForm.css';
import { useState } from 'react';
import {
  MrReviewData,
} from '../types';
import React from 'react';
import PulsingDots from '../components/PulsingDots';
import RestaurantRating from '../components/RestaurantRating';

interface MrReviewEntryProps {
  mrReviewData: MrReviewData;
  setMrReviewData: React.Dispatch<React.SetStateAction<MrReviewData>>;
  onSubmit: () => Promise<void>;
}

const MrReviewEntry: React.FC<MrReviewEntryProps> = (props: MrReviewEntryProps) => {

  const { mrReviewData, setMrReviewData, onSubmit } = props;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [isLoading, setIsLoading] = useState(false);

  const getDisabledStyle = (condition: boolean): React.CSSProperties => {
    return condition ? { opacity: 0.5, pointerEvents: 'none' } : {};
  };

  const handleChange = (field: keyof MrReviewData, value: any) => {
    setMrReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const renderOrderedItems = (): JSX.Element => {
    const items = mrReviewData.itemReviews || [];

    const handleItemChange = (index: number, field: 'itemName' | 'rating' | 'comments', value: any) => {
      const updatedItems = [...items];
      if (!updatedItems[index]) {
        updatedItems[index] = { itemName: '', rating: 0, comments: '' };
      }
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      handleChange('itemReviews', updatedItems);
    };

    const addNewItem = () => {
      const updatedItems = [...items, { itemName: '', rating: 0, comments: '' }];
      handleChange('itemReviews', updatedItems);
    };

    return (
      <div className="ordered-items-section">
        {items.map((item, index) => (
          <div key={index} className="ordered-item">
            <div className="form-group">
              <label htmlFor={`itemName-${index}`}>Item Name</label>
              <TextField
                id={`itemName-${index}`}
                value={item.itemName}
                fullWidth
                onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor={`itemRating-${index}`}>Rating (0-10)</label>
              <Rating
                id={`itemRating-${index}`}
                max={10}
                value={item.rating}
                onChange={(event, newValue) => handleItemChange(index, 'rating', newValue || 0)}
              />
            </div>
            <div className="form-group">
              <label htmlFor={`comments-${index}`}>Evaluation</label>
              <TextField
                id={`comments-${index}`}
                value={item.comments}
                fullWidth
                multiline
                rows={2}
                onChange={(e) => handleItemChange(index, 'comments', e.target.value)}
              />
            </div>
          </div>
        ))}
        <Button variant="outlined" onClick={addNewItem} sx={{ mt: 2 }}>
          Add Another Item
        </Button>
      </div>
    );
  };

  const renderDateOfVisit = (): JSX.Element => (
    <div className="form-group">
      <label htmlFor="date-of-visit">Date of Visit</label>
      <TextField
        id="date-of-visit"
        type="date"
        fullWidth
        value={mrReviewData.dateOfVisit}
        onChange={(e) => handleChange('dateOfVisit', e.target.value)}
      />
    </div>
  );

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) return null;
    return <PulsingDots />;
  };

  return (
    <>
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '1rem'
        }}
      >
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!mrReviewData?.place}
          style={getDisabledStyle(!mrReviewData?.place)}
        >
          {mrReviewData._id ? 'Save Changes' : 'Add Review'}
        </Button>
      </div >

      <Box
        sx={{
          height: '92vh',           // fill the viewport height
          overflowY: 'auto',         // enable vertical scrolling
        }}>

        <RestaurantRating
          mrReviewData={mrReviewData}
          setMrReviewData={setMrReviewData}
        />

        <Box sx={{ padding: 2 }}>
          <Paper elevation={1} sx={{ padding: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {renderOrderedItems()}
              {renderDateOfVisit()}
            </Stack>
          </Paper>
        </Box>
      </Box>

      {renderPulsingDots()}

    </>
  );
};

export default MrReviewEntry;
