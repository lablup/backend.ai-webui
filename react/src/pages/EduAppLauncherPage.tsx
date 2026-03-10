/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AppLauncherFlow from '../components/AppLauncherFlow';
import {
  CSSTokenVariables,
  NotificationForAnonymous,
} from '../components/MainLayout/MainLayout';
import { useAppLauncherParams } from '../hooks/useAppLauncherParams';
import { Spin } from 'antd';
import React, { Suspense } from 'react';

const CenteredSpin: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <Spin size="large" />
  </div>
);

/**
 * Standalone page for education app launcher.
 * Renders outside MainLayout (no sidebar).
 * Parses URL params and passes them to AppLauncherFlow.
 */
const EduAppLauncherPage: React.FC = () => {
  return (
    <>
      <CSSTokenVariables />
      <NotificationForAnonymous />
      <Suspense fallback={<CenteredSpin />}>
        <EduAppLauncherPageContent />
      </Suspense>
    </>
  );
};

const EduAppLauncherPageContent: React.FC = () => {
  'use memo';
  const params = useAppLauncherParams();
  return <AppLauncherFlow params={params} />;
};

export default EduAppLauncherPage;
