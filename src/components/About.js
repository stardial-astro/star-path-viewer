// src/components/About.js
import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import AboutImage from '../assets/about-image.svg';
import Logo from '../assets/logo.svg';

const About = () => {
  return (
    <>
      <Box sx={{ marginTop: 4 }}>
        <img
          src={Logo}
          alt="Logo"
          style={{
            maxWidth: '20%',
            minWidth: '130px',
            objectFit: 'contain',  // Maintain aspect ratio and contain the image within the Box
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingX: 1,
          marginX: 'auto',
          marginTop: { xs: 2, sm: 3, md: 3},
          marginBottom: { xs: 3, sm: 4, md: 4},
          width: '100%',
        }}
      >
        <img
          src={AboutImage}
          alt="About Title"
          style={{
            maxHeight: '2.1rem',
            objectFit: 'contain',  // Maintain aspect ratio and contain the image within the Box
            cursor: 'pointer',
          }}
        />
      </Box>

      <Box display="flex" flexWrap="wrap" gap="1rem" marginX={{ xs: 1.5, sm: 2.5, md: 3 }} paddingLeft={1.8}>
        <Typography variant="body1" textAlign="left">
          We are{' '}
          <Link href="https://github.com/stardial-astro" target="_blank" rel="noopener noreferrer">
            Stardial
          </Link>
          , a development team passionate about science and the humanities. Our goal is to create precise, user-friendly, and intuitive astronomical tools to support research in history and social sciences.
        </Typography>
        <Typography variant="body1" textAlign="left">
          <em>Star Path Viewer</em> is our first web application designed to help historians intuitively understand the motion of a celestial object on any given date in ancient times. Utilizing the{' '}
          <Link href="https://rhodesmill.org/skyfield" target="_blank" rel="noopener noreferrer">
            Skyfield
          </Link>
          {' '}Python package and{' '}
          <Link href="https://ssd.jpl.nasa.gov" target="_blank" rel="noopener noreferrer">
            JPL ephemeris
          </Link>
          , <em>Star Path Viewer</em> provides an accurate approach to replicate the view ancient stargazers would have had of celestial objects crossing the sky.
        </Typography>
        <Typography variant="body1" textAlign="left">
          Accurately predicting the path of a star or planet in ancient times is crucial for historians. It helps in analyzing historical accounts of celestial observations, which are often key to dating events, reconstructing astronomical activities, and understanding important texts. The visibility of stars at dawn and dusk is also significant in the study of premodern astronomy. For example, the Chinese had a long tradition of observing and calculating the culmination of key stars during dawn and dusk. These observations were used as seasonal markers to maintain calendrical accuracy and stability. Determining when stars become visible at dusk and disappear at dawn is essential for analyzing foundational texts of the Chinese astronomical tradition and historical documents.
        </Typography>
        <Typography variant="body1" textAlign="left">
          To meet these needs, <em>Star Path Viewer</em> uses{' '}
          <Link href="https://rhodesmill.org/skyfield" target="_blank" rel="noopener noreferrer">
            Skyfield
          </Link>
          ,{' '}
          <Link href="https://ssd.jpl.nasa.gov" target="_blank" rel="noopener noreferrer">
          JPL ephemeris (DE406)
          </Link>
          , and{' '}
          <Link href="https://cdsarc.cds.unistra.fr/ftp/cats/I/239" target="_blank" rel="noopener noreferrer">
            Hipparchus catalog data
          </Link>
          {' '}to precisely calculate and depict the path of a star or planet at any time within a span of millennia, from the past to the future, in the local horizontal coordinate system. For a comprehensive visual experience, different line styles on the chart distinguish the path during the day, night, and twilight stages. Key moments in the celestial object's trajectory, such as rising, meridian transit, and setting times, are also marked. <em>Star Path Viewer</em> particularly highlights the transitions between different twilight stages and provides the celestial object's positional information at these times.
        </Typography>
        <Typography variant="body1" textAlign="left">
          Compared to existing astronomical software with similar functions, <em>Star Path Viewer</em> is more precise in delivering essential results and more focused in its presentation, making it a more desirable choice for research purposes.
        </Typography>
      </Box>
    </>
  );
};

export default React.memo(About);
