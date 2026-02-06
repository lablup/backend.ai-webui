const path = require('path');
module.exports = {
  testEnvironment: 'jsdom',
  clearMocks: true,
  setupFiles: ['jest-canvas-mock'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^backend\\.ai-ui$': path.resolve(
      __dirname,
      '../packages/backend.ai-ui/src',
    ),
    '^backend\\.ai-ui/dist/locale/.*$': '<rootDir>/__test__/buiLanguage.mock.js',
    '^backend\\.ai-ui/(.*)$': path.resolve(
      __dirname,
      '../packages/backend.ai-ui/src/$1',
    ),
    '^src/(.*)$': '<rootDir>/src/$1',
    '^.*/helper/bui-language$': '<rootDir>/__test__/buiLanguage.mock.js',
    '\\.svg': '<rootDir>/__test__/svg.mock.js',
    '\\.(css|less|scss|sass)\\?raw$': '<rootDir>/__test__/rawCss.mock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm/.+?/node_modules/(backend\\.ai-ui|nuqs)/|backend\\.ai-ui/|nuqs/))',
    `!${path.resolve(__dirname, '../packages/backend.ai-ui/src')}`,
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
  ],
};
