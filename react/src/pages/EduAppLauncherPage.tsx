/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CSSTokenVariables } from '../components/MainLayout/MainLayout';
import { useEduAppApiEndpoint } from '../hooks/useEduAppApiEndpoint';
import React, { Suspense } from 'react';

const EduAppLauncherLazy = React.lazy(
  () => import('../components/EduAppLauncher'),
);

/**
 * Standalone page for education app launcher.
 * Renders outside MainLayout (no sidebar).
 *
 * Because this page is entered via a token URL and never goes through
 * LoginView, it resolves the API endpoint directly from `config.toml`
 * via `useEduAppApiEndpoint()`. The Suspense boundary below gates
 * EduAppLauncher rendering until endpoint resolution completes; the
 * resolved value may still be an empty string if every fallback source
 * is unavailable, in which case `EduAppLauncher._initClient` throws and
 * surfaces the error via notification.
 *
 * Notifications are rendered via `useSetBAINotification` inside
 * `EduAppLauncher`, which works on this anonymous page because
 * `DefaultProvidersForReactRoot` already wraps it in antd `App` (the
 * provider `App.useApp()` requires). The legacy
 * `NotificationForAnonymous` CustomEvent bridge is no longer needed
 * here; it remains exported for the other anonymous pages and
 * `MainLayout` that still rely on it.
 */
const EduAppLauncherPage: React.FC = () => {
  return (
    <>
      <CSSTokenVariables />
      <Suspense fallback={null}>
        <EduAppLauncherPageContent />
      </Suspense>
    </>
  );
};

const EduAppLauncherPageContent: React.FC = () => {
  'use memo';
  const apiEndpoint = useEduAppApiEndpoint();

  return <EduAppLauncherLazy apiEndpoint={apiEndpoint} active={true} />;
};

export default EduAppLauncherPage;