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
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography
        variant="body1"
        component="p"
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
