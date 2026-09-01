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
import { applyDevServerTitle } from './helper/devServerTitle';
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

// to-astryx final switch — the `ConfigProvider.config({ holderRender })` block
// that used to live here is gone.
//
// It existed for antd's STATIC methods (`message.*` / `notification.*` /
// `Modal.*`), which render in a detached holder built from `globalConfig()` —
// outside the app's ConfigProvider, and therefore outside both its CSP nonce
// and its theme. The holder had to be re-wrapped in its own ConfigProvider
// carrying the nonce (so cssinjs's injected <style> survived a strict
// `style-src 'nonce-…'`) and the dark algorithm (so a statically-invoked toast
// did not paint light on a dark page), subscribing to
// `change:backendaiwebui.setting.isDarkMode` to follow a mid-session flip.
//
// None of that has a subject any more. The imperative API is `app-shim`
// (ticket 04), whose host `<BAIAppProvider>` is mounted INSIDE the app's
// `<AstryxBrandTheme>` in `DefaultProviders`, so it inherits theme and mode
// like any other component — and Astryx injects no runtime <style>, so there
// is no nonce to plumb.

// In dev, distinguish multiple dev-server tabs by prefixing the tab title with
// the Portless app name injected via VITE_DEV_SERVER_NAME (no-op in production).
applyDevServerTitle();

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
