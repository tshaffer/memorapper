import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useEffect, useRef, useState } from 'react';

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
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleMoreFiltersIcon = () => {
    console.log('More Filters Icon Clicked');
  };

  const handleSortButtonClick = () => {
    setSortDropdownVisible((prev) => !prev); // Toggle visibility of the dropdown
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortCriteria(e.target.value as 'name' | 'distance' | 'reviewer' | 'recentReview');
    setSortDropdownVisible(false); // Close dropdown after selection
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setSortDropdownVisible(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setSortDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (sortDropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sortDropdownVisible]);

  const renderSortDropdown = (): JSX.Element => {
    return (
      <Box
        ref={dropdownRef}
        sx={{
          position: 'relative',
          // top: '-55px',
          left: '48px',
          background: '#fff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          zIndex: 10,
          padding: '10px',
          display: 'flex', // Prevents stretching to full width
          width: '200px', // Explicit width for the dropdown
          maxWidth: '90%', // Prevent it from exceeding the viewport on small screens
          // display: 'flex',
          // alignItems: 'center',
          // gap: 2,
        }}
      >
        <Typography variant="subtitle1">Sort by:</Typography>
        <select
          value={sortCriteria}
          onChange={handleSortChange}
          style={{
            marginLeft: '8px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '120px',
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
          style={filterButtonStyle}
          onClick={handleSortButtonClick}
        >
          Sort ▼
        </Button>

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

      {sortDropdownVisible && renderSortDropdown()}

    </div>
  );
};

export default SearchFilters;
