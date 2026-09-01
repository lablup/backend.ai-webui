import { useEffect, useState } from 'react';

/**
 * Reports the browser's online/offline status and, where the Network
 * Information API exists, the current connection profile.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useNetwork`.
 */
export interface NetworkState {
  since?: Date;
  online?: boolean;
  rtt?: number;
  type?: string;
  downlink?: number;
  saveData?: boolean;
  downlinkMax?: number;
  effectiveType?: string;
}

interface NetworkInformationLike extends EventTarget {
  rtt?: number;
  type?: string;
  saveData?: boolean;
  downlink?: number;
  downlinkMax?: number;
  effectiveType?: string;
}

function getConnection(): NetworkInformationLike | null {
  if (typeof navigator !== 'object' || navigator === null) {
    return null;
  }
  const nav = navigator as Navigator & {
    connection?: NetworkInformationLike;
    mozConnection?: NetworkInformationLike;
    webkitConnection?: NetworkInformationLike;
  };
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

function getConnectionProperty(): Omit<NetworkState, 'since' | 'online'> {
  const connection = getConnection();
  if (!connection) {
    return {};
  }
  return {
    rtt: connection.rtt,
    type: connection.type,
    saveData: connection.saveData,
    downlink: connection.downlink,
    downlinkMax: connection.downlinkMax,
    effectiveType: connection.effectiveType,
  };
}

function useNetwork(): NetworkState {
  'use memo';
  const [state, setState] = useState<NetworkState>(() => ({
    since: undefined,
    online: navigator?.onLine,
    ...getConnectionProperty(),
  }));

  useEffect(() => {
    const onOnline = () => {
      setState((prev) => ({ ...prev, online: true, since: new Date() }));
    };
    const onOffline = () => {
      setState((prev) => ({ ...prev, online: false, since: new Date() }));
    };
    const onConnectionChange = () => {
      setState((prev) => ({ ...prev, ...getConnectionProperty() }));
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    const connection = getConnection();
    connection?.addEventListener('change', onConnectionChange);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      connection?.removeEventListener('change', onConnectionChange);
    };
  }, []);

  return state;
}

export default useNetwork;
