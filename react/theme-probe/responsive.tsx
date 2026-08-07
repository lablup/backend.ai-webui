/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 14 pilot harness — mounts the three REAL components converted under
 the responsive policy (nothing re-created here), so the before/after shots
 compare the actual modules at several viewport widths:

   ?case=picker  LightDarkColorPicker      (Row/Col responsive grid pilot)
   ?case=drawer  BAIContentWithDrawerArea  (Grid.useBreakpoint JS-branch pilot)
   ?case=modal   KeypairResourcePolicyInfoModal (token.screen* px-constant pilot)

 Serve under the theme-probe Vite harness (no app shell, auth, or backend):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts
   -> http://127.0.0.1:9198/theme-probe/responsive.html?case=picker
*/
import en from '../../resources/i18n/en.json';
import BAIContentWithDrawerArea from '../src/components/BAIContentWithDrawerArea';
import { isOpenDrawerState } from '../src/components/BAINotificationButton';
import KeypairResourcePolicyInfoModal from '../src/components/KeypairResourcePolicyInfoModal';
import LightDarkColorPicker from '../src/components/LightDarkColorPicker';
import '../src/index.css';
import i18next from 'i18next';
import { useSetAtom } from 'jotai';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

// Real host-side keys so labels render exactly as in the app (P13).
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'picker';

/** Pilot A — Row/Col responsive grid (settings-panel two-scheme picker). */
const PickerCase: React.FC = () => (
  <div style={{ padding: 24 }}>
    <LightDarkColorPicker
      light={{ value: '#FF7A00' }}
      dark={{ value: '#FFA94D' }}
    />
  </div>
);

/**
 * Pilot B — `xl`-gated drawer style. The atom is forced open so the branch
 * under test (`margin-style` at >=1200px, `overlay-style` below) is visible
 * as a 256px right margin on the content column.
 */
const DrawerCase: React.FC = () => {
  const setOpen = useSetAtom(isOpenDrawerState);
  useEffect(() => {
    setOpen(true);
  }, [setOpen]);
  return (
    <BAIContentWithDrawerArea drawerWidth={256}>
      <div
        style={{
          minHeight: 300,
          background: '#e6f4ff',
          border: '2px dashed #1677ff',
          padding: 16,
          fontFamily: 'sans-serif',
        }}
      >
        main content column — at ≥1200px (xl) the open notification drawer
        reserves a 256px margin on the right (margin-style); below xl it
        overlays instead (no margin).
      </div>
    </BAIContentWithDrawerArea>
  );
};

/** Pilot C — modal whose width was `token.screenSM` (576px constant). */
const ModalCase: React.FC = () => (
  <RelayEnvironmentProvider environment={createMockEnvironment()}>
    <KeypairResourcePolicyInfoModal
      open
      onRequestClose={() => {}}
      resourcePolicyFrgmt={null}
      mask={false}
      getContainer={false}
    />
  </RelayEnvironmentProvider>
);

const cases: Record<string, React.ReactNode> = {
  picker: <PickerCase />,
  drawer: <DrawerCase />,
  modal: <ModalCase />,
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{cases[which] ?? cases.picker}</React.StrictMode>,
);
