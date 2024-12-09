import { Button } from '@mui/material';

const SearchFilters = () => {
  return (
    <div style={{
      // padding: '8px',
      paddingTop: '8px',
      paddingBottom: '4px',
      paddingLeft: '8px',
      paddingRight: '8px',
      // background: '#fff',
      // boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Row of Filter Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <Button
          style={{
            padding: '8px 8px',
            background: '#f8f8f8',
            border: '1px solid #ccc',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Sort
        </Button>
        <Button
          style={{
            padding: '8px 8px',
            background: '#f8f8f8',
            border: '1px solid #ccc',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Open Now
        </Button>
        <Button
          style={{
            padding: '8px 8px',
            background: '#f8f8f8',
            border: '1px solid #ccc',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Price
        </Button>
      </div>

    </div>
  );
};

export default SearchFilters;
