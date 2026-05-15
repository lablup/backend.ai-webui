import {
  BAIProjectTableFragment$data,
  BAIProjectTableFragment$key,
} from '../../__generated__/BAIProjectTableFragment.graphql';
import { toLocalId } from '../../helper';
import BAIResourceNumberWithIcon from '../BAIResourceNumberWithIcon';
import BAIText from '../BAIText';
import { BAIColumnsType, BAITable, BAITableProps } from '../Table';
import BAINameActionCell from '../Table/BAINameActionCell';
import AllowedVfolderHostsWithPermission from './BAIAllowedVfolderHostsWithPermission';
import { DeleteFilled, SettingOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { BanIcon, UndoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

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

export type ProjectInList = NonNullable<
  NonNullable<BAIProjectTableFragment$data>[number]
>;

export interface BAIProjectTableProps extends Omit<
  BAITableProps<ProjectInList>,
  'dataSource' | 'columns' | 'rowKey' | 'onChangeOrder'
> {
  projectFragment: BAIProjectTableFragment$key;
  onChangeOrder?: (
    order: (typeof availableProjectSorterValues)[number] | null,
  ) => void;
  onClickProjectEditButton: (project: ProjectInList) => void;
  onClickDeactivateProject: (project: ProjectInList) => Promise<void>;
  onClickRestoreProject: (project: ProjectInList) => Promise<void>;
  onClickPurgeProject: (project: ProjectInList) => void;
}

const BAIProjectTable = ({
  projectFragment,
  onChangeOrder,
  onClickProjectEditButton,
  onClickDeactivateProject,
  onClickRestoreProject,
  onClickPurgeProject,
  ...tableProps
}: BAIProjectTableProps) => {
  'use memo';
  const { t } = useTranslation();

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

  const columns: BAIColumnsType<ProjectInList> = [
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
              ...(record.is_active
                ? [
                    {
                      key: 'deactivate',
                      title: t('comp:BAIProjectTable.Deactivate'),
                      icon: <BanIcon />,
                      type: 'danger' as const,
                      disabled: isModelStore,
                      popConfirm: {
                        title: t('comp:BAIProjectTable.DeactivateProject'),
                        description: record.name,
                        okButtonProps: { danger: true },
                        okText: t('comp:BAIProjectTable.Deactivate'),
                        onConfirm: () => onClickDeactivateProject(record),
                      },
                    },
                  ]
                : [
                    {
                      key: 'activate',
                      title: t('comp:BAIProjectTable.Activate'),
                      icon: <UndoIcon />,
                      disabled: isModelStore,
                      popConfirm: {
                        title: t('comp:BAIProjectTable.ActivateProject'),
                        description: record.name,
                        okText: t('comp:BAIProjectTable.Activate'),
                        onConfirm: () => onClickRestoreProject(record),
                      },
                    },
                    {
                      key: 'purge',
                      title: t('comp:BAIProjectTable.Purge'),
                      icon: <DeleteFilled />,
                      type: 'danger' as const,
                      disabled: isModelStore,
                      onClick: () => {
                        onClickPurgeProject(record);
                      },
                    },
                  ]),
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
    <BAITable<ProjectInList>
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
