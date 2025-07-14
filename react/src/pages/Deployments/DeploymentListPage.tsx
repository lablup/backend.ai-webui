import BAIFetchKeyButton from '../../components/BAIFetchKeyButton';
import DeploymentCreateModal from '../../components/Deployments/DeploymentCreateModal';
import DeploymentList from '../../components/Deployments/DeploymentList';
import { useUpdatableState } from '../../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../../hooks/reactPaginationQueryOptions';
import { useDeferredQueryParams } from '../../hooks/useDeferredQueryParams';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Typography } from 'antd';
import { BAICard, BAIFlex, BAIPropertyFilter } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, withDefault } from 'use-query-params';

const DeploymentListPage: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam({
      current: 1,
      pageSize: 10,
    });

  const [queryParams, setQuery] = useDeferredQueryParams({
    order: withDefault(StringParam, '-created_at'),
    filter: withDefault(StringParam, undefined),
  });

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  // Mock data for demonstration
  const mockDeployments = [
    {
      id: '1',
      name: 'llama-3-deployment',
      endpoint_url: 'https://api.example.com/v1/llama-3',
      total_gpu: 8,
      total_cpu: 32,
      active_replicas: 4,
      active_revisions: 2,
      tokens_last_hour: 15420,
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'gpt-4-expert-setup',
      endpoint_url: 'https://api.example.com/v1/gpt-4',
      total_gpu: 16,
      total_cpu: 64,
      active_replicas: 8,
      active_revisions: 3,
      tokens_last_hour: 28750,
      created_at: '2024-01-14T15:45:00Z',
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('deployment.Deployments')}
          </Typography.Title>
        </Col>
      </Row>

      <BAICard
        variant="borderless"
        title={t('deployment.DeploymentList')}
        extra={
          <BAIFlex gap={'xs'}>
            <BAIFetchKeyButton
              loading={false}
              autoUpdateDelay={15_000}
              value={fetchKey}
              onChange={(newFetchKey) => {
                updateFetchKey(newFetchKey);
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t('deployment.CreateDeployment')}
            </Button>
          </BAIFlex>
        }
        styles={{
          header: {
            borderBottom: 'none',
          },
          body: {
            paddingTop: 0,
          },
        }}
      >
        <BAIFlex direction="column" align="stretch" gap={'sm'}>
          <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
            <BAIFlex
              gap={'sm'}
              align="start"
              style={{
                flexShrink: 1,
              }}
              wrap="wrap"
            >
              <BAIPropertyFilter
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('deployment.DeploymentName'),
                    type: 'string',
                  },
                  {
                    key: 'domain',
                    propertyLabel: t('deployment.Domain'),
                    type: 'string',
                  },
                ]}
                value={queryParams.filter}
                onChange={(value) => {
                  setQuery({ filter: value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                }}
              />
            </BAIFlex>
          </BAIFlex>

          <DeploymentList
            deployments={mockDeployments}
            loading={false}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: mockDeployments.length,
              showTotal: (total) => (
                <Typography.Text type="secondary">
                  {t('general.TotalItems', { total: total })}
                </Typography.Text>
              ),
              onChange: (current, pageSize) => {
                if (current && pageSize) {
                  setTablePaginationOption({ current, pageSize });
                }
              },
            }}
          />
        </BAIFlex>
      </BAICard>

      <DeploymentCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // Refresh the deployment list
          updateFetchKey();
        }}
      />
    </BAIFlex>
  );
};

export default DeploymentListPage;
