import { iSizeToSize } from '../helper';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import Flex from './Flex';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Tooltip } from 'antd';
import React, { useDeferredValue, useState } from 'react';

const AvailableResourcesCard = () => {
  const currentProject = useCurrentProjectValue();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);
  const [{ remaining, resourceLimits, resourceGroupResourceSize }] =
    useResourceLimitAndRemaining({
      currentProjectName: currentProject.name,
      currentResourceGroup: deferredSelectedResourceGroup || 'default',
    });

  console.log(typeof remaining.mem, remaining.mem);
  return (
    <Card
      title={
        <Flex direction="row" gap={'xs'}>
          <ResourceGroupSelectForCurrentProject
            showSearch
            style={{ minWidth: 100 }}
            onChange={(v) => setSelectedResourceGroup(v)}
            loading={selectedResourceGroup !== deferredSelectedResourceGroup}
            popupMatchSelectWidth={false}
          />{' '}
          리소스 그룹 사용 가능한 자원
          <Tooltip
            title={
              '선택한 리소스 그룹에서 현재 사용자가 지금 바로 사용가능한 리소스 양으로 현재 사용자에게 적용되는 리소스 정책과 리소스 그룹의 가용양에 따라 결정됩니다.'
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </Flex>
      }
      extra={[<Button icon={<ReloadOutlined />} type="text" />]}
    >
      <Flex gap={'md'}>
        <BAIProgressWithLabel
          title="CPU"
          percent={
            (remaining.cpu /
              // @ts-ignore
              (resourceLimits.cpu
                ? resourceLimits.cpu.max
                : resourceGroupResourceSize.cpu)) *
            100
          }
          valueLabel={remaining.cpu + ' Core'}
        />
        <BAIProgressWithLabel
          title="MEM"
          percent={
            ((iSizeToSize(remaining.mem + '', 'm')?.number || 0) /
              (iSizeToSize(resourceLimits.mem?.max + '', 'm')?.number || 1)) *
            100
          }
          valueLabel={
            iSizeToSize(remaining.mem + '', 'g', 2)?.numberFixed + ' GiB'
          }
        />
      </Flex>
    </Card>
  );
};

export default AvailableResourcesCard;
