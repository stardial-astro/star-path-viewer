// src/components/pages/Home.test.jsx
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
  test('renders without crashing', async () => {
    renderWithProviders(<Home />);
    const title = await screen.getByRole('heading', {
      level: 1,
      name: 'Star Path Viewer',
    });
    const subtitle = await screen.getByTestId('home-subtitle');
    expect(title).toBeInTheDocument();
    expect(subtitle).toHaveTextContent('— subtitle —');
  });

  /* Test for alt text on title image */
  // test('title image has correct alt text', async () => {
  //   renderWithProviders(<Home />);
  //   const titleImg = await screen.getByAltText('Star Path Viewer');
  //   expect(titleImg).toBeInTheDocument();
  // });

  /* Test key layout elements */
  test('has main layout sections', async () => {
    renderWithProviders(<Home />);
    const input = await screen.getByTestId('input');
    const drawBtn = await screen.getByTestId('draw-btn');
    expect(input).toBeInTheDocument();
    expect(drawBtn).toBeInTheDocument();
  });
});
