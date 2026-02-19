import {
  CSSTokenVariables,
  NotificationForAnonymous,
} from '../components/MainLayout/MainLayout';
import { useApiEndpoint } from '../hooks/useApiEndpoint';
import React, { Suspense } from 'react';

const ChangePasswordViewLazy = React.lazy(
  () => import('../components/ChangePasswordView'),
);

/**
 * Standalone page for changing forgotten password.
 * Renders outside MainLayout (no sidebar).
 * Gets apiEndpoint from localStorage or config.
 */
const ChangePasswordPage: React.FC = () => {
  return (
    <>
      <CSSTokenVariables />
      <NotificationForAnonymous />
      <Suspense fallback={null}>
        <ChangePasswordPageContent />
      </Suspense>
    </>
  );
};

const ChangePasswordPageContent: React.FC = () => {
  'use memo';
  const apiEndpoint = useApiEndpoint();

  return <ChangePasswordViewLazy apiEndpoint={apiEndpoint} active={true} />;
};

export default ChangePasswordPage;
