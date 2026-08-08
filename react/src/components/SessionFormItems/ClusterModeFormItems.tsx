/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { convertToBinaryUnit } from '../../helper';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentKeyPairResourcePolicyLazyLoadQuery } from '../../hooks/hooksUsingRelay';
import { RemainingSlots } from '../../hooks/useResourceLimitAndRemaining';
import InputNumberWithSlider from '../InputNumberWithSlider';
import RemainingMark from './RemainingMark';
// FRONTIER (ticket 17): the form ENGINE is still antd's (ticket 34's
// self-hosted engine is parked). The CONTROLS are Astryx now.
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleHelp } from 'lucide-react';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

/**
 * The cluster-mode segmented control. A local adapter rather than the shared
 * `AstryxFormSegmented`, because each option carries a help tooltip that the
 * shared option shape does not model. The two `Form.Item` contracts are
 * honoured inline: `value` is coalesced and the change handler takes the
 * VALUE.
 */
const ClusterModeSegmented: React.FC<{
  label: string;
  isDisabled?: boolean;
  onValueChange: () => void;
  items: Array<{ value: string; label: string; tooltip: React.ReactNode }>;
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
}> = ({ label, isDisabled, onValueChange, items, value, onChange }) => {
  'use memo';
  return (
    <SegmentedControl
      label={label}
      isDisabled={isDisabled}
      value={value ?? items[0]?.value ?? ''}
      onChange={(next) => {
        onChange?.(next);
        onValueChange();
      }}
    >
      {items.map((item) => (
        <SegmentedControlItem
          key={item.value}
          value={item.value}
          label={item.label}
          icon={
            <Tooltip content={item.tooltip}>
              <CircleHelp size="1em" />
            </Tooltip>
          }
        />
      ))}
    </SegmentedControl>
  );
};

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

  const baiClient = useSuspendedBackendaiClient();
  const supportMultiAgents = baiClient.supports('multi-agents');

  const [{ keypairResourcePolicy }] =
    useCurrentKeyPairResourcePolicyLazyLoadQuery();

  return (
    <Form.Item
      label={t('session.launcher.ClusterMode')}
      required
      dependencies={['agent']}
    >
      {({ getFieldValue }) => {
        return (
          <>
            <BAIFlex direction="column" align="stretch">
              {/* MAPPING §3.10: `Radio.Group` whose children are
                  `Radio.Button` -> `SegmentedControl` + `SegmentedControlItem`.
                  PILOT-DECISION: `SegmentedControlItem.label` is a required
                  STRING (P2), so the per-option help tooltip cannot stay
                  inside the label. It moves to the item's `icon` slot — the
                  same `CircleHelp` glyph and the same `Trans` copy, now
                  leading the label instead of trailing it (the only visual
                  change) and with the manual `marginLeft` gone, since the
                  slot owns its spacing. */}
              <Form.Item name={'cluster_mode'} required noStyle>
                <ClusterModeSegmented
                  label={t('session.launcher.ClusterMode')}
                  isDisabled={
                    !supportMultiAgents &&
                    !_.isEqual(_.castArray(getFieldValue('agent')), ['auto'])
                  }
                  onValueChange={() => {
                    form.validateFields().catch(() => undefined);
                  }}
                  items={[
                    {
                      value: 'multi-node',
                      label: t('session.launcher.MultiNode'),
                      tooltip: (
                        <Trans i18nKey={'session.launcher.DescMultiNode'} />
                      ),
                    },
                    {
                      value: 'single-node',
                      label: t('session.launcher.SingleNode'),
                      tooltip: (
                        <Trans i18nKey={'session.launcher.DescSingleNode'} />
                      ),
                    },
                  ]}
                />
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
                      noStyle
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
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </BAIFlex>
          </>
        );
      }}
    </Form.Item>
  );
};

export default ClusterModeFormItems;
