/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { loginConfigState } from './useWebUIConfig';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

/**
 * Hook to resolve the Backend.AI API endpoint.
 * Checks sources in order:
 * 1. localStorage (set by LoginView after config parsing)
 * 2. The login config atom (set by useInitializeConfig)
 * 3. Empty string as fallback
 */
export const useApiEndpoint = (): string => {
  const loginConfig = useAtomValue(loginConfigState);

  return useMemo(() => {
    // First, try localStorage (most reliable source after login)
    const stored = localStorage.getItem('backendaiwebui.api_endpoint');
    if (stored) {
      return stored.replace(/^"+|"+$/g, '');
    }

    // Second, try the login config atom
    if (loginConfig?.api_endpoint) {
      return loginConfig.api_endpoint;
    }

    return '';
  }, [loginConfig]);
};
