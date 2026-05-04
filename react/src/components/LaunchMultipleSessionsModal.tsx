/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
'use memo';
import { useCurrentKeyPairResourcePolicyLazyLoadQuery } from '../hooks/hooksUsingRelay';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
import { ResourceAllocationFormValue } from './SessionFormItems/ResourceAllocationFormItems';
import {
  Descriptions,
  Form,
  FormInstance,
  InputNumber,
  theme,
  Typography,
} from 'antd';
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
    <Typography.Text>
      {label}
      &nbsp;
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        ({clusterSize})
      </Typography.Text>
    </Typography.Text>
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
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t('session.launcher.LaunchMultipleSessionsDescription')}
          </Typography.Paragraph>

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
            <InputNumber
              min={MIN_COUNT}
              precision={0}
              step={1}
              style={{ width: '100%' }}
              suffix={t('session.launcher.Sessions')}
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
                <Descriptions
                  column={1}
                  size="small"
                  colon={false}
                  styles={{ label: { width: 160 } }}
                >
                  <Descriptions.Item label={t('general.ResourceGroup')}>
                    {resourceGroup || (
                      <Typography.Text type="secondary">
                        {t('general.None')}
                      </Typography.Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('session.launcher.ClusterMode')}>
                    <ClusterModeSummary
                      clusterMode={clusterMode}
                      clusterSize={safeClusterSize}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t(
                      'session.launcher.LaunchMultipleSessionsPerSession',
                    )}
                  >
                    <BAIFlex direction="row" gap="xxs" wrap="wrap">
                      <ResourcePreview
                        resource={resource}
                        containerCount={safeClusterSize}
                      />
                    </BAIFlex>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t('session.launcher.LaunchMultipleSessionsTotal')}
                  >
                    <BAIFlex direction="row" gap="xxs" wrap="wrap">
                      <ResourcePreview
                        resource={resource}
                        containerCount={totalContainers}
                      />
                    </BAIFlex>
                  </Descriptions.Item>
                </Descriptions>
              );
            }}
          </Form.Item>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default LaunchMultipleSessionsModal;
