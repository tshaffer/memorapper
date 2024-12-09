import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

const filterButtonStyle: React.CSSProperties = {
  padding: '8px 8px',
  background: '#f8f8f8',
  border: '1px solid #ccc',
  borderRadius: '20px',
  fontSize: '14px',
  cursor: 'pointer',
};


const SearchFilters = () => {

  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<'name' | 'distance' | 'reviewer' | 'recentReview'>('name');

  const handleMoreFiltersIcon = () => {
    console.log('More Filters Icon Clicked');
  };

  const handleSortButtonClick = () => {
    setSortDropdownVisible((prev) => !prev); // Toggle visibility of the dropdown
  };

  const renderSortDropdown = (): JSX.Element => {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: '40px',
          left: '0',
          background: '#fff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          zIndex: 10,
          padding: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Sort by:
        </Typography>
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value as 'name' | 'distance' | 'reviewer' | 'recentReview')}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '100%',
          }}
        >
          <option value="name">Place Name</option>
          <option value="distance">Distance</option>
          <option value="reviewer">Reviewer</option>
          <option value="recentReview">Most Recent Review</option>
        </select>
      </Box>
    );
  };

  return (
    <div style={{
      // padding: '8px',
      paddingTop: '8px',
      paddingBottom: '4px',
      paddingLeft: '8px',
      paddingRight: '8px',
    }}>
      {/* Row of Filter Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <Tooltip title="More Filters">
          <IconButton
            style={filterButtonStyle}
            onClick={handleMoreFiltersIcon}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
        <Button
          style={{
            padding: '8px 16px',
            background: '#f8f8f8',
            border: '1px solid #ccc',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer',
            position: 'relative',
          }}
          onClick={handleSortButtonClick}
        >
          Sort ▼
        </Button>

        {sortDropdownVisible && renderSortDropdown()}

        <Button
          style={filterButtonStyle}
        >
          Open Now
        </Button>
        <Button
          style={filterButtonStyle}
        >
          Price
        </Button>
      </div>

    </div>
  );
};

export default SearchFilters;
