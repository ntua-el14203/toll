// src/components/FooterComponent.jsx

import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const FooterComponent = () => {
  return (
    <Box sx={{ py: 2, backgroundColor: '#f7f7f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Footer Text */}
      <Typography variant="body2" sx={{ color: 'black' }}>
        © 2024 Toll Interoperability. All rights reserved.
      </Typography>


    </Box>
  );
};

export default FooterComponent;
