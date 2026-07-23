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
import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useThrottleFn } from 'ahooks';
import { Select, Tooltip, theme } from 'antd';
import { SelectProps } from 'antd/lib';
import {
  useUpdatableState,
  BAIFlex,
  BAIResourceNumberWithIcon,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useEffect, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type Y = ArrayElement<NonNullable<SelectProps['options']>>;
interface PresetOptionType extends Y {
  options?: PresetOptionType[];
  preset?: {
    name: string;
    resource_slots: string;
    shared_memory: string;
  };
}

export type ResourcePreset = NonNullable<
  NonNullable<ResourcePresetSelectQuery$data['resource_presets']>[number]
>;
export interface ResourcePresetSelectProps extends Omit<
  SelectProps,
  'onChange'
> {
  onChange?: (value: string, options: PresetOptionType) => void;
  allocatablePresetNames?: string[];
  showMinimumRequired?: boolean;
  showCustom?: boolean;
  resourceGroup?: string;
  autoSelectDefault?: boolean;
}
const ResourcePresetSelect: React.FC<ResourcePresetSelectProps> = ({
  allocatablePresetNames,
  showCustom,
  showMinimumRequired,
  resourceGroup,
  autoSelectDefault,
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
  const { token } = theme.useToken();
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
        selectedLabel: firstAvailablePresetName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectDefault, firstAvailablePresetName]);

  return (
    <Select
      loading={isPendingUpdate}
      popupMatchSelectWidth={false}
      options={[
        ...(showCustom
          ? [
              {
                value: 'custom',
                label: (
                  <BAIFlex gap={'xs'} style={{ display: 'inline-flex' }}>
                    <EditOutlined /> {t('session.launcher.CustomAllocation')}
                  </BAIFlex>
                ),
                selectedLabel: t('session.launcher.CustomAllocation'),
              },
            ]
          : []),
        ...(showMinimumRequired
          ? [
              {
                value: 'minimum-required',
                label: (
                  <BAIFlex gap={'xs'}>
                    {t('session.launcher.MiniumAllocation')}
                    <Tooltip
                      title={t('session.launcher.MiniumAllocationTooltip')}
                    >
                      <InfoCircleOutlined
                        style={{
                          color: token.colorTextSecondary,
                        }}
                      />
                    </Tooltip>
                  </BAIFlex>
                ),
                selectedLabel: t('session.launcher.MiniumAllocation'),
              },
            ]
          : []),
        {
          // value: 'preset1',
          label: 'Preset',
          // @ts-ignore
          options: _.map(resourcePresets, (preset) => {
            const slotsInfo: {
              [key in ResourceSlotName]: string;
            } = JSON.parse(preset?.resource_slots || '{}');
            const disabled = allocatablePresetNames
              ? !allocatablePresetNames.includes(preset?.name || '')
              : undefined;
            return {
              value: preset?.name,
              selectedLabel: preset?.name,
              label: (
                <BAIFlex direction="row" justify="between" gap={'xs'}>
                  {preset?.name}
                  <BAIFlex
                    direction="row"
                    gap={'xxs'}
                    style={
                      {
                        // color: 'black',
                        // opacity: isAvailable ? 1 : 0.4,
                      }
                    }
                  >
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
                              key === 'mem' && preset?.shared_memory
                                ? { shmem: preset?.shared_memory }
                                : {}
                            }
                          />
                        );
                      },
                    )}
                  </BAIFlex>
                </BAIFlex>
              ),
              preset,
              disabled: disabled,
            };
          })
            .sort(
              (
                a,
                b, // by disabled
              ) => (a.disabled === b.disabled ? 0 : a.disabled ? 1 : -1),
            )
            .sort((a, b) => localeCompare(a.value, b.value)), // by name
        },
      ]}
      showSearch
      // Set props from parent and override it
      {...selectProps}
      value={controllableValue}
      onChange={setControllableValue}
      optionLabelProp="selectedLabel"
      onOpenChange={(open) => {
        selectProps.onOpenChange && selectProps.onOpenChange(open);
        if (open) {
          updateFetchKeyUnderTransition();
        }
      }}
    ></Select>
  );
};

export default ResourcePresetSelect;
