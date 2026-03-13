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
import { App, Button } from 'antd';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const AUTO_DIAGNOSTICS_DISMISSED_KEY = 'bai-auto-diagnostics-dismissed';

/**
 * Hook that runs a subset of critical diagnostic checks after login
 * and shows an antd notification if any critical issue is found.
 *
 * - Only runs for superadmin users.
 * - Uses sessionStorage to avoid re-showing the notification within the same session.
 * - Runs asynchronously and does NOT block the login flow.
 * - Reuses the existing diagnostics hooks for consistency with the diagnostics page.
 */
export function useAutoDiagnostics(): void {
  'use memo';

  const { t } = useTranslation();
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const baiClient = useSuspendedBackendaiClient();

  const isSuperAdmin: boolean = !!baiClient?.is_superadmin;

  // Reuse existing diagnostics hooks to avoid duplicating API requests
  const { results: endpointResults } = useEndpointDiagnostics();
  const cspResults = useCspDiagnostics();
  const configResults = useWebServerConfigDiagnostics();
  const storageResults = useStorageProxyDiagnostics();

  // Compute critical results by filtering results from the shared hooks
  const criticalResults = useMemo<DiagnosticResult[]>(() => {
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
  }, [
    isSuperAdmin,
    endpointResults,
    cspResults,
    configResults,
    storageResults,
  ]);

  // Track whether we have already shown the notification in this session
  const notificationShownRef = useRef(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (criticalResults.length === 0) return;
    if (notificationShownRef.current) return;

    // Check sessionStorage dismissal flag
    try {
      if (sessionStorage.getItem(AUTO_DIAGNOSTICS_DISMISSED_KEY)) return;
    } catch {
      // sessionStorage may be unavailable (e.g., iframe sandbox)
      return;
    }

    notificationShownRef.current = true;

    notification.warning({
      key: 'auto-diagnostics-warning',
      message: t('diagnostics.AutoDiagnosticsTitle'),
      description: t('diagnostics.AutoDiagnosticsDesc'),
      duration: 0,
      placement: 'bottomRight',
      btn: React.createElement(
        Button,
        {
          type: 'primary',
          size: 'small',
          onClick: () => {
            notification.destroy('auto-diagnostics-warning');
            navigate('/diagnostics');
          },
        },
        t('diagnostics.ViewDiagnostics'),
      ),
      onClose: () => {
        try {
          sessionStorage.setItem(AUTO_DIAGNOSTICS_DISMISSED_KEY, '1');
        } catch {
          // sessionStorage write may fail in restrictive environments
        }
      },
    });
  }, [isSuperAdmin, criticalResults, notification, navigate, t]);
}
