import {
  TotalResourceWithinResourceGroupCardFragment$key,
  TotalResourceWithinResourceGroupCardFragment$data,
} from '../__generated__/TotalResourceWithinResourceGroupCardFragment.graphql';
import { convertToBinaryUnit } from '../helper';
import {
  ResourceSlotDetail,
  useResourceSlotsDetails,
} from '../hooks/backendai';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  Col,
  Divider,
  Empty,
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
import {
  useMemo,
  useState,
  useTransition,
  useDeferredValue,
  useEffect,
  useCallback,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface TotalResourceWithinResourceGroupCardProps extends BAICardProps {
  queryRef: TotalResourceWithinResourceGroupCardFragment$key;
  isRefetching?: boolean;
}

type AgentSummary = NonNullable<
  TotalResourceWithinResourceGroupCardFragment$data['agent_summary_list']
>['items'][number];

const UNLIMITED_VALUES = [NaN, Infinity, Number.MAX_SAFE_INTEGER];

const TotalResourceWithinResourceGroupCard: React.FC<
  TotalResourceWithinResourceGroupCardProps
> = ({ queryRef, isRefetching, ...props }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { xs } = Grid.useBreakpoint();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<string>();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment TotalResourceWithinResourceGroupCardFragment on Queries
      @argumentDefinitions(resourceGroup: { type: "String" })
      @refetchable(
        queryName: "TotalResourceWithinResourceGroupCardFragmentRefetchQuery"
      ) {
        agent_summary_list(
          limit: 1000
          offset: 0
          status: "ALIVE"
          scaling_group: $resourceGroup
          filter: "schedulable == true"
        ) {
          items {
            id
            status
            available_slots
            occupied_slots
            scaling_group
          }
          total_count
        }
      }
    `,
    queryRef,
  );

  const resourceSlotsDetails = useResourceSlotsDetails();
  const [type, setType] = useState<'usage' | 'capacity'>('usage');

  useEffect(() => {
    if (deferredSelectedResourceGroup) {
      refetch({
        resourceGroup: deferredSelectedResourceGroup,
      });
    }
  }, [deferredSelectedResourceGroup, refetch]);

  const getResourceValue = (
    type: 'usage' | 'capacity',
    resource: string,
    totalOccupied: number,
    totalAvailable: number,
  ): { current: number; total: number } => {
    const isMemory = resource === 'mem';

    const getCurrentValue = () => {
      if (type === 'usage') {
        return isMemory
          ? _.toNumber(convertToBinaryUnit(totalOccupied, 'g')?.numberFixed)
          : _.toNumber(totalOccupied);
      }

      const capacity = totalAvailable - totalOccupied;
      return isMemory
        ? _.toNumber(convertToBinaryUnit(capacity, 'g')?.numberFixed)
        : _.toNumber(capacity);
    };

    const getTotalValue = () => {
      return isMemory
        ? _.toNumber(convertToBinaryUnit(totalAvailable, 'g')?.numberFixed)
        : _.toNumber(totalAvailable);
    };

    return {
      current: getCurrentValue(),
      total: getTotalValue(),
    };
  };

  const { acceleratorSlotsDetails, cpuValues, memValues } = useMemo(() => {
    const agents = data?.agent_summary_list?.items || [];

    const totalOccupiedSlots: Record<string, number> = {};
    const totalAvailableSlots: Record<string, number> = {};

    _.forEach(agents as AgentSummary[], (agent) => {
      if (!agent) return;
      const occupiedSlots = JSON.parse(agent.occupied_slots || '{}');
      const availableSlots = JSON.parse(agent.available_slots || '{}');

      _.forEach(occupiedSlots, (value, key) => {
        totalOccupiedSlots[key] =
          (totalOccupiedSlots[key] || 0) + _.toNumber(value);
      });

      _.forEach(availableSlots, (value, key) => {
        totalAvailableSlots[key] =
          (totalAvailableSlots[key] || 0) + _.toNumber(value);
      });
    });

    const accelerators = _.chain(resourceSlotsDetails?.resourceSlotsInRG)
      .omit(['cpu', 'mem'])
      .map((resourceSlot, key) => ({
        key,
        resourceSlot,
        values: getResourceValue(
          type,
          key,
          totalOccupiedSlots[key] || 0,
          totalAvailableSlots[key] || 0,
        ),
      }))
      .value();

    const cpu = getResourceValue(
      type,
      'cpu',
      totalOccupiedSlots['cpu'] || 0,
      totalAvailableSlots['cpu'] || 0,
    );

    const mem = getResourceValue(
      type,
      'mem',
      totalOccupiedSlots['mem'] || 0,
      totalAvailableSlots['mem'] || 0,
    );

    return {
      acceleratorSlotsDetails: accelerators,
      cpuValues: cpu,
      memValues: mem,
    };
  }, [data, type, resourceSlotsDetails]);

  const hasMemoryData = useMemo(() => memValues.total > 0, [memValues.total]);

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
          <Flex gap={'xs'}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('webui.menu.TotalResourcesIn')}
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
                i18nKey={'webui.menu.TotalResourcesInResourceGroupDescription'}
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
            defaultValue={type}
            onChange={(v) => setType(v as 'usage' | 'capacity')}
          />
          <BAIFetchKeyButton
            loading={isRefetching || isPendingRefetch}
            value=""
            onChange={() => {
              startRefetchTransition(() => {
                refetch(
                  {
                    resourceGroup: deferredSelectedResourceGroup,
                  },
                  {
                    fetchPolicy: 'network-only',
                  },
                );
              });
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
      {_.isEmpty(data?.agent_summary_list) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Row
          gutter={[40, 16]}
          align="middle"
          style={{
            padding: 0,
            margin: token.marginLG,
            marginTop: token.marginSM,
          }}
        >
          {resourceSlotsDetails?.resourceSlotsInRG?.['cpu'] &&
            cpuValues.total > 0 && (
              <Col style={{ justifyItems: 'center', overflow: 'break-word' }}>
                {renderResourceProgress(
                  cpuValues,
                  resourceSlotsDetails.resourceSlotsInRG['cpu'],
                )}
              </Col>
            )}

          {hasMemoryData &&
            resourceSlotsDetails?.resourceSlotsInRG?.['mem'] && (
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
              {_.map(
                acceleratorSlotsDetails,
                ({ key, resourceSlot, values }, index) => {
                  if (!resourceSlot || values.total === 0) return null;

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
                },
              )}
            </>
          )}
        </Row>
      )}
    </BAICard>
  );
};

export default TotalResourceWithinResourceGroupCard;
