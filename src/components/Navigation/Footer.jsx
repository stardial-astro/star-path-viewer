// src/components/Navigation/Footer.jsx
import { memo } from 'react';
import { Container, Box, Typography, Link } from '@mui/material';
import CustomDivider from '@components/UI/CustomDivider';
import ccSvg from '@assets/cc.svg';
import bySvg from '@assets/by.svg';

const Footer = () => {
  return (
    <Container
      sx={{
        maxWidth: 'md',
        px: 0,
      }}
    >
      <CustomDivider sx={{ mt: 4, mb: 1 }} />

      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          color: 'text.disabled',
          pt: 0,
          pb: 0.8,
          px: { xs: 2, sm: 0, md: 0 },
          width: '100%',
        }}
      >
        <Typography variant="body2" component="p" sx={{ textAlign: 'left' }}>
          &copy; {new Date().getFullYear()} Stardial. Created by{' '}
          <Link
            href="https://github.com/lydiazly"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lydia Zhang
          </Link>
          ,{' '}
          <Link
            href="https://github.com/claude-hao"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zhibo Hao
          </Link>
          , and Jinsong Guo.
        </Typography>

        <Typography variant="body2" component="p" sx={{ textAlign: 'left' }}>
          Source code and data are licensed under{' '}
          <Link
            href="https://creativecommons.org/licenses/by/4.0/?ref=chooser-v1"
            target="_blank"
            rel="license noopener noreferrer"
            sx={{ display: 'inline-block' }}
          >
            CC BY 4.0
            <Box
              component="img"
              src={ccSvg}
              alt="CC logo"
              sx={{
                height: '0.8rem!important',
                ml: 0.5,
                mb: 0.2,
                verticalAlign: 'text-bottom',
                opacity: 0.4,
              }}
            />
            <Box
              component="img"
              src={bySvg}
              alt="BY logo"
              sx={{
                height: '0.8rem!important',
                ml: 0.5,
                mb: 0.2,
                verticalAlign: 'text-bottom',
                opacity: 0.4,
              }}
            />
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default memo(Footer);
