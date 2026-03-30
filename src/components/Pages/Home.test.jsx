// src/components/Pages/Home.test.jsx
import { render, screen } from '@/test-utils';
import { HomeProvider } from '@context/HomeContext';
import { describe, test, expect } from 'vitest';
import Home from './Home';

/**
 * A helper function to include all providers.
 * @param {*} ui
 * @param {*} [options={}]
 */
const renderWithProviders = (ui, options = {}) => {
  return render(<HomeProvider>{ui}</HomeProvider>, options);
};

describe('Home Page', () => {
  /* Basic render test */
  test('renders without crashing', () => {
    renderWithProviders(<Home />);
    expect(screen.getByTestId('home-subtitle')).toHaveTextContent(
      'Trace a star on any date between 3001 BCE and 3000 CE',
    );
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
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('draw-btn')).toBeInTheDocument();
  });
});
