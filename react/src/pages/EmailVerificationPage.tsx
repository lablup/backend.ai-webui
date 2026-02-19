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
      {/* @ts-expect-error - custom Lit element not in JSX.IntrinsicElements */}
      <backend-ai-webui id="webui-shell" />
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
