// src/components/Navigation/Footer.js
import React from 'react';
import { Container, Box, Typography, Link } from '@mui/material';
import CustomDivider from '../UI/CustomDivider';

const Footer = () => {
  return (
    <Container
      maxWidth="md"
      sx={{
        flexShrink: 0,
        px: 0,
      }}
    >
      <CustomDivider sx={{ mt: 4, mb: 1 }} />

      <Box
        component="footer"
        sx={{
          pt: 0,
          pb: 0.8,
          px: { xs: 2, sm: 0, md: 0 },
          textAlign: 'center',
          width: '100%',
        }}
      >
        <Typography variant="body2" component="p" color="action.active">
          &copy; {new Date().getFullYear()} Stardial. Created by{' '}
          <Link href="https://github.com/claude-hao" target="_blank" rel="noopener noreferrer">
            Zhibo Hao
          </Link>
          ,{' '}
          <Link href="https://github.com/lydiazly" target="_blank" rel="noopener noreferrer">
            Lydia Zhang
          </Link>
          , and Jinsong Guo.
        </Typography>

        <Typography variant="body2" component="p" color="action.active">
          <Box component="span">
            All non-logo images on this site
          </Box>
          {' are licensed under '}
          <Link
            href="https://creativecommons.org/licenses/by/4.0/?ref=chooser-v1"
            target="_blank"
            rel="license noopener noreferrer"
            sx={{ display: 'inline-block' }}
          >
            CC BY 4.0
            <Box
              component="img"
              src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"
              alt="CC logo"
              color="action.active"
              sx={{ height: '0.8rem!important', ml: 0.5, mb: 0.2, verticalAlign: 'text-bottom', opacity: 0.54 }}
            />
            <Box
              component="img"
              src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"
              alt="BY logo"
              sx={{ height: '0.8rem!important', ml: 0.5, mb: 0.2, verticalAlign: 'text-bottom', opacity: 0.54 }}
            />
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default React.memo(Footer);
