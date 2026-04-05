/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToBinaryUnit } from '../../helper';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentKeyPairResourcePolicyLazyLoadQuery } from '../../hooks/hooksUsingRelay';
import { RemainingSlots } from '../../hooks/useResourceLimitAndRemaining';
import InputNumberWithSlider from '../InputNumberWithSlider';
import RemainingMark from './RemainingMark';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Card, Form, Radio, Tooltip, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface ClusterModeFormItemsProps {
  remaining?: RemainingSlots;
  showRemainingWarning?: boolean;
}

const DEFAULT_REMAINING: RemainingSlots = {
  cpu: undefined,
  mem: undefined,
  accelerators: {},
};

const ClusterModeFormItems: React.FC<ClusterModeFormItemsProps> = ({
  remaining = DEFAULT_REMAINING,
  showRemainingWarning = false,
}) => {
  'use memo';
  const form = Form.useFormInstance();
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const baiClient = useSuspendedBackendaiClient();
  const supportMultiAgents = baiClient.supports('multi-agents');

  const [{ keypairResourcePolicy }] =
    useCurrentKeyPairResourcePolicyLazyLoadQuery();

  return (
    <Form.Item
      label={t('session.launcher.ClusterMode')}
      required
      dependencies={['agent']}
      noStyle
    >
      {({ getFieldValue }) => {
        return (
          <Card
            style={{
              marginBottom: token.margin,
            }}
          >
            <BAIFlex direction="column" align="stretch">
              <Form.Item
                name={'cluster_mode'}
                required
                style={{ marginBottom: 0 }}
              >
                <Radio.Group
                  onChange={() => {
                    form.validateFields().catch(() => undefined);
                  }}
                  disabled={
                    !supportMultiAgents &&
                    !_.isEqual(_.castArray(getFieldValue('agent')), ['auto'])
                  }
                >
                  <Radio.Button value="multi-node">
                    {t('session.launcher.MultiNode')}
                    <Tooltip
                      title={
                        <Trans i18nKey={'session.launcher.DescMultiNode'} />
                      }
                    >
                      <QuestionCircleOutlined
                        style={{ marginLeft: token.marginXXS }}
                      />
                    </Tooltip>
                  </Radio.Button>
                  <Radio.Button value="single-node">
                    {t('session.launcher.SingleNode')}
                    <Tooltip
                      title={
                        <Trans i18nKey={'session.launcher.DescSingleNode'} />
                      }
                    >
                      <QuestionCircleOutlined
                        style={{ marginLeft: token.marginXXS }}
                      />
                    </Tooltip>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, next) =>
                  prev.cluster_mode !== next.cluster_mode ||
                  prev.cluster_size !== next.cluster_size ||
                  prev.resource?.cpu !== next.resource?.cpu ||
                  prev.resource?.mem !== next.resource?.mem ||
                  prev.resource?.accelerator !== next.resource?.accelerator ||
                  prev.resource?.acceleratorType !==
                    next.resource?.acceleratorType
                }
              >
                {() => {
                  const derivedClusterSizeMaxLimit =
                    keypairResourcePolicy.max_containers_per_session;

                  const clusterUnit =
                    form.getFieldValue('cluster_mode') === 'single-node'
                      ? t('session.launcher.Container')
                      : t('session.launcher.Node');

                  // Calculate max cluster size that can start immediately
                  // based on current resource allocation and remaining resources
                  const currentResource = form.getFieldValue('resource');
                  const maxClusterCandidates: number[] = [];
                  if (
                    Number.isFinite(remaining.cpu) &&
                    currentResource?.cpu > 0
                  ) {
                    maxClusterCandidates.push(
                      Math.floor(remaining.cpu! / currentResource.cpu),
                    );
                  }
                  if (Number.isFinite(remaining.mem) && currentResource?.mem) {
                    const memBytes =
                      convertToBinaryUnit(currentResource.mem, '')?.number || 0;
                    if (memBytes > 0) {
                      maxClusterCandidates.push(
                        Math.floor(remaining.mem! / memBytes),
                      );
                    }
                  }
                  const accelType = currentResource?.acceleratorType;
                  const accelValue = currentResource?.accelerator || 0;
                  if (
                    accelType &&
                    accelValue > 0 &&
                    Number.isFinite(remaining.accelerators[accelType])
                  ) {
                    maxClusterCandidates.push(
                      Math.floor(
                        remaining.accelerators[accelType]! / accelValue,
                      ),
                    );
                  }
                  const maxImmediateClusterSize =
                    maxClusterCandidates.length > 0
                      ? _.min(maxClusterCandidates)
                      : undefined;

                  // Use resource-aware remaining mark instead of raw remaining.cpu
                  // Clamp to slider max so the mark doesn't render outside the range
                  const remainingMarkValue =
                    _.isNumber(maxImmediateClusterSize) &&
                    maxImmediateClusterSize >= 1
                      ? _.isNumber(derivedClusterSizeMaxLimit)
                        ? Math.min(
                            maxImmediateClusterSize,
                            derivedClusterSizeMaxLimit,
                          )
                        : maxImmediateClusterSize
                      : undefined;

                  return (
                    <Form.Item
                      name={'cluster_size'}
                      label={t('session.launcher.ClusterSize')}
                      required
                      dependencies={[
                        ['resource', 'cpu'],
                        ['resource', 'mem'],
                        ['resource', 'accelerator'],
                        ['resource', 'acceleratorType'],
                      ]}
                      rules={[
                        {
                          warningOnly: true,
                          validator: async (_rule, value: number) => {
                            if (
                              form.getFieldValue('cluster_mode') ===
                                'multi-node' &&
                              value === 1
                            ) {
                              return Promise.reject(
                                t(
                                  'session.launcher.ClusterSizeOneMultiNodeConvertInfo',
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                        {
                          warningOnly: true,
                          validator: async (_rule, value: number) => {
                            if (showRemainingWarning && value > 1) {
                              if (
                                _.isNumber(maxImmediateClusterSize) &&
                                maxImmediateClusterSize >= 1 &&
                                value > maxImmediateClusterSize
                              ) {
                                return Promise.reject(
                                  t(
                                    'session.launcher.ClusterSizeExceedsImmediateCapacity',
                                    {
                                      maxClusterSize: maxImmediateClusterSize,
                                      unit: clusterUnit,
                                    },
                                  ),
                                );
                              }
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumberWithSlider
                        inputContainerMinWidth={190}
                        min={1}
                        step={1}
                        max={
                          _.isNumber(derivedClusterSizeMaxLimit)
                            ? derivedClusterSizeMaxLimit
                            : undefined
                        }
                        disabled={
                          derivedClusterSizeMaxLimit === 1 ||
                          (!supportMultiAgents &&
                            !_.isEqual(_.castArray(getFieldValue('agent')), [
                              'auto',
                            ]))
                        }
                        sliderProps={{
                          marks: {
                            1: '1',
                            // remaining mark code should be located before max mark code to prevent overlapping when it is same value
                            ...(remainingMarkValue
                              ? {
                                  [remainingMarkValue]: {
                                    label: <RemainingMark />,
                                  },
                                }
                              : {}),
                            ...(_.isNumber(derivedClusterSizeMaxLimit)
                              ? {
                                  [derivedClusterSizeMaxLimit]:
                                    derivedClusterSizeMaxLimit,
                                }
                              : {}),
                          },
                          tooltip: {
                            formatter: (value = 0) => {
                              return `${value} ${clusterUnit}`;
                            },
                          },
                        }}
                        inputNumberProps={{
                          suffix: clusterUnit,
                        }}
                        onChange={(value) => {
                          if (value > 1) {
                            form.setFieldValue('num_of_sessions', 1);
                          }
                        }}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </BAIFlex>
          </Card>
        );
      }}
    </Form.Item>
  );
};

export default ClusterModeFormItems;
