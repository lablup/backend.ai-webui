/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { Banner } from '@astryxdesign/core/Banner';
import { useDebounce, useNetwork } from 'ahooks';
import { atom, useSetAtom } from 'jotai';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

const isDisplayedNetworkStatusState = atom(false);

const REACHABILITY_PROBE_INTERVAL_MS = 5_000;
const REACHABILITY_PROBE_TIMEOUT_MS = 5_000;

// PILOT-DECISION: antd `Alert banner` → Astryx `Banner container="section"`
// (MAPPING §4: `type`→`status`, `banner`→`container="section"`,
// `closable={{onClose}}`→`isDismissable`+`onDismiss`). The `createStyles`
// block that painted a coloured bottom border and the header's horizontal
// padding is DELETED, not translated: `container="section"` already renders
// the full-bleed page-level shape, and Astryx status colours are closed
// enums with no border escape hatch (P5). Dropping it also removes a P6
// hazard — the block's `!important` border override targeted antd's own
// alert box.
const NetworkStatusBanner = () => {
  'use memo';
  const { t } = useTranslation();
  const network = useNetwork();
  const client = useSuspendedBackendaiClient();
  const setDisplayedStatus = useSetAtom(isDisplayedNetworkStatusState);
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
        <Banner
          title={t('webui.YouAreOffline')}
          status="error"
          container="section"
        />
      )}
      {shouldOpenSoftAlert && (
        <Banner
          title={t('webui.NetworkSoftTimeout')}
          status="warning"
          container="section"
          isDismissable
          onDismiss={() => {
            setDismissSoftTimeoutAlert(true);
          }}
        />
      )}
    </>
  );
};

export default NetworkStatusBanner;
