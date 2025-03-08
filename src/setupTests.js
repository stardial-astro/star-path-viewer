// setupTests.js
import '@testing-library/jest-dom';
import { vi } from 'vitest';

/* Mock canvas */
import { createCanvas } from 'canvas';
HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  return createCanvas(100, 100).getContext('2d');
});

/* Mock IntersectionObserver */
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}

window.IntersectionObserver = MockIntersectionObserver;

/* Mock window.matchMedia */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
