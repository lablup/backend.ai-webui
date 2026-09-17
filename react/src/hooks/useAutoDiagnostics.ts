/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
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
 * Hook that runs the critical diagnostic checks after login and exposes the
 * highest severity via a Jotai atom for the sidebar badge.
 *
 * Mount only for superadmins (`AutoDiagnosticsEffect` in routes.tsx gates
 * this) — the underlying hooks issue superadmin-scoped requests
 * (e.g. `storage_volume_list`) as soon as they run (FR-3892).
 */
export function useAutoDiagnostics(): void {
  'use memo';

  const setDiagnosticsBadgeSeverity = useSetAtom(diagnosticsBadgeSeverityAtom);

  // Reuse existing diagnostics hooks to avoid duplicating API requests
  const { results: endpointResults } = useEndpointDiagnostics();
  const cspResults = useCspDiagnostics();
  const configResults = useWebServerConfigDiagnostics();
  const storageResults = useStorageProxyDiagnostics();

  const allResults: DiagnosticResult[] = [
    ...endpointResults,
    ...cspResults,
    ...configResults,
    ...storageResults,
  ];

  // Highest severity wins: critical > warning > null
  const highestSeverity: BadgeSeverity = allResults.some(
    (r) => r.severity === 'critical',
  )
    ? 'critical'
    : allResults.some((r) => r.severity === 'warning')
      ? 'warning'
      : null;

  useEffect(() => {
    setDiagnosticsBadgeSeverity(highestSeverity);
  }, [highestSeverity, setDiagnosticsBadgeSeverity]);
}
