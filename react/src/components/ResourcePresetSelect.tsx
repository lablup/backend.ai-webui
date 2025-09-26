import { localeCompare } from '../helper';
import { useUpdatableState } from '../hooks';
import { ResourceSlotName, useResourceSlots } from '../hooks/backendai';
import useControllableState from '../hooks/useControllableState';
import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import {
  ResourcePresetSelectQuery,
  ResourcePresetSelectQuery$data,
} from './__generated__/ResourcePresetSelectQuery.graphql';
import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useThrottleFn } from 'ahooks';
import { Select, Tooltip, theme } from 'antd';
import { SelectProps } from 'antd/lib';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

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
export interface ResourcePresetSelectProps
  extends Omit<SelectProps, 'onChange'> {
  onChange?: (value: string, options: PresetOptionType) => void;
  allocatablePresetNames?: string[];
  showMinimumRequired?: boolean;
  showCustom?: boolean;
  resourceGroup?: string;
}
const ResourcePresetSelect: React.FC<ResourcePresetSelectProps> = ({
  allocatablePresetNames,
  showCustom,
  showMinimumRequired,
  resourceGroup,
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
    useControllableState(selectProps);
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
          preset?.scaling_group_name === null,
      )
    : resource_presets;

  return (
    <Select
      loading={isPendingUpdate}
      options={[
        ...(showCustom
          ? [
              {
                value: 'custom',
                label: (
                  <Flex gap={'xs'} style={{ display: 'inline-flex' }}>
                    <EditOutlined /> {t('session.launcher.CustomAllocation')}
                  </Flex>
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
                  <Flex gap={'xs'}>
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
                  </Flex>
                ),
                selectedLabel: t('session.launcher.MiniumAllocation'),
              },
            ]
          : []),
        {
          // value: 'preset1',
          label: 'Preset',
          // @ts-ignore
          options: _.map(resourcePresets, (preset, index) => {
            const slotsInfo: {
              [key in ResourceSlotName]: string;
            } = JSON.parse(preset?.resource_slots || '{}');
            const disabled = allocatablePresetNames
              ? !allocatablePresetNames.includes(preset?.name || '')
              : undefined;
            return {
              value: preset?.name,
              label: (
                <Flex direction="row" justify="between" gap={'xs'}>
                  {preset?.name}
                  <Flex
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
                      _.omitBy(slotsInfo, (slot, key) =>
                        _.isEmpty(resourceSlots[key as ResourceSlotName]),
                      ),
                      (slot, key) => {
                        return (
                          <ResourceNumber
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
                  </Flex>
                </Flex>
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
      optionLabelProp={
        _.includes(['custom', 'minimum-required'], controllableValue)
          ? 'selectedLabel'
          : 'label'
      }
      onDropdownVisibleChange={(open) => {
        selectProps.onDropdownVisibleChange &&
          selectProps.onDropdownVisibleChange(open);
        if (open) {
          updateFetchKeyUnderTransition();
        }
      }}
    ></Select>
  );
};

export default ResourcePresetSelect;
