/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 22 harness — mounts REAL Settings-area components (nothing
 re-created here) so before/after shots compare the actual modules in
 light AND dark:

   ?case=settingList  SettingList + SettingItem  (checkbox/select/custom
                       rows, tab count badges, search/filter toolbar, reset
                       confirm modal trigger — SettingItem/SettingList are
                       the shared core every other Settings sub-page uses)
   ?case=information  Information               (Descriptions -> MetadataList,
                       Card, Grid, Badge, Overlay+Spinner)

   &theme=dark         dark mode — Astryx <Theme mode="dark"> only; this
                       area has zero antd renders left (Form-family/type-only
                       excepted), so there is no antd ConfigProvider layer to
                       mirror (contrast ticket 18's probe, which still needed
                       one for the antd "before" baseline).

 Serve (ticket 22 port policy — 5685-5694 only):
   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5685
   -> http://127.0.0.1:5685/theme-probe/settings.html?case=settingList&theme=light
*/
import en from '../../resources/i18n/en.json';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import Information from '../src/components/Information';
import SettingList, { SettingGroup } from '../src/components/SettingList';
import '../src/index.css';
import { Theme } from '@astryxdesign/core/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18next from 'i18next';
import React, { Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';

// Real host-side keys so labels render exactly as in the app (P13).
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'settingList';
const mode = params.get('theme') === 'dark' ? 'dark' : 'light';

const SettingListCase: React.FC = () => {
  const [checked, setChecked] = useState(true);
  const [selected, setSelected] = useState('option-b');

  const settingGroups: Array<SettingGroup> = [
    {
      'data-testid': 'group-preferences',
      title: 'Preferences',
      description: 'Personal display and notification preferences.',
      settingItems: [
        {
          type: 'checkbox',
          title: 'Desktop notification',
          description: 'Show a desktop notification for long-running tasks.',
          defaultValue: false,
          value: checked,
          onChange: (value) => setChecked(!!value),
        },
        {
          type: 'select',
          title: 'Language',
          description: 'Interface display language.',
          selectProps: {
            options: [
              { label: 'English (Default)', value: 'option-a' },
              { label: 'Korean', value: 'option-b' },
              { label: 'Japanese', value: 'option-c' },
            ],
            hasSearch: true,
          },
          defaultValue: 'option-a',
          value: selected,
          onChange: (value) => setSelected(value ?? 'option-a'),
        },
        {
          type: 'custom',
          title: 'SSH keypair management',
          description: 'Manage your personal SSH keypair.',
          children: <button type="button">Config</button>,
          showResetButton: false,
        },
      ],
    },
    {
      'data-testid': 'group-empty',
      title: 'Empty group',
      settingItems: [],
    },
  ];

  return (
    <SettingList
      settingGroups={settingGroups}
      showSearchBar
      showChangedOptionFilter
      showResetButton
    />
  );
};

const cases: Record<string, React.ReactNode> = {
  settingList: <SettingListCase />,
  information: <Information />,
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const App: React.FC = () => (
  <Theme theme={backendAiBrandTheme} mode={mode}>
    <QueryClientProvider client={queryClient}>
      <div
        style={{
          minHeight: '100vh',
          padding: 24,
          backgroundColor: 'var(--color-background-body)',
          color: 'var(--color-text-primary)',
        }}
      >
        <Suspense fallback={<div id="probe-loading">loading…</div>}>
          {cases[which] ?? cases.settingList}
        </Suspense>
      </div>
    </QueryClientProvider>
  </Theme>
);

createRoot(document.getElementById('root')!).render(<App />);
