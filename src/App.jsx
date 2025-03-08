// src/App.jsx
import './App.css';
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { ServiceProvider } from '@context/ServiceContext';
import Home from '@components/Pages/Home';
import About from '@components/Pages/About';
import NotFound from '@components/Pages/NotFound';
import BackToTopButton from '@components/Navigation/BackToTopButton';
import CustomAppBar from '@components/Navigation/CustomAppBar';
import Footer from '@components/Navigation/Footer';

const App = () => {
  const theme = createTheme();  // Create the default theme

  return (
    <ServiceProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box className="app-container">
          {/* Anchor Element for Back to Top Button */}
          <Box id="back-to-top-anchor" />

          <CustomAppBar />

          <Container maxWidth="md" sx={{ flex: '1 0 auto', pt: 0, pb: 0 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              {/* The catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>

          <Footer />

          <BackToTopButton />
        </Box>
      </ThemeProvider>
    </ServiceProvider>
  );
};

export default App;
