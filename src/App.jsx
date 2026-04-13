// src/App.jsx
import './App.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Box } from '@mui/material';
import { Routes, Route } from 'react-router';
import { HomeProvider } from '@context/HomeContext';
import useQueryOnlineManager from '@hooks/useQueryOnlineManager';
import config from '@utils/config';
import Home from '@components/pages/Home';
import About from '@components/pages/About';
import NotFound from '@components/pages/NotFound';
import BackToTopButton from '@/components/ui/BackToTopButton';
import CustomAppBar from '@components/navigation/CustomAppBar';
import Footer from '@/components/layout/Footer';

const App = () => {
  const { i18n } = useTranslation();
  /* Delay resumed query on reconnect */
  useQueryOnlineManager(config.RESUME_DELAY);

  /* Update the <html> or <body> tag whenever language changes */
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Box className="app-container">
      {/* <Box id="back-to-top-anchor" /> */}
      <CustomAppBar />

      <Container maxWidth="md" sx={{ flex: '1 0 auto', pt: 0, pb: 0 }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomeProvider>
                <Home />
              </HomeProvider>
            }
          />
          <Route path="/about" element={<About />} />
          {/* The catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>

      <Footer />

      <BackToTopButton />
    </Box>
  );
};

export default App;
