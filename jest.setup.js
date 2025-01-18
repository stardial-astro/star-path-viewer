// jest.setup.js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;


/* Mock canvas */
const { createCanvas } = require('canvas');
HTMLCanvasElement.prototype.getContext = jest.fn(() => {
  return createCanvas(100, 100).getContext('2d');
});
