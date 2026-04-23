/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
'use memo';
import { useCurrentKeyPairResourcePolicyLazyLoadQuery } from '../hooks/hooksUsingRelay';
import { ResourceAllocationFormValue } from './SessionFormItems/ResourceAllocationFormItems';
import {
  Alert,
  Descriptions,
  Form,
  FormInstance,
  InputNumber,
  theme,
  Typography,
} from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const MIN_COUNT = 2;

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
  const max = Math.max(sessionLimitAndRemaining.max, MIN_COUNT);
  const safeClusterSize = Math.max(clusterSize, 1);
  const remaining = sessionLimitAndRemaining.remaining;

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
        initialValues={{ count: MIN_COUNT }}
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
                max,
                message: t(
                  'session.launcher.LaunchMultipleSessionsMaxExceeded',
                  { max },
                ),
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              min={MIN_COUNT}
              style={{ width: '100%' }}
              suffix={t('session.launcher.Sessions')}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.count !== next.count}
          >
            {({ getFieldValue }) => {
              const count = getFieldValue('count') ?? MIN_COUNT;
              const totalContainers = count * safeClusterSize;
              const showQuotaWarning =
                typeof remaining === 'number' && totalContainers > remaining;
              return (
                <BAIFlex direction="column" align="stretch" gap="md">
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
                    <Descriptions.Item
                      label={t('session.launcher.ClusterMode')}
                    >
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

                  {showQuotaWarning ? (
                    <Alert
                      type="warning"
                      showIcon
                      title={t(
                        'session.launcher.LaunchMultipleSessionsQuotaWarning',
                        {
                          requested: totalContainers,
                          remaining,
                        },
                      )}
                    />
                  ) : null}
                </BAIFlex>
              );
            }}
          </Form.Item>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default LaunchMultipleSessionsModal;
