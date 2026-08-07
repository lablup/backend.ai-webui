/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Gap-components demo harness (to-astryx ticket 08).

 Renders the five components built for the antd->Astryx gap list in their key
 states, from the REAL modules under `react/src` (nothing is re-created here):

   BAISkeletonAstryx · useBAIBreakpoint · BAIPopconfirmAstryx
   BAIBadgeCountAstryx · BAINotificationStackAstryx

 plus the ticket-08 follow-up pair whose bare-SVG glyphs became Astryx
 `IconButton`s: BAISelectionLabel · BAICopyableText.

 Serves under the theme-probe Vite harness (no app shell, auth, or backend):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts
   -> http://127.0.0.1:9198/theme-probe/gap.html

 `?state=` selects the frame so each acceptance shot is deterministic:
   (none) | popconfirm | notifications
 Colour mode follows `prefers-color-scheme` (Playwright's `colorScheme`).
*/
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import BAIBadgeCount from '../src/components/astryx-bui/BAIBadgeCountAstryx';
import BAICopyableText from '../src/components/astryx-bui/BAICopyableText';
import BAINotificationStack from '../src/components/astryx-bui/BAINotificationStackAstryx';
import type { BAINotificationStackItem } from '../src/components/astryx-bui/BAINotificationStackAstryx';
import BAIPopconfirm from '../src/components/astryx-bui/BAIPopconfirmAstryx';
import BAISelectionLabel from '../src/components/astryx-bui/BAISelectionLabel';
import BAISkeleton from '../src/components/astryx-bui/BAISkeletonAstryx';
import '../src/index.css';
import {
  BAI_BREAKPOINT_QUERIES,
  useBAIBreakpoint,
} from '../src/theme-shim/breakpoints';
import './gap.css';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { IconButton } from '@astryxdesign/core/IconButton';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Theme } from '@astryxdesign/core/theme';
import i18next from 'i18next';
import { BellIcon, InboxIcon } from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';

// The harness mounts no app i18next instance, so the components' default
// button labels would render as raw keys. Minimal instance with just the keys
// these components ask for (P13: host-side keys live in resources/i18n/*.json).
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: {
        button: { Confirm: 'Confirm', Cancel: 'Cancel' },
        general: {
          NSelected: '{{count}} selected',
          DeselectAll: 'Deselect all',
        },
      },
    },
  },
});

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="section">
    <div className="section-title">{title}</div>
    <div className="section-body">{children}</div>
  </div>
);

/** A component that never resolves — the real Suspense-fallback pairing. */
const NeverResolves: React.FC = () => {
  throw new Promise<void>(() => {});
};

const SkeletonColumn: React.FC = () => (
  <div className="col">
    <div className="col-head">1 · BAISkeleton</div>
    <Section title='variant="paragraph" (antd default: title + 3 rows)'>
      <BAISkeleton />
    </Section>
    <Section title="rows={4} hasTitle={false}">
      <BAISkeleton rows={4} hasTitle={false} />
    </Section>
    <Section title="hasAvatar (antd avatar + paragraph)">
      <BAISkeleton hasAvatar rows={2} />
    </Section>
    <Section title='variant="input" size="small" (25 measured sites)'>
      <BAISkeleton variant="input" size="small" />
    </Section>
    <Section title='variant="input" (default size)'>
      <BAISkeleton variant="input" />
    </Section>
    <Section title='variant="button" + variant="block"'>
      <HStack gap={3} align="center">
        <BAISkeleton variant="button" />
        <BAISkeleton variant="block" width={120} height={64} radius={2} />
      </HStack>
    </Section>
    <Section title="as a Suspense fallback (header stays, body shimmers)">
      <Card>
        <VStack gap={3} align="stretch">
          <HStack gap={2} align="center" justify="between">
            <Text type="large">Folders</Text>
            <Button size="sm" label="New" />
          </HStack>
          <Suspense fallback={<BAISkeleton rows={3} />}>
            <NeverResolves />
          </Suspense>
        </VStack>
      </Card>
    </Section>
  </div>
);

const BreakpointColumn: React.FC = () => {
  const screens = useBAIBreakpoint();
  return (
    <div className="col">
      <div className="col-head">2 · useBAIBreakpoint</div>
      <Section title="live matchMedia state at this viewport">
        <VStack gap={2} align="stretch">
          {(Object.keys(screens) as Array<keyof typeof screens>).map((key) => (
            <HStack key={key} gap={3} align="center" justify="between">
              <Text type="label">{key}</Text>
              <Text type="supporting" color="secondary">
                {BAI_BREAKPOINT_QUERIES[key]}
              </Text>
              <Text
                type="label"
                color={screens[key] ? 'accent' : 'secondary'}
                data-breakpoint={key}
              >
                {screens[key] ? 'true' : 'false'}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Section>
      <Section title="window.innerWidth">
        <Text type="display-3">{String(window.innerWidth)}px</Text>
      </Section>
    </div>
  );
};

const PopconfirmColumn: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const [openKey, setOpenKey] = useState<string | null>(
    isOpen ? 'danger' : null,
  );
  return (
    <div className="col">
      <div className="col-head">3 · BAIPopconfirm</div>
      <Section title="reversible action (default)">
        <BAIPopconfirm
          title="Set as main"
          description="This keypair becomes the main keypair for your account."
          okText="Confirm"
          cancelText="Cancel"
          placement="before"
          isOpen={openKey === 'plain'}
          onOpenChange={(next) => setOpenKey(next ? 'plain' : null)}
          onConfirm={() => {}}
        >
          <Button variant="secondary" label="Set as main" />
        </BAIPopconfirm>
      </Section>
      <Section title="isDanger (antd okType=danger / okButtonProps.danger)">
        <BAIPopconfirm
          title="Reset changes?"
          description="Every unsaved change in this editor is discarded."
          okText="Reset"
          cancelText="Cancel"
          isDanger
          isOpen={openKey === 'danger'}
          onOpenChange={(next) => setOpenKey(next ? 'danger' : null)}
          onConfirm={async () => {
            await new Promise((r) => setTimeout(r, 400));
          }}
        >
          <Button variant="destructive" label="Reset" />
        </BAIPopconfirm>
      </Section>
      <Section title="title only (no description) — 3 measured sites">
        <BAIPopconfirm
          title="Leave this shared folder?"
          isOpen={openKey === 'bare'}
          onOpenChange={(next) => setOpenKey(next ? 'bare' : null)}
          onConfirm={() => {}}
        >
          <Button variant="ghost" label="Leave folder" />
        </BAIPopconfirm>
      </Section>
    </div>
  );
};

const BadgeColumn: React.FC = () => (
  <div className="col">
    <div className="col-head">4 · BAIBadgeCount</div>
    <Section title="count · count>max (99+) · showZero">
      <HStack gap={6} align="center">
        <BAIBadgeCount count={5} title="5 items" variant="error">
          <Button variant="secondary" label="Inbox" icon={<InboxIcon />} />
        </BAIBadgeCount>
        <BAIBadgeCount count={128} title="128 items" variant="error">
          <Button variant="secondary" label="Inbox" icon={<InboxIcon />} />
        </BAIBadgeCount>
        <BAIBadgeCount count={0} showZero title="0 items">
          <Button variant="secondary" label="Empty" />
        </BAIBadgeCount>
      </HStack>
    </Section>
    <Section title="hasDot · offset · size=small">
      <HStack gap={6} align="center">
        <BAIBadgeCount hasDot variant="error" title="Unread">
          <IconButton label="Notifications" icon={<BellIcon />} />
        </BAIBadgeCount>
        <BAIBadgeCount hasDot variant="success" offset={[-4, 4]} title="Online">
          <IconButton label="Notifications" icon={<BellIcon />} />
        </BAIBadgeCount>
        <BAIBadgeCount count={9} size="small" variant="error" title="9 items">
          <IconButton label="Notifications" icon={<BellIcon />} />
        </BAIBadgeCount>
      </HStack>
    </Section>
    <Section title="variant passthrough — the OPEN tab-count decision">
      <HStack gap={8} align="center">
        <BAIBadgeCount count={12} title="12 sessions">
          <Button variant="ghost" label="default" />
        </BAIBadgeCount>
        <BAIBadgeCount count={12} variant="info" title="12 sessions">
          <Button variant="ghost" label="info" />
        </BAIBadgeCount>
        <BAIBadgeCount count={12} variant="error" title="12 problems">
          <Button variant="ghost" label="error" />
        </BAIBadgeCount>
      </HStack>
      <Text type="supporting" color="secondary">
        antd&apos;s count badge was implicitly red; the default here is
        Astryx&apos;s own (neutral), so each migrated site states its colour.
      </Text>
    </Section>
  </div>
);

const IconButtonFollowUpColumn: React.FC = () => {
  const [count, setCount] = useState(3);
  return (
    <div className="col">
      <div className="col-head">
        follow-up · IconButton conversions (bare-SVG fix)
      </div>
      <Section title="BAISelectionLabel — ✕ clear control is an IconButton">
        <HStack gap={4} align="center">
          <BAISelectionLabel
            count={count}
            onClearSelection={() => setCount(0)}
          />
          {count === 0 ? (
            <Button
              size="sm"
              variant="ghost"
              label="Select 3 again"
              onClick={() => setCount(3)}
            />
          ) : null}
        </HStack>
      </Section>
      <Section title='BAISelectionLabel size="sm" · isDisabled'>
        <HStack gap={6} align="center">
          <BAISelectionLabel count={12} size="sm" onClearSelection={() => {}} />
          <BAISelectionLabel count={2} isDisabled onClearSelection={() => {}} />
        </HStack>
      </Section>
      <Section title="BAICopyableText — copy control is an IconButton">
        <VStack gap={2} align="start">
          <BAICopyableText copyLabel="Copy endpoint URL">
            https://api.backend.ai/v4
          </BAICopyableText>
          <BAICopyableText type="supporting" copyLabel="Copy access key">
            AKIAIOSFODNN7EXAMPLE
          </BAICopyableText>
        </VStack>
      </Section>
    </div>
  );
};

const NOTIFICATIONS: Array<BAINotificationStackItem> = [
  {
    key: 'clone',
    title: 'Cloning folder my-training-data',
    description: 'Copying 12.4 GB to ceph:fast',
    status: 'info',
    percent: 62,
    duration: null,
    onCancel: () => {},
    cancelText: 'Cancel',
  },
  {
    key: 'import',
    title: 'Model imported',
    description: 'Llama-3.1-8B-Instruct is ready in shared-models.',
    status: 'success',
    duration: null,
    actionText: 'View folder',
    onAction: () => {},
  },
  {
    key: 'scan',
    title: 'Scan failed',
    description: 'The registry did not respond within 30s.',
    status: 'error',
    duration: null,
    onRetry: () => {},
    retryText: 'Retry',
  },
  {
    key: 'starting',
    title: 'Starting background task',
    status: 'info',
    isProgressIndeterminate: true,
    duration: null,
  },
];

const Page: React.FC<{ state: string }> = ({ state }) => {
  const [notifications, setNotifications] = useState(
    state === 'notifications' ? NOTIFICATIONS : [],
  );
  return (
    <>
      <div className="page">
        <SkeletonColumn />
        <BreakpointColumn />
        <PopconfirmColumn isOpen={state === 'popconfirm'} />
        <BadgeColumn />
        <IconButtonFollowUpColumn />
      </div>
      <BAINotificationStack
        notifications={notifications}
        onClose={(key) =>
          setNotifications((prev) => prev.filter((n) => n.key !== key))
        }
      />
    </>
  );
};

const App: React.FC = () => {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const state =
    new URLSearchParams(window.location.search).get('state') ?? 'page';
  return (
    <Theme theme={backendAiBrandTheme} mode={dark ? 'dark' : 'light'}>
      <LayerProvider>
        <Page state={state} />
      </LayerProvider>
    </Theme>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
