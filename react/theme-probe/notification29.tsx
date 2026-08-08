/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Background-task notification scenario harness (to-astryx ticket 29).

 Unlike `gap.tsx` — which feeds the presentational stack a static item list —
 this page mounts the REAL wiring end to end:

   NotificationHost's pair: `useBAINotificationEffect` (background-task
   promise listener + desktop mirror) and `BAINotificationStackHost`
   (adapter + `BAINotificationStackAstryx`), both imported from
   `react/src/hooks/useBAINotification.tsx`.

 Nothing about the notification path is re-created here; the page only calls
 `upsertNotification`, exactly as a page like FolderCreateModalV2 does.

   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5745
   -> http://127.0.0.1:5745/theme-probe/notification29.html

 `window.__notification29` exposes the same actions as the buttons so a
 measure script can drive the scenario deterministically.
*/
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import NotificationHost from '../src/components/NotificationHost';
import {
  CLOSING_DURATION,
  useSetBAINotification,
} from '../src/hooks/useBAINotification';
import '../src/index.css';
import { Button } from '@astryxdesign/core/Button';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Theme } from '@astryxdesign/core/theme';
import i18next from 'i18next';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

// Same rationale as gap.tsx: no app i18next instance here, so give the host
// the handful of keys it resolves for the action / cancel / retry labels.
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: {
        button: { Cancel: 'Cancel', Retry: 'Retry' },
        notification: { SeeDetail: 'See detail', SeeSummary: 'See summary' },
        sidePanel: { Notification: 'Notification' },
      },
    },
  },
});

const TASK_KEY = 'bgtask:clone-my-training-data';

const Scenario: React.FC = () => {
  const { upsertNotification, closeNotification, clearAllNotifications } =
    useSetBAINotification();
  const [log, setLog] = React.useState<Array<string>>([]);
  const note = (line: string) =>
    setLog((prev) => [...prev, `${new Date().toISOString().slice(11, 23)} ${line}`]);

  // The promise a real caller hands to `backgroundTask.promise`; resolving or
  // rejecting it is what drives useBAINotificationEffect's settle path.
  const settleRef = React.useRef<{
    resolve: (v: unknown) => void;
    reject: (e: unknown) => void;
  } | null>(null);

  const actions = React.useMemo(
    () => ({
      /** A long-running task starts: pending, no progress reported yet. */
      start: () => {
        const promise = new Promise((resolve, reject) => {
          settleRef.current = { resolve, reject };
        });
        upsertNotification({
          key: TASK_KEY,
          message: 'Cloning folder my-training-data',
          description: 'Copying 12.4 GB to ceph:fast',
          backgroundTask: { status: 'pending', promise },
          to: '/data',
          toText: 'View folder',
          onCancel: () => {
            note('action: cancel clicked');
            closeNotification(TASK_KEY);
          },
          open: true,
          skipDesktopNotification: true,
        });
        note('start: pending task opened (duration 0 = stays open)');
      },
      /** What the SSE `onUpdated` handler does on every progress event. */
      progress: (percent: number) => {
        upsertNotification({
          key: TASK_KEY,
          backgroundTask: { status: 'pending', percent },
          skipDesktopNotification: true,
        });
        note(`progress: ${percent}%`);
      },
      /** The task's promise resolves -> the hook flips it to success + auto-close. */
      resolve: () => {
        settleRef.current?.resolve({ ok: true });
        note(`resolve: settled, auto-close in ${CLOSING_DURATION}s`);
      },
      reject: () => {
        settleRef.current?.reject(new Error('The storage host did not respond.'));
        note('reject: settled as error');
      },
      /** A plain notice carrying the `to`/`toText` action link. */
      openActionNotice: () => {
        upsertNotification({
          key: 'action-notice',
          message: 'Model imported',
          description: 'Llama-3.1-8B-Instruct is ready in shared-models.',
          type: 'success',
          to: '/data',
          toText: 'View folder',
          open: true,
          duration: 0,
          skipDesktopNotification: true,
        });
        note('openActionNotice: notice with an action button');
      },
      /** An error notice whose detail sits behind the Banner's disclosure. */
      openExtraNotice: () => {
        upsertNotification({
          key: 'extra-notice',
          message: 'Scan failed',
          description: 'The registry did not respond within 30s.',
          extraDescription:
            'GET https://cr.backend.ai/v2/_catalog -> ETIMEDOUT after 30000ms',
          type: 'error',
          open: true,
          duration: 0,
          onRetry: () => note('action: retry clicked'),
          skipDesktopNotification: true,
        });
        note('openExtraNotice: error notice with extraDescription');
      },
      clear: () => {
        clearAllNotifications();
        note('clear: all notifications cleared');
      },
    }),
    [],
  );

  React.useEffect(() => {
    // @ts-expect-error - harness-only handle for the measure script.
    window.__notification29 = actions;
  }, [actions]);

  return (
    <VStack gap={4} align="stretch">
      <Text type="heading">Ticket 29 — background-task notification scenario</Text>
      <HStack gap={2} wrap>
        <Button label="1. Start task" onClick={actions.start} />
        <Button label="2. Progress 25%" onClick={() => actions.progress(25)} />
        <Button label="3. Progress 70%" onClick={() => actions.progress(70)} />
        <Button label="4. Resolve" variant="primary" onClick={actions.resolve} />
        <Button label="Reject" onClick={actions.reject} />
        <Button label="Action notice" onClick={actions.openActionNotice} />
        <Button label="Error + detail" onClick={actions.openExtraNotice} />
        <Button label="Clear" variant="ghost" onClick={actions.clear} />
      </HStack>
      <VStack gap={1} align="stretch">
        {log.map((line) => (
          <Text key={line} type="supporting">
            {line}
          </Text>
        ))}
      </VStack>
    </VStack>
  );
};

const App: React.FC = () => {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return (
    <Theme theme={backendAiBrandTheme} mode={dark ? 'dark' : 'light'}>
      <LayerProvider>
        {/* useWebUINavigate is react-router's useNavigate; the action button
            needs a router to navigate into, not a real one. */}
        <MemoryRouter>
          <div style={{ padding: 24 }}>
            <Scenario />
          </div>
          <NotificationHost />
        </MemoryRouter>
      </LayerProvider>
    </Theme>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
