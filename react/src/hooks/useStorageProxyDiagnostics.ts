/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { useStorageProxyDiagnosticsQuery } from '../__generated__/useStorageProxyDiagnosticsQuery.graphql';
import {
  DEFAULT_STORAGE_WARNING_THRESHOLD,
  checkStorageVolumeHealth,
} from '../diagnostics/rules/storageProxyRules';
import type { StorageVolumeInfo } from '../diagnostics/rules/storageProxyRules';
import type { DiagnosticResult } from '../types/diagnostics';
import { useRawConfig } from './useWebUIConfig';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Parse and validate the storageWarningThreshold config value.
 * Returns a number between 0-100, or the default (90) if invalid.
 * Only accepts numeric types or non-empty numeric strings.
 */
function parseStorageWarningThreshold(raw: unknown): number {
  if (
    typeof raw !== 'number' &&
    (typeof raw !== 'string' || raw.trim() === '')
  ) {
    return DEFAULT_STORAGE_WARNING_THRESHOLD;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return DEFAULT_STORAGE_WARNING_THRESHOLD;
  }
  return value;
}

/**
 * Hook that checks storage volume health.
 * Suspends while loading storage volume data via GraphQL.
 */
export function useStorageProxyDiagnostics(
  fetchKey?: string,
): DiagnosticResult[] {
  'use memo';

  const rawConfig = useRawConfig();
  const storageWarningThreshold = parseStorageWarningThreshold(
    rawConfig?.resources?.storageWarningThreshold,
  );

  const { storage_volume_list: storageVolumeList } =
    useLazyLoadQuery<useStorageProxyDiagnosticsQuery>(
      graphql`
        query useStorageProxyDiagnosticsQuery {
          storage_volume_list(limit: 100, offset: 0) {
            items {
              id
              backend
              usage
            }
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network', fetchKey },
    );

  const results: DiagnosticResult[] = [];
  const items = storageVolumeList?.items ?? [];

  if (items.length === 0) {
    results.push({
      id: 'storage-no-volumes',
      severity: 'passed',
      category: 'storage',
      titleKey: 'diagnostics.StorageNoVolumes',
      descriptionKey: 'diagnostics.StorageNoVolumesDesc',
    });
    return results;
  }

  let healthIssueCount = 0;

  for (const item of items) {
    if (!item) continue;

    let usageInfo: { used_bytes: number; capacity_bytes: number } | undefined;
    if (item.usage) {
      try {
        const parsed = JSON.parse(item.usage as string);
        if (
          typeof parsed?.used_bytes === 'number' &&
          typeof parsed?.capacity_bytes === 'number'
        ) {
          usageInfo = {
            used_bytes: parsed.used_bytes,
            capacity_bytes: parsed.capacity_bytes,
          };
        }
      } catch {
        // Invalid usage JSON, skip
      }
    }

    const volumeInfo: StorageVolumeInfo = {
      id: item.id as string,
      backend: item.backend ?? 'unknown',
      usage: usageInfo,
    };

    const healthCheck = checkStorageVolumeHealth(
      volumeInfo,
      storageWarningThreshold,
    );
    if (healthCheck) {
      results.push(healthCheck);
      healthIssueCount++;
    }
  }

  if (healthIssueCount === 0) {
    results.push({
      id: 'storage-health-passed',
      severity: 'passed',
      category: 'storage',
      titleKey: 'diagnostics.StorageHealthPassed',
      descriptionKey: 'diagnostics.StorageHealthPassedDesc',
      interpolationValues: { count: String(items.length) },
    });
  }

  return results;
}
