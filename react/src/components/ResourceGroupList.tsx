import { filterEmptyItem, filterNonNullItems } from '../helper';
import { useUpdatableState } from '../hooks';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import BAIRadioGroup from './BAIRadioGroup';
import BAITable from './BAITable';
import Flex from './Flex';
import {
  ResourceGroupListQuery,
  ResourceGroupListQuery$data,
} from './__generated__/ResourceGroupListQuery.graphql';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
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
  const [activeType, setActiveType] = useState<'active' | 'inactive'>('active');
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
      render: () => {
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
        <BAIFetchKeyButton
          loading={isPendingRefetch}
          value={fetchKey}
          onChange={() => {
            startRefetchTransition(() => {
              updateFetchKey();
            });
          }}
        />
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
    </Flex>
  );
};

export default ResourceGroupList;
