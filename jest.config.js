module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  globals: {
    window: {},
  },
  testMatch: [
    '**/scripts/tests/**/*.test.js',
  ],
};