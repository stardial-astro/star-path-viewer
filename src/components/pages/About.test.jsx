// src/components/pages/About.test.jsx
import { render, screen } from '@/test-utils';
import { describe, test, expect } from 'vitest';
import About from './About';

describe('About Page', () => {
  /* Basic render test */
  test('renders without crashing', async () => {
    render(<About />);
    const logo = await screen.getByAltText('Logo');
    const title = await screen.getByRole('heading', {
      level: 1,
      name: 'title',
    });
    const body = await screen.getByTestId('about-body');
    expect(logo).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(body).toBeInTheDocument();
  });

  /* Test for image alt text */
  // test('about page images have correct alt text', async () => {
  //   render(<About />);
  //   const titleImg = await screen.getByAltText('About Us');
  //   expect(titleImg).toBeInTheDocument();
  // });
});
