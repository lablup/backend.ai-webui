/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Resource allocation parameters for App Launcher sessions.
 */
export interface AppLauncherResources {
  cpu: string | null;
  mem: string | null;
  shmem: string | null;
  'cuda.shares': string | null;
  'cuda.device': string | null;
}

/**
 * Parsed URL parameters for the App Launcher.
 */
export interface AppLauncherParams {
  /** HMAC-SHA256 signed credential for authentication (required) */
  sToken: string | null;
  /** Backend.AI API version */
  api_version: string | null;
  /** Request timestamp */
  date: string | null;
  /** Backend.AI manager endpoint */
  endpoint: string | null;
  /** Existing session ID to launch app on */
  session_id: string | null;
  /** App to launch (default: 'jupyter') */
  app: string;
  /** Session template name for new session creation */
  session_template: string | null;
  /** Resource allocation parameters */
  resources: AppLauncherResources;
  /** Whether the params are valid (requires sToken) */
  isValid: boolean;
  /** Error message if params are invalid */
  error: string | null;
}

/**
 * Hook for parsing and validating App Launcher URL parameters.
 *
 * Handles:
 * - Case-insensitive sToken/stoken
 * - session_template/sessionTemplate alias
 * - cuda-shares -> cuda.shares and cuda-device -> cuda.device mapping
 *
 * @returns Parsed and validated App Launcher parameters
 */
export const useAppLauncherParams = (): AppLauncherParams => {
  'use memo';
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const sToken =
      searchParams.get('sToken') || searchParams.get('stoken') || null;

    const api_version = searchParams.get('api_version');
    const date = searchParams.get('date');
    const endpoint = searchParams.get('endpoint');
    const session_id = searchParams.get('session_id');
    const app = searchParams.get('app') || 'jupyter';
    const session_template =
      searchParams.get('session_template') ||
      searchParams.get('sessionTemplate') ||
      null;

    const resources: AppLauncherResources = {
      cpu: searchParams.get('cpu'),
      mem: searchParams.get('mem'),
      shmem: searchParams.get('shmem'),
      'cuda.shares': searchParams.get('cuda-shares'),
      'cuda.device': searchParams.get('cuda-device'),
    };

    const isValid = sToken !== null;
    const error = isValid ? null : 'sToken is required';

    return {
      sToken,
      api_version,
      date,
      endpoint,
      session_id,
      app,
      session_template,
      resources,
      isValid,
      error,
    };
  }, [searchParams]);
};
