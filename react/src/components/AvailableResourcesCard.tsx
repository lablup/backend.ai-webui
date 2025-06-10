import { convertBinarySizeUnit } from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import BAICard, { BAICardProps } from './BAICard';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import Flex from './Flex';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { Row, Col, Divider, theme, Tooltip, Typography } from 'antd';
import _ from 'lodash';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AvailableResourcesCardProps extends BAICardProps {
  fetchKey?: string;
  isRefetching?: boolean;
}
const AvailableResourcesCard: React.FC<AvailableResourcesCardProps> = ({
  fetchKey,
  isRefetching,
  ...props
}) => {
  const { token } = theme.useToken();
  const currentProject = useCurrentProjectValue();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);
  const { t } = useTranslation();
  const [{ checkPresetInfo, isRefetching: internalIsRefetching }, { refetch }] =
    useResourceLimitAndRemaining({
      currentProjectName: currentProject.name,
      currentResourceGroup: deferredSelectedResourceGroup || 'default',
      fetchKey,
    });
  const resourceSlotsDetails = useResourceSlotsDetails(
    deferredSelectedResourceGroup || 'default',
  );

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
            variant="borderless"
            tooltip={t('general.ResourceGroup')}
          />
          <BAIFetchKeyButton
            loading={isRefetching || internalIsRefetching}
            value={''}
            onChange={(newFetchKey) => {
              refetch();
            }}
            type="text"
            style={{
              backgroundColor: 'transparent',
            }}
          />
        </Flex>
      }
      {...props}
    >
      <Row gutter={[40, 16]} align="middle">
        {resourceSlotsDetails?.resourceSlotsInRG?.['cpu'] && (
          <Col style={{ justifyItems: 'center', overflow: 'break-word' }}>
            <ResourceWithSteppedProgress
              current={_.toNumber(checkPresetInfo?.keypair_using.cpu)}
              total={_.toNumber(checkPresetInfo?.keypair_limits.cpu)}
              title={
                resourceSlotsDetails.resourceSlotsInRG['cpu']
                  .human_readable_name
              }
              unit={resourceSlotsDetails.resourceSlotsInRG['cpu'].display_unit}
              steps={12}
            />
          </Col>
        )}

        {!_.isNaN(
          convertBinarySizeUnit(checkPresetInfo?.keypair_using.mem, 'G')
            ?.numberFixed,
        ) &&
          resourceSlotsDetails?.resourceSlotsInRG?.['mem'] && (
            <>
              <Col
                flex={'1px'}
                style={{
                  justifyItems: 'center',
                  textAlign: 'center',
                  height: 84,
                  paddingLeft: 0,
                  paddingRight: 0,
                }}
              >
                <Divider
                  type="vertical"
                  style={{
                    height: '100%',
                  }}
                />
              </Col>
              <Col style={{ justifyItems: 'center', overflow: 'break-word' }}>
                <ResourceWithSteppedProgress
                  current={_.toNumber(
                    convertBinarySizeUnit(
                      checkPresetInfo?.keypair_using.mem,
                      'G',
                    )?.numberFixed,
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
              </Col>
            </>
          )}

        {acceleratorSlotsDetails.length > 0 && (
          <>
            {/* Added a hidden divider to create an even margin between columns. */}
            <Col
              flex={'1px'}
              style={{
                justifyItems: 'center',
                textAlign: 'center',
                paddingLeft: 0,
                paddingRight: 0,
                visibility: 'hidden',
              }}
            >
              <Divider
                type="vertical"
                style={{
                  height: '100%',
                }}
              />
            </Col>
            {_.map(
              acceleratorSlotsDetails,
              ({ key, resourceSlot }, index) =>
                !!resourceSlot && (
                  <Flex
                    key={key}
                    style={{
                      backgroundColor: token.colorSuccessBg,
                      borderRadius: token.borderRadiusLG,
                    }}
                  >
                    {index > 0 && (
                      <Col
                        flex={'1px'}
                        style={{
                          justifyItems: 'center',
                          textAlign: 'center',
                          height: 84,
                          paddingLeft: 0,
                          paddingRight: 0,
                        }}
                      >
                        <Divider
                          type="vertical"
                          style={{
                            height: '100%',
                          }}
                        />
                      </Col>
                    )}
                    <Col
                      key={key}
                      style={{
                        justifyItems: 'center',
                        overflow: 'break-word',
                        paddingTop: token.fontSize,
                        paddingBottom: token.fontSize,
                      }}
                    >
                      <ResourceWithSteppedProgress
                        current={_.toNumber(
                          // @ts-ignore
                          checkPresetInfo?.keypair_using[key],
                        )}
                        // @ts-ignore
                        total={_.toNumber(checkPresetInfo?.keypair_limits[key])}
                        title={resourceSlot.human_readable_name}
                        unit={resourceSlot.display_unit}
                        steps={12}
                      />
                    </Col>
                  </Flex>
                ),
            )}
          </>
        )}
      </Row>
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
