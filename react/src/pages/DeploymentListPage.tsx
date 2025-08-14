import BAIFetchKeyButton from '../components/BAIFetchKeyButton';
import BAIPropertyFilter from '../components/BAIPropertyFilter';
import DeploymentList from '../components/DeploymentList';
import { mockDeployments } from '../components/TempMockData';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button, // Col, Row, Typography
} from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';
import { StringParam, withDefault } from 'use-query-params';

const DeploymentListPage: React.FC = () => {
  const { t } = useTranslation();
  // const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [, setIsCreateModalOpen] = useState(false);

  const { tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam({
      current: 1,
      pageSize: 10,
    });

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.DeploymentListPage',
  );

  const [queryParams, setQuery] = useDeferredQueryParams({
    order: withDefault(StringParam, '-created_at'),
    filter: withDefault(StringParam, undefined),
  });

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      {/* <Row gutter={[16, 16]}>
        <Col span={24}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('deployment.Deployments')}
          </Typography.Title>
        </Col>
      </Row> */}

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
                  {
                    key: 'status',
                    propertyLabel: t('deployment.Status'),
                    type: 'string',
                  },
                  {
                    key: 'public',
                    propertyLabel: t('deployment.Public'),
                    type: 'boolean',
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
              onChange: (current, pageSize) => {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
              },
            }}
            onChangeOrder={(order) => {
              setQuery({ order }, 'replaceIn');
            }}
            tableSettings={{
              columnOverrides: columnOverrides,
              onColumnOverridesChange: setColumnOverrides,
            }}
          />
        </BAIFlex>
      </BAICard>

      {/* TODO: Add DeploymentCreateModal when available */}
      {/* 
      <DeploymentCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // Refresh the deployment list
          updateFetchKey();
        }}
      />
      */}
    </BAIFlex>
  );
};

export default DeploymentListPage;
