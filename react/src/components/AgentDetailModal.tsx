/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentDetailModalFragment$key } from '../__generated__/AgentDetailModalFragment.graphql';
import {
  convertToDecimalUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { theme } from '../theme-shim';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIProgressWithLabel,
  convertToBinaryUnit,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type LiveStat = {
  capacity: string;
  current: string;
  pct: string;
  'stats.avg': string;
  'stats.max': string;
  unit_hint: string;
};

interface AgentDetailModalProps extends BAIModalProps {
  agentNodeFrgmt?: AgentDetailModalFragment$key | null;
  onRequestClose: () => void;
}

const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agentNodeFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const agent = useFragment(
    graphql`
      fragment AgentDetailModalFragment on AgentNode {
        id
        live_stat
        available_slots
        occupied_slots
      }
    `,
    agentNodeFrgmt,
  );
  const parsedLiveStat = JSON.parse(agent?.live_stat || '{}');
  const parsedAvailableSlots = JSON.parse(agent?.available_slots || '{}');

  return (
    <BAIModal
      {...modalProps}
      centered
      title={t('agent.DetailedInformation')}
      onCancel={onRequestClose}
      destroyOnHidden
      footer={null}
    >
      <BAIFlex direction="column" align="stretch" gap={'md'}>
        {/* antd Row gutter={[24,24]} + Col xs={24} sm={12} (uniform 2-up from
            576px) → Grid columns={{minWidth:280, max:2}} gap={6}
            (RESPONSIVE-POLICY R1; 24px gutter = step 6). */}
        <Grid columns={{ minWidth: 280, max: 2 }} gap={6}>
          {parsedLiveStat?.devices?.cpu_util ? (
            <BAIFlex direction="column" gap="xxs" align="stretch">
              {/* antd Title level={5} → Heading level={3} (ticket 15
                  precedent: every level is a visual decision, not a
                  rename — MAPPING §4). */}
              <Heading level={3}>
                {mergedResourceSlots?.cpu?.human_readable_name}
              </Heading>
              {_.map(parsedLiveStat?.devices?.cpu_util, (value, key) => (
                <BAIFlex key={key} justify="between">
                  <Text color="secondary" style={{ flex: 0.5 }}>
                    {mergedResourceSlots?.cpu?.human_readable_name}
                    {key}
                  </Text>
                  <BAIProgressWithLabel
                    percent={value?.pct}
                    valueLabel={
                      toFixedFloorWithoutTrailingZeros(value?.pct, 1) + '%'
                    }
                  />
                </BAIFlex>
              ))}
            </BAIFlex>
          ) : null}
          <BAIFlex direction="column" gap="sm" align="stretch">
            {parsedAvailableSlots?.mem ? (
              <BAIFlex direction="column" gap="xxs" align="stretch">
                <Heading level={3}>
                  {mergedResourceSlots?.mem?.human_readable_name}
                </Heading>
                <BAIProgressWithLabel
                  percent={parsedLiveStat?.node?.mem?.pct || 0}
                  valueLabel={`${
                    convertToBinaryUnit(
                      _.toString(parsedLiveStat?.node?.mem?.current || 0),
                      'g',
                    )?.displayValue
                  } / ${convertToBinaryUnit(_.toString(parsedLiveStat?.node?.mem?.capacity || 0), 'g')?.displayValue}`}
                />
              </BAIFlex>
            ) : null}
            {parsedLiveStat?.node ? (
              <BAIFlex direction="column" gap="xxs" align="start">
                <Heading level={3}>{t('session.launcher.Network')}</Heading>
                <BAIFlex gap="xl">
                  <Text>TX:</Text>
                  <Text>
                    {
                      convertToDecimalUnit(
                        parsedLiveStat?.node?.net_tx?.current,
                        'm',
                        2,
                      )?.displayValue
                    }
                    B
                  </Text>
                </BAIFlex>
                <BAIFlex gap="xl">
                  <Text>RX:</Text>
                  <Text>
                    {
                      convertToDecimalUnit(
                        parsedLiveStat?.node?.net_rx?.current,
                        'm',
                        2,
                      )?.displayValue
                    }
                    B
                  </Text>
                </BAIFlex>
              </BAIFlex>
            ) : null}
          </BAIFlex>
        </Grid>
        <Grid
          columns={{ minWidth: 280, max: 2 }}
          gap={6}
          style={{ marginBottom: token.marginSM }}
        >
          {_.map(_.keys(parsedLiveStat?.devices), (key) => {
            if (['cpu_util', 'mem', 'disk', 'net_rx', 'net_tx'].includes(key)) {
              return null;
            } else if (_.includes(key, '_util')) {
              const deviceName =
                _.split(key, '_').slice(0, -1).join('-') + '.device';
              return (
                <BAIFlex key={key} direction="column" gap="xxs" align="stretch">
                  <Heading level={3}>
                    {mergedResourceSlots?.[deviceName]?.human_readable_name}{' '}
                    {t('session.Utilization')}
                  </Heading>
                  {_.map(
                    _.toPairs(parsedLiveStat?.devices[key]),
                    (value, index) => (
                      <BAIFlex key={index} justify="between">
                        <Text color="secondary" style={{ flex: 0.5 }}>
                          {
                            mergedResourceSlots?.[deviceName]
                              ?.human_readable_name
                          }
                          {index}
                        </Text>
                        <BAIProgressWithLabel
                          percent={_.toFinite((value?.[1] as LiveStat)?.pct)}
                          valueLabel={
                            toFixedFloorWithoutTrailingZeros(
                              (value?.[1] as LiveStat)?.pct,
                              1,
                            ) + '%'
                          }
                        />
                      </BAIFlex>
                    ),
                  )}
                </BAIFlex>
              );
            } else if (_.includes(key, '_mem')) {
              const deviceName =
                _.split(key, '_').slice(0, -1).join('-') + '.device';
              return (
                <BAIFlex key={key} direction="column" gap="xxs" align="stretch">
                  <Heading level={3}>
                    {mergedResourceSlots?.[deviceName]?.human_readable_name}{' '}
                    {t('session.launcher.Memory')}
                  </Heading>
                  {_.map(
                    _.toPairs(parsedLiveStat?.devices[key]),
                    (value, index) => (
                      <BAIFlex key={index} justify="between">
                        <Text color="secondary" style={{ flex: 0.5 }}>
                          {
                            mergedResourceSlots?.[deviceName]
                              ?.human_readable_name
                          }
                          {index}
                        </Text>
                        <BAIProgressWithLabel
                          percent={_.toFinite((value?.[1] as LiveStat)?.pct)}
                          valueLabel={
                            toFixedFloorWithoutTrailingZeros(
                              (value?.[1] as LiveStat)?.pct,
                              1,
                            ) + '%'
                          }
                        />
                      </BAIFlex>
                    ),
                  )}
                </BAIFlex>
              );
            }
          })}
        </Grid>
      </BAIFlex>
    </BAIModal>
  );
};

export default AgentDetailModal;
