/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce, useNetwork } from 'ahooks';
import { Alert } from 'antd';
import { createStyles } from 'antd-style';
import { atom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const isDisplayedNetworkStatusState = atom(false);

// Shared between the reachability probe query and the reset-on-reconnect effect
// so the two never drift out of sync.
const ENDPOINT_REACHABILITY_PROBE_KEY = [
  'NetworkStatusBanner',
  'endpointReachabilityProbe',
] as const;

const useStyles = createStyles(({ token, css }) => ({
  borderError: css`
    border-bottom: 1px solid ${token.colorErrorBorder} !important;
    padding-left: ${token.marginLG}px;
    padding-right: ${token.marginLG}px;
  `,
  borderWarning: css`
    border-bottom: 1px solid ${token.colorWarningBorder} !important;
    padding-left: ${token.marginLG}px;
    padding-right: ${token.marginLG}px;
  `,
}));
const NetworkStatusBanner = () => {
  'use memo';
  const { t } = useTranslation();
  const network = useNetwork();
  const client = useSuspendedBackendaiClient();
  const queryClient = useQueryClient();
  const setDisplayedStatus = useSetAtom(isDisplayedNetworkStatusState);
  const { styles } = useStyles();
  const [showSoftTimeoutAlert, setShowSoftTimeoutAlert] = useState(false);
  const [dismissSoftTimeoutAlert, setDismissSoftTimeoutAlert] = useState(false);

  useEffect(() => {
    const softHandler = () => {
      setShowSoftTimeoutAlert(true);
    };
    const successHandler = () => {
      setShowSoftTimeoutAlert(false);
      setDismissSoftTimeoutAlert(false);
    };
    document.addEventListener('backend-ai-network-soft-time-out', softHandler);
    document.addEventListener(
      'backend-ai-network-success-without-soft-time-out',
      successHandler,
    );
    return () => {
      document.removeEventListener(
        'backend-ai-network-soft-time-out',
        softHandler,
      );
      document.removeEventListener(
        'backend-ai-network-success-without-soft-time-out',
        successHandler,
      );
    };
  }, []);

  const debouncedShowAlert = useDebounce(showSoftTimeoutAlert, {
    leading: true,
    trailing: true,
    wait: 5_000,
  });

  const browserOffline = !network.online;

  // `navigator.onLine` (via ahooks `useNetwork`) is only a heuristic and is
  // frequently a false positive on VPNs, captive portals, or virtualized
  // networks. Before concluding the user is offline, confirm with one
  // lightweight public request to the API endpoint — the same `GET /` probe
  // the login flow issues through `get_manager_version()`. `getServerVersion`
  // is used directly here because `get_manager_version` caches its result
  // after the first success and would no longer hit the network post-login.
  const { isError: endpointUnreachable } = useTanQuery({
    queryKey: [...ENDPOINT_REACHABILITY_PROBE_KEY, client._config.endpoint],
    queryFn: async () => {
      // Bound the probe so a genuinely unreachable endpoint surfaces the
      // banner within ~5s instead of hanging on the client-wide timeout.
      await client.getServerVersion(AbortSignal.timeout(5_000));
      return true;
    },
    // Only probe while the browser reports offline; re-probe periodically so
    // the banner reflects the current endpoint reachability, not a stale
    // one-shot result.
    enabled: browserOffline,
    // A disabled query does not poll, so this only runs while `browserOffline`.
    refetchInterval: 5_000,
    retry: false,
    staleTime: 0,
  });

  // The query observer stays mounted for the component's lifetime, so a probe
  // error from one offline episode would linger in the cache and briefly flash
  // the banner at the start of the next episode (before the fresh probe
  // resolves). Reset the cached probe state whenever the browser is back online
  // so each offline episode starts from a clean slate.
  useEffect(() => {
    if (!browserOffline) {
      queryClient.resetQueries({ queryKey: ENDPOINT_REACHABILITY_PROBE_KEY });
    }
  }, [browserOffline, queryClient]);

  // Show the offline banner only when the browser reports offline AND the
  // endpoint probe confirms it is actually unreachable. While the probe is in
  // flight (before its first failure) the banner stays hidden.
  const shouldOpenOfflineAlert = browserOffline && endpointUnreachable;
  const shouldOpenSoftAlert =
    !shouldOpenOfflineAlert && debouncedShowAlert && !dismissSoftTimeoutAlert;

  useEffect(() => {
    setDisplayedStatus(shouldOpenOfflineAlert || shouldOpenSoftAlert);
  }, [setDisplayedStatus, shouldOpenOfflineAlert, shouldOpenSoftAlert]);

  return (
    <>
      {shouldOpenOfflineAlert && (
        <Alert
          title={t('webui.YouAreOffline')}
          className={styles.borderError}
          type="error"
          banner
        />
      )}
      {shouldOpenSoftAlert && (
        <Alert
          title={t('webui.NetworkSoftTimeout')}
          className={styles.borderWarning}
          banner
          closable={{
            onClose: () => {
              setDismissSoftTimeoutAlert(true);
            },
          }}
        />
      )}
    </>
  );
};

export default NetworkStatusBanner;
