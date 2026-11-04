/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkEndpoint, type EndpointCheck } from '../helper/electronEndpoint';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

type EndpointError = Extract<EndpointCheck, { ok: false }>['error'];

export interface ElectronEndpointStep {
  /** The endpoint step replaces the login form. */
  isStepOpen: boolean;
  isConnecting: boolean;
  error: EndpointError | null;
  /** The confirmed server named no domain, so its PUBLIC settings were not read. */
  hasNoDomain: boolean;
  continueWith: (raw: string) => Promise<void>;
  changeEndpoint: () => void;
}

/**
 * Electron reads the server's config.toml and PUBLIC settings before the login
 * form (#10872). A stored endpoint is confirmed on its own each time the
 * panel opens (start-up, after a logout); "Change endpoint" asks again.
 */
export function useElectronEndpointStep({
  isElectron,
  isPanelOpen,
  storedEndpoint,
  onConfirmed,
}: {
  isElectron: boolean;
  isPanelOpen: boolean;
  storedEndpoint: string;
  onConfirmed: (endpoint: string) => void;
}): ElectronEndpointStep {
  'use memo';
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<EndpointError | null>(null);
  const [hasNoDomain, setHasNoDomain] = useState(false);
  const autoTriedRef = useRef(false);

  const continueWith = async (raw: string) => {
    setIsConnecting(true);
    setError(null);
    const result = await checkEndpoint(raw);
    setIsConnecting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setHasNoDomain(!result.hasDomain);
    setConfirmed(result.endpoint);
    onConfirmed(result.endpoint);
  };

  const confirmStored = useEffectEvent(() => {
    if (autoTriedRef.current || confirmed !== null || !storedEndpoint) return;
    autoTriedRef.current = true;
    void continueWith(storedEndpoint);
  });
  useEffect(() => {
    if (isElectron && isPanelOpen) confirmStored();
  }, [isElectron, isPanelOpen]);

  return {
    isStepOpen: isElectron && confirmed === null,
    isConnecting,
    error,
    hasNoDomain,
    continueWith,
    changeEndpoint: () => {
      autoTriedRef.current = true;
      setConfirmed(null);
      setError(null);
      setHasNoDomain(false);
    },
  };
}
