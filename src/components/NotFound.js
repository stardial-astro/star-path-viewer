// src/components/NotFound.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="subtitle1" component="div" fontSize="2rem" color="action.active" gutterBottom>
        404
      </Typography>
      <Typography variant="body1" component="div" fontSize="1.5rem" color="action.active" gutterBottom>
        Oops! Page not found :(
      </Typography>
      <Button variant="contained" component={Link} to="/" sx={{ mt: 4 }}>
        Go to Home
      </Button>
    </Box>
  );
};

export default NotFound;
