/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RuntimeParameterDef,
  RuntimeParameterCategory,
  RUNTIME_PARAMETER_FALLBACKS,
} from '../constants/runtimeParameterFallbacks';
import { useMemo } from 'react';

export interface RuntimeParameterGroup {
  category: RuntimeParameterCategory;
  params: RuntimeParameterDef[];
}

/**
 * Hook that returns runtime parameter definitions grouped by category.
 *
 * Currently uses fallback metadata only. When the server extends
 * RuntimeVariantPreset.target_spec with ui_type/category/min/max/step fields,
 * this hook should fetch via GraphQL and merge with fallback data.
 *
 * @param runtimeVariant - The selected runtime variant name (e.g., "vllm", "sglang")
 * @returns Grouped parameter definitions, or null if the variant has no parameter schema
 */
// TODO(needs-backend): FR-2446 — Add GraphQL fetch and merge with server schema
export function useRuntimeParameterSchema(
  runtimeVariant: string | undefined,
): RuntimeParameterGroup[] | null {
  return useMemo(() => {
    if (!runtimeVariant) return null;

    const params = RUNTIME_PARAMETER_FALLBACKS[runtimeVariant];
    if (!params || params.length === 0) return null;

    // Group by category and sort by rank within each group
    const grouped = new Map<RuntimeParameterCategory, RuntimeParameterDef[]>();
    for (const param of params) {
      const group = grouped.get(param.category) ?? [];
      group.push(param);
      grouped.set(param.category, group);
    }

    // Sort params within each group by rank
    for (const group of grouped.values()) {
      group.sort((a, b) => a.rank - b.rank);
    }

    // Return in display order: sampling → context → advanced
    const categoryOrder: RuntimeParameterCategory[] = [
      'sampling',
      'context',
      'advanced',
    ];

    return categoryOrder
      .filter((cat) => grouped.has(cat))
      .map((cat) => ({
        category: cat,
        params: grouped.get(cat)!,
      }));
  }, [runtimeVariant]);
}

/**
 * Build a defaults map from parameter definitions.
 * Used for excluding default values from the serialized args string.
 */
export function buildDefaultsMap(
  groups: RuntimeParameterGroup[],
): Record<string, string> {
  const defaults: Record<string, string> = {};
  for (const group of groups) {
    for (const param of group.params) {
      defaults[param.key] = param.defaultValue;
    }
  }
  return defaults;
}

/**
 * Build a set of known schema keys from parameter definitions.
 * Used for reverse-mapping existing EXTRA_ARGS to UI controls.
 */
export function buildSchemaKeySet(
  groups: RuntimeParameterGroup[],
): Set<string> {
  const keys = new Set<string>();
  for (const group of groups) {
    for (const param of group.params) {
      keys.add(param.key);
    }
  }
  return keys;
}
