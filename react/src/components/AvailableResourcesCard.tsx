import { convertBinarySizeUnit } from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import BAICard, { BAICardProps } from './BAICard';
import Flex from './Flex';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { ReloadOutlined } from '@ant-design/icons';
import { Button, theme, Tooltip, Typography } from 'antd';
import _ from 'lodash';
import React, { useDeferredValue, useEffect, useState } from 'react';

interface AvailableResourcesCardProps extends BAICardProps {
  fetchKey?: string;
}
const AvailableResourcesCard: React.FC<AvailableResourcesCardProps> = ({
  fetchKey,
  ...props
}) => {
  const { token } = theme.useToken();
  const currentProject = useCurrentProjectValue();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);
  const [{ checkPresetInfo, isRefetching }, { refetch }] =
    useResourceLimitAndRemaining({
      currentProjectName: currentProject.name,
      currentResourceGroup: deferredSelectedResourceGroup || 'default',
    });
  const resourceSlotsDetails = useResourceSlotsDetails(
    deferredSelectedResourceGroup || 'default',
  );

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  const acceleratorSlotsDetails = _.chain(
    resourceSlotsDetails?.resourceSlotsInRG,
  )
    .omit(['cpu', 'mem'])
    .map((resourceSlot, key) => ({
      key,
      resourceSlot,
    }))
    .value();

  return (
    <BAICard
      title={'Allocated Resources'}
      loading={_.isUndefined(checkPresetInfo?.keypair_using.cpu)}
      // extra={[]}
      extra={
        <Flex
          direction="row"
          gap="sm"
          style={{
            marginRight: -8,
          }}
        >
          <ResourceGroupSelectForCurrentProject
            showSearch
            style={{ minWidth: 100 }}
            onChange={(v) => setSelectedResourceGroup(v)}
            loading={selectedResourceGroup !== deferredSelectedResourceGroup}
            popupMatchSelectWidth={false}
          />
          <Button
            icon={<ReloadOutlined />}
            type="text"
            onClick={() => {
              refetch();
            }}
            loading={isRefetching}
            style={{
              backgroundColor: 'transparent',
            }}
          />
        </Flex>
      }
      {...props}
      styles={{
        body: {
          paddingTop: 0,
          paddingBottom: 0,
          height: 120,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
        },
      }}
    >
      <Flex direction="row" align="center">
        {resourceSlotsDetails?.resourceSlotsInRG?.['cpu'] && (
          <ResourceWithSteppedProgress
            current={_.toNumber(checkPresetInfo?.keypair_using.cpu)}
            total={_.toNumber(checkPresetInfo?.keypair_limits.cpu)}
            title={
              resourceSlotsDetails.resourceSlotsInRG['cpu'].human_readable_name
            }
            unit={resourceSlotsDetails.resourceSlotsInRG['cpu'].display_unit}
            steps={12}
          />
        )}

        {!_.isNaN(
          convertBinarySizeUnit(checkPresetInfo?.keypair_using.mem, 'G')
            ?.numberFixed,
        ) &&
          resourceSlotsDetails?.resourceSlotsInRG?.['mem'] && (
            <>
              <Flex
                style={{
                  width: 1,
                  height: 84,
                  backgroundColor: token.colorBorder,
                  marginRight: 40,
                  marginLeft: 40,
                }}
              ></Flex>

              <ResourceWithSteppedProgress
                current={_.toNumber(
                  convertBinarySizeUnit(checkPresetInfo?.keypair_using.mem, 'G')
                    ?.numberFixed,
                )}
                total={_.toNumber(
                  convertBinarySizeUnit(
                    checkPresetInfo?.keypair_limits.mem,
                    'G',
                  )?.numberFixed,
                )}
                title={
                  resourceSlotsDetails.resourceSlotsInRG['mem']
                    .human_readable_name
                }
                unit={
                  resourceSlotsDetails.resourceSlotsInRG['mem'].display_unit
                }
                steps={12}
              />
            </>
          )}

        {acceleratorSlotsDetails.length > 0 && (
          <Flex
            direction="row"
            align="center"
            style={{
              padding: '14px 40px',
              marginLeft: 40,
              backgroundColor: token.colorSuccessBg,
              borderRadius: token.borderRadiusLG,
            }}
          >
            {_.map(acceleratorSlotsDetails, ({ key, resourceSlot }, index) => {
              return (
                !!resourceSlot && (
                  <React.Fragment key={key}>
                    {index > 0 && (
                      <Flex
                        style={{
                          width: 1,
                          height: 84,
                          backgroundColor: token.colorBorder,
                          marginRight: 40,
                          marginLeft: 40,
                        }}
                      ></Flex>
                    )}
                    <ResourceWithSteppedProgress
                      // @ts-ignore
                      current={_.toNumber(checkPresetInfo?.keypair_using[key])}
                      // @ts-ignore
                      total={_.toNumber(checkPresetInfo?.keypair_limits[key])}
                      title={resourceSlot.human_readable_name}
                      unit={resourceSlot.display_unit}
                      steps={12}
                    />
                  </React.Fragment>
                )
              );
            })}
          </Flex>
        )}
      </Flex>
    </BAICard>
  );
};

const ResourceWithSteppedProgress: React.FC<{
  title: string;
  current: number;
  total: number;
  unit: string;
  steps: number;
}> = ({ title, current, total, unit, steps }) => {
  const { token } = theme.useToken();

  return (
    <Flex direction="column" align="start">
      <Typography.Text
        style={{
          fontSize: token.fontSizeLG,
          fontWeight: 600,
          marginBottom: 16,
          lineHeight: '1em',
        }}
      >
        {title}
      </Typography.Text>
      <Flex
        direction="row"
        gap="xxs"
        align="end"
        style={{
          marginBottom: 8,
        }}
      >
        <Typography.Text
          style={{
            fontSize: 32,
            lineHeight: '1em',
            fontWeight: 700,
            color: token.colorSuccess,
          }}
        >
          {_.isNaN(current) ? '-' : current}
        </Typography.Text>
        {!_.isNaN(current) && <Typography.Text>{unit}</Typography.Text>}
      </Flex>
      <Tooltip title={`${current} ${unit} / ${total} ${unit}`}>
        <Flex direction="row" gap={2}>
          {_.map(_.range(steps), (i) => {
            const currentPosition = (current / total) * steps;
            return (
              <Flex
                key={i}
                style={{
                  width: 5,
                  height: 12,
                  borderRadius: 2.5,
                  backgroundColor:
                    i < currentPosition
                      ? token.colorSuccess
                      : token.colorTextDisabled,
                }}
              />
            );
          })}
        </Flex>
      </Tooltip>
    </Flex>
  );
};

export default AvailableResourcesCard;
