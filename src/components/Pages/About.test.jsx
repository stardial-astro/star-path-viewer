// src/components/Pages/About.test.jsx
import { render, screen } from '@/test-utils';
import { describe, test, expect } from 'vitest';
import About from './About';

describe('About Page', () => {
  /* Basic render test */
  test('renders without crashing', () => {
    render(<About />);
    expect(screen.getByTestId('about-body')).toHaveTextContent('We are');
  });

  /* Test for image alt text */
  test('about page images have correct alt text', () => {
    render(<About />);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByAltText('About Us')).toBeInTheDocument();
  });

  /* Test key layout elements */
  test('has expected sections', () => {
    render(<About />);
    expect(screen.getByRole('link', { name: /stardial/i })).toBeInTheDocument();
  });
});
