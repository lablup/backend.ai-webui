import { iSizeToSize } from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import BAIModal, { BAIModalProps } from './BAIModal';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import Flex from './Flex';
import { AgentDetailModalFragment$key } from './__generated__/AgentDetailModalFragment.graphql';
import { Col, Row, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

type LiveStat = {
  capacity: string;
  current: string;
  pct: string;
  'stats.avg': string;
  'stats.max': string;
  unit_hint: string;
};

interface AgentDetailModalProps extends BAIModalProps {
  agentDetailModalFrgmt?: AgentDetailModalFragment$key | null;
  onRequestClose: () => void;
}

const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agentDetailModalFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const [resourceSlotsDetails] = useResourceSlotsDetails();
  const agent = useFragment(
    graphql`
      fragment AgentDetailModalFragment on Agent {
        id
        live_stat
        available_slots
        occupied_slots
        cpu_cur_pct
        mem_cur_bytes
      }
    `,
    agentDetailModalFrgmt,
  );
  const parsedLiveStat = JSON.parse(agent?.live_stat || '{}');
  const parsedAvailableSlots = JSON.parse(agent?.available_slots || '{}');

  return (
    <BAIModal
      {...modalProps}
      centered
      title={`${t('agent.DetailedInformation')}: ${agent?.id}`}
      onCancel={onRequestClose}
      destroyOnClose
      footer={<></>}
    >
      <Row gutter={[16, 16]}>
        <Col xs={{ flex: '100%' }} sm={{ flex: '50%' }}>
          {parsedLiveStat?.devices?.cpu_util ? (
            <Flex direction="column" gap="xxs" align="stretch">
              <Typography.Title level={5}>
                {resourceSlotsDetails?.cpu?.human_readable_name}
              </Typography.Title>
              {_.map(parsedLiveStat?.devices?.cpu_util, (value, key) => (
                <Flex justify="between">
                  <Typography.Text
                    key={key}
                    type="secondary"
                    style={{ flex: 0.5 }}
                  >
                    {resourceSlotsDetails?.cpu?.human_readable_name}
                    {key}
                  </Typography.Text>
                  <BAIProgressWithLabel
                    percent={value?.pct}
                    valueLabel={value?.pct + '%'}
                  />
                </Flex>
              ))}
            </Flex>
          ) : null}
        </Col>
        <Col xs={{ flex: '100%' }} sm={{ flex: '50%' }}>
          {parsedAvailableSlots?.mem ? (
            <Flex direction="column" gap="xxs" align="stretch">
              <Typography.Title level={5}>
                {resourceSlotsDetails?.mem?.human_readable_name}
              </Typography.Title>
              <BAIProgressWithLabel
                percent={
                  ((iSizeToSize(_.toString(agent?.mem_cur_bytes), 'g')
                    ?.number ?? 0) /
                    (iSizeToSize(parsedAvailableSlots?.mem, 'g')?.number ??
                      0)) *
                    100 ?? 0
                }
                valueLabel={`${
                  iSizeToSize(_.toString(agent?.mem_cur_bytes), 'g')?.numberUnit
                }iB / ${iSizeToSize(parsedAvailableSlots?.mem, 'g')?.numberUnit}iB`}
              />
            </Flex>
          ) : null}
          {parsedLiveStat?.node ? (
            <Flex direction="column" gap="xxs" align="start">
              <Typography.Title level={5}>
                {t('session.launcher.Network')}
              </Typography.Title>
              <Flex gap="xl">
                <Typography.Text>TX:</Typography.Text>
                <Typography.Text>
                  {
                    iSizeToSize(parsedLiveStat?.node?.net_tx?.current, 'm', 1)
                      ?.numberUnit
                  }
                  iB
                </Typography.Text>
              </Flex>
              <Flex gap="xl">
                <Typography.Text>RX:</Typography.Text>
                <Typography.Text>
                  {
                    iSizeToSize(parsedLiveStat?.node?.net_rx?.current, 'm', 1)
                      ?.numberUnit
                  }
                  iB
                </Typography.Text>
              </Flex>
            </Flex>
          ) : null}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        {_.map(_.keys(parsedLiveStat?.devices), (key) => {
          if (['cpu_util', 'mem', 'disk', 'net_rx', 'net_tx'].includes(key)) {
            return null;
          } else if (_.includes(key, '_util')) {
            const deviceName = _.split(key, '_')[0] + '.device';
            return (
              <Col xs={{ flex: '100%' }} sm={{ flex: '50%' }}>
                <Flex direction="column" gap="xxs" align="stretch">
                  <Typography.Title level={5}>
                    {resourceSlotsDetails?.[deviceName]?.human_readable_name}{' '}
                    {t('session.Utilization')}
                  </Typography.Title>
                  {_.map(
                    _.toPairs(parsedLiveStat?.devices[key]),
                    (value, index) => (
                      <Flex justify="between">
                        <Typography.Text
                          key={index}
                          type="secondary"
                          style={{ flex: 0.5 }}
                        >
                          {
                            resourceSlotsDetails?.[deviceName]
                              ?.human_readable_name
                          }
                          {index}
                        </Typography.Text>
                        <BAIProgressWithLabel
                          percent={_.toFinite((value?.[1] as LiveStat)?.pct)}
                          valueLabel={(value?.[1] as LiveStat)?.pct + '%'}
                        />
                      </Flex>
                    ),
                  )}
                </Flex>
              </Col>
            );
          } else if (_.includes(key, '_mem')) {
            const deviceName = _.split(key, '_')[0] + '.device';
            return (
              <Col xs={{ flex: '100%' }} sm={{ flex: '50%' }}>
                <Flex direction="column" gap="xxs" align="stretch">
                  <Typography.Title level={5}>
                    {resourceSlotsDetails?.[deviceName]?.human_readable_name}{' '}
                    {t('session.launcher.Memory')}
                  </Typography.Title>
                  {_.map(
                    _.toPairs(parsedLiveStat?.devices[key]),
                    (value, index) => (
                      <Flex justify="between">
                        <Typography.Text
                          key={index}
                          type="secondary"
                          style={{ flex: 0.5 }}
                        >
                          {
                            resourceSlotsDetails?.[deviceName]
                              ?.human_readable_name
                          }
                          {index}
                        </Typography.Text>
                        <BAIProgressWithLabel
                          percent={_.toFinite((value?.[1] as LiveStat)?.pct)}
                          valueLabel={(value?.[1] as LiveStat)?.pct + '%'}
                        />
                      </Flex>
                    ),
                  )}
                </Flex>
              </Col>
            );
          }
        })}
      </Row>
    </BAIModal>
  );
};

export default AgentDetailModal;
