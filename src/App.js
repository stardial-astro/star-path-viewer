// src/App.js
import './App.css';
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ServiceProvider } from './context/ServiceContext';
import Home from './components/Home';
import Footer from './components/Footer';
import About from './components/About';
import NotFound from './components/NotFound';
import BackToTopButton from './components/BackToTopButton';
import CustomAppBar from './components/CustomAppBar';
import Config from './Config';

const theme = createTheme();  // Create the default theme

const App = () => {
  return (
    <ServiceProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router basename={Config.basename}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              minHeight: '100vh',
              textAlign: 'center',
            }}
          >
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
        </Router>
      </ThemeProvider>
    </ServiceProvider>
  );
};

export default App;
