/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CSSTokenVariables } from '../components/MainLayout/MainLayout';
import { useResolvedApiEndpoint } from '../hooks/useResolvedApiEndpoint';
import React, { Suspense } from 'react';

const EduAppLauncherLazy = React.lazy(
  () => import('../components/EduAppLauncher'),
);

/**
 * Standalone page for education app launcher.
 * Renders outside MainLayout (no sidebar).
 *
 * sToken authentication is handled upstream at the route level in
 * `routes.tsx` by `STokenLoginBoundary`. The route captures `sToken` /
 * `extraParams` from the URL via nuqs and passes them down as props.
 * On successful login, the route calls `persistPostLoginState` but
 * intentionally does NOT strip the token from the URL — EduAppLauncher's
 * `_createEduSession` re-reads the original sToken for the subsequent
 * `eduApp.get_user_credential(sToken)` call. This page is only responsible
 * for resolving the API endpoint via `useResolvedApiEndpoint` (suspends
 * until `config.toml` load completes) and threading the captured values
 * into `EduAppLauncher`.
 */
const EduAppLauncherPage: React.FC<{
  sToken: string | null;
  extraParams: Record<string, string>;
}> = ({ sToken, extraParams }) => {
  return (
    <>
      <CSSTokenVariables />
      <Suspense fallback={null}>
        <EduAppLauncherPageContent sToken={sToken} extraParams={extraParams} />
      </Suspense>
    </>
  );
};

const EduAppLauncherPageContent: React.FC<{
  sToken: string | null;
  extraParams: Record<string, string>;
}> = ({ sToken, extraParams }) => {
  'use memo';
  const apiEndpoint = useResolvedApiEndpoint();

  return (
    <EduAppLauncherLazy
      apiEndpoint={apiEndpoint}
      active={true}
      sToken={sToken}
      extraParams={extraParams}
    />
  );
};

export default EduAppLauncherPage;
