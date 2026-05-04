/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Initialize global stores before any component renders.
// This import has side effects: it instantiates the four singleton stores
// and assigns them to globalThis for backward compatibility with Lit code.
import App from './App';
import { jotaiStore } from './components/DefaultProviders';
import './global-stores';
import { loadCustomThemeConfig } from './helper/customThemeConfig';
import { ThemeModeProvider } from './hooks/useThemeMode';
import { Provider as JotaiProvider } from 'jotai';
import React from 'react';
import ReactDOM from 'react-dom/client';

// To maintain compatibility with various manager versions, the WebUI client uses directives to manipulate GraphQL queries.
// This can cause Relay to show "Warning: RelayResponseNormalizer: Payload did not contain a value for field" in the browser console during development.
// It's advisable to ignore these frequent logs in development mode.
if (process.env.NODE_ENV === 'development') {
  // Enable react-grab for AI agent element inspection during development
  import('react-grab')
    .then(() => {
      window.__REACT_GRAB__?.registerPlugin({
        name: 'hide-toolbar',
        theme: {
          toolbar: { enabled: false },
        },
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.warn(
        'Failed to load react-grab devtool. AI agent element inspection will be disabled.',
        error,
      );
    });

  // eslint-disable-next-line no-console
  const originalConsoleError = console.error;
  // eslint-disable-next-line no-console
  console.error = function (message, ...args) {
    if (
      typeof message === 'string' &&
      message.includes(
        'Warning: RelayResponseNormalizer: Payload did not contain a value for field',
      )
    ) {
      return;
    }
    originalConsoleError.apply(console, [message, ...args]);
  };
}

// Load custom theme config once in react/index.tsx
loadCustomThemeConfig();

const root = ReactDOM.createRoot(
  document.getElementById('react-root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <JotaiProvider store={jotaiStore}>
      <ThemeModeProvider>
        <App />
      </ThemeModeProvider>
    </JotaiProvider>
  </React.StrictMode>,
);
