/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectResourcePolicyListMutation } from '../__generated__/ProjectResourcePolicyListMutation.graphql';
import {
  ProjectResourcePolicyListQuery,
  ProjectResourcePolicyListQuery$data,
} from '../__generated__/ProjectResourcePolicyListQuery.graphql';
import { ProjectResourcePolicySettingModalFragment$key } from '../__generated__/ProjectResourcePolicySettingModalFragment.graphql';
import {
  bytesToGB,
  localeCompare,
  numberSorterWithInfinityValue,
} from '../helper';
import { exportCSVWithFormattingRules } from '../helper/csv-util';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import ProjectResourcePolicySettingModal from './ProjectResourcePolicySettingModal';
import {
  DeleteFilled,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { App, Button, Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
  useUpdatableState,
  BAINameActionCell,
  BAIDeleteConfirmModal,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type ProjectResourcePolicies = NonNullable<
  NonNullable<
    ProjectResourcePolicyListQuery$data['project_resource_policies']
  >[number]
>;

interface ProjectResourcePolicyListProps {}

const ProjectResourcePolicyList: React.FC<
  ProjectResourcePolicyListProps
> = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [projectResourcePolicyFetchKey, updateProjectResourcePolicyFetchKey] =
    useUpdatableState('initial-fetch');
  const [isCreatingPolicySetting, setIsCreatingPolicySetting] = useState(false);
  const [editingProjectResourcePolicy, setEditingProjectResourcePolicy] =
    useState<ProjectResourcePolicySettingModalFragment$key | null>();
  const [deletingPolicyName, setDeletingPolicyName] = useState<string | null>(
    null,
  );

  const baiClient = useSuspendedBackendaiClient();
  const supportMaxNetworkCount = baiClient?.supports('max_network_count');

  const { project_resource_policies } =
    useLazyLoadQuery<ProjectResourcePolicyListQuery>(
      graphql`
        query ProjectResourcePolicyListQuery {
          project_resource_policies {
            id
            name
            created_at
            # follows version of https://github.com/lablup/backend.ai/pull/1993
            # --------------- START --------------------
            max_vfolder_count @since(version: "23.09.6")
            max_quota_scope_size @since(version: "23.09.2")
            # ---------------- END ---------------------
            max_network_count @since(version: "24.12.0")
            ...ProjectResourcePolicySettingModalFragment
          }
        }
      `,
      {},
      {
        fetchPolicy:
          projectResourcePolicyFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey: projectResourcePolicyFetchKey,
      },
    );

  const [commitDelete] = useMutation<ProjectResourcePolicyListMutation>(graphql`
    mutation ProjectResourcePolicyListMutation($name: String!) {
      delete_project_resource_policy(name: $name) {
        ok
        msg
      }
    }
  `);

  const columns = filterOutEmpty<ColumnType<ProjectResourcePolicies>>([
    {
      title: t('resourcePolicy.Name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      sorter: (a, b) => localeCompare(a?.name, b?.name),
      render: (name: string, row: ProjectResourcePolicies) => (
        <BAINameActionCell
          title={name}
          showActions="always"
          actions={[
            {
              key: 'settings',
              title: t('button.Settings'),
              icon: <SettingOutlined />,
              onClick: () => {
                setEditingProjectResourcePolicy(row);
              },
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <DeleteFilled />,
              type: 'danger',
              onClick: () => {
                setDeletingPolicyName(row?.name ?? null);
              },
            },
          ]}
        />
      ),
    },
    {
      title: t('resourcePolicy.MaxVFolderCount'),
      dataIndex: 'max_vfolder_count',
      key: 'max_vfolder_count',
      render: (text: ProjectResourcePolicies) =>
        _.toNumber(text) === 0 ? '∞' : text,
      sorter: (a, b) =>
        numberSorterWithInfinityValue(
          a?.max_vfolder_count,
          b?.max_vfolder_count,
          0,
        ),
    },
    {
      title: t('resourcePolicy.MaxQuotaScopeSize'),
      dataIndex: 'max_quota_scope_size',
      key: 'max_quota_scope_size',
      render: (text) => (text === -1 ? '∞' : bytesToGB(text)),
      sorter: (a, b) =>
        numberSorterWithInfinityValue(
          a?.max_quota_scope_size,
          b?.max_quota_scope_size,
          -1,
        ),
    },
    supportMaxNetworkCount
      ? {
          title: t('resourcePolicy.MaxNetworkCount'),
          dataIndex: 'max_network_count',
          key: 'max_network_count',
          render: (text) => (text === -1 ? '∞' : text),
          sorter: () => true,
        }
      : {},
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => localeCompare(a?.id, b?.id),
    },
    {
      title: t('resourcePolicy.CreatedAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('lll'),
      sorter: (a, b) => localeCompare(a?.created_at, b?.created_at),
    },
  ]);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ProjectResourcePolicyList',
  );

  const supportedFields = _.compact(
    _.map(columns, (column) => _.toString(column.key)),
  );

  const handleExportCSV = (selectedExportKeys: string[]) => {
    if (selectedExportKeys.length === 0) {
      message.error(t('resourcePolicy.NoDataToExport'));
      return;
    }
    if (!project_resource_policies) {
      message.error(t('resourcePolicy.NoDataToExport'));
      return;
    }

    const responseData = _.map(project_resource_policies, (policy) => {
      return _.pick(
        policy,
        selectedExportKeys.map((key) => key as keyof ProjectResourcePolicies),
      );
    });
    exportCSVWithFormattingRules(
      responseData as ProjectResourcePolicies[],
      'project_resource_polices',
      {
        max_vfolder_count: (text: ProjectResourcePolicies) =>
          _.toNumber(text) === 0 ? '-' : text,
        max_quota_scope_size: (text) => (text === -1 ? '-' : bytesToGB(text)),
      },
    );
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="end" wrap="wrap" gap={'xs'}>
        <BAIFlex gap={'xs'}>
          <Tooltip title={t('button.Refresh')}>
            <Button
              icon={<ReloadOutlined />}
              loading={isRefetchPending}
              onClick={() => {
                startRefetchTransition(() =>
                  updateProjectResourcePolicyFetchKey(),
                );
              }}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsCreatingPolicySetting(true);
            }}
          >
            {t('button.Create')}
          </Button>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        rowKey="id"
        showSorterTooltip={false}
        columns={columns}
        dataSource={filterOutNullAndUndefined(project_resource_policies)}
        scroll={{ x: 'max-content' }}
        tableSettings={{
          columnOverrides: columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        exportSettings={{
          supportedFields,
          onExport: async (selectedExportKeys) => {
            handleExportCSV(selectedExportKeys);
          },
        }}
      />
      <ProjectResourcePolicySettingModal
        existingPolicyNames={_.map(project_resource_policies, 'name')}
        open={!!editingProjectResourcePolicy || isCreatingPolicySetting}
        projectResourcePolicyFrgmt={editingProjectResourcePolicy || null}
        onRequestClose={(success) => {
          if (success) {
            startRefetchTransition(() => updateProjectResourcePolicyFetchKey());
          }
          setEditingProjectResourcePolicy(null);
          setIsCreatingPolicySetting(false);
        }}
      />
      <BAIDeleteConfirmModal
        open={!!deletingPolicyName}
        items={
          deletingPolicyName
            ? [{ key: deletingPolicyName, label: deletingPolicyName }]
            : []
        }
        title={t('resourcePolicy.DeletePolicy')}
        description={t('resourcePolicy.DeletePolicyDescription')}
        onOk={() => {
          if (deletingPolicyName) {
            return new Promise<void>((resolve) => {
              commitDelete({
                variables: { name: deletingPolicyName },
                onCompleted: (res, errors) => {
                  if (!res?.delete_project_resource_policy?.ok) {
                    message.error(res?.delete_project_resource_policy?.msg);
                    resolve();
                    return;
                  }
                  if (errors && errors?.length > 0) {
                    for (const error of errors) {
                      message.error(error.message);
                    }
                  } else {
                    startRefetchTransition(() =>
                      updateProjectResourcePolicyFetchKey(),
                    );
                    message.success(t('resourcePolicy.SuccessfullyDeleted'));
                  }
                  setDeletingPolicyName(null);
                  resolve();
                },
                onError(err) {
                  message.error(err?.message);
                  setDeletingPolicyName(null);
                  resolve();
                },
              });
            });
          }
        }}
        onCancel={() => setDeletingPolicyName(null)}
      />
    </BAIFlex>
  );
};

export default ProjectResourcePolicyList;
