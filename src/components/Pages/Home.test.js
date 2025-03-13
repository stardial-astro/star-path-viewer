// src/components/Pages/Home.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ServiceProvider } from '../../context/ServiceContext';
import Home from './Home';

/* A helper function to include all providers */
const renderWithProviders = (ui, options = {}) => {
  const theme = createTheme();
  return render(
    <ServiceProvider>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </ThemeProvider>
    </ServiceProvider>,
    options
  );
};

describe('Home Page', () => {
  /* Basic render test */
  test('renders without crashing', () => {
    renderWithProviders(<Home />);
    expect(screen.getByTestId('home-subtitle')).toHaveTextContent('Trace a star on any date between 3001 BCE and 3000 CE');
  });

  /* Test for alt text on title image */
  test('title image has correct alt text', () => {
    renderWithProviders(<Home />);
    expect(screen.getByAltText('Star Path Viewer')).toBeInTheDocument();
  });

  /* Test key layout elements */
  test('has main layout sections', () => {
    renderWithProviders(<Home />);
    expect(screen.getByTestId('home-title')).toBeInTheDocument();
    expect(screen.getByTestId('draw-btn')).toBeInTheDocument();
  });
});
