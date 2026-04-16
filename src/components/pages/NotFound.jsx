// src/components/pages/NotFound.jsx
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router';

const NotFound = () => {
  const { t } = useTranslation();

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
      <Typography component="h1" variant="h1" gutterBottom>
        404
      </Typography>
      <Typography
        component="p"
        variant="body1"
        fontSize="h5.fontSize"
        gutterBottom
        sx={{ color: 'text.secondary' }}
      >
        {t('404_not_found')}
      </Typography>
      <Button variant="contained" component={Link} to="/" sx={{ mt: 4 }}>
        {t('return_to_home')}
      </Button>
    </Box>
  );
};

export default memo(NotFound);
