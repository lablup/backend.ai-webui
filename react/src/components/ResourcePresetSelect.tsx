/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ResourcePresetSelectQuery,
  ResourcePresetSelectQuery$data,
} from '../__generated__/ResourcePresetSelectQuery.graphql';
import { localeCompare } from '../helper';
import { ResourceSlotName, useResourceSlots } from '../hooks/backendai';
import useControllableState_deprecated from '../hooks/useControllableState';
import type {
  SelectorOptionData,
  SelectorOptionType,
} from '@astryxdesign/core/Selector';
import { Selector } from '@astryxdesign/core/Selector';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAIFlex,
  BAIIconWithTooltip,
  BAIResourceNumberWithIcon,
  useThrottleFn,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePen, Info } from 'lucide-react';
import React, { useEffect, useTransition } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * The option shape this component hands back through `onChange`. It used to be
 * derived from antd's `SelectProps['options']` element; now it is stated
 * directly, because the only consumer
 * (`SessionFormItems/ResourceAllocationFormItems`) reads nothing but the value.
 */
export interface PresetOptionType extends SelectorOptionData {
  preset?: ResourcePreset;
}

export type ResourcePreset = NonNullable<
  NonNullable<ResourcePresetSelectQuery$data['resource_presets']>[number]
>;

/**
 * PILOT-DECISION: the `extends Omit<SelectProps,'onChange'>` surface is
 * replaced by the props the single call site actually passes (P1 — grepped,
 * not guessed: `showCustom`, `showMinimumRequired`, `onChange`,
 * `allocatablePresetNames`, `resourceGroup`; the Form injects `value`), plus
 * the usual disabled/loading/style trio.
 */
export interface ResourcePresetSelectProps {
  /** Injected by `Form.Item`. */
  value?: string;
  onChange?: (value: string, options: PresetOptionType) => void;
  allocatablePresetNames?: string[];
  showMinimumRequired?: boolean;
  showCustom?: boolean;
  resourceGroup?: string;
  autoSelectDefault?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}
const ResourcePresetSelect: React.FC<ResourcePresetSelectProps> = ({
  allocatablePresetNames,
  showCustom,
  showMinimumRequired,
  resourceGroup,
  autoSelectDefault,
  disabled,
  style,
  ...selectProps
}) => {
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const { run: updateFetchKeyThrottled } = useThrottleFn(updateFetchKey, {
    wait: 3000,
    trailing: false,
    leading: true,
  });
  const [resourceSlots] = useResourceSlots();
  const { t } = useTranslation();
  const { token } = useTheme();
  const [isPendingUpdate, _startTransition] = useTransition();
  const [controllableValue, setControllableValue] =
    useControllableState_deprecated(selectProps);
  const updateFetchKeyUnderTransition = () => {
    _startTransition(() => {
      updateFetchKeyThrottled();
    });
  };

  const { resource_presets } = useLazyLoadQuery<ResourcePresetSelectQuery>(
    graphql`
      query ResourcePresetSelectQuery {
        resource_presets {
          name
          resource_slots
          shared_memory
          scaling_group_name @since(version: "25.4.0")
        }
      }
    `,
    {},
    {
      fetchKey: fetchKey,
      fetchPolicy: fetchKey === 'first' ? 'store-and-network' : 'network-only',
    },
  );

  const resourcePresets = resourceGroup
    ? _.filter(
        resource_presets,
        (preset) =>
          preset?.scaling_group_name === resourceGroup ||
          _.isEmpty(preset?.scaling_group_name),
      )
    : resource_presets;

  const firstAvailablePresetName = [...(resourcePresets ?? [])]
    .filter(
      (p): p is NonNullable<typeof p> =>
        p != null &&
        (!allocatablePresetNames ||
          allocatablePresetNames.includes(p.name ?? '')),
    )
    .sort((a, b) => localeCompare(a.name ?? '', b.name ?? ''))[0]?.name;

  useEffect(() => {
    if (autoSelectDefault && !controllableValue && firstAvailablePresetName) {
      setControllableValue(firstAvailablePresetName, {
        value: firstAvailablePresetName,
        label: firstAvailablePresetName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectDefault, firstAvailablePresetName]);

  // PILOT-DECISION: antd `optionLabelProp="selectedLabel"` let an option carry
  // a rich `label` node for the popup and a plain string for the trigger.
  // Astryx `Selector` splits that natively — `label` IS the plain string (P2,
  // required), and the rich row moves into `renderOption` — so the parallel
  // `selectedLabel` field disappears rather than being emulated.
  const presetOptions: PresetOptionType[] = _.map(
    resourcePresets,
    (preset) => ({
      value: preset?.name ?? '',
      label: preset?.name ?? '',
      disabled: allocatablePresetNames
        ? !allocatablePresetNames.includes(preset?.name || '')
        : undefined,
      preset: preset ?? undefined,
    }),
  )
    .sort((a, b) => (a.disabled === b.disabled ? 0 : a.disabled ? 1 : -1))
    .sort((a, b) => localeCompare(a.value, b.value));

  const renderResourceRow = (option: SelectorOptionData) => {
    if (option.value === 'minimum-required') {
      return (
        <BAIFlex gap={'xs'}>
          {t('session.launcher.MiniumAllocation')}
          <BAIIconWithTooltip
            content={t('session.launcher.MiniumAllocationTooltip')}
            focusable={false}
            icon={
              <Info
                style={{ color: token('--color-text-secondary') }}
                size="1em"
              />
            }
          />
        </BAIFlex>
      );
    }
    const preset = presetOptions.find((o) => o.value === option.value)?.preset;
    if (!preset) return option.label;
    const slotsInfo: {
      [key in ResourceSlotName]: string;
    } = JSON.parse(preset.resource_slots || '{}');
    return (
      <BAIFlex direction="row" justify="between" gap={'xs'} style={{ flex: 1 }}>
        {preset.name}
        <BAIFlex direction="row" gap={'xxs'}>
          {_.map(
            _.omitBy(slotsInfo, (_slot, key) =>
              _.isEmpty(resourceSlots[key as ResourceSlotName]),
            ),
            (slot, key) => {
              return (
                <BAIResourceNumberWithIcon
                  key={key}
                  // @ts-ignore
                  type={key}
                  value={slot}
                  hideTooltip
                  opts={
                    key === 'mem' && preset.shared_memory
                      ? { shmem: Number(preset.shared_memory) }
                      : {}
                  }
                />
              );
            },
          )}
        </BAIFlex>
      </BAIFlex>
    );
  };

  const options: SelectorOptionType[] = [
    ...(showCustom
      ? [
          {
            value: 'custom',
            label: t('session.launcher.CustomAllocation'),
            icon: <SquarePen size="1em" />,
          },
        ]
      : []),
    ...(showMinimumRequired
      ? [
          {
            value: 'minimum-required',
            label: t('session.launcher.MiniumAllocation'),
          },
        ]
      : []),
    // antd `Select.OptGroup` → Astryx `{type: 'section'}` (a native option
    // kind, MAPPING §3.1 notwithstanding — `Selector` grew sections in 0.3.0).
    // QA-FINDINGS Q-40: the section title was the hardcoded English string
    // 'Preset'. `modelStore.Preset` is that exact word and is already
    // translated in all 21 locale files, so it is reused rather than adding a
    // 21-file duplicate of a single word. The namespace is inherited, not
    // ideal — if this string ever needs to diverge from the model-store one,
    // that is the moment to give it its own key.
    {
      type: 'section' as const,
      title: t('modelStore.Preset'),
      options: presetOptions,
    },
  ];

  return (
    // PILOT-DECISION: antd `onOpenChange` (used only to throttle-refetch the
    // presets when the popup opens) has no Astryx equivalent. Rather than lose
    // the refresh, the same trigger is read one level up — a `display:contents`
    // wrapper that sees the pointer-down that opens the popup.
    <div
      style={{ display: 'contents' }}
      onPointerDownCapture={() => {
        updateFetchKeyUnderTransition();
      }}
    >
      <Selector
        // QA-FINDINGS Q-40: `session.launcher.ResourcePresets` does not exist
        // in any locale file, so i18next fell through and Astryx rendered the
        // RAW KEY as this Selector's accessible name.
        // `resourcePreset.ResourcePresets` is the same string and is present in
        // all 21 locales.
        label={t('resourcePreset.ResourcePresets')}
        isLabelHidden
        isLoading={isPendingUpdate}
        isDisabled={disabled}
        style={style}
        width="100%"
        hasSearch
        options={options}
        renderOption={renderResourceRow}
        value={controllableValue ?? ''}
        onChange={(next) =>
          setControllableValue(
            next,
            presetOptions.find((o) => o.value === next) ?? { value: next },
          )
        }
      />
    </div>
  );
};

export default ResourcePresetSelect;
