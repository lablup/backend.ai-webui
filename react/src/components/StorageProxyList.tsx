import { StorageProxyListQuery } from '../__generated__/StorageProxyListQuery.graphql';
import {
  filterNonNullItems,
  humanReadableDecimalSize,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import CephIcon from './BAIIcons/CephIcon';
import PureStorageIcon from './BAIIcons/PureStorageIcon';
import BAILink from './BAILink';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import BAITable from './BAITable';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
import { InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, TableColumnsType, Tag, theme, Typography } from 'antd';
import _ from 'lodash';
import { Server } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const backendType = {
  xfs: {
    color: 'blue',
    icon: <Server />,
  },
  ceph: {
    color: 'lightblue',
    icon: <CephIcon />,
  },
  cephfs: {
    color: 'lightblue',
    icon: <CephIcon />,
  },
  vfs: {
    color: 'green',
    icon: <Server />,
  },
  nfs: {
    color: 'green',
    icon: <Server />,
  },
  purestorage: {
    color: 'red',
    icon: <PureStorageIcon />,
  },
  dgx: {
    color: 'green',
    icon: <Server />,
  },
  spectrumscale: {
    color: 'green',
    icon: <Server />,
  },
  weka: {
    color: 'purple',
    icon: <Server />,
  },
};

type StorageVolume = NonNullable<
  NonNullable<
    StorageProxyListQuery['response']['storage_volume_list']
  >['items'][number]
>;

const StorageProxyList = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const queryVariables = useMemo(
    () => ({
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
    }),
    [baiPaginationOption.offset, baiPaginationOption.limit],
  );
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const { storage_volume_list } = useLazyLoadQuery<StorageProxyListQuery>(
    graphql`
      query StorageProxyListQuery($offset: Int!, $limit: Int!) {
        storage_volume_list(limit: $limit, offset: $offset) {
          items {
            id
            backend
            capabilities
            path
            fsprefix
            performance_metric
            usage
          }
          total_count
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === 'first' ? 'store-and-network' : 'network-only',
      fetchKey: deferredFetchKey === 'first' ? undefined : deferredFetchKey,
    },
  );

  const columns: TableColumnsType<StorageVolume> = [
    {
      title: <>ID / {t('agent.Endpoint')}</>,
      key: 'id',
      dataIndex: 'id',
      render: (value, record) => {
        return (
          <Flex direction="column" align="start">
            <Typography.Text>{value}</Typography.Text>
            <Typography.Text type="secondary">{record.path}</Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: t('agent.BackendType'),
      key: 'backend',
      dataIndex: 'backend',
      render: (value) => {
        const platform = backendType[value as keyof typeof backendType] ?? {
          color: 'gold',
          icon: <Server />,
        };

        return (
          <Flex gap="xxs">
            {platform.icon}
            <DoubleTag
              values={[
                {
                  label: 'Backend',
                },
                {
                  label: value,
                  color: platform.color,
                },
              ]}
            />
          </Flex>
        );
      },
    },
    {
      title: t('agent.Resources'),
      key: 'usage',
      dataIndex: 'usage',
      render: (value, record) => {
        const usage = JSON.parse(value);
        const ratio =
          usage?.capacity_bytes > 0
            ? usage.used_bytes / usage.capacity_bytes
            : 0;
        const percent = _.toFinite(
          toFixedFloorWithoutTrailingZeros(ratio * 100, 2),
        );
        const color = percent > 80 ? token.colorError : token.colorSuccess;

        return (
          <>
            <BAIProgressWithLabel
              valueLabel={toFixedFloorWithoutTrailingZeros(percent, 1) + ' %'}
              percent={percent}
              strokeColor={color}
              width={120}
            />
            <Typography.Text style={{ fontSize: token.fontSizeSM }}>
              {usage.used_bytes
                ? humanReadableDecimalSize(usage.used_bytes)
                : '-'}
              &nbsp;/&nbsp;
              {usage.capacity_bytes
                ? humanReadableDecimalSize(usage.capacity_bytes)
                : '-'}
            </Typography.Text>
          </>
        );
      },
    },
    {
      title: t('agent.Capabilities'),
      key: 'capabilities',
      dataIndex: 'capabilities',
      width: 150,
      render: (value) => {
        return (
          <Flex gap="xxs" align="start" wrap="wrap">
            {_.map(value, (item) => (
              <Tag key={item} color="blue" style={{ margin: 0 }}>
                {item}
              </Tag>
            ))}
          </Flex>
        );
      },
    },
    {
      title: t('general.Control'),
      key: 'control',
      width: 100,
      fixed: 'right',
      render: (value, record) => {
        let perfMetricDisabled;
        try {
          const performanceMetric = JSON.parse(
            record.performance_metric || '{}',
          );
          perfMetricDisabled = _.isEmpty(performanceMetric);
        } catch (e) {
          perfMetricDisabled = true;
        }
        return (
          <>
            <Button
              size="large"
              disabled={perfMetricDisabled}
              style={{
                color: perfMetricDisabled
                  ? token.colorTextDisabled
                  : token.colorSuccess,
              }}
              icon={<InfoCircleOutlined />}
              onClick={() => {
                // This event is being listened to by the plugin
                const event = new CustomEvent(
                  'backend-ai-selected-storage-proxy',
                  {
                    detail: record.id,
                  },
                );
                document.dispatchEvent(event);
              }}
              type="text"
            />
            <BAILink to={`/storage-settings/${record.id}`}>
              <Button
                size="large"
                style={{
                  color: token.colorInfo,
                }}
                icon={<SettingOutlined />}
                type="text"
              />
            </BAILink>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    if (!_.isEmpty(storage_volume_list?.items)) {
      // This event is being listened to by the plugin
      const event = new CustomEvent('backend-ai-storage-proxy-updated', {});
      document.dispatchEvent(event);
    }
  }, [storage_volume_list]);

  return (
    <Flex direction="column" align="stretch" gap="sm">
      <Flex justify="end" wrap="wrap" gap="sm">
        {/* // TODO: implement filter when filter and order are supported
          <BAIPropertyFilter
            filterProperties={[
              {
                key: 'id',
                propertyLabel: 'ID',
                type: 'string',
              },
            ]}
          /> */}
        <BAIFetchKeyButton
          loading={
            deferredFetchKey !== fetchKey ||
            deferredQueryVariables !== queryVariables
          }
          autoUpdateDelay={15_000}
          value={fetchKey}
          onChange={() => {
            updateFetchKey();
          }}
        />
      </Flex>
      <BAITable
        resizable
        neoStyle
        size="small"
        scroll={{ x: 'max-content' }}
        rowKey={'id'}
        dataSource={filterNonNullItems(storage_volume_list?.items)}
        columns={columns}
        loading={
          deferredQueryVariables !== queryVariables ||
          deferredFetchKey !== fetchKey
        }
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: storage_volume_list?.total_count ?? 0,
          showTotal: (total) => (
            <Typography.Text type="secondary">
              {t('general.TotalItems', { total: total })}
            </Typography.Text>
          ),
          onChange(current, pageSize) {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                pageSize,
                current,
              });
            }
          },
        }}
      />
    </Flex>
  );
};

export default StorageProxyList;
