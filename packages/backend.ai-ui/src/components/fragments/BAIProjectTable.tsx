import {
  BAIProjectTableFragment$data,
  BAIProjectTableFragment$key,
} from '../../__generated__/BAIProjectTableFragment.graphql';
import { toLocalId } from '../../helper';
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

type Project = NonNullable<NonNullable<BAIProjectTableFragment$data>[number]>;

export interface BAIProjectTableProps
  extends Omit<
    BAITableProps<Project>,
    'dataSource' | 'columns' | 'rowKey' | 'onChangeOrder'
  > {
  projectFragment: BAIProjectTableFragment$key;
  onChangeOrder?: (
    order: (typeof availableProjectSorterValues)[number] | null,
  ) => void;
  onEditProject: (project: Project) => void;
}

const BAIProjectTable = ({
  projectFragment,
  onChangeOrder,
  ...tableProps
}: BAIProjectTableProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal } = App.useApp();

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

  const columns: BAIColumnsType<Project> = [
    {
      key: 'name',
      title: t('comp:BAIProjectTable.Name'),
      dataIndex: 'name',
      fixed: 'left',
      sorter: isEnableSorter('name'),
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
      sorter: isEnableSorter('resource_policy'),
    },
    {
      key: 'allowed_vfolder_hosts',
      title: t('comp:BAIProjectTable.StorageNodes'),
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
      render: (value) => _.join(value, ', ') || '-',
    },
    {
      key: 'container_registry',
      title: t('comp:BAIProjectTable.ContainerRegistry'),
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
    {
      key: 'controls',
      title: t('comp:BAIProjectTable.Controls'),
      fixed: 'right',
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
                // setEditingProject(value);
              }}
            />
            <Popconfirm
              title={t('comp:BAIProjectTable.InactiveProject')}
              description={t(
                'comp:BAIProjectTable.AreYouSureToInactiveProject',
                {
                  projectName: value?.name,
                },
              )}
              okButtonProps={{
                danger: true,
                loading: false,
              }}
              okText={t('comp:BAIProjectTable.Inactive')}
              onConfirm={() => {
                // deleteProject();
              }}
            >
              <BAIButton
                type="text"
                danger
                icon={
                  <BanIcon
                    style={{
                      color:
                        _.get(record, 'type') === 'MODEL_STORE'
                          ? token.colorTextDisabled
                          : undefined,
                    }}
                  />
                }
                // onClick={() => setProjectID(value?.row_id)}
                disabled={_.get(record, 'type') === 'MODEL_STORE'}
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
                    loading: false,
                  },
                  okText: t('comp:BAIProjectTable.Purge'),
                  onOk: () => {
                    // purgeProject(value?.row_id);
                  },
                });
              }}
              disabled={_.get(record, 'type') === 'MODEL_STORE'}
            />
          </BAIFlex>
        );
      },
    },
  ];
  return (
    <BAITable<Project>
      rowKey={(record) => record.id}
      dataSource={projects}
      columns={columns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availableProjectSorterValues)[number]) || null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIProjectTable;
