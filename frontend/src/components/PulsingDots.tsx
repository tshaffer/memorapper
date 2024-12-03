import React from 'react';
import { Box } from '@mui/material';

const PulsingDots: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 12, // Diameter of the dots
              height: 12,
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              animation: `pulse 1.2s ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const injectGlobalStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% {
        opacity: 0.3;
      }
      50% {
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
};

injectGlobalStyles();

export default PulsingDots;
