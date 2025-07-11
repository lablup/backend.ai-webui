import { convertToBinaryUnit } from '../helper';
import {
  ResourceSlotDetail,
  useResourceSlotsDetails,
} from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  MergedResourceLimits,
  RemainingSlots,
  ResourceAllocation,
  useResourceLimitAndRemaining,
} from '../hooks/useResourceLimitAndRemaining';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Col, Divider, Grid, Row, Segmented, theme, Tooltip } from 'antd';
import {
  Flex,
  BAIResourceWithSteppedProgress,
  BAICard,
  BAICardProps,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useMemo, useState, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface MyResourceCardProps extends BAICardProps {
  fetchKey?: string;
  isRefetching?: boolean;
}

const UNLIMITED_VALUES = [NaN, Infinity, Number.MAX_SAFE_INTEGER];

const getResourceValue = (
  type: 'usage' | 'capacity',
  resource: string,
  checkPresetInfo: ResourceAllocation | null,
  remainingWithoutResourceGroup: RemainingSlots,
  resourceLimitsWithoutResourceGroup: MergedResourceLimits,
): { current: number; total: number } => {
  const isMemory = resource === 'mem';

  const getCurrentValue = () => {
    if (type === 'usage') {
      const value = _.get(checkPresetInfo?.keypair_using, resource);
      return isMemory
        ? _.toNumber(convertToBinaryUnit(value, 'g')?.numberFixed)
        : _.toNumber(value);
    }

    const capacity = _.get(remainingWithoutResourceGroup, resource);
    if (capacity === Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;

    return isMemory
      ? _.toNumber(convertToBinaryUnit(capacity, 'g')?.numberFixed)
      : _.toNumber(capacity);
  };

  const getTotalValue = () => {
    const maxValue = _.get(
      resourceLimitsWithoutResourceGroup,
      `${resource}.max`,
    );
    if (isMemory) {
      const converted = _.toNumber(
        convertToBinaryUnit(maxValue, 'g')?.numberFixed,
      );
      return _.isNaN(converted) || converted === Number.MAX_SAFE_INTEGER
        ? Number.MAX_SAFE_INTEGER
        : converted;
    }
    return _.toNumber(maxValue);
  };

  return {
    current: getCurrentValue(),
    total: getTotalValue(),
  };
};

const MyResourceCard: React.FC<MyResourceCardProps> = ({
  fetchKey,
  isRefetching,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { xs } = Grid.useBreakpoint();

  const currentProject = useCurrentProjectValue();
  const [
    {
      checkPresetInfo,
      resourceLimitsWithoutResourceGroup,
      remainingWithoutResourceGroup,
      isRefetching: internalIsRefetching,
    },
    { refetch },
  ] = useResourceLimitAndRemaining({
    currentProjectName: currentProject.name,
    ignorePerContainerConfig: true,
    fetchKey,
  });

  const resourceSlotsDetails = useResourceSlotsDetails();
  const [type, setType] = useState<'usage' | 'capacity'>('usage');

  const { acceleratorSlotsDetails, cpuValues, memValues } = useMemo(() => {
    const accelerators = _.chain(resourceSlotsDetails?.resourceSlotsInRG)
      .omit(['cpu', 'mem'])
      .map((resourceSlot, key) => ({ key, resourceSlot }))
      .value();

    const cpu = getResourceValue(
      type,
      'cpu',
      checkPresetInfo,
      remainingWithoutResourceGroup,
      resourceLimitsWithoutResourceGroup,
    );

    const mem = getResourceValue(
      type,
      'mem',
      checkPresetInfo,
      remainingWithoutResourceGroup,
      resourceLimitsWithoutResourceGroup,
    );

    return {
      acceleratorSlotsDetails: accelerators,
      cpuValues: cpu,
      memValues: mem,
    };
  }, [
    resourceSlotsDetails,
    type,
    checkPresetInfo,
    remainingWithoutResourceGroup,
    resourceLimitsWithoutResourceGroup,
  ]);

  const hasMemoryData = useMemo(
    () =>
      !_.isNaN(
        convertToBinaryUnit(checkPresetInfo?.keypair_using.mem, 'g')
          ?.numberFixed,
      ),
    [checkPresetInfo?.keypair_using.mem],
  );

  const renderDivider = useCallback(
    () =>
      !xs && (
        <Col
          flex="1px"
          style={{
            justifyItems: 'center',
            textAlign: 'center',
            height: 84,
            padding: 0,
          }}
        >
          <Divider type="vertical" style={{ height: '100%' }} />
        </Col>
      ),
    [xs],
  );

  const renderResourceProgress = useCallback(
    (
      values: { current: number; total: number },
      resourceSlot: ResourceSlotDetail,
    ) => (
      <BAIResourceWithSteppedProgress
        unlimitedValues={UNLIMITED_VALUES}
        current={values.current}
        total={values.total}
        title={resourceSlot.human_readable_name}
        unit={resourceSlot.display_unit}
        steps={12}
      />
    ),
    [],
  );

  return (
    <BAICard
      {...props}
      title={
        <Flex gap={'xs'} align="center" wrap="wrap">
          {t('webui.menu.MyResources')}
          <Tooltip
            title={<Trans i18nKey={'webui.menu.MyResourcesDescription'} />}
          >
            <QuestionCircleOutlined
              style={{ color: token.colorTextDescription }}
            />
          </Tooltip>
        </Flex>
      }
      styles={{
        body: {
          padding: 0,
          margin: 0,
        },
      }}
      extra={
        <Flex direction="row" gap="sm" wrap="wrap">
          <Segmented
            options={[
              {
                label: t('webui.menu.Usage'),
                value: 'usage',
              },
              {
                label: t('webui.menu.Capacity'),
                value: 'capacity',
              },
            ]}
            defaultValue={type}
            onChange={(v) => setType(v as 'usage' | 'capacity')}
          />
          <BAIFetchKeyButton
            loading={isRefetching || internalIsRefetching}
            value=""
            onChange={() => {
              refetch();
            }}
            type="text"
            style={{
              backgroundColor: 'transparent',
              margin: -token.marginXS,
            }}
          />
        </Flex>
      }
    >
      <Row
        gutter={[40, 16]}
        align="middle"
        style={{
          padding: 0,
          margin: token.marginLG,
          marginTop: token.marginSM,
        }}
      >
        {resourceSlotsDetails?.resourceSlotsInRG?.['cpu'] && (
          <Col style={{ justifyItems: 'center', overflow: 'break-word' }}>
            {renderResourceProgress(
              cpuValues,
              resourceSlotsDetails.resourceSlotsInRG['cpu'],
            )}
          </Col>
        )}

        {hasMemoryData && resourceSlotsDetails?.resourceSlotsInRG?.['mem'] && (
          <>
            {renderDivider()}
            <Col style={{ justifyItems: 'center', overflow: 'break-word' }}>
              {renderResourceProgress(
                memValues,
                resourceSlotsDetails.resourceSlotsInRG['mem'],
              )}
            </Col>
          </>
        )}

        {acceleratorSlotsDetails.length > 0 && (
          <>
            {!xs && (
              <Col
                flex="1px"
                style={{
                  justifyItems: 'center',
                  textAlign: 'center',
                  padding: 0,
                  visibility: 'hidden',
                }}
              >
                <Divider type="vertical" style={{ height: '100%' }} />
              </Col>
            )}
            {_.map(acceleratorSlotsDetails, ({ key, resourceSlot }, index) => {
              if (!resourceSlot) return null;

              const values = getResourceValue(
                type,
                key,
                checkPresetInfo,
                remainingWithoutResourceGroup,
                resourceLimitsWithoutResourceGroup,
              );

              return (
                <Flex
                  key={key}
                  style={{
                    backgroundColor: token.colorSuccessBg,
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  {index > 0 && renderDivider()}
                  <Col
                    style={{
                      justifyItems: 'center',
                      overflow: 'break-word',
                      paddingTop: token.fontSize,
                      paddingBottom: token.fontSize,
                    }}
                  >
                    {renderResourceProgress(values, resourceSlot)}
                  </Col>
                </Flex>
              );
            })}
          </>
        )}
      </Row>
    </BAICard>
  );
};

export default MyResourceCard;
