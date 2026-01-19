import SimpleProgressWithLabel from '../SimpleProgressWithLabel';
import { Col, Descriptions, Row } from 'antd';
import {
  BAIFlex,
  BAIText,
  convertToBinaryUnit,
  convertToDecimalUnit,
  convertUnitValue,
  ResourceSlotName,
  ResourceTypeIcon,
  toFixedFloorWithoutTrailingZeros,
  useResourceSlotsDetails,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { AgentResourcesFragment$key } from 'src/__generated__/AgentResourcesFragment.graphql';

interface AgentResourcesProps {
  agentNodeFrgmt?: AgentResourcesFragment$key | null;
}

const AgentResources: React.FC<AgentResourcesProps> = ({ agentNodeFrgmt }) => {
  'use memo';

  const { t } = useTranslation();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const agent = useFragment(
    graphql`
      fragment AgentResourcesFragment on AgentNode {
        occupied_slots
        available_slots
        live_stat
        gpu_alloc_map
      }
    `,
    agentNodeFrgmt,
  );

  const parsedOccupiedSlots: {
    [key in ResourceSlotName]: string | undefined;
  } = JSON.parse(agent?.occupied_slots || '{}');
  const parsedAvailableSlots: {
    [key in ResourceSlotName]: string | undefined;
  } = JSON.parse(agent?.available_slots || '{}');
  const parsedLiveStat = JSON.parse(agent?.live_stat || '{}');

  return (
    <Descriptions bordered column={1} labelStyle={{ wordBreak: 'keep-all' }}>
      <Descriptions.Item label={t('agent.ResourceAllocation')}>
        <Row gutter={[16, 16]}>
          {_.map(
            parsedAvailableSlots,
            (_value: string | number, key: ResourceSlotName) => {
              if (key === 'cpu') {
                const cpuOccupiedSlot = parseFloat(
                  parsedOccupiedSlots.cpu ?? '0',
                );
                const cpuAvailableSlot = parseFloat(
                  parsedAvailableSlots.cpu ?? '0',
                );
                return (
                  <Col xs={24} sm={12} key={key}>
                    <BAIFlex direction="column" align="stretch" gap={3}>
                      <SimpleProgressWithLabel
                        key="cpu"
                        size="default"
                        title={
                          <BAIFlex gap="xxs">
                            <ResourceTypeIcon key={key} type={key} />
                            {mergedResourceSlots?.['cpu']?.human_readable_name}
                          </BAIFlex>
                        }
                        percent={_.toFinite(
                          (_.toNumber(parsedOccupiedSlots.cpu ?? 0) /
                            _.toNumber(parsedAvailableSlots.cpu ?? 1)) *
                            100,
                        ).toString()}
                        description={`${cpuOccupiedSlot} / ${cpuAvailableSlot} ${mergedResourceSlots?.['cpu']?.display_unit}`}
                      />
                    </BAIFlex>
                  </Col>
                );
              } else if (key === 'mem') {
                const memOccupiedSlot = convertToBinaryUnit(
                  parsedOccupiedSlots.mem || '0',
                  'g',
                  0,
                );
                const memAvailableSlot = convertToBinaryUnit(
                  parsedAvailableSlots.mem || '0',
                  'g',
                  0,
                );

                return (
                  <Col xs={24} sm={12} key={key}>
                    <BAIFlex direction="column" align="stretch" gap={3}>
                      <SimpleProgressWithLabel
                        key={'mem'}
                        size="default"
                        title={
                          <BAIFlex gap="xxs">
                            <ResourceTypeIcon key={key} type={key} />
                            {mergedResourceSlots?.['mem']?.human_readable_name}
                          </BAIFlex>
                        }
                        percent={_.toFinite(
                          ((memOccupiedSlot?.number ?? 0) /
                            (memAvailableSlot?.number ?? 1)) *
                            100,
                        ).toString()}
                        description={`${toFixedFloorWithoutTrailingZeros(
                          memOccupiedSlot?.numberFixed || 0,
                          2,
                        )}${memOccupiedSlot?.displayUnit} / ${toFixedFloorWithoutTrailingZeros(
                          memAvailableSlot?.numberFixed || 0,
                          2,
                        )}${memAvailableSlot?.displayUnit}`}
                      />
                    </BAIFlex>
                  </Col>
                );
              } else if (parsedAvailableSlots[key]) {
                return (
                  <Col xs={24} sm={12} key={key}>
                    <SimpleProgressWithLabel
                      key={key}
                      size="default"
                      title={
                        <BAIFlex gap="xxs">
                          <ResourceTypeIcon key={key} type={key} />
                          {mergedResourceSlots?.[key]?.human_readable_name}
                        </BAIFlex>
                      }
                      percent={_.toFinite(
                        (_.toNumber(parsedOccupiedSlots[key] ?? 0) /
                          _.toNumber(parsedAvailableSlots[key] ?? 1)) *
                          100,
                      ).toString()}
                      description={`${parsedOccupiedSlots[key] ?? 0} / ${parsedAvailableSlots[key] ?? 0} ${mergedResourceSlots?.[key]?.display_unit}`}
                    />
                  </Col>
                );
              }
            },
          )}
        </Row>
      </Descriptions.Item>
      {!_.isEmpty(agent?.gpu_alloc_map) && (
        <Descriptions.Item label={t('agent.AcceleratorAllocations')}>
          <Row gutter={[16, 8]}>
            {_.map(
              agent?.gpu_alloc_map as Record<string, number> | null,
              (count, deviceId) => (
                <Col xs={24} sm={12} key={deviceId}>
                  <BAIFlex justify="between" gap="xxs">
                    <BAIText
                      ellipsis={{ tooltip: true }}
                      style={{ maxWidth: 140 }}
                      copyable
                    >
                      {deviceId}
                    </BAIText>
                    <BAIText>{count}</BAIText>
                  </BAIFlex>
                </Col>
              ),
            )}
          </Row>
        </Descriptions.Item>
      )}
      <Descriptions.Item label={t('agent.Utilization')}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} key={'cpu_util'}>
            <SimpleProgressWithLabel
              key={'cpu_util'}
              size="default"
              title={mergedResourceSlots?.cpu?.human_readable_name}
              percent={(
                Math.min(
                  _.toFinite(parsedLiveStat?.node?.cpu_util?.pct) /
                    100 /
                    (_.keys(parsedLiveStat?.devices?.cpu_util).length || 1),
                  1,
                ) * 100
              ).toString()}
              description={`${toFixedFloorWithoutTrailingZeros(
                Math.min(
                  _.toFinite(parsedLiveStat?.node?.cpu_util?.pct) /
                    100 /
                    (_.keys(parsedLiveStat?.devices?.cpu_util).length || 1),
                  1,
                ) * 100,
                2,
              )}%`}
            />
          </Col>
          <Col xs={24} sm={12} key={'mem'}>
            <SimpleProgressWithLabel
              key={'mem'}
              size="default"
              title={mergedResourceSlots?.mem?.human_readable_name}
              percent={toFixedFloorWithoutTrailingZeros(
                (parsedLiveStat?.node?.mem?.current /
                  (parsedAvailableSlots?.mem ||
                    parsedLiveStat?.node?.mem?.capacity)) *
                  100 || 0,
                2,
              )}
              description={`${toFixedFloorWithoutTrailingZeros(
                convertToBinaryUnit(
                  parsedLiveStat?.node?.mem?.current || '0',
                  convertUnitValue(
                    _.toString(parsedLiveStat?.node?.mem.capacity),
                    'auto',
                  )?.unit || 'g',
                )?.number || 0,
                2,
              )} / ${toFixedFloorWithoutTrailingZeros(
                convertToBinaryUnit(
                  parsedAvailableSlots?.mem ||
                    parsedLiveStat?.node?.mem?.capacity ||
                    '0',
                  convertUnitValue(
                    _.toString(
                      parsedAvailableSlots?.mem ||
                        parsedLiveStat?.node?.mem.capacity,
                    ),
                    'auto',
                  )?.unit || 'g',
                )?.number || 0,
                2,
              )}${
                convertToBinaryUnit(
                  parsedLiveStat?.node?.mem?.capacity || '0',
                  convertUnitValue(
                    _.toString(parsedLiveStat?.node?.mem.capacity),
                    'auto',
                  )?.unit || 'g',
                )?.displayUnit
              }  (${toFixedFloorWithoutTrailingZeros(
                parsedLiveStat?.node?.mem?.pct || 0,
                2,
              )}%)`}
            />
          </Col>
          {_.map(_.keys(parsedLiveStat?.node), (statKey) => {
            if (['cpu_util', 'mem', 'disk'].includes(statKey)) {
              return null;
            }
            if (_.includes(statKey, '_util')) {
              const deviceName = _.split(statKey, '_')[0] + '.device';
              const current = _.toFinite(
                parsedLiveStat?.node?.[statKey]?.current,
              );
              const capacity =
                _.toFinite(parsedLiveStat?.node?.[statKey]?.capacity) || 100;
              const percent = (current / capacity) * 100 || 0;
              return (
                <Col xs={24} sm={12} key={statKey}>
                  <SimpleProgressWithLabel
                    size="default"
                    title={`${mergedResourceSlots?.[deviceName]?.human_readable_name}(util)`}
                    percent={toFixedFloorWithoutTrailingZeros(percent, 1)}
                    description={`${toFixedFloorWithoutTrailingZeros(percent, 1)}%`}
                  />
                </Col>
              );
            }
            if (_.includes(statKey, '_mem')) {
              const deviceName = _.split(statKey, '_')[0] + '.device';
              const current = _.toFinite(
                parsedLiveStat?.node?.[statKey]?.current,
              );
              const capacity = _.toFinite(
                parsedLiveStat?.node?.[statKey]?.capacity,
              );
              const baseUnit =
                convertUnitValue(_.toString(capacity), 'auto')?.unit || 'g';
              const percent = (current / capacity) * 100 || 0;
              return (
                <Col xs={24} sm={12} key={statKey}>
                  <SimpleProgressWithLabel
                    size="default"
                    title={`${mergedResourceSlots?.[deviceName]?.human_readable_name}(mem)`}
                    percent={toFixedFloorWithoutTrailingZeros(percent, 1)}
                    description={`${
                      convertToBinaryUnit(_.toString(current), baseUnit)
                        ?.numberFixed
                    } / ${
                      convertToBinaryUnit(_.toString(capacity), baseUnit)
                        ?.displayValue
                    }`}
                  />
                </Col>
              );
            }
            if (_.includes(statKey, '_power')) {
              const deviceName =
                _.split(statKey, '_').slice(0, -1).join('-') + '.device';
              const humanReadableName =
                mergedResourceSlots?.[deviceName]?.human_readable_name;
              return (
                <Col xs={24} sm={12} key={statKey}>
                  <BAIFlex justify="between" gap="xxs">
                    <BAIText>{`${humanReadableName}(power)`}</BAIText>
                    <BAIText>{`${toFixedFloorWithoutTrailingZeros(parsedLiveStat?.node?.[statKey]?.current, 2)} ${parsedLiveStat?.node?.[statKey]?.unit_hint ?? ''}`}</BAIText>
                  </BAIFlex>
                </Col>
              );
            }
            if (_.includes(statKey, '_temperature')) {
              const deviceName =
                _.split(statKey, '_').slice(0, -1).join('_') + '.device';
              const humanReadableName =
                mergedResourceSlots?.[deviceName]?.human_readable_name;
              return (
                <Col xs={24} sm={12} key={statKey}>
                  <BAIFlex justify="between" gap="xxs">
                    <BAIText>{`${humanReadableName}(temp)`}</BAIText>
                    <BAIText>{`${toFixedFloorWithoutTrailingZeros(parsedLiveStat?.node?.[statKey]?.current, 2)} °C`}</BAIText>
                  </BAIFlex>
                </Col>
              );
            }
            if (['net_rx', 'net_tx'].includes(statKey)) {
              const convertedValue = convertToDecimalUnit(
                parsedLiveStat?.node?.[statKey]?.current,
                'auto',
              );
              return (
                <Col xs={24} sm={12} key={statKey}>
                  <BAIFlex justify="between" gap="xxs">
                    <BAIText>
                      {statKey === 'net_rx' ? 'Net Rx' : 'Net Tx'}
                    </BAIText>
                    <BAIText>{`${convertedValue?.numberFixed ?? 0} ${convertedValue?.unit.toUpperCase() ?? ''}bps`}</BAIText>
                  </BAIFlex>
                </Col>
              );
            }
            return (
              <Col xs={24} sm={12} key={statKey}>
                <BAIFlex justify="between" gap="xxs">
                  <BAIText>{statKey}</BAIText>
                  <BAIText>{`${toFixedFloorWithoutTrailingZeros(parsedLiveStat?.node?.[statKey]?.current ?? 0, 2)}${parsedLiveStat?.node?.[statKey]?.unit_hint ? ` ${parsedLiveStat?.node?.[statKey]?.unit_hint}` : ''}`}</BAIText>
                </BAIFlex>
              </Col>
            );
          })}
        </Row>
      </Descriptions.Item>
    </Descriptions>
  );
};

export default AgentResources;
