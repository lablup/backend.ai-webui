import { iSizeToSize } from '../helper';
import { useCurrentProjectValue, useUpdatableState } from '../hooks';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import Flex from './Flex';
import ResourceAvailableGageBar from './ResourceAvailableGageBar';
import { Card, CardProps, Progress, Typography } from 'antd';
import React, { useDeferredValue, useState } from 'react';

const MyUsageAndResourcePolicyCard: React.FC<CardProps> = (props) => {
  const currentProject = useCurrentProjectValue();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);
  const [fetchKey, setFetchKey] = useUpdatableState('first');
  const [{ remaining, resourceLimits, resourceGroupResourceSize }] =
    useResourceLimitAndRemaining({
      currentProjectName: currentProject.name,
      currentResourceGroup: deferredSelectedResourceGroup || 'default',
      fetchKey,
    });

  // @ts-ignore
  const used_slot_percent: any = globalThis.resourceBroker.used_slot_percent;
  // @ts-ignore
  const used_slot: any = globalThis.resourceBroker.used_slot;
  // @ts-ignore
  const total_slot: any = globalThis.resourceBroker.total_slot;

  return (
    <Card size="small" title="나의 사용량과 자원 제한" {...props}>
      <Flex direction="column" gap={'xs'} align="stretch">
        <Flex direction="row" align="stretch" gap={'xs'}>
          <ResourceAvailableGageBar
            title="CPU"
            percent={used_slot_percent.cpu}
            valueLabel={`${used_slot.cpu} / ${total_slot.cpu}`}
            style={{ flex: 1 }}
          />
          <ResourceAvailableGageBar
            title="MEM"
            percent={used_slot_percent.mem}
            valueLabel={`${used_slot.mem} / ${total_slot.mem}`}
            style={{ flex: 1 }}
          />
        </Flex>
        <Flex direction="row" align="stretch" gap={'xs'}>
          <ResourceAvailableGageBar
            title="GPU"
            percent={used_slot_percent.cpu}
            valueLabel={`${used_slot.cpu} / ${total_slot.cpu}`}
            style={{ flex: 1 }}
          />
          <ResourceAvailableGageBar
            title="FGPU"
            percent={used_slot_percent.mem}
            valueLabel={`${used_slot.mem} / ${total_slot.mem}`}
            style={{ flex: 1 }}
          />
        </Flex>
      </Flex>
      {/* <ResourceAvailableGageBar
        title="CPU"
        percent={used_slot_percent.cpu}
        valueLabel={`${used_slot.cpu} / ${total_slot.cpu}`}
        /> */}
      {/* <Progress 
      // steps={resourceLimits.cpu?.max}
      // size={['100%',10]}
      percent={
        resourceBroker.cpu
      } 
      strokeColor={{
        '0%': '#108ee9',
        '100%': '#87d068',
      }}
      showInfo={false}/> */}

      {/* <Progress 
      // steps={Math.ceil(iSizeToSize(resourceLimits.mem?.max + '', 'm')?.number}
      percent={used_slot_percent.mem}
      showInfo={false}/> */}
      {/* <Progress showInfo={false}/> */}
    </Card>
  );
};

export default MyUsageAndResourcePolicyCard;
