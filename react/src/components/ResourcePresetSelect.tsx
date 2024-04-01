import { useUpdatableState } from '../hooks';
import { useResourceSlots } from '../hooks/backendai';
import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import {
  ResourcePresetSelectQuery,
  ResourcePresetSelectQuery$data,
} from './__generated__/ResourcePresetSelectQuery.graphql';
import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useControllableValue, useThrottleFn } from 'ahooks';
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
  showMiniumRequired?: boolean;
  showCustom?: boolean;
}
const ResourcePresetSelect: React.FC<ResourcePresetSelectProps> = ({
  allocatablePresetNames,
  showCustom,
  showMiniumRequired,
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
    useControllableValue(selectProps);
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
        }
      }
    `,
    {},
    {
      fetchKey: fetchKey,
      fetchPolicy: fetchKey === 'first' ? 'store-and-network' : 'network-only',
    },
  );

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
        ...(showMiniumRequired
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
          options: _.map(resource_presets, (preset, index) => {
            const slotsInfo: {
              [key in string]: string;
            } = JSON.parse(preset?.resource_slots);
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
                        // @ts-ignore
                        _.isEmpty(resourceSlots[key]),
                      ),
                      (slot, key) => {
                        return (
                          <ResourceNumber
                            key={key}
                            // @ts-ignore
                            type={key}
                            value={slot}
                            hideTooltip
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
            // sort by disabled
          }).sort((a, b) =>
            a.disabled === b.disabled ? 0 : a.disabled ? 1 : -1,
          ),
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
