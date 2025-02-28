import { filterNonNullItems } from '../helper';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import ShareAltIcon from './BAIIcons/ShareAltIcon';
import TrashBinIcon from './BAIIcons/TrashBinIcon';
import UserUnionIcon from './BAIIcons/UserUnionIcon';
import BAILink from './BAILink';
import BAITable, { BAITableProps } from './BAITable';
import BAITag from './BAITag';
import Flex from './Flex';
import VFolderPermissionCell from './VFolderPermissionCell';
import {
  VFolderNodesFragment$data,
  VFolderNodesFragment$key,
} from './__generated__/VFolderNodesFragment.graphql';
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Button, theme, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

const statusTagColor = {
  // mountable
  ready: 'warning',
  performing: 'warning',
  cloning: 'warning',
  mounted: 'warning',
  // delete
  'delete-pending': 'default',
  'delete-ongoing': 'default',
  'delete-complete': 'default',
  // error
  error: 'error',
  'delete-error': 'error',
};

export type VFolderNodeInList = NonNullable<VFolderNodesFragment$data[number]>;
interface VFolderNodesProps
  extends Omit<BAITableProps<VFolderNodeInList>, 'dataSource' | 'columns'> {
  vfoldersFrgmt: VFolderNodesFragment$key;
  onClickVFolderName?: (vfolder: VFolderNodeInList) => void;
}

const VFolderNodes: React.FC<VFolderNodesProps> = ({
  vfoldersFrgmt,
  onClickVFolderName,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentProject = useCurrentProjectValue();
  const [currentUser] = useCurrentUserInfo();

  const vfolders = useFragment(
    graphql`
      fragment VFolderNodesFragment on VirtualFolderNode @relay(plural: true) {
        id @required(action: NONE)
        row_id @required(action: NONE)
        status
        name
        host
        ownership_type
        user
        group
        ...VFolderPermissionCellFragment
      }
    `,
    vfoldersFrgmt,
  );

  const filteredVFolders = filterNonNullItems(vfolders);

  return (
    <>
      <BAITable<(typeof filteredVFolders)[0]>
        resizable
        neoStyle
        showSorterTooltip={false}
        sortDirections={['descend', 'ascend', 'descend']}
        // TODO: fix type
        // @ts-ignore
        rowKey={(record) => record.id}
        size="small"
        dataSource={filteredVFolders}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            key: '#',
            title: '#',
            render: (id, record, index) => {
              const [current, pageSize] =
                tableProps.pagination &&
                tableProps.pagination.current &&
                tableProps.pagination.pageSize
                  ? [
                      tableProps.pagination.current,
                      tableProps.pagination.pageSize,
                    ]
                  : [1, 0];
              return index + 1 + (current - 1) * pageSize;
            },
          },
          {
            key: 'name',
            title: t('data.folders.Name'),
            dataIndex: 'name',
            render: (name: string, vfolder) => {
              return onClickVFolderName ? (
                <BAILink
                  type="hover"
                  onClick={(e) => {
                    // onClickVFolderName(vfolder?.id);
                  }}
                >
                  {name}
                </BAILink>
              ) : (
                name
              );
            },
            sorter: true,
          },
          {
            key: 'controls',
            title: t('data.folders.Control'),
            render: (__, vfolder) => {
              return (
                <Flex gap={'xs'}>
                  <Button
                    size="small"
                    type="text"
                    icon={<ShareAltIcon />}
                    style={{
                      color: token.colorInfo,
                      background: token.colorInfoBg,
                    }}
                  />
                  <Button
                    size="small"
                    type="text"
                    icon={<TrashBinIcon />}
                    style={{
                      color: token.colorError,
                      background: token.colorErrorBg,
                    }}
                  />
                </Flex>
              );
            },
          },
          {
            key: 'status',
            title: t('data.folders.Status'),
            dataIndex: 'status',
            render: (status: string) => {
              return (
                <BAITag
                  color={
                    status
                      ? statusTagColor[status as keyof typeof statusTagColor]
                      : undefined
                  }
                >
                  {_.toUpper(status)}
                </BAITag>
              );
            },
            sorter: true,
          },
          {
            key: 'host',
            title: t('data.folders.Location'),
            dataIndex: 'host',
            sorter: true,
          },
          {
            key: 'ownership_type',
            title: t('data.folders.Type'),
            dataIndex: 'ownership_type',
            render: (type: string) => {
              return type === 'user' ? (
                <Flex gap={'xs'}>
                  <Typography.Text>{t('data.User')}</Typography.Text>
                  <UserOutlined style={{ color: token.colorTextTertiary }} />
                </Flex>
              ) : (
                <Flex gap={'xs'}>
                  <Typography.Text>{t('data.Project')}</Typography.Text>
                  <UserUnionIcon style={{ color: token.colorTextTertiary }} />
                </Flex>
              );
            },
            sorter: true,
          },
          {
            key: 'permissions',
            title: t('data.folders.MountPermission'),
            render: (perm: string, vfolder) => {
              return <VFolderPermissionCell vfolderFrgmt={vfolder} />;
            },
          },
          {
            key: 'owner',
            title: t('data.folders.Owner'),
            render: (__, vfolder) =>
              vfolder?.user === currentUser?.uuid ||
              vfolder?.group === currentProject?.id ? (
                <Flex justify="center">
                  <CheckCircleOutlined />
                </Flex>
              ) : null,
          },
        ]}
        {...tableProps}
      />
    </>
  );
};

export default VFolderNodes;
