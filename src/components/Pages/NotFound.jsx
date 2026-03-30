// src/components/Pages/NotFound.jsx
import { memo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router';

const NotFound = () => {
  return (
    <Box
      data-testid="not-found-page"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        mt: 4,
      }}
    >
      <Typography
        variant="subtitle1"
        component="h1"
        fontSize="h4.fontSize"
        gutterBottom
        sx={{ color: 'action.active' }}
      >
        404
      </Typography>
      <Typography
        variant="body1"
        component="div"
        fontSize="h5.fontSize"
        gutterBottom
        sx={{ color: 'action.active' }}
      >
        Oops! Page not found :(
      </Typography>
      <Button variant="contained" component={Link} to="/" sx={{ mt: 4 }}>
        Go Back
      </Button>
    </Box>
  );
};

export default memo(NotFound);
