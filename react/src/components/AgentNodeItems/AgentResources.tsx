/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentResourcesFragment$key } from '../../__generated__/AgentResourcesFragment.graphql';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import AgentDetailModal from '../AgentDetailModal';
import SimpleProgressWithLabel from '../SimpleProgressWithLabel';
import { Grid } from '@astryxdesign/core/Grid';
import { IconButton } from '@astryxdesign/core/IconButton';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import {
  BAICard,
  BAIFlex,
  BAIMetadataList,
  BAIText,
  convertToBinaryUnit,
  convertToDecimalUnit,
  convertUnitValue,
  ResourceSlotName,
  ResourceTypeIcon,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface AgentResourcesProps {
  agentNodeFrgmt?: AgentResourcesFragment$key | null;
}

const AgentResources: React.FC<AgentResourcesProps> = ({ agentNodeFrgmt }) => {
  'use memo';

  const { t } = useTranslation();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const [openInfoModal, setOpenInfoModal] = useState(false);

  const agent = useFragment(
    graphql`
      fragment AgentResourcesFragment on AgentNode {
        occupied_slots
        available_slots
        live_stat
        gpu_alloc_map

        ...AgentDetailModalFragment
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
    <>
      {/* Dropped from the antd original: `labelStyle` word-break. */}
      <BAICard>
        <BAIMetadataList columns="single">
          <MetadataListItem label={t('agent.ResourceAllocation')}>
            {/* antd Row gutter={[16,16]} + Col xs={24} sm={12} (uniform 2-up
                from 576px) → Grid columns={{minWidth:280, max:2}} gap={4}
                (RESPONSIVE-POLICY R1, container-driven). */}
            <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
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
                      <BAIFlex
                        key={key}
                        direction="column"
                        align="stretch"
                        gap={3}
                      >
                        <SimpleProgressWithLabel
                          key="cpu"
                          size="default"
                          title={
                            <BAIFlex gap="xxs">
                              <ResourceTypeIcon key={key} type={key} />
                              {
                                mergedResourceSlots?.['cpu']
                                  ?.human_readable_name
                              }
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
                      <BAIFlex
                        key={key}
                        direction="column"
                        align="stretch"
                        gap={3}
                      >
                        <SimpleProgressWithLabel
                          key={'mem'}
                          size="default"
                          title={
                            <BAIFlex gap="xxs">
                              <ResourceTypeIcon key={key} type={key} />
                              {
                                mergedResourceSlots?.['mem']
                                  ?.human_readable_name
                              }
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
                    );
                  } else if (parsedAvailableSlots[key]) {
                    const roundLength =
                      mergedResourceSlots?.[key]?.number_format?.round_length ||
                      0;
                    const formatSlotValue = (
                      v: string | undefined | number,
                    ) => {
                      const str = String(v ?? 0);
                      return roundLength > 0
                        ? parseFloat(str).toFixed(roundLength)
                        : str;
                    };
                    return (
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
                        description={`${formatSlotValue(parsedOccupiedSlots[key])} / ${formatSlotValue(parsedAvailableSlots[key])} ${mergedResourceSlots?.[key]?.display_unit}`}
                      />
                    );
                  }
                },
              )}
            </Grid>
          </MetadataListItem>
          {!_.isEmpty(agent?.gpu_alloc_map) && (
            <MetadataListItem label={t('agent.AcceleratorAllocations')}>
              <Grid
                columns={{ minWidth: 280, max: 2 }}
                columnGap={4}
                rowGap={2}
              >
                {_.map(
                  agent?.gpu_alloc_map as Record<string, number> | null,
                  (count, deviceId) => (
                    <BAIFlex key={deviceId} justify="between" gap="xxs">
                      <BAIText
                        ellipsis={{ tooltip: true }}
                        style={{ maxWidth: 140 }}
                        copyable
                      >
                        {deviceId}
                      </BAIText>
                      <BAIText>{count}</BAIText>
                    </BAIFlex>
                  ),
                )}
              </Grid>
            </MetadataListItem>
          )}
          {/* PILOT-DECISION: the antd Tooltip+icon-Button explaining
              "Utilization" lived AFTER the label text (composed inside the
              Descriptions.Item's ReactNode label). MetadataListItem's `label`
              is a plain string and its only label-adjacent slot (`icon`)
              renders BEFORE it — flipped position accepted; the control's
              purpose (open the detail modal) is unchanged. Tooltip on the
              never-disabled trigger becomes IconButton's own `tooltip`. */}
          <MetadataListItem
            label={t('agent.Utilization')}
            icon={
              <IconButton
                icon={<Info size="1em" />}
                label={t('agent.DetailedInformation')}
                tooltip={t('agent.DetailedInformation')}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpenInfoModal(true);
                }}
              />
            }
          >
            {_.isEmpty(parsedLiveStat?.node) ? (
              <BAIText type="secondary">-</BAIText>
            ) : (
              <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
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
                        _.toString(parsedLiveStat?.node?.mem?.capacity),
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
                            parsedLiveStat?.node?.mem?.capacity,
                        ),
                        'auto',
                      )?.unit || 'g',
                    )?.number || 0,
                    2,
                  )}${
                    convertToBinaryUnit(
                      parsedLiveStat?.node?.mem?.capacity || '0',
                      convertUnitValue(
                        _.toString(parsedLiveStat?.node?.mem?.capacity),
                        'auto',
                      )?.unit || 'g',
                    )?.displayUnit
                  }  (${toFixedFloorWithoutTrailingZeros(
                    parsedLiveStat?.node?.mem?.pct || 0,
                    2,
                  )}%)`}
                />
                {_.map(_.keys(parsedLiveStat?.node), (statKey) => {
                  if (['cpu_util', 'mem', 'disk'].includes(statKey)) {
                    return null;
                  }
                  if (_.includes(statKey, '_util')) {
                    const deviceName =
                      _.split(statKey, '_').slice(0, -1).join('-') + '.device';
                    const current = _.toFinite(
                      parsedLiveStat?.node?.[statKey]?.current,
                    );
                    const capacity =
                      _.toFinite(parsedLiveStat?.node?.[statKey]?.capacity) ||
                      100;
                    const percent = (current / capacity) * 100 || 0;
                    return (
                      <SimpleProgressWithLabel
                        key={statKey}
                        size="default"
                        title={`${mergedResourceSlots?.[deviceName]?.human_readable_name}(util)`}
                        percent={toFixedFloorWithoutTrailingZeros(percent, 1)}
                        description={`${toFixedFloorWithoutTrailingZeros(percent, 1)}%`}
                      />
                    );
                  }
                  if (_.includes(statKey, '_mem')) {
                    const deviceName =
                      _.split(statKey, '_').slice(0, -1).join('-') + '.device';
                    const current = _.toFinite(
                      parsedLiveStat?.node?.[statKey]?.current,
                    );
                    const capacity = _.toFinite(
                      parsedLiveStat?.node?.[statKey]?.capacity,
                    );
                    const baseUnit =
                      convertUnitValue(_.toString(capacity), 'auto')?.unit ||
                      'g';
                    const percent = (current / capacity) * 100 || 0;
                    return (
                      <SimpleProgressWithLabel
                        key={statKey}
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
                    );
                  }
                  if (_.includes(statKey, '_power')) {
                    const deviceName =
                      _.split(statKey, '_').slice(0, -1).join('-') + '.device';
                    const humanReadableName =
                      mergedResourceSlots?.[deviceName]?.human_readable_name;
                    return (
                      <BAIFlex key={statKey} justify="between" gap="xxs">
                        <BAIText>{`${humanReadableName}(power)`}</BAIText>
                        <BAIText>{`${toFixedFloorWithoutTrailingZeros(parsedLiveStat?.node?.[statKey]?.current, 2)} ${parsedLiveStat?.node?.[statKey]?.unit_hint ?? ''}`}</BAIText>
                      </BAIFlex>
                    );
                  }
                  if (_.includes(statKey, '_temperature')) {
                    const deviceName =
                      _.split(statKey, '_').slice(0, -1).join('-') + '.device';
                    const humanReadableName =
                      mergedResourceSlots?.[deviceName]?.human_readable_name;
                    return (
                      <BAIFlex key={statKey} justify="between" gap="xxs">
                        <BAIText>{`${humanReadableName}(temp)`}</BAIText>
                        <BAIText>{`${toFixedFloorWithoutTrailingZeros(parsedLiveStat?.node?.[statKey]?.current, 2)} °C`}</BAIText>
                      </BAIFlex>
                    );
                  }
                  if (['net_rx', 'net_tx'].includes(statKey)) {
                    const convertedValue = convertToDecimalUnit(
                      parsedLiveStat?.node?.[statKey]?.current,
                      'auto',
                    );
                    return (
                      <BAIFlex key={statKey} justify="between" gap="xxs">
                        <BAIText>
                          {statKey === 'net_rx' ? 'Net Rx' : 'Net Tx'}
                        </BAIText>
                        <BAIText>{`${convertedValue?.numberFixed ?? 0} ${convertedValue?.unit.toUpperCase() ?? ''}bps`}</BAIText>
                      </BAIFlex>
                    );
                  }
                  return (
                    <BAIFlex key={statKey} justify="between" gap="xxs">
                      <BAIText>{statKey}</BAIText>
                      <BAIText>{`${toFixedFloorWithoutTrailingZeros(parsedLiveStat?.node?.[statKey]?.current ?? 0, 2)}${parsedLiveStat?.node?.[statKey]?.unit_hint ? ` ${parsedLiveStat?.node?.[statKey]?.unit_hint}` : ''}`}</BAIText>
                    </BAIFlex>
                  );
                })}
              </Grid>
            )}
          </MetadataListItem>
        </BAIMetadataList>
      </BAICard>
      <AgentDetailModal
        agentNodeFrgmt={agent}
        open={openInfoModal}
        onRequestClose={() => {
          setOpenInfoModal(false);
        }}
      />
    </>
  );
};

export default AgentResources;
