/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  CSSTokenVariables,
  NotificationForAnonymous,
} from '../components/MainLayout/MainLayout';
import { useApiEndpoint } from '../hooks/useApiEndpoint';
import React, { Suspense } from 'react';

const EduAppLauncherLazy = React.lazy(
  () => import('../components/EduAppLauncher'),
);

/**
 * Standalone page for education app launcher.
 * Renders outside MainLayout (no sidebar).
 * Gets apiEndpoint from localStorage or config.
 */
const EduAppLauncherPage: React.FC = () => {
  return (
    <>
      <CSSTokenVariables />
      <NotificationForAnonymous />
      <Suspense fallback={null}>
        <EduAppLauncherPageContent />
      </Suspense>
    </>
  );
};

const EduAppLauncherPageContent: React.FC = () => {
  'use memo';
  const apiEndpoint = useApiEndpoint();

  return <EduAppLauncherLazy apiEndpoint={apiEndpoint} active={true} />;
};

export default EduAppLauncherPage;
