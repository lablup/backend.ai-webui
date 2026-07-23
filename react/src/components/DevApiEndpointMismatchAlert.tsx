/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { devApiEndpointOverride } from '../helper/devLoginOverrides';
import { useSuspendedBackendaiClient } from '../hooks';
import { BAIAlert } from 'backend.ai-ui';

/**
 * Dev-only banner shown when the backend the app is ACTUALLY connected to
 * differs from the `VITE_DEFAULT_API_ENDPOINT` this dev session configured.
 *
 * Purpose: when testing across several dev backends, make it obvious which
 * server the current session really talks to — instead of silently bouncing to
 * the login screen or leaving the developer guessing. This replaces the old
 * "force re-login on endpoint mismatch" behavior; the session stays connected
 * and this announcement surfaces the discrepancy.
 *
 * Production safety: `devApiEndpointOverride` is `undefined` in production
 * builds (`import.meta.env.DEV` is statically `false`), so the guard below is
 * dead-code eliminated and this component always renders `null` — the feature
 * never ships. The copy is intentionally hard-coded English: it is a developer
 * aid that never reaches an end user, so it is deliberately kept out of the
 * translated i18n bundles.
 */
const DevApiEndpointMismatchAlert: React.FC = () => {
  'use memo';

  const baiClient = useSuspendedBackendaiClient();

  // Bail out entirely (and let the bundler drop everything below) when the dev
  // override is absent — i.e. always in production.
  if (!devApiEndpointOverride) return null;

  const connectedEndpoint = (baiClient?._config?.endpoint ?? '')
    .trim()
    .replace(/\/+$/, '');

  if (!connectedEndpoint || connectedEndpoint === devApiEndpointOverride) {
    return null;
  }

  return (
    <BAIAlert
      showIcon
      closable
      type="warning"
      title="Dev: connected backend differs from VITE_DEFAULT_API_ENDPOINT"
      description={
        <>
          Connected to <b>{connectedEndpoint}</b>, but this dev session is
          configured for <b>{devApiEndpointOverride}</b>. The session was kept
          as-is (no auto-logout) — log out and sign in again if you meant to
          switch backends.
        </>
      }
    />
  );
};

export default DevApiEndpointMismatchAlert;
