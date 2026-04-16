/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useRuntimeParameterSchemaPresetsQuery } from '../__generated__/useRuntimeParameterSchemaPresetsQuery.graphql';
import { useRuntimeParameterSchemaVariantsQuery } from '../__generated__/useRuntimeParameterSchemaVariantsQuery.graphql';
import { toLocalId } from 'backend.ai-ui';
import { useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** Target for how the preset value is applied to the inference container. */
export type PresetTarget = 'ENV' | 'ARGS';

/** Data type for preset value validation. */
export type PresetValueType = 'STR' | 'INT' | 'FLOAT' | 'BOOL' | 'FLAG';

/** UI rendering type for the preset control. */
export type PresetUIType =
  | 'slider'
  | 'number_input'
  | 'select'
  | 'checkbox'
  | 'text_input';

export interface SelectOption {
  value: string;
  label: string;
}

/** A single runtime variant preset from the API. */
export interface RuntimeVariantPresetDef {
  /** Preset name (unique identifier within the variant). */
  name: string;
  /** Human-readable description of the parameter. */
  description: string | null;
  /** Display ordering (lower = shown first). */
  rank: number;
  /** UI category group (e.g., 'model_loading', 'resource_memory'). */
  category: string | null;
  /** Human-readable display label for the UI. */
  displayName: string | null;
  /** How the value is applied: ENV or ARGS. */
  presetTarget: PresetTarget;
  /** Data type for parsing/serialization. */
  valueType: PresetValueType;
  /** Default value (as string). */
  defaultValue: string | null;
  /** Env key or CLI flag key (e.g., '--dtype' or 'HF_TOKEN'). */
  key: string;
  /** UI rendering type. */
  uiType: PresetUIType | null;
  /** Slider config (min/max/step). */
  slider: { min: number; max: number; step: number } | null;
  /** Number input config (min/max). */
  number: { min: number | null; max: number | null } | null;
  /** Select/radio options. */
  choices: { items: ReadonlyArray<SelectOption> } | null;
  /** Text input placeholder. */
  text: { placeholder: string | null } | null;
}

/** Group of presets within the same category. */
export interface RuntimeParameterGroup {
  category: string;
  params: RuntimeVariantPresetDef[];
}

/**
 * Hook that fetches runtime variant presets from the API and returns them
 * grouped by category and sorted by rank.
 *
 * Uses two Relay queries:
 * 1. Resolves the runtime variant name to a UUID via `runtimeVariants`
 * 2. Fetches presets for that variant via `runtimeVariantPresets`
 *
 * @param runtimeVariant - The selected runtime variant name (e.g., "vllm", "sglang")
 * @returns Grouped preset definitions, or null if the variant has no presets
 */
export function useRuntimeParameterSchema(
  runtimeVariant: string | undefined,
): RuntimeParameterGroup[] | null {
  // Step 1: Resolve variant name → UUID
  const variantData = useLazyLoadQuery<useRuntimeParameterSchemaVariantsQuery>(
    graphql`
      query useRuntimeParameterSchemaVariantsQuery(
        $filter: RuntimeVariantFilter
      ) {
        runtimeVariantsResult: runtimeVariants(filter: $filter, first: 1)
          @catch(to: RESULT) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    {
      filter: runtimeVariant
        ? { name: { equals: runtimeVariant } }
        : { name: { equals: '__none__' } },
    },
    { fetchPolicy: 'store-or-network' },
  );

  const variantGlobalId =
    variantData.runtimeVariantsResult?.ok === true
      ? (variantData.runtimeVariantsResult.value?.edges?.[0]?.node?.id ?? null)
      : null;
  const variantRowId = variantGlobalId ? toLocalId(variantGlobalId) : null;

  // Step 2: Fetch presets for the resolved variant
  const presetsData = useLazyLoadQuery<useRuntimeParameterSchemaPresetsQuery>(
    graphql`
      query useRuntimeParameterSchemaPresetsQuery(
        $filter: RuntimeVariantPresetFilter
        $orderBy: [RuntimeVariantPresetOrderBy!]
      ) {
        runtimeVariantPresetsResult: runtimeVariantPresets(
          filter: $filter
          orderBy: $orderBy
          first: 100
        ) @catch(to: RESULT) {
          edges {
            node {
              name
              description
              rank
              category
              displayName
              targetSpec {
                presetTarget
                valueType
                defaultValue
                key
              }
              uiOption {
                uiType
                slider {
                  min
                  max
                  step
                }
                number {
                  min
                  max
                }
                choices {
                  items {
                    value
                    label
                  }
                }
                text {
                  placeholder
                }
              }
            }
          }
        }
      }
    `,
    {
      filter: variantRowId
        ? { runtimeVariantId: variantRowId }
        : // When no variant UUID, use an impossible filter to get 0 results
          { name: { equals: '__none__' } },
      orderBy: [{ field: 'RANK', direction: 'ASC' }],
    },
    { fetchPolicy: 'store-or-network' },
  );

  return useMemo(() => {
    if (!runtimeVariant || !variantRowId) return null;

    const edges =
      presetsData.runtimeVariantPresetsResult?.ok === true
        ? (presetsData.runtimeVariantPresetsResult.value?.edges ?? [])
        : [];

    if (edges.length === 0) return null;

    // Map edges to preset definitions
    const presets: RuntimeVariantPresetDef[] = edges
      .map((edge) => edge?.node)
      .filter(Boolean)
      .map((node) => ({
        name: node.name,
        description: node.description ?? null,
        rank: node.rank,
        category: node.category ?? null,
        displayName: node.displayName ?? null,
        presetTarget: node.targetSpec.presetTarget as PresetTarget,
        valueType: node.targetSpec.valueType as PresetValueType,
        defaultValue: node.targetSpec.defaultValue ?? null,
        key: node.targetSpec.key,
        uiType: (node.uiOption?.uiType as PresetUIType) ?? null,
        slider: node.uiOption?.slider
          ? {
              min: node.uiOption.slider.min,
              max: node.uiOption.slider.max,
              step: node.uiOption.slider.step,
            }
          : null,
        number: node.uiOption?.number
          ? {
              min: node.uiOption.number.min ?? null,
              max: node.uiOption.number.max ?? null,
            }
          : null,
        choices: node.uiOption?.choices
          ? {
              items: node.uiOption.choices.items.map((item) => ({
                value: item.value,
                label: item.label,
              })),
            }
          : null,
        text: node.uiOption?.text
          ? { placeholder: node.uiOption.text.placeholder ?? null }
          : null,
      }));

    // Group by category, maintaining rank order (already sorted by API)
    const grouped = new Map<string, RuntimeVariantPresetDef[]>();
    for (const preset of presets) {
      const cat = preset.category ?? 'general';
      const group = grouped.get(cat) ?? [];
      group.push(preset);
      grouped.set(cat, group);
    }

    // Convert to array preserving insertion order (which follows rank due to API ordering)
    return Array.from(grouped.entries()).map(([category, params]) => ({
      category,
      params,
    }));
  }, [runtimeVariant, variantRowId, presetsData]);
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
      if (param.defaultValue !== null) {
        defaults[param.key] = param.defaultValue;
      }
    }
  }
  return defaults;
}

/**
 * Build a set of known ARGS-type schema keys from parameter definitions.
 * Used for reverse-mapping existing EXTRA_ARGS to UI controls (only ARGS presets).
 */
export function buildArgsSchemaKeySet(
  groups: RuntimeParameterGroup[],
): Set<string> {
  const keys = new Set<string>();
  for (const group of groups) {
    for (const param of group.params) {
      if (param.presetTarget === 'ARGS') {
        keys.add(param.key);
      }
    }
  }
  return keys;
}

/**
 * Build a set of known ENV-type preset keys from parameter definitions.
 * Used for extracting individual env vars in edit mode.
 */
export function buildEnvPresetKeySet(
  groups: RuntimeParameterGroup[],
): Set<string> {
  const keys = new Set<string>();
  for (const group of groups) {
    for (const param of group.params) {
      if (param.presetTarget === 'ENV') {
        keys.add(param.key);
      }
    }
  }
  return keys;
}

/**
 * Derive the EXTRA_ARGS environment variable name for a given runtime variant.
 * Convention: `{VARIANT_UPPER}_EXTRA_ARGS` (e.g., vllm → VLLM_EXTRA_ARGS).
 */
export function getExtraArgsEnvVarName(runtimeVariant: string): string {
  return `${runtimeVariant.toUpperCase()}_EXTRA_ARGS`;
}

/**
 * Known runtime variant names that have EXTRA_ARGS env vars.
 * Used to clean up stale env vars when switching runtime variants.
 */
const KNOWN_EXTRA_ARGS_VARIANTS = ['vllm', 'sglang'];

/**
 * Returns all known EXTRA_ARGS env var names.
 * Used to clean up stale env vars when switching runtime variants.
 */
export function getAllExtraArgsEnvVarNames(): string[] {
  return KNOWN_EXTRA_ARGS_VARIANTS.map(getExtraArgsEnvVarName);
}

/**
 * Flatten all preset definitions from groups into a single array.
 */
export function flattenPresets(
  groups: RuntimeParameterGroup[],
): RuntimeVariantPresetDef[] {
  return groups.flatMap((g) => g.params);
}
