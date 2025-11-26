// Polyfill for global in Node.js 18+
if (typeof global === 'undefined') {
  globalThis.global = globalThis;
}

// Mock scrollIntoView (jsdom doesn't implement this)
Element.prototype.scrollIntoView = jest.fn();

// Mock Bootstrap Collapse
global.bootstrap = {
  Collapse: {
    getInstance: jest.fn(),
  },
};