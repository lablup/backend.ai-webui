import { useUpdatableState } from '../hooks';
import { useResourceSlots } from '../hooks/backendai';
import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import {
  ResourcePresetSelectQuery,
  ResourcePresetSelectQuery$data,
} from './__generated__/ResourcePresetSelectQuery.graphql';
import { EditOutlined } from '@ant-design/icons';
import { useControllableValue, useThrottleFn } from 'ahooks';
import { Select } from 'antd';
import { SelectProps } from 'antd/lib';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useTransition } from 'react';
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
}
const ResourcePresetSelect: React.FC<ResourcePresetSelectProps> = ({
  allocatablePresetNames,
  ...selectProps
}) => {
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const { run: updateFetchKeyThrottled } = useThrottleFn(updateFetchKey, {
    wait: 3000,
    trailing: false,
    leading: true,
  });
  const [resourceSlots] = useResourceSlots();
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
        {
          value: 'custom',
          label: (
            <Flex gap={'xs'} style={{ display: 'inline-flex' }}>
              <EditOutlined /> Custom
            </Flex>
          ),
        },
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
