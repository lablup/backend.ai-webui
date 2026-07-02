/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useDebounce, useNetwork } from 'ahooks';
import { Alert } from 'antd';
import { createStyles } from 'antd-style';
import { atom, useSetAtom } from 'jotai';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

const isDisplayedNetworkStatusState = atom(false);

const REACHABILITY_PROBE_INTERVAL_MS = 5_000;
const REACHABILITY_PROBE_TIMEOUT_MS = 5_000;

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
  const setDisplayedStatus = useSetAtom(isDisplayedNetworkStatusState);
  const { styles } = useStyles();
  const [showSoftTimeoutAlert, setShowSoftTimeoutAlert] = useState(false);
  const [dismissSoftTimeoutAlert, setDismissSoftTimeoutAlert] = useState(false);
  const [endpointUnreachable, setEndpointUnreachable] = useState(false);

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
  // networks. Before concluding the user is offline, confirm with a plain
  // fetch to the endpoint's `/health`, bounded so a genuinely unreachable
  // endpoint surfaces the banner within ~5s instead of hanging.
  const probeEndpointReachability = useEffectEvent(async () => {
    try {
      // Same `endpoint + path` join convention as the client's own requests
      // (`new URL('/health', endpoint)` would drop any path prefix).
      const resp = await fetch(`${client._config.endpoint}/health`, {
        signal: AbortSignal.timeout(REACHABILITY_PROBE_TIMEOUT_MS),
      });
      return !resp.ok;
    } catch {
      return true;
    }
  });

  // Probe only while the browser reports offline: once immediately, then
  // periodically so the banner reflects the current endpoint reachability.
  // The cleanup both drops in-flight results (`disposed`) and resets the
  // state so the next offline episode starts with the banner hidden instead
  // of flashing a stale failure from the previous episode.
  useEffect(() => {
    if (!browserOffline) {
      return;
    }
    let disposed = false;
    const runProbe = async () => {
      const unreachable = await probeEndpointReachability();
      if (!disposed) {
        setEndpointUnreachable(unreachable);
      }
    };
    runProbe();
    const intervalId = setInterval(runProbe, REACHABILITY_PROBE_INTERVAL_MS);
    return () => {
      disposed = true;
      clearInterval(intervalId);
      setEndpointUnreachable(false);
    };
  }, [browserOffline]);

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
