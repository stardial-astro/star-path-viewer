// src/App.test.jsx
import { render, screen } from '@/test-utils';
import { describe, test, expect } from 'vitest';
import App from './App';

describe('App Routes', () => {
  test('renders Home page on default route with app bar and footer', () => {
    render(<App />, { initialEntries: ['/'] });

    /* Test that we're on the Home page */
    expect(screen.getByTestId('home-page')).toBeInTheDocument();

    /* Test for CustomAppBar links with aria-labels */
    expect(screen.getByRole('link', { name: /^about$/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /^home$/i }),
    ).not.toBeInTheDocument();

    /* Test for Footer with certain text */
    expect(screen.getByText(/created by/i)).toBeInTheDocument();
  });

  test('renders About page when navigating to /about', () => {
    render(<App />, { initialEntries: ['/about'] });

    /* Test that we're on the About page */
    expect(screen.getByTestId('about-page')).toBeInTheDocument();

    /* Verify Home page is NOT rendered */
    expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();

    /* Verify navigation and footer still present */
    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /^about$/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/created by/i)).toBeInTheDocument();
  });

  test('renders NotFound page for unknown routes', () => {
    render(<App />, { initialEntries: ['/unknown-page'] });

    /* Test that we're on the NotFound page */
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    expect(screen.getByText(/404/i)).toBeInTheDocument();

    /* Verify app bar and footer still present */
    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /^about$/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/created by/i)).toBeInTheDocument();
  });
});
