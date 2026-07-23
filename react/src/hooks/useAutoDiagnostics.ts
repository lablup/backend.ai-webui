/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import type { DiagnosticResult } from '../types/diagnostics';
import { useCspDiagnostics } from './useCspDiagnostics';
import { useEndpointDiagnostics } from './useEndpointDiagnostics';
import { useStorageProxyDiagnostics } from './useStorageProxyDiagnostics';
import { useWebServerConfigDiagnostics } from './useWebServerConfigDiagnostics';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

type BadgeSeverity = 'critical' | 'warning' | null;

/**
 * Atom that holds the highest severity level from auto-diagnostics results.
 * - `null` means no issues detected or diagnostics haven't run yet.
 * - `'warning'` means at least one warning was found.
 * - `'critical'` means at least one critical issue was found.
 */
export const diagnosticsBadgeSeverityAtom = atom<BadgeSeverity>(null);

/**
 * Hook to read the current diagnostics badge severity from the sidebar.
 */
export function useDiagnosticsBadgeSeverity(): BadgeSeverity {
  return useAtomValue(diagnosticsBadgeSeverityAtom);
}

/**
 * Hook that runs a subset of critical diagnostic checks after login
 * and exposes the highest severity via a Jotai atom for the sidebar badge.
 *
 * - Only runs for superadmin users.
 * - Runs asynchronously and does NOT block the login flow.
 * - Reuses the existing diagnostics hooks for consistency with the diagnostics page.
 */
export function useAutoDiagnostics(): void {
  'use memo';

  const setDiagnosticsBadgeSeverity = useSetAtom(diagnosticsBadgeSeverityAtom);
  const baiClient = useSuspendedBackendaiClient();

  const isSuperAdmin: boolean = !!baiClient?.is_superadmin;

  // Reuse existing diagnostics hooks to avoid duplicating API requests
  const { results: endpointResults } = useEndpointDiagnostics();
  const cspResults = useCspDiagnostics();
  const configResults = useWebServerConfigDiagnostics();
  const storageResults = useStorageProxyDiagnostics();

  // Compute critical results by filtering results from the shared hooks
  const criticalResults: DiagnosticResult[] = (() => {
    if (!isSuperAdmin) return [];

    const allResults: DiagnosticResult[] = [
      ...endpointResults,
      ...cspResults,
      ...configResults,
      ...storageResults,
    ];

    return allResults.filter(
      (r) => r.severity === 'critical' || r.severity === 'warning',
    );
  })();

  // Determine the highest severity: critical > warning > null
  const highestSeverity: BadgeSeverity = (() => {
    if (criticalResults.some((r) => r.severity === 'critical')) {
      return 'critical';
    }
    if (criticalResults.some((r) => r.severity === 'warning')) {
      return 'warning';
    }
    return null;
  })();

  useEffect(() => {
    if (!isSuperAdmin) {
      setDiagnosticsBadgeSeverity(null);
      return;
    }
    setDiagnosticsBadgeSeverity(highestSeverity);
  }, [isSuperAdmin, highestSeverity, setDiagnosticsBadgeSeverity]);
}
