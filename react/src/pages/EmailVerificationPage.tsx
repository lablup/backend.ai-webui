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

const EmailVerificationViewLazy = React.lazy(
  () => import('../components/EmailVerificationView'),
);

/**
 * Standalone page for email verification.
 * Renders outside MainLayout (no sidebar).
 * Gets apiEndpoint from localStorage or config.
 */
const EmailVerificationPage: React.FC = () => {
  return (
    <>
      <CSSTokenVariables />
      <NotificationForAnonymous />
      <Suspense fallback={null}>
        <EmailVerificationPageContent />
      </Suspense>
    </>
  );
};

const EmailVerificationPageContent: React.FC = () => {
  'use memo';
  const apiEndpoint = useApiEndpoint();

  return <EmailVerificationViewLazy apiEndpoint={apiEndpoint} active={true} />;
};

export default EmailVerificationPage;
