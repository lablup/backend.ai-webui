/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 24 shot harness — real mount module. Loaded dynamically by
 `frame24.tsx` AFTER the stub `globalThis.backendaiclient` is installed.

 Mounts the REAL frame components (nothing re-created):

   ?case=sider       BAISider + BAIMenu — the application sider: branded logo
                     band, ungrouped entries, three titled groups, a selected
                     row, a disabled row, and the terms/version footer.
   ?case=routeError  RouteErrorContent + the primary CTA — the shared
                     "this URL is wrong" composition behind Page404 /
                     ForbiddenPage / ProjectScopeErrorState.

 API-AGNOSTIC by construction — see the header of `frame24.tsx`.
*/
import en from '../../resources/i18n/en.json';
import BAIMenu from '../src/components/BAIMenu';
import BAISider from '../src/components/BAISider';
import RouteErrorContent from '../src/components/RouteErrorContent';
import { ThemeModeProvider } from '../src/hooks/useThemeMode';
import '../src/index.css';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import { Button } from '@astryxdesign/core/Button';
import { Theme } from '@astryxdesign/core/theme';
import { App, ConfigProvider, theme as antdTheme } from 'antd';
import i18next from 'i18next';
import {
  ChartColumn,
  CirclePlay,
  CloudUpload,
  Gauge,
  HardDrive,
  MessageSquare,
  ShieldUserIcon,
} from 'lucide-react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'sider';
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const item = (
  key: string,
  labelText: string,
  icon: React.ReactNode,
  extra: Record<string, unknown> = {},
) => ({
  key,
  // `label` is what antd `Menu` renders; `labelText` is what the migrated
  // `BAIMenu` renders. Carrying both is what makes one file render on both
  // trees.
  label: labelText,
  labelText,
  icon,
  to: `/${key}`,
  ...extra,
});

const group = (
  name: string,
  labelText: string,
  children: Array<ReturnType<typeof item>>,
) => ({
  type: 'group' as const,
  name,
  label: labelText,
  labelText,
  children,
});

const menuItems = [
  item('admin-settings', 'Admin settings', <ShieldUserIcon size="1em" />),
  item('start', 'Start', <CirclePlay size="1em" />),
  item('dashboard', 'Dashboard', <Gauge size="1em" />),
  group('storage', 'Storage', [
    item('data', 'Data', <CloudUpload size="1em" />),
  ]),
  group('playground', 'Playground', [
    item('chat', 'Chat', <MessageSquare size="1em" />),
  ]),
  group('metrics', 'Metrics', [
    item('agent-summary', 'Resources', <HardDrive size="1em" />, {
      disabled: true,
    }),
    item('statistics', 'Statistics', <ChartColumn size="1em" />),
  ]),
];

const SiderCase = () => {
  const footer = (
    <div style={{ textAlign: 'center', fontSize: 12, opacity: 0.75 }}>
      Terms of Service · Privacy Policy · About Backend.AI
      <br />
      Lablup Inc. 26.8.0.0000
    </div>
  );
  const siderProps = {
    collapsed: false,
    theme: isDark ? 'dark' : 'light',
    footer,
    logo: (
      <img
        alt="Backend.AI"
        src="/manifest/backend.ai-webui-white.svg"
        style={{ width: 159, height: 24, display: 'block' }}
      />
    ),
    logoCollapsed: (
      <img
        alt="Backend.AI"
        src="/manifest/backend.ai-brand-simple-white.svg"
        style={{ width: 24, height: 24, display: 'block' }}
      />
    ),
  } as never;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <BAISider {...siderProps}>
        {/* The pre-migration sider took the footer as a CHILD; the migrated
            one takes it in the `footer` slot. Rendering it in both places is
            harmless: whichever slot the running tree does not know about is
            simply not rendered by that tree. */}
        <BAIMenu
          {...({
            items: menuItems,
            selectedKeys: ['dashboard'],
            hideGroupName: false,
            collapsed: false,
          } as never)}
        />
      </BAISider>
      <div style={{ flex: 1 }} />
    </div>
  );
};

const RouteErrorCase = () => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <RouteErrorContent
      segments={[
        { text: 'project' },
        { text: 'default' },
        { text: 'sessionz', broken: true },
      ]}
      title="Oops! Page not Found..."
      description="The page you are looking for does not exist."
      extra={<Button variant="primary" size="lg" label="Go to Dashboard" />}
    />
  </div>
);

const Cases: Record<string, React.FC> = {
  sider: SiderCase,
  routeError: RouteErrorCase,
};
const Case = Cases[which] ?? SiderCase;

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MemoryRouter>
      <ThemeModeProvider>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <App>
          <Theme theme={backendAiBrandTheme} mode={isDark ? 'dark' : 'light'}>
            <Case />
          </Theme>
        </App>
      </ConfigProvider>
      </ThemeModeProvider>
    </MemoryRouter>
  </React.StrictMode>,
);
