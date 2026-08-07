/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Standalone brand-theme measurement harness (to-astryx ticket 02).

 Serves at `/.theme-probe/brand.html` under the react/ Vite dev server, with
 NO app shell, auth, or backend — so the theme layer can be measured with
 computed styles in a plain browser. The in-app surface for the same checks
 is `/stylex-probe` (AstryxStylexProbePage), which additionally exercises the
 app-level adapters (`AstryxBrandTheme` + useCustomThemeConfig/useThemeMode).

 What this mounts, top to bottom:
   #brand-btn / #brand-swatch      brand accent (root Theme, explicit mode)
   #admin-btn / #admin-swatch      nested admin theme, mode passed from
                                   useTheme() — the adapter pattern
   #sibling-swatch                 brand again AFTER the admin region (leak check)
   #secondary-swatch               nested secondary theme
   #nomode-swatch                  HAZARD DEMO: nested Theme WITHOUT mode —
                                   falls back to `system`, i.e. the OS
                                   preference, NOT the parent mode
   #tokens                         resolved align-token values (radius/font/
                                   duration) rendered as text
 */
import {
  backendAiAdminTheme,
  backendAiBrandTheme,
  backendAiSecondaryTheme,
} from '../src/astryx-theme/backendAiTheme';
import '../src/index.css';
import { Button } from '@astryxdesign/core/Button';
import { Theme, useTheme } from '@astryxdesign/core/theme';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const Swatch: React.FC<{ id: string; label: string }> = ({ id, label }) => (
  <div
    id={id}
    style={{
      backgroundColor: 'var(--color-accent)',
      color: 'var(--color-on-accent)',
      padding: 'var(--spacing-3)',
      borderRadius: 'var(--radius-element)',
      fontSize: 'var(--font-size-lg)',
      transitionDuration: 'var(--duration-slow)',
      boxShadow: 'var(--shadow-med)',
      fontFamily: 'var(--font-family-body)',
    }}
  >
    {label}
  </div>
);

/** The AstryxAdminTheme adapter pattern, minus the app-config dependency. */
const NestedTheme: React.FC<{
  theme: typeof backendAiAdminTheme;
  children: React.ReactNode;
}> = ({ theme, children }) => {
  const { mode } = useTheme(); // nearest ancestor's RESOLVED mode
  return (
    <Theme theme={theme} mode={mode}>
      {children}
    </Theme>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  return (
    <Theme theme={backendAiBrandTheme} mode={mode}>
      <div
        id="page"
        style={{
          minHeight: '100vh',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          backgroundColor: 'var(--color-background-surface)',
          color: 'var(--color-text-primary)',
        }}
      >
        <button
          id="toggle"
          onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
        >
          mode: {mode} — toggle
        </button>
        <Button id="brand-btn" label="brand primary" variant="primary" />
        <Swatch id="brand-swatch" label="brand accent" />
        <NestedTheme theme={backendAiAdminTheme}>
          <Button id="admin-btn" label="admin primary" variant="primary" />
          <Swatch
            id="admin-swatch"
            label="admin accent (follows parent mode)"
          />
        </NestedTheme>
        <Swatch
          id="sibling-swatch"
          label="sibling after admin (must be brand)"
        />
        <NestedTheme theme={backendAiSecondaryTheme}>
          <Swatch id="secondary-swatch" label="secondary accent" />
        </NestedTheme>
        <Theme theme={backendAiAdminTheme}>
          {/* no mode on purpose — demonstrates the system fallback hazard */}
          <Swatch
            id="nomode-swatch"
            label="admin WITHOUT mode (system fallback)"
          />
        </Theme>
      </div>
    </Theme>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
