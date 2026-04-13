// src/App.test.jsx
import { render, screen } from '@/test-utils';
import { describe, test, expect } from 'vitest';
import App from './App';

describe('App Routes', () => {
  test('renders Home page on default route with app bar and footer', async () => {
    render(<App />, { initialEntries: ['/'] });

    /* Test that we're on the Home page */
    const homePage = await screen.getByTestId('home-page');
    expect(homePage).toBeInTheDocument();

    /* Test for CustomAppBar links with aria-labels */
    const aboutLink = await screen.getByRole('link', { name: /^about$/i });
    const homeLink = await screen.queryByRole('link', { name: /^home$/i });
    expect(aboutLink).toBeInTheDocument();
    expect(homeLink).not.toBeInTheDocument();

    /* Test for Footer with certain text */
    const footerText = await screen.getByText(/created by/i);
    expect(footerText).toBeInTheDocument();
  });

  test('renders About page when navigating to /about', async () => {
    render(<App />, { initialEntries: ['/about'] });

    /* Test that we're on the About page */
    const aboutPage = await screen.getByTestId('about-page');
    expect(aboutPage).toBeInTheDocument();

    /* Verify navigation presents */
    const homeLink = await screen.queryByRole('link', { name: /^home$/i });
    expect(homeLink).toBeInTheDocument();
  });

  test('renders NotFound page for unknown routes', async () => {
    render(<App />, { initialEntries: ['/unknown-page'] });

    /* Test that we're on the NotFound page */
    const notFoundPage = await screen.getByTestId('not-found-page');
    const notFoundText = await screen.getByText(/404/i);
    expect(notFoundPage).toBeInTheDocument();
    expect(notFoundText).toBeInTheDocument();
  });
});
