import { iSizeToSize } from '../helper';
import { useUpdatableState } from '../hooks';
import { useResourceSlots } from '../hooks/backendai';
import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import { ResourcePresetSelectQuery } from './__generated__/ResourcePresetSelectQuery.graphql';
import { EditOutlined } from '@ant-design/icons';
import { useThrottleFn } from 'ahooks';
import { Select, Typography } from 'antd';
import { SelectProps } from 'antd/lib';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useTransition } from 'react';
import { useLazyLoadQuery } from 'react-relay';

// const myFunc= ()=>{
//   const param: any = { group: globalThis.backendaiclient.current_group };
//       if (
//         this.current_user_group !== globalThis.backendaiclient.current_group ||
//         this.scaling_groups.length == 0 ||
//         (this.scaling_groups.length === 1 && this.scaling_groups[0].name === '')
//       ) {
//         this.current_user_group = globalThis.backendaiclient.current_group;
//         const sgs = await globalThis.backendaiclient.scalingGroup.list(
//           this.current_user_group,
//         );
//         // Make empty scaling group item if there is no scaling groups.
//         this.scaling_groups =
//           sgs.scaling_groups.length > 0 ? sgs.scaling_groups : [{ name: '' }];
//       }
//       if (this.scaling_groups.length > 0) {
//         const scaling_groups: any = [];
//         this.scaling_groups.map((group) => {
//           scaling_groups.push(group.name);
//         });
//         if (
//           this.scaling_group === '' ||
//           !scaling_groups.includes(this.scaling_group)
//         ) {
//           this.scaling_group = this.scaling_groups[0].name;
//         }
//         param['scaling_group'] = this.scaling_group;
//       }
//       const resourcePresetInfo =
//         await globalThis.backendaiclient.resourcePreset.check(param);
// }

type Y = ArrayElement<NonNullable<SelectProps['options']>>;
interface PresetOptionType extends Y {
  options?: PresetOptionType[];
  preset?: {
    name: string;
    resource_slots: string;
    shared_memory: string;
  };
}
interface ResourcePresetSelectProps extends Omit<SelectProps, 'onChange'> {
  onChange?: (value: string, options: PresetOptionType) => void;
}
const ResourcePresetSelect: React.FC<ResourcePresetSelectProps> = ({
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
  // const resourcePresetInfo = await globalThis.backendaiclient.resourcePreset.check(param);
  return (
    <Select
      loading={isPendingUpdate}
      // options={_.map(resource_presets, (preset) => {
      //   return {
      //     value: preset?.name,
      //     label: preset?.name,
      //   };
      // })}
      options={[
        {
          value: 'custom',
          label: (
            <Flex gap={'xs'} style={{ display: 'inline-flex' }}>
              <EditOutlined /> Custom
            </Flex>
          ),
          // label: (
          //   <Flex direction="row" gap="xs">
          //     <Typography.Text strong>Custom</Typography.Text>
          //     <Typography.Text type="secondary">
          //       Customize allocation amount
          //     </Typography.Text>
          //   </Flex>
          // ),
        },
        {
          // value: 'preset1',
          label: 'Preset',
          // @ts-ignore
          options: _.map(resource_presets, (preset, index) => {
            const slotsInfo: {
              [key in string]: string;
            } = JSON.parse(preset?.resource_slots);
            return {
              value: preset?.name,
              label: (
                <Flex direction="row" justify="between" gap={'xs'}>
                  {preset?.name}
                  <Flex
                    direction="row"
                    gap={'xxs'}
                    style={{
                      color: 'black',
                      opacity: index === 1 ? 0.5 : 1,
                    }}
                  >
                    {_.map(
                      _.omitBy(slotsInfo, (slot, key) =>
                        // @ts-ignore
                        _.isEmpty(resourceSlots[key]),
                      ),
                      (slot, key) => {
                        return (
                          // @ts-ignore
                          <ResourceNumber type={key} value={slot} hideTooltip />
                        );
                      },
                    )}
                  </Flex>
                </Flex>
              ),
              preset,
              // disabled: index === 1,
            };
          }),
        },
      ]}
      showSearch
      {...selectProps}
      onDropdownVisibleChange={(open) => {
        if (open) {
          console.log(open);
          updateFetchKeyUnderTransition();
        }
      }}
    ></Select>
  );
};

export default ResourcePresetSelect;
