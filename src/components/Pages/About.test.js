// src/components/Pages/About.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import About from './About';

/* A helper function to include providers */
const renderWithProviders = (ui, options = {}) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </ThemeProvider>,
    options
  );
};

describe('About Page', () => {
  /* Basic render test */
  test('renders without crashing', () => {
    renderWithProviders(<About />);
    expect(screen.getByTestId('about-body')).toHaveTextContent('We are');
  });

  /* Test for image alt text */
  test('about page images have correct alt text', () => {
    renderWithProviders(<About />);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByAltText('About Us')).toBeInTheDocument();
  });

  /* Test key layout elements */
  test('has expected sections', () => {
    renderWithProviders(<About />);
    expect(screen.getByRole('link', { name: /stardial/i })).toBeInTheDocument();
  });
});
