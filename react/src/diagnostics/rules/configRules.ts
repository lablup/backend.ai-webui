/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../../types/diagnostics';

/**
 * Check if the blocklist contains menu keys that don't exist.
 * Invalid blocklist entries have no effect and may indicate a typo or
 * an outdated config referencing removed menu items.
 */
export function checkBlocklistValidity(
  blockList: readonly string[],
  validMenuKeys: readonly string[],
): DiagnosticResult | null {
  if (!blockList || blockList.length === 0) return null;

  const invalidEntries = blockList.filter(
    (key) => !validMenuKeys.includes(key),
  );

  if (invalidEntries.length > 0) {
    return {
      id: 'config-invalid-blocklist',
      severity: 'warning',
      titleKey: 'diagnostics.InvalidBlocklistEntries',
      descriptionKey: 'diagnostics.InvalidBlocklistEntriesDesc',
      remediationKey: 'diagnostics.InvalidBlocklistEntriesFix',
      interpolationValues: {
        entries: invalidEntries.join(', '),
        count: String(invalidEntries.length),
      },
    };
  }

  return null;
}
