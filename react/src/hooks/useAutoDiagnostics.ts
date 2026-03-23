/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import type { DiagnosticResult } from '../types/diagnostics';
import { useSetBAINotification } from './useBAINotification';
import { useCspDiagnostics } from './useCspDiagnostics';
import { useEndpointDiagnostics } from './useEndpointDiagnostics';
import { useStorageProxyDiagnostics } from './useStorageProxyDiagnostics';
import { useWebServerConfigDiagnostics } from './useWebServerConfigDiagnostics';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

const AUTO_DIAGNOSTICS_DISMISSED_KEY = 'bai-auto-diagnostics-dismissed';

/**
 * Hook that runs a subset of critical diagnostic checks after login
 * and shows a notification if any critical issue is found.
 *
 * - Only runs for superadmin users.
 * - Uses sessionStorage to avoid re-showing the notification within the same session.
 * - Runs asynchronously and does NOT block the login flow.
 * - Reuses the existing diagnostics hooks for consistency with the diagnostics page.
 */
export function useAutoDiagnostics(): void {
  'use memo';

  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
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

  // useEffectEvent captures the latest callback values without making
  // them dependencies of the useEffect below.
  const showDiagnosticsNotification = useEffectEvent(() => {
    upsertNotification({
      key: 'auto-diagnostics-warning',
      title: t('diagnostics.AutoDiagnosticsTitle'),
      message: t('diagnostics.AutoDiagnosticsDesc'),
      duration: 0,
      open: true,
      to: '/diagnostics',
      toTextKey: t('diagnostics.ViewDiagnostics'),
    });
    try {
      sessionStorage.setItem(AUTO_DIAGNOSTICS_DISMISSED_KEY, '1');
    } catch {
      // sessionStorage write may fail in restrictive environments
    }
  });

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (criticalResults.length === 0) return;

    // Check sessionStorage dismissal flag
    try {
      if (sessionStorage.getItem(AUTO_DIAGNOSTICS_DISMISSED_KEY)) return;
    } catch {
      // sessionStorage may be unavailable (e.g., iframe sandbox)
      return;
    }

    showDiagnosticsNotification();
  }, [isSuperAdmin, criticalResults]);
}
