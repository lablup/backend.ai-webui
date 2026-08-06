/**
 * PILOT 10 PHASE 3b / ticket 13 — NESTED theme probe (admin section).
 *
 * Mirrors `react/src/components/ThemeAdminProvider.tsx`: an admin region gets a
 * different accent (`token.colorInfo`) while inheriting the parent's light/dark.
 *
 * Questions answered, empirically:
 *   1. nearest-wins  — does the nested region take the admin accent while
 *      siblings/parent keep the brand accent?
 *   2. mode inheritance — with NO `mode` prop on the nested <Theme>, does it
 *      follow the parent or fall back to 'system'?
 *   3. scope isolation — is the injected CSS scoped to a wrapper element?
 *   4. cost — style tags / bytes per nested Theme instance.
 */
import './probe.css';
import { buildBackendAiTheme } from '../src/astryx-theme/backendAiTheme';
import { Button } from '@astryxdesign/core/Button';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { Switch } from '@astryxdesign/core/Switch';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Text } from '@astryxdesign/core/Text';
import { Theme } from '@astryxdesign/core/theme';
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

/** resources/theme.json → light.token.colorPrimary / dark.token.colorPrimary */
const BRAND = { light: '#FF7A00', dark: '#DC6B03' };
/** resources/theme.json → token.colorInfo — what ThemeAdminProvider uses. */
const ADMIN = { light: '#028DF2', dark: '#009BDD' };

const Controls: React.FC<{ tag: string }> = ({ tag }) => {
  const [tab, setTab] = useState('a');
  const [on, setOn] = useState(true);
  return (
    <div data-probe={tag} className="probe-block">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button label="Primary" variant="primary" />
        <Switch value={on} onChange={setOn} label="Auto" />
        <Text color="accent">accent text</Text>
      </div>
      <TabList value={tab} onChange={setTab} hasDivider>
        <Tab value="a" label="Active" />
        <Tab value="b" label="Trash" />
      </TabList>
    </div>
  );
};

const App: React.FC = () => {
  // `?force=dark|light` sets the OUTER mode explicitly, deliberately against
  // the OS preference, to test whether the nested <Theme> inherits the
  // parent's resolved mode or silently falls back to `system`.
  const forced = new URLSearchParams(location.search).get('force');
  const dark = forced
    ? forced === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  const mode = dark ? ('dark' as const) : ('light' as const);

  const brandTheme = useMemo(
    () =>
      buildBackendAiTheme({
        accentLight: BRAND.light,
        accentDark: BRAND.dark,
      }),
    [],
  );
  const adminTheme = useMemo(
    () =>
      buildBackendAiTheme({
        accentLight: ADMIN.light,
        accentDark: ADMIN.dark,
      }),
    [],
  );

  return (
    // App-level brand theme, mode explicitly set (as DefaultProviders does).
    <Theme theme={brandTheme} mode={mode}>
      <LayerProvider>
        <div className="page" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="col">
            <div className="col-head">outer · brand (parent)</div>
            <Controls tag="outer-before" />

            <div className="section">
              <div className="section-title">
                nested &lt;Theme&gt; — admin accent, NO mode prop
              </div>
              {/* `?inherit=1` adds the explicit mode, proving the fix. */}
              <Theme
                theme={adminTheme}
                mode={
                  new URLSearchParams(location.search).get('inherit')
                    ? mode
                    : undefined
                }
              >
                <div className="admin-region">
                  <Controls tag="nested-admin" />
                </div>
              </Theme>
            </div>

            <div className="section">
              <div className="section-title">
                sibling AFTER the nested region (leak check)
              </div>
              <Controls tag="outer-after" />
            </div>
          </div>

          <div className="col">
            <div className="col-head">reference</div>
            <Text>
              brand {BRAND.light}/{BRAND.dark} · admin {ADMIN.light}/
              {ADMIN.dark}
            </Text>
          </div>
        </div>
      </LayerProvider>
    </Theme>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
