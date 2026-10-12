/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { localeCompare } from '../helper';
import { ResourceSlotName, useResourceSlots } from '../hooks/backendai';
import useControllableState_deprecated from '../hooks/useControllableState';
import {
  type SessionResourcePreset,
  useSessionResourcePresets,
} from '../hooks/useSessionResourcePresets';
import type {
  SelectorOptionData,
  SelectorOptionType,
} from '@lablup/ui-common/Selector';
import { Token } from '@lablup/ui-common/Token';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIFlex,
  BAIIconWithTooltip,
  BAIResourceNumberWithIcon,
  useThrottleFn,
  useUpdatableState,
  BAISelector,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Info, SquarePen } from 'lucide-react';
import React, {
  useDeferredValue,
  useEffect,
  useTransition,
  type CSSProperties,
} from 'react';
import { useTranslation } from 'react-i18next';

/**
 * The option shape this component hands back through `onChange`. It used to be
 * derived from antd's `SelectProps['options']` element; now it is stated
 * directly, because the only consumer
 * (`SessionFormItems/ResourceAllocationFormItems`) reads nothing but the value.
 */
export interface PresetOptionType extends SelectorOptionData {
  preset?: SessionResourcePreset;
}

/**
 * PILOT-DECISION: the props the single call site passes, not antd
 * `SelectProps`; the Form injects `value`.
 */
export interface ResourcePresetSelectProps {
  /** Injected by `Form.Item`. */
  value?: string;
  onChange?: (value: string, options: PresetOptionType) => void;
  projectId: string;
  /** Lists this group's presets and the global ones; none while unset. */
  resourceGroup?: string;
  /** Presets outside this list are disabled; all are pickable when unset. */
  allocatablePresetIds?: string[];
  showMinimumRequired?: boolean;
  showCustom?: boolean;
  autoSelectDefault?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}
const ResourcePresetSelect: React.FC<ResourcePresetSelectProps> = ({
  projectId,
  resourceGroup,
  allocatablePresetIds,
  showCustom,
  showMinimumRequired,
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

  // Deferred so a group switch keeps the select on screen while it loads.
  const deferredResourceGroup = useDeferredValue(resourceGroup);
  const resource_presets = useSessionResourcePresets({
    projectId,
    resourceGroupName: deferredResourceGroup,
    fetchKey,
    fetchPolicy: fetchKey === 'first' ? 'store-and-network' : 'network-only',
  });

  const onlyInGroupText = (name: string) =>
    t('resourcePreset.OnlyAvailableInResourceGroup', { name });

  // Why a preset cannot be picked right now; `undefined` means it can.
  const disabledReasonOf = (
    preset: SessionResourcePreset,
  ): string | undefined =>
    allocatablePresetIds && !allocatablePresetIds.includes(preset.id)
      ? t('resourcePreset.ExceedsAllocatableResources')
      : undefined;

  const firstAvailablePreset = resource_presets
    .filter((p) => !disabledReasonOf(p))
    .sort((a, b) => localeCompare(a.name, b.name))[0];
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

  // PILOT-DECISION: antd `optionLabelProp="selectedLabel"` let an option carry
  // a rich `label` node for the popup and a plain string for the trigger.
  // Astryx `Selector` splits that natively — `label` IS the plain string (P2,
  // required), and the rich row moves into `renderOption` — so the parallel
  // `selectedLabel` field disappears rather than being emulated.
  const presetOptions: PresetOptionType[] = _.map(
    resource_presets,
    (preset) => {
      const disabledReason = disabledReasonOf(preset);
      return {
        // Names repeat across resource groups; the id is the option's key.
        value: preset.id,
        label: preset.name,
        disabled: disabledReason ? { reason: disabledReason } : false,
        preset,
      };
    },
  )
    .sort((a, b) => (!!a.disabled === !!b.disabled ? 0 : a.disabled ? 1 : -1))
    .sort((a, b) => localeCompare(a.label, b.label));

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
    const presetOption = presetOptions.find((o) => o.value === option.value);
    const preset = presetOption?.preset;
    if (!preset) return option.label;
    const disabledReason = disabledReasonOf(preset);
    const slotsInfo = preset.resource_slots;
    return (
      <BAIFlex direction="row" justify="between" gap={'xs'} style={{ flex: 1 }}>
        <BAIFlex direction="row" gap={'xs'} align="center">
          {preset.name}
          {preset.resource_group_name ? (
            // Global presets carry no mark; the token names the group this
            // one belongs to, so same-named rows tell apart. A disabled row
            // already explains itself, so the token stays quiet there.
            disabledReason ? (
              <Token label={preset.resource_group_name} size="sm" />
            ) : (
              <Tooltip content={onlyInGroupText(preset.resource_group_name)}>
                <Token label={preset.resource_group_name} size="sm" />
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
  };

  // The closed trigger keeps the group token, so two same-named presets read apart.
  const renderSelectedValue = (option: SelectorOptionData) => {
    const groupName = presetOptions.find((o) => o.value === option.value)
      ?.preset?.resource_group_name;
    return groupName ? (
      <BAIFlex direction="row" gap={'xs'} align="center">
        {option.label}
        <Token label={groupName} size="sm" />
      </BAIFlex>
    ) : (
      option.label
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
      <BAISelector
        // QA-FINDINGS Q-40: `session.launcher.ResourcePresets` does not exist
        // in any locale file, so i18next fell through and Astryx rendered the
        // RAW KEY as this Selector's accessible name.
        // `resourcePreset.ResourcePresets` is the same string and is present in
        // all 21 locales.
        aria-label={t('resourcePreset.ResourcePresets')}
        isLoading={isPendingUpdate}
        disabled={disabled}
        controlStyle={style}
        width="100%"
        hasSearch
        options={options}
        renderOption={renderResourceRow}
        renderValue={renderSelectedValue}
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
