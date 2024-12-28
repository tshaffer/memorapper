import { useState } from 'react';
import { Box, Button, TextField, useMediaQuery } from '@mui/material';

interface QueryProps {
  onExecuteQuery: (query: string) => void;
}

const Query: React.FC<QueryProps> = (props: QueryProps) => {

  const isMobile = useMediaQuery('(max-width:768px)');

  const [query, setQuery] = useState('');
  const [executedQuery, setExecutedQuery] = useState<string | null>(null); // Stores the executed query

  const handleQueryExecute = () => {
    setExecutedQuery(query);
    props.onExecuteQuery(query);
    console.log('Executed Query:', query);
  };

  const handleQueryClear = () => {
    setQuery('');
    setExecutedQuery(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px', marginBottom: '12px' }}>
      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a query (optional)"
        fullWidth
        size="small"
        variant="outlined"
      />
      <Button onClick={handleQueryExecute} variant="contained" disabled={!query}>
        Execute
      </Button>
      <Button onClick={handleQueryClear} variant="outlined" disabled={!query}>
        Clear
      </Button>
    </Box>

  );
};

export default Query;
