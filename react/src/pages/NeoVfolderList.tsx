import Flex from '../components/Flex';
import VFolderPermissionTag from '../components/VFolderPermissionTag';
import { localeCompare } from '../helper';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Input, Radio, Table, Tag, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  radio: css`
    .ant-radio-button-wrapper {
      min-width: 100px;
      text-align: center;
    }
  `,
}));

interface NeoVFolderListProps {
  vfolders: any;
}

const NeoVFolderList: React.FC<NeoVFolderListProps> = ({ vfolders }) => {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { token } = theme.useToken();

  const [currentRadioValue, setCurrentRadioValue] = useState<string>('all');
  const selectedVFolders = _.filter(vfolders, (vfolder) => {
    switch (currentRadioValue) {
      case 'all':
        return true;
      case 'general':
        return (
          vfolder.usage_mode === currentRadioValue &&
          !vfolder.name.startsWith('.')
        );
      case 'auto_mount':
        return vfolder.name.startsWith('.');
      default:
        return vfolder.usage_mode === currentRadioValue;
    }
  });

  return (
    <Flex direction="column" align="stretch" gap={'lg'}>
      <Flex gap={'lg'} direction="row">
        <Radio.Group
          className={styles.radio}
          options={[
            { label: t('general.All'), value: 'all' },
            { label: t('general.General'), value: 'general' },
            {
              label: 'Pipeline',
              value: 'pipeline',
            },
            {
              label: 'Auto Mount',
              value: 'auto_mount',
            },
            {
              label: 'Models',
              value: 'model',
            },
          ]}
          value={currentRadioValue}
          onChange={(e) => setCurrentRadioValue(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          defaultValue="running"
        />
        <Input
          style={{ width: 222 }}
          placeholder={t('propertyFilter.placeHolder')}
          suffix={<SearchOutlined />}
        />
      </Flex>
      <Table
        size="middle"
        scroll={{ x: 'max-content' }}
        showSorterTooltip={false}
        sortDirections={['descend', 'ascend', 'descend']}
        dataSource={selectedVFolders}
        columns={[
          {
            title: '#',
            fixed: 'left',
            render: (id, record, index) => {
              return index + 1;
            },
          },
          {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => {
              return localeCompare(a.name, b.name);
            },
            render: (value) => (
              <Typography.Text style={{ maxWidth: 122 }} ellipsis>
                {value}
              </Typography.Text>
            ),
          },
          {
            title: 'Controls',
            render: () => {
              return (
                <Flex gap={token.marginSM}>
                  <Button
                    // type="link"
                    style={{ backgroundColor: token.blue2, border: 'none' }}
                    icon={
                      <EditOutlined
                        style={{
                          color: token.colorInfo,
                        }}
                      />
                    }
                  />
                  <Button
                    // type="link"
                    style={{ backgroundColor: token.red2, border: 'none' }}
                    icon={
                      <DeleteOutlined style={{ color: token.colorError }} />
                    }
                  />
                </Flex>
              );
            },
          },
          {
            title: 'Status',
            dataIndex: 'status',
            sorter: (a, b) => {
              return localeCompare(a.status, b.status);
            },
            render: (value) => {
              return <Tag>{value}</Tag>;
            },
          },
          {
            title: 'Location',
            dataIndex: 'host',
            sorter: (a, b) => {
              return localeCompare(a.host, b.host);
            },
          },
          {
            title: 'Type',
            dataIndex: 'type',
            sorter: (a, b) => {
              return localeCompare(a.type, b.type);
            },
            render: (value) => {
              const type = value === 'group' ? 'project' : value;
              return (
                <Flex gap={token.marginXS}>
                  <Typography.Text>{_.capitalize(type)}</Typography.Text>
                  {type === 'project' ? <TeamOutlined /> : <UserOutlined />}
                </Flex>
              );
            },
          },
          {
            title: 'Permission',
            dataIndex: 'permission',
            sorter: (a, b) => {
              return localeCompare(a.permission, b.permission);
            },
            render: (value: 'rw' | 'ro' | 'wd') => {
              const folderPermission = {
                rw: 'Read & Write',
                ro: 'Read Only',
                wd: 'Delete',
              };
              return (
                <Flex gap={token.marginMD}>
                  <Typography.Text>{folderPermission[value]}</Typography.Text>
                  <VFolderPermissionTag permission={value} />
                </Flex>
              );
            },
          },
          {
            title: 'Owner',
            dataIndex: 'is_owner',
            sorter: (a, b) => {
              return a.is_owner - b.is_owner;
            },
            render: (value) => {
              return value ? <CheckCircleOutlined /> : null;
            },
          },
        ]}
      />
    </Flex>
  );
};

export default NeoVFolderList;
