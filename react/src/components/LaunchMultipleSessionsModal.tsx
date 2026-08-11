/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
'use memo';
import { Form, FormInstance } from '../form-engine';
import { useCurrentKeyPairResourcePolicyLazyLoadQuery } from '../hooks/hooksUsingRelay';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import { theme } from '../theme-shim';
import { ResourceAllocationFormValue } from './SessionFormItems/ResourceAllocationFormItems';
import { AstryxFormNumberInput } from './astryxFormControls';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  convertToBinaryUnit,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const MIN_COUNT = 1;
const DEFAULT_COUNT = 2;
const MAX_COUNT = 10;

type FormOrResourceRequired = {
  resource: ResourceAllocationFormValue['resource'];
  containerCount?: number;
};

interface BatchLaunchFormValues {
  count: number;
}

interface LaunchMultipleSessionsModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  resource: ResourceAllocationFormValue['resource'];
  clusterSize: number;
  clusterMode: 'single-node' | 'multi-node';
  resourceGroup?: string;
  ResourcePreview: React.FC<FormOrResourceRequired>;
  onRequestClose: (count?: number) => void;
}

const ClusterModeSummary: React.FC<{
  clusterMode: 'single-node' | 'multi-node';
  clusterSize: number;
}> = ({ clusterMode, clusterSize }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const label =
    clusterMode === 'single-node'
      ? t('session.launcher.SingleNodeShort')
      : t('session.launcher.MultiNodeShort');
  return (
    <Text>
      {label}
      &nbsp;
      <Text color="secondary" style={{ fontSize: token.fontSizeSM }}>
        ({clusterSize})
      </Text>
    </Text>
  );
};

const LaunchMultipleSessionsModal: React.FC<
  LaunchMultipleSessionsModalProps
> = ({
  resource,
  clusterSize,
  clusterMode,
  resourceGroup,
  ResourcePreview,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const formRef = useRef<FormInstance<BatchLaunchFormValues>>(null);
  const [{ sessionLimitAndRemaining }] =
    useCurrentKeyPairResourcePolicyLazyLoadQuery();
  const safeClusterSize = Math.max(clusterSize, 1);
  const remainingSessionQuota = sessionLimitAndRemaining.remaining;

  const currentProject = useCurrentProjectValue();
  const [{ checkPresetInfo }] = useResourceLimitAndRemaining({
    currentProjectName: currentProject.name ?? '',
    currentResourceGroup: resourceGroup,
  });
  const remainingResources =
    checkPresetInfo?.scaling_groups?.[resourceGroup ?? '']?.remaining;

  return (
    <BAIModal
      title={t('session.launcher.LaunchMultipleSessions')}
      okText={t('session.launcher.Start')}
      cancelText={t('button.Cancel')}
      destroyOnHidden
      width={560}
      {...baiModalProps}
      onOk={async () => {
        const values = await formRef.current
          ?.validateFields()
          .catch(() => null);
        if (!values) return;
        onRequestClose(values.count);
      }}
      onCancel={() => onRequestClose()}
      afterClose={() => formRef.current?.resetFields()}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={{ count: DEFAULT_COUNT }}
        preserve={false}
      >
        <BAIFlex direction="column" align="stretch" gap="md">
          {/* antd `Typography.Paragraph` → `Text as="p" display="block"`. */}
          <Text as="p" display="block" style={{ marginBottom: 0 }}>
            {t('session.launcher.LaunchMultipleSessionsDescription')}
          </Text>

          <Form.Item
            name="count"
            label={t('session.launcher.LaunchMultipleSessionsSessionCount')}
            required
            rules={[
              { required: true },
              {
                type: 'number',
                max: MAX_COUNT,
                message: t(
                  'session.launcher.LaunchMultipleSessionsHardCapExceeded',
                  { max: MAX_COUNT },
                ),
              },
              {
                validator: (_rule, value) => {
                  if (value == null || Number.isInteger(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject();
                },
              },
              {
                warningOnly: true,
                validator: async (_rule, value: number) => {
                  if (typeof value !== 'number') return Promise.resolve();
                  const totalContainers = value * safeClusterSize;
                  if (
                    typeof remainingSessionQuota === 'number' &&
                    totalContainers > remainingSessionQuota
                  ) {
                    return Promise.reject(
                      t('session.launcher.LaunchMultipleSessionsQuotaWarning', {
                        requested: totalContainers,
                        remaining: remainingSessionQuota,
                      }),
                    );
                  }
                  return Promise.resolve();
                },
              },
              {
                warningOnly: true,
                validator: async (_rule, value: number) => {
                  if (typeof value !== 'number') return Promise.resolve();
                  if (!remainingResources) return Promise.resolve();
                  const totalContainers = value * safeClusterSize;
                  const requestedCpu =
                    Number(resource.cpu) * totalContainers || 0;
                  const requestedMem =
                    (convertToBinaryUnit(resource.mem, '')?.number || 0) *
                    totalContainers;
                  const requestedAccelerator =
                    Number(resource.accelerator) * totalContainers || 0;
                  const remainingCpu = Number(remainingResources.cpu);
                  const remainingMem = Number(remainingResources.mem);
                  const acceleratorType = resource.acceleratorType;
                  const remainingAccelerator = acceleratorType
                    ? Number(_.get(remainingResources, acceleratorType))
                    : NaN;

                  const cpuExceeds =
                    Number.isFinite(remainingCpu) &&
                    requestedCpu > remainingCpu;
                  const memExceeds =
                    Number.isFinite(remainingMem) &&
                    requestedMem > remainingMem;
                  const acceleratorExceeds =
                    !!acceleratorType &&
                    Number.isFinite(remainingAccelerator) &&
                    requestedAccelerator > remainingAccelerator;

                  if (cpuExceeds || memExceeds || acceleratorExceeds) {
                    return Promise.reject(
                      t('session.launcher.EnqueueComputeSessionWarning'),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            {/* antd `InputNumber` → `AstryxFormNumberInput` (MAPPING §3.17):
                `suffix` → `units` (a genuinely better fit), `precision={0}` →
                `isIntegerOnly`, and `style={{width:'100%'}}` is the adapter's
                default `width`. */}
            <AstryxFormNumberInput
              label={t('session.launcher.LaunchMultipleSessionsSessionCount')}
              min={MIN_COUNT}
              isIntegerOnly
              step={1}
              units={t('session.launcher.Sessions')}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.count !== next.count}
          >
            {({ getFieldValue }) => {
              const count = getFieldValue('count') ?? DEFAULT_COUNT;
              const totalContainers = count * safeClusterSize;
              return (
                // antd `Descriptions` → `MetadataList` (MAPPING §4):
                // `column={1}` → `columns="single"`, `styles.label.width` →
                // `label.width`; `size="small"` and `colon={false}` have no
                // destination (MetadataList renders no colon anyway).
                <MetadataList
                  columns="single"
                  label={{ position: 'start', width: 160 }}
                >
                  <MetadataListItem label={t('general.ResourceGroup')}>
                    {resourceGroup || (
                      <Text color="secondary">{t('general.None')}</Text>
                    )}
                  </MetadataListItem>
                  <MetadataListItem label={t('session.launcher.ClusterMode')}>
                    <ClusterModeSummary
                      clusterMode={clusterMode}
                      clusterSize={safeClusterSize}
                    />
                  </MetadataListItem>
                  <MetadataListItem
                    label={t(
                      'session.launcher.LaunchMultipleSessionsPerSession',
                    )}
                  >
                    <BAIFlex
                      direction="row"
                      gap="xxs"
                      wrap="wrap"
                      style={{ width: '100%' }}
                    >
                      <ResourcePreview
                        resource={resource}
                        containerCount={safeClusterSize}
                      />
                    </BAIFlex>
                  </MetadataListItem>
                  <MetadataListItem
                    label={t('session.launcher.LaunchMultipleSessionsTotal')}
                  >
                    <BAIFlex
                      direction="row"
                      gap="xxs"
                      wrap="wrap"
                      style={{ width: '100%' }}
                    >
                      <ResourcePreview
                        resource={resource}
                        containerCount={totalContainers}
                      />
                    </BAIFlex>
                  </MetadataListItem>
                </MetadataList>
              );
            }}
          </Form.Item>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default LaunchMultipleSessionsModal;
