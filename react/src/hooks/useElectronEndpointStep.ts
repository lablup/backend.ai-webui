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
  /** A stored endpoint is being confirmed; show a loader, not the step. */
  isCheckingStored: boolean;
  isConnecting: boolean;
  error: EndpointError | null;
  /** The confirmed server named no domain, so its PUBLIC settings were not read. */
  hasNoDomain: boolean;
  continueWith: (raw: string) => Promise<void>;
  changeEndpoint: () => void;
}

/**
 * Without an `apiEndpoint` in the app's own config.toml (always in Electron,
 * on the web when the file names none), the server's config.toml and PUBLIC
 * settings are read before the login form (#10872). A stored endpoint is
 * confirmed on its own each time the panel opens; "Change endpoint" asks again.
 */
export function useElectronEndpointStep({
  isEnabled,
  isPanelOpen,
  storedEndpoint,
  onConfirmed,
}: {
  isEnabled: boolean;
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
  // Pending only for an endpoint present at mount; it never starts later.
  const [isAutoPending, setIsAutoPending] = useState(
    () => isEnabled && !!storedEndpoint,
  );

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
    void continueWith(storedEndpoint).finally(() => setIsAutoPending(false));
  });
  useEffect(() => {
    if (isEnabled && isPanelOpen) confirmStored();
  }, [isEnabled, isPanelOpen]);

  return {
    isStepOpen: isEnabled && confirmed === null,
    isCheckingStored:
      isEnabled && confirmed === null && isAutoPending && !!storedEndpoint,
    isConnecting,
    error,
    hasNoDomain,
    continueWith,
    changeEndpoint: () => {
      autoTriedRef.current = true;
      setIsAutoPending(false);
      setConfirmed(null);
      setError(null);
      setHasNoDomain(false);
    },
  };
}
