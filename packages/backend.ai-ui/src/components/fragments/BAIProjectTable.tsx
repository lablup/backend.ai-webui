import { BAIProjectTableDeleteMutation } from '../../__generated__/BAIProjectTableDeleteMutation.graphql';
import {
  BAIProjectTableFragment$data,
  BAIProjectTableFragment$key,
} from '../../__generated__/BAIProjectTableFragment.graphql';
import { BAIProjectTablePurgeMutation } from '../../__generated__/BAIProjectTablePurgeMutation.graphql';
import { toLocalId } from '../../helper';
import { useErrorMessageResolver } from '../../hooks';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAIResourceNumberWithIcon from '../BAIResourceNumberWithIcon';
import BAITag from '../BAITag';
import BAIText from '../BAIText';
import { BAIColumnsType, BAITable, BAITableProps } from '../Table';
import AllowedVfolderHostsWithPermission from './BAIAllowedVfolderHostsWithPermission';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { App, Popconfirm, Tag, theme } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { BanIcon } from 'lucide-react';
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
}

const BAIProjectTable = ({
  projectFragment,
  onChangeOrder,
  onClickProjectEditButton,
  updateFetchKey,
  ...tableProps
}: BAIProjectTableProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal, message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

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

  const columns: BAIColumnsType<Project> = [
    {
      key: 'name',
      title: t('comp:BAIProjectTable.Name'),
      dataIndex: 'name',
      fixed: 'left',
      sorter: isEnableSorter('name'),
    },
    {
      key: 'controls',
      title: t('comp:BAIProjectTable.Controls'),
      fixed: 'left',
      render: (value, record) => {
        return (
          <BAIFlex>
            <BAIButton
              type="text"
              icon={
                <SettingOutlined
                  style={{
                    color:
                      _.get(record, 'type') === 'MODEL_STORE'
                        ? token.colorTextDisabled
                        : token.colorInfo,
                  }}
                />
              }
              disabled={_.get(record, 'type') === 'MODEL_STORE'}
              onClick={() => {
                onClickProjectEditButton(value);
              }}
            />
            <Popconfirm
              title={t('comp:BAIProjectTable.DeactivateProject')}
              description={t(
                'comp:BAIProjectTable.AreYouSureToDeactivateProject',
                {
                  projectName: value?.name,
                },
              )}
              okButtonProps={{
                danger: true,
                loading: isInFlightCommitDeleteGroup,
              }}
              okText={t('comp:BAIProjectTable.Deactivate')}
              onConfirm={() => {
                if (!record?.row_id) {
                  return;
                }
                commitDeleteGroup({
                  variables: {
                    gid: record.row_id,
                  },
                  onCompleted: (response, errors) => {
                    if (errors && errors.length > 0) {
                      errors.forEach((error) => {
                        message.error(
                          getErrorMessage(
                            error,
                            t('comp:BAIProjectTable.FailedToDeactivateProject'),
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
                          t('comp:BAIProjectTable.FailedToDeactivateProject'),
                      );
                    }
                  },
                });
              }}
            >
              <BAIButton
                type="text"
                danger
                icon={
                  <BanIcon
                    size={token.fontSize}
                    style={{
                      color:
                        _.get(record, 'type') === 'MODEL_STORE'
                          ? token.colorTextDisabled
                          : undefined,
                    }}
                  />
                }
                disabled={
                  _.get(record, 'type') === 'MODEL_STORE' ||
                  _.get(record, 'is_active') === false
                }
              />
            </Popconfirm>
            <BAIButton
              type="text"
              icon={
                <DeleteOutlined
                  style={{
                    color:
                      _.get(record, 'type') === 'MODEL_STORE'
                        ? token.colorTextDisabled
                        : token.colorError,
                  }}
                />
              }
              onClick={() => {
                modal.confirm({
                  title: t('comp:BAIProjectTable.PurgeProject'),
                  content: t('comp:BAIProjectTable.AreYouSureToPurgeProject', {
                    projectName: value?.name,
                  }),
                  okButtonProps: {
                    danger: true,
                  },
                  okText: t('comp:BAIProjectTable.Purge'),
                  onOk: () => {
                    if (!record?.row_id) {
                      return;
                    }
                    commitPurgeGroup({
                      variables: {
                        gid: record.row_id,
                      },
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
                          return;
                        }
                        if (response.purge_group?.ok) {
                          message.success(
                            t('comp:BAIProjectTable.ProjectPurged'),
                          );
                          updateFetchKey?.();
                        } else {
                          message.error(
                            response.purge_group?.msg ||
                              t('comp:BAIProjectTable.FailedToPurgeProject'),
                          );
                        }
                      },
                    });
                  },
                });
              }}
              disabled={_.get(record, 'type') === 'MODEL_STORE'}
            />
          </BAIFlex>
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
      key: 'is_active',
      title: t('comp:BAIProjectTable.IsActive'),
      dataIndex: 'is_active',
      render: (value) =>
        value ? <BAITag color="green">true</BAITag> : <BAITag>false</BAITag>,
      sorter: isEnableSorter('is_active'),
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
  );
};

export default BAIProjectTable;
