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

  // `navigator.onLine` is only a heuristic (false positives on VPNs, captive
  // portals, virtualized networks), so confirm with the endpoint's `/health`
  // before concluding the user is offline.
  const probeEndpointReachability = useEffectEvent(async () => {
    try {
      const resp = await fetch(`${client._config.endpoint}/health`, {
        signal: AbortSignal.timeout(REACHABILITY_PROBE_TIMEOUT_MS),
      });
      return !resp.ok;
    } catch {
      return true;
    }
  });

  useEffect(
    function probeEndpointWhileBrowserOffline() {
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
      return function cleanupProbe() {
        disposed = true;
        clearInterval(intervalId);
        // Reset so the next offline episode doesn't flash a stale failure.
        setEndpointUnreachable(false);
      };
    },
    [browserOffline],
  );

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
