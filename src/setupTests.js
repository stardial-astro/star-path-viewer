// src/setupTests.js
import '@testing-library/jest-dom/vitest';
import 'vitest-canvas-mock';
import { vi } from 'vitest';

/* Mock IntersectionObserver */
const MockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

/* Mock window.matchMedia */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated but included for compatibility
    removeListener: vi.fn(), // Deprecated but included for compatibility
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
