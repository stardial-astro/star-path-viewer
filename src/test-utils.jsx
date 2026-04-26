// src/test-utils.jsx
/* eslint-disable react-refresh/only-export-components */
import { beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { i18nPromise } from '@lib/i18n';
import AppThemeProvider from '@components/providers/AppThemeProvider';

/* Wait for i18n to be ready before any test runs */
beforeAll(async () => {
  await i18nPromise;
});

/** A factory function that creates a fresh `QueryClient` instance per test. */
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

/** @param {*} props */
const AllProviders = ({ children, initialEntries = ['/'] }) => {
  const queryClient = createQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </AppThemeProvider>
    </QueryClientProvider>
  );
};

/**
 * @param {*} ui
 * @param {*} props
 */
const customRender = (ui, { initialEntries, ...options } = {}) =>
  render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialEntries={initialEntries}>{children}</AllProviders>
    ),
    ...options,
  });

/* Re-export everything so tests only need to import from test-utils */
export * from '@testing-library/react';
export { customRender as render };
