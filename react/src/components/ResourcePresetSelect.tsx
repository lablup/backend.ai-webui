/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ResourcePresetSelectQuery,
  ResourcePresetSelectQuery$data,
} from '../__generated__/ResourcePresetSelectQuery.graphql';
import { localeCompare } from '../helper';
import {
  ResourceSlotName,
  useDeviceMetaData,
  useResourceSlots,
} from '../hooks/backendai';
import useControllableState_deprecated from '../hooks/useControllableState';
import type { SelectorOptionData } from '@lablup/ui-common/Selector';
import { Token } from '@lablup/ui-common/Token';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIFlex,
  BAIIconWithTooltip,
  BAIResourceNumberWithIcon,
  useThrottleFn,
  useUpdatableState,
  BAISelect,
  type BAISelectOption,
} from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import * as _ from 'lodash-es';
import { Info, SquarePen } from 'lucide-react';
import React, { useEffect, useTransition, type CSSProperties } from 'react';
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
  /** Set exactly when the option is disabled; shown on hover. */
  disabledReason?: string;
}

export type ResourcePreset = NonNullable<
  NonNullable<ResourcePresetSelectQuery$data['resource_presets']>[number]
>;

/**
 * Slots the preset requests (non-zero) that `availableSlotNames` lacks;
 * shmem is never a slot of its own.
 */
export const getUnavailableSlotNames = (
  resourceSlots: Record<string, unknown> | null | undefined,
  availableSlotNames: string[],
): string[] =>
  _.keys(
    _.pickBy(
      resourceSlots,
      (value, key) =>
        key !== 'shmem' &&
        !availableSlotNames.includes(key) &&
        (_.toNumber(value) || 0) !== 0,
    ),
  );

export type PresetUnavailableReason =
  | { kind: 'scoped'; resourceGroup: string }
  | { kind: 'missing-slots'; slots: string[] }
  | { kind: 'not-allocatable' };

/**
 * Why `preset` cannot be used in the resource group; undefined means it can.
 * An undefined scope part is not known yet and skips its check.
 */
export const getPresetUnavailableReason = (
  preset: {
    id?: string | null;
    scaling_group_name?: string | null;
    resource_slots?: Record<string, unknown> | null;
  },
  scope: {
    resourceGroup?: string | null;
    slotsInRG?: string[];
    allocatablePresetIds?: string[];
  },
): PresetUnavailableReason | undefined => {
  if (
    scope.resourceGroup &&
    preset.scaling_group_name &&
    preset.scaling_group_name !== scope.resourceGroup
  ) {
    return { kind: 'scoped', resourceGroup: preset.scaling_group_name };
  }
  const slots = scope.slotsInRG
    ? getUnavailableSlotNames(preset.resource_slots, scope.slotsInRG)
    : [];
  if (slots.length > 0) return { kind: 'missing-slots', slots };
  if (
    scope.allocatablePresetIds &&
    !scope.allocatablePresetIds.includes(preset.id ?? '')
  ) {
    return { kind: 'not-allocatable' };
  }
  return undefined;
};

/** The message for `reason`; `presetName` picks the wording that names the preset (the validator's) over the option's. */
export const presetUnavailableReasonText = (
  reason: PresetUnavailableReason | undefined,
  t: TFunction,
  slotNameOf: (key: string) => string,
  presetName?: string,
): string | undefined => {
  switch (reason?.kind) {
    case 'scoped':
      return presetName
        ? t('resourcePreset.PresetOnlyAvailableInResourceGroup', {
            preset: presetName,
            name: reason.resourceGroup,
          })
        : t('resourcePreset.OnlyAvailableInResourceGroup', {
            name: reason.resourceGroup,
          });
    case 'missing-slots':
      return t('resourcePreset.RequiresSlotsNotInResourceGroup', {
        slots: reason.slots.map(slotNameOf).join(', '),
      });
    case 'not-allocatable':
      return t('resourcePreset.ExceedsAllocatableResources');
    default:
      return undefined;
  }
};

/**
 * PILOT-DECISION: the `extends Omit<SelectProps,'onChange'>` surface is
 * replaced by the props the single call site actually passes (P1 — grepped,
 * not guessed: `showCustom`, `showMinimumRequired`, `onChange`,
 * `allocatablePresetIds`, `resourceGroup`; the Form injects `value`), plus
 * the usual disabled/loading/style trio.
 */
export interface ResourcePresetSelectProps {
  /** Injected by `Form.Item`. */
  value?: string;
  onChange?: (value: string, options: PresetOptionType) => void;
  allocatablePresetIds?: string[];
  showMinimumRequired?: boolean;
  showCustom?: boolean;
  resourceGroup?: string;
  /** Slots the resource group's agents provide; `undefined` while loading. */
  availableSlotNames?: string[];
  /** Presets scoped to a resource group outside this list are not listed. */
  selectableResourceGroupNames?: string[];
  autoSelectDefault?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}
const ResourcePresetSelect: React.FC<ResourcePresetSelectProps> = ({
  allocatablePresetIds,
  showCustom,
  showMinimumRequired,
  resourceGroup,
  availableSlotNames,
  selectableResourceGroupNames,
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
  const { data: deviceMetaData } = useDeviceMetaData();
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

  const { resource_presets: allResourcePresets } =
    useLazyLoadQuery<ResourcePresetSelectQuery>(
      graphql`
        query ResourcePresetSelectQuery {
          resource_presets {
            id
            name
            resource_slots
            shared_memory
            scaling_group_name
          }
        }
      `,
      {},
      {
        fetchKey: fetchKey,
        fetchPolicy:
          fetchKey === 'first' ? 'store-and-network' : 'network-only',
      },
    );

  const resource_presets = _.filter(
    allResourcePresets,
    (preset) =>
      !preset?.scaling_group_name ||
      !selectableResourceGroupNames ||
      selectableResourceGroupNames.includes(preset.scaling_group_name),
  );

  const onlyInGroupText = (name: string) =>
    t('resourcePreset.OnlyAvailableInResourceGroup', { name });

  // Why a preset cannot be picked right now; `undefined` means it can.
  const disabledReasonOf = (
    preset: ResourcePreset | null | undefined,
  ): string | undefined => {
    if (!preset) return undefined;
    return presetUnavailableReasonText(
      getPresetUnavailableReason(
        {
          ...preset,
          resource_slots: JSON.parse(preset.resource_slots || '{}'),
        },
        { resourceGroup, slotsInRG: availableSlotNames, allocatablePresetIds },
      ),
      t,
      (key) => deviceMetaData?.[key]?.human_readable_name ?? key,
    );
  };

  const firstAvailablePreset = [...(resource_presets ?? [])]
    .filter(
      (p): p is NonNullable<typeof p> => p != null && !disabledReasonOf(p),
    )
    .sort((a, b) => localeCompare(a.name ?? '', b.name ?? ''))[0];
  const firstAvailablePresetId = firstAvailablePreset?.id;

  useEffect(() => {
    if (autoSelectDefault && !controllableValue && firstAvailablePresetId) {
      setControllableValue(firstAvailablePresetId, {
        value: firstAvailablePresetId,
        label: firstAvailablePreset?.name ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectDefault, firstAvailablePresetId]);

  // `label` stays the plain string; the rich row is `optionRender`.
  const presetOptions: PresetOptionType[] = _.map(
    resource_presets,
    (preset) => {
      const disabledReason = disabledReasonOf(preset);
      return {
        // Names repeat across resource groups; the id is the option's key.
        value: preset?.id ?? '',
        label: preset?.name ?? '',
        disabled: !!disabledReason,
        disabledReason,
        preset: preset ?? undefined,
      };
    },
  )
    .sort((a, b) => (a.disabled === b.disabled ? 0 : a.disabled ? 1 : -1))
    .sort((a, b) => localeCompare(a.label, b.label));

  const renderResourceRow = (option: BAISelectOption) => {
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
    const presetOption = presetOptions.find((o) => o.value === option.value);
    const preset = presetOption?.preset;
    if (!preset) return option.label;
    const slotsInfo: {
      [key in ResourceSlotName]: string;
    } = JSON.parse(preset.resource_slots || '{}');
    const row = (
      <BAIFlex direction="row" justify="between" gap={'xs'} style={{ flex: 1 }}>
        <BAIFlex direction="row" gap={'xs'} align="center">
          {preset.name}
          {preset.scaling_group_name ? (
            // Global presets carry no mark; the token names the group this
            // one belongs to, so same-named rows tell apart. A disabled row
            // already explains itself, so the token stays quiet there.
            presetOption?.disabledReason ? (
              <Token label={preset.scaling_group_name} size="sm" />
            ) : (
              <Tooltip content={onlyInGroupText(preset.scaling_group_name)}>
                <Token label={preset.scaling_group_name} size="sm" />
              </Tooltip>
            )
          ) : null}
        </BAIFlex>
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
    return presetOption?.disabledReason ? (
      <Tooltip content={presetOption.disabledReason}>{row}</Tooltip>
    ) : (
      row
    );
  };

  // The closed trigger keeps the group token, so two same-named presets read apart.
  const renderSelectedValue = (option: SelectorOptionData) => {
    const groupName = presetOptions.find((o) => o.value === option.value)
      ?.preset?.scaling_group_name;
    return groupName ? (
      <BAIFlex direction="row" gap={'xs'} align="center">
        {option.label}
        <Token label={groupName} size="sm" />
      </BAIFlex>
    ) : (
      option.label
    );
  };

  const options: BAISelectOption[] = [
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
    // `modelStore.Preset` is reused for the same word; give this group its own
    // key if the two ever need to differ.
    {
      label: t('modelStore.Preset'),
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
      <BAISelect
        aria-label={t('resourcePreset.ResourcePresets')}
        loading={isPendingUpdate}
        disabled={disabled}
        style={{ width: '100%', ...style }}
        options={options}
        optionRender={({ data }) => renderResourceRow(data)}
        labelRender={renderSelectedValue}
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
