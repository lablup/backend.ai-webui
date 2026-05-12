import { BAIProjectTableDeleteMutation } from '../../__generated__/BAIProjectTableDeleteMutation.graphql';
import {
  BAIProjectTableFragment$data,
  BAIProjectTableFragment$key,
} from '../../__generated__/BAIProjectTableFragment.graphql';
import { BAIProjectTableModifyMutation } from '../../__generated__/BAIProjectTableModifyMutation.graphql';
import { BAIProjectTablePurgeMutation } from '../../__generated__/BAIProjectTablePurgeMutation.graphql';
import { toLocalId } from '../../helper';
import { useErrorMessageResolver } from '../../hooks';
import BAIConfirmModalWithInput from '../BAIConfirmModalWithInput';
import BAIResourceNumberWithIcon from '../BAIResourceNumberWithIcon';
import BAIText from '../BAIText';
import { BAIColumnsType, BAITable, BAITableProps } from '../Table';
import BAINameActionCell from '../Table/BAINameActionCell';
import AllowedVfolderHostsWithPermission from './BAIAllowedVfolderHostsWithPermission';
import { DeleteFilled, SettingOutlined } from '@ant-design/icons';
import { App, Tag } from 'antd';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { BanIcon, UndoIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

export const availableProjectSorterKeys = [
  'name',
  'id',
  'domain_name',
  'created_at',
  'is_active',
  'resource_policy',
] as const;

export const availableProjectSorterValues = [
  ...availableProjectSorterKeys,
  ...availableProjectSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableProjectSorterKeys, key);
};

type Project = NonNullable<NonNullable<BAIProjectTableFragment$data>[number]>;

export interface BAIProjectTableProps extends Omit<
  BAITableProps<Project>,
  'dataSource' | 'columns' | 'rowKey' | 'onChangeOrder'
> {
  projectFragment: BAIProjectTableFragment$key;
  onChangeOrder?: (
    order: (typeof availableProjectSorterValues)[number] | null,
  ) => void;
  onClickProjectEditButton: (project: Project) => void;
  updateFetchKey?: () => void;
  isActiveTab?: boolean;
}

const BAIProjectTable = ({
  projectFragment,
  onChangeOrder,
  onClickProjectEditButton,
  updateFetchKey,
  isActiveTab = true,
  ...tableProps
}: BAIProjectTableProps) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const [purgingProject, setPurgingProject] = useState<Project | null>(null);

  const projects = useFragment<BAIProjectTableFragment$key>(
    graphql`
      fragment BAIProjectTableFragment on GroupNode @relay(plural: true) {
        id
        row_id
        name
        domain_name
        description
        is_active
        created_at
        total_resource_slots
        integration_id
        resource_policy
        type
        container_registry
        scaling_groups
        ...BAIAllowedVfolderHostsWithPermissionFromGroupFragment
      }
    `,
    projectFragment,
  );

  const [commitDeleteGroup, isInFlightCommitDeleteGroup] =
    useMutation<BAIProjectTableDeleteMutation>(graphql`
      mutation BAIProjectTableDeleteMutation($gid: UUID!) {
        delete_group(gid: $gid) {
          msg
          ok
        }
      }
    `);

  const [commitPurgeGroup] = useMutation<BAIProjectTablePurgeMutation>(graphql`
    mutation BAIProjectTablePurgeMutation($gid: UUID!) {
      purge_group(gid: $gid) {
        ok
        msg
      }
    }
  `);

  const [commitModifyGroup] = useMutation<BAIProjectTableModifyMutation>(
    graphql`
      mutation BAIProjectTableModifyMutation(
        $gid: UUID!
        $props: ModifyGroupInput!
      ) {
        modify_group(gid: $gid, props: $props) {
          ok
          msg
        }
      }
    `,
  );

  const columns: BAIColumnsType<Project> = [
    {
      key: 'name',
      title: t('comp:BAIProjectTable.Name'),
      dataIndex: 'name',
      fixed: 'left',
      sorter: isEnableSorter('name'),
      render: (_value, record) => {
        const isModelStore = record.type === 'MODEL_STORE';
        return (
          <BAINameActionCell
            title={record.name}
            showActions="always"
            actions={[
              {
                key: 'edit',
                title: t('comp:BAIProjectTable.EditProject'),
                icon: <SettingOutlined />,
                disabled: isModelStore,
                onClick: () => {
                  onClickProjectEditButton(record);
                },
              },
              ...(isActiveTab
                ? [
                    {
                      key: 'deactivate',
                      title: t('comp:BAIProjectTable.Deactivate'),
                      icon: <BanIcon />,
                      type: 'danger' as const,
                      disabled: isModelStore,
                      popConfirm: {
                        title: t('comp:BAIProjectTable.DeactivateProject'),
                        description: t(
                          'comp:BAIProjectTable.AreYouSureToDeactivateProject',
                          { projectName: record.name },
                        ),
                        okButtonProps: {
                          danger: true,
                          loading: isInFlightCommitDeleteGroup,
                        },
                        okText: t('comp:BAIProjectTable.Deactivate'),
                        onConfirm: () => {
                          if (!record.row_id) return;
                          commitDeleteGroup({
                            variables: { gid: record.row_id },
                            onCompleted: (response, errors) => {
                              if (errors && errors.length > 0) {
                                errors.forEach((error) => {
                                  message.error(
                                    getErrorMessage(
                                      error,
                                      t(
                                        'comp:BAIProjectTable.FailedToDeactivateProject',
                                      ),
                                    ),
                                  );
                                });
                                return;
                              }
                              if (response.delete_group?.ok) {
                                message.success(
                                  t('comp:BAIProjectTable.ProjectDeactivated'),
                                );
                                updateFetchKey?.();
                              } else {
                                message.error(
                                  response.delete_group?.msg ||
                                    t(
                                      'comp:BAIProjectTable.FailedToDeactivateProject',
                                    ),
                                );
                              }
                            },
                          });
                        },
                      },
                    },
                  ]
                : [
                    {
                      key: 'restore',
                      title: t('comp:BAIProjectTable.Restore'),
                      icon: <UndoIcon />,
                      disabled: isModelStore,
                      popConfirm: {
                        title: t('comp:BAIProjectTable.RestoreProject'),
                        description: t(
                          'comp:BAIProjectTable.AreYouSureToRestoreProject',
                          { projectName: record.name },
                        ),
                        okText: t('comp:BAIProjectTable.Restore'),
                        onConfirm: () => {
                          if (!record.row_id) return;
                          commitModifyGroup({
                            variables: {
                              gid: record.row_id,
                              props: { is_active: true },
                            },
                            onCompleted: (response, errors) => {
                              if (errors && errors.length > 0) {
                                errors.forEach((error) => {
                                  message.error(
                                    getErrorMessage(
                                      error,
                                      t(
                                        'comp:BAIProjectTable.FailedToRestoreProject',
                                      ),
                                    ),
                                  );
                                });
                                return;
                              }
                              if (response.modify_group?.ok) {
                                message.success(
                                  t('comp:BAIProjectTable.ProjectRestored'),
                                );
                                updateFetchKey?.();
                              } else {
                                message.error(
                                  response.modify_group?.msg ||
                                    t(
                                      'comp:BAIProjectTable.FailedToRestoreProject',
                                    ),
                                );
                              }
                            },
                          });
                        },
                      },
                    },
                  ]),
              {
                key: 'purge',
                title: t('comp:BAIProjectTable.Purge'),
                icon: <DeleteFilled />,
                type: 'danger' as const,
                disabled: isModelStore,
                onClick: () => {
                  setPurgingProject(record);
                },
              },
            ]}
          />
        );
      },
    },
    {
      key: 'domain',
      title: t('comp:BAIProjectTable.Domain'),
      dataIndex: 'domain_name',
      sorter: isEnableSorter('domain_name'),
    },
    {
      key: 'description',
      title: t('comp:BAIProjectTable.Description'),
      dataIndex: 'description',
      render: (value) => value || '-',
    },
    {
      key: 'created_at',
      title: t('comp:BAIProjectTable.CreatedAt'),
      dataIndex: 'created_at',
      render: (value) => dayjs(value).format('lll'),
      sorter: isEnableSorter('created_at'),
    },
    {
      key: 'type',
      title: t('comp:BAIProjectTable.Type'),
      dataIndex: 'type',
      render: (value) =>
        value === 'GENERAL' ? (
          <Tag>{value}</Tag>
        ) : (
          <Tag color="blue">{value}</Tag>
        ),
    },
    {
      key: 'total_resource_slots',
      title: t('comp:BAIProjectTable.TotalResourceSlots'),
      dataIndex: 'total_resource_slots',
      render: (value) => {
        const parsedValue = JSON.parse(value);
        if (_.isEmpty(parsedValue)) {
          return '-';
        }
        return _.map(parsedValue, (v, type) => (
          <BAIResourceNumberWithIcon
            key={type}
            type={type}
            value={_.toString(v)}
          />
        ));
      },
    },
    {
      key: 'resource_policy',
      title: t('comp:BAIProjectTable.ResourcePolicy'),
      dataIndex: 'resource_policy',
      exportKey: 'resource_policy_name',
      sorter: isEnableSorter('resource_policy'),
    },
    {
      key: 'allowed_vfolder_hosts',
      title: t('comp:BAIProjectTable.StorageNodes'),
      exportKey: 'allowed_vfolder_hosts',
      render: (_value, row) => (
        <AllowedVfolderHostsWithPermission
          allowedHostPermissionFrgmtFromGroup={row}
        />
      ),
    },
    {
      key: 'scaling_groups',
      title: t('comp:BAIProjectTable.ScalingGroups'),
      dataIndex: 'scaling_groups',
      exportKey: 'scaling_group_name',
      render: (value) => _.join(value, ', ') || '-',
    },
    {
      key: 'container_registry',
      title: t('comp:BAIProjectTable.ContainerRegistry'),
      exportKey: 'container_registry',
      children: [
        {
          key: 'registry',
          title: t('comp:BAIProjectTable.Registry'),
          dataIndex: 'container_registry',
          render: (value) => {
            return _.get(JSON.parse(value), 'registry') || '-';
          },
        },
        {
          key: 'project',
          title: t('comp:BAIProjectTable.Project'),
          dataIndex: 'container_registry',
          render: (value) => _.get(JSON.parse(value), 'project') || '-',
        },
      ],
    },
    {
      key: 'id',
      title: t('comp:BAIProjectTable.ProjectID'),
      dataIndex: 'id',
      render: (value) => <BAIText copyable>{toLocalId(value) || '-'}</BAIText>,
      sorter: isEnableSorter('id'),
    },
    {
      key: 'integration_id',
      title: t('comp:BAIProjectTable.IntegrationID'),
      dataIndex: 'integration_id',
      render: (value) => value || '-',
    },
  ];
  return (
    <>
      <BAITable<Project>
        scroll={{ x: 'max-content' }}
        {...tableProps}
        rowKey={(record) => record.id}
        dataSource={projects}
        columns={columns}
        onChangeOrder={(order) => {
          onChangeOrder?.(
            (order as (typeof availableProjectSorterValues)[number]) || null,
          );
        }}
      />
      <BAIConfirmModalWithInput
        open={!!purgingProject}
        title={t('comp:BAIProjectTable.PurgeProject')}
        content={t('comp:BAIProjectTable.AreYouSureToPurgeProject', {
          projectName: purgingProject?.name,
        })}
        confirmText={purgingProject?.name ?? ''}
        okText={t('comp:BAIProjectTable.Purge')}
        onOk={() => {
          if (!purgingProject?.row_id) return;
          commitPurgeGroup({
            variables: { gid: purgingProject.row_id },
            onCompleted: (response, errors) => {
              if (errors && errors.length > 0) {
                errors.forEach((error) => {
                  message.error(
                    getErrorMessage(
                      error,
                      t('comp:BAIProjectTable.FailedToPurgeProject'),
                    ),
                  );
                });
                setPurgingProject(null);
                return;
              }
              if (response.purge_group?.ok) {
                message.success(t('comp:BAIProjectTable.ProjectPurged'));
                updateFetchKey?.();
              } else {
                message.error(
                  response.purge_group?.msg ||
                    t('comp:BAIProjectTable.FailedToPurgeProject'),
                );
              }
              setPurgingProject(null);
            },
          });
        }}
        onCancel={() => setPurgingProject(null)}
      />
    </>
  );
};

export default BAIProjectTable;
