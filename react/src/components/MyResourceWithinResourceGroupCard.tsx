import { convertToBinaryUnit } from '../helper';
import {
  ResourceSlotDetail,
  useResourceSlotsDetails,
} from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  ResourceAllocation,
  useResourceLimitAndRemaining,
} from '../hooks/useResourceLimitAndRemaining';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  Col,
  Divider,
  Grid,
  Row,
  Segmented,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import {
  Flex,
  BAIResourceWithSteppedProgress,
  BAICard,
  BAICardProps,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useDeferredValue, useMemo, useState, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface MyResourceWithinResourceGroupCardProps extends BAICardProps {
  fetchKey?: string;
  isRefetching?: boolean;
}

const getResourceValue = (
  type: 'usage' | 'capacity',
  resource: string,
  checkPresetInfo: ResourceAllocation | null,
  resourceGroup: string,
): { current: number } => {
  const isMemory = resource === 'mem';

  const getCurrentValue = () => {
    if (type === 'usage') {
      const value = _.get(
        checkPresetInfo?.scaling_groups?.[resourceGroup]?.using,
        resource,
      );
      return isMemory
        ? _.toNumber(convertToBinaryUnit(value, 'g')?.numberFixed)
        : _.toNumber(value);
    }

    const remaining = _.get(
      checkPresetInfo?.scaling_groups?.[resourceGroup]?.remaining,
      resource,
    );
    if (remaining === Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;

    return isMemory
      ? _.toNumber(convertToBinaryUnit(remaining, 'g')?.numberFixed)
      : _.toNumber(remaining);
  };

  return {
    current: getCurrentValue(),
  };
};

const MyResourceWithinResourceGroupCard: React.FC<
  MyResourceWithinResourceGroupCardProps
> = ({ fetchKey, isRefetching, ...props }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { xs } = Grid.useBreakpoint();

  const currentProject = useCurrentProjectValue();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<string>();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);

  const [{ checkPresetInfo, isRefetching: internalIsRefetching }, { refetch }] =
    useResourceLimitAndRemaining({
      currentProjectName: currentProject.name,
      currentResourceGroup: deferredSelectedResourceGroup || 'default',
      fetchKey,
    });

  const resourceSlotsDetails = useResourceSlotsDetails(
    deferredSelectedResourceGroup || 'default',
  );
  const [displayType, setDisplayType] = useState<'usage' | 'capacity'>('usage');

  const { acceleratorSlotsDetails, cpuValues, memValues } = useMemo(() => {
    const accelerators = _.chain(resourceSlotsDetails?.resourceSlotsInRG)
      .omit(['cpu', 'mem'])
      .map((resourceSlot, key) => ({ key, resourceSlot }))
      .value();

    const cpu = getResourceValue(
      displayType,
      'cpu',
      checkPresetInfo,
      deferredSelectedResourceGroup || 'default',
    );

    const mem = getResourceValue(
      displayType,
      'mem',
      checkPresetInfo,
      deferredSelectedResourceGroup || 'default',
    );

    return {
      acceleratorSlotsDetails: accelerators,
      cpuValues: cpu,
      memValues: mem,
    };
  }, [
    resourceSlotsDetails,
    displayType,
    checkPresetInfo,
    deferredSelectedResourceGroup,
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
    (values: { current: number }, resourceSlot: ResourceSlotDetail) => (
      <BAIResourceWithSteppedProgress
        current={values.current}
        title={resourceSlot.human_readable_name}
        unit={resourceSlot.display_unit}
        showProgress={false}
      />
    ),
    [],
  );

  return (
    <BAICard
      {...props}
      title={
        <Flex gap={'xs'} align="center" wrap="wrap">
          <Flex gap={'xs'}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('webui.menu.MyResourcesIn')}
            </Typography.Title>
            <ResourceGroupSelectForCurrentProject
              showSearch
              style={{ minWidth: 100 }}
              onChange={(v) => setSelectedResourceGroup(v)}
              loading={selectedResourceGroup !== deferredSelectedResourceGroup}
              popupMatchSelectWidth={false}
              tooltip={t('general.ResourceGroup')}
            />
          </Flex>
          <Tooltip
            title={
              <Trans
                i18nKey={'webui.menu.MyResourcesInResourceGroupDescription'}
              />
            }
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
            defaultValue={displayType}
            onChange={(v) => setDisplayType(v as 'usage' | 'capacity')}
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
                displayType,
                key,
                checkPresetInfo,
                deferredSelectedResourceGroup || 'default',
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

export default MyResourceWithinResourceGroupCard;
