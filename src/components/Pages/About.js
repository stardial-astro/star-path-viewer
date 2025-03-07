// src/components/Pages/About.js
import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import AboutImage from '../../assets/about-image.svg';
import Logo from '../../assets/logo.svg';
// import { Helmet } from 'react-helmet';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const About = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Star Path Viewer: Trace Planets & Stars</title>
        <meta name="description" content="Learn more about Stardial and Star Path Viewer." />
        <meta property="og:title" content="About Us - Stardial" />
        <meta property="og:description" content="Learn more about Stardial and Star Path Viewer." />
        <meta property="og:image" content="https://stardial-astro.github.io/star-path-data/images/star-path-viewer_card.jpg" />
        <meta property="og:url" content="https://star-path-viewer.pages.dev/about" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Box data-testid="about-page" sx={{ marginTop: 4 }}>
        <img
          src={Logo}
          alt="Logo"
          data-testid="about-logo"
          style={{
            maxWidth: '20%',
            minWidth: '130px',
            objectFit: 'contain',  // Maintain aspect ratio and contain the image within the Box
          }}
        />
      </Box>

      {/* Title */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 1,
          mx: 'auto',
          mt: { xs: 2, sm: 3, md: 3},
          mb: { xs: 3, sm: 4, md: 4},
          width: '100%',
        }}
      >
        {/* Title image */}
        <Typography
          component="h1"
          data-testid="about-title"
          sx={{
            width: '100%',
            height: 'auto',
            lineHeight: 0,
            overflow: 'hidden'
          }}
        >
          <img
            src={AboutImage}
            alt="About Us"
            style={{
              maxHeight: '2.1rem',
              objectFit: 'contain',  // Maintain aspect ratio and contain the image within the Box
              cursor: 'default',
            }}
          />
        </Typography>
      </Box>

      <Box data-testid="about-body" display="flex" flexWrap="wrap" gap="1rem" marginX={{ xs: 1.5, sm: 2.5, md: 3 }} paddingLeft={1.8}>
        <Typography variant="body1" textAlign="left">
          We are{' '}
          <Link href="https://github.com/stardial-astro" target="_blank" rel="noopener noreferrer">
            Stardial
          </Link>
          , a development team passionate about science and the humanities. Our goal is to create precise, user-friendly, and intuitive astronomical tools to support research in history and social sciences.
        </Typography>
        <Typography variant="body1" textAlign="left">
          <em>Star Path Viewer</em> is our first application designed to help historians intuitively understand the apparent motion of a celestial object on any given date. This open-source scientific tool provides an accurate approach to replicating the view of stars crossing the sky that ancient stargazers would have seen.
        </Typography>
        <Typography variant="body1" textAlign="left">
          Accurately evaluating the position of a star or planet in ancient times is crucial for historians when dating historical events by correlating astrometric data with records. The visibility of stars during twilight stages is especially significant in the study of pre-modern astronomy. For example, the Chinese had a long tradition of observing and calculating the culmination of key stars before dawn or after dusk. These observations were used as seasonal markers to maintain calendrical accuracy and stability. In these cases, determining the times when certain stars become visible after dark and disappear before sunrise is essential for analyzing the foundational texts of the Chinese astronomical tradition and many other historical documents.
        </Typography>
        <Typography variant="body1" textAlign="left">
          To meet these needs, <em>Star Path Viewer</em> integrates with{' '}
          <Link href="https://rhodesmill.org/skyfield" target="_blank" rel="noopener noreferrer">
            Skyfield
          </Link>
          ,{' '}
          <Link href="https://ssd.jpl.nasa.gov/planets/eph_export.html" target="_blank" rel="noopener noreferrer">
            JPL ephemeris
          </Link>
          {' '}(DE406), and{' '}
          <Link href="https://www.cosmos.esa.int/web/hipparcos/catalogues" target="_blank" rel="noopener noreferrer">
            Hipparcos Catalogue
          </Link>
          {' '}to precisely calculate and depict the path of a star or planet over the course of the day and night on any specific date in either the Gregorian or Julian calendar, from ancient times to far into the future, in the local horizontal coordinate system. For a comprehensive visual experience, different line styles on the diagram distinguish the path during the day, night, and twilight stages. Key moments in the celestial body's trajectory, such as rising, meridian transit, and setting times, are also marked. <em>Star Path Viewer</em> particularly highlights the transitions between different twilight stages and provides the target object's positional information at these times.
        </Typography>
        <Typography variant="body1" textAlign="left">
          For more detailed information about this website, please visit our{' '}
          <Link href="https://github.com/stardial-astro/star-path-viewer" target="_blank" rel="noopener noreferrer">
            repository
          </Link>
          .
        </Typography>
      </Box>
    </HelmetProvider>
  );
};

export default React.memo(About);
