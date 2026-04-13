// src/components/layout/Footer.jsx
import { memo } from 'react';
import { Container, Box, Typography, Link } from '@mui/material';
import CustomDivider from '@components/ui/CustomDivider';
import ccSvg from '@assets/cc.svg';
import bySvg from '@assets/by.svg';

const ccCssStyle = {
  maxHeight: '1em',
  marginRight: '3px',
  marginBottom: '1px',
  verticalAlign: 'text-bottom',
  opacity: 0.4,
};

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <Container
      sx={{
        maxWidth: 'md',
        px: 0,
      }}
    >
      <CustomDivider sx={{ mt: 6, mb: 1 }} />

      <Box
        component="footer"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: '0.25em',
          justifyContent: 'center',
          color: 'text.disabled',
          pt: 0,
          pb: 0.8,
          px: { xs: 2, sm: 0 },
          width: '100%',
        }}
      >
        <Typography variant="body2" component="p" align="left">
          &copy; {currentYear} Stardial. Created by{' '}
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

        <Typography variant="body2" component="p" align="left">
          Source code and data are licensed under{' '}
          <Link
            href="https://creativecommons.org/licenses/by/4.0/?ref=chooser-v1"
            target="_blank"
            rel="license noopener noreferrer"
            sx={{ display: 'inline-block', mr: '0.25em' }}
          >
            CC BY 4.0
          </Link>
          <img src={ccSvg} alt="CC logo" style={ccCssStyle} />
          <img src={bySvg} alt="BY logo" style={ccCssStyle} />
        </Typography>
      </Box>
    </Container>
  );
};

export default memo(Footer);
