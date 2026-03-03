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
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import ProjectResourcePolicySettingModal from './ProjectResourcePolicySettingModal';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Dropdown, message, Popconfirm, theme, Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
  useUpdatableState,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { EllipsisIcon } from 'lucide-react';
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
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [projectResourcePolicyFetchKey, updateProjectResourcePolicyFetchKey] =
    useUpdatableState('initial-fetch');
  const [isCreatingPolicySetting, setIsCreatingPolicySetting] = useState(false);
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
  const [inFlightResourcePolicyName, setInFlightResourcePolicyName] =
    useState<string>();
  const [editingProjectResourcePolicy, setEditingProjectResourcePolicy] =
    useState<ProjectResourcePolicySettingModalFragment$key | null>();

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

  const [commitDelete, isInflightDelete] =
    useMutation<ProjectResourcePolicyListMutation>(graphql`
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
    {
      title: t('general.Control'),
      fixed: 'right',
      key: 'control',
      render: (_text: any, row: ProjectResourcePolicies) => (
        <BAIFlex direction="row" align="stretch">
          <Button
            type="text"
            icon={<SettingOutlined />}
            style={{
              color: token.colorInfo,
            }}
            onClick={() => {
              setEditingProjectResourcePolicy(row);
            }}
          />
          <Popconfirm
            title={t('dialog.ask.DoYouWantToProceed')}
            description={t('dialog.warning.CannotBeUndone')}
            okType="danger"
            okText={t('button.Delete')}
            onConfirm={() => {
              if (row?.name) {
                setInFlightResourcePolicyName(
                  row.name + projectResourcePolicyFetchKey,
                );
                commitDelete({
                  variables: {
                    name: row.name,
                  },
                  onCompleted: (res, errors) => {
                    if (!res?.delete_project_resource_policy?.ok) {
                      message.error(res?.delete_project_resource_policy?.msg);
                      return;
                    }
                    if (errors && errors?.length > 0) {
                      const errorMsgList = _.map(
                        errors,
                        (error) => error.message,
                      );
                      for (const error of errorMsgList) {
                        message.error(error);
                      }
                    } else {
                      startRefetchTransition(() =>
                        updateProjectResourcePolicyFetchKey(),
                      );
                      message.success(t('resourcePolicy.SuccessfullyDeleted'));
                    }
                  },
                  onError(err) {
                    message.error(err?.message);
                  },
                });
              }
            }}
          >
            <Button
              type="text"
              icon={
                <DeleteOutlined
                  style={{
                    color: token.colorError,
                  }}
                />
              }
              loading={
                isInflightDelete &&
                inFlightResourcePolicyName ===
                  row?.name + projectResourcePolicyFetchKey
              }
              disabled={
                isInflightDelete &&
                inFlightResourcePolicyName !==
                  row?.name + projectResourcePolicyFetchKey
              }
            />
          </Popconfirm>
        </BAIFlex>
      ),
    },
  ]);

  const [hiddenColumnKeys, setHiddenColumnKeys] = useHiddenColumnKeysSetting(
    'ProjectResourcePolicyList',
  );

  const handleExportCSV = () => {
    if (!project_resource_policies) {
      message.error(t('resourcePolicy.NoDataToExport'));
      return;
    }

    const columnkeys = _.without(
      _.map(columns, (column) => _.toString(column.key)),
      'control',
    );
    const responseData = _.map(project_resource_policies, (policy) => {
      return _.pick(
        policy,
        columnkeys.map((key) => key as keyof ProjectResourcePolicies),
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
        <BAIFlex
          direction="row"
          gap={'xs'}
          wrap="wrap"
          style={{ flexShrink: 1 }}
        >
          <Dropdown
            menu={{
              items: [
                {
                  key: 'exportCSV',
                  label: t('resourcePolicy.ExportCSV'),
                  onClick: () => {
                    handleExportCSV();
                  },
                },
              ],
            }}
            trigger={['click']}
          >
            <Button icon={<EllipsisIcon />} />
          </Dropdown>
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
      </BAIFlex>
      <BAITable
        rowKey="id"
        showSorterTooltip={false}
        columns={_.filter(
          columns,
          (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
        )}
        dataSource={filterOutNullAndUndefined(project_resource_policies)}
        scroll={{ x: 'max-content' }}
        pagination={{
          extraContent: (
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => {
                toggleColumnSettingModal();
              }}
            />
          ),
        }}
      />
      <TableColumnsSettingModal
        open={visibleColumnSettingModal}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setHiddenColumnKeys(
              _.difference(
                columns.map((column) => _.toString(column.key)),
                values?.selectedColumnKeys,
              ),
            );
          toggleColumnSettingModal();
        }}
        columns={columns}
        hiddenColumnKeys={hiddenColumnKeys}
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
    </BAIFlex>
  );
};

export default ProjectResourcePolicyList;
