/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { useStorageProxyDiagnosticsQuery } from '../__generated__/useStorageProxyDiagnosticsQuery.graphql';
import { checkStorageVolumeHealth } from '../diagnostics/rules/storageProxyRules';
import type { StorageVolumeInfo } from '../diagnostics/rules/storageProxyRules';
import type { DiagnosticResult } from '../types/diagnostics';
import { useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Hook that checks storage volume health.
 * Suspends while loading storage volume data via GraphQL.
 */
export function useStorageProxyDiagnostics(): DiagnosticResult[] {
  'use memo';

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
      { fetchPolicy: 'store-and-network' },
    );

  return useMemo(() => {
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

      const healthCheck = checkStorageVolumeHealth(volumeInfo);
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
  }, [storageVolumeList?.items]);
}
