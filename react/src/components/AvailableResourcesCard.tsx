import { iSizeToSize } from '../helper';
import { useCurrentProjectValue, useUpdatableState } from '../hooks';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import Flex from './Flex';
import ResourceAvailableGageBar from './ResourceAvailableGageBar';
import ResourceGroupSelect from './ResourceGroupSelect';
import { QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  CardProps,
  Statistic,
  StatisticProps,
  Tooltip,
  Typography,
} from 'antd';
import _ from 'lodash';
import React, { useDeferredValue, useState } from 'react';
import CountUp from 'react-countup';

const AvailableResourcesCard: React.FC<CardProps> = (props) => {
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

  const staticFormatter: (suffix: string) => StatisticProps['formatter'] =
    // @ts-ignore
    (suffix) => (value: number) => (
      <Flex direction="row" align="end" gap={'xxs'}>
        <CountUp end={value as number} />
        <Typography.Text type="secondary" style={{ marginBottom: 4 }}>
          {suffix}
        </Typography.Text>
      </Flex>
    );

  return (
    <Card
      size="small"
      title={
        <Flex direction="row" gap={'xs'}>
          <ResourceGroupSelect
            size="small"
            showSearch
            autoSelectDefault
            style={{ minWidth: 100 }}
            value={selectedResourceGroup}
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
      extra={[
        <Button
          icon={<ReloadOutlined />}
          type="text"
          onClick={() => {
            setFetchKey();
          }}
        />,
      ]}
      {...props}
    >
      <Flex gap={'md'}>
        <Statistic
          title="CPU"
          value={remaining.cpu}
          formatter={staticFormatter('Core')}
        />
        <Statistic
          title="MEM"
          value={iSizeToSize(remaining.mem + '', 'g', 2)?.numberFixed}
          formatter={staticFormatter('GiB')}
        />

        {_.map(remaining.accelerators, (value, type) => (
          <Statistic
            key={type}
            title={type}
            value={value}
            formatter={staticFormatter('GPU')}
          />
        ))}
        {/* <ResourceAvailableGageBar
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
        <ResourceAvailableGageBar
          title="MEM"
          percent={
            ((iSizeToSize(remaining.mem + '', 'm')?.number || 0) /
              (iSizeToSize(resourceLimits.mem?.max + '', 'm')?.number || 1)) *
            100
          }
          valueLabel={
            iSizeToSize(remaining.mem + '', 'g', 2)?.numberFixed + ' GiB'
          }
        /> */}
      </Flex>
    </Card>
  );
};

export default AvailableResourcesCard;
