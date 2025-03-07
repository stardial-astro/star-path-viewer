// jest.setup.js
import '@testing-library/jest-dom';

/* Text encoding APIs */
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

/* Mock canvas */
const { createCanvas } = require('canvas');
HTMLCanvasElement.prototype.getContext = jest.fn(() => {
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
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
