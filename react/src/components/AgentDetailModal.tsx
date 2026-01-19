import { AgentDetailModalFragment$key } from '../__generated__/AgentDetailModalFragment.graphql';
import {
  convertToDecimalUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { Col, Row, theme, Typography } from 'antd';
import {
  useResourceSlotsDetails,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIProgressWithLabel,
  convertToBinaryUnit,
} from 'backend.ai-ui';
import _ from 'lodash';
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
        <Row gutter={[24, 24]}>
          {parsedLiveStat?.devices?.cpu_util ? (
            <Col xs={24} sm={12}>
              <BAIFlex direction="column" gap="xxs" align="stretch">
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  {mergedResourceSlots?.cpu?.human_readable_name}
                </Typography.Title>
                {_.map(parsedLiveStat?.devices?.cpu_util, (value, key) => (
                  <BAIFlex justify="between">
                    <Typography.Text
                      key={key}
                      type="secondary"
                      style={{ flex: 0.5 }}
                    >
                      {mergedResourceSlots?.cpu?.human_readable_name}
                      {key}
                    </Typography.Text>
                    <BAIProgressWithLabel
                      percent={value?.pct}
                      valueLabel={
                        toFixedFloorWithoutTrailingZeros(value?.pct, 1) + '%'
                      }
                    />
                  </BAIFlex>
                ))}
              </BAIFlex>
            </Col>
          ) : null}
          <Col xs={24} sm={12}>
            {parsedAvailableSlots?.mem ? (
              <BAIFlex direction="column" gap="xxs" align="stretch">
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  {mergedResourceSlots?.mem?.human_readable_name}
                </Typography.Title>
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
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  {t('session.launcher.Network')}
                </Typography.Title>
                <BAIFlex gap="xl">
                  <Typography.Text>TX:</Typography.Text>
                  <Typography.Text>
                    {
                      convertToDecimalUnit(
                        parsedLiveStat?.node?.net_tx?.current,
                        'm',
                        2,
                      )?.displayValue
                    }
                    B
                  </Typography.Text>
                </BAIFlex>
                <BAIFlex gap="xl">
                  <Typography.Text>RX:</Typography.Text>
                  <Typography.Text>
                    {
                      convertToDecimalUnit(
                        parsedLiveStat?.node?.net_rx?.current,
                        'm',
                        2,
                      )?.displayValue
                    }
                    B
                  </Typography.Text>
                </BAIFlex>
              </BAIFlex>
            ) : null}
          </Col>
        </Row>
        <Row gutter={[24, 24]} style={{ marginBottom: token.marginSM }}>
          {_.map(_.keys(parsedLiveStat?.devices), (key) => {
            if (['cpu_util', 'mem', 'disk', 'net_rx', 'net_tx'].includes(key)) {
              return null;
            } else if (_.includes(key, '_util')) {
              const deviceName = _.split(key, '_')[0] + '.device';
              return (
                <Col xs={24} sm={12}>
                  <BAIFlex direction="column" gap="xxs" align="stretch">
                    <Typography.Title level={5} style={{ marginTop: 0 }}>
                      {mergedResourceSlots?.[deviceName]?.human_readable_name}{' '}
                      {t('session.Utilization')}
                    </Typography.Title>
                    {_.map(
                      _.toPairs(parsedLiveStat?.devices[key]),
                      (value, index) => (
                        <BAIFlex justify="between">
                          <Typography.Text
                            key={index}
                            type="secondary"
                            style={{ flex: 0.5 }}
                          >
                            {
                              mergedResourceSlots?.[deviceName]
                                ?.human_readable_name
                            }
                            {index}
                          </Typography.Text>
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
                </Col>
              );
            } else if (_.includes(key, '_mem')) {
              const deviceName = _.split(key, '_')[0] + '.device';
              return (
                <Col xs={24} sm={12}>
                  <BAIFlex direction="column" gap="xxs" align="stretch">
                    <Typography.Title level={5} style={{ marginTop: 0 }}>
                      {mergedResourceSlots?.[deviceName]?.human_readable_name}{' '}
                      {t('session.launcher.Memory')}
                    </Typography.Title>
                    {_.map(
                      _.toPairs(parsedLiveStat?.devices[key]),
                      (value, index) => (
                        <BAIFlex justify="between">
                          <Typography.Text
                            key={index}
                            type="secondary"
                            style={{ flex: 0.5 }}
                          >
                            {
                              mergedResourceSlots?.[deviceName]
                                ?.human_readable_name
                            }
                            {index}
                          </Typography.Text>
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
                </Col>
              );
            }
          })}
        </Row>
      </BAIFlex>
    </BAIModal>
  );
};

export default AgentDetailModal;
