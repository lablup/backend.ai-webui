import { filterEmptyItem, filterNonNullItems } from '../helper';
import { useUpdatableState } from '../hooks';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import BAIRadioGroup from './BAIRadioGroup';
import BAITable from './BAITable';
import Flex from './Flex';
import ResourceGroupSettingModal from './ResourceGroupSettingModal';
import {
  ResourceGroupListQuery,
  ResourceGroupListQuery$data,
} from './__generated__/ResourceGroupListQuery.graphql';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, theme } from 'antd';
import { ColumnsType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

type ResourceGroup = NonNullable<
  NonNullable<
    NonNullable<ResourceGroupListQuery$data>['scaling_groups']
  >[number]
>;

const ResourceGroupList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [activeType, setActiveType] = useState<'active' | 'inactive'>('active');
  const [selectedResourceGroup, setSelectedResourceGroup] =
    useState<ResourceGroup>();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isActiveTypePending, startActiveTypeTransition] = useTransition();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const { scaling_groups } = useLazyLoadQuery<ResourceGroupListQuery>(
    graphql`
      query ResourceGroupListQuery($is_active: Boolean) {
        scaling_groups(is_active: $is_active) {
          name
          description
          is_public
          driver
          scheduler
          wsproxy_addr

          ...ResourceGroupSettingModalFragment
        }
      }
    `,
    {
      is_active: activeType === 'active',
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey,
    },
  );

  const columns: ColumnsType<ResourceGroup> = filterEmptyItem([
    {
      key: 'name',
      title: t('resourceGroup.Name'),
      dataIndex: 'name',
    },
    {
      key: 'description',
      title: t('resourceGroup.Description'),
      dataIndex: 'description',
      render: (value) => value || '-',
    },
    {
      key: 'is_public',
      title: t('resourceGroup.Public'),
      dataIndex: 'is_public',
      render: (value) => {
        return value ? (
          <CheckOutlined style={{ color: token.colorSuccess }} />
        ) : (
          <CloseOutlined style={{ color: token.colorTextSecondary }} />
        );
      },
    },
    {
      key: 'driver',
      title: t('resourceGroup.Driver'),
      dataIndex: 'driver',
    },
    {
      key: 'scheduler',
      title: t('resourceGroup.Scheduler'),
      dataIndex: 'scheduler',
      render: (value) => _.toUpper(value),
    },
    {
      key: 'wsproxy_addr',
      title: t('resourceGroup.WsproxyAddress'),
      dataIndex: 'wsproxy_addr',
      render: (value) => value || '-',
    },
    {
      key: 'controls',
      title: t('general.Control'),
      fixed: 'right',
      render: (_, record) => {
        return (
          <Flex>
            <Button
              type="text"
              size="large"
              icon={<InfoCircleOutlined />}
              style={{ color: token.colorSuccess }}
            />
            <Button
              type="text"
              size="large"
              icon={<SettingOutlined />}
              style={{
                color: token.colorInfo,
              }}
              onClick={() => {
                setSelectedResourceGroup(record);
                setOpenCreateModal(true);
              }}
            />
            <Button
              type="text"
              size="large"
              icon={
                <DeleteOutlined
                  style={{
                    color: token.colorError,
                  }}
                />
              }
            />
          </Flex>
        );
      },
    },
  ]);

  return (
    <Flex direction="column" align="stretch" gap="sm">
      <Flex justify="between">
        <BAIRadioGroup
          value={activeType}
          onChange={(value) => {
            startActiveTypeTransition(() => {
              setActiveType(value.target.value);
            });
          }}
          optionType="button"
          options={[
            {
              label: 'Active',
              value: 'active',
            },
            {
              label: 'Inactive',
              value: 'inactive',
            },
          ]}
        />
        <Flex gap="sm">
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value={fetchKey}
            onChange={() => {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreateModal(true)}
          >
            {t('button.Create')}
          </Button>
        </Flex>
      </Flex>

      <BAITable
        rowKey={'name'}
        neoStyle
        resizable
        size="small"
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={filterNonNullItems(scaling_groups)}
        loading={isActiveTypePending}
      />

      <ResourceGroupSettingModal
        open={openCreateModal}
        resourceGroupFrgmt={selectedResourceGroup}
        onRequestClose={(success) => {
          setOpenCreateModal(false);
          setSelectedResourceGroup(undefined);

          if (success) {
            startRefetchTransition(() => {
              updateFetchKey();
            });
          }
        }}
      />
    </Flex>
  );
};

export default ResourceGroupList;
